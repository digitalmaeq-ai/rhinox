// The five RhinoBot missions and the free playground.
// Maps are drawn as text:  R robot start (also its base)  G goal flag
// C charging station  # obstacle  * item  . empty floor
// Row 0 is the top row. Reference solutions and debugging challenges below are
// checked by lib/rhinobot/rhinobot.test.ts.

import {
  ACTIVATE, DROP, F, L, PICK, R, c, ifElse, ifThen, repeat, until, countProgramBlocks,
} from "./program";
import type { Cell, Dir, RobotState, Stmt, World } from "./types";

export type ObjectiveId = "goal" | "pickup" | "activate" | "deliver" | "home";

export const OBJECTIVE_LABELS: Record<ObjectiveId, string> = {
  goal: "Reach the goal flag",
  pickup: "Pick up the battery pack",
  activate: "Activate the charging station",
  deliver: "Deliver every item to the base",
  home: "Finish back at the base",
};

export type BlockType =
  | "rb_forward" | "rb_turn_left" | "rb_turn_right"
  | "rb_repeat" | "rb_wait" | "rb_repeat_until"
  | "rb_if" | "rb_if_else" | "rb_and" | "rb_or" | "rb_not"
  | "rb_obstacle_ahead" | "rb_path_clear" | "rb_at_goal" | "rb_item_here" | "rb_holding" | "rb_at_base"
  | "rb_pickup" | "rb_drop" | "rb_activate";

export interface Prediction {
  question: string;
  options: string[];
  answer: number;
  explain: string;
  /** A small programme, used only to check the answer in tests. */
  program?: Stmt[];
}

export interface DebugChallenge {
  brief: string;
  buggy: Stmt[];
  fixTip: string;
}

export interface Mission {
  id: string;
  number: number;
  title: string;
  concept: string;
  learningObjective: string;
  briefing: string;
  map: string;
  startDir: Dir;
  objectives: ObjectiveId[];
  blocks: BlockType[];
  solution: Stmt[];
  hints: string[];
  successMessage: string;
  advanced: string;
  prediction: Prediction;
  debug: DebugChallenge;
}

const MOVE: BlockType[] = ["rb_forward", "rb_turn_left", "rb_turn_right"];

