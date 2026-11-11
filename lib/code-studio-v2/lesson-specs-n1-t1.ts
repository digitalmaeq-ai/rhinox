// Nursery 1, Term 1, Weeks 4 to 8: interactive lessons built from the approved books alone
// (Activity Book pp. 15-29, Teacher Guide pp. 14-23). None of these weeks has a curriculum-sheet
// record, so each lesson carries its own details. Each Teacher Guide lesson has Think, Move, Code and
// Book & close, with no Build, so Build is not shown.
//
// Every lesson is written as plain data and expanded by `bookLesson` below, so the page needs no
// per-lesson code. The Code step is an ordering exercise on the screen; the Activity Book's circling
// and colouring tasks cannot be done on a screen, so they stay in the book and the Teacher Guide.
import type { InteractiveLessonSpec, LessonStepSpec, PresentationItem } from "./lesson-specs.ts";

type Item = { id: string; label: string };

type BookLessonInput = {
  week: number;
  theme: string;
  focus: string;
  objective: string;
  successCriteria: readonly [string, string, string];
  materials: string;
  practicalActivity: string;
  stretch: string;
  /** Activity Book pages: Think and Move, Code, Draw. */
  ab: readonly [number, number, number];
  /** Teacher Guide pages: lesson plan, check and support. */
  tg: readonly [number, number];
  rhinobotSays: string;
  pictureIcons: Readonly<Record<string, string>>;
  /** What the adult looks for, as in the Teacher Guide "Look for" line (a question). */
  lookFor: string;
  /** The same thing as a verb phrase, for example "puts 3 cards in order". */
  observe: string;
  practises: readonly [string, string, string];
  reflection: string;
  think: { title: string; strip?: readonly PresentationItem[]; instruction: string; task: string; hint: string };
  move: { title: string; strip: readonly PresentationItem[]; note: string; confirm: string; instruction: string; task: string; hint: string };
  code: { title: string; instruction: string; task: string; hint: string; exercise: { id: string; prompt: string; items: readonly Item[]; expectedOrder: readonly string[]; hint: string } };
  create: { title: string; note: string; confirm: string; instruction: string; task: string; hint: string };
  check: { instruction: string; task: string; hint: string; choice: { id: string; prompt: string; hint: string; options: readonly Item[]; correct: string } };
};

const NO_KIT = "This lesson needs no power, device or kit. No printer? Draw the pictures on the board or on paper.";
const CAN_T_DRAW = "Can’t draw it yet? Act it or tell it, and a grown-up draws it.";
const ACCESS = { keyboardOperable: true, touchOperable: true, textAlternative: true } as const;

