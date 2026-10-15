import type { ContentItem } from "@/lib/content";
import type { ContentTaxonomy } from "@/types/content";

export function hasTaxonomyPath(
  item: ContentItem,
  category: string,
  path: string[]
): boolean {
  return (
    item.taxonomy?.some(
      (taxonomy: ContentTaxonomy) =>
        taxonomy.category === category &&
        taxonomy.path.length === path.length &&
        taxonomy.path.every(
          (segment, index) => segment === path[index]
        )
    ) ?? false
  );
}
 
export function hasTaxonomyBranch(
  item: ContentItem,
  category: string,
  path: string[]
): boolean {
  return (
    item.taxonomy?.some(
      (taxonomy: ContentTaxonomy) =>
        taxonomy.category === category &&
        taxonomy.path.length >= path.length &&
        path.every(
          (segment, index) => taxonomy.path[index] === segment
        )
    ) ?? false
  );
}
