#!/usr/bin/env node
// Virtual Science Lab registry integrity (audit Phase 1).
//
// Every published virtual lab must have a specification, a 3D scene and a real
// destination page, and the registry and the scene map must agree. The
// registry and scene map import React components, which Node cannot load, so
// their source is read as text; the experience content files are plain data
// and are imported directly. Run: node scripts/test-virtual-lab-registry.mjs
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { STUDIO_ROUTES, experienceHref } from "../lib/studio-routes.ts";

const SIMLAB = "app/components/interactive/simlab";
const registrySrc = readFileSync(`${SIMLAB}/registry.ts`, "utf8");
const scenesSrc = readFileSync(`${SIMLAB}/scenes3d/scenes.ts`, "utf8");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`ok   ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}\n     ${error.message}`);
    process.exitCode = 1;
  }
}

// ---- Registry: experience.component -> spec -------------------------------
const imports = new Map(); // identifier -> spec file
for (const match of registrySrc.matchAll(/import \{ (\w+) \} from "\.\/specs\/([\w-]+)";/g)) imports.set(match[1], match[2]);

const baseBlock = registrySrc.match(/const base: Record<string, SimSpec> = \{([\s\S]*?)\n\};/)?.[1] ?? "";
const registryEntries = [...baseBlock.matchAll(/^\s*"?([\w-]+)"?(?::\s*(\w+))?,\s*$/gm)].map((m) => ({ key: m[1], ident: m[2] ?? m[1] }));

// ---- Scene map: experience.component -> 3D scene --------------------------
const sceneEntries = [...scenesSrc.matchAll(/^\s*"?([\w-]+)"?:\s*\{\s*Scene:\s*(\w+),/gm)].map((m) => ({ key: m[1], scene: m[2] }));
const sceneImports = new Map(); // component name -> file
for (const match of scenesSrc.matchAll(/import \{([^}]+)\} from "\.\/(\w+)";/g)) for (const name of match[1].split(",")) sceneImports.set(name.trim(), match[2]);

// ---- Content: every experience --------------------------------------------
const CONTENT = "content/experiences";
const experiences = [];
for (const file of readdirSync(CONTENT).filter((f) => f.endsWith(".ts"))) {
  const mod = await import(new URL(`../${CONTENT}/${file}`, import.meta.url));
  for (const value of Object.values(mod)) if (value && typeof value === "object" && value.contentType === "experience") experiences.push(value);
}
const labs = experiences.filter((e) => ["simulation", "virtual-lab"].includes(e.runtime));
const published = labs.filter((e) => e.status === "active"); // "active" is how experiences are published
const registryKeys = new Set(registryEntries.map((e) => e.key));
const sceneKeys = new Set(sceneEntries.map((e) => e.key));

check("the registry and scene map were read (15 labs expected, not zero)", () => {
  assert.ok(registryEntries.length >= 15, `registry parsed ${registryEntries.length} entries`);
  assert.ok(sceneEntries.length >= 15, `scene map parsed ${sceneEntries.length} entries`);
  assert.ok(published.length >= 15, `content has ${published.length} published labs`);
});

check("1. every published lab has a valid specification", () => {
  for (const lab of published) {
    assert.ok(lab.component, `${lab.slug} has no "component"`);
    assert.ok(registryKeys.has(lab.component), `${lab.slug}: component "${lab.component}" is not in the registry, so it would show the "being prepared" placeholder`);
  }
  for (const { key, ident } of registryEntries) {
    const file = imports.get(ident);
    assert.ok(file, `registry "${key}" uses "${ident}", which is not imported from ./specs`);
    assert.ok(existsSync(`${SIMLAB}/specs/${file}.tsx`) || existsSync(`${SIMLAB}/specs/${file}.ts`), `spec file missing for "${key}": specs/${file}`);
  }
});

check("2. every lab marked has3D has a 3D scene", () => {
  // The registry sets has3D: true for every spec it holds.
  assert.match(registrySrc, /has3D: true/, "registry no longer sets has3D");
  for (const key of registryKeys) assert.ok(sceneKeys.has(key), `"${key}" is registered with has3D but has no scene in scenes3d/scenes.ts`);
});

check("3. every registered scene belongs to a registered experiment", () => {
  for (const key of sceneKeys) assert.ok(registryKeys.has(key), `scene "${key}" has no experiment in the registry`);
  for (const { key, scene } of sceneEntries) {
    const file = sceneImports.get(scene);
    assert.ok(file, `scene "${key}" uses ${scene}, which is not imported`);
    assert.ok(existsSync(`${SIMLAB}/scenes3d/${file}.tsx`), `scene file missing for "${key}": scenes3d/${file}`);
  }
});

check("4. no duplicate experiment slugs or registry keys", () => {
  const slugs = experiences.map((e) => e.slug);
  const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  assert.deepEqual(dupSlugs, [], `duplicate experience slugs: ${dupSlugs}`);
  const keys = registryEntries.map((e) => e.key);
  assert.deepEqual(keys.filter((k, i) => keys.indexOf(k) !== i), [], "duplicate registry keys");
  const labComponents = published.map((e) => e.component);
  assert.deepEqual(labComponents.filter((c, i) => labComponents.indexOf(c) !== i), [], "two published labs use the same component key");
});

check("5. no duplicate scene mappings", () => {
  const keys = sceneEntries.map((e) => e.key);
  assert.deepEqual(keys.filter((k, i) => keys.indexOf(k) !== i), [], "duplicate scene keys");
  const scenes = sceneEntries.map((e) => e.scene);
  assert.deepEqual(scenes.filter((s, i) => scenes.indexOf(s) !== i), [], "one 3D scene is mapped to two experiments");
});

check("6. every published lab opens a real page (never the placeholder address)", () => {
  assert.ok(existsSync("app/experiences/[slug]/page.tsx"), "the experience page is missing");
  for (const lab of published) {
    const href = experienceHref(lab.slug);
    assert.ok(!href.startsWith("/explore/virtual-lab/"), `${lab.slug} links to the placeholder route: ${href}`);
    if (STUDIO_ROUTES[lab.slug]) assert.ok(existsSync(`app${href}/page.tsx`), `${lab.slug}: studio page missing at ${href}`);
    else assert.equal(href, `/experiences/${lab.slug}`);
  }
});

check("7. unknown, draft and archived slugs are not served (source guard; the route test checks it live)", () => {
  const detail = readFileSync("app/explore/virtual-lab/[slug]/page.tsx", "utf8");
  assert.match(detail, /notFound\(\)/, "the virtual-lab address must call notFound() for unknown slugs");
  assert.doesNotMatch(detail, /<main/, "the virtual-lab address must redirect or 404, not render a page of its own");
  const page = readFileSync("app/experiences/[slug]/page.tsx", "utf8");
  assert.match(page, /isLiveContent\(experience\)/, "the experience page must only serve live experiences");
});

console.log(`\n${passed} checks passed; ${published.length} published labs, ${registryEntries.length} specs, ${sceneEntries.length} scenes.`);
