#!/usr/bin/env node
/**
 * Import the authoritative v3.15 Master Matrix CSV into typed V2 catalogue JSON.
 *
 * Export the entire "Master Matrix" sheet from the v3.15 workbook as UTF-8 CSV,
 * then run:
 *   node scripts/import-code-studio-curriculum.mjs <master-matrix.csv> [output-dir]
 *
 * Also accepts the normalised master-index CSV schema used by the earlier
 * tooling. Partial exports fail closed; no missing curriculum rows are guessed.
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
const FIELD_ALIASES = {
  matrixRow: ["matrix_row", "Matrix row"],
  level: ["level", "Level"],
  term: ["term", "Term"],
  week: ["week", "Week"],
  weekType: ["week_type", "Week type"],
  theme: ["theme", "Theme (child-facing)"],
  focus: ["focus", "Focus (Teacher Guide)"],
  strand: ["strand", "Main strand"],
  think: ["think", "Think"],
  move: ["move", "Move"],
  code: ["code", "Code"],
  build: ["build", "Build"],
  create: ["create", "Create"],
  practicalActivity: ["practical_activity", "Practical activity"],
  weeklyCheck: ["weekly_check", "Check My Learning (weekly)"],
  masteryTarget: ["mastery_target", "Mastery target"],
  priorLearning: ["prior_learning", "Prior Learning"],
  futureBridge: ["future_bridge", "Future Bridge"],
  assessmentEvidence: ["assessment_evidence", "Assessment Evidence"],
  platform: ["platform", "Kit / platform"],
  coreParts: ["core_parts", "Core parts this week (must do)"],
  stretch: ["stretch", "Stretch (optional)"],
  fallback: ["fallback", "Fallback: no power / device / kit"],
  competency: ["competency", "Competency statement (from Competency Framework)"],
  keyVocabulary: ["key_vocabulary", "Key vocabulary"],
  termBigIdea: ["term_big_idea", "Term big idea"],
  cognitiveDemand: ["cognitive_demand", "Cognitive Demand"],
  independenceLevel: ["independence_level", "Independence Level"],
};
const REQUIRED_FIELDS = [
  "level", "term", "week", "weekType", "theme", "focus", "think", "move", "code", "build", "create",
  "practicalActivity", "weeklyCheck", "masteryTarget", "priorLearning",
  "futureBridge", "assessmentEvidence", "platform", "coreParts", "stretch",
  "fallback", "competency",
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

function safeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fail(message) {
  console.error(`Curriculum import failed: ${message}`);
  process.exitCode = 1;
}

function valueFrom(source, aliases) {
  for (const key of aliases) {
    if (Object.hasOwn(source, key)) return String(source[key] ?? "").trim();
  }
  return "";
}

async function main() {
  const inputPath = process.argv[2];
  const outputPath = path.resolve(process.argv[3] ?? ".private-data/code-studio-v2/catalogue");
  if (!inputPath) {
    fail("Provide the full Master Matrix CSV export path as the first argument.");
    return;
  }

  const source = await readFile(path.resolve(inputPath), "utf8");
  const rows = parseCsv(source);
  if (rows.length < 2) throw new Error("CSV has no curriculum records.");

  const headers = rows[0].map((header) => header.trim());
  const missingSchema = Object.entries(FIELD_ALIASES)
    .filter(([, aliases]) => !aliases.some((alias) => headers.includes(alias)))
    .filter(([field]) => REQUIRED_FIELDS.includes(field))
    .map(([field]) => field);
  if (missingSchema.length) {
    throw new Error(`CSV is missing required curriculum columns: ${missingSchema.join(", ")}`);
  }

  const records = rows.slice(1).map((values, rowIndex) => {
    if (values.length !== headers.length) {
      throw new Error(`CSV record ${rowIndex + 2} has ${values.length} fields; expected ${headers.length}.`);
    }
    const raw = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    const record = Object.fromEntries(
      Object.entries(FIELD_ALIASES).map(([field, aliases]) => [field, valueFrom(raw, aliases)]),
    );
    record.matrixRow = record.matrixRow || String(rowIndex + 2);
    record.term = Number(record.term);
    record.week = Number(record.week);
    record.strand = record.strand || null;
    return record;
  });

  if (records.length !== EXPECTED_RECORDS) {
    throw new Error(`Expected ${EXPECTED_RECORDS} weekly records; received ${records.length}. Export the complete Master Matrix sheet, not the partial helper index.`);
  }

  const seenWeeks = new Set();
  const seenRows = new Set();
  for (const [index, record] of records.entries()) {
    const context = `record ${index + 2} (${record.level}, T${record.term} W${record.week})`;
    if (!LEVELS.includes(record.level)) throw new Error(`${context}: unknown level.`);
    if (![1, 2, 3].includes(record.term)) throw new Error(`${context}: term must be 1, 2 or 3.`);
    if (!Number.isInteger(record.week) || record.week < 1 || record.week > 13) {
      throw new Error(`${context}: week must be an integer from 1 to 13.`);
    }
    if (record.strand !== null && !["CT", "RB", "ED", "AI"].includes(record.strand)) {
      throw new Error(`${context}: strand must be CT, RB, ED, AI, or blank for a non-themed week.`);
    }
    for (const field of REQUIRED_FIELDS) {
      const value = record[field];
      if (value === "" || value === null || value === undefined) {
        throw new Error(`${context}: required field '${field}' is empty.`);
      }
    }

    const weekKey = `${record.level}|T${record.term}|W${record.week}`;
    if (seenWeeks.has(weekKey)) throw new Error(`${context}: duplicate week key ${weekKey}.`);
    seenWeeks.add(weekKey);
    if (seenRows.has(record.matrixRow)) throw new Error(`${context}: duplicate matrix row ${record.matrixRow}.`);
    seenRows.add(record.matrixRow);
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

  const grouped = new Map(LEVELS.map((level) => [level, []]));
  const catalogue = records.map((record) => {
    const activity = {
      id: `tmc-v3-15-${safeName(record.level)}-t${record.term}-w${record.week}`,
      matrixRow: record.matrixRow,
      curriculumVersion: "3.15",
      level: record.level,
      term: record.term,
      week: record.week,
      weekType: record.weekType,
      theme: record.theme,
      focus: record.focus,
      strand: record.strand,
      think: record.think,
      move: record.move,
      code: record.code,
      build: record.build,
      create: record.create,
      practicalActivity: record.practicalActivity,
      weeklyCheck: record.weeklyCheck,
      masteryTarget: record.masteryTarget,
      priorLearning: record.priorLearning,
      futureBridge: record.futureBridge,
      assessmentEvidence: record.assessmentEvidence,
      platform: record.platform,
      coreParts: record.coreParts,
      stretch: record.stretch,
      fallback: record.fallback,
      competency: record.competency,
      keyVocabulary: record.keyVocabulary,
      termBigIdea: record.termBigIdea,
      cognitiveDemand: record.cognitiveDemand,
      independenceLevel: record.independenceLevel,
    };
    grouped.get(record.level).push(activity);
    return activity;
  });

  await mkdir(outputPath, { recursive: true });
  await writeFile(path.join(outputPath, "catalogue.json"), `${JSON.stringify(catalogue, null, 2)}\n`, "utf8");
  for (const level of LEVELS) {
    await writeFile(path.join(outputPath, `${safeName(level)}.json`), `${JSON.stringify(grouped.get(level), null, 2)}\n`, "utf8");
  }

  const manifest = {
    curriculumVersion: "3.15",
    sourceFile: path.basename(path.resolve(inputPath)),
    sourceSha256: createHash("sha256").update(source).digest("hex"),
    expectedWeeklyRecords: EXPECTED_RECORDS,
    importedWeeklyRecords: catalogue.length,
    levels: LEVELS.map((level) => ({
      level,
      recordCount: grouped.get(level).length,
      file: `${safeName(level)}.json`,
    })),
    importedAt: new Date().toISOString(),
    note: "This is a source-index import, not semantic certification of existing exercises.",
  };
  await writeFile(path.join(outputPath, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Imported ${catalogue.length} weekly records across ${LEVELS.length} levels into ${outputPath}`);
  console.log(`Source SHA-256: ${manifest.sourceSha256}`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
