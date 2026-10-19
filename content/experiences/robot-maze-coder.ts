import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Robot Maze Coder (Think, Move, Code!). runtime "coding" + component
// "maze-coder" selects MazeCoder. The ten levels live in
// lib/maze-coder/levels.ts; each level is one required task whose id
// matches the level id ("level-1" … "level-10").
export const robotMazeCoderExperience: InteractiveExperienceDefinition = {
  id: "exp-robot-maze-coder",
  slug: "robot-maze-coder",
  title: "Robot Maze Coder",
  contentType: "experience",
  description:
    "Snap blocks together to program a robot through ten mazes. Learn sequences, turns, loops and loops inside loops, then collect every energy chip on the way to the charger.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "games", "coding-games"] }],

  runtime: "coding",
  component: "maze-coder",
  modes: ["interactive", "game", "learning-tool"],

  tasks: [
    { id: "level-1", title: "Level 1: First steps", points: 10, required: true },
    { id: "level-2", title: "Level 2: Turn the corner", points: 15, required: true },
    { id: "level-3", title: "Level 3: Loop it", points: 20, required: true },
    { id: "level-4", title: "Level 4: Staircase", points: 25, required: true },
    { id: "level-5", title: "Level 5: Battery run", points: 30, required: true },
    { id: "level-6", title: "Level 6: Loop in a loop", points: 40, required: true },
    { id: "level-7", title: "Level 7: The long way round", points: 45, required: true },
    { id: "level-8", title: "Level 8: Chip staircase", points: 50, required: true },
    { id: "level-9", title: "Level 9: Spiral in", points: 55, required: true },
    { id: "level-10", title: "Level 10: Grand finale", points: 60, required: true },
  ],

  subjects: ["coding", "robotics"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "intermediate",
  durationMinutes: 25,
  featured: true,
  learningObjectives: [
    "Write a program as a sequence of instructions.",
    "Use a loop to repeat instructions instead of copying them.",
    "Nest one loop inside another.",
    "Test a program and fix the block that went wrong (debugging).",
  ],
  skills: ["Sequencing", "Loops", "Debugging", "Computational thinking", "Planning"],
  achievements: [
    { id: "robot-maze-coder-complete", title: "Maze Master", description: "Programmed the robot through all ten mazes.", points: 50 },
  ],
  createdAt: "2026-10-13",
  updatedAt: "2026-10-13",
};
