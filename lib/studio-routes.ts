// Experiences that have their own studio page. They open there instead of on
// the generic /experiences/<slug> page, which sends visitors on to it.
export const STUDIO_ROUTES: Record<string, string> = {
  "rhinobot-programming-lab": "/coding-robotics/robot-lab",
};

/**
 * Where an experience opens, by slug. The one rule used by the catalogue
 * cards, the content registry, the virtual-lab redirect and the route tests,
 * so they cannot disagree.
 */
export function experienceHref(slug: string): string {
  return STUDIO_ROUTES[slug] ?? `/experiences/${slug}`;
}
