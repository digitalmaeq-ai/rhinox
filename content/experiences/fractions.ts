import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Matching Fractions (Primary 3). Content-only: runtime "2d" + component
// "matching" reuses the existing renderer; only artwork was added.
// Companion activity: content/activities/fractions.ts ("companion" edge in
// lib/relationships-graph.ts).
export const fractionsExperience: InteractiveExperienceDefinition = {
  id: "exp-fractions",
  slug: "fractions",
  title: "Matching Fractions",
  contentType: "experience",
  description: "Match each shaded food to the fraction that describes the shaded part.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "matching",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    { id: "item-pizza", type: "object", label: "Pizza", description: "Count the equal slices. How many are shaded?", interactive: true, visible: true, properties: { correctTarget: "target-one-quarter", visual: "fraction-circle-1-4" } },
    { id: "item-chocolate", type: "object", label: "Chocolate bar", description: "Count the equal pieces. How many are shaded?", interactive: true, visible: true, properties: { correctTarget: "target-three-quarters", visual: "fraction-bar-3-4" } },
    { id: "item-orange", type: "object", label: "Orange", description: "Count the equal parts. How many are shaded?", interactive: true, visible: true, properties: { correctTarget: "target-one-half", visual: "fraction-circle-1-2" } },
    { id: "item-cake", type: "object", label: "Cake", description: "Count the equal pieces. How many are shaded?", interactive: true, visible: true, properties: { correctTarget: "target-one-third", visual: "fraction-bar-1-3" } },
    { id: "target-one-half", type: "text", label: "One half", description: "1 of 2 equal parts.", interactive: true, visible: true, properties: { visual: "fraction-1-2" } },
    { id: "target-one-third", type: "text", label: "One third", description: "1 of 3 equal parts.", interactive: true, visible: true, properties: { visual: "fraction-1-3" } },
    { id: "target-three-quarters", type: "text", label: "Three quarters", description: "3 of 4 equal parts.", interactive: true, visible: true, properties: { visual: "fraction-3-4" } },
    { id: "target-one-quarter", type: "text", label: "One quarter", description: "1 of 4 equal parts.", interactive: true, visible: true, properties: { visual: "fraction-1-4" } },
  ],

  // One required task per item (task id === item asset id).
  tasks: [
    { id: "item-pizza", title: "Match the pizza", points: 10, required: true },
    { id: "item-chocolate", title: "Match the chocolate bar", points: 10, required: true },
    { id: "item-orange", title: "Match the orange", points: 10, required: true },
    { id: "item-cake", title: "Match the cake", points: 10, required: true },
  ],

  interactions: [
    { id: "match-correct", assetId: "target-one-half", trigger: "drop", actions: [{ id: "match-correct-feedback", type: "show-feedback", message: "Great match! That fraction describes the shaded part." }] },
    { id: "match-incorrect", assetId: "target-one-half", trigger: "drop", actions: [{ id: "match-incorrect-feedback", type: "show-feedback", message: "Not quite. Count the equal parts, then count the shaded parts." }] },
  ],

  subjects: ["mathematics"],
  ageGroups: ["7-8"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: ["Recognise halves, quarters, three quarters and thirds.", "Match a shaded picture to its fraction."],
  skills: ["Counting", "Matching", "Reasoning"],
  achievements: [{ id: "fractions-complete", title: "Fraction Finder", description: "Matched every picture to its fraction.", points: 40 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
