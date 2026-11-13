#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Checks that finishing a game or quiz ticks its Learning Path step, on a production build:
//   node scripts/code-studio-v2-path-reporting-browser-tests.cjs http://localhost:3100
const { chromium } = require("playwright");
const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const KEY = "tmc.learning-path.nursery-1.v1";
let bad = 0;
const ok = (name, pass) => { if (!pass) bad++; console.log(`${pass ? "ok  " : "FAIL"} ${name}`); };
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const errors = [];
  const offOrigin = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith("data:") && !u.startsWith("blob:")) offOrigin.push(u); });

  await page.goto(`${BASE}/think-move-code/nursery-1/path`);
  await page.evaluate((k) => localStorage.removeItem(k), KEY);

  // Ordering game (Term 1, Week 2): play the first round properly.
  await page.goto(`${BASE}/think-move-code/nursery-1/term-1/week-2/play/screen`);
  const game = page.frameLocator("iframe");
  const frame = page.frames().find((f) => f !== page.mainFrame());
  await game.locator(".card").first().waitFor();
  ok("no note before the game is finished", (await page.getByRole("status").count()) === 0);
  const order = await frame.evaluate(() => ROUNDS[0].order);
  for (const k of order) await game.locator(`.card[data-k="${k}"]`).click();
  await game.locator("#check").click();
  await page.getByRole("status").waitFor({ timeout: 4000 });
  ok("finishing round 1 shows the saved note with a path link", /ticked on your Learning Path/.test(await page.getByRole("status").innerText()) && (await page.getByRole("status").getByRole("link").getAttribute("href")) === "/think-move-code/nursery-1/path");
  let s = await stored(page);
  ok("exactly the Play step is stored", JSON.stringify(s) === JSON.stringify({ v: 1, done: ["tmc-n1-t1-w2:play"] }));

  // A wrong answer does not tick anything (Term 1, Week 3).
  await page.goto(`${BASE}/think-move-code/nursery-1/term-1/week-3/play/screen`);
  const g3 = page.frameLocator("iframe");
  const f3 = page.frames().find((f) => f !== page.mainFrame());
  await g3.locator(".card").first().waitFor();
  const o3 = await f3.evaluate(() => ROUNDS[0].order);
  for (const k of [...o3].reverse()) await g3.locator(`.card[data-k="${k}"]`).click();
  await g3.locator("#check").click();
  await page.waitForTimeout(1200);
  ok("a wrong order ticks nothing", (await stored(page)).done.length === 1 && (await page.getByRole("status").count()) === 0);

  // Pairs game (Term 1, Week 2).
  await page.goto(`${BASE}/think-move-code/nursery-1/term-1/week-2/play/pictures`);
  const pg = page.frameLocator("iframe");
  const pf = page.frames().find((f) => f !== page.mainFrame());
  await pg.locator(".tile").first().waitFor();
  const keys = await pf.evaluate(() => [...document.querySelectorAll(".tile")].map((t) => t.dataset.k));
  for (const k of [...new Set(keys)]) {
    const idx = keys.map((v, i) => (v === k ? i : -1)).filter((i) => i >= 0);
    await pg.locator(".tile").nth(idx[0]).click();
    await pg.locator(".tile").nth(idx[1]).click();
    await page.waitForTimeout(700);
  }
  const answer = await pf.evaluate(() => CFG.answer);
  await pg.locator(`.choice[data-k="${answer}"]`).waitFor({ timeout: 5000 });
  ok("pairs found but the last question not answered: not ticked yet", (await stored(page)).done.length === 1);
  await pg.locator(`.choice[data-k="${answer}"]`).click();
  await page.getByRole("status").waitFor({ timeout: 4000 });
  s = await stored(page);
  ok("finishing the pairs game ticks the Match step", s.done.length === 2 && s.done.includes("tmc-n1-t1-w2:match") && s.done.includes("tmc-n1-t1-w2:play"));

  // Quiz (Term 1, Week 2): answer every question, then submit.
  await page.goto(`${BASE}/explore/stem-quizzes/nursery-1-term-1-week-2`);
  ok("quiz does not tick before it is finished", (await stored(page)).done.length === 2);
  for (let i = 0; i < 40; i++) {
    const submit = page.getByRole("button", { name: "Submit Quiz" });
    if (await submit.count()) { await submit.click(); break; }
    const choice = page.locator("main input[type=radio], main input[type=checkbox]").first();
    if (await choice.count()) await choice.check().catch(() => {});
    else await page.locator("main button").filter({ hasNotText: /Previous|Next|Submit/ }).first().click().catch(() => {});
    await page.getByRole("button", { name: "Next Question" }).click();
  }
  await page.getByText("QUIZ COMPLETE").waitFor({ timeout: 4000 });
  ok("finishing the quiz shows the note", (await page.getByText(/ticked on your Learning Path/).count()) === 1);
  s = await stored(page);
  ok("the Quiz step is stored with the others", s.done.length === 3 && s.done.includes("tmc-n1-t1-w2:quiz"));

  // A quiz that is not a Nursery 1 week does not touch progress.
  await page.goto(`${BASE}/explore/stem-quizzes/what-is-a-robot`);
  for (let i = 0; i < 40; i++) {
    const submit = page.getByRole("button", { name: "Submit Quiz" });
    if (await submit.count()) { await submit.click(); break; }
    const choice = page.locator("main input[type=radio], main input[type=checkbox]").first();
    if (await choice.count()) await choice.check().catch(() => {});
    await page.getByRole("button", { name: "Next Question" }).click();
  }
  ok("other quizzes leave progress alone and show no path note", (await stored(page)).done.length === 3 && (await page.getByText(/Learning Path/).count()) === 0);

  // The path now shows the three ticks, and today's step has moved on.
  await page.goto(`${BASE}/think-move-code/nursery-1/path`);
  await page.waitForFunction(() => /3 of 156/.test(document.body.innerText), null, { timeout: 5000 }).catch(() => {});
  ok("the path counts 3 of 156", /3 of 156/.test(await page.locator("body").innerText()));
  await page.locator("main details", { hasText: "Week 2" }).first().locator("summary").click();
  ok("Week 2 Play, Match and Quiz show as done", (await page.getByRole("button", { name: /Term 1 week 2 (Play|Match|Quiz): done/ }).count()) === 3);
  ok("today's step is Week 1 Learn (first not done)", /Learn in Term 1, Week 1/.test(await page.getByRole("region", { name: /Today.s next step/ }).innerText()));

  // Blocked storage: the game still works and says so.
  const blocked = await browser.newPage({ viewport: { width: 400, height: 800 } });
  await blocked.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }); });
  await blocked.goto(`${BASE}/think-move-code/nursery-1/term-1/week-4/play/screen`);
  const bg = blocked.frameLocator("iframe");
  const bf = blocked.frames().find((f) => f !== blocked.mainFrame());
  await bg.locator(".card").first().waitFor();
  const bo = await bf.evaluate(() => ROUNDS[0].order);
  for (const k of bo) await bg.locator(`.card[data-k="${k}"]`).click();
  await bg.locator("#check").click();
  await blocked.getByRole("status").waitFor({ timeout: 4000 });
  ok("blocked storage: game still finishes and the note says it cannot save", /not letting us save/.test(await blocked.getByRole("status").innerText()));
  await blocked.close();

  ok("no requests left this site", offOrigin.length === 0);
  ok("no page errors", errors.length === 0);
  await browser.close();
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.log("ERR", e.message.split("\n")[0]); process.exit(1); });
