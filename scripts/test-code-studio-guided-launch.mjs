#!/usr/bin/env node
import assert from "node:assert/strict";
import { resolveGuidedRobotLaunch } from "../lib/code-studio-v2/guided-launch.ts";

const nursery = "tmc-v3-15-nursery-1-t1-w1";
assert.equal(resolveGuidedRobotLaunch(nursery, "morning-routine-order"), null,
  "An unplugged ordering exercise must not silently launch the robot simulator.");
assert.equal(resolveGuidedRobotLaunch(nursery, "unknown-task"), null);
assert.equal(resolveGuidedRobotLaunch("tmc-v3-15-nursery-1-t1-w2", "unknown-task"), null);
assert.equal(resolveGuidedRobotLaunch("", ""), null);
assert.equal(resolveGuidedRobotLaunch(nursery, "__proto__"), null,
  "Prototype property names must never become launchable tasks.");
assert.equal(resolveGuidedRobotLaunch(null, "unknown-task"), null);
console.log("Guided launch boundary checks passed: unreviewed, mismatched and unplugged tasks fail closed.");
