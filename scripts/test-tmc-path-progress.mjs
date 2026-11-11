// Tests for Learning Path progress (phase 4). Run: node --experimental-strip-types --no-warnings scripts/test-tmc-path-progress.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { NURSERY_1_REGISTRY as R } from "../lib/tmc-registry/seed/nursery-1.ts";
import { buildLearningPath } from "../lib/tmc-path/learning-path.ts";
import { buildPathView } from "../lib/tmc-path/view.ts";
import {
  PROGRESS_STORAGE_KEY, MAX_STORED_STEPS, parseProgress, serializeProgress, toggleStep, stopProgress, summarize, nextUp,
} from "../lib/tmc-path/progress.ts";

const view = buildPathView(buildLearningPath(R, "Nursery 1"), R);
const ids = new Set(view.stops.flatMap((s) => s.steps.map((x) => x.id)));
const first = view.stops[0];

test("nothing stored gives nothing done", () => {
  for (const raw of [null, undefined, "", "not json", "[]", "null", "42", '{"v":2,"done":[]}', '{"v":1}', '{"v":1,"done":"x"}'])
    assert.equal(parseProgress(raw, ids).size, 0, String(raw));
});

test("round trip keeps only known step ids", () => {
  const done = new Set([first.steps[0].id, first.steps[2].id]);
  const back = parseProgress(serializeProgress(done), ids);
  assert.deepEqual([...back].sort(), [...done].sort());
  const raw = JSON.stringify({ v: 1, done: [first.steps[0].id, "bogus:id", 7, null, { a: 1 }] });
  assert.deepEqual([...parseProgress(raw, ids)], [first.steps[0].id]);
});

test("oversized or huge stored values are ignored or capped", () => {
  assert.equal(parseProgress("x".repeat(30_000), ids).size, 0);
  const many = JSON.stringify({ v: 1, done: Array.from({ length: 5000 }, (_, i) => `junk-${i}`) });
  assert.equal(parseProgress(many, ids).size, 0);
  assert.ok(MAX_STORED_STEPS >= ids.size);
});

test("stored text holds only a version and step ids", () => {
  const text = serializeProgress(new Set([first.steps[0].id]));
  const obj = JSON.parse(text);
  assert.deepEqual(Object.keys(obj).sort(), ["done", "v"]);
  assert.ok(obj.done.every((id) => ids.has(id)));
  assert.doesNotMatch(text, /name|email|age|time|score|device/i);
  assert.match(PROGRESS_STORAGE_KEY, /^tmc\.learning-path\.nursery-1\.v1$/);
});

test("toggle marks, unmarks, ignores unknown ids and does not change the input", () => {
  const start = new Set();
  const id = first.steps[1].id;
  const on = toggleStep(start, id, ids);
  assert.ok(on.has(id) && start.size === 0);
  assert.equal(toggleStep(on, id, ids).size, 0);
  assert.equal(toggleStep(start, "nope", ids).size, 0);
});

test("stars, week complete and summary", () => {
  const done = new Set(first.steps.map((s) => s.id));
  assert.deepEqual(stopProgress(first, done), { done: 4, total: 4, complete: true });
  done.delete(first.steps[3].id);
  assert.deepEqual(stopProgress(first, done), { done: 3, total: 4, complete: false });
  assert.deepEqual(summarize(view, new Set()), { stepsDone: 0, stepsTotal: 156, weeksComplete: 0, weeksTotal: 39 });
  assert.deepEqual(summarize(view, new Set(first.steps.map((s) => s.id))), { stepsDone: 4, stepsTotal: 156, weeksComplete: 1, weeksTotal: 39 });
});

test("next up is the first undone step in book order, and null at the end", () => {
  assert.deepEqual(nextUp(view, new Set()), { stopId: first.id, stepId: first.steps[0].id });
  // Skipping ahead does not lock anything: the earlier gap is still next.
  assert.equal(nextUp(view, new Set([first.steps[1].id])).stepId, first.steps[0].id);
  assert.deepEqual(nextUp(view, new Set([first.steps[0].id])), { stopId: first.id, stepId: first.steps[1].id });
  assert.equal(nextUp(view, ids), null);
});

test("progress code and the trail never use the network, cookies or analytics", () => {
  for (const file of ["../lib/tmc-path/progress.ts", "../app/think-move-code/nursery-1/path/PathTrail.tsx"]) {
    const text = fs.readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(text, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|document\.cookie|gtag|analytics|indexedDB|sessionStorage/i, file);
  }
  const pure = fs.readFileSync(new URL("../lib/tmc-path/progress.ts", import.meta.url), "utf8");
  assert.deepEqual(pure.split("\n").filter((l) => /^\s*import\s/.test(l) && !/^\s*import\s+type\s/.test(l)), []);
  assert.doesNotMatch(pure, /localStorage/);
});
