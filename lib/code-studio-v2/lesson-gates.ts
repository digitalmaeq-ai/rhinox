/**
 * Shared lesson eligibility and progression rules.
 * A curriculum row alone does not qualify as a runnable exercise.
 */
import { getLessonSpec } from "./lesson-specs";

export function isReviewedInteractiveLesson(activityId: string): boolean {
  return getLessonSpec(activityId)?.status === "reviewed";
}

/**
 * Core parts are separated by plus signs or commas in the master curriculum.
 * "Build" is required only when it appears as a complete part, not inside a word.
 */
export function isBuildRequired(coreParts: string): boolean {
  return /(^|[+,]\s*)build(\s|$|[+,])/i.test(coreParts);
}
