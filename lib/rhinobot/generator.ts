// Random challenge generator for RhinoBot. Every challenge is solvable (checked
// with a breadth-first search) and has a known best route, so efficiency can be
// measured honestly: your moves against the shortest possible route.
// The same seed always gives the same map, so a challenge can be shared.

import { PLAYGROUND, type Mission } from "./missions";
import { ACTIVATE, DROP, F, L, PICK, R } from "./program";
import type { Cell, Dir, Stmt } from "./types";
import { DX, DY } from "./types";

export type ChallengeSize = "small" | "medium" | "large";

export const CHALLENGE_SIZES: Record<ChallengeSize, { columns: number; rows: number; items: number; density: number; label: string }> = {
  small: { columns: 6, rows: 5, items: 1, density: 0.2, label: "Small" },
  medium: { columns: 8, rows: 6, items: 2, density: 0.24, label: "Medium" },
  large: { columns: 10, rows: 7, items: 2, density: 0.28, label: "Large" },
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const key = (x: number, y: number) => `${x},${y}`;

function distances(columns: number, rows: number, walls: Set<string>, from: Cell) {
  const dist = new Map<string, number>([[key(from.x, from.y), 0]]);
  const queue: Cell[] = [from];
  for (let head = 0; head < queue.length; head += 1) {
    const cell = queue[head];
    const d = dist.get(key(cell.x, cell.y))!;
    for (let dir = 0; dir < 4; dir += 1) {
      const nx = cell.x + DX[dir];
      const ny = cell.y + DY[dir];
      if (nx < 0 || ny < 0 || nx >= columns || ny >= rows || walls.has(key(nx, ny)) || dist.has(key(nx, ny))) continue;
      dist.set(key(nx, ny), d + 1);
      queue.push({ x: nx, y: ny });
    }
  }
  return dist;
}

function permutations<T>(list: T[]): T[][] {
  if (list.length <= 1) return [list];
  return list.flatMap((item, index) => permutations([...list.slice(0, index), ...list.slice(index + 1)]).map((rest) => [item, ...rest]));
}

export interface Challenge {
  mission: Mission;
  optimalMoves: number;
  seed: number;
  size: ChallengeSize;
}

function build(seed: number, size: ChallengeSize): Challenge | null {
  const spec = CHALLENGE_SIZES[size];
  const random = mulberry32(seed);
  const { columns, rows } = spec;
  const start: Cell = { x: 0, y: Math.floor(random() * rows) };
  const goal: Cell = { x: columns - 1, y: Math.floor(random() * rows) };
  const taken = new Set([key(start.x, start.y), key(goal.x, goal.y)]);

  const walls = new Set<string>();
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      if (!taken.has(key(x, y)) && random() < spec.density) walls.add(key(x, y));
    }
  }

  const items: Cell[] = [];
  for (let tries = 0; tries < 60 && items.length < spec.items; tries += 1) {
    const cell = { x: 1 + Math.floor(random() * (columns - 2)), y: Math.floor(random() * rows) };
    const k = key(cell.x, cell.y);
    if (taken.has(k) || walls.has(k)) continue;
    taken.add(k);
    items.push(cell);
  }
  if (items.length < spec.items) return null;

  const fromStart = distances(columns, rows, walls, start);
  if (!fromStart.has(key(goal.x, goal.y)) || items.some((item) => !fromStart.has(key(item.x, item.y)))) return null;

  // Shortest tour: fetch each item to the base (start), then go to the goal.
  const distFrom = new Map<string, Map<string, number>>();
  [start, goal, ...items].forEach((cell) => distFrom.set(key(cell.x, cell.y), distances(columns, rows, walls, cell)));
  const d = (a: Cell, b: Cell) => distFrom.get(key(a.x, a.y))!.get(key(b.x, b.y))!;
  let best = Infinity;
  for (const order of permutations(items)) {
    let total = 0;
    for (const item of order) total += d(start, item) + d(item, start);
    total += d(start, goal);
    best = Math.min(best, total);
  }

  const startDir = Math.floor(random() * 4) as Dir;
  const lines: string[] = [];
  for (let y = 0; y < rows; y += 1) {
    let line = "";
    for (let x = 0; x < columns; x += 1) {
      if (x === start.x && y === start.y) line += "R";
      else if (x === goal.x && y === goal.y) line += "G";
      else if (items.some((item) => item.x === x && item.y === y)) line += "*";
      else line += walls.has(key(x, y)) ? "#" : ".";
    }
    lines.push(line);
  }

  const mission: Mission = {
    id: `challenge-${size}-${seed}`,
    number: 0,
    title: `Random challenge #${seed}`,
    concept: "Find the most efficient route",
    learningObjective: "Plan a route, then make it as short as you can.",
    briefing: `Fetch ${items.length === 1 ? "the item" : "both items"} and drop ${items.length === 1 ? "it" : "them"} at the base (where RhinoBot starts), then reach the goal flag. The shortest possible route is ${best} moves: how close can you get?`,
    map: `\n${lines.join("\n")}`,
    startDir,
    objectives: ["deliver", "goal"],
    blocks: PLAYGROUND.blocks,
    solution: [],
    hints: [],
    successMessage: "Challenge complete!",
    advanced: "",
    prediction: { question: "", options: [], answer: 0, explain: "" },
    debug: { brief: "", buggy: [], fixTip: "" },
  };
  return { mission, optimalMoves: best, seed, size };
}

