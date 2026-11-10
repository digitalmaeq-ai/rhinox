/**
 * Tests for the TMC curriculum reference importer.
 * Uses ONLY synthetic data. The real workbook and its content are never read or committed.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LEVELS,
  MASTER_MATRIX_HEADERS,
  assertSafeOutput,
  buildReferenceCatalogue,
  curriculumReferenceId,
  parseCsv,
  sha256,
} from "./lib/tmc-curriculum-reference.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(here, "import-tmc-curriculum-reference.mjs");
let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`FAIL - ${name}\n${error.stack}`);
    process.exitCode = 1;
  }
};

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const toCsv = (headers, rows) =>
  [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n";

/** One synthetic row. Overrides are keyed by header name. */
function syntheticRow(level, term, week, overrides = {}) {
  const row = {};
  for (const header of MASTER_MATRIX_HEADERS) row[header] = `Synthetic ${header}`;
  Object.assign(row, {
    Level: level,
    Term: term,
    Week: week,
    "Main strand": "CT",
    "Key vocabulary": "alpha, beta; gamma",
    "Core parts this week (must do)": "Think + Move",
    Build: "",
    Create: "",
  });
  Object.assign(row, overrides);
  return MASTER_MATRIX_HEADERS.map((header) => row[header]);
}

function allRows(mutate) {
  const rows = [];
  for (const level of LEVELS) {
    for (let term = 1; term <= 3; term += 1) {
      for (let week = 1; week <= 13; week += 1) rows.push({ level, term, week });
    }
  }
  return mutate ? mutate(rows) : rows;
}
const buildCsv = (specs, headers = MASTER_MATRIX_HEADERS) =>
  toCsv(headers, specs.map((s) => syntheticRow(s.level, s.term, s.week, s.overrides)));
const run = (csvText, extra = {}) =>
  buildReferenceCatalogue({ csvText, importedAt: "2026-01-01T00:00:00.000Z", csvFilename: "fixture.csv", ...extra });

const FULL = buildCsv(allRows());

test("header contract has exactly 43 unique columns", () => {
  assert.equal(MASTER_MATRIX_HEADERS.length, 43);
  assert.equal(new Set(MASTER_MATRIX_HEADERS).size, 43);
});

test("full synthetic import: 507 records, 13 levels, 39 per level, passes", () => {
  const { records, manifest } = run(FULL);
  assert.equal(manifest.validation.errors.length, 0, manifest.validation.errors.join("\n"));
  assert.equal(manifest.validation.passed, true);
  assert.equal(records.length, 507);
  assert.equal(manifest.counts.levels, 13);
  for (const level of LEVELS) assert.equal(manifest.counts.recordsPerLevel[level], 39);
  assert.equal(new Set(records.map((r) => `${r.level}|${r.term}|${r.week}`)).size, 507);
});

test("three terms and thirteen weeks per term for every level", () => {
  const { records } = run(FULL);
  for (const level of LEVELS) {
    const own = records.filter((r) => r.level === level);
    assert.deepEqual([...new Set(own.map((r) => r.term))].sort(), [1, 2, 3]);
    for (let term = 1; term <= 3; term += 1) {
      assert.equal(own.filter((r) => r.term === term).length, 13);
    }
  }
});

test("stable v3.16 ids use tmc-v3-16-{level-slug}-t{term}-w{week}", () => {
  const { records } = run(FULL);
  assert.equal(records[0].id, "tmc-v3-16-nursery-1-t1-w1");
  assert.equal(curriculumReferenceId("3.16", "Year 10", 3, 13), "tmc-v3-16-year-10-t3-w13");
  assert.equal(new Set(records.map((r) => r.id)).size, 507);
  for (const record of records) {
    assert.equal(record.curriculumVersion, "3.16");
    assert.equal(record.role, "reference-only");
  }
});

test("all 43 source fields preserved losslessly in rawSourceFields", () => {
  const { records } = run(FULL);
  const record = records[0];
  assert.deepEqual(Object.keys(record.rawSourceFields), MASTER_MATRIX_HEADERS);
  assert.equal(record.rawSourceFields["Theme (child-facing)"], "Synthetic Theme (child-facing)");
  assert.equal(record.rawSourceFields["Fallback: no power / device / kit"], "Synthetic Fallback: no power / device / kit");
});

test("blank optional fields stay null and are not rejected", () => {
  const rows = allRows();
  const csv = buildCsv(rows.map((s, i) => (i === 0 ? { ...s, overrides: { "Main strand": "", Build: "", Create: "", "Alignment Summary": "" } } : s)));
  const { records, manifest } = run(csv);
  assert.equal(manifest.validation.passed, true);
  const first = records[0];
  assert.equal(first.rawSourceFields["Main strand"], null);
  assert.equal(first.mainStrand, null);
  assert.equal(first.rawSourceFields["Build"], null);
  assert.equal(first.rawSourceFields["Create"], null);
  assert.equal(first.rawSourceFields["Alignment Summary"], null);
  assert.equal(first.sourceValidationIssues.length, 0);
});

