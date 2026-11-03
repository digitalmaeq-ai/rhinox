/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Regression check for the protected areas (Rhinox Code Studio, Think • Move • Code!)
// and the printed QR short links. Run it before and after any shared style,
// token, header or footer change. See docs/design/phase-0-design-system.md, section 7.3.
//
//   npm run build && npx next start -p 3107
//   CHROMIUM_PATH=/path/to/chromium NODE_PATH=$(npm root -g) \
//     node scripts/protected-areas-check.cjs http://localhost:3107 --save /tmp/before
//   ... make the change, rebuild, restart ...
//   node scripts/protected-areas-check.cjs http://localhost:3107 --save /tmp/after --compare /tmp/before
//
// Checks: each route answers 200, has no page errors and no sideways scroll at
// 390, 768, 1024 and 1440 px; every printed short link still forwards to its
// destination; with --compare, screenshots are byte-compared with the saved set
// and any page that looks different is listed for a person to review.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const BASE = (args.find((a) => a.startsWith("http")) || "http://localhost:3107").replace(/\/$/, "");
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const SAVE = opt("--save");
const COMPARE = opt("--compare");
const WIDTHS = [[390, 844], [768, 1024], [1024, 768], [1440, 900]];

const ROUTES = [
  "/think-move-code",
  "/think-move-code/nursery-1",
  "/think-move-code/nursery-1/term-1",
  "/think-move-code/nursery-1/term-1/week-1",
  "/think-move-code/nursery-1/term-1/week-1/lesson",
  "/think-move-code/nursery-1/term-1/week-1/play/pictures",
  "/coding-robotics",
  "/coding-robotics/code-studio",
  "/coding-robotics/game-creator",
  "/coding-robotics/robot-lab",
  "/coding-robotics/studio",
  "/coding-robotics/my-projects",
];

// Pages with a live animation that is not a canvas. The same build photographed twice
// differs by a few pixels here, so screenshots of these are listed but not treated as failures.
const UNSTABLE = new Set(["/coding-robotics/robot-lab"]);

let failures = 0;
function check(ok, message) {
  if (!ok) failures += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${message}`);
}
const slug = (route, w) => `${route.replace(/\//g, "_") || "_home"}__${w}.png`;

(async () => {
  const { SHORT_LINKS } = await import("../lib/tmc/short-links.ts");
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  if (SAVE) fs.mkdirSync(SAVE, { recursive: true });
  const changed = [];

  for (const [w, h] of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    for (const route of ROUTES) {
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => null);
      const tag = `${w}px ${route}`;
      check(res && res.status() === 200, `${tag}: status 200`);
      check(errors.length === 0, `${tag}: no page errors${errors.length ? ` (${errors[0].slice(0, 80)})` : ""}`);
      const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      // The studios are full-height workspaces and may scroll inside; only flag the page itself.
      check(!wide, `${tag}: no sideways scroll`);
      if (SAVE) {
        const file = slug(route, w);
        // Live canvases, games and frames move on their own, so they are masked; everything else is compared exactly.
        const shot = await page.screenshot({
          fullPage: false,
          animations: "disabled",
          mask: [page.locator("canvas, iframe, video")],
        });
        fs.writeFileSync(path.join(SAVE, file), shot);
        if (COMPARE) {
          const old = path.join(COMPARE, file);
          if (!fs.existsSync(old) || !fs.readFileSync(old).equals(shot)) {
            if (UNSTABLE.has(route)) console.log(`note ${w}px ${route}: differs, but this page animates on its own; check by eye`);
            else changed.push(`${w}px ${route}`);
          }
        }
      }
      await page.close();
    }
    await ctx.close();
  }

  // Printed QR links must forward exactly as listed.
  const ctx = await browser.newContext();
  let bad = 0;
  for (const link of SHORT_LINKS) {
    const res = await ctx.request.get(BASE + link.source, { maxRedirects: 0 });
    const location = (res.headers().location || "").replace(BASE, "");
    if (![301, 302, 307, 308].includes(res.status()) || location !== link.destination) bad += 1;
  }
  check(bad === 0, `all ${SHORT_LINKS.length} printed short links forward to their destinations${bad ? ` (${bad} wrong)` : ""}`);
  await browser.close();

  if (COMPARE) {
    console.log(changed.length ? `\n${changed.length} screenshot(s) differ from the saved set. Review each one:\n  ${changed.join("\n  ")}` : "\nScreenshots match the saved set exactly.");
    if (changed.length) failures += 1;
  }
  console.log(failures ? `\n${failures} check(s) failed.` : "\nAll protected-area checks passed.");
  process.exit(failures ? 1 : 0);
})();
