// Robot Maze Coder — planner. Pure functions, no React.
//
//  - solveShortest(): breadth-first search over (tile, heading, chips taken).
//    It returns the fewest ACTIONS (move / turn) that collect every chip and
//    reach the charger. BFS is optimal here because every action costs 1, and
//    complete because the state space is finite: at most
//    columns x rows x 4 x 2^chips states (13 x 13 x 4 x 8 = about 5,400).
//  - compressActions(): turns a flat action list into the FEWEST BLOCKS using
//    repeat blocks, found with memoised dynamic programming. It is the "par"
//    for generated mazes and the program shown by "Show solution".
//  - generateMaze(): a seeded random maze (recursive backtracker), so the same
//    seed always gives the same maze.

import { parseLevel, runProgram, type Block, type Heading, type MazeLevel } from "./engine";

export type Action = "F" | "L" | "R";

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export interface Solution {
  /** Shortest action sequence, or null if the maze cannot be solved. */
  actions: Action[] | null;
  /** Tiles the robot passes through, start to charger (for the route overlay). */
  route: { x: number; y: number }[];
}

export function solveShortest(level: MazeLevel): Solution {
  const parsed = parseLevel(level);
  const chipBit = new Map<string, number>();
  parsed.chips.forEach((chip, index) => chipBit.set(`${chip.x},${chip.y}`, 1 << index));
  const fullMask = (1 << parsed.chips.length) - 1;

  const key = (x: number, y: number, h: number, mask: number) => (((mask * parsed.rows + y) * parsed.columns + x) * 4 + h);
  const startMask = chipBit.get(`${parsed.start.x},${parsed.start.y}`) ?? 0; // chips never sit on the start, but be safe
  const startKey = key(parsed.start.x, parsed.start.y, level.heading, startMask);

  interface Node { x: number; y: number; h: Heading; mask: number; prev: number; action: Action | null }
  const nodes: Node[] = [{ x: parsed.start.x, y: parsed.start.y, h: level.heading, mask: startMask, prev: -1, action: null }];
  const seen = new Set<number>([startKey]);

  for (let head = 0; head < nodes.length; head += 1) {
    const node = nodes[head];
    if (node.x === parsed.goal.x && node.y === parsed.goal.y && node.mask === fullMask) {
      const actions: Action[] = [];
      const route: { x: number; y: number }[] = [];
      for (let i = head; i >= 0; i = nodes[i].prev) {
        const item = nodes[i];
        if (item.action) actions.push(item.action);
        route.push({ x: item.x, y: item.y });
      }
      actions.reverse();
      route.reverse();
      // Drop repeated tiles from turns on the spot.
      const tiles = route.filter((tile, index) => index === 0 || tile.x !== route[index - 1].x || tile.y !== route[index - 1].y);
      return { actions, route: tiles };
    }

    const options: [Action, number, number, Heading][] = [
      ["L", node.x, node.y, ((node.h + 3) % 4) as Heading],
      ["R", node.x, node.y, ((node.h + 1) % 4) as Heading],
    ];
    const nx = node.x + DX[node.h];
    const ny = node.y + DY[node.h];
    if (parsed.floor[ny]?.[nx]) options.push(["F", nx, ny, node.h]);

    for (const [action, x, y, h] of options) {
      const mask = node.mask | (chipBit.get(`${x},${y}`) ?? 0);
      const k = key(x, y, h, mask);
      if (seen.has(k)) continue;
      seen.add(k);
      nodes.push({ x, y, h, mask, prev: head, action });
    }
  }
  return { actions: null, route: [] };
}

// ---------------------------------------------------------------------------
// Compression into the fewest blocks.
// A repeat block costs 1 + the blocks inside it (the same rule as `par`).
// ---------------------------------------------------------------------------

type Tree = { kind: "A"; action: Action } | { kind: "R"; count: number; body: Tree[] };
interface Packed { cost: number; tree: Tree[] }

const MAX_PATTERN = 9; // longest loop body tried
const memo = new Map<string, Packed>();

