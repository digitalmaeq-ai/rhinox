"use client";

import { useSyncExternalStore } from "react";

import { parseArduinoProjectData } from "@/lib/code-studio/arduino-project";
import { projectsSnapshot, storeFromSnapshot, subscribeProjects } from "@/lib/rhinocode/projects";

import ArduinoStudio from "./ArduinoStudio";
import styles from "./CodeStudio.module.css";

const noopSubscribe = () => () => {};

// Saved sketches live in this browser, so the studio starts once they can be read.
// ?project=<id> (from My Projects) reopens a saved sketch.
export default function ArduinoLoader() {
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => null);
  const projects = useSyncExternalStore(subscribeProjects, projectsSnapshot, () => "");
  if (search === null || projects === "") {
    return (
      <main className={styles.page}>
        <div className={`rx-container ${styles.wrap}`}>
          <p className={styles.loading}>Loading Arduino Studio…</p>
        </div>
      </main>
    );
  }
  const id = new URLSearchParams(search).get("project");
  const stored = id ? storeFromSnapshot(projects).projects.find((p) => p.id === id && p.kind === "arduino") : undefined;
  const saved = stored ? parseArduinoProjectData(stored.data) : null;
  return <ArduinoStudio key={saved && id ? id : "new"} savedId={saved && id ? id : null} saved={saved} />;
}
