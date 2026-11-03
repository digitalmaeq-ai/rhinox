#!/usr/bin/env node
// Virtual Science Lab route check (audit Phase 1). Needs a running server:
//   npm run build && npx next start -p 3107
//   BASE_URL=http://localhost:3107 node scripts/test-virtual-lab-routes.mjs
// For every published lab it opens its page link, checks the page shows
// that lab (not the "being prepared" placeholder), checks the older
// /explore/virtual-lab/<slug> address, and checks unknown and archived slugs.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { STUDIO_ROUTES, experienceHref } from "../lib/studio-routes.ts";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CONTENT = "content/experiences";

const experiences = [];
for (const file of readdirSync(CONTENT).filter((f) => f.endsWith(".ts"))) {
  const mod = await import(new URL(`../${CONTENT}/${file}`, import.meta.url));
  for (const value of Object.values(mod)) if (value && typeof value === "object" && value.contentType === "experience") experiences.push(value);
}
const labs = experiences.filter((e) => ["simulation", "virtual-lab"].includes(e.runtime) && e.status === "active");
const archived = experiences.filter((e) => e.status !== "active");

const get = (path, init) => fetch(BASE + path, { redirect: "manual", ...init });
const decode = (html) => html.replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&");

let failures = 0;
const positions = [];
const rows = [];
async function check(name, fn) {
  try {
    await fn();
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}\n     ${error.message}`);
  }
}

// The catalogue groups its cards by subject and only renders the first group on
// the server, so the card-link check lives in the browser test
// (scripts/virtual-lab-catalogue-browser-tests.cjs).
for (const lab of labs) {
  const href = experienceHref(lab.slug);
  const row = { name: lab.title, slug: lab.slug, subject: (lab.subjects ?? []).join("/"), component: lab.component, href, page: "?", legacy: "?" };
  rows.push(row);

  await check(`${lab.slug}: ${href} shows the lab`, async () => {
    const res = await get(href);
    assert.equal(res.status, 200, `HTTP ${res.status}`);
    const html = decode(await res.text());
    assert.ok(html.includes(lab.title), `the page does not show the title "${lab.title}"`);
    assert.ok(!/runtime is being prepared/i.test(html), "the page shows the runtime placeholder");
    assert.ok(/id="experiment"/.test(html), "the page has no lab area");
    const position = html.replace(/<[^>]*>/g, " ").match(/Virtual Lab\s+·\s+(\d+) of (\d+)/);
    assert.ok(position, "the page shows no \"N of M\" position");
    assert.equal(Number(position[2]), labs.length, `the page says "${position[1]} of ${position[2]}" but there are ${labs.length} published labs`);
    positions.push(Number(position[1]));
    row.page = `200 lab ${position[1]}/${position[2]}`;
  });

  await check(`${lab.slug}: old /explore/virtual-lab/${lab.slug} address goes to the lab`, async () => {
    const res = await get(`/explore/virtual-lab/${lab.slug}`);
    assert.ok([307, 308].includes(res.status), `HTTP ${res.status}, expected a redirect`);
    assert.equal(new URL(res.headers.get("location"), BASE).pathname, href);
    row.legacy = `${res.status} -> ${href}`;
  });
}

await check("lab positions are 1..N with no gaps or repeats (previous/next numbering)", async () => {
  assert.deepEqual([...positions].sort((a, b) => a - b), labs.map((_, i) => i + 1));
});

await check("unknown slugs return 404 on both addresses", async () => {
  for (const path of ["/experiences/no-such-lab", "/explore/virtual-lab/no-such-lab", "/explore/virtual-lab/Titration", "/explore/virtual-lab/earth-structure/extra"]) {
    const res = await get(path);
    assert.equal(res.status, 404, `${path} gave HTTP ${res.status}, expected 404`);
  }
});

await check("archived or draft experiences return 404", async () => {
  assert.ok(archived.length > 0, "expected at least one non-published experience to test");
  for (const e of archived) {
    for (const path of [`/experiences/${e.slug}`, `/explore/virtual-lab/${e.slug}`]) {
      const res = await get(path);
      assert.equal(res.status, 404, `${path} (status "${e.status}") gave HTTP ${res.status}, expected 404`);
    }
  }
});

await check("a live experience with a studio route still redirects to its studio page", async () => {
  for (const [slug, href] of Object.entries(STUDIO_ROUTES)) {
    const res = await get(`/experiences/${slug}`);
    assert.ok([307, 308].includes(res.status), `/experiences/${slug} gave HTTP ${res.status}, expected a redirect`);
    assert.equal(new URL(res.headers.get("location"), BASE).pathname, href);
    const studio = await get(href);
    assert.equal(studio.status, 200, `${href} gave HTTP ${studio.status}`);
  }
});

await check("a non-lab experience slug does not open at the virtual-lab address", async () => {
  const other = experiences.find((e) => e.status === "active" && !["simulation", "virtual-lab"].includes(e.runtime));
  assert.ok(other, "no non-lab experience found");
  const res = await get(`/explore/virtual-lab/${other.slug}`);
  assert.equal(res.status, 404, `/explore/virtual-lab/${other.slug} gave HTTP ${res.status}`);
});

console.table(rows);
console.log(failures === 0 ? `\nAll route checks passed for ${labs.length} published labs against ${BASE}.` : `\n${failures} route check(s) failed.`);
process.exitCode = failures === 0 ? 0 : 1;
