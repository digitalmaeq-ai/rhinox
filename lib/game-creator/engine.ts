// The Game Creator engine: pure functions, no browser APIs. The editor and the
// player both call these, and the tests exercise them directly.

import {
  CHAR_TILES, GAME_EVENTS, MAX_LEVELS, MAX_LIVES, MAX_TITLE, TILE_CHARS,
  type Direction, type Enemy, type GameAction, type GameEvent, type GameProject, type GameState, type Rule, type Tile,
} from "./types";

const STEP: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export function key(x: number, y: number): string {
  return `${x},${y}`;
}

export function inBounds(project: Pick<GameProject, "cols" | "rows">, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < project.cols && y < project.rows;
}

export function tileAt(project: GameProject, level: number, x: number, y: number): Tile {
  if (!inBounds(project, x, y)) return "wall";
  return CHAR_TILES[project.levels[level]?.[y]?.[x] ?? "#"] ?? "wall";
}

export function findTiles(project: GameProject, level: number, ...tiles: Tile[]): [number, number][] {
  const found: [number, number][] = [];
  for (let y = 0; y < project.rows; y += 1) {
    for (let x = 0; x < project.cols; x += 1) {
      if (tiles.includes(tileAt(project, level, x, y))) found.push([x, y]);
    }
  }
  return found;
}

export function countCoins(project: GameProject, level?: number): number {
  const levels = level === undefined ? project.levels.map((_, i) => i) : [level];
  return levels.reduce((sum, l) => sum + findTiles(project, l, "coin").length, 0);
}

// ---------- editing ----------

/** Paints one tile. There is only ever one start and one goal per level, so placing a new one moves it. */
export function paintTile(project: GameProject, level: number, x: number, y: number, tile: Tile): GameProject {
  if (!inBounds(project, x, y) || tileAt(project, level, x, y) === tile) return project;
  const unique = tile === "start" || tile === "goal";
  const rows = project.levels[level].map((row, ry) => {
    let next = row;
    if (unique) next = next.replace(TILE_CHARS[tile], TILE_CHARS.floor);
    if (ry === y) next = next.slice(0, x) + TILE_CHARS[tile] + next.slice(x + 1);
    return next;
  });
  return { ...project, levels: project.levels.map((l, i) => (i === level ? rows : l)) };
}

/** Changes the grid size of every level, keeping whatever fits. New cells are floor. */
export function resizeGrid(project: GameProject, cols: number, rows: number): GameProject {
  const levels = project.levels.map((level) => {
    const next: string[] = [];
    for (let y = 0; y < rows; y += 1) {
      let row = "";
      for (let x = 0; x < cols; x += 1) {
        row += x < project.cols && y < project.rows ? level[y][x] : TILE_CHARS.floor;
      }
      next.push(row);
    }
    return next;
  });
  return { ...project, cols, rows, levels };
}

/** A walled arena with a start in one corner and the goal in the opposite corner. */
export function blankLevel(cols: number, rows: number): string[] {
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => {
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) return TILE_CHARS.wall;
      if (x === 1 && y === 1) return TILE_CHARS.start;
      if (x === cols - 2 && y === rows - 2) return TILE_CHARS.goal;
      return TILE_CHARS.floor;
    }).join(""),
  );
}

export function addLevel(project: GameProject): GameProject {
  if (project.levels.length >= MAX_LEVELS) return project;
  return { ...project, levels: [...project.levels, blankLevel(project.cols, project.rows)] };
}

export function removeLevel(project: GameProject, level: number): GameProject {
  if (project.levels.length <= 1 || level < 0 || level >= project.levels.length) return project;
  return { ...project, levels: project.levels.filter((_, i) => i !== level) };
}

export function setTitle(project: GameProject, title: string): GameProject {
  return { ...project, title: title.slice(0, MAX_TITLE) };
}

export function setLives(project: GameProject, lives: number): GameProject {
  return { ...project, lives: Math.min(MAX_LIVES, Math.max(1, Math.round(lives) || 1)) };
}

