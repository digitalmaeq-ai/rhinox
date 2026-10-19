// Run with:  npx tsx lib/game-creator/game-creator.test.ts
import assert from "node:assert/strict";

import {
  addLevel, checkProject, coinPoints, countCoins, createGame, findTiles, goalNeedsAllCoins, paintTile, parseProject, reachable, removeLevel, resizeGrid, setLives, setRules, step, tileAt,
} from "./engine";
import { blankTemplate, mazeEscapeTemplate } from "./template";
import type { Direction, GameProject, GameState, Rule } from "./types";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}

const DIRS: Record<string, Direction> = { U: "up", D: "down", L: "left", R: "right" };

function play(project: GameProject, moves: string, from?: GameState) {
  let state = from ?? createGame(project);
  for (const m of moves) state = step(project, state, DIRS[m]);
  return state;
}

const STANDARD: Rule[] = [
  { when: "touch-coin", do: { type: "add-points", amount: 5 } },
  { when: "touch-hazard", do: { type: "lose-life" } },
  { when: "touch-hazard", do: { type: "go-to-start" } },
  { when: "touch-enemy", do: { type: "lose-life" } },
  { when: "touch-enemy", do: { type: "go-to-start" } },
  { when: "reach-goal", do: { type: "win" } },
];

function tiny(rows: string[], extra: Partial<GameProject> = {}): GameProject {
  return { version: 2, template: "maze-escape", title: "t", cols: rows[0].length, rows: rows.length, levels: [rows], lives: 2, rules: STANDARD, ...extra };
}

/** Breadth-first search over real game states: can the game be won, and in how many moves? */
function solve(project: GameProject, limit = 400000): number | null {
  const first = createGame(project);
  const id = (s: GameState) => JSON.stringify([s.level, s.x, s.y, [...s.collected].sort(), s.hasKey, s.enemies, s.lives, s.status]);
  const seen = new Set([id(first)]);
  let frontier = [first];
  for (let depth = 0; frontier.length && seen.size < limit; depth += 1) {
    const next: GameState[] = [];
    for (const state of frontier) {
      for (const dir of Object.values(DIRS)) {
        const after = step(project, state, dir);
        if (after.status === "won") return depth + 1;
        if (after.status === "lost") continue;
        const k = id(after);
        if (!seen.has(k)) { seen.add(k); next.push(after); }
      }
    }
    frontier = next;
  }
  console.log("      solver stopped: states", seen.size, "frontier", frontier.length);
  return null;
}

test("templates pass their own check", () => {
  for (const project of [mazeEscapeTemplate(), blankTemplate()]) {
    assert.deepEqual(checkProject(project).problems, []);
    for (const level of project.levels) {
      assert.equal(level.length, project.rows);
      assert.ok(level.every((row) => row.length === project.cols));
    }
  }
});

test("the template game can really be won, through both levels", () => {
  const moves = solve(mazeEscapeTemplate());
  assert.ok(moves !== null, "no winning route found");
  console.log("      shortest win:", moves, "moves");
});

test("the blank arena can be won", () => {
  assert.ok(solve(blankTemplate()) !== null);
});

test("walls and the edge stop the player without counting a move", () => {
  const project = tiny(["####", "#S.G", "####"]);
  const state = play(project, "UUL");
  assert.equal(state.moves, 0);
  assert.deepEqual([state.x, state.y], [1, 1]);
});

test("a coin is collected once and scores its rule's points", () => {
  const project = tiny(["#####", "#ScG#", "#####"]);
  let state = step(project, createGame(project), "right");
  assert.equal(state.score, 5);
  state = step(project, step(project, state, "left"), "right");
  assert.equal(state.score, 5);
  assert.equal(coinPoints(project), 5);
});

test("reaching the goal wins, and the game then ignores moves", () => {
  const project = tiny(["#####", "#S.G#", "#####"]);
  const won = play(project, "RR");
  assert.equal(won.status, "won");
  assert.deepEqual(step(project, won, "left"), won);
});

test("a goal that needs every coin refuses until they are collected", () => {
  const rules: Rule[] = [{ when: "reach-goal", requires: "all-coins", do: { type: "win" } }];
  const project = tiny(["######", "#SGc.#", "######"], { rules });
  assert.equal(goalNeedsAllCoins(project), true);
  let state = play(project, "R");
  assert.equal(state.status, "playing");
  assert.equal(state.message, "Collect every coin first!");
  state = play(project, "RLL", state);
  assert.equal(state.status, "won");
});

test("a hazard costs a life and sends the player back to the start", () => {
  const project = tiny(["#####", "#S.x#", "#####"]);
  const state = play(project, "RR");
  assert.equal(state.lives, 1);
  assert.deepEqual([state.x, state.y], [1, 1]);
  assert.equal(state.status, "playing");
});

