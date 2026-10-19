import type { ProductContent } from "@/types/products";

export const digitalCaliperProduct: ProductContent = {
  id: "product-digital-caliper",
  title: "Electronic Digital Caliper (0–150 mm)",
  slug: "digital-caliper",
  contentType: "product",
  taxonomy: [
    {
      category: "commerce",
      path: ["laboratory-equipment", "measuring-analytical", "measuring-instruments"],
    },
  ],
  status: "published",

  shopCategory: "laboratory-equipment",
  productKind: "equipment",

  description:
    "An electronic digital caliper for measuring lengths, outside and inside diameters and depths up to 150 mm (6 in). The large LCD reads in millimetres or inches, with ON/OFF and ZERO buttons, and the printed scale lets learners compare the digital reading with a vernier-style scale.",

  excerpt: "Digital caliper with mm/inch LCD for accurate measuring.",

  coverImage: "/shop/digital-caliper.png",

  placements: ["shop"],

  collections: ["products", "laboratory-equipment"],

  ageGroups: ["11-18"],

  subjects: ["Physics", "Basic Technology"],

  topics: ["Measurement", "Length", "Accuracy"],

  skills: ["Measuring", "Reading instruments", "Practical work"],

  tags: ["caliper", "vernier", "measuring instrument", "physics", "laboratory equipment"],

  audience: ["students", "teachers", "schools"],

  author: "Rhinox Scientifica",

  createdAt: "2026-10-13",

  updatedAt: "2026-10-13",
};
