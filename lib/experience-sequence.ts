import type { ContentItem } from "./content";
import { getContentHref } from "./content-registry";
import { getExperienceLibrary } from "./interactive-experiences";
import { yearsFromAgeGroups } from "./year-groups";

/**
 * The order students move through the Experiences library: easiest first.
 *
 * Sorted by, in this order:
 *   1. difficulty (beginner -> intermediate -> advanced)
 *   2. year group, youngest first (derived from the "ageGroups" band, so age
 *      and year always agree - see lib/year-groups.ts), then the narrower
 *      range first (Year 5 before Year 5-10)
 *   3. explicit `order`, when an experience sets one
 *   4. duration, then title (so the order never changes between builds)
 *
 * The list page numbers its rows from this order, and the experience page's
 * "Next" button follows it. Both read it from here so they can never
 * disagree. To nudge one item, change its `difficulty` or give it an `order`.
 */
const difficultyRank: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

// Items with no age band ("all ages") go last.
const NO_YEAR = 99;

function firstYear(item: ContentItem): number {
  return yearsFromAgeGroups(item.ageGroups)?.from ?? NO_YEAR;
}

function lastYear(item: ContentItem): number {
  return yearsFromAgeGroups(item.ageGroups)?.to ?? NO_YEAR;
}

function rankOf(item: ContentItem): number {
  return item.difficulty ? (difficultyRank[item.difficulty] ?? 1) : 1;
}

function orderOf(item: ContentItem): number {
  const order = (item as { order?: unknown }).order;
  return typeof order === "number" ? order : Number.MAX_SAFE_INTEGER;
}

export function compareByDifficulty(a: ContentItem, b: ContentItem): number {
  return (
    rankOf(a) - rankOf(b) ||
    firstYear(a) - firstYear(b) ||
    lastYear(a) - lastYear(b) ||
    orderOf(a) - orderOf(b) ||
    (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0) ||
    a.title.localeCompare(b.title)
  );
}

/** Every live item in the Experiences library, easiest first. */
export function getExperienceSequence(): ContentItem[] {
  return [...getExperienceLibrary()].sort(compareByDifficulty);
}

/** Where an item in the library opens. */
export function getExperienceHref(item: ContentItem): string {
  return item.contentType === "experience"
    ? `/experiences/${item.slug}`
    : getContentHref(item);
}

export interface ExperienceNeighbours {
  /** 1-based place in the difficulty order, the same number the list shows. */
  position: number;
  total: number;
  previous: ContentItem | null;
  next: ContentItem | null;
}

/**
 * Previous / next for the experience player. Games and quizzes filed under
 * Experiences share the numbering but open on their own pages, so the
 * previous/next buttons skip over them and stay with the interactive
 * experiences a student plays here.
 */
// Virtual labs (simulation / virtual-lab runtimes) have their own library, so
// their Previous / Next and numbering stay inside it, and the other
// experiences stay out of it.
function isVirtualLab(item: ContentItem): boolean {
  return ["simulation", "virtual-lab"].includes(
    (item as { runtime?: string }).runtime as string
  );
}

export function getExperienceNeighbours(id: string): ExperienceNeighbours | null {
  const all = getExperienceSequence();
  const current = all.find((item) => item.id === id);

  if (!current) {
    return null;
  }

  const family = isVirtualLab(current);
  const sequence = all.filter(
    (item) => item.contentType !== "experience" || isVirtualLab(item) === family
  );
  const index = sequence.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const isExperience = (item: ContentItem) => item.contentType === "experience";

  return {
    position: index + 1,
    total: sequence.length,
    previous: sequence.slice(0, index).reverse().find(isExperience) ?? null,
    next: sequence.slice(index + 1).find(isExperience) ?? null,
  };
}
