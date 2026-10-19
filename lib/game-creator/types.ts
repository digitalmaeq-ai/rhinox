// The Game Creator's project format. A game is plain data (levels and a list
// of rules), so it can be saved in My Projects, edited by the learner, and
// later moved to an account database without changing the engine.

export type Tile =
  | "floor" | "wall" | "start" | "goal" | "coin" | "hazard"
  | "key" | "door" | "enemy-h" | "enemy-v";

export const TILE_CHARS: Record<Tile, string> = {
  floor: ".",
  wall: "#",
  start: "S",
  goal: "G",
  coin: "c",
  hazard: "x",
  key: "k",
  door: "D",
  "enemy-h": "e",
  "enemy-v": "v",
};

export const CHAR_TILES: Record<string, Tile> = Object.fromEntries(
  Object.entries(TILE_CHARS).map(([tile, char]) => [char, tile as Tile]),
);

export type GameEvent = "touch-coin" | "touch-hazard" | "touch-enemy" | "reach-goal";

export const GAME_EVENTS: GameEvent[] = ["touch-coin", "touch-hazard", "touch-enemy", "reach-goal"];

export type GameAction =
  | { type: "add-points"; amount: number }
  | { type: "lose-life" }
  | { type: "go-to-start" }
  | { type: "win" };

/** "When <when> happens, do <do>" (only if <requires> is true). */
export interface Rule {
  when: GameEvent;
  /** Optional condition: every coin in the level has been collected. */
  requires?: "all-coins";
  do: GameAction;
}

export interface GameProject {
  /** Version 1 had a single `tiles` list; it is read and upgraded on load. */
  version: 2;
  template: "maze-escape";
  title: string;
  /** Every level has the same size. */
  cols: number;
  rows: number;
  /** One list of rows per level; one character per tile (see TILE_CHARS). */
  levels: string[][];
  lives: number;
  rules: Rule[];
}

export type Direction = "up" | "down" | "left" | "right";

export type GameStatus = "playing" | "won" | "lost";

export interface Enemy {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface GameState {
  level: number;
  x: number;
  y: number;
  /** Coins and keys already picked up in this level, as "x,y". */
  collected: string[];
  /** A key opens every door in the level. */
  hasKey: boolean;
  enemies: Enemy[];
  score: number;
  lives: number;
  moves: number;
  status: GameStatus;
  /** A short line for the player, such as "Collect every coin first!". */
  message: string;
}

export const GRID_SIZES = {
  small: { cols: 8, rows: 6, label: "Small (8 × 6)" },
  medium: { cols: 12, rows: 8, label: "Medium (12 × 8)" },
  large: { cols: 16, rows: 10, label: "Large (16 × 10)" },
} as const;

export const MAX_TITLE = 40;
export const MAX_LIVES = 5;
export const MAX_LEVELS = 5;
