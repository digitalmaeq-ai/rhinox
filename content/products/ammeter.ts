import type { ProductContent } from "@/types/products";

export const ammeterProduct: ProductContent = {
  id: "product-dc-ammeter",
  title: "DC Ammeter (0–1 A)",
  slug: "dc-ammeter",
  contentType: "product",
  taxonomy: [
    {
      category: "commerce",
      path: ["laboratory-equipment", "physics-equipment", "electricity-magnetism"],
    },
  ],
  status: "published",

  shopCategory: "laboratory-equipment",
  productKind: "equipment",

  description:
    "A school-laboratory analogue DC ammeter for measuring current in electric circuit practicals. Clear 0–1 A scale with a mirror strip to avoid parallax error, a zero-adjust screw and colour-coded terminals.",

  excerpt: "Analogue 0–1 A meter for circuit practicals.",

  coverImage: "/shop/ammeter.png",

  placements: ["shop"],

  collections: ["products", "laboratory-equipment"],

  ageGroups: ["11-18"],

  subjects: ["Physics"],

  topics: ["Electricity", "Current", "Electric circuits"],

  skills: ["Measuring", "Reading scales", "Practical work"],

  tags: ["ammeter", "physics", "laboratory equipment", "electricity"],

  audience: ["students", "teachers", "schools"],

  author: "Rhinox Scientifica",

  createdAt: "2026-10-13",

  updatedAt: "2026-10-13",
};
