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
const normalisedHeaders = [
  "index", "matrix_row", "level", "term", "week", "week_type", "theme", "focus", "strand",
  "think", "move", "build", "create", "prior_learning", "future_bridge", "assessment_evidence", "platform",
  "core_parts", "stretch", "fallback", "competency", "code",
  "practical_activity", "weekly_check", "mastery_target",
];
const workbookHeaders = [
  "Level", "Term", "Week", "Week type", "Theme (child-facing)", "Focus (Teacher Guide)",
  "Main strand", "Think", "Move", "Code", "Build", "Create", "Practical activity",
  "Check My Learning (weekly)", "Mastery target", "Prior Learning", "Future Bridge",
  "Assessment Evidence", "Kit / platform", "Core parts this week (must do)",
  "Stretch (optional)", "Fallback: no power / device / kit",
  "Competency statement (from Competency Framework)",
];

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function makeRecord(level, term, week, index, workbookFormat = false, overrides = {}) {
  const record = {
    index: String(index),
    matrix_row: String(index + 2),
    level,
    term: String(term),
    week: String(week),
    week_type: "Themed learning",
    theme: index === 0 ? "Theme, with comma" : `Theme ${index}`,
    focus: "Focus",
    strand: week >= 10 ? "" : "CT",
    think: "Think",
    move: "Move",
    build: "Build",
    create: "Create",
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
    mastery_target: "Can sequence three steps",
  };
  Object.assign(record, overrides);
  if (!workbookFormat) return record;
  return {
    Level: record.level,
    Term: record.term,
    Week: record.week,
    "Week type": record.week_type,
    "Theme (child-facing)": record.theme,
    "Focus (Teacher Guide)": record.focus,
    "Main strand": record.strand,
    Think: record.think,
    Move: record.move,
    Code: record.code,
    Build: record.build,
    Create: record.create,
    "Practical activity": record.practical_activity,
    "Check My Learning (weekly)": record.weekly_check,
    "Mastery target": record.mastery_target,
    "Prior Learning": record.prior_learning,
    "Future Bridge": record.future_bridge,
    "Assessment Evidence": record.assessment_evidence,
    "Kit / platform": record.platform,
    "Core parts this week (must do)": record.core_parts,
    "Stretch (optional)": record.stretch,
    "Fallback: no power / device / kit": record.fallback,
    "Competency statement (from Competency Framework)": record.competency,
  };
}
function makeRows(headers, workbookFormat = false, count = 507, firstRecordOverrides = {}) {
  const rows = [];
  let index = 0;
  for (const level of levels) {
    for (let term = 1; term <= 3; term += 1) {
      for (let week = 1; week <= 13; week += 1) {
        if (index >= count) return rows;
        const record = makeRecord(level, term, week, index, workbookFormat, index === 0 ? firstRecordOverrides : {});
        rows.push(headers.map((header) => csvCell(record[header] ?? record[header.replaceAll(" ", "_")] ?? "")).join(","));
        index += 1;
      }
    }
  }
  return rows;
}
function runImport(csvPath, outputPath) {
  return spawnSync(process.execPath, [importer, csvPath, outputPath], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

const temp = await mkdtemp(path.join(os.tmpdir(), "rhinox-curriculum-import-"));
try {
  for (const [name, headers, workbookFormat] of [
    ["normalised", normalisedHeaders, false],
    ["workbook", workbookHeaders, true],
  ]) {
    const csvPath = path.join(temp, `${name}.csv`);
    const outputPath = path.join(temp, `${name}-output`);
    const csv = [headers.join(","), ...makeRows(headers, workbookFormat)].join("\n") + "\n";
    await writeFile(csvPath, csv, "utf8");

    const good = runImport(csvPath, outputPath);
    assert.equal(good.status, 0, `${name} schema rejected:\n${good.stderr}`);
    assert.match(good.stdout, /Imported 507 weekly records across 13 levels/);

    const manifest = JSON.parse(await readFile(path.join(outputPath, "manifest.json"), "utf8"));
    assert.equal(manifest.importedWeeklyRecords, 507);
    assert.equal(manifest.levels.length, 13);
    assert.ok(manifest.levels.every((level) => level.recordCount === 39));

    const nursery = JSON.parse(await readFile(path.join(outputPath, "nursery-1.json"), "utf8"));
    assert.equal(nursery.length, 39);
    assert.equal(nursery[0].theme, "Theme, with comma");
    assert.equal(nursery[0].priorLearning, 'Quoted "idea"\nsecond line');
    assert.equal(nursery[0].id, "tmc-v3-15-nursery-1-t1-w1");
    assert.equal(nursery[9].strand, null, "Revision weeks may legitimately have no primary strand.");
    const fullCatalogue = JSON.parse(await readFile(path.join(outputPath, "catalogue.json"), "utf8"));
    assert.equal(fullCatalogue.length, 507);
  }

  const optionalActivityPath = path.join(temp, "optional-activity-blanks.csv");
  await writeFile(optionalActivityPath, [normalisedHeaders.join(","), ...makeRows(normalisedHeaders, false, 507, { build: "", create: "" })].join("\n"), "utf8");
  const optionalActivity = runImport(optionalActivityPath, path.join(temp, "optional-activity-output"));
  assert.equal(optionalActivity.status, 0, "Blank non-core Build/Create fields should be accepted: " + optionalActivity.stderr);

  const missingCoreBuildPath = path.join(temp, "missing-core-build.csv");
  await writeFile(missingCoreBuildPath, [normalisedHeaders.join(","), ...makeRows(normalisedHeaders, false, 507, { core_parts: "Build + Create", build: "" })].join("\n"), "utf8");
  const missingCoreBuild = runImport(missingCoreBuildPath, path.join(temp, "missing-core-build-output"));
  assert.equal(missingCoreBuild.status, 0, "Source completeness issues should be recorded without discarding the full catalogue");
  const incompleteCoreCatalogue = JSON.parse(await readFile(path.join(temp, "missing-core-build-output", "catalogue.json"), "utf8"));
  const incompleteCoreManifest = JSON.parse(await readFile(path.join(temp, "missing-core-build-output", "manifest.json"), "utf8"));
  assert.match(incompleteCoreCatalogue[0].sourceValidationIssues[0], /Build is listed as a core part but the Build activity is empty/);
  assert.equal(incompleteCoreManifest.sourceValidationIssueCount, 1);
  assert.equal(incompleteCoreManifest.recordsWithSourceIssues[0].matrixRow, "2");
  const missingCoreCreatePath = path.join(temp, "missing-core-create.csv");
  await writeFile(missingCoreCreatePath, [normalisedHeaders.join(","), ...makeRows(normalisedHeaders, false, 507, { core_parts: "Build + Create", create: "" })].join("\n"), "utf8");
  const missingCoreCreate = runImport(missingCoreCreatePath, path.join(temp, "missing-core-create-output"));
  assert.equal(missingCoreCreate.status, 0, "A missing core Create activity should be flagged, not silently filled");
  const incompleteCreateCatalogue = JSON.parse(await readFile(path.join(temp, "missing-core-create-output", "catalogue.json"), "utf8"));
  assert.match(incompleteCreateCatalogue[0].sourceValidationIssues[0], /Create is listed as a core part but the Create activity is empty/);
  const incompletePath = path.join(temp, "incomplete.csv");
  await writeFile(incompletePath, [normalisedHeaders.join(","), ...makeRows(normalisedHeaders, false, 213)].join("\n"), "utf8");
  const bad = runImport(incompletePath, path.join(temp, "bad-output"));
  assert.notEqual(bad.status, 0, "Partial helper index must be rejected");
  assert.match(bad.stderr, /Expected 507 weekly records/);

  const missingInstructionPath = path.join(temp, "missing-instruction.csv");
  const validRows = makeRows(normalisedHeaders, false);
  const firstRecord = validRows[1].split(",");
  firstRecord[normalisedHeaders.indexOf("think")] = "";
  validRows[1] = firstRecord.join(",");
  await writeFile(missingInstructionPath, [normalisedHeaders.join(","), ...validRows].join("\n"), "utf8");
  const missingInstruction = runImport(missingInstructionPath, path.join(temp, "missing-instruction-output"));
  assert.notEqual(missingInstruction.status, 0, "Instructional fields required by the runtime must not be blank");
  assert.match(missingInstruction.stderr, /required field 'think' is empty/);

  const duplicateHeaderPath = path.join(temp, "duplicate-header.csv");
  await writeFile(duplicateHeaderPath, [normalisedHeaders.join(","), ...makeRows(normalisedHeaders, false)].join("\n"), "utf8");
  const duplicateHeaderCsv = await readFile(duplicateHeaderPath, "utf8");
  await writeFile(duplicateHeaderPath, duplicateHeaderCsv.replace("theme,focus", "theme,theme"), "utf8");
  const duplicateHeader = runImport(duplicateHeaderPath, path.join(temp, "duplicate-header-output"));
  assert.notEqual(duplicateHeader.status, 0, "Duplicate CSV headers must not silently overwrite data");
  assert.match(duplicateHeader.stderr, /duplicate column headers/);

  console.log("Curriculum importer checks passed: both schemas, 507 records, 13 levels, stable IDs, CSV quoting/newlines, partial-export rejection, and required instructional fields, optional non-core activity blanks, and source completeness issue reporting.");
} finally {
  await rm(temp, { recursive: true, force: true });
}
