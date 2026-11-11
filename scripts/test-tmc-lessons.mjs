#!/usr/bin/env node
import assert from "node:assert/strict";
import { interactiveLessonFor, lessonsInReview, nursery1LessonPath } from "../lib/tmc/lessons.ts";

// Only the reviewed lesson is offered inside its week.
assert.equal(interactiveLessonFor({ term: 1, week: 1 })?.theme, "I Can Do Things in Steps");
assert.equal(interactiveLessonFor({ term: 1, week: 2 })?.theme, "My Day Has Order");
assert.equal(interactiveLessonFor({ term: 1, week: 3 })?.theme, "I Can Give Instructions", "a lesson described by the books alone is offered");
assert.equal(interactiveLessonFor({ term: 1, week: 4 }), null, "a week with no reviewed lesson offers nothing");
assert.equal(interactiveLessonFor({ term: 3, week: 13 }), null, "weeks with no lesson record offer nothing");

// Everything else is grouped as "in review", never as ready.
const review = lessonsInReview().map((item) => item.id);
assert.ok(!review.includes("tmc-v3-15-nursery-1-t1-w2"));
assert.ok(review.includes("tmc-v3-15-year-1-t1-w3"));
assert.ok(!review.includes("tmc-v3-15-nursery-1-t1-w1"));

assert.equal(nursery1LessonPath({ term: 1, week: 1 }), "/think-move-code/nursery-1/term-1/week-1/lesson");
console.log("tmc lessons tests passed");
