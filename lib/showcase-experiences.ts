// The hands-on labs behind the "Live labs" tab of Play on the homepage. Each shows a live
// preview in the Play stage instead of a screenshot. To add one:
//   1. build it as a normal experience (content/experiences/<slug>.ts);
//   2. add one entry here, with a preview that exists in
//      app/components/home/LivePreviews.tsx.
// Title, description, link, age and time all come from the experience itself.

export type ShowcasePreview = "solar-system" | "maze-coder" | "generic";

export interface ShowcaseEntry {
  slug: string;
  preview: ShowcasePreview;
  /** Short label above the title, e.g. "3D · Earth & space". */
  kicker: string;
  /** Three or four things the learner will do; the first three show as pills. */
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
    highlights: ["Snap-together blocks", "Loops and nested loops", "Collect energy chips", "10 levels"],
  },
];
