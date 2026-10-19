import type { ChargerSound } from "@/app/components/interactive/shared/chargerSounds";
import type { LevelData } from "@/lib/rhinobot-adventure/levels";
import type { AdventureState } from "@/lib/rhinobot-adventure/state";

// Contract between the React shell and the Phaser scene. This file has no
// Phaser import, so the shell can import it without loading the engine.

/** Mutable input shared with the scene. React writes it; the scene reads it each frame. */
export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export type GameEvent =
  | { type: "state"; state: AdventureState }
  | { type: "sfx"; name: ChargerSound }
  | { type: "announce"; message: string }
  | { type: "challenge"; challengeId: string }
  | { type: "station-locked"; have: number; need: number }
  | { type: "won"; state: AdventureState };

export interface GameOptions {
  level: LevelData;
  input: InputState;
  reducedMotion: boolean;
  /** Hold the first frame until the learner presses Start. */
  startPaused?: boolean;
  emit: (event: GameEvent) => void;
}

export interface GameController {
  setPaused: (paused: boolean) => void;
  /** The learner answered the gate challenge. Correct answers power the bridge. */
  resolveChallenge: (correct: boolean) => void;
  /** The learner closed the challenge without solving it. */
  dismissChallenge: () => void;
  restart: () => void;
  destroy: () => void;
}
