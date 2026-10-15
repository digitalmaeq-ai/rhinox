import type { ContentItem } from "@/lib/content";
import { isOwnPageContent, isVirtualExperiment } from "@/lib/explore-experience-items";
import { getSectionByPath, getSectionItems } from "@/lib/content-sections";
import {
  getExperienceLibrary,
  isLiveContent,
} from "@/lib/interactive-experiences";

// The one definition of "what is on this menu page". The header counts, the
// pages themselves and the Explore "Site menu" view all call this, so a
// number shown anywhere is the number of items the page lists.
// Returns null for pages that are not catalogues (forms, tools, hubs).
export function getDestinationItems(href: string): ContentItem[] | null {
  if (href === "/explore/experiences") {
    // Virtual labs, games and quizzes have their own pages, so each item is
    // listed on exactly one page.
    return getExperienceLibrary().filter((item) => !isOwnPageContent(item));
  }

  if (href === "/explore/virtual-lab") {
    // Virtual labs are the simulation and virtual-lab runtimes, the same
    // rule the Virtual Labs page itself uses.
    return getExperienceLibrary().filter(isVirtualExperiment);
  }

  const section = getSectionByPath(href);
  if (section) {
    return getSectionItems(section).filter(isLiveContent);
  }

  return null;
}
