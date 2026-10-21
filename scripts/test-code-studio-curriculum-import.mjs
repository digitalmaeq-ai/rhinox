#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const ROOT = process.cwd();
const importer = path.join(ROOT, "scripts/import-code-studio-curriculum.mjs");
const levels = [
  "Nursery 1", "Nursery 2",
  ...Array.from({ length: 11 }, (_, index) => `Year ${index + 1}`),
];
const headers = [
  "index", "matrix_row", "level", "term", "week", "week_type", "theme", "strand",
  "prior_learning", "future_bridge", "assessment_evidence", "platform",
  "core_parts", "stretch", "fallback", "competency", "code",
  "practical_activity", "weekly_check",
];
const requiredFields = headers.slice(1);

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function makeRecords() {
  const rows = [];
  let index = 0;
  for (const level of levels) {
    for (let term = 1; term <= 3; term += 1) {
      for (let week = 1; week <= 13; week += 1) {
        const record = {
          index: String(index),
          matrix_row: String(index + 2),
          level,
          term: String(term),
          week: String(week),
          week_type: "Themed learning",
          theme: index === 0 ? "Theme, with comma" : `Theme ${index}`,
          strand: "CT",
          prior_learning: index === 0 ? 'Quoted "idea"\nsecond line' : "Earlier lesson",
          future_bridge: "Next lesson",
          assessment_evidence: "Observation",
          platform: "Cards",
          core_parts: "Think + Code",
          stretch: "Try one more",
          fallback: "No device required",
          competency: "Sequences actions",
          code: "Put three cards in order",
          practical_activity: "Sort and explain",
          weekly_check: "Learner explains the order",
        };
        rows.push(headers.map((header) => csvCell(record[header])).join(","));
        index += 1;
      }
    }
  }
  return rows;
}

const temp = await mkdtemp(path.join(os.tmpdir(), "rhinox-curriculum-import-"));
try {
  const csvPath = path.join(temp, "master-index.csv");
  const outputPath = path.join(temp, "output");
  const csv = [headers.join(","), ...makeRecords()].join("\n") + "\n";
  await writeFile(csvPath, csv, "utf8");

  const good = spawnSync(process.execPath, [importer, csvPath, outputPath], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(good.status, 0, `Valid catalogue rejected:\n${good.stderr}`);
  assert.match(good.stdout, /Imported 507 weekly records across 13 levels/);

  const manifest = JSON.parse(await readFile(path.join(outputPath, "manifest.json"), "utf8"));
  assert.equal(manifest.importedWeeklyRecords, 507);
  assert.equal(manifest.levels.length, 13);
  assert.ok(manifest.levels.every((level) => level.recordCount === 39));

  const nursery = JSON.parse(await readFile(path.join(outputPath, "nursery-1.json"), "utf8"));
  assert.equal(nursery.length, 39);
  assert.equal(nursery[0].theme, "Theme, with comma");
  assert.equal(nursery[0].prior_learning, 'Quoted "idea"\nsecond line');

  const incompletePath = path.join(temp, "incomplete.csv");
  await writeFile(incompletePath, [headers.join(","), ...makeRecords().slice(0, 506)].join("\n"), "utf8");
  const bad = spawnSync(process.execPath, [importer, incompletePath, path.join(temp, "bad-output")], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.notEqual(bad.status, 0, "Incomplete catalogue must be rejected");
  assert.match(bad.stderr, /Expected 507 weekly records/);

  console.log("Curriculum importer checks passed: 507 records, 13 levels, CSV quoting/newlines, incomplete-input rejection.");
} finally {
  await rm(temp, { recursive: true, force: true });
}
