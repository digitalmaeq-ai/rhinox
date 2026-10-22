#!/usr/bin/env node
import assert from "node:assert/strict";
import { isGuidedRobotLaunch, resolveGuidedRobotLaunch } from "../lib/code-studio-v2/guided-launch.ts";

const nursery = "tmc-v3-15-nursery-1-t1-w1";
const validShape = {
  activityId: "reviewed-activity", reviewedTaskId: "reviewed-task",
  adapter: "robot-blocks", starterProgram: ["forward", "right"],
  successCriteria: ["Observe the robot's actual position."],
  returnPath: "/coding-robotics/code-studio/learn",
};
assert.equal(isGuidedRobotLaunch(validShape), true);
assert.equal(isGuidedRobotLaunch({ ...validShape, starterProgram: ["forward", "back"] }), true, "The back instruction is a valid command.");
assert.equal(isGuidedRobotLaunch({ ...validShape, adapter: "python" }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, returnPath: "https://example.com" }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, starterProgram: ["eval"] }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, starterProgram: Array(101).fill("forward") }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, successCriteria: [] }), false);
assert.equal(isGuidedRobotLaunch({ ...validShape, successCriteria: ["  "] }), false);
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
