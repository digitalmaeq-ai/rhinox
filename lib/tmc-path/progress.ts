/**
 * Learning Path progress: pure rules for what is remembered on the adult's own device.
 *
 * What is stored: a version number and the ids of steps an adult marked done, for example
 * "tmc-n1-t1-w1:play". Nothing else: no name, age, account, device id, time or score.
 * A step is "done" only because an adult marked it. The games and quizzes do not report back.
 *
 * No file, network, storage or React access here: the page reads and writes the browser's storage
 * and passes the text in and out. Keep this file free of runtime imports so scripts can load it with
 * node --experimental-strip-types.
 */
import type { PathView, PathViewStop } from "./view";

/** The browser-storage key for one level's path. The "v1" is the format version. Each level has its own key. */
export function progressStorageKey(levelSlug: string): string {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(levelSlug)) throw new Error(`Invalid level slug: ${levelSlug}`);
  return `tmc.learning-path.${levelSlug}.v1`;
}
/** Nursery 1's key, kept exactly as first released so saved progress is not lost. */
export const PROGRESS_STORAGE_KEY = progressStorageKey("nursery-1");
export const PROGRESS_FORMAT_VERSION = 1;
/** Far above the 156 real steps; stops a damaged or tampered value from growing without limit. */
export const MAX_STORED_STEPS = 500;
const MAX_STORED_CHARS = 20_000;

export type DoneSteps = ReadonlySet<string>;

/** Reads stored text. Anything unexpected gives an empty set, never an error; unknown ids are dropped. */
export function parseProgress(raw: string | null | undefined, validIds: ReadonlySet<string>): Set<string> {
  const done = new Set<string>();
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_STORED_CHARS) return done;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return done;
  }
  if (typeof value !== "object" || value === null) return done;
  const record = value as { v?: unknown; done?: unknown };
  if (record.v !== PROGRESS_FORMAT_VERSION || !Array.isArray(record.done)) return done;
  for (const id of record.done.slice(0, MAX_STORED_STEPS)) {
    if (typeof id === "string" && validIds.has(id)) done.add(id);
  }
  return done;
}

/** The text to store: the format version and the sorted ids, nothing else. */
export function serializeProgress(done: DoneSteps): string {
  return JSON.stringify({ v: PROGRESS_FORMAT_VERSION, done: [...done].sort() });
}

/** Marks a step done or not done. An id that is not on the path changes nothing. */
export function toggleStep(done: DoneSteps, id: string, validIds: ReadonlySet<string>): Set<string> {
  const next = new Set(done);
  if (!validIds.has(id)) return next;
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export interface StopProgress {
  done: number;
  total: number;
  complete: boolean;
}

export function stopProgress(stop: PathViewStop, done: DoneSteps): StopProgress {
  const total = stop.steps.length;
  const count = stop.steps.filter((step) => done.has(step.id)).length;
  return { done: count, total, complete: total > 0 && count === total };
}

export interface PathSummary {
  stepsDone: number;
  stepsTotal: number;
  weeksComplete: number;
  weeksTotal: number;
}

export function summarize(view: PathView, done: DoneSteps): PathSummary {
  let stepsDone = 0;
  let stepsTotal = 0;
  let weeksComplete = 0;
  for (const stop of view.stops) {
    const progress = stopProgress(stop, done);
    stepsDone += progress.done;
    stepsTotal += progress.total;
    if (progress.complete) weeksComplete += 1;
  }
  return { stepsDone, stepsTotal, weeksComplete, weeksTotal: view.stops.length };
}

/** The first step, in book order, that is not done yet. A suggestion only: nothing is locked. */
export function nextUp(view: PathView, done: DoneSteps): { stopId: string; stepId: string } | null {
  for (const stop of view.stops) {
    for (const step of stop.steps) {
      if (!done.has(step.id)) return { stopId: stop.id, stepId: step.id };
    }
  }
  return null;
}
