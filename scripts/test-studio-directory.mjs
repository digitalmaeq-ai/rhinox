#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  STUDIO_ENTRIES,
  availableCategories,
  filterEntries,
  projectHref,
  sortEntries,
  sortProjects,
} from "../lib/studio-directory.ts";

// Every directory route must be a real page in the app (or the content catalogue).
const CONTENT_ROUTES = new Set(["/coding-robotics/challenges"]);
for (const entry of STUDIO_ENTRIES) {
  if (CONTENT_ROUTES.has(entry.href)) continue;
  const dir = `app${entry.href}`;
  assert.ok(existsSync(`${dir}/page.tsx`), `No page for ${entry.name} at ${entry.href}`);
}
assert.equal(new Set(STUDIO_ENTRIES.map((e) => e.id)).size, STUDIO_ENTRIES.length, "ids must be unique");
assert.equal(new Set(STUDIO_ENTRIES.map((e) => e.href)).size, STUDIO_ENTRIES.length, "routes must not be duplicated");

// Search
const robotIds = filterEntries(STUDIO_ENTRIES, "robot", "All").map((e) => e.id);
for (const id of ["robot-lab", "workspace", "arduino"]) assert.ok(robotIds.includes(id), `robot search should find ${id}`);
assert.ok(filterEntries(STUDIO_ENTRIES, "python", "All").some((e) => e.id === "python"));
assert.equal(filterEntries(STUDIO_ENTRIES, "zzzz-not-here", "All").length, 0);
assert.ok(filterEntries(STUDIO_ENTRIES, "", "Robotics").every((e) => e.category === "Robotics"));
assert.ok(filterEntries(STUDIO_ENTRIES, "PYTHON Years", "All").some((e) => e.id === "python"), "multi-word, case-insensitive");

// Filters offered only for categories that have content
const cats = availableCategories(STUDIO_ENTRIES);
for (const c of cats) assert.ok(STUDIO_ENTRIES.some((e) => e.category === c));
assert.equal(availableCategories([]).length, 0);

// Sorting
const byName = sortEntries(STUDIO_ENTRIES, "name").map((e) => e.name);
assert.deepEqual(byName, [...byName].sort((a, b) => a.localeCompare(b)));
assert.deepEqual(sortEntries(STUDIO_ENTRIES, "name", true).map((e) => e.name), [...byName].reverse());
const byDifficulty = sortEntries(STUDIO_ENTRIES, "difficulty");
assert.equal(byDifficulty[0].difficulty, "Beginner");
assert.equal(byDifficulty.at(-1).difficulty, "Intermediate");

// Projects
const p = (id, kind, name, updatedAt) => ({ id, kind, name, createdAt: 1, updatedAt, data: {} });
const projects = [p("a", "python", "Zed", 10), p("b", "game", "Alpha", 30), p("c", "arduino", "Mid", 20)];
assert.deepEqual(sortProjects(projects, "updated").map((x) => x.id), ["b", "c", "a"]);
assert.deepEqual(sortProjects(projects, "name").map((x) => x.id), ["b", "c", "a"]);
assert.deepEqual(sortProjects(projects, "type").map((x) => x.kind), ["arduino", "game", "python"]);
assert.equal(projectHref({ id: "x y", kind: "web" }), "/coding-robotics/code-studio/web?project=x%20y");
assert.equal(projectHref({ id: "g", kind: "game" }), "/coding-robotics/game-creator?project=g");

console.log("studio directory tests passed");
