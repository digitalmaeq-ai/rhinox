"use client";

import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";
import type { InteractiveRuntimeState } from "@/types/interactive-runtime-state";

import styles from "./ProgressStrip.module.css";

/**
 * A slim live scoreboard attached under the activity: tasks done so far,
 * points counted, and achievements unlocked. Only what has been achieved is
 * listed, so it grows as the learner plays and never competes with the
 * activity itself.
 */
export default function ProgressStrip({
  experience,
  runtimeState,
}: {
  experience: InteractiveExperienceDefinition;
  runtimeState: InteractiveRuntimeState;
}) {
  const tasks = experience.tasks ?? [];
  if (tasks.length === 0) return null;

  const doneIds = runtimeState.completedTasks;
  const done = doneIds
    .map((id) => tasks.find((task) => task.id === id))
    .filter((task): task is NonNullable<typeof task> => Boolean(task));
  const unlocked = (experience.achievements ?? []).filter((a) =>
    runtimeState.achievementsUnlocked.includes(a.id),
  );
  const percent = Math.round((done.length / tasks.length) * 100);
  const points = runtimeState.points;

  return (
    <section className={styles.strip} aria-label="Your progress">
      <div className={styles.top}>
        <span className={styles.label}>Progress</span>
        <span className={styles.count}>
          <strong>{done.length}</strong> / {tasks.length} tasks
        </span>
        <span
          className={styles.bar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={tasks.length}
          aria-valuenow={done.length}
          aria-label="Tasks completed"
        >
          <span style={{ width: `${percent}%` }} />
        </span>
        <span className={styles.score} aria-label={`${points} points`}>
          <span aria-hidden="true">★</span> <strong>{points}</strong> pts
        </span>
      </div>

      <ul className={styles.chips} aria-live="polite">
        {done.length === 0 && unlocked.length === 0 && (
          <li className={styles.hint}>Tasks you complete in the activity appear here.</li>
        )}
        {done.map((task) => (
          <li key={task.id} className={styles.done}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
            {task.title}
            {task.points ? <em>+{task.points}</em> : null}
          </li>
        ))}
        {unlocked.map((award) => (
          <li key={award.id} className={styles.award}>
            <span aria-hidden="true">★</span>
            {award.title}
            {award.points ? <em>+{award.points}</em> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
