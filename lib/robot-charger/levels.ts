// Levels and rules for "Code the Robot: Reach the Charger".
// Maps are drawn as text so they are easy to read and edit:
//   R robot start   C charger   # rock   * bolt (bonus)   . empty floor
// Row 0 is the top row. Every level was checked with the solver below.

export type Direction = "up" | "right" | "down" | "left";

export interface Command {
  dir: Direction;
  times: number;
}

export interface Cell {
  x: number;
  y: number;
}

export interface ChargerLevel {
  number: number;
  title: string;
  intro: string;
  map: string;
  /** Longest program (in command blocks) the robot can store. */
  maxCommands: number;
  /** Total squares the robot can drive before the battery is flat. */
  energy: number;
  /** Biggest repeat count offered (1 = no repeat blocks yet). */
  maxTimes: number;
}

export const DIRECTION_INFO: Record<Direction, { label: string; dx: number; dy: number; arrow: string }> = {
  up: { label: "Up", dx: 0, dy: -1, arrow: "↑" },
  right: { label: "Right", dx: 1, dy: 0, arrow: "→" },
  down: { label: "Down", dx: 0, dy: 1, arrow: "↓" },
  left: { label: "Left", dx: -1, dy: 0, arrow: "←" },
};

export const DIRECTION_ORDER: Direction[] = ["up", "right", "down", "left"];

export const CHARGER_LEVELS: ChargerLevel[] = [
  {
    number: 1,
    title: "First steps",
    intro: "Tap arrows to build a program, then press Run. Reach the charger!",
    map: `
.....
.....
R...C`,
    maxCommands: 8,
    energy: 8,
    maxTimes: 1,
  },
  {
    number: 2,
    title: "Around the rocks",
    intro: "Rocks block the way. Plan a path around them.",
    map: `
....C
.##..
.....
R....`,
    maxCommands: 10,
    energy: 11,
    maxTimes: 1,
  },
  {
    number: 3,
    title: "Grab a bolt",
    intro: "Collect the bolt on your way for a bonus star.",
    map: `
..#.C
....#
.#*..
R....`,
    maxCommands: 10,
    energy: 11,
    maxTimes: 1,
  },
  {
    number: 4,
    title: "Two bolts",
    intro: "Two bolts this time. Find a route that picks up both.",
    map: `
...#..C
.#.#.#.
.#*..*.
.#.##..
R...#..`,
    maxCommands: 14,
    energy: 14,
    maxTimes: 1,
  },
  {
    number: 5,
    title: "Repeat blocks",
    intro: "New! Choose ×2 or ×3 before an arrow to repeat it. The program can only hold 5 blocks.",
    map: `
......C
.......
.......
R......`,
    maxCommands: 5,
    energy: 12,
    maxTimes: 3,
  },
  {
    number: 6,
    title: "Zig-zag lane",
    intro: "Use repeats to keep your program short. Watch the battery!",
    map: `
R.#....
..#.##.
.##..*.
...#.#.
.#...#C`,
    maxCommands: 10,
    energy: 18,
    maxTimes: 3,
  },
  {
    number: 7,
    title: "Bolt maze",
    intro: "Three bolts hide in this maze. Can you collect them all?",
    map: `
#...#..C
..#.*#.#
.##.#...
...*.#..
.#.##.#.
R....*..`,
    maxCommands: 18,
    energy: 30,
    maxTimes: 3,
  },
  {
    number: 8,
    title: "Long corridors",
    intro: "Repeat up to ×4 now. Short programs earn more stars.",
    map: `
..#...*.C
.*#.###.#
.##.#...#
...*#.#*.
.###..#..
R...###..`,
    maxCommands: 14,
    energy: 29,
    maxTimes: 4,
  },
  {
    number: 9,
    title: "Power plant",
    intro: "A big plant with four bolts. Plan before you run.",
    map: `
R...#...*
.##.#.#..
...*..#.#
.#.##.#..
.#....#.#
.####.#*.
...*....C`,
    maxCommands: 16,
    energy: 32,
    maxTimes: 4,
  },
  {
    number: 10,
    title: "Grand charge",
    intro: "The final challenge: five bolts, tight battery, one charger.",
    map: `
R.#....*.C
..#.##.#..
.*..#..#.#
##.##.##..
...*.#..#.
.#.#.#.#..
.#...*.#.*
.####.....`,
    maxCommands: 18,
    energy: 31,
    maxTimes: 4,
  },
];

export interface ParsedLevel {
  columns: number;
  rows: number;
  start: Cell;
  charger: Cell;
  rocks: Cell[];
  bolts: Cell[];
}

const parsed = new Map<number, ParsedLevel>();

export function parseLevel(level: ChargerLevel): ParsedLevel {
  const cached = parsed.get(level.number);
  if (cached) return cached;
  const lines = level.map.split("\n").filter((line) => line.length > 0);
  const result: ParsedLevel = {
    columns: lines[0]?.length ?? 0,
    rows: lines.length,
    start: { x: 0, y: 0 },
    charger: { x: 0, y: 0 },
    rocks: [],
    bolts: [],
  };
  lines.forEach((line, y) => {
    [...line].forEach((char, x) => {
      if (char === "R") result.start = { x, y };
      else if (char === "C") result.charger = { x, y };
      else if (char === "#") result.rocks.push({ x, y });
      else if (char === "*") result.bolts.push({ x, y });
    });
  });
  parsed.set(level.number, result);
  return result;
}

