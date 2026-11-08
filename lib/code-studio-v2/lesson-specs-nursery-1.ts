/**
 * Interactive RhinoBot lessons for Think • Move • Code! Nursery 1 (Terms 1 to 3, Weeks 2 to 13).
 *
 * Source of truth: the finished Nursery 1 Activity Book (revised, Oct 2026). Every line the child
 * sees comes from the book: the "I can" goal, the Think and Move text, the Code it! page (named
 * with its page number), the Draw it! task and the "Try it at home" note. The card pictures are cut
 * from the book's own art (public/tmc/n1/lesson-art). The adult check uses the Teacher Guide's
 * "Look for" question and the materials its "You need" list; the practice question comes from the
 * Nursery 1 Question Bank, both of which were aligned to the book on 27 Oct 2026. The v3.15
 * curriculum record is still the lesson's catalogue entry (id, core parts) but its wording is not
 * shown to the child.
 *
 * Rules that keep these lessons honest (they match the Week 1 lesson):
 *   - The picture-order task is scored by the app. Movement, building and drawing are the
 *     learner's own confirmation, and the weekly check is a teacher or caregiver observation.
 *   - The practice question is extra practice. It never counts as the official check.
 *   - Build is optional unless the week's core parts include Build.
 *   - Term 2 is about patterns, so its Code task is to continue, copy or sort a pattern, not to
 *     order process steps. Cards that look the same share a match key, so either copy counts.
 *
 * Term 1 Week 1 is written by hand in lesson-specs.ts and is not repeated here.
 */
import type { CurriculumActivity } from "./curriculum.ts";
import type { InteractiveLessonSpec, LessonDisplay, LessonStepSpec } from "./lesson-specs.ts";
import type { ChoiceExercise, OrderingExercise } from "./exercise-types.ts";
import { isBuildRequired } from "./lesson-gates.ts";

/** [label, picture, matchKey?]. A picture is a path under /tmc/n1/lesson-art or an emoji. Cards with the same matchKey are interchangeable. */
type Card = readonly [string, string] | readonly [string, string, string];