function bookLesson(l: BookLessonInput): InteractiveLessonSpec {
  const id = `tmc-v3-15-nursery-1-t1-w${l.week}`;
  const [abThink, abCode, abDraw] = l.ab;
  const [tgPlan, tgCheck] = l.tg;
  const ab = (page: number) => ({ book: "activity-book", page }) as const;
  const tg = (page: number) => ({ book: "teacher-guide", page }) as const;
  const step = (s: Omit<LessonStepSpec, "fallback" | "evidence"> & { fallback?: string; evidence: string }): LessonStepSpec => ({
    fallback: "A teacher or caregiver can describe the pictures aloud; no device is needed.",
    ...s,
  });
  return {
    activityId: id,
    status: "reviewed",
    objective: l.objective,
    successCriteria: l.successCriteria,
    estimatedMinutes: 10,
    unit: {
      level: "Nursery 1",
      term: 1,
      week: l.week,
      theme: l.theme,
      focus: l.focus,
      coreParts: "Move + Code",
      masteryTarget: `Secure: ${l.objective}`,
      materials: l.materials,
      practicalActivity: l.practicalActivity,
      stretch: l.stretch,
      fallback: NO_KIT,
    },
    presentation: {
      rhinobotSays: l.rhinobotSays,
      pictureIcons: l.pictureIcons,
      teacherCheck: {
        question: l.lookFor,
        recordedText: `a teacher or caregiver said they watched you ${l.observe}. The app cannot verify who confirmed it.`,
      },
      practises: l.practises,
      reflectionPlaceholder: l.reflection,
      completionText: {
        passed: "You worked through every step and showed a grown-up what you can do. Thinking in clear steps is a foundation of computational thinking.",
        withHelp: "You went through every step with a grown-up’s help. Try the cards again another day to practise on your own.",
        awaitingTeacher: `You went through every step. A teacher or caregiver still needs to watch you ${l.observe}.`,
      },
    },
    bookSource: { activityBookLessonId: `tmc-n1-ab-t1-w${l.week}`, teacherGuideLessonId: `tmc-n1-tg-t1-w${l.week}` },
    accessibility: { keyboardOperable: true, touchOperable: true, reducedMotionSafe: true, textInstructionsAvailable: true },
    steps: {
      think: step({
        sources: [ab(abThink), tg(tgPlan)],
        presentation: { title: l.think.title, ...(l.think.strip ? { strip: l.think.strip } : {}) },
        instruction: l.think.instruction,
        task: l.think.task,
        evidence: "Learner says or points to the answer. This is adult-observed, not automatic.",
        hint: l.think.hint,
      }),
      move: step({
        sources: [ab(abThink), tg(tgPlan)],
        presentation: { title: l.move.title, strip: l.move.strip, note: l.move.note, confirmLabel: l.move.confirm },
        instruction: l.move.instruction,
        task: l.move.task,
        evidence: "Learner or supervising adult confirms the movement was done; this is self-reported evidence, not sensor verification.",
        hint: l.move.hint,
        fallback: "If moving is hard, do the steps seated or point to the picture cards with a grown-up.",
      }),
      code: step({
        sources: [tg(tgPlan), ab(abCode)],
        presentation: { title: l.code.title },
        instruction: l.code.instruction,
        task: l.code.task,
        evidence: `The interactive order is exactly ${l.code.exercise.expectedOrder.map((k) => l.code.exercise.items.find((i) => i.id === k)?.label.toLowerCase()).join(", then ")}. This checks the order on the screen only.`,
        hint: l.code.hint,
        fallback: "No device or printer? Draw the pictures on paper or the board and arrange them with a teacher or caregiver.",
        exercise: {
          id: l.code.exercise.id,
          kind: "ordering",
          prompt: l.code.exercise.prompt,
          instructions: "Choose the cards in order.",
          hint: l.code.exercise.hint,
          fallback: "Arrange printed or hand-drawn cards on a table with a teacher or caregiver.",
          evidenceMode: "automatic",
          maxAttempts: 3,
          retryPolicy: "allow-until-limit",
          pointsAvailable: 1,
          accessibility: ACCESS,
          items: l.code.exercise.items,
          expectedOrder: l.code.exercise.expectedOrder,
          scoring: { correctPoints: 1, incorrectPoints: 0, partialCredit: false },
        },
      }),
      build: {
        inBook: false,
        instruction: "This week's book lesson has no Build part, so this step is not shown.",
        task: "Nothing to do. The book lesson goes from Code to the Activity Book drawing.",
        evidence: "No evidence is required because Build is not a core part of this week's book lesson.",
        hint: "Nothing to do for this step.",
        fallback: "Skip this step; the lesson needs no kit.",
      },
      create: step({
        sources: [ab(abDraw), tg(tgPlan)],
        presentation: { title: l.create.title, heading: "Your turn to create", note: l.create.note, smallNote: CAN_T_DRAW, confirmLabel: l.create.confirm },
        instruction: l.create.instruction,
        task: l.create.task,
        evidence: "Learner or supervising adult confirms a drawing was made; this is self-reported evidence, not image verification.",
        hint: l.create.hint,
        fallback: "Can't draw yet? Act it or tell it, and a grown-up draws it.",
      }),
      check: step({
        sources: [tg(tgCheck), ab(abCode)],
        presentation: { title: "Show a grown-up what you can do" },
        instruction: l.check.instruction,
        task: l.check.task,
        evidence: `A teacher or caregiver observes whether the child ${l.observe}; this is adult-recorded evidence, not automatic verification. The picture question below is optional extra practice and is not the official check.`,
        hint: l.check.hint,
        fallback: "If no adult can watch right now, choose “I will check later” so the teacher can complete the observation.",
        exercise: {
          id: l.check.choice.id,
          kind: "choice",
          prompt: l.check.choice.prompt,
          instructions: "Choose the best answer.",
          hint: l.check.choice.hint,
          fallback: "Ask a teacher or caregiver to read the choices aloud, then point to the best answer.",
          evidenceMode: "automatic",
          maxAttempts: 3,
          retryPolicy: "allow-until-limit",
          pointsAvailable: 1,
          accessibility: ACCESS,
          options: l.check.choice.options,
          correctOptionId: l.check.choice.correct,
        },
      }),
    },
  };
}

