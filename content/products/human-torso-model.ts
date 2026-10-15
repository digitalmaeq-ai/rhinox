import type { ProductContent } from "@/types/products";

export const humanTorsoModelProduct: ProductContent = {
  id: "product-human-torso-model",
  title: "Human Torso Anatomy Model",
  slug: "human-torso-model",
  contentType: "product",
  taxonomy: [
    {
      category: "commerce",
      path: ["laboratory-equipment", "anatomy-models"],
    },
  ],
  status: "published",

  shopCategory: "laboratory-equipment",
  productKind: "equipment",

  description:
    "A dissectible human torso model on a stand for biology lessons. The muscles and organs are colour-coded, and the brain, skull cap, lungs, heart, liver, stomach and intestines lift out so learners can see where each organ sits and how the body systems fit together.",

  excerpt: "Torso model with removable organs for biology lessons.",

  coverImage: "/shop/human-torso-model.png",

  placements: ["shop"],

  collections: ["products", "laboratory-equipment"],

  ageGroups: ["9-18"],

  subjects: ["Biology", "Basic Science"],

  topics: ["Human body", "Organs", "Body systems"],

  skills: ["Observing", "Identifying", "Labelling"],

  tags: ["anatomy model", "torso", "organs", "biology", "laboratory equipment"],

  audience: ["students", "teachers", "schools"],

  author: "Rhinox Scientifica",

  createdAt: "2026-10-13",

  updatedAt: "2026-10-13",
};
