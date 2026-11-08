/**
 * Interactive RhinoBot lessons for Think • Move • Code! Nursery 1 (Terms 1 to 3, Weeks 1 to 13).
 *
 * Every lesson is built from two things:
 *   1. the week's own v3.15 curriculum record, which supplies the Think, Move, Code, Build and
 *      Create wording, and
 *   2. the small authored table below, which supplies the picture-order task, the practice
 *      question, the hints and the words the screen shows for that week.
 *
 * Rules that keep these lessons honest (they match the Week 1 lesson):
 *   - The picture-order task is scored by the app. Movement, building and drawing are the
 *     learner's own confirmation, and the weekly check is a teacher or caregiver observation.
 *   - The practice question is extra practice. It never counts as the official check.
 *   - Build is optional unless the week's core parts include Build.
 *
 * Term 1 Week 1 is written by hand in lesson-specs.ts and is not repeated here.
 */
import type { CurriculumActivity } from "./curriculum.ts";
import type { InteractiveLessonSpec, LessonDisplay, LessonStepSpec } from "./lesson-specs.ts";
import type { ChoiceExercise, OrderingExercise } from "./exercise-types.ts";
import { isBuildRequired } from "./lesson-gates.ts";

/** [label, emoji] for a picture card. */
type Card = readonly [string, string];

type WeekAuthoring = {
  term: 1 | 2 | 3;
  week: number;
  /** What the child will be able to do. */
  objective: string;
  /** Finishes "a teacher watched you …". */
  skill: string;
  /** The Teacher Guide “Look for” question, verbatim, when the guide gives one. */
  look?: string;
  /** Spoken Think task. */
  think: string;
  /** Icon and word for the Move step, in order. */
  move: readonly Card[];
  /** Replaces the curriculum Think or Move wording when it is written for the teacher. */
  thinkText?: string;
  moveText?: string;
  order: {
    title: string;
    prompt: string;
    hint: string;
    done: string;
    /** In the correct order. */
    cards: readonly Card[];
  };
  practice: {
    prompt: string;
    hint: string;
    options: readonly string[];
    /** Id of the question in the Nursery 1 Question Bank (all weeks). */
    bankId: string;
    /** Index into options. */
    answer: number;
  };
};

