import type { WorksheetContent } from "@/types/education";

export const waterCycleWorksheet: WorksheetContent = {
  id: "worksheet-water-cycle",
  title: "Water Cycle Worksheet",
  slug: "water-cycle",
  contentType: "worksheet",
  taxonomy: [
    {
      category: "educational",
      path: ["learning", "worksheets"],
    },
  ],
  status: "published",
  description: "A printable worksheet for reviewing the main stages of the water cycle.",
  excerpt: "Review evaporation, condensation and precipitation.",
  featured: false,
  placements: ["education", "resources"],
  collections: ["worksheets", "water-cycle"],
  ageGroups: ["9-12"],
  classLevels: ["Primary 5", "Primary 6", "JSS1"],
  subjects: ["Basic Science"],
  topics: ["Water Cycle"],
  difficulty: "beginner",
  durationMinutes: 20,
  skills: ["Recall", "Labelling", "Scientific vocabulary"],
  learningObjectives: [
    "Identify the main stages of the water cycle.",
    "Use basic water-cycle vocabulary."
  ],
  tags: ["worksheet", "water cycle"],
  audience: ["students", "teachers"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  instructions: "Complete the questions and label the water-cycle diagram.",
  questions: [
    "What is evaporation?",
    "What is condensation?",
    "What is precipitation?"
  ],
  printable: true
};

