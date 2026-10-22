import type { InteractiveLessonSpec } from "./lesson-specs.ts";

/**
 * DRAFT lesson specs written by a developer for curriculum review.
 * They are deliberately NOT registered in lesson-specs.ts, so getLessonSpec() cannot return them
 * and no lesson built from them can launch. A curriculum reviewer must approve the wording, the
 * missions and the evidence rules before a draft is moved into the reviewed registry with
 * status "reviewed". Wording follows the v3.15 Year 1 Term 1 Week 3 row; the start and finish
 * squares are authoring choices listed in the review sheet.
 */
export const DRAFT_YEAR1_T1_W3: InteractiveLessonSpec = {
  activityId: "tmc-v3-15-year-1-t1-w3",
  status: "draft",
  objective: "Write a precise arrow-card algorithm that takes Ilana from START to FINISH, and say what each card does.",
  successCriteria: [
    "Plan a route from START to FINISH on the grid.",
    "Write 6 to 8 arrow cards, including at least two turns, that reach FINISH (3 or 4 cards on the 4×4 support grid).",
    "Say what each card does, as observed by a teacher or caregiver.",
  ],
  estimatedMinutes: 20,
  accessibility: { keyboardOperable: true, touchOperable: true, reducedMotionSafe: true, textInstructionsAvailable: true },
  steps: {
    think: {
      instruction: "Ilana is at START. The bread seller is at FINISH, far across the market. Which squares must she pass? Which way is she facing?",
      task: "Trace the route with your finger on the grid, then say which way Ilana faces at the start.",
      evidence: "Learner traces a plausible route and names the facing direction.",
      hint: "Each arrow card means exactly one move, so Ilana can follow it without guessing.",
      fallback: "Use a paper or chalk grid and a bottle-cap token; no device is needed.",
    },
    move: {
      instruction: "Be the robot. Step one square forward for ↑, one step back for ↓ (still facing the same way), and turn on the spot for ↶ and ↷.",
      task: "Walk a short route on the floor or desk grid while a partner calls out the cards.",
      evidence: "Learner confirms they practised the moves; this is self-reported, not verified by the app.",
      hint: "A turn changes the way you face but does not move you to a new square.",
      fallback: "Move a token on an A3 paper or chalk desk grid.",
    },
    code: {
      instruction: "Choose arrow cards and put them in order to take Ilana from START to FINISH. Say what each card does before you run.",
      task: "Build a 6 to 8 card program with at least two turns (support track: 3 or 4 cards), then press Run.",
      evidence: "The app checks the run on the screen against the card and turn rules. Whether the child understood each card is for a teacher to observe.",
      hint: "Run it and watch each step. If Ilana goes the wrong way, change one card and try again.",
      fallback: "Lay physical arrow cards in a line and walk the route on the grid with a grown-up.",
    },
    build: {
      instruction: "Optional: make START and FINISH flags from card and a straw.",
      task: "Make two flags and place them on your grid.",
      evidence: "Optional this week; no evidence is required.",
      hint: "Fold the card around the straw and tape it.",
      fallback: "Draw the flags instead.",
    },
    create: {
      instruction: "Draw the grid path and the arrow cards that made it.",
      task: "Draw Ilana's path and the line of arrow cards.",
      evidence: "Learner confirms the drawing is done; this is self-reported.",
      hint: "Draw the cards in the same order you used them.",
      fallback: "Describe the path aloud to a grown-up.",
    },
    check: {
      instruction: "A teacher or caregiver watches you write a working arrow algorithm and asks what each card does.",
      task: "Show your cards, say what each one does, and point to the path.",
      evidence: "Teacher or caregiver observation: writes a 6 to 8 card algorithm that reaches FINISH (support track: 3 or 4 cards) and says what each card does. The app cannot record this itself.",
      hint: "Say it like a robot: 'forward one square, turn right, forward one square.'",
      fallback: "If no adult is available, ask for the check later; the app records it as waiting for a teacher.",
    },
  },
};