function pack(sequence: string): Packed {
  const cached = memo.get(sequence);
  if (cached) return cached;
  const n = sequence.length;
  // best[i]: cheapest encoding of sequence[i..]
  const best: Packed[] = new Array(n + 1);
  best[n] = { cost: 0, tree: [] };
  for (let i = n - 1; i >= 0; i -= 1) {
    let choice: Packed = { cost: 1 + best[i + 1].cost, tree: [{ kind: "A", action: sequence[i] as Action }, ...best[i + 1].tree] };
    for (let length = 1; length <= MAX_PATTERN && i + length * 2 <= n; length += 1) {
      const pattern = sequence.slice(i, i + length);
      let times = 1;
      while (times < 9 && sequence.startsWith(pattern, i + length * times)) times += 1;
      if (times < 2) continue;
      // Body is itself packed (loops inside loops). Try every repeat count that fits.
      const inner = pack(pattern);
      for (let k = 2; k <= times; k += 1) {
        const cost = 1 + inner.cost + best[i + length * k].cost;
        if (cost < choice.cost) choice = { cost, tree: [{ kind: "R", count: k, body: inner.tree }, ...best[i + length * k].tree] };
      }
    }
    best[i] = choice;
  }
  memo.set(sequence, best[0]);
  return best[0];
}

export interface Compressed { blocks: number; tree: Tree[] }

/**
 * Fewest blocks for the given route. Turning on the spot after the robot has
 * reached the charger is harmless, so up to two extra trailing turns are
 * allowed when they let a loop fit better (e.g. repeat 3 x [forward, turn,
 * forward, turn back] ends with one spare turn).
 */
export function compressActions(actions: Action[]): Compressed {
  const base = actions.join("");
  let best: Packed | null = null;
  for (const tail of ["", "L", "R", "LL", "RR", "LR", "RL"]) {
    const packed = pack(base + tail);
    if (!best || packed.cost < best.cost) best = packed;
  }
  const chosen = best ?? pack(base);
  return { blocks: chosen.cost, tree: chosen.tree };
}

/** Turn a compressed tree into editor blocks. `makeId` supplies unique ids. */
export function treeToBlocks(tree: Tree[], makeId: () => string): Block[] {
  return tree.map((item): Block => {
    if (item.kind === "R") return { id: makeId(), kind: "repeat", count: item.count, body: treeToBlocks(item.body, makeId) };
    return { id: makeId(), kind: item.action === "F" ? "forward" : item.action === "L" ? "left" : "right" };
  });
}

// ---------------------------------------------------------------------------
// Seeded maze generation.
//
// A random perfect maze is a poor challenge for a BLOCK coder: its shortest
// route has no pattern, so it needs 40+ blocks. Instead each maze is grown
// backwards from a small random program: a "turtle" runs the program and the
// tiles it crosses become the corridor. So every maze has a pattern a Repeat
// block can capture, and a known-good solution. Dead-end stubs are added
// as decoys, and chips are laid on the corridor.
// ---------------------------------------------------------------------------

export type Difficulty = "easy" | "medium" | "hard";

/**
 * `maxCols` / `maxRows` keep tiles big (the play area is 2:1, so a board with
 * 8 rows gets tiles about 36 px tall). `minPath` / `maxPath` set the length of
 * the route in tiles.
 */
export const DIFFICULTIES: Record<Difficulty, { label: string; maxCols: number; maxRows: number; minPath: number; maxPath: number; chips: number; stubs: number; blurb: string }> = {
  easy: { label: "Easy", maxCols: 10, maxRows: 6, minPath: 8, maxPath: 16, chips: 0, stubs: 2, blurb: "short route, one loop to find" },
  medium: { label: "Medium", maxCols: 13, maxRows: 7, minPath: 14, maxPath: 24, chips: 1, stubs: 3, blurb: "longer route, 1 chip" },
  hard: { label: "Hard", maxCols: 16, maxRows: 8, minPath: 18, maxPath: 32, chips: 2, stubs: 4, blurb: "long route, 2 chips, loops in loops" },
};

/** The play area is twice as wide as it is tall. */
export const ARENA_ASPECT = 2;

/**
 * Share of the play area a board with this many columns and rows fills once it
 * is scaled to fit. At least 0.7 keeps the blocks large.
 */
export function boardCoverage(columns: number, rows: number): number {
  const aspect = columns / rows;
  return Math.min(aspect / ARENA_ASPECT, ARENA_ASPECT / aspect);
}

/** Settings for the "Custom" challenge. */
export type Direction = "right" | "left" | "random";

