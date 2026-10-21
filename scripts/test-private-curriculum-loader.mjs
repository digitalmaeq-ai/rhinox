#!/usr/bin/env node
/**
 * Integration tests for the private curriculum access boundary.
 * Run with: node --conditions=react-server --experimental-strip-types scripts/test-private-curriculum-loader.mjs
 */
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

let root;
let file;
const requestedId = "tmc-v3-15-nursery-1-t1-w1";

function makeRecord(week) {
  return {
    id: `tmc-v3-15-nursery-1-t1-w${week}`,
    curriculumVersion: "3.15",
    level: "Nursery 1",
    term: 1,
    week,
    weekType: "Themed learning",
    theme: `Theme ${week}`,
    focus: "Thinking in steps",
    strand: week === 12 ? null : "CT",
    think: "Think about the sequence.",
    move: "Move in sequence.",
    code: "Order the picture cards.",
    build: "Use blocks if available.",
    create: "Create a sequence.",
    practicalActivity: "Complete the practical task.",
    weeklyCheck: "Show the sequence.",
    masteryTarget: "Can order the steps.",
    priorLearning: "Everyday routines.",
    futureBridge: "Builds on sequencing.",
    assessmentEvidence: "Teacher observation.",
    platform: "Picture cards.",
    coreParts: "Move + Code",
    stretch: "Add one step.",
    fallback: "Use paper cards.",
  };
}

async function writeFixture(records) {
  await mkdir(root, { recursive: true });
  await writeFile(file, `${JSON.stringify(records, null, 2)}\\n`, "utf8");
}

test("private curriculum loader enforces identity, entitlement and record integrity", async (t) => {
  const originalCwd = process.cwd();
  const temporaryCwd = await mkdtemp(path.join(os.tmpdir(), "rhinox-curriculum-test-"));
  const moduleUrl = new URL("../lib/code-studio-v2/private-curriculum.server.ts", import.meta.url).href;
  process.chdir(temporaryCwd);
  root = path.resolve(".private-data/code-studio-v2/catalogue");
  file = path.join(root, "nursery-1.json");
  const { getLicensedCurriculumActivity, curriculumId } = await import(moduleUrl);
  t.after(async () => {
    process.chdir(originalCwd);
    await rm(temporaryCwd, { recursive: true, force: true });
  });

  const records = Array.from({ length: 39 }, (_, index) => makeRecord(index + 1));
  await writeFixture(records);
  const selection = { level: "Nursery 1", term: 1, week: 1 };
  const validAccess = { learnerId: "learner-test-1", canReadLicensedCurriculum: true };

  assert.equal(curriculumId(selection), requestedId);
  assert.equal(await getLicensedCurriculumActivity(selection, validAccess).then((value) => value?.id), requestedId);
  assert.equal(await getLicensedCurriculumActivity(selection, { learnerId: null, canReadLicensedCurriculum: true }), null);
  assert.equal(await getLicensedCurriculumActivity(selection, { learnerId: "learner-test-1", canReadLicensedCurriculum: false }), null);
  assert.equal(await getLicensedCurriculumActivity(selection, { learnerId: "   ", canReadLicensedCurriculum: true }), null);
  assert.equal(await getLicensedCurriculumActivity({ level: "Year 12", term: 1, week: 1 }, validAccess), null);
  assert.equal(await getLicensedCurriculumActivity({ level: "Nursery 1", term: 4, week: 1 }, validAccess), null);

  await writeFixture(records.slice(0, 38));
  assert.equal(await getLicensedCurriculumActivity(selection, validAccess), null, "rejects incomplete level files");

  const duplicate = [...records, { ...records[0] }];
  await writeFixture(duplicate);
  assert.equal(await getLicensedCurriculumActivity(selection, validAccess), null, "rejects unexpected catalogue length");

  const invalidRecord = records.map((record) => record.id === requestedId ? { ...record, theme: "  " } : record);
  await writeFixture(invalidRecord);
  assert.equal(await getLicensedCurriculumActivity(selection, validAccess), null, "rejects malformed matching lesson");
});
