/**
 * Learning Path types. The path is an optional second way to use Think • Move • Code!, next to the
 * existing week pages. It holds ONLY order, labels and (later) progress. Every step points at a
 * resource that already exists in the book registry; it never carries a copy of content.
 */

/** The kinds of step a stop can have, in the order they are shown. */
export type LearningPathStepKind = "learn" | "play" | "match" | "quiz";

export interface LearningPathStep {
  /** Unique within the path, e.g. "tmc-n1-t1-w1:play". */
  id: string;
  kind: LearningPathStepKind;
  /** The registry resource this step opens. */
  resourceId: string;
  /** Short child-friendly label shown on the trail. */
  label: string;
}

/** One week on the trail. */
export interface LearningPathStop {
  id: string;
  level: string;
  term: number;
  week: number;
  title: string;
  steps: LearningPathStep[];
}

export interface LearningPath {
  id: string;
  level: string;
  title: string;
  /** "soft": the next stop is recommended but nothing is locked. */
  order: "soft";
  stops: LearningPathStop[];
}
