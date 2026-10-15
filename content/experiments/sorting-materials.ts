import type { ExperimentContent } from "@/types/education";

// The first Rhinox interactive experiment prototype. This record is the
// physical/educational description of the activity (the "WHAT") — it
// carries no renderer or drag-and-drop implementation detail. The actual
// interactive treatment lives in the paired "experience" record
// (content/experiences/sorting-materials.ts), linked below via a
// "companion" relationship, exactly like the existing
// lesson -> companion -> video pattern already used elsewhere in the
// catalogue.
export const sortingMaterialsExperiment: ExperimentContent = {
  id: "experiment-sorting-materials",
  title: "Sorting Materials",
  slug: "sorting-materials",
  contentType: "experiment",
  taxonomy: [
    {
      category: "educational",
      path: ["learning", "experiments"],
    },
  ],
  status: "published",

  description:
    "Sort everyday objects into Hard and Soft groups based on what you can see and feel, then check your sorting with an interactive activity.",

  excerpt: "Is it hard, or is it soft? Sort real objects to find out.",

  featured: true,

  placements: ["explore", "education"],
  collections: ["experiments", "materials-and-properties"],

  ageGroups: ["5-6"],
  classLevels: ["Year 1"],

  subjects: ["Science"],
  topics: ["Materials", "Properties of Materials", "Classification"],

  difficulty: "beginner",
  durationMinutes: 15,

  skills: ["Observation", "Classification", "Comparing"],

  learningObjectives: [
    "Group everyday objects and materials by an observable property (hard or soft).",
    "Explain the reason for placing an object in a particular group.",
  ],

  tags: ["materials", "sorting", "classification", "year 1"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-26",
  updatedAt: "2026-09-26",

  objective:
    "To group a set of everyday objects into Hard and Soft categories based on how they feel.",

  materials: [
    "A stone",
    "A sponge",
    "A wooden block",
    "A cotton ball",
    "A metal spoon",
    "A rubber ball",
  ],

  procedure: [
    "Look at each object and predict whether it feels hard or soft.",
    "Pick up each object and press it gently to test whether it changes shape.",
    "Place each object into the Hard group or the Soft group.",
    "Check your groups: hard objects keep their shape when pressed, soft objects change shape easily.",
  ],

  observations: [
    "Objects like the stone, wooden block and metal spoon do not change shape when pressed.",
    "Objects like the sponge, cotton ball and rubber ball change shape easily when pressed.",
  ],

  results:
    "The stone, wooden block and metal spoon sorted into the Hard group. The sponge, cotton ball and rubber ball sorted into the Soft group.",

  conclusion:
    "Materials can be grouped by properties we can observe and feel, such as whether they are hard or soft.",

  extensionActivities: [
    "Find three more objects at home and sort them into Hard and Soft.",
    "Try sorting the same objects by a different property, such as rough or smooth.",
  ],

  // Interactive-readiness metadata (types/education.ts). This experiment
  // is one of the few actually being built as an interactive experience —
  // see the paired "experience" record for the real implementation.
  interactionModel: "interactive-2d",
  interactionFeatures: [
    "drag-and-drop",
    "sorting",
    "classification",
    "immediate-feedback",
    "retry",
  ],
  // No simulationVariables: a binary hard/soft sort has no scientifically
  // meaningful adjustable parameter, so the field is intentionally left
  // unset rather than populated for its own sake.
};
