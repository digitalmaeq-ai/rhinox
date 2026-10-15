import type { ParentResourceContent } from "@/types/resources";

export const homeStemGuide: ParentResourceContent = {
  id: "parent-resource-home-stem",
  title: "STEM Learning at Home",
  slug: "stem-learning-at-home",
  contentType: "parent-resource",
  taxonomy: [
    {
      category: "resource",
      path: ["resources", "parent-resources"],
    },
  ],
  status: "published",
  description: "Practical ideas for parents who want to support STEM learning at home.",
  excerpt: "Simple ways to encourage STEM learning beyond the classroom.",
  featured: true,
  placements: ["education", "resources"],
  collections: ["parent-resources", "STEM"],
  ageGroups: ["6-14"],
  subjects: ["STEM"],
  topics: ["Home Learning", "STEM"],
  skills: ["Problem solving", "Creativity"],
  tags: ["parents", "home learning", "STEM"],
  audience: ["parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  resourceType: "guide",
  instructions: "Use everyday situations and simple projects to encourage children to ask questions, test ideas and build solutions.",
  materials: ["Household materials", "Notebook"]
};