const W: readonly WeekAuthoring[] = [
  // ---------------------------------------------------------------- Term 1
  {
    term: 1, week: 2,
    objective: "Put three morning pictures in order (wake up, get dressed, walk to school) and act them out.",
    skill: "put your morning in order and act it out",
    look: "Can the child put 3 daily-routine pictures in order and act them out?",
    think: "Say what you do in the morning before school.",
    move: [["Wake up", "🛏️"], ["Get dressed", "👕"], ["Walk to school", "🚶"]],
    order: { title: "Put Ayo’s morning in order", prompt: "Put Ayo’s morning in order.", hint: "Ayo gets dressed before he walks to school.", done: "You put Ayo’s morning in the right order.", cards: [["Wake up", "🛏️"], ["Get dressed", "👕"], ["Walk to school", "🚶"]] },
    practice: { bankId: "N1-T1-W02-O01", prompt: "Ayo’s morning is mixed up. What must come first?", hint: "Think about what you learned this week.", options: ["Eat lunch", "Get dressed", "Wake up", "Walk to school"], answer: 2 },
  },
  {
    term: 1, week: 3,
    objective: "Give a friend-robot a clear command and match each command to its picture.",
    skill: "give a friend-robot 2 clear commands",
    look: "Can the child give a friend-robot 2 clear commands that it can follow?",
    think: "Say a clear command that a robot could follow.",
    move: [["Walk", "🚶"], ["Clap", "👏"], ["Pick up", "🧸"]],
    order: { title: "Give Ayo his commands", prompt: "Ayo must walk, stop, then pick up the toy. Put the command cards in that order.", hint: "Ayo needs to stop before he picks up the toy.", done: "You gave Ayo clear commands in the right order.", cards: [["Walk", "🚶"], ["Stop", "✋"], ["Pick up the toy", "🧸"]] },
    practice: { bankId: "N1-T1-W03-O02", prompt: "Which card means “stop”?", hint: "Think about what you learned this week.", options: ["The walking card", "The clapping card", "The hand-up card", "The ball card"], answer: 2 },
  },
  {
    term: 1, week: 4,
    objective: "Use first, next and last to put three action cards in order.",
    skill: "use first, next and last to order 3 cards",
    look: "Does the child use the words first, next and last to put 3 cards in order?",
    think: "Say what Ayo does first, next and last.",
    move: [["Stand", "🧍"], ["Walk", "🚶"], ["Wave", "👋"]],
    order: { title: "First, next, last", prompt: "Ayo says goodbye at the door. Put his cards under FIRST, NEXT and LAST.", hint: "Ayo stands up first and waves goodbye last.", done: "You put the cards in first, next, last order.", cards: [["Stand up", "🧍"], ["Walk", "🚶"], ["Wave", "👋"]] },
    practice: { bankId: "N1-T1-W04-O01", prompt: "Ayo wants to go out of the door. What does he do first?", hint: "Think about what you learned this week.", options: ["Sleep", "Walk", "Wave goodbye", "Stand up"], answer: 3 },
  },
  {
    term: 1, week: 5,
    objective: "Find a mistake in a routine and fix it by putting the steps in the right order.",
    skill: "find two swapped cards in a 3-card routine and swap them back",
    look: "Can the child find the two swapped cards in a 3-card routine and swap them back?",
    think: "Say what went wrong with Silly Ayo’s shoes.",
    move: [["Spot it", "🔎"], ["Stop!", "✋"], ["Fix it", "🔧"]],
    order: { title: "Fix Silly Ayo’s mistake", prompt: "Silly Ayo put his shoes on too early. Put the steps in the right order.", hint: "Socks go on before shoes. Laces are tied last.", done: "You fixed Silly Ayo’s mistake.", cards: [["Put on socks", "🧦"], ["Put on shoes", "👟"], ["Tie laces", "🎀"]] },
    practice: { bankId: "N1-T1-W05-O01", prompt: "Silly Ayo put on his shoes before his socks. What went wrong?", hint: "Think about what you learned this week.", options: ["He is too tall", "The order is wrong", "Nothing", "His shoes are red"], answer: 1 },
  },
  {
    term: 1, week: 6,
    objective: "Use the ‘do it again’ card to repeat one move.",
    skill: "do one move 3 times with the ‘do it again’ card",
    look: "Can the child do one move 3 times using the ‘do it again’ card?",
    think: "Say something we do again and again.",
    move: [["Clap", "👏"], ["Do it again", "🔁"], ["Do it again", "🔁"]],
    order: { title: "Use the ‘do it again’ card", prompt: "Make Ayo clap, then do it again, then stamp. Put the cards in that order.", hint: "The ‘do it again’ card goes right after the move it repeats.", done: "You used ‘do it again’ in the right place.", cards: [["Clap", "👏"], ["Do it again", "🔁"], ["Stamp", "👣"]] },
    practice: { bankId: "N1-T1-W06-O03", prompt: "Clap, ↻, ↻. How many claps is that?", hint: "Think about what you learned this week.", options: ["2", "1", "4", "3"], answer: 3 },
  },
  {
    term: 1, week: 7,
    objective: "Follow and give commands, order cards and swap back two swapped cards.",
    skill: "follow 3 commands, give 2, order 3 cards and swap back two swapped cards",
    look: "Does the child follow 3 commands, give 2, order 3 cards and swap back two swapped cards?",
    think: "Say which Robot Says game you like best.",
    move: [["Robot says", "🤖"], ["Order", "🃏"], ["Swap back", "🔄"]],
    order: { title: "Play the card game", prompt: "Your partner says: walk, clap, then stop. Lay the cards in that order.", hint: "Listen for the first word, then the next, then the last.", done: "You laid the cards in the order your partner said.", cards: [["Walk", "🚶"], ["Clap", "👏"], ["Stop", "✋"]] },
    practice: { bankId: "N1-T1-W07-O02", prompt: "Which is a clear command for a robot?", hint: "Think about what you learned this week.", options: ["“Do something.”", "“Over there!”", "“Walk two steps.”", "“Go!”"], answer: 2 },
  },
  {
    term: 1, week: 8,
    objective: "Put the pictures of Ayo’s market trip in order and retell the story.",
    skill: "order 3 to 4 story pictures, retell them and swap back two swapped pictures",
    look: "Can the child order 3–4 story pictures, retell them and swap back two swapped pictures?",
    think: "Use first, next and last to say what happens in the story.",
    move: [["Up the hill", "⛰️"], ["Fetch water", "🪣"], ["Fall down", "🤕"]],
    order: { title: "Ayo’s market trip", prompt: "Put the pictures of Ayo’s market trip in order.", hint: "Ayo leaves home first and comes home at the end.", done: "You told Ayo’s story in the right order.", cards: [["Leave home", "🏠"], ["Ride the bus", "🚌"], ["Buy bread", "🍞"], ["Come home", "🏡"]] },
    practice: { bankId: "N1-T1-W08-O01", prompt: "What happens at the beginning of Ayo’s market trip?", hint: "Think about what you learned this week.", options: ["He buys bread", "He comes home", "He leaves home", "He eats lunch"], answer: 2 },
  },
  {
    term: 1, week: 9,
    objective: "Plan three cards before moving, run them on a straight path and fix a wrong card.",
    skill: "plan 3 cards before acting, run them on a straight path and fix a wrong card",
    look: "Does the child plan 3 cards before acting, run them on a straight path and fix a wrong card?",
    think: "Say why we plan the cards before Ayo moves.",
    move: [["Forward", "⬆️"], ["Forward", "⬆️"], ["Stop", "✋"]],
    order: { title: "Plan, run, fix", prompt: "Put these steps in the order we use them with Ayo.", hint: "We plan first, then run, and fix last.", done: "You planned, ran and fixed in the right order.", cards: [["Plan the cards", "📝"], ["Run Ayo on the path", "🤖"], ["Fix a wrong card", "🔧"]] },
    practice: { bankId: "N1-T1-W09-O01", prompt: "What do we do before Ayo moves?", hint: "Think about what you learned this week.", options: ["Plan all the cards", "Run fast", "Nothing", "Go to sleep"], answer: 0 },
  },
  {
    term: 1, week: 10,
    objective: "Recall the Term 1 games: order cards, fix mistakes, repeat a move and walk a straight path.",
    skill: "order cards, fix swapped cards, use ‘do it again’ and walk a straight path at the stations",
    think: "Say what each card means: first, next or last.",
    move: [["Order", "🃏"], ["Fix", "🔧"], ["Again", "🔁"], ["Path", "➡️"]],
    order: { title: "Order from memory", prompt: "Put Ayo’s morning cards in order, from memory.", hint: "Think about what Ayo does first when he wakes up.", done: "You put the morning cards in order.", cards: [["Wake up", "🛏️"], ["Brush teeth", "🪥"], ["Eat breakfast", "🥣"]] },
    practice: { bankId: "N1-T1-W10-O01", prompt: "Wake up, brush teeth, eat breakfast. Which is first?", hint: "Think about what you learned this week.", options: ["Wake up", "Eat breakfast", "Sleep", "Brush teeth"], answer: 0 },
  },
  {
    term: 1, week: 11,
    objective: "Make a 3-card program for Ayo, check it and fix any mistake.",
    skill: "make a 3-card program for Ayo, check it and fix a mistake",
    look: "Can the team order, act, check and fix their 3-card program?",
    think: "Say what Ayo needs from us.",
    move: [["Act it", "🎭"], ["Push Ayo", "🤖"], ["Check", "🔍"]],
    order: { title: "Build Ayo’s program", prompt: "Put the project steps in order.", hint: "You lay the cards, act them, check them, then fix.", done: "You ran the project steps in the right order.", cards: [["Lay 3 cards", "🃏"], ["Act it out", "🎭"], ["Check for mistakes", "🔍"], ["Fix the mistake", "🔧"]] },
    practice: { bankId: "N1-T1-W11-O01", prompt: "What is a program for Ayo?", hint: "Think about what you learned this week.", options: ["A song", "Cards in the right order", "A sleep", "A box of toys"], answer: 1 },
  },
  {
    term: 1, week: 12,
    objective: "Show your teacher what you can do at the Term 1 stations.",
    skill: "order 3 cards, say first, next and last, do a move 3 times with ‘do it again’ and swap back two swapped cards",
    thinkText: "Take a deep breath. Today you show your teacher what you can do. There is no written test.",
    moveText: "Play one quick ‘Robot Says’ round. Then go to your station and show your teacher what you can do.",
    think: "Say that you are ready to show what you can do.",
    move: [["Robot Says", "🤖"], ["Show it", "⭐"]],
    order: { title: "Show what you know", prompt: "Station 1: put Ayo’s mixed-up morning cards in order.", hint: "Wake up comes first. Eat breakfast comes last.", done: "You put the morning cards in order.", cards: [["Wake up", "🛏️"], ["Brush teeth", "🪥"], ["Eat breakfast", "🥣"]] },
    practice: { bankId: "N1-T1-W12-O01", prompt: "Item ① (show wake up, brush teeth, eat breakfast, mixed): Which card goes first?", hint: "Think about what you learned this week.", options: ["Wake up", "Brush teeth", "Eat breakfast", "None"], answer: 0 },
  },
  {
    term: 1, week: 13,
    objective: "Show families your 3-card program and say first, next and last.",
    skill: "show families a 3-card program and say first, next and last",
    think: "Say what you can do now that you could not do at the start of term.",
    move: [["Show", "🤖"], ["Say", "🗣️"], ["Swap back", "🔄"]],
    order: { title: "Showcase day", prompt: "Put your showcase in order.", hint: "Show first, then say the words, then fix the swap.", done: "You planned your showcase in order.", cards: [["Show your cards", "🃏"], ["Say first, next, last", "🗣️"], ["Swap back two cards", "🔄"]] },
    practice: { bankId: "N1-T1-W13-O03", prompt: "What do we say when we show our program?", hint: "Think about what you learned this week.", options: ["First, next, last", "Hello, bye", "Up, down", "Red, blue"], answer: 0 },
  },
  // ---------------------------------------------------------------- Term 2
  {
    term: 2, week: 1,
    objective: "Copy and continue a red–blue pattern.",
    skill: "copy and continue an AB pattern",
    look: "Can the child copy an AB colour pattern and add the next 2 pieces on their own?",
    think: "Say what comes next in a pattern that goes again and again.",
    move: [["Red", "🟥"], ["Blue", "🟦"], ["Red", "🟥"], ["Blue", "🟦"]],
    order: { title: "Copy and continue", prompt: "Put the pattern steps in order.", hint: "Look first, then say, then lay the card, then check.", done: "You followed the pattern steps in order.", cards: [["Look at the pattern", "👀"], ["Say what repeats", "🗣️"], ["Lay the next card", "🃏"], ["Check it", "✅"]] },
    practice: { bankId: "N1-T2-W01-O01", prompt: "Ayo’s lights flash red, blue, red, blue. What comes next?", hint: "Think about what you learned this week.", options: ["Green", "Black", "Yellow", "Red"], answer: 3 },
  },
  {
    term: 2, week: 2,
    objective: "Move in a repeating two-move pattern.",
    skill: "move in a repeating 2-move pattern",
    look: "Can the child move in a repeating 2-move pattern (march, jump) and keep it going?",
    think: "Say what Ayo does after march, jump, march, jump.",
    move: [["March", "🚶"], ["Jump", "🦘"], ["March", "🚶"], ["Jump", "🦘"]],
    order: { title: "Make a dance pattern", prompt: "Put the dance steps in order.", hint: "Lay the cards, dance them, then add more.", done: "You made the dance pattern in order.", cards: [["Lay 2 move cards", "🃏"], ["Dance the pattern", "💃"], ["Add 2 more cards", "➕"]] },
    practice: { bankId: "N1-T2-W02-O01", prompt: "Ayo dances march, jump, march, jump. What comes next?", hint: "Think about what you learned this week.", options: ["Sleep", "Sit", "Jump", "March"], answer: 3 },
  },
  {
    term: 2, week: 3,
    objective: "Clap and continue a sound pattern.",
    skill: "clap and continue a sound pattern",
    look: "Can the child clap back a sound pattern and keep it going?",
    think: "Listen to Ayo’s beep–boop and say what sound comes next.",
    move: [["Clap", "👏"], ["Stamp", "👣"], ["Clap", "👏"], ["Stamp", "👣"]],
    order: { title: "Hear the pattern", prompt: "Put the listening steps in order.", hint: "Listen first, clap it back, then keep it going.", done: "You followed the sound pattern steps.", cards: [["Listen to the sound pattern", "👂"], ["Clap it back", "👏"], ["Keep it going", "🔁"]] },
    practice: { bankId: "N1-T2-W03-O01", prompt: "Ayo says beep, boop, beep, boop. What comes next?", hint: "Think about what you learned this week.", options: ["Moo", "Boop", "Clap", "Beep"], answer: 3 },
  },
  {
    term: 2, week: 4,
    objective: "Build and continue a shape pattern track.",
    skill: "build and continue a colour or shape pattern track",
    look: "Can the child build a colour or shape pattern track and add the next pieces?",
    think: "Say what comes next on Ayo’s shape road.",
    move: [["Circle", "🔵"], ["Square", "🟧"], ["Circle", "🔵"], ["Square", "🟧"]],
    order: { title: "Build the shape road", prompt: "Put the shape road steps in order.", hint: "Choose, lay, repeat, then hop.", done: "You built the shape road in order.", cards: [["Pick 2 shapes", "🔷"], ["Lay them in a row", "🃏"], ["Repeat them", "🔁"], ["Hop along the road", "🦘"]] },
    practice: { bankId: "N1-T2-W04-O01", prompt: "Circle, square, circle, square… what comes next?", hint: "Think about what you learned this week.", options: ["Star", "Triangle", "Circle", "Square"], answer: 2 },
  },
  {
    term: 2, week: 5,
    objective: "Guess what comes next in a pattern, then check.",
    skill: "predict the next item or move in a pattern",
    look: "Can the child say what comes next in a pattern before it is shown?",
    think: "Say how you know what comes next.",
    move: [["Step", "👣"], ["Clap", "👏"], ["Step", "👣"], ["Freeze", "🧊"]],
    order: { title: "Guess and check", prompt: "Put the guess-and-check steps in order.", hint: "Watch, stop to guess, say it, then check.", done: "You guessed and checked in the right order.", cards: [["Watch the pattern", "👀"], ["Stop and guess", "🤔"], ["Say what comes next", "🗣️"], ["Check with the robot", "✅"]] },
    practice: { bankId: "N1-T2-W05-O01", prompt: "Step, clap, step, clap… what comes next?", hint: "Think about what you learned this week.", options: ["Jump", "Step", "Clap", "Sleep"], answer: 1 },
  },
  {
    term: 2, week: 6,
    objective: "Sort things into groups by one rule and say the rule.",
    skill: "sort objects by one feature and say the rule",
    look: "Can the child sort objects by one feature and say the rule (“all red”)?",
    think: "Say how Ayo could put the market things into groups.",
    move: [["Red", "🔴"], ["Blue", "🔵"], ["Yellow", "🟡"]],
    order: { title: "Sort the market basket", prompt: "Put the sorting steps in order.", hint: "Look, choose a rule, sort, then say the rule.", done: "You sorted in the right order.", cards: [["Look at the things", "👀"], ["Choose one rule", "📏"], ["Sort into groups", "🧺"], ["Say your rule", "🗣️"]] },
    practice: { bankId: "N1-T2-W06-O03", prompt: "Our rule is colour. Where does a red ball go?", hint: "Think about what you learned this week.", options: ["In the bin", "Outside", "With the red things", "With the blue things"], answer: 2 },
  },
  {
    term: 2, week: 7,
    objective: "Copy and continue a pattern, say what comes next and sort by one rule.",
    skill: "copy and continue an AB pattern, say what comes next and sort by one rule",
    look: "Can the child copy and continue an AB pattern, say what comes next and sort by one rule?",
    think: "Say which pattern game you like best.",
    move: [["Line", "🧍"], ["Dance", "💃"], ["Clap", "👏"], ["Hop", "🦘"]],
    order: { title: "Fill the gap", prompt: "A partner lays a pattern with a gap. Put the steps in order.", hint: "Look, fill the gap, add more, then swap.", done: "You filled the gap and swapped in order.", cards: [["Look at the pattern", "👀"], ["Fill the gap", "🧩"], ["Add 2 more cards", "➕"], ["Swap roles", "🔄"]] },
    practice: { bankId: "N1-T2-W07-O01", prompt: "Red, blue, red, blue… what comes next?", hint: "Think about what you learned this week.", options: ["Yellow", "Red", "Blue", "Green"], answer: 1 },
  },
  {
    term: 2, week: 8,
    objective: "Make your own AB pattern for Ayo to dance.",
    skill: "copy, change and make an AB movement pattern for Ayo",
    look: "Can the child copy an AB pattern, change one part, and make their own AB pattern?",
    think: "Say how you would change one part of a pattern.",
    move: [["Copy", "🪞"], ["Change", "✏️"], ["Make", "✨"]],
    order: { title: "Make your own pattern", prompt: "Put the pattern-making steps in order.", hint: "Pick two cards, repeat them, dance, then teach.", done: "You made your own pattern in order.", cards: [["Pick 2 move cards", "🃏"], ["Repeat them 3 times", "🔁"], ["Dance the pattern", "💃"], ["Teach a friend", "🧑‍🤝‍🧑"]] },
    practice: { bankId: "N1-T2-W08-O01", prompt: "Jump, clap, jump, clap. Copy it! What comes next?", hint: "Think about what you learned this week.", options: ["Clap", "Sit", "Sleep", "Jump"], answer: 3 },
  },
  {
    term: 2, week: 9,
    objective: "Find a pattern in things around you and copy it.",
    skill: "find a pattern in familiar objects and copy it",
    look: "Can the child find a pattern in familiar objects and copy it with cards?",
    think: "Say what repeats on a striped uniform or a zebra.",
    move: [["Look", "👀"], ["Find", "🔎"], ["Copy", "🕺"]],
    order: { title: "Find and copy a pattern", prompt: "Put the pattern-hunt steps in order.", hint: "Look, find the repeat, copy it with cards, then with your body.", done: "You found and copied a pattern in order.", cards: [["Look for stripes or tiles", "🔎"], ["Find the 2-part repeat", "🔁"], ["Copy it with cards", "🃏"], ["Copy it with your body", "🕺"]] },
    practice: { bankId: "N1-T2-W09-O02", prompt: "Zebra stripes go black, white, black, white… what comes next?", hint: "Think about what you learned this week.", options: ["Green", "Black", "White", "Red"], answer: 1 },
  },
  {
    term: 2, week: 10,
    objective: "Recall Term 2: copy and continue patterns, say what comes next and sort by a rule.",
    skill: "copy and continue patterns, say what comes next and sort at the stations",
    think: "Say what comes next in the teacher’s pattern.",
    move: [["Copy", "🃏"], ["Clap", "👏"], ["Sort", "🧺"], ["Hop", "🦘"]],
    order: { title: "Pattern review", prompt: "Put the review steps in order.", hint: "Copy first, then continue, then say what comes next.", done: "You reviewed patterns in order.", cards: [["Copy the pattern", "🃏"], ["Continue it", "➕"], ["Say what comes next", "🗣️"]] },
    practice: { bankId: "N1-T2-W10-O01", prompt: "Red, blue, red, blue… what comes next?", hint: "Think about what you learned this week.", options: ["Blue", "Red", "Green", "Yellow"], answer: 1 },
  },
  {
    term: 2, week: 11,
    objective: "Make an AB dance pattern, repeat it three times and ask what comes next.",
    skill: "make an AB dance pattern, repeat it 3 times and ask what comes next",
    look: "Can the child lay an AB move pattern 3 times, dance it and say what comes next?",
    think: "Say what makes a good robot dance.",
    move: [["Dance", "💃"], ["Repeat", "🔁"], ["Ask", "❓"]],
    order: { title: "Ayo’s robot dance", prompt: "Put the dance project steps in order.", hint: "Lay the cards, dance, then ask the audience.", done: "You ran the dance project in order.", cards: [["Lay the 2 move cards 3 times", "🃏"], ["Dance the pattern", "💃"], ["Ask what comes next", "❓"]] },
    practice: { bankId: "N1-T2-W11-O01", prompt: "What makes a good robot dance?", hint: "Think about what you learned this week.", options: ["A pattern that repeats", "One move only", "No moves", "Moves in any order"], answer: 0 },
  },
  {
    term: 2, week: 12,
    objective: "Show your teacher what you can do at the Term 2 stations.",
    skill: "copy and continue an AB pattern, say what comes next, sort by one feature and make your own AB pattern",
    thinkText: "Take a deep breath. Today you show your teacher what you can do. There is no written test.",
    moveText: "Clap one quick pattern. Then go to your station and show your teacher what you can do.",
    think: "Say that you are ready to show what you can do.",
    move: [["Clap", "👏"], ["Show it", "⭐"]],
    order: { title: "Show what you know", prompt: "Put these station steps in order.", hint: "Look, copy, continue, then say.", done: "You put the station steps in order.", cards: [["Look at the pattern", "👀"], ["Copy it", "🃏"], ["Continue it", "➕"], ["Say what comes next", "🗣️"]] },
    practice: { bankId: "N1-T2-W12-O01", prompt: "Item ① (lay red, blue, red, blue): Add 2 more cards. Which card comes first?", hint: "Think about what you learned this week.", options: ["Blue", "Green", "Red", "Yellow"], answer: 2 },
  },
  {
    term: 2, week: 13,
    objective: "Show families your pattern and ask them what comes next.",
    skill: "show families a pattern strip and say what comes next",
    think: "Say what you can do now that you could not do at the start of term.",
    move: [["Show", "🃏"], ["Dance", "💃"], ["Ask", "❓"]],
    order: { title: "Showcase day", prompt: "Put your pattern showcase in order.", hint: "Show it, dance it, then ask.", done: "You planned your showcase in order.", cards: [["Show your pattern strip", "🃏"], ["Dance the pattern", "💃"], ["Ask what comes next", "❓"]] },
    practice: { bankId: "N1-T2-W13-O01", prompt: "What is our Term 2 big idea?", hint: "Think about what you learned this week.", options: ["Robots can fly", "Never try again", "Smart thinkers notice repetition", "Cats can talk"], answer: 2 },
  },
  // ---------------------------------------------------------------- Term 3
  {
    term: 3, week: 1,
    objective: "Look at a picture and say what the problem is.",
    skill: "say what Ayo’s problem is",
    look: "Can the child say what Ayo’s problem is in their own words (e.g. “The box is in the way”)?",
    think: "Say what is stopping Ayo.",
    move: [["Shoelace", "👟"], ["Door shut", "🚪"], ["Spilled water", "💧"]],
    order: { title: "Find the problem", prompt: "Put the problem-finding steps in order.", hint: "Look, find what is wrong, then say it.", done: "You found and said the problem in order.", cards: [["Look at the picture", "👀"], ["Find what is wrong", "❗"], ["Say the problem", "🗣️"]] },
    practice: { bankId: "N1-T3-W01-O01", prompt: "A big box is in Ayo’s way. He can’t get to school. What is the problem?", hint: "Think about what you learned this week.", options: ["The box is in the way", "There is no problem", "Ayo is happy", "The gate is green"], answer: 0 },
  },
  {
    term: 3, week: 2,
    objective: "Break ‘Ayo goes to the shop’ into small steps and put them in order.",
    skill: "say the small steps of ‘Ayo goes to the shop’ and then order them",
    look: "Does the child say the small steps of “Ayo goes to the shop” before choosing the cards, then put the cards in order?",
    think: "Say the small steps Ayo needs to go to the shop.",
    move: [["Leave home", "🏠"], ["Buy bread", "🍞"], ["Go home", "🏡"]],
    order: { title: "Break it small", prompt: "Put the small steps of ‘Ayo goes to the shop’ in order.", hint: "Ayo must leave home before he can buy bread.", done: "You broke the big job into small steps.", cards: [["Leave home", "🏠"], ["Buy bread", "🍞"], ["Go home", "🏡"]] },
    practice: { bankId: "N1-T3-W02-O01", prompt: "Ayo goes to the shop. What is the first small step?", hint: "Think about what you learned this week.", options: ["Go home", "Sleep", "Buy bread", "Leave home"], answer: 3 },
  },
  {
    term: 3, week: 3,
    objective: "Choose the safe way across the road and say why.",
    skill: "choose the safe way of two",
    look: "Does the child choose the safe way of two and give a reason (e.g. “Cars stop at the zebra crossing”)?",
    think: "Say which way is safe for Ayo and why.",
    move: [["Zebra crossing", "🦓"], ["Busy road", "🚗"]],
    order: { title: "Cross safely", prompt: "Put the safe crossing steps in order.", hint: "Stop, look, then cross at the zebra crossing with a grown-up.", done: "You crossed safely in the right order.", cards: [["Stop at the kerb", "✋"], ["Look both ways", "👀"], ["Cross at the zebra crossing", "🦓"]] },
    practice: { bankId: "N1-T3-W03-O01", prompt: "Ayo can cross at the zebra crossing or run across the busy road. Which is the safe way?", hint: "Think about what you learned this week.", options: ["The zebra crossing", "Cross with eyes closed", "Cross alone at night", "Run across the busy road"], answer: 0 },
  },
  {
    term: 3, week: 4,
    objective: "Try another way when the path is blocked.",
    skill: "find another route when the path is blocked",
    look: "When the path is blocked, does the child find another route (or swap in the ‘go round’ card) and walk it to test?",
    think: "Say what Ayo can try when the path is blocked.",
    move: [["Walk", "🚶"], ["Road closed", "🚧"], ["Go round", "↩️"]],
    order: { title: "Try another way", prompt: "Put Ayo’s steps in order.", hint: "Ayo walks, sees the block, chooses the go-round card, then walks round.", done: "You helped Ayo find another way.", cards: [["Walk straight", "🚶"], ["See the road closed", "🚧"], ["Choose the go-round card", "↩️"], ["Walk round the box", "🔄"]] },
    practice: { bankId: "N1-T3-W04-O01", prompt: "A box blocks Ayo’s path. What does he do?", hint: "Think about what you learned this week.", options: ["Try another way", "Kick the box", "Go to sleep", "Give up"], answer: 0 },
  },
  {
    term: 3, week: 5,
    objective: "Plan a build with step cards, then build and test it.",
    skill: "build a bridge or ramp and test it with a toy car",
    look: "Does the child help build a bridge or ramp, test it with the toy car, and use push, pull or roll?",
    think: "Say how we could help the toy car cross the river.",
    move: [["Push", "➡️"], ["Pull", "⬅️"], ["Roll", "🚗"]],
    order: { title: "Plan the build", prompt: "Put the build steps in order.", hint: "Blocks first, then the plank, then test.", done: "You planned the build in the right order.", cards: [["Stack the blocks", "🧱"], ["Lay the plank", "🪵"], ["Test with the toy car", "🚗"]] },
    practice: { bankId: "N1-T3-W05-O01", prompt: "Ayo’s car must cross the river. What can we build?", hint: "Think about what you learned this week.", options: ["A bed", "A hat", "A cake", "A bridge"], answer: 3 },
  },
  {
    term: 3, week: 6,
    objective: "Match each ‘if’ card to its ‘then’ card.",
    skill: "follow an if–then button rule",
    look: "Does the child follow the button rule (red: stop, green: walk) and match ‘if’ to ‘then’?",
    think: "Say what happens if it rains.",
    move: [["Red", "🔴"], ["Green", "🟢"], ["Rain", "🌧️"]],
    order: { title: "If this, then that", prompt: "Put the button game in order: red, then stop, then green, then walk.", hint: "Each light comes before what Ayo does.", done: "You followed the if–then rules in order.", cards: [["Show red", "🔴"], ["Ayo stops", "✋"], ["Show green", "🟢"], ["Ayo walks", "🚶"]] },
    practice: { bankId: "N1-T3-W06-O01", prompt: "If it rains, then we take…", hint: "Think about what you learned this week.", options: ["A spoon", "A sun hat", "An umbrella", "A ball"], answer: 2 },
  },
  {
    term: 3, week: 7,
    objective: "Lay a 3-card straight route, run it and fix swapped cards.",
    skill: "lay a 3-card straight route, run it and swap back two swapped cards",
    look: "Does the child lay a 3-card straight route, run it with Ayo, and swap back two cards a partner swapped?",
    think: "Say which cards help Ayo get to the market stall.",
    move: [["Forward", "⬆️"], ["Forward", "⬆️"], ["Stop", "✋"]],
    order: { title: "Help Ayo move", prompt: "Put the route steps in order.", hint: "Lay the cards, push Ayo, then fix any swap.", done: "You ran the route in the right order.", cards: [["Lay 3 route cards", "🃏"], ["Push Ayo one square per card", "🤖"], ["Swap back wrong cards", "🔄"]] },
    practice: { bankId: "N1-T3-W07-O01", prompt: "The market is 2 squares away. Which cards get Ayo there?", hint: "Think about what you learned this week.", options: ["Forward, forward, stop", "Stop, stop, stop", "Wave, wave", "Forward, stop"], answer: 0 },
  },
  {
    term: 3, week: 8,
    objective: "Plan three steps, try another way when blocked and test with a team.",
    skill: "plan 3 steps, try another way when blocked and test with a team",
    look: "Does the child plan 3 steps with the team, try another way when blocked, and test the plan?",
    think: "Say the problem, the small steps and the best way through.",
    move: [["Crawl", "🐛"], ["Walk round", "🔄"], ["Step along", "👣"]],
    order: { title: "Solve the big challenge", prompt: "Put the challenge steps in order.", hint: "Say the problem, plan, test, then fix.", done: "You solved the challenge in order.", cards: [["Say the problem", "❗"], ["Plan 3 step cards", "🃏"], ["Test with Ayo", "🤖"], ["Fix a wrong card", "🔧"]] },
    practice: { bankId: "N1-T3-W08-O01", prompt: "Before anyone moves on the course, we…", hint: "Think about what you learned this week.", options: ["Run", "Climb the boxes", "Go home", "Plan 3 steps"], answer: 3 },
  },
  {
    term: 3, week: 9,
    objective: "Say the problem, plan three small steps, stop on red and find another way.",
    skill: "say the problem, plan 3 small steps, stop on red and find another way",
    look: "Does the child say the problem, plan 3 small steps, stop on red and find another way when the road is closed?",
    think: "Say the problem Ayo has with his bread delivery.",
    move: [["Pick up", "🍞"], ["Red: stop", "🔴"], ["Go round", "↩️"]],
    order: { title: "Deliver the bread", prompt: "Put Ayo’s bread delivery in order.", hint: "He picks up the bread, walks the safe way, then gives the bread.", done: "You planned the delivery in order.", cards: [["Pick up the bread", "🍞"], ["Walk the safe way", "🚦"], ["Give the bread", "🤝"]] },
    practice: { bankId: "N1-T3-W09-O01", prompt: "Ayo must take bread to Grandma, but the road is blocked. What is the problem?", hint: "Think about what you learned this week.", options: ["The road is blocked", "There is no problem", "Grandma is happy", "The bread is yummy"], answer: 0 },
  },
  {
    term: 3, week: 10,
    objective: "Recall Term 3: break a problem small, try another way, and help Ayo move.",
    skill: "say a problem and lay 3 step cards, use the ‘go round’ card, help Ayo move and rebuild a ramp at the stations",
    think: "Say a problem and one way to solve it.",
    move: [["Break small", "🃏"], ["Go round", "↩️"], ["Move Ayo", "🤖"], ["Build", "🧱"]],
    order: { title: "Problem solving review", prompt: "Put the problem-solving steps in order.", hint: "Say the problem first, plan next, test last.", done: "You solved the problem in order.", cards: [["Say the problem", "❗"], ["Lay 3 step cards", "🃏"], ["Test it", "✅"]] },
    practice: { bankId: "N1-T3-W10-O01", prompt: "A big box is in Ayo’s way. What is the problem?", hint: "Think about what you learned this week.", options: ["No problem", "Ayo is happy", "The box is brown", "The box is in the way"], answer: 3 },
  },
  {
    term: 3, week: 11,
    objective: "Plan, build and test a ramp, then guide Ayo along a 3-card route.",
    skill: "plan, build and test a ramp or tower, then guide Ayo along a 3-card route",
    look: "Does the child help plan in 3 steps, test and fix the build, and guide Ayo with 3 cards, fixing a wrong card?",
    think: "Say Ayo’s problem, the small steps and what to do if it does not work.",
    move: [["Build", "🧱"], ["Test", "✅"], ["Guide Ayo", "🤖"]],
    order: { title: "Ayo’s ramp and route", prompt: "Put the plan cards in order: blocks, then ramp, then test.", hint: "You cannot test a ramp before you build it.", done: "You planned the ramp in order.", cards: [["Put down the blocks", "🧱"], ["Add the ramp", "🪵"], ["Test it", "✅"]] },
    practice: { bankId: "N1-T3-W11-O01", prompt: "Before we build, we…", hint: "Think about what you learned this week.", options: ["Lay the plan cards", "Climb the blocks", "Kick the ramp", "Go home"], answer: 0 },
  },
  {
    term: 3, week: 12,
    objective: "Show your teacher what you can do at the Term 3 stations.",
    skill: "say a problem and 3 small steps, find another way when blocked, change a ramp after a test and order the shop cards",
    thinkText: "Take a deep breath. Today you show your teacher what you can do. There is no written test.",
    moveText: "Play one quick ‘Robot Says’ round. Then go to your station and show your teacher what you can do.",
    think: "Say that you are ready to show what you can do.",
    move: [["Robot Says", "🤖"], ["Show it", "⭐"]],
    order: { title: "Show what you know", prompt: "Washing hands: put the small steps in order.", hint: "Tap on first. Rinse and dry last.", done: "You put the small steps in order.", cards: [["Turn on the tap", "🚰"], ["Use soap", "🧼"], ["Rinse and dry", "🧻"]] },
    practice: { bankId: "N1-T3-W12-O01", prompt: "Item ① (show the blocked-path card): What is the problem?", hint: "Think about what you learned this week.", options: ["The box is in Ayo’s way", "The box is brown", "No problem", "Ayo is happy"], answer: 0 },
  },
  {
    term: 3, week: 13,
    objective: "Show families your card route and how you fixed a mistake.",
    skill: "show families a card route and say how a mistake was fixed",
    think: "Say what you can do now that you could not do at the start of the year.",
    move: [["Run the route", "🤖"], ["Explain", "🗣️"]],
    order: { title: "Showcase day", prompt: "Put your showcase in order.", hint: "Show the ramp, run the route, then tell how you fixed it.", done: "You planned your showcase in order.", cards: [["Show your ramp", "🛝"], ["Run Ayo’s route", "🤖"], ["Say how you fixed a mistake", "🔧"]] },
    practice: { bankId: "N1-T3-W13-O01", prompt: "What is our Term 3 big idea?", hint: "Think about what you learned this week.", options: ["Robots can fly", "Cats can talk", "I can solve small problems", "Never try again"], answer: 2 },
  },
];

