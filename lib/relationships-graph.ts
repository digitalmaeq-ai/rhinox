import type { ContentType, RelationshipType } from "@/types/content";
import type { ContentItem } from "./content";

/**
 * A single directed edge between two content items, identified by
 * (contentType, slug) on each end. This is the standalone relationships
 * graph called for in the locked architecture: edges live here, not
 * nested inside each content item's own record. An item never declares
 * its own relationships — this file is the one place that does.
 */
export interface RelationshipEdge {
  id: string;
  fromType: ContentType;
  fromSlug: string;
  toType: ContentType;
  toSlug: string;
  type: RelationshipType;
  label?: string;
}

// Seed edges, living in one place instead of being nested on each item.
export const relationshipEdges: RelationshipEdge[] = [
  {
    id: "sorting-materials-experiment-companion-experience",
    fromType: "experiment",
    fromSlug: "sorting-materials",
    toType: "experience",
    toSlug: "sorting-materials",
    type: "companion",
    label: "Try the Interactive Sorting Activity",
  },
  {
    id: "animals-and-habitats-experiment-companion-experience",
    fromType: "experiment",
    fromSlug: "animals-and-habitats",
    toType: "experience",
    toSlug: "animals-and-habitats",
    type: "companion",
    label: "Try the Interactive Matching Activity",
  },
  {
    id: "separating-mixtures-experiment-companion-experience",
    fromType: "experiment",
    fromSlug: "separating-mixtures",
    toType: "experience",
    toSlug: "separating-mixtures",
    type: "companion",
    label: "Try the Interactive Separating Activity",
  },
  {
    id: "food-classes-activity-companion-experience",
    fromType: "activity",
    fromSlug: "food-classes",
    toType: "experience",
    toSlug: "food-classes",
    type: "companion",
    label: "Try the Interactive Activity",
  },
  {
    id: "shapes-and-sides-activity-companion-experience",
    fromType: "activity",
    fromSlug: "shapes-and-sides",
    toType: "experience",
    toSlug: "shapes-and-sides",
    type: "companion",
    label: "Try the Interactive Activity",
  },
  {
    id: "simple-machines-activity-companion-experience",
    fromType: "activity",
    fromSlug: "simple-machines",
    toType: "experience",
    toSlug: "simple-machines",
    type: "companion",
    label: "Try the Interactive Activity",
  },
  {
    id: "fractions-activity-companion-experience",
    fromType: "activity",
    fromSlug: "fractions",
    toType: "experience",
    toSlug: "fractions",
    type: "companion",
    label: "Try the Interactive Activity",
  },
  {
    id: "telling-the-time-activity-companion-experience",
    fromType: "activity",
    fromSlug: "telling-the-time",
    toType: "experience",
    toSlug: "telling-the-time",
    type: "companion",
    label: "Try the Interactive Activity",
  },
  {
    id: "robot-sensors-activity-companion-experience",
    fromType: "activity",
    fromSlug: "robot-sensors",
    toType: "experience",
    toSlug: "robot-sensors",
    type: "companion",
    label: "Try the Interactive Activity",
  },
  {
    id: "farm-tools-activity-companion-experience",
    fromType: "activity",
    fromSlug: "farm-tools",
    toType: "experience",
    toSlug: "farm-tools",
    type: "companion",
    label: "Try the Interactive Activity",
  },
  {
    id: "planting-maize-algorithm-activity-companion-experience",
    fromType: "activity",
    fromSlug: "planting-maize-algorithm",
    toType: "experience",
    toSlug: "planting-maize-algorithm",
    type: "companion",
    label: "Try the Interactive Activity",
  },  {
    id: "compass-directions-activity-companion-experience",
    fromType: "activity",
    fromSlug: "compass-directions",
    toType: "experience",
    toSlug: "compass-directions",
    type: "companion",
    label: "Try the Interactive Activity",
  },  {
    id: "robot-to-the-charger-activity-companion-experience",
    fromType: "activity",
    fromSlug: "robot-to-the-charger",
    toType: "experience",
    toSlug: "robot-to-the-charger",
    type: "companion",
    label: "Try the Interactive Activity",
  },
];

