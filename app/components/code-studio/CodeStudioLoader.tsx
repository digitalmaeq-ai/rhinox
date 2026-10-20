"use client";

import { useSyncExternalStore } from "react";

import { parseProjectData } from "@/lib/code-studio/project";
import { projectsSnapshot, storeFromSnapshot, subscribeProjects } from "@/lib/rhinocode/projects";

import CodeStudio from "./CodeStudio";
import styles from "./CodeStudio.module.css";

const noopSubscribe = () => () => {};

// Projects, progress and the address all live in the browser, so the studio
// starts only once they can be read. ?project=<id> (from My Projects) reopens a
// saved program; otherwise it opens the first exercise.
export default function CodeStudioLoader() {
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => null);
  const projects = useSyncExternalStore(subscribeProjects, projectsSnapshot, () => "");

  if (search === null || projects === "") {
    return (
      <main className={styles.page}>
        <div className={`rx-container ${styles.wrap}`}>
          <p className={styles.loading}>Loading Code Studio…</p>
        </div>
      </main>
    );
  }

  const id = new URLSearchParams(search).get("project");
  const stored = id ? storeFromSnapshot(projects).projects.find((p) => p.id === id && p.kind === "python") : undefined;
  const saved = stored ? parseProjectData(stored.data) : null;

  return <CodeStudio key={saved && id ? id : "new"} savedId={saved && id ? id : null} savedProject={saved} />;
}
