import type { InteractiveAsset, InteractiveInteraction, InteractiveRule } from "./interactive-assets";
import type { InteractiveExperienceVariable } from "./interactive-variables";
import type { InteractiveRuntimeConfig } from "./interactive-runtime-config";
import type { BaseContent } from "./content";
import type { QuizQuestion } from "./quizzes";
import type { InteractiveExperienceRuntime } from "./interactive-runtime";

export type InteractiveExperienceMode =
  | "interactive"
  | "2d"
  | "3d"
  | "simulation"
  | "virtual-lab"
  | "game"
  | "sandbox"
  | "interactive-story"
  | "design-tool"
  | "coding"
  | "robotics"
  | "challenge"
  | "learning-tool";

export type InteractiveExperienceSubject =
  | "biology"
  | "chemistry"
  | "physics"
  | "mathematics"
  | "environmental-science"
  | "earth-and-space"
  | "engineering"
  | "technology"
  | "coding"
  | "robotics"
  | "general-stem";

export interface InteractiveExperienceScene {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  order?: number;
}

export interface InteractiveExperienceTask {
  id: string;
  title: string;
  description?: string;
  instructions?: string[];
  points?: number;
  required?: boolean;
  sceneId?: string;
}

export interface InteractiveExperienceAchievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  points?: number;
}

// Interactive experiences are first-class ContentItems (contentType
// "experience", engine: "runtime" in lib/content-registry.ts) — not a
// second parallel catalogue. This used to be a standalone interface with
// its own id/slug/title/taxonomy/status/etc.; it now extends BaseContent
// so an experience is tagged onto the same taxonomy tree, resolved by the
// same getContentBySlug/getContentByType, and auto-loaded by
// scripts/generate-content-index.mjs exactly like a lesson or a quiz.
// The name is kept (rather than renamed to ExperienceContent) so the
// runtime engine, renderer registry and workspace components that already
// reference it — app/components/interactive/**, lib/interactive-runtime-*
// — don't need to change.
export interface InteractiveExperienceDefinition
  extends Omit<BaseContent, "contentType"> {
  contentType: "experience";

  runtime: InteractiveExperienceRuntime;
  runtimeConfig?: InteractiveRuntimeConfig;
  variables?: InteractiveExperienceVariable[];
  assets?: InteractiveAsset[];
  interactions?: InteractiveInteraction[];
  rules?: InteractiveRule[];
  modes: InteractiveExperienceMode[];

  // Narrows BaseContent's generic `subjects?: string[]` to the closed set
  // of STEM subjects an experience actually uses.
  subjects?: InteractiveExperienceSubject[];

  heroImage?: string;
  scenes?: InteractiveExperienceScene[];
  tasks?: InteractiveExperienceTask[];
  questions?: QuizQuestion[];
  achievements?: InteractiveExperienceAchievement[];
  // Selects the interaction renderer inside a runtime that hosts more than
  // one kind of interaction, e.g. runtime "2d" + component
  // "drag-classification". The runtime says WHERE an experience runs; this
  // says WHICH interaction it is. Deliberately not named "interactionModel":
  // that name is the planning-level InteractionModel on experiments
  // (types/interaction-model.ts), a different concept.
  component?: string;
}