test("losing the last life ends the game", () => {
  const project = tiny(["#####", "#S.x#", "#####"]);
  const state = play(project, "RRRR");
  assert.equal(state.lives, 0);
  assert.equal(state.status, "lost");
});

test("without a lose-life rule a hazard is harmless", () => {
  const project = setRules(tiny(["#####", "#S.xG", "#####"]), "touch-hazard", []);
  const state = play(project, "RRR");
  assert.equal(state.lives, 2);
  assert.equal(state.status, "won");
});

test("a door is locked until the key is picked up, then every door opens", () => {
  const project = tiny(["########", "#SkD.G.#", "########"]);
  let state = step(project, createGame(project), "right");
  assert.equal(state.hasKey, true);
  state = play(project, "RRR", state);
  assert.equal(state.status, "won");

  const locked = tiny(["#######", "#SDkG.#", "#######"]);
  const blocked = step(locked, createGame(locked), "right");
  assert.deepEqual([blocked.x, blocked.y], [1, 1]);
  assert.equal(blocked.moves, 0);
  assert.match(blocked.message, /locked/);
});

test("check understands that a key behind the door cannot open it", () => {
  const trapped = tiny(["#######", "#SDkG.#", "#######"]);
  assert.ok(checkProject(trapped).problems.some((p) => /cannot be reached/i.test(p)));
  const fine = tiny(["#######", "#SkDG.#", "#######"]);
  assert.deepEqual(checkProject(fine).problems, []);
  assert.ok(reachable(fine, 0).has("4,1"));
});

test("an enemy patrols back and forth", () => {
  const project = tiny(["#######", "#S###.#", "#.#####", "#.e...#", "#######"].map((r, i) => (i === 3 ? "#.e..G#" : r)));
  // enemy starts at (2,3) heading right, floor to (4,3), goal at (5,3) blocks it
  let state = createGame(project);
  const seen: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    state = step(project, state, i % 2 === 0 ? "down" : "up");
    seen.push(`${state.enemies[0].x}`);
  }
  assert.deepEqual(seen, ["3", "4", "3", "2", "1", "2"]);
});

test("an enemy that catches the player costs a life and sends them back", () => {
  const project = tiny(["#######", "#e.S..#", "#######"].map((r, i) => (i === 1 ? "#e.S.G#" : r)));
  // the player steps away, then back toward the enemy walking after them
  const state = play(project, "RL");
  assert.equal(state.lives, 1);
  assert.deepEqual([state.x, state.y], [3, 1]);
});

test("walking into an enemy counts as being caught", () => {
  const project = tiny(["#####", "#SeG#", "#####"]);
  const state = play(project, "R");
  assert.equal(state.lives, 1);
});

test("enemies turn round at hazards", () => {
  const project = tiny(["########", "#e.x.G.#", "#S.....#", "########"]);
  let state = createGame(project);
  let furthest = 0;
  for (const move of "RLRLRLRL") {
    state = step(project, state, DIRS[move]);
    furthest = Math.max(furthest, state.enemies[0].x);
  }
  assert.equal(furthest, 2);
  assert.equal(state.lives, 2);
});

test("the last goal of a level starts the next one, keeping score and lives", () => {
  const project: GameProject = {
    ...tiny(["#####", "#ScG#", "#####"]),
    levels: [["#####", "#ScG#", "#####"], ["#####", "#S.G#", "#####"]],
  };
  let state = play(project, "RR");
  assert.equal(state.level, 1);
  assert.equal(state.status, "playing");
  assert.equal(state.score, 5);
  assert.deepEqual([state.x, state.y], [1, 1]);
  assert.deepEqual(state.collected, []);
  assert.equal(state.message, "Level 2!");
  state = play(project, "RR", state);
  assert.equal(state.status, "won");
});

test("painting keeps a single start and a single goal per level", () => {
  let project = tiny(["#####", "#S.G#", "#####"]);
  project = paintTile(project, 0, 2, 1, "start");
  assert.deepEqual(findTiles(project, 0, "start"), [[2, 1]]);
  project = paintTile(project, 0, 1, 1, "goal");
  assert.deepEqual(findTiles(project, 0, "goal"), [[1, 1]]);
  assert.equal(tileAt(project, 0, 3, 1), "floor");
  assert.equal(paintTile(project, 0, 99, 99, "wall"), project);
  project = paintTile(project, 0, 3, 1, "enemy-v");
  assert.equal(tileAt(project, 0, 3, 1), "enemy-v");
});

