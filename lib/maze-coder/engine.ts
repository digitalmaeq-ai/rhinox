// Robot Maze Coder — pure engine. No React, no DOM: given a level and a
// program of blocks it works out the whole run up front, step by step. The
// UI simply replays the steps, so the maths can be tested on its own.

export type Heading = 0 | 1 | 2 | 3; // 0 north, 1 east, 2 south, 3 west

export type BlockKind = "forward" | "left" | "right" | "repeat";

export interface Block {
  id: string;
  kind: BlockKind;
  /** Repeat blocks only: how many times the body runs. */
  count?: number;
  /** Repeat blocks only: the blocks inside the loop. */
  body?: Block[];
}

export interface MazeLevel {
  id: string;
  title: string;
  goal: string;
  hint: string;
  /** Map rows: '#' void, '.' floor, 'S' start, 'G' goal, 'c' energy chip. */
  map: string[];
  heading: Heading;
  allowed: BlockKind[];
  maxBlocks: number;
  /** Fewest blocks a tidy solution needs (a repeat counts as 1 + its body). */
  par: number;
  points: number;
}

export interface Cell {
  x: number;
  y: number;
}

export interface ParsedLevel {
  columns: number;
  rows: number;
  floor: boolean[][];
  start: Cell;
  goal: Cell;
  chips: Cell[];
}

export type StepKind = "move" | "turn" | "bump";

export interface RunStep {
  kind: StepKind;
  x: number;
  y: number;
  heading: Heading;
  /** Cumulative rotation in degrees, so the robot never spins backwards. */
  angle: number;
  blockId: string;
  /** Index into ParsedLevel.chips when this step picked one up. */
  chip: number | null;
}

export type Outcome = "success" | "blocked" | "short" | "chips" | "too-long";

export interface RunResult {
  steps: RunStep[];
  outcome: Outcome;
  chipsCollected: number;
  chipsTotal: number;
}

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

/** Hard cap so a runaway nested loop can never freeze the page. */
export const MAX_STEPS = 600;

export function parseLevel(level: MazeLevel): ParsedLevel {
  const rows = level.map.length;
  const columns = Math.max(...level.map.map((row) => row.length));
  const floor: boolean[][] = [];
  const chips: Cell[] = [];
  let start: Cell = { x: 0, y: 0 };
  let goal: Cell = { x: 0, y: 0 };

  level.map.forEach((row, y) => {
    const line: boolean[] = [];
    for (let x = 0; x < columns; x += 1) {
      const char = row[x] ?? "#";
      line.push(char !== "#");
      if (char === "S") start = { x, y };
      if (char === "G") goal = { x, y };
      if (char === "c") chips.push({ x, y });
    }
    floor.push(line);
  });

  return { columns, rows, floor, start, goal, chips };
}

export function countBlocks(blocks: Block[]): number {
  return blocks.reduce(
    (total, block) => total + 1 + (block.body ? countBlocks(block.body) : 0),
    0,
  );
}

export function starsFor(used: number, par: number): 1 | 2 | 3 {
  if (used <= par) return 3;
  if (used <= par + 3) return 2;
  return 1;
}

export function runProgram(level: MazeLevel, program: Block[]): RunResult {
  const parsed = parseLevel(level);
  const steps: RunStep[] = [];
  const taken = new Set<number>();

  let x = parsed.start.x;
  let y = parsed.start.y;
  let heading: Heading = level.heading;
  let angle = heading * 90;
  let stopped: Outcome | null = null;

  const chipAt = (cx: number, cy: number) =>
    parsed.chips.findIndex((chip, index) => chip.x === cx && chip.y === cy && !taken.has(index));

  function exec(blocks: Block[]) {
    for (const block of blocks) {
      if (stopped) return;

      if (block.kind === "repeat") {
        const times = Math.max(1, Math.min(9, block.count ?? 2));
        for (let i = 0; i < times; i += 1) {
          exec(block.body ?? []);
          if (stopped) return;
        }
        continue;
      }

      if (steps.length >= MAX_STEPS) {
        stopped = "too-long";
        return;
      }

      if (block.kind === "left" || block.kind === "right") {
        const turn = block.kind === "left" ? -1 : 1;
        heading = ((heading + turn + 4) % 4) as Heading;
        angle += turn * 90;
        steps.push({ kind: "turn", x, y, heading, angle, blockId: block.id, chip: null });
        continue;
      }

      const nx = x + DX[heading];
      const ny = y + DY[heading];
      const open = parsed.floor[ny]?.[nx] === true;
      if (!open) {
        steps.push({ kind: "bump", x, y, heading, angle, blockId: block.id, chip: null });
        stopped = "blocked";
        return;
      }
      x = nx;
      y = ny;
      const chip = chipAt(x, y);
      if (chip >= 0) taken.add(chip);
      steps.push({ kind: "move", x, y, heading, angle, blockId: block.id, chip: chip >= 0 ? chip : null });
    }
  }

  exec(program);

  let outcome: Outcome;
  if (stopped) {
    outcome = stopped;
  } else if (x === parsed.goal.x && y === parsed.goal.y) {
    outcome = taken.size === parsed.chips.length ? "success" : "chips";
  } else {
    outcome = "short";
  }

  return { steps, outcome, chipsCollected: taken.size, chipsTotal: parsed.chips.length };
}
