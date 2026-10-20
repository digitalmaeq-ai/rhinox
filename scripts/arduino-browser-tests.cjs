/* eslint-disable @typescript-eslint/no-require-imports */
// Browser tests for Rhinox Arduino Studio.
//
//   npm run build && npm run start
//   npm install --no-save playwright && npx playwright install chromium   (one time)
//   node scripts/arduino-browser-tests.cjs http://localhost:3000
//
// Opens the Arduino Studio page in a real browser, runs the example programs and some broken and
// hostile ones, and checks the board, the Serial Monitor, the Stop button and the page's recovery.
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const URL = BASE + "/coding-robotics/arduino-studio";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function headersOf(path) {
  const r = await fetch(BASE + path);
  return { status: r.status, coop: r.headers.get("cross-origin-opener-policy"), coep: r.headers.get("cross-origin-embedder-policy"), corp: r.headers.get("cross-origin-resource-policy"), csp: r.headers.get("content-security-policy") };
}

(async () => {
  const page0 = await headersOf("/coding-robotics/arduino-studio");
  check("Arduino page is isolated and has a CSP", page0.coop === "same-origin" && page0.coep === "require-corp" && /connect-src 'self'/.test(page0.csp || ""));
  for (const f of ["arduino-worker.js", "arduino-vm.js"]) {
    const h = await headersOf("/coding-robotics/code-studio/" + f);
    check(`${f} is served with CORP and a locked-down CSP`, h.status === 200 && h.corp === "same-origin" && /default-src 'none'/.test(h.csp || ""), JSON.stringify(h));
  }

  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  const external = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("request", (r) => {
    if (!r.url().startsWith(BASE) && !/^(data|blob):/.test(r.url())) external.push(r.url());
  });

  async function open() {
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForFunction(() => window.crossOriginIsolated === true, null, { timeout: 15000 }).catch(() => {});
    await page.waitForSelector(".monaco-editor", { timeout: 30000 });
  }
  async function type(code) {
    await page.click(".monaco-editor .view-lines");
    await page.keyboard.press("Control+A");
    await page.keyboard.insertText(code);
  }
  const lit = (pin) => page.locator(`[data-pin="${pin}"]`).getAttribute("data-lit");
  const serialText = () => page.locator('[aria-label="Serial Monitor"] pre').innerText();
  const runButton = page.getByRole("button", { name: /^(Run|Running…)$/ });
  async function stop() {
    await page.getByRole("button", { name: "Stop" }).click({ timeout: 5000 }).catch(() => {});
    await page.waitForFunction(() => /^Run$/.test([...document.querySelectorAll("button")].find((b) => /^(Run|Running…)$/.test(b.textContent || ""))?.textContent || ""), null, { timeout: 8000 }).catch(() => {});
  }
  async function pickExample(id) {
    await page.selectOption('select[aria-label="Choose an example program"]', id);
    await sleep(400);
  }
  async function waitFor(fn, ms = 6000) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (await fn()) return true;
      await sleep(80);
    }
    return false;
  }

  await open();
  check("the page is cross-origin isolated", await page.evaluate(() => window.crossOriginIsolated === true));
  check("the board shows five LEDs, two buttons and two dials", (await page.locator("[data-pin]").count()) === 5 && (await page.locator('button[aria-label^="Push button"]').count()) === 2 && (await page.locator('input[type="range"]').count()) === 2);

  // Blink
  await runButton.click();
  const sawOn = await waitFor(async () => (await lit(13)) === "1", 4000);
  const sawOff = await waitFor(async () => (await lit(13)) === "0", 4000);
  check("Blink: the built-in LED turns on and then off", sawOn && sawOff);
  await stop();
  check("Stop ends the run", await waitFor(async () => (await runButton.textContent()) === "Run", 5000));

  // Button controls an LED
  await pickExample("button");
  await runButton.click();
  await sleep(1200);
  check("Button: the LED is off before the button is held", (await lit(12)) === "0");
  const b2 = page.locator('button[aria-label^="Push button on pin 2"]');
  await b2.scrollIntoViewIfNeeded();
  const box = await b2.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  check("Button: holding the button lights the LED", await waitFor(async () => (await lit(12)) === "1", 3000));
  await page.mouse.up();
  check("Button: letting go turns it off", await waitFor(async () => (await lit(12)) === "0", 3000));
  await stop();

  // Dimmer + Serial
  await pickExample("dimmer");
  await runButton.click();
  await page.locator('input[aria-label^="Dial on A0"]').fill("1023");
  check("Dial: Serial Monitor shows 255 at full turn", await waitFor(async () => /(^|\n)255\n/.test(await serialText()), 5000));
  await page.locator('input[aria-label^="Dial on A0"]').fill("0");
  check("Dial: Serial Monitor shows 0 and the LED goes dark", (await waitFor(async () => /(^|\n)0\n/.test(await serialText()), 5000)) && (await waitFor(async () => (await lit(9)) === "0", 3000)));
  await stop();

  // Serial counter
  await pickExample("count");
  await runButton.click();
  check("Counter: Count: 0 then Count: 1 appear a second apart", await waitFor(async () => /Count: 0\s+Count: 1/.test(await serialText()), 6000));
  await stop();

  // Buzzer
  await pickExample("tune");
  await runButton.click();
  await sleep(800);
  await page.locator('button[aria-label^="Push button on pin 2"]').scrollIntoViewIfNeeded();
  const b2b = await page.locator('button[aria-label^="Push button on pin 2"]').boundingBox();
  await page.mouse.move(b2b.x + b2b.width / 2, b2b.y + b2b.height / 2);
  await page.mouse.down();
  check("Buzzer: shows it is sounding when the tune plays", await waitFor(async () => (await page.locator('[aria-label^="Buzzer"]').getAttribute("aria-label")).includes("sounding"), 4000));
  await page.mouse.up();
  await stop();

  // Errors
  await pickExample("blink");
  await type("void setup(){ foo(); } void loop(){}");
  await runButton.click();
  check("A mistake is explained with its line", await waitFor(async () => /Error: line 1: 'foo' was not declared/.test(await serialText()), 5000));
  await type("void setup(){ int x = ; } void loop(){}");
  await runButton.click();
  check("A syntax error is explained", await waitFor(async () => /Error: line 1: expected an expression/.test(await serialText()), 5000));

  // Hostile programs
  await type("void setup(){ while(true){} } void loop(){}");
  await runButton.click();
  await sleep(1500);
  check("An endless loop leaves the page responsive", await page.evaluate(() => new Promise((r) => setTimeout(() => r(true), 50))));
  await stop();
  check("An endless loop can be stopped", await waitFor(async () => (await runButton.textContent()) === "Run", 6000));

  await type('void setup(){ while(true){ Serial.println("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); } } void loop(){}');
  await runButton.click();
  check("Printing forever is cut off by the Serial limit", await waitFor(async () => /Serial Monitor is full/.test(await serialText()), 15000));
  await stop();

  await type("void f(int n){ f(n+1); } void setup(){ f(0); } void loop(){}");
  await runButton.click();
  check("Endless recursion is stopped with a clear message", await waitFor(async () => /nested function calls/.test(await serialText()), 5000));

  await type("void setup(){ pinMode(13, OUTPUT); } void loop(){ digitalWrite(13, HIGH); delay(100); digitalWrite(13, LOW); delay(100); }");
  await runButton.click();
  check("The page recovers and runs a normal program afterwards", await waitFor(async () => (await lit(13)) === "1", 4000));
  await stop();

  // Python Studio is not disturbed
  await page.goto(BASE + "/coding-robotics/code-studio", { waitUntil: "load" });
  check("Python Studio page still loads", await page.waitForSelector(".monaco-editor", { timeout: 30000 }).then(() => true).catch(() => false));

  check("no scripts or files were fetched from other sites", external.length === 0, external.join(", "));
  check("no uncaught errors on the page", pageErrors.length === 0, pageErrors.join(" | "));

  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed} of ${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
