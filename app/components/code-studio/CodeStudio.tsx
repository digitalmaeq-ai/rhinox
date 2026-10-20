"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { MAX_OUTPUT_CHARS, RUN_TIMEOUT_MS } from "@/lib/code-studio/limits";
import { PythonRunner, type RunResult, type RunnerStatus } from "@/lib/code-studio/runner";

import styles from "./CodeStudio.module.css";

// Monaco needs the browser, so it loads only there.
const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <p className={styles.loading}>Loading the editor…</p>,
});

const STARTER = `# Welcome to Rhinox Code Studio
print("Hello, Rhinox!")
`;

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

export default function CodeStudio() {
  const codeRef = useRef(STARTER);
  const runnerRef = useRef<PythonRunner | null>(null);
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLPreElement | null>(null);
  const [resetCount, setResetCount] = useState(0);
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [stdinText, setStdinText] = useState("");
  const [typed, setTyped] = useState("");

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
      });
    }
    return runnerRef.current;
  }, [append]);

  useEffect(() => () => runnerRef.current?.dispose(), []);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [chunks, status]);

  const run = useCallback(async () => {
    const runner = getRunner();
    setChunks([]);
    const lines = runner.interactiveInput ? [] : stdinText.split("\n");
    const result = await runner.run(codeRef.current, lines);
    const note = describe(result);
    if (note) append(note.kind, note.text);
  }, [append, getRunner, stdinText]);

  function sendInput(event: React.FormEvent) {
    event.preventDefault();
    append("in", typed + "\n");
    runnerRef.current?.submitInput(typed);
    setTyped("");
  }

  const busy = status !== "idle";

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
            <Link href="/coding-robotics/my-projects">My Projects</Link>
          </div>
        </header>

        <div className={styles.toolbar} role="toolbar" aria-label="Run controls">
          <button type="button" className={styles.run} onClick={run} disabled={busy}>
            {status === "starting" ? "Starting…" : "Run"}
          </button>
          <button type="button" onClick={() => runnerRef.current?.stop()} disabled={!busy}>
            Stop
          </button>
          <button
            type="button"
            onClick={() => {
              codeRef.current = STARTER;
              setResetCount((n) => n + 1);
            }}
            disabled={busy}
          >
            Reset
          </button>
          <span className={styles.note}>Python · stops after {RUN_TIMEOUT_MS / 1000} seconds · Ctrl+Enter runs</span>
        </div>

        <div className={styles.split}>
          <section className={styles.editorPane} aria-label="Code editor">
            <PythonEditor
              key={resetCount}
              initialValue={STARTER}
              onChange={(value) => {
                codeRef.current = value;
              }}
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
      </div>
    </main>
  );
}
