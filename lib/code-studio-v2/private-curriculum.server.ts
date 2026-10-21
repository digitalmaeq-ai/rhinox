/**
 * Private curriculum access boundary. Never import this module into a Client Component.
 * The full catalogue is deliberately absent from the public Git repository and build.
 */
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CurriculumActivity } from "./curriculum";
import {
  authorizeCurriculumActivity,
  curriculumId,
  type CurriculumAccess,
  type CurriculumSelection,
} from "./curriculum-access-core";

export { curriculumId };
export type { CurriculumAccess, CurriculumSelection };

const PRIVATE_ROOT = path.resolve(process.cwd(), ".private-data/code-studio-v2/catalogue");

/**
 * Fail closed if no authenticated learner, no entitlement, no private mount,
 * invalid selection, or a mismatched catalogue. Do not return a full catalogue.
 */
export async function getLicensedCurriculumActivity(
  selection: CurriculumSelection,
  access: CurriculumAccess,
): Promise<CurriculumActivity | null> {
  const id = curriculumId(selection);
  if (!id || typeof access?.learnerId !== "string" || access.learnerId.trim().length === 0 ||
      access.canReadLicensedCurriculum !== true) return null;

  const filename = `${selection.level.toLowerCase().replace(/ +/g, "-")}.json`;
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

  return authorizeCurriculumActivity(records, selection, access);
}