export const NURSERY_1_T1_W4 = bookLesson({
  week: 4,
  theme: "First, Next, Last",
  focus: "Sequencing language",
  objective: "I can say what comes first, next and last.",
  successCriteria: [
    "Act out the line-up in order: stand up, walk, wave.",
    "Put 3 action cards in order under first, next and last.",
    "Use the words first, next and last to put 3 cards in order, as observed by a teacher or caregiver.",
  ],
  materials: "FIRST–NEXT–LAST strips, one per pair; action cards (stand up, walk, wave), one set per pair; the classroom door.",
  practicalActivity: "Pairs put the 3 action cards under FIRST, NEXT, LAST so Ayo says goodbye at the door. A friend-robot acts them at the door and the class checks.",
  stretch: "Order 4 cards and say first, next, last",
  ab: [15, 16, 17],
  tg: [14, 15],
  rhinobotSays: "First, next, last! Let’s help Ayo get out of the door.",
  pictureIcons: { "stand-up": "🧍", walk: "🚶", wave: "👋" },
  lookFor: "Does the child use the words first, next and last to put 3 cards in order?",
  observe: "use the words first, next and last to put 3 cards in order",
  practises: ["Using first, next and last", "Putting cards in order", "Creating a sequence"],
  reflection: "I learned that first, next and last tell the order...",
  think: {
    title: "Think about Ayo and the door",
    strip: [{ icon: "🧍", label: "First: stand up" }, { icon: "🚶", label: "Next: walk" }, { icon: "👋", label: "Last: wave" }],
    instruction: "Ayo wants to go out of the classroom door. Which step comes first? Which comes next? Which comes last?",
    task: "Hold up 1, 2 and 3 fingers for first, next and last. Then say together: “First stand up, next walk, last wave.”",
    hint: "RhinoBot remembers: we gave Ayo command cards — walk, stop, pick up.",
  },
  move: {
    title: "Play the line-up game",
    strip: [{ icon: "🧍", label: "Stand up" }, { icon: "🚶", label: "Walk" }, { icon: "👋", label: "Wave" }],
    note: "Line-up game: 3 friends act stand up, walk, wave, one after another. Everyone calls “First! Next! Last!” Who was first? Who was next? Who was last?",
    confirm: "We played the line-up game",
    instruction: "Line-up game: 3 friends stand up, walk, wave. Who was first? Who was next? Who was last?",
    task: "Act the 3 steps one after another while the class calls out first, next and last.",
    hint: "Call the words together: First! Next! Last!",
  },
  code: {
    title: "Put the steps in order",
    instruction: "Put the 3 action cards under FIRST, NEXT and LAST so Ayo says goodbye at the door.",
    task: "Choose the cards in order: first, next, last.",
    hint: "Ayo must stand up before he walks. What does he do last, at the door?",
    exercise: {
      id: "first-next-last-door",
      prompt: "Put Ayo’s steps in order.",
      items: [{ id: "stand-up", label: "Ayo stands up" }, { id: "walk", label: "Ayo walks to the door" }, { id: "wave", label: "Ayo waves at the door" }],
      expectedOrder: ["stand-up", "walk", "wave"],
      hint: "Ayo stands up first. Then he walks. What does he do last?",
    },
  },
  create: {
    title: "Draw making bread",
    note: "Draw making bread in 3 boxes: first mix, next bake, last eat. Colour the star when you can!",
    confirm: "I drew making bread in 3 boxes",
    instruction: "Draw making bread: first mix, next bake and last eat.",
    task: "Draw 3 boxes: first mix, next bake, last eat. Colour the star when you can!",
    hint: "First mix, next bake, last eat.",
  },
  check: {
    instruction: "Show a teacher or caregiver that you can use first, next and last to put 3 cards in order.",
    task: "Put 3 cards in order and say first, next and last while a teacher or caregiver watches.",
    hint: "Start with only FIRST and LAST. When that is easy, add NEXT in the middle.",
    choice: {
      id: "what-comes-last-door",
      prompt: "What does Ayo do last at the door?",
      hint: "Ayo says goodbye at the door.",
      options: [{ id: "stand-up", label: "Ayo stands up" }, { id: "wave", label: "Ayo waves at the door" }, { id: "walk", label: "Ayo walks to the door" }],
      correct: "wave",
    },
  },
});

