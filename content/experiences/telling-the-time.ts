import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";
import type { InteractiveAsset } from "@/types/interactive-assets";

// Telling the Time (Primary 2-4). runtime "2d" + component "clock-rounds"
// selects ClockRoundsRenderer. The slug stays "telling-the-time" so existing
// links and the companion activity keep working.
//
// Data contract (no schema changes, everything in InteractiveAsset.properties):
//   - a ROUND is an "environment" asset with properties.round and .title;
//   - a QUESTION is an "object" asset with properties.round and .kind:
//       "read"    show an analogue clock (h, m), choose the time in words;
//       "digital" show a digital time, choose the matching clock face;
//       "set"     set the clock hands to a target time (h, m), starting at
//                 startH:startM;
//       "story"   a short word problem with text options;
//     plus .q (the prompt), .options (pipe separated), .answer, .hint and
//     .explain. For "digital" the options and answer are "H:MM" times;
//   - one required task per round, with task id "round-N".
// Companion activity: content/activities/telling-the-time.ts.

const round = (n: number, title: string): InteractiveAsset => ({
  id: `r${n}`,
  type: "environment",
  label: `Round ${n}`,
  interactive: false,
  visible: true,
  properties: { round: n, title },
});

interface QuestionSpec {
  kind: "read" | "digital" | "set" | "story";
  q: string;
  options: string;
  answer: string;
  hint: string;
  explain: string;
  h?: number;
  m?: number;
  startH?: number;
  startM?: number;
}

const question = (n: number, index: number, spec: QuestionSpec): InteractiveAsset => ({
  id: `r${n}-q${index}`,
  type: "object",
  label: spec.q,
  interactive: true,
  visible: true,
  properties: {
    round: n,
    kind: spec.kind,
    q: spec.q,
    options: spec.options,
    answer: spec.answer,
    hint: spec.hint,
    explain: spec.explain,
    h: spec.h ?? 12,
    m: spec.m ?? 0,
    startH: spec.startH ?? 12,
    startM: spec.startM ?? 0,
  },
});

