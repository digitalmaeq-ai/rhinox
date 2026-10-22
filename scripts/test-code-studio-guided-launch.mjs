#!/usr/bin/env node
import assert from "node:assert/strict";
import { isGuidedRobotLaunch, resolveGuidedRobotLaunch } from "../lib/code-studio-v2/guided-launch.ts";

const nursery = "tmc-v3-15-nursery-1-t1-w1";
const validShape = {
  activityId: "reviewed-activity", reviewedTaskId: "reviewed-task",
  adapter: "robot-blocks", starterProgram: ["forward", "right"],
  successCriteria: ["Observe the robot's actual position."],
  returnPath: "/coding-robotics/code-studio/learn",
  mission: { mission: { gridSize: 5, goal: { x: 3, y: 2 } }, start: { x: 0, y: 0, direction: 0 }, rules: { minCards: 6, maxCards: 8, minTurns: 2 } },
  characterName: "Ilana", availableCommands: ["forward", "back", "left", "right"],
};
assert.equal(isGuidedRobotLaunch(validShape), true);
assert.equal(isGuidedRobotLaunch({ ...validShape, starterProgram: ["forward", "back"] }), true, "The back instruction is a valid command.");
assert.equal(isGuidedRobotLaunch({ ...validShape, adapter: "python" }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, returnPath: "https://example.com" }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, starterProgram: ["eval"] }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, starterProgram: Array(101).fill("forward") }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, successCriteria: [] }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, successCriteria: ["  "] }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, mission: undefined }), false, "A launch needs a mission definition.");
assert.equal(isGuidedRobotLaunch({ ...validShape, mission: { ...validShape.mission, start: { x: 9, y: 0, direction: 0 } } }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, characterName: " " }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, availableCommands: [] }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, availableCommands: ["forward", "forward"] }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, availableCommands: ["eval"] }), false);
assert.equal(isGuidedRobotLaunch(null), false);
assert.equal(resolveGuidedRobotLaunch(nursery, "morning-routine-order"), null,
  "An unplugged ordering exercise must not silently launch the robot simulator.");
assert.equal(resolveGuidedRobotLaunch(nursery, "unknown-task"), null);
assert.equal(resolveGuidedRobotLaunch("tmc-v3-15-nursery-1-t1-w2", "unknown-task"), null);
assert.equal(resolveGuidedRobotLaunch("", ""), null);
assert.equal(resolveGuidedRobotLaunch(nursery, "__proto__"), null,
  "Prototype property names must never become launchable tasks.");
assert.equal(resolveGuidedRobotLaunch(null, "unknown-task"), null);
console.log("Guided launch boundary checks passed: invalid contracts and unreviewed tasks fail closed.");
