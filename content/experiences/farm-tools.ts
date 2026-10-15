import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Farm Tools and Their Uses (Primary 3). Content-only: runtime "2d" + component
// "matching" reuses the existing renderer; only artwork was added.
// Companion activity: content/activities/farm-tools.ts ("companion" edge in
// lib/relationships-graph.ts).
export const farmToolsExperience: InteractiveExperienceDefinition = {
  id: "exp-farm-tools",
  slug: "farm-tools",
  title: "Farm Tools and Their Uses",
  contentType: "experience",
  description: "Match each farm tool to the job it is used for on the farm.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "matching",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    { id: "item-cutlass", type: "object", label: "Cutlass", description: "Has a long, sharp blade.", interactive: true, visible: true, properties: { correctTarget: "target-clearing", visual: "tool-cutlass" } },
    { id: "item-hoe", type: "object", label: "Hoe", description: "Has a flat, heavy blade on a short handle.", interactive: true, visible: true, properties: { correctTarget: "target-ridges", visual: "tool-hoe" } },
    { id: "item-rake", type: "object", label: "Rake", description: "Has a row of teeth on a long handle.", interactive: true, visible: true, properties: { correctTarget: "target-gathering", visual: "tool-rake" } },
    { id: "item-watering-can", type: "object", label: "Watering can", description: "Holds water and has a spout with small holes.", interactive: true, visible: true, properties: { correctTarget: "target-watering", visual: "tool-watering-can" } },
    { id: "item-wheelbarrow", type: "object", label: "Wheelbarrow", description: "Has one wheel and two handles.", interactive: true, visible: true, properties: { correctTarget: "target-carrying", visual: "tool-wheelbarrow" } },
    { id: "target-ridges", type: "environment", label: "Making ridges", description: "Heaping soil for planting yam and cassava.", interactive: true, visible: true, properties: { visual: "job-ridges" } },
    { id: "target-watering", type: "environment", label: "Watering seedlings", description: "Giving young plants a gentle shower.", interactive: true, visible: true, properties: { visual: "job-watering" } },
    { id: "target-clearing", type: "environment", label: "Clearing bushes", description: "Cutting grass and weeds.", interactive: true, visible: true, properties: { visual: "job-clearing" } },
    { id: "target-carrying", type: "environment", label: "Carrying loads", description: "Moving harvest, manure or soil.", interactive: true, visible: true, properties: { visual: "job-carrying" } },
    { id: "target-gathering", type: "environment", label: "Gathering leaves", description: "Collecting dry leaves and levelling soil.", interactive: true, visible: true, properties: { visual: "job-gathering" } },
  ],

  // One required task per item (task id === item asset id).
  tasks: [
    { id: "item-cutlass", title: "Match the cutlass", points: 10, required: true },
    { id: "item-hoe", title: "Match the hoe", points: 10, required: true },
    { id: "item-rake", title: "Match the rake", points: 10, required: true },
    { id: "item-watering-can", title: "Match the watering can", points: 10, required: true },
    { id: "item-wheelbarrow", title: "Match the wheelbarrow", points: 10, required: true },
  ],

  interactions: [
    { id: "match-correct", assetId: "target-ridges", trigger: "drop", actions: [{ id: "match-correct-feedback", type: "show-feedback", message: "Great match! That is the right tool for the job." }] },
    { id: "match-incorrect", assetId: "target-ridges", trigger: "drop", actions: [{ id: "match-incorrect-feedback", type: "show-feedback", message: "Not quite. Think about the shape of the tool and what it can do." }] },
  ],

  subjects: ["environmental-science"],
  ageGroups: ["7-8"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: ["Name five common farm tools.", "Match each farm tool to its use.", "State one safety rule for using farm tools."],
  skills: ["Matching", "Recall", "Practical knowledge"],
  achievements: [{ id: "farm-tools-complete", title: "Young Farmer", description: "Matched every tool to its job.", points: 50 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