// ---------- rules ----------

function rulesFor(project: GameProject, when: GameEvent): Rule[] {
  return project.rules.filter((rule) => rule.when === when);
}

/** The points a coin is worth, from the first "add points" rule (0 when there is none). */
export function coinPoints(project: GameProject): number {
  const rule = rulesFor(project, "touch-coin").find((r) => r.do.type === "add-points");
  return rule?.do.type === "add-points" ? rule.do.amount : 0;
}

export function hasAction(project: GameProject, when: GameEvent, type: GameAction["type"]): boolean {
  return rulesFor(project, when).some((rule) => rule.do.type === type);
}

export function goalNeedsAllCoins(project: GameProject): boolean {
  return rulesFor(project, "reach-goal").some((rule) => rule.do.type === "win" && rule.requires === "all-coins");
}

/** Replaces the rules for one event. Rules for other events are kept. */
export function setRules(project: GameProject, when: GameEvent, rules: Rule[]): GameProject {
  return { ...project, rules: [...project.rules.filter((rule) => rule.when !== when), ...rules] };
}

// ---------- playing ----------

export function startPosition(project: GameProject, level: number): [number, number] | null {
  return findTiles(project, level, "start")[0] ?? null;
}

function enemiesFor(project: GameProject, level: number): Enemy[] {
  return findTiles(project, level, "enemy-h", "enemy-v").map(([x, y]) =>
    tileAt(project, level, x, y) === "enemy-h" ? { x, y, dx: 1, dy: 0 } : { x, y, dx: 0, dy: 1 },
  );
}

function levelState(project: GameProject, level: number): Pick<GameState, "level" | "x" | "y" | "collected" | "hasKey" | "enemies"> {
  const [x, y] = startPosition(project, level) ?? [0, 0];
  return { level, x, y, collected: [], hasKey: false, enemies: enemiesFor(project, level) };
}

export function createGame(project: GameProject): GameState {
  return { ...levelState(project, 0), score: 0, lives: project.lives, moves: 0, status: "playing", message: "" };
}

function applyAction(project: GameProject, state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "add-points":
      return { ...state, score: state.score + action.amount };
    case "lose-life": {
      const lives = Math.max(0, state.lives - 1);
      return { ...state, lives, status: lives === 0 ? "lost" : state.status, message: lives === 0 ? "" : "Ouch! You lost a life." };
    }
    case "go-to-start": {
      const [x, y] = startPosition(project, state.level) ?? [state.x, state.y];
      return { ...state, x, y };
    }
    case "win": {
      if (state.level + 1 < project.levels.length) {
        return { ...state, ...levelState(project, state.level + 1), message: `Level ${state.level + 2}!` };
      }
      return { ...state, status: "won" };
    }
  }
}

function coinsLeft(project: GameProject, state: GameState): number {
  return findTiles(project, state.level, "coin").filter(([x, y]) => !state.collected.includes(key(x, y))).length;
}

function runRules(project: GameProject, state: GameState, when: GameEvent): GameState {
  let next = state;
  for (const rule of rulesFor(project, when)) {
    if (next.status !== "playing" || next.level !== state.level) break;
    if (rule.requires === "all-coins" && coinsLeft(project, next) > 0) {
      next = { ...next, message: "Collect every coin first!" };
      continue;
    }
    next = applyAction(project, next, rule.do);
  }
  return next;
}

function enemyCanEnter(project: GameProject, level: number, x: number, y: number): boolean {
  const tile = tileAt(project, level, x, y);
  return tile === "floor" || tile === "start" || tile === "coin" || tile === "key" || tile === "enemy-h" || tile === "enemy-v";
}

