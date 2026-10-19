"use client";

import { useSyncExternalStore } from "react";

import { parseProject } from "@/lib/game-creator/engine";
import { mazeEscapeTemplate } from "@/lib/game-creator/template";
import { projectsSnapshot, storeFromSnapshot, subscribeProjects } from "@/lib/rhinocode/projects";

import GameCreator from "./GameCreator";
import styles from "./GameCreator.module.css";

const noopSubscribe = () => () => {};

// Projects and the address live in the browser, so the editor starts only once
// they can be read. It opens ?project=<id> from My Projects, or a fresh template.
export default function GameCreatorLoader() {
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => null);
  const snapshot = useSyncExternalStore(subscribeProjects, projectsSnapshot, () => "");

  if (search === null || snapshot === "") {
    return (
      <main className={styles.page}>
        <div className={`rx-container ${styles.wrap}`}>
          <p className={styles.helper}>Loading the Game Creator…</p>
        </div>
      </main>
    );
  }

  const id = new URLSearchParams(search).get("project");
  const stored = id ? storeFromSnapshot(snapshot).projects.find((p) => p.id === id && p.kind === "game") : undefined;
  const parsed = stored ? parseProject(stored.data) : null;

  return <GameCreator key={parsed ? id : "new"} initial={parsed ?? mazeEscapeTemplate()} savedId={parsed ? id : null} />;
}
