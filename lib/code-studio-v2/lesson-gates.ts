/**
 * Small, deterministic lesson eligibility rules shared by the UI and regression tests.
 * A curriculum row alone does not qualify as a reviewed interactive lesson.
 */
const REVIEWED_INTERACTIVE_LESSON_IDS = new Set(["tmc-v3-15-nursery-1-t1-w1"]);

export function isReviewedInteractiveLesson(activityId: string): boolean {
  return REVIEWED_INTERACTIVE_LESSON_IDS.has(activityId);
}

/**
 * Core parts are separated by plus signs or commas in the master curriculum.
 * "Build" is required only when it appears as a complete part, not inside a word.
 */
export function isBuildRequired(coreParts: string): boolean {
  return /(^|[+,]\s*)build(\s|$|[+,])/i.test(coreParts);
}
