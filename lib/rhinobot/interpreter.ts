// A small, safe interpreter for RhinoBot programmes. It walks the programme
// tree directly (no eval, no generated JavaScript) and yields one event per
// block so the screen can animate, pause, step and highlight. Hard limits stop
// endless loops.

import type { Cell, Cond, Dir, ErrorCode, RobotState, RunEvent, RunLimits, SimpleAction, Stmt, World } from "./types";
import { DX, DY } from "./types";

export const DEFAULT_LIMITS: RunLimits = { ticks: 1500, moves: 150 };

export function initialState(world: World): RobotState {
  return {
    x: world.start.x,
    y: world.start.y,
    dir: world.startDir,
    items: world.items.map((item) => ({ ...item })),
    carrying: false,
    picked: 0,
    delivered: 0,
    charged: false,
    moves: 0,
  };
}

function cloneState(state: RobotState): RobotState {
  return { ...state, items: state.items.map((item) => ({ ...item })) };
}

class RunError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public id?: string,
    public bump?: Cell,
  ) {
    super(message);
  }
}

const same = (a: Cell, b: Cell | null) => Boolean(b) && a.x === b!.x && a.y === b!.y;

function blocked(world: World, x: number, y: number) {
  return x < 0 || y < 0 || x >= world.columns || y >= world.rows || world.walls.some((wall) => wall.x === x && wall.y === y);
}

export function evalCond(cond: Cond | undefined, state: RobotState, world: World, id?: string): boolean {
  if (!cond) {
    throw new RunError("missing-condition", "An empty condition slot was found. Fill every condition with a sensor block.", id);
  }
  switch (cond.t) {
    case "obstacle":
      return blocked(world, state.x + DX[state.dir], state.y + DY[state.dir]);
    case "clear":
      return !blocked(world, state.x + DX[state.dir], state.y + DY[state.dir]);
    case "atGoal":
      return same(state, world.goal) || same(state, world.charger);
    case "itemHere":
      return state.items.some((item) => same(state, item));
    case "holding":
      return state.carrying;
    case "atBase":
      return same(state, world.base);
    case "and":
      return evalCond(cond.a, state, world, id) && evalCond(cond.b, state, world, id);
    case "or":
      return evalCond(cond.a, state, world, id) || evalCond(cond.b, state, world, id);
    case "not":
      return !evalCond(cond.a, state, world, id);
  }
}

export function* execute(
  world: World,
  program: Stmt[],
  limits: RunLimits = DEFAULT_LIMITS,
): Generator<RunEvent, void, undefined> {
  const state = initialState(world);
  let ticks = 0;

  function tick(id?: string) {
    ticks += 1;
    if (ticks > limits.ticks) {
      throw new RunError("too-long", "Your programme ran for too long. Check that every loop has a way to finish.", id);
    }
  }

  function* block(list: Stmt[]): Generator<RunEvent, void, undefined> {
    for (const stmt of list) {
      yield* run(stmt);
    }
  }

  function* run(stmt: Stmt): Generator<RunEvent, void, undefined> {
    tick(stmt.id);
    switch (stmt.t) {
      case "repeat": {
        yield { type: "step", id: stmt.id, action: "flow", state: cloneState(state) };
        const times = Math.max(0, Math.min(99, Math.floor(stmt.n)));
        for (let i = 0; i < times; i += 1) {
          yield* block(stmt.body);
          tick(stmt.id);
        }
        return;
      }
      case "until": {
        for (;;) {
          yield { type: "step", id: stmt.id, action: "flow", state: cloneState(state) };
          if (evalCond(stmt.cond, state, world, stmt.id)) return;
          if (stmt.body.length === 0) tick(stmt.id);
          yield* block(stmt.body);
          tick(stmt.id);
        }
      }
      case "if": {
        yield { type: "step", id: stmt.id, action: "flow", state: cloneState(state) };
        if (evalCond(stmt.cond, state, world, stmt.id)) {
          yield* block(stmt.then);
        } else if (stmt.else) {
          yield* block(stmt.else);
        }
        return;
      }
      default:
        yield* simple(stmt.t, stmt.id);
    }
  }

  function* simple(action: SimpleAction, id?: string): Generator<RunEvent, void, undefined> {
    switch (action) {
      case "forward": {
        const nx = state.x + DX[state.dir];
        const ny = state.y + DY[state.dir];
        if (blocked(world, nx, ny)) {
          throw new RunError("bump", "RhinoBot bumped into an obstacle or the edge of the grid.", id, { x: nx, y: ny });
        }
        state.moves += 1;
        if (state.moves > limits.moves) {
          throw new RunError("too-many-moves", "RhinoBot moved too many times. Look for a loop that never stops.", id);
        }
        state.x = nx;
        state.y = ny;
        break;
      }
      case "left":
        state.dir = ((state.dir + 3) % 4) as Dir;
        break;
      case "right":
        state.dir = ((state.dir + 1) % 4) as Dir;
        break;
      case "wait":
        break;
      case "pickup": {
        if (state.carrying) throw new RunError("hands-full", "RhinoBot is already carrying an item. Drop it first.", id);
        const index = state.items.findIndex((item) => same(state, item));
        if (index < 0) throw new RunError("nothing-to-pick", "There is nothing to pick up on this square.", id);
        state.items.splice(index, 1);
        state.carrying = true;
        state.picked += 1;
        break;
      }
      case "drop": {
        if (!state.carrying) throw new RunError("not-carrying", "RhinoBot is not carrying anything to drop.", id);
        if (same(state, world.base)) {
          state.delivered += 1;
        } else {
          if (state.items.some((item) => same(state, item))) {
            throw new RunError("drop-blocked", "There is already an item on this square.", id);
          }
          state.items.push({ x: state.x, y: state.y });
        }
        state.carrying = false;
        break;
      }
      case "activate": {
        if (!same(state, world.charger)) {
          throw new RunError("nothing-to-activate", "There is nothing to activate here. Move to the charging station first.", id);
        }
        state.charged = true;
        break;
      }
    }
    yield { type: "step", id, action, state: cloneState(state) };
  }

  try {
    yield* block(program);
    yield { type: "end", state: cloneState(state) };
  } catch (error) {
    if (error instanceof RunError) {
      yield { type: "error", id: error.id, code: error.code, message: error.message, state: cloneState(state), bump: error.bump };
      return;
    }
    throw error;
  }
}
