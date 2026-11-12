/**
 * How a finished game or quiz names its Learning Path step. Pure text rules: no imports, storage or
 * network. A test checks these ids match the real path built from the registry for every week.
 */
export type ReportedKind = "play" | "match" | "quiz";

/** The week page's game keys and the path step each one finishes. */
export const GAME_STEP: Record<"screen" | "pictures", ReportedKind> = {
  screen: "play",
  pictures: "match",
};

/** Nursery 1 step id, for example "tmc-n1-t2-w5:play". */
export function nursery1StepId(term: number, week: number, kind: ReportedKind): string {
  return `tmc-n1-t${term}-w${week}:${kind}`;
}

/** A Nursery 1 quiz slug such as "nursery-1-term-2-week-5" gives its path step; any other slug gives null. */
export function quizSlugToStep(slug: string): { levelSlug: string; stepId: string } | null {
  const match = /^nursery-1-term-([1-3])-week-(1[0-3]|[1-9])$/.exec(slug);
  if (!match) return null;
  return { levelSlug: "nursery-1", stepId: nursery1StepId(Number(match[1]), Number(match[2]), "quiz") };
}
