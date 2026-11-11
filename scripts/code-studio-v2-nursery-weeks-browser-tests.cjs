#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script run by hand with a global Playwright */
// Walks Nursery 1 Term 1 Weeks 2 to 8 from the first step to the finish screen.
// Run against a production build:
//   node scripts/code-studio-v2-nursery-weeks-browser-tests.cjs http://localhost:3100
const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const { chromium } = require("playwright");
const cfg = {
  2: { think: "Think about Ayo’s morning", move: "I acted out my morning", code: ["Ayo wakes up","Ayo gets dressed","Ayo walks to school"], create: "I drew my morning in 3 boxes", extra: "Ayo walks to school" },
  3: { think: "Think about instructions", move: "We played Robot Says", code: ["Walk","Pick up"], create: "I drew Ayo reaching the toy", extra: "Stop" },
  4: { think: "Think about Ayo and the door", move: "We played the line-up game", code: ["Ayo stands up","Ayo walks to the door","Ayo waves at the door"], create: "I drew making bread in 3 boxes", extra: "Ayo waves at the door" },
  5: { think: "Think about Ayo’s mistake", move: "We played Silly Ayo", code: ["Put on socks","Put on shoes","Go out to play"], create: "I drew Oops! and Fixed!", extra: "Put on socks" },
  6: { think: "Think about again and again", move: "We did the robot dance", code: ["Ayo claps 1 time","Ayo claps 2 times","Ayo claps 3 times"], create: "I drew one move 3 times", extra: "3 times" },
  7: { think: "Which game do you like best?", move: "We played the robot games", code: ["Mix flour","Bake bread","Eat bread"], create: "I drew or chose my favourite game", extra: "Go out to play" },
  8: { think: "Think about Ayo’s market story", move: "We acted out Jack and Jill", code: ["Ayo leaves home","Ayo rides a bus","Ayo buys bread","Ayo comes home"], create: "I drew the end of Ayo’s story", extra: "Ayo comes home" },
};
(async () => {
  const b = await chromium.launch(); let bad = 0;
  for (const w of [2, 3, 4, 5, 6, 7, 8]) {
    const c = cfg[w]; const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
    await p.goto(`${BASE}/think-move-code/nursery-1/term-1/week-${w}/lesson`);
    const body = () => p.locator("body").innerText();
    const ok = (n, v) => { if (!v) bad++; console.log(`W${w} ${v ? "ok  " : "FAIL"} ${n}`); };
    const next = () => p.getByRole("button", { name: /^(next|continue)/i }).first().click();
    ok("5 steps, no build", (await body()).includes("STEP 1 OF 5") && !(await body()).includes("Build and try"));
    ok("think title", (await p.locator("h1").first().innerText()).trim() === c.think);
    await next();
    await p.getByRole("button", { name: c.move }).click(); await next();
    for (const l of c.code) await p.getByRole("button", { name: new RegExp("^\\s*" + l) }).first().click();
    await p.getByRole("button", { name: /check/i }).first().click();
    ok("correct order accepted", /correct|well done|great|✓/i.test(await body()));
    await next();
    await p.getByRole("button", { name: c.create }).click(); await next();
    await p.getByRole("button", { name: /Yes, I watched them do it/ }).click({timeout:5000});
    await p.getByRole("radio", { name: new RegExp("^\\s*" + c.extra) }).first().check({ timeout: 5000 });
    await p.getByRole("button", { name: /Check answer/ }).click();
    ok("extra practice answered", /correct|well done|great|✓/i.test(await body()));
    await p.getByRole("button", { name: /Finish activity/ }).click();
    const end = await body();
    ok("activity complete", end.includes("ACTIVITY COMPLETE") || /Great work/.test(end));
    ok("no page errors", errs.length === 0);
    await p.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.log("ERR", e.message.split("\n")[0]); process.exit(1); });