const PRACTISES: Record<number, readonly string[]> = {
  1: ["Putting steps in order", "Giving and following clear instructions", "Finding and fixing mistakes"],
  2: ["Spotting and continuing patterns", "Saying what comes next", "Sorting by a rule"],
  3: ["Breaking a problem into small steps", "Trying another way", "Planning, building and testing"],
};

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Removes teacher-only sentences and doubled spaces so a line can be read aloud to a child. */
function clean(text: string): string {
  return text.replace(/\s*Teacher:[\s\S]*$/, "").replace(/\s+/g, " ").trim();
}

function firstSentence(text: string): string {
  return clean(text).split(/(?<=[.!?])\s/)[0];
}

const access = { keyboardOperable: true, touchOperable: true, textAlternative: true } as const;

function buildOrdering(a: WeekAuthoring, id: string): OrderingExercise {
  const used = new Set<string>();
  const cards = a.order.cards.map(([label, icon]) => {
    let cardId = slug(label);
    while (used.has(cardId)) cardId += "-again";
    used.add(cardId);
    return { id: cardId, label, icon };
  });
  // Show the cards out of order: move the first card to the end.
  const shown = [...cards.slice(1), cards[0]];
  return {
    id: `${id}-order`,
    kind: "ordering",
    prompt: a.order.prompt,
    instructions: "Tap the cards in order: first, next, then last.",
    hint: a.order.hint,
    fallback: "Arrange printed or hand-drawn cards on a table with a teacher or caregiver.",
    evidenceMode: "automatic",
    maxAttempts: 3,
    retryPolicy: "allow-until-limit",
    pointsAvailable: 1,
    accessibility: access,
    items: shown.map(({ id: cardId, label }) => ({ id: cardId, label })),
    expectedOrder: cards.map((card) => card.id),
    scoring: { correctPoints: 1, incorrectPoints: 0, partialCredit: false },
  };
}

