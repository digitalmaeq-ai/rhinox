"use client";

import { useSyncExternalStore } from "react";

import { parseWebProjectData } from "@/lib/code-studio/web-project";
import { projectsSnapshot, storeFromSnapshot, subscribeProjects } from "@/lib/rhinocode/projects";

import styles from "./CodeStudio.module.css";
import WebStudio from "./WebStudio";

const noopSubscribe = () => () => {};

// ?project=<id> (from My Projects) reopens a saved page.
export default function WebLoader() {
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => null);
  const projects = useSyncExternalStore(subscribeProjects, projectsSnapshot, () => "");
  if (search === null || projects === "") {
    return (
      <main className={styles.page}>
        <div className={`rx-container ${styles.wrap}`}>
          <p className={styles.loading}>Loading Web Studio…</p>
        </div>
      </main>
    );
  }
  const id = new URLSearchParams(search).get("project");
  const stored = id ? storeFromSnapshot(projects).projects.find((p) => p.id === id && p.kind === "web") : undefined;
  const saved = stored ? parseWebProjectData(stored.data) : null;
  return <WebStudio key={saved && id ? id : "new"} savedId={saved && id ? id : null} saved={saved} />;
}
