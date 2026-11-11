/**
 * Which levels have a Learning Path, and where it lives. Pure data: no registry import, so it can be
 * used by pages, tests and scripts alike. A level is added here only when its book content exists in
 * the registry and the owner has approved its design. Nursery 2 is NOT listed: it has not been
 * designed yet, so it has no registry data, no page and no entry in the picker.
 */
export interface PathLevelConfig {
  /** Short id used in the page address and the saved-progress key. Lower-case letters, digits and hyphens. */
  slug: string;
  /** The level name exactly as the registry spells it. */
  level: string;
  /** Where the path page lives. */
  pagePath: string;
}

export const PATH_LEVELS: readonly PathLevelConfig[] = [
  { slug: "nursery-1", level: "Nursery 1", pagePath: "/think-move-code/nursery-1/path" },
];

export function pathLevelFor(slug: string): PathLevelConfig | undefined {
  return PATH_LEVELS.find((item) => item.slug === slug);
}
