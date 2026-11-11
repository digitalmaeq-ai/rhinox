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

/**
 * Nursery 1, Term 1, Week 2 "My Day Has Order".
 * Built from the approved books (Activity Book pp. 9-11, Teacher Guide pp. 10-11), not from the
 * curriculum sheet or the older draft. The Teacher Guide lesson has Think, Move, Code and Book &
 * close; it has no Build, so the Build step is not shown.
 * The books name the morning pictures slightly differently (Activity Book: "puts on his uniform" and
 * "putting on his shirt"; Teacher Guide: "get dressed"). The page uses "gets dressed", which fits both.
 */
const NURSERY_1_T1_W2: InteractiveLessonSpec = {
  activityId: "tmc-v3-15-nursery-1-t1-w2",
  status: "reviewed",
  objective: "I can put my morning in order.",
  successCriteria: [
    "Act out the morning in order: wake up, get dressed, walk to school.",
    "Put Ayo's morning pictures in order: wakes up, gets dressed, walks to school.",
    "Put 3 daily-routine pictures in order and act them out, as observed by a teacher or caregiver.",
  ],
  estimatedMinutes: 10,
  presentation: {
    rhinobotSays: "Last week we did 3 steps in order. Now let’s put Ayo’s morning in order!",
    pictureIcons: { "wake-up": "☀️", "get-dressed": "👕", "walk-to-school": "🚶" },
    teacherCheck: {
      question: "Can the child put 3 daily-routine pictures in order and act them out?",
      recordedText: "a teacher or caregiver said they watched you put 3 morning pictures in order and act them out. The app cannot verify who confirmed it.",
    },
    practises: ["Putting a daily routine in order", "Using the words before and after", "Creating a sequence"],
    reflectionPlaceholder: "I learned that my morning has an order...",
    completionText: {
      passed: "You put Ayo’s morning in order, acted it out and showed a grown-up what you can do. Putting steps in the right order is a foundation of computational thinking.",
      withHelp: "You went through every step with a grown-up’s help. Try the morning cards again another day to practise on your own.",
      awaitingTeacher: "You went through every step. A teacher or caregiver still needs to watch you put the morning in order and act it out.",
    },
  },
  bookSource: { activityBookLessonId: "tmc-n1-ab-t1-w2", teacherGuideLessonId: "tmc-n1-tg-t1-w2" },
  accessibility: {
    keyboardOperable: true,
    touchOperable: true,
    reducedMotionSafe: true,
    textInstructionsAvailable: true,
  },
  steps: {
    think: {
      sources: [{ book: "activity-book", page: 9 }, { book: "teacher-guide", page: 10 }],
      presentation: {
        title: "Think about Ayo’s morning",
        strip: [{ icon: "☀️", label: "Ayo wakes up" }, { icon: "👕", label: "Ayo gets dressed" }, { icon: "🚶", label: "Ayo walks to school" }],
      },
      instruction: "Silly Ayo walked to school before he got dressed! Ayo’s morning is mixed up. What must come first?",
      task: "Say what you do in the morning before school. Then say together: “Wake up, get dressed, walk to school.”",
      evidence: "Learner says or points to what comes first, next and last. This is adult-observed, not automatic.",
      hint: "RhinoBot asks: what do you do in the morning before school?",
      fallback: "A teacher or caregiver can describe the pictures aloud; no device is needed.",
    },
    move: {
      sources: [{ book: "activity-book", page: 9 }, { book: "teacher-guide", page: 10 }],
      presentation: {
        title: "Act out the morning",
        strip: [{ icon: "🙆", label: "Wake up (stretch)" }, { icon: "👕", label: "Get dressed (pull on your shirt)" }, { icon: "🚶", label: "Walk to school (march on the spot)" }],
        note: "Ask a grown-up to call the steps: “Wake up! Get dressed! Walk to school!” Do the morning 3 times. What comes after get dressed?",
        confirmLabel: "I acted out my morning",
      },
      instruction: "Act out the morning: wake up (stretch) → get dressed (pull on your shirt) → walk to school (march on the spot).",
      task: "Do the three actions in order. Do it 3 times.",
      evidence: "Learner or supervising adult confirms the morning was acted out; this is self-reported evidence, not sensor verification.",
      hint: "Say each step out loud as you do it.",
      fallback: "If moving is hard, do the steps seated or point to the picture cards with a grown-up.",
    },
    code: {
      sources: [{ book: "teacher-guide", page: 10 }, { book: "activity-book", page: 10 }],
      presentation: { title: "Put the morning pictures in order" },
      instruction: "Lay the 3 morning cards in a row. Point to each one and say “first, next, last”.",
      task: "Put the cards in order: Ayo wakes up, Ayo gets dressed, Ayo walks to school.",
      evidence: "The interactive sequence is exactly wake up, get dressed, walk to school. This checks the order on the screen only.",
      hint: "What must Ayo do before he walks to school?",
      fallback: "No device or printer? Draw the 3 morning pictures on paper or the board and arrange them with a teacher or caregiver.",
      exercise: {
        id: "morning-order-w2",
        kind: "ordering",
        prompt: "Put Ayo's morning pictures in order.",
        instructions: "Choose the cards in order: first, next and last.",
        hint: "Ayo gets dressed before he walks to school.",
        fallback: "Arrange printed or hand-drawn cards on a table with a teacher or caregiver.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        items: [
          { id: "wake-up", label: "Ayo wakes up" },
          { id: "get-dressed", label: "Ayo gets dressed" },
          { id: "walk-to-school", label: "Ayo walks to school" },
        ],
        expectedOrder: ["wake-up", "get-dressed", "walk-to-school"],
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
      sources: [{ book: "activity-book", page: 11 }, { book: "teacher-guide", page: 10 }],
      presentation: {
        title: "Draw your morning",
        heading: "Your turn to create",
        note: "Draw your morning in 3 boxes: first, next, last. Colour the star when you can!",
        smallNote: "Can’t draw yet? Act it or tell it, and a grown-up draws it.",
        confirmLabel: "I drew my morning in 3 boxes",
      },
      instruction: "Draw your morning in 3 boxes: first, next and last.",
      task: "Draw three things you do in your morning, in order. Colour the star when you can!",
      evidence: "Learner or supervising adult confirms a sequence was created; this is self-reported evidence, not image verification.",
      hint: "Start with the first thing you do when you wake up.",
      fallback: "Can't draw yet? Act it or tell it, and a grown-up draws it.",
    },
    check: {
      sources: [{ book: "teacher-guide", page: 11 }, { book: "activity-book", page: 10 }],
      presentation: { title: "Show a grown-up what you can do" },
      instruction: "Show a teacher or caregiver that you can put 3 morning pictures in order and act them out.",
      task: "Put the 3 morning pictures in order and act them out while a teacher or caregiver watches.",
      evidence: "A teacher or caregiver observes whether the child puts 3 daily-routine pictures in order and acts them out; this is adult-recorded evidence, not automatic verification. The picture question below is optional extra practice and is not the official check.",
      hint: "Start with 2 cards (wake up, get dressed), then add walk to school. Act each card as you lay it down.",
      fallback: "If no adult can watch right now, choose “I will check later” so the teacher can complete the observation.",
      exercise: {
        id: "morning-what-comes-after",
        kind: "choice",
        prompt: "What comes after get dressed? Choose the picture.",
        instructions: "Choose the picture that comes after Ayo gets dressed.",
        hint: "Ayo gets dressed, then he goes to school.",
        fallback: "Ask a teacher or caregiver to read the choices aloud, then point to the best answer.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        options: [
          { id: "wake-up", label: "Ayo wakes up" },
          { id: "walk-to-school", label: "Ayo walks to school" },
          { id: "get-dressed", label: "Ayo gets dressed" },
        ],
        correctOptionId: "walk-to-school",
      },
    },
  },
};

