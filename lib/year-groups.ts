/**
 * Year groups for experiences.
 *
 * Year 1 - Year 12 is the category students and teachers see. Primary,
 * JSS and SS names are shown beside it as a reference only; nothing sorts or
 * filters by them.
 *
 * The year is derived from the item's age band(s) (`ageGroups`, such as
 * "6-7"), so age stays the single source of truth and the two can never
 * disagree: a child turns 5 in Year 1, so the first year of a band is
 * (youngest age - 4) and the last is (oldest age - 5).
 *
 *   ages 5-6 -> Year 1      ages 9-10 -> Year 5      ages 10-12 -> Year 6-7
 *
 * Year 1-6 = Primary 1-6, Year 7-9 = JSS 1-3, Year 10-12 = SS 1-3.
 */
export interface YearRange {
  from: number;
  to: number;
}

const FIRST_YEAR = 1;
const LAST_YEAR = 12;

function clamp(value: number) {
  return Math.min(LAST_YEAR, Math.max(FIRST_YEAR, value));
}

/** Years covered by a list of age bands ("5-6", "9-12"). Null for "all". */
export function yearsFromAgeGroups(ageGroups?: string[]): YearRange | null {
  let youngest = Infinity;
  let oldest = -Infinity;

  for (const group of ageGroups ?? []) {
    const match = /^(\d+)(?:\s*[-–]\s*(\d+))?$/.exec(group.trim());
    if (!match) continue;
    const low = parseInt(match[1], 10);
    const high = match[2] ? parseInt(match[2], 10) : low;
    youngest = Math.min(youngest, low);
    oldest = Math.max(oldest, high);
  }

  if (!Number.isFinite(youngest)) {
    return null;
  }

  const from = clamp(youngest - 4);
  return { from, to: Math.max(from, clamp(oldest - 5)) };
}

function stage(year: number) {
  if (year <= 6) return { name: "Primary", number: year };
  if (year <= 9) return { name: "JSS", number: year - 6 };
  return { name: "SS", number: year - 9 };
}

/** "Year 5" or "Year 5–7". */
export function formatYears({ from, to }: YearRange) {
  return from === to ? `Year ${from}` : `Year ${from}–${to}`;
}

/** The Primary / JSS / SS names for the same years: "Primary 5 – JSS 1". */
export function formatYearReference({ from, to }: YearRange) {
  const start = stage(from);
  const end = stage(to);

  if (from === to) {
    return `${start.name} ${start.number}`;
  }
  if (start.name === end.name) {
    return `${start.name} ${start.number}–${end.number}`;
  }
  return `${start.name} ${start.number} – ${end.name} ${end.number}`;
}

/** One year, for a filter option: "Year 7 · JSS 1". */
export function formatSingleYear(year: number) {
  return `${formatYears({ from: year, to: year })} · ${formatYearReference({ from: year, to: year })}`;
}
