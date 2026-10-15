"use client";

import { useId, useRef, useState } from "react";

import styles from "./TaskBoard.module.css";

type Task = {
  id: string;
  title: string;
  description?: string;
  instructions?: string[];
};

type Achievement = {
  id: string;
  title: string;
  description?: string;
  points?: number;
};

/**
 * Three columns in one row: the list of tasks, the selected task with its
 * steps, and the achievements to earn.
 */
export default function TaskBoard({
  tasks,
  achievements = [],
}: {
  tasks: Task[];
  achievements?: Achievement[];
}) {
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
    <div className={`${styles.board} ${achievements.length ? "" : styles.two}`}>
      {/* 1. task list */}
      <div className={`${styles.col} ${styles.list}`}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Tasks to complete</p>
          <h4 className={styles.heading}>{tasks.length} tasks</h4>
        </header>

        <div
          className={styles.rows}
          role="tablist"
          aria-orientation="vertical"
          aria-label="Tasks"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); go(index + 1, true); }
            if (e.key === "ArrowUp") { e.preventDefault(); go(index - 1, true); }
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
              className={`${styles.row} ${i === index ? styles.on : ""}`}
              onClick={() => go(i)}
            >
              <span className={styles.badge}>{i + 1}</span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{t.title}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. selected task */}
      <div
        className={`${styles.col} ${styles.detail}`}
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${index}`}
      >
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            Task {index + 1} of {tasks.length}
          </p>
          <h4 className={styles.heading}>{task.title}</h4>
        </header>

        <div className={styles.body}>
          {task.description && <p className={styles.text}>{task.description}</p>}
          {task.instructions && task.instructions.length > 0 && (
            <ol className={styles.steps}>
              {task.instructions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          )}
        </div>

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

      {/* 3. achievements */}
      {achievements.length > 0 && (
        <div className={`${styles.col} ${styles.awards}`}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>Achievements to earn</p>
            <h4 className={styles.heading}>
              {achievements.length === 1 ? "1 achievement" : `${achievements.length} achievements`}
            </h4>
          </header>

          <ul className={styles.awardList}>
            {achievements.map((a) => (
              <li key={a.id} className={styles.award}>
                <span className={styles.medal} aria-hidden="true">★</span>
                <span>
                  <span className={styles.awardTitle}>{a.title}</span>
                  {a.description && <span className={styles.awardDesc}>{a.description}</span>}
                  {a.points ? <span className={styles.points}>+{a.points} points</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