/**
 * Nursery 1, Term 1, Week 3 "I Can Give Instructions".
 * Built from the approved books alone (Activity Book pp. 12-14, Teacher Guide pp. 12-13). There is no
 * curriculum-sheet record for this week; the `unit` block carries what the page needs. The Teacher
 * Guide lesson has Think, Move, Code and Book & close; it has no Build, so Build is not shown.
 * The Activity Book asks the child to circle the stop picture and the 2 commands Ayo needs. The page
 * splits that: the Code step orders the 2 commands (walk, then pick up) and the optional extra
 * practice asks which picture means stop.
 */
const NURSERY_1_T1_W3: InteractiveLessonSpec = {
  activityId: "tmc-v3-15-nursery-1-t1-w3",
  status: "reviewed",
  objective: "I can give a friend-robot clear commands.",
  successCriteria: [
    "Play Robot Says in pairs: give a friend 2 commands and do only what is said.",
    "Choose the 2 commands that get Ayo to the ball: walk, then pick up.",
    "Give a friend-robot 2 clear commands that it can follow, as observed by a teacher or caregiver.",
  ],
  estimatedMinutes: 10,
  unit: {
    level: "Nursery 1",
    term: 1,
    week: 3,
    theme: "I Can Give Instructions",
    focus: "Directing like a robot; listening carefully",
    coreParts: "Move + Code",
    masteryTarget: "Secure: I can give a friend-robot clear commands.",
    materials: "Command cards (walk, stop, clap, pick up); a soft toy or ball to rescue; pictures of a washing machine, lift and gate; open floor space.",
    practicalActivity: "Toy rescue: a commander gives 2 clear commands to guide a friend-robot to the toy. Swap roles.",
    stretch: "Give 3 commands in a row",
    fallback: "This lesson needs no power, device or kit. No printer? Draw the command pictures on the board or on paper.",
  },
  presentation: {
    rhinobotSays: "Robots do only what we tell them. Let’s give Ayo clear commands!",
    pictureIcons: { walk: "🚶", "pick-up": "🤲" },
    teacherCheck: {
      question: "Can the child give a friend-robot 2 clear commands that it can follow?",
      recordedText: "a teacher or caregiver said they watched you give a friend-robot 2 clear commands. The app cannot verify who confirmed it.",
    },
    practises: ["Giving clear commands", "Listening carefully", "Guiding a friend-robot"],
    reflectionPlaceholder: "I learned that a robot does only what I tell it...",
    completionText: {
      passed: "You chose clear commands, guided a friend-robot and showed a grown-up what you can do. Giving clear instructions is a foundation of computational thinking.",
      withHelp: "You went through every step with a grown-up’s help. Try the command cards again another day to practise on your own.",
      awaitingTeacher: "You went through every step. A teacher or caregiver still needs to watch you give a friend-robot 2 clear commands.",
    },
  },
  bookSource: { activityBookLessonId: "tmc-n1-ab-t1-w3", teacherGuideLessonId: "tmc-n1-tg-t1-w3" },
  accessibility: {
    keyboardOperable: true,
    touchOperable: true,
    reducedMotionSafe: true,
    textInstructionsAvailable: true,
  },
  steps: {
    think: {
      sources: [{ book: "activity-book", page: 12 }, { book: "teacher-guide", page: 12 }],
      presentation: {
        title: "Think about instructions",
        strip: [{ icon: "🧺", label: "Washing machine" }, { icon: "🛗", label: "Lift" }, { icon: "🚪", label: "School gate" }],
      },
      instruction: "If you just say “Go!”, where will Ayo go? Which words help a robot? A washing machine, a lift and a gate follow instructions too.",
      task: "Say which words would help Ayo know what to do. People tell machines what to do, and we only press their buttons with a grown-up.",
      evidence: "Learner says or points to words that would help a robot. This is adult-observed, not automatic.",
      hint: "RhinoBot remembers: steps go in order.",
      fallback: "A teacher or caregiver can show the pictures and read them aloud; no device is needed.",
    },
    move: {
      sources: [{ book: "activity-book", page: 12 }, { book: "teacher-guide", page: 12 }],
      presentation: {
        title: "Play Robot Says in pairs",
        strip: [{ icon: "🚶", label: "Walk" }, { icon: "🛑", label: "Stop" }, { icon: "👏", label: "Clap" }, { icon: "🤲", label: "Pick up" }],
        note: "Give your friend 2 commands, like “walk 2 steps, clap”. Your friend does only what you say. Then swap.",
        confirmLabel: "We played Robot Says",
      },
      instruction: "Robot Says in pairs: give your friend 2 commands, like “walk 2 steps, clap”. Your friend does only what you say.",
      task: "Give your friend 2 commands. The friend-robot does only those. Swap after each turn.",
      evidence: "Learner or supervising adult confirms Robot Says was played; this is self-reported evidence, not sensor verification.",
      hint: "Say each command clearly, one at a time.",
      fallback: "If moving is hard, give the commands seated or point to the command cards with a grown-up.",
    },
    code: {
      sources: [{ book: "teacher-guide", page: 12 }, { book: "activity-book", page: 13 }],
      presentation: { title: "Help Ayo get the ball" },
      instruction: "Help Ayo get the ball. Which 2 commands does he need? Act each command with a grown-up first.",
      task: "Choose the 2 commands that get Ayo to the ball: first walk, then pick up.",
      evidence: "The interactive order is exactly walk, then pick up. This checks the order on the screen only.",
      hint: "Ayo must walk to the ball before he can pick it up.",
      fallback: "No device or printer? Draw the command pictures on paper or the board and choose the 2 commands with a teacher or caregiver.",
      exercise: {
        id: "get-the-ball-commands",
        kind: "ordering",
        prompt: "Put the 2 commands in order so Ayo gets the ball.",
        instructions: "Choose the commands in order: first and then.",
        hint: "Ayo must walk to the ball before he can pick it up.",
        fallback: "Lay two printed or hand-drawn command cards in a row with a teacher or caregiver.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        items: [
          { id: "walk", label: "Walk" },
          { id: "pick-up", label: "Pick up" },
        ],
        expectedOrder: ["walk", "pick-up"],
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
      sources: [{ book: "activity-book", page: 14 }, { book: "teacher-guide", page: 12 }],
      presentation: {
        title: "Draw Ayo and the toy",
        heading: "Your turn to create",
        note: "Draw Ayo reaching the toy and the commands you gave him. Then circle the commands you gave. Colour the star when you can!",
        smallNote: "Can’t draw it yet? Act it or tell it, and a grown-up draws it.",
        confirmLabel: "I drew Ayo reaching the toy",
      },
      instruction: "Draw Ayo reaching the toy and the commands you gave him.",
      task: "Draw Ayo reaching the toy, then circle the commands you gave him. Colour the star when you can!",
      evidence: "Learner or supervising adult confirms a drawing was made; this is self-reported evidence, not image verification.",
      hint: "Look at your command cards. Which commands did you give Ayo?",
      fallback: "Can't draw yet? Act it or tell it, and a grown-up draws it.",
    },
    check: {
      sources: [{ book: "teacher-guide", page: 13 }, { book: "activity-book", page: 13 }],
      presentation: { title: "Show a grown-up what you can do" },
      instruction: "Show a teacher or caregiver that you can give a friend-robot 2 clear commands.",
      task: "Give a friend-robot 2 clear commands while a teacher or caregiver watches. Say the words, like walk or pick up.",
      evidence: "A teacher or caregiver observes whether the child gives a friend-robot 2 clear commands that it can follow; this is adult-recorded evidence, not automatic verification. The picture question below is optional extra practice and is not the official check.",
      hint: "Hold the command cards and say each word. Start with 1 command, then 2.",
      fallback: "If no adult can watch right now, choose “I will check later” so the teacher can complete the observation.",
      exercise: {
        id: "which-picture-means-stop",
        kind: "choice",
        prompt: "Which picture means stop?",
        instructions: "Choose the command that means stop.",
        hint: "Stop means do not move.",
        fallback: "Ask a teacher or caregiver to read the choices aloud, then point to the best answer.",
        evidenceMode: "automatic",
        maxAttempts: 3,
        retryPolicy: "allow-until-limit",
        pointsAvailable: 1,
        accessibility: { keyboardOperable: true, touchOperable: true, textAlternative: true },
        options: [
          { id: "walk", label: "Walk" },
          { id: "stop", label: "Stop" },
          { id: "clap", label: "Clap" },
          { id: "pick-up", label: "Pick up" },
        ],
        correctOptionId: "stop",
      },
    },
  },
};

const LESSON_SPECS: Readonly<Record<string, InteractiveLessonSpec>> = {
  [NURSERY_1_T1_W1.activityId]: NURSERY_1_T1_W1,
  [NURSERY_1_T1_W2.activityId]: NURSERY_1_T1_W2,
  [NURSERY_1_T1_W3.activityId]: NURSERY_1_T1_W3,
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
