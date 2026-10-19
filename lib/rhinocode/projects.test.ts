// Run with:  npx tsx lib/rhinocode/projects.test.ts
import assert from "node:assert/strict";

import {
  LEGACY_PROGRAMMES_KEY, MAX_NAME, MAX_PER_KIND, PROJECTS_KEY,
  createProject, deleteProject, getProject, listProjects, readStore, renameProject, updateProjectData,
  type KeyValue,
} from "./projects";

function memory(seed: Record<string, string> = {}): KeyValue & { data: Record<string, string> } {
  const data = { ...seed };
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
}

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}

const legacy = JSON.stringify([
  { id: "old1", name: "Spiral", savedAt: 1000, workspace: { blocks: [] } },
  { id: "old2", name: "Zig", savedAt: 2000, workspace: { blocks: [1] } },
  { id: 5, name: "bad" },
]);

test("empty storage gives an empty list", () => {
  assert.deepEqual(listProjects(undefined, memory()), []);
});

test("old Robot Lab saves appear without writing anything", () => {
  const kv = memory({ [LEGACY_PROGRAMMES_KEY]: legacy });
  const list = listProjects("robot-program", kv);
  assert.deepEqual(list.map((p) => p.id), ["old2", "old1"]);
  assert.equal(kv.data[PROJECTS_KEY], undefined);
});

test("first write imports old saves once and leaves the old key alone", () => {
  const kv = memory({ [LEGACY_PROGRAMMES_KEY]: legacy });
  createProject("robot-program", "New", { blocks: [] }, kv, 5000);
  assert.equal(readStore(kv).projects.length, 3);
  assert.equal(kv.data[LEGACY_PROGRAMMES_KEY], legacy);
  createProject("robot-program", "Again", { blocks: [] }, kv, 6000);
  assert.equal(readStore(kv).projects.length, 4);
});

test("a deleted old save does not come back", () => {
  const kv = memory({ [LEGACY_PROGRAMMES_KEY]: legacy });
  deleteProject("old1", kv);
  assert.deepEqual(listProjects(undefined, kv).map((p) => p.id), ["old2"]);
});

test("create, rename, update and delete", () => {
  const kv = memory();
  const p = createProject("game", "  My   maze  ", { cells: 1 }, kv, 100);
  assert.equal(p.name, "My maze");
  renameProject(p.id, "Maze 2", kv);
  assert.equal(getProject(p.id, kv)?.name, "Maze 2");
  renameProject(p.id, "   ", kv);
  assert.equal(getProject(p.id, kv)?.name, "Maze 2");
  updateProjectData(p.id, { cells: 2 }, kv, 200);
  assert.deepEqual(getProject(p.id, kv)?.data, { cells: 2 });
  assert.equal(getProject(p.id, kv)?.updatedAt, 200);
  deleteProject(p.id, kv);
  assert.equal(getProject(p.id, kv), undefined);
});

test("names are trimmed to the limit and never empty", () => {
  const kv = memory();
  assert.equal(createProject("game", "x".repeat(200), {}, kv).name.length, MAX_NAME);
  assert.equal(createProject("game", "   ", {}, kv).name, "My project");
});

test("newest first, and filtered by kind", () => {
  const kv = memory();
  createProject("game", "a", {}, kv, 1);
  createProject("robot-program", "b", {}, kv, 2);
  createProject("game", "c", {}, kv, 3);
  assert.deepEqual(listProjects(undefined, kv).map((p) => p.name), ["c", "b", "a"]);
  assert.deepEqual(listProjects("game", kv).map((p) => p.name), ["c", "a"]);
});

test("the oldest of a kind is dropped past the limit, other kinds are kept", () => {
  const kv = memory();
  createProject("game", "keep", {}, kv, 1);
  for (let i = 0; i < MAX_PER_KIND + 3; i += 1) createProject("robot-program", `p${i}`, {}, kv, 10 + i);
  const robots = listProjects("robot-program", kv);
  assert.equal(robots.length, MAX_PER_KIND);
  assert.equal(robots[0].name, `p${MAX_PER_KIND + 2}`);
  assert.equal(listProjects("game", kv).length, 1);
});

test("corrupt or wrong-version storage is ignored, not fatal", () => {
  assert.deepEqual(listProjects(undefined, memory({ [PROJECTS_KEY]: "{not json" })), []);
  assert.deepEqual(listProjects(undefined, memory({ [PROJECTS_KEY]: JSON.stringify({ version: 9, projects: [] }) })), []);
  const kv = memory({ [PROJECTS_KEY]: JSON.stringify({ version: 1, legacyImported: true, projects: [{ id: 1 }, { id: "ok", kind: "game", name: "n", createdAt: 1, updatedAt: 1, data: {} }] }) });
  assert.deepEqual(listProjects(undefined, kv).map((p) => p.id), ["ok"]);
});

test("unavailable storage does nothing and does not throw", () => {
  assert.deepEqual(listProjects(undefined, null), []);
  createProject("game", "x", {}, null);
});

console.log(`\n${passed} tests passed`);
