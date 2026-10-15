import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// The interactive treatment of the "Animals and Their Habitats" experiment
// (content/experiments/animals-and-habitats.ts, linked via a "companion"
// relationship in lib/relationships-graph.ts).
//
// runtime "2d" + component "matching" selects MatchingRenderer through the
// registry in app/components/interactive/runtimes/TwoDRenderer.tsx.
//
// Matching data contract (no schema changes — everything uses the existing
// InteractiveAsset.properties field, following Sorting Materials):
//   - a SOURCE is any asset with `properties.correctTarget` (the answer key
//     lives on the thing being moved, like Sorting's `correctZone`);
//   - a TARGET is any asset a source points to; its `type` is free to say
//     what it actually is (here: "environment");
//   - one required task per source, task id === source asset id;
//   - generic "match-correct" / "match-incorrect" feedback interactions.
// Matching is one-to-one: each target accepts exactly one source.
//
// Targets are listed in a different order from the sources on purpose, so
// the answers never line up down the page.
export const animalsAndHabitatsExperience: InteractiveExperienceDefinition = {
  id: "exp-animals-and-habitats",
  slug: "animals-and-habitats",
  title: "Animals and Their Habitats",
  contentType: "experience",
  description:
    "Match each animal to the habitat it is suited to, and get instant feedback on every match.",
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
    // ----- Sources (animals) -----
    {
      id: "item-fish",
      type: "object",
      label: "Fish",
      description: "Has fins to swim and gills to breathe under water.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-pond" },
    },
    {
      id: "item-camel",
      type: "object",
      label: "Camel",
      description: "Stores fat in its hump and can go a long time without water.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-desert" },
    },
    {
      id: "item-polar-bear",
      type: "object",
      label: "Polar bear",
      description: "Has thick white fur and a layer of fat to keep warm.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-arctic" },
    },
    {
      id: "item-monkey",
      type: "object",
      label: "Monkey",
      description: "Has long arms and a tail for climbing and swinging in tall trees.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-rainforest" },
    },
    {
      id: "item-owl",
      type: "object",
      label: "Owl",
      description: "Rests in trees by day and hunts small animals at night.",
      interactive: true,
      visible: true,
      properties: { correctTarget: "target-woodland" },
    },

    // ----- Targets (habitats) -----
    {
      id: "target-desert",
      type: "environment",
      label: "Desert",
      description: "Hot, dry and sandy, with very little water.",
      interactive: true,
      visible: true,
    },
    {
      id: "target-woodland",
      type: "environment",
      label: "Woodland",
      description: "Lots of trees, with quiet, dark nights.",
      interactive: true,
      visible: true,
    },
    {
      id: "target-pond",
      type: "environment",
      label: "Pond",
      description: "Still fresh water with plants and mud.",
      interactive: true,
      visible: true,
    },
    {
      id: "target-arctic",
      type: "environment",
      label: "Arctic",
      description: "Freezing cold, covered in snow and ice.",
      interactive: true,
      visible: true,
    },
    {
      id: "target-rainforest",
      type: "environment",
      label: "Rainforest",
      description: "Hot and wet, with very tall trees.",
      interactive: true,
      visible: true,
    },
  ],

  // One required task per source. Reuses completeTask /
  // areRequiredTasksComplete / completeExperience exactly as Sorting does:
  // a task completes only when its animal is matched to the right habitat.
  tasks: [
    {
      id: "item-fish",
      title: "Match the fish",
      description: "Find the habitat where the fish lives.",
      points: 10,
      required: true,
    },
    {
      id: "item-camel",
      title: "Match the camel",
      description: "Find the habitat where the camel lives.",
      points: 10,
      required: true,
    },
    {
      id: "item-polar-bear",
      title: "Match the polar bear",
      description: "Find the habitat where the polar bear lives.",
      points: 10,
      required: true,
    },
    {
      id: "item-monkey",
      title: "Match the monkey",
      description: "Find the habitat where the monkey lives.",
      points: 10,
      required: true,
    },
    {
      id: "item-owl",
      title: "Match the owl",
      description: "Find the habitat where the owl lives.",
      points: 10,
      required: true,
    },
  ],

  // Generic feedback interactions. The renderer decides correct/incorrect
  // (target id vs the source's properties.correctTarget) and triggers the
  // matching id — the same mechanism Sorting uses with "sort-correct".
  interactions: [
    {
      id: "match-correct",
      assetId: "target-pond",
      trigger: "drop",
      actions: [
        {
          id: "match-correct-feedback",
          type: "show-feedback",
          message: "Great match! That animal is suited to its habitat.",
        },
      ],
    },
    {
      id: "match-incorrect",
      assetId: "target-pond",
      trigger: "drop",
      actions: [
        {
          id: "match-incorrect-feedback",
          type: "show-feedback",
          message: "Not quite. Think about what this animal needs to survive.",
        },
      ],
    },
  ],

  subjects: ["biology"],

  ageGroups: ["6-7"],

  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,

  learningObjectives: [
    "Match animals to the habitats they are suited to.",
    "Describe a feature that helps an animal survive in its habitat.",
  ],

  skills: ["Observation", "Matching", "Explaining"],

  achievements: [
    {
      id: "animals-and-habitats-complete",
      title: "Habitat Explorer",
      description: "Matched every animal to its habitat.",
      points: 50,
    },
  ],

  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
