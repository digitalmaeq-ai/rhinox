import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Migrated from the old standalone lib/interactive-experiences.ts catalogue
// — same data, now a first-class ContentItem (contentType: "experience",
// engine: "runtime") picked up automatically by
// scripts/generate-content-index.mjs instead of living in a second,
// parallel content list.
export const stemExplorer: InteractiveExperienceDefinition = {
  id: "exp-stem-explorer",
  slug: "stem-explorer",
  title: "STEM Explorer",
  contentType: "experience",
  description:
    "An interactive introduction to the Rhinox world of science, technology, engineering and mathematics.",
  // Archived: removed from the experience library at the owner's request.
  status: "archived",

  taxonomy: [
    {
      category: "interactive",
      path: ["experiences", "interactive-learning", "explorations"],
    },
  ],

  runtime: "standard",

  modes: ["interactive", "learning-tool"],

  variables: [
    {
      id: "exploration-points",
      label: "Exploration Points",
      type: "number",
      initialValue: 0,
      min: 0,
      max: 100,
      step: 10,
      unit: "points",
    },
  ],

  assets: [
    {
      id: "engineering-zone",
      type: "object",
      label: "Engineering Zone",
      description: "An interactive area for discovering engineering.",
      interactive: true,
      visible: true,
    },
  ],

  interactions: [
    {
      id: "explore-engineering",
      assetId: "engineering-zone",
      trigger: "click",
      actions: [
        {
          id: "award-exploration-points",
          type: "change-variable",
          variableId: "exploration-points",
          value: 10,
          points: 10,
          message: "You discovered the engineering area of STEM.",
        },
      ],
    },
  ],

  rules: [
    {
      id: "engineering-discovery-rule",
      variableId: "exploration-points",
      operator: "greater-than-or-equal",
      value: 10,
      actions: [
        {
          id: "engineering-discovery-feedback",
          type: "show-feedback",
          message: "Engineering discovery completed.",
        },
      ],
    },
  ],

  subjects: ["general-stem"],

  ageGroups: ["9-12", "13-15"],

  difficulty: "beginner",

  durationMinutes: 10,

  featured: true,

  learningObjectives: [
    "Explore the different areas of STEM.",
    "Identify how science, technology, engineering and mathematics connect.",
    "Discover how interactive learning can support practical STEM education.",
  ],

  skills: ["Observation", "Problem solving", "Critical thinking", "Exploration"],

  scenes: [
    {
      id: "welcome",
      title: "Welcome to STEM Explorer",
      description:
        "Begin your journey through the Rhinox interactive STEM environment.",
      order: 1,
    },
  ],

  tasks: [
    {
      id: "explore-stem",
      sceneId: "welcome",
      title: "Explore STEM",
      description:
        "Explore the STEM environment and discover the different areas of learning.",
      instructions: [
        "Explore the available areas.",
        "Identify one area that interests you.",
        "Continue to the next activity.",
      ],
      points: 10,
      required: true,
    },
  ],

  questions: [
    {
      id: "stem-explorer-question-1",
      question:
        "Which area of STEM focuses on designing and building solutions to practical problems?",
      type: "multiple-choice",
      options: [
        { id: "science", text: "Science" },
        { id: "technology", text: "Technology" },
        { id: "engineering", text: "Engineering" },
        { id: "mathematics", text: "Mathematics" },
      ],
      correctAnswer: "engineering",
      explanation:
        "Engineering applies scientific and mathematical knowledge to design and build solutions.",
      points: 10,
    },
  ],

  achievements: [
    {
      id: "stem-explorer-complete",
      title: "STEM Explorer",
      description: "Completed your first Rhinox interactive STEM experience.",
      points: 20,
    },
  ],

  createdAt: "2026-09-23",
  updatedAt: "2026-09-23",
};
