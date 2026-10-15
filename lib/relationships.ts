// Thin, stable-signature wrapper over the standalone relationships graph
// (lib/relationships-graph.ts). Kept as its own module so existing callers
// (RelatedContent.tsx) don't need to know the graph exists — but no
// relationship data lives here or on any ContentItem anymore.
export type { RelatedContentResult } from "./relationships-graph";
export {
  getRelatedContent,
  getIncomingRelatedContent,
  getPrerequisites,
  getUnlocks,
  getRequiredBy,
  buildRelationshipGraph,
} from "./relationships-graph";