export interface CustomOptions {
  /** Target number of tiles (blocks) in the route, start to charger. */
  blocks: number;
  chips: number;
  /** "right": starts facing east. "left": mirrored, starts facing west. "random": mirrored and/or flipped top-to-bottom by the seed. */
  direction: Direction;
}

export const CUSTOM_LIMITS = { minBlocks: 8, maxBlocks: 28, maxChips: 3 } as const;
export const DEFAULT_CUSTOM: CustomOptions = { blocks: 16, chips: 1, direction: "right" };

export type Setting = Difficulty | { custom: CustomOptions };

interface Config {
  label: string;
  maxCols: number;
  maxRows: number;
  minPath: number;
  maxPath: number;
  chips: number;
  stubs: number;
  style: Difficulty;
  /** Most blocks the reference solution may need. */
  maxPar: number;
  mirror: "none" | "x" | "random";
}

function configFor(setting: Setting): Config {
  if (typeof setting === "string") {
    const base = DIFFICULTIES[setting];
    return { ...base, style: setting, maxPar: 12, mirror: "none" };
  }
  const { blocks, chips, direction } = setting.custom;
  const target = Math.min(CUSTOM_LIMITS.maxBlocks, Math.max(CUSTOM_LIMITS.minBlocks, Math.round(blocks)));
  return {
    label: "Custom",
    // Longer routes get a slightly bigger board, so tiles stay at least ~30 px tall.
    maxCols: target > 26 ? 20 : 16,
    maxRows: target > 26 ? 9 : 8,
    minPath: target - 1,
    maxPath: target + 1,
    chips: Math.min(CUSTOM_LIMITS.maxChips, Math.max(0, Math.round(chips))),
    stubs: 2 + Math.floor(target / 10),
    style: target <= 14 ? "easy" : target <= 24 ? "medium" : "hard",
    maxPar: 16,
    mirror: direction === "right" ? "none" : direction === "left" ? "x" : "random",
  };
}

/** Small, fast, seedable random numbers (mulberry32). */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GeneratedMaze {
  level: MazeLevel;
  /** Fewest actions (moves and turns) any program needs. */
  optimalActions: number;
  /** Fewest blocks, using repeats: the target for 3 stars. */
  parBlocks: number;
  /** A program that achieves both, for "Show solution". */
  solution: Compressed;
  actions: Action[];
  route: { x: number; y: number }[];
  /** True when the settings could not be met and a plain corridor was used instead. */
  fallback?: boolean;
}

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]] as const;

/** Random pattern program: a run, then a loop of (run, turn) pieces, optionally with an inner loop. */
function randomProgram(random: () => number, difficulty: Difficulty): Action[] {
  const pick = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const turn = (): Action => (random() < 0.5 ? "L" : "R");
  const runOf = (n: number): Action[] => Array.from({ length: n }, () => "F" as const);
  const out: Action[] = [];

  if (random() < 0.7) out.push(...runOf(pick(1, 2)));
  const outerReps = pick(2, difficulty === "easy" ? 3 : 4);
  const body: Action[] = [];
  const pieces = pick(2, difficulty === "easy" ? 2 : 3);
  for (let i = 0; i < pieces; i += 1) {
    if (difficulty === "hard" && random() < 0.5) {
      // inner loop: run of 1 repeated, then a turn
      const inner = pick(2, 3);
      for (let k = 0; k < inner; k += 1) body.push("F");
    } else {
      body.push(...runOf(pick(1, difficulty === "easy" ? 3 : 2)));
    }
    // Alternate turn direction half the time so shapes are stairs, zigzags or spirals.
    body.push(turn());
  }
  for (let i = 0; i < outerReps; i += 1) out.push(...body);
  if (random() < 0.7) out.push(...runOf(pick(1, 3)));
  // Must end on a move so the charger is a tile, not a turn.
  while (out.length > 0 && out[out.length - 1] !== "F") out.pop();
  return out;
}

/**
 * Program for a Custom maze of a requested length. Two shape families, both
 * wide and both pattern-based (so a Repeat block can solve them):
 *  - stairs: runs of forward joined by a turn and its opposite;
 *  - serpentine: back-and-forth passes two rows apart (a loop inside a loop).
 * A prefix/suffix run of forward tops the length up to the exact target.
 */
