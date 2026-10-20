"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { type ChartSpec } from "@/lib/code-studio/charts";
import { runChecks, type CheckReport } from "@/lib/code-studio/check-runner";
import { EXERCISES, getExercise } from "@/lib/code-studio/exercises";
import { filesFromSnapshot, filesSnapshot, saveFiles, subscribeFiles, type ProgramFile } from "@/lib/code-studio/files";
import { MAX_OUTPUT_CHARS, RUN_TIMEOUT_MS } from "@/lib/code-studio/limits";
import { prepareAudio, playTone, stopTone } from "@/lib/code-studio/board-audio";
import { usesMicrobit, usesRadio, type DeviceEvent, type GestureName } from "@/lib/code-studio/microbit";
import { MAX_CODE_CHARS, toProjectData, type PythonProjectData } from "@/lib/code-studio/project";
import {
  markCompleted, progressFromSnapshot, progressSnapshot, saveDraft, subscribeProgress,
} from "@/lib/code-studio/progress";
import { DEFAULT_SENSORS, PythonRunner, type RunResult, type RunnerStatus, type SensorValues } from "@/lib/code-studio/runner";
import { createProject, getProject, updateProjectData } from "@/lib/rhinocode/projects";

import ExercisePanel from "./ExercisePanel";
import ChartsPanel from "./ChartsPanel";
import OfflineBar from "./OfflineBar";
import FilesPanel from "./FilesPanel";
import MicrobitPanel from "./MicrobitPanel";
import styles from "./CodeStudio.module.css";

// Monaco needs the browser, so it loads only there.
const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <p className={styles.loading}>Loading the editor…</p>,
});

const FREE_STARTER = `# Welcome to Rhinox Code Studio
print("Hello, Rhinox!")
`;

type Session = { exerciseId: string | null; initialCode: string; key: number };

function starterFor(exerciseId: string | null): string {
  return getExercise(exerciseId)?.starter ?? FREE_STARTER;
}

// The names of the files a run added, changed or removed.
function changedFiles(before: readonly ProgramFile[], after: readonly ProgramFile[]): string[] {
  const names = new Set([...before.map((f) => f.name), ...after.map((f) => f.name)]);
  return [...names]
    .filter((name) => before.find((f) => f.name === name)?.text !== after.find((f) => f.name === name)?.text)
    .sort();
}

type ChunkKind = "out" | "err" | "in" | "info";
type Chunk = { id: number; kind: ChunkKind; text: string };

const noopSubscribe = () => () => {};

// Why a program stopped, in words a learner can act on.
function describe(result: RunResult): { kind: ChunkKind; text: string } | null {
  switch (result.outcome) {
    case "ok":
      return { kind: "info", text: `Finished in ${result.ms} ms.` };
    case "error":
      return { kind: "info", text: "The program stopped because of the error above." };
    case "stopped":
      return { kind: "info", text: "Stopped." };
    case "timeout":
      return {
        kind: "info",
        text: `Your program ran for more than ${RUN_TIMEOUT_MS / 1000} seconds, so Code Studio stopped it. Look for a loop that never ends.`,
      };
    case "output-limit":
      return {
        kind: "info",
        text: `Your program printed more than ${MAX_OUTPUT_CHARS.toLocaleString("en")} characters, so it was stopped.`,
      };
    case "crashed":
      return { kind: "info", text: "Python stopped unexpectedly. It may have run out of memory. Press Run to start again." };
    case "failed-to-start":
      return { kind: "info", text: `Python could not start (${result.detail ?? "unknown reason"}). Check your connection and press Run to try again.` };
  }
}

type Props = {
  /** The id of the project being edited, if it was opened from My Projects. */
  savedId: string | null;
  savedProject: PythonProjectData | null;
};

