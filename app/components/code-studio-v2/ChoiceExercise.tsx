"use client";

import { useState } from "react";
import type { ChoiceExercise as ChoiceExerciseDefinition } from "@/lib/code-studio-v2/exercise-types";
import { canAttemptExercise, scoreChoiceAttempt } from "@/lib/code-studio-v2/exercise-types";
import styles from "./ChoiceExercise.module.css";

export default function ChoiceExercise({
  exercise,
  onCorrect,
}: {
  exercise: ChoiceExerciseDefinition;
  onCorrect: (points: number) => void;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const exhausted = !canAttemptExercise(attempts, exercise) && result !== "correct";

  function checkAnswer() {
    if (!selectedId || !canAttemptExercise(attempts, exercise)) return;
    const score = scoreChoiceAttempt(selectedId, exercise);
    setAttempts((current) => current + 1);
    setResult(score.correct ? "correct" : "incorrect");
    if (score.correct) onCorrect(score.points);
  }

  return (
    <section className={styles.panel} aria-labelledby={`choice-title-${exercise.id}`}>
      <div className={styles.heading}>
        <span aria-hidden="true">⭐</span>
        <div>
          <h2 id={`choice-title-${exercise.id}`}>{exercise.prompt}</h2>
          <p>{exercise.instructions}</p>
        </div>
      </div>
      <fieldset className={styles.options} disabled={exhausted || result === "correct"}>
        <legend>Choose one answer</legend>
        {exercise.options.map((option, index) => (
          <label className={styles.option} data-selected={selectedId === option.id} key={option.id}>
            <input
              type="radio"
              name={exercise.id}
              value={option.id}
              checked={selectedId === option.id}
              onChange={() => { setSelectedId(option.id); setResult(null); }}
            />
            <span className={styles.optionLetter} aria-hidden="true">{String.fromCharCode(65 + index)}</span>
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.actions}>
        <span>Attempts: {attempts} of {exercise.maxAttempts}</span>
        <button type="button" onClick={checkAnswer} disabled={!selectedId || exhausted || result !== null}>Check answer</button>
      </div>
      {result && (
        <div role="status" aria-live="polite" className={result === "correct" ? styles.success : styles.retry}>
          <strong>{result === "correct" ? "Correct! Well done." : exhausted ? "Let’s review this together." : "Not quite. Try again."}</strong>
          <p>{result === "correct"
            ? `You earned ${scoreChoiceAttempt(selectedId, exercise).points} point. ${exercise.hint}`
            : exhausted ? exercise.fallback : exercise.hint}</p>
        </div>
      )}
      {exhausted && <p className={styles.fallback}>{exercise.fallback}</p>}
      <button type="button" className={styles.hintButton} onClick={() => setShowHint((visible) => !visible)} aria-expanded={showHint}>
        {showHint ? "Hide hint" : "Need a hint?"}
      </button>
      {showHint && <p className={styles.hint}>{exercise.hint}</p>}
    </section>
  );
}
