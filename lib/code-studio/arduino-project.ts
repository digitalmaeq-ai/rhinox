// What a saved Arduino sketch looks like inside My Projects.
import type { BoardId } from "./arduino";
import { getArduinoExercise } from "./exercises-arduino";

export const ARDUINO_MAX_SAVED_CODE = 20_000;

export interface ArduinoProjectData {
  version: 1;
  /** The exercise this sketch belongs to, or null for free coding. */
  exerciseId: string | null;
  code: string;
  /** Which board the sketch is for. Sketches saved before the ESP32 existed have none, and mean the Uno. */
  board: BoardId;
}

export function toArduinoProjectData(exerciseId: string | null, code: string, board: BoardId = "uno"): ArduinoProjectData {
  return { version: 1, exerciseId, code, board };
}

/** Reads saved data back, rejecting anything that is not the expected shape. */
export function parseArduinoProjectData(data: unknown): ArduinoProjectData | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.version !== 1 || typeof d.code !== "string" || d.code.length > ARDUINO_MAX_SAVED_CODE) return null;
  const exerciseId = typeof d.exerciseId === "string" && getArduinoExercise(d.exerciseId) ? d.exerciseId : null;
  const board: BoardId = d.board === "esp32" ? "esp32" : "uno";
  return { version: 1, exerciseId, code: d.code, board: exerciseId ? (getArduinoExercise(exerciseId)?.board ?? board) : board };
}
