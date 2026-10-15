import type { ContentItem } from "./content";
import type { Difficulty } from "@/types/content";
import { hasTaxonomyBranch } from "./content-taxonomy";

export interface ContentFilters {
  contentType?: string;
  subjects?: string[];
  topics?: string[];
  ageGroups?: string[];
  classLevels?: string[];
  difficulty?: Difficulty;
  audience?: string[];
  featured?: boolean;
  // Filters by the taxonomy tree (see lib/explore-taxonomy.ts) rather than
  // the flat fields above — this is what lets "browse to a category/
  // subcategory branch" and "filter by subject/topic" share one code path
  // instead of being two unrelated systems.
  taxonomy?: {
    category: string;
    path: string[];
  };
}

function matchesArrayFilter(
  values: string[] | undefined,
  filterValues: string[] | undefined
): boolean {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }

  if (!values || values.length === 0) {
    return false;
  }

  return filterValues.some((value) => values.includes(value));
}

export function filterContent(
  content: ContentItem[],
  filters: ContentFilters
): ContentItem[] {
  return content.filter((item) => {
    if (
      filters.contentType &&
      item.contentType !== filters.contentType
    ) {
      return false;
    }

    if (
      filters.difficulty &&
      item.difficulty !== filters.difficulty
    ) {
      return false;
    }

    if (
      filters.featured !== undefined &&
      item.featured !== filters.featured
    ) {
      return false;
    }

    if (
      !matchesArrayFilter(item.subjects, filters.subjects)
    ) {
      return false;
    }

    if (
      !matchesArrayFilter(item.topics, filters.topics)
    ) {
      return false;
    }

    if (
      !matchesArrayFilter(item.ageGroups, filters.ageGroups)
    ) {
      return false;
    }

    if (
      !matchesArrayFilter(item.classLevels, filters.classLevels)
    ) {
      return false;
    }

    if (
      !matchesArrayFilter(item.audience, filters.audience)
    ) {
      return false;
    }

    if (
      filters.taxonomy &&
      !hasTaxonomyBranch(
        item,
        filters.taxonomy.category,
        filters.taxonomy.path
      )
    ) {
      return false;
    }

    return true;
  });
}