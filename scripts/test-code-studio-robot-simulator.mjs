#!/usr/bin/env node
import assert from "node:assert/strict";
import { test } from "node:test";
import { ROBOT_START, runRobotProgram } from "../lib/code-studio-v2/robot-simulator.ts";

test("the starter program reaches the goal", () => {
  const result = runRobotProgram(["forward", "forward", "right", "forward", "forward"]);
  assert.equal(result.success, true);
  assert.deepEqual(result.position, { x: 3, y: 1, direction: 1 });
  assert.equal(result.visited.length, 5);
  assert.match(result.message, /Mission complete/);
});

test("turning changes direction without changing position", () => {
  const result = runRobotProgram(["right"]);
  assert.deepEqual(result.position, { ...ROBOT_START, direction: 1 });
  assert.equal(result.visited.length, 1);
});

test("programs that leave the grid stop safely", () => {
  const result = runRobotProgram(["left", "left", "forward", "forward"]);
  assert.equal(result.success, false);
  assert.match(result.message, /leave the grid/);
  assert.deepEqual(result.position, { x: 1, y: 4, direction: 2 });
});

test("a valid but incorrect route explains that the goal was not reached", () => {
  const result = runRobotProgram(["forward"]);
  assert.equal(result.success, false);
  assert.match(result.message, /star is still waiting/);
});

test("beep commands produce feedback without moving the robot", () => {
  const result = runRobotProgram(["beep", "beep"]);
  assert.deepEqual(result.position, ROBOT_START);
  assert.match(result.message, /beeped 2 times/);
});

test("an empty program safely leaves the robot at the start", () => {
  const result = runRobotProgram([]);
  assert.equal(result.success, false);
  assert.deepEqual(result.position, ROBOT_START);
  assert.match(result.message, /star is still waiting/);
});
