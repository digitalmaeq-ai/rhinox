import type { CurriculumActivity } from "./curriculum";
import { isExerciseDefinition, type ExerciseDefinition } from "./exercise-types.ts";
import { isBuildRequired } from "./lesson-gates.ts";
import { CURRICULUM_ACTIVITIES } from "./curriculum.ts";
import { buildNursery1Spec } from "./lesson-specs-nursery-1.ts";
export type StepKey = "think" | "move" | "code" | "build" | "create" | "check";

/**
 * Exercise specification for an individually reviewed lesson.
 * A curriculum record alone must never be treated as a runnable exercise.
 */
export type LessonStepSpec = {
  instruction: string;
  task: string;
  evidence: string;
  hint: string;
  fallback: string;
  exercise?: ExerciseDefinition;
};

export type LessonSpecStatus = "draft" | "reviewed";

/** Week-specific words and pictures the lesson screen shows around the exercises. */
export type LessonDisplay = {
  /** Heading above the picture-order exercise. */
  codeTitle: string;
  /** Small picture strip on the Think step; empty for none. */
  thinkStrip: readonly { icon: string; label: string }[];
  /** Picture strip on the Move step; empty for none. */
  moveStrip: readonly { icon: string; label: string }[];
  moveNote: string;
  moveButton: string;
  createHeading: string;
  createPrompt: string;
  createNote: string;
  createButton: string;
  /** The question the adult answers on the teacher check. */
  checkQuestion: string;
  /** Short phrase finishing "a teacher watched you …", for example "put your morning in order". */
  checkSkill: string;
  practises: readonly string[];
  /** Said after a correct order, for example "You put the morning steps in the right order." */
  orderingSuccess: string;
  /** Picture for an ordering card, by item id: an emoji, or a path to a book picture (starts with "/"). */
  icons: Readonly<Record<string, string>>;
  /** Pattern start shown above the cards on the Code step (Term 2 pattern weeks). */
  codeStrip?: readonly { icon: string; label: string }[];
  /** RhinoBot's line for this week, from the book's Think & Move page. */
  rhinobotSays?: string;
  /** Replaces the curriculum's teacher-facing build text on the Build step. */
  buildIntro?: string;
  /** What the class needs this week (Teacher Guide "You need"). */
  materials?: string;
  /** Replaces the core-parts line under each step, for example the book's "Try it at home" note. */
  footNote?: string;
};

export type InteractiveLessonSpec = {
  activityId: string;
  /** Only "reviewed" specs are served. A draft is written by a developer and needs a curriculum reviewer. */
  status: LessonSpecStatus;
  objective: string;
  successCriteria: readonly string[];
  /** Week-specific screen text. When absent the screen shows the Nursery 1 Term 1 Week 1 wording. */
  display?: LessonDisplay;
  estimatedMinutes: number;
  accessibility: {
    keyboardOperable: boolean;
    touchOperable: boolean;
    reducedMotionSafe: boolean;
    textInstructionsAvailable: boolean;
  };
  steps: Record<StepKey, LessonStepSpec>;
};

