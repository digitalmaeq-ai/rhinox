import type { AssessmentContent } from "@/types/education";

export const waterCycleAssessment: AssessmentContent = {
  id: "assessment-water-cycle",
  title: "Water Cycle Assessment",
  slug: "water-cycle",
  contentType: "assessment",
  taxonomy: [
    {
      category: "educational",
      path: ["learning", "assessments"],
    },
  ],
  status: "published",
  description: "A short assessment covering the basic stages of the water cycle.",
  excerpt: "Check your understanding of the water cycle.",
  featured: false,
  placements: ["education"],
  collections: ["assessments", "water-cycle"],
  ageGroups: ["9-12"],
  classLevels: ["Primary 5", "Primary 6", "JSS1"],
  subjects: ["Basic Science"],
  topics: ["Water Cycle"],
  difficulty: "beginner",
  durationMinutes: 15,
  skills: ["Recall", "Scientific understanding"],
  learningObjectives: [
    "Recall the main stages of the water cycle.",
    "Explain basic changes of state."
  ],
  tags: ["assessment", "water cycle"],
  audience: ["students", "teachers"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  assessmentType: "test",
  totalMarks: 10,
  questions: [
    "Define evaporation.",
    "Define condensation.",
    "Name one form of precipitation."
  ]
};

