import type { MetadataRoute } from "next";

import { STUDIO_ROUTES } from "@/lib/experience-sequence";
import { getAllInteractiveExperiences } from "@/lib/interactive-experiences";
import { contentSections, getSectionItems } from "@/lib/content-sections";
import { siteUrl } from "@/lib/site-url";

// Fixed pages that have their own route folder.
const STATIC_PATHS = [
  "/",
  "/about",
  "/about/mission",
  "/about/support",
  "/coding-robotics",
  "/coding-robotics/game-creator",
  "/coding-robotics/my-projects",
  "/contact",
  "/education",
  "/experiences",
  "/explore",
  "/explore/experiences",
  "/explore/lab-designer",
  "/explore/stem-games",
  "/explore/virtual-lab",
  "/resources",
  "/schools",
  "/schools/coding-robotics",
  "/schools/laboratory-solutions",
  "/schools/request-a-quote",
  "/schools/stem-clubs",
  "/schools/stem-school-solutions",
  "/schools/teacher-training",
  "/shop",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = new Set<string>(STATIC_PATHS);

  for (const section of contentSections) {
    paths.add(section.path);
    for (const item of getSectionItems(section)) {
      if (item.contentType !== "experience") paths.add(`${section.path}/${item.slug}`);
    }
  }
  for (const experience of getAllInteractiveExperiences()) {
    if (experience.status !== "active") continue;
    // Studio experiences are listed at their studio address.
    paths.add(STUDIO_ROUTES[experience.slug] ?? `/experiences/${experience.slug}`);
  }

  return [...paths].sort().map((path) => ({ url: `${base}${path}` }));
}
