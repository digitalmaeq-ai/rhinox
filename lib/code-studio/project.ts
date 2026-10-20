// What a saved Python program looks like inside My Projects.
import { getExercise } from "./exercises";

export const MAX_CODE_CHARS = 20_000;

export interface PythonProjectData {
  version: 1;
  /** The exercise this program belongs to, or null for free coding. */
  exerciseId: string | null;
  code: string;
}

export function toProjectData(exerciseId: string | null, code: string): PythonProjectData {
  return { version: 1, exerciseId, code };
}

/** Reads saved data back, rejecting anything that is not the expected shape. */
export function parseProjectData(data: unknown): PythonProjectData | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.version !== 1 || typeof d.code !== "string" || d.code.length > MAX_CODE_CHARS) return null;
  const exerciseId = typeof d.exerciseId === "string" && getExercise(d.exerciseId) ? d.exerciseId : null;
  return { version: 1, exerciseId, code: d.code };
}