/** Each enemy walks on, and turns round when something blocks it. */
function moveEnemies(project: GameProject, state: GameState): Enemy[] {
  const moved: Enemy[] = [];
  state.enemies.forEach((enemy, index) => {
    const others = [...moved, ...state.enemies.slice(index + 1)];
    const free = (x: number, y: number) => enemyCanEnter(project, state.level, x, y) && !others.some((o) => o.x === x && o.y === y);
    if (free(enemy.x + enemy.dx, enemy.y + enemy.dy)) {
      moved.push({ ...enemy, x: enemy.x + enemy.dx, y: enemy.y + enemy.dy });
    } else if (free(enemy.x - enemy.dx, enemy.y - enemy.dy)) {
      moved.push({ x: enemy.x - enemy.dx, y: enemy.y - enemy.dy, dx: -enemy.dx, dy: -enemy.dy });
    } else {
      moved.push({ ...enemy, dx: -enemy.dx, dy: -enemy.dy });
    }
  });
  return moved;
}

function caught(state: GameState): boolean {
  return state.enemies.some((enemy) => enemy.x === state.x && enemy.y === state.y);
}

/** One move. A wall or the edge of the grid leaves the game unchanged. */
export function step(project: GameProject, state: GameState, direction: Direction): GameState {
  if (state.status !== "playing") return state;
  const [dx, dy] = STEP[direction];
  const x = state.x + dx;
  const y = state.y + dy;
  const tile = tileAt(project, state.level, x, y);
  if (tile === "wall") return state;
  if (tile === "door" && !state.hasKey) {
    return state.message === "The door is locked. Find a key!" ? state : { ...state, message: "The door is locked. Find a key!" };
  }

  const level = state.level;
  let next: GameState = { ...state, x, y, moves: state.moves + 1, message: "" };
  const here = key(x, y);
  if (tile === "coin" && !state.collected.includes(here)) {
    next = runRules(project, { ...next, collected: [...next.collected, here] }, "touch-coin");
  } else if (tile === "key" && !state.collected.includes(here)) {
    next = { ...next, collected: [...next.collected, here], hasKey: true, message: "You found a key! Every door is open." };
  } else if (tile === "hazard") {
    next = runRules(project, next, "touch-hazard");
  } else if (tile === "goal") {
    next = runRules(project, next, "reach-goal");
  }

  // The level is over (won, lost, or a new level began): nothing else moves.
  if (next.status !== "playing" || next.level !== level) return next;

  // Walking into an enemy ends the turn: the enemies hold still while the player is sent back.
  if (caught(next)) return runRules(project, next, "touch-enemy");

  next = { ...next, enemies: moveEnemies(project, next) };
  if (caught(next)) next = runRules(project, next, "touch-enemy");
  return next;
}

// ---------- checking ----------

/** Squares the player can walk to from the start. Doors open once a key can be reached. */
export function reachable(project: GameProject, level: number): Set<string> {
  const start = startPosition(project, level);
  const seen = new Set<string>();
  if (!start) return seen;

  const walk = (doorsOpen: boolean) => {
    seen.clear();
    const queue: [number, number][] = [start];
    seen.add(key(start[0], start[1]));
    while (queue.length) {
      const [cx, cy] = queue.shift() as [number, number];
      for (const [dx, dy] of Object.values(STEP)) {
        const nx = cx + dx;
        const ny = cy + dy;
        const tile = tileAt(project, level, nx, ny);
        if (!inBounds(project, nx, ny) || tile === "wall" || (tile === "door" && !doorsOpen) || seen.has(key(nx, ny))) continue;
        seen.add(key(nx, ny));
        queue.push([nx, ny]);
      }
    }
  };

  walk(false);
  if (findTiles(project, level, "key").some(([x, y]) => seen.has(key(x, y)))) walk(true);
  return seen;
}

export interface Check {
  /** Problems that stop the game from being playable. */
  problems: string[];
  /** Things worth fixing that do not stop play. */
  tips: string[];
}

