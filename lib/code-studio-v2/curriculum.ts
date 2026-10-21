/**
 * Verified curriculum records for Rhinox Code Studio V2.
 *
 * This first vertical slice contains one record copied from the v3.15 Master
 * Matrix. Add more records only through the validated workbook import process.
 * Do not infer official alignment from an exercise title or free-text lesson tag.
 */
export type CurriculumActivity = {
  id: string;
  curriculumVersion: "3.15";
  level: string;
  term: number;
  week: number;
  weekType: string;
  theme: string;
  focus: string;
  strand: "CT" | "RB" | "ED" | "AI";
  think: string;
  move: string;
  code: string;
  build: string;
  create: string;
  practicalActivity: string;
  weeklyCheck: string;
  masteryTarget: string;
  priorLearning: string;
  futureBridge: string;
  assessmentEvidence: string;
  platform: string;
  coreParts: string;
  stretch: string;
  fallback: string;
};

export const CURRICULUM_ACTIVITIES: readonly CurriculumActivity[] = [
  {
    id: "tmc-v3-15-nursery-1-t1-w1",
    curriculumVersion: "3.15",
    level: "Nursery 1",
    term: 1,
    week: 1,
    weekType: "Themed learning",
    theme: "I Can Do Things in Steps",
    focus: "Thinking in steps",
    strand: "CT",
    think: "Look at pictures of a child getting ready for school. What happens first? What happens next?",
    move: "‘Robot Says’: children follow clap → stamp → turn in the order given, then in a new order.",
    code: "Put 3 picture cards in order: wake up → brush teeth → eat breakfast.",
    build: "Optional this week (not an Engineering & Making week).",
    create: "Draw three steps of something you do every day.",
    practicalActivity: "Three-step body game: the teacher (later a confident child) gives the steps; everyone follows in order. Giving commands comes in Week 3.",
    weeklyCheck: "Observation: follows a 3-step instruction. Activity Book page (not marked): circle what comes first; match step to picture; order 3 cards.",
    masteryTarget: "Secure: I can follow 3 steps in order.",
    priorLearning: "Home routines (getting ready for school); no prior coding",
    futureBridge: "T1 W2 My Day Has Order and W4 First, Next, Last; the W12 checklist (orders 3 steps); Nursery 2 ‘sequence 3–5 picture cards’.",
    assessmentEvidence: "Teacher observation + task evidence",
    platform: "Picture command cards; taped floor grid; cardboard Ayo (teacher-made); big blocks and boxes (almost no cost).",
    coreParts: "Move + Code",
    stretch: "Follow 4 steps",
    fallback: "Fully unplugged: needs no power, device or kit (cards, tape, boxes).",
  },
] as const;

export function getCurriculumActivity(id: string): CurriculumActivity | undefined {
  return CURRICULUM_ACTIVITIES.find((activity) => activity.id === id);
}
