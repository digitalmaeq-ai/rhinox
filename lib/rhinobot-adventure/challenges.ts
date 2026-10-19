// Educational challenges for RhinoBot STEM Adventure.
//
// This file is the ONLY place questions live. The game engine only knows a
// challenge id (set on a level's gate), so new topics, difficulty levels or
// whole worlds can be added here without touching any engine code.

export type ChallengeKind = "arithmetic" | "circuit";

export interface Challenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  /** Short story line shown above the question. */
  scene: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  /** Shown after a wrong answer. */
  hint: string;
  /** Shown after the right answer. */
  explanation: string;
  curriculum: { subject: string; topic: string; ageGroup: string };
}

export const CHALLENGES: Record<string, Challenge> = {
  "bridge-batteries": {
    id: "bridge-batteries",
    kind: "arithmetic",
    title: "Power the bridge",
    scene: "The bridge generator is locked. It needs exactly 48 units of energy to unfold.",
    prompt: "Each battery gives 6 units of energy. How many batteries does RhinoBot need?",
    options: ["6", "7", "8", "9"],
    correctIndex: 2,
    hint: "Think of sharing 48 into groups of 6. Which number times 6 makes 48?",
    explanation: "8 × 6 = 48, so 48 ÷ 6 = 8 batteries. Division is multiplication run backwards.",
    curriculum: { subject: "Mathematics", topic: "Multiplication and division facts", ageGroup: "8-9" },
  },
};

export function getChallenge(id: string): Challenge | undefined {
  return CHALLENGES[id];
}

export function isCorrect(challenge: Challenge, optionIndex: number): boolean {
  return optionIndex === challenge.correctIndex;
}
