import type { GameContent } from "@/types/games";

export const scienceSortingGame: GameContent = {
  id: "game-science-sorting",
  title: "Science Sorting Challenge",
  slug: "science-sorting",
  contentType: "game",
  taxonomy: [
    {
      category: "interactive",
      path: ["experiences", "games", "science-games"],
    },
  ],
  status: "published",
  description: "Sort scientific objects and concepts into the correct categories.",
  excerpt: "Test your science knowledge through a quick sorting game.",
  featured: true,
  placements: ["explore"],
  collections: ["games"],
  ageGroups: ["8-14"],
  subjects: ["Science"],
  topics: ["Classification"],
  difficulty: "beginner",
  durationMinutes: 10,
  skills: ["Classification", "Recall", "Logic"],
  tags: ["game", "science", "sorting"],
  audience: ["students"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  gameType: "matching",
  instructions: "Match each item to the correct scientific category.",
  objectives: ["Improve classification and scientific vocabulary."],
  levels: 3,
  scoring: "Points are awarded for correct matches.",
  rewards: ["Science Explorer badge"]
};

