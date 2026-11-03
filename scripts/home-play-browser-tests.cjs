/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Browser checks for the homepage Play section (Play and Hands-on labs merged into one).
//   npm run build && npm run start
//   CHROMIUM_PATH=/path/to/chromium node scripts/home-play-browser-tests.cjs http://localhost:3000
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
let failures = 0;
function check(condition, message) {
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${message}`);
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const [w, h] of [[1366, 768], [1440, 900], [768, 1024], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const tag = `${w}x${h}`;

    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${tag}: no sideways scroll`);
    check((await page.locator("#play").count()) === 1, `${tag}: one Play section`);
    check((await page.getByText(/^Hands-on labs$/i).count()) === 0, `${tag}: no separate "Hands-on labs" section`);
    check((await page.getByText(/Don.t just read it/).count()) === 0, `${tag}: the old second heading is gone`);

    const sections = await page.evaluate(() => [...document.querySelectorAll("main > section")].length);
    check(sections === 8, `${tag}: the homepage has 8 sections (was 9) (${sections})`);

    // The Live labs tab holds both labs.
    await page.locator("#play").scrollIntoViewIfNeeded();
    const tab = page.locator("#play").getByRole("tab", { name: "Live labs" });
    check(await tab.isVisible(), `${tag}: a Live labs tab is in the Play section`);
    await tab.click();
    const stage = page.locator("#play article");
    check(await stage.getByRole("heading", { name: "Solar System Explorer" }).isVisible(), `${tag}: Live labs opens on the Solar System Explorer`);
    await stage.locator("[role=img][aria-label*='Solar System']").waitFor({ timeout: 10000 }).catch(() => {});
    check((await stage.locator("[role=img][aria-label*='Solar System']").count()) === 1, `${tag}: the Solar System preview is live`);
    check(await stage.getByRole("link", { name: /Start now|Play now/ }).isVisible(), `${tag}: the stage has a start button`);
    check((await stage.getByRole("link", { name: /Start now|Play now/ }).getAttribute("href")).includes("solar-system-explorer"), `${tag}: the start button opens that lab`);
    await page.locator("#play aside").getByRole("button", { name: /Robot Maze Coder/ }).click();
    check(await stage.getByRole("heading", { name: "Robot Maze Coder" }).isVisible(), `${tag}: the second lab is one click away`);
    check(await stage.getByText("Repeat 5×").isVisible(), `${tag}: the maze preview shows its code blocks`);
    const blocks = await stage.locator("ul li", { hasText: "Repeat 3×" }).boundingBox();
    const frame = await stage.locator("[class*='frame']").first().boundingBox();
    check(Boolean(blocks && frame) && blocks.y + blocks.height <= frame.y + frame.height + 1, `${tag}: the code blocks fit inside the preview`);

    // Other tabs still work.
    await page.locator("#play").getByRole("tab", { name: "Games" }).click();
    check((await page.locator("#play aside li").count()) >= 1, `${tag}: the Games tab still lists experiences`);

    // Compact: tabs on one row on a wide screen, and the section is shorter than the two it replaced (about 1650px).
    if (w >= 1366) {
      const tops = await page.evaluate(() => [...new Set([...document.querySelectorAll("#play [role=tab]")].map((el) => Math.round(el.getBoundingClientRect().top)))]);
      check(tops.length === 1, `${tag}: all tabs sit on one row (${tops.length} rows)`);
    }
    const height = await page.evaluate(() => document.querySelector("#play").getBoundingClientRect().height);
    check(height < (w >= 900 ? 950 : 1500), `${tag}: the Play section is compact (${Math.round(height)}px)`);
    check(errors.length === 0, `${tag}: no page errors ${errors.join(" | ")}`);
    await page.close();
  }
  await browser.close();
  console.log(failures ? `${failures} FAILED` : "ALL OK");
  process.exit(failures ? 1 : 0);
})();
