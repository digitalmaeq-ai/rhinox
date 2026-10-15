import type { VideoContent } from "@/types/resources";

export const waterCycleVideo: VideoContent = {
  id: "video-water-cycle",
  title: "Water Cycle Explained",
  slug: "water-cycle",
  contentType: "video",
  taxonomy: [
    {
      category: "resource",
      path: ["resources", "videos", "science-videos"],
    },
  ],
  status: "published",
  description: "A companion video introducing the main stages of the water cycle.",
  excerpt: "Watch a simple explanation of the water cycle.",
  featured: true,
  placements: ["resources", "education"],
  collections: ["videos", "water-cycle"],
  ageGroups: ["9-14"],
  subjects: ["Basic Science"],
  topics: ["Water Cycle"],
  difficulty: "beginner",
  durationMinutes: 5,
  skills: ["Listening", "Scientific understanding"],
  tags: ["video", "water cycle"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  durationSeconds: 300,
  transcript: "The water cycle describes the continuous movement of water through evaporation, condensation and precipitation."
};

