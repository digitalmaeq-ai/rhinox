// Tests for the "Do it together" lesson guides. Run: node --experimental-strip-types --no-warnings scripts/test-tmc-lesson-guide.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { NURSERY_1_REGISTRY as R } from "../lib/tmc-registry/seed/nursery-1.ts";
import { LESSON_GUIDES, lessonGuideFor, lessonGuideKeys } from "../lib/tmc/lesson-guide.ts";

const weekTitles = new Map(R.lessons.filter((l) => l.unitKind === "week").map((l) => [`${l.term}-${l.week}`, l.lessonTitle]));

test("each guide is for a real week and uses that week's title", () => {
  assert.equal(LESSON_GUIDES.length, 39);
  for (const g of LESSON_GUIDES) {
    assert.equal(weekTitles.get(`${g.term}-${g.week}`), g.title, `Term ${g.term} Week ${g.week}`);
  }
});

test("keys are unique and lookups work", () => {
  const keys = lessonGuideKeys();
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(lessonGuideFor(1, 2).title, "My Day Has Order");
  assert.equal(lessonGuideFor(3, 13).title, "Showcase & Badges");
  assert.equal(lessonGuideFor(4, 1), undefined);
  assert.equal(lessonGuideFor(1, 14), undefined);
  assert.equal(keys.length, 39);
});

test("all 39 weeks are covered once, Term 1 to 3, Weeks 1 to 13", () => {
  for (let term = 1; term <= 3; term++) for (let week = 1; week <= 13; week++) assert.ok(lessonGuideFor(term, week), `Term ${term} Week ${week}`);
});

test("every guide has four named parts that add up to the 40-minute lesson", () => {
  for (const g of LESSON_GUIDES) {
    const where = `Term ${g.term} Week ${g.week}`;
    assert.equal(g.parts.length, 4, where);
    assert.equal(g.parts.reduce((n, p) => n + p.minutes, 0), 40, where);
    for (const p of g.parts) {
      assert.ok(p.name.length > 1 && p.name.length < 20, `${where} name`);
      assert.ok(Number.isInteger(p.minutes) && p.minutes >= 3 && p.minutes <= 30, `${where} minutes`);
      assert.ok(p.text.length > 40, `${where}/${p.name} text`);
    }
    assert.ok(g.goal.length > 15 && g.words.length > 5 && g.youNeed.length > 25, where);
  }
});

test("ordinary lesson weeks keep the book's Think, Move, Code, Book & close shape", () => {
  for (const [term, week] of [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 2], [2, 3], [3, 3], [3, 4]]) {
    const g = lessonGuideFor(term, week);
    assert.deepEqual(g.parts.map((p) => p.name), ["Think", "Move", "Code", "Book & close"], `Term ${term} Week ${week}`);
    assert.deepEqual(g.parts.map((p) => p.minutes), [8, 10, 12, 10], `Term ${term} Week ${week}`);
  }
});

test("text was extracted cleanly: no leftover page furniture or split words", () => {
  const all = LESSON_GUIDES.flatMap((g) => [g.goal, g.words, g.youNeed, ...g.parts.map((p) => p.text)]);
  for (const t of all) {
    assert.doesNotMatch(t, /Teacher Guide|Rhinox Scientifica|Check & support|LOOK FOR|Term \d · Week/);
    assert.doesNotMatch(t, /\s{2,}/);
    assert.equal(t, t.trim());
    assert.doesNotMatch(t, /[A-Za-z][-–] [a-z]/, t.slice(0, 60));
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
