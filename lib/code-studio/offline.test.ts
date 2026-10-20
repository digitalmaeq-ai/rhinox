// Run with:  npx tsx lib/code-studio/offline.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { OFFLINE_CACHE, PAGE_PATH, PYODIDE_FILES, SW_SCOPE, SW_URL, allAddresses, isSaveable, requiredAddresses } from "./offline";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const ORIGIN = "https://rhinox.example";

test("the service worker and the page use the same cache name and page path", () => {
  const sw = read("public/code-studio/offline-sw.js");
  assert.ok(sw.includes(`const CACHE = "${OFFLINE_CACHE}";`));
  assert.ok(sw.includes(`const PAGE = "${PAGE_PATH}";`));
});

test("the runtime file list matches the files the build copies", () => {
  const script = read("scripts/copy-code-studio-assets.mjs");
  const block = /const FILES = \[([^\]]*)\]/.exec(script)?.[1] ?? "";
  const copied = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...PYODIDE_FILES], copied);
});

test("the manifest matches the page and the scope", () => {
  const manifest = JSON.parse(read("public/code-studio/manifest.webmanifest"));
  assert.equal(manifest.start_url, PAGE_PATH);
  assert.equal(manifest.scope, SW_SCOPE);
  assert.equal(manifest.id, PAGE_PATH);
  assert.equal(manifest.display, "standalone");
  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
  assert.deepEqual(sizes, ["192x192", "512x512"]);
});

test("the service worker is allowed to control exactly the Code Studio page", () => {
  const config = read("next.config.ts");
  assert.ok(config.includes(SW_URL));
  assert.ok(config.includes(`Service-Worker-Allowed`) && config.includes(SW_SCOPE));
});

test("only this site's own static addresses are ever saved", () => {
  const ok = ["/_next/static/chunks/a.js", "/pyodide/314.0.7/pyodide.asm.wasm", "/coding-robotics/code-studio/python-worker.js", "/brand/favicon.svg", "/images/hero/a.webp", `${ORIGIN}/_next/static/css/x.css?v=1`];
  for (const a of ok) assert.ok(isSaveable(a, ORIGIN), a);
  const bad = [
    "https://evil.example/_next/static/a.js", "//evil.example/_next/static/a.js", "/api/secret", "/shop", "/coding-robotics/my-projects",
    "/_next/static/../../api/x", "/_next//static/a.js", "javascript:alert(1)", "data:text/html,x", "blob:https://x/y", "/code-studio/offline-sw.js", "", "/_next/image?url=a",
  ];
  for (const a of bad) assert.ok(!isSaveable(a, ORIGIN), a);
});

test("the list to save has the required files first, no repeats, and a size cap", () => {
  const required = requiredAddresses();
  assert.equal(required[0], PAGE_PATH);
  assert.ok(required.some((a) => a.endsWith("pyodide.asm.wasm")));
  const loaded = [`${ORIGIN}/_next/static/chunks/a.js`, `${ORIGIN}/_next/static/chunks/a.js`, "https://evil.example/x.js", `${ORIGIN}/api/x`, ...Array.from({ length: 1000 }, (_, i) => `${ORIGIN}/_next/static/chunks/${i}.js`)];
  const all = allAddresses(loaded, ORIGIN);
  assert.deepEqual(all.slice(0, required.length), required);
  assert.equal(new Set(all).size, all.length);
  assert.ok(all.length <= required.length + 300);
  assert.ok(!all.some((a) => a.includes("evil") || a.includes("/api/")));
});

console.log(`\n${passed} tests passed`);
