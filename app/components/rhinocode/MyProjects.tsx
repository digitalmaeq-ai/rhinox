"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  KIND_LABELS, deleteProject, projectsSnapshot, renameProject, storeFromSnapshot, subscribeProjects, type Project,
} from "@/lib/rhinocode/projects";

import styles from "./MyProjects.module.css";

const LAB_PATH = "/coding-robotics/robot-lab";
const GAME_PATH = "/coding-robotics/game-creator";
const PYTHON_PATH = "/coding-robotics/code-studio";

function openHref(project: Project): string {
  const base = project.kind === "robot-program" ? LAB_PATH : project.kind === "python" ? PYTHON_PATH : GAME_PATH;
  return `${base}?project=${encodeURIComponent(project.id)}`;
}

function when(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// My Projects: everything the learner has saved in RhinoCode, newest first.
// Projects live in this browser, so the list is read on the client.
export default function MyProjects() {
  const snapshot = useSyncExternalStore(subscribeProjects, projectsSnapshot, () => "");
  const projects = useMemo(
    () => storeFromSnapshot(snapshot).projects.sort((a, b) => b.updatedAt - a.updatedAt),
    [snapshot],
  );
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  function startRename(project: Project) {
    setConfirming(null);
    setRenaming(project.id);
    setDraft(project.name);
  }

  function finishRename(project: Project) {
    renameProject(project.id, draft);
    setRenaming(null);
  }

  return (
    <main className={styles.page}>
      <div className="rx-container">
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/coding-robotics">RhinoCode</Link>
          <span aria-hidden="true">/</span>
          <span>My Projects</span>
        </nav>

        <header className={styles.head}>
          <div>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>RhinoCode</p>
            <h1>My Projects</h1>
            <p className={styles.lead}>The programmes and games you have saved. They stay in this browser on this device.</p>
          </div>
          <Link href="/coding-robotics/robot-lab" className="rx-button rx-button-primary">Open the Robot Lab</Link>
        </header>

        {projects.length === 0 ? (
          <section className={styles.empty} aria-live="polite">
            <h2>Nothing saved yet</h2>
            <p>Save a programme, a game or a Python program and it will appear here, ready to reopen.</p>
            <div className={styles.emptyActions}>
              <Link href="/coding-robotics/robot-lab" className="rx-button rx-button-primary">Open the Robot Lab</Link>
              <Link href="/coding-robotics/code-studio" className="rx-button rx-button-secondary">Open Code Studio</Link>
              <Link href="/coding-robotics/challenges" className="rx-button rx-button-secondary">Game Challenges</Link>
            </div>
          </section>
        ) : (
          <ul className={styles.list} aria-label="Saved projects">
            {projects.map((project) => (
              <li key={project.id} className={styles.item}>
                <span className={styles.kind}>{KIND_LABELS[project.kind]}</span>
                <div className={styles.body}>
                  {renaming === project.id ? (
                    <form
                      className={styles.renameForm}
                      onSubmit={(event) => {
                        event.preventDefault();
                        finishRename(project);
                      }}
                    >
                      <label className={styles.srOnly} htmlFor={`rename-${project.id}`}>Project name</label>
                      <input
                        id={`rename-${project.id}`}
                        value={draft}
                        maxLength={40}
                        autoFocus
                        onChange={(event) => setDraft(event.target.value)}
                      />
                      <button type="submit" className={styles.small}>Save</button>
                      <button type="button" className={styles.small} onClick={() => setRenaming(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <strong>{project.name}</strong>
                      <span className={styles.meta}>Updated {when(project.updatedAt)}</span>
                    </>
                  )}
                </div>
                <div className={styles.actions}>
                  <Link href={openHref(project)} className={`${styles.small} ${styles.open}`}>Open</Link>
                  <button type="button" className={styles.small} onClick={() => startRename(project)}>Rename</button>
                  {confirming === project.id ? (
                    <>
                      <button type="button" className={`${styles.small} ${styles.danger}`} onClick={() => { deleteProject(project.id); setConfirming(null); }}>
                        Delete for good
                      </button>
                      <button type="button" className={styles.small} onClick={() => setConfirming(null)}>Keep</button>
                    </>
                  ) : (
                    <button type="button" className={styles.small} onClick={() => { setRenaming(null); setConfirming(project.id); }} aria-label={`Delete ${project.name}`}>
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
