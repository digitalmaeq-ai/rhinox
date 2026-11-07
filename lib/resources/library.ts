// Data for the Resources pages, built from the Think • Move • Code! Nursery 1 material that
// already exists in /public/tmc. Nothing here is invented: every file listed is a real file,
// and every badge, week title and goal comes from lib/tmc.
// Kept free of React so pages and scripts can both use it.

import { NURSERY_1_TERMS, NURSERY_1_WEEKS, TEACHER_FILES, YEAR_FILES, packCode, termFiles, weekAssets, weekPath } from "../tmc/nursery-1";
import { TMC_VIDEOS, YOUTUBE_CHANNEL_URL } from "../tmc/videos";

export { NURSERY_1_TERMS, NURSERY_1_WEEKS, TMC_VIDEOS, YOUTUBE_CHANNEL_URL };

/** One colour per term, reused by every Resources page so a term always looks the same. */
export const TERM_COLOURS: Record<number, { name: string; main: string; soft: string; ink: string }> = {
  1: { name: "Blue", main: "#0f6fde", soft: "#e4effd", ink: "#0b3f7e" },
  2: { name: "Sky", main: "#1593b8", soft: "#e0f3f9", ink: "#0a5068" },
  3: { name: "Indigo", main: "#4f63d9", soft: "#e8ebfc", ink: "#26338f" },
};

export interface WeekPack {
  term: number;
  week: number;
  title: string;
  goal: string;
  kind: string;
  href: string;
  screenGame: string;
  screenGameHref: string;
  pairsHref: string;
  files: { label: string; detail: string; href: string; type: "PDF" | "PNG" | "Excel" }[];
}

export const weekPacks: WeekPack[] = NURSERY_1_WEEKS.map((w) => {
  const base = weekAssets(w);
  const code = packCode(w);
  const files: WeekPack["files"] = [];
  for (const f of TEACHER_FILES) {
    const ext = f.suffix.split(".").pop() as string;
    files.push({ label: f.title, detail: f.detail, href: `${base}/${code}-${f.suffix}`, type: ext === "pdf" ? "PDF" : "PNG" });
    if ("extra" in f) {
      files.push({ label: `${f.title} (Excel)`, detail: f.detail, href: `${base}/${code}-${f.extra.suffix}`, type: "Excel" });
    }
  }
  files.splice(1, 0, { label: "Printable cards", detail: "Cards to cut out and play with", href: `${base}/${w.cardsFile}`, type: "PDF" });
  return {
    term: w.term,
    week: w.week,
    title: w.title,
    goal: w.goal,
    kind: w.kind,
    href: weekPath(w),
    screenGame: w.screenGame,
    screenGameHref: `${base}/screen-game.html`,
    pairsHref: `${base}/matching-game.html`,
    files,
  };
});

export const termKits = NURSERY_1_TERMS.map((t) => {
  const f = termFiles(t.term);
  return { term: t.term, title: t.title, cards: f.cards, stickers: f.stickers, badge: f.badge };
});

export { YEAR_FILES };

export interface BadgeInfo {
  id: string;
  name: string;
  sub: string;
  image: string;
  term: number | null;
  idea: string;
  skills: string[];
  colour: { main: string; soft: string; ink: string };
}

export const badges: BadgeInfo[] = [
  {
    id: "t1",
    name: "Step Thinker",
    sub: "Term 1",
    image: termKits[0].badge,
    term: 1,
    idea: "Things happen in order.",
    skills: ["Put steps in order", "Say first, next, last", "Give clear commands", "Repeat a move", "Find and fix a mistake"],
    colour: TERM_COLOURS[1],
  },
  {
    id: "t2",
    name: "Step Thinker",
    sub: "Term 2",
    image: termKits[1].badge,
    term: 2,
    idea: "I can spot patterns.",
    skills: ["Copy and continue a pattern", "Move and clap in patterns", "Say what comes next", "Sort by one rule", "Make my own AB pattern"],
    colour: TERM_COLOURS[2],
  },
  {
    id: "t3",
    name: "Step Thinker",
    sub: "Term 3",
    image: termKits[2].badge,
    term: 3,
    idea: "I can solve small problems.",
    skills: ["Say what the problem is", "Break a job into small steps", "Choose the safe way", "Try another way", "Follow an if–then rule"],
    colour: TERM_COLOURS[3],
  },
  {
    id: "year",
    name: "Step Thinker",
    sub: "Nursery 1 year badge",
    image: "/tmc/n1/t3-w13/step-thinker-year-badge.png",
    term: null,
    idea: "The year badge, for the end of Nursery 1.",
    skills: ["Steps and order (Term 1)", "Patterns (Term 2)", "Problem solving (Term 3)"],
    colour: { main: "#d98b18", soft: "#fff3d9", ink: "#6b4400" },
  },
];

export const totals = {
  weeks: NURSERY_1_WEEKS.length,
  files: weekPacks.reduce((n, w) => n + w.files.length, 0) + termKits.length * 3 + YEAR_FILES.length + 1,
};
