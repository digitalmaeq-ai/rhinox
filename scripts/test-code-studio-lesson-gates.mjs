#!/usr/bin/env node
import assert from "node:assert/strict";
import { CURRICULUM_ACTIVITIES } from "../lib/code-studio-v2/curriculum.ts";
import { isBuildRequired } from "../lib/code-studio-v2/lesson-gates.ts";
import { canAdvanceLessonStep } from "../lib/code-studio-v2/lesson-progress.ts";
import { canAttemptExercise, isExerciseDefinition, scoreChoiceAttempt, scoreOrderingAttempt } from "../lib/code-studio-v2/exercise-types.ts";
import { getLessonSpec, isLessonSpecConsistent, isReviewedInteractiveLesson } from "../lib/code-studio-v2/lesson-specs.ts";

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

assert.equal(canAdvanceLessonStep("think", {}), true, "Think is an instructional introduction.");
assert.equal(canAdvanceLessonStep("move", { movePracticed: false }), false);
assert.equal(canAdvanceLessonStep("move", { movePracticed: true }), true);
assert.equal(canAdvanceLessonStep("code", { orderingCorrect: false }), false);
assert.equal(canAdvanceLessonStep("code", { orderingCorrect: true }), true);
assert.equal(canAdvanceLessonStep("build", { buildRequired: false, buildChoiceSelected: false }), true, "Optional build must not block progression.");
assert.equal(canAdvanceLessonStep("build", {}), false, "Missing build requirement data must fail closed.");
assert.equal(canAdvanceLessonStep("build", { buildRequired: true, buildChoiceSelected: false }), false);
assert.equal(canAdvanceLessonStep("build", { buildRequired: true, buildChoiceSelected: true }), true);
assert.equal(canAdvanceLessonStep("create", { creationCompleted: false }), false);
assert.equal(canAdvanceLessonStep("create", { creationCompleted: true }), true);
assert.equal(canAdvanceLessonStep("check", { choicePassed: false }), false);
assert.equal(canAdvanceLessonStep("check", { choicePassed: true }), true);
console.log("Lesson progression checks passed: each stage requires its defined evidence, while optional build never blocks progression.");


const orderingExercise = spec.steps.code.exercise;
assert.ok(orderingExercise, "The reviewed Code step must bind a concrete exercise contract.");
assert.equal(isExerciseDefinition(orderingExercise), true);
assert.equal(orderingExercise.kind, "ordering");
assert.deepEqual(orderingExercise.expectedOrder, ["wake-up", "brush-teeth", "eat-breakfast"]);
assert.equal(orderingExercise.maxAttempts, 3);
assert.equal(orderingExercise.retryPolicy, "allow-until-limit");
assert.equal(orderingExercise.pointsAvailable, 1);
assert.equal(orderingExercise.evidenceMode, "automatic");
assert.equal(orderingExercise.accessibility.keyboardOperable, true);
assert.equal(isExerciseDefinition({ ...orderingExercise, expectedOrder: ["wake-up", "wake-up", "eat-breakfast"] }), false);
assert.equal(isExerciseDefinition({ ...orderingExercise, evidenceMode: "learner-confirmed" }), false, "Auto-scored ordering must declare automatic evidence.");
assert.equal(isExerciseDefinition({ ...orderingExercise, maxAttempts: 0 }), false);
assert.equal(isExerciseDefinition({ ...orderingExercise, scoring: { ...orderingExercise.scoring, partialCredit: true } }), false, "Partial credit must be rejected until the scoring engine implements it.");
assert.equal(isExerciseDefinition({ ...orderingExercise, scoring: { ...orderingExercise.scoring, incorrectPoints: 0.5 } }), false, "Incorrect answers must not earn points while partial credit is unsupported.");
assert.equal(isExerciseDefinition({ ...orderingExercise, scoring: { ...orderingExercise.scoring, incorrectPoints: orderingExercise.pointsAvailable + 1 } }), false, "Incorrect-answer points cannot exceed the exercise maximum.");
assert.equal(isExerciseDefinition({
  id: "bad-choice", kind: "choice", prompt: "Choose", instructions: "Pick one", hint: "Think",
  fallback: "Point to an answer", evidenceMode: "automatic", maxAttempts: 2,
  retryPolicy: "single-attempt", pointsAvailable: 1,
  accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
  options: [{ id: "a", label: "A" }, { id: "b", label: "B" }], correctOptionId: "missing",
}), false);
console.log("Exercise contract checks passed: ordering data, scoring, attempts, evidence mode, accessibility, and invalid-contract rejection.");

