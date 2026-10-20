"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { toArduinoProjectData, type ArduinoProjectData, ARDUINO_MAX_SAVED_CODE } from "@/lib/code-studio/arduino-project";
import { createProject, getProject, updateProjectData } from "@/lib/rhinocode/projects";
import { ARDUINO_EXAMPLES } from "@/lib/code-studio/arduino-examples";
import { ARDUINO_EXERCISES, getArduinoExercise } from "@/lib/code-studio/exercises-arduino";
import { markCompleted, progressFromSnapshot, progressSnapshot, saveDraft, subscribeProgress } from "@/lib/code-studio/progress";
import { ArduinoRunner } from "@/lib/code-studio/arduino-runner";
import { BOARDS, WL, emptyPins, kitOf, type BoardId, type PinState } from "@/lib/code-studio/arduino";
import { playTone, prepareAudio, stopTone } from "@/lib/code-studio/board-audio";

import ArduinoBoard from "./ArduinoBoard";
import OfflineBar from "./OfflineBar";
import styles from "./CodeStudio.module.css";

const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <p style={{ color: "#cfe2ff", padding: 16 }}>Loading the editor…</p>,
});

const noopSubscribe = () => () => {};
const MAX_CONSOLE_CHARS = 20_000;

type Props = { savedId?: string | null; saved?: ArduinoProjectData | null };

