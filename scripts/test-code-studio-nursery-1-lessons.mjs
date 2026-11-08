#!/usr/bin/env node
// Every Nursery 1 week (3 terms x 13 weeks) has a complete, consistent interactive lesson.
import assert from "node:assert/strict";
import { CURRICULUM_ACTIVITIES } from "../lib/code-studio-v2/curriculum.ts";
import { getLessonSpec, isLessonSpecConsistent } from "../lib/code-studio-v2/lesson-specs.ts";
import { isBuildRequired } from "../lib/code-studio-v2/lesson-gates.ts";
import { scoreOrderingAttempt } from "../lib/code-studio-v2/exercise-types.ts";
import { existsSync } from "node:fs";

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

// Every book picture the lessons use is in /public.
for (const activity of nursery) {
  const spec = getLessonSpec(activity.id);
  const d = spec.display;
  if (!d) continue;
  const pictures = [...Object.values(d.icons), ...d.thinkStrip.map((i) => i.icon), ...d.moveStrip.map((i) => i.icon), ...(d.codeStrip ?? []).map((i) => i.icon)];
  for (const icon of pictures) if (icon.startsWith("/")) assert.ok(existsSync(`public${icon}`), `T${activity.term}W${activity.week}: missing picture ${icon}`);
}

// Term 2 teaches patterns: identical cards are interchangeable (either red counts in a red place).
const t2w1 = getLessonSpec("tmc-v3-15-nursery-1-t2-w1").steps.code.exercise;
const swapped = [...t2w1.expectedOrder];
const reds = swapped.map((id, i) => [id, i]).filter(([id]) => t2w1.items.find((x) => x.id === id).matchKey === "red");
assert.equal(reds.length, 2, "T2W1 has two red lights");
[swapped[reds[0][1]], swapped[reds[1][1]]] = [swapped[reds[1][1]], swapped[reds[0][1]]];
assert.equal(scoreOrderingAttempt(swapped, t2w1).correct, true, "swapping two identical cards is still correct");
const blue = t2w1.items.find((x) => x.matchKey === "blue").id;
const redIds = t2w1.items.filter((x) => x.matchKey === "red").map((x) => x.id);
assert.equal(scoreOrderingAttempt([blue, ...redIds], t2w1).correct, false, "a wrong pattern (blue, red, red) is still wrong");
for (const activity of nursery.filter((a) => a.term === 2 && a.week !== 6)) {
  const order = getLessonSpec(activity.id).steps.code.exercise;
  assert.ok(order.items.some((i) => i.matchKey), `T2W${activity.week}: the Code task is a pattern (repeating cards)`);
}
console.log("Nursery 1 lesson checks passed: 39 reviewed lessons, all consistent.");
