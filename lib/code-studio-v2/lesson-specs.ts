import type { CurriculumActivity } from "./curriculum";
import { isExerciseDefinition, type ExerciseDefinition } from "./exercise-types.ts";
import { isBuildRequired } from "./lesson-gates.ts";
export type StepKey = "think" | "move" | "code" | "build" | "create" | "check";

/**
 * Exercise specification for an individually reviewed lesson.
 * A curriculum record alone must never be treated as a runnable exercise.
 */
/** One page of an approved book that a step is taken from. Pages are printed page numbers. */
export type BookPageRef = { book: "activity-book" | "teacher-guide"; page: number };

/** Which approved book lesson a reviewed lesson is developed from (registry lesson ids). */
export type LessonBookSource = {
  activityBookLessonId: string;
  teacherGuideLessonId: string;
};

/** One picture-and-word item shown in a step's strip (for example "clap" or "Ayo wakes up"). */
export type PresentationItem = { icon: string; label: string };

/**
 * What the learner page shows for a step. Every field is optional: a step without it falls back to
 * the generic title and shows no strip, so a new lesson can be written as data only.
 */
export type StepPresentation = {
  title?: string;
  /** Pictures in the order the book shows them. */
  strip?: readonly PresentationItem[];
  /** Short line under the strip (for the Move step this is the grown-up's prompt). */
  note?: string;
  /** Small print under the note. */
  smallNote?: string;
  /** Heading above the note (used by the Create step). */
  heading?: string;
  /** The learner's own "I did it" button. The app cannot check it. */
  confirmLabel?: string;
};

export type LessonStepSpec = {
  /**
   * False when the approved book lesson has no such stage. The step is kept in the spec for
   * compatibility but is not shown to the learner. Only an optional Build step may be left out.
   */
  inBook?: boolean;
  /** The book pages this step follows. Required for every step the book contains. */
  sources?: readonly BookPageRef[];
  /** How this step looks on the page. Optional. */
  presentation?: StepPresentation;
  instruction: string;
  task: string;
  evidence: string;
  hint: string;
  fallback: string;
  exercise?: ExerciseDefinition;
};

/**
 * What a lesson needs to know about itself when it is described by the approved books alone, with no
 * curriculum-sheet record. The approved Activity Book and Teacher Guide are the source of truth.
 */
export type BookLessonUnit = {
  level: string;
  term: number;
  week: number;
  theme: string;
  focus: string;
  /** For example "Move + Code". A Build part counts as required only when named here. */
  coreParts: string;
  masteryTarget: string;
  /** Materials from the Teacher Guide "You need" box. */
  materials: string;
  practicalActivity: string;
  stretch: string;
  fallback: string;
};

export type LessonSpecStatus = "draft" | "reviewed";

export type InteractiveLessonSpec = {
  activityId: string;
  /** Only "reviewed" specs are served. A draft is written by a developer and needs a curriculum reviewer. */
  status: LessonSpecStatus;
  objective: string;
  successCriteria: readonly string[];
  estimatedMinutes: number;
  /** Lesson-level wording for the learner page. Optional; generic text is used for anything missing. */
  presentation?: {
    rhinobotSays?: string;
    /** Emoji for each ordering item id, so the page needs no per-lesson code. */
    pictureIcons?: Readonly<Record<string, string>>;
    /** The adult's yes/no question and the line recorded when they confirm. */
    teacherCheck?: { question: string; recordedText: string };
    practises?: readonly string[];
    reflectionPlaceholder?: string;
    completionText?: { passed: string; withHelp: string; awaitingTeacher: string };
  };
  /** Set when the lesson has no curriculum-sheet record and is described by the books alone. */
  unit?: BookLessonUnit;
  /** The approved book lesson this lesson is developed from. Every reviewed lesson must have one. */
  bookSource?: LessonBookSource;
  accessibility: {
    keyboardOperable: boolean;
    touchOperable: boolean;
    reducedMotionSafe: boolean;
    textInstructionsAvailable: boolean;
  };
  steps: Record<StepKey, LessonStepSpec>;
};

// No interactive RhinoBot lessons are published. The Nursery 1 Weeks 1 to 3 lessons were removed so
// every week follows the same pattern ("Do it together" from the Teacher Guide, plus games and quizzes).
// The spec type, the consistency check and this list stay so a reviewed lesson can be added again.
const LESSON_SPECS: Readonly<Record<string, InteractiveLessonSpec>> = {};

export function getLessonSpec(activityId: string): InteractiveLessonSpec | undefined {
  return LESSON_SPECS[activityId];
}

export function isLessonSpecConsistent(spec: InteractiveLessonSpec, activity: CurriculumActivity): boolean {
  if (
    spec.activityId !== activity.id ||
    spec.status !== "reviewed" ||
    !Number.isInteger(spec.estimatedMinutes) ||
    spec.estimatedMinutes <= 0 ||
    !spec.objective.trim() ||
    spec.successCriteria.length === 0 ||
    !spec.successCriteria.every((criterion) => criterion.trim().length > 0)
  ) return false;

  const accessibility = spec.accessibility;
  if (
    accessibility.keyboardOperable !== true ||
    accessibility.touchOperable !== true ||
    accessibility.reducedMotionSafe !== true ||
    accessibility.textInstructionsAvailable !== true
  ) return false;

  const stepKeys: StepKey[] = ["think", "move", "code", "build", "create", "check"];
  for (const key of stepKeys) {
    const step = spec.steps[key];
    if (
      !step ||
      !step.instruction.trim() ||
      !step.task.trim() ||
      !step.evidence.trim() ||
      !step.hint.trim() ||
      !step.fallback.trim()
    ) return false;
    if (step.exercise && !isExerciseDefinition(step.exercise)) return false;
  }

  // A step the book does not have may only be an optional Build step, with nothing attached to it.
  for (const key of stepKeys) {
    if (spec.steps[key].inBook === false && (key !== "build" || isBuildRequired(activity.coreParts) || spec.steps[key].exercise)) return false;
  }
  // Every step the book does contain names the book pages it follows. Pages are positive whole numbers.
  if (spec.bookSource) {
    if (!spec.bookSource.activityBookLessonId.trim() || !spec.bookSource.teacherGuideLessonId.trim()) return false;
    for (const key of stepKeys) {
      const step = spec.steps[key];
      if (step.inBook === false) continue;
      if (!step.sources || step.sources.length === 0) return false;
      if (!step.sources.every((ref) => (ref.book === "activity-book" || ref.book === "teacher-guide") && Number.isInteger(ref.page) && ref.page > 0)) return false;
    }
  }

  const buildRequired = isBuildRequired(activity.coreParts);
  const buildEvidence = spec.steps.build.evidence.toLowerCase();
  if (buildRequired && /optional|not a core|no evidence is required/.test(buildEvidence)) return false;
  if (!buildRequired && !/optional|not a core|no evidence is required/.test(buildEvidence)) return false;

  return true;
}

export function isReviewedInteractiveLesson(activityId: string): boolean {
  return getLessonSpec(activityId)?.status === "reviewed";
}