test("core Build/Create missing is reported as a source issue, never invented", () => {
  const csv = buildCsv(allRows().map((s, i) => (i === 5 ? { ...s, overrides: { "Core parts this week (must do)": "Think + Build + Create", Build: "", Create: "" } } : s)));
  const { records, manifest, sourceIssues } = run(csv);
  assert.equal(manifest.validation.passed, true, "source issues must not fail the import");
  const record = records[5];
  assert.equal(record.rawSourceFields.Build, null);
  assert.equal(record.learningCycle.build, undefined);
  assert.equal(record.learningCycle.create, undefined);
  assert.equal(sourceIssues.length, 2);
  assert.match(record.sourceValidationIssues.join(" "), /Build is listed as a core part/);
  assert.match(record.sourceValidationIssues.join(" "), /Create is listed as a core part/);
  assert.equal(manifest.validation.unresolvedSourceIssues.length, 2);
});

test("Build present when core: no issue", () => {
  const csv = buildCsv(allRows().map((s, i) => (i === 0 ? { ...s, overrides: { "Core parts this week (must do)": "Think + Build", Build: "Synthetic build" } } : s)));
  const { sourceIssues } = run(csv);
  assert.equal(sourceIssues.length, 0);
});

test("duplicate level/term/week is an error", () => {
  const rows = allRows();
  rows[10] = { ...rows[9] };
  const { manifest } = run(buildCsv(rows));
  assert.equal(manifest.validation.passed, false);
  assert.ok(manifest.validation.errors.some((e) => /Duplicate record for Nursery 1 Term 1 Week 10/.test(e)));
});

test("missing week is an error", () => {
  const rows = allRows();
  rows.splice(20, 1);
  const { manifest } = run(buildCsv(rows));
  assert.equal(manifest.validation.passed, false);
  assert.ok(manifest.validation.errors.some((e) => /Expected exactly 507 records but found 506/.test(e)));
  assert.ok(manifest.validation.errors.some((e) => /Missing week: Nursery 1 Term 2 Week 8/.test(e)));
});

test("invalid level and invalid term/week are errors", () => {
  const rows = allRows();
  const csv = buildCsv(rows.map((s, i) => (i === 0 ? { ...s, level: "Nursery 9" } : i === 1 ? { ...s, term: 4 } : i === 2 ? { ...s, week: 14 } : s)));
  const { manifest } = run(csv);
  assert.equal(manifest.validation.passed, false);
  const text = manifest.validation.errors.join("\n");
  assert.match(text, /invalid level "Nursery 9"/);
  assert.match(text, /invalid term "4"/);
  assert.match(text, /invalid week "14"/);
});

test("wrong, missing, extra and duplicate headers fail closed", () => {
  const renamed = MASTER_MATRIX_HEADERS.map((h, i) => (i === 3 ? "Week kind" : h));
  assert.equal(run(buildCsv(allRows(), renamed)).manifest.validation.passed, false);
  const fewer = MASTER_MATRIX_HEADERS.slice(0, 42);
  const result = run(toCsv(fewer, [fewer.map(() => "x")]));
  assert.equal(result.manifest.validation.passed, false);
  assert.match(result.manifest.validation.errors.join("\n"), /Expected 43 columns but found 42/);
  const dup = [...MASTER_MATRIX_HEADERS.slice(0, 42), "Level"];
  assert.match(run(toCsv(dup, [dup.map(() => "x")])).manifest.validation.errors.join("\n"), /Duplicate column header: "Level"/);
  assert.equal(run("").manifest.validation.passed, false);
});

test("CSV quoting: commas, doubled quotes, CRLF and multiline cells", () => {
  const tricky = 'Line one, with comma\nLine "two" has quotes\r\nLine three';
  const rows = parseCsv(toCsv(["a", "b"], [[tricky, "x"], ["y", ""]]));
  assert.equal(rows.length, 3);
  assert.equal(rows[1].cells[0], tricky.replace(/\r\n/g, "\r\n"));
  assert.equal(rows[2].cells[1], "");
  const csv = buildCsv(allRows().map((s, i) => (i === 0 ? { ...s, overrides: { Think: tricky } } : s)));
  const { records, manifest } = run(csv);
  assert.equal(manifest.validation.passed, true);
  assert.equal(records[0].rawSourceFields.Think, tricky);
  assert.throws(() => parseCsv('a,"unterminated'), /opening quote was not closed/);
});

test("CRLF line endings and a UTF-8 BOM import identically", () => {
  const base = run(FULL).records.length;
  const crlf = "﻿" + FULL.replace(/\n/g, "\r\n");
  const result = run(crlf);
  assert.equal(result.manifest.validation.passed, true);
  assert.equal(result.records.length, base);
});

