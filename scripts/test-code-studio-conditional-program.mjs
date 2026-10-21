#!/usr/bin/env node
import assert from "node:assert/strict";
import { test } from "node:test";
import { ROBOT_START } from "../lib/code-studio-v2/robot-simulator.ts";
import { runConditionalRobotProgram } from "../lib/code-studio-v2/conditional-program.ts";

test("evaluates a condition against live state after prior commands", () => {
  const result = runConditionalRobotProgram([
    { type: "command", command: "forward", sourceLine: 1 },
    { type: "if", condition: "atGoal", sourceLine: 2, thenBranch: [{ type: "command", command: "beep", sourceLine: 3 }], elseBranch: [{ type: "command", command: "right", sourceLine: 5 }] },
  ]);
  const branch = result.events[1];
  assert.equal(branch.type, "branch");
  if (branch.type === "branch") { assert.equal(branch.result, false); assert.match(branch.explanation, /no.*else branch runs/); }
  assert.deepEqual(result.position, { ...ROBOT_START, y: 2, direction: 1 });
  assert.equal(result.events.filter((event) => event.type === "command").length, 2);
});

test("runs only the selected branch and explains a true condition", () => {
  const result = runConditionalRobotProgram([{ type: "if", condition: "facingNorth", sourceLine: 1, thenBranch: [{ type: "command", command: "beep", sourceLine: 2 }], elseBranch: [{ type: "command", command: "left", sourceLine: 4 }] }]);
  const branch = result.events[0];
  assert.equal(branch.type, "branch");
  if (branch.type === "branch") assert.equal(branch.result, true);
  assert.equal(result.events.filter((event) => event.type === "command").length, 1);
  assert.deepEqual(result.position, ROBOT_START);
});

test("stops safely when a selected branch attempts to leave the grid", () => {
  const result = runConditionalRobotProgram([{ type: "command", command: "left", sourceLine: 1 }, { type: "command", command: "left", sourceLine: 2 }, { type: "command", command: "forward", sourceLine: 3 }, { type: "if", condition: "facingSouth", sourceLine: 4, thenBranch: [{ type: "command", command: "forward", sourceLine: 5 }], elseBranch: [] }]);
  assert.equal(result.success, false);
  assert.match(result.message, /stopped safely/);
});

test("bounds execution at 100 commands", () => {
  const result = runConditionalRobotProgram(Array.from({ length: 101 }, (_, i) => ({ type: "command", command: "beep", sourceLine: i + 1 })));
  assert.equal(result.events.filter((event) => event.type === "command").length, 100);
  assert.match(result.message, /safety limit/);
});
