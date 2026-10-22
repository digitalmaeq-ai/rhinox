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

/**
 * DRAFT: Nursery 1, Term 1, Week 2 "My Day Has Order". Wording follows the v3.15 row, the Teacher
 * Guide (p. 9–10) and Activity Book (p. 8–11). The Activity Book captions use "Emeka" while the
 * lesson and video use "Ayo", and its card captions differ from the Teacher Guide cards; both are
 * listed in the review sheet. The picture names below use the Teacher Guide card names.
 */
export const DRAFT_NURSERY_1_T1_W2: InteractiveLessonSpec = {
  activityId: "tmc-v3-15-nursery-1-t1-w2",
  status: "draft",
  objective: "Put three morning pictures in order (wake up, get dressed, walk to school) and act them out.",
  successCriteria: [
    "Say what must come first in the morning.",
    "Put the three morning pictures in order.",
    "Put the morning in order and act it out, as observed by a teacher or caregiver.",
  ],
  estimatedMinutes: 15,
  accessibility: { keyboardOperable: true, touchOperable: true, reducedMotionSafe: true, textInstructionsAvailable: true },
  steps: {
    think: {
      instruction: "Ayo's morning is mixed up! He walked to school before he got dressed. What must come first?",
      task: "Say what you do in the morning before school.",
      evidence: "Learner or adult confirms the child talked about their morning; this is self-reported.",
      hint: "Think about what you do when you first wake up.",
      fallback: "A teacher or caregiver reads the story aloud; no device is needed.",
    },
    move: {
      instruction: "Act out the morning: wake up (stretch), get dressed (pull on your shirt), walk to school (march on the spot).",
      task: "Do the three actions in order. Do it three times.",
      evidence: "Learner or supervising adult confirms the actions were acted out; this is self-reported, not verified.",
      hint: "Say each step out loud as you do it.",
      fallback: "Use seated gestures or point to the cards if moving is difficult.",
    },
    code: {
      instruction: "Program Ayo's morning. Put the three picture cards in a row: wake up, get dressed, walk to school.",
      task: "Choose the cards in order, first, next, last.",
      evidence: "The on-screen row is exactly wake up, get dressed, walk to school. This checks the order on the screen only.",
      hint: "What must Ayo do before he walks to school?",
      fallback: "Use three printed or drawn cards in a row by the floor grid and let a friend act them out.",
      exercise: {
        id: "morning-routine-order-w2",
        kind: "ordering",
        prompt: "Put Ayo's morning in order.",
        instructions: "Choose the cards in order: first, next, and last.",
        hint: "Ayo gets dressed before he walks to school.",
        fallback: "Lay printed or drawn cards in a row with a teacher or caregiver.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        items: [
          { id: "wake-up", label: "Wake up" },
          { id: "get-dressed", label: "Get dressed" },
          { id: "walk-to-school", label: "Walk to school" },
        ],
        expectedOrder: ["wake-up", "get-dressed", "walk-to-school"],
        scoring: { correctPoints: 1, incorrectPoints: 0, partialCredit: false },
      },
    },
    build: {
      instruction: "Optional this week: stand cardboard Ayo on a box beside the card row.",
      task: "Optional: make or place a cardboard Ayo beside the cards.",
      evidence: "Optional this week; no evidence is required.",
      hint: "A teacher can make Ayo from cardboard beforehand.",
      fallback: "Skip it; the lesson needs no kit.",
    },
    create: {
      instruction: "Draw your morning in 3 boxes: first, next, last.",
      task: "Draw three things you do in your morning, in order.",
      evidence: "Learner or supervising adult confirms the drawing is done; this is self-reported, not image-checked.",
      hint: "Start with the first thing you do when you wake up.",
      fallback: "Arrange three objects or point to three pictures instead of drawing.",
    },
    check: {
      instruction: "A teacher or caregiver watches you put three morning pictures in order and act them out.",
      task: "Put your morning in order and act it out.",
      evidence: "Teacher or caregiver observation: puts 3 daily-routine pictures in order and acts them out. Adult-recorded; the app cannot record this itself. The Activity Book page (number the 3 pictures) is not marked.",
      hint: "Say first, next, last as you act.",
      fallback: "If no adult can watch now, choose “I will check later” so the teacher can complete the observation.",
    },
  },
};
