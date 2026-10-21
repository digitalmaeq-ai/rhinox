#!/usr/bin/env node
import assert from "node:assert/strict";
import { isBuildRequired, isReviewedInteractiveLesson } from "../lib/code-studio-v2/lesson-gates.ts";

assert.equal(isReviewedInteractiveLesson("tmc-v3-15-nursery-1-t1-w1"), true);
assert.equal(isReviewedInteractiveLesson("tmc-v3-15-nursery-1-t1-w2"), false);
assert.equal(isReviewedInteractiveLesson(""), false);

for (const coreParts of ["Move + Code", "Think + Code", "Move, Code", "Think + Move + Code"]) {
  assert.equal(isBuildRequired(coreParts), false, `Build should be optional for: ${coreParts}`);
}
for (const coreParts of ["Build", "Move + Build", "Build + Code", "Move, Build, Code", "move + BUILD"]) {
  assert.equal(isBuildRequired(coreParts), true, `Build should be required for: ${coreParts}`);
}
for (const coreParts of ["Builder + Code", "Rebuild + Move", ""]) {
  assert.equal(isBuildRequired(coreParts), false, `Build should not match as a substring: ${coreParts}`);
}

console.log("Lesson gate checks passed: reviewed lesson allowlist and required/optional Build rules.");
