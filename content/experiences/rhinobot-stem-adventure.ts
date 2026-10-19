import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// RhinoBot STEM Adventure — Milestone 1 (World 1: The Energy Valley, Mission 001).
// runtime "game" + component "rhinobot-adventure" selects RhinoBotAdventure,
// a Phaser 3 side-scroller loaded on the client only.
// Level data: lib/rhinobot-adventure/levels.ts. Questions (kept separate from
// the engine so the curriculum can grow): lib/rhinobot-adventure/challenges.ts.
// Required tasks, completed by the game: collect-crystals, bridge-challenge,
// reach-station.
export const rhinobotStemAdventureExperience: InteractiveExperienceDefinition = {
  id: "exp-rhinobot-stem-adventure",
  slug: "rhinobot-stem-adventure",
  title: "RhinoBot STEM Adventure: The Energy Valley",
  contentType: "experience",
  description:
    "Run, jump and think with RhinoBot! Collect energy crystals, dodge high-voltage hazards, solve a maths challenge to power a locked bridge and reach the research station.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "games", "science-games"] }],

  runtime: "game",
  component: "rhinobot-adventure",
  modes: ["interactive", "game", "learning-tool"],

  assets: [
    { id: "robot-rhinobot", type: "character", label: "RhinoBot", interactive: false, visible: true, properties: { visual: "rhinobot" } },
    { id: "level-energy-valley-001", type: "environment", label: "Energy Valley", interactive: false, visible: true, properties: { levelId: "energy-valley-001", crystals: 3 } },
  ],

  tasks: [
    { id: "collect-crystals", title: "Collect the three energy crystals", points: 30, required: true },
    { id: "bridge-challenge", title: "Power the locked bridge", points: 30, required: true },
    { id: "reach-station", title: "Reach the research station", points: 40, required: true },
  ],

  subjects: ["physics", "mathematics", "robotics"],
  ageGroups: ["8-9", "9-12"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: [
    "Use multiplication and division facts to solve a real problem (batteries and energy).",
    "Connect energy ideas to a game: stored energy, hazards and recharging at a checkpoint.",
    "Plan jumps and routes, and learn from mistakes by trying again.",
  ],
  skills: ["Problem solving", "Number facts", "Planning", "Perseverance"],
  achievements: [{ id: "rhinobot-energy-valley-001", title: "Energy Valley Explorer", description: "Completed Energy Valley, Mission 001.", points: 100 }],
  createdAt: "2026-10-17",
  updatedAt: "2026-10-17",
};
