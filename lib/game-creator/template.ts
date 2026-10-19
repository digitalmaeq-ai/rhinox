import { blankLevel } from "./engine";
import type { GameProject, Rule } from "./types";

const STANDARD_RULES: Rule[] = [
  { when: "touch-coin", do: { type: "add-points", amount: 10 } },
  { when: "touch-hazard", do: { type: "lose-life" } },
  { when: "touch-hazard", do: { type: "go-to-start" } },
  { when: "touch-enemy", do: { type: "lose-life" } },
  { when: "touch-enemy", do: { type: "go-to-start" } },
];

/** The starting point: two working levels the learner can change. */
export function mazeEscapeTemplate(): GameProject {
  return {
    version: 2,
    template: "maze-escape",
    title: "My Maze Escape",
    cols: 12,
    rows: 8,
    levels: [
      [
        "############",
        "#S...#....c#",
        "#.##.#.##.##",
        "#.c#...#x..#",
        "#.######.#.#",
        "#...x..#.#c#",
        "#.####...#G#",
        "############",
      ],
      [
        "############",
        "#S...v....c#",
        "#..........#",
        "#.###.####.#",
        "#.###.######",
        "#k.......DG#",
        "#..x.....###",
        "############",
      ],
    ],
    lives: 3,
    rules: [...STANDARD_RULES, { when: "reach-goal", requires: "all-coins", do: { type: "win" } }],
  };
}

/** An empty arena with a start and a goal, so a blank project is already playable. */
export function blankTemplate(): GameProject {
  return {
    version: 2,
    template: "maze-escape",
    title: "My New Game",
    cols: 12,
    rows: 8,
    levels: [blankLevel(12, 8)],
    lives: 3,
    rules: [...STANDARD_RULES, { when: "reach-goal", do: { type: "win" } }],
  };
}
