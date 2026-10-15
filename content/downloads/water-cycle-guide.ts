import type { DownloadContent } from "@/types/resources";

export const waterCycleGuide: DownloadContent = {
  id: "download-water-cycle-guide",
  title: "Water Cycle Learning Guide",
  slug: "water-cycle-guide",
  contentType: "download",
  taxonomy: [
    {
      category: "resource",
      path: ["resources", "free-downloads"],
    },
  ],
  status: "published",
  description: "A free printable guide for learning the basic stages of the water cycle.",
  excerpt: "Download a simple water-cycle learning guide.",
  featured: true,
  placements: ["resources", "education"],
  collections: ["downloads", "water-cycle"],
  ageGroups: ["9-14"],
  subjects: ["Basic Science"],
  topics: ["Water Cycle"],
  difficulty: "beginner",
  skills: ["Recall", "Scientific vocabulary"],
  tags: ["free download", "water cycle"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  fileType: "PDF",
  printable: true
};

