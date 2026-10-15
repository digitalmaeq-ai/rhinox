import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Code the Robot: Reach the Charger (Primary 2, Think, Move, Code!).
// runtime "coding" + component "grid-path" selects GridPathRenderer.
//
// Grid-path data contract (no schema changes):
//   - the GRID is the "environment" asset: properties.columns / rows /
//     maxCommands;
//   - the ROBOT is the "character" asset; x / y is its start cell
//     (0-based column / row, row 0 at the top);
//   - the GOAL has properties.role "goal"; WALLS have properties.role "wall";
//   - one required task, task id === goal asset id;
//   - "code-success" / "code-blocked" / "code-short" feedback interactions.
// Several programs work (e.g. up 3, right 4 — or right 2, up 3, right 2).
// Companion activity: content/activities/robot-to-the-charger.ts.
export const robotToTheChargerExperience: InteractiveExperienceDefinition = {
  id: "exp-robot-to-the-charger",
  slug: "robot-to-the-charger",
  title: "Code the Robot: Reach the Charger",
  contentType: "experience",
  description:
    "The robot's battery is low! Build a program of arrow commands to move it to the charger without bumping into the rocks.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "games", "coding-games"] }],

  runtime: "coding",
  component: "grid-path",
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
    { id: "goal-charger", title: "Guide the robot to the charger", points: 50, required: true },
  ],

  interactions: [
    { id: "code-success", assetId: "robot-rhinobit", trigger: "submit", actions: [{ id: "code-success-feedback", type: "show-feedback", message: "Your program works! The robot reached the charger." }] },
    { id: "code-blocked", assetId: "robot-rhinobit", trigger: "submit", actions: [{ id: "code-blocked-feedback", type: "show-feedback", message: "Bump! The robot hit something. Find the step shown in red and change it." }] },
    { id: "code-short", assetId: "robot-rhinobit", trigger: "submit", actions: [{ id: "code-short-feedback", type: "show-feedback", message: "The program ended before the robot reached the charger. Add more steps." }] },
  ],

  subjects: ["coding"],
  ageGroups: ["6-7"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: [
    "Give a robot step-by-step instructions using direction commands.",
    "Test a program and find the step that went wrong (debugging).",
    "Understand that there can be more than one program that works.",
  ],
  skills: ["Sequencing", "Debugging", "Directional language", "Computational thinking"],
  achievements: [{ id: "robot-to-the-charger-complete", title: "Robot Programmer", description: "Wrote a program that guided the robot to the charger.", points: 50 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