assert.deepEqual(scoreOrderingAttempt(
  ["wake-up", "brush-teeth", "eat-breakfast"], orderingExercise,
), { correct: true, points: 1 });
assert.deepEqual(scoreOrderingAttempt(
  ["brush-teeth", "wake-up", "eat-breakfast"], orderingExercise,
), { correct: false, points: 0 });
assert.deepEqual(scoreOrderingAttempt(
  ["wake-up", "brush-teeth"], orderingExercise,
), { correct: false, points: 0 }, "Incomplete orders must not receive credit.");
assert.equal(canAttemptExercise(0, orderingExercise), true);
assert.equal(canAttemptExercise(2, orderingExercise), true);
assert.equal(canAttemptExercise(3, orderingExercise), false);
assert.equal(canAttemptExercise(-1, orderingExercise), false);
assert.equal(canAttemptExercise(0, { ...orderingExercise, retryPolicy: "single-attempt" }), true);
assert.equal(canAttemptExercise(1, { ...orderingExercise, retryPolicy: "single-attempt" }), false);
console.log("Ordering engine checks passed: exact match scoring, incorrect/incomplete answers, and retry limits.");

const choiceExercise = spec.steps.check.exercise;
assert.ok(choiceExercise, "The reviewed Check step must bind a concrete choice exercise contract.");
assert.equal(isExerciseDefinition(choiceExercise), true);
assert.equal(choiceExercise.kind, "choice");
assert.equal(choiceExercise.correctOptionId, "right-order");
assert.equal(choiceExercise.maxAttempts, 3);
assert.deepEqual(scoreChoiceAttempt("right-order", choiceExercise), { correct: true, points: 1 });
assert.deepEqual(scoreChoiceAttempt("any-order", choiceExercise), { correct: false, points: 0 });
assert.deepEqual(scoreChoiceAttempt("", choiceExercise), { correct: false, points: 0 }, "An empty choice must never earn points.");
assert.equal(isExerciseDefinition({ ...choiceExercise, correctOptionId: "missing-option" }), false);
assert.equal(isExerciseDefinition({ ...choiceExercise, evidenceMode: "teacher-observed" }), false, "Auto-scored choice must declare automatic evidence.");
console.log("Multiple-choice checks passed: reviewed choice contract, correct/incorrect scoring, and invalid answer rejection.");

assert.equal(isLessonSpecConsistent({ ...spec, estimatedMinutes: 0 }, activity), false, "Invalid duration must fail the lesson review gate.");
assert.equal(isLessonSpecConsistent({ ...spec, objective: "   " }, activity), false, "Blank objectives must fail the lesson review gate.");
assert.equal(isLessonSpecConsistent({ ...spec, accessibility: { ...spec.accessibility, keyboardOperable: false } }, activity), false, "Lessons must remain keyboard operable.");
assert.equal(isLessonSpecConsistent({ ...spec, steps: { ...spec.steps, think: { ...spec.steps.think, evidence: "" } } }, activity), false, "Every step must define evidence.");
assert.equal(isLessonSpecConsistent({ ...spec, steps: { ...spec.steps, code: { ...spec.steps.code, exercise: { ...orderingExercise, expectedOrder: ["wake-up", "wake-up", "eat-breakfast"] } } } }, activity), false, "Invalid embedded exercise contracts must block a lesson.");
assert.equal(isLessonSpecConsistent(spec, { ...activity, coreParts: "Move + Build + Code" }), false, "A required Build step cannot be labelled optional.");
console.log("Lesson consistency gate checks passed: malformed content, accessibility regressions, invalid exercises, and Build/core-part mismatches are rejected.");
