import type { ActivityContent } from "@/types/education";

// Unplugged classroom activity for the sequencing experience in
// content/experiences/planting-maize-algorithm.ts (linked by a "companion"
// relationship). Part of the Think, Move, Code! approach: act it out first.
export const plantingMaizeAlgorithmActivity: ActivityContent = {
  id: "activity-planting-maize-algorithm",
  title: "Put the Algorithm in Order: Planting Maize",
  slug: "planting-maize-algorithm",
  contentType: "activity",
  taxonomy: [
    { category: "educational", path: ["learning", "activities"] },
    { category: "educational", path: ["technology", "coding", "computational-thinking"] },
  ],
  status: "published",
  description:
    "Act out the steps for planting maize, then put them in order to discover what an algorithm is.",
  excerpt: "What happens if you water the soil before you plant the seeds?",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "think-move-code"],
  ageGroups: ["5-6"],
  classLevels: ["Primary 1"],
  subjects: ["Coding and Robotics"],
  topics: ["Algorithms", "Sequencing", "Computational Thinking"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Sequencing", "Computational thinking", "Logical reasoning"],
  learningObjectives: [
    "Understand that an algorithm is a set of steps in the right order.",
    "Put the steps of an everyday task in the correct sequence.",
  ],
  tags: ["algorithms", "sequencing", "unplugged coding", "primary 1"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "group",
  instructions:
    "In pairs, act out planting maize. One learner reads out the steps; the other does the actions. Then mix up the step cards and ask: does it still work? Talk about why the order matters in an algorithm.",
  materials: ["Five step cards: clear the land, dig a small hole, drop in the seeds, cover with soil, water the soil"],
  expectedOutcome:
    "Learners put the steps in order and explain that an algorithm only works when its steps are in the right order.",
};
