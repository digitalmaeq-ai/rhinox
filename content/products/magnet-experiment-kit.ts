import type { ProductContent } from "@/types/products";

export const magnetExperimentKitProduct: ProductContent = {
  id: "product-magnet-experiment-kit",
  title: "STEM Magnet Experiment Kit",
  slug: "magnet-experiment-kit",
  contentType: "product",
  taxonomy: [
    {
      category: "commerce",
      path: ["kits", "science-kits"],
    },
  ],
  status: "published",

  shopCategory: "kits",
  productKind: "kit",

  description:
    "A complete magnetism kit in a carry case with an illustrated instruction manual. It includes horseshoe, bar and ring magnets, a compass, an iron-filings viewer, a simple electromagnet coil with bulbs and connecting wires, magnetic cars, floating butterflies, needles, paper clips and stands, so learners can explore magnetic poles, fields, attraction and repulsion, and electromagnetism. Batteries are not included.",

  excerpt: "Hands-on magnetism and electromagnetism experiments in one case.",

  coverImage: "/shop/magnet-experiment-kit.png",

  placements: ["shop"],

  collections: ["products", "kits"],

  ageGroups: ["6-14"],

  subjects: ["Basic Science", "Physics"],

  topics: ["Magnetism", "Magnetic fields", "Electromagnetism"],

  skills: ["Experimenting", "Observing", "Predicting"],

  tags: ["magnet kit", "magnetism", "science kit", "STEM kit"],

  audience: ["students", "teachers", "parents", "schools"],

  author: "Rhinox Scientifica",

  createdAt: "2026-10-13",

  updatedAt: "2026-10-13",
};
