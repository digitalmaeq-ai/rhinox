// Saves the learner's RhinoBot progress in the browser (localStorage) so scores,
// badges and unfinished programmes survive a page refresh. Nothing leaves the
// device. Every call is guarded: if storage is blocked, the game still works and
// simply forgets when the page closes.

import type { WorkspaceJson } from "./program";
import type { MissionRecord } from "./scoring";

export interface ChallengeStats {
  completed: number;
  bestEfficiency: number;
  seed: number;
  size: "small" | "medium" | "large";
  /** Ids of the random challenges already completed (each counts once). */
  ids: string[];
}

export interface SavedProgress {
  version: 1;
  records: Record<string, MissionRecord>;
  badges: string[];
  workspaces: Record<string, WorkspaceJson>;
  challenge: ChallengeStats;
}

const KEY = "rhinobot-progress";

export const EMPTY_PROGRESS: SavedProgress = {
  version: 1,
  records: {},
  badges: [],
  workspaces: {},
  challenge: { completed: 0, bestEfficiency: 0, seed: 1, size: "small", ids: [] },
};

export function loadProgress(): SavedProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    if (parsed.version !== 1 || typeof parsed.records !== "object" || !Array.isArray(parsed.badges)) return EMPTY_PROGRESS;
    return {
      version: 1,
      records: parsed.records ?? {},
      badges: parsed.badges,
      workspaces: parsed.workspaces ?? {},
      challenge: { ...EMPTY_PROGRESS.challenge, ...(parsed.challenge ?? {}) },
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: SavedProgress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* storage unavailable or full: progress just lasts for this visit */
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
