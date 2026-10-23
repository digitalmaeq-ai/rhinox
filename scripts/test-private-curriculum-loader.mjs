#!/usr/bin/env node
/**
 * Tests the pure access policy used by the private server loader.
 * Run with: node --experimental-strip-types scripts/test-private-curriculum-loader.mjs
 */
import assert from "node:assert/strict";
import { test } from "node:test";

function makeRecord(term, week) {
  return {
    id: `tmc-v3-15-nursery-1-t${term}-w${week}`,
    curriculumVersion: "3.15",
    level: "Nursery 1",
    term,
    week,
    weekType: "Themed learning",
    theme: `Theme ${term}-${week}`,
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

test("curriculum access policy rejects unauthorized and invalid records", async () => {
  const { authorizeCurriculumActivity, curriculumId } = await import("../lib/code-studio-v2/curriculum-access-core.ts");
  const records = Array.from({ length: 39 }, (_, index) => makeRecord(Math.floor(index / 13) + 1, (index % 13) + 1));
  const selection = { level: "Nursery 1", term: 1, week: 1 };
  const validAccess = { learnerId: "learner-test-1", canReadLicensedCurriculum: true };
  const requestedId = "tmc-v3-15-nursery-1-t1-w1";

  assert.equal(curriculumId(selection), requestedId);
  assert.equal(curriculumId(null), null, "malformed selection objects must fail closed");
  assert.equal(curriculumId({ level: null, term: 1, week: 1 }), null);
  assert.equal(authorizeCurriculumActivity(records, selection, validAccess)?.id, requestedId);
  assert.equal(authorizeCurriculumActivity(records, null, validAccess), null);
  assert.equal(authorizeCurriculumActivity(records, selection, null), null);
  assert.equal(authorizeCurriculumActivity(records, selection, { learnerId: null, canReadLicensedCurriculum: true }), null);
  assert.equal(authorizeCurriculumActivity(records, selection, { learnerId: "learner-test-1", canReadLicensedCurriculum: false }), null);
  assert.equal(authorizeCurriculumActivity(records, selection, { learnerId: "   ", canReadLicensedCurriculum: true }), null);
  assert.equal(authorizeCurriculumActivity(records, { level: "Year 12", term: 1, week: 1 }, validAccess), null);
  assert.equal(authorizeCurriculumActivity(records, { level: "Nursery 1", term: 4, week: 1 }, validAccess), null);
  assert.equal(authorizeCurriculumActivity(records.slice(0, 38), selection, validAccess), null, "rejects incomplete level files");

  const duplicate = records.map((record, index) => index === 1 ? { ...records[0] } : record);
  assert.equal(authorizeCurriculumActivity(duplicate, selection, validAccess), null, "rejects duplicate matching lesson IDs");

  const invalidRecord = records.map((record) => record.id === requestedId ? { ...record, theme: "  " } : record);
  assert.equal(authorizeCurriculumActivity(invalidRecord, selection, validAccess), null, "rejects malformed matching lesson");
});
