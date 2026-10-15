import type {
  LessonContent,
  ActivityContent,
  ExperimentContent,
  WorksheetContent,
  AssessmentContent,
} from "@/types/education";

import type { ProjectContent } from "@/types/projects";
import type { GameContent } from "@/types/games";
import type { QuizContent } from "@/types/quizzes";
import type { ChallengeContent } from "@/types/challenges";

import type {
  DownloadContent,
  ArticleContent,
  VideoContent,
  TeacherResourceContent,
  ParentResourceContent,
  CertificateContent,
  BadgeContent,
} from "@/types/resources";

import type { ProductContent } from "@/types/products";
import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// The ContentItem union — the only place that lists concrete type
// interfaces. Adding a new content ITEM never touches this file (that's
// what the auto-load index in lib/content.ts is for); adding a new content
// TYPE means extending this union, registering it in
// lib/content-registry.ts, and (if it browses anywhere) adding a section in
// lib/content-sections.ts.
export type ContentItem =
  | LessonContent
  | ActivityContent
  | ExperimentContent
  | WorksheetContent
  | AssessmentContent
  | ProjectContent
  | GameContent
  | QuizContent
  | ChallengeContent
  | InteractiveExperienceDefinition
  | DownloadContent
  | ArticleContent
  | VideoContent
  | TeacherResourceContent
  | ParentResourceContent
  | CertificateContent
  | BadgeContent
  | ProductContent;
