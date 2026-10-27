import { NURSERY_1_TERMS, NURSERY_1_WEEKS } from "./nursery-1-weeks";
import type { TmcWeek } from "./types";

export { NURSERY_1_TERMS, NURSERY_1_WEEKS };

export const N1_BASE = "/think-move-code/nursery-1";

export const weekPath = (week: Pick<TmcWeek, "term" | "week">) =>
  `${N1_BASE}/term-${week.term}/week-${week.week}`;

/** Folder in /public that holds the week's games and printable cards. */
export const weekAssets = (week: Pick<TmcWeek, "term" | "week">) => `/tmc/n1/t${week.term}-w${week.week}`;

/** File-name prefix used by the weekly pack, e.g. TMC-N1-T1-W01. */
export const packCode = (week: Pick<TmcWeek, "term" | "week">) =>
  `TMC-N1-T${week.term}-W${String(week.week).padStart(2, "0")}`;

/** Teacher downloads from the weekly pack, in the order they are listed. */
export const TEACHER_FILES = [
  { suffix: "Lesson-Plan.pdf", title: "Lesson plan", detail: "Step by step: what to say and what children do" },
  { suffix: "Teacher-Parent-Guide.pdf", title: "Teacher and parent guide", detail: "Getting ready, common mistakes and the take-home note" },
  { suffix: "Project-Sheet.pdf", title: "Project sheet", detail: "The hands-on practical, with low-cost materials" },
  { suffix: "Review-Sheet.pdf", title: "Review sheet", detail: "Child page and observation ticks (not marked)" },
  { suffix: "Question-Bank.pdf", title: "Question bank", detail: "Oral questions with answers. Also in Excel", extra: { suffix: "Question-Bank.xlsx", label: "Excel" } },
  { suffix: "QR-Code.png", title: "QR code for this week", detail: "To print on a class poster or newsletter" },
] as const;

/** Whole-year downloads listed on the Nursery 1 page. */
export const YEAR_FILES = [
  { href: "/tmc/n1/all/TMC-N1-Term1-Printable-Card-Pack.pdf", title: "Term 1 card pack", detail: "All Term 1 printable cards in one PDF" },
  { href: "/tmc/n1/all/TMC-N1-Term2-Printable-Card-Pack.pdf", title: "Term 2 card pack", detail: "All Term 2 printable cards in one PDF" },
  { href: "/tmc/n1/all/TMC-N1-Term3-Printable-Card-Pack.pdf", title: "Term 3 card pack", detail: "All Term 3 printable cards in one PDF" },
  { href: "/tmc/n1/all/TMC-N1-Question-Bank-All-Weeks.xlsx", title: "Question bank, all 39 weeks", detail: "Excel, with filters. Also as a Word file", extra: { href: "/tmc/n1/all/TMC-N1-Question-Bank-All-Weeks.docx", label: "Word" } },
] as const;

export const shortLink =(week: Pick<TmcWeek, "term" | "week">) =>
  `rhinoxscientifica.com/q/n1-t${week.term}-w${week.week}`;

/** Reads "term-2" / "week-5" route segments; null when they are not a real week. */
export function findWeek(termSegment: string, weekSegment: string): TmcWeek | null {
  const term = /^term-(\d+)$/.exec(termSegment)?.[1];
  const week = /^week-(\d+)$/.exec(weekSegment)?.[1];
  if (!term || !week) return null;
  return NURSERY_1_WEEKS.find((item) => item.term === Number(term) && item.week === Number(week)) ?? null;
}

export function neighbours(week: TmcWeek): { previous: TmcWeek | null; next: TmcWeek | null } {
  const index = NURSERY_1_WEEKS.indexOf(week);
  return {
    previous: index > 0 ? NURSERY_1_WEEKS[index - 1] : null,
    next: index < NURSERY_1_WEEKS.length - 1 ? NURSERY_1_WEEKS[index + 1] : null,
  };
}

export const GAMES = {
  pictures: { file: "matching-game.html", label: "Find the Pairs" },
  screen: { file: "screen-game.html", label: "" },
} as const;

export type GameKey = keyof typeof GAMES;

export const gameTitle = (week: TmcWeek, key: GameKey) =>
  key === "screen" ? week.screenGame : GAMES.pictures.label;
