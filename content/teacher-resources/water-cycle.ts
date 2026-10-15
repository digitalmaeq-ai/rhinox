import type { TeacherResourceContent } from "@/types/resources";

export const waterCycleTeachingGuide: TeacherResourceContent = {
  id: "teacher-resource-water-cycle",
  title: "Water Cycle Teaching Guide",
  slug: "water-cycle-teaching-guide",
  contentType: "teacher-resource",
  taxonomy: [
    {
      category: "resource",
      path: ["resources", "teacher-resources"],
    },
  ],
  status: "published",
  description: "A practical guide for teachers delivering a water-cycle lesson and experiment.",
  excerpt: "Support your water-cycle lesson with a practical teaching guide.",
  featured: false,
  placements: ["education", "resources"],
  collections: ["teacher-resources", "water-cycle"],
  ageGroups: ["9-14"],
  classLevels: ["Primary 5", "Primary 6", "JSS1"],
  subjects: ["Basic Science"],
  topics: ["Water Cycle"],
  difficulty: "beginner",
  skills: ["Lesson planning", "Practical teaching"],
  tags: ["teacher", "lesson plan", "water cycle"],
  audience: ["teachers"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  resourceType: "teaching-guide",
  instructions: "Use this guide alongside the water-cycle lesson and experiment.",
  materials: ["Water-cycle worksheet", "Experiment materials"]
};

