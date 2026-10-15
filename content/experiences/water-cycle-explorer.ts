import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Migrated from the old standalone lib/interactive-experiences.ts catalogue
// — same data, now a first-class ContentItem (contentType: "experience",
// engine: "runtime") picked up automatically by
// scripts/generate-content-index.mjs instead of living in a second,
// parallel content list.
export const waterCycleExplorer: InteractiveExperienceDefinition = {
  id: "exp-water-cycle-explorer",
  slug: "water-cycle-explorer",
  title: "Water Cycle Explorer",
  contentType: "experience",
  description:
    "Explore how water moves through evaporation, condensation and precipitation in the water cycle.",
  status: "active",

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
      id: "water-cycle-progress",
      label: "Water Cycle Progress",
      type: "number",
      initialValue: 0,
      min: 0,
      max: 100,
      step: 10,
      unit: "percent",
    },
  ],

  assets: [
    {
      id: "evaporation-zone",
      type: "object",
      label: "Evaporation",
      description:
        "Explore how heat causes liquid water to change into water vapour.",
      interactive: true,
      visible: true,
    },
    {
      id: "condensation-zone",
      type: "object",
      label: "Condensation",
      description:
        "Explore how water vapour cools and forms tiny water droplets.",
      interactive: true,
      visible: true,
    },
    {
      id: "precipitation-zone",
      type: "object",
      label: "Precipitation",
      description:
        "Explore how water falls from clouds as rain and other forms of precipitation.",
      interactive: true,
      visible: true,
    },
  ],

  interactions: [
    {
      id: "explore-evaporation",
      assetId: "evaporation-zone",
      trigger: "click",
      actions: [
        {
          id: "evaporation-progress",
          type: "change-variable",
          variableId: "water-cycle-progress",
          value: 10,
          points: 10,
          message:
            "Evaporation begins when heat provides energy for liquid water to become water vapour.",
        },
      ],
    },
    {
      id: "explore-condensation",
      assetId: "condensation-zone",
      trigger: "click",
      actions: [
        {
          id: "condensation-progress",
          type: "change-variable",
          variableId: "water-cycle-progress",
          value: 10,
          points: 10,
          message:
            "Condensation occurs when water vapour cools and changes into tiny liquid water droplets.",
        },
      ],
    },
    {
      id: "explore-precipitation",
      assetId: "precipitation-zone",
      trigger: "click",
      actions: [
        {
          id: "precipitation-progress",
          type: "change-variable",
          variableId: "water-cycle-progress",
          value: 10,
          points: 10,
          message:
            "Precipitation occurs when water falls from clouds to the Earth's surface.",
        },
      ],
    },
  ],

  rules: [
    {
      id: "water-cycle-first-stage",
      variableId: "water-cycle-progress",
      operator: "greater-than-or-equal",
      value: 10,
      actions: [
        {
          id: "evaporation-feedback",
          type: "show-feedback",
          message: "Evaporation stage explored.",
        },
      ],
    },
    {
      id: "water-cycle-second-stage",
      variableId: "water-cycle-progress",
      operator: "greater-than-or-equal",
      value: 20,
      actions: [
        {
          id: "condensation-feedback",
          type: "show-feedback",
          message: "Condensation stage explored.",
        },
      ],
    },
    {
      id: "water-cycle-third-stage",
      variableId: "water-cycle-progress",
      operator: "greater-than-or-equal",
      value: 30,
      actions: [
        {
          id: "precipitation-feedback",
          type: "show-feedback",
          message: "Precipitation stage explored.",
        },
      ],
    },
  ],

  subjects: ["biology", "environmental-science", "earth-and-space"],

  ageGroups: ["9-12", "13-15"],

  difficulty: "beginner",
  durationMinutes: 15,
  featured: true,

  learningObjectives: [
    "Explain the process of evaporation.",
    "Explain how condensation forms water droplets.",
    "Describe precipitation as part of the water cycle.",
    "Understand that water continuously moves between different parts of the Earth's system.",
  ],

  skills: [
    "Observation",
    "Scientific reasoning",
    "Cause and effect",
    "Systems thinking",
  ],

  scenes: [
    {
      id: "evaporation",
      title: "Scene 1: Evaporation",
      description:
        "The Sun provides energy that causes liquid water to evaporate into water vapour.",
      order: 1,
    },
    {
      id: "condensation",
      title: "Scene 2: Condensation",
      description:
        "As water vapour rises and cools, it condenses into tiny droplets that form clouds.",
      order: 2,
    },
    {
      id: "precipitation",
      title: "Scene 3: Precipitation",
      description:
        "When water droplets become large and heavy enough, water falls back to the Earth's surface.",
      order: 3,
    },
  ],

  tasks: [
    {
      id: "explore-evaporation-task",
      sceneId: "evaporation",
      title: "Explore evaporation",
      description: "Discover what happens when liquid water receives heat energy.",
      instructions: [
        "Explore the evaporation area.",
        "Observe the explanation.",
        "Complete the task when you understand the process.",
      ],
      points: 10,
      required: true,
    },
    {
      id: "explore-condensation-task",
      sceneId: "condensation",
      title: "Explore condensation",
      description:
        "Discover how cooling changes water vapour into tiny liquid droplets.",
      instructions: [
        "Explore the condensation area.",
        "Observe the explanation.",
        "Complete the task when you understand the process.",
      ],
      points: 10,
      required: true,
    },
    {
      id: "explore-precipitation-task",
      sceneId: "precipitation",
      title: "Explore precipitation",
      description: "Discover how water returns from clouds to the Earth's surface.",
      instructions: [
        "Explore the precipitation area.",
        "Observe the explanation.",
        "Complete the task when you understand the process.",
      ],
      points: 10,
      required: true,
    },
  ],

  questions: [
    {
      id: "water-cycle-question-1",
      question:
        "What provides most of the energy that drives evaporation in the water cycle?",
      type: "multiple-choice",
      options: [
        { id: "moon", text: "The Moon" },
        { id: "sun", text: "The Sun" },
        { id: "wind", text: "Wind" },
        { id: "clouds", text: "Clouds" },
      ],
      correctAnswer: "sun",
      explanation: "Solar energy from the Sun provides the heat that drives evaporation.",
      points: 10,
    },
  ],

  achievements: [
    {
      id: "water-cycle-explorer-complete",
      title: "Water Cycle Explorer",
      description: "Completed the Water Cycle Explorer experience.",
      points: 30,
    },
  ],

  createdAt: "2026-09-23",
  updatedAt: "2026-09-23",
};