export default function CodeStudio({ savedId: initialSavedId, savedProject }: Props) {
  const [session, setSession] = useState<Session>(() => {
    if (savedProject) return { exerciseId: savedProject.exerciseId, initialCode: savedProject.code, key: 0 };
    const first = EXERCISES[0].id;
    const draft = progressFromSnapshot(progressSnapshot()).drafts[first];
    return { exerciseId: first, initialCode: draft ?? starterFor(first), key: 0 };
  });
  const codeRef = useRef(session.initialCode);
  const runnerRef = useRef<PythonRunner | null>(null);
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLPreElement | null>(null);
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [stdinText, setStdinText] = useState("");
  const [typed, setTyped] = useState("");
  const [savedId, setSavedId] = useState<string | null>(initialSavedId);
  const [notice, setNotice] = useState("");
  const [hintsShown, setHintsShown] = useState(0);
  const [report, setReport] = useState<CheckReport | null>(null);
  const [checking, setChecking] = useState(false);
  const [charts, setCharts] = useState<ChartSpec[]>([]);
  const [boardWanted, setBoardWanted] = useState(() => usesMicrobit(session.initialCode) || getExercise(session.exerciseId)?.group === "micro:bit");
  const [boardProgram, setBoardProgram] = useState(() => usesMicrobit(session.initialCode));
  const [boardRunning, setBoardRunning] = useState(false);
  const [radioProgram, setRadioProgram] = useState(() => usesRadio(session.initialCode));
  const [leds2, setLeds2] = useState<number[]>(() => new Array(25).fill(0));
  const [sensors2, setSensors2] = useState<SensorValues>(DEFAULT_SENSORS);
  const sensors2Ref = useRef<SensorValues>(DEFAULT_SENSORS);
  const runner2Ref = useRef<PythonRunner | null>(null);
  const [leds, setLeds] = useState<number[]>(() => new Array(25).fill(0));
  const [sensors, setSensors] = useState<SensorValues>(DEFAULT_SENSORS);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const sensorsRef = useRef<SensorValues>(DEFAULT_SENSORS);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = progressFromSnapshot(
    useSyncExternalStore(subscribeProgress, progressSnapshot, () => ""),
  );
  const exercise = getExercise(session.exerciseId) ?? null;

  // The learner's files live in this browser. The page keeps them and hands a copy to every run.
  const filesRaw = useSyncExternalStore(subscribeFiles, filesSnapshot, () => "");
  const files = useMemo(() => filesFromSnapshot(filesRaw), [filesRaw]);
  const filesRef = useRef<ProgramFile[]>(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Whether input() can wait for the learner. It needs the page to be
  // "cross-origin isolated", which the browser decides when the page loads.
  const isolated = useSyncExternalStore(
    noopSubscribe,
    () => window.crossOriginIsolated === true,
    () => null,
  );

  // The headers that isolate the page only apply to a full page load, not to
  // moving here from another page of the site. So reload once if needed.
  useEffect(() => {
    try {
      if (window.crossOriginIsolated) {
        sessionStorage.removeItem("rx-isolation-reload");
      } else if (!sessionStorage.getItem("rx-isolation-reload")) {
        sessionStorage.setItem("rx-isolation-reload", "1");
        window.location.reload();
      }
    } catch {
      /* storage can be unavailable; the program-input box still works */
    }
  }, []);

  const append = useCallback((kind: ChunkKind, text: string) => {
    setChunks((previous) => {
      const last = previous[previous.length - 1];
      if (last && last.kind === kind && kind !== "info") {
        return [...previous.slice(0, -1), { ...last, text: last.text + text }];
      }
      return [...previous, { id: nextId.current++, kind, text }];
    });
  }, []);

  const getRunner = useCallback(() => {
    if (!runnerRef.current) {
      runnerRef.current = new PythonRunner({
        onOutput: (stream, text) => append(stream === "stderr" ? "err" : "out", text),
        onStatus: setStatus,
        onDevice: (event: DeviceEvent) => {
          if (event.kind === "leds") setLeds(event.leds);
          else if (event.kind === "sound" && !mutedRef.current) playTone(event.frequency, event.ms);
          else if (event.kind === "radio") runner2Ref.current?.deliverRadio(event);
        },
      });
    }
    return runnerRef.current;
  }, [append]);

  // The second micro:bit, only made when a program uses the radio. It runs the same program.
  const getRunner2 = useCallback(() => {
    if (!runner2Ref.current) {
      runner2Ref.current = new PythonRunner({
        onOutput: (stream, text) => {
          if (stream === "stderr") append("err", `micro:bit 2: ${text}`);
        },
        onStatus: () => {},
        onDevice: (event: DeviceEvent) => {
          if (event.kind === "leds") setLeds2(event.leds);
          else if (event.kind === "radio") runnerRef.current?.deliverRadio(event);
        },
      });
    }
    return runner2Ref.current;
  }, [append]);

  useEffect(
    () => () => {
      runnerRef.current?.dispose();
      runner2Ref.current?.dispose();
      stopTone();
      if (draftTimer.current) clearTimeout(draftTimer.current);
    },
    [],
  );

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [chunks, status]);

  const run = useCallback(async () => {
    const runner = getRunner();
    setChunks([]);
    setCharts([]);
    const lines = runner.interactiveInput ? [] : stdinText.split("\n");
    const before = filesRef.current;
    const board = usesMicrobit(codeRef.current);
    if (board) {
      prepareAudio();
      setLeds(new Array(25).fill(0));
      setLeds2(new Array(25).fill(0));
      if (!runner.interactiveInput) append("info", "The micro:bit board needs the page in secure mode. Reload the page, then press Run again.");
    }
    setBoardRunning(board && runner.interactiveInput);
    // A program that uses the radio runs on two micro:bits at once, so a message sent by one can reach the other.
    const second = board && usesRadio(codeRef.current) && runner.interactiveInput ? getRunner2() : null;
    const secondRun = second ? second.run(codeRef.current, [], { files: before, sensors: sensors2Ref.current, quiet: true }) : null;
    const result = await runner.run(codeRef.current, lines, { files: before, sensors: sensorsRef.current });
    if (second) {
      second.stop();
      await secondRun;
    }
    setBoardRunning(false);
    if (board) stopTone();
    const note = describe(result);
    if (note) append(note.kind, note.text);
    setCharts(result.charts);
    if (result.charts.length > 0) append("info", `${result.charts.length === 1 ? "A chart was" : `${result.charts.length} charts were`} drawn. Look in the Charts section below.`);
    // Keep whatever the program left behind. A run that did not finish hands back the files it started with.
    const changed = changedFiles(before, result.files);
    if (changed.length > 0) {
      if (saveFiles(result.files)) append("info", `Files updated: ${changed.join(", ")}. Open "My files" to see them.`);
      else append("info", "The files could not be kept. Your browser may be blocking storage.");
    }
    if (result.fileNotes) append("info", result.fileNotes.join(" "));
  }, [append, getRunner, getRunner2, stdinText]);

  function onEdit(value: string) {
    codeRef.current = value;
    setBoardProgram(usesMicrobit(value));
    setRadioProgram(usesRadio(value));
    setBoardWanted(usesMicrobit(value) || getExercise(session.exerciseId)?.group === "micro:bit");
    setNotice("");
    // Keep unsaved work for each exercise, so switching exercises never loses it.
    if (draftTimer.current) clearTimeout(draftTimer.current);
    const id = session.exerciseId ?? "free";
    draftTimer.current = setTimeout(() => saveDraft(id, value), 600);
  }

  function flushDraft() {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = null;
    saveDraft(session.exerciseId ?? "free", codeRef.current);
  }

  function selectExercise(id: string | null) {
    if (runnerRef.current && runnerRef.current.isBusy) return;
    flushDraft();
    const draft = progress.drafts[id ?? "free"];
    const initialCode = draft ?? starterFor(id);
    codeRef.current = initialCode;
    setBoardWanted(usesMicrobit(initialCode) || getExercise(id)?.group === "micro:bit");
    setBoardProgram(usesMicrobit(initialCode));
    setRadioProgram(usesRadio(initialCode));
    setLeds(new Array(25).fill(0));
    setSession((previous) => ({ exerciseId: id, initialCode, key: previous.key + 1 }));
    setSavedId(null);
    setNotice("");
    setHintsShown(0);
    setReport(null);
    setChunks([]);
    setCharts([]);
  }

  function resetCode() {
    const initialCode = starterFor(session.exerciseId);
    codeRef.current = initialCode;
    setBoardProgram(usesMicrobit(initialCode));
    setRadioProgram(usesRadio(initialCode));
    saveDraft(session.exerciseId ?? "free", initialCode);
    setSession((previous) => ({ ...previous, initialCode, key: previous.key + 1 }));
    setReport(null);
    setNotice("");
  }

  async function check() {
    if (!exercise) return;
    setReport(null);
    setChecking(true);
    const result = await runChecks(getRunner(), exercise, codeRef.current);
    setChecking(false);
    setReport(result);
    if (result.passed) markCompleted(exercise.id);
  }

  function downloadProgram() {
    const url = URL.createObjectURL(new Blob([codeRef.current], { type: "text/x-python;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "main.py";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function save() {
    const code = codeRef.current;
    if (code.length > MAX_CODE_CHARS) {
      setNotice(`This program is too long to save (the limit is ${MAX_CODE_CHARS.toLocaleString("en")} characters).`);
      return;
    }
    const data = toProjectData(session.exerciseId, code);
    if (savedId && getProject(savedId)) {
      updateProjectData(savedId, data);
      setNotice(getProject(savedId) ? "Changes saved." : "Could not save. Your browser may be blocking storage.");
      return;
    }
    const created = createProject("python", exercise?.title ?? "My Python program", data);
    if (!getProject(created.id)) {
      setNotice("Could not save. Your browser may be blocking storage.");
      return;
    }
    setSavedId(created.id);
    setNotice("Saved to My Projects.");
  }

  function sendInput(event: React.FormEvent) {
    event.preventDefault();
    append("in", typed + "\n");
    runnerRef.current?.submitInput(typed);
    setTyped("");
  }

  const busy = status !== "idle" || checking;

  function changeSensors2(next: SensorValues) {
    sensors2Ref.current = next;
    setSensors2(next);
    runner2Ref.current?.setSensors(next);
  }

  function changeSensors(next: SensorValues) {
    sensorsRef.current = next;
    setSensors(next);
    runnerRef.current?.setSensors(next);
  }

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.wrap}`}>
        <header className={styles.bar}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/coding-robotics">RhinoCode</Link>
            <span aria-hidden="true">/</span>
            <h1>Rhinox Code Studio</h1>
          </nav>
          <div className={styles.links}>
            <Link href="/coding-robotics/arduino-studio">Arduino Studio</Link>
            <Link href="/coding-robotics/my-projects">My Projects</Link>
          </div>
        </header>

        <OfflineBar />

        <div className={styles.layout}>
          <ExercisePanel
            exercise={exercise}
            completed={progress.completed}
            hintsShown={hintsShown}
            report={report}
            checking={checking}
            busy={busy}
            onSelect={selectExercise}
            onShowHint={() => setHintsShown((n) => n + 1)}
            onCheck={check}
          />
          <div className={styles.workspace}>
        <div className={styles.toolbar} role="toolbar" aria-label="Run controls">
          <button type="button" className={styles.run} onClick={run} disabled={busy || checking}>
            {status === "starting" ? "Starting…" : "Run"}
          </button>
          <button
            type="button"
            onClick={() => {
              runnerRef.current?.stop();
              runner2Ref.current?.stop();
            }}
            disabled={!busy}
          >
            Stop
          </button>
          <button type="button" onClick={resetCode} disabled={busy || checking}>
            Reset
          </button>
          {boardProgram && (
            <button type="button" onClick={downloadProgram} title="Download this program as main.py to put on a real micro:bit (python.microbit.org)">
              Download .py
            </button>
          )}
          <button type="button" onClick={save} disabled={busy || checking}>
            {savedId ? "Save changes" : "Save to My Projects"}
          </button>
          <span className={styles.note} role="status">
            {notice || (boardProgram ? "micro:bit · runs until you press Stop · Ctrl+Enter runs" : `Python · stops after ${RUN_TIMEOUT_MS / 1000} seconds · Ctrl+Enter runs`)}
            {notice.startsWith("Saved") && (
              <>
                {" "}
                <Link href="/coding-robotics/my-projects">Open My Projects</Link>
              </>
            )}
          </span>
        </div>

        <div className={styles.split}>
          <section className={styles.editorPane} aria-label="Code editor">
            <PythonEditor
              key={session.key}
              initialValue={session.initialCode}
              onChange={onEdit}
              onRun={() => void run()}
            />
          </section>

          <section className={styles.console} aria-label="Console output">
            <h2 className={styles.consoleTitle}>Console</h2>
            <pre ref={bodyRef} className={styles.consoleBody} role="log" aria-live="polite">
              {chunks.length === 0 && status === "idle" && (
                <span className={styles.info}>Output will appear here when you press Run.</span>
              )}
              {chunks.length === 0 && status === "starting" && (
                <span className={styles.info}>Starting Python… the first run downloads the Python engine (about 6 MB).</span>
              )}
              {chunks.map((chunk) => (
                <span key={chunk.id} className={styles[chunk.kind]}>
                  {chunk.kind === "info" ? `\n${chunk.text}\n` : chunk.text}
                </span>
              ))}
            </pre>
            {status === "waiting-input" && (
              <form className={styles.inputRow} onSubmit={sendInput}>
                <label htmlFor="rx-input">Your program is waiting for input</label>
                <div>
                  <input
                    id="rx-input"
                    autoFocus
                    autoComplete="off"
                    maxLength={2000}
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                  />
                  <button type="submit">Send</button>
                </div>
              </form>
            )}
            {isolated === false && (
              <details className={styles.stdin}>
                <summary>Program input</summary>
                <p>Type the answers for input() here, one per line, before you press Run.</p>
                <textarea
                  value={stdinText}
                  onChange={(event) => setStdinText(event.target.value)}
                  rows={3}
                  aria-label="Answers for input(), one per line"
                />
              </details>
            )}
          </section>
        </div>
            {boardWanted && (
              <MicrobitPanel
                title={radioProgram ? "micro:bit 1" : "micro:bit"}
                leds={leds}
                running={boardRunning}
                sensors={sensors}
                muted={muted}
                onButton={(button, down) => runnerRef.current?.setButton(button, down)}
                onPin={(pin, touched) => runnerRef.current?.setPin(pin, touched ? 1023 : 0, touched)}
                onGesture={(name: GestureName) => runnerRef.current?.doGesture(name)}
                onSensors={changeSensors}
                onMute={(value) => {
                  mutedRef.current = value;
                  setMuted(value);
                  if (value) stopTone();
                }}
              />
            )}
            {boardWanted && radioProgram && (
              <MicrobitPanel
                title="micro:bit 2"
                showMute={false}
                leds={leds2}
                running={boardRunning}
                sensors={sensors2}
                muted={muted}
                onButton={(button, down) => runner2Ref.current?.setButton(button, down)}
                onPin={(pin, touched) => runner2Ref.current?.setPin(pin, touched ? 1023 : 0, touched)}
                onGesture={(name: GestureName) => runner2Ref.current?.doGesture(name)}
                onSensors={changeSensors2}
                onMute={() => {}}
              />
            )}
            <ChartsPanel charts={charts} />
            <FilesPanel files={files} onChange={(next) => saveFiles(next)} busy={busy} />
          </div>
        </div>
      </div>
    </main>
  );
}
