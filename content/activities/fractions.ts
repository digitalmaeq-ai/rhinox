import type { ActivityContent } from "@/types/education";

// Classroom activity for Matching Fractions. The interactive version lives in
// content/experiences/fractions.ts, linked by a "companion" relationship.
export const fractionsActivity: ActivityContent = {
  id: "activity-fractions",
  title: "Matching Fractions",
  slug: "fractions",
  contentType: "activity",
  taxonomy: [{ category: "educational", path: ["learning", "activities"] }],
  status: "published",
  description: "Match each shaded food to the fraction that describes the shaded part.",
  excerpt: "How much of the pizza is shaded? Match the picture to its fraction.",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "fractions"],
  ageGroups: ["7-8"],
  classLevels: ["Primary 3"],
  subjects: ["Mathematics"],
  topics: ["Fractions", "Halves", "Quarters", "Thirds"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Counting", "Matching", "Reasoning"],
  learningObjectives: ["Recognise halves, quarters, three quarters and thirds.", "Match a shaded picture to its fraction."],
  tags: ["fractions", "halves", "quarters", "thirds", "primary 3"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "classroom",
  instructions: "Fold paper circles and strips into equal parts, shade some parts, and write the fraction for the shaded part.",
  materials: ["Paper circles and strips", "Coloured pencils", "Scissors"],
  expectedOutcome: "Learners identify halves, quarters and thirds and write fractions for shaded parts.",
};