test("adding and removing levels", () => {
  let project = tiny(["#####", "#S.G#", "#####"]);
  for (let i = 0; i < 10; i += 1) project = addLevel(project);
  assert.equal(project.levels.length, 5);
  assert.equal(removeLevel(tiny(["#####", "#S.G#", "#####"]), 0).levels.length, 1);
  assert.equal(removeLevel(project, 4).levels.length, 4);
  project = paintTile(project, 1, 2, 2, "coin");
  assert.equal(countCoins(project, 1), 1);
  assert.equal(countCoins(project, 0), 0);
  assert.equal(countCoins(project), 1);
});

test("resizing resizes every level and keeps what fits", () => {
  const project = addLevel(tiny(["#####", "#S.G#", "#####"]));
  const bigger = resizeGrid(project, 7, 4);
  assert.equal(bigger.cols, 7);
  assert.ok(bigger.levels.every((level) => level.length === 4 && level.every((row) => row.length === 7)));
  assert.equal(tileAt(bigger, 0, 1, 1), "start");
  assert.equal(tileAt(bigger, 0, 6, 3), "floor");
});

test("check finds a missing start, goal and an unreachable goal, naming the level", () => {
  assert.ok(checkProject(tiny(["####", "#.G#", "####"])).problems.some((p) => /start/i.test(p)));
  assert.ok(checkProject(tiny(["####", "#S.#", "####"])).problems.some((p) => /goal/i.test(p)));
  assert.ok(checkProject(tiny(["######", "#S#.G#", "######"])).problems.some((p) => /cannot be reached/i.test(p)));
  const two = { ...tiny(["#####", "#S.G#", "#####"]), levels: [["#####", "#S.G#", "#####"], ["#####", "#S#G#", "#####"]] };
  assert.ok(checkProject(two).problems.some((p) => /^Level 2:/.test(p)));
});

test("check flags a goal rule that cannot win", () => {
  const project = setRules(tiny(["####", "#SG#", "####"]), "reach-goal", []);
  assert.ok(checkProject(project).problems.some((p) => /goal/i.test(p)));
});

test("an unreachable coin blocks a level whose goal needs every coin", () => {
  const rules: Rule[] = [{ when: "reach-goal", requires: "all-coins", do: { type: "win" } }];
  const project = tiny(["#######", "#S.G#c#", "#######"], { rules });
  assert.ok(checkProject(project).problems.some((p) => /cannot be won/i.test(p)));
  const easy = tiny(["#######", "#S.G#c#", "#######"]);
  assert.equal(checkProject(easy).problems.length, 0);
  assert.ok(checkProject(easy).tips.some((t) => /reached/i.test(t)));
});

test("tips mention enemies that cannot hurt and doors without keys", () => {
  const harmless = setRules(tiny(["#######", "#S.e.G#", "#######"]), "touch-enemy", []);
  assert.ok(checkProject(harmless).tips.some((t) => /enemy/i.test(t)));
  const noKey = tiny(["#######", "#S.DG.#", "#######"]);
  assert.ok(checkProject(noKey).tips.some((t) => /no key/i.test(t)));
});

test("lives are kept between 1 and 5", () => {
  const project = tiny(["####", "#SG#", "####"]);
  assert.equal(setLives(project, 0).lives, 1);
  assert.equal(setLives(project, 99).lives, 5);
  assert.equal(setLives(project, 3).lives, 3);
});

test("parseProject accepts version 2, upgrades version 1, and rejects damaged data", () => {
  const good = JSON.parse(JSON.stringify(mazeEscapeTemplate()));
  assert.equal(parseProject(good)?.levels.length, 2);
  const v1 = { version: 1, template: "maze-escape", title: "Old", cols: 5, rows: 4, tiles: ["#####", "#S.G#", "#...#", "#####"], lives: 3, rules: [{ when: "reach-goal", do: { type: "win" } }] };
  const upgraded = parseProject(v1);
  assert.equal(upgraded?.version, 2);
  assert.deepEqual(upgraded?.levels, [["#####", "#S.G#", "#...#", "#####"]]);
  assert.equal(parseProject(null), null);
  assert.equal(parseProject({ ...good, version: 3 }), null);
  assert.equal(parseProject({ ...good, levels: [] }), null);
  assert.equal(parseProject({ ...good, levels: [good.levels[0].slice(1)] }), null);
  assert.equal(parseProject({ ...good, levels: [good.levels[0].map((r: string) => r.replace("#", "?"))] }), null);
  assert.equal(parseProject({ ...good, cols: 500 }), null);
  assert.equal(parseProject({ ...good, lives: 99 })?.lives, 5);
  assert.equal(parseProject({ ...good, rules: [{ when: "nonsense", do: { type: "win" } }, ...good.rules] })?.rules.length, good.rules.length);
});

console.log(`\n${passed} tests passed`);
