// Tests for the "Do it together" lesson guides. Run: node --experimental-strip-types --no-warnings scripts/test-tmc-lesson-guide.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { NURSERY_1_REGISTRY as R } from "../lib/tmc-registry/seed/nursery-1.ts";
import { LESSON_GUIDES, lessonGuideFor, lessonGuideKeys } from "../lib/tmc/lesson-guide.ts";

const weekTitles = new Map(R.lessons.filter((l) => l.unitKind === "week").map((l) => [`${l.term}-${l.week}`, l.lessonTitle]));

test("each guide is for a real week and uses that week's title", () => {
  assert.ok(LESSON_GUIDES.length >= 3);
  for (const g of LESSON_GUIDES) {
    assert.equal(weekTitles.get(`${g.term}-${g.week}`), g.title, `Term ${g.term} Week ${g.week}`);
  }
});

test("keys are unique and lookups work", () => {
  const keys = lessonGuideKeys();
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(lessonGuideFor(1, 2).title, "My Day Has Order");
  assert.equal(lessonGuideFor(1, 4), undefined);
  assert.equal(lessonGuideFor(3, 13), undefined);
});

test("every guide has the four parts in book order and a 40-minute lesson", () => {
  for (const g of LESSON_GUIDES) {
    assert.deepEqual(g.parts.map((p) => p.name), ["Think", "Move", "Code", "Book & close"], `Week ${g.week}`);
    assert.deepEqual(g.parts.map((p) => p.minutes), [8, 10, 12, 10], `Week ${g.week}`);
    assert.equal(g.parts.reduce((n, p) => n + p.minutes, 0), 40);
    for (const p of g.parts) assert.ok(p.text.length > 40, `${g.week}/${p.name}`);
    assert.ok(g.goal && g.words && g.youNeed);
  }
});

test("guide text is plain, screen-free and has no placeholder wording", () => {
  const all = LESSON_GUIDES.flatMap((g) => g.parts.map((p) => p.text)).join(" ");
  assert.doesNotMatch(all, /TODO|TBD|lorem|<[a-z]/i);
});

test("the guide file is plain data: no imports, storage or network", () => {
  const text = fs.readFileSync(new URL("../lib/tmc/lesson-guide.ts", import.meta.url), "utf8");
  assert.deepEqual(text.split("\n").filter((l) => /^\s*import\s/.test(l)), []);
  assert.doesNotMatch(text, /fetch\s*\(|localStorage|document\./);
});