export interface RelatedContentResult {
  content: ContentItem;
  relation: RelationshipType;
  label?: string;
}

/**
 * Resolves every outgoing edge from a content item against the real
 * catalogue. This is what lib/relationships.ts and RelatedContent.tsx call
 * — neither of them reads a nested field on the item itself anymore.
 */
export function getRelatedContent(
  item: ContentItem,
  allContent: ContentItem[]
): RelatedContentResult[] {
  const edges = relationshipEdges.filter(
    (edge) => edge.fromType === item.contentType && edge.fromSlug === item.slug
  );

  if (edges.length === 0) {
    return [];
  }

  return edges
    .map((edge): RelatedContentResult | null => {
      const content = allContent.find(
        (candidate) =>
          candidate.contentType === edge.toType &&
          candidate.slug === edge.toSlug
      );

      if (!content) {
        return null;
      }

      return {
        content,
        relation: edge.type,
        ...(edge.label !== undefined && { label: edge.label }),
      };
    })
    .filter((result): result is RelatedContentResult => result !== null);
}

/**
 * Resolves every incoming edge to a content item — items that point TO it,
 * rather than items it points to. Turns the one-directional edge list into
 * a usable graph in both directions without ever needing a field back on
 * the item itself.
 */
export function getIncomingRelatedContent(
  item: ContentItem,
  allContent: ContentItem[]
): RelatedContentResult[] {
  const edges = relationshipEdges.filter(
    (edge) => edge.toType === item.contentType && edge.toSlug === item.slug
  );

  if (edges.length === 0) {
    return [];
  }

  return edges
    .map((edge): RelatedContentResult | null => {
      const content = allContent.find(
        (candidate) =>
          candidate.contentType === edge.fromType &&
          candidate.slug === edge.fromSlug
      );

      if (!content) {
        return null;
      }

      return {
        content,
        relation: edge.type,
        ...(edge.label !== undefined && { label: edge.label }),
      };
    })
    .filter((result): result is RelatedContentResult => result !== null);
}

// Convenience: outgoing edges of a specific relation type.
function getRelatedByType(
  item: ContentItem,
  allContent: ContentItem[],
  relation: RelationshipType
): RelatedContentResult[] {
  return getRelatedContent(item, allContent).filter(
    (result) => result.relation === relation
  );
}

/** This item's prerequisites — what must come before it. */
export function getPrerequisites(
  item: ContentItem,
  allContent: ContentItem[]
): RelatedContentResult[] {
  return getRelatedByType(item, allContent, "prerequisite");
}

/** What this item unlocks once completed. */
export function getUnlocks(
  item: ContentItem,
  allContent: ContentItem[]
): RelatedContentResult[] {
  return getRelatedByType(item, allContent, "unlocks");
}

/** Items that require this one — incoming "requires" or "prerequisite" edges. */
export function getRequiredBy(
  item: ContentItem,
  allContent: ContentItem[]
): RelatedContentResult[] {
  return getIncomingRelatedContent(item, allContent).filter(
    (result) => result.relation === "requires" || result.relation === "prerequisite"
  );
}

/**
 * A simple adjacency list over the whole edge set, keyed by
 * "contentType:slug" — useful for path-finding or graph traversal (e.g. a
 * learning-path builder) without repeatedly re-scanning relationshipEdges.
 */
export function buildRelationshipGraph(): Map<
  string,
  { to: string; relation: RelationshipType }[]
> {
  const key = (type: ContentType, slug: string) => `${type}:${slug}`;
  const graph = new Map<string, { to: string; relation: RelationshipType }[]>();

  for (const edge of relationshipEdges) {
    const from = key(edge.fromType, edge.fromSlug);

    if (!graph.has(from)) {
      graph.set(from, []);
    }

    graph.get(from)!.push({
      to: key(edge.toType, edge.toSlug),
      relation: edge.type,
    });
  }

  return graph;
}

if (process.env.NODE_ENV !== "production") {
  const ids = new Set<string>();
  for (const edge of relationshipEdges) {
    if (ids.has(edge.id)) {
      console.warn(`[relationships-graph] duplicate edge id "${edge.id}"`);
    }
    ids.add(edge.id);
  }
}
