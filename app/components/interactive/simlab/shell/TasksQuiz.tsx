"use client";

import type { InteractiveExperienceDefinition, InteractiveExperienceTask } from "@/types/interactive-experiences";
import type { InteractiveRuntimeActions } from "@/types/interactive-runtime-renderer";
import type { InteractiveRuntimeState } from "@/types/interactive-runtime-state";
import type { QuizQuestion } from "@/types/quizzes";

import UnderstandingCheck from "../UnderstandingCheck";
import styles from "./shell.module.css";

type Props = {
  experience: InteractiveExperienceDefinition;
  tasks: InteractiveExperienceTask[];
  completedTasks: string[];
  points: number;
  requiredDone: boolean;
  questions: QuizQuestion[];
  runtimeState: InteractiveRuntimeState;
  actions: InteractiveRuntimeActions;
  onWatchTour: () => void;
  checkKey: number;
};

// The task list and the unlockable question set, the same in every lab.
export default function TasksQuiz({ experience, tasks, completedTasks, points, requiredDone, questions, runtimeState, actions, onWatchTour, checkKey }: Props) {
  const doneCount = completedTasks.filter((id) => tasks.some((t) => t.id === id)).length;
  const answered = runtimeState.submittedQuestions.filter((id) => questions.some((q) => q.id === id)).length;
  return (
    <div className={styles.split}>
      <div className={styles.taskCol}>
      <div className={styles.rowHead}>
        <h3 className={styles.h3}>Tasks</h3>
        <span className={styles.small}>{doneCount} of {tasks.length} · {points} pts</span>
      </div>
      <ul className={styles.tasks}>
        {tasks.map((task) => {
          const done = completedTasks.includes(task.id);
          return (
            <li key={task.id} className={done ? styles.taskDone : ""}>
              <span className={styles.tick} aria-hidden="true">{done ? "✓" : ""}</span>
              <div>
                <strong>{task.title}</strong>
                {task.required === false && <span className={styles.opt}>optional</span>}
                <p>{task.description}</p>
              </div>
              <span className={styles.srOnly}>{done ? "Completed" : "Not completed yet"}</span>
            </li>
          );
        })}
      </ul>
      </div>
      <div className={styles.quiz}>
        <div className={styles.quizHead}>
          <h3>Check your understanding</h3>
          <span>{answered} of {questions.length}</span>
        </div>
        <div className={styles.quizBody}>
          {!requiredDone ? (
            <p className={styles.locked}>Finish the tasks to unlock the questions.</p>
          ) : (
            <UnderstandingCheck key={checkKey} experience={experience} questions={questions} runtimeState={runtimeState} actions={actions} onWatchTour={onWatchTour} />
          )}
        </div>
      </div>
    </div>
  );
}