export const NURSERY_1_T1_W5 = bookLesson({
  week: 5,
  theme: "Let’s Fix Mistakes",
  focus: "Detecting wrong order (debugging)",
  objective: "I can find the wrong step and fix it.",
  successCriteria: [
    "Play Silly Ayo: shout “Stop! Fix it!” and act the right order.",
    "Put socks, shoes and play in the right order.",
    "Find the two swapped cards in a 3-card routine and swap them back, as observed by a teacher or caregiver.",
  ],
  materials: "3-card routine sets, one per pair (for example wake up, get dressed, walk to school); socks and shoes for Silly Ayo.",
  practicalActivity: "Bug hunt in pairs: one child swaps two cards in the routine; the partner finds the two in the wrong place and swaps them back. Swap roles.",
  stretch: "Fix a 4-card routine where two cards were swapped",
  ab: [18, 19, 20],
  tg: [16, 17],
  rhinobotSays: "Mistakes help us learn. Let’s find Ayo’s mistake and fix it!",
  pictureIcons: { "put-on-socks": "🧦", "put-on-shoes": "👟", "go-out-to-play": "🛝" },
  lookFor: "Can the child find the two swapped cards in a 3-card routine and swap them back?",
  observe: "find the two swapped cards in a 3-card routine and swap them back",
  practises: ["Finding a mistake", "Fixing the order", "Checking by acting it out"],
  reflection: "I learned that mistakes help us learn...",
  think: {
    title: "Think about Ayo’s mistake",
    strip: [{ icon: "🧦", label: "Put on socks" }, { icon: "👟", label: "Put on shoes" }],
    instruction: "Silly Ayo put on his shoes before his socks! What went wrong? How can we fix it?",
    task: "Say what went wrong and how to fix it. Say together: “Mistakes are OK. We find them and we fix them.”",
    hint: "RhinoBot remembers: first, next, last!",
  },
  move: {
    title: "Play Silly Ayo",
    strip: [{ icon: "☀️", label: "Wake up" }, { icon: "👕", label: "Get dressed" }, { icon: "🚶", label: "Walk to school" }],
    note: "Watch your teacher do the 3 steps in the wrong order. Shout “Stop! Fix it!” Then act the right order together.",
    confirm: "We played Silly Ayo",
    instruction: "Silly Ayo game: watch your teacher do 3 steps in the wrong order. Shout “Stop! Fix it!” Then act the right order.",
    task: "Shout “Stop! Fix it!” at the wrong order, then act the right order.",
    hint: "Which step does not belong there? Say it, then fix it.",
  },
  code: {
    title: "Spot the mistake and fix it",
    instruction: "Ayo mixed up his cards! Put them in the right order. When a step feels silly, that card is in the wrong place.",
    task: "Choose the cards in the right order: socks, shoes, then go out to play.",
    hint: "Act it out one card at a time. Which step feels silly?",
    exercise: {
      id: "fix-the-mixed-cards",
      prompt: "Put Ayo’s cards in the right order.",
      items: [{ id: "put-on-socks", label: "Put on socks" }, { id: "put-on-shoes", label: "Put on shoes" }, { id: "go-out-to-play", label: "Go out to play" }],
      expectedOrder: ["put-on-socks", "put-on-shoes", "go-out-to-play"],
      hint: "Socks go on before shoes.",
    },
  },
  create: {
    title: "Draw the mistake and the fix",
    note: "Draw Ayo’s mistake in the Oops! box, then draw it fixed in the Fixed! box. Colour the star when you can!",
    confirm: "I drew Oops! and Fixed!",
    instruction: "Draw Ayo’s mistake, then draw it fixed.",
    task: "Draw the mistake (Oops!) and then the fix (Fixed!). Colour the star when you can!",
    hint: "What did Silly Ayo get wrong? How did you fix it?",
  },
  check: {
    instruction: "Show a teacher or caregiver that you can find the two swapped cards and swap them back.",
    task: "Find the two swapped cards in a 3-card routine and swap them back while a teacher or caregiver watches.",
    hint: "Point to card 1: “Is this first?” Then card 2, then card 3. Swap the two that are wrong.",
    choice: {
      id: "what-comes-first-socks",
      prompt: "Silly Ayo put on his shoes before his socks! What should he put on first?",
      hint: "Which one goes under the shoe?",
      options: [{ id: "put-on-shoes", label: "Put on shoes" }, { id: "put-on-socks", label: "Put on socks" }, { id: "go-out-to-play", label: "Go out to play" }],
      correct: "put-on-socks",
    },
  },
});

