"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import styles from "./CodeStudio.module.css";

// Monaco needs the browser, so it loads only there.
const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <p className={styles.loading}>Loading the editor…</p>,
});

const STARTER = `# Welcome to Rhinox Code Studio
print("Hello, Rhinox!")
`;

export default function CodeStudio() {
  const [, setCode] = useState(STARTER);
  const [resetCount, setResetCount] = useState(0);

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
          <button type="button" className={styles.run} disabled>
            Run
          </button>
          <button type="button" className={styles.secondary} disabled>
            Stop
          </button>
          <button type="button" className={styles.secondary} onClick={() => {
              setCode(STARTER);
              setResetCount((n) => n + 1);
            }}>
            Reset
          </button>
          <span className={styles.note}>Python language · the runner is connected in the next stage</span>
        </div>

        <div className={styles.split}>
          <section className={styles.editorPane} aria-label="Code editor">
            <PythonEditor key={resetCount} initialValue={STARTER} onChange={setCode} />
          </section>
          <section className={styles.console} aria-label="Console output">
            <h2 className={styles.consoleTitle}>Console</h2>
            <pre className={styles.consoleBody} aria-live="polite">
              Output will appear here when you press Run.
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}
