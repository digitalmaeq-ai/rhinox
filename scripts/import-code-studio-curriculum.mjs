#!/usr/bin/env node
/**
 * Import the v3.15 Master Matrix export into deterministic, level-based JSON.
 *
 * Usage:
 *   node scripts/import-code-studio-curriculum.mjs <master-index.csv> [output-dir]
 *
 * This intentionally fails closed. It does not infer missing curriculum fields,
 * silently repair duplicate week keys, or accept a partial export.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const EXPECTED_RECORDS = 507;
const LEVELS = [
  "Nursery 1", "Nursery 2",
  ...Array.from({ length: 11 }, (_, index) => `Year ${index + 1}`),
];
const REQUIRED_FIELDS = [
  "matrix_row", "level", "term", "week", "week_type", "theme", "strand",
  "prior_learning", "future_bridge", "assessment_evidence", "platform",
  "core_parts", "stretch", "fallback", "competency", "code",
  "practical_activity", "weekly_check",
];

function parseCsv(source) {
  const input = source.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("CSV is invalid: an opening quote was not closed.");
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }
  return rows;
}

function safeName(level) {
  return level.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fail(message) {
  console.error(`Curriculum import failed: ${message}`);
  process.exitCode = 1;
}

async function main() {
  const inputPath = process.argv[2];
  const outputPath = path.resolve(
    process.argv[3] ?? "lib/code-studio-v2/catalogue",
  );

  if (!inputPath) {
    fail("Provide the CSV export path as the first argument.");
    return;
  }

  const source = await readFile(path.resolve(inputPath), "utf8");
  const rows = parseCsv(source);
  if (rows.length < 2) throw new Error("CSV has no curriculum records.");

  const headers = rows[0].map((header) => header.trim());
  const missing = REQUIRED_FIELDS.filter((field) => !headers.includes(field));
  if (missing.length) {
    throw new Error(`CSV is missing required columns: ${missing.join(", ")}`);
  }

  const records = rows.slice(1).map((values, rowIndex) => {
    if (values.length !== headers.length) {
      throw new Error(
        `CSV record ${rowIndex + 2} has ${values.length} fields; expected ${headers.length}.`,
      );
    }
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    return Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, record[field].trim()]));
  });

  if (records.length !== EXPECTED_RECORDS) {
    throw new Error(`Expected ${EXPECTED_RECORDS} weekly records; received ${records.length}.`);
  }

  const seenWeeks = new Set();
  const seenRows = new Set();
  for (const [index, record] of records.entries()) {
    const context = `record ${index + 2} (${record.level}, T${record.term} W${record.week})`;
    if (!LEVELS.includes(record.level)) throw new Error(`${context}: unknown level.`);
    if (!/^[1-3]$/.test(record.term)) throw new Error(`${context}: term must be 1, 2 or 3.`);
    if (!/^(?:[1-9]|1[0-3])$/.test(record.week)) throw new Error(`${context}: week must be 1–13.`);
    if (!record.theme) throw new Error(`${context}: theme is empty.`);
    if (!record.matrix_row) throw new Error(`${context}: matrix_row is empty.`);

    const weekKey = `${record.level}|T${record.term}|W${record.week}`;
    if (seenWeeks.has(weekKey)) throw new Error(`${context}: duplicate week key ${weekKey}.`);
    seenWeeks.add(weekKey);
    if (seenRows.has(record.matrix_row)) throw new Error(`${context}: duplicate matrix_row ${record.matrix_row}.`);
    seenRows.add(record.matrix_row);
  }

  const expectedKeys = new Set(
    LEVELS.flatMap((level) =>
      [1, 2, 3].flatMap((term) =>
        Array.from({ length: 13 }, (_, index) => `${level}|T${term}|W${index + 1}`),
      ),
    ),
  );
  const missingWeeks = [...expectedKeys].filter((key) => !seenWeeks.has(key));
  if (missingWeeks.length) {
    throw new Error(`Missing expected weeks: ${missingWeeks.slice(0, 8).join(", ")}${missingWeeks.length > 8 ? ", …" : ""}`);
  }

  await mkdir(outputPath, { recursive: true });
  const grouped = new Map(LEVELS.map((level) => [level, []]));
  for (const record of records) grouped.get(record.level).push(record);

  for (const level of LEVELS) {
    const levelRecords = grouped.get(level);
    const filePath = path.join(outputPath, `${safeName(level)}.json`);
    await writeFile(filePath, `${JSON.stringify(levelRecords, null, 2)}\n`, "utf8");
  }

  const manifest = {
    curriculumVersion: "3.15",
    sourceFile: path.basename(path.resolve(inputPath)),
    sourceSha256: createHash("sha256").update(source).digest("hex"),
    expectedWeeklyRecords: EXPECTED_RECORDS,
    importedWeeklyRecords: records.length,
    levels: LEVELS.map((level) => ({
      level,
      recordCount: grouped.get(level).length,
      file: `${safeName(level)}.json`,
    })),
    importedAt: new Date().toISOString(),
    note: "Source index fields are preserved; this import does not certify the semantic alignment of existing exercises.",
  };
  await writeFile(path.join(outputPath, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Imported ${records.length} weekly records across ${LEVELS.length} levels into ${outputPath}`);
  console.log(`Source SHA-256: ${manifest.sourceSha256}`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