export const NURSERY_1_T1_W6 = bookLesson({
  week: 6,
  theme: "Do It Again!",
  focus: "Repeating steps (seed of loops)",
  objective: "I can do one move again and again (3 times).",
  successCriteria: [
    "Do clap, stamp and jump 3 times each, and show 3 fingers.",
    "Put Ayo’s claps in order: 1 time, 2 times, 3 times.",
    "Do one move 3 times using the ‘do it again’ card, as observed by a teacher or caregiver.",
  ],
  materials: "‘Do it again’ ↻ cards, 2 per group; move cards (clap, stamp, jump), one set per group; a taped jumping line (optional).",
  practicalActivity: "Groups choose one move, lay it with 2 ↻ cards and do it while the class counts.",
  stretch: "Repeat a 2-move pattern (step–clap) 3 times",
  ab: [21, 22, 23],
  tg: [18, 19],
  rhinobotSays: "Some moves happen again and again. Let’s count them with Ayo!",
  pictureIcons: { "clap-1": "1️⃣", "clap-2": "2️⃣", "clap-3": "3️⃣" },
  lookFor: "Can the child do one move 3 times using the ‘do it again’ card?",
  observe: "do one move 3 times using the ‘do it again’ card",
  practises: ["Repeating a move", "Counting times", "Using the ‘do it again’ card"],
  reflection: "I learned that I can do a move again and again...",
  think: {
    title: "Think about again and again",
    instruction: "Ayo claps, claps, claps! What does he do again and again? What do you do again and again, like brushing teeth?",
    task: "Say what you do again and again. Say together: “Again, again!”",
    hint: "RhinoBot remembers: we fixed Ayo’s mixed-up steps.",
  },
  move: {
    title: "Robot dance",
    strip: [{ icon: "👏", label: "Clap 3 times" }, { icon: "👣", label: "Stamp 3 times" }, { icon: "🦘", label: "Jump 3 times" }],
    note: "Robot dance: “Clap! Do it again! Do it again!” Then stamp 3 times and jump 3 times. Hold up 3 fingers each time and count out loud.",
    confirm: "We did the robot dance",
    instruction: "Robot dance! Clap 3 times. Stamp 3 times. Jump 3 times. Hold up 3 fingers to show how many times.",
    task: "Clap, stamp and jump 3 times each. Count out loud.",
    hint: "Count out loud and stop at 3: “1, 2, 3, stop!”",
  },
  code: {
    title: "Count Ayo’s claps",
    instruction: "Ayo says: “Clap, clap, clap!” Put the counting cards in order: 1 time, 2 times, 3 times.",
    task: "Choose the cards in order, from 1 time to 3 times.",
    hint: "Count with Ayo: 1, 2, 3.",
    exercise: {
      id: "count-the-claps",
      prompt: "Put Ayo’s claps in order.",
      items: [{ id: "clap-1", label: "Ayo claps 1 time" }, { id: "clap-2", label: "Ayo claps 2 times" }, { id: "clap-3", label: "Ayo claps 3 times" }],
      expectedOrder: ["clap-1", "clap-2", "clap-3"],
      hint: "Start with 1 time, then 2 times, then 3 times.",
    },
  },
  create: {
    title: "Draw one move 3 times",
    note: "Draw Ayo doing one move 3 times: 3 pictures the same. Colour the star when you can!",
    confirm: "I drew one move 3 times",
    instruction: "Draw Ayo doing one move 3 times: 3 pictures the same.",
    task: "Draw 3 pictures of the same move: 1 time, 2 times, 3 times. Colour the star when you can!",
    hint: "Pick one move, like clap, and draw it 3 times.",
  },
  check: {
    instruction: "Show a teacher or caregiver that you can do one move 3 times using the ‘do it again’ card.",
    task: "Do one move 3 times with the ‘do it again’ card while a teacher or caregiver watches.",
    hint: "Touch each card as you do the move: clap card, ↻, ↻. Count together. Start with one ↻ card (2 times).",
    choice: {
      id: "how-many-claps",
      prompt: "Ayo says: “Clap, clap, clap!” How many times does he clap?",
      hint: "Count each clap: 1, 2, 3.",
      options: [{ id: "two", label: "2 times" }, { id: "three", label: "3 times" }, { id: "four", label: "4 times" }],
      correct: "three",
    },
  },
});

