import { NURSERY_1_TERMS, NURSERY_1_WEEKS } from "./nursery-1-weeks";
import type { TmcWeek } from "./types";

export { NURSERY_1_TERMS, NURSERY_1_WEEKS };

export const N1_BASE = "/think-move-code/nursery-1";

export const weekPath = (week: Pick<TmcWeek, "term" | "week">) =>
  `${N1_BASE}/term-${week.term}/week-${week.week}`;

/** Folder in /public that holds the week's games and printable cards. */
export const weekAssets = (week: Pick<TmcWeek, "term" | "week">) => `/tmc/n1/t${week.term}-w${week.week}`;

export const shortLink = (week: Pick<TmcWeek, "term" | "week">) =>
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
