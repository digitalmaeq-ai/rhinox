/**
 * TMC curriculum REFERENCE importer (pure functions, no file or network access).
 *
 * The Master Curriculum guides book development. Records produced here are reference-only:
 * they support development provenance and editorial checks. They are NEVER runtime lesson
 * content. See docs/product/tmc-v3-16-content-registry.md.
 *
 * Rules enforced here:
 *  - the 43 Master Matrix headers are an exact contract; any difference fails closed;
 *  - every original column and value is preserved in rawSourceFields (blank -> null);
 *  - source problems are reported, never silently corrected or invented;
 *  - no instructional content is generated.
 */
import { createHash } from "node:crypto";
import path from "node:path";

export const MASTER_MATRIX_HEADERS = [
  "Level",
  "Term",
  "Week",
  "Week type",
  "Theme (child-facing)",
  "Focus (Teacher Guide)",
  "Term big idea",
  "Main strand",
  "Think",
  "Move",
  "Code",
  "Build",
  "Create",
  "Key vocabulary",
  "Practical activity",
  "Check My Learning (weekly)",
  "Mastery target",
  "Alignment Summary",
  "Visual requirements",
  "QR / Learning Hub link",
  "Status",
  "Notes",
  "Prior Learning",
  "Future Bridge",
  "Assessment Evidence",
  "Curriculum link: NERDC (evidence)",
  "Curriculum link: Lagos State (evidence)",
  "Curriculum link: Federal (reference)",
  "Curriculum link: international (evidence)",
  "Teaching method",
  "Robot / Maker Lab activity (practical challenge)",
  "Kit / platform",
  "Cognitive Demand",
  "Independence Level",
  "Current Concept (ladder position)",
  "Competency statement (from Competency Framework)",
  "Teacher video(s) required",
  "Video type",
  "Video status",
  "Chapter gate (auto)",
  "Core parts this week (must do)",
  "Stretch (optional)",
  "Fallback: no power / device / kit",
];

export const LEVELS = [
  "Nursery 1",
  "Nursery 2",
  ...Array.from({ length: 11 }, (_, index) => `Year ${index + 1}`),
];

export const DEFAULT_EXPECTATIONS = {
  records: 507,
  levels: 13,
  recordsPerLevel: 39,
  terms: 3,
  weeksPerTerm: 13,
};

export const SCHEMA_VERSION = "1.0.0";
const STRANDS = new Set(["CT", "RB", "ED", "AI"]);
const STAGES = ["think", "move", "code", "build", "create"];

export const levelSlug = (level) =>
  String(level).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const curriculumReferenceId = (version, level, term, week) =>
  `tmc-v${String(version).replace(/\./g, "-")}-${levelSlug(level)}-t${term}-w${week}`;

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

/**
 * RFC 4180 style CSV parser (quoted fields, doubled quotes, embedded commas and newlines).
 * Returns every record including fully blank ones so source row numbers stay exact:
 * [{ line: <1-based record number in the file>, cells: string[] }]
 */
export function parseCsv(source) {
  const input = String(source).replace(/^﻿/, "");
  const records = [];
  let cells = [];
  let field = "";
  let quoted = false;
  let recordNumber = 1;
  let touched = false;

  const endRecord = () => {
    cells.push(field);
    records.push({ line: recordNumber, cells });
    recordNumber += 1;
    cells = [];
    field = "";
    touched = false;
  };

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
      touched = true;
    } else if (char === ",") {
      cells.push(field);
      field = "";
      touched = true;
    } else if (char === "\r" && input[index + 1] === "\n") {
      // swallowed: the "\n" closes the record
    } else if (char === "\n" || char === "\r") {
      endRecord();
    } else {
      field += char;
      touched = true;
    }
  }
  if (quoted) throw new Error("CSV is invalid: an opening quote was not closed.");
  if (touched || field.length > 0 || cells.length > 0) endRecord();
  return records;
}

const blankToNull = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed === "" ? null : trimmed;
};

const splitList = (value) =>
  value === null ? [] : value.split(/[;,]/).map((part) => part.trim()).filter(Boolean);

/**
 * "Core parts this week (must do)" is free text, e.g. "Code + Build (Code is the must-finish part)"
 * or "Station check (Move + Code + Build)". The original text is always kept in rawSourceFields.
 * Here we only detect which of the five stage words appear, so the Build/Create check can run.
 */
function parseCoreParts(value) {
  if (value === null) return { stages: [] };
  return { stages: STAGES.filter((stage) => new RegExp(`\\b${stage}\\b`, "i").test(value)) };
}

/**
 * Build the reference catalogue from the Master Matrix CSV text.
 *
 * @param {object} input
 * @param {string} input.csvText
 * @param {string} [input.version]            curriculum version, default "3.16"
 * @param {string} [input.csvFilename]
 * @param {string|null} [input.workbookFilename]
 * @param {string|null} [input.workbookSha256]
 * @param {string} [input.importedAt]         ISO timestamp (injectable for tests)
 * @param {object} [input.expectations]       override DEFAULT_EXPECTATIONS
 */
