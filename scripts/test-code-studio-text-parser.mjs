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
  if (result.ok) {
    assert.deepEqual(result.commands, ["forward", "forward", "right", "beep"]);
    assert.deepEqual(result.sourceLines, [2, 3, 4, 5]);
  }
});

test("parses the back instruction and still rejects look-alikes", () => {
  const ok = parseRobotTextProgram("robot.moveBack()\nrobot.moveBack();");
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(ok.commands, ["back", "back"]);
  for (const bad of ["robot.moveBackward()", "robot.back()", "robot.moveBack(2)", "moveBack()", "robot.moveBack().x"]) {
    assert.equal(parseRobotTextProgram(bad).ok, false, `${bad} must be rejected`);
  }
});

test("ignores blank lines and comments", () => {
  const result = parseRobotTextProgram("\n// comment\n robot.turnLeft(); // turn\n");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.commands, ["left"]);
    assert.deepEqual(result.sourceLines, [3]);
  }
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

test("expands a bounded repeat block and preserves original source lines", () => {
  const result = parseRobotTextProgram([
    "repeat(3) {",
    "  robot.moveForward()",
    "  robot.turnRight()",
    "}",
  ].join("\n"));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.commands, ["forward", "right", "forward", "right", "forward", "right"]);
    assert.deepEqual(result.sourceLines, [2, 3, 2, 3, 2, 3]);
    assert.deepEqual(result.repeatPaths, [[1], [1], [2], [2], [3], [3]]);
  }
});

test("rejects repeat counts outside the safe range", () => {
  const result = parseRobotTextProgram("repeat(11) {\nrobot.moveForward()\n}");
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.line, 1);
    assert.match(result.message, /between 1 and 10/);
  }
});

test("rejects repeat blocks without a closing brace", () => {
  const result = parseRobotTextProgram("repeat(2) {\nrobot.moveForward()");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /missing its closing brace/);
});

test("rejects unmatched closing braces", () => {
  const result = parseRobotTextProgram("robot.moveForward()\n}");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /no matching repeat block/);
});

test("caps expanded instruction count", () => {
  const body = Array.from({ length: 11 }, () => "robot.moveForward()").join("\n");
  const result = parseRobotTextProgram("repeat(10) {\n" + body + "\n}");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /more than 100 instructions/);
});

test("supports nested repeat blocks within the documented depth limit", () => {
  const result = parseRobotTextProgram([
    "repeat(2) {",
    "  repeat(2) {",
    "    robot.beep()",
    "  }",
    "}",
  ].join("\n"));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.commands, ["beep", "beep", "beep", "beep"]);
    assert.deepEqual(result.sourceLines, [3, 3, 3, 3]);
    assert.deepEqual(result.repeatPaths, [[1, 1], [1, 2], [2, 1], [2, 2]]);
  }
});

test("rejects repeat nesting beyond the supported depth", () => {
  const result = parseRobotTextProgram([
    "repeat(2) {",
    " repeat(2) {",
    "  repeat(2) {",
    "   repeat(2) {",
    "    robot.beep()",
    "   }",
    "  }",
    " }",
    "}",
  ].join("\n"));
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /nested only 3 levels deep/);
});

test("rejects repeat syntax without an opening brace", () => {
  const result = parseRobotTextProgram("repeat(2)\nrobot.beep()");
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.line, 1);
    assert.match(result.message, /Use repeat\(3\)/);
  }
});

test("accepts exactly 100 expanded instructions", () => {
  const body = Array.from({ length: 10 }, () => "robot.beep()").join("\n");
  const result = parseRobotTextProgram("repeat(10) {\n" + body + "\n}");
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.commands.length, 100);
});

test("an empty program parses to no commands", () => {
  const result = parseRobotTextProgram("// no commands yet");
  assert.deepEqual(result, { ok: true, commands: [], sourceLines: [] });
});

test("rejects oversized source before parsing", () => {
  const result = parseRobotTextProgram("//" + "x".repeat(20_000));
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.message, /limited to 20000 characters/);
});

test("rejects excessive blank or comment lines", () => {
  const result = parseRobotTextProgram(Array.from({ length: 501 }, () => "// comment").join("\n"));
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.line, 501);
    assert.match(result.message, /limited to 500 lines/);
  }
});
