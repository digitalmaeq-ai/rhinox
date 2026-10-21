/**
 * Private curriculum access boundary. Never import this module into a Client Component.
 * The full catalogue is deliberately absent from the public Git repository and build.
 */
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CurriculumActivity } from "./curriculum";

const LEVELS = new Set(["Nursery 1", "Nursery 2", ...Array.from({ length: 11 }, (_, i) => `Year ${i + 1}`)]);
const PRIVATE_ROOT = path.resolve(process.cwd(), ".private-data/code-studio-v2/catalogue");

export type CurriculumSelection = { level: string; term: number; week: number };
export type CurriculumAccess = {
  /** Must be resolved from a trusted server-side session, never from request input. */
  learnerId: string | null;
  /** A verified server-side entitlement, not a client-provided flag. */
  canReadLicensedCurriculum: boolean;
};

export function curriculumId({ level, term, week }: CurriculumSelection): string | null {
  if (!LEVELS.has(level) || !Number.isInteger(term) || term < 1 || term > 3 ||
      !Number.isInteger(week) || week < 1 || week > 13) return null;
  return `tmc-v3-15-${level.toLowerCase().replace(/\\s+/g, "-")}-t${term}-w${week}`;
}

/**
 * Fail closed if no authenticated learner, no entitlement, no private mount,
 * invalid selection, or a mismatched catalogue. Do not return a full catalogue.
 */
export async function getLicensedCurriculumActivity(
  selection: CurriculumSelection,
  access: CurriculumAccess,
): Promise<CurriculumActivity | null> {
  const id = curriculumId(selection);
  if (!id || !access.learnerId || !access.canReadLicensedCurriculum) return null;
  const filename = `${selection.level.toLowerCase().replace(/\\s+/g, "-")}.json`;
  let source: string;
  try {
    source = await readFile(path.join(PRIVATE_ROOT, filename), "utf8");
  } catch {
    return null;
  }
  let records: unknown;
  try {
    records = JSON.parse(source);
  } catch {
    return null;
  }
  if (!Array.isArray(records) || records.length !== 39) return null;
  const matches = records.filter((record): record is CurriculumActivity =>
    record !== null && typeof record === "object" &&
    (record as CurriculumActivity).id === id &&
    (record as CurriculumActivity).curriculumVersion === "3.15" &&
    (record as CurriculumActivity).level === selection.level &&
    (record as CurriculumActivity).term === selection.term &&
    (record as CurriculumActivity).week === selection.week);
  return matches.length === 1 ? matches[0] : null;
}
