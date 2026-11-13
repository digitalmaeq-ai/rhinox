/**
 * "Do it together": the screen-free 40-minute lesson from the Nursery 1 Teacher Guide, shown on the
 * week page. The wording is the Teacher Guide's own (approved book, source of truth); only layout
 * changes here. The text was extracted from the guide's lesson-plan pages for all 39 weeks and each
 * lesson was checked to have four parts adding up to 40 minutes. Part names and minutes follow the
 * guide, so they differ in practice, station, assessment and showcase weeks.
 * Plain data with no imports so tests can load it directly.
 */
export interface LessonPart {
  /** The guide's own label for this part, for example "Think", "Stations" or "Book & close". */
  name: string;
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
  parts: readonly LessonPart[];
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
  {
    term: 1,
    week: 4,
    title: "First, Next, Last",
    goal: "Children use first, next and last to put 3 cards in order.",
    words: "first · next · last · order · door",
    youNeed:
      "FIRST–NEXT–LAST strips, one per pair. Action cards (stand up, walk, wave), one set per pair. The classroom door. Cut-out Ayo if you have one. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Stand Ayo by the door. Ask: “Ayo wants to go out. What does he do first?” Hold up 1 finger. “Next?” 2 fingers. “Last?” 3 fingers. Say together: “First stand up, next walk, last wave.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Line-up game: 3 children act stand up, walk, wave, one after another. The class calls out: “First! Next! Last!” Choose new children and play again.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Pairs get a strip and 3 action cards. They put the cards under FIRST, NEXT, LAST so Ayo says goodbye at the door. A friend-robot acts them at the door; the class checks.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children match first, next, last to the pictures, then draw making bread: first mix, next bake, last eat. Close: say the bread steps together.",
      },
    ],
  },
  {
    term: 1,
    week: 5,
    title: "Let’s Fix Mistakes",
    goal: "Children find the two swapped cards in a 3-card routine and swap them back.",
    words: "mistake · wrong · fix · check",
    youNeed:
      "3-card routine sets, one per pair (e.g. wake up, get dressed, walk to school). Socks and shoes for Silly Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Be Silly Ayo: put a shoe on, then try to pull a sock over it. Ask: “What went wrong?” Say: “Mistakes are OK. We find them and we fix them.” Put the sock on first to show the fix.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Silly Ayo game: act 3 morning steps in the wrong order (walk to school, get dressed, wake up). Children call “Stop! Fix it!” and tell you the right order. Act it the right way together. Play 3 rounds.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Bug hunt in pairs: one child swaps two cards in the routine; the partner finds the two in the wrong place and swaps them back. Swap roles. Check by acting it out: one step per card.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children circle the cards in the wrong place, then draw Ayo’s mistake and draw it fixed in the Oops! and Fixed! halves. Close: one more Silly Ayo round; everyone shouts “Stop! Fix it!”",
      },
    ],
  },
  {
    term: 1,
    week: 6,
    title: "Do It Again!",
    goal: "Children do one move 3 times using the ‘do it again’ card.",
    words: "again · repeat · times · dance · same",
    youNeed:
      "‘Do it again’ ↻ cards, 2 per group. Move cards (clap, stamp, jump), one set per group. A taped jumping line (optional). Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Clap 3 times. Ask: “What did I do again and again?” Then ask: “What else do we do again and again?” (brushing teeth, clapping in a song). Say together: “Again, again!”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Robot dance: “Clap! Do it again! Do it again!” = 3 claps. Then stamp 3 times and jump 3 times. Children hold up 3 fingers to show how many times. Count out loud each time.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Show a clap card with two ↻ cards under it. Say: “↻ means do that card again.” Act it: 3 claps. Groups choose one move, lay it with 2 ↻ cards and do it while the class counts.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children colour the move Ayo repeats, count the claps, then draw Ayo doing one move 3 times. Close with an action rhyme the class knows.",
      },
    ],
  },
  {
    term: 1,
    week: 7,
    title: "Practice & Play: Robot Says Games",
    goal: "Children replay Weeks 1–6: follow and give commands, order 3 cards and swap back two swapped cards.",
    words: "step · order · command · first · next · last · fix · again",
    youNeed:
      "All Term 1 card sets (routine, command, first–next–last, ↻). Game station signs. Open floor space. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 5,
        text: "Ask: “Which Ayo game do you like best?” Show the station signs and name each game. Say: “No new game today. We play our robot games again and catch Silly Ayo’s mistakes!”",
      },
      {
        name: "Move",
        minutes: 15,
        text: "Groups of 4–6 rotate round the games: Robot Says, Morning Order, First–Next–Last line-up, Silly Ayo: Stop! Fix it!, Robot dance. Clap to move groups. Sit with the children who need more help.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Card challenge in pairs: one child lays 3 routine or command cards; the other acts them. Then the first child swaps two cards; the partner swaps them back. Swap roles so every child is Ayo and commander.",
      },
      {
        name: "Book & close",
        minutes: 8,
        text: "Children circle the 2 cards in the wrong place in each row and draw their favourite Robot Says game (or circle the game card they like best). Close: one big Robot Says round together.",
      },
    ],
  },
  {
    term: 1,
    week: 8,
    title: "Practice & Play: Pictures Tell a Story",
    goal: "Children order 3–4 story pictures, retell them and swap back two swapped pictures.",
    words: "story · beginning · end · retell · first · last",
    youNeed:
      "Story sets: Ayo’s market trip (4 cards) and the Jack and Jill strip, one per group. Cereal-box strips and glue (optional). Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Hold up the 4 market cards mixed up. Ask: “Did Ayo buy bread before he left home? What happens first?” Move the cards as children answer. Retell together: “First…, next…, last…”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Act out Jack and Jill in order: up the hill, fetch water, fall down (sit down slowly), tumble after (roll gently). Then swap two parts: “Fall down, fetch water…” Children shout “Fix it!” and act the right order.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Story circle: groups of 4–6 order a mixed-up story set and act it for the class. Then a friend swaps two cards and the group swaps them back. Give 3-card sets to children who need more help.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children number the story pictures and draw the end of Ayo’s story (or circle what happens last). Close: one group retells the market trip: “First…, next…, last…”",
      },
    ],
  },
  {
    term: 1,
    week: 9,
    title: "Following a Path",
    goal: "Children plan 3 cards before acting, run them on a straight path and fix a wrong card.",
    words: "path · forward · stop · plan · follow",
    youNeed:
      "Forward and stop cards per team. Masking tape for a straight path. A box school gate. A zebra-crossing picture. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Stand Ayo at the start of the path. Say: “Ayo must walk straight to the school gate. Before he moves, we plan all the cards.” Lay forward, forward, stop. Ask: “What if one card is wrong?”",
      },
      {
        name: "Move",
        minutes: 8,
        text: "Walk the line: children walk the straight path like robots, one step per ‘forward’ card, and freeze on ‘stop’. No turns. Small groups take turns while the others count the steps.",
      },
      {
        name: "Code",
        minutes: 14,
        text: "Teams of 3 (planner, robot, checker). The planner lays 3 cards before anyone moves. The robot child walks the path one step per card (one team uses cut-out Ayo). The checker says if the gate was reached. Fix any wrong card; rotate roles.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children trace Ayo’s path, circle the stop card, then draw the path and the 3 cards he used (or circle them). Close: one team shows plan, run, fix to the class.",
      },
    ],
  },
  {
    term: 1,
    week: 10,
    title: "Revision & Reinforcement",
    goal: "Children practise all Term 1 skills at 4 stations; the teacher notes who needs support.",
    words: "step · order · first · next · last · fix · again · path",
    youNeed:
      "Station signs. Week 1–9 card sets: routine cards, ↻ cards, forward and stop cards. A taped straight path. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 5,
        text: "Quick recall: show a routine card. Children say “first”, “next” or “last” and act it. Do 4–5 cards quickly.",
      },
      {
        name: "Stations",
        minutes: 20,
        text: "Groups of 4–6 rotate: 1 Order the Cards (first, next, last) · 2 Fix Silly Ayo · 3 Do It Again · 4 Straight Path (Robot Says on the taped line). Clap to rotate every 5 minutes. Note who needs support.",
      },
      {
        name: "Code",
        minutes: 8,
        text: "Pairs put 3 cards in order from memory and act them to check. Then one child swaps two cards; the partner swaps them back.",
      },
      {
        name: "Book & close",
        minutes: 7,
        text: "Children do the 4 small review tasks: number the morning, catch Silly Ayo’s 2 cards, colour a circle for each clap, trace 2 steps and circle stop. Then they draw their favourite Ayo game. Close: “Who can tell Ayo what comes first?”",
      },
    ],
  },
  {
    term: 1,
    week: 11,
    title: "Mini-project: Robot Says with Ayo",
    goal: "Teams program cut-out Ayo with 3 picture cards, check the order and swap back two swapped cards.",
    words: "program · first · next · last · fix",
    youNeed:
      "Cut-out Ayo (one per team if you can make them; otherwise teams share and take turns). Picture cards. Box targets (gate or market stall). Masking tape for straight paths. Station 1 checklist. Activity Books, crayons.",
    parts: [
      {
        name: "Think",
        minutes: 5,
        text: "Ask: “What does Ayo need from us?” Hold up 3 cards: “Three cards in the right order…” Mix them up: “…and a check for mistakes!” Give out role cards: card-layer, robot, checker.",
      },
      {
        name: "Code & Build",
        minutes: 15,
        text: "Teams stand cut-out Ayo at the start of the path and add a box target. The card-layer lays a final 3-card program. A partner swaps two cards; the team swaps them back. Stretch: 4 cards or a ↻ card.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Teams act their program as friend-robots, then move cut-out Ayo one step per card to the target. Meanwhile take one small group at a time to Station 1 (about 4 min each) and tick the checklist.",
      },
      {
        name: "Present & close",
        minutes: 10,
        text: "Teams present: “Ayo goes first…, next…, last…” Children colour their build checklist and draw their 3 cards. Show another class if you can.",
      },
    ],
  },
  {
    term: 1,
    week: 12,
    title: "Assessment",
    goal: "See every child do the 4 checklist items at Station 1. No written test.",
    words: "step · order · first · next · last · fix · again",
    youNeed:
      "4-item checklist and record sheet. Routine cards. ↻ cards. Station signs. Drawing paper and crayons. Cut-out Ayo.",
    parts: [
      {
        name: "Warm-up",
        minutes: 5,
        text: "Play one quick Robot Says round so children feel relaxed. Say: “Today we play our Ayo stations. There is no test!”",
      },
      {
        name: "Set up",
        minutes: 3,
        text: "Show the 3 station signs. Station 1 is with you. Station 2 is Robot Says practice. Station 3 is draw ‘Me and Ayo’. Send groups of 4–6 to their first station.",
      },
      {
        name: "Stations",
        minutes: 27,
        text: "At Station 1, each child orders 3 routine cards → says first, next, last → does one move 3 times with ↻ cards → swaps back the two cards you swapped. Tick the checklist. Clap to rotate groups.",
      },
      {
        name: "Close",
        minutes: 5,
        text: "Praise every child: “Ayo is proud of you!” Note who has not been seen; check them next period or on Week 13 morning.",
      },
    ],
  },
  {
    term: 1,
    week: 13,
    title: "Showcase & Badges",
    goal: "Children show families their 3-card programs and receive the Step Thinker · Term 1 badge.",
    words: "step · order · first · next · last · fix · again",
    youNeed:
      "Badges and certificates. Card for the take-home ‘My Ayo steps’. The Week 11 builds. A taped straight path. Cut-out Ayo. Picture cards.",
    parts: [
      {
        name: "Check & think",
        minutes: 8,
        text: "Ask: “What can you do now that you could not do at the start of term?” Read each ‘I can’ aloud; children show a smiley face for each one. Praise every child.",
      },
      {
        name: "Showcase",
        minutes: 15,
        text: "Children run Ayo’s straight route for families and explain the steps. They show their 3-card program, say first, next, last, and swap back two cards a family member swaps.",
      },
      {
        name: "Create",
        minutes: 7,
        text: "Children make a ‘My Ayo steps’ card to take home: 3 steps they can do, with first, next, last.",
      },
      {
        name: "Badges",
        minutes: 10,
        text: "Badge ceremony: give the Step Thinker · Term 1 badge to children Secure on the checklist. Praise every child’s best work and celebrate stretch work. End with one Robot Says round.",
      },
    ],
  },
  {
    term: 2,
    week: 1,
    title: "What is a Pattern?",
    goal: "Children copy an AB colour pattern and continue it by 2 more.",
    words: "pattern · repeat · same · next · colour",
    youNeed:
      "Red and blue paper (one per child). Colour cards and large card counters (bigger than a toilet-roll opening), one set per pair. Cut-out Ayo. Open floor space. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Hold cut-out Ayo. Lay red, blue, red, blue cards in front of him. Say: “Ayo’s lights go red, blue, red, blue. What comes next?” Add the card they say. Ask: “Where in our classroom do you see something that goes again and again?” Then contrast: clap, clap, clap is doing it again; clap, stamp, clap, stamp is a pattern.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Give out red and blue paper. Start a line: red, blue, red, blue. Ask the next child: “Which colour joins now?” The class checks: “Red, blue, red, blue. Yes!” Keep going until 8–10 children stand in the line, then start a new line.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Show a strip: red, blue, red, blue. Pairs copy it with colour cards or large card counters, then add 2 more. The class checks together. No bottle caps or small pieces; count counters in and out.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children colour what comes next and circle the pattern, then colour Ayo’s lights: red circle, blue square, again and again. Close: say the pattern together, “red, blue, red, blue…”, and ask: “What comes next?”",
      },
    ],
  },
  {
    term: 2,
    week: 2,
    title: "Move in Patterns",
    goal: "Children move in a repeating 2-move pattern and continue it with 2 more moves.",
    words: "pattern · move · march · jump · dance",
    youNeed:
      "Move cards (march, jump, clap, stamp), one set per group of 4. A masking tape line on the floor. Cut-out Ayo. Open floor space. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Hold up cut-out Ayo and act his dance: march, jump, march, jump. Freeze and ask: “What will Ayo do next?” Do it together. Ask: “Can our bodies make patterns too?”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Children line up on the tape line. Say “March, jump, march, jump!” and everyone moves along the line. Then change to “Clap, stamp, clap, stamp!” Go slowly. No turning moves; skipping is for Stretch only.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Lay 4 move cards on the floor: march, jump, march, jump. The class dances them, then a child adds 2 more cards. Then groups of 4: the leader shows a 2-move pattern; the group copies and continues it. Swap leaders.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children circle Ayo’s next dance move (march or jump) and draw it, then draw their own 2-move pattern in the A, B, A, B boxes and show a friend. Close: the whole class dances one robot pattern together.",
      },
    ],
  },
  {
    term: 2,
    week: 3,
    title: "Hear the Pattern",
    goal: "Children listen to a sound pattern, clap it back and continue it.",
    words: "sound · beat · clap · loud · quiet · pattern",
    youNeed:
      "Clap and stamp cards. An adult-made sealed bottle shaker. An upturned plastic-bowl drum. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Be Ayo: “Beep, boop, beep, boop.” Ask: “What sound comes next?” Point to your ear: “We hear with our ears,” then your eye: “and see with our eyes.” Say: “A microwave and a car reversing beep patterns too.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Call and response. Clap, stamp, clap, stamp; the class copies, then continues it. Try it loud, then quiet. Use the bowl drum for a new pattern: drum, clap, drum, clap.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Lay clap and stamp cards in a strip: clap, stamp, clap, stamp. Point to each card as the class plays it. Then a sound circle in groups: one child plays a pattern on the shaker or bowl drum; the group copies and continues it.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children circle the sound that comes next, then draw a beep code for Ayo and play it for a friend. Close: one class clap pattern, loud then quiet.",
      },
    ],
  },
  {
    term: 2,
    week: 4,
    title: "See the Pattern",
    goal: "Children make, build and continue a shape-pattern track and walk cut-out Ayo along it.",
    words: "circle · square · triangle · shape · build · track",
    youNeed:
      "Shape cards (circle, square, triangle) per group. Big blocks, boxes and large card shapes. Paper circles, squares and triangles. Cut-out Ayo. Glue, Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 6,
        text: "Show Ayo’s road: circle, square, circle, square. Ask: “What comes next?” Hold up a ball and a box: “A ball is round, like a circle. A box is square.”",
      },
      {
        name: "Move",
        minutes: 6,
        text: "Pattern hop: children hop along the shape track 4–6 at a time, saying each shape aloud: “Circle, square, circle, square!” The others chant with them. Tape 2–3 tracks if you have space.",
      },
      {
        name: "Code & build",
        minutes: 18,
        text: "Lay a shape strip with cards; a friend adds 2 more. Then groups of 4–6 build Ayo’s pattern road with big blocks, boxes and card shapes in an AB pattern. Another group checks it and adds 2 pieces. Walk Ayo along each road.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children draw the next shape and match the ball and the box to their shapes, then glue paper shapes in a pattern. Close: say one road pattern together.",
      },
    ],
  },
  {
    term: 2,
    week: 5,
    title: "Finish What Comes Next",
    goal: "Children predict the next item or move in a pattern, then check.",
    words: "next · predict · guess · check · missing",
    youNeed:
      "Pattern strips with a gap. Large card counters (bigger than a toilet-roll opening) and a plastic cup per pair. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Act Ayo: step, clap, step, clap… freeze! Ask: “What will Ayo do next?” Then: “How did you know?” Say: “Let’s check!” and do the step.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Guess and check. You are the robot: do a pattern (march, jump, march, jump…) and freeze. Children whisper the next move to a partner, then you show it. Cheer when they are right. Repeat with new patterns.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Show a strip with a gap. Say “1–2, 1–2” and point; children choose the missing card. Then pairs: one makes a card-counter pattern and hides the next counter under a cup; the partner predicts, then lifts the cup. Large counters only.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children draw what comes next and circle the missing piece, then draw a pattern with the last box empty for a friend to finish. Close: one class Freeze and Guess.",
      },
    ],
  },
  {
    term: 2,
    week: 6,
    title: "Sorting is Smart",
    goal: "Children sort objects by one feature into 2–3 groups and say their rule.",
    words: "sort · group · same · different · rule",
    youNeed:
      "2–3 hoops (or chalk circles). A basket of big objects (fruit pictures, big blocks, large card counters). Sorting picture cards. Red, blue and yellow cards. Cut-out Ayo. Activity Books.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Show a mixed basket: “Ayo’s market basket is mixed up: tomatoes, peppers, bananas and corn.” Ask: “How can he put them in groups?” Sort one way together, then ask: “What is our rule?”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Sorting robots. Children carry objects to the hoops by colour. Then give out red, blue and yellow cards; each child walks to the matching hoop. Check: “Is everyone in the red hoop holding red?”",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Groups sort picture cards into 2–3 groups by one rule (colour, shape, or animal / not animal) and say the rule. Then a group sorts a basket of big objects; another group guesses the rule.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children match each thing to its colour basket, then draw a group of things that are all the same colour, or use their groups to make a pattern. Close: hold up one object and ask: “Which group? Why?”",
      },
    ],
  },
  {
    term: 2,
    week: 7,
    title: "Practice & Play: Pattern Games",
    goal: "Children practise copying, continuing and predicting AB patterns and sorting by one rule.",
    words: "pattern · repeat · next · shape · sort · rule",
    youNeed:
      "Hoops; pattern strips with gaps; the Week 4 shape track; large card counters; move, sound and colour cards; game signs. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 5,
        text: "Ask: “Which pattern game do you like best?” Show the game signs and name each one. Say: “Today we play them all again!” No new game this week.",
      },
      {
        name: "Move",
        minutes: 15,
        text: "Game rotation in groups of 4–6: Pattern Line, Robot Dance copy-and-continue, Clap Back, Pattern Hop on the shape track, Freeze and Guess, Sorting Robots. Stay with children who need more help continuing patterns.",
      },
      {
        name: "Code",
        minutes: 10,
        text: "Card challenge in pairs: one lays a 4-card AB pattern with a gap; the partner fills the gap and adds 2 more. Then swap. Every child continues one move pattern and one card pattern.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children colour what comes next and draw their favourite game (or circle it) in the Activity Book. Close: one Freeze and Guess with the whole class.",
      },
    ],
  },
  {
    term: 2,
    week: 8,
    title: "Practice & Play: Make Your Own",
    goal: "Children copy an AB pattern, change one part, then make their own AB pattern for Ayo.",
    words: "make · my own · change · pattern",
    youNeed:
      "Move cards; blank pattern strips; paper scraps or pieces of local fabric; glue. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Say: “You know lots of patterns now!” Show a move strip: clap, jump, clap, jump. Ask: “What if we change jump to stamp?” Swap the cards and dance it together.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Pattern party. Children copy your AB dance (march, clap, march, clap). Then change one move together. Then pairs make their own AB dance and show it to Ayo.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Use–Modify–Create stations in groups of 4–6. Each child makes a new AB strip: 2 move cards laid 3 times (A B A B A B) for a friend to dance. Stay with children who need more help.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children draw their own AB pattern in the boxes, then make one with paper or fabric pieces and glue it in. Close: 2–3 children show their pattern to the class.",
      },
    ],
  },
  {
    term: 2,
    week: 9,
    title: "Patterns Are Everywhere",
    goal: "Children find a 2-part repeat in familiar things and copy it with cards.",
    words: "fabric · nature · Ankara · pattern · find",
    youNeed:
      "Samples with a clear 2-part repeat: 2-colour striped cloth, a zebra picture, 2-colour tiles. Ankara or adire for look-and-talk. AB cards. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Show the striped cloth, zebra and tiles. Ask: “What repeats?” Run a finger along: “Black, white, black, white.” Then show Ankara and a pineapple: “Look at the shapes!” Just talk; no copying.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Classroom pattern walk in teams. Find patterns on floor tiles, window bars, a uniform and fabric. Each team shows 2 patterns. Then everyone copies one with their body (e.g. clap, stamp).",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Give each team a striped or tiled sample. Point and say the 2-part repeat together. The team copies it with AB cards, then adds 2 more. Use only samples with a clear 2-part repeat.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children circle the patterns and draw one they found. Close: say together, “Patterns are everywhere!” Ask children to look for one at home.",
      },
    ],
  },
  {
    term: 2,
    week: 10,
    title: "Revision & Reinforcement",
    goal: "Children copy, continue and predict patterns and sort by one rule; you note who needs support.",
    words: "All Term 2 words: pattern · repeat · next · sort · rule",
    youNeed:
      "Station signs; colour and shape pattern strips; hoops and picture cards; the shape track; clap and stamp cards; step cards. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 5,
        text: "Quick recall: clap a pattern or show a strip, then stop. Children say what comes next, then do it. Repeat 3 times: colour, move, sound.",
      },
      {
        name: "Stations",
        minutes: 20,
        text: "Station rotation in groups of 4–6, 5 minutes each: 1 Copy and Continue (colour or shape strip) · 2 Clap the Pattern: What Comes Next? · 3 Sorting Robot · 4 Pattern Hop on the shape track. Note who needs support.",
      },
      {
        name: "Code",
        minutes: 7,
        text: "Children continue a 3-card pattern from memory. Then a separate step check: lay 3 step cards in order, swap two, and ask the child to swap them back. Note observed / not yet.",
      },
      {
        name: "Book & close",
        minutes: 8,
        text: "Activity Book: children do the 4 small review tasks (colour what comes next, circle the next move, sort fruit by colour, make their own bead pattern), then draw their favourite pattern. Close: “Next week we build Ayo’s Robot Dance!”",
      },
    ],
  },
  {
    term: 2,
    week: 11,
    title: "Mini-project: Ayo’s Robot Dance",
    goal: "Teams lay their own AB move pattern 3 times, dance it and ask the audience what comes next.",
    words: "pattern · repeat · next · my own",
    youNeed:
      "Move cards per team; paper shapes for Ayo’s belt; glue or tape; cut-out Ayo (one per team if you can, or teams share); build cards; the 4-item checklist and record sheet. Activity Books, crayons.",
    parts: [
      {
        name: "Think",
        minutes: 5,
        text: "Ask: “What makes a good robot dance?” Agree: “A pattern that repeats, that friends can copy and continue.” Show a strip: clap, jump laid 3 times.",
      },
      {
        name: "Code & build",
        minutes: 20,
        text: "Teams with roles: card-layer, robot, checker. Lay 2 move cards 3 times (A B A B A B); no card, lay it in full. The checker swaps one move card; the team finds the wrong card and fixes it. Add a pattern belt to Ayo. Meanwhile, take one small group at a time to Station 1 (about 4 min each).",
      },
      {
        name: "Show",
        minutes: 10,
        text: "Each team dances its pattern 3 times for another class, then stops and asks: “What comes next?” The audience answers. The team says: “Our pattern is… and it repeats.”",
      },
      {
        name: "Book & close",
        minutes: 5,
        text: "Children tick the build card and draw their team’s dance. Close: cheer every team.",
      },
    ],
  },
  {
    term: 2,
    week: 12,
    title: "Assessment: Station Check",
    goal: "See every child do the 4-item checklist at Station 1. No written test.",
    words: "All Term 2 words",
    youNeed:
      "4-item checklist and record sheet; pattern strips; 6 picture cards and 2 hoops; move cards; station signs; paper and crayons for Station 3.",
    parts: [
      {
        name: "Warm-up",
        minutes: 3,
        text: "One quick pattern clap: clap, stamp, clap, stamp. Children copy and continue it. Keep it relaxed and fun.",
      },
      {
        name: "Set up",
        minutes: 5,
        text: "Show the 3 station signs. Station 1: with me. Station 2: Sorting Robot practice (not judged). Station 3: draw ‘Me and Ayo’s pattern’. Put children in groups of 4–6.",
      },
      {
        name: "Stations",
        minutes: 27,
        text: "Groups rotate. At Station 1 each child: continues an AB strip by 2 cards → says what comes next → sorts 6 picture cards into 2 hoops and says the rule → makes and performs their own AB pattern. About 4 min per group; tick as you go.",
      },
      {
        name: "Close",
        minutes: 5,
        text: "Praise every child: “You worked like smart thinkers!” Note anyone not yet seen and check them on Week 13 morning.",
      },
    ],
  },
  {
    term: 2,
    week: 13,
    title: "Showcase & Badges",
    goal: "Children show families their patterns. Badges go to children Secure on the Term 2 checklist.",
    words: "All Term 2 words",
    youNeed:
      "Step Thinker · Term 2 badges and certificates; card for the ‘My pattern’ take-home; pattern strips; shape tracks and decorated Ayos; smiley-face sheets.",
    parts: [
      {
        name: "Think",
        minutes: 5,
        text: "Ask: “What can you do now that you could not do at the start of term?” Read each ‘I can’; children colour a smiley face for each one.",
      },
      {
        name: "Showcase",
        minutes: 15,
        text: "Children run showcase stations. They dance Ayo’s pattern for families and ask: “What comes next?” They show their pattern strips, the shape-pattern tracks and the decorated Ayos.",
      },
      {
        name: "Create",
        minutes: 10,
        text: "Children make a ‘My pattern’ card to take home: draw an AB pattern, then tell a family member what comes next.",
      },
      {
        name: "Badges",
        minutes: 10,
        text: "Badge ceremony: give Step Thinker · Term 2 badges to children Secure on the checklist. Celebrate Stretch work too. Say: “Next term we solve problems with steps and patterns!”",
      },
    ],
  },
  {
    term: 3,
    week: 1,
    title: "What is a Problem?",
    goal: "Children look at a picture or a scene and say what the problem is.",
    words: "problem · stuck · help · solve · safe",
    youNeed:
      "4 problem picture cards per group (blocked path, spilled water, broken toy, danger sign). A big box. Cut-out Ayo. Taped floor grid if you have one. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Stand cut-out Ayo behind the big box. Say: “Ayo wants to go to the school gate. Oh no!” Ask: “What is the problem? How do you know?” Help them say: “The box is in the way. Ayo is stuck.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Problem acting. Act a small problem for the class: shoelace undone, door shut, water spilled (pretend, no real water). Ask: “What is the problem?” Then let 2–3 children act one each while the class says the problem.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Problem spotters. Each group of 4–6 gets the 4 cards. Children point to what is wrong in each card and say it: “The path is blocked.” Walk round and ask each group: “What stops Ayo?”",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Children circle the problem in each picture, then draw a time they had a problem and who helped (or circle the problem pictures). Close: stand Ayo behind the box. Everyone says: “The problem is… Ayo is stuck!”",
      },
    ],
  },
  {
    term: 3,
    week: 2,
    title: "Break It Small",
    goal: "Children say the small steps of a big job, then lay 3 step cards in order before acting.",
    words: "big job · small steps · break · part · shop",
    youNeed:
      "3 shop step cards per group (leave home, buy bread, go home). A box shop with paper bread. Practical corner: a mat to roll; a jug, a bowl and large card counters (bigger than a toilet-roll opening). Books, crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Say: “Ayo must go to the shop to buy bread. That is a big job!” Ask: “What small steps does he do?” Let children say them in their own words before you show any cards. Then lay the 3 cards in order together.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Act the plan: leave home (hold a grown-up’s hand to cross the road) → buy bread at the box shop → go home. Say each step before you act it. Repeat with new children. Ready children add “pay” as a 4th step.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Groups say the small steps aloud, then lay the 3 cards in order; one child acts them. Practical corner: groups break “roll a mat” or “pour big card counters from a jug into a bowl” into small steps and act them.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children join 1, 2, 3 to the small steps in order, then draw 3 small steps of a job they do. Close: “A big job is easier when we break it small!”",
      },
    ],
  },
  {
    term: 3,
    week: 3,
    title: "Choose the Right Way",
    goal: "Children choose the safe one of two ways and say why it is safe.",
    words: "choose · safe · danger · zebra crossing · why",
    youNeed:
      "Masking tape for two routes to one box. A paper zebra crossing. 2 route picture cards per pair (zebra crossing, busy road). Choice cards. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Show Ayo at the road. Say: “Ayo can cross at the zebra crossing, or run across the busy road.” Ask: “Which is the right way? Why?” Help them say: “The zebra crossing is safe. Cars stop there.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Two-route walk, 6 children at a time. Each child walks the zebra crossing route to the box and says why it is safe. Nobody runs. Point to the “busy road” route: “Is this safe? No!”",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Pairs get the two route picture cards and point to the safe one for Ayo. Then choice cards: pairs pick the safe picture of two and show the class. Ask each pair: “Why is it safe?”",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children point to and tick the safe way in each pair, then draw the safe way to cross the road. Close: everyone points to the safe route card: “I choose the safe way!”",
      },
    ],
  },
  {
    term: 3,
    week: 4,
    title: "Try Another Way",
    goal: "Children find another way when the path is blocked and test it by walking it.",
    words: "blocked · another way · try again · go round",
    youNeed:
      "A ‘road closed’ box. A taped route on the floor. ‘Walk straight’ and ‘go round’ cards (new). Blocks. Blocked-path pictures and 2 route picture cards per group. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Put the box on Ayo’s path. Say: “A tree fell down! Does Ayo give up?” Children answer: “No!” Ask: “What else can he try?” Take 2–3 ideas: go round this side, go round that side.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Road closed. Children walk the taped route, 6 at a time. Put down the ‘road closed’ box and say: “Find another way!” They walk round it and keep going. Praise children who stop and think first.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Show a blocked-path picture; groups choose the other way from 2 cards. Lay ‘walk straight’; close the road and swap it for ‘go round’; a child walks it to test. Teams find two routes to the same target and walk both.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children draw Ayo’s way round the block, then draw Ayo going a different way. Close: put the box down once more. Everyone says: “Road closed? Try another way!”",
      },
    ],
  },
  {
    term: 3,
    week: 5,
    title: "Let’s Build It!",
    goal: "Children build a bridge or ramp from big blocks, test it with a toy car, and try another way if it falls.",
    words: "bridge · ramp · tower · strong · test · push · pull · roll",
    youNeed:
      "Blue paper ‘river’. Ramp boards or a plank. Big blocks, boxes, card. A large toy car or plastic bottle (wheels fixed). A ball. A box on a string. Build card (blocks → plank → test). Activity Books, crayons.",
    parts: [
      {
        name: "Think",
        minutes: 6,
        text: "Lay down the blue paper river. Say: “Ayo’s toy car must cross the river.” Ask: “Can we build a bridge or a ramp? What makes a tower fall?” Show the 3 plan cards: blocks → plank → test.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Push, pull, roll in 3 corners, groups rotating: push the big toy car; pull the box on a string; roll a ball or bottle down a low ramp, then a higher one. Ask: “Which went further?” Cheer when it reaches the end.",
      },
      {
        name: "Build",
        minutes: 16,
        text: "Groups of 4–6 follow the plan cards: blocks → plank → test. They build a tower, bridge or ramp and test it with the toy car. If it falls, try another way and test again. No climbing on builds.",
      },
      {
        name: "Book & close",
        minutes: 8,
        text: "Activity Book: children circle the strong bridge and match push and pull, talk through test, change one thing, test again, then draw and name their bridge. Close: one group shows the car crossing. Everyone: “We built it and tested it!”",
      },
    ],
  },
  {
    term: 3,
    week: 6,
    title: "If This Happens…",
    goal: "Children follow a simple if–then rule (if red, then stop) and match ‘if’ cards to ‘then’ cards.",
    words: "if · then · happens · because · stop",
    youNeed:
      "Red, green and rain cards. ‘If’ and ‘then’ cards per group (rain → umbrella, red → stop, dark → torch). Paper red and green ‘buttons’ (optional). A torch with AA batteries, teacher only. Books, crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Ask: “If it rains, what do we take?” (An umbrella!) “If the light is red, what does the car do?” (Stop!) “If it is dark?” (Switch on a torch.) Say: “A torch only works if it has power. Ayo follows rules like this too.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Button game. Children are Ayo-robots. Show red: they stop. Green: they walk. Rain: umbrella hands. Go slowly, then faster. Then pairs: one child shows red or green, the friend-robot follows the rule; swap.",
      },
      {
        name: "Code",
        minutes: 12,
        text: "Groups match each ‘if’ card to its ‘then’ card. Ask: “If it is dark, then…?” Then a 2- minute demo: hold the torch and say “If I switch on, then…” Children answer. Only you hold the torch.",
      },
      {
        name: "Book & close",
        minutes: 10,
        text: "Activity Book: children match each ‘if’ to its ‘then’, then draw “If it rains, I…”. Close: one last button game with red and green: “If red, then stop. If green, then go!”",
      },
    ],
  },
  {
    term: 3,
    week: 7,
    title: "Practice & Play: Help Ayo Move",
    goal: "No new concept. Children replay straight 3-card routes, find another way and swap back swapped cards.",
    words: "forward · stop · path · another way · fix",
    youNeed:
      "3×3 taped grid. Forward, stop and ‘go round’ cards per team. Cut-out Ayo. A box market stall. A ‘road closed’ box. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 6,
        text: "Show Ayo on START and the stall at FINISH. Ask: “Which cards will help Ayo get there?” Lay forward, forward, stop together. Say: “No new work today. We play our route games again!”",
      },
      {
        name: "Move",
        minutes: 12,
        text: "Grid robots. Children walk one square per ‘forward’ card and freeze on ‘stop’. Put down the ‘road closed’ box. Ask: “What now?” Swap in the ‘go round’ card and walk round it.",
      },
      {
        name: "Code",
        minutes: 14,
        text: "Teams of 3 (card-layer, robot, checker) lay forward, forward, stop and push cut-out Ayo one square per card. A partner swaps two cards; the team swaps them back. Rotate roles. Sit with children who need more help.",
      },
      {
        name: "Book & close",
        minutes: 8,
        text: "Activity Book: children draw Ayo’s path on the grid, one square per ‘forward’ card, then fix Silly Ayo’s wrong card and draw his straight way to the market. Close: one team shows its route as everyone says the cards.",
      },
    ],
  },
  {
    term: 3,
    week: 8,
    title: "Practice & Play: Big Challenge",
    goal: "Children plan a route with 3 step cards, test it with their team, and try another way when it is blocked.",
    words: "plan · challenge · obstacle · team",
    youNeed:
      "One floor-level course: a table, boxes, a taped line and the W5 ramp. A paper copy of the course per table. Step cards, ‘go round’ cards and a plan card. Cut-out Ayo. Activity Books and crayons.",
    parts: [
      {
        name: "Think",
        minutes: 6,
        text: "Say: “Ayo must take bread through the course.” Ask: “What is the problem? What are the small steps? Which way is best? What if it is blocked?” Say: “No new work today. We use all our Term 3 thinking.”",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Obstacle walk, at most 6 children on the course at once: crawl under the table, walk round the boxes, step along the line, then slide the bread down the ramp. Others watch and cheer. Remind them: “No climbing on boxes.”",
      },
      {
        name: "Code",
        minutes: 16,
        text: "At tables, teams plan the route with 3 step cards and test it with cut-out Ayo on the paper course. Then teams walk the floor course in turn. Block one part: they swap in ‘go round’ and test again. Help those who need it.",
      },
      {
        name: "Book & close",
        minutes: 8,
        text: "Activity Book: children draw Ayo’s way under, round and along, then draw their team’s obstacle course. Close: “We planned, we tested, we fixed. We solved the challenge!”",
      },
    ],
  },
  {
    term: 3,
    week: 9,
    title: "I Am a Thinker",
    goal: "Children say the problem, plan 3 small steps, stop on red and find another way when the road is closed.",
    words: "problem · small steps · safe way · another way · if · then",
    youNeed:
      "Taped grid. A ‘road closed’ box. A box bread shop and paper bread. Red and green cards. 3 step cards per team (pick up bread, walk the safe way, give bread) and a ‘go round’ card. Books, crayons.",
    parts: [
      {
        name: "Think",
        minutes: 8,
        text: "Say: “Ayo must deliver bread, but the road is blocked!” Ask one at a time: “What is the problem? What small steps? Which way is safe? If the light is red, then…?” Praise each answer.",
      },
      {
        name: "Move",
        minutes: 10,
        text: "Children walk Ayo’s bread route on the grid. Show the red card: everyone stops. Put down the ‘road closed’ box: they find another way. Repeat with new children.",
      },
      {
        name: "Code",
        minutes: 14,
        text: "Teams of 4 lay 3 step cards (pick up bread → walk the safe way → give bread) and act the plan. Close a road and show red: the team stops, swaps ‘walk the safe way’ for the ‘go round’ card, then acts again.",
      },
      {
        name: "Book & close",
        minutes: 8,
        text: "Activity Book: children draw Ayo’s way round the closed road, then draw how Ayo got the bread there. Close: “We are thinkers! We said the problem, made a plan and tried another way.”",
      },
    ],
  },
  {
    term: 3,
    week: 10,
    title: "Revision & Reinforcement",
    goal: "Children replay Term 3 skills at 4 stations while the teacher notes who needs support before Weeks 11–12.",
    words: "All Term 3 words",
    youNeed:
      "4 station signs. Problem pictures and if–then cards. Step cards, ‘go round’ cards and a box. A taped grid with forward and stop cards. Big blocks for Station 4. A class list for notes.",
    parts: [
      {
        name: "Quick recall",
        minutes: 6,
        text: "Show a problem picture or an if–then card. Children say the problem (or the ‘then’) and one way to solve it. Do 4–5 cards quickly.",
      },
      {
        name: "Stations",
        minutes: 20,
        text: "Groups rotate every 5 minutes: 1 say the problem, lay 3 step cards; 2 road closed: swap in ‘go round’; 3 lay a 3-card straight route, swap back two swapped cards; 4 rebuild a small ramp or tower (big blocks, no climbing).",
      },
      {
        name: "Code",
        minutes: 6,
        text: "Whole class: lay a 3-card straight route for Ayo from memory. Swap two cards. Children find them and swap them back. Repeat once with new children.",
      },
      {
        name: "Book & close",
        minutes: 8,
        text: "Children do the 4 small review tasks: spot the problem, number the small steps, road closed: go round, and the strong bridge. Then they draw their favourite problem they solved this term. Close: ask “What problem did you solve? How?” Take 3 answers and clap for each.",
      },
    ],
  },
  {
    term: 3,
    week: 11,
    title: "Mini-project: Ayo’s Ramp and Route",
    goal: "Teams plan and finish a ramp or tower, guide Ayo to it with 3 cards, test and fix. The Station 1 check starts.",
    words: "problem · plan · build · test · fix",
    youNeed:
      "One ramp board or tower base per group (2–3 big blocks, teacher-made). Big blocks. A large toy car. Plan cards (blocks → ramp → test). Forward and stop cards. Paper bread. Taped grid. 4-item checklist.",
    parts: [
      {
        name: "Think",
        minutes: 5,
        text: "Ask: “What is Ayo’s problem? What small steps? Which way? What if it does not work?” Give each team their base and roles: planner, builder, card-layer, checker.",
      },
      {
        name: "Code",
        minutes: 8,
        text: "Plan first: teams lay 3 plan cards (blocks → ramp → test) before building. Card-layers lay Ayo’s straight route on the grid to the ramp: forward, forward, stop.",
      },
      {
        name: "Build",
        minutes: 20,
        text: "Teams add 2–3 big blocks and test: roll the toy car down the ramp (or stand the bread on the tower). If it falls off, add a block, test again. Guide Ayo along the route; fix any wrong card. No climbing.",
      },
      {
        name: "Present & close",
        minutes: 7,
        text: "Teams show another class: “Ayo’s problem was… we solved it by…” Children colour their stars and draw their build. Tick who you saw at Station 1 (8–12 children).",
      },
    ],
  },
  {
    term: 3,
    week: 12,
    title: "Assessment: practical check",
    goal: "Every child is seen at Station 1 doing the 4-item checklist. Record the MVL for the Year badge. No written test.",
    words: "All Term 3 words",
    youNeed:
      "4-item checklist and record sheet. Problem picture cards. Shop step cards. A ‘go round’ card and a box on the mat. The groups’ W11 ramps and a large toy car. 3 station signs. Paper, crayons.",
    parts: [
      {
        name: "Warm-up",
        minutes: 4,
        text: "One quick “Robot Says” round so children feel relaxed. Say: “Today you show me what you can do. It is a game, not a test!”",
      },
      {
        name: "Stations",
        minutes: 28,
        text: "Groups of 4–6 rotate through 3 stations. Station 1 (you, about 4 min per small group): the 4-item sequence. Station 2: ‘road closed’ route practice, not judged. Station 3: draw ‘Me as a thinker’. Tick the checklist for 8–12 children.",
      },
      {
        name: "Catch-up",
        minutes: 4,
        text: "Check your record sheet. Call any child you have not seen yet for a quick Station 1 turn. Anyone still not seen is checked on Week 13 morning.",
      },
      {
        name: "Close",
        minutes: 4,
        text: "Praise every child for trying. Show 2–3 ‘Me as a thinker’ drawings. Say: “You are all thinkers! Next week we share our work with our families.”",
      },
    ],
  },
  {
    term: 3,
    week: 13,
    title: "Showcase & Badges",
    goal: "Children show families their routes, ramps and fixes, reflect on their year and receive their badges.",
    words: "All Term 3 words",
    youNeed:
      "Step Thinker · Term 3 badges and Step Thinker Year certificates. The W11 ramps and towers. Taped grid, route cards and cut-out Ayo. Card for the ‘My year with Ayo’ home card. Smiley-face sheet.",
    parts: [
      {
        name: "Reflect",
        minutes: 8,
        text: "Ask: “What can you do now that you could not do at the start of the year?” Read each ‘I can’ statement; children show a smiley face for each one.",
      },
      {
        name: "Showcase",
        minutes: 15,
        text: "Children run Ayo’s straight route to their ramp for families and explain the steps. They show their card route and how they fixed a mistake. The W11 ramps and towers are on display at the stations.",
      },
      {
        name: "Create",
        minutes: 7,
        text: "Children make a ‘My year with Ayo’ card to take home. Families can help them draw their favourite thing they did with Ayo.",
      },
      {
        name: "Badges",
        minutes: 10,
        text: "Badge ceremony: give each Step Thinker · Term 3 badge (Secure on the Term 3 checklist), then each Step Thinker Year badge (Secure on the MVL). Call each name and clap. Celebrate Stretch work too.",
      },
    ],
  },
];

export function lessonGuideFor(
  term: number,
  week: number,
): LessonGuide | undefined {
  return LESSON_GUIDES.find(
    (guide) => guide.term === term && guide.week === week,
  );
}

/** "term-week" keys of the weeks that have a guide, for pages that only need to know whether one exists. */
export function lessonGuideKeys(): string[] {
  return LESSON_GUIDES.map((guide) => `${guide.term}-${guide.week}`);
}
