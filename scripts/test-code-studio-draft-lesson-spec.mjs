#!/usr/bin/env node
import assert from "node:assert/strict";
import { DRAFT_YEAR1_T1_W3, DRAFT_NURSERY_1_T1_W2 } from "../lib/code-studio-v2/lesson-specs-draft.ts";
import { getLessonSpec, isLessonSpecConsistent, isReviewedInteractiveLesson } from "../lib/code-studio-v2/lesson-specs.ts";
import { getCurriculumActivity } from "../lib/code-studio-v2/curriculum.ts";

for (const draft of [DRAFT_YEAR1_T1_W3, DRAFT_NURSERY_1_T1_W2]) {
  const id = draft.activityId;
  const activity = getCurriculumActivity(id);
  assert.ok(activity, "The draft must point at a real curriculum record: " + id);
  assert.equal(getLessonSpec(id), undefined, "A draft spec must not be served by the reviewed registry.");
  assert.equal(isReviewedInteractiveLesson(id), false);
  assert.equal(isLessonSpecConsistent(draft, activity), false, "A draft is never consistent for launch.");
  // Everything except the status must already be valid, so a reviewer's approval is the only missing step.
  assert.equal(isLessonSpecConsistent({ ...draft, status: "reviewed" }, activity), true, id);
  assert.match(draft.steps.check.evidence, /observation/i);
  assert.doesNotMatch(JSON.stringify(draft), /\bpassed\b|mastered/i);
}
console.log("Draft lesson spec checks passed: unreviewed, unlaunchable and otherwise complete.");
