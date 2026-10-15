import type { ActivityContent } from "@/types/education";

// Classroom activity for Classes of Food. The interactive version lives in
// content/experiences/food-classes.ts, linked by a "companion" relationship.
export const foodClassesActivity: ActivityContent = {
  id: "activity-food-classes",
  title: "Classes of Food",
  slug: "food-classes",
  contentType: "activity",
  taxonomy: [{ category: "educational", path: ["learning", "activities"] }],
  status: "published",
  description: "Sort everyday Nigerian foods into the food class each one mostly belongs to.",
  excerpt: "Is garri a protein or a carbohydrate? Sort the foods to find out.",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "food-classes"],
  ageGroups: ["8-9"],
  classLevels: ["Primary 4"],
  subjects: ["Basic Science", "Home Economics"],
  topics: ["Classes of Food", "Nutrition", "Healthy Eating"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Classification", "Recall", "Healthy choices"],
  learningObjectives: ["Name four classes of food.", "Sort common foods into their main food class.", "Say what each food class does for the body."],
  tags: ["classes of food", "nutrition", "healthy eating", "primary 4"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "classroom",
  instructions: "Look at each food and decide which food class it mostly belongs to: carbohydrates, proteins, vitamins, or fats and oils. Then plan a balanced meal that uses at least one food from each class.",
  materials: ["Pictures or real samples of yam, garri, beans, fish, orange, carrot, palm oil and groundnut oil", "Four labelled trays or sheets of paper"],
  expectedOutcome: "Learners sort common foods into four food classes and explain what each class does for the body.",
};
