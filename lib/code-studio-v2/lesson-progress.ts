export type LessonProgressStep = "think" | "move" | "code" | "build" | "create" | "check";

export interface LessonProgressEvidence {
  movePracticed?: boolean;
  orderingCorrect?: boolean;
  buildRequired?: boolean;
  buildChoiceSelected?: boolean;
  creationCompleted?: boolean;
  choicePassed?: boolean;
}

/**
 * Returns whether the learner has supplied the evidence required to advance
 * from the current stage. Learner-confirmed evidence is explicitly not treated
 * as camera, teacher, or automated observation.
 */
export function canAdvanceLessonStep(
  step: LessonProgressStep,
  evidence: LessonProgressEvidence,
): boolean {
  switch (step) {
    case "think":
      return true;
    case "move":
      return evidence.movePracticed === true;
    case "code":
      return evidence.orderingCorrect === true;
    case "build":
      return evidence.buildRequired === false || evidence.buildChoiceSelected === true;
    case "create":
      return evidence.creationCompleted === true;
    case "check":
      return evidence.choicePassed === true;
  }
}
