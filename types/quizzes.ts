import type { BaseContent } from "./content";

export type QuizQuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "true-false"
  | "short-answer"
  | "matching";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizMatchingPair {
  left: string;
  right: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;

  question: string;

  options?: QuizOption[];

  matchingPairs?: QuizMatchingPair[];

  correctAnswer?: string | string[];

  explanation?: string;

  points?: number;
}

export interface QuizContent extends BaseContent {
  contentType: "quiz";

  instructions?: string;

  questions: QuizQuestion[];

  passingScore?: number;

  attemptsAllowed?: number;

  shuffleQuestions?: boolean;

  shuffleOptions?: boolean;

  showExplanations?: boolean;

  timeLimitMinutes?: number;

}