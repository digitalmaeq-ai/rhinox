import type { ActivityContent } from "@/types/education";

export const waterCycleActivity: ActivityContent = {
  id: "activity-water-cycle-observation",
  title: "Water Cycle Observation Activity",
  slug: "water-cycle-observation",
  contentType: "activity",
  taxonomy: [
    {
      category: "educational",
      path: ["learning", "activities"],
    },
  ],
  status: "published",
  description: "Observe changes in water and record what happens during a simple classroom activity.",
  excerpt: "Observe, record and discuss changes in water.",
  featured: false,
  placements: ["education"],
  collections: ["activities", "water-cycle"],
  ageGroups: ["9-12"],
  classLevels: ["Primary 5", "Primary 6", "JSS1"],
  subjects: ["Basic Science"],
  topics: ["Water Cycle", "Observation"],
  difficulty: "beginner",
  durationMinutes: 20,
  skills: ["Observation", "Recording"],
  learningObjectives: [
    "Observe changes in water.",
    "Record observations accurately."
  ],
  tags: ["water", "observation"],
  audience: ["students", "teachers"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  activityType: "classroom",
  instructions: "Observe a container of warm water and record visible changes over time.",
  materials: ["Clear container", "Warm water", "Notebook"],
  expectedOutcome: "Learners identify visible changes and record their observations."
};


