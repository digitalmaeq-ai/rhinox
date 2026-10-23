#!/usr/bin/env node
import assert from "node:assert/strict";
import { runRobotProgram } from "../lib/code-studio-v2/robot-simulator.ts";
import { getRobotMissionFeedback } from "../lib/code-studio-v2/robot-mission-feedback.ts";

const complete = getRobotMissionFeedback(runRobotProgram(["forward", "forward", "right", "forward", "forward"]));
assert.equal(complete.status, "complete");
assert.match(complete.nextAction, /trace/);
const blocked = getRobotMissionFeedback(runRobotProgram(["left", "left", "forward", "forward"]));
assert.equal(blocked.status, "blocked");
assert.match(blocked.nextAction, /instruction 4/);
const incomplete = getRobotMissionFeedback(runRobotProgram(["forward"]));
assert.equal(incomplete.status, "not-yet");
assert.match(incomplete.nextAction, /final position/);
const empty = getRobotMissionFeedback(runRobotProgram([]));
assert.equal(empty.status, "not-yet");
assert.match(empty.nextAction, /Add a movement instruction/);
console.log("Robot mission feedback tests passed: complete, blocked, incomplete and empty programs.");
