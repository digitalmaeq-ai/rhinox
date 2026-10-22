import type { CurriculumActivity } from "./curriculum";
import { isExerciseDefinition, type ExerciseDefinition } from "./exercise-types.ts";
import { isBuildRequired } from "./lesson-gates.ts";
type StepKey = "think" | "move" | "code" | "build" | "create" | "check";

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

export type InteractiveLessonSpec = {
  activityId: string;
  status: "reviewed";
  objective: string;
  successCriteria: readonly string[];
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
  objective: "Follow and arrange three familiar actions in the order they happen.",
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
      instruction: "Look at the three morning actions. Think about what usually happens first, next, and last.",
      task: "Say or point to what you do first in the morning.",
      evidence: "Learner identifies or communicates a plausible first action.",
      hint: "Think about what you do when you first wake up.",
      fallback: "A teacher or caregiver can describe the pictures aloud; no device is needed.",
    },
    move: {
      instruction: "Play Robot Says. Try clap, stamp, then turn. Follow each action in the order given.",
      task: "Practise the three movements, then repeat them in a different order.",
      evidence: "Learner or supervising adult confirms the movement sequence was attempted; this is self-reported evidence, not sensor verification.",
      hint: "Listen for one instruction at a time and keep the order.",
      fallback: "Use safe seated gestures or point to action cards if movement is difficult or unsuitable.",
    },
    code: {
      instruction: "Put the morning picture steps in order: wake up, brush teeth, then eat breakfast.",
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
      instruction: "Draw or arrange three pictures showing something you do every day, in order.",
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
        id: "why-sequence-order-matters",
        kind: "choice",
        prompt: "Why should we put instructions in the right order?",
        instructions: "Choose the answer that best explains a sequence.",
        hint: "Think about what must happen before you can eat breakfast.",
        fallback: "Ask a teacher or caregiver to read the choices aloud, then point to the best answer.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        options: [
          { id: "any-order", label: "We can do every action in any order." },
          { id: "right-order", label: "Some actions need to happen before others." },
          { id: "skip-first", label: "We should skip the first step." },
        ],
        correctOptionId: "right-order",
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

  const buildRequired = isBuildRequired(activity.coreParts);
  const buildEvidence = spec.steps.build.evidence.toLowerCase();
  if (buildRequired && /optional|not a core|no evidence is required/.test(buildEvidence)) return false;
  if (!buildRequired && !/optional|not a core|no evidence is required/.test(buildEvidence)) return false;

  return true;
}

export function isReviewedInteractiveLesson(activityId: string): boolean {
  return getLessonSpec(activityId)?.status === "reviewed";
}
