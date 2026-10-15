import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";
import { getAllContent, getContentByType, getContentBySlug, type ContentItem } from "./content";

/**
 * Interactive experiences used to be their own standalone catalogue,
 * completely separate from ContentItem — a parallel system a visitor (and
 * a developer) had to know to check independently, even though "game" and
 * "quiz" were already ordinary ContentItems. They're now first-class
 * ContentItems too (contentType: "experience", engine: "runtime" — see
 * lib/content-registry.ts), auto-loaded from content/experiences/** the
 * same way every other content type is.
 *
 * This module is kept as a thin, stable-signature wrapper purely so
 * app/experiences/**, app/explore/experiences/page.tsx and
 * InteractiveMatrix don't need to change: they still ask "give me the
 * active experiences" / "give me the one with this slug" without knowing
 * the data now lives in the shared content catalogue.
 */
export function getAllInteractiveExperiences(): InteractiveExperienceDefinition[] {
  return getContentByType("experience") as InteractiveExperienceDefinition[];
}

export function getActiveInteractiveExperiences(): InteractiveExperienceDefinition[] {
  return getAllInteractiveExperiences().filter(
    (experience) => experience.status === "active"
  );
}

export function getInteractiveExperienceBySlug(
  slug: string
): InteractiveExperienceDefinition | null {
  return getContentBySlug(
    "experience",
    slug
  ) as InteractiveExperienceDefinition | null;
}

export function getFeaturedInteractiveExperiences(): InteractiveExperienceDefinition[] {
  return getAllInteractiveExperiences().filter(
    (experience) =>
      experience.status === "active" && experience.featured === true
  );
}

/**
 * Filters experiences by the same taxonomy tree (lib/explore-taxonomy.ts)
 * that ContentItem browsing uses, via a plain path-prefix match. This is
 * what lets an Explore category/subcategory page show interactive
 * experiences and static content side by side instead of them being two
 * separate systems a visitor has to know to check independently.
 */
export function getInteractiveExperiencesByTaxonomy(
  category: string,
  path: string[]
): InteractiveExperienceDefinition[] {
  return getAllInteractiveExperiences().filter((experience) =>
    experience.taxonomy?.some(
      (entry) =>
        entry.category === category &&
        entry.path.length >= path.length &&
        path.every((segment, index) => entry.path[index] === segment)
    )
  );
}

/**
 * Is this item live on the site? Interactive experiences use the status
 * "active"; every other content type uses "published". Listings that mix
 * experiences with other content must use this instead of
 * getPublishedContent(), which only knows "published" — that mismatch is
 * why the home Explore section used to miss every interactive experience.
 */
export function isLiveContent(item: ContentItem): boolean {
  return item.contentType === "experience"
    ? item.status === "active"
    : item.status === "published";
}

/**
 * Every live interactive experience: the interactive > experiences branch
 * of the explore taxonomy (experiences, games and quizzes) plus the
 * interactive > virtual-labs branch. The Experiences page and the Virtual
 * Labs page each take their own part of this list (see isVirtualExperiment
 * in lib/explore-experience-items.ts), and the Next button walks all of it.
 */
export function getExperienceLibrary(): ContentItem[] {
  return getAllContent().filter(
    (item) =>
      isLiveContent(item) &&
      item.taxonomy?.some(
        (entry) =>
          entry.category === "interactive" &&
          (entry.path[0] === "experiences" || entry.path[0] === "virtual-labs")
      )
  );
}
