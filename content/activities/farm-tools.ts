import type { ActivityContent } from "@/types/education";

// Classroom activity for Farm Tools and Their Uses. The interactive version lives in
// content/experiences/farm-tools.ts, linked by a "companion" relationship.
export const farmToolsActivity: ActivityContent = {
  id: "activity-farm-tools",
  title: "Farm Tools and Their Uses",
  slug: "farm-tools",
  contentType: "activity",
  taxonomy: [{ category: "educational", path: ["learning", "activities"] }],
  status: "published",
  description: "Match each farm tool to the job it is used for on the farm.",
  excerpt: "Which tool would you use to make ridges for yam?",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "farm-tools"],
  ageGroups: ["7-8"],
  classLevels: ["Primary 3"],
  subjects: ["Agricultural Science"],
  topics: ["Farm Tools", "Farming", "Tool Safety"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Matching", "Recall", "Practical knowledge"],
  learningObjectives: ["Name five common farm tools.", "Match each farm tool to its use.", "State one safety rule for using farm tools."],
  tags: ["farm tools", "farming", "tool safety", "primary 3"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "practical",
  instructions: "Visit the school garden. With your teacher, look at each tool, say what it is used for, and name one way to use it safely.",
  materials: ["Cutlass, hoe, rake, watering can and wheelbarrow (handled by an adult or under close supervision)"],
  expectedOutcome: "Learners name common farm tools, match them to their uses and state basic safety rules.",
};
