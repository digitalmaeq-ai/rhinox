/**
 * Learning Path guide: RhinoBot's wording for "Today's next step" and the tiered hints.
 *
 * The hints explain HOW to use each kind of step. They never give answers and never add lesson
 * content; the book content stays on the week pages, games and quizzes. Hints are shown to a
 * grown-up helper or read aloud. Nothing here is stored. Pure text and rules: no runtime imports.
 */
import type { PathView } from "./view";

export type StepKind = "learn" | "play" | "match" | "quiz";

/** Three tiers: a nudge, a way to try, then a grown-up tip. Shown one at a time, never an answer. */
export const HINT_TIERS: Record<StepKind, readonly [string, string, string]> = {
  learn: [
    "RhinoBot says: read the week page slowly, one part at a time.",
    "Look at the pictures first, then say what you see out loud.",
    "Grown-up tip: read it together and pause to ask, \"What do you think happens next?\" There is no wrong answer.",
  ],
  play: [
    "RhinoBot says: look at all the cards before you move one.",
    "Try the card you are most sure about first. You can always move it again.",
    "Grown-up tip: let the child try on their own for a while. If they are stuck, ask what comes first, rather than showing them.",
  ],
  match: [
    "RhinoBot says: find two cards that look like they belong together.",
    "Start with the picture you know best, then look for its partner.",
    "Grown-up tip: say the name of each picture together. Wrong pairs are fine; just try again.",
  ],
  quiz: [
    "RhinoBot says: read the question, then look at every answer before you choose.",
    "Think about the week you just did. What do you remember?",
    "Grown-up tip: read each question aloud. A wrong answer is a chance to look at the week page again, not a mark against the child.",
  ],
};

export const MAX_HINT_LEVEL = 3;

/** The hint text for a level (1 to 3). Level 0 or less gives nothing; above 3 stays at 3. */
export function hintsUpTo(kind: StepKind, level: number): string[] {
  const count = Math.max(0, Math.min(MAX_HINT_LEVEL, Math.floor(level)));
  return HINT_TIERS[kind].slice(0, count);
}

export interface TodaysStep {
  stopId: string;
  stepId: string;
  weekLabel: string;
  stepLabel: string;
  href: string;
  message: string;
  isFirst: boolean;
}

/**
 * The step RhinoBot suggests: the first not done, in book order. A suggestion only, nothing is
 * locked. Returns null when every step is done. No time, streak or date is used.
 */
export function todaysStep(view: PathView, done: ReadonlySet<string>): TodaysStep | null {
  let any = false;
  for (const stop of view.stops) {
    for (const step of stop.steps) {
      if (done.has(step.id)) {
        any = true;
        continue;
      }
      const weekLabel = `Term ${stop.term}, Week ${stop.week}`;
      return {
        stopId: stop.id,
        stepId: step.id,
        weekLabel,
        stepLabel: step.label,
        href: step.href,
        isFirst: !any,
        message: any
          ? `RhinoBot suggests: ${step.label} in ${weekLabel}. You can pick any other step too.`
          : `RhinoBot says: let's begin with ${step.label} in ${weekLabel}!`,
      };
    }
  }
  return null;
}
