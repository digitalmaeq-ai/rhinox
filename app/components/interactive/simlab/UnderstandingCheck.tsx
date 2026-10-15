"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getExperienceHref, getExperienceSequence } from "@/lib/experience-sequence";
import type { ContentItem } from "@/lib/content";
import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";
import type { InteractiveRuntimeActions } from "@/types/interactive-runtime-renderer";
import type { InteractiveRuntimeState } from "@/types/interactive-runtime-state";
import type { QuizQuestion } from "@/types/quizzes";

import styles from "./SimLab.module.css";

type Recommendation = {
  item: ContentItem;
  reason: string;
};

// Picks the next experiment from the library, by how the learner did:
//   80%+   the next one up the difficulty order
//   50-79% a different experiment in the same subject
//   under 50% an easier one in the same subject, to build the basics
function recommend(
  current: InteractiveExperienceDefinition,
  percent: number,
): Recommendation | null {
  const sequence = getExperienceSequence().filter(
    (item) => item.contentType === "experience" && item.slug !== current.slug,
  );
  if (sequence.length === 0) return null;

  const all = getExperienceSequence();
  const position = all.findIndex((item) => item.slug === current.slug);
  const subjects = new Set<string>(current.subjects ?? []);
  const sameSubject = (item: ContentItem) =>
    (item.subjects ?? []).some((subject) => subject && subjects.has(subject));

  const after = position >= 0 ? all.slice(position + 1) : all;
  const before = position >= 0 ? all.slice(0, position).reverse() : [];
  const live = (item: ContentItem) =>
    item.contentType === "experience" && item.slug !== current.slug;

  if (percent >= 80) {
    const next = after.find(live) ?? sequence[0];
    return { item: next, reason: "You've got this one. Here's the next step up." };
  }

  if (percent >= 50) {
    const match = [...after, ...before].find((item) => live(item) && sameSubject(item));
    if (match) return { item: match, reason: "More of the same subject will lock in what you've learned." };
    const next = after.find(live) ?? sequence[0];
    return { item: next, reason: "A fresh experiment to practise the same skills." };
  }

  const easier = before.find((item) => live(item) && sameSubject(item)) ?? before.find(live);
  if (easier) return { item: easier, reason: "An easier one to build up the basics first." };
  const next = after.find(live) ?? sequence[0];
  return { item: next, reason: "A good one to try while this topic settles." };
}

function verdict(percent: number) {
  if (percent === 100) return "Perfect score";
  if (percent >= 80) return "Excellent work";
  if (percent >= 60) return "Good effort";
  if (percent >= 40) return "Getting there";
  return "Keep practising";
}

export default function UnderstandingCheck({
  experience,
  questions,
  runtimeState,
  actions,
  onWatchTour,
}: {
  experience: InteractiveExperienceDefinition;
  questions: QuizQuestion[];
  runtimeState: InteractiveRuntimeState;
  actions: InteractiveRuntimeActions;
  onWatchTour: () => void;
}) {
  const total = questions.length;

  // Resume where the learner left off if they leave this view and return.
  const [index, setIndex] = useState(() => {
    const firstOpen = questions.findIndex(
      (question) => !runtimeState.submittedQuestions.includes(question.id),
    );
    return firstOpen === -1 ? total : firstOpen;
  });
  const [showReview, setShowReview] = useState(false);

  const score = questions.filter(
    (question) => runtimeState.answers[question.id] === question.correctAnswer,
  ).length;
  const percent = total ? Math.round((score / total) * 100) : 0;

  const finished = index >= total;
  const recommendation = useMemo(
    () => (finished ? recommend(experience, percent) : null),
    [finished, experience, percent],
  );

  if (total === 0) return null;

  if (finished) {
    return (
      <div className={styles.results} role="status">
        <div className={styles.scoreRing} aria-hidden="true">
          <strong>{score}</strong>
          <span>of {total}</span>
        </div>
        <h4>
          {verdict(percent)}: {score} out of {total} ({percent}%)
        </h4>
        <p className={styles.resultsText}>
          {percent >= 80
            ? "You understand this experiment well."
            : percent >= 50
              ? "You have the main ideas. Review the ones you missed below."
              : "This one is tricky. Try the Cinematic tour, then take the check again."}
        </p>

        {recommendation && (
          <div className={styles.recommend}>
            <span>Recommended next</span>
            <strong>{recommendation.item.title}</strong>
            <p>{recommendation.reason}</p>
            <Link
              href={getExperienceHref(recommendation.item)}
              className="rx-button rx-button-primary"
            >
              Start this experiment
            </Link>
          </div>
        )}

        <div className={styles.resultsActions}>
          <button
            type="button"
            className={`rx-button rx-button-secondary ${styles.headerButton}`}
            onClick={() => setShowReview((value) => !value)}
            aria-expanded={showReview}
          >
            {showReview ? "Hide my answers" : "Review my answers"}
          </button>
          {percent < 80 && (
            <button
              type="button"
              className={`rx-button rx-button-secondary ${styles.headerButton}`}
              onClick={onWatchTour}
            >
              Watch the Cinematic tour
            </button>
          )}
        </div>

        {showReview && (
          <ol className={styles.review}>
            {questions.map((question) => {
              const chosen = runtimeState.answers[question.id];
              const right = chosen === question.correctAnswer;
              const chosenText = question.options?.find((o) => o.id === chosen)?.text;
              const rightText = question.options?.find(
                (o) => o.id === question.correctAnswer,
              )?.text;
              return (
                <li key={question.id} className={right ? styles.reviewRight : styles.reviewWrong}>
                  <p className={styles.questionText}>{question.question}</p>
                  <p>
                    <strong>{right ? "Correct: " : "Your answer: "}</strong>
                    {chosenText}
                  </p>
                  {!right && (
                    <p>
                      <strong>Right answer: </strong>
                      {rightText}
                    </p>
                  )}
                  <p className={styles.reviewWhy}>{question.explanation}</p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  const question = questions[index];
  const answered = runtimeState.submittedQuestions.includes(question.id);
  const chosen = runtimeState.answers[question.id];
  const correct = chosen === question.correctAnswer;
  const isLast = index === total - 1;

  return (
    <div className={styles.oneQuestion}>
      <div className={styles.qProgress}>
        <span>
          Question {index + 1} of {total}
        </span>
        <div className={styles.qTrack} aria-hidden="true">
          <i style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </div>

      <p className={styles.questionText}>{question.question}</p>

      <div className={styles.options}>
        {question.options?.map((option) => {
          const isChosen = chosen === option.id;
          const isRight = option.id === question.correctAnswer;
          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() =>
                actions.submitQuestion(
                  question.id,
                  option.id,
                  question.points ?? 0,
                  option.id === question.correctAnswer,
                )
              }
              className={`${styles.option} ${answered && isRight ? styles.optionRight : ""} ${
                answered && isChosen && !isRight ? styles.optionWrong : ""
              }`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <p
            className={`${styles.explain} ${correct ? styles.explainRight : styles.explainWrong}`}
            role="status"
          >
            <strong>{correct ? "Correct. " : "Not quite. "}</strong>
            {question.explanation}
          </p>
          <button
            type="button"
            className="rx-button rx-button-primary"
            onClick={() => setIndex(index + 1)}
          >
            {isLast ? "See my score" : "Next question"}
          </button>
        </>
      )}
    </div>
  );
}
