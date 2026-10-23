#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Real-browser journey tests for the Nursery 1 Term 1 Week 1 lesson.
// Usage (app already built and running):
//   CHROMIUM_PATH=/path/to/chromium node scripts/code-studio-v2-browser-tests.cjs http://localhost:3100
// Playwright is not a project dependency; run with a globally installed copy (NODE_PATH).
const { chromium } = require("playwright");
const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const URL = BASE + "/coding-robotics/code-studio/learn";
let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; console.log("  ok   " + name); } else { failed++; console.log("  FAIL " + name + (detail ? " :: " + detail : "")); }
}
const RIGHT = ["Wake up", "Brush teeth", "Eat breakfast"];
const WRONG = ["Eat breakfast", "Wake up", "Brush teeth"];

async function open(browser, viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: opts.reducedMotion ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  const errors = [], failedReqs = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("requestfailed", (r) => { if (!r.url().includes("_rsc=")) failedReqs.push(r.url()); }); // Next.js link prefetches are aborted when a page closes; not a real failure
  await page.goto(URL);
  return { ctx, page, errors, failedReqs };
}
const next = (p) => p.getByRole("button", { name: /Next step|Finish activity|Skip optional build/ });
async function toCodeStep(p) {
  await p.getByRole("button", { name: /Start my lesson/ }).click();
  await next(p).click();                                            // think -> move
  await p.getByRole("button", { name: "I tried the movement challenge" }).click();
  await next(p).click();                                            // move -> code
}
async function order(p, labels) {
  for (const l of labels) await p.getByRole("button", { name: new RegExp(l) }).first().click();
}
async function afterCode(p) {                                       // build (optional) -> create -> check
  await next(p).click();                                            // code -> build
  const skip = p.getByRole("button", { name: /Skip optional build/ });
  check("optional Build can be skipped", await skip.isEnabled());
  await skip.click();                                               // build -> create
  await p.getByRole("button", { name: "I completed my three-step drawing" }).click();
  await next(p).click();                                            // create -> check
}

async function journey(browser, label, viewport, opts) {
  console.log("\n== " + label);
  // A. independent success, adult confirms
  let { ctx, page: p, errors, failedReqs } = await open(browser, viewport, opts);
  check("learning home shows reviewed lesson", await p.getByRole("button", { name: /Start my lesson/ }).isVisible());
  await toCodeStep(p);
  check("Next is disabled before the sequence is solved", await next(p).isDisabled());
  await order(p, WRONG);
  await p.getByRole("button", { name: "Check my order" }).click();
  check("wrong order gives retry feedback", await p.getByText("Good try. You can try again.").isVisible());
  check("Next still disabled after a wrong answer", await next(p).isDisabled());
  await p.getByRole("button", { name: "Reset", exact: true }).click();
  await order(p, RIGHT);
  await p.getByRole("button", { name: "Check my order" }).click();
  check("correct order is accepted on retry", await p.getByText("Well done!").isVisible());
  await afterCode(p);
  check("Next disabled until a teacher check is recorded", await next(p).isDisabled());
  check("extra practice is labelled as not the official check", await p.getByText(/Extra practice \(optional, not part of the official check\)/).isVisible());
  await p.getByRole("radio").first().check();                         // wrong extra-practice answer must not block
  await p.getByRole("button", { name: "Check answer" }).click();
  check("a wrong extra-practice answer does not unlock the step", await next(p).isDisabled());
  await p.getByRole("button", { name: "Yes, I watched them do it" }).click();
  check("adult confirmation unlocks Finish", await next(p).isEnabled());
  await next(p).click();
  check("independent success is shown as complete", await p.getByRole("heading", { name: /You completed the activity/ }).isVisible());
  check("completion states the app cannot verify adult confirmation", await p.getByText(/cannot verify who confirmed it/).isVisible());
  check("completion says progress is session-only", await p.getByText(/kept only in this browser session/).isVisible());
  check("no console errors (journey A)", errors.length === 0, errors.join(" | "));
  check("no failed requests (journey A)", failedReqs.length === 0, failedReqs.join(" | "));
  await ctx.close();

  // B. attempts exhausted -> recovery -> completed with help (never a pass)
  ({ ctx, page: p, errors } = await open(browser, viewport, opts));
  await toCodeStep(p);
  for (let i = 0; i < 3; i++) {
    await order(p, WRONG);
    await p.getByRole("button", { name: "Check my order" }).click();
    if (i < 2) await p.getByRole("button", { name: "Reset", exact: true }).click();
  }
  check("Next disabled when tries are used up and no help yet", await next(p).isDisabled());
  check("correct order is shown as a worked example", await p.getByText("Here is the correct order").isVisible());
  const help = p.getByRole("button", { name: "A grown-up helped me finish" });
  check("a clear next action is offered (no dead end)", await help.isVisible());
  await help.click();
  check("assisted finish unlocks Next", await next(p).isEnabled());
  check("assisted finish is not called a pass", await p.getByText(/completed with help/i).first().isVisible());
  await afterCode(p);
  await p.getByRole("button", { name: "Yes, I watched them do it" }).click();
  await next(p).click();
  check("assisted run ends as 'finished with help'", await p.getByRole("heading", { name: /finished the activity with help/ }).isVisible());
  check("assisted run is not labelled complete", (await p.getByRole("heading", { name: /You completed the activity/ }).count()) === 0);
  check("assisted run records 0 points", await p.getByText(/not counted as a pass \(0 points\)/).isVisible());
  check("no console errors (journey B)", errors.length === 0, errors.join(" | "));
  await ctx.close();

  // C. teacher check postponed -> awaiting, not confirmed
  ({ ctx, page: p, errors } = await open(browser, viewport, opts));
  await toCodeStep(p);
  await order(p, RIGHT);
  await p.getByRole("button", { name: "Check my order" }).click();
  await afterCode(p);
  await p.getByRole("button", { name: "I will check later" }).click();
  check("postponing the teacher check does not trap the learner", await next(p).isEnabled());
  await next(p).click();
  check("postponed check ends as 'waiting for teacher check'", await p.getByRole("heading", { name: /teacher check is still to do/ }).isVisible());
  check("postponed check is shown as still waiting", await p.getByText(/still waiting/).isVisible());
  check("no console errors (journey C)", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

async function keyboard(browser) {
  console.log("\n== keyboard only");
  const { ctx, page: p } = await open(browser, { width: 1280, height: 800 });
  await p.getByRole("button", { name: /Start my lesson/ }).focus();
  await p.keyboard.press("Enter");
  check("lesson opens with the keyboard", await p.getByText(/STEP 1 OF 6/).isVisible());
  const focusVisible = await p.evaluate(() => { document.querySelector("button")?.focus(); const el = document.activeElement; return !!el && el !== document.body; });
  check("keyboard focus lands on a control", focusVisible);
  await p.keyboard.press("Tab");
  const tag = await p.evaluate(() => document.activeElement && document.activeElement.tagName);
  check("Tab moves focus between controls", tag === "BUTTON" || tag === "A");
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  await journey(browser, "phone 390x800", { width: 390, height: 800 });
  await journey(browser, "desktop 1280x800", { width: 1280, height: 800 });
  await journey(browser, "phone with reduced motion", { width: 390, height: 800 }, { reducedMotion: true });
  await keyboard(browser);
  await browser.close();
  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
