import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Code the Robot: Reach the Charger (Think, Move, Code!).
// runtime "coding" + component "charger-levels" selects ChargerLevelsRenderer.
//
// Ten missions. The maps, rules and solver live in lib/robot-charger/levels.ts;
// this file only describes the experience and its required tasks, one per
// mission ("level-1" ... "level-10"). The robot, charger and field assets are
// kept for previews and cards; the renderer draws the board from the level data.
// Companion activity: content/activities/robot-to-the-charger.ts.
export const robotToTheChargerExperience: InteractiveExperienceDefinition = {
  id: "exp-robot-to-the-charger",
  slug: "robot-to-the-charger",
  title: "Code the Robot: Reach the Charger",
  contentType: "experience",
  description:
    "The robot's battery is low! Program it through ten missions: dodge rocks, collect bolts, use repeat blocks and reach the charger before the battery runs out.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "games", "coding-games"] }],

  runtime: "coding",
  component: "charger-levels",
  modes: ["interactive", "game", "learning-tool"],

  assets: [
    { id: "grid-field", type: "environment", label: "Field", interactive: false, visible: true, properties: { columns: 5, rows: 4, maxCommands: 10 } },
    { id: "robot-rhinobit", type: "character", label: "Robot", x: 0, y: 3, interactive: false, visible: true, properties: { visual: "robot" } },
    { id: "goal-charger", type: "object", label: "Charger", x: 4, y: 0, interactive: false, visible: true, properties: { role: "goal", visual: "charger" } },
    { id: "wall-rock-1", type: "object", label: "Rock", x: 1, y: 1, interactive: false, visible: true, properties: { role: "wall", visual: "rock" } },
    { id: "wall-rock-2", type: "object", label: "Rock", x: 3, y: 2, interactive: false, visible: true, properties: { role: "wall", visual: "rock" } },
    { id: "wall-rock-3", type: "object", label: "Rock", x: 3, y: 3, interactive: false, visible: true, properties: { role: "wall", visual: "rock" } },
    { id: "wall-rock-4", type: "object", label: "Rock", x: 4, y: 2, interactive: false, visible: true, properties: { role: "wall", visual: "rock" } },
  ],

  tasks: [
    { id: "level-1", title: "Mission 1: First steps", points: 20, required: true },
    { id: "level-2", title: "Mission 2: Around the rocks", points: 20, required: true },
    { id: "level-3", title: "Mission 3: Grab a bolt", points: 30, required: true },
    { id: "level-4", title: "Mission 4: Two bolts", points: 30, required: true },
    { id: "level-5", title: "Mission 5: Repeat blocks", points: 40, required: true },
    { id: "level-6", title: "Mission 6: Zig-zag lane", points: 40, required: true },
    { id: "level-7", title: "Mission 7: Bolt maze", points: 50, required: true },
    { id: "level-8", title: "Mission 8: Long corridors", points: 60, required: true },
    { id: "level-9", title: "Mission 9: Power plant", points: 70, required: true },
    { id: "level-10", title: "Mission 10: Grand charge", points: 100, required: true },
  ],

  subjects: ["coding"],
  ageGroups: ["6-7", "7-8", "8-9"],
  difficulty: "beginner",
  durationMinutes: 25,
  featured: true,
  learningObjectives: [
    "Give a robot step-by-step instructions using direction commands.",
    "Use repeat blocks to make a program shorter.",
    "Test a program and find the step that went wrong (debugging).",
    "Plan a route that is efficient and stays within a battery limit.",
  ],
  skills: ["Sequencing", "Loops", "Debugging", "Planning"],
  achievements: [{ id: "robot-to-the-charger-complete", title: "Robot Programmer", description: "Programmed the robot through all ten charger missions.", points: 100 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-10-17",
};
