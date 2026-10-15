import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// The interactive treatment of the "Separating Mixtures" experiment
// (content/experiments/separating-mixtures.ts, linked via a "companion"
// relationship in lib/relationships-graph.ts).
//
// Built with NO new code: runtime "2d" + component "matching" reuses
// MatchingRenderer exactly as Animals and Their Habitats does, following
// the same data contract (sources carry properties.correctTarget; targets
// are whatever the sources point to; one required task per source;
// "match-correct" / "match-incorrect" feedback interactions). Only new
// artwork was added to MatchingVisuals.tsx.
//
// Each mixture has exactly one best Year 5 separation method, so the
// activity stays one-to-one. Targets are listed in a different order from
// the sources so the answers never line up down the page.
export const separatingMixturesExperience: InteractiveExperienceDefinition = {
  id: "exp-separating-mixtures",
  slug: "separating-mixtures",
  title: "Separating Mixtures",
  contentType: "experience",
  description:
    "Match each mixture to the method that separates it — filtering, sieving, evaporating or using a magnet.",
  status: "active",

  taxonomy: [
    {
      category: "interactive",
      path: ["experiences", "interactive-learning", "explorations"],
    },
  ],

  runtime: "2d",

  // Which 2D interaction renderer runs this experience (see the registry in
  // app/components/interactive/runtimes/TwoDRenderer.tsx).
  component: "matching",

  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    // ----- Sources (mixtures) -----
    {
      id: "item-sand-and-water",
      type: "object",
      label: "Sand and water",
      description: "Sand does not dissolve. It sinks and stays as tiny solid grains.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-filtering" },
    },
    {
      id: "item-salt-water",
      type: "object",
      label: "Salt water",
      description: "The salt has dissolved, so you cannot see it or catch it in a filter.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-evaporating" },
    },
    {
      id: "item-iron-filings-and-sand",
      type: "object",
      label: "Iron filings and sand",
      description: "Iron is a magnetic metal. Sand is not magnetic.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-using-a-magnet" },
    },
    {
      id: "item-pebbles-and-sand",
      type: "object",
      label: "Pebbles and sand",
      description: "Both are solids, but the pebbles are much bigger than the sand grains.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-sieving" },
    },

    // ----- Targets (separation methods) -----
    {
      id: "target-evaporating",
      type: "object",
      label: "Evaporating",
      description: "Heat the liquid until the water turns to vapour and leaves.",
      interactive: true,
      visible: true,
    },
    {
      id: "target-sieving",
      type: "object",
      label: "Sieving",
      description: "Small bits fall through the holes; big bits stay behind.",
      interactive: true,
      visible: true,
    },
    {
      id: "target-using-a-magnet",
      type: "object",
      label: "Using a magnet",
      description: "Pulls magnetic materials out of the mixture.",
      interactive: true,
      visible: true,
    },
    {
      id: "target-filtering",
      type: "object",
      label: "Filtering",
      description: "Filter paper lets liquid through but traps solid grains.",
      interactive: true,
      visible: true,
    },
  ],

  tasks: [
    {
      id: "item-sand-and-water",
      title: "Separate the sand and water",
      description: "Choose the method that separates sand from water.",
      points: 10,
      required: true,
    },
    {
      id: "item-salt-water",
      title: "Separate the salt water",
      description: "Choose the method that gets the salt back from salt water.",
      points: 10,
      required: true,
    },
    {
      id: "item-iron-filings-and-sand",
      title: "Separate the iron filings and sand",
      description: "Choose the method that separates iron filings from sand.",
      points: 10,
      required: true,
    },
    {
      id: "item-pebbles-and-sand",
      title: "Separate the pebbles and sand",
      description: "Choose the method that separates pebbles from sand.",
      points: 10,
      required: true,
    },
  ],

  interactions: [
    {
      id: "match-correct",
      assetId: "target-filtering",
      trigger: "drop",
      actions: [
        {
          id: "match-correct-feedback",
          type: "show-feedback",
          message: "Great match! That method separates this mixture.",
        },
      ],
    },
    {
      id: "match-incorrect",
      assetId: "target-filtering",
      trigger: "drop",
      actions: [
        {
          id: "match-incorrect-feedback",
          type: "show-feedback",
          message:
            "Not quite. Think about particle size, magnetism, and whether something has dissolved.",
        },
      ],
    },
  ],

  subjects: ["chemistry"],

  ageGroups: ["9-10"],

  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,

  learningObjectives: [
    "Choose a suitable method to separate a mixture.",
    "Explain how filtering, sieving, evaporating and magnetism separate materials.",
  ],

  skills: ["Classification", "Reasoning", "Explaining"],

  achievements: [
    {
      id: "separating-mixtures-complete",
      title: "Mixture Separator",
      description: "Matched every mixture to the method that separates it.",
      points: 40,
    },
  ],

  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
