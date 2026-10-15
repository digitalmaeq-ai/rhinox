"use client";

import { useId, useRef, useState } from "react";

import styles from "./TaskStepper.module.css";

type Task = {
  id: string;
  title: string;
  description?: string;
  instructions?: string[];
};

/**
 * Tasks as one compact panel: a row of numbered tabs and a single task
 * shown at a time, with previous and next buttons.
 */
export default function TaskStepper({ tasks }: { tasks: Task[] }) {
  const [index, setIndex] = useState(0);
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  if (tasks.length === 0) return null;

  const go = (i: number, focus = false) => {
    const next = Math.max(0, Math.min(tasks.length - 1, i));
    setIndex(next);
    if (focus) tabs.current[next]?.focus();
  };

  const task = tasks[index];

  return (
    <div className={styles.wrap}>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Tasks"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1, true); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1, true); }
          if (e.key === "Home") { e.preventDefault(); go(0, true); }
          if (e.key === "End") { e.preventDefault(); go(tasks.length - 1, true); }
        }}
      >
        {tasks.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`${uid}-tab-${i}`}
            aria-selected={i === index}
            aria-controls={`${uid}-panel`}
            tabIndex={i === index ? 0 : -1}
            className={`${styles.tab} ${i === index ? styles.on : ""} ${i < index ? styles.past : ""}`}
            onClick={() => go(i)}
            title={t.title}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div
        className={styles.panel}
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${index}`}
      >
        <p className={styles.count}>
          Task {index + 1} of {tasks.length}
        </p>
        <h4 className={styles.title}>{task.title}</h4>
        {task.description && <p className={styles.text}>{task.description}</p>}
        {task.instructions && task.instructions.length > 0 && (
          <ol className={styles.steps}>
            {task.instructions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        )}

        <div className={styles.nav}>
          <button type="button" className={styles.btn} onClick={() => go(index - 1)} disabled={index === 0}>
            ← Previous
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.primary}`}
            onClick={() => go(index + 1)}
            disabled={index === tasks.length - 1}
          >
            Next task →
          </button>
        </div>
      </div>
    </div>
  );
}