export default function ArduinoStudio({ savedId: initialSavedId = null, saved = null }: Props) {
  const [savedId, setSavedId] = useState<string | null>(initialSavedId);
  const [notice, setNotice] = useState("");
  const [board, setBoard] = useState<BoardId>(saved?.board ?? "uno");
  const [wifi, setWifi] = useState<{ status: number; ssid: string }>({ status: WL.NO_SHIELD, ssid: "" });
  const [router, setRouter] = useState(true);
  const [choice, setChoice] = useState(saved?.exerciseId ? `ar:${saved.exerciseId}` : saved ? "free" : `ex:${ARDUINO_EXAMPLES[0].id}`);
  const [hintsShown, setHintsShown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState<{ passed: boolean; lines: { name: string; ok: boolean; detail: string }[] } | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = progressFromSnapshot(useSyncExternalStore(subscribeProgress, progressSnapshot, () => ""));
  const exercise = choice.startsWith("ar:") ? getArduinoExercise(choice.slice(3)) : undefined;
  const [initialCode, setInitialCode] = useState(saved?.code ?? ARDUINO_EXAMPLES[0].code);
  const [editorKey, setEditorKey] = useState(0);
  const [pins, setPins] = useState<PinState>(emptyPins);
  const [running, setRunning] = useState(false);
  const [serial, setSerial] = useState("");
  const [message, setMessage] = useState("");
  const [buzzing, setBuzzing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dials, setDials] = useState<[number, number]>(() => {
    const mid = Math.round(kitOf(saved?.board ?? "uno").adcMax / 2);
    return [mid, mid];
  });
  const codeRef = useRef(saved?.code ?? ARDUINO_EXAMPLES[0].code);
  const mutedRef = useRef(false);
  const runnerRef = useRef<ArduinoRunner | null>(null);
  const buzzTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logRef = useRef<HTMLPreElement>(null);

  const isolated = useSyncExternalStore(noopSubscribe, () => window.crossOriginIsolated === true, () => null);

  // The headers that make the page "cross-origin isolated" only apply to a full page load.
  useEffect(() => {
    try {
      if (window.crossOriginIsolated) {
        sessionStorage.removeItem("rx-isolation-reload");
      } else if (!sessionStorage.getItem("rx-isolation-reload")) {
        sessionStorage.setItem("rx-isolation-reload", "1");
        window.location.reload();
      }
    } catch {
      /* storage can be unavailable */
    }
  }, []);

  const getRunner = useCallback(() => {
    if (!runnerRef.current) {
      runnerRef.current = new ArduinoRunner({
        onState: setPins,
        onSerial: (text) => setSerial((previous) => (previous + text).slice(-MAX_CONSOLE_CHARS)),
        onTone: (frequency, ms) => {
          if (buzzTimer.current) clearTimeout(buzzTimer.current);
          if (frequency <= 0) {
            setBuzzing(false);
            stopTone();
            return;
          }
          setBuzzing(true);
          if (!mutedRef.current) playTone(frequency, ms || 1000);
          buzzTimer.current = setTimeout(() => setBuzzing(false), ms || 1000);
        },
        onWifi: (status, ssid) => setWifi({ status, ssid }),
        onRunning: setRunning,
      });
    }
    return runnerRef.current;
  }, []);

  useEffect(
    () => () => {
      runnerRef.current?.dispose();
      stopTone();
      if (buzzTimer.current) clearTimeout(buzzTimer.current);
      if (draftTimer.current) clearTimeout(draftTimer.current);
    },
    [],
  );

  useEffect(() => {
    const body = logRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [serial, message]);

  const run = useCallback(async () => {
    const runner = getRunner();
    setSerial("");
    setMessage("");
    setPins(emptyPins());
    prepareAudio();
    setWifi({ status: WL.NO_SHIELD, ssid: "" });
    const result = await runner.run(codeRef.current, board);
    stopTone();
    setBuzzing(false);
    if (result.outcome === "error") setMessage(`Error: ${result.error ?? "the program stopped"}`);
    else if (result.outcome === "timeout" || result.outcome === "output-limit" || result.outcome === "crashed" || result.outcome === "unavailable") {
      setMessage(result.error ?? "The program stopped.");
    } else if (result.outcome === "stopped") setMessage("Stopped.");
  }, [getRunner, board]);

  function choose(value: string) {
    if (running || checking) return;
    flushDraft();
    runnerRef.current?.stop();
    let code: string | undefined;
    let nextBoard: BoardId = board;
    if (value.startsWith("ar:")) {
      const ex = getArduinoExercise(value.slice(3));
      if (!ex) return;
      code = progress.drafts[ex.id] ?? ex.starter;
      nextBoard = ex.board;
    } else {
      const example = ARDUINO_EXAMPLES.find((e) => e.id === value.slice(3));
      code = example?.code;
      if (example) nextBoard = example.board;
    }
    if (code === undefined) return;
    if (nextBoard !== board) {
      const mid = Math.round(kitOf(nextBoard).adcMax / 2);
      setDials([mid, mid]);
      runnerRef.current?.useBoard(nextBoard);
      setWifi({ status: WL.NO_SHIELD, ssid: "" });
    }
    setBoard(nextBoard);
    setChoice(value);
    setSavedId(null);
    setNotice("");
    codeRef.current = code;
    setInitialCode(code);
    setEditorKey((k) => k + 1);
    setSerial("");
    setMessage("");
    setPins(emptyPins());
    setHintsShown(0);
    setReport(null);
  }

  function flushDraft() {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = null;
    if (exercise) saveDraft(exercise.id, codeRef.current);
  }

  function resetCode() {
    if (!exercise || running) return;
    codeRef.current = exercise.starter;
    saveDraft(exercise.id, exercise.starter);
    setInitialCode(exercise.starter);
    setEditorKey((k) => k + 1);
    setReport(null);
  }

  async function check() {
    if (!exercise || running || checking) return;
    setChecking(true);
    setReport(null);
    const lines: { name: string; ok: boolean; detail: string }[] = [];
    for (const c of exercise.cases) {
      const result = await getRunner().simulate(codeRef.current, c.script, board);
      if (!result) lines.push({ name: c.name, ok: false, detail: "The check could not run. Reload the page and try again." });
      else if (result.error) lines.push({ name: c.name, ok: false, detail: `Your program has an error: ${result.error}` });
      else {
        const problem = c.expect(result.trace);
        lines.push({ name: c.name, ok: problem === null, detail: problem ?? "" });
      }
    }
    const passed = lines.every((l) => l.ok);
    if (passed) markCompleted(exercise.id);
    setReport({ passed, lines });
    setChecking(false);
  }

  function save() {
    const code = codeRef.current;
    if (code.length > ARDUINO_MAX_SAVED_CODE) {
      setNotice(`This sketch is too long to save (the limit is ${ARDUINO_MAX_SAVED_CODE.toLocaleString("en")} characters).`);
      return;
    }
    const data = toArduinoProjectData(exercise?.id ?? null, code, board);
    if (savedId && getProject(savedId)) {
      updateProjectData(savedId, data);
      setNotice("Changes saved.");
      return;
    }
    const created = createProject("arduino", exercise?.title ?? "My Arduino sketch", data);
    if (!getProject(created.id)) {
      setNotice("Could not save. Your browser may be blocking storage.");
      return;
    }
    setSavedId(created.id);
    setNotice("Saved to My Projects.");
  }

  function download() {
    const url = URL.createObjectURL(new Blob([codeRef.current], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "sketch.ino";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.wrap}`}>
        <header className={styles.bar}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/coding-robotics">RhinoCode</Link>
            <span aria-hidden="true">/</span>
            <h1>Arduino Studio</h1>
          </nav>
          <div className={styles.links}>
            <Link href="/coding-robotics/code-studio">Python Studio</Link>
            <Link href="/coding-robotics/my-projects">My Projects</Link>
          </div>
        </header>

        <OfflineBar kind="arduino" />

        <div className={styles.workspace}>
          <div className={styles.toolbar} role="toolbar" aria-label="Run controls">
            <button type="button" className={styles.run} onClick={() => void run()} disabled={running}>
              {running ? "Running…" : "Run"}
            </button>
            <button type="button" onClick={() => runnerRef.current?.stop()} disabled={!running}>
              Stop
            </button>
            <label style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: "0.85rem" }}>
              Board
              <select
                value={board}
                onChange={(e) => {
                  const first = ARDUINO_EXAMPLES.find((x) => x.board === e.target.value);
                  if (first) choose(`ex:${first.id}`);
                }}
                disabled={running || checking}
                aria-label="Choose a board"
              >
                {(Object.keys(BOARDS) as BoardId[]).map((id) => (
                  <option key={id} value={id}>
                    {BOARDS[id].name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: "0.85rem" }}>
              Program
              <select value={choice} onChange={(e) => choose(e.target.value)} disabled={running || checking} aria-label="Choose an example or exercise">
                {choice === "free" && <option value="free">My saved sketch</option>}
                <optgroup label="Examples">
                  {ARDUINO_EXAMPLES.filter((e) => e.board === board).map((e) => (
                    <option key={e.id} value={`ex:${e.id}`}>
                      {e.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Exercises">
                  {ARDUINO_EXERCISES.filter((e) => e.board === board).map((e) => (
                    <option key={e.id} value={`ar:${e.id}`}>
                      {progress.completed.includes(e.id) ? "✓ " : ""}
                      {e.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            {exercise && (
              <>
                <button type="button" onClick={() => void check()} disabled={running || checking}>
                  {checking ? "Checking…" : "Check my work"}
                </button>
                <button type="button" onClick={resetCode} disabled={running || checking}>
                  Reset
                </button>
              </>
            )}
            <button type="button" onClick={save} disabled={running || checking}>
              {savedId ? "Save changes" : "Save to My Projects"}
            </button>
            <button type="button" onClick={download} title="Download this sketch as sketch.ino to open in the Arduino IDE">
              Download .ino
            </button>
            <span className={styles.note} role="status">
              {notice || (isolated === false ? "Reload the page: it needs secure mode to run." : `${kitOf(board).name} · runs until you press Stop · Ctrl+Enter runs`)}
              {notice.startsWith("Saved") && (
                <>
                  {" "}
                  <Link href="/coding-robotics/my-projects">Open My Projects</Link>
                </>
              )}
            </span>
          </div>

          {exercise && (
            <section className={styles.board} aria-label="Exercise" style={{ marginTop: 0, marginBottom: 12 }}>
              <h2 className={styles.boardTitle}>
                {exercise.title}
                {progress.completed.includes(exercise.id) ? " · done" : ""}
              </h2>
              <div style={{ padding: 14, display: "grid", gap: 8 }}>
                <p style={{ margin: 0 }}>{exercise.task}</p>
                {exercise.hints.slice(0, hintsShown).map((hint, i) => (
                  <p key={i} style={{ margin: 0, color: "#475569" }}>
                    Hint {i + 1}: {hint}
                  </p>
                ))}
                {hintsShown < exercise.hints.length && (
                  <div>
                    <button type="button" onClick={() => setHintsShown((n) => n + 1)}>
                      Show a hint
                    </button>
                  </div>
                )}
                {report && (
                  <div role="status" data-passed={report.passed ? "1" : "0"}>
                    <strong>{report.passed ? "All checks passed. Well done!" : "Not quite yet."}</strong>
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                      {report.lines.map((l) => (
                        <li key={l.name}>
                          {l.ok ? "✓" : "✗"} {l.name}
                          {l.detail ? `: ${l.detail}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className={styles.split}>
            <section className={styles.editorPane} aria-label="Code editor">
              <PythonEditor
                key={editorKey}
                language="cpp"
                initialValue={initialCode}
                onChange={(value) => {
                  codeRef.current = value;
                  if (exercise) {
                    if (draftTimer.current) clearTimeout(draftTimer.current);
                    const id = exercise.id;
                    draftTimer.current = setTimeout(() => saveDraft(id, value), 600);
                  }
                }}
                onRun={() => void run()}
              />
            </section>
            <section className={styles.console} aria-label="Serial Monitor">
              <h2 className={styles.consoleTitle}>Serial Monitor</h2>
              <pre ref={logRef} className={styles.consoleBody} role="log" aria-live="polite">
                {serial === "" && message === "" && <span className={styles.info}>Text from Serial.print and Serial.println appears here.</span>}
                <span className={styles.out}>{serial}</span>
                {message && <span className={message.startsWith("Error") ? styles.err : styles.info}>{`\n${message}\n`}</span>}
              </pre>
            </section>
          </div>

          <ArduinoBoard
            board={board}
            wifi={wifi}
            router={router}
            onRouter={(up) => {
              setRouter(up);
              getRunner().setRouter(up);
            }}
            pins={pins}
            running={running}
            buzzing={buzzing}
            muted={muted}
            dials={dials}
            onButton={(pin, down) => getRunner().setButton(pin, down)}
            onDial={(analog, value) => {
              getRunner().setDial(analog, value);
              setDials((previous) => (analog === 0 ? [value, previous[1]] : [previous[0], value]));
            }}
            onMute={(value) => {
              mutedRef.current = value;
              setMuted(value);
              if (value) stopTone();
            }}
          />
        </div>
      </div>
    </main>
  );
}