function buildChoice(a: WeekAuthoring, id: string): ChoiceExercise {
  const options = a.practice.options.map((label, index) => ({ id: `option-${index + 1}`, label }));
  return {
    id: `${id}-practice`,
    kind: "choice",
    prompt: a.practice.prompt,
    instructions: "Choose the best answer.",
    hint: a.practice.hint,
    fallback: "Ask a teacher or caregiver to read the choices aloud, then point to the best answer.",
    evidenceMode: "automatic",
    maxAttempts: 3,
    retryPolicy: "allow-until-limit",
    pointsAvailable: 1,
    accessibility: access,
    options,
    correctOptionId: options[a.practice.answer].id,
  };
}

function buildDisplay(a: WeekAuthoring, activity: CurriculumActivity): LessonDisplay {
  const icons: Record<string, string> = {};
  const used = new Set<string>();
  for (const [label, icon] of a.order.cards) {
    let cardId = slug(label);
    while (used.has(cardId)) cardId += "-again";
    used.add(cardId);
    icons[cardId] = icon;
  }
  const strip = (cards: readonly Card[]) => cards.map(([label, icon]) => ({ icon, label }));
  const self = `Draw, point or arrange objects. Any way of showing it counts.`;
  return {
    codeTitle: a.order.title,
    thinkStrip: strip(a.move),
    moveStrip: strip(a.move),
    moveNote: "Ask a grown-up or classmate to help. Do each action, then talk about what you did.",
    moveButton: "I tried the movement challenge",
    createHeading: "Your turn to create",
    createPrompt: clean(activity.create),
    createNote: self,
    createButton: "I finished my creation",
    checkQuestion: a.look ?? `Can the child ${a.skill} on their own?`,
    checkSkill: a.skill,
    practises: PRACTISES[a.term],
    orderingSuccess: a.order.done,
    icons,
  };
}