export interface SimStep extends Cell {
  /** Index of the command block this unit move belongs to. */
  command: number;
  kind: "move" | "bump" | "flat";
  /** Index in `bolts` collected on this move, or -1. */
  bolt: number;
}

export type Outcome = "success" | "blocked" | "flat" | "short";

export interface SimResult {
  steps: SimStep[];
  end: Cell;
  outcome: Outcome;
  boltsCollected: number[];
  /** The square the robot tried to drive into when it bumped. */
  bumpedInto: Cell | null;
}

// Works out the whole run up front; the screen just replays it.
export function simulate(level: ChargerLevel, program: Command[]): SimResult {
  const map = parseLevel(level);
  const rockKey = new Set(map.rocks.map((rock) => `${rock.x},${rock.y}`));
  const boltIndex = new Map(map.bolts.map((bolt, index) => [`${bolt.x},${bolt.y}`, index]));
  const collected = new Set<number>();
  const steps: SimStep[] = [];
  let at: Cell = { ...map.start };
  let energy = level.energy;
  let outcome: Outcome | null = null;
  let bumpedInto: Cell | null = null;

  outer: for (let c = 0; c < program.length; c += 1) {
    const info = DIRECTION_INFO[program[c].dir];
    for (let i = 0; i < program[c].times; i += 1) {
      const next = { x: at.x + info.dx, y: at.y + info.dy };
      const outside = next.x < 0 || next.y < 0 || next.x >= map.columns || next.y >= map.rows;
      if (outside || rockKey.has(`${next.x},${next.y}`)) {
        steps.push({ ...at, command: c, kind: "bump", bolt: -1 });
        bumpedInto = next;
        outcome = "blocked";
        break outer;
      }
      if (energy <= 0) {
        steps.push({ ...at, command: c, kind: "flat", bolt: -1 });
        outcome = "flat";
        break outer;
      }
      energy -= 1;
      at = next;
      const bolt = boltIndex.get(`${next.x},${next.y}`) ?? -1;
      if (bolt >= 0) collected.add(bolt);
      steps.push({ ...next, command: c, kind: "move", bolt });
    }
  }

  if (!outcome) {
    outcome = at.x === map.charger.x && at.y === map.charger.y ? "success" : "short";
  }
  return { steps, end: at, outcome, boltsCollected: [...collected].sort((a, b) => a - b), bumpedInto };
}

// Shortest program (fewest command blocks) that reaches the charger. With
// `allBolts` it must also pick up every bolt. Used for par and for hints.
export function solveLevel(level: ChargerLevel, allBolts: boolean): Command[] | null {
  const map = parseLevel(level);
  const rockKey = new Set(map.rocks.map((rock) => `${rock.x},${rock.y}`));
  const boltIndex = new Map(map.bolts.map((bolt, index) => [`${bolt.x},${bolt.y}`, index]));
  const full = allBolts ? (1 << map.bolts.length) - 1 : 0;

  type Node = { x: number; y: number; mask: number; energy: number; path: Command[] };
  const queue: Node[] = [{ ...map.start, mask: 0, energy: level.energy, path: [] }];
  const seen = new Set<string>([`${map.start.x},${map.start.y},0,${level.energy}`]);

  for (let head = 0; head < queue.length; head += 1) {
    const node = queue[head];
    if (node.x === map.charger.x && node.y === map.charger.y && (node.mask & full) === full) {
      return node.path;
    }
    if (node.path.length >= level.maxCommands) continue;
    for (const dir of DIRECTION_ORDER) {
      const info = DIRECTION_INFO[dir];
      let { x, y, mask, energy } = node;
      for (let times = 1; times <= level.maxTimes; times += 1) {
        x += info.dx;
        y += info.dy;
        if (x < 0 || y < 0 || x >= map.columns || y >= map.rows || rockKey.has(`${x},${y}`) || energy <= 0) break;
        energy -= 1;
        const bolt = boltIndex.get(`${x},${y}`);
        if (bolt !== undefined) mask |= 1 << bolt;
        const key = `${x},${y},${mask},${energy}`;
        if (seen.has(key)) continue;
        seen.add(key);
        queue.push({ x, y, mask, energy, path: [...node.path, { dir, times }] });
      }
    }
  }
  return null;
}

const parCache = new Map<number, number>();

/** Fewest command blocks that collect every bolt and reach the charger. */
export function parFor(level: ChargerLevel): number {
  const cached = parCache.get(level.number);
  if (cached !== undefined) return cached;
  const solution = solveLevel(level, true) ?? solveLevel(level, false);
  const par = solution ? solution.length : level.maxCommands;
  parCache.set(level.number, par);
  return par;
}

/** 1 star for arriving, +1 for every bolt, +1 for a short program. */
export function starsFor(level: ChargerLevel, program: Command[], boltsCollected: number, hintUsed: boolean) {
  const map = parseLevel(level);
  let stars = 1;
  if (boltsCollected >= map.bolts.length) stars += 1;
  if (program.length <= parFor(level) + 2) stars += 1;
  return hintUsed ? Math.min(stars, 2) : stars;
}

export function describeCommand(command: Command) {
  const info = DIRECTION_INFO[command.dir];
  return command.times > 1 ? `${info.label} ×${command.times}` : info.label;
}
