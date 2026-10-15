import type { BaseContent } from "@/types/content";

export type ShopCategory =
  | "books"
  | "kits"
  | "laboratory-equipment"
  | "laboratory-chemicals"
  | "digital-resources";

// What kind of physical/digital thing this product actually is. A "book"
// product carries the book-specific fields below; every other kind ignores
// them. This replaces the old separate `book` ContentType — a book is a
// product, not a second parallel type, so there is exactly one record and
// one canonical URL (/shop/books/[slug]) per book.
export type ProductKind =
  | "book"
  | "kit"
  | "equipment"
  | "chemical"
  | "digital";

export interface ProductContent
  extends Omit<BaseContent, "contentType"> {
  contentType: "product";
  shopCategory: ShopCategory;
  productKind: ProductKind;

  // Book-specific fields (only meaningful when productKind === "book")
  authors?: string[];
  isbn?: string;
  series?: string;
  edition?: string;
  format?: "print" | "ebook" | "workbook" | "activity-book";
  coverImage?: string;
  previewUrl?: string;
  ageRange?: string;
  chapters?: string[];

  // Commerce fields, used by engine: "commerce" (checkout/cart display).
  // All optional: existing product content has none of these yet, and
  // nothing currently reads them — they're here so a price, SKU or stock
  // count can be added to a product without another type-level migration.
  price?: number;
  currency?: string;
  sku?: string;
  inStock?: boolean;
  stockCount?: number;
}
