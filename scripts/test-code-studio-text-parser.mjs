#!/usr/bin/env node
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRobotTextProgram } from "../lib/code-studio-v2/text-code-parser.ts";

test("parses supported commands in order", () => {
  const result = parseRobotTextProgram([
    "// Guide RhinoBot to the star",
    "robot.moveForward();",
    "robot.moveForward()",
    "robot.turnRight();",
    "robot.beep()",
  ].join("\n"));
  assert.equal(result.ok, true);
  if (result.ok) {\n    assert.deepEqual(result.commands, ["forward", "forward", "right", "beep"]);\n    assert.deepEqual(result.sourceLines, [2, 3, 4, 5]);\n  }
});

test("ignores blank lines and comments", () => {
  const result = parseRobotTextProgram("\n// comment\n robot.turnLeft(); // turn\n");
  assert.equal(result.ok, true);
  if (result.ok) {\n    assert.deepEqual(result.commands, ["left"]);\n    assert.deepEqual(result.sourceLines, [3]);\n  }
});

test("rejects unsupported syntax and reports the line", () => {
  const result = parseRobotTextProgram("robot.moveForward();\nconsole.log('hello');");
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.line, 2);
    assert.match(result.message, /Arbitrary JavaScript is not allowed/);
  }
});

test("rejects attempts to call unlisted functions", () => {
  const result = parseRobotTextProgram("robot.deleteEverything()");
  assert.equal(result.ok, false);
});

test("an empty program parses to no commands", () => {
  const result = parseRobotTextProgram("// no commands yet");
  assert.deepEqual(result, { ok: true, commands: [], sourceLines: [] });
});
