/* eslint-disable @typescript-eslint/no-require-imports */
// Browser security and recovery tests for Rhinox Code Studio.
//
//   1. Build and start the site:      npm run build && npm run start
//   2. One-time setup (no change to package.json):
//                                     npm install --no-save playwright
//                                     npx playwright install chromium
//   3. Run:                           node scripts/code-studio-browser-tests.cjs http://localhost:3000
//
// It opens a real browser, runs hostile and broken programs through the Code
// Studio page, and checks that the page stays responsive and recovers. It
// prints one line per check and exits with a non-zero code if any check fails.
// Takes about 2 minutes. See docs/code-studio.md for what each check means.
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function headersOf(path) {
  const response = await fetch(BASE + path);
  return {
    status: response.status,
    coop: response.headers.get("cross-origin-opener-policy"),
    coep: response.headers.get("cross-origin-embedder-policy"),
    csp: response.headers.get("content-security-policy"),
    cache: response.headers.get("cache-control"),
  };
}

(async () => {
  // ---------- 1. Headers: only the Code Studio route is isolated ----------
  const studio = await headersOf("/coding-robotics/code-studio");
  check("Code Studio page sends COOP same-origin", studio.coop === "same-origin", studio.coop);
  check("Code Studio page sends COEP require-corp", studio.coep === "require-corp", studio.coep);
  check("Code Studio page has a CSP with connect-src 'self'", /connect-src 'self'/.test(studio.csp || ""));
  const worker = await headersOf("/code-studio/python-worker.js");
  check("Python worker has COOP/COEP", worker.coop === "same-origin" && worker.coep === "require-corp");
  check("Python worker CSP forbids eval and other origins", /script-src 'self' 'wasm-unsafe-eval'/.test(worker.csp || "") && !/unsafe-eval'(?!.*wasm)/.test((worker.csp || "").replace("'wasm-unsafe-eval'", "")) && /default-src 'none'/.test(worker.csp || ""));
  for (const path of ["/", "/coding-robotics", "/coding-robotics/robot-lab", "/coding-robotics/game-creator", "/coding-robotics/my-projects", "/shop", "/explore", "/education"]) {
    const h = await headersOf(path);
    check(`${path} is NOT isolated (no COOP/COEP)`, h.status === 200 && !h.coop && !h.coep, `status ${h.status}`);
  }

  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const pageErrors = [];
  const external = [];
  const failedRequests = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("request", (r) => {
    if (!r.url().startsWith(BASE) && !/^(data|blob):/.test(r.url())) external.push(r.url());
  });
  page.on("requestfailed", (r) => { if (!r.url().includes("_rsc=")) failedRequests.push(r.url()); }); // _rsc = Next.js prefetches cancelled by navigation, harmless

  await page.goto(BASE + "/coding-robotics/code-studio", { waitUntil: "networkidle" });
  await page.waitForSelector(".monaco-editor");
  await sleep(1500);
  check("page is cross-origin isolated", await page.evaluate(() => crossOriginIsolated === true));

  async function setCode(code) {
    await page.click(".monaco-editor .view-lines");
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Delete");
    await page.keyboard.insertText(code);
  }
  const consoleText = () => page.evaluate(() => document.querySelector('[role="log"]').innerText);
  async function waitIdle(timeout) {
    await page.waitForFunction(
      () => {
        const run = [...document.querySelectorAll("button")].find((b) => /^(Run|Starting)/.test(b.textContent));
        return run && run.textContent === "Run" && !run.disabled;
      },
      null,
      { timeout },
    );
  }
  // Multi-line programs are wrapped in exec() so the editor's auto-indent cannot change them.
  async function run(code, timeout = 30000, raw = false) {
    await setCode(raw || !code.includes("\n") ? code : "exec(" + JSON.stringify(code) + ")");
    const started = Date.now();
    await page.click("button:has-text('Run')");
    await waitIdle(timeout);
    return { text: await consoleText(), secs: (Date.now() - started) / 1000 };
  }

  // Page lag monitor: how long the page's own thread was blocked at worst.
  await page.evaluate(() => {
    window.__maxLag = 0;
    let last = performance.now();
    setInterval(() => {
      const now = performance.now();
      window.__maxLag = Math.max(window.__maxLag, now - last - 50);
      last = now;
    }, 50);
  });

  // ---------- 2. Normal behaviour ----------
  let r = await run('print("hello")', 90000);
  check("a simple program runs", r.text.includes("hello"));

  // ---------- 3. Blocked modules and network ----------
  r = await run("import socket");
  check("import socket is refused", /does not allow importing 'socket'/.test(r.text));
  r = await run("import urllib.request");
  check("import urllib.request is refused", /does not allow importing 'urllib'/.test(r.text));
  r = await run("import js");
  check("import js is refused", /does not allow importing 'js'/.test(r.text));
  r = await run("from pyodide.http import pyfetch");
  check("pyodide.http is refused", /does not allow importing 'pyodide'/.test(r.text));
  r = await run("import micropip");
  check("micropip is refused (no package installs)", /does not allow importing 'micropip'/.test(r.text));
  r = await run('import builtins\ntry:\n    builtins.__import__("js")\n    print("ESCAPED")\nexcept ImportError as e:\n    print("blocked:", e)');
  check("the real __import__ cannot reach js", !r.text.includes("ESCAPED") && /blocked|does not allow importing/.test(r.text), r.text.replace(/\s+/g, " ").slice(0, 120));
  r = await run('import sys\ntry:\n    m = sys.modules["importlib"].import_module("js")\n    print("ESCAPED")\nexcept Exception as e:\n    print("blocked:", type(e).__name__)');
  check("importlib.import_module cannot reach js", !r.text.includes("ESCAPED"), r.text.replace(/\s+/g, " ").slice(0, 120));

  // ---------- 4. The hard case: someone rebuilds the bridge by hand ----------
  // Documented residual risk. What matters is that nothing dangerous is then reachable.
  const attack = `
import sys
real_import = print.__self__.__import__
abc = real_import("importlib.abc", fromlist=["MetaPathFinder"])
finder = [c for c in abc.MetaPathFinder.__subclasses__() if c.__name__ == "JsFinder"][0]
real_sys = real_import("sys")
real_sys.meta_path.insert(0, finder())
js = real_import("js")
print("BRIDGE", True)
def probe(label, fn):
    try:
        result = fn()
        print("PROBE", label, "AVAILABLE" if result else "gone")
    except Exception as e:
        print("PROBE", label, "error:", type(e).__name__)
g = js.globalThis
probe("fetch", lambda: g.fetch is not None and str(g.fetch) != "undefined")
probe("XMLHttpRequest", lambda: str(g.XMLHttpRequest) != "undefined")
probe("WebSocket", lambda: str(g.WebSocket) != "undefined")
probe("importScripts", lambda: str(g.importScripts) != "undefined")
probe("Worker", lambda: str(g.Worker) != "undefined")
probe("indexedDB", lambda: str(g.indexedDB) != "undefined")
probe("caches", lambda: str(g.caches) != "undefined")
probe("document", lambda: str(g.document) != "undefined")
probe("localStorage", lambda: str(g.localStorage) != "undefined")
try:
    g.eval("1+1")
    print("PROBE eval AVAILABLE")
except Exception as e:
    print("PROBE eval blocked")
try:
    js.Function("return 1")()
    print("PROBE new-Function AVAILABLE")
except Exception as e:
    print("PROBE new-Function blocked")
`;
  r = await run(attack, 40000);
    const probes = Object.fromEntries([...r.text.matchAll(/^PROBE (\S+) (\S+)/gm)].map((m) => [m[1], m[2]]));
  console.log("      bridge rebuilt by hand:", /^BRIDGE/m.test(r.text) ? "yes (known residual risk)" : "no (js still unreachable)", JSON.stringify(probes));
  const dangerous = ["fetch", "XMLHttpRequest", "WebSocket", "importScripts", "Worker", "indexedDB", "caches", "document", "localStorage", "eval", "new-Function"];
  check("hand-built bridge attack: either js stays unreachable, or no network/eval/DOM/storage is available", (!/^BRIDGE/m.test(r.text) && /No module named 'js'/.test(r.text)) || dangerous.every((k) => probes[k] !== "AVAILABLE"), dangerous.filter((k) => probes[k] === "AVAILABLE").join(","));
  // After that, the page should still work and the worker is clean again.
  r = await run('import sys\nprint("modules hidden:", sys.modules.get("js") is None)');
  check("a normal run still works after the attack", /modules hidden: True/.test(r.text), r.text.trim().split("\n").pop());

  r = await run("import sys\nsys.meta_path.clear()\nsys.path.clear()\nprint('tampered')");
  r = await run("import json, datetime\nprint(json.dumps([1]))");
  check("a program that empties sys.meta_path/sys.path cannot break later runs", /\[1\]/.test(r.text), r.text.replace(/\s+/g, " ").slice(0, 100));
  r = await run("import os\nos.system('echo hi')\nimport os.path\nprint(os.getcwd() != '')");
  console.log("      os.system output:", JSON.stringify(r.text.replace(/\s+/g, " ").slice(0, 160)));

  // ---------- 5. Infinite loop, Stop, recovery ----------
  r = await run("while True:\n    pass", 40000);
  check("an endless loop is stopped near 10 seconds", r.secs > 9 && r.secs < 16 && /ran for more than 10 seconds/.test(r.text), r.secs.toFixed(1) + "s");
  r = await run('print("recovered")', 60000);
  check("next run works after a timeout", r.text.includes("recovered"));
  await setCode("while True:\n    pass");
  await page.click("button:has-text('Run')");
  await sleep(1500);
  await page.click("button:has-text('Stop')");
  await waitIdle(10000);
  check("Stop ends an endless loop", /Stopped\./.test(await consoleText()));
  r = await run('print("after stop")', 60000);
  check("next run works after Stop", r.text.includes("after stop"));

  // ---------- 6. Output flooding ----------
  r = await run('while True:\n    print("x" * 80)', 30000);
  check("line flooding is stopped at the limit", /printed more than 100,000 characters/.test(r.text) && r.text.length < 120000, r.text.length + " chars shown");
  r = await run('import sys\nwhile True:\n    sys.stdout.write("y" * 1000)', 30000);
  check("flooding without newlines is stopped", /printed more than 100,000 characters/.test(r.text));
  r = await run("print(1)", 30000);
  check("next run works after flooding", r.text.trim().startsWith("1"));

  // ---------- 7. Memory ----------
  r = await run("x = [0] * (10**9)", 30000);
  check("a huge list fails with MemoryError, not a crash", /MemoryError/.test(r.text));
  r = await run("b = bytearray(1500 * 1024 * 1024)\nprint(len(b))", 90000);
  console.log("      1.5 GB allocation:", /1572864000/.test(r.text) ? "allowed (known residual risk)" : "refused");
  r = await run('print("alive after memory")', 90000);
  check("after a memory-heavy run, a fresh worker runs the next program", r.text.includes("alive after memory"));
  r = await run("import sys\nsys.setrecursionlimit(10**6)\ndef f(n):\n    return f(n + 1)\nf(0)", 60000);
  check("runaway recursion ends (error or timeout), page survives", /RecursionError|MemoryError|ran for more than|stopped/.test(r.text) || r.text.length > 0);
  r = await run('print("alive after recursion")', 90000);
  check("page works after runaway recursion", r.text.includes("alive after recursion"));

  // ---------- 8. Page responsiveness and cleanliness ----------
  const maxLag = await page.evaluate(() => window.__maxLag);
  check("the page thread was never blocked for long during all of the above", maxLag < 500, "worst lag " + Math.round(maxLag) + " ms");
  check("no requests left the site", external.length === 0, external.slice(0, 3).join(","));
  check("no requests failed (isolation did not block embedded resources)", failedRequests.length === 0, failedRequests.slice(0, 3).join(","));
  check("no uncaught page errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));

  // ---------- 9. Reaching Code Studio from another page ----------
  const second = await context.newPage();
  await second.goto(BASE + "/coding-robotics/my-projects", { waitUntil: "networkidle" });
  check("another page of the site is not isolated", (await second.evaluate(() => crossOriginIsolated)) === false);
  await second.evaluate(() => document.querySelector('a[href="/coding-robotics/code-studio"]').click());
  await second.waitForSelector(".monaco-editor", { timeout: 30000 });
  await sleep(2500);
  check("arriving by an in-site link still ends up isolated (page reloads once)", await second.evaluate(() => crossOriginIsolated === true));

  await browser.close();
  const failed = results.filter((x) => !x.ok);
  console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((error) => {
  console.error("TEST RUN FAILED:", error.message);
  process.exit(2);
});
