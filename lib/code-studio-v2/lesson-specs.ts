import type { CurriculumActivity } from "./curriculum";
import type { StepKey } from "./lesson-gates";

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
    "Explain that instructions need to be in the right order.",
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
      instruction: "Why does the order of instructions matter when we tell a robot what to do?",
      task: "Choose the answer that explains why instructions should be in the right order.",
      evidence: "Learner selects: Do them in the right order.",
      hint: "Think about what might happen if you tried to eat breakfast before waking up.",
      fallback: "Read the answer choices aloud and let the learner point to a choice.",
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
  return spec.activityId === activity.id &&
    spec.status === "reviewed" &&
    spec.estimatedMinutes > 0 &&
    spec.objective.trim().length > 0 &&
    spec.successCriteria.length > 0 &&
    (activity.coreParts.toLowerCase().includes("build") || spec.steps.build.evidence.toLowerCase().includes("not a core"));
}
