#!/usr/bin/env node
import assert from "node:assert/strict";
import { interactiveLessonFor, lessonsInReview, nursery1LessonPath } from "../lib/tmc/lessons.ts";

// Only the reviewed lesson is offered inside its week.
assert.equal(interactiveLessonFor({ term: 1, week: 1 })?.theme, "I Can Do Things in Steps");
for (const term of [1, 2, 3]) for (let week = 1; week <= 13; week++) {
  assert.ok(interactiveLessonFor({ term, week }), `Nursery 1 Term ${term} Week ${week} must have a lesson`);
}
assert.equal(interactiveLessonFor({ term: 4, week: 1 }), null, "weeks with no lesson record offer nothing");

// Everything else is grouped as "in review", never as ready.
const review = lessonsInReview().map((item) => item.id);
assert.ok(!review.some((id) => id.includes("nursery-1")), "no Nursery 1 lesson is left in review");
assert.ok(review.includes("tmc-v3-15-year-1-t1-w3"));
assert.ok(!review.includes("tmc-v3-15-nursery-1-t1-w1"));

assert.equal(nursery1LessonPath({ term: 1, week: 1 }), "/think-move-code/nursery-1/term-1/week-1/lesson");
console.log("tmc lessons tests passed");