export function buildReferenceCatalogue(input) {
  const version = input.version ?? "3.16";
  const expect = { ...DEFAULT_EXPECTATIONS, ...(input.expectations ?? {}) };
  const errors = [];
  const warnings = [];
  const sourceIssues = [];
  const csvSha = sha256(input.csvText);

  if (!/^\d+\.\d+$/.test(version)) errors.push(`Invalid curriculum version "${version}".`);

  let parsed = [];
  try {
    parsed = parseCsv(input.csvText);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const headerRecord = parsed[0];
  const headers = headerRecord ? headerRecord.cells.map((cell) => cell.trim()) : [];
  if (!headerRecord) errors.push("CSV is empty.");

  // Header contract: exact set of 43, no duplicates, no extras.
  const seen = new Set();
  for (const header of headers) {
    if (seen.has(header)) errors.push(`Duplicate column header: "${header}".`);
    seen.add(header);
  }
  const missing = MASTER_MATRIX_HEADERS.filter((header) => !seen.has(header));
  const extra = headers.filter((header) => !MASTER_MATRIX_HEADERS.includes(header));
  if (headerRecord && headers.length !== MASTER_MATRIX_HEADERS.length) {
    errors.push(`Expected ${MASTER_MATRIX_HEADERS.length} columns but found ${headers.length}.`);
  }
  for (const header of missing) errors.push(`Missing expected column: "${header}".`);
  for (const header of extra) errors.push(`Unexpected column: "${header}".`);

  const records = [];
  const headerOk = headerRecord && missing.length === 0 && extra.length === 0 && seen.size === headers.length;

  if (headerOk) {
    const columnIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
    for (const record of parsed.slice(1)) {
      if (record.cells.every((cell) => cell.trim() === "")) continue; // blank line, not a record

      const rowNumber = record.line; // 1 = header row, so first data row is 2
      const recordIssues = [];
      if (record.cells.length !== headers.length) {
        errors.push(`Row ${rowNumber}: has ${record.cells.length} cells, expected ${headers.length}.`);
        continue;
      }
      const raw = {};
      for (const header of MASTER_MATRIX_HEADERS) raw[header] = blankToNull(record.cells[columnIndex[header]]);

      const level = raw["Level"];
      const termText = raw["Term"];
      const weekText = raw["Week"];
      const term = termText !== null && /^\d+$/.test(termText) ? Number(termText) : NaN;
      const week = weekText !== null && /^\d+$/.test(weekText) ? Number(weekText) : NaN;

      let valid = true;
      if (level === null || !LEVELS.includes(level)) {
        errors.push(`Row ${rowNumber}: invalid level "${level ?? ""}".`);
        valid = false;
      }
      if (!(term >= 1 && term <= expect.terms)) {
        errors.push(`Row ${rowNumber}: invalid term "${termText ?? ""}".`);
        valid = false;
      }
      if (!(week >= 1 && week <= expect.weeksPerTerm)) {
        errors.push(`Row ${rowNumber}: invalid week "${weekText ?? ""}".`);
        valid = false;
      }
      if (!valid) continue;

      const strand = raw["Main strand"];
      if (strand !== null && !STRANDS.has(strand)) {
        recordIssues.push(`Main strand "${strand}" is not one of CT, RB, ED, AI.`);
      }

      const core = parseCoreParts(raw["Core parts this week (must do)"]);
      // A required core activity that is blank is a source issue. Never invented.
      for (const stage of ["build", "create"]) {
        const column = stage === "build" ? "Build" : "Create";
        if (core.stages.includes(stage) && raw[column] === null) {
          recordIssues.push(`${column} is listed as a core part but the ${column} column is blank.`);
        }
      }

      const id = curriculumReferenceId(version, level, term, week);
      const learningCycle = {};
      for (const stage of STAGES) {
        const text = raw[stage[0].toUpperCase() + stage.slice(1)];
        if (text !== null) learningCycle[stage] = text;
      }

      const sourceIssuesForRecord = [...recordIssues];
      for (const message of sourceIssuesForRecord) sourceIssues.push({ id, rowNumber, message });

      records.push({
        id,
        curriculumVersion: version,
        role: "reference-only",
        level,
        term,
        week,
        weekType: raw["Week type"],
        theme: raw["Theme (child-facing)"],
        focus: raw["Focus (Teacher Guide)"],
        termBigIdea: raw["Term big idea"],
        mainStrand: strand,
        currentConcept: raw["Current Concept (ladder position)"],
        alignmentSummary: raw["Alignment Summary"],
        visualRequirements: raw["Visual requirements"],
        qrLearningHubLink: raw["QR / Learning Hub link"],
        teacherVideosRequired: raw["Teacher video(s) required"],
        videoType: raw["Video type"],
        videoStatus: raw["Video status"],
        chapterGateAuto: raw["Chapter gate (auto)"],
        cognitiveDemand: raw["Cognitive Demand"],
        independenceLevel: raw["Independence Level"],
        learningCycle,
        practicalActivity: raw["Practical activity"],
        weeklyCheck: raw["Check My Learning (weekly)"],
        masteryTarget: raw["Mastery target"],
        priorLearning: raw["Prior Learning"],
        futureBridge: raw["Future Bridge"],
        competency: raw["Competency statement (from Competency Framework)"],
        keyVocabulary: splitList(raw["Key vocabulary"]),
        assessmentEvidence: raw["Assessment Evidence"],
        alignment: {
          summary: raw["Alignment Summary"],
          nerdc: raw["Curriculum link: NERDC (evidence)"],
          lagosState: raw["Curriculum link: Lagos State (evidence)"],
          federal: raw["Curriculum link: Federal (reference)"],
          international: raw["Curriculum link: international (evidence)"],
          teachingMethod: raw["Teaching method"],
        },
        implementation: {
          platform: raw["Kit / platform"],
          coreParts: core.stages,
          stretch: raw["Stretch (optional)"],
          fallback: raw["Fallback: no power / device / kit"],
        },
        robotMakerLabChallenge: raw["Robot / Maker Lab activity (practical challenge)"],
        sourceStatus: raw["Status"],
        sourceNotes: raw["Notes"],
        rawSourceFields: raw,
        sourceValidationIssues: sourceIssuesForRecord,
        provenance: [
          {
            sourceId: `tmc-master-curriculum-v${version}`,
            sourceTitle: "Think, Move, Code! Master Curriculum",
            sourceVersion: version,
            sourceKind: "master-curriculum",
            sheetName: "Master Matrix",
            rowNumber,
            sourceFileSha256: input.workbookSha256 ?? undefined,
            extractionMethod: "spreadsheet-import",
          },
        ],
      });
    }

    // Structural validation over the whole set.
    const keyCount = new Map();
    for (const record of records) {
      const key = `${record.level}|${record.term}|${record.week}`;
      keyCount.set(key, (keyCount.get(key) ?? 0) + 1);
    }
    for (const [key, count] of keyCount) {
      if (count > 1) {
        const [level, term, week] = key.split("|");
        errors.push(`Duplicate record for ${level} Term ${term} Week ${week} (${count} rows).`);
      }
    }
    const byLevel = new Map();
    for (const record of records) byLevel.set(record.level, (byLevel.get(record.level) ?? 0) + 1);

    if (records.length !== expect.records) {
      errors.push(`Expected exactly ${expect.records} records but found ${records.length}.`);
    }
    if (byLevel.size !== expect.levels) {
      errors.push(`Expected exactly ${expect.levels} levels but found ${byLevel.size}.`);
    }
    for (const level of LEVELS) {
      const count = byLevel.get(level) ?? 0;
      if (count !== expect.recordsPerLevel) {
        errors.push(`${level}: expected ${expect.recordsPerLevel} records but found ${count}.`);
      }
      for (let term = 1; term <= expect.terms; term += 1) {
        for (let week = 1; week <= expect.weeksPerTerm; week += 1) {
          if (!keyCount.has(`${level}|${term}|${week}`)) {
            errors.push(`Missing week: ${level} Term ${term} Week ${week}.`);
          }
        }
      }
    }
  }

  if (!input.workbookSha256) {
    warnings.push("Workbook file was not supplied, so no workbook SHA-256 is recorded. Only the CSV export is hashed.");
  }

  const recordsPerLevel = {};
  for (const record of records) recordsPerLevel[record.level] = (recordsPerLevel[record.level] ?? 0) + 1;

  const manifest = {
    registryId: "rhinox-tmc-curriculum-reference",
    schemaVersion: SCHEMA_VERSION,
    curriculumVersion: version,
    sourceWorkbook: {
      filename: input.workbookFilename ?? null,
      sha256: input.workbookSha256 ?? null,
      masterMatrixRows: records.length,
      expectedLevels: expect.levels,
      expectedTermsPerLevel: expect.terms,
      expectedWeeksPerTerm: expect.weeksPerTerm,
    },
    sourceCsv: { filename: input.csvFilename ?? null, sha256: csvSha, columns: headers.length },
    importedAt: input.importedAt ?? new Date().toISOString(),
    counts: { records: records.length, levels: Object.keys(recordsPerLevel).length, recordsPerLevel },
    validation: {
      passed: errors.length === 0,
      errors,
      warnings,
      unresolvedSourceIssues: sourceIssues.map((issue) => `${issue.id} (row ${issue.rowNumber}): ${issue.message}`),
    },
  };

  return { records, manifest, sourceIssues };
}

/** Output may be outside the repo (e.g. a temp folder) or under .private-data/. Nothing else. */
export function assertSafeOutput(outputDir, repoRoot = process.cwd()) {
  const resolvedOut = path.resolve(outputDir);
  const root = path.resolve(repoRoot);
  const insideRepo = resolvedOut === root || resolvedOut.startsWith(root + path.sep);
  if (!insideRepo) return resolvedOut;
  const privateRoot = path.join(root, ".private-data") + path.sep;
  if (!(resolvedOut + path.sep).startsWith(privateRoot)) {
    throw new Error(
      `Refusing to write the curriculum catalogue to ${resolvedOut}. ` +
        "Inside the repository it may only go under .private-data/ (gitignored).",
    );
  }
  return resolvedOut;
}