export const tellingTheTimeExperience: InteractiveExperienceDefinition = {
  id: "exp-telling-the-time",
  slug: "telling-the-time",
  title: "Telling the Time",
  contentType: "experience",
  description:
    "Read analogue clocks, set the hands yourself, match digital times to clock faces and solve time stories. Ten rounds take you from o'clock to minutes past and to.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "clock-rounds",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    round(1, "Read the o'clock"),
    question(1, 1, { kind: "read", q: "What time does the clock show?", options: "3 o'clock|4 o'clock|2 o'clock|12 o'clock", answer: "3 o'clock", hint: "The short hand shows the hour. The long hand shows the minutes. When the long hand points to 12, it is o'clock.", explain: "3 o'clock is 3:00.", h: 3, m: 0 }),
    question(1, 2, { kind: "read", q: "What time does the clock show?", options: "8 o'clock|9 o'clock|7 o'clock|6 o'clock", answer: "8 o'clock", hint: "The short hand shows the hour. The long hand shows the minutes. When the long hand points to 12, it is o'clock.", explain: "8 o'clock is 8:00.", h: 8, m: 0 }),
    question(1, 3, { kind: "read", q: "What time does the clock show?", options: "11 o'clock|12 o'clock|10 o'clock|1 o'clock", answer: "11 o'clock", hint: "The short hand shows the hour. The long hand shows the minutes. When the long hand points to 12, it is o'clock.", explain: "11 o'clock is 11:00.", h: 11, m: 0 }),
    question(1, 4, { kind: "read", q: "What time does the clock show?", options: "6 o'clock|12 o'clock|5 o'clock|7 o'clock", answer: "6 o'clock", hint: "Look at the short hand first. Which number is it pointing to?", explain: "6 o'clock is 6:00.", h: 6, m: 0 }),
    round(2, "Half past"),
    question(2, 1, { kind: "read", q: "What time does the clock show?", options: "half past 2|half past 3|2 o'clock|half past 1", answer: "half past 2", hint: "When the long hand points to 6, half the hour has passed: it is half past.", explain: "Half past 2 is 2:30.", h: 2, m: 30 }),
    question(2, 2, { kind: "read", q: "What time does the clock show?", options: "half past 7|half past 8|7 o'clock|half past 6", answer: "half past 7", hint: "When the long hand points to 6, half the hour has passed: it is half past.", explain: "Half past 7 is 7:30.", h: 7, m: 30 }),
    question(2, 3, { kind: "read", q: "What time does the clock show?", options: "half past 10|half past 11|10 o'clock|half past 9", answer: "half past 10", hint: "At half past the short hand is halfway between two numbers. Which hour has it just passed?", explain: "Half past 10 is 10:30.", h: 10, m: 30 }),
    question(2, 4, { kind: "read", q: "What time does the clock show?", options: "half past 12|half past 1|12 o'clock|6 o'clock", answer: "half past 12", hint: "When the long hand points to 6, half the hour has passed: it is half past.", explain: "Half past 12 is 12:30.", h: 12, m: 30 }),
    round(3, "Set the clock: o'clock and half past"),
    question(3, 1, { kind: "set", q: "Set the clock to 4 o'clock.", options: "", answer: "4:00", hint: "Move the long hand to 12 and the short hand to 4.", explain: "4 o'clock is 4:00.", h: 4, m: 0, startH: 12, startM: 0 }),
    question(3, 2, { kind: "set", q: "Set the clock to 9 o'clock.", options: "", answer: "9:00", hint: "The long hand points to 12 at o'clock.", explain: "9 o'clock is 9:00.", h: 9, m: 0, startH: 12, startM: 0 }),
    question(3, 3, { kind: "set", q: "Set the clock to half past 5.", options: "", answer: "5:30", hint: "The long hand points to 6 for half past.", explain: "Half past 5 is 5:30.", h: 5, m: 30, startH: 12, startM: 0 }),
    question(3, 4, { kind: "set", q: "Set the clock to half past 1.", options: "", answer: "1:30", hint: "The long hand points to 6, and the short hand is just past the 1.", explain: "Half past 1 is 1:30.", h: 1, m: 30, startH: 12, startM: 0 }),
    round(4, "Quarter past and quarter to"),
    question(4, 1, { kind: "read", q: "What time does the clock show?", options: "quarter past 4|quarter to 5|quarter past 5|quarter past 3", answer: "quarter past 4", hint: "Long hand on 3 is quarter past. Long hand on 9 is quarter to the next hour.", explain: "Quarter past 4 is 4:15.", h: 4, m: 15 }),
    question(4, 2, { kind: "read", q: "What time does the clock show?", options: "quarter to 10|quarter past 9|quarter to 11|quarter to 9", answer: "quarter to 10", hint: "Long hand on 3 is quarter past. Long hand on 9 is quarter to the next hour.", explain: "Quarter to 10 is 9:45.", h: 9, m: 45 }),
    question(4, 3, { kind: "read", q: "What time does the clock show?", options: "quarter past 1|quarter to 2|quarter past 2|quarter past 12", answer: "quarter past 1", hint: "Long hand on 3 is quarter past. Long hand on 9 is quarter to the next hour.", explain: "Quarter past 1 is 1:15.", h: 1, m: 15 }),
    question(4, 4, { kind: "read", q: "What time does the clock show?", options: "quarter to 7|quarter past 6|quarter to 8|quarter to 6", answer: "quarter to 7", hint: "Quarter to 7 means 15 minutes before 7. The short hand is almost at 7.", explain: "Quarter to 7 is 6:45.", h: 6, m: 45 }),
    round(5, "Digital to analogue"),
    question(5, 1, { kind: "digital", q: "Which clock shows this time?", options: "3:30|3:00|6:15|9:30", answer: "3:30", hint: "At :30 the long hand points straight down to 6.", explain: "3:30 is half past 3.", h: 3, m: 30 }),
    question(5, 2, { kind: "digital", q: "Which clock shows this time?", options: "5:15|5:45|3:25|6:15", answer: "5:15", hint: "At :15 the long hand points to 3.", explain: "5:15 is quarter past 5.", h: 5, m: 15 }),
    question(5, 3, { kind: "digital", q: "Which clock shows this time?", options: "8:45|8:15|9:45|7:45", answer: "8:45", hint: "At :45 the long hand points to 9.", explain: "8:45 is quarter to 9.", h: 8, m: 45 }),
    question(5, 4, { kind: "digital", q: "Which clock shows this time?", options: "11:00|12:00|10:00|11:30", answer: "11:00", hint: "At :00 the long hand points to 12. The short hand shows 11.", explain: "11:00 is 11 o'clock.", h: 11, m: 0 }),
    round(6, "Set the clock: quarters"),
    question(6, 1, { kind: "set", q: "Set the clock to quarter past 2.", options: "", answer: "2:15", hint: "Long hand on 3 means quarter past.", explain: "Quarter past 2 is 2:15.", h: 2, m: 15, startH: 12, startM: 0 }),
    question(6, 2, { kind: "set", q: "Set the clock to quarter to 8.", options: "", answer: "7:45", hint: "Long hand on 9 means quarter to the next hour.", explain: "Quarter to 8 is 7:45.", h: 7, m: 45, startH: 12, startM: 0 }),
    question(6, 3, { kind: "set", q: "Set the clock to quarter past 10.", options: "", answer: "10:15", hint: "Quarter past 10: long hand to 3, short hand just past 10.", explain: "Quarter past 10 is 10:15.", h: 10, m: 15, startH: 6, startM: 30 }),
    question(6, 4, { kind: "set", q: "Set the clock to quarter to 4.", options: "", answer: "3:45", hint: "Quarter to 4 is 3:45. The short hand is almost at 4.", explain: "Quarter to 4 is 3:45.", h: 3, m: 45, startH: 9, startM: 0 }),
    round(7, "Minutes past and to"),
    question(7, 1, { kind: "read", q: "What time does the clock show?", options: "10 past 2|10 to 3|2 past 10|20 past 2", answer: "10 past 2", hint: "Each number on the clock is 5 minutes. Count in fives from 12 with the long hand.", explain: "10 past 2 is 2:10.", h: 2, m: 10 }),
    question(7, 2, { kind: "read", q: "What time does the clock show?", options: "25 past 4|5 past 4|25 past 5|25 to 5", answer: "25 past 4", hint: "Each number on the clock is 5 minutes. Count in fives from 12 with the long hand.", explain: "25 past 4 is 4:25.", h: 4, m: 25 }),
    question(7, 3, { kind: "read", q: "What time does the clock show?", options: "10 to 8|10 past 7|10 to 9|20 to 8", answer: "10 to 8", hint: "Past the half hour we say how many minutes to the NEXT hour. 50 minutes is 10 to the next hour.", explain: "10 to 8 is 7:50.", h: 7, m: 50 }),
    question(7, 4, { kind: "read", q: "What time does the clock show?", options: "20 to 10|20 past 9|20 to 11|10 to 10", answer: "20 to 10", hint: "Each number on the clock is 5 minutes. Count in fives from 12 with the long hand.", explain: "20 to 10 is 9:40.", h: 9, m: 40 }),
    round(8, "Time stories"),
    question(8, 1, { kind: "story", q: "Break begins at 10 o'clock and lasts 30 minutes. What time does it end?", options: "half past 10|half past 11|11 o'clock|quarter past 10", answer: "half past 10", hint: "30 minutes is half an hour.", explain: "10:00 plus 30 minutes is half past 10." }),
    question(8, 2, { kind: "story", q: "It is half past 3. What time will it be in one hour?", options: "half past 4|4 o'clock|half past 3|quarter past 4", answer: "half past 4", hint: "One hour later changes the hour number only.", explain: "One hour after 3:30 is 4:30, half past 4." }),
    question(8, 3, { kind: "story", q: "Ada starts football at quarter past 4 and plays for 15 minutes. When does she stop?", options: "half past 4|5 o'clock|quarter to 5|quarter past 5", answer: "half past 4", hint: "Quarter past is 15 minutes. Add another 15 minutes.", explain: "4:15 plus 15 minutes is 4:30, half past 4." }),
    question(8, 4, { kind: "story", q: "How many minutes are there from 5 o'clock to half past 5?", options: "15 minutes|30 minutes|45 minutes|60 minutes", answer: "30 minutes", hint: "Half past is half of 60 minutes.", explain: "Half of an hour is 30 minutes." }),
    question(8, 5, { kind: "story", q: "Which time is earlier: quarter to 9 or half past 8?", options: "Half past 8|Quarter to 9", answer: "Half past 8", hint: "Write both as digital times first: 8:30 and 8:45.", explain: "Half past 8 is 8:30 and quarter to 9 is 8:45, so 8:30 is earlier." }),
    round(9, "Set the clock: any time"),
    question(9, 1, { kind: "set", q: "Set the clock to 20 past 5.", options: "", answer: "5:20", hint: "20 minutes past: the long hand points to 4.", explain: "20 past 5 is 5:20.", h: 5, m: 20, startH: 12, startM: 0 }),
    question(9, 2, { kind: "set", q: "Set the clock to 25 to 9.", options: "", answer: "8:35", hint: "35 minutes: the long hand is just past the 6.", explain: "25 to 9 is 8:35.", h: 8, m: 35, startH: 12, startM: 0 }),
    question(9, 3, { kind: "set", q: "Set the clock to 10 to 12.", options: "", answer: "11:50", hint: "50 minutes: the long hand points to 10.", explain: "10 to 12 is 11:50.", h: 11, m: 50, startH: 6, startM: 30 }),
    question(9, 4, { kind: "set", q: "Set the clock to 5 to 3.", options: "", answer: "2:55", hint: "55 minutes: the long hand points to 11.", explain: "5 to 3 is 2:55.", h: 2, m: 55, startH: 9, startM: 0 }),
    question(9, 5, { kind: "set", q: "Set the clock to 5 past 6.", options: "", answer: "6:05", hint: "5 minutes past: the long hand points to 1.", explain: "5 past 6 is 6:05.", h: 6, m: 5, startH: 3, startM: 15 }),
    round(10, "Grand challenge"),
    question(10, 1, { kind: "read", q: "What time does the clock show?", options: "20 past 1|20 to 2|5 past 4|20 past 2", answer: "20 past 1", hint: "Each number on the clock is 5 minutes. Count in fives from 12 with the long hand.", explain: "20 past 1 is 1:20.", h: 1, m: 20 }),
    question(10, 2, { kind: "digital", q: "Which clock shows this time?", options: "6:35|6:25|7:35|5:35", answer: "6:35", hint: "35 minutes: the long hand is just past the 6.", explain: "6:35 is 25 to 7.", h: 6, m: 35 }),
    question(10, 3, { kind: "set", q: "Set the clock to 20 to 5.", options: "", answer: "4:40", hint: "40 minutes: the long hand points to 8.", explain: "20 to 5 is 4:40.", h: 4, m: 40, startH: 12, startM: 0 }),
    question(10, 4, { kind: "story", q: "School starts at 8 o'clock. Lessons end 3 hours later. What time do lessons end?", options: "11 o'clock|10 o'clock|half past 11|12 o'clock", answer: "11 o'clock", hint: "Count on 3 hours from 8.", explain: "8 + 3 = 11, so 11 o'clock." }),
    question(10, 5, { kind: "read", q: "What time does the clock show?", options: "5 to 10|5 past 9|5 to 11|quarter to 10", answer: "5 to 10", hint: "Past the half hour, count how many minutes to the NEXT hour.", explain: "5 to 10 is 9:55.", h: 9, m: 55 }),
    question(10, 6, { kind: "digital", q: "Which clock shows this time?", options: "12:15|12:45|3:15|12:30", answer: "12:15", hint: "At :15 the long hand points to 3.", explain: "12:15 is quarter past 12.", h: 12, m: 15 }),
    question(10, 7, { kind: "set", q: "Set the clock to 10 past 7.", options: "", answer: "7:10", hint: "10 minutes: the long hand points to 2.", explain: "10 past 7 is 7:10.", h: 7, m: 10, startH: 12, startM: 0 }),
    question(10, 8, { kind: "story", q: "Tunde goes to bed at quarter past 8. Ola goes to bed at half past 7. Who goes to bed first?", options: "Ola|Tunde", answer: "Ola", hint: "Compare 8:15 and 7:30.", explain: "7:30 is earlier than 8:15, so Ola goes first." }),
  ],

  tasks: [
    { id: "round-1", title: "Round 1: Read the o'clock", points: 20, required: true },
    { id: "round-2", title: "Round 2: Half past", points: 20, required: true },
    { id: "round-3", title: "Round 3: Set the clock: o'clock and half past", points: 30, required: true },
    { id: "round-4", title: "Round 4: Quarter past and quarter to", points: 30, required: true },
    { id: "round-5", title: "Round 5: Digital to analogue", points: 40, required: true },
    { id: "round-6", title: "Round 6: Set the clock: quarters", points: 40, required: true },
    { id: "round-7", title: "Round 7: Minutes past and to", points: 50, required: true },
    { id: "round-8", title: "Round 8: Time stories", points: 60, required: true },
    { id: "round-9", title: "Round 9: Set the clock: any time", points: 70, required: true },
    { id: "round-10", title: "Round 10: Grand challenge", points: 100, required: true },
  ],

  subjects: ["mathematics"],
  ageGroups: ["6-7", "7-8", "8-9"],
  difficulty: "beginner",
  durationMinutes: 25,
  featured: true,
  learningObjectives: [
    "Read o'clock, half past, quarter past and quarter to on an analogue clock.",
    "Read the time to five minutes, using \"past\" and \"to\".",
    "Set the hands of a clock to show a given time.",
    "Match digital times to clock faces and solve simple time problems.",
  ],
  skills: ["Reading clocks", "Number sense", "Time problems", "Reasoning"],
  achievements: [{ id: "telling-the-time-complete", title: "Time Keeper", description: "Finished all ten rounds of telling the time.", points: 40 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-10-17",
};
