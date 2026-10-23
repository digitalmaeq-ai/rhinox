export type LessonProgressStep = "think" | "move" | "code" | "build" | "create" | "check";

/** How the adult observation for the weekly check was recorded. */
export type TeacherObservation = "confirmed" | "deferred";

export interface LessonProgressEvidence {
  movePracticed?: boolean;
  orderingCorrect?: boolean;
  /** Attempts were used up and a teacher or caregiver helped the learner finish. Never a pass. */
  orderingAssisted?: boolean;
  buildRequired?: boolean;
  buildChoiceSelected?: boolean;
  creationCompleted?: boolean;
  /** Optional extra practice. It never gates progress and is not the official check. */
  choicePassed?: boolean;
  /** The curriculum check is adult observation. "deferred" means it still has to happen. */
  teacherObservation?: TeacherObservation;
}

/**
 * Returns whether the learner can move on from the current stage. Every stage
 * has a way forward, but only independent success is ever recorded as a pass.
 * Learner or adult confirmation is not camera, sensor or automated verification.
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
      return evidence.orderingCorrect === true || evidence.orderingAssisted === true;
    case "build":
      return evidence.buildRequired === false || evidence.buildChoiceSelected === true;
    case "create":
      return evidence.creationCompleted === true;
    case "check":
      return evidence.teacherObservation === "confirmed" || evidence.teacherObservation === "deferred";
  }
}

export type SequenceOutcome = "passed" | "completed-with-assistance" | "not-completed";
export type CheckOutcome = "adult-confirmed" | "awaiting-teacher-confirmation" | "not-completed";
export type OverallOutcome = "passed" | "completed-with-assistance" | "awaiting-teacher-confirmation" | "not-completed";

export interface LessonOutcome {
  /** Picture-card ordering, scored automatically by the app. */
  sequence: SequenceOutcome;
  /** Movement and drawing are the learner's own confirmation, not verified. */
  selfReportedParts: "learner-confirmed" | "not-completed";
  /** The curriculum check: adult observation, recorded by whoever used the page. */
  check: CheckOutcome;
  /** Optional extra practice, shown separately and never counted as the check. */
  extraPractice: "passed" | "not-passed";
  overall: OverallOutcome;
}

/**
 * Builds one honest summary of what happened. Assistance never becomes a pass,
 * a postponed teacher check never becomes confirmation, and extra practice
 * never stands in for the curriculum's observation check.
 */
export function describeLessonOutcome(evidence: LessonProgressEvidence): LessonOutcome {
  const sequence: SequenceOutcome = evidence.orderingCorrect === true
    ? "passed"
    : evidence.orderingAssisted === true ? "completed-with-assistance" : "not-completed";
  const selfReportedParts = evidence.movePracticed === true && evidence.creationCompleted === true
    ? "learner-confirmed"
    : "not-completed";
  const check: CheckOutcome = evidence.teacherObservation === "confirmed"
    ? "adult-confirmed"
    : evidence.teacherObservation === "deferred" ? "awaiting-teacher-confirmation" : "not-completed";
  const extraPractice = evidence.choicePassed === true ? "passed" : "not-passed";

  let overall: OverallOutcome;
  if (sequence === "not-completed" || selfReportedParts === "not-completed" || check === "not-completed") {
    overall = "not-completed";
  } else if (check === "awaiting-teacher-confirmation") {
    overall = "awaiting-teacher-confirmation";
  } else if (sequence === "completed-with-assistance") {
    overall = "completed-with-assistance";
  } else {
    overall = "passed";
  }
  return { sequence, selfReportedParts, check, extraPractice, overall };
}
