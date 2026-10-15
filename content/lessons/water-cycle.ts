import type { LessonContent } from "@/types/education";

export const sampleLesson: LessonContent = {
  id: "lesson-water-cycle",

  title: "Understanding the Water Cycle",

  slug: "water-cycle",

  contentType: "lesson",
  taxonomy: [
    {
      category: "educational",
      path: ["learning", "lessons"],
    },
  ],

  status: "published",

  description:
    "Learn how water moves through evaporation, condensation and precipitation.",

  excerpt:
    "A beginner-friendly introduction to the water cycle.",

  featured: true,

  placements: ["education"],

  collections: ["lessons", "water-cycle"],

  ageGroups: ["9-12"],

  classLevels: ["Primary 5", "Primary 6", "JSS1"],

  subjects: ["Basic Science", "Science"],

  topics: ["Water Cycle"],

  difficulty: "beginner",

  durationMinutes: 30,

  skills: [
    "Observation",
    "Scientific thinking",
  ],

  learningObjectives: [
    "Explain the basic stages of the water cycle.",
    "Describe evaporation and condensation.",
    "Identify precipitation as part of the water cycle.",
  ],

  tags: [
    "water",
    "water cycle",
    "science",
  ],

  audience: [
    "students",
    "teachers",
    "parents",
  ],

  author: "Rhinox Scientifica",

  createdAt: "2026-09-16",

  updatedAt: "2026-09-16",
};
