#!/usr/bin/env node
import assert from "node:assert/strict";
import { canAdvanceLessonStep } from "../lib/code-studio-v2/lesson-progress.ts";

const empty = {};
assert.equal(canAdvanceLessonStep("think", empty), true, "Thinking can begin without a prior gate.");
assert.equal(canAdvanceLessonStep("move", empty), false, "Movement requires learner confirmation.");
assert.equal(canAdvanceLessonStep("move", { movePracticed: true }), true);
assert.equal(canAdvanceLessonStep("code", empty), false, "Coding requires a correct ordering result.");
assert.equal(canAdvanceLessonStep("code", { orderingCorrect: false }), false);
assert.equal(canAdvanceLessonStep("code", { orderingCorrect: true }), true);
assert.equal(canAdvanceLessonStep("build", { buildRequired: false }), true, "Optional Build can be skipped.");
assert.equal(canAdvanceLessonStep("build", { buildRequired: true }), false, "Required Build cannot be skipped.");
assert.equal(canAdvanceLessonStep("build", { buildRequired: true, buildChoiceSelected: true }), true,
  "Required Build needs its selected materials and explicit completion evidence.");
assert.equal(canAdvanceLessonStep("create", empty), false, "Create requires learner confirmation.");
assert.equal(canAdvanceLessonStep("create", { creationCompleted: true }), true);
assert.equal(canAdvanceLessonStep("check", empty), false, "Check requires a passed knowledge check.");
assert.equal(canAdvanceLessonStep("check", { choicePassed: false }), false);
assert.equal(canAdvanceLessonStep("check", { choicePassed: true }), true);
console.log("Lesson progression checks passed: required evidence gates each step and optional Build can be skipped.");
