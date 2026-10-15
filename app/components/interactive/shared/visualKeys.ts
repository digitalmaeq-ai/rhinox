import { useId } from "react";

// Shared helpers for the data-driven visual libraries used by the 2D
// interaction renderers (DragClassificationVisuals.tsx,
// MatchingVisuals.tsx). Only helpers proven byte-identical across both
// libraries live here; each renderer keeps its own artwork.

// Turns a content value (an asset label or `properties.visual`) into the
// key a visual library is indexed by: "Wooden block" -> "wooden-block".
export function toVisualKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// SVG gradient/clip ids must be unique per instance in the document, and
// useId's output can contain characters that are awkward inside url(#...).
export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
