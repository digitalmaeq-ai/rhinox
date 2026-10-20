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
  const worker = await headersOf("/coding-robotics/code-studio/python-worker.js");
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

  // ---------- 7b. Files (open(), the Files panel, limits, storage) ----------
  const FILES_KEY = "rhinox-code-studio-files";
  const storedFiles = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), FILES_KEY);
  const panel = page.locator("details", { hasText: "My files" });
  const openPanel = async () => {
    if (!(await panel.evaluate((d) => d.open))) await panel.locator("summary").click();
  };

  await page.evaluate((key) => localStorage.removeItem(key), FILES_KEY);
  r = await run('with open("results.csv", "w") as f:\n    f.write("run,secs\\n1,22\\n")\nprint("written")', 60000);
  check("a program can write results.csv", r.text.includes("written") && /Files updated: results\.csv/.test(r.text), r.text.replace(/\s+/g, " ").slice(0, 100));
  check("the file is kept in this browser", (await storedFiles()).some((f) => f.name === "results.csv" && f.text === "run,secs\n1,22\n"));
  await openPanel();
  check("the Files panel lists the file", (await panel.innerText()).includes("results.csv"));
  await panel.locator("button", { hasText: "View" }).click();
  check("View shows the contents", (await panel.locator("pre").innerText()).includes("1,22"));

  const downloadPromise = page.waitForEvent("download");
  await panel.locator("button", { hasText: "Download" }).click();
  const download = await downloadPromise;
  check("Download gives results.csv", download.suggestedFilename() === "results.csv");

  r = await run('with open("results.csv", "a") as f:\n    f.write("2,24\\n")\nprint(open("results.csv").read())', 60000);
  check("a later run adds to the same file", /run,secs\s+1,22\s+2,24/.test(r.text));

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".monaco-editor");
  await sleep(1500);
  check("the file is still there after reloading the page", (await storedFiles()).some((f) => f.name === "results.csv" && f.text.endsWith("2,24\n")));

  // Stopped or timed-out runs do not change files.
  r = await run('open("results.csv", "w").write("WIPED")\nwhile True:\n    pass', 60000);
  check("a run that times out leaves the files as they were", /ran for more than 10 seconds/.test(r.text) && (await storedFiles()).find((f) => f.name === "results.csv").text.endsWith("2,24\n"));

  // Path tricks and odd names
  for (const bad of ["../secret.csv", "/etc/passwd", "sub/x.csv", "x.exe", ".hidden.csv"]) {
    r = await run(`open(${JSON.stringify(bad)}, "w").write("x")`);
    check(`file name ${bad} is refused`, /PermissionError|Rhinox Code Studio only opens files/.test(r.text) && !(await storedFiles()).some((f) => f.name === bad));
  }
  r = await run('print(open("/etc/passwd").read()[:10])');
  check("files outside the program's own cannot be read", /PermissionError/.test(r.text));
  r = await run("import pathlib");
  check("pathlib is refused", /does not allow importing 'pathlib'/.test(r.text));

  // Flooding: the file stops at the limit and the page stays healthy.
  r = await run('f = open("big.txt", "w")\nwhile True:\n    f.write("x" * 1000)', 60000);
  const big = (await storedFiles()).find((f) => f.name === "big.txt");
  check("a file cannot grow past its limit", /OSError/.test(r.text) && big && big.text.length <= 200000, r.text.replace(/\s+/g, " ").slice(-80));
  r = await run('for n in range(30):\n    open("f%d.txt" % n, "w").write("x")', 60000);
  check("there is a limit on how many files exist", /OSError/.test(r.text) && (await storedFiles()).length <= 20, String((await storedFiles()).length));
  const stored = await storedFiles();
  check("all files together stay under the total limit", stored.reduce((n, f) => n + f.text.length, 0) <= 1000000);

  // Storage that holds junk is cleaned, not trusted.
  await page.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify([
          { name: "../evil.csv", text: "x" },
          { name: "huge.csv", text: "x".repeat(300000) },
          { name: "ok.csv", text: "a,b" },
          { name: 5, text: "x" },
          "nonsense",
        ]),
      ),
    FILES_KEY,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".monaco-editor");
  await sleep(1500);
  await openPanel();
  const listed = await panel.innerText();
  check("junk in storage is dropped, valid files are kept", listed.includes("ok.csv") && !listed.includes("evil.csv") && !listed.includes("huge.csv"));
  r = await run("import os\nprint(sorted(os.listdir()))");
  check("a program only sees the valid files", /\['ok\.csv'\]/.test(r.text), r.text.replace(/\s+/g, " ").slice(0, 80));
  await page.evaluate((key) => localStorage.setItem(key, "{not json"), FILES_KEY);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".monaco-editor");
  await sleep(1500);
  r = await run('print("fine")', 60000);
  check("unreadable file storage does not break the page", r.text.includes("fine"));

  // Upload, size checks, delete
  await openPanel();
  const fileInput = panel.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: "my data.csv", mimeType: "text/csv", buffer: Buffer.from("name,score\nAda,9\n") });
  await sleep(300);
  check("a CSV from the computer can be added (name tidied)", (await panel.innerText()).includes("my_data.csv") && (await storedFiles()).some((f) => f.name === "my_data.csv"));
  await fileInput.setInputFiles({ name: "evil.exe", mimeType: "application/octet-stream", buffer: Buffer.from("MZ") });
  await sleep(300);
  check("an unsuitable file type is refused with a reason", /cannot be used/.test(await panel.innerText()) && !(await storedFiles()).some((f) => f.name === "evil.exe"));
  await fileInput.setInputFiles({ name: "huge.csv", mimeType: "text/csv", buffer: Buffer.alloc(900000, "a") });
  await sleep(500);
  check("a file that is too big is refused", /too big|too long/.test(await panel.innerText()) && !(await storedFiles()).some((f) => f.name === "huge.csv"));
  await fileInput.setInputFiles({ name: "bin.csv", mimeType: "text/csv", buffer: Buffer.from([65, 0, 66]) });
  await sleep(300);
  check("a file with binary data is refused", /not a text file/.test(await panel.innerText()) && !(await storedFiles()).some((f) => f.name === "bin.csv"));

  r = await run('import csv\nwith open("my_data.csv", newline="") as f:\n    print(list(csv.DictReader(f)))', 60000);
  check("a program can read an uploaded CSV with the csv module", /'name': 'Ada', 'score': '9'/.test(r.text), r.text.replace(/\s+/g, " ").slice(0, 100));

  await panel.locator("li", { hasText: "my_data.csv" }).locator("button", { hasText: "Delete" }).click();
  check("Delete asks first", (await storedFiles()).some((f) => f.name === "my_data.csv"));
  await panel.locator("button", { hasText: "Yes, delete" }).click();
  check("Delete removes the file", !(await storedFiles()).some((f) => f.name === "my_data.csv"));
  await fileInput.setInputFiles([
    { name: "one.txt", mimeType: "text/plain", buffer: Buffer.from("1") },
    { name: "two.txt", mimeType: "text/plain", buffer: Buffer.from("2") },
  ]);
  await sleep(300);
  check("several files can be added at once", (await storedFiles()).length === 2);
  await panel.locator("button", { hasText: "Delete all files" }).click();
  await panel.locator("button", { hasText: /Yes, delete all/ }).click();
  check("Delete all empties the area", (await storedFiles()).length === 0);

  // Checks bring their own files and never touch the learner's.
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify([{ name: "mine.txt", text: "keep me" }])), FILES_KEY);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".monaco-editor");
  await sleep(1500);
  await page.click('h2 button:has-text("Year 9")');
  await page.click('button:has-text("Log it in Python")');
  await sleep(500);
  const solution =
    'count = int(input())\ncorrect = 0\nwith open("results.csv", "a") as f:\n    for n in range(1, count + 1):\n        r = input()\n        if r == "right":\n            correct += 1\n        f.write(f"{n},{r}\\n")\nprint(f"Saved {count} results")\nprint(f"Correct: {correct}")\n';
  await setCode("exec(" + JSON.stringify(solution) + ")");
  await page.click("button:has-text('Check my answer')");
  await page.waitForSelector("text=Well done", { timeout: 90000 });
  const afterCheck = await storedFiles();
  check("Check passes a correct file program", true);
  check("Check does not change or add to the learner's own files", afterCheck.length === 1 && afterCheck[0].name === "mine.txt" && afterCheck[0].text === "keep me", JSON.stringify(afterCheck).slice(0, 100));
  await page.evaluate((key) => localStorage.removeItem(key), FILES_KEY);
  // The page was reloaded above, so start the lag monitor again.
  await page.evaluate(() => {
    window.__maxLag = 0;
    let last = performance.now();
    setInterval(() => {
      const now = performance.now();
      window.__maxLag = Math.max(window.__maxLag, now - last - 50);
      last = now;
    }, 50);
  });

  // ---------- 7c. Charts (the charts module and the Charts section) ----------
  const chartsSection = page.locator('section[aria-label="Charts drawn by your program"]');
  r = await run('import charts\ncharts.bar_chart(["Ada", "Tolu", "Chi"], [9, 7.5, 10], "Scores", "Name", "Points")\nprint("drawn")', 60000);
  check("a program can draw a bar chart", r.text.includes("drawn") && /chart was drawn/.test(r.text) && (await chartsSection.count()) === 1, r.text.replace(/\s+/g, " ").slice(0, 100));
  check("the chart is an image with a description", /Bar chart "Scores" with 3 points/.test(await chartsSection.locator("svg").getAttribute("aria-label")));
  check("the chart shows its title, labels and values", await chartsSection.locator("svg").evaluate((svg) => ["Scores", "Ada", "Tolu", "Chi", "Name", "Points", "7.5"].every((t) => svg.textContent.includes(t))));
  check("the bars are drawn", (await chartsSection.locator("svg rect").count()) >= 4);
  await chartsSection.locator("summary", { hasText: "Show the numbers" }).click();
  check("the numbers are available as a table", (await chartsSection.locator("table").innerText()).includes("Tolu") && (await chartsSection.locator("table").innerText()).includes("7.5"));
  const svgDownload = page.waitForEvent("download");
  await chartsSection.locator("button", { hasText: "Download as SVG" }).click();
  check("a chart can be downloaded as SVG", (await svgDownload).suggestedFilename() === "chart-1.svg");

  r = await run('import charts\ncharts.line_chart(range(1, 6), [3, 5, 4, 8, 6], "Times")', 60000);
  check("a program can draw a line chart", /Line chart "Times" with 5 points/.test(await chartsSection.locator("svg").getAttribute("aria-label")) && (await chartsSection.locator("svg polyline").count()) === 1);

  // Hostile text is drawn as text, never as markup.
  await page.evaluate(() => { window.__xss = 0; });
  r = await run('import charts\nbad = "<img src=x onerror=window.__xss=1><script>window.__xss=2</script>"\ncharts.bar_chart([bad, "</text><circle id=pwn>"], [1, 2], bad, bad, bad)', 60000);
  check("hostile labels are shown as text, not run as markup", (await page.evaluate(() => window.__xss)) === 0 && (await chartsSection.locator("img, script, #pwn").count()) === 0 && (await chartsSection.locator("svg").evaluate((svg) => svg.textContent.includes("<img src=x"))));

  r = await run('import charts\ncharts.bar_chart(["a", "b"], [1])');
  check("bad chart data gives a clear error and draws nothing", /same length/.test(r.text) && (await chartsSection.count()) === 0);
  r = await run('import charts\ncharts.bar_chart(["a"], [1])\nwhile True:\n    pass', 60000);
  check("a run that times out draws no chart", /ran for more than 10 seconds/.test(r.text) && (await chartsSection.count()) === 0);
  r = await run('import charts\nfor i in range(6):\n    charts.bar_chart(["a"], [i])', 60000);
  check("there is a limit on how many charts a program can draw", /at most 5 charts/.test(r.text));
  r = await run('import charts\ncharts.bar_chart(["a"], [1])');
  r = await run('print("no chart this time")');
  check("charts from an earlier run are cleared", (await chartsSection.count()) === 0);
  r = await run('import charts\ncharts.bar_chart(list(range(100)), list(range(100)))\ncharts.line_chart(list(range(100)), [x * x for x in range(100)], "Big")', 60000);
  check("a chart with 100 bars still draws and the page stays healthy", (await chartsSection.locator("svg").count()) === 2);

  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify([{ name: "mine.txt", text: "keep me" }])), "rhinox-code-studio-files");
  const year9 = page.locator('h2 button:has-text("Year 9")');
  if ((await year9.getAttribute("aria-expanded")) !== "true") await year9.click();
  await page.click('button:has-text("Chart the test log")');
  await sleep(500);
  const chartSolution =
    'import charts\nwith open("test_log.txt") as file:\n    lines = file.read().splitlines()\nruns = []\nseconds = []\nfor line in lines[1:]:\n    if line.strip() == "":\n        continue\n    parts = line.split(",")\n    runs.append(parts[0])\n    seconds.append(int(parts[1]))\ncharts.line_chart(runs, seconds, "Test times", "Run", "Seconds")\n';
  await setCode("exec(" + JSON.stringify(chartSolution) + ")");
  await page.click("button:has-text('Check my answer')");
  await page.waitForSelector("text=Well done", { timeout: 90000 });
  check("Check passes a correct chart program, and draws nothing on the page", (await chartsSection.count()) === 0);
  await page.evaluate((key) => localStorage.removeItem(key), "rhinox-code-studio-files");

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

  // ---------- 10. Offline use: save, go offline, reload, still works ----------
  const swHeaders = await fetch(BASE + "/code-studio/offline-sw.js");
  check("the service worker may only control the Code Studio page", swHeaders.headers.get("service-worker-allowed") === "/coding-robotics/code-studio");
  const manifestResponse = await fetch(BASE + "/code-studio/manifest.webmanifest");
  const manifest = await manifestResponse.json();
  check("the install manifest is served and points at the page", manifestResponse.status === 200 && manifest.start_url === "/coding-robotics/code-studio" && manifest.scope === "/coding-robotics/code-studio", manifestResponse.headers.get("content-type"));
  for (const icon of manifest.icons) {
    const iconResponse = await fetch(BASE + icon.src);
    check(`manifest icon ${icon.sizes} exists`, iconResponse.status === 200 && /image\/png/.test(iconResponse.headers.get("content-type") || ""));
  }

  const offlineContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const offlinePage = await offlineContext.newPage();
  const offlineErrors = [];
  offlinePage.on("pageerror", (e) => offlineErrors.push(e.message));
  await offlinePage.goto(BASE + "/coding-robotics/code-studio", { waitUntil: "networkidle" });
  await offlinePage.waitForSelector(".monaco-editor");
  await sleep(2000);
  check("the page links its manifest", (await offlinePage.locator('link[rel="manifest"]').getAttribute("href")) === "/code-studio/manifest.webmanifest");
  check("nothing is registered or saved until the learner asks", (await offlinePage.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length + (await caches.keys()).length)) === 0);
  const bar = offlinePage.locator('[role="status"]', { hasText: "offline" }).first();
  check("the page offers to save for offline use", /Save Code Studio on this device/.test(await bar.innerText()));
  await offlinePage.click("button:has-text('Save for offline use')");
  await offlinePage.waitForSelector("text=Saved for offline use", { timeout: 180000 });
  const cached = await offlinePage.evaluate(async () => {
    const cache = await caches.open("rhinox-code-studio-offline-v1");
    return (await cache.keys()).map((r) => new URL(r.url).pathname);
  });
  check("the page, the worker, the Python runtime and the page's scripts are saved", ["/coding-robotics/code-studio", "/coding-robotics/code-studio/python-worker.js"].every((p) => cached.includes(p)) && cached.some((p) => p.endsWith("pyodide.asm.wasm")) && cached.some((p) => p.endsWith("python_stdlib.zip")) && cached.filter((p) => p.startsWith("/_next/static/")).length > 3, cached.length + " files");
  const registration = await offlinePage.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration("/coding-robotics/code-studio");
    return r ? new URL(r.scope).pathname : null;
  });
  check("the service worker is scoped to the Code Studio page only", registration === "/coding-robotics/code-studio", String(registration));

  // Run once online so the editor and worker files are all requested through the worker, then go offline.
  await offlinePage.reload({ waitUntil: "networkidle" });
  await offlinePage.waitForSelector(".monaco-editor");
  await sleep(2000);
  check("after saving, the service worker controls the Code Studio page", await offlinePage.evaluate(() => navigator.serviceWorker.controller !== null));

  await offlineContext.setOffline(true);
  const reachable = await offlinePage.evaluate(() => fetch("/robots.txt", { cache: "no-store" }).then(() => true, () => false));
  check("the network really is off for this test", reachable === false);
  await offlinePage.reload({ waitUntil: "domcontentloaded" });
  await offlinePage.waitForSelector(".monaco-editor", { timeout: 60000 });
  await sleep(2000);
  check("offline: the page opens from the saved copy", await offlinePage.locator("h1", { hasText: "Rhinox Code Studio" }).count() === 1);
  check("offline: the page is still cross-origin isolated (input() keeps working)", await offlinePage.evaluate(() => crossOriginIsolated === true));
  check("offline: the page says it is running from the saved copy", /running from the saved copy/.test(await offlinePage.locator('[role="status"]', { hasText: "offline" }).first().innerText()));

  async function offlineRun(code) {
    await offlinePage.click(".monaco-editor .view-lines");
    await offlinePage.keyboard.press("Control+A");
    await offlinePage.keyboard.press("Delete");
    await offlinePage.keyboard.insertText("exec(" + JSON.stringify(code) + ")");
    await offlinePage.click("button:has-text('Run')");
    await offlinePage.waitForFunction(() => {
      const run = [...document.querySelectorAll("button")].find((b) => /^(Run|Starting)/.test(b.textContent));
      return run && run.textContent === "Run" && !run.disabled;
    }, null, { timeout: 90000 });
    return offlinePage.evaluate(() => document.querySelector('[role="log"]').innerText);
  }
  let out = await offlineRun('print("hello from offline")');
  check("offline: Python starts and runs a program", out.includes("hello from offline"), out.replace(/\s+/g, " ").slice(0, 100));
  await offlinePage.click(".monaco-editor .view-lines");
  await offlinePage.keyboard.press("Control+A");
  await offlinePage.keyboard.press("Delete");
  await offlinePage.keyboard.insertText("exec(" + JSON.stringify('name = input("Name? ")\nprint("Hi", name)') + ")");
  await offlinePage.click("button:has-text('Run')");
  await offlinePage.waitForSelector("#rx-input", { timeout: 60000 });
  check("offline: input() waits for the learner", true);
  await offlinePage.fill("#rx-input", "Ada");
  await offlinePage.click("button:has-text('Send')");
  await offlinePage.waitForSelector("text=Hi Ada", { timeout: 30000 });
  check("offline: the typed answer reaches the program", true);
  out = await offlineRun('import charts\nwith open("o.csv", "w") as f:\n    f.write("1,2\\n")\ncharts.bar_chart(["a"], [1], "Offline chart")\nprint(open("o.csv").read().strip())');
  check("offline: files and charts work", out.includes("1,2") && (await offlinePage.locator('section[aria-label="Charts drawn by your program"]').count()) === 1);
  out = await offlineRun('import socket');
  check("offline: the security rules are the same", /does not allow importing 'socket'/.test(out));
  check("offline: no page errors", offlineErrors.length === 0, offlineErrors.slice(0, 2).join(" | "));

  await offlineContext.setOffline(false);
  const otherPage = await offlineContext.newPage();
  await otherPage.goto(BASE + "/shop", { waitUntil: "domcontentloaded" });
  check("other pages of the site are not controlled by the service worker", (await otherPage.evaluate(() => navigator.serviceWorker.controller)) === null);
  await otherPage.close();

  await offlinePage.reload({ waitUntil: "networkidle" });
  await offlinePage.waitForSelector(".monaco-editor");
  await sleep(1500);
  await offlinePage.click("button:has-text('Remove saved copy')");
  await offlinePage.waitForSelector("text=Save Code Studio on this device", { timeout: 20000 });
  check("Remove saved copy deletes the copy and the service worker", (await offlinePage.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length + (await caches.keys()).length)) === 0);
  check("removing the copy keeps the learner's own work", await offlinePage.evaluate(() => Boolean(localStorage.getItem("rhinox-code-studio-files") || localStorage.getItem("rhinox-code-studio"))));
  await offlineContext.close();

  await browser.close();
  const failed = results.filter((x) => !x.ok);
  console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((error) => {
  console.error("TEST RUN FAILED:", error.message);
  process.exit(2);
});