function buildBuildStep(activity: CurriculumActivity): LessonStepSpec {
  if (isBuildRequired(activity.coreParts)) {
    return {
      instruction: clean(activity.build),
      task: "Build the model your group planned, then test it.",
      evidence: "Learner or supervising adult confirms the model was built and tested; this is self-reported, not verified by the app.",
      hint: "Build a little, test it, then change one thing if it does not work.",
      fallback: activity.fallback,
    };
  }
  const idea = /^Optional(?: this week)?:\s*(.+)$/i.exec(clean(activity.build))?.[1];
  const useful = idea && !/^(none|nothing|no new)/i.test(idea) ? ` Idea: ${idea}` : "";
  return {
    instruction: `Building is optional this week. You can skip this step and continue.${useful}`,
    task: "Optional: make a simple model, or skip this step.",
    evidence: "No evidence is required because Build is not a core part of this week's curriculum.",
    hint: "You could use paper cards or blocks, with adult help where needed.",
    fallback: "Skip the model and continue; the core activity needs no kit.",
  };
}

/** Builds the reviewed lesson for one Nursery 1 week, or undefined when none is authored. */
export function buildNursery1Spec(activity: CurriculumActivity): InteractiveLessonSpec | undefined {
  const a = W.find((item) => item.term === activity.term && item.week === activity.week);
  if (!a || activity.level !== "Nursery 1") return undefined;
  const id = `n1-t${a.term}-w${a.week}`;
  const ordering = buildOrdering(a, id);
  const orderText = a.order.cards.map(([label]) => label).join(", then ");
  return {
    activityId: activity.id,
    status: "reviewed",
    objective: a.objective,
    successCriteria: [
      a.objective,
      `Put the cards in the right order: ${orderText}.`,
      `A teacher or caregiver observes that the child can ${a.skill}.`,
    ],
    display: buildDisplay(a, activity),
    estimatedMinutes: 15,
    accessibility: { keyboardOperable: true, touchOperable: true, reducedMotionSafe: true, textInstructionsAvailable: true },
    steps: {
      think: {
        instruction: a.thinkText ?? clean(activity.think),
        task: a.think,
        evidence: "Learner or adult confirms the child talked about the question; this is self-reported.",
        hint: "Take your time. There is no wrong answer here.",
        fallback: "A teacher or caregiver can read the pictures and questions aloud; no device is needed.",
      },
      move: {
        instruction: a.moveText ?? clean(activity.move),
        task: "Try the movement with a friend or grown-up.",
        evidence: "Learner or supervising adult confirms the movement was attempted; this is self-reported, not sensor verification.",
        hint: "Do one action at a time and keep the order.",
        fallback: "Use safe seated gestures or point to action cards if movement is difficult or unsuitable.",
      },
      code: {
        instruction: clean(activity.code),
        task: "Tap the picture cards in the correct order.",
        evidence: `The interactive order is exactly: ${orderText}. This checks the order on the screen only.`,
        hint: a.order.hint,
        fallback: "Use printed or hand-drawn cards and arrange them on a table.",
        exercise: ordering,
      },
      build: buildBuildStep(activity),
      create: {
        instruction: clean(activity.create),
        task: "Make your creation, then tell a grown-up about it.",
        evidence: "Learner or supervising adult confirms the creation is done; this is self-reported, not image verification.",
        hint: "Start with the first thing, then add the next.",
        fallback: "Arrange objects or point to symbols instead of drawing.",
      },
      check: {
        instruction: `Show a teacher or caregiver that you can ${a.skill}.`,
        task: `${a.skill.charAt(0).toUpperCase()}${a.skill.slice(1)}, while a teacher or caregiver watches.`,
        evidence: `A teacher or caregiver observes whether the child can ${a.skill}; this is adult-recorded evidence, not automatic verification. The question below is optional extra practice and is not the official check.`,
        hint: "Take it one step at a time. Practise together first, then let the child try alone.",
        fallback: "If no adult can watch right now, choose “I will check later” so the teacher can complete the observation.",
        exercise: buildChoice(a, id),
      },
    },
  };
}

/** Weeks that have an authored lesson, for tests and the review sheet. */
export const NURSERY_1_AUTHORED_WEEKS = W.map(({ term, week }) => ({ term, week }));
export { firstSentence as _firstSentenceForTests };
