/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Browser checks for the Code Studio shell and Overview directory.
//
//   npm run build && npm run start
//   CHROMIUM_PATH=/path/to/chromium node scripts/studio-shell-browser-tests.cjs http://localhost:3000
//
// Needs Playwright. Checks that on laptop screens each workspace's main
// controls are in the first view, the page scrolls normally to reveal the rest
// and the rail stays in view, that nothing overflows
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
      footerHidden: getComputedStyle(document.querySelector("body > footer")).display === "none",
    };
  });
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  // 1. Laptops: the main controls are in the first view, the page scrolls normally
  //    to reveal the rest, and the navigation rail stays in view while it does.
  for (const [w, h] of LAPTOPS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const [name, route] of Object.entries(ROUTES)) {
      await open(page, route);
      const m = await measure(page);
      check(m.pageW <= m.innerW, `${w}x${h} ${name}: no sideways scroll`);
      check(m.pageH >= m.innerH - 1, `${w}x${h} ${name}: the studio fills at least one screen`);
      const control = MAIN_CONTROL[name];
      const target = control ? page.getByRole("button", { name: control.name }).first() : page.locator("main h1, main h2").first();
      if ((await target.count()) > 0) {
        const box = await target.boundingBox();
        check(Boolean(box) && box.y >= 0 && box.y + box.height <= h, `${w}x${h} ${name}: the main control is in the first view without scrolling`);
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(200);
      const end = await page.evaluate(() => {
        const footer = document.querySelector("body > footer");
        const fr = footer ? footer.getBoundingClientRect() : null;
        const nav = document.querySelector('nav[aria-label="Code Studio"]');
        const nr = nav ? nav.getBoundingClientRect() : null;
        return {
          footerSeen: Boolean(fr) && fr.bottom > 0 && fr.top < innerHeight,
          navSeen: Boolean(nr) && nr.bottom > 0 && nr.top < innerHeight,
        };
      });
      const overlap = await page.evaluate(() => {
        const f = document.querySelector("body > footer").getBoundingClientRect().top + scrollY;
        const shell = document.querySelector("[data-studio-shell]");
        const bottoms = [...shell.querySelectorAll("*")].filter((el) => {
          if (!el.checkVisibility() || el.closest(".monaco-editor")) return false;
          // Content inside a scrolling panel is reached by scrolling that panel.
          for (let up = el.parentElement; up && up !== shell; up = up.parentElement) {
            if (/auto|scroll|hidden|clip/.test(getComputedStyle(up).overflowY)) return false;
          }
          return true;
        }).map((el) => el.getBoundingClientRect().bottom + scrollY);
        return Math.max(...bottoms) - f;
      });
      check(overlap <= 1, `${w}x${h} ${name}: nothing in the studio runs under the footer`);
      check(end.footerSeen, `${w}x${h} ${name}: scrolling down reaches the rest of the page`);
      check(end.navSeen, `${w}x${h} ${name}: the navigation rail stays in view while scrolling`);
    }
    // Game Creator in play mode: the board is in the first view.
    await open(page, ROUTES.game);
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await page.waitForTimeout(400);
    const board = await page.locator('[role="application"]').boundingBox();
    check(Boolean(board) && board.y + board.height <= h, `${w}x${h} game (playing): the board is in the first view`);
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
