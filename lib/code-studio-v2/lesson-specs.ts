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

/**
 * Nursery 1, Term 1, Week 1 "I Can Do Things in Steps".
 * Rebuilt from the approved books (Activity Book pp. 6-8, Teacher Guide pp. 8-9), not from the
 * curriculum sheet. The Teacher Guide lesson has Think, Move, Code and Book & close; it has no Build.
 * The activity id is kept so existing addresses keep working.
 */
const NURSERY_1_T1_W1: InteractiveLessonSpec = {
  activityId: "tmc-v3-15-nursery-1-t1-w1",
  status: "reviewed",
  objective: "I can follow 3 steps in order.",
  successCriteria: [
    "Follow a three-step movement instruction in the right order.",
    "Put Ayo's morning pictures in order: wakes up, brushes his teeth, eats breakfast.",
    "Follow 3 steps in order on their own, as observed by a teacher or caregiver.",
  ],
  estimatedMinutes: 10,
  presentation: {
    rhinobotSays: "We can teach a computer by giving it clear steps. Let’s try it together!",
    pictureIcons: { "wake-up": "☀️", "brush-teeth": "🪥", "eat-breakfast": "🥣" },
    teacherCheck: {
      question: "Can the child follow a 3-step instruction in the right order on their own?",
      recordedText: "a teacher or caregiver said they watched you follow 3 steps in order. The app cannot verify who confirmed it.",
    },
    practises: ["Following steps in order", "Giving clear instructions", "Creating a sequence"],
    reflectionPlaceholder: "I learned that instructions need to be in the right order...",
    completionText: {
      passed: "You practised following instructions, building a sequence and showing a grown-up what you can do. These are foundations of computational thinking.",
      withHelp: "You went through every step with a grown-up’s help. Try the picture cards again another day to practise on your own.",
      awaitingTeacher: "You went through every step. A teacher or caregiver still needs to watch you follow three steps on your own.",
    },
  },
  bookSource: { activityBookLessonId: "tmc-n1-ab-t1-w1", teacherGuideLessonId: "tmc-n1-tg-t1-w1" },
  accessibility: {
    keyboardOperable: true,
    touchOperable: true,
    reducedMotionSafe: true,
    textInstructionsAvailable: true,
  },
  steps: {
    think: {
      sources: [{ book: "activity-book", page: 6 }, { book: "teacher-guide", page: 8 }],
      presentation: {
        title: "Think about the steps",
        strip: [{ icon: "☀️", label: "Ayo wakes up" }, { icon: "🪥", label: "Ayo brushes his teeth" }, { icon: "🥣", label: "Ayo eats breakfast" }],
      },
      instruction: "Look at Ayo getting ready for school. What does he do first? What does he do next? What does he do last?",
      task: "Say or point to what Ayo does first, next and last. Then say together: “First wake up, next brush teeth, last eat.”",
      evidence: "Learner says or points to the first, next and last picture. This is adult-observed, not automatic.",
      hint: "RhinoBot remembers: you already do steps at home every morning!",
      fallback: "A teacher or caregiver can describe the pictures aloud; no device is needed.",
    },
    move: {
      sources: [{ book: "activity-book", page: 6 }, { book: "teacher-guide", page: 8 }],
      presentation: {
        title: "Move like a robot",
        strip: [{ icon: "👏", label: "Clap" }, { icon: "👣", label: "Stamp" }, { icon: "🔄", label: "Turn" }],
        note: "Ask a grown-up or classmate to call the steps. Follow them in order. Then try a new order: turn, clap, stamp.",
        confirmLabel: "I tried the movement challenge",
      },
      instruction: "Play Robot Says! Clap → stamp → turn. Now try a new order: turn → clap → stamp.",
      task: "Do clap, stamp, turn in that order. Then do turn, clap, stamp.",
      evidence: "Learner or supervising adult confirms the movement sequence was attempted; this is self-reported evidence, not sensor verification.",
      hint: "Go slowly. Listen for one step at a time and wait for “Go!”.",
      fallback: "If moving is hard, do the steps seated or point to action cards with a grown-up.",
    },
    code: {
      sources: [{ book: "teacher-guide", page: 8 }, { book: "activity-book", page: 7 }],
      presentation: { title: "Put the picture steps in order" },
      instruction: "Lay the 3 morning cards in a row. Point to each one and say “first, next, last”.",
      task: "Put the cards in order: Ayo wakes up, Ayo brushes his teeth, Ayo eats breakfast.",
      evidence: "The interactive sequence is exactly wake up, brush teeth, eat breakfast.",
      hint: "What does Ayo do first? What comes next? What comes last?",
      fallback: "No device or printer? Draw the 3 pictures on paper or the board and arrange them with a teacher or caregiver.",
      exercise: {
        id: "morning-routine-order",
        kind: "ordering",
        prompt: "Put Ayo's morning pictures in order.",
        instructions: "Choose the cards in order: first, next and last.",
        hint: "What does Ayo do first? Then what comes next?",
        fallback: "Arrange printed or hand-drawn cards on a table with a teacher or caregiver.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        items: [
          { id: "wake-up", label: "Ayo wakes up" },
          { id: "brush-teeth", label: "Ayo brushes his teeth" },
          { id: "eat-breakfast", label: "Ayo eats breakfast" },
        ],
        expectedOrder: ["wake-up", "brush-teeth", "eat-breakfast"],
        scoring: { correctPoints: 1, incorrectPoints: 0, partialCredit: false },
      },
    },
    build: {
      inBook: false,
      instruction: "This week's book lesson has no Build part, so this step is not shown.",
      task: "Nothing to do. The book lesson goes from Code to the Activity Book drawing.",
      evidence: "No evidence is required because Build is not a core part of this week's book lesson.",
      hint: "Nothing to do for this step.",
      fallback: "Skip this step; the lesson needs no kit.",
    },
    create: {
      sources: [{ book: "activity-book", page: 8 }, { book: "teacher-guide", page: 8 }],
      presentation: {
        title: "Create your own sequence",
        heading: "Your turn to create",
        note: "Draw 3 steps of something you do every day. Number them 1, 2 and 3: first, next, last.",
        smallNote: "Can’t draw yet? Act it or tell it, and a grown-up draws it.",
        confirmLabel: "I completed my three-step drawing",
      },
      instruction: "Draw 3 steps of something you do every day: first, next and last.",
      task: "Draw three steps in order. Colour the star when you can!",
      evidence: "Learner or supervising adult confirms a sequence was created; this is self-reported evidence, not image verification.",
      hint: "Choose something you know well, like getting ready for bed.",
      fallback: "Can't draw yet? Act it or tell it, and a grown-up draws it.",
    },
    check: {
      sources: [{ book: "teacher-guide", page: 9 }, { book: "activity-book", page: 7 }],
      presentation: { title: "Show a grown-up what you can do" },
      instruction: "Show a teacher or caregiver that you can follow 3 steps in the right order.",
      task: "Follow a 3-step instruction on your own while a teacher or caregiver watches.",
      evidence: "A teacher or caregiver observes whether the child follows a 3-step instruction in the right order on their own; this is adult-recorded evidence, not automatic verification. The picture question below is optional extra practice and is not the official check.",
      hint: "Start with 2 steps, then add the third. Do the steps together first, then let the child try alone.",
      fallback: "If no adult can watch right now, choose “I will check later” so the teacher can complete the observation.",
      exercise: {
        id: "morning-what-comes-first",
        kind: "choice",
        prompt: "What comes first? Choose the picture that comes first.",
        instructions: "Choose the first picture.",
        hint: "What does Ayo do first when he gets ready for school?",
        fallback: "Ask a teacher or caregiver to read the choices aloud, then point to the best answer.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        options: [
          { id: "wake-up", label: "Ayo wakes up" },
          { id: "brush-teeth", label: "Ayo brushes his teeth" },
          { id: "eat-breakfast", label: "Ayo eats breakfast" },
        ],
        correctOptionId: "wake-up",
      },
    },
  },
};

const LESSON_SPECS: Readonly<Record<string, InteractiveLessonSpec>> = {
  [NURSERY_1_T1_W1.activityId]: NURSERY_1_T1_W1,
};

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
