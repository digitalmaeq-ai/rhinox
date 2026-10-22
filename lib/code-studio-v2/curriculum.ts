/**
 * Verified curriculum records for Rhinox Code Studio V2.
 *
 * This slice contains records copied from the v3.15 Master
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
  strand: "CT" | "RB" | "ED" | "AI" | null;
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
  {
    id: "tmc-v3-15-year-1-t1-w3",
    curriculumVersion: "3.15",
    level: "Year 1",
    term: 1,
    week: 3,
    weekType: "Themed learning",
    theme: "Arrow Cards on the Grid",
    focus: "Write precise arrow-card algorithms (6–8 cards) from START to FINISH on a 5×5 grid; say what each card does",
    strand: "CT",
    think: "Ilana is at START. The bread seller is at FINISH, far across the market. Which squares must she pass? Which way is she facing? An algorithm must be precise: each arrow card means exactly one move, so Ilana can follow it without guessing.",
    move: "Grid robots: one square forward per ↑, one step back per ↓ (still facing the same way), and a turn on the spot for ↶ (turn left) and ↷ (turn right). Teams practise with a token on their desk grid; two teams at a time walk it on the shared floor grid (a sticker on the left hand helps).",
    code: "Core: write a 6–8 card algorithm from START to FINISH on a 5×5 grid with at least two turns, and say what each card does before running it. Support track (children new to Think • Move • Code!): 3–4 cards on a 4×4 grid.",
    build: "Optional: make START and FINISH flags from card and a straw.",
    create: "Draw the grid path and the arrow cards that made it.",
    practicalActivity: "Teams of 3–4: planner, card-layer, robot (+ checker). The planner traces the route, the card-layer writes it in arrow cards, the robot runs it with the token on the desk grid, then on the floor grid at the team’s turn; rotate roles. Grid set-up (big class): one walk-on floor grid (tape or chalk) is shared by 8–10 learners — two teams take turns, one runs the route while the other predicts and checks; all other teams work on an A3 paper or chalk desk grid with a bottle-cap Ilana token, so nobody waits.",
    weeklyCheck: "Observation: writes a 6–8 card algorithm that reaches FINISH (support track: 3–4 cards) and says what each card does. Picture task (1–2 items): draw arrows for a path with two turns on a printed 5×5 grid.",
    masteryTarget: "Secure: I can write a precise 6–8 card arrow algorithm from START to FINISH.",
    priorLearning: "Year 1 W1–2 algorithms and exact order; Nursery 2 Term 1 W2–5 forward, back, turns, arrow cards and 3–5 card plans. New in Year 1: longer 6–8 card algorithms on a 5×5 grid, the word ‘algorithm’ and saying exactly what each card does (children new to the programme use the 3–4 card support track).",
    futureBridge: "Prepares for predicting a robot program (W4), debugging arrow paths (W6) and repeat cards in Term 3.",
    assessmentEvidence: "Observation (writes a working arrow algorithm) + picture task + photo of the card line",
    platform: "Arrow cards ↑ ↓ ↶ ↷ (↓ = one step back, still facing the same way); A3 paper or chalk desk grids 5×5 (4×4 for the support track), 1 per team, with a bottle-cap or paper Ilana token; one walk-on floor grid (tape or chalk, about 30 cm squares) per 8–10 learners, shared in rotation; routine picture cards; cardboard Ilana robot from boxes and bottle caps (1 per team, adult pre-cut from one template; base no wider than 5 cm so she fits one desk-grid square); ScratchJr on a shared tablet (Android 7-inch+, iPad or Chromebook; phones not supported) (optional, not assessed) (almost no cost).",
    coreParts: "Code + Move",
    stretch: "Reach FINISH using the fewest cards; write one algorithm that visits two stalls.",
    fallback: "Fully unplugged: needs no power, device or kit (cards, tape, boxes). No floor space? Every team uses an A3 paper or chalk desk grid with a bottle-cap token.",
  },
  {
    id: "tmc-v3-15-nursery-1-t1-w2",
    curriculumVersion: "3.15",
    level: "Nursery 1",
    term: 1,
    week: 2,
    weekType: "Themed learning",
    theme: "My Day Has Order",
    focus: "Daily-routine algorithm",
    strand: "CT",
    think: "Ayo’s morning is mixed up: he walked to school before he got dressed! What must come first? Talk about your own morning before school.",
    move: "Act out the morning in 3 steps: wake up (stretch) → get dressed (pull on shirt) → walk to school (march on the spot). Stretch: add ‘bath’ as a 4th step.",
    code: "Program Ayo’s morning: lay 3 routine picture cards in a row by the floor grid; a friend acts them out.",
    build: "Optional this week: stand cardboard Ayo on a box beside the card row.",
    create: "Draw your morning in 3 boxes: first, next, last.",
    practicalActivity: "Groups of 4: one child lays the morning cards, two act them as Ayo, one checks the order; swap roles.",
    weeklyCheck: "Observation: puts 3 daily-routine pictures in order and acts them out. Activity Book page (not marked): number the 3 morning pictures 1, 2, 3.",
    masteryTarget: "Secure: I can put my morning in order.",
    priorLearning: "T1 W1 I Can Do Things in Steps (follow 3 steps in order)",
    futureBridge: "T1 W4 First, Next, Last and W5 Let’s Fix Mistakes (fix a mixed-up routine); T3 W2 Break It Small; Nursery 2 ‘sequence 3–5 picture cards’.",
    assessmentEvidence: "Teacher observation + task evidence",
    platform: "Picture command cards; taped floor grid; cardboard Ayo (teacher-made); big blocks and boxes (almost no cost). This week also: morning-routine cards (wake up, get dressed, walk to school), one set per group of 4.",
    coreParts: "Move + Code",
    stretch: "Order 4–5 routine pictures",
    fallback: "Fully unplugged: needs no power, device or kit (cards, tape, boxes).",
  },
] as const;

export function getCurriculumActivity(id: string): CurriculumActivity | undefined {
  return CURRICULUM_ACTIVITIES.find((activity) => activity.id === id);
}
