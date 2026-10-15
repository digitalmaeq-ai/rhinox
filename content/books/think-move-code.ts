import type { ProductContent } from "@/types/products";

// A book is a product with productKind: "book" — not a separate content
// type. One record, one canonical URL (/shop/books/think-move-code).
export const thinkMoveCodeBook: ProductContent = {
  id: "book-think-move-code",
  title: "Think • Move • Code",
  slug: "think-move-code",
  contentType: "product",
  shopCategory: "books",
  productKind: "book",
  taxonomy: [
    {
      category: "commerce",
      path: ["books", "think-move-code"],
    },
  ],
  status: "published",
  description: "A practical STEM learning series designed to develop thinking, making and coding skills.",
  excerpt: "Think, build, create and code through practical STEM learning.",
  featured: true,
  placements: ["education", "shop"],
  collections: ["books", "think-move-code"],
  ageGroups: ["6-14"],
  classLevels: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS1", "JSS2", "JSS3"],
  subjects: ["STEM", "Science", "Technology", "Computing"],
  topics: ["Problem Solving", "Coding", "Making"],
  skills: ["Critical thinking", "Creativity", "Coding"],
  tags: ["book", "STEM", "Think Move Code"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  authors: ["Rhinox Scientifica"],
  series: "Think • Move • Code",
  format: "workbook"
};
