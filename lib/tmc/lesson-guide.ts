/**
 * "Do it together": the screen-free 40-minute lesson from the Nursery 1 Teacher Guide, shown on the
 * week page. The wording is the Teacher Guide's own (approved book, source of truth); only layout
 * changes here. A week appears only when its text has been copied and checked against the book.
 * Plain data with no imports so tests can load it directly.
 */
export type LessonPartName = "Think" | "Move" | "Code" | "Book & close";

export interface LessonPart {
  name: LessonPartName;
  minutes: number;
  text: string;
}

export interface LessonGuide {
  term: 1 | 2 | 3;
  week: number;
  title: string;
  goal: string;
  words: string;
  youNeed: string;
  parts: readonly [LessonPart, LessonPart, LessonPart, LessonPart];
}

export const LESSON_GUIDES: readonly LessonGuide[] = [
  {
    term: 1,
    week: 1,
    title: "I Can Do Things in Steps",
    goal: "Children follow a 3-step instruction in the right order.",
    words: "step · first · next · last · order",
    youNeed:
      "3 morning picture cards per group (wake up, brush teeth, eat breakfast). Open floor space. Cut-out Ayo if you have one. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Hold up the 3 morning cards in the wrong order. Ask: “What does Ayo do first? Next? Last?” Move the cards into order as the children answer. Say together: “First wake up, next brush teeth, last eat.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Play Robot Says. Say “Clap, stamp, turn!” and everyone does it in that order. Change the order: “Turn, clap, stamp!” Go slowly and pause before “Go!” After 3 rounds, let a confident child give the steps.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Groups of 4–6 get one card set. Each group lays the 3 cards in a row and points to each one, saying “first, next, last”. Walk round and ask each group to show you. Then mix their cards and let them fix the order.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children circle what comes first and match 1, 2, 3 to the pictures, then draw 3 steps of something they do every day. Close with one last Robot Says: 3 steps, everyone together.",
      },
    ],
  },
  {
    term: 1,
    week: 2,
    title: "My Day Has Order",
    goal: "Children put 3 daily-routine pictures in order and act them out.",
    words: "morning · routine · order · before · after",
    youNeed:
      "Morning cards (wake up, get dressed, walk to school), one set per group of 4. Taped floor grid. Cut-out Ayo if you have one. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Say: “Silly Ayo walked to school before he got dressed!” Ask: “What must come first?” Let 3–4 children tell what they do in the morning before school. Say together: “Wake up, get dressed, walk to school.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Act out the morning together. “Wake up!” (stretch) “Get dressed!” (pull on a shirt) “Walk to school!” (march on the spot). Do it 3 times. Ask: “What comes after get dressed?”",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Groups of 4: one child lays the 3 cards in a row by the floor grid, two act them as Ayo, one checks the order. Say “Swap!” and change roles. Walk round and ask: “What comes before walk to school?”",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children number the 3 morning pictures, then draw their own morning in 3 boxes: first, next, last. Close: act the morning once more, everyone together.",
      },
    ],
  },
  {
    term: 1,
    week: 3,
    title: "I Can Give Instructions",
    goal: "Children give a friend-robot 2 clear commands it can follow.",
    words: "instruction · command · listen · robot · stop · machine",
    youNeed:
      "Command cards (walk, stop, clap, pick up). A soft toy or ball to rescue. Pictures of a washing machine, lift and gate. Open floor space. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Stand cut-out Ayo in front. Say only “Go!” Ask: “Where will Ayo go? He doesn’t know!” Show the washing machine, lift and gate: “People tell machines what to do. We only press their buttons with a grown-up.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Robot Says in pairs. Model it first with one child. One child gives 2 commands: “Walk 2 steps, clap.” The friend-robot does only what is said. Swap after each turn.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Hold up each card as you say it: walk, stop, clap, pick up. Toy rescue: a commander gives 2 clear commands to guide a friend-robot to the toy. Ask the class: “Was that clear?” Swap.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children circle ‘stop’ and the 2 commands that get Ayo to the ball, then draw Ayo reaching the toy and circle the commands they gave. Close: the class gives you 2 commands; do only what they say.",
      },
    ],
  },
];

export function lessonGuideFor(term: number, week: number): LessonGuide | undefined {
  return LESSON_GUIDES.find((guide) => guide.term === term && guide.week === week);
}

/** "term-week" keys of the weeks that have a guide, for pages that only need to know whether one exists. */
export function lessonGuideKeys(): string[] {
  return LESSON_GUIDES.map((guide) => `${guide.term}-${guide.week}`);
}
