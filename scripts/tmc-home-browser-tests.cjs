/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Browser checks for the Think • Move • Code! home (Term and Week accordions).
//   npm run build && npm run start
//   CHROMIUM_PATH=/path/to/chromium node scripts/tmc-home-browser-tests.cjs http://localhost:3000
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
let failures = 0;
function check(condition, message) {
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${message}`);
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const [w, h] of [[1366, 768], [768, 1024], [390, 844], [360, 640]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${BASE}/think-move-code`, { waitUntil: "networkidle" });
    const tag = `${w}x${h}`;

    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${tag}: no sideways scroll`);

    // Terms: three, in order, Term 1 open first.
    const terms = page.locator("details[id^='term-']");
    check((await terms.count()) === 3, `${tag}: three term accordions`);
    check(await terms.nth(0).evaluate((el) => el.open), `${tag}: Term 1 starts open`);
    check(!(await terms.nth(1).evaluate((el) => el.open)) && !(await terms.nth(2).evaluate((el) => el.open)), `${tag}: Terms 2 and 3 start closed`);

    // Weeks: 13 per term, numbered in order, each with a Start button.
    const weekNumbers = await page.evaluate(() =>
      [...document.querySelectorAll("details[id^='term-']")].map((t) => [...t.querySelectorAll("li > details > summary")].map((s) => Number(/Week (\d+)/.exec(s.textContent)[1])))
    );
    check(weekNumbers.every((list) => list.length === 13 && list.every((n, i) => n === i + 1)), `${tag}: 13 weeks per term, in order`);
    check((await page.locator("a[aria-label^='Start Week']").count()) === 39, `${tag}: 39 Start buttons`);

    // A week opens to its goal, cards and games, and its lesson in Week 1.
    const week1 = terms.nth(0).locator("ol > li").first();
    check(!(await week1.locator("details").evaluate((el) => el.open)), `${tag}: a week starts closed`);
    await week1.locator("summary").click();
    check(await week1.getByText("I can follow 3 steps in order.").isVisible(), `${tag}: week shows its goal`);
    check(await week1.getByRole("link", { name: "Printable cards (PDF)" }).isVisible(), `${tag}: week shows cards`);
    check((await week1.getByRole("link", { name: /^Game:/ }).count()) === 2, `${tag}: week shows both games`);
    check(await week1.getByRole("link", { name: "Lesson with RhinoBot" }).isVisible(), `${tag}: Week 1 shows its RhinoBot lesson`);
    const week2 = terms.nth(0).locator("ol > li").nth(1);
    await week2.locator("summary").click();
    check((await week2.getByRole("link", { name: "Lesson with RhinoBot" }).count()) === 0, `${tag}: a lesson in review is not offered`);

    // Start button sits inside its row, not over the title.
    const box = await week1.getByRole("link", { name: /^Start Week 1/ }).boundingBox();
    const rowBox = await week1.boundingBox();
    check(Boolean(box && rowBox) && box.x >= rowBox.x && box.x + box.width <= rowBox.x + rowBox.width, `${tag}: Start stays inside its row`);
    check(box.height >= 40 && box.width >= 44, `${tag}: Start is a comfortable tap target`);

    // Keyboard: a term opens with Enter.
    await terms.nth(1).locator("summary").first().focus();
    await page.keyboard.press("Enter");
    check(await terms.nth(1).evaluate((el) => el.open), `${tag}: Term 2 opens from the keyboard`);

    // In review and downloads are grouped and collapsed.
    const review = page.locator("details", { hasText: "Interactive lessons in review" }).last();
    check(!(await review.evaluate((el) => el.open)), `${tag}: lessons in review are collapsed`);
    await review.locator("summary").first().click();
    check(await review.getByText(/Year 1 · Term 1 · Week 3/).isVisible(), `${tag}: Year 1 lesson listed as in review`);
    check(errors.length === 0, `${tag}: no page errors ${errors.join(" | ")}`);
    await page.close();
  }

  // Links and redirects.
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${BASE}/think-move-code#term-3`, { waitUntil: "networkidle" });
  check(await page.locator("#term-3").evaluate((el) => el.open), "a #term-3 link opens Term 3");
  await page.goto(`${BASE}/coding-robotics/code-studio/learn`, { waitUntil: "networkidle" });
  check(new URL(page.url()).pathname === "/think-move-code", "the old Learn address forwards to Think • Move • Code!");
  await page.goto(`${BASE}/think-move-code/nursery-1`, { waitUntil: "networkidle" });
  check(new URL(page.url()).pathname === "/think-move-code", "the old Nursery 1 page forwards to the home");
  await page.goto(`${BASE}/q/n1-t2-w5`, { waitUntil: "networkidle" });
  check(new URL(page.url()).pathname === "/think-move-code/nursery-1/term-2/week-5", "a printed QR short link still reaches its week");
  await page.goto(`${BASE}/think-move-code/nursery-1/term-1/week-1`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Lesson with RhinoBot/ }).click();
  await page.waitForURL(/week-1\/lesson$/);
  check(await page.getByText("STEP 1 OF 6").isVisible(), "the week page opens the lesson at step 1");
  await page.getByRole("button", { name: /Back to the week page/ }).first().click();
  await page.waitForURL(/week-1$/);
  check(true, "the lesson returns to its week page");
  const missing = await page.goto(`${BASE}/think-move-code/nursery-1/term-1/week-2/lesson`);
  check(missing.status() === 404, "a week without a reviewed lesson has no lesson page");
  // The Code Studio rail has Think • Move • Code! and no Learn.
  await page.goto(`${BASE}/coding-robotics/studio`, { waitUntil: "networkidle" });
  const rail = page.locator('nav[aria-label="Code Studio"]');
  check(await rail.getByRole("link", { name: "Think • Move • Code!" }).isVisible(), "the Code Studio rail links to Think • Move • Code!");
  check((await rail.getByRole("link", { name: /^Learn$/ }).count()) === 0, "the Code Studio rail no longer has Learn");
  await page.close();

  await browser.close();
  console.log(failures ? `${failures} FAILED` : "ALL OK");
  process.exit(failures ? 1 : 0);
})();