export const NURSERY_1_T1_W7 = bookLesson({
  week: 7,
  theme: "Practice & Play: Robot Says Games",
  focus: "Practice games for Weeks 1–6 (no new concept)",
  objective: "I can play Robot Says games and fix a wrong card.",
  successCriteria: [
    "Play our robot games: Robot Says, Morning Order, the line-up, Silly Ayo and the Robot dance.",
    "Put the bread cards in order: mix flour, bake bread, eat bread.",
    "Follow 3 commands, give 2, order 3 cards and swap back two swapped cards, as observed by a teacher or caregiver.",
  ],
  materials: "All Term 1 card sets (routine, command, first–next–last, ↻); game station signs; open floor space; cut-out Ayo.",
  practicalActivity: "Groups of 4–6 rotate round 5 game stations. Card challenge in pairs: lay 3 cards, act them, swap two, then swap them back.",
  stretch: "Lay 4 cards and swap two for a friend to fix",
  ab: [24, 25, 26],
  tg: [20, 21],
  rhinobotSays: "Game time! Let’s play our robot games and catch Ayo’s silly mistakes.",
  pictureIcons: { "mix-flour": "🥣", "bake-bread": "🔥", "eat-bread": "🍞" },
  lookFor: "Does the child follow 3 commands, give 2, order 3 cards and swap back two swapped cards?",
  observe: "follow 3 commands, give 2, order 3 cards and swap back two swapped cards",
  practises: ["Following and giving commands", "Ordering cards", "Fixing a wrong card"],
  reflection: "I learned that I can catch a silly mistake...",
  think: {
    title: "Which game do you like best?",
    instruction: "Which Ayo game do you like best? Let’s play our robot games again and catch Silly Ayo’s mistakes!",
    task: "Say which robot game you like best. No new game today: we play our robot games again.",
    hint: "RhinoBot remembers: Robot Says from Week 1, and fixing a wrong card.",
  },
  move: {
    title: "Play the robot games",
    strip: [
      { icon: "🤖", label: "Robot Says" },
      { icon: "☀️", label: "Morning Order" },
      { icon: "🚪", label: "First–Next–Last line-up" },
      { icon: "🛑", label: "Silly Ayo: Stop! Fix it!" },
      { icon: "💃", label: "Robot dance" },
    ],
    note: "Groups rotate round the games. Clap to move to the next game. Can you catch Silly Ayo’s mistakes?",
    confirm: "We played the robot games",
    instruction: "Play Robot Says, Morning Order, the First–Next–Last line-up, Silly Ayo: Stop! Fix it! and the Robot dance.",
    task: "Play each game in turn. Clap to move to the next one.",
    hint: "Take turns: every child gets to be the commander once.",
  },
  code: {
    title: "Catch Silly Ayo!",
    instruction: "Silly Ayo swapped 2 cards! Put the bread cards back in the right order.",
    task: "Choose the cards in order: mix flour, bake bread, eat bread.",
    hint: "Say it out loud: “first…, next…, last…”. Which one sounds silly?",
    exercise: {
      id: "bread-cards-fix",
      prompt: "Put the bread cards back in order.",
      items: [{ id: "mix-flour", label: "Mix flour" }, { id: "bake-bread", label: "Bake bread" }, { id: "eat-bread", label: "Eat bread" }],
      expectedOrder: ["mix-flour", "bake-bread", "eat-bread"],
      hint: "You bake bread before you eat it.",
    },
  },
  create: {
    title: "Draw your favourite game",
    note: "Draw your favourite Robot Says game. Or circle the game card you like best. Colour the star when you can!",
    confirm: "I drew or chose my favourite game",
    instruction: "Draw your favourite Robot Says game.",
    task: "Draw your favourite game, or circle the game card you like best. Colour the star when you can!",
    hint: "Think about which game made you smile.",
  },
  check: {
    instruction: "Show a teacher or caregiver that you can follow 3 commands, give 2, order 3 cards and swap back two swapped cards.",
    task: "Play the card challenge while a teacher or caregiver watches: order 3 cards, then swap back two swapped cards.",
    hint: "Play with 2 cards first, then 3. Do the moves beside a grown-up, then try alone.",
    choice: {
      id: "which-card-last",
      prompt: "Silly Ayo’s row: put on socks, go out to play, put on shoes. Which card should come last?",
      hint: "Ayo puts on socks, then shoes, and then he goes out.",
      options: [{ id: "put-on-socks", label: "Put on socks" }, { id: "put-on-shoes", label: "Put on shoes" }, { id: "go-out-to-play", label: "Go out to play" }],
      correct: "go-out-to-play",
    },
  },
});

