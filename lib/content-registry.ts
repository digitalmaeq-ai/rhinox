import type { ComponentType } from "react";
import type { ContentType } from "@/types/content";
import type { ContentItem } from "./content";
import { STUDIO_ROUTES } from "./studio-routes";
import ExperimentDetailRenderer from "@/app/components/renderers/ExperimentDetailRenderer";
import ProjectDetailRenderer from "@/app/components/renderers/ProjectDetailRenderer";
import QuizDetailRenderer from "@/app/components/renderers/QuizDetailRenderer";

export interface ContentTypeDefinition {
  type: ContentType;
  label: string;
  description: string;
  route: string;
  // Optional override for building a specific item's URL, for types whose
  // route depends on more than just contentType + slug (e.g. "product",
  // which is split further by shopCategory). Every other type is served by
  // the default `${route}/${slug}` pattern below.
  getHref?: (content: ContentItem) => string;
  // What renders this type. "static" (the default, omitted) means the page
  // renders the item directly; "runtime" means the renderer hands off to
  // the interactive runtime for state/scoring/play (game, quiz, challenge —
  // interactive experiences proper live in lib/interactive-experiences.ts,
  // which shares this same taxonomy tree but isn't a ContentItem); "commerce"
  // means the renderer hands off to cart/checkout (product).
  engine?: "runtime" | "commerce";
  // The TYPE RENDERER for this type's detail page, looked up by the generic
  // content engine (app/[...path]/page.tsx) instead of a dedicated
  // `[type]/[slug]/page.tsx` route folder. Omit to fall back to
  // GenericDetailRenderer, which covers every type with no bespoke display
  // needs (about half of them just show title/description/excerpt/tags).
  // Each renderer narrows `item` to its own concrete type itself, the same
  // way the old per-type page components did.
  DetailRenderer?: ComponentType<{ item: ContentItem }>;
}

// Single source of truth for "what is this content type and how do I get
// to it." Adding a new content type is ONE call to registerContentType —
// no switch statement to extend, no second array to keep in sync.
const registry = new Map<ContentType, ContentTypeDefinition>();

function registerContentType(definition: ContentTypeDefinition): void {
  registry.set(definition.type, definition);
}

registerContentType({
  type: "lesson",
  label: "Lessons",
  description: "Structured learning lessons and teaching content.",
  route: "/education/stem-steam",
});

registerContentType({
  type: "activity",
  label: "Activities",
  description: "Hands-on learning activities for learners.",
  route: "/education/stem-steam",
});

registerContentType({
  type: "experiment",
  label: "Experiments",
  description: "Practical science experiments and investigations.",
  route: "/explore/experiments",
  DetailRenderer: ExperimentDetailRenderer,
});

registerContentType({
  type: "worksheet",
  label: "Worksheets",
  description: "Printable learning and practice materials.",
  route: "/resources/free-downloads",
});

registerContentType({
  type: "assessment",
  label: "Assessments",
  description: "Tests, practical assessments and learning checks.",
  route: "/education/teacher-parent-resources",
});

registerContentType({
  type: "project",
  label: "Projects",
  description: "Practical STEM projects learners can build.",
  route: "/explore/project-lab",
  DetailRenderer: ProjectDetailRenderer,
});

registerContentType({
  type: "game",
  label: "STEM Games",
  description: "Interactive games for STEM learning.",
  route: "/explore/stem-games",
  engine: "runtime",
});

registerContentType({
  type: "quiz",
  label: "STEM Quizzes",
  description: "Interactive quizzes and knowledge checks.",
  route: "/explore/stem-quizzes",
  engine: "runtime",
  DetailRenderer: QuizDetailRenderer,
});

registerContentType({
  type: "challenge",
  label: "STEM Challenges",
  description: "Open-ended STEM challenges and competitions.",
  route: "/explore/stem-challenges",
  engine: "runtime",
});

registerContentType({
  type: "experience",
  label: "Interactive Experiences",
  description:
    "Multi-scene explorable STEM experiences with their own assets, interactions and rules.",
  route: "/experiences",
  engine: "runtime",
  getHref: (content) => STUDIO_ROUTES[content.slug] ?? `/experiences/${content.slug}`,
  // Detail rendering stays a dedicated route (app/experiences/[slug]) — a
  // literal folder always wins over the generic engine's catch-all, so no
  // DetailRenderer is consulted here today. Registered anyway so any
  // future caller of getContentTypeDefinition("experience") gets a real
  // definition instead of undefined.
});

registerContentType({
  type: "download",
  label: "Downloads",
  description: "Free and downloadable learning resources.",
  route: "/resources/free-downloads",
});

registerContentType({
  type: "article",
  label: "Articles",
  description: "Educational articles and STEM insights.",
  route: "/resources/articles",
});

registerContentType({
  type: "video",
  label: "Videos",
  description: "Educational and companion video content.",
  route: "/resources/videos",
});

registerContentType({
  type: "teacher-resource",
  label: "Teacher Resources",
  description: "Resources designed to support teachers.",
  route: "/education/teacher-parent-resources",
});

registerContentType({
  type: "parent-resource",
  label: "Parent Resources",
  description: "Resources that help parents support learning.",
  route: "/education/teacher-parent-resources",
});

registerContentType({
  type: "product",
  label: "Products",
  description: "Physical and digital products available from Rhinox.",
  route: "/shop",
  // Products are split by shopCategory (kits, books, laboratory-equipment,
  // laboratory-chemicals, digital-resources), each with its own listing
  // and detail route under /shop.
  getHref: (content) => {
    if (content.contentType !== "product") return "/shop";
    return `/shop/${content.shopCategory}/${content.slug}`;
  },
  engine: "commerce",
});

registerContentType({
  type: "certificate",
  label: "Certificates",
  description: "Learning and programme certificates.",
  route: "/resources/certificates",
});

registerContentType({
  type: "badge",
  label: "Badges",
  description: "Digital learning and achievement badges.",
  route: "/resources/badges",
});

// Kept as an array for existing consumers (e.g. building a type filter
// list) — always derived from the registry map above, never maintained
// separately.
export const contentRegistry: ContentTypeDefinition[] = Array.from(
  registry.values()
);

export function getContentTypeDefinition(
  contentType: ContentType
): ContentTypeDefinition | null {
  return registry.get(contentType) ?? null;
}

export function getContentHref(content: ContentItem): string {
  const definition = registry.get(content.contentType);

  if (!definition) {
    return "/";
  }

  if (definition.getHref) {
    return definition.getHref(content);
  }

  return `${definition.route}/${content.slug}`;
}
