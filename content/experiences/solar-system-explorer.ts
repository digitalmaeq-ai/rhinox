import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Solar System Explorer. runtime "3d" + component "solar-system" selects
// SolarSystemExperiment (2D and 3D views over one planet database).
// Planet data: lib/solar-system/planet-data.ts (NASA fact sheets).
export const solarSystemExplorerExperience: InteractiveExperienceDefinition = {
  id: "exp-solar-system-explorer",
  slug: "solar-system-explorer",
  title: "Solar System Explorer",
  contentType: "experience",
  description:
    "Fly through the Solar System in 2D or 3D. Select any planet to see real NASA data, watch the planets orbit at your chosen speed, and compare worlds from Mercury to Neptune.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["virtual-labs", "earth-space"] }],

  runtime: "3d",
  component: "solar-system",
  modes: ["interactive", "3d", "learning-tool"],

  tasks: [
    { id: "meet-the-planets", title: "Meet all eight planets", description: "Select every planet at least once.", points: 40, required: true },
    { id: "try-3d", title: "Try the 3D view", description: "Switch to 3D and look around.", points: 20, required: true },
    { id: "one-earth-year", title: "Watch a full Earth year", description: "Let the simulation run for 365 days.", points: 30, required: true },
  ],

  subjects: ["earth-and-space"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "beginner",
  durationMinutes: 15,
  featured: true,
  learningObjectives: [
    "Name the eight planets and put them in order from the Sun.",
    "Compare planets by size, distance, temperature, gravity and year length.",
    "Explain the difference between rotation (a day) and revolution (a year).",
    "Recognise that the Solar System is drawn to a teaching scale, not true scale.",
  ],
  skills: ["Observation", "Comparison", "Scale and models", "Data reading"],
  achievements: [
    { id: "solar-system-explorer-complete", title: "Space Cadet", description: "Met every planet and watched a full Earth year.", points: 40 },
  ],
  createdAt: "2026-10-13",
  updatedAt: "2026-10-13",
};
