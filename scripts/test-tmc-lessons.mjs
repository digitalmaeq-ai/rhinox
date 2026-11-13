#!/usr/bin/env node
import assert from "node:assert/strict";
import { interactiveLessonFor, lessonsInReview, nursery1LessonPath } from "../lib/tmc/lessons.ts";

// No RhinoBot lesson is published for any Nursery 1 week: every week uses "Do it together" instead.
for (let term = 1; term <= 3; term++) {
  for (let week = 1; week <= 13; week++) {
    assert.equal(interactiveLessonFor({ term, week }), null, `Term ${term} Week ${week} offers no RhinoBot lesson`);
  }
}

// Nursery 1 and 2 come from the books alone, so their curriculum-sheet records are never listed as "in review".
const review = lessonsInReview();
assert.ok(review.every((item) => item.level !== "Nursery 1" && item.level !== "Nursery 2"));
assert.ok(review.map((item) => item.id).includes("tmc-v3-15-year-1-t1-w3"));

assert.equal(nursery1LessonPath({ term: 1, week: 1 }), "/think-move-code/nursery-1/term-1/week-1/lesson");
console.log("tmc lessons tests passed");
