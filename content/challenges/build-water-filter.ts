import type { ChallengeContent } from "@/types/challenges";

export const buildWaterFilterChallenge: ChallengeContent = {
  id: "challenge-water-filter",
  title: "Build a Water Filter",
  slug: "build-water-filter",
  contentType: "challenge",
  taxonomy: [
    {
      category: "interactive",
      path: ["competitions", "engineering-challenges"],
    },
  ],
  status: "published",
  description: "Design and build a simple filtration system using accessible materials.",
  excerpt: "Can you design a simple system that improves the clarity of dirty water?",
  featured: true,
  placements: ["explore"],
  collections: ["challenges", "engineering"],
  ageGroups: ["10-15"],
  classLevels: ["Primary 6", "JSS1", "JSS2", "JSS3"],
  subjects: ["STEM", "Basic Science", "Technology"],
  topics: ["Water", "Filtration", "Engineering Design"],
  difficulty: "intermediate",
  durationMinutes: 60,
  skills: ["Design thinking", "Problem solving", "Engineering"],
  tags: ["challenge", "water", "engineering"],
  audience: ["students", "teachers"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  mission: "Design and build a simple water filtration system.",
  problem: "How can you improve the clarity of dirty water using simple materials?",
  constraints: [
    "Use only the materials provided.",
    "The design must allow water to pass through the filter."
  ],
  materials: ["Plastic bottle", "Gravel", "Sand", "Cloth", "Container"],
  tools: ["Scissors"],
  instructions: [
    "Plan your filter design.",
    "Build the filter.",
    "Pass dirty water through the system.",
    "Observe and record the result."
  ],
  submissionRequirements: [
    "A photograph of the completed design.",
    "A short explanation of how the design works."
  ],
  evaluationCriteria: [
    "Design",
    "Functionality",
    "Explanation",
    "Observation"
  ],
  timeLimitMinutes: 60,
  badgeSlug: "water-engineer"
};

