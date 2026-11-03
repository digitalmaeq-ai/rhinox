/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Virtual Science Lab catalogue links (audit Phase 1).
//   npm run build && npx next start -p 3107
//   CHROMIUM_PATH=/path/to/chromium NODE_PATH=$(npm root -g) \
//     node scripts/virtual-lab-catalogue-browser-tests.cjs http://localhost:3107
// Opens /explore/virtual-lab, expands every subject group, and checks that the
// page has exactly one card for each published lab, that each card
// points at the lab's real page, and that none points at the old placeholder.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");

const base = process.argv[2] || "http://localhost:3000";

// Published labs, read from the content files (plain data).
const dir = "content/experiences";
const expected = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
  const src = fs.readFileSync(`${dir}/${file}`, "utf8");
  const slug = src.match(/\bslug:\s*"([^"]+)"/)?.[1];
  const runtime = src.match(/\bruntime:\s*"([^"]+)"/)?.[1];
  const status = src.match(/\bstatus:\s*"([^"]+)"/)?.[1];
  if (slug && ["simulation", "virtual-lab"].includes(runtime) && status === "active") expected.push(`/experiences/${slug}`);
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${base}/explore/virtual-lab`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /expand all/i }).click();
  await page.waitForTimeout(500);

  const hrefs = await page.locator("main a").evaluateAll((links) => links.map((a) => a.getAttribute("href")).filter((h) => h && (h.startsWith("/experiences/") || h.startsWith("/explore/virtual-lab/"))));
  assert.equal(hrefs.length, expected.length, `the catalogue shows ${hrefs.length} lab cards, expected ${expected.length}`);
  assert.deepEqual([...hrefs].sort(), [...expected].sort(), "the catalogue cards do not match the published labs");
  assert.ok(hrefs.every((h) => !h.startsWith("/explore/virtual-lab/")), "a card links to the old placeholder address");
  assert.deepEqual(errors, [], "page errors on the catalogue");

  console.log(`ok   ${hrefs.length} catalogue cards, each linking to its published lab's real page`);
  await browser.close();
})().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