function targetedProgram(random: () => number, target: number): Action[] {
  const pick = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const forwards = target - 1; // N forward moves make N + 1 tiles
  const runOf = (n: number): Action[] => Array.from({ length: n }, () => "F" as const);
  const prefix = random() < 0.5 ? 0 : pick(1, 2);
  const out: Action[] = [...runOf(prefix)];
  let body: Action[];
  let moves: number;

  if (random() < 0.5) {
    const down = random() < 0.5; // which way the stairs bend
    const a = pick(2, 4);
    const b = pick(1, 2);
    body = [...runOf(a), down ? "R" : "L", ...runOf(b), down ? "L" : "R"];
    moves = a + b;
  } else {
    const n = pick(3, 8);
    const down = random() < 0.5;
    const first: Action = down ? "R" : "L";
    const second: Action = down ? "L" : "R";
    body = [...runOf(n), first, "F", "F", first, ...runOf(n), second, "F", "F", second];
    moves = 2 * n + 4;
  }

  const cycles = Math.max(1, Math.round((forwards - prefix) / moves));
  const rest = forwards - prefix - cycles * moves;
  if (cycles > 9 || rest < 0 || rest > 6) return [];
  for (let i = 0; i < cycles; i += 1) out.push(...body);
  out.push(...runOf(rest));
  while (out.length > 0 && out[out.length - 1] !== "F") out.pop();
  return out;
}

