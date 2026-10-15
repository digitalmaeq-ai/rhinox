"use client";

import { useMemo, useState } from "react";
import type { QuizContent, QuizQuestion } from "@/types/quizzes";

interface QuizPlayerProps {
  quiz: QuizContent;
}

/**
 * Creates a deterministic numeric value from a string.
 * This allows us to shuffle quiz questions without using
 * Math.random() during React rendering.
 */
function stringSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash =
      (hash << 5) -
      hash +
      value.charCodeAt(index);

    hash |= 0;
  }

  return Math.abs(hash);
}

/**
 * Deterministic shuffle.
 *
 * Unlike Math.random(), this function always produces
 * the same result for the same seed and source array.
 */
function shuffleQuestions(
  questions: QuizQuestion[],
  seed: string
) {
  const source = [...questions];
  let value = stringSeed(seed);

  for (let index = source.length - 1; index > 0; index -= 1) {
    value =
      (value * 1664525 + 1013904223) >>> 0;

    const target = value % (index + 1);

    [source[index], source[target]] = [
      source[target],
      source[index],
    ];
  }

  return source;
}

export default function QuizPlayer({
  quiz,
}: QuizPlayerProps) {
  const questions = useMemo(() => {
    if (!quiz.shuffleQuestions) {
      return [...quiz.questions];
    }

    /*
     * Use the quiz content itself as the seed.
     * This keeps rendering pure while still giving
     * shuffled question ordering.
     */
    const seed = quiz.questions
      .map((question) => question.id)
      .join("|");

    return shuffleQuestions(
      quiz.questions,
      seed
    );
  }, [quiz.questions, quiz.shuffleQuestions]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState<
    Record<string, string | string[]>
  >({});

  const [submitted, setSubmitted] =
    useState(false);

  const question = questions[currentQuestion];

  const totalPoints = questions.reduce(
    (total, item) =>
      total + (item.points ?? 1),
    0
  );

  function setAnswer(
    questionId: string,
    answer: string | string[]
  ) {
    if (submitted) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  }

  function toggleMultipleAnswer(
    questionId: string,
    optionId: string
  ) {
    if (submitted) {
      return;
    }

    const currentAnswer =
      answers[questionId];

    const selected = Array.isArray(
      currentAnswer
    )
      ? currentAnswer
      : [];

    const nextAnswer = selected.includes(
      optionId
    )
      ? selected.filter(
          (id) => id !== optionId
        )
      : [...selected, optionId];

    setAnswer(
      questionId,
      nextAnswer
    );
  }

  function isCorrect(
    item: QuizQuestion
  ) {
    const answer = answers[item.id];

    if (
      answer === undefined ||
      item.correctAnswer === undefined
    ) {
      return false;
    }

    if (
      Array.isArray(item.correctAnswer)
    ) {
      if (!Array.isArray(answer)) {
        return false;
      }

      return (
        answer.length ===
          item.correctAnswer.length &&
        [...answer].sort().join("|") ===
          [...item.correctAnswer]
            .sort()
            .join("|")
      );
    }

    if (Array.isArray(answer)) {
      return false;
    }

    return answer === item.correctAnswer;
  }

  function calculateScore() {
    return questions.reduce(
      (score, item) => {
        return (
          score +
          (isCorrect(item)
            ? item.points ?? 1
            : 0)
        );
      },
      0
    );
  }

  function calculatePercentage() {
    if (totalPoints === 0) {
      return 0;
    }

    return Math.round(
      (calculateScore() / totalPoints) *
        100
    );
  }

  function submitQuiz() {
    setSubmitted(true);
    setCurrentQuestion(0);
  }

  function restartQuiz() {
    setAnswers({});
    setSubmitted(false);
    setCurrentQuestion(0);
  }

  function nextQuestion() {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (value) => value + 1
      );
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (value) => value - 1
      );
    }
  }

  if (submitted) {
    const percentage =
      calculatePercentage();

    const passed =
      quiz.passingScore === undefined ||
      percentage >= quiz.passingScore;

    return (
      <div className="rx-quiz-result">
        <p className="rx-eyebrow">
          QUIZ COMPLETE
        </p>

        <h2>
          {passed
            ? "Well done!"
            : "Keep practising!"}
        </h2>

        <div className="rx-quiz-score">
          <strong>
            {percentage}%
          </strong>

          <span>
            {calculateScore()} /{" "}
            {totalPoints} points
          </span>
        </div>

        {quiz.passingScore !==
          undefined && (
          <p>
            Passing score:{" "}
            {quiz.passingScore}%
          </p>
        )}

        <button
          type="button"
          className="rx-button rx-button-primary"
          onClick={restartQuiz}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const selectedAnswer =
    answers[question.id];

  return (
    <div className="rx-quiz-player">
      <div className="rx-quiz-progress">
        <span>
          Question{" "}
          {currentQuestion + 1} of{" "}
          {questions.length}
        </span>

        <span>
          {question.points ?? 1}{" "}
          {(question.points ?? 1) === 1
            ? "point"
            : "points"}
        </span>
      </div>

      <div className="rx-quiz-question">
        <h3>
          {question.question}
        </h3>

        {question.type ===
          "multiple-choice" && (
          <div className="rx-quiz-options">
            {question.options?.map(
              (option) => {
                const selected =
                  selectedAnswer ===
                  option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`rx-quiz-option ${
                      selected
                        ? "rx-quiz-option-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setAnswer(
                        question.id,
                        option.id
                      )
                    }
                  >
                    <span className="rx-quiz-option-marker">
                      {selected
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      {option.text}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        )}

        {question.type ===
          "multiple-select" && (
          <div className="rx-quiz-options">
            {question.options?.map(
              (option) => {
                const selected =
                  Array.isArray(
                    selectedAnswer
                  ) &&
                  selectedAnswer.includes(
                    option.id
                  );

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`rx-quiz-option ${
                      selected
                        ? "rx-quiz-option-selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleMultipleAnswer(
                        question.id,
                        option.id
                      )
                    }
                  >
                    <span className="rx-quiz-option-marker">
                      {selected
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      {option.text}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        )}

        {question.type ===
          "true-false" && (
          <div className="rx-quiz-options">
            {["true", "false"].map(
              (value) => {
                const selected =
                  selectedAnswer ===
                  value;

                return (
                  <button
                    key={value}
                    type="button"
                    className={`rx-quiz-option ${
                      selected
                        ? "rx-quiz-option-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setAnswer(
                        question.id,
                        value
                      )
                    }
                  >
                    <span className="rx-quiz-option-marker">
                      {selected
                        ? "✓"
                        : ""}
                    </span>

                    <span>
                      {value === "true"
                        ? "True"
                        : "False"}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        )}

        {question.type ===
          "short-answer" && (
          <input
            type="text"
            value={
              typeof selectedAnswer ===
              "string"
                ? selectedAnswer
                : ""
            }
            onChange={(event) =>
              setAnswer(
                question.id,
                event.target.value
              )
            }
            placeholder="Type your answer..."
            className="rx-quiz-text-input"
          />
        )}

        {question.type ===
          "matching" && (
          <div className="rx-quiz-matching">
            <p>
              Matching questions will be
              supported by the expanded
              quiz interaction layer.
            </p>
          </div>
        )}
      </div>

      <div className="rx-quiz-navigation">
        <button
          type="button"
          className="rx-button rx-button-outline"
          onClick={previousQuestion}
          disabled={
            currentQuestion === 0
          }
        >
          Previous
        </button>

        {currentQuestion <
        questions.length - 1 ? (
          <button
            type="button"
            className="rx-button rx-button-primary"
            onClick={nextQuestion}
          >
            Next Question
          </button>
        ) : (
          <button
            type="button"
            className="rx-button rx-button-primary"
            onClick={submitQuiz}
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}