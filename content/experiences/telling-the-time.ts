import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Telling the Time (Primary 2). Content-only: runtime "2d" + component
// "matching" reuses the existing renderer; only artwork was added.
// Companion activity: content/activities/telling-the-time.ts ("companion" edge in
// lib/relationships-graph.ts).
export const tellingTheTimeExperience: InteractiveExperienceDefinition = {
  id: "exp-telling-the-time",
  slug: "telling-the-time",
  title: "Telling the Time",
  contentType: "experience",
  description: "Read the clocks for a school day and match each one to the right time.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "matching",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    { id: "item-wake-up", type: "object", label: "Wake up", description: "The long hand points straight up to 12.", interactive: true, visible: true, properties: { correctTarget: "target-6-00", visual: "clock-6-00" } },
    { id: "item-school-starts", type: "object", label: "School starts", description: "The long hand points down to 6.", interactive: true, visible: true, properties: { correctTarget: "target-7-30", visual: "clock-7-30" } },
    { id: "item-break-time", type: "object", label: "Break time", description: "The long hand points to 3.", interactive: true, visible: true, properties: { correctTarget: "target-10-15", visual: "clock-10-15" } },
    { id: "item-bedtime", type: "object", label: "Bedtime", description: "The long hand points to 9.", interactive: true, visible: true, properties: { correctTarget: "target-8-45", visual: "clock-8-45" } },
    { id: "target-7-30", type: "text", label: "Half past 7", interactive: true, visible: true, properties: { visual: "clock-7-30" } },
    { id: "target-8-45", type: "text", label: "Quarter to 9", interactive: true, visible: true, properties: { visual: "clock-8-45" } },
    { id: "target-6-00", type: "text", label: "6 o'clock", interactive: true, visible: true, properties: { visual: "clock-6-00" } },
    { id: "target-10-15", type: "text", label: "Quarter past 10", interactive: true, visible: true, properties: { visual: "clock-10-15" } },
  ],

  // One required task per item (task id === item asset id).
  tasks: [
    { id: "item-wake-up", title: "Match the wake up", points: 10, required: true },
    { id: "item-school-starts", title: "Match the school starts", points: 10, required: true },
    { id: "item-break-time", title: "Match the break time", points: 10, required: true },
    { id: "item-bedtime", title: "Match the bedtime", points: 10, required: true },
  ],

  interactions: [
    { id: "match-correct", assetId: "target-7-30", trigger: "drop", actions: [{ id: "match-correct-feedback", type: "show-feedback", message: "Great match! You read the clock correctly." }] },
    { id: "match-incorrect", assetId: "target-7-30", trigger: "drop", actions: [{ id: "match-incorrect-feedback", type: "show-feedback", message: "Not quite. Look at where the short hand and the long hand are pointing." }] },
  ],

  subjects: ["mathematics"],
  ageGroups: ["6-7"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: ["Read o'clock, half past, quarter past and quarter to on an analogue clock.", "Match a clock face to a written time."],
  skills: ["Reading clocks", "Matching", "Number sense"],
  achievements: [{ id: "telling-the-time-complete", title: "Time Keeper", description: "Matched every clock to its time.", points: 40 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
