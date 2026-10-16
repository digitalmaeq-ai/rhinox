import type { ProductContent } from "@/types/products";

export const glassBlockPrismProduct: ProductContent = {
  id: "product-glass-block-prism",
  title: "Rectangular Glass Block Prism",
  slug: "glass-block-prism",
  contentType: "product",
  taxonomy: [
    {
      category: "commerce",
      path: ["laboratory-equipment", "physics-equipment", "optics-equipment"],
    },
  ],
  status: "published",

  shopCategory: "laboratory-equipment",
  productKind: "equipment",

  description:
    "A clear rectangular glass block with polished faces for light and optics practicals. Learners trace a ray through the block to measure angles of incidence and refraction, find the refractive index, and show the lateral displacement of the emergent ray, a standard WAEC and NECO physics practical.",

  excerpt: "Polished glass block for refraction and refractive index practicals.",

  coverImage: "/shop/glass-block-prism.png",

  placements: ["shop"],

  collections: ["products", "laboratory-equipment"],

  ageGroups: ["11-18"],

  subjects: ["Physics", "Basic Science"],

  topics: ["Light", "Refraction", "Refractive index"],

  skills: ["Ray tracing", "Measuring angles", "Practical work"],

  tags: ["glass block", "rectangular prism", "optics", "refraction", "physics", "laboratory equipment"],

  audience: ["students", "teachers", "schools"],

  author: "Rhinox Scientifica",

  createdAt: "2026-10-13",

  updatedAt: "2026-10-13",
};
