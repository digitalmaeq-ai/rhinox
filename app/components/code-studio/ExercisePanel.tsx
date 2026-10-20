"use client";

import { useState } from "react";

import type { CheckReport } from "@/lib/code-studio/check-runner";
import { EXERCISES, type Exercise, type ExerciseGroup } from "@/lib/code-studio/exercises";

import styles from "./CodeStudio.module.css";

type Props = {
  /** The selected exercise, or null for free coding. */
  exercise: Exercise | null;
  completed: string[];
  hintsShown: number;
  report: CheckReport | null;
  checking: boolean;
  busy: boolean;
  onSelect: (id: string | null) => void;
  onShowHint: () => void;
  onCheck: () => void;
};

const GROUPS: { name: ExerciseGroup; label: string }[] = [
  { name: "Starter", label: "Starter exercises" },
  { name: "Year 7", label: "Year 7: Python with Nka's robot" },
  { name: "Year 8", label: "Year 8: Python with Echiche" },
  { name: "Year 9", label: "Year 9: Python with Ogbon" },
  { name: "micro:bit", label: "micro:bit: build and test on the board" },
];

// The left column: pick an exercise, read the task, ask for hints, check the answer.
export default function ExercisePanel({ exercise, completed, hintsShown, report, checking, busy, onSelect, onShowHint, onCheck }: Props) {
  const firstFailure = report?.cases.find((c) => !c.passed);
  const passedCount = report?.cases.filter((c) => c.passed).length ?? 0;
  // Only the group of the chosen exercise starts open; the learner can open the others.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isOpen = (group: ExerciseGroup) => toggled[group] ?? exercise?.group === group;

  return (
    <aside className={styles.side} aria-label="Exercises">
      <nav aria-label="Choose an exercise" className={styles.exerciseNav} tabIndex={0}>
        {GROUPS.map(({ name, label }) => {
          const items = EXERCISES.filter((item) => item.group === name);
          const doneCount = items.filter((item) => completed.includes(item.id)).length;
          const open = isOpen(name);
          return (
            <section key={name} className={styles.group}>
              <h2 className={styles.groupHeading}>
                <button
                  type="button"
                  className={styles.groupToggle}
                  aria-expanded={open}
                  aria-controls={`group-${name.replace(/\s+/g, "-")}`}
                  onClick={() => setToggled((previous) => ({ ...previous, [name]: !open }))}
                >
                  <span>{label}</span>
                  <span className={styles.groupCount}>
                    {doneCount} of {items.length} done
                  </span>
                </button>
              </h2>
              {open && (
                <ol className={styles.exerciseList} id={`group-${name.replace(/\s+/g, "-")}`}>
                  {items.map((item, index) => {
                    const done = completed.includes(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={styles.exerciseButton}
                          aria-current={exercise?.id === item.id ? "step" : undefined}
                          onClick={() => onSelect(item.id)}
                          disabled={checking}
                        >
                          <span className={styles.exerciseNumber} data-done={done || undefined}>
                            {done ? "✓" : index + 1}
                          </span>
                          <span className={styles.exerciseTitle}>
                            {item.title}
                            {done && <span className={styles.srOnly}> (completed)</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
        <ol className={styles.exerciseList}>
          <li>
            <button
              type="button"
              className={styles.exerciseButton}
              aria-current={exercise === null ? "step" : undefined}
              onClick={() => onSelect(null)}
              disabled={checking}
            >
              <span className={styles.exerciseNumber}>{"</>"}</span>
              <span className={styles.exerciseTitle}>Free coding</span>
            </button>
          </li>
        </ol>
      </nav>

      {exercise ? (
        <section className={styles.task} aria-labelledby="task-title">
          {exercise.lesson && (
            <p className={styles.lessonTag}>
              {exercise.group}, {exercise.lesson}
            </p>
          )}
          <h2 id="task-title">{exercise.title}</h2>
          {exercise.instructions.map((line) => (
            <p key={line}>{line}</p>
          ))}

          {exercise.hints.slice(0, hintsShown).map((hint, index) => (
            <p key={hint} className={styles.hint}>
              <strong>Hint {index + 1}:</strong> {hint}
            </p>
          ))}

          <div className={styles.taskActions}>
            <button type="button" className={styles.checkButton} onClick={onCheck} disabled={busy || checking}>
              {checking ? "Checking…" : "Check my answer"}
            </button>
            {hintsShown < exercise.hints.length && (
              <button type="button" onClick={onShowHint} disabled={checking}>
                {hintsShown === 0 ? "Show a hint" : "Another hint"}
              </button>
            )}
          </div>

          <div aria-live="polite" className={styles.report}>
            {report?.passed && (
              <p className={styles.pass}>
                <strong>Well done!</strong> Your program passed all {report.cases.length} check{report.cases.length === 1 ? "" : "s"}.
              </p>
            )}
            {report && !report.passed && (
              <div className={styles.fail}>
                <p>
                  <strong>
                    Not quite yet{report.incomplete ? "" : ` (${passedCount} of ${report.cases.length} checks passed)`}.
                  </strong>
                </p>
                {firstFailure && (
                  <>
                    <p>
                      {firstFailure.label}
                      {firstFailure.stdin.length > 0 && <> (typed: {firstFailure.stdin.join(", ")})</>}
                    </p>
                    <p>{firstFailure.message}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className={styles.task} aria-labelledby="task-title">
          <h2 id="task-title">Free coding</h2>
          <p>Write any Python program you like and press Run. Save it to My Projects to keep it.</p>
          <p>Python here is the standard library only: no downloads, and no internet access from your program.</p>
        </section>
      )}
    </aside>
  );
}
