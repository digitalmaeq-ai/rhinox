// Tests for the Learning Path data (phase 2). Run: node --experimental-strip-types --no-warnings scripts/test-tmc-learning-path.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { NURSERY_1_REGISTRY } from "../lib/tmc-registry/seed/nursery-1.ts";
import { buildPathView } from "../lib/tmc-path/view.ts";
import { buildLearningPath, validateLearningPath, isLearnerSafeResource, STEP_ORDER, RESOURCE_TYPE_FOR_STEP } from "../lib/tmc-path/learning-path.ts";

const R = NURSERY_1_REGISTRY;
const LEVEL = "Nursery 1";
const path = buildLearningPath(R, LEVEL);
const clone = () => structuredClone(path);
const errorsFor = (p, options) => validateLearningPath(p, R, options).errors;
const byId = new Map(R.resources.map((item) => [item.id, item]));

test("builds one stop per Nursery 1 week, each with Learn, Play, Match and Quiz", () => {
  assert.equal(path.stops.length, 39);
  assert.deepEqual([1, 2, 3].map((term) => path.stops.filter((s) => s.term === term).length), [13, 13, 13]);
  for (const stop of path.stops) assert.deepEqual(stop.steps.map((s) => s.kind), [...STEP_ORDER], stop.id);
  assert.equal(path.stops.reduce((n, s) => n + s.steps.length, 0), 156);
  assert.deepEqual(path.stops.slice(0, 3).map((s) => `${s.term}-${s.week}`), ["1-1", "1-2", "1-3"], "stops are in book order");
});

test("the built path passes its own validator", () => {
  assert.deepEqual(errorsFor(path), []);
});

test("stop titles come from the book registry, not from this module", () => {
  const titles = new Map(R.lessons.filter((l) => l.unitKind === "week" && l.bookId.includes("activity")).map((l) => [`${l.term}-${l.week}`, l.lessonTitle]));
  for (const stop of path.stops) assert.equal(stop.title, titles.get(`${stop.term}-${stop.week}`) ?? stop.title);
  assert.ok(path.stops.every((s) => s.title.length > 0));
});

test("no copied content: a step is only id, kind, resourceId and label", () => {
  for (const stop of path.stops) for (const step of stop.steps) {
    assert.deepEqual(Object.keys(step).sort(), ["id", "kind", "label", "resourceId"]);
    assert.ok(byId.has(step.resourceId), `${step.id} points at a real registry resource`);
  }
  assert.deepEqual(Object.keys(path).sort(), ["id", "level", "order", "stops", "title"]);
});

test("every step points at the right kind of resource for its own week", () => {
  for (const stop of path.stops) for (const step of stop.steps) {
    const resource = byId.get(step.resourceId);
    assert.equal(resource.resourceType, RESOURCE_TYPE_FOR_STEP[step.kind]);
    assert.deepEqual([resource.level, resource.term, resource.week], [stop.level, stop.term, stop.week]);
  }
  const play = path.stops[0].steps.find((s) => s.kind === "play").resourceId;
  const match = path.stops[0].steps.find((s) => s.kind === "match").resourceId;
  assert.notEqual(play, match, "Play and Match are two different games");
});

test("the child path never opens teacher-only, licensed, interactive-lesson or unverified resources", () => {
  const referenced = path.stops.flatMap((s) => s.steps.map((x) => byId.get(x.resourceId)));
  for (const resource of referenced) {
    assert.equal(resource.accessLevel, "public", resource.id);
    assert.ok(resource.audience.includes("learner"), resource.id);
    assert.equal(resource.availability, "verified", resource.id);
    assert.notEqual(resource.resourceType, "interactive-lesson", "Code Studio lessons are set aside for now");
    assert.ok(isLearnerSafeResource(resource));
  }
  const types = new Set(referenced.map((r) => r.resourceType));
  for (const blocked of ["lesson-plan", "teacher-parent-guide", "project-sheet", "review-sheet", "question-bank", "printable", "qr-code", "interactive-lesson"]) assert.ok(!types.has(blocked), `no ${blocked}`);
});

test("the order is soft: nothing is locked", () => {
  assert.equal(path.order, "soft");
  assert.ok(!JSON.stringify(path).match(/lock|require|prerequisite/i), "no lock or prerequisite fields");
  assert.ok(errorsFor({ ...clone(), order: "locked" }).some((e) => /soft/.test(e)));
});

test("validator catches a missing resource", () => {
  const p = clone(); p.stops[0].steps[1].resourceId = "tmc-n1-t1-w1-no-such-game";
  assert.ok(errorsFor(p).some((e) => /not in the registry/.test(e)));
});

test("validator catches a resource from another week", () => {
  const p = clone(); p.stops[0].steps[3].resourceId = p.stops[1].steps[3].resourceId;
  assert.ok(errorsFor(p).some((e) => /different week|not this week/.test(e)));
});