type WeekAuthoring = {
  term: 1 | 2 | 3;
  week: number;
  /** The book's "I can" line (Weeks 12–13: the My stars or badge page). */
  objective: string;
  /** Finishes "a teacher watched you …". */
  skill: string;
  /** The Teacher Guide "Look for" question. */
  look: string;
  /** Short spoken Think task. */
  think: string;
  /** The book's Think and Move text. */
  thinkText: string;
  moveText: string;
  /** Pictures for the Move step. */
  move: readonly Card[];
  /** RhinoBot's speech bubble on the book's Think & Move page. */
  rhinobot?: string;
  order: {
    /** The book's Code it! title and page. */
    title: string;
    bookPage: number;
    bookInstr: string;
    /** The screen task, written to match the book page. */
    prompt: string;
    hint: string;
    done: string;
    /** Pattern start shown above the cards (Term 2). */
    strip?: readonly Card[];
    /** In the correct order. */
    cards: readonly Card[];
  };
  /** Only for weeks whose core parts include Build: the book's build task. */
  build?: { text: string; task: string };
  /** The Teacher Guide "You need" list. */
  materials: string;
  /** The book's Draw it! task and Try it at home note. */
  create: string;
  home: string;
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
  {
    term: 1, week: 2,
    objective: "I can put my morning in order.",
    skill: "put 3 morning pictures in order and act them out",
    look: "Can the child put 3 daily-routine pictures in order and act them out?",
    think: "Say what you do in the morning before school.",
    thinkText: "Ayo’s morning is mixed up! Which picture is in the wrong place? What do you do in the morning before school?",
    moveText: "Act out the morning: wake up (stretch) → get dressed (pull on your shirt) → walk to school (march on the spot).",
    move: [["Wake up", "/tmc/n1/lesson-art/wake-up.png"], ["Get dressed", "/tmc/n1/lesson-art/get-dressed.png"], ["Walk to school", "/tmc/n1/lesson-art/walk-to-school.png"]],
    rhinobot: "Ayo’s morning is mixed up. Can you help him put it in order?",
    order: { title: "Number my morning", bookPage: 10, bookInstr: "Which picture comes first? Put 1 under it. Then put 2 and 3 under the others.", prompt: "Ayo’s morning is mixed up! Tap the pictures in order: first, next, last.", hint: "Ayo gets dressed before he walks to school.", done: "You put Ayo’s morning in the right order.", cards: [["Wake up", "/tmc/n1/lesson-art/wake-up.png"], ["Get dressed", "/tmc/n1/lesson-art/get-dressed.png"], ["Walk to school", "/tmc/n1/lesson-art/walk-to-school.png"]] },
    materials: "Morning cards (wake up, get dressed, walk to school), one set per group of 4. Taped floor grid. Cut-out Ayo if you have one. Activity Books and crayons.",
    create: "Draw your morning in 3 boxes: first, next, last.",
    home: "Tomorrow morning, ask your child: “What do we do first? Next? Last?” Let them lead the steps as you get ready.",
    practice: { bankId: "N1-T1-W02-O01", prompt: "Ayo’s morning is mixed up. What must come first?", hint: "Think about what you learned this week.", options: ["Eat lunch", "Get dressed", "Wake up", "Walk to school"], answer: 2 },
  },
  {
    term: 1, week: 3,
    objective: "I can give a friend-robot clear commands.",
    skill: "give a friend-robot 2 clear commands",
    look: "Can the child give a friend-robot 2 clear commands that it can follow?",
    think: "Say a clear command that a robot could follow.",
    thinkText: "If you just say “Go!”, where will Ayo go? Which words help a robot? A gate and a lift follow instructions too.",
    moveText: "Robot Says in pairs: give your friend 2 commands, like “walk 2 steps, clap”. Your friend does only what you say.",
    move: [["Walk", "/tmc/n1/lesson-art/walk.png"], ["Stop", "/tmc/n1/lesson-art/stop.png"], ["Clap", "/tmc/n1/lesson-art/clap.png"]],
    rhinobot: "Robots do only what we tell them. Let’s give Ayo clear commands!",
    order: { title: "Stop, Ayo!", bookPage: 13, bookInstr: "Circle the ‘stop’ picture. Then help Ayo get the ball: circle the 2 commands he needs.", prompt: "Help Ayo get the ball. Tap his commands in order: walk, stop, then pick up.", hint: "Ayo must stop before he can pick up the ball.", done: "You gave Ayo clear commands in the right order.", cards: [["Walk", "/tmc/n1/lesson-art/walk.png"], ["Stop", "/tmc/n1/lesson-art/stop.png"], ["Pick up", "/tmc/n1/lesson-art/pick-up.png"]] },
    materials: "Command cards (walk, stop, clap, pick up). A soft toy or ball to rescue. Pictures of a washing machine, lift and gate. Open floor space. Activity Books and crayons.",
    create: "Draw Ayo reaching the toy and the commands you gave him.",
    home: "Hide a toy. Your child gives you 2 clear commands, like “walk 3 steps, pick up”. Do only what they say!",
    practice: { bankId: "N1-T1-W03-O02", prompt: "Which card means “stop”?", hint: "Think about what you learned this week.", options: ["The walking card", "The clapping card", "The hand-up card", "The ball card"], answer: 2 },
  },
  {
    term: 1, week: 4,
    objective: "I can say what comes first, next and last.",
    skill: "use first, next and last to put 3 cards in order",
    look: "Does the child use the words first, next and last to put 3 cards in order?",
    think: "Say what Ayo does first, next and last.",
    thinkText: "Ayo wants to go out of the classroom door. Which step comes first? Which comes next? Which comes last?",
    moveText: "Line-up game: 3 friends stand up, walk, wave. Who was first? Who was next? Who was last?",
    move: [["Stand up", "/tmc/n1/lesson-art/stand-up.png"], ["Walk", "/tmc/n1/lesson-art/walk.png"], ["Wave", "/tmc/n1/lesson-art/wave.png"]],
    rhinobot: "First, next, last! Let’s help Ayo get out of the door.",
    order: { title: "First, next, last", bookPage: 16, bookInstr: "Draw a line from first, next and last to the right pictures.", prompt: "Ayo goes out of the classroom door. Tap the cards: first, next, last.", hint: "Ayo stands up first and waves goodbye last.", done: "You put the cards in first, next, last order.", cards: [["Stand up", "/tmc/n1/lesson-art/stand-up.png"], ["Walk", "/tmc/n1/lesson-art/walk.png"], ["Wave", "/tmc/n1/lesson-art/wave.png"]] },
    materials: "FIRST–NEXT–LAST strips, one per pair. Action cards (stand up, walk, wave), one set per pair. The classroom door. Cut-out Ayo if you have one. Activity Books and crayons.",
    create: "Draw making bread: first mix, next bake, last eat.",
    home: "In the kitchen, talk about making tea or bread: “What do we do first? Next? Last?” Let your child tell you.",
    practice: { bankId: "N1-T1-W04-O01", prompt: "Ayo wants to go out of the door. What does he do first?", hint: "Think about what you learned this week.", options: ["Sleep", "Walk", "Wave goodbye", "Stand up"], answer: 3 },
  },
  {
    term: 1, week: 5,
    objective: "I can find the wrong step and fix it.",
    skill: "find the two swapped cards in a 3-card routine and swap them back",
    look: "Can the child find the two swapped cards in a 3-card routine and swap them back?",
    think: "Say what went wrong with Silly Ayo’s shoes.",
    thinkText: "Silly Ayo put on his shoes before his socks! What went wrong? How can we fix it?",
    moveText: "Silly Ayo game: watch your teacher do 3 steps in the wrong order. Shout “Stop! Fix it!” Then act the right order.",
    move: [["Spot it", "🔎"], ["Stop! Fix it!", "/tmc/n1/lesson-art/stop.png"], ["Act it right", "/tmc/n1/lesson-art/step.png"]],
    rhinobot: "Mistakes help us learn. Let’s find Ayo’s mistake and fix it!",
    order: { title: "Spot the mistake", bookPage: 19, bookInstr: "Ayo mixed up his cards! In each row, circle the 2 pictures in the wrong place.", prompt: "Silly Ayo put on his shoes before his socks! Fix it: tap the steps in the right order.", hint: "Socks go on before shoes.", done: "You fixed Silly Ayo’s mistake.", cards: [["Wake up", "/tmc/n1/lesson-art/wake-up.png"], ["Put on socks", "/tmc/n1/lesson-art/put-on-socks.png"], ["Put on shoes", "/tmc/n1/lesson-art/put-on-shoes.png"]] },
    materials: "3-card routine sets, one per pair (e.g. wake up, get dressed, walk to school). Socks and shoes for Silly Ayo. Activity Books and crayons.",
    create: "Draw Ayo’s mistake, then draw it fixed.",
    home: "Do 3 steps in a silly order, like shoes before socks. Let your child shout “Stop! Fix it!” and tell you the right order.",
    practice: { bankId: "N1-T1-W05-O01", prompt: "Silly Ayo put on his shoes before his socks. What went wrong?", hint: "Think about what you learned this week.", options: ["He is too tall", "The order is wrong", "Nothing", "His shoes are red"], answer: 1 },
  },
  {
    term: 1, week: 6,
    objective: "I can do one move again and again (3 times).",
    skill: "do one move 3 times using the ‘do it again’ card",
    look: "Can the child do one move 3 times using the ‘do it again’ card?",
    think: "Say something we do again and again.",
    thinkText: "Ayo claps, claps, claps! What does he do again and again? What do you do again and again, like brushing teeth?",
    moveText: "Robot dance! Clap 3 times. Stamp 3 times. Jump 3 times. Hold up 3 fingers to show how many times.",
    move: [["Clap 3 times", "/tmc/n1/lesson-art/clap.png"], ["Stamp 3 times", "/tmc/n1/lesson-art/stamp.png"], ["Jump 3 times", "/tmc/n1/lesson-art/jump.png"]],
    rhinobot: "Some moves happen again and again. Let’s count them with Ayo!",
    order: { title: "Again and again", bookPage: 22, bookInstr: "Colour the move Ayo does again and again. Then count the claps: colour one circle for each clap.", prompt: "Make Ayo clap 3 times: one clap card, then two ‘do it again’ cards.", hint: "The clap card goes first. ‘Do it again’ repeats the move before it.", done: "Clap, clap, clap! You used ‘do it again’ the right way.", cards: [["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Do it again", "/tmc/n1/lesson-art/do-it-again.svg", "again"], ["Do it again", "/tmc/n1/lesson-art/do-it-again.svg", "again"]] },
    materials: "‘Do it again’ ↻ cards, 2 per group. Move cards (clap, stamp, jump), one set per group. A taped jumping line (optional). Activity Books and crayons.",
    create: "Draw Ayo doing one move 3 times: 3 pictures the same.",
    home: "Play “do it again”: you jump once, your child says “Do it again!” twice. Count the jumps together: 1, 2, 3.",
    practice: { bankId: "N1-T1-W06-O03", prompt: "Clap, ↻, ↻. How many claps is that?", hint: "Think about what you learned this week.", options: ["2", "1", "4", "3"], answer: 3 },
  },
  {
    term: 1, week: 7,
    objective: "I can play Robot Says games and fix a wrong card.",
    skill: "follow 3 commands, give 2, order 3 cards and swap back two swapped cards",
    look: "Does the child follow 3 commands, give 2, order 3 cards and swap back two swapped cards?",
    think: "Say which Ayo game you like best.",
    thinkText: "Which Ayo game do you like best? Let’s play our robot games again and catch Silly Ayo’s mistakes!",
    moveText: "Play Robot Says, Morning Order, the First–Next–Last line-up, Silly Ayo: Stop! Fix it! and the Robot dance.",
    move: [["Robot Says", "/tmc/n1/lesson-art/walk.png"], ["Morning Order", "/tmc/n1/lesson-art/wake-up.png"], ["Do it again", "/tmc/n1/lesson-art/do-it-again.svg"]],
    rhinobot: "Game time! Let’s play our robot games and catch Ayo’s silly mistakes.",
    order: { title: "Catch Silly Ayo!", bookPage: 25, bookInstr: "Silly Ayo swapped 2 cards! In each row, circle the 2 cards in the wrong place.", prompt: "Silly Ayo mixed up his Robot Says cards. Put them back: walk, clap, then stop.", hint: "Listen for the first word, then the next, then the last.", done: "You caught Silly Ayo and put his cards back.", cards: [["Walk", "/tmc/n1/lesson-art/walk.png"], ["Clap", "/tmc/n1/lesson-art/clap.png"], ["Stop", "/tmc/n1/lesson-art/stop.png"]] },
    materials: "All Term 1 card sets (routine, command, first–next–last, ↻). Game station signs. Open floor space. Cut-out Ayo. Activity Books and crayons.",
    create: "Draw your favourite Robot Says game.",
    home: "Play Silly Ayo at home: do 3 steps of washing hands in a wrong order. Your child shouts “Stop! Fix it!” and puts it right.",
    practice: { bankId: "N1-T1-W07-O02", prompt: "Which is a clear command for a robot?", hint: "Think about what you learned this week.", options: ["“Do something.”", "“Over there!”", "“Walk two steps.”", "“Go!”"], answer: 2 },
  },
  {
    term: 1, week: 8,
    objective: "I can put pictures in story order and fix a wrong one.",
    skill: "order 3 to 4 story pictures, retell them and swap back two swapped pictures",
    look: "Can the child order 3–4 story pictures, retell them and swap back two swapped pictures?",
    think: "Say what happens first, next and last on Ayo’s trip.",
    thinkText: "Look at Ayo’s trip to the market. What happens first, next and last? Now tell it back to a friend.",
    moveText: "Act out Jack and Jill: up the hill, fetch water, fall down (sit down slowly), tumble after (roll gently). If two parts get swapped, shout “Fix it!”",
    move: [["Up the hill", "⛰️"], ["Fetch water", "🪣"], ["Fall down", "🫳"]],
    rhinobot: "Every story has an order.",
    order: { title: "Number the story", bookPage: 28, bookInstr: "Ayo’s market story is mixed up. Put 1, 2, 3, 4 under the pictures to show the right order.", prompt: "Ayo’s market story is mixed up. Tap the 4 pictures in story order.", hint: "Ayo leaves home first and comes home last.", done: "You told Ayo’s market story in order.", cards: [["Leaves home", "/tmc/n1/lesson-art/leave-home.png"], ["Rides a bus", "/tmc/n1/lesson-art/ride-bus.png"], ["Buys bread", "/tmc/n1/lesson-art/buy-bread.png"], ["Comes home", "/tmc/n1/lesson-art/come-home.png"]] },
    materials: "Story sets: Ayo’s market trip (4 cards) and the Jack and Jill strip, one per group. Cereal-box strips and glue (optional). Activity Books and crayons.",
    create: "Draw the end of Ayo’s story. What happens last?",
    home: "After a story or a trip to the market, ask: “What happened first? Next? Last?” Let your child tell it back to you.",
    practice: { bankId: "N1-T1-W08-O01", prompt: "What happens at the beginning of Ayo’s market trip?", hint: "Think about what you learned this week.", options: ["He buys bread", "He comes home", "He leaves home", "He eats lunch"], answer: 2 },
  },
  {
    term: 1, week: 9,
    objective: "I can plan 3 cards and guide Ayo along a straight path.",
    skill: "plan 3 cards before acting, run them on a straight path and fix a wrong card",
    look: "Does the child plan 3 cards before acting, run them on a straight path and fix a wrong card?",
    think: "Say the cards Ayo needs before he moves.",
    thinkText: "Ayo must walk straight to the school gate. Let’s plan all the cards before he moves. What if one card is wrong?",
    moveText: "Walk the line like a robot: one step for each ‘forward’ card. Freeze on ‘stop’! No turns.",
    move: [["Forward", "/tmc/n1/lesson-art/forward.png"], ["Forward", "/tmc/n1/lesson-art/forward.png"], ["Stop", "/tmc/n1/lesson-art/stop.png"]],
    rhinobot: "Let’s plan Ayo’s cards first, then walk his path to the gate.",
    order: { title: "Ayo’s straight path", bookPage: 31, bookInstr: "Trace Ayo’s straight path to the school gate. Then circle the stop card.", prompt: "Plan Ayo’s straight path to the school gate: 2 steps forward, then stop.", hint: "Plan all the cards first. The stop card goes last.", done: "Forward, forward, stop! Ayo reached the gate.", cards: [["Forward", "/tmc/n1/lesson-art/forward.png", "forward"], ["Forward", "/tmc/n1/lesson-art/forward.png", "forward"], ["Stop", "/tmc/n1/lesson-art/stop.png", "stop"]] },
    materials: "Forward and stop cards per team. Masking tape for a straight path. A box school gate. A zebra-crossing picture. Cut-out Ayo. Activity Books and crayons.",
    create: "Draw Ayo’s straight path to the school gate and the 3 cards he used.",
    home: "Plan a short walk to the door: your child says the cards first (“forward, forward, stop”), then you walk it. Fix any wrong card!",
    practice: { bankId: "N1-T1-W09-O01", prompt: "What do we do before Ayo moves?", hint: "Think about what you learned this week.", options: ["Plan all the cards", "Run fast", "Nothing", "Go to sleep"], answer: 0 },
  },
  {
    term: 1, week: 10,
    objective: "I can put steps in order and fix a mistake.",
    skill: "put steps in order and fix a mistake",
    look: "Watch at the stations (no quiz): who orders, fixes, repeats and follows the path on their own?",
    think: "Say which Ayo game from this term you like best.",
    thinkText: "Show what you learnt this term! Which Ayo game do you remember?",
    moveText: "Play the Term 1 games again: put the cards in order, catch Silly Ayo, do it again and walk the straight path.",
    move: [["Put in order", "/tmc/n1/lesson-art/order-cards.png"], ["Silly Ayo", "/tmc/n1/lesson-art/fix-it.png"], ["Do it again", "/tmc/n1/lesson-art/do-it-again.svg"], ["Straight path", "/tmc/n1/lesson-art/forward.png"]],
    order: { title: "Ayo’s review game", bookPage: 33, bookInstr: "Show what you learnt! Do the 4 small tasks. You can point or say the answer.", prompt: "Review task 1: put Ayo’s morning cards in order.", hint: "What does Ayo do when he first opens his eyes?", done: "You remembered the order. Well done!", cards: [["Wake up", "/tmc/n1/lesson-art/wake-up.png"], ["Brush teeth", "/tmc/n1/lesson-art/brush-teeth.png"], ["Eat breakfast", "/tmc/n1/lesson-art/eat-breakfast.png"]] },
    materials: "Station signs. Week 1–9 card sets: routine cards, ↻ cards, forward and stop cards. A taped straight path. Cut-out Ayo. Activity Books and crayons.",
    create: "Draw your favourite Ayo game this term.",
    home: "Ask your child to show you an Ayo game from school. Let them be the teacher and give you the steps!",
    practice: { bankId: "N1-T1-W10-O01", prompt: "Wake up, brush teeth, eat breakfast. Which is first?", hint: "Think about what you learned this week.", options: ["Wake up", "Eat breakfast", "Sleep", "Brush teeth"], answer: 0 },
  },
  {
    term: 1, week: 11,
    objective: "I can program Ayo with 3 picture cards and fix a wrong one.",
    skill: "order, act, check and fix a 3-card program with the team",
    look: "Can the team order, act, check and fix their 3-card program? Tick the Station 1 checklist for 8–12 children.",
    think: "Say what Ayo needs from us.",
    thinkText: "What does Ayo need from us? Three cards in the right order, and a check for mistakes!",
    moveText: "Act out your team’s program like robots. Then move cut-out Ayo (or any toy) one step for each card along the straight path.",
    move: [["Order the cards", "/tmc/n1/lesson-art/order-cards.png"], ["Act them", "/tmc/n1/lesson-art/act-them.png"], ["Check them", "/tmc/n1/lesson-art/check-them.png"], ["Fix a mistake", "/tmc/n1/lesson-art/fix-it.png"]],
    rhinobot: "Project time! Plan 3 cards, check them, then send Ayo on his way.",
    order: { title: "My build checklist", bookPage: 36, bookInstr: "Did your team do it? Colour a tick for each one: order the cards, act them, check them, fix a wrong card.", prompt: "Tap your team’s build steps in order.", hint: "First lay the cards in order. Fix a mistake last.", done: "Your team’s build is in the right order.", cards: [["Order the cards", "/tmc/n1/lesson-art/order-cards.png"], ["Act them", "/tmc/n1/lesson-art/act-them.png"], ["Check them", "/tmc/n1/lesson-art/check-them.png"], ["Fix a mistake", "/tmc/n1/lesson-art/fix-it.png"]] },
    materials: "Cut-out Ayo (one per team if you can make them; otherwise teams share and take turns). Picture cards. Box targets (gate or market stall). Masking tape for straight paths. Station 1 checklist. Activity Books, crayons.",
    create: "Draw your 3 program cards for Ayo: first, next, last.",
    home: "Ask your child: “How did your team program Ayo?” Let them tell you: “Ayo goes first…, next…, last…”",
    practice: { bankId: "N1-T1-W11-O01", prompt: "What is a program for Ayo?", hint: "Think about what you learned this week.", options: ["A song", "Cards in the right order", "A sleep", "A box of toys"], answer: 1 },
  },
  {
    term: 1, week: 12,
    objective: "I can show my teacher what I learnt this term at the stations.",
    skill: "put 3 steps in order, say first, next, last, do a move 3 times and fix a wrong card",
    look: "Can the child put 3 steps in order, say first, next, last, do a move 3 times and fix a wrong card on their own?",
    think: "Say one thing you can do now.",
    thinkText: "Show me what you can do! Let’s play our stations with Ayo.",
    moveText: "Play the stations with Ayo: put 3 steps in order, say first, next, last, do it again 3 times and fix a wrong card.",
    move: [["Put in order", "/tmc/n1/lesson-art/order-cards.png"], ["Do it again", "/tmc/n1/lesson-art/do-it-again.svg"], ["Fix a card", "/tmc/n1/lesson-art/fix-it.png"]],
    order: { title: "Show me what you can do!", bookPage: 38, bookInstr: "My stars: I can put 3 steps in order. I can say first, next, last. I can do it again (3 times). I can fix a wrong card. A grown-up colours a star with you when you can do it on your own.", prompt: "Station 1: put the 3 steps of Ayo’s shop trip in order.", hint: "Ayo leaves home first and comes home last.", done: "You put the 3 steps in order on your own.", cards: [["Leave home", "/tmc/n1/lesson-art/leave-home.png"], ["Buy bread", "/tmc/n1/lesson-art/buy-bread.png"], ["Come home", "/tmc/n1/lesson-art/come-home.png"]] },
    materials: "4-item checklist and record sheet. Routine cards. ↻ cards. Station signs. Drawing paper and crayons. Cut-out Ayo.",
    create: "Draw your favourite station game from this term.",
    home: "Ask your child to show you one thing from the My stars page. Colour the star together when they can do it on their own.",
    practice: { bankId: "N1-T1-W12-O01", prompt: "Wake up, brush teeth, eat breakfast are mixed up. Which card goes first?", hint: "Think about what you learned this week.", options: ["Wake up", "Brush teeth", "Eat breakfast", "None"], answer: 0 },
  },
  {
    term: 1, week: 13,
    objective: "I can show my family what I learnt and get my Step Thinker badge.",
    skill: "show a 3-card program and say first, next and last",
    look: "Can the child show a 3-card program and say first, next and last on their own?",
    think: "Say what you will show your family.",
    thinkText: "Showcase day! Show your family the Ayo steps you learned this term.",
    moveText: "Show the straight path and your team’s Ayo program. Say “first, next, last” as you go.",
    move: [["First", "/tmc/n1/lesson-art/stand-up.png"], ["Next", "/tmc/n1/lesson-art/walk.png"], ["Last", "/tmc/n1/lesson-art/wave.png"]],
    order: { title: "Showcase and badges", bookPage: 39, bookInstr: "Your Step Thinker · Term 1 badge: “You can put 3 steps in order, say first, next, last, do it again and fix a wrong card!”", prompt: "Get ready for the showcase: tap Ayo’s steps first, next, last.", hint: "Stand up first. Wave last.", done: "You are ready to show your family! You are a Step Thinker.", cards: [["Stand up", "/tmc/n1/lesson-art/stand-up.png"], ["Walk", "/tmc/n1/lesson-art/walk.png"], ["Wave", "/tmc/n1/lesson-art/wave.png"]] },
    materials: "Badges and certificates. Card for the take-home ‘My Ayo steps’. The Week 11 builds. A taped straight path. Cut-out Ayo. Picture cards.",
    create: "Draw yourself getting your Step Thinker badge.",
    home: "Put your child’s badge where the family can see it. Ask them to show you their favourite Ayo game.",
    practice: { bankId: "N1-T1-W13-O03", prompt: "What do we say when we show our program?", hint: "Think about what you learned this week.", options: ["First, next, last", "Hello, bye", "Up, down", "Red, blue"], answer: 0 },
  },
  {
    term: 2, week: 1,
    objective: "I can copy and continue a pattern.",
    skill: "copy an AB colour pattern and add the next 2 pieces",
    look: "Can the child copy an AB colour pattern and add the next 2 pieces on their own?",
    think: "Say what comes next: red, blue, red, blue…",
    thinkText: "Ayo’s lights flash red, blue, red, blue. What comes next? Where in our classroom do you see something that goes again and again?",
    moveText: "Make a pattern line! Stand red, blue, red, blue. Who is next? Pick the right colour and join the line.",
    move: [["Red", "/tmc/n1/lesson-art/red-circle.svg"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg"], ["Red", "/tmc/n1/lesson-art/red-circle.svg"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg"]],
    rhinobot: "Patterns go again and again. Look at Ayo’s suit lights!",
    order: { title: "What colour comes next?", bookPage: 42, bookInstr: "Colour the empty box to finish Ayo’s pattern. Then circle the row that is a pattern.", prompt: "Ayo’s lights go red, blue, red, blue… Tap the next 3 lights.", hint: "Say it aloud: red, blue, red, blue. After blue comes red.", done: "Red, blue, red! You kept Ayo’s pattern going.", strip: [["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"], ["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"]], cards: [["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"], ["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"]] },
    materials: "Red and blue paper (one per child). Colour cards and large card counters (bigger than a toilet-roll opening), one set per pair. Cut-out Ayo. Open floor space. Activity Books and crayons.",
    create: "Colour Ayo’s lights in a red–blue pattern.",
    home: "Lay out cups and spoons: cup, spoon, cup, spoon. Ask your child what comes next. Then let them make a pattern for you.",
    practice: { bankId: "N1-T2-W01-O01", prompt: "Ayo’s lights flash red, blue, red, blue. What comes next?", hint: "Think about what you learned this week.", options: ["Green", "Black", "Yellow", "Red"], answer: 3 },
  },
  {
    term: 2, week: 2,
    objective: "I can move in a pattern like a robot.",
    skill: "move in a repeating 2-move pattern and keep it going",
    look: "Can the child move in a repeating 2-move pattern (march, jump) and keep it going?",
    think: "Say what Ayo does next: march, jump, march, jump…",
    thinkText: "Ayo dances march, jump, march, jump. What will he do next? Can your body make a pattern too?",
    moveText: "Robot dance on the line! March, jump, march, jump. Now clap, stamp, clap, stamp. Keep the pattern going!",
    move: [["March", "/tmc/n1/lesson-art/march.png"], ["Jump", "/tmc/n1/lesson-art/jump.png"], ["March", "/tmc/n1/lesson-art/march.png"], ["Jump", "/tmc/n1/lesson-art/jump.png"]],
    rhinobot: "We can move in patterns too. Let’s dance with Ayo!",
    order: { title: "Ayo’s next move", bookPage: 45, bookInstr: "Look at Ayo’s dance: march, jump, march, jump. What comes next? Circle it, then draw it in the empty box.", prompt: "Ayo dances march, jump, march, jump… Tap his next 3 moves.", hint: "March, jump, march, jump. After jump comes march.", done: "March, jump, march! Ayo’s dance keeps going.", strip: [["March", "/tmc/n1/lesson-art/march.png", "march"], ["Jump", "/tmc/n1/lesson-art/jump.png", "jump"], ["March", "/tmc/n1/lesson-art/march.png", "march"], ["Jump", "/tmc/n1/lesson-art/jump.png", "jump"]], cards: [["March", "/tmc/n1/lesson-art/march.png", "march"], ["Jump", "/tmc/n1/lesson-art/jump.png", "jump"], ["March", "/tmc/n1/lesson-art/march.png", "march"]] },
    materials: "Move cards (march, jump, clap, stamp), one set per group of 4. A masking tape line on the floor. Cut-out Ayo. Open floor space. Activity Books and crayons.",
    create: "Make up your own 2-move pattern. Draw your moves, then show a friend!",
    home: "Dance a pattern together: clap, stamp, clap, stamp. Ask your child what comes next. Then let them lead a new 2-move pattern.",
    practice: { bankId: "N1-T2-W02-O01", prompt: "Ayo dances march, jump, march, jump. What comes next?", hint: "Think about what you learned this week.", options: ["Sleep", "Sit", "Jump", "March"], answer: 3 },
  },
  {
    term: 2, week: 3,
    objective: "I can hear and clap a pattern.",
    skill: "clap back a sound pattern and keep it going",
    look: "Can the child clap back a sound pattern and keep it going?",
    think: "Say the sound that comes next: beep, boop, beep, boop…",
    thinkText: "Ayo says beep, boop, beep, boop. What sound comes next? We hear with our ears. A microwave beeps patterns too!",
    moveText: "Clap back! Listen: clap, stamp, clap, stamp. Copy it, then keep it going.",
    move: [["Clap", "/tmc/n1/lesson-art/clap.png"], ["Stamp", "/tmc/n1/lesson-art/stamp.png"], ["Clap", "/tmc/n1/lesson-art/clap.png"], ["Stamp", "/tmc/n1/lesson-art/stamp.png"]],
    rhinobot: "Patterns can be sounds. Let’s listen carefully with Ayo!",
    order: { title: "Which sound comes next?", bookPage: 48, bookInstr: "Say the sound pictures: clap, stamp, clap, stamp. Circle the picture that comes next.", prompt: "Clap, stamp, clap, stamp… Tap the next 3 sounds.", hint: "Say the sounds aloud: clap, stamp, clap, stamp. After stamp comes clap.", done: "Clap, stamp, clap! You kept the sound pattern going.", strip: [["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Stamp", "/tmc/n1/lesson-art/stamp.png", "stamp"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Stamp", "/tmc/n1/lesson-art/stamp.png", "stamp"]], cards: [["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Stamp", "/tmc/n1/lesson-art/stamp.png", "stamp"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"]] },
    materials: "Clap and stamp cards. An adult-made sealed bottle shaker. An upturned plastic-bowl drum. Cut-out Ayo. Activity Books and crayons.",
    create: "Make up a beep code for Ayo. Draw it, then play it for a friend!",
    home: "Clap a pattern for your child: clap, tap knees, clap, tap knees. Ask what comes next. Then let them make a sound pattern for you.",
    practice: { bankId: "N1-T2-W03-O01", prompt: "Ayo says beep, boop, beep, boop. What comes next?", hint: "Think about what you learned this week.", options: ["Moo", "Boop", "Clap", "Beep"], answer: 3 },
  },
  {
    term: 2, week: 4,
    objective: "I can make and build a shape pattern.",
    skill: "build a shape pattern track and add the next pieces",
    look: "Can the child build a colour or shape pattern track and add the next pieces?",
    think: "Say the next shape on Ayo’s road.",
    thinkText: "Look at the shapes on Ayo’s road: circle, square, circle, square. What comes next? A ball is round and a box is square!",
    moveText: "Pattern hop! Hop along the shape track and say each shape: circle, square, circle, square.",
    move: [["Circle", "/tmc/n1/lesson-art/circle.svg"], ["Square", "/tmc/n1/lesson-art/square.svg"], ["Circle", "/tmc/n1/lesson-art/circle.svg"], ["Square", "/tmc/n1/lesson-art/square.svg"]],
    rhinobot: "Shapes can make patterns. Let’s build Ayo’s shape road!",
    order: { title: "Shapes in a row", bookPage: 51, bookInstr: "Draw the shape that comes next. Then draw a line from the ball and the box to their shapes.", prompt: "Ayo’s road goes circle, square, circle, square… Tap the next 4 shapes.", hint: "Circle, square, circle, square: the same two shapes again and again.", done: "You built more of Ayo’s shape road.", strip: [["Circle", "/tmc/n1/lesson-art/circle.svg", "circle"], ["Square", "/tmc/n1/lesson-art/square.svg", "square"], ["Circle", "/tmc/n1/lesson-art/circle.svg", "circle"], ["Square", "/tmc/n1/lesson-art/square.svg", "square"]], cards: [["Circle", "/tmc/n1/lesson-art/circle.svg", "circle"], ["Square", "/tmc/n1/lesson-art/square.svg", "square"], ["Circle", "/tmc/n1/lesson-art/circle.svg", "circle"], ["Square", "/tmc/n1/lesson-art/square.svg", "square"]] },
    build: { text: "Build a shape track on the floor with your class: circle, square, circle, square. Then hop along it and say each shape.", task: "Build the shape track, then hop along it and check the pattern." },
    materials: "Shape cards (circle, square, triangle) per group. Big blocks, boxes and large card shapes. Paper circles, squares and triangles. Cut-out Ayo. Glue, Activity Books and crayons.",
    create: "Make a shape pattern with paper circles, squares and triangles. Stick it here!",
    home: "Find round and square things at home, like plates and boxes. Lay them in a row: round, square, round, square. Ask: “What comes next?”",
    practice: { bankId: "N1-T2-W04-O01", prompt: "Circle, square, circle, square… what comes next?", hint: "Think about what you learned this week.", options: ["Star", "Triangle", "Circle", "Square"], answer: 2 },
  },
  {
    term: 2, week: 5,
    objective: "I can say what comes next.",
    skill: "say what comes next in a pattern before it is shown",
    look: "Can the child say what comes next in a pattern before it is shown?",
    think: "Guess Ayo’s next move, then check.",
    thinkText: "Ayo does step, clap, step, clap… What will he do next? How did you know? Let’s check!",
    moveText: "Guess and check! The robot freezes. What comes next? Say it, then watch the robot show you.",
    move: [["Step", "/tmc/n1/lesson-art/step.png"], ["Clap", "/tmc/n1/lesson-art/clap.png"], ["Step", "/tmc/n1/lesson-art/step.png"], ["?", "❓"]],
    rhinobot: "When we know the pattern, we can guess what comes next!",
    order: { title: "What is missing?", bookPage: 54, bookInstr: "Draw what comes next at the end of the row. Then circle the piece that fills the gap.", prompt: "Ayo does step, clap, step, clap… Guess first, then tap his next 3 moves.", hint: "Say it aloud: step, clap, step, clap. After clap comes step.", done: "Step, clap, step! You guessed right.", strip: [["Step", "/tmc/n1/lesson-art/step.png", "step"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Step", "/tmc/n1/lesson-art/step.png", "step"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"]], cards: [["Step", "/tmc/n1/lesson-art/step.png", "step"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Step", "/tmc/n1/lesson-art/step.png", "step"]] },
    materials: "Pattern strips with a gap. Large card counters (bigger than a toilet-roll opening) and a plastic cup per pair. Cut-out Ayo. Activity Books and crayons.",
    create: "Draw a pattern. Leave the last box empty for a friend to finish!",
    home: "Make a pattern with cups and spoons, then hide the next one under a cloth. Your child guesses, then lifts the cloth to check.",
    practice: { bankId: "N1-T2-W05-O01", prompt: "Step, clap, step, clap… what comes next?", hint: "Think about what you learned this week.", options: ["Jump", "Step", "Clap", "Sleep"], answer: 1 },
  },
  {
    term: 2, week: 6,
    objective: "I can sort things by one rule and say my rule.",
    skill: "sort things by one rule and say the rule",
    look: "Can the child sort objects by one feature and say the rule (“all red”)?",
    think: "Say how you could sort Ayo’s basket.",
    thinkText: "Ayo’s market basket is mixed up: tomatoes, peppers, bananas and corn. How can he put them in groups? What is your rule?",
    moveText: "Be a sorting robot! Hold a red, blue or yellow card and walk to the hoop that matches.",
    move: [["Red card", "/tmc/n1/lesson-art/red-circle.svg"], ["Yellow card", "/tmc/n1/lesson-art/yellow-square.svg"], ["Blue card", "/tmc/n1/lesson-art/blue-square.svg"]],
    rhinobot: "Sorting puts things that are the same together. Let’s help Ayo sort!",
    order: { title: "Put it in its group", bookPage: 57, bookInstr: "Draw a line from each thing to its group. Red things go to the red basket, yellow things to the yellow.", prompt: "Sort Ayo’s market basket by colour. Tap the red things first, then the yellow things.", hint: "Our rule is colour. Tomato and pepper are red. Banana and corn are yellow.", done: "Red things, then yellow things! You sorted by one rule.", cards: [["Tomato", "/tmc/n1/lesson-art/tomato.png", "red"], ["Pepper", "/tmc/n1/lesson-art/pepper.png", "red"], ["Banana", "/tmc/n1/lesson-art/banana.png", "yellow"], ["Corn", "/tmc/n1/lesson-art/corn.png", "yellow"]] },
    materials: "2–3 hoops (or chalk circles). A basket of big objects (fruit pictures, big blocks, large card counters). Sorting picture cards. Red, blue and yellow cards. Cut-out Ayo. Activity Books.",
    create: "Draw a group of things that are all the same colour.",
    home: "At wash time, sort clothes with your child: all socks here, all shirts there. Ask: “What is our rule?” Then let your child choose a rule.",
    practice: { bankId: "N1-T2-W06-O03", prompt: "Our rule is colour. Where does a red ball go?", hint: "Think about what you learned this week.", options: ["In the bin", "Outside", "With the red things", "With the blue things"], answer: 2 },
  },
  {
    term: 2, week: 7,
    objective: "I can play pattern games and say what comes next.",
    skill: "copy and continue an AB pattern, say what comes next and sort by one rule",
    look: "Can the child copy and continue an AB pattern, say what comes next and sort by one rule?",
    think: "Say which pattern game you like best.",
    thinkText: "Which pattern game do you like best? Let’s play them all again!",
    moveText: "Play the games: Pattern Line, Robot Dance, Clap Back, Pattern Hop, Freeze and Guess, Sorting Robots!",
    move: [["Pattern line", "/tmc/n1/lesson-art/red-circle.svg"], ["Robot dance", "/tmc/n1/lesson-art/march.png"], ["Clap back", "/tmc/n1/lesson-art/clap.png"]],
    rhinobot: "Game time! Let’s play all our pattern games again.",
    order: { title: "Colour what comes next", bookPage: 60, bookInstr: "Look at each pattern. Colour the empty box to finish it.", prompt: "Yellow, green, yellow, green… Tap the next 3 colours.", hint: "Say it aloud: yellow, green, yellow, green. After green comes yellow.", done: "Yellow, green, yellow! You finished the pattern.", strip: [["Yellow", "/tmc/n1/lesson-art/yellow-square.svg", "yellow"], ["Green", "/tmc/n1/lesson-art/green-square.svg", "green"], ["Yellow", "/tmc/n1/lesson-art/yellow-square.svg", "yellow"], ["Green", "/tmc/n1/lesson-art/green-square.svg", "green"]], cards: [["Yellow", "/tmc/n1/lesson-art/yellow-square.svg", "yellow"], ["Green", "/tmc/n1/lesson-art/green-square.svg", "green"], ["Yellow", "/tmc/n1/lesson-art/yellow-square.svg", "yellow"]] },
    materials: "Hoops; pattern strips with gaps; the Week 4 shape track; large card counters; move, sound and colour cards; game signs. Activity Books and crayons.",
    create: "Draw your favourite pattern game.",
    home: "Play Freeze and Guess at home: clap, jump, clap, jump… freeze! Your child says what comes next. Then swap.",
    practice: { bankId: "N1-T2-W07-O01", prompt: "Red, blue, red, blue… what comes next?", hint: "Think about what you learned this week.", options: ["Yellow", "Red", "Blue", "Green"], answer: 1 },
  },
  {
    term: 2, week: 8,
    objective: "I can make my own AB pattern.",
    skill: "copy an AB pattern, change one part and make their own AB pattern",
    look: "Can the child copy an AB pattern, change one part, and make their own AB pattern?",
    think: "Say two things you could use for your own pattern.",
    thinkText: "Copy a pattern, change one part, then make your own AB pattern for Ayo to dance. What will yours be?",
    moveText: "Pattern party! Copy the teacher’s dance. Change one move. Then make your own AB dance for Ayo.",
    move: [["Jump", "/tmc/n1/lesson-art/jump.png"], ["Clap", "/tmc/n1/lesson-art/clap.png"], ["Jump", "/tmc/n1/lesson-art/jump.png"], ["Clap", "/tmc/n1/lesson-art/clap.png"]],
    rhinobot: "Now you are the pattern maker. Make a new dance for Ayo!",
    order: { title: "My own pattern", bookPage: 63, bookInstr: "Choose 2 things. Draw them again and again in the boxes to make your own AB pattern.", prompt: "Make Ayo an AB pattern with his two cards: jump, clap, jump, clap.", hint: "A, B, A, B: jump, then clap, again and again.", done: "Jump, clap, jump, clap! That is your own AB pattern.", cards: [["Jump", "/tmc/n1/lesson-art/jump.png", "jump"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Jump", "/tmc/n1/lesson-art/jump.png", "jump"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"]] },
    materials: "Move cards; blank pattern strips; paper scraps or pieces of local fabric; glue. Cut-out Ayo. Activity Books and crayons.",
    create: "Make your own AB pattern with paper scraps or bits of local fabric. Stick it here!",
    home: "Make a pattern together with things at home: shoe, slipper, shoe, slipper. Then let your child make their own and teach it to you.",
    practice: { bankId: "N1-T2-W08-O01", prompt: "Jump, clap, jump, clap. Copy it! What comes next?", hint: "Think about what you learned this week.", options: ["Clap", "Sit", "Sleep", "Jump"], answer: 3 },
  },
  {
    term: 2, week: 9,
    objective: "I can find patterns around me.",
    skill: "find a pattern in familiar things and copy it with cards",
    look: "Can the child find a pattern in familiar objects and copy it with cards?",
    think: "Say where you can see a pattern.",
    thinkText: "Look at a striped uniform, a zebra, floor tiles. What repeats? Now look at an Ankara cloth and a pineapple. What shapes can you see?",
    moveText: "Pattern walk! Find patterns on tiles, window bars and uniforms. Then copy one with your body.",
    move: [["Zebra", "/tmc/n1/lesson-art/zebra.png"], ["Tiles", "/tmc/n1/lesson-art/tiles.png"], ["Ankara cloth", "/tmc/n1/lesson-art/ankara.png"]],
    rhinobot: "Patterns are all around us. Let’s go pattern hunting with Ayo!",
    order: { title: "Find the patterns", bookPage: 66, bookInstr: "Look at the pictures. Circle the ones with a pattern that goes again and again.", prompt: "The zebra’s stripes go black, white, black, white… Copy them: tap 4 stripes.", hint: "Black, white, black, white: start with black.", done: "You copied the zebra’s pattern.", strip: [["Black stripe", "/tmc/n1/lesson-art/black-stripe.svg", "black"], ["White stripe", "/tmc/n1/lesson-art/white-stripe.svg", "white"], ["Black stripe", "/tmc/n1/lesson-art/black-stripe.svg", "black"], ["White stripe", "/tmc/n1/lesson-art/white-stripe.svg", "white"]], cards: [["Black stripe", "/tmc/n1/lesson-art/black-stripe.svg", "black"], ["White stripe", "/tmc/n1/lesson-art/white-stripe.svg", "white"], ["Black stripe", "/tmc/n1/lesson-art/black-stripe.svg", "black"], ["White stripe", "/tmc/n1/lesson-art/white-stripe.svg", "white"]] },
    materials: "Samples with a clear 2-part repeat: 2-colour striped cloth, a zebra picture, 2-colour tiles. Ankara or adire for look-and-talk. AB cards. Cut-out Ayo. Activity Books and crayons.",
    create: "Draw a pattern you found at home or at school.",
    home: "Go on a pattern hunt at home: clothes, tiles, a fence, a mat. Ask your child: “What repeats?” You may send a piece of fabric to school.",
    practice: { bankId: "N1-T2-W09-O02", prompt: "Zebra stripes go black, white, black, white… what comes next?", hint: "Think about what you learned this week.", options: ["Green", "Black", "White", "Red"], answer: 1 },
  },
  {
    term: 2, week: 10,
    objective: "I can copy, continue, predict a pattern and sort by a rule.",
    skill: "copy, continue and predict a pattern and sort by one rule",
    look: "Who can copy, continue and predict a pattern and sort by one rule without help? Note who needs support before Weeks 11–12.",
    think: "Say which pattern game from this term you like best.",
    thinkText: "Show what you learnt this term! What is a pattern?",
    moveText: "Play the Term 2 games again: continue the pattern, say what comes next, sort the fruit and make your own bead pattern.",
    move: [["Continue", "/tmc/n1/lesson-art/red-circle.svg"], ["What comes next?", "/tmc/n1/lesson-art/clap.png"], ["Sort", "/tmc/n1/lesson-art/tomato.png"], ["Make your own", "/tmc/n1/lesson-art/blue-square.svg"]],
    order: { title: "Ayo’s pattern review game", bookPage: 68, bookInstr: "Show what you learnt! Do the 4 small tasks. You can point or say the answer.", prompt: "Review task 1: red, blue, red, blue… Tap the next 3 pieces.", hint: "After blue comes red.", done: "You remembered how a pattern goes on.", strip: [["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"], ["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"]], cards: [["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"], ["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"]] },
    materials: "Station signs; colour and shape pattern strips; hoops and picture cards; the shape track; clap and stamp cards; step cards. Activity Books and crayons.",
    create: "Draw your favourite pattern from this term.",
    home: "Play pattern games at home: clap a pattern, line up cups and spoons, or sort the washing. Ask what comes next, or what the rule is.",
    practice: { bankId: "N1-T2-W10-O01", prompt: "Red, blue, red, blue… what comes next?", hint: "Think about what you learned this week.", options: ["Blue", "Red", "Green", "Yellow"], answer: 1 },
  },
  {
    term: 2, week: 11,
    objective: "I can make Ayo dance an AB pattern and say what’s next.",
    skill: "lay an AB move pattern 3 times, dance it and say what comes next",
    look: "Can the child lay an AB move pattern 3 times, dance it and say what comes next?",
    think: "Say what makes a good robot dance.",
    thinkText: "What makes a good robot dance? A pattern that repeats, so friends can copy it and say what comes next!",
    moveText: "Do your team’s Ayo dance 3 times! Then stop. The audience says what comes next.",
    move: [["March", "/tmc/n1/lesson-art/march.png"], ["Jump", "/tmc/n1/lesson-art/jump.png"], ["March", "/tmc/n1/lesson-art/march.png"], ["Jump", "/tmc/n1/lesson-art/jump.png"]],
    rhinobot: "Project time! Let’s make Ayo a robot dance that repeats.",
    order: { title: "Our Robot Dance build", bookPage: 71, bookInstr: "Point to each step of our build and tick it: our pattern, repeat it 3 times, say the next move, fix a wrong card, show it!", prompt: "Lay your team’s A and B cards again and again: march, jump, march, jump.", hint: "A is march, B is jump. A, B, A, B.", done: "Your robot dance repeats! Now ask: what comes next?", cards: [["March", "/tmc/n1/lesson-art/march.png", "march"], ["Jump", "/tmc/n1/lesson-art/jump.png", "jump"], ["March", "/tmc/n1/lesson-art/march.png", "march"], ["Jump", "/tmc/n1/lesson-art/jump.png", "jump"]] },
    build: { text: "Build Ayo’s Robot Dance with your team: choose your A and B cards, repeat them 3 times, say the next move, fix a wrong card and show your dance.", task: "Make your team’s dance, check it repeats, then show it." },
    materials: "Move cards per team; paper shapes for Ayo’s belt; glue or tape; cut-out Ayo (one per team if you can, or teams share); build cards; the 4-item checklist and record sheet. Activity Books, crayons.",
    create: "Draw your team’s Ayo dance. Say: “Our pattern is… and it repeats!”",
    home: "Ask your child to show you their robot dance. Do it together 3 times, then stop and let them ask you what comes next.",
    practice: { bankId: "N1-T2-W11-O01", prompt: "What makes a good robot dance?", hint: "Think about what you learned this week.", options: ["A pattern that repeats", "One move only", "No moves", "Moves in any order"], answer: 0 },
  },
  {
    term: 2, week: 12,
    objective: "I can show my teacher what I learnt this term at the stations.",
    skill: "copy and continue a pattern, say what comes next, sort by one rule and make their own pattern",
    look: "Can the child copy and continue a pattern, say what comes next, sort by one rule and make their own pattern on their own?",
    think: "Say one thing you can do with patterns.",
    thinkText: "Show me what you can do with patterns! Let’s play and see.",
    moveText: "Play the stations: copy and continue a pattern, say what comes next, sort by one rule and make your own pattern.",
    move: [["Continue", "/tmc/n1/lesson-art/red-circle.svg"], ["Sort", "/tmc/n1/lesson-art/tomato.png"], ["Make your own", "/tmc/n1/lesson-art/blue-square.svg"]],
    order: { title: "Show me what you can do!", bookPage: 73, bookInstr: "My stars: I can copy and continue a pattern. I can say what comes next. I can sort things by one rule and say my rule. I can make my own pattern. A grown-up colours a star with you when you can do it on your own.", prompt: "Station 1: clap, stamp, clap, stamp… Tap the next 3.", hint: "After stamp comes clap.", done: "You continued the pattern on your own.", strip: [["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Stamp", "/tmc/n1/lesson-art/stamp.png", "stamp"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Stamp", "/tmc/n1/lesson-art/stamp.png", "stamp"]], cards: [["Clap", "/tmc/n1/lesson-art/clap.png", "clap"], ["Stamp", "/tmc/n1/lesson-art/stamp.png", "stamp"], ["Clap", "/tmc/n1/lesson-art/clap.png", "clap"]] },
    materials: "4-item checklist and record sheet; pattern strips; 6 picture cards and 2 hoops; move cards; station signs; paper and crayons for Station 3.",
    create: "Draw your favourite station game from this term.",
    home: "Ask your child to show you one thing from the My stars page. Colour the star together when they can do it on their own.",
    practice: { bankId: "N1-T2-W12-O01", prompt: "Red, blue, red, blue. You add 2 more cards. Which card comes first?", hint: "Think about what you learned this week.", options: ["Blue", "Green", "Red", "Yellow"], answer: 2 },
  },
  {
    term: 2, week: 13,
    objective: "I can show my family what I learnt and get my Step Thinker badge.",
    skill: "show a pattern and ask what comes next",
    look: "Can the child show a pattern and ask what comes next on their own?",
    think: "Say the pattern you will show your family.",
    thinkText: "Showcase day! Show your family your patterns and Ayo’s robot dance.",
    moveText: "Do your team’s robot dance for your family, then stop and ask them what comes next.",
    move: [["March", "/tmc/n1/lesson-art/march.png"], ["Jump", "/tmc/n1/lesson-art/jump.png"], ["March", "/tmc/n1/lesson-art/march.png"], ["Jump", "/tmc/n1/lesson-art/jump.png"]],
    order: { title: "Showcase and badges", bookPage: 74, bookInstr: "Your Step Thinker · Term 2 badge: “You can copy and continue a pattern, say what comes next, sort by one rule and make your own pattern!”", prompt: "Get ready for the showcase: red, blue, red, blue… Tap the next 3.", hint: "Say it with your family: red, blue, red, blue…", done: "You are ready to show your patterns! You are a Step Thinker.", strip: [["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"], ["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"]], cards: [["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"], ["Blue", "/tmc/n1/lesson-art/blue-square.svg", "blue"], ["Red", "/tmc/n1/lesson-art/red-circle.svg", "red"]] },
    materials: "Step Thinker · Term 2 badges and certificates; card for the ‘My pattern’ take-home; pattern strips; shape tracks and decorated Ayos; smiley-face sheets.",
    create: "Draw yourself getting your Step Thinker badge.",
    home: "Put your child’s badge where the family can see it. Ask them to show you their favourite Ayo game.",
    practice: { bankId: "N1-T2-W13-O01", prompt: "What is our Term 2 big idea?", hint: "Think about what you learned this week.", options: ["Robots can fly", "Never try again", "Smart thinkers notice repetition", "Cats can talk"], answer: 2 },
  },
  {
    term: 3, week: 1,
    objective: "I can say what the problem is.",
    skill: "say what Ayo’s problem is in their own words",
    look: "Can the child say what Ayo’s problem is in their own words (e.g. “The box is in the way”)?",
    think: "Say what is wrong in the picture.",
    thinkText: "Ayo cannot reach the school gate. What is the problem? How do we know something is a problem?",
    moveText: "Act a problem: your shoelace is undone, the door is shut, the water spilled. Friends say what the problem is.",
    move: [["Undone shoelace", "👟"], ["Stuck door", "🚪"], ["Toy too high", "🧸"]],
    rhinobot: "A problem is something in our way. Let’s help Ayo get unstuck!",
    order: { title: "Spot the problem!", bookPage: 77, bookInstr: "Look at each picture. What is wrong? Circle the problem in each picture.", prompt: "A box blocks Ayo’s way. Tap the thinking steps in order: say the problem, plan small steps, then try it.", hint: "First say what is wrong. Then plan. Then try.", done: "You said the problem first. That is how thinkers start!", cards: [["Say the problem", "/tmc/n1/lesson-art/blocked-path.png"], ["Plan small steps", "/tmc/n1/lesson-art/plan-cards.png"], ["Try it", "/tmc/n1/lesson-art/move-ayo.png"]] },
    materials: "4 problem picture cards per group (blocked path, spilled water, broken toy, danger sign). A big box. Cut-out Ayo. Taped floor grid if you have one. Activity Books and crayons.",
    create: "Draw a time you had a problem. Draw who helped you.",
    home: "When something goes wrong at home (a lost shoe, a spilled cup), ask: “What is the problem?” Let your child say it, then fix it together.",
    practice: { bankId: "N1-T3-W01-O01", prompt: "A big box is in Ayo’s way. He can’t get to school. What is the problem?", hint: "Think about what you learned this week.", options: ["The box is in the way", "There is no problem", "Ayo is happy", "The gate is green"], answer: 0 },
  },
  {
    term: 3, week: 2,
    objective: "I can break a job into small steps.",
    skill: "say the small steps of “Ayo goes to the shop”, then put the cards in order",
    look: "Does the child say the small steps of “Ayo goes to the shop” before choosing the cards, then put the cards in order?",
    think: "Say the small steps for going to the shop.",
    thinkText: "Ayo must go to the shop to buy bread. That is a big job! Before we act, we plan: what small steps make up the job?",
    moveText: "Plan first, then act: leave home (cross with a grown-up) → buy bread → go home. Who can add “pay”?",
    move: [["Leave home", "/tmc/n1/lesson-art/leave-home-grown-up.png"], ["Buy bread", "/tmc/n1/lesson-art/shop-buy-bread.png"], ["Walk home", "/tmc/n1/lesson-art/walk-home-bread.png"]],
    rhinobot: "Big jobs are easier in small steps. Let’s break Ayo’s job small!",
    order: { title: "Small steps to the shop", bookPage: 80, bookInstr: "Draw a line from 1, 2, 3 to the small steps in order.", prompt: "Going to the shop is a big job. Tap the small steps in order.", hint: "Ayo leaves home with a grown-up first.", done: "You broke the big job into small steps.", cards: [["Leave home with a grown-up", "/tmc/n1/lesson-art/leave-home-grown-up.png"], ["Buy bread", "/tmc/n1/lesson-art/shop-buy-bread.png"], ["Walk home with the bread", "/tmc/n1/lesson-art/walk-home-bread.png"]] },
    materials: "3 shop step cards per group (leave home, buy bread, go home). A box shop with paper bread. Practical corner: a mat to roll; a jug, a bowl and large card counters (bigger than a toilet-roll opening). Books, crayons.",
    create: "Draw 3 small steps of a job you do, like washing your plate.",
    home: "Pick a home job, like washing a plate. Ask: “What small steps do we need?” Let your child say them, then do the job together, step by step.",
    practice: { bankId: "N1-T3-W02-O01", prompt: "Ayo goes to the shop. What is the first small step?", hint: "Think about what you learned this week.", options: ["Go home", "Sleep", "Buy bread", "Leave home"], answer: 3 },
  },
  {
    term: 3, week: 3,
    objective: "I can choose the safe way.",
    skill: "choose the safe way of two and give a reason",
    look: "Does the child choose the safe way of two and give a reason (e.g. “Cars stop at the zebra crossing”)?",
    think: "Say which way is safe, and why.",
    thinkText: "Ayo can cross at the zebra crossing or run across the busy road. Which is the right way? Why?",
    moveText: "Two-route walk: two taped roads go to the same box. Walk the zebra crossing way and say why it is safe.",
    move: [["Zebra crossing", "/tmc/n1/lesson-art/zebra-crossing.png"], ["Hold a hand", "/tmc/n1/lesson-art/hold-hand.png"]],
    rhinobot: "Good thinkers choose the safe way. Which way should Ayo go?",
    order: { title: "Which way is safe?", bookPage: 83, bookInstr: "Point to the safe way in each pair. Then put a tick (✓) in the box under the safe way.", prompt: "Ayo crosses the road the safe way. Tap the steps in order.", hint: "Hold a grown-up’s hand first. Then go to the zebra crossing.", done: "You chose the safe way.", cards: [["Hold a grown-up’s hand", "/tmc/n1/lesson-art/hold-hand.png"], ["Go to the zebra crossing", "/tmc/n1/lesson-art/zebra-crossing.png"], ["Walk across", "/tmc/n1/lesson-art/walk.png"]] },
    materials: "Masking tape for two routes to one box. A paper zebra crossing. 2 route picture cards per pair (zebra crossing, busy road). Choice cards. Cut-out Ayo. Activity Books and crayons.",
    create: "Draw the safe way to cross the road.",
    home: "On the way to school, stop at the road. Ask: “Which is the safe way to cross? Why?” Let your child show you, holding your hand.",
    practice: { bankId: "N1-T3-W03-O01", prompt: "Ayo can cross at the zebra crossing or run across the busy road. Which is the safe way?", hint: "Think about what you learned this week.", options: ["The zebra crossing", "Cross with eyes closed", "Cross alone at night", "Run across the busy road"], answer: 0 },
  },
  {
    term: 3, week: 4,
    objective: "I can try another way.",
    skill: "find another route when the path is blocked and walk it to test",
    look: "When the path is blocked, does the child find another route (or swap in the ‘go round’ card) and walk it to test?",
    think: "Say what Ayo can do when a tree blocks his path.",
    thinkText: "A fallen tree (a box) blocks Ayo’s path. Does he give up? What else can he try?",
    moveText: "Walk the taped road. Oh no, “road closed”! Find a way round the box, then keep going.",
    move: [["Walk straight", "/tmc/n1/lesson-art/walk-straight.png"], ["Road closed", "/tmc/n1/lesson-art/road-closed.png"], ["Go round", "/tmc/n1/lesson-art/go-round.png"]],
    rhinobot: "When one way is closed, we try another way. Let’s help Ayo!",
    order: { title: "Find a way round", bookPage: 86, bookInstr: "The road is blocked! Draw a line from Ayo to his house that goes round the block.", prompt: "The road is closed! Plan Ayo’s way home: walk straight, go round the block, then walk straight again.", hint: "Use the ‘go round’ card in the middle.", done: "You found another way. Ayo got home!", cards: [["Walk straight", "/tmc/n1/lesson-art/walk-straight.png", "straight"], ["Go round", "/tmc/n1/lesson-art/go-round.png", "round"], ["Walk straight", "/tmc/n1/lesson-art/walk-straight.png", "straight"]] },
    materials: "A ‘road closed’ box. A taped route on the floor. ‘Walk straight’ and ‘go round’ cards (new). Blocks. Blocked-path pictures and 2 route picture cards per group. Activity Books and crayons.",
    create: "Draw Ayo going a different way.",
    home: "When something does not work (a lid will not open, a toy is stuck), say: “Let’s try another way!” Let your child think of the new way first.",
    practice: { bankId: "N1-T3-W04-O01", prompt: "A box blocks Ayo’s path. What does he do?", hint: "Think about what you learned this week.", options: ["Try another way", "Kick the box", "Go to sleep", "Give up"], answer: 0 },
  },
  {
    term: 3, week: 5,
    objective: "I can build a bridge or ramp and test it.",
    skill: "help build a bridge or ramp, test it with a toy car and use push, pull or roll",
    look: "Does the child help build a bridge or ramp, test it with the toy car, and use push, pull or roll?",
    think: "Say how Ayo’s car can cross the river.",
    thinkText: "Ayo’s toy car must cross a river of blue paper. Can we build a bridge or a ramp? Does it roll if we push it? Why do towers fall?",
    moveText: "Push a big toy car. Pull a box on a string. Roll a ball down a low ramp, then a high one. Cheer when it gets to the end!",
    move: [["Push", "/tmc/n1/lesson-art/push.png"], ["Pull", "/tmc/n1/lesson-art/pull.png"], ["Roll down a ramp", "/tmc/n1/lesson-art/test-ramp.png"]],
    rhinobot: "Builders make things and test them. Let’s build a bridge with Ayo!",
    order: { title: "Strong bridge, push and pull", bookPage: 89, bookInstr: "Circle the strong bridge. Then draw a line from each child to the push arrow or the pull arrow.", prompt: "Ayo’s toy car must cross the river. Tap the steps in order: build, test, then fix.", hint: "Build first. Push the car to test it. If it falls, fix it.", done: "Build, test, fix! That is how engineers work.", cards: [["Build a bridge", "/tmc/n1/lesson-art/bridge.png"], ["Push the car across", "/tmc/n1/lesson-art/push.png"], ["Fix it if it falls", "/tmc/n1/lesson-art/fix-it.png"]] },
    build: { text: "Build a bridge or a ramp with big blocks and card. Push the toy car across the blue paper river. If it falls, make it stronger and test again.", task: "Build it, test it with the car, then make it stronger." },
    materials: "Blue paper ‘river’. Ramp boards or a plank. Big blocks, boxes, card. A large toy car or plastic bottle (wheels fixed). A ball. A box on a string. Build card (blocks → plank → test). Activity Books, crayons.",
    create: "Draw your bridge. Decorate it and give it a name.",
    home: "Make a ramp with a tray or a big book. Roll a ball or a plastic bottle down it. Ask: “What if we make it higher?” Test it and see.",
    practice: { bankId: "N1-T3-W05-O01", prompt: "Ayo’s car must cross the river. What can we build?", hint: "Think about what you learned this week.", options: ["A bed", "A hat", "A cake", "A bridge"], answer: 3 },
  },
  {
    term: 3, week: 6,
    objective: "I can follow an if–then rule.",
    skill: "follow the button rule and match ‘if’ to ‘then’",
    look: "Does the child follow the button rule (red: stop, green: walk) and match ‘if’ to ‘then’?",
    think: "Say what we do if it rains.",
    thinkText: "If it rains, what do we take? If the light is red, what does the car do? If it is dark, what do we switch on?",
    moveText: "Button game! Red card: Ayo-robots stop. Green card: walk. Rain card: make umbrella hands.",
    move: [["Red card: stop", "/tmc/n1/lesson-art/red-circle.svg"], ["Green card: walk", "/tmc/n1/lesson-art/green-square.svg"]],
    rhinobot: "If this happens, then we do that. Let’s learn Ayo’s rules!",
    order: { title: "If… then…", bookPage: 92, bookInstr: "Look at each ‘if’ picture. Draw a line to its ‘then’ picture.", prompt: "Match each ‘if’ to its ‘then’. Tap the rain first, then the red light.", hint: "If it rains, take an umbrella. If the light is red, stop.", done: "If… then… You matched every rule.", cards: [["If it rains", "/tmc/n1/lesson-art/if-rains.png"], ["Take an umbrella", "☂️"], ["If the light is red", "/tmc/n1/lesson-art/if-red-light.png"], ["Stop", "/tmc/n1/lesson-art/stop.png"]] },
    materials: "Red, green and rain cards. ‘If’ and ‘then’ cards per group (rain → umbrella, red → stop, dark → torch). Paper red and green ‘buttons’ (optional). A torch with AA batteries, teacher only. Books, crayons.",
    create: "Draw: if it rains, I…",
    home: "Play “If… then…” at home: “If I clap, then you sit. If I wave, then you stand.” Then let your child make a rule for you.",
    practice: { bankId: "N1-T3-W06-O01", prompt: "If it rains, then we take…", hint: "Think about what you learned this week.", options: ["A spoon", "A sun hat", "An umbrella", "A ball"], answer: 2 },
  },
  {
    term: 3, week: 7,
    objective: "I can move Ayo with 3 cards and fix a wrong card.",
    skill: "lay a 3-card straight route, run it with Ayo and swap back two swapped cards",
    look: "Does the child lay a 3-card straight route, run it with Ayo, and swap back two cards a partner swapped?",
    think: "Say which cards help Ayo reach the market stall.",
    thinkText: "Ayo wants to visit the market stall on the grid. Which cards will help him get there? Let’s play our route games again!",
    moveText: "Grid robots: one square for each ‘forward’ card, freeze on ‘stop’. Road closed? Swap in ‘go round’!",
    move: [["Forward", "/tmc/n1/lesson-art/forward.png"], ["Forward", "/tmc/n1/lesson-art/forward.png"], ["Stop", "/tmc/n1/lesson-art/stop.png"]],
    rhinobot: "Game time! Use your cards to move Ayo to the market stall.",
    order: { title: "Draw Ayo’s path", bookPage: 95, bookInstr: "Look at the cards. Draw Ayo’s path on the grid: one square for each ‘forward’ card. Stop at the stall.", prompt: "The market stall is 2 squares away. Tap Ayo’s cards: forward, forward, stop.", hint: "One square for each ‘forward’ card. Stop at the end.", done: "Ayo reached the market stall!", cards: [["Forward", "/tmc/n1/lesson-art/forward.png", "forward"], ["Forward", "/tmc/n1/lesson-art/forward.png", "forward"], ["Stop", "/tmc/n1/lesson-art/stop.png", "stop"]] },
    materials: "3×3 taped grid. Forward, stop and ‘go round’ cards per team. Cut-out Ayo. A box market stall. A ‘road closed’ box. Activity Books and crayons.",
    create: "Fix Ayo’s cards, then draw his way!",
    home: "Lay 3 slippers in a row. Say “forward, forward, stop”: your child steps one slipper each time. Then mix up the steps and let them fix it.",
    practice: { bankId: "N1-T3-W07-O01", prompt: "The market is 2 squares away. Which cards get Ayo there?", hint: "Think about what you learned this week.", options: ["Forward, forward, stop", "Stop, stop, stop", "Wave, wave", "Forward, stop"], answer: 0 },
  },
  {
    term: 3, week: 8,
    objective: "I can plan and solve a challenge with my team.",
    skill: "plan 3 steps with the team, try another way when blocked and test the plan",
    look: "Does the child plan 3 steps with the team, try another way when blocked, and test the plan?",
    think: "Say Ayo’s problem on the obstacle course.",
    thinkText: "Ayo must take bread through an obstacle course. What is the problem? What small steps? Which way is best? What if it is blocked?",
    moveText: "Obstacle walk: crawl under the table, walk round the boxes, step along the line, then slide the bread down the ramp. No climbing!",
    move: [["Crawl under", "/tmc/n1/lesson-art/crawl-under.png"], ["Walk round", "/tmc/n1/lesson-art/walk-round.png"], ["Follow the line", "/tmc/n1/lesson-art/follow-line.png"]],
    rhinobot: "Big challenge! Let’s plan the obstacle course as a team.",
    order: { title: "Ayo’s way through", bookPage: 98, bookInstr: "Help Ayo bring the bread. Draw his way: under the table, round the boxes, along the line.", prompt: "Help Ayo bring the bread through the course. Tap his way in order.", hint: "Under the table first, then round the boxes, then along the line.", done: "Ayo got through the course!", cards: [["Under the table", "/tmc/n1/lesson-art/crawl-under.png"], ["Round the boxes", "/tmc/n1/lesson-art/walk-round.png"], ["Along the line", "/tmc/n1/lesson-art/follow-line.png"]] },
    materials: "One floor-level course: a table, boxes, a taped line and the W5 ramp. A paper copy of the course per table. Step cards, ‘go round’ cards and a plan card. Cut-out Ayo. Activity Books and crayons.",
    create: "Draw your team’s obstacle course.",
    home: "Make a floor course at home: round a chair, along a rope, under a table. Plan 3 steps together first, then walk it. No climbing.",
    practice: { bankId: "N1-T3-W08-O01", prompt: "Before anyone moves on the course, we…", hint: "Think about what you learned this week.", options: ["Run", "Climb the boxes", "Go home", "Plan 3 steps"], answer: 3 },
  },
  {
    term: 3, week: 9,
    objective: "I can use my thinking steps to solve Ayo’s problem.",
    skill: "say the problem, plan 3 small steps, stop on red and find another way",
    look: "Does the child say the problem, plan 3 small steps, stop on red and find another way when the road is closed?",
    think: "Say Ayo’s problem and the small steps he needs.",
    thinkText: "What is Ayo’s problem? What small steps does he need? Which way is safe? If the light is red, then…?",
    moveText: "Walk Ayo’s bread route on the grid. Red card: stop! Road closed: find another way.",
    move: [["Stop on red", "/tmc/n1/lesson-art/if-red-light.png"], ["Go round", "/tmc/n1/lesson-art/go-round.png"], ["Walk", "/tmc/n1/lesson-art/walk.png"]],
    rhinobot: "The road is blocked! Let’s think it through with Ayo.",
    order: { title: "Ayo’s bread delivery", bookPage: 101, bookInstr: "The road is closed! Draw Ayo’s way from the bread shop to the house. Go round the block.", prompt: "Plan Ayo’s bread delivery: tap the 3 small steps in order.", hint: "First pick up the bread. Give it at the end.", done: "Ayo delivered the bread. You are a thinker!", cards: [["Pick up the bread", "/tmc/n1/lesson-art/ayo-bread.png"], ["Walk the safe way", "/tmc/n1/lesson-art/zebra-crossing.png"], ["Give the bread", "/tmc/n1/lesson-art/come-home.png"]] },
    materials: "Taped grid. A ‘road closed’ box. A box bread shop and paper bread. Red and green cards. 3 step cards per team (pick up bread, walk the safe way, give bread) and a ‘go round’ card. Books, crayons.",
    create: "Draw how Ayo got the bread there, in 3 steps.",
    home: "Next time you buy bread, ask: “What is our problem? What are the small steps? Which way is safe?” Let your child plan the trip with you.",
    practice: { bankId: "N1-T3-W09-O01", prompt: "Ayo must take bread to Grandma, but the road is blocked. What is the problem?", hint: "Think about what you learned this week.", options: ["The road is blocked", "There is no problem", "Grandma is happy", "The bread is yummy"], answer: 0 },
  },
  {
    term: 3, week: 10,
    objective: "I can say the problem, break it small, try another way.",
    skill: "say the problem, break a job into small steps and try another way",
    look: "At the stations: who says the problem, breaks a job into small steps and tries another way without help? Note who needs support.",
    think: "Say which thinking game from this term you like best.",
    thinkText: "Show what you learnt this term! What do thinkers do when there is a problem?",
    moveText: "Play the Term 3 games again: break it small, go round the closed road, help Ayo move and build a ramp or tower.",
    move: [["Break it small", "/tmc/n1/lesson-art/plan-cards.png"], ["Road closed", "/tmc/n1/lesson-art/road-closed.png"], ["Help Ayo move", "/tmc/n1/lesson-art/forward.png"], ["Ramp or tower", "/tmc/n1/lesson-art/test-ramp.png"]],
    order: { title: "Ayo’s Smart Review game", bookPage: 103, bookInstr: "Show what you learnt! Do the 4 small tasks. You can point or say the answer.", prompt: "Review task 1: break the shop trip into small steps. Tap them in order.", hint: "Leave home first. Walk home last.", done: "You broke the big job into small steps.", cards: [["Leave home", "/tmc/n1/lesson-art/leave-home-grown-up.png"], ["Buy bread", "/tmc/n1/lesson-art/shop-buy-bread.png"], ["Walk home", "/tmc/n1/lesson-art/walk-home-bread.png"]] },
    materials: "4 station signs. Problem pictures and if–then cards. Step cards, ‘go round’ cards and a box. A taped grid with forward and stop cards. Big blocks for Station 4. A class list for notes.",
    create: "Draw your favourite problem you solved this term.",
    home: "Ask your child: “What problems did you solve with Ayo this term?” Let them show you one, like going round a block or breaking a job small.",
    practice: { bankId: "N1-T3-W10-O01", prompt: "A big box is in Ayo’s way. What is the problem?", hint: "Think about what you learned this week.", options: ["No problem", "Ayo is happy", "The box is brown", "The box is in the way"], answer: 3 },
  },
  {
    term: 3, week: 11,
    objective: "I can plan in 3 steps, guide Ayo with 3 cards and fix it.",
    skill: "help plan in 3 steps, test and fix the build, and guide Ayo with 3 cards, fixing a wrong card",
    look: "Does the child help plan in 3 steps, test and fix the build, and guide Ayo with 3 cards, fixing a wrong card?",
    think: "Say Ayo’s problem and your team’s plan.",
    thinkText: "What is Ayo’s problem? What small steps do we need? Which way? What if it does not work?",
    moveText: "Finish your ramp or tower. Guide Ayo there: forward, forward, stop. Roll the car. It falls off? Add a block, test again!",
    move: [["Forward", "/tmc/n1/lesson-art/forward.png"], ["Forward", "/tmc/n1/lesson-art/forward.png"], ["Stop", "/tmc/n1/lesson-art/stop.png"]],
    rhinobot: "Project time! Build Ayo’s ramp, plan his route, then test and fix it!",
    order: { title: "Our team build", bookPage: 106, bookInstr: "Colour a star for each thing your team did: we planned, we built and tested, we made a route, we fixed it.", prompt: "Tap your team’s build steps in order.", hint: "Plan first. Fix a card last.", done: "Plan, test, move, fix! Your team’s build is done.", cards: [["Plan the cards", "/tmc/n1/lesson-art/plan-cards.png"], ["Test the ramp", "/tmc/n1/lesson-art/test-ramp.png"], ["Move Ayo", "/tmc/n1/lesson-art/move-ayo.png"], ["Fix a card", "/tmc/n1/lesson-art/fix-card.png"]] },
    build: { text: "Finish your team’s ramp or tower, test it, and change it if it does not work. Then guide Ayo there with 3 cards.", task: "Build and test your ramp or tower, then guide Ayo to it." },
    materials: "One ramp board or tower base per group (2–3 big blocks, teacher-made). Big blocks. A large toy car. Plan cards (blocks → ramp → test). Forward and stop cards. Paper bread. Taped grid. 4-item checklist.",
    create: "Draw your team’s ramp or tower. Say: “Ayo’s problem was… we solved it by…”",
    home: "Ask your child to finish: “Ayo’s problem was… we solved it by…” Listen, then ask: “What did your team fix?”",
    practice: { bankId: "N1-T3-W11-O01", prompt: "Before we build, we…", hint: "Think about what you learned this week.", options: ["Lay the plan cards", "Climb the blocks", "Kick the ramp", "Go home"], answer: 0 },
  },
  {
    term: 3, week: 12,
    objective: "I can show my teacher what I learnt this term at the stations.",
    skill: "say the problem and 3 small steps, find another way, change a build after a test and fix a mistake",
    look: "Can the child say the problem and 3 small steps, find another way, change a build after a test and fix a mistake on their own?",
    think: "Say one thing you can do as a thinker.",
    thinkText: "Show me what you can do! Say it, plan it, fix it. You are a thinker!",
    moveText: "Play the stations: say the problem and 3 small steps, find another way when the road is closed, change your ramp after a test, and put 3 steps in order.",
    move: [["Say it", "/tmc/n1/lesson-art/blocked-path.png"], ["Plan it", "/tmc/n1/lesson-art/plan-cards.png"], ["Fix it", "/tmc/n1/lesson-art/fix-it.png"]],
    order: { title: "Show me what you can do!", bookPage: 108, bookInstr: "My stars: I can say the problem and 3 small steps. I can find another way when the road is closed. I can change my ramp or tower after a test. I can put 3 steps in order and fix a mistake. A grown-up colours a star with you when you can do it on your own.", prompt: "Station: the road is closed! Plan Ayo’s way: walk straight, go round, walk straight.", hint: "Use the ‘go round’ card in the middle.", done: "You found another way on your own.", cards: [["Walk straight", "/tmc/n1/lesson-art/walk-straight.png", "straight"], ["Go round", "/tmc/n1/lesson-art/go-round.png", "round"], ["Walk straight", "/tmc/n1/lesson-art/walk-straight.png", "straight"]] },
    materials: "4-item checklist and record sheet. Problem picture cards. Shop step cards. A ‘go round’ card and a box on the mat. The groups’ W11 ramps and a large toy car. 3 station signs. Paper, crayons.",
    create: "Draw your favourite station game from this term.",
    home: "Ask your child to show you one thing from the My stars page. Colour the star together when they can do it on their own.",
    practice: { bankId: "N1-T3-W12-O01", prompt: "A box is in Ayo’s way on the path. What is the problem?", hint: "Think about what you learned this week.", options: ["The box is in Ayo’s way", "The box is brown", "No problem", "Ayo is happy"], answer: 0 },
  },
  {
    term: 3, week: 13,
    objective: "I can show my family what I learnt and get my Step Thinker badge.",
    skill: "show a card route and say how a mistake was fixed",
    look: "Can the child show a card route and say how a mistake was fixed on their own?",
    think: "Say what you will show your family.",
    thinkText: "Showcase day! Show your family your ramp, your route and how you fixed a mistake.",
    moveText: "Guide Ayo along your card route for your family. Tell them about a mistake and how you fixed it.",
    move: [["Plan", "/tmc/n1/lesson-art/plan-cards.png"], ["Test", "/tmc/n1/lesson-art/test-ramp.png"], ["Fix", "/tmc/n1/lesson-art/fix-card.png"]],
    order: { title: "Showcase and badges", bookPage: 109, bookInstr: "Your Step Thinker · Term 3 badge: “You can say the problem, break a job into small steps, try another way and fix your build!” The Year badge is on page 110.", prompt: "Get ready for the showcase: tap your team’s steps in order.", hint: "Plan first, then build and test, then show.", done: "You are ready to show your family! You are a Step Thinker.", cards: [["Plan the cards", "/tmc/n1/lesson-art/plan-cards.png"], ["Test the ramp", "/tmc/n1/lesson-art/test-ramp.png"], ["Move Ayo", "/tmc/n1/lesson-art/move-ayo.png"], ["Fix a card", "/tmc/n1/lesson-art/fix-card.png"]] },
    materials: "Step Thinker · Term 3 badges and Step Thinker Year certificates. The W11 ramps and towers. Taped grid, route cards and cut-out Ayo. Card for the ‘My year with Ayo’ home card. Smiley-face sheet.",
    create: "Draw yourself getting your Step Thinker badge.",
    home: "Put your child’s badge where the family can see it. Ask them to show you their favourite Ayo game.",
    practice: { bankId: "N1-T3-W13-O01", prompt: "What is our Term 3 big idea?", hint: "Think about what you learned this week.", options: ["Robots can fly", "Cats can talk", "I can solve small problems", "Never try again"], answer: 2 },
  },
];

const PRACTISES: Record<number, readonly string[]> = {
  1: ["Putting steps in order", "Giving and following clear instructions", "Finding and fixing mistakes"],
  2: ["Spotting and continuing patterns", "Saying what comes next", "Sorting by a rule"],
  3: ["Breaking a problem into small steps", "Trying another way", "Planning, building and testing"],
};

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Removes doubled spaces so a line can be read aloud to a child. */
function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function firstSentence(text: string): string {
  return clean(text).split(/(?<=[.!?])\s/)[0];
}

const access = { keyboardOperable: true, touchOperable: true, textAlternative: true } as const;

/** Card ids, made unique, in the correct order. */
function cardIds(cards: readonly Card[]) {
  const used = new Set<string>();
  return cards.map((card) => {
    let id = slug(card[0]);
    while (used.has(id)) id += "-again";
    used.add(id);
    return { id, label: card[0], icon: card[1], matchKey: card[2] };
  });
}

/** Term 2 Week 6 is sorting (by colour), not a repeating pattern. */
const isSorting = (a: WeekAuthoring) => a.term === 2 && a.week === 6;

function cardInstructions(a: WeekAuthoring): string {
  if (isSorting(a)) return "Tap the cards one at a time to put them in their groups.";
  return a.term === 2 ? "Tap the cards one at a time to make the pattern." : "Tap the cards in order: first, next, then last.";
}

function buildOrdering(a: WeekAuthoring, id: string): OrderingExercise {
  const cards = cardIds(a.order.cards);
  // Show the cards out of order: move the first card to the end.
  const shown = [...cards.slice(1), cards[0]];
  return {
    id: `${id}-order`,
    kind: "ordering",
    prompt: a.order.prompt,
    instructions: cardInstructions(a),
    hint: a.order.hint,
    fallback: "Arrange printed or hand-drawn cards on a table with a teacher or caregiver.",
    evidenceMode: "automatic",
    maxAttempts: 3,
    retryPolicy: "allow-until-limit",
    pointsAvailable: 1,
    accessibility: access,
    items: shown.map(({ id: cardId, label, matchKey }) => (matchKey ? { id: cardId, label, matchKey } : { id: cardId, label })),
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

const strip = (cards: readonly Card[]) => cards.map((card) => ({ icon: card[1], label: card[0] }));

function buildDisplay(a: WeekAuthoring, activity: CurriculumActivity): LessonDisplay {
  const icons: Record<string, string> = {};
  for (const card of cardIds(a.order.cards)) icons[card.id] = card.icon;
  const required = isBuildRequired(activity.coreParts);
  return {
    codeTitle: a.order.title,
    thinkStrip: a.order.strip ? strip(a.order.strip) : [],
    moveStrip: strip(a.move),
    moveNote: "Ask a grown-up or classmate to help. Do each action, then talk about what you did.",
    moveButton: "I tried the movement challenge",
    createHeading: "Draw it!",
    createPrompt: a.create,
    createNote: "Can’t draw it yet? Act it or tell it, and a grown-up draws it.",
    createButton: "I finished my creation",
    checkQuestion: a.look,
    checkSkill: a.skill,
    practises: PRACTISES[a.term],
    orderingSuccess: a.order.done,
    icons,
    codeStrip: a.order.strip ? strip(a.order.strip) : undefined,
    rhinobotSays: a.rhinobot,
    buildIntro: a.build?.text ?? (required ? undefined : "Building is optional this week."),
    materials: a.materials,
    footNote: `Try it at home: ${a.home}`,
  };
}

function buildBuildStep(a: WeekAuthoring, activity: CurriculumActivity): LessonStepSpec {
  if (isBuildRequired(activity.coreParts)) {
    return {
      instruction: a.build?.text ?? "Build the model your group planned, then test it.",
      task: a.build?.task ?? "Build the model your group planned, then test it.",
      evidence: "Learner or supervising adult confirms the model was built and tested; this is self-reported, not verified by the app.",
      hint: "Build a little, test it, then change one thing if it does not work.",
      fallback: "No blocks? Use boxes, cups, paper or other safe things you have.",
    };
  }
  return {
    instruction: "Building is optional this week. You can skip this step and continue.",
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
  const orderText = a.order.cards.map((card) => card[0]).join(", then ");
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
        instruction: clean(a.thinkText),
        task: a.think,
        evidence: "Learner or adult confirms the child talked about the question; this is self-reported.",
        hint: "Take your time. There is no wrong answer here.",
        fallback: "A teacher or caregiver can read the pictures and questions aloud; no device is needed.",
      },
      move: {
        instruction: clean(a.moveText),
        task: "Try the movement with a friend or grown-up.",
        evidence: "Learner or supervising adult confirms the movement was attempted; this is self-reported, not sensor verification.",
        hint: "Do one action at a time and keep the order.",
        fallback: "Use safe seated gestures or point to action cards if movement is difficult or unsuitable.",
      },
      code: {
        instruction: `In your Activity Book, page ${a.order.bookPage}: ${clean(a.order.bookInstr)} Now try it on the screen.`,
        task: isSorting(a) ? "Tap the cards to sort them by colour." : a.term === 2 ? "Tap the cards to make the pattern." : "Tap the picture cards in the correct order.",
        evidence: `The interactive order is exactly: ${orderText}. This checks the order on the screen only.`,
        hint: a.order.hint,
        fallback: "Use printed or hand-drawn cards and arrange them on a table.",
        exercise: ordering,
      },
      build: buildBuildStep(a, activity),
      create: {
        instruction: clean(a.create),
        task: "Make your creation, then tell a grown-up about it.",
        evidence: "Learner or supervising adult confirms the creation is done; this is self-reported, not image verification.",
        hint: "Start with the first thing, then add the next.",
        fallback: "Act it or tell it, and a grown-up draws it.",
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