test("source row numbers and provenance are preserved (header is row 1)", () => {
  const { records } = run(FULL);
  assert.equal(records[0].provenance[0].rowNumber, 2);
  assert.equal(records[506].provenance[0].rowNumber, 508);
  assert.equal(records[0].provenance[0].sheetName, "Master Matrix");
  assert.equal(records[0].provenance[0].sourceKind, "master-curriculum");
  const withBlankLine = FULL.replace("\n", "\n\n");
  assert.equal(run(withBlankLine).records[0].provenance[0].rowNumber, 3, "a blank line still counts as a row");
});

test("manifest records version, filenames, SHA-256, import date and counts", () => {
  const { manifest } = run(FULL, { workbookFilename: "wb.xlsx", workbookSha256: "a".repeat(64) });
  assert.equal(manifest.curriculumVersion, "3.16");
  assert.equal(manifest.sourceWorkbook.filename, "wb.xlsx");
  assert.equal(manifest.sourceWorkbook.sha256, "a".repeat(64));
  assert.equal(manifest.sourceCsv.filename, "fixture.csv");
  assert.equal(manifest.sourceCsv.sha256, sha256(FULL));
  assert.equal(manifest.sourceCsv.columns, 43);
  assert.equal(manifest.importedAt, "2026-01-01T00:00:00.000Z");
  assert.equal(manifest.counts.records, 507);
  assert.equal(run(FULL, { workbookSha256: "b".repeat(64) }).records[0].provenance[0].sourceFileSha256, "b".repeat(64));
});

test("missing workbook hash is a warning, not an invented hash", () => {
  const { manifest } = run(FULL);
  assert.equal(manifest.sourceWorkbook.sha256, null);
  assert.ok(manifest.validation.warnings.some((w) => /no workbook SHA-256/.test(w)));
});

test("output is deterministic for identical input", () => {
  assert.equal(JSON.stringify(run(FULL)), JSON.stringify(run(FULL)));
});

test("no instructional content is generated: only source values appear", () => {
  const { records } = run(FULL);
  const record = records[0];
  assert.deepEqual(Object.keys(record.learningCycle).sort(), ["code", "move", "think"]);
  assert.deepEqual(record.keyVocabulary, ["alpha", "beta", "gamma"]);
  assert.deepEqual(record.implementation.coreParts, ["think", "move"]);
});

test("output path guard allows .private-data and outside-repo, refuses public paths", () => {
  const root = "/repo";
  assert.ok(assertSafeOutput("/repo/.private-data/tmc/x", root));
  assert.ok(assertSafeOutput("/tmp/anywhere", root));
  assert.throws(() => assertSafeOutput("/repo/public/data", root), /Refusing to write/);
  assert.throws(() => assertSafeOutput("/repo/lib", root), /Refusing to write/);
  assert.throws(() => assertSafeOutput("/repo", root), /Refusing to write/);
  assert.throws(() => assertSafeOutput("/repo/.private-data-evil/x", root), /Refusing to write/);
});

test("CLI writes catalogue, one file per level, manifest and issues; fails closed on bad input", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "tmc-ref-"));
  const csvPath = path.join(dir, "matrix.csv");
  const workbook = path.join(dir, "wb.xlsx");
  writeFileSync(csvPath, FULL);
  writeFileSync(workbook, "synthetic workbook bytes");
  const out = path.join(dir, "out");
  execFileSync("node", [cli, csvPath, "--workbook", workbook, "--out", out], { encoding: "utf8" });
  assert.ok(existsSync(path.join(out, "catalogue.json")));
  assert.equal(readdirSync(path.join(out, "levels")).length, 13);
  const manifest = JSON.parse(readFileSync(path.join(out, "manifest.json"), "utf8"));
  assert.equal(manifest.sourceWorkbook.sha256, sha256("synthetic workbook bytes"));
  assert.equal(manifest.sourceWorkbook.filename, "wb.xlsx");
  assert.equal(JSON.parse(readFileSync(path.join(out, "catalogue.json"), "utf8")).length, 507);
  assert.equal(JSON.parse(readFileSync(path.join(out, "levels", "year-11.json"), "utf8")).length, 39);

  const badCsv = path.join(dir, "bad.csv");
  writeFileSync(badCsv, buildCsv(allRows().slice(1)));
  const badOut = path.join(dir, "bad-out");
  const result = spawnSync("node", [cli, badCsv, "--out", badOut], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.ok(!existsSync(badOut), "nothing is written when validation fails");

  const refused = spawnSync("node", [cli, csvPath, "--out", path.join(here, "..", "public", "x")], { encoding: "utf8" });
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /Refusing to write/);

  const dry = spawnSync("node", [cli, csvPath, "--out", path.join(dir, "dry"), "--dry-run"], { encoding: "utf8" });
  assert.equal(dry.status, 0);
  assert.ok(!existsSync(path.join(dir, "dry")));
});

console.log(`\n${passed} importer tests passed.`);