test("validator catches a teacher-only resource and a wrong resource type", () => {
  const p = clone(); p.stops[0].steps[3].resourceId = "tmc-n1-t1-w1-question-bank-pdf";
  const errors = errorsFor(p);
  assert.ok(errors.some((e) => /must point at a quiz/.test(e)));
  assert.ok(errors.some((e) => /not safe for the child path/.test(e)));
});

test("validator catches an interactive lesson used as a step", () => {
  const p = clone(); p.stops[0].steps[0].resourceId = "tmc-n1-t1-w1-interactive-lesson";
  assert.ok(errorsFor(p).some((e) => /not safe for the child path|must point at/.test(e)));
});

test("validator catches the wrong step order, duplicates and empty stops", () => {
  const swapped = clone(); swapped.stops[0].steps.reverse();
  assert.ok(errorsFor(swapped).some((e) => /order/.test(e)));
  const dupStep = clone(); dupStep.stops[0].steps.push({ ...dupStep.stops[0].steps[0] });
  assert.ok(errorsFor(dupStep).some((e) => /duplicate step/.test(e)));
  const dupStop = clone(); dupStop.stops.push(dupStop.stops[0]);
  assert.ok(errorsFor(dupStop).some((e) => /duplicate stop/.test(e)));
  const empty = clone(); empty.stops[0].steps = [];
  assert.ok(errorsFor(empty).some((e) => /at least one step/.test(e)));
  const noLabel = clone(); noLabel.stops[0].steps[0].label = " ";
  assert.ok(errorsFor(noLabel).some((e) => /label is empty/.test(e)));
});

test("validator can require every week to have a stop", () => {
  const p = clone(); p.stops.pop();
  assert.ok(errorsFor(p).some((e) => /missing stop for t3-w13/.test(e)));
  assert.deepEqual(errorsFor(p, { requireEveryWeek: false }), []);
});

test("the path module has no runtime imports, storage, network or secrets", () => {
  const text = fs.readFileSync(new URL("../lib/tmc-path/learning-path.ts", import.meta.url), "utf8");
  const runtimeImports = text.split("\n").filter((line) => /^\s*import\s/.test(line) && !/^\s*import\s+type\s/.test(line));
  assert.deepEqual(runtimeImports, [], "only type imports");
  for (const banned of [/\bfetch\s*\(/, /localStorage|sessionStorage|indexedDB|document\.cookie/, /process\.env/, /\bfrom\s+["']node:/, /XMLHttpRequest|WebSocket/]) assert.ok(!banned.test(text), String(banned));
});

test("the registry does not depend on the path", () => {
  for (const file of ["../lib/tmc-registry/book-registry.ts", "../lib/tmc-registry/seed/nursery-1.ts"]) {
    assert.ok(!/tmc-path/.test(fs.readFileSync(new URL(file, import.meta.url), "utf8")), file);
  }
});

test("the view gives every step an address in the shape of the existing site routes", () => {
  // The real check that every address loads is scripts/code-studio-v2-path-browser-tests.cjs.
  const view = buildPathView(path, R);
  assert.equal(view.stops.length, 39);
  const hrefs = [];
  for (const stop of view.stops) {
    const week = `/think-move-code/nursery-1/term-${stop.term}/week-${stop.week}`;
    assert.equal(stop.weekHref, week);
    for (const step of stop.steps) {
      hrefs.push(step.href);
      if (step.kind === "learn") assert.equal(step.href, week);
      if (step.kind === "play") assert.equal(step.href, `${week}/play/screen`);
      if (step.kind === "match") assert.equal(step.href, `${week}/play/pictures`);
      if (step.kind === "quiz") assert.equal(step.href, `/explore/stem-quizzes/nursery-1-term-${stop.term}-week-${stop.week}`);
    }
  }
  const play = fs.readFileSync(new URL("../lib/tmc/nursery-1.ts", import.meta.url), "utf8");
  assert.match(play, /pictures:/);
  assert.match(play, /screen:/);
  assert.equal(hrefs.length, 156);
  assert.equal(new Set(hrefs).size, 156, "no two steps open the same address");
  assert.ok(hrefs.every((h) => h.startsWith("/") && !h.includes("//")));
});

test("the view carries no content beyond titles, labels and addresses", () => {
  const view = buildPathView(path, R);
  assert.deepEqual(Object.keys(view).sort(), ["level", "stops", "title"]);
  assert.deepEqual(Object.keys(view.stops[0]).sort(), ["id", "steps", "term", "title", "week", "weekHref"]);
  assert.deepEqual(Object.keys(view.stops[0].steps[0]).sort(), ["href", "id", "kind", "label"]);
  const text = fs.readFileSync(new URL("../lib/tmc-path/view.ts", import.meta.url), "utf8");
  assert.deepEqual(text.split("\n").filter((l) => /^\s*import\s/.test(l) && !/^\s*import\s+type\s/.test(l)), []);
});

test("the server module is server-only and fails the build on a bad path", () => {
  const text = fs.readFileSync(new URL("../lib/tmc-path/learning-path.server.ts", import.meta.url), "utf8");
  assert.match(text, /import "server-only"/);
  assert.match(text, /validateLearningPath/);
  assert.match(text, /throw new Error/);
});
