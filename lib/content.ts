/**
 * Content catalogue — pure data, auto-loaded.
 *
 * Do NOT import individual content files here. Drop a new file under
 * content/** and run `npm run content:index` (this also runs automatically
 * before `next dev` and `next build` via predev/prebuild) — the item shows
 * up in every listing, detail route and taxonomy branch it's tagged into,
 * with no edits to this file, the registry, or any route. See
 * scripts/generate-content-index.mjs and lib/content-items.generated.ts.
 *
 * Adding a new content TYPE (not just a new item of an existing type) is
 * the one case that still needs hand edits: types/*, the ContentItem union
 * in lib/content-item-types.ts, and lib/content-registry.ts.
 */
import type { ContentType } from "@/types/content";
import type { ProductContent } from "@/types/products";
import { validateContentTaxonomy } from "@/lib/explore-taxonomy";
import { generatedContentItems } from "./content-items.generated";

export type { ContentItem } from "./content-item-types";
import type { ContentItem } from "./content-item-types";

export const allContent: ContentItem[] = generatedContentItems;

if (process.env.NODE_ENV !== "production") {
  // Catch orphaned taxonomy paths (a content item tagged with a category/
  // path that doesn't match any real node in exploreTaxonomy) at dev/build
  // time instead of letting the item silently disappear from that branch
  // of Explore. See lib/explore-taxonomy.ts's validateContentTaxonomy.
  const taxonomyErrors = allContent.flatMap((item) =>
    validateContentTaxonomy(item)
  );

  if (taxonomyErrors.length > 0) {
    console.warn(
      `[content] ${taxonomyErrors.length} invalid taxonomy path(s) found:\n` +
        taxonomyErrors.map((error) => `  - ${error}`).join("\n")
    );
  }

  // Auto-load scans every exported object that looks like a ContentItem,
  // so a copy-pasted id/slug is the one mistake it can't catch by
  // construction — flag duplicates here instead of a silent shadow.
  const ids = new Set<string>();
  const slugKeys = new Set<string>();

  for (const item of allContent) {
    if (ids.has(item.id)) {
      console.warn(`[content] Duplicate id: ${item.id}`);
    }
    ids.add(item.id);

    const key = `${item.contentType}:${item.slug}`;
    if (slugKeys.has(key)) {
      console.warn(`[content] Duplicate slug for type: ${key}`);
    }
    slugKeys.add(key);
  }
}

export function getAllContent(): ContentItem[] {
  return allContent;
}

export function getPublishedContent(): ContentItem[] {
  return allContent.filter(
    (item) => item.status === "published"
  );
}

export function getContentBySlug(
  contentType: ContentType,
  slug: string
): ContentItem | null {
  return (
    allContent.find(
      (item) =>
        item.contentType === contentType &&
        item.slug === slug
    ) ?? null
  );
}

export function getContentByType(
  contentType: ContentType
): ContentItem[] {
  return allContent.filter(
    (item) => item.contentType === contentType
  );
}

/**
 * Products are further split by ShopCategory (kits, laboratory-equipment,
 * laboratory-chemicals, digital-resources, books). Every shop listing page
 * must filter on this — getContentByType("product") alone returns every
 * shop item regardless of category.
 */
export function getProductsByShopCategory(
  shopCategory: ProductContent["shopCategory"]
): ProductContent[] {
  return allContent.filter(
    (item): item is ProductContent =>
      item.contentType === "product" &&
      item.shopCategory === shopCategory
  );
}

export function getFeaturedContent(): ContentItem[] {
  return allContent.filter(
    (item) => item.featured === true
  );
}
