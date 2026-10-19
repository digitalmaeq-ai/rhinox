// Shared types for RhinoBot: Robot Programming Lab. Pure data, no browser code.

export type Dir = 0 | 1 | 2 | 3; // north, east, south, west
export const DIR_NAMES = ["north", "east", "south", "west"] as const;
export const DX = [0, 1, 0, -1] as const;
export const DY = [-1, 0, 1, 0] as const;

export interface Cell {
  x: number;
  y: number;
}

export type Cond =
  | { t: "obstacle" }
  | { t: "clear" }
  | { t: "atGoal" }
  | { t: "itemHere" }
  | { t: "holding" }
  | { t: "atBase" }
  | { t: "and"; a?: Cond; b?: Cond }
  | { t: "or"; a?: Cond; b?: Cond }
  | { t: "not"; a?: Cond };

export type SimpleAction = "forward" | "left" | "right" | "wait" | "pickup" | "drop" | "activate";

export type Stmt =
  | { id?: string; t: SimpleAction }
  | { id?: string; t: "repeat"; n: number; body: Stmt[] }
  | { id?: string; t: "until"; cond?: Cond; body: Stmt[] }
  | { id?: string; t: "if"; cond?: Cond; then: Stmt[]; else?: Stmt[] };

export interface RobotState {
  x: number;
  y: number;
  dir: Dir;
  /** Items still lying on the floor. */
  items: Cell[];
  carrying: boolean;
  picked: number;
  delivered: number;
  charged: boolean;
  moves: number;
}

export interface World {
  columns: number;
  rows: number;
  walls: Cell[];
  start: Cell;
  startDir: Dir;
  goal: Cell | null;
  charger: Cell | null;
  base: Cell;
  items: Cell[];
}

export type ErrorCode =
  | "bump"
  | "missing-condition"
  | "nothing-to-pick"
  | "hands-full"
  | "not-carrying"
  | "drop-blocked"
  | "nothing-to-activate"
  | "too-long"
  | "too-many-moves";

export type RunEvent =
  | { type: "step"; id?: string; action: SimpleAction | "flow"; state: RobotState }
  | { type: "error"; id?: string; code: ErrorCode; message: string; state: RobotState; bump?: Cell }
  | { type: "end"; state: RobotState };

export interface RunLimits {
  /** Maximum evaluation ticks (every block and condition counts). */
  ticks: number;
  /** Maximum number of forward moves. */
  moves: number;
}
