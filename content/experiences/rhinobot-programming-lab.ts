import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// RhinoBot: Robot Programming Lab. runtime "coding" + component "rhinobot-lab"
// selects RhinoBotLab (Google Blockly workspace + a safe interpreter + a 2D
// simulation). Missions, maps, hints and debugging challenges live in
// lib/rhinobot/missions.ts; each of the five missions is one required task
// ("mission-1" ... "mission-5"). The free playground is not a task.
export const rhinobotProgrammingLabExperience: InteractiveExperienceDefinition = {
  id: "exp-rhinobot-programming-lab",
  slug: "rhinobot-programming-lab",
  title: "RhinoBot: Robot Programming Lab",
  contentType: "experience",
  description:
    "Learn to programme RhinoBot with colourful drag-and-drop coding blocks. Build algorithms, solve robotics challenges, debug instructions and develop computational thinking through five missions and a free coding playground.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "games", "coding-games"] }],

  runtime: "coding",
  component: "rhinobot-lab",
  modes: ["interactive", "game", "learning-tool"],

  tasks: [
    { id: "mission-1", title: "Mission 1: First Commands", points: 40, required: true },
    { id: "mission-2", title: "Mission 2: Repeat It", points: 50, required: true },
    { id: "mission-3", title: "Mission 3: Smart Robot", points: 60, required: true },
    { id: "mission-4", title: "Mission 4: Robot Decisions", points: 80, required: true },
    { id: "mission-5", title: "Mission 5: Master Programmer", points: 100, required: true },
  ],

  subjects: ["coding", "robotics"],
  ageGroups: ["7-8", "9-12", "13-15", "16-18"],
  difficulty: "intermediate",
  durationMinutes: 40,
  featured: true,
  learningObjectives: [
    "Build programmes by connecting coding blocks in order (sequencing).",
    "Use loops to repeat instructions and spot patterns.",
    "Use sensors and if…else decisions so a robot can respond to its surroundings.",
    "Predict, test and debug a programme, then make it more efficient.",
  ],
  skills: ["Sequencing", "Loops", "Conditionals", "Debugging", "Algorithm design", "Computational thinking"],
  achievements: [
    { id: "rhinobot-programming-lab-complete", title: "Master Programmer", description: "Completed all five RhinoBot missions.", points: 100 },
  ],
  createdAt: "2026-10-17",
  updatedAt: "2026-10-17",
};
