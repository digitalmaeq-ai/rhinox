// The pool behind the "Hands-on labs" showcase under Play on the homepage.
// The page shows TWO of these at a time and rotates through the pool on its
// own. To add an experience to the rotation:
//   1. build it as a normal experience (content/experiences/<slug>.ts);
//   2. add one entry here, with a preview that exists in PlayLabs
//      (or "generic" for a simple gradient card).
// Title, description, link, age and time all come from the experience itself.

export type ShowcasePreview = "solar-system" | "maze-coder" | "generic";

export interface ShowcaseEntry {
  slug: string;
  preview: ShowcasePreview;
  /** Short label above the title, e.g. "3D · Earth & space". */
  kicker: string;
  /** Three or four things the learner will do. */
  highlights: string[];
}

export const showcaseEntries: ShowcaseEntry[] = [
  {
    slug: "solar-system-explorer",
    preview: "solar-system",
    kicker: "2D + 3D · Earth & space",
    highlights: ["Real NASA data", "Switch 2D / 3D", "Control the speed", "Compare all 8 planets"],
  },
  {
    slug: "robot-maze-coder",
    preview: "maze-coder",
    kicker: "Block coding · Robotics",
    highlights: ["Snap-together blocks", "Loops and nested loops", "Collect energy chips", "6 levels"],
  },
];

/** How long a pair stays on screen before the next pair rotates in. */
export const SHOWCASE_ROTATE_MS = 16000;

/**
 * Picks which two entries to show. `start` is the rotation counter: pair 0
 * is entries [0, 1], pair 1 is [2, 3] (or [1, 2] when the pool is small), and
 * so on, wrapping round the whole pool. A pool of two or fewer shows
 * everything and never rotates.
 */
export function pickPair<T>(pool: T[], start: number): T[] {
  if (pool.length <= 2) return pool;
  const step = pool.length >= 4 ? 2 : 1;
  const first = (start * step) % pool.length;
  return [pool[first], pool[(first + 1) % pool.length]];
}

export function pairCount(poolSize: number): number {
  if (poolSize <= 2) return 1;
  return poolSize >= 4 ? Math.ceil(poolSize / 2) : poolSize;
}
