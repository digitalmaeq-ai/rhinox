"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ARDUINO_EXAMPLES } from "@/lib/code-studio/arduino-examples";
import { ArduinoRunner } from "@/lib/code-studio/arduino-runner";
import { emptyPins, type PinState } from "@/lib/code-studio/arduino";
import { playTone, prepareAudio, stopTone } from "@/lib/code-studio/board-audio";

import ArduinoBoard from "./ArduinoBoard";
import styles from "./CodeStudio.module.css";

const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <p style={{ color: "#cfe2ff", padding: 16 }}>Loading the editor…</p>,
});

const noopSubscribe = () => () => {};
const MAX_CONSOLE_CHARS = 20_000;

export default function ArduinoStudio() {
  const [exampleId, setExampleId] = useState(ARDUINO_EXAMPLES[0].id);
  const [initialCode, setInitialCode] = useState(ARDUINO_EXAMPLES[0].code);
  const [editorKey, setEditorKey] = useState(0);
  const [pins, setPins] = useState<PinState>(emptyPins);
  const [running, setRunning] = useState(false);
  const [serial, setSerial] = useState("");
  const [message, setMessage] = useState("");
  const [buzzing, setBuzzing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dials, setDials] = useState<[number, number]>([512, 512]);
  const codeRef = useRef(ARDUINO_EXAMPLES[0].code);
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
    const result = await runner.run(codeRef.current);
    stopTone();
    setBuzzing(false);
    if (result.outcome === "error") setMessage(`Error: ${result.error ?? "the program stopped"}`);
    else if (result.outcome === "timeout" || result.outcome === "output-limit" || result.outcome === "crashed" || result.outcome === "unavailable") {
      setMessage(result.error ?? "The program stopped.");
    } else if (result.outcome === "stopped") setMessage("Stopped.");
  }, [getRunner]);

  function choose(id: string) {
    const example = ARDUINO_EXAMPLES.find((e) => e.id === id);
    if (!example || running) return;
    runnerRef.current?.stop();
    setExampleId(id);
    codeRef.current = example.code;
    setInitialCode(example.code);
    setEditorKey((k) => k + 1);
    setSerial("");
    setMessage("");
    setPins(emptyPins());
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
          </div>
        </header>

        <div className={styles.workspace}>
          <div className={styles.toolbar} role="toolbar" aria-label="Run controls">
            <button type="button" className={styles.run} onClick={() => void run()} disabled={running}>
              {running ? "Running…" : "Run"}
            </button>
            <button type="button" onClick={() => runnerRef.current?.stop()} disabled={!running}>
              Stop
            </button>
            <label style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: "0.85rem" }}>
              Example
              <select value={exampleId} onChange={(e) => choose(e.target.value)} disabled={running} aria-label="Choose an example program">
                {ARDUINO_EXAMPLES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={download} title="Download this sketch as sketch.ino to open in the Arduino IDE">
              Download .ino
            </button>
            <span className={styles.note} role="status">
              {isolated === false ? "Reload the page: it needs secure mode to run." : "Arduino Uno · runs until you press Stop · Ctrl+Enter runs"}
            </span>
          </div>

          <div className={styles.split}>
            <section className={styles.editorPane} aria-label="Code editor">
              <PythonEditor
                key={editorKey}
                language="cpp"
                initialValue={initialCode}
                onChange={(value) => {
                  codeRef.current = value;
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
