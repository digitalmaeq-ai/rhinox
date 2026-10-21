#!/usr/bin/env node
import assert from "node:assert/strict";
import { CURRICULUM_ACTIVITIES } from "../lib/code-studio-v2/curriculum.ts";
import { isBuildRequired, isReviewedInteractiveLesson } from "../lib/code-studio-v2/lesson-gates.ts";
import { getLessonSpec, isLessonSpecConsistent } from "../lib/code-studio-v2/lesson-specs.ts";

const activity = CURRICULUM_ACTIVITIES.find((item) => item.id === "tmc-v3-15-nursery-1-t1-w1");
assert.ok(activity, "The reviewed lesson must exist in the curriculum records.");
const spec = getLessonSpec(activity.id);
assert.ok(spec, "The reviewed lesson must have a specific exercise specification.");
assert.equal(spec.status, "reviewed");
assert.equal(isReviewedInteractiveLesson(activity.id), true);
assert.equal(isReviewedInteractiveLesson("tmc-v3-15-nursery-1-t1-w2"), false);
assert.equal(isReviewedInteractiveLesson(""), false);
assert.equal(isLessonSpecConsistent(spec, activity), true);
assert.equal(spec.estimatedMinutes, 10);
assert.ok(spec.objective.length > 0);
assert.ok(spec.successCriteria.length >= 3);

const expectedSteps = ["think", "move", "code", "build", "create", "check"];
for (const step of expectedSteps) {
  const details = spec.steps[step];
  assert.ok(details, `Missing reviewed lesson step: ${step}`);
  assert.ok(details.instruction.trim(), `Missing learner instruction for ${step}`);
  assert.ok(details.task.trim(), `Missing task definition for ${step}`);
  assert.ok(details.evidence.trim(), `Missing evidence definition for ${step}`);
  assert.ok(details.hint.trim(), `Missing hint for ${step}`);
  assert.ok(details.fallback.trim(), `Missing fallback for ${step}`);
}
assert.equal(spec.accessibility.keyboardOperable, true);
assert.equal(spec.accessibility.touchOperable, true);
assert.equal(spec.accessibility.reducedMotionSafe, true);
assert.equal(spec.accessibility.textInstructionsAvailable, true);
assert.equal(isBuildRequired(activity.coreParts), false, "Build is optional for this Move + Code week.");
assert.match(spec.steps.build.evidence, /not a core part/i);

for (const coreParts of ["Move + Code", "Think + Code", "Move, Code", "Think + Move + Code"]) {
  assert.equal(isBuildRequired(coreParts), false, `Build should be optional for: ${coreParts}`);
}
for (const coreParts of ["Build", "Move + Build", "Build + Code", "Move, Build, Code", "move + BUILD"]) {
  assert.equal(isBuildRequired(coreParts), true, `Build should be required for: ${coreParts}`);
}
for (const coreParts of ["Builder + Code", "Rebuild + Move", ""]) {
  assert.equal(isBuildRequired(coreParts), false, `Build should not match as a substring: ${coreParts}`);
}

console.log("Lesson spec checks passed: reviewed allowlist, six step specifications, evidence, hints, fallbacks, accessibility, and core-part gating.");