const NURSERY_1_T1_W1: InteractiveLessonSpec = {
  activityId: "tmc-v3-15-nursery-1-t1-w1",
  status: "reviewed",
  objective: "I can follow 3 steps in order.",
  // Book-sourced screen text and pictures (Activity Book pp6–8).
  display: {
    codeTitle: "What comes first?",
    thinkStrip: [],
    moveStrip: [{ icon: "/tmc/n1/lesson-art/clap.png", label: "Clap" }, { icon: "/tmc/n1/lesson-art/stamp.png", label: "Stamp" }, { icon: "🔄", label: "Turn" }],
    moveNote: "Ask a grown-up or classmate to help. Do each action, then talk about what you did.",
    moveButton: "I tried the movement challenge",
    createHeading: "Draw it!",
    createPrompt: "Draw 3 steps of something you do every day.",
    createNote: "Can’t draw it yet? Act it or tell it, and a grown-up draws it.",
    createButton: "I finished my creation",
    checkQuestion: "Can the child follow a 3-step instruction in the right order on their own?",
    checkSkill: "follow 3 steps in order",
    practises: ["Putting steps in order", "Giving and following clear instructions", "Finding and fixing mistakes"],
    orderingSuccess: "You put Ayo’s morning in the right order.",
    icons: { "wake-up": "/tmc/n1/lesson-art/wake-up.png", "brush-teeth": "/tmc/n1/lesson-art/brush-teeth.png", "eat-breakfast": "/tmc/n1/lesson-art/eat-breakfast.png" },
    rhinobotSays: "This is Ayo! Let’s learn to do things one step at a time.",
    footNote: "Try it at home: Ask your child for 3 steps to get ready for bed. Do them together in that order, then swap and you give the steps.",
  },
  successCriteria: [
    "Follow a three-step movement instruction.",
    "Arrange wake up, brush teeth, and eat breakfast in order.",
    "Follow three steps in order on their own, as observed by a teacher or caregiver.",
  ],
  estimatedMinutes: 10,
  accessibility: {
    keyboardOperable: true,
    touchOperable: true,
    reducedMotionSafe: true,
    textInstructionsAvailable: true,
  },
  steps: {
    think: {
      instruction: "Look at Ayo getting ready for school. What does he do first? What does he do next? What does he do last?",
      task: "Say or point to what you do first in the morning.",
      evidence: "Learner identifies or communicates a plausible first action.",
      hint: "Think about what you do when you first wake up.",
      fallback: "A teacher or caregiver can describe the pictures aloud; no device is needed.",
    },
    move: {
      instruction: "Play Robot Says! Clap → stamp → turn. Now try a new order: turn → clap → stamp.",
      task: "Practise the three movements, then repeat them in a different order.",
      evidence: "Learner or supervising adult confirms the movement sequence was attempted; this is self-reported evidence, not sensor verification.",
      hint: "Listen for one instruction at a time and keep the order.",
      fallback: "Use safe seated gestures or point to action cards if movement is difficult or unsuitable.",
    },
    code: {
      instruction: "In your Activity Book, page 7: Circle the picture that comes first. Then draw a line from each number to its picture. Now try it on the screen: put Ayo’s morning in order.",
      task: "Select all three picture cards in the correct sequence.",
      evidence: "The interactive sequence is exactly wake up, brush teeth, eat breakfast.",
      hint: "Which action normally happens before brushing your teeth? What comes after?",
      fallback: "Use three printed or hand-drawn cards and arrange them on a table.",
      exercise: {
        id: "morning-routine-order",
        kind: "ordering",
        prompt: "Put the morning actions in the order they usually happen.",
        instructions: "Choose the cards in order: first, next, and last.",
        hint: "Wake up comes before brushing your teeth. Eating breakfast comes after.",
        fallback: "Arrange printed or hand-drawn cards on a table with a teacher or caregiver.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        items: [
          { id: "wake-up", label: "Wake up" },
          { id: "brush-teeth", label: "Brush teeth" },
          { id: "eat-breakfast", label: "Eat breakfast" },
        ],
        expectedOrder: ["wake-up", "brush-teeth", "eat-breakfast"],
        scoring: { correctPoints: 1, incorrectPoints: 0, partialCredit: false },
      },
    },
    build: {
      instruction: "Building a model is optional this week. You can skip this step and continue.",
      task: "Optional: choose simple safe materials for a model of a morning routine.",
      evidence: "No evidence is required because Build is not a core part of this week's curriculum.",
      hint: "You could use paper cards or blocks, with adult help where needed.",
      fallback: "Skip the model and continue; the core activity needs no kit.",
    },
    create: {
      instruction: "Draw 3 steps of something you do every day.",
      task: "Create a three-step sequence from a familiar daily routine.",
      evidence: "Learner or supervising adult confirms a sequence was created; this is self-reported evidence, not image verification.",
      hint: "Choose a routine you know well, such as washing your hands.",
      fallback: "Arrange three objects or point to three drawn symbols instead of drawing.",
    },
    check: {
      instruction: "Show a teacher or caregiver that you can follow three steps in order.",
      task: "Follow a 3-step instruction on your own while a teacher or caregiver watches.",
      evidence: "A teacher or caregiver observes whether the child follows a 3-step instruction in the right order on their own; this is adult-recorded evidence, not automatic verification. The picture-card question below is optional extra practice and is not the official check.",
      hint: "Start with 2 steps, then add the third. Do the steps together first, then let the child try alone.",
      fallback: "If no adult can watch right now, choose “I will check later” so the teacher can complete the observation.",
      exercise: {
        id: "morning-what-comes-first",
        kind: "choice",
        prompt: "Getting ready for school: which picture comes first?",
        instructions: "Choose the first step of the morning.",
        hint: "What do you do before you brush your teeth or eat?",
        fallback: "Ask a teacher or caregiver to read the choices aloud, then point to the best answer.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        options: [
          { id: "wake-up", label: "Wake up" },
          { id: "brush-teeth", label: "Brush teeth" },
          { id: "eat-breakfast", label: "Eat breakfast" },
          { id: "go-to-bed", label: "Go to bed at night" },
        ],
        correctOptionId: "wake-up",
      },
    },
  },
};

/** Terms 1 to 3, Weeks 2 to 13, written from the Teacher Guide and Question Bank (lesson-specs-nursery-1.ts). */
const NURSERY_1_OTHER_WEEKS: Record<string, InteractiveLessonSpec> = {};
for (const activity of CURRICULUM_ACTIVITIES) {
  const spec = buildNursery1Spec(activity);
  if (spec) NURSERY_1_OTHER_WEEKS[spec.activityId] = spec;
}

const LESSON_SPECS: Readonly<Record<string, InteractiveLessonSpec>> = {
  ...NURSERY_1_OTHER_WEEKS,
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

  const buildRequired = isBuildRequired(activity.coreParts);
  const buildEvidence = spec.steps.build.evidence.toLowerCase();
  if (buildRequired && /optional|not a core|no evidence is required/.test(buildEvidence)) return false;
  if (!buildRequired && !/optional|not a core|no evidence is required/.test(buildEvidence)) return false;

  return true;
}

export function isReviewedInteractiveLesson(activityId: string): boolean {
  return getLessonSpec(activityId)?.status === "reviewed";
}