export function makeChallenge(seed: number, size: ChallengeSize): Challenge {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const made = build(seed * 1000 + attempt, size);
    if (made) return { ...made, seed, mission: { ...made.mission, id: `challenge-${size}-${seed}`, title: `Random challenge #${seed}` } };
  }
  throw new Error("Could not build a challenge");
}

export function efficiencyPercent(optimal: number, moves: number) {
  return moves <= 0 ? 0 : Math.min(100, Math.round((optimal / moves) * 100));
}

// A programme that follows the best route. Used by tests (and proves every
// challenge can be solved with the blocks on offer).
export function routeProgramme(challenge: Challenge, blocks: Mission["blocks"] = []): Stmt[] {
  void blocks;
  void ACTIVATE;
  const mission = challenge.mission;
  const lines = mission.map.split("\n").filter(Boolean);
  const columns = lines[0].length;
  const rows = lines.length;
  const walls = new Set<string>();
  let start: Cell = { x: 0, y: 0 };
  let goal: Cell = { x: 0, y: 0 };
  const items: Cell[] = [];
  lines.forEach((line, y) => [...line].forEach((ch, x) => {
    if (ch === "#") walls.add(key(x, y));
    if (ch === "R") start = { x, y };
    if (ch === "G") goal = { x, y };
    if (ch === "*") items.push({ x, y });
  }));

  const path = (from: Cell, to: Cell): Cell[] => {
    const prev = new Map<string, Cell | null>([[key(from.x, from.y), null]]);
    const queue: Cell[] = [from];
    for (let head = 0; head < queue.length; head += 1) {
      const cell = queue[head];
      if (cell.x === to.x && cell.y === to.y) break;
      for (let dir = 0; dir < 4; dir += 1) {
        const nx = cell.x + DX[dir];
        const ny = cell.y + DY[dir];
        if (nx < 0 || ny < 0 || nx >= columns || ny >= rows || walls.has(key(nx, ny)) || prev.has(key(nx, ny))) continue;
        prev.set(key(nx, ny), cell);
        queue.push({ x: nx, y: ny });
      }
    }
    const cells: Cell[] = [];
    for (let at: Cell | null | undefined = to; at; at = prev.get(key(at.x, at.y))) cells.unshift(at);
    return cells;
  };

  const program: Stmt[] = [];
  let at = start;
  let facing = mission.startDir;
  const walk = (to: Cell) => {
    const cells = path(at, to);
    for (let i = 1; i < cells.length; i += 1) {
      const dx = cells[i].x - cells[i - 1].x;
      const dy = cells[i].y - cells[i - 1].y;
      const want = DX.findIndex((value, dir) => value === dx && DY[dir] === dy) as Dir;
      const turn = (want - facing + 4) % 4;
      if (turn === 1) program.push(R());
      else if (turn === 3) program.push(L());
      else if (turn === 2) program.push(R(), R());
      facing = want;
      program.push(F());
    }
    at = to;
  };

  // Choose the best item order by trying every order.
  const orders = permutations(items);
  let bestOrder = items;
  let bestCost = Infinity;
  for (const order of orders) {
    let cost = 0;
    let here = start;
    for (const item of order) {
      cost += path(here, item).length - 1 + path(item, start).length - 1;
      here = start;
    }
    cost += path(start, goal).length - 1;
    if (cost < bestCost) {
      bestCost = cost;
      bestOrder = order;
    }
  }
  for (const item of bestOrder) {
    walk(item);
    program.push(PICK());
    walk(start);
    program.push(DROP());
  }
  walk(goal);
  return program;
}
