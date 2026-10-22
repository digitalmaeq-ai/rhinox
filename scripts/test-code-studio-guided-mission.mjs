#!/usr/bin/env node
import assert from "node:assert/strict";
import test from "node:test";
import { runRobotProgram, isRobotMission, ROBOT_START, ROBOT_GOAL } from "../lib/code-studio-v2/robot-simulator.ts";
import { evaluateGuidedRobotRun, isGuidedMissionDefinition } from "../lib/code-studio-v2/guided-mission.ts";
import { DRAFT_YEAR1_T1_W3_MISSIONS as M } from "../lib/code-studio-v2/guided-missions.ts";
import { resolveGuidedRobotLaunch } from "../lib/code-studio-v2/guided-launch.ts";

const y1w3 = "tmc-v3-15-year-1-t1-w3";

test("free play still uses the original 5x5 mission by default", () => {
  assert.equal(runRobotProgram(["forward", "forward", "right", "forward", "forward"]).success, true);
  assert.deepEqual(ROBOT_GOAL, { x: 3, y: 1 });
  assert.deepEqual(ROBOT_START, { x: 1, y: 3, direction: 0 });
});

test("a smaller grid blocks moves that a 5x5 grid would allow", () => {
  const start = { x: 0, y: 0, direction: 1 };
  const small = runRobotProgram(["forward", "forward", "forward", "forward"], undefined, undefined, start, { gridSize: 4, goal: { x: 3, y: 0 } });
  assert.equal(small.trace.at(-1).blocked, true, "The 4th step would leave a 4-wide grid.");
  const big = runRobotProgram(["forward", "forward", "forward", "forward"], undefined, undefined, start, { gridSize: 5, goal: { x: 4, y: 0 } });
  assert.equal(big.success, true);
});

test("invalid missions and starts are refused without running or crashing", () => {
  for (const bad of [null, {}, { gridSize: 2, goal: { x: 0, y: 0 } }, { gridSize: 9, goal: { x: 0, y: 0 } },
    { gridSize: 5, goal: { x: 5, y: 0 } }, { gridSize: 5.5, goal: { x: 0, y: 0 } }, { gridSize: 5, goal: { x: -1, y: 0 } },
    { gridSize: "5", goal: { x: 0, y: 0 } }, { gridSize: 5 }, []]) {
    assert.equal(isRobotMission(bad), false, JSON.stringify(bad));
  }
  const r = runRobotProgram(["forward"], undefined, undefined, ROBOT_START, { gridSize: 5, goal: { x: 9, y: 9 } });
  assert.equal(r.success, false);
  assert.equal(r.trace.length, 0);
  assert.match(r.message, /not set up correctly/);
  const off = runRobotProgram(["forward"], undefined, undefined, { x: 7, y: 7, direction: 0 });
  assert.equal(off.success, false, "A start outside the grid is refused.");
});

test("the draft Year 1 Week 3 missions are well formed", () => {
  assert.equal(isGuidedMissionDefinition(M.core), true);
  assert.equal(isGuidedMissionDefinition(M.support), true);
  assert.deepEqual(M.core.rules, { minCards: 6, maxCards: 8, minTurns: 2 });
  assert.deepEqual(M.support.rules, { minCards: 3, maxCards: 4, minTurns: 0 });
  assert.equal(M.core.mission.gridSize, 5);
  assert.equal(M.support.mission.gridSize, 4);
});

test("core mission: a correct 7-card, 2-turn program meets all rules", () => {
  const r = evaluateGuidedRobotRun(["right", "forward", "forward", "forward", "right", "forward", "forward"], M.core);
  assert.equal(r.status, "met-all-rules");
  assert.equal(r.cards, 7); assert.equal(r.turns, 2); assert.deepEqual(r.problems, []);
  assert.match(r.evidenceNote, /teacher to observe/, "The app never claims to verify understanding.");
});

test("core mission: reaching the finish outside the rules is reported honestly", () => {
  const short = evaluateGuidedRobotRun(["right", "forward", "forward", "forward", "right", "forward"], M.core);
  assert.equal(short.status, "not-yet", "6 cards ends one square short.");
  const tooManyCards = evaluateGuidedRobotRun(["right", "forward", "forward", "forward", "right", "forward", "forward", "beep", "beep"], M.core);
  assert.equal(tooManyCards.status, "reached-finish-outside-rules");
  assert.match(tooManyCards.problems.join(" "), /no more than 8 cards/);
  const fewTurnsWithBack = evaluateGuidedRobotRun(["right", "forward", "forward", "forward", "back", "back", "back", "forward"], M.core);
  assert.notEqual(fewTurnsWithBack.status, "met-all-rules");
});

test("core mission: too few cards or turns cannot be a success", () => {
  const r = evaluateGuidedRobotRun(["right", "forward", "forward", "forward", "right", "forward", "forward"].slice(0, 5), M.core);
  assert.notEqual(r.status, "met-all-rules");
  const withBeep = evaluateGuidedRobotRun(["right", "forward", "forward", "forward", "right", "forward", "forward", "beep"], M.core);
  assert.equal(withBeep.status, "met-all-rules", "A beep card is allowed and still counts as a card.");
});

test("core mission: leaving the grid is reported as blocked", () => {
  const r = evaluateGuidedRobotRun(["forward"], M.core);
  assert.equal(r.status, "blocked");
  assert.equal(r.run.trace.at(-1).blocked, true);
});

test("support mission: 4 cards on a 4x4 grid", () => {
  const ok = evaluateGuidedRobotRun(["right", "forward", "right", "forward"], M.support);
  assert.equal(ok.status, "met-all-rules");
  const tooLong = evaluateGuidedRobotRun(["right", "forward", "right", "forward", "beep"], M.support);
  assert.equal(tooLong.status, "reached-finish-outside-rules");
});

test("a malformed definition or program fails safely", () => {
  assert.equal(evaluateGuidedRobotRun(["forward"], null).status, "invalid-setup");
  assert.equal(evaluateGuidedRobotRun(["forward"], { ...M.core, rules: { minCards: 8, maxCards: 2, minTurns: 0 } }).status, "invalid-setup");
  assert.equal(evaluateGuidedRobotRun("forward", M.core).status, "invalid-setup");
  assert.equal(evaluateGuidedRobotRun(["forward"], { ...M.core, start: { x: 9, y: 0, direction: 0 } }).status, "invalid-setup");
});

test("draft missions cannot launch: nothing is registered as reviewed", () => {
  assert.equal(resolveGuidedRobotLaunch(y1w3, "arrow-cards-grid-core"), null);
  assert.equal(resolveGuidedRobotLaunch(y1w3, "arrow-cards-grid-support"), null);
});
