// Browser checks for the Code Studio shell and Overview directory.
//
//   npm run build && npm run start
//   CHROMIUM_PATH=/path/to/chromium node scripts/studio-shell-browser-tests.cjs http://localhost:3000
//
// Needs Playwright. Checks that on laptop screens the page itself never
// scrolls and each workspace fits inside the frame, that nothing overflows
// sideways on tablets and phones, and that the main controls can be reached.
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const ROUTES = {
  overview: "/coding-robotics/studio",
  python: "/coding-robotics/code-studio",
  web: "/coding-robotics/code-studio/web",
  arduino: "/coding-robotics/code-studio/arduino",
  workspace: "/coding-robotics/code-studio/workspace",
  robot: "/coding-robotics/robot-lab",
  game: "/coding-robotics/game-creator",
  projects: "/coding-robotics/my-projects",
  learn: "/coding-robotics/code-studio/learn",
};
// Learn is a list of lessons, so it scrolls inside the frame by design.
const MAY_SCROLL_INSIDE = new Set(["learn"]);
const LAPTOPS = [[1366, 768], [1440, 900], [1536, 864]];
const MAIN_CONTROL = {
  python: { name: /^Run$/ },
  web: { name: /^Run$|Save to My Projects/ },
  arduino: { name: /^Run$|Running/ },
  workspace: { name: /Run program/ },
  robot: { name: /Run programme/ },
  game: { name: /Save to My Projects/ },
};

let failures = 0;
function check(condition, message) {
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${message}`);
}

async function open(page, route) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
}

async function measure(page) {
  return page.evaluate(() => {
    const frame = document.querySelector("[data-studio-shell] > div:last-child");
    return {
      pageH: document.documentElement.scrollHeight,
      innerH: innerHeight,
      pageW: document.documentElement.scrollWidth,
      innerW: innerWidth,
      inner: frame ? frame.scrollHeight - frame.clientHeight : 0,
      footerHidden: getComputedStyle(document.querySelector("footer")).display === "none",
    };
  });
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  // 1. Laptops: nothing scrolls except inside panels.
  for (const [w, h] of LAPTOPS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const [name, route] of Object.entries(ROUTES)) {
      await open(page, route);
      const m = await measure(page);
      check(m.pageH <= m.innerH + 1, `${w}x${h} ${name}: the page does not scroll (${m.pageH} of ${m.innerH})`);
      check(m.footerHidden, `${w}x${h} ${name}: footer is out of the way`);
      if (!MAY_SCROLL_INSIDE.has(name)) check(m.inner <= 1, `${w}x${h} ${name}: the whole workspace fits the frame (${m.inner}px over)`);
      check(m.pageW <= m.innerW, `${w}x${h} ${name}: no sideways scroll`);
    }
    // Game Creator in play mode.
    await open(page, ROUTES.game);
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await page.waitForTimeout(400);
    const play = await measure(page);
    check(play.inner <= 1 && play.pageH <= play.innerH + 1, `${w}x${h} game (playing): fits the frame`);
    await page.close();
  }

  // 2. Tablets and phones: no sideways scroll, menu works, main controls reachable.
  for (const [w, h] of [[1024, 768], [768, 1024], [390, 844], [360, 640]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const [name, route] of Object.entries(ROUTES)) {
      await open(page, route);
      const m = await measure(page);
      check(m.pageW <= m.innerW + 1, `${w}x${h} ${name}: no sideways scroll (${m.pageW} vs ${m.innerW})`);
      const control = MAIN_CONTROL[name];
      if (control) {
        const button = page.getByRole("button", { name: control.name }).first();
        const found = (await button.count()) > 0;
        check(found, `${w}x${h} ${name}: main control exists`);
        if (found) {
          await button.scrollIntoViewIfNeeded();
          check(await button.isVisible(), `${w}x${h} ${name}: main control can be reached`);
        }
      }
    }
    if (w <= 820) {
      await open(page, ROUTES.overview);
      const nav = page.locator('nav[aria-label="Code Studio"]');
      check(await nav.isHidden(), `${w}x${h}: menu is closed to start with`);
      await page.getByRole("button", { name: "Studio menu" }).click();
      check(await nav.isVisible(), `${w}x${h}: menu opens`);
      await nav.getByRole("link", { name: "Python Studio" }).click();
      await page.waitForURL(/\/coding-robotics\/code-studio$/);
      check(await page.locator('nav[aria-label="Code Studio"]').isHidden(), `${w}x${h}: menu closes after choosing a tool`);
    } else {
      await open(page, ROUTES.overview);
      check(await page.locator('nav[aria-label="Code Studio"]').isVisible(), `${w}x${h}: navigation rail is visible`);
    }
    await page.close();
  }

  await browser.close();
  console.log(failures ? `${failures} FAILED` : "ALL OK");
  process.exit(failures ? 1 : 0);
})();
