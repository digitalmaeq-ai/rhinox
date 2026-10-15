import type { ExperimentContent } from "@/types/education";

export const waterCycleExperiment: ExperimentContent = {
  id: "experiment-water-cycle",
  title: "Investigating the Water Cycle",
  slug: "water-cycle",
  contentType: "experiment",
  taxonomy: [
    {
      category: "educational",
      path: ["learning", "experiments"],
    },
  ],
  status: "published",

  description:
    "A practical experiment that helps learners observe how water changes state and understand the basic processes of the water cycle.",

  excerpt:
    "Explore evaporation, condensation and precipitation through a simple practical activity.",

  featured: true,

  placements: ["explore", "education"],
  collections: ["experiments", "water-cycle"],

  ageGroups: ["9-12"],
  classLevels: ["Primary 5", "Primary 6", "JSS1"],

  subjects: ["Basic Science", "Science"],

  topics: [
    "Water Cycle",
    "Evaporation",
    "Condensation",
    "Precipitation",
  ],

  difficulty: "beginner",
  durationMinutes: 30,

  skills: [
    "Observation",
    "Scientific thinking",
    "Recording observations",
    "Making predictions",
  ],

  learningObjectives: [
    "Explain what evaporation means.",
    "Explain what condensation means.",
    "Identify the basic stages of the water cycle.",
    "Record observations from a practical investigation.",
  ],

  tags: [
    "water",
    "water cycle",
    "evaporation",
    "condensation",
    "science experiment",
  ],

  audience: ["students", "teachers", "parents"],

  author: "Rhinox Scientifica",

  createdAt: "2026-09-17",
  updatedAt: "2026-09-17",

  objective:
    "To observe how water changes between liquid and vapour and relate these changes to the water cycle.",

  materials: [
    "Clear glass or transparent container",
    "Warm water",
    "Ice cubes",
    "Plate or shallow cover",
  ],

  equipment: [
    "Clear container",
    "Plate",
  ],

  safetyNotes: [
    "Use warm rather than boiling water when working with younger learners.",
    "An adult or teacher should supervise the activity.",
  ],

  procedure: [
    "Pour warm water into the clear container.",
    "Cover the container with a plate.",
    "Place several ice cubes on top of the plate.",
    "Observe the inside and outside of the container for several minutes.",
    "Record any changes you observe.",
  ],

  observations: [
    "Water vapour rises from the warm water.",
    "The cooler surface encourages condensation.",
    "Small water droplets may form on the underside of the plate.",
  ],

  results:
    "The investigation demonstrates how heating can cause evaporation and cooling can cause water vapour to condense into liquid water.",

  conclusion:
    "The experiment provides a simple model of two important processes in the water cycle: evaporation and condensation.",

  extensionActivities: [
    "Investigate what happens when the container is placed in a warmer or cooler location.",
    "Create a labelled diagram of the water cycle.",
    "Build a simple water-cycle model.",
  ],

  // This item's relationships (supports the water-cycle lesson, followed up
  // by the water-cycle quiz, extended by the water-cycle-model project) now
  // live as edges in lib/relationships-graph.ts instead of nested here.
};
