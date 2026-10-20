"use client";

import type { CheckReport } from "@/lib/code-studio/check-runner";
import { EXERCISES, type Exercise } from "@/lib/code-studio/exercises";

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

// The left column: pick an exercise, read the task, ask for hints, check the answer.
export default function ExercisePanel({ exercise, completed, hintsShown, report, checking, busy, onSelect, onShowHint, onCheck }: Props) {
  const firstFailure = report?.cases.find((c) => !c.passed);
  const passedCount = report?.cases.filter((c) => c.passed).length ?? 0;

  return (
    <aside className={styles.side} aria-label="Exercises">
      <nav aria-label="Choose an exercise">
        <ol className={styles.exerciseList}>
          {EXERCISES.map((item, index) => {
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