export const MISSIONS: Mission[] = [
  {
    id: "first-commands",
    number: 1,
    title: "First Commands",
    concept: "Sequencing and basic movement",
    learningObjective: "Put movement blocks in the right order to make an algorithm.",
    briefing: "RhinoBot is at the bottom-left and is facing north. Snap blocks under “when programme starts” to guide it to the goal flag.",
    map: `
.....
...G.
..#.#
R.#..`,
    startDir: 0,
    objectives: ["goal"],
    blocks: MOVE,
    solution: [F(), F(), R(), F(), F(), F()],
    hints: [
      "Count the squares RhinoBot must travel up the left-hand side first.",
      "RhinoBot turns on the spot. Turn right to face east before moving along the row.",
      "Try: forward, forward, turn right, then forward three times.",
    ],
    successMessage: "RhinoBot followed your commands in order. That is an algorithm!",
    advanced: "Reach the goal using no more blocks than the best solution.",
    prediction: {
      question: "RhinoBot faces north. It runs: forward, forward, turn right, forward. Where does it end up?",
      options: [
        "Two squares up and one square to the right",
        "One square up and two squares to the right",
        "Three squares up",
        "Two squares up and one square to the left",
      ],
      answer: 0,
      explain: "Forward twice takes it two squares up. Turning right makes it face east, so the last forward moves it one square right.",
      program: [F(), F(), R(), F()],
    },
    debug: {
      brief: "RhinoBot goes past the goal flag. Find the extra block and remove it.",
      buggy: [F(), F(), F(), R(), F(), F(), F()],
      fixTip: "The programme sends RhinoBot up one square too far before it turns.",
    },
  },
  {
    id: "repeat-it",
    number: 2,
    title: "Repeat It",
    concept: "Pattern recognition and iteration",
    learningObjective: "Spot a repeating pattern and use a loop instead of copying blocks.",
    briefing: "RhinoBot must climb a staircase of rocks. Look for the pattern, then use a repeat block to keep your programme short.",
    map: `
###.G
##..#
#..##
R.###`,
    startDir: 1,
    objectives: ["goal"],
    blocks: [...MOVE, "rb_repeat", "rb_wait"],
    solution: [repeat(3, F(), L(), F(), R()), F()],
    hints: [
      "Each step of the staircase is the same: forward, turn left, forward, turn right.",
      "Wrap those four blocks inside one repeat block.",
      "Repeat the pattern three times, then move forward once more.",
    ],
    successMessage: "A loop did the work of twelve blocks. Pattern spotted!",
    advanced: "Solve it with the fewest blocks possible.",
    prediction: {
      question: "RhinoBot faces north on open ground. It runs: repeat 2 times [forward, turn right]. Where does it finish?",
      options: [
        "One square up and one square right, facing south",
        "Two squares up, facing north",
        "Back where it started",
        "Two squares right, facing east",
      ],
      answer: 0,
      explain: "Forward goes up one, turn right faces east. The second forward goes right one, and the last turn faces south.",
      program: [repeat(2, F(), R())],
    },
    debug: {
      brief: "The loop stops one step too early, so RhinoBot never reaches the flag. Fix the repeat.",
      buggy: [repeat(2, F(), L(), F(), R()), F()],
      fixTip: "How many staircase steps are there? Check the number in the repeat block.",
    },
  },
  {
    id: "smart-robot",
    number: 3,
    title: "Smart Robot",
    concept: "IF–THEN logic and decision-making",
    learningObjective: "Use a sensor and an if…else decision so one programme works whatever is ahead.",
    briefing: "The route winds around the edge of the room. Instead of counting squares, let RhinoBot look ahead and decide for itself.",
    map: `
R....
####.
..G#.
.###.
.....`,
    startDir: 1,
    objectives: ["goal"],
    blocks: [...MOVE, "rb_repeat", "rb_wait", "rb_repeat_until", "rb_if", "rb_if_else", "rb_not", "rb_obstacle_ahead", "rb_path_clear", "rb_at_goal"],
    solution: [until(c("atGoal"), ifElse(c("clear"), [F()], [R()]))],
    hints: [
      "RhinoBot only needs two decisions: keep going while the way is clear, otherwise turn.",
      "Use “repeat until at the goal” with an “if … else” inside it.",
      "If the path is clear, move forward. Else, turn right.",
    ],
    successMessage: "One decision-making programme solved the whole route. Smart robot!",
    advanced: "Use a single loop with one if…else.",
    prediction: {
      question: "RhinoBot faces a rock. The programme says: if path clear → move forward, else → turn right. What happens?",
      options: [
        "It moves forward into the rock",
        "It turns right and stays on the same square",
        "It turns left",
        "The programme stops",
      ],
      answer: 1,
      explain: "The path is not clear, so the else branch runs. RhinoBot turns right without moving.",
    },
    debug: {
      brief: "RhinoBot keeps going round in circles and never reaches the goal. Find the faulty decision.",
      buggy: [until(c("atGoal"), ifElse(c("clear"), [F()], [L()]))],
      fixTip: "Look at the direction RhinoBot turns when something is in the way. Which way does the route curve?",
    },
  },
  {
    id: "robot-decisions",
    number: 4,
    title: "Robot Decisions",
    concept: "Abstraction, decomposition and debugging",
    learningObjective: "Break a long route into repeating parts, then combine loops and sensors.",
    briefing: "Collect the battery pack on the way, then reach the charging station and activate it. Break the route into three straight corridors.",
    map: `
#######
..*...#
.####.#
.####.C
R######`,
    startDir: 0,
    objectives: ["pickup", "activate"],
    blocks: [...MOVE, "rb_repeat", "rb_wait", "rb_repeat_until", "rb_if", "rb_if_else", "rb_and", "rb_or", "rb_not", "rb_obstacle_ahead", "rb_path_clear", "rb_at_goal", "rb_item_here", "rb_pickup", "rb_activate"],
    solution: [
      until(c("obstacle"), F()),
      R(),
      until(c("obstacle"), ifThen(c("itemHere"), PICK()), F()),
      R(),
      until(c("obstacle"), F()),
      L(),
      until(c("obstacle"), F()),
      ACTIVATE(),
    ],
    hints: [
      "Each corridor ends at a wall. “Repeat until obstacle ahead” saves counting squares.",
      "Check “item here?” inside the second corridor, then use Pick up.",
      "Corridors: north, turn right, east (pick up), turn right, south, turn left, east, activate.",
    ],
    successMessage: "You broke a hard route into small parts and combined loops with sensors. Excellent decomposition!",
    advanced: "Finish in 19 blocks or fewer.",
    prediction: {
      question: "RhinoBot faces east. There are three free squares and then a rock. What does “repeat until obstacle ahead: move forward” do?",
      options: [
        "It moves three squares and stops next to the rock",
        "It moves one square only",
        "It bumps into the rock",
        "It never stops",
      ],
      answer: 0,
      explain: "The loop checks for an obstacle before every move, so RhinoBot stops beside the rock without bumping.",
    },
    debug: {
      brief: "RhinoBot reaches the charging station, but the battery pack is still on the floor. Find what is missing.",
      buggy: [
        until(c("obstacle"), F()),
        R(),
        until(c("obstacle"), F()),
        R(),
        until(c("obstacle"), F()),
        L(),
        until(c("obstacle"), F()),
        ACTIVATE(),
      ],
      fixTip: "RhinoBot must use “pick up” while it is standing on the battery pack.",
    },
  },
  {
    id: "master-programmer",
    number: 5,
    title: "Master Programmer",
    concept: "Algorithm design and optimisation",
    learningObjective: "Plan a multi-stage mission and make it efficient with loops.",
    briefing: "Two items must be carried back, one at a time, and dropped at the base (where RhinoBot starts). Plan carefully, then finish at the base.",
    map: `
.....*#
.######
.######
.######
R...*##`,
    startDir: 1,
    objectives: ["deliver", "home"],
    blocks: [...MOVE, "rb_repeat", "rb_wait", "rb_repeat_until", "rb_if", "rb_if_else", "rb_and", "rb_or", "rb_not", "rb_obstacle_ahead", "rb_path_clear", "rb_at_goal", "rb_item_here", "rb_holding", "rb_at_base", "rb_pickup", "rb_drop", "rb_activate"],
    solution: [
      repeat(4, F()), PICK(), L(), L(), repeat(4, F()), DROP(),
      R(), repeat(4, F()), R(), repeat(5, F()), PICK(), L(), L(), repeat(5, F()), L(), repeat(4, F()), DROP(),
    ],
    hints: [
      "Break the mission into two trips: the east item first, then the north-east item.",
      "To come back, turn around with two turns and walk the same distance.",
      "Use “drop” only when standing on the base square.",
    ],
    successMessage: "You designed a multi-stage algorithm and delivered everything to base.",
    advanced: "Deliver both items using 23 blocks or fewer.",
    prediction: {
      question: "RhinoBot is carrying an item and is standing on its base. Which block leaves the item at the base?",
      options: ["Pick up", "Drop", "Activate", "Turn right"],
      answer: 1,
      explain: "Drop releases the item. On the base square it counts as delivered.",
    },
    debug: {
      brief: "RhinoBot finishes with an item still in its hands. Find the missing step.",
      buggy: [
        repeat(4, F()), PICK(), L(), L(), repeat(4, F()), DROP(),
        R(), repeat(4, F()), R(), repeat(5, F()), PICK(), L(), L(), repeat(5, F()), L(), repeat(4, F()),
      ],
      fixTip: "Every item needs a pick up and a drop. Check the end of the programme.",
    },
  },
];

