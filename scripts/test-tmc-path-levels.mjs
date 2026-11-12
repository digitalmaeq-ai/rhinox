// Tests for reusing the Learning Path across levels (phase 6). Run: node --experimental-strip-types --no-warnings scripts/test-tmc-path-levels.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { NURSERY_1_REGISTRY as R } from "../lib/tmc-registry/seed/nursery-1.ts";
import { buildLearningPath, validateLearningPath } from "../lib/tmc-path/learning-path.ts";
import { buildPathView } from "../lib/tmc-path/view.ts";
import { PATH_LEVELS, pathLevelFor } from "../lib/tmc-path/levels.ts";
import { progressStorageKey, PROGRESS_STORAGE_KEY } from "../lib/tmc-path/progress.ts";

// A stand-in second level made by relabelling a copy of Nursery 1's registry. It exists only in this
// test, to prove the code has nothing Nursery 1 specific in it. It is not Nursery 2 content.
function relabelled(from, to, idFrom, idTo) {
  const text = JSON.stringify(R).replaceAll(`"${from}"`, `"${to}"`).replaceAll(idFrom, idTo);
  return JSON.parse(text);
}
const R2 = relabelled("Nursery 1", "Test Level", "tmc-n1-", "tmc-x1-");

test("only designed levels are listed, and Nursery 2 is not", () => {
  assert.deepEqual(PATH_LEVELS.map((l) => l.slug), ["nursery-1"]);
  assert.equal(pathLevelFor("nursery-2"), undefined);
  assert.equal(pathLevelFor("nursery-1").level, "Nursery 1");
  assert.equal(pathLevelFor("nursery-1").pagePath, "/think-move-code/nursery-1/path");
});

test("every listed level has a registry that builds and passes the checks", () => {
  const server = fs.readFileSync(new URL("../lib/tmc-path/learning-path.server.ts", import.meta.url), "utf8");
  for (const { slug, level } of PATH_LEVELS) {
    assert.match(server, new RegExp(`"${slug}":`), `${slug} needs a registry in learning-path.server.ts`);
    const path = buildLearningPath(R, level);
    assert.deepEqual(validateLearningPath(path, R).errors, [], level);
  }
});

test("the same code builds and validates a path for another level", () => {
  const path = buildLearningPath(R2, "Test Level");
  assert.equal(path.level, "Test Level");
  assert.equal(path.id, "tmc-learning-path-test-level");
  assert.equal(path.stops.length, 39);
  assert.ok(path.stops.every((s) => s.id.startsWith("tmc-x1-")));
  assert.deepEqual(validateLearningPath(path, R2).errors, []);
  const view = buildPathView(path, R2);
  assert.equal(view.level, "Test Level");
  assert.equal(view.stops.reduce((n, s) => n + s.steps.length, 0), 156);
});

test("a level with no book data gives an empty path that fails its checks, so it cannot ship by accident", () => {
  const path = buildLearningPath(R, "Nursery 2");
  assert.equal(path.stops.length, 0);
  const check = validateLearningPath(path, R);
  assert.equal(check.ok, false);
  assert.match(check.errors[0], /no weeks for this level/);
});

test("each level has its own saved-progress key; Nursery 1's key is unchanged", () => {
  assert.equal(PROGRESS_STORAGE_KEY, "tmc.learning-path.nursery-1.v1");
  assert.equal(progressStorageKey("nursery-1"), "tmc.learning-path.nursery-1.v1");
  assert.notEqual(progressStorageKey("nursery-2"), progressStorageKey("nursery-1"));
  for (const bad of ["", "Nursery 1", "a/b", "x..y", "-a", "a-", "A"]) assert.throws(() => progressStorageKey(bad), bad);
});

test("the shared page and trail carry no Nursery 1 wording or fixed storage key", () => {
  for (const file of ["../app/think-move-code/_path/LearningPathPage.tsx", "../app/think-move-code/_path/PathTrail.tsx"]) {
    const text = fs.readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(text, /Nursery 1|nursery-1|PROGRESS_STORAGE_KEY/, file);
  }
});
