import { TUNING } from "./tuning";

// Pure game rules for RhinoBot STEM Adventure: energy, crystals, checkpoints,
// the bridge challenge and scoring. No Phaser in here, so it is fully
// unit-testable. The Phaser scene calls these and renders the result.

export type Status = "playing" | "won";

export interface AdventureState {
  health: number;
  crystals: string[];
  checkpointId: string | null;
  challengeSolved: boolean;
  /** Wrong answers given before the right one. */
  challengeMistakes: number;
  /** Times all energy was lost and RhinoBot was returned to a checkpoint. */
  deaths: number;
  elapsedMs: number;
  status: Status;
}

export function createState(): AdventureState {
  return {
    health: TUNING.maxHealth,
    crystals: [],
    checkpointId: null,
    challengeSolved: false,
    challengeMistakes: 0,
    deaths: 0,
    elapsedMs: 0,
    status: "playing",
  };
}

export function collectCrystal(state: AdventureState, id: string): AdventureState {
  if (state.crystals.includes(id)) return state;
  return { ...state, crystals: [...state.crystals, id] };
}

export function activateCheckpoint(state: AdventureState, id: string): AdventureState {
  if (state.checkpointId === id) return state;
  return { ...state, checkpointId: id };
}

export interface HitResult { state: AdventureState; respawn: boolean }

/** Lose one energy cell. At zero, energy refills and RhinoBot returns to the last checkpoint. */
export function loseEnergy(state: AdventureState): HitResult {
  const health = state.health - 1;
  if (health <= 0) {
    return { state: { ...state, health: TUNING.maxHealth, deaths: state.deaths + 1 }, respawn: true };
  }
  return { state: { ...state, health }, respawn: false };
}

export function answerChallenge(state: AdventureState, correct: boolean): AdventureState {
  if (state.challengeSolved) return state;
  if (correct) return { ...state, challengeSolved: true };
  return { ...state, challengeMistakes: state.challengeMistakes + 1 };
}

export function canFinish(state: AdventureState, crystalsNeeded: number): boolean {
  return state.crystals.length >= crystalsNeeded && state.challengeSolved;
}

export function finish(state: AdventureState): AdventureState {
  return { ...state, status: "won" };
}

export interface ScoreSummary {
  crystalPoints: number;
  challengePoints: number;
  energyPoints: number;
  total: number;
  stars: 1 | 2 | 3;
}

/** Transparent scoring: every point comes from something the player did. */
export function scoreFor(state: AdventureState): ScoreSummary {
  const crystalPoints = state.crystals.length * 100;
  const challengePoints = !state.challengeSolved ? 0 : state.challengeMistakes === 0 ? 150 : state.challengeMistakes === 1 ? 100 : 60;
  const energyPoints = state.health * 50;
  let stars: 1 | 2 | 3 = 1;
  if (state.challengeSolved && state.challengeMistakes === 0) stars = 2;
  if (stars === 2 && state.deaths === 0) stars = 3;
  return { crystalPoints, challengePoints, energyPoints, total: crystalPoints + challengePoints + energyPoints, stars };
}

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