export const PLAYGROUND: Mission = {
  id: "playground",
  number: 0,
  title: "Free Coding Playground",
  concept: "Experiment freely",
  learningObjective: "Try your own ideas, test them, and save the programmes you like.",
  briefing: "There are no targets here. Build any programme, press Run and watch what RhinoBot does. Save your favourites to reload later.",
  map: `
R.....#.
.##.#...
...*..#.
.#.##.*.
...G.#..
.#.....C`,
  startDir: 1,
  objectives: [],
  blocks: MISSIONS[4].blocks,
  solution: [],
  hints: [],
  successMessage: "",
  advanced: "",
  prediction: { question: "", options: [], answer: 0, explain: "" },
  debug: { brief: "", buggy: [], fixTip: "" },
};

export function parMissionBlocks(mission: Mission) {
  return countProgramBlocks(mission.solution);
}

/** Missions 1 to 5 only; the playground and random challenges have number 0. */
export const isScoredMission = (mission: Mission) => mission.number > 0;

const worldCache = new Map<string, World>();

export function worldFor(mission: Mission): World {
  const cached = worldCache.get(mission.id);
  if (cached) return cached;
  const lines = mission.map.split("\n").filter((line) => line.length > 0);
  const world: World = {
    columns: lines[0]?.length ?? 0,
    rows: lines.length,
    walls: [],
    start: { x: 0, y: 0 },
    startDir: mission.startDir,
    goal: null,
    charger: null,
    base: { x: 0, y: 0 },
    items: [],
  };
  lines.forEach((line, y) => {
    [...line].forEach((ch, x) => {
      const cell: Cell = { x, y };
      if (ch === "#") world.walls.push(cell);
      else if (ch === "*") world.items.push(cell);
      else if (ch === "R") {
        world.start = cell;
        world.base = cell;
      } else if (ch === "G") world.goal = cell;
      else if (ch === "C") world.charger = cell;
    });
  });
  worldCache.set(mission.id, world);
  return world;
}

export interface ObjectiveResult {
  id: ObjectiveId;
  label: string;
  done: boolean;
}

export function evaluateMission(mission: Mission, world: World, state: RobotState): { objectives: ObjectiveResult[]; success: boolean } {
  const at = (cell: Cell | null) => Boolean(cell) && state.x === cell!.x && state.y === cell!.y;
  const totalItems = world.items.length;
  const done: Record<ObjectiveId, boolean> = {
    goal: at(world.goal),
    pickup: totalItems > 0 && state.picked >= totalItems,
    activate: state.charged,
    deliver: totalItems > 0 && state.delivered >= totalItems,
    home: at(world.base),
  };
  const objectives = mission.objectives.map((id) => ({ id, label: OBJECTIVE_LABELS[id], done: done[id] }));
  return { objectives, success: objectives.length > 0 && objectives.every((objective) => objective.done) };
}
