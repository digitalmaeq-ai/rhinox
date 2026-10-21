import type { CurriculumActivity } from "./curriculum";

const LEVELS = new Set(["Nursery 1", "Nursery 2", ...Array.from({ length: 11 }, (_, i) => `Year ${i + 1}`)]);

export type CurriculumSelection = { level: string; term: number; week: number };
export type CurriculumAccess = {
  learnerId: string | null;
  canReadLicensedCurriculum: boolean;
};

export function curriculumId({ level, term, week }: CurriculumSelection): string | null {
  if (!LEVELS.has(level) || !Number.isInteger(term) || term < 1 || term > 3 ||
      !Number.isInteger(week) || week < 1 || week > 13) return null;
  return `tmc-v3-15-${level.toLowerCase().replace(/ +/g, "-")}-t${term}-w${week}`;
}

const TEXT_FIELDS = [
  "id", "level", "weekType", "theme", "focus", "think", "move", "code",
  "build", "create", "practicalActivity", "weeklyCheck", "masteryTarget",
  "priorLearning", "futureBridge", "assessmentEvidence", "platform",
  "coreParts", "stretch", "fallback",
] as const;

export function isValidCurriculumActivity(
  record: unknown,
  selection: CurriculumSelection,
  expectedId: string,
): record is CurriculumActivity {
  if (record === null || typeof record !== "object" || Array.isArray(record)) return false;
  const value = record as Record<string, unknown>;
  return value.id === expectedId && value.curriculumVersion === "3.15" &&
    value.level === selection.level && value.term === selection.term &&
    value.week === selection.week &&
    (value.strand === null || ["CT", "RB", "ED", "AI"].includes(value.strand as string)) &&
    TEXT_FIELDS.every((field) => typeof value[field] === "string" && (value[field] as string).trim().length > 0);
}

export function authorizeCurriculumActivity(
  records: unknown,
  selection: CurriculumSelection,
  access: CurriculumAccess,
): CurriculumActivity | null {
  const id = curriculumId(selection);
  if (!id || typeof access?.learnerId !== "string" || access.learnerId.trim().length === 0 ||
      access.canReadLicensedCurriculum !== true || !Array.isArray(records) || records.length !== 39) return null;
  const matches = records.filter((record) => isValidCurriculumActivity(record, selection, id));
  return matches.length === 1 ? matches[0] : null;
}
