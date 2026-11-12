/**
 * Writes one finished step into this browser's saved Learning Path progress. Device only: nothing is
 * sent anywhere. If the browser blocks storage the result says so and nothing breaks.
 */
import { progressStorageKey, recordStepDone } from "./progress";

export type SaveResult = "saved" | "unchanged" | "blocked";

export function saveStepDone(levelSlug: string, stepId: string): SaveResult {
  try {
    const key = progressStorageKey(levelSlug);
    const next = recordStepDone(window.localStorage.getItem(key), stepId);
    if (next === null) return "unchanged";
    window.localStorage.setItem(key, next);
    return "saved";
  } catch {
    return "blocked";
  }
}
