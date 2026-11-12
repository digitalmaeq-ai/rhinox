// Tests for the Learning Path guide (phase 5). Run: node --experimental-strip-types --no-warnings scripts/test-tmc-path-guide.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { NURSERY_1_REGISTRY as R } from "../lib/tmc-registry/seed/nursery-1.ts";
import { buildLearningPath } from "../lib/tmc-path/learning-path.ts";
import { buildPathView } from "../lib/tmc-path/view.ts";
import { HINT_TIERS, MAX_HINT_LEVEL, hintsUpTo, todaysStep } from "../lib/tmc-path/guide.ts";

const view = buildPathView(buildLearningPath(R, "Nursery 1"), R);
const first = view.stops[0];

test("every step kind has three hints, the last one a grown-up tip", () => {
  assert.deepEqual(Object.keys(HINT_TIERS).sort(), ["learn", "match", "play", "quiz"]);
  for (const [kind, tiers] of Object.entries(HINT_TIERS)) {
    assert.equal(tiers.length, MAX_HINT_LEVEL, kind);
    assert.match(tiers[0], /^RhinoBot says:/, kind);
    assert.match(tiers[2], /^Grown-up tip:/, kind);
  }
});

test("hints reveal one tier at a time and stay within 0 to 3", () => {
  assert.deepEqual(hintsUpTo("play", 0), []);
  assert.deepEqual(hintsUpTo("play", -2), []);
  assert.equal(hintsUpTo("play", 1).length, 1);
  assert.equal(hintsUpTo("play", 2).length, 2);
  assert.equal(hintsUpTo("play", 99).length, 3);
  assert.deepEqual(hintsUpTo("quiz", 2), HINT_TIERS.quiz.slice(0, 2));
});

test("hints never give answers or add lesson content", () => {
  const all = Object.values(HINT_TIERS).flat().join(" ");
  assert.doesNotMatch(all, /the answer is|correct answer|\b[ABCD]\)/i);
  assert.doesNotMatch(all, /week \d|term \d/i);
});

test("today's step is the first not done, in book order, and nothing is locked", () => {
  const start = todaysStep(view, new Set());
  assert.equal(start.stepId, first.steps[0].id);
  assert.equal(start.isFirst, true);
  assert.match(start.message, /let's begin/);
  const next = todaysStep(view, new Set([first.steps[0].id]));
  assert.equal(next.stepId, first.steps[1].id);
  assert.equal(next.isFirst, false);
  assert.match(next.message, /pick any other step/);
  assert.equal(next.href, first.steps[1].href);
  // Skipping ahead leaves the earlier gap as the suggestion.
  assert.equal(todaysStep(view, new Set([first.steps[1].id])).stepId, first.steps[0].id);
});

test("when every step is done there is no next step", () => {
  const all = new Set(view.stops.flatMap((s) => s.steps.map((x) => x.id)));
  assert.equal(todaysStep(view, all), null);
});

test("guide code is pure: no runtime imports, storage, network or clock", () => {
  const text = fs.readFileSync(new URL("../lib/tmc-path/guide.ts", import.meta.url), "utf8");
  assert.deepEqual(text.split("\n").filter((l) => /^\s*import\s/.test(l) && !/^\s*import\s+type\s/.test(l)), []);
  assert.doesNotMatch(text, /localStorage|fetch\s*\(|Date\b|document\./);
});
