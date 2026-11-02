"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { WEB_EXERCISES, getWebExercise } from "@/lib/code-studio/exercises-web";
import { markCompleted, progressFromSnapshot, progressSnapshot, saveDraft, subscribeProgress } from "@/lib/code-studio/progress";
import { buildPreview, WEB_MAX_CSS_CHARS, WEB_MAX_HTML_CHARS } from "@/lib/code-studio/web";
import { runWebChecks, type WebReport } from "@/lib/code-studio/web-check";
import { toWebProjectData, type WebProjectData } from "@/lib/code-studio/web-project";
import { createProject, getProject, updateProjectData } from "@/lib/rhinocode/projects";

import OfflineBar from "./OfflineBar";
import styles from "./CodeStudio.module.css";
import web from "./WebStudio.module.css";

const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <p style={{ color: "#cfe2ff", padding: 16 }}>Loading the editor…</p>,
});

const FREE_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
    <p>This is my first web page. Change the words and watch the preview.</p>
    <ul>
      <li>HTML builds the page</li>
      <li>CSS styles it</li>
    </ul>
  </body>
</html>
`;
const FREE_CSS = `body {
  font-family: sans-serif;
  margin: 24px;
}

h1 {
  color: #123b73;
}
`;

type Props = { savedId?: string | null; saved?: WebProjectData | null };
type Tab = "html" | "css";

function draftOf(raw: string | undefined): { html: string; css: string } | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as { html?: unknown; css?: unknown };
    return typeof d.html === "string" && typeof d.css === "string" ? { html: d.html, css: d.css } : null;
  } catch {
    return null;
  }
}

export default function WebStudio({ savedId: initialSavedId = null, saved = null }: Props) {
  const [savedId, setSavedId] = useState<string | null>(initialSavedId);
  const [notice, setNotice] = useState("");
  const [choice, setChoice] = useState(saved?.exerciseId ? `w:${saved.exerciseId}` : "free");
  const [tab, setTab] = useState<Tab>("html");
  const [editorKey, setEditorKey] = useState(0);
  const [seed, setSeed] = useState({ html: saved?.html ?? FREE_HTML, css: saved?.css ?? FREE_CSS });
  const htmlRef = useRef(saved?.html ?? FREE_HTML);
  const cssRef = useRef(saved?.css ?? FREE_CSS);
  const [previewDoc, setPreviewDoc] = useState(() => ({ doc: "", removed: [] as string[] }));
  const [hintsShown, setHintsShown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState<WebReport | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = progressFromSnapshot(useSyncExternalStore(subscribeProgress, progressSnapshot, () => ""));
  const exercise = choice.startsWith("w:") ? getWebExercise(choice.slice(2)) : undefined;

  const refresh = useCallback(() => {
    setPreviewDoc(buildPreview(htmlRef.current, cssRef.current));
  }, []);

  useEffect(() => {
    refresh();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [refresh]);

  function changed() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(refresh, 300);
    setNotice("");
    if (exercise) {
      if (draftTimer.current) clearTimeout(draftTimer.current);
      const id = exercise.id;
      draftTimer.current = setTimeout(() => saveDraft(id, JSON.stringify({ html: htmlRef.current, css: cssRef.current })), 600);
    }
  }

  function flushDraft() {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = null;
    if (exercise) saveDraft(exercise.id, JSON.stringify({ html: htmlRef.current, css: cssRef.current }));
  }

  function load(html: string, css: string) {
    htmlRef.current = html;
    cssRef.current = css;
    setSeed({ html, css });
    setEditorKey((k) => k + 1);
    refresh();
  }

  function choose(value: string) {
    if (checking) return;
    flushDraft();
    if (value.startsWith("w:")) {
      const ex = getWebExercise(value.slice(2));
      if (!ex) return;
      const draft = draftOf(progress.drafts[ex.id]);
      load(draft?.html ?? ex.starterHtml, draft?.css ?? ex.starterCss);
    } else {
      load(FREE_HTML, FREE_CSS);
    }
    setChoice(value);
    setSavedId(null);
    setNotice("");
    setTab("html");
    setHintsShown(0);
    setReport(null);
  }

  function switchTab(next: Tab) {
    setSeed({ html: htmlRef.current, css: cssRef.current });
    setTab(next);
    setEditorKey((k) => k + 1);
  }

  function resetCode() {
    if (!exercise || checking) return;
    saveDraft(exercise.id, JSON.stringify({ html: exercise.starterHtml, css: exercise.starterCss }));
    load(exercise.starterHtml, exercise.starterCss);
    setReport(null);
  }

  async function check() {
    if (!exercise || checking) return;
    setChecking(true);
    setReport(null);
    const result = await runWebChecks(exercise, htmlRef.current, cssRef.current);
    if (result.passed) markCompleted(exercise.id);
    setReport(result);
    setChecking(false);
  }

  function save() {
    if (htmlRef.current.length > WEB_MAX_HTML_CHARS || cssRef.current.length > WEB_MAX_CSS_CHARS) {
      setNotice("This page is too long to save.");
      return;
    }
    const data = toWebProjectData(exercise?.id ?? null, htmlRef.current, cssRef.current);
    if (savedId && getProject(savedId)) {
      updateProjectData(savedId, data);
      setNotice("Changes saved.");
      return;
    }
    const created = createProject("web", exercise?.title ?? "My web page", data);
    if (!getProject(created.id)) {
      setNotice("Could not save. Your browser may be blocking storage.");
      return;
    }
    setSavedId(created.id);
    setNotice("Saved to My Projects.");
  }

  function download() {
    // One file a learner can open in any browser: their HTML with their CSS added in a <style> tag.
    const style = `<style>\n${cssRef.current}\n</style>`;
    const page = /<\/head>/i.test(htmlRef.current) ? htmlRef.current.replace(/<\/head>/i, `${style}\n</head>`) : `${style}\n${htmlRef.current}`;
    const url = URL.createObjectURL(new Blob([page], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "index.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const removedText = useMemo(() => previewDoc.removed.join(", "), [previewDoc.removed]);

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.wrap}`}>
        <header className={styles.bar}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/coding-robotics">RhinoCode</Link>
            <span aria-hidden="true">/</span>
            <h1>Web Studio</h1>
          </nav>
          <div className={styles.links}>
            <Link href="/coding-robotics/code-studio">Python Studio</Link>
            <Link href="/coding-robotics/code-studio/arduino">Arduino Studio</Link>
            <Link href="/coding-robotics/my-projects">My Projects</Link>
          </div>
        </header>

        <OfflineBar kind="web" />

        <div className={styles.workspace}>
          <div className={styles.toolbar} role="toolbar" aria-label="Page controls">
            <label className={web.picker}>
              Page
              <select value={choice} onChange={(e) => choose(e.target.value)} disabled={checking} aria-label="Choose a free page or an exercise">
                <option value="free">{saved && !saved.exerciseId ? "My saved page" : "Free page"}</option>
                <optgroup label="Exercises">
                  {WEB_EXERCISES.map((e) => (
                    <option key={e.id} value={`w:${e.id}`}>
                      {progress.completed.includes(e.id) ? "✓ " : ""}
                      {e.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            {exercise && (
              <>
                <button type="button" className={styles.run} onClick={() => void check()} disabled={checking}>
                  {checking ? "Checking…" : "Check my work"}
                </button>
                <button type="button" onClick={resetCode} disabled={checking}>
                  Reset
                </button>
              </>
            )}
            <button type="button" onClick={save} disabled={checking}>
              {savedId ? "Save changes" : "Save to My Projects"}
            </button>
            <button type="button" onClick={download} title="Download your page as index.html to open in any browser">
              Download .html
            </button>
            <span className={styles.note} role="status">
              {notice || "The preview updates as you type · JavaScript does not run here"}
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
              <div className={web.editorBox}>
                <div className={web.tabs} role="tablist" aria-label="Files">
                  <button type="button" role="tab" aria-selected={tab === "html"} onClick={() => switchTab("html")}>
                    index.html
                  </button>
                  <button type="button" role="tab" aria-selected={tab === "css"} onClick={() => switchTab("css")}>
                    style.css
                  </button>
                </div>
                <div style={{ minHeight: 0 }}>
                  <PythonEditor
                    key={`${editorKey}-${tab}`}
                    language={tab}
                    initialValue={seed[tab]}
                    onChange={(value) => {
                      if (tab === "html") htmlRef.current = value;
                      else cssRef.current = value;
                      changed();
                    }}
                  />
                </div>
              </div>
            </section>
            <section className={styles.console} aria-label="Preview">
              <h2 className={styles.consoleTitle}>Preview</h2>
              {previewDoc.doc ? <iframe className={web.preview} title="Preview of your page" sandbox="" srcDoc={previewDoc.doc} /> : <div className={web.preview} />}
              <p className={web.previewNote}>
                style.css is added to your page for you.
                {removedText ? ` Not allowed here, so removed from the preview: ${removedText}.` : ""}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
