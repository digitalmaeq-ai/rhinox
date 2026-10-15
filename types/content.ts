export type ContentType =
  | "lesson"
  | "activity"
  | "experiment"
  | "worksheet"
  | "assessment"
  | "project"
  | "game"
  | "quiz"
  | "challenge"
  | "experience"
  | "download"
  | "article"
  | "video"
  | "teacher-resource"
  | "parent-resource"
  | "product"
  | "certificate"
  | "badge";

// "active" and "coming-soon" exist for "experience" items — an interactive
// experience is announced before it's built, which "draft"/"published"
// don't distinguish from "not ready yet because unfinished". Every other
// type only ever uses draft/published/archived.
export type ContentStatus =
  | "draft"
  | "published"
  | "active"
  | "coming-soon"
  | "archived";

export type ContentPlacement =
  | "education"
  | "explore"
  | "resources"
  | "shop"
  | "schools";

export type Difficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

// Full relationship vocabulary from the locked architecture diagram:
// prerequisite/follows/teaches/unlocks, related/part-of/companion/references,
// bundle/series/requires/includes — plus follow-up/supports/extends/
// alternative, which the diagram's "..." covers and real content already
// uses. Edges live in lib/relationships-graph.ts, never nested on items.
export type RelationshipType =
  | "related"
  | "companion"
  | "prerequisite"
  | "follows"
  | "follow-up"
  | "teaches"
  | "unlocks"
  | "supports"
  | "extends"
  | "alternative"
  | "part-of"
  | "references"
  | "bundle"
  | "series"
  | "requires"
  | "includes";

export interface ContentReference {
  contentType: ContentType;
  slug: string;
  relation?: RelationshipType;
  label?: string;
}

export interface ContentMedia {
  type: "image" | "video" | "audio" | "document";
  url: string;
  title?: string;
  alt?: string;
  thumbnail?: string;
}

export interface ContentTaxonomy {

  category: string;

  path: string[];

}

export interface BaseContent {
  id: string;
  title: string;
  slug: string;

  contentType: ContentType;
  taxonomy?: ContentTaxonomy[];
  status: ContentStatus;

  description: string;
  excerpt?: string;

  featured?: boolean;

  thumbnail?: string;
  media?: ContentMedia[];

  placements?: ContentPlacement[];
  collections?: string[];

  ageGroups?: string[];
  classLevels?: string[];

  subjects?: string[];
  topics?: string[];

  difficulty?: Difficulty;
  durationMinutes?: number;

  curriculum?: string[];
  skills?: string[];
  learningObjectives?: string[];

  tags?: string[];
  audience?: string[];

  author?: string;

  createdAt: string;
  updatedAt: string;

}




