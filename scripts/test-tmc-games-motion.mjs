// Guards two Nursery 1 rules: every game respects "reduce motion", and every week quiz has 10 questions.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const games = [];
for (let t = 1; t <= 3; t++) for (let w = 1; w <= 13; w++) for (const g of ["screen-game", "matching-game"]) games.push(`public/tmc/n1/t${t}-w${w}/${g}.html`);

test("all 78 Nursery 1 games exist", () => {
  const missing = games.filter((f) => !existsSync(new URL(f, root)));
  assert.deepEqual(missing, []);
  assert.equal(games.length, 78);
});

test("every game respects prefers-reduced-motion and has no unguarded smooth scroll", () => {
  const bad = [];
  for (const f of games) {
    const s = readFileSync(new URL(f, root), "utf8");
    if (!s.includes("prefers-reduced-motion")) bad.push(`${f}: no reduced-motion rule`);
    if (/behavior:\s*'smooth'(?!\s*\))/.test(s.replace(/\?'auto':'smooth'\)/g, ""))) bad.push(`${f}: unguarded smooth scroll`);
  }
  assert.deepEqual(bad, []);
});

test("every Nursery 1 week quiz has 10 questions", () => {
  const dir = new URL("content/quizzes/tmc-nursery-1/", root);
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));
  assert.equal(files.length, 39);
  const bad = files.filter((f) => (readFileSync(new URL(f, dir), "utf8").match(/"correctAnswer"/g) || []).length !== 10);
  assert.deepEqual(bad, []);
});
