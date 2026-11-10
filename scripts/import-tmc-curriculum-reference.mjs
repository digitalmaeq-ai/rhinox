#!/usr/bin/env node
/**
 * Import the TMC Master Curriculum "Master Matrix" CSV as a REFERENCE catalogue.
 *
 * The curriculum guides book development. This output is for provenance and editorial checks.
 * It is not lesson content and must never be served to learners as lessons.
 *
 * Export the whole "Master Matrix" sheet from the workbook as UTF-8 CSV, then run:
 *
 *   node scripts/import-tmc-curriculum-reference.mjs <master-matrix.csv> \
 *     [--workbook <Think-Move-Code-Master-Curriculum-v3.16_4.xlsx>] \
 *     [--out <dir>] [--version 3.16] [--dry-run]
 *
 * Output (default .private-data/tmc-curriculum-reference/v<version>/):
 *   catalogue.json        every record
 *   levels/<level>.json   one file per level
 *   manifest.json         version, filenames, SHA-256 hashes, import date, counts, validation
 *   source-issues.json    source problems found, reported and never corrected
 *
 * Fails closed: if structural validation fails nothing is written and the exit code is 1.
 * Output inside this repository is only allowed under .private-data/ (gitignored).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { assertSafeOutput, buildReferenceCatalogue, levelSlug, sha256 } from "./lib/tmc-curriculum-reference.mjs";

function parseArgs(argv) {
  const args = { positional: [], flags: {} };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--dry-run") args.flags.dryRun = true;
    else if (["--workbook", "--out", "--version"].includes(value)) {
      args.flags[value.slice(2)] = argv[index + 1];
      index += 1;
    } else if (value.startsWith("--")) throw new Error(`Unknown option ${value}`);
    else args.positional.push(value);
  }
  return args;
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const csvPath = positional[0];
  if (!csvPath) {
    console.error("Provide the full Master Matrix CSV export path as the first argument.");
    process.exitCode = 1;
    return;
  }
  const version = flags.version ?? "3.16";
  const outputDir = assertSafeOutput(flags.out ?? `.private-data/tmc-curriculum-reference/v${version}`);

  const csvText = await readFile(path.resolve(csvPath), "utf8");
  let workbookSha256 = null;
  let workbookFilename = null;
  if (flags.workbook) {
    workbookSha256 = sha256(await readFile(path.resolve(flags.workbook)));
    workbookFilename = path.basename(flags.workbook);
  }

  const { records, manifest, sourceIssues } = buildReferenceCatalogue({
    csvText,
    version,
    csvFilename: path.basename(csvPath),
    workbookFilename,
    workbookSha256,
  });

  const { validation } = manifest;
  console.log(`Records read: ${records.length}. Levels: ${manifest.counts.levels}.`);
  for (const warning of validation.warnings) console.warn(`Warning: ${warning}`);
  console.log(`Source issues reported (not corrected): ${sourceIssues.length}.`);

  if (!validation.passed) {
    console.error(`Validation FAILED with ${validation.errors.length} error(s). Nothing was written.`);
    for (const error of validation.errors.slice(0, 40)) console.error(`  - ${error}`);
    if (validation.errors.length > 40) console.error(`  ... and ${validation.errors.length - 40} more.`);
    process.exitCode = 1;
    return;
  }
  if (flags.dryRun) {
    console.log("Dry run: validation passed. Nothing was written.");
    return;
  }

  await mkdir(path.join(outputDir, "levels"), { recursive: true });
  const write = (name, data) => writeFile(path.join(outputDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await write("catalogue.json", records);
  const byLevel = new Map();
  for (const record of records) byLevel.set(record.level, [...(byLevel.get(record.level) ?? []), record]);
  for (const [level, levelRecords] of byLevel) await write(`levels/${levelSlug(level)}.json`, levelRecords);
  await write("manifest.json", manifest);
  await write("source-issues.json", sourceIssues);
  console.log(`Wrote reference catalogue to ${outputDir}`);
}

main().catch((error) => {
  console.error(`Curriculum reference import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
