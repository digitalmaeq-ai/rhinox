import type { ProductContent } from "@/types/products";

export const starterProduct: ProductContent = {
  id: "product-stem-starter-kit",
  title: "Rhinox STEM Starter Kit",
  slug: "stem-starter-kit",
  contentType: "product",
  taxonomy: [
    {
      category: "commerce",
      path: ["kits", "stem-kits"],
    },
  ],
  status: "published",

  shopCategory: "kits",
  productKind: "kit",

  description:
    "A practical STEM kit designed to support hands-on exploration and project building.",

  excerpt: "A starter kit for practical STEM learning.",

  featured: true,

  placements: ["shop"],

  collections: ["products", "kits"],

  ageGroups: ["8-14"],

  subjects: ["STEM"],

  topics: ["Making", "Engineering"],

  skills: ["Building", "Problem solving"],

  tags: ["STEM kit", "education"],

  audience: ["students", "teachers", "parents"],

  author: "Rhinox Scientifica",

  createdAt: "2026-09-16",

  updatedAt: "2026-09-16",
};

