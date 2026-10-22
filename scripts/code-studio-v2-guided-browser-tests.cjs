#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Real-browser tests for the guided robot workspace.
// Draft missions only open under `next dev`; a production server must show the friendly "not ready" page.
// Usage: CHROMIUM_PATH=/path/to/chromium node scripts/code-studio-v2-guided-browser-tests.cjs http://localhost:3101 dev
//        CHROMIUM_PATH=... node scripts/code-studio-v2-guided-browser-tests.cjs http://localhost:3100 prod
const { chromium } = require("playwright");
const BASE = (process.argv[2] || "http://localhost:3101").replace(/\/$/, "");
const MODE = process.argv[3] || "dev";
const path = (task) => `${BASE}/coding-robotics/code-studio/guided/draft-year-1-term-1-week-3/${task}`;
let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; console.log("  ok   " + name); } else { failed++; console.log("  FAIL " + name + (detail ? " :: " + detail : "")); }
}
async function open(browser, url, viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: opts.reducedMotion ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && !/_rsc=|hot-update|favicon/.test(m.text()) && errors.push(m.text()));
  const response = await page.goto(url);
  return { ctx, page, errors, response };
}
const card = (p, name) => p.getByRole("button", { name: new RegExp("^" + name) }).first();
async function add(p, names) { for (const n of names) await card(p, n).click(); }

async function prod(browser) {
  console.log("production: draft missions must not open");
  const { ctx, page, errors } = await open(browser, path("arrow-cards-core"), { width: 390, height: 800 });
  check("friendly not-ready heading", await page.getByRole("heading", { name: /not ready yet/ }).isVisible());
  check("no robot grid is shown", (await page.getByRole("img", { name: /grid/ }).count()) === 0);
  check("link back to learning", await page.getByRole("link", { name: "Back to learning" }).isVisible());
  check("page is noindex", (await page.locator('meta[name="robots"]').getAttribute("content") || "").includes("noindex"));
  check("no script errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
  const other = await open(browser, `${BASE}/coding-robotics/code-studio/guided/nope/also-nope`, { width: 1280, height: 800 });
  check("unknown activity also fails closed", await other.page.getByRole("heading", { name: /not ready yet/ }).isVisible());
  await other.ctx.close();
}

async function core(browser, label, viewport, opts) {
  console.log("core mission: " + label);
  const { ctx, page, errors } = await open(browser, path("arrow-cards-core"), viewport, opts);
  check("draft banner is visible", await page.getByText("Draft preview.").isVisible());
  check("5x5 grid", (await page.locator('[role="img"] > div').count()) === 25);
  check("only the four lesson cards are offered", (await page.locator("button", { hasText: /^(⬆️|⬇️|↶|↷|🔔)/ }).count()) === 4 && (await page.getByRole("button", { name: /^🔔/ }).count()) === 0);
  check("no text editor or repeat/if controls", (await page.locator("textarea").count()) === 0 && (await page.getByText(/repeat|if \(/i).count()) === 0);
  check("Run is disabled with no cards", await page.getByRole("button", { name: /Run/ }).isDisabled());
  // too few cards
  await add(page, ["Turn right", "Move forward"]);
  await page.getByRole("button", { name: /Run/ }).click();
  check("short program is not reported as success", (await page.getByRole("status").innerText()).includes("not reached the star"));
  // wrong: walk off the grid
  await page.getByRole("button", { name: "Clear" }).click();
  await add(page, ["Move forward"]);
  await page.getByRole("button", { name: /Run/ }).click();
  check("edge bump is explained", (await page.getByRole("status").innerText()).includes("bumped into the edge"));
  // correct 7-card program
  await page.getByRole("button", { name: "Clear" }).click();
  await add(page, ["Turn right", "Move forward", "Move forward", "Move forward", "Turn right", "Move forward", "Move forward"]);
  check("counter shows 7 cards", (await page.getByText(/7 cards · use 6 to 8/).count()) === 1);
  await page.getByRole("button", { name: /Run/ }).click();
  const status = await page.getByRole("status").innerText();
  check("success message names the robot", status.includes("Ilana reached the star"));
  check("evidence note says a teacher observes understanding", status.includes("teacher to observe"));
  check("never says verified or passed", !/verified|passed/i.test(status));
  check("step controls appear", await page.getByRole("button", { name: "Next step" }).isVisible());
  await page.getByRole("button", { name: "Next step" }).click();
  check("position is announced in a live region", (await page.locator('[aria-live="polite"]').allInnerTexts()).join(" ").includes("Column"));
  // cap at 8 cards
  await page.getByRole("button", { name: "Clear" }).click();
  for (let i = 0; i < 9; i++) { const b = card(page, "Move forward"); if (await b.isEnabled()) await b.click(); }
  check("cannot add more than 8 cards", (await page.getByText(/8 cards · use 6 to 8/).count()) === 1 && await card(page, "Move forward").isDisabled());
  // reorder and remove with the keyboard-reachable buttons
  await page.getByRole("button", { name: "Clear" }).click();
  await add(page, ["Move forward", "Turn left"]);
  await page.getByRole("button", { name: "Move card 2 earlier" }).click();
  check("reorder changes order", (await page.getByRole("list", { name: "Your cards in order" }).locator("li").first().innerText()).includes("Turn left"));
  await page.getByRole("button", { name: "Remove card 1" }).click();
  check("remove works", (await page.getByRole("list", { name: "Your cards in order" }).locator("li").count()) === 1);
  const horizontal = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  check("no horizontal scroll", !horizontal);
  check("no script errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

async function support(browser) {
  console.log("support mission");
  const { ctx, page, errors } = await open(browser, path("arrow-cards-support"), { width: 390, height: 800 });
  check("4x4 grid", (await page.locator('[role="img"] > div').count()) === 16);
  await add(page, ["Turn right", "Move forward", "Turn right", "Move forward"]);
  await page.getByRole("button", { name: /Run/ }).click();
  check("support mission can be completed", (await page.getByRole("status").innerText()).includes("Ilana reached the star"));
  check("no script errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
  const bad = await open(browser, path("no-such-task"), { width: 390, height: 800 });
  check("unknown task shows friendly page", await bad.page.getByRole("heading", { name: /not ready yet/ }).isVisible());
  await bad.ctx.close();
}

async function keyboard(browser) {
  console.log("keyboard");
  const { ctx, page } = await open(browser, path("arrow-cards-core"), { width: 1280, height: 800 });
  // The site-wide navigation comes first in the page, so tab until the first lesson card.
  let guard = 0;
  while (guard++ < 80 && !(await page.evaluate(() => document.activeElement?.tagName === "BUTTON" && /Move forward/.test(document.activeElement.textContent || "")))) await page.keyboard.press("Tab");
  check("a lesson card is reachable by Tab", guard < 80);
  await page.keyboard.press("Enter");
  check("Enter adds a focused card", (await page.getByText(/1 cards · use 6 to 8/).count()) === 1);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  if (MODE === "prod") await prod(browser);
  else {
    await core(browser, "phone 390x800", { width: 390, height: 800 });
    await core(browser, "desktop 1280x800", { width: 1280, height: 800 });
    await core(browser, "phone, reduced motion", { width: 390, height: 800 }, { reducedMotion: true });
    await support(browser);
    await keyboard(browser);
  }
  await browser.close();
  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
