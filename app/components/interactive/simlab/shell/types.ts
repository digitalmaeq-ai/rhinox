import type { Difficulty } from "./cbt";

/** A calculation problem a lab can pose, with its working and typical wrong answers. */
export type CalcProblem = {
  id: string;
  kind: string;
  difficulty: Difficulty;
  prompt: string;
  answer: number;
  unit: string;
  working: string[];
  /** Typical wrong answers (inverted ratio, forgotten division …). */
  wrong: number[];
};

export type CalcKindOption = { id: string; label: string };
