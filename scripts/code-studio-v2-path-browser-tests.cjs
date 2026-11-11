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
  ok("3 term headings", (await page.locator("main h2").count()) === 3);
  ok("156 step links", (await page.locator("main ul li a[href]").count()) === 156);
  ok("Start here appears once", (await page.getByText("Start here").count()) === 1);
  ok("says nothing is saved", /does not save progress/.test(await page.locator("body").innerText()));
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
  ok("no page errors", errors.length === 0);
  await browser.close();
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.log("ERR", e.message.split("\n")[0]); process.exit(1); });