export function checkProject(project: GameProject): Check {
  const problems: string[] = [];
  const tips: string[] = [];
  const many = project.levels.length > 1;
  const at = (level: number) => (many ? `Level ${level + 1}: ` : "");

  if (!hasAction(project, "reach-goal", "win")) problems.push("Nothing happens at the goal. Set a rule so reaching it wins the game.");

  project.levels.forEach((_, level) => {
    const starts = findTiles(project, level, "start");
    const goals = findTiles(project, level, "goal");
    if (starts.length === 0) problems.push(`${at(level)}Place a start square so the player knows where to begin.`);
    if (goals.length === 0) problems.push(`${at(level)}Place a goal so there is somewhere to finish.`);

    if (starts.length === 1 && goals.length === 1) {
      const seen = reachable(project, level);
      if (!seen.has(key(goals[0][0], goals[0][1]))) {
        const doors = findTiles(project, level, "door").length > 0;
        problems.push(`${at(level)}The goal cannot be reached from the start.${doors ? " Is there a key the player can reach before the door?" : " Open a path through the walls."}`);
      }
      const unreachable = findTiles(project, level, "coin").filter(([x, y]) => !seen.has(key(x, y)));
      if (unreachable.length > 0) {
        const text = `${at(level)}${unreachable.length} ${unreachable.length === 1 ? "coin cannot" : "coins cannot"} be reached.`;
        if (goalNeedsAllCoins(project)) problems.push(`${text} The goal needs every coin, so this level cannot be won.`);
        else tips.push(text);
      }
    }

    if (findTiles(project, level, "door").length > 0 && findTiles(project, level, "key").length === 0) {
      tips.push(`${at(level)}There is a door but no key to open it.`);
    }
  });

  const any = (...tiles: Tile[]) => project.levels.some((_, level) => findTiles(project, level, ...tiles).length > 0);
  if (countCoins(project) === 0) tips.push("There are no coins. Add some to give players something to collect.");
  if (!any("hazard", "enemy-h", "enemy-v")) tips.push("There are no hazards or enemies, so the game has no danger yet.");
  if (any("hazard") && !hasAction(project, "touch-hazard", "lose-life")) tips.push("Touching a hazard does not cost a life yet.");
  if (any("enemy-h", "enemy-v") && !hasAction(project, "touch-enemy", "lose-life")) tips.push("Being caught by an enemy does not cost a life yet.");
  return { problems, tips };
}

// ---------- loading ----------

function validRows(rows: unknown, cols: number, height: number): rows is string[] {
  return (
    Array.isArray(rows) && rows.length === height &&
    rows.every((row) => typeof row === "string" && row.length === cols && [...row].every((ch) => ch in CHAR_TILES))
  );
}

/** Accepts anything read back from storage (version 1 or 2); returns a valid version 2 project or null. */
export function parseProject(value: unknown): GameProject | null {
  const p = value as (Partial<GameProject> & { tiles?: unknown }) | null;
  const ver = (p?.version as number | undefined);
  if (!p || (ver !== 1 && ver !== 2) || p.template !== "maze-escape") return null;
  if (typeof p.title !== "string" || !Number.isInteger(p.cols) || !Number.isInteger(p.rows)) return null;
  const cols = p.cols as number;
  const rows = p.rows as number;
  if (cols < 4 || rows < 4 || cols > 40 || rows > 40) return null;

  const rawLevels: unknown[] = ver === 1 ? [p.tiles] : Array.isArray(p.levels) ? p.levels : [];
  if (rawLevels.length < 1 || rawLevels.length > MAX_LEVELS) return null;
  if (!rawLevels.every((level) => validRows(level, cols, rows))) return null;

  if (typeof p.lives !== "number" || !Array.isArray(p.rules)) return null;
  const rules = p.rules.filter(
    (rule): rule is Rule => Boolean(rule) && GAME_EVENTS.includes(rule.when) && typeof rule.do === "object" && rule.do !== null,
  );
  return {
    version: 2,
    template: "maze-escape",
    title: p.title.slice(0, MAX_TITLE),
    cols,
    rows,
    levels: rawLevels as string[][],
    lives: Math.min(MAX_LIVES, Math.max(1, Math.round(p.lives))),
    rules,
  };
}
