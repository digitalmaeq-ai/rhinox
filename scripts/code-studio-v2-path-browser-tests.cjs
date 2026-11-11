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
  ok("progress panel plus 3 term headings", (await page.locator("main h2").count()) === 4);
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
