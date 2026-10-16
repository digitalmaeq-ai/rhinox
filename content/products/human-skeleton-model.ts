import type { ProductContent } from "@/types/products";

export const humanSkeletonModelProduct: ProductContent = {
  id: "product-human-skeleton-model",
  title: "Human Skeleton Model (Life-size)",
  slug: "human-skeleton-model",
  contentType: "product",
  taxonomy: [
    {
      category: "commerce",
      path: ["laboratory-equipment", "biology-life-science", "life-science-equipment"],
    },
  ],
  status: "published",

  shopCategory: "laboratory-equipment",
  productKind: "equipment",

  description:
    "A life-size articulated human skeleton on a rolling stand for biology lessons. Movable joints and a flexible spine with marked vertebrae and spinal nerves let learners study bones, joints and the axial and appendicular skeleton up close.",

  excerpt: "Life-size articulated skeleton on a rolling stand for biology.",

  coverImage: "/shop/human-skeleton-model.png",

  placements: ["shop"],

  collections: ["products", "laboratory-equipment"],

  ageGroups: ["9-18"],

  subjects: ["Biology", "Basic Science"],

  topics: ["Skeletal system", "Bones and joints", "Human body"],

  skills: ["Observing", "Identifying", "Labelling"],

  tags: ["skeleton", "anatomy model", "biology", "laboratory equipment"],

  audience: ["students", "teachers", "schools"],

  author: "Rhinox Scientifica",

  createdAt: "2026-10-13",

  updatedAt: "2026-10-13",
};
