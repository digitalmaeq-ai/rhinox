#!/usr/bin/env node
import assert from "node:assert/strict";
import { canAdvanceLessonStep, describeLessonOutcome } from "../lib/code-studio-v2/lesson-progress.ts";

const empty = {};
assert.equal(canAdvanceLessonStep("think", empty), true, "Thinking can begin without a prior gate.");
assert.equal(canAdvanceLessonStep("move", empty), false, "Movement requires learner confirmation.");
assert.equal(canAdvanceLessonStep("move", { movePracticed: true }), true);

// Code: correct ordering OR an explicit, recorded adult-assisted finish. No dead end.
assert.equal(canAdvanceLessonStep("code", empty), false, "Coding requires a result or an assisted finish.");
assert.equal(canAdvanceLessonStep("code", { orderingCorrect: false }), false);
assert.equal(canAdvanceLessonStep("code", { orderingCorrect: true }), true);
assert.equal(canAdvanceLessonStep("code", { orderingAssisted: true }), true, "An assisted finish lets the learner continue.");
assert.equal(canAdvanceLessonStep("code", { orderingAssisted: false }), false);

assert.equal(canAdvanceLessonStep("build", { buildRequired: false }), true, "Optional Build can be skipped.");
assert.equal(canAdvanceLessonStep("build", { buildRequired: true }), false, "Required Build cannot be skipped.");
assert.equal(canAdvanceLessonStep("build", { buildRequired: true, buildChoiceSelected: true }), true,
  "Required Build needs its selected materials and explicit completion evidence.");
assert.equal(canAdvanceLessonStep("create", empty), false, "Create requires learner confirmation.");
assert.equal(canAdvanceLessonStep("create", { creationCompleted: true }), true);

// Check: the curriculum check is adult observation; extra practice never gates it.
assert.equal(canAdvanceLessonStep("check", empty), false, "Check needs an adult observation or a deferral.");
assert.equal(canAdvanceLessonStep("check", { choicePassed: true }), false, "Extra practice is not the official check.");
assert.equal(canAdvanceLessonStep("check", { teacherObservation: "confirmed" }), true);
assert.equal(canAdvanceLessonStep("check", { teacherObservation: "deferred" }), true, "A postponed teacher check does not trap the learner.");

// Outcomes are truthful.
const full = { movePracticed: true, creationCompleted: true };
let o = describeLessonOutcome({ ...full, orderingCorrect: true, teacherObservation: "confirmed" });
assert.equal(o.overall, "passed");
assert.equal(o.sequence, "passed");
assert.equal(o.check, "adult-confirmed");

o = describeLessonOutcome({ ...full, orderingAssisted: true, teacherObservation: "confirmed" });
assert.equal(o.sequence, "completed-with-assistance");
assert.equal(o.overall, "completed-with-assistance", "Assistance must never be recorded as a pass.");

o = describeLessonOutcome({ ...full, orderingCorrect: true, teacherObservation: "deferred" });
assert.equal(o.overall, "awaiting-teacher-confirmation", "A deferred teacher check is never recorded as confirmed.");
assert.equal(o.check, "awaiting-teacher-confirmation");

o = describeLessonOutcome({ ...full, orderingCorrect: true, orderingAssisted: true, teacherObservation: "confirmed" });
assert.equal(o.sequence, "passed", "Independent success wins if both flags are somehow set.");

o = describeLessonOutcome({ ...full, teacherObservation: "confirmed" });
assert.equal(o.sequence, "not-completed");
assert.equal(o.overall, "not-completed", "No sequence result means not completed.");

o = describeLessonOutcome({ orderingCorrect: true, teacherObservation: "confirmed" });
assert.equal(o.selfReportedParts, "not-completed");
assert.equal(o.overall, "not-completed", "Skipping movement or creation is not a completion.");

o = describeLessonOutcome({ ...full, orderingCorrect: true, teacherObservation: "confirmed", choicePassed: false });
assert.equal(o.extraPractice, "not-passed");
assert.equal(o.overall, "passed", "Extra practice does not affect the official outcome.");
o = describeLessonOutcome({ ...full, orderingCorrect: true, teacherObservation: "confirmed", choicePassed: true });
assert.equal(o.extraPractice, "passed");

assert.equal(describeLessonOutcome({}).overall, "not-completed");
console.log("Lesson progression checks passed: every stage has a way forward, assistance and deferral are never recorded as a pass, and extra practice never replaces the teacher check.");
