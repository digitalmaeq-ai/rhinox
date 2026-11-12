// Tests for games and quizzes ticking their Learning Path step (device only).
// Run: node --experimental-strip-types --no-warnings scripts/test-tmc-path-reporting.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { NURSERY_1_REGISTRY as R } from "../lib/tmc-registry/seed/nursery-1.ts";
import { buildLearningPath } from "../lib/tmc-path/learning-path.ts";
import { GAME_STEP, nursery1StepId, quizSlugToStep } from "../lib/tmc-path/reporting.ts";
import { isStepId, parseProgress, recordStepDone, serializeProgress, MAX_STORED_STEPS } from "../lib/tmc-path/progress.ts";

const path = buildLearningPath(R, "Nursery 1");
const pathIds = new Set(path.stops.flatMap((s) => s.steps.map((x) => x.id)));

test("game and quiz step ids equal the real path ids for all 39 weeks", () => {
  let checked = 0;
  for (let term = 1; term <= 3; term++)
    for (let week = 1; week <= 13; week++) {
      for (const kind of ["play", "match", "quiz"]) {
        assert.ok(pathIds.has(nursery1StepId(term, week, kind)), `${term}/${week}/${kind}`);
        checked++;
      }
      assert.deepEqual(quizSlugToStep(`nursery-1-term-${term}-week-${week}`), { levelSlug: "nursery-1", stepId: nursery1StepId(term, week, "quiz") });
    }
  assert.equal(checked, 117);
  assert.deepEqual(GAME_STEP, { screen: "play", pictures: "match" });
});

test("quiz slugs that are not Nursery 1 weeks give nothing", () => {
  for (const slug of ["what-is-a-robot", "nursery-1-term-4-week-1", "nursery-1-term-1-week-14", "nursery-1-term-1-week-0", "nursery-2-term-1-week-1", ""])
    assert.equal(quizSlugToStep(slug), null, slug);
});

test("every real step id passes the shape check; junk does not", () => {
  for (const id of pathIds) assert.ok(isStepId(id), id);
  for (const bad of ["", "x", "tmc-n1-t1-w1", "tmc-n1-t4-w1:play", "tmc-n1-t1-w14:play", "tmc-n1-t1-w1:sing", "<script>:play", "tmc-n1-t1-w1:play "])
    assert.equal(isStepId(bad), false, bad);
});

test("recording a finished step adds it, keeps the others and never duplicates", () => {
  const first = recordStepDone(null, "tmc-n1-t1-w1:play");
  assert.deepEqual(JSON.parse(first), { v: 1, done: ["tmc-n1-t1-w1:play"] });
  const second = recordStepDone(first, "tmc-n1-t1-w2:quiz");
  assert.deepEqual(JSON.parse(second).done, ["tmc-n1-t1-w1:play", "tmc-n1-t1-w2:quiz"]);
  assert.equal(recordStepDone(second, "tmc-n1-t1-w1:play"), null);
});

test("recording ignores junk, damaged storage and a full store", () => {
  assert.equal(recordStepDone(null, "bogus"), null);
  assert.equal(recordStepDone("{broken", "tmc-n1-t1-w1:play"), serializeProgress(new Set(["tmc-n1-t1-w1:play"])));
  const full = new Set();
  for (let t = 1; t <= 3; t++) for (let w = 1; w <= 13; w++) for (const k of ["learn", "play", "match", "quiz"]) full.add(`tmc-n1-t${t}-w${w}:${k}`);
  assert.ok(full.size <= MAX_STORED_STEPS);
  assert.equal(recordStepDone(serializeProgress(full), "tmc-n1-t1-w1:play"), null);
  assert.equal(parseProgress(recordStepDone(null, "tmc-n1-t2-w3:match"), { has: isStepId }).size, 1);
});

test("the reporting code uses no network, cookies or analytics, and only the one storage key", () => {
  for (const file of ["../lib/tmc-path/reporting.ts", "../lib/tmc-path/save-step.ts", "../app/think-move-code/_path/GameFrame.tsx"]) {
    const text = fs.readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(text, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|document\.cookie|gtag|analytics|indexedDB|sessionStorage/i, file);
  }
  const reporting = fs.readFileSync(new URL("../lib/tmc-path/reporting.ts", import.meta.url), "utf8");
  assert.deepEqual(reporting.split("\n").filter((l) => /^\s*import\s/.test(l)), []);
  assert.doesNotMatch(reporting, /localStorage/);
});
