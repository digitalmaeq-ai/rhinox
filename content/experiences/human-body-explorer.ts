import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Human Body Explorer. runtime "3d" + component "human-body" selects
// HumanBodyExplorer (3D and flat views over one list of body parts).
// Part data: lib/human-body/body-data.ts.
export const humanBodyExplorerExperience: InteractiveExperienceDefinition = {
  id: "exp-human-body-explorer",
  slug: "human-body-explorer",
  title: "Human Body Explorer",
  contentType: "experience",
  description:
    "Peel the human body back layer by layer, from skin to muscles, organs and skeleton. Turn it in 3D, tap any part to see what it does, then test yourself in the Find-it challenge.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "games", "science-games"] }],

  runtime: "3d",
  component: "human-body",
  modes: ["interactive", "3d", "learning-tool"],

  tasks: [
    { id: "peel-layers", title: "Peel back all four layers", description: "Visit skin, muscles, organs and skeleton.", points: 20, required: true },
    { id: "meet-organs", title: "Meet six organs", description: "Tap six different organs to read about them.", points: 30, required: true },
    { id: "muscles-and-bones", title: "Study four muscles and four bones", description: "Tap four muscles and four bones.", points: 30, required: true },
    { id: "find-challenge", title: "Win the Find-it challenge", description: "Find five body parts when only their job is given.", points: 40, required: true },
  ],

  subjects: ["biology"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "beginner",
  durationMinutes: 15,
  featured: true,
  learningObjectives: [
    "Name the main muscles, organs and bones of the human body.",
    "Describe what each part does and which body system it belongs to.",
    "Explain how the layers of the body fit together, from skin to skeleton.",
    "Locate organs and bones relative to one another.",
  ],
  skills: ["Observation", "Spatial reasoning", "Scientific vocabulary", "Recall"],
  achievements: [
    { id: "human-body-explorer-complete", title: "Body Expert", description: "Peeled back every layer and won the Find-it challenge.", points: 40 },
  ],
  createdAt: "2026-10-13",
  updatedAt: "2026-10-13",
};
