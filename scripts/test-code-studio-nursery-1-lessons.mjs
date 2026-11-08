#!/usr/bin/env node
// Every Nursery 1 week (3 terms x 13 weeks) has a complete, consistent interactive lesson.
import assert from "node:assert/strict";
import { CURRICULUM_ACTIVITIES } from "../lib/code-studio-v2/curriculum.ts";
import { getLessonSpec, isLessonSpecConsistent } from "../lib/code-studio-v2/lesson-specs.ts";
import { isBuildRequired } from "../lib/code-studio-v2/lesson-gates.ts";

const nursery = CURRICULUM_ACTIVITIES.filter((item) => item.level === "Nursery 1");
assert.equal(nursery.length, 39, "Nursery 1 must have 39 curriculum records");
assert.equal(new Set(nursery.map((item) => item.id)).size, 39, "record ids are unique");
assert.deepEqual(nursery.map((item) => `${item.term}-${item.week}`),
  [1, 2, 3].flatMap((t) => Array.from({ length: 13 }, (_, i) => `${t}-${i + 1}`)), "records are in teaching order");

const correctIndexes = new Set();
for (const activity of nursery) {
  const spec = getLessonSpec(activity.id);
  const tag = `T${activity.term}W${activity.week}`;
  assert.ok(spec, `${tag} has a lesson spec`);
  assert.equal(spec.status, "reviewed", tag);
  assert.equal(isLessonSpecConsistent(spec, activity), true, `${tag} is consistent`);

  const order = spec.steps.code.exercise;
  assert.equal(order.kind, "ordering", tag);
  assert.ok(order.items.length >= 3 && order.items.length <= 4, `${tag}: 3 or 4 cards`);
  const handWritten = activity.term === 1 && activity.week === 1; // the original Week 1 lesson keeps its own wording
  if (!handWritten) assert.notDeepEqual(order.items.map((i) => i.id), order.expectedOrder, `${tag}: cards are not shown already in order`);

  const practice = spec.steps.check.exercise;
  assert.equal(practice.kind, "choice", tag);
  assert.equal(practice.options.length, 4, `${tag}: four options`);
  correctIndexes.add(practice.options.findIndex((o) => o.id === practice.correctOptionId));

  assert.equal(isBuildRequired(activity.coreParts), !/no evidence is required/i.test(spec.steps.build.evidence), `${tag}: Build wording matches core parts`);
  assert.match(spec.steps.check.evidence, /observ/i, tag);
  if (!handWritten) {
    assert.ok(spec.display, `${tag} has its own screen text`);
    assert.equal(Object.keys(spec.display.icons).length, order.items.length, `${tag}: every card has a picture`);
  }
  assert.doesNotMatch(JSON.stringify(spec), /\bpassed\b|mastered|undefined/i, tag);
}
assert.ok(correctIndexes.size >= 3, "correct answers are spread across the options");
console.log("Nursery 1 lesson checks passed: 39 reviewed lessons, all consistent.");