export const NURSERY_1_T1_W8 = bookLesson({
  week: 8,
  theme: "Practice & Play: Pictures Tell a Story",
  focus: "Story-order practice (no new concept)",
  objective: "I can put pictures in story order and fix a wrong one.",
  successCriteria: [
    "Act out Jack and Jill in order, and shout “Fix it!” when two parts are swapped.",
    "Put Ayo’s 4 market pictures in story order.",
    "Order 3–4 story pictures, retell them and swap back two swapped pictures, as observed by a teacher or caregiver.",
  ],
  materials: "Story sets: Ayo’s market trip (4 cards) and the Jack and Jill strip, one per group; cereal-box strips and glue (optional).",
  practicalActivity: "Story circle: groups of 4–6 order a mixed-up story set and act it for the class. Then a friend swaps two cards and the group swaps them back.",
  stretch: "Retell the story in your own words with 5 pictures",
  ab: [27, 28, 29],
  tg: [22, 23],
  rhinobotSays: "Every story has an order. Let’s tell Ayo’s market story!",
  pictureIcons: { "leave-home": "🏠", "ride-bus": "🚌", "buy-bread": "🍞", "come-home": "🏡" },
  lookFor: "Can the child order 3–4 story pictures, retell them and swap back two swapped pictures?",
  observe: "order 3–4 story pictures, retell them and swap back two swapped pictures",
  practises: ["Ordering a story", "Retelling in order", "Fixing a wrong picture"],
  reflection: "I learned that every story has an order...",
  think: {
    title: "Think about Ayo’s market story",
    strip: [{ icon: "🏠", label: "Ayo leaves home" }, { icon: "🚌", label: "Ayo rides a bus" }, { icon: "🍞", label: "Ayo buys bread" }, { icon: "🏡", label: "Ayo comes home" }],
    instruction: "Look at Ayo’s trip to the market. What happens first, next and last? Now tell it back to a friend.",
    task: "Tell the story back: “First…, next…, last…”.",
    hint: "RhinoBot remembers: first, next, last, and fixing the order.",
  },
  move: {
    title: "Act out Jack and Jill",
    strip: [{ icon: "⛰️", label: "Up the hill" }, { icon: "🪣", label: "Fetch water" }, { icon: "⬇️", label: "Fall down (sit down slowly)" }, { icon: "🌀", label: "Tumble after (roll gently)" }],
    note: "Act out Jack and Jill in order. If two parts get swapped, shout “Fix it!” and act the right order.",
    confirm: "We acted out Jack and Jill",
    instruction: "Act out Jack and Jill: up the hill, fetch water, fall down (sit down slowly), tumble after (roll gently). If two parts get swapped, shout “Fix it!”",
    task: "Act each part in order. Sit down slowly and roll gently.",
    hint: "Go slowly and gently. Say each part as you act it.",
  },
  code: {
    title: "Number the story",
    instruction: "Ayo’s market story is mixed up. Put the pictures in the right order: 1, 2, 3, 4.",
    task: "Choose the pictures in story order.",
    hint: "Can Ayo bring bread home before he buys it?",
    exercise: {
      id: "market-story-order",
      prompt: "Put Ayo’s market story in order.",
      items: [{ id: "leave-home", label: "Ayo leaves home" }, { id: "ride-bus", label: "Ayo rides a bus" }, { id: "buy-bread", label: "Ayo buys bread" }, { id: "come-home", label: "Ayo comes home" }],
      expectedOrder: ["leave-home", "ride-bus", "buy-bread", "come-home"],
      hint: "Tell the story card by card: first Ayo leaves home.",
    },
  },
  create: {
    title: "Draw the end of the story",
    note: "Draw the end of Ayo’s story. What happens last? Or circle what happens last. Colour the star when you can!",
    confirm: "I drew the end of Ayo’s story",
    instruction: "Draw the end of Ayo’s story. What happens last?",
    task: "Draw what happens last in Ayo’s story. Colour the star when you can!",
    hint: "Ayo bought the bread. What does he do last?",
  },
  check: {
    instruction: "Show a teacher or caregiver that you can order story pictures, retell them and swap back two swapped pictures.",
    task: "Order the story pictures, retell the story and fix two swapped pictures while a teacher or caregiver watches.",
    hint: "Use 3 cards instead of 4. Tell the story first, then lay the cards as you retell it.",
    choice: {
      id: "what-happens-last",
      prompt: "What happens last in Ayo’s market story?",
      hint: "Ayo has his bread now. Where does he go?",
      options: [{ id: "ride-bus", label: "Ayo rides a bus" }, { id: "come-home", label: "Ayo comes home" }, { id: "buy-bread", label: "Ayo buys bread" }],
      correct: "come-home",
    },
  },
});

export const NURSERY_1_T1_BOOK_ONLY_LESSONS: readonly InteractiveLessonSpec[] = [
  NURSERY_1_T1_W4, NURSERY_1_T1_W5, NURSERY_1_T1_W6, NURSERY_1_T1_W7, NURSERY_1_T1_W8,
];
