#!/usr/bin/env node
import assert from "node:assert/strict";
import { DRAFT_YEAR1_T1_W3 } from "../lib/code-studio-v2/lesson-specs-draft.ts";
import { getLessonSpec, isLessonSpecConsistent, isReviewedInteractiveLesson } from "../lib/code-studio-v2/lesson-specs.ts";
import { getCurriculumActivity } from "../lib/code-studio-v2/curriculum.ts";

const id = DRAFT_YEAR1_T1_W3.activityId;
const activity = getCurriculumActivity(id);
assert.ok(activity, "The draft must point at a real curriculum record.");
assert.equal(getLessonSpec(id), undefined, "A draft spec must not be served by the reviewed registry.");
assert.equal(isReviewedInteractiveLesson(id), false);
assert.equal(isLessonSpecConsistent(DRAFT_YEAR1_T1_W3, activity), false, "A draft is never consistent for launch.");
// Everything except the status must already be valid, so a reviewer's approval is the only missing step.
assert.equal(isLessonSpecConsistent({ ...DRAFT_YEAR1_T1_W3, status: "reviewed" }, activity), true);
assert.match(DRAFT_YEAR1_T1_W3.steps.check.evidence, /observation/i);
assert.doesNotMatch(JSON.stringify(DRAFT_YEAR1_T1_W3), /\bpassed\b|mastered/i);
console.log("Draft lesson spec checks passed: unreviewed, unlaunchable and otherwise complete.");
