#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Checks the Learning Path page and the picker on a production build:
//   node scripts/code-studio-v2-path-browser-tests.cjs http://localhost:3100
const { chromium } = require("playwright");
const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
let bad = 0;
const ok = (name, pass) => { if (!pass) bad++; console.log(`${pass ? "ok  " : "FAIL"} ${name}`); };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // Picker on the Think • Move • Code! home.
  await page.goto(`${BASE}/think-move-code`);
  const picker = page.getByRole("region", { name: /How would you like to use/ });
  ok("picker shows two options", (await picker.getByRole("link").count()) === 2);
  ok("Week by week stays the default (first, existing weeks)", /Week by week/.test(await picker.getByRole("link").first().innerText()));
  await picker.getByRole("link", { name: /Learning Path/ }).click();
  await page.waitForURL(/nursery-1\/path$/);

  // The trail.
  ok("page title", (await page.locator("h1").innerText()).trim() === "Learning Path");
  ok("39 stops", (await page.locator("main h3").count()) === 39 && (await page.locator("main h3").count()) === 39);
  ok("today card, progress panel and 3 term headings", (await page.locator("main h2").count()) === 5);
  ok("156 step links", (await page.locator("main ul li a[href]").count()) === 156);
  ok("Start here appears once", (await page.getByText("Start here").count()) === 1);
  ok("explains progress is kept only in this browser", /saved only in this browser/i.test(await page.locator("body").innerText()));
  ok("no horizontal scroll (desktop)", !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));

  // Every link must load.
  const hrefs = await page.locator("main ul li a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  ok("156 different addresses", new Set(hrefs).size === 156);
  let failed = [];
  for (let i = 0; i < hrefs.length; i += 12) {
    const batch = await Promise.all(hrefs.slice(i, i + 12).map(async (h) => ({ h, status: (await fetch(BASE + h)).status })));
    failed = failed.concat(batch.filter((r) => r.status !== 200));
  }
  ok(`every step link returns 200${failed.length ? " (failed: " + failed.slice(0, 3).map((f) => f.h + " " + f.status).join(", ") + ")" : ""}`, failed.length === 0);

  // Keyboard: the first step link takes focus and shows an outline.
  await page.keyboard.press("Tab");
  // Phone width.
  await page.setViewportSize({ width: 375, height: 700 });
  ok("no horizontal scroll (phone)", !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  await page.screenshot({ path: process.env.PATH_SHOT || "/tmp/path-phone.png" });

  // Progress (phase 4): marks persist on this device only.
  const KEY = "tmc.learning-path.nursery-1.v1";
  const offOrigin = [];
  page.on("request", (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) offOrigin.push(r.url()); });
  await page.goto(`${BASE}/think-move-code/nursery-1/path`);
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  await page.reload();
  ok("starts at 0 of 156", /0 of 156/.test(await page.locator("body").innerText()));
  ok("reset disabled when nothing done", await page.getByRole("button", { name: "Reset progress" }).isDisabled());
  const tick = (label) => page.getByRole("button", { name: label });
  await tick("Term 1 week 1 Learn: mark as done").click();
  await tick("Term 1 week 1 Play: mark as done").click();
  ok("2 of 156 after two ticks", /2 of 156/.test(await page.locator("body").innerText()));
  ok("tick is a pressed toggle", (await tick("Term 1 week 1 Learn: done").getAttribute("aria-pressed")) === "true");
  ok("Next up cue appears, Start here gone", (await page.getByText("Next up").count()) === 1 && (await page.getByText("Start here").count()) === 0);
  await page.reload();
  await page.waitForFunction(() => /2 of 156/.test(document.body.innerText), null, { timeout: 5000 }).catch(() => {});
  ok("progress survives reload", /2 of 156/.test(await page.locator("body").innerText()));
  const stored = JSON.parse(await page.evaluate((k) => localStorage.getItem(k), KEY));
  ok("stored value is version plus step ids only", Object.keys(stored).sort().join() === "done,v" && stored.done.length === 2 && stored.done.every((id) => /^tmc-n1-t\d-w\d+:(learn|play|match|quiz)$/.test(id)));
  await tick("Term 1 week 1 Match: mark as done").click();
  await tick("Term 1 week 1 Quiz: mark as done").click();
  ok("a full week shows Week complete and 1 of 39", (await page.getByText("Week complete").count()) === 1 && /1 of 39 weeks complete/.test(await page.locator("body").innerText()));
  ok("nothing was locked: a later week is still a normal link", (await page.locator("main ul li a[href]").count()) === 156);
  await page.getByRole("button", { name: "Reset progress" }).click();
  await page.getByRole("button", { name: "Keep it" }).click();
  ok("Keep it leaves progress alone", /4 of 156/.test(await page.locator("body").innerText()));
  await page.getByRole("button", { name: "Reset progress" }).click();
  await page.getByRole("button", { name: "Yes, clear it" }).click();
  ok("reset clears page and storage", /0 of 156/.test(await page.locator("body").innerText()) && (await page.evaluate((k) => localStorage.getItem(k), KEY)) === null);
  await page.evaluate((k) => localStorage.setItem(k, "{broken"), KEY);
  await page.reload();
  ok("damaged stored value is ignored", /0 of 156/.test(await page.locator("body").innerText()));
  ok("no requests left this site while marking progress", offOrigin.length === 0);


  // Guide (phase 5): today's next step and tiered hints.
  await page.goto(`${BASE}/think-move-code/nursery-1/path`);
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  await page.reload();
  const today = page.getByRole("region", { name: /Today.s next step/ });
  ok("today card starts at Term 1 Week 1 Learn", /let's begin with Learn in Term 1, Week 1/.test(await today.innerText()));
  await tick("Term 1 week 1 Learn: mark as done").click();
  ok("today card moves to Play", /Play in Term 1, Week 1/.test(await today.innerText()));
  ok("today link opens a real page", (await fetch(BASE + (await today.getByRole("link").getAttribute("href")))).status === 200);
  ok("no hints showing at first", (await page.getByText("Grown-up tip").count()) === 0);
  await page.getByRole("button", { name: /Need a hint\? for term 1 week 1 Play/ }).click();
  ok("first hint appears, no grown-up tip yet", (await page.getByText(/RhinoBot says: look at all the cards/).count()) === 1 && (await page.getByText("Grown-up tip").count()) === 0);
  await page.getByRole("button", { name: /Another hint for term 1 week 1 Play/ }).click();
  await page.getByRole("button", { name: /Another hint for term 1 week 1 Play/ }).click();
  ok("third hint is the grown-up tip and the button goes away", (await page.getByText(/Grown-up tip: let the child try/).count()) === 1 && (await page.getByRole("button", { name: /hint for term 1 week 1 Play/i }).count()) === 0);
  const afterHints = JSON.parse(await page.evaluate((k) => localStorage.getItem(k), KEY));
  ok("hints are not stored", afterHints.done.length === 1);

  // Polish: collapsible weeks, celebration, link from the week page.
  await page.goto(`${BASE}/think-move-code/nursery-1/path`);
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  await page.reload();
  await page.waitForSelector("details[open]");
  ok("only the current week is open at first", (await page.locator("main details[open]").count()) === 1 && (await page.locator("main details").count()) === 39);
  const week2 = page.locator("main details", { hasText: "Week 3" }).first();
  await week2.locator("summary").click();
  ok("a closed week opens by hand and stays open", (await page.locator("main details[open]").count()) === 2);
  await week2.locator("summary").click();
  ok("and closes again", (await page.locator("main details[open]").count()) === 1);
  for (const k of ["Learn", "Play", "Match", "Quiz"]) await tick(`Term 1 week 1 ${k}: mark as done`).click();
  ok("finished week shows the well done banner", (await page.getByText("Well done! All four steps are done.").count()) === 1);
  await page.waitForTimeout(200);
  ok("the open week moves on to the next step's week", (await page.locator("main details[open]").count()) === 1 && /week 2/i.test(await page.locator("main details[open]").first().innerText()) && /Today's next step/.test(await page.locator("body").innerText()));
  const summaryOk = await page.evaluate(() => [...document.querySelectorAll("main details > summary")].every((s) => s.querySelector("h3")));
  ok("every week summary holds its heading", summaryOk);
  ok("today card shows Ayo", (await page.locator("section[aria-labelledby=today-title] img").count()) === 1);
  await page.goto(`${BASE}/think-move-code/nursery-1/term-1/week-1`);
  const pathLink = page.getByRole("link", { name: "Continue on the Learning Path" });
  ok("week page links to the Learning Path", (await pathLink.getAttribute("href")) === "/think-move-code/nursery-1/path");
  await page.evaluate((k) => localStorage.removeItem(k), KEY);

  // Do it together (trial: Weeks 1 to 3).
  for (const w of [1, 2, 3]) {
    await page.goto(`${BASE}/think-move-code/nursery-1/term-1/week-${w}`);
    const sec = page.locator("#do-it-together").locator("xpath=ancestor::section");
    ok(`week ${w} page shows Do it together with 4 timed parts`, (await sec.locator("ol li").count()) === 4 && /Think\s*8 min/.test(await sec.innerText()) && /Book & close\s*10 min/.test(await sec.innerText()));
  }
  await page.goto(`${BASE}/think-move-code/nursery-1/term-1/week-4`);
  ok("week 4 has no Do it together yet", (await page.locator("#do-it-together").count()) === 0);
  await page.goto(`${BASE}/think-move-code/nursery-1/path`);
  ok("the path links to Do it together for weeks 1 to 3 only", (await page.locator("main a", { hasText: "Do it together" }).count()) === 3);
  const href = await page.getByRole("link", { name: "Do it together" }).first().getAttribute("href");
  ok("the link points at the week page section", href === "/think-move-code/nursery-1/term-1/week-1#do-it-together");
  await page.getByRole("link", { name: "Do it together" }).first().click();
  await page.waitForURL(/week-1#do-it-together/);
  ok("the link lands on the lesson", (await page.locator("#do-it-together").isVisible()));

  // Storage blocked: page still works for the session and warns.
  const blocked = await browser.newPage({ viewport: { width: 400, height: 800 } });
  await blocked.addInitScript(() => {
    const boom = () => { throw new Error("blocked"); };
    Object.defineProperty(window, "localStorage", { get: boom });
  });
  await blocked.goto(`${BASE}/think-move-code/nursery-1/path`);
  await blocked.getByRole("button", { name: "Term 1 week 1 Learn: mark as done" }).click();
  ok("blocked storage: tick still works and a warning shows", /1 of 156/.test(await blocked.locator("body").innerText()) && (await blocked.getByRole("status").count()) >= 1);
  ok("no horizontal scroll (phone)", !(await blocked.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  await blocked.close();
  ok("no page errors", errors.length === 0);
  await browser.close();
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.log("ERR", e.message.split("\n")[0]); process.exit(1); });