function build(seed: number, setting: Setting, config: Config): GeneratedMaze | null {
  const difficulty = config.style;
  const random = seeded(seed);
  const actions = typeof setting === "string" ? randomProgram(random, difficulty) : targetedProgram(random, Math.round((config.minPath + config.maxPath) / 2));

  // Turtle walk. Start at (0,0) facing east.
  const path: [number, number][] = [[0, 0]];
  const seen = new Set<string>(["0,0"]);
  let x = 0;
  let y = 0;
  let heading = 1;
  for (const action of actions) {
    if (action === "L") heading = (heading + 3) % 4;
    else if (action === "R") heading = (heading + 1) % 4;
    else {
      x += DIRS[heading][0];
      y += DIRS[heading][1];
      if (seen.has(`${x},${y}`)) return null; // path crosses itself
      seen.add(`${x},${y}`);
      path.push([x, y]);
    }
  }
  if (path.length < config.minPath || path.length > config.maxPath) return null;

  // Keep corridors from touching themselves (that would create shortcuts).
  for (let i = 0; i < path.length; i += 1) {
    for (let j = i + 2; j < path.length; j += 1) {
      if (Math.abs(path[i][0] - path[j][0]) + Math.abs(path[i][1] - path[j][1]) === 1) return null;
    }
  }

  // The board is exactly the route's bounding box, so no space is wasted. It
  // must be wide enough to suit the 2:1 play area (>= 70% filled) and small
  // enough in rows/columns that tiles stay big.
  const minX = Math.min(...path.map((p) => p[0]));
  const minY = Math.min(...path.map((p) => p[1]));
  const width = Math.max(...path.map((p) => p[0])) - minX + 1;
  const height = Math.max(...path.map((p) => p[1])) - minY + 1;
  if (width > config.maxCols || height > config.maxRows || boardCoverage(width, height) < 0.7) return null;
  const cells = path.map(([px, py]): [number, number] => [px - minX, py - minY]);

  const grid: string[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => "#"));
  cells.forEach(([cx, cy]) => (grid[cy][cx] = "."));

  // Decoy stubs: short dead ends inside the board, never touching the route elsewhere.
  let placed = 0;
  for (let attempt = 0; attempt < 60 && placed < config.stubs; attempt += 1) {
    const index = 1 + Math.floor(random() * (cells.length - 2));
    const [cx, cy] = cells[index];
    const [dx, dy] = DIRS[Math.floor(random() * 4)];
    const length = 1 + Math.floor(random() * 2);
    const stub: [number, number][] = [];
    let ok = true;
    for (let step = 1; step <= length; step += 1) {
      const sx = cx + dx * step;
      const sy = cy + dy * step;
      if (sx < 0 || sy < 0 || sx > width - 1 || sy > height - 1 || grid[sy][sx] !== "#") { ok = false; break; }
      // Neighbours (other than the cell it grows from) must be void so the stub stays a dead end.
      for (const [ax, ay] of DIRS) {
        const nx = sx + ax;
        const ny = sy + ay;
        const from = step === 1 ? `${cx},${cy}` : `${sx - dx},${sy - dy}`;
        if (`${nx},${ny}` !== from && grid[ny]?.[nx] !== undefined && grid[ny][nx] !== "#") ok = false;
      }
      stub.push([sx, sy]);
    }
    if (!ok || stub.length === 0) continue;
    stub.forEach(([sx, sy]) => (grid[sy][sx] = "."));
    placed += 1;
  }

  // Chips on the corridor (not the start or charger), spread apart.
  const candidates = cells.slice(2, cells.length - 1);
  const chosen: [number, number][] = [];
  for (let i = 0; i < config.chips; i += 1) {
    if (candidates.length === 0) return null;
    const section = Math.floor((candidates.length * (i + 0.5 + random() * 0.5)) / config.chips);
    chosen.push(candidates[Math.min(candidates.length - 1, Math.max(0, section))]);
  }
  if (new Set(chosen.map((c) => c.join(","))).size !== config.chips) return null;

  const [sx, sy] = cells[0];
  const [gx, gy] = cells[cells.length - 1];
  grid[sy][sx] = "S";
  grid[gy][gx] = "G";
  chosen.forEach(([cx, cy]) => (grid[cy][cx] = "c"));

  // Direction: mirror left-to-right (the robot then starts facing west) and/or flip top-to-bottom.
  const mirror = config.mirror === "x" ? true : config.mirror === "random" ? random() < 0.5 : false;
  const flip = config.mirror === "random" ? random() < 0.5 : false;
  let oriented = grid.map((row) => (mirror ? [...row].reverse() : row));
  if (flip) oriented = [...oriented].reverse();

  const draft: MazeLevel = {
    id: `challenge-${typeof setting === "string" ? setting : "custom"}-${seed}`,
    title: "Challenge",
    goal: config.chips > 0 ? "Collect every chip, then reach the charger." : "Reach the charger.",
    hint: "Look for a shape that repeats, then let a Repeat block do the work.",
    map: oriented.map((row) => row.join("")),
    heading: mirror ? 3 : 1,
    allowed: ["forward", "left", "right", "repeat"],
    maxBlocks: 12,
    par: 0,
    points: 0,
  };

  const solved = solveShortest(draft);
  if (!solved.actions || solved.actions.length < 8) return null;
  const solution = compressActions(solved.actions);
  if (solution.blocks > config.maxPar) return null; // keep it a fair puzzle
  // The limit always leaves room for the plain step-by-step route, so a maze can be solved without loops (loops just earn more stars).
  const level: MazeLevel = { ...draft, par: solution.blocks, maxBlocks: Math.max(12, solution.blocks + 4, solved.actions.length) };

  // Self-check: the engine must accept the reference program.
  let counter = 0;
  const check = runProgram(level, treeToBlocks(solution.tree, () => `chk${(counter += 1)}`));
  if (check.outcome !== "success") return null;

  return { level, optimalActions: solved.actions.length, parBlocks: solution.blocks, solution, actions: solved.actions, route: solved.route };
}

export function generateMaze(seed: number, setting: Setting): GeneratedMaze {
  const config = configFor(setting);
  // Most seeds work; for the rest, step to the next seed deterministically.
  for (let attempt = 0; attempt < 3000; attempt += 1) {
    const maze = build(seed * 1000 + attempt, setting, config);
    if (maze) return maze;
  }
  // The settings can be impossible (e.g. a very long route with a tiny board): a plain corridor, flagged.
  const corridor: MazeLevel = {
    id: `challenge-fallback-${seed}`,
    title: "Challenge",
    goal: "Reach the charger.",
    hint: "Use a Repeat block.",
    map: ["########", "S......G", "########"],
    heading: 1,
    allowed: ["forward", "left", "right", "repeat"],
    maxBlocks: 8,
    par: 2,
    points: 0,
  };
  const solved = solveShortest(corridor);
  const actions = solved.actions ?? [];
  const solution = compressActions(actions);
  return { level: corridor, optimalActions: actions.length, parBlocks: solution.blocks, solution, actions, route: solved.route, fallback: true };
}
