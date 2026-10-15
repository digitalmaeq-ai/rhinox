import type { BaseContent } from "./content";

export interface DownloadContent extends BaseContent {
  contentType: "download";

  fileUrl?: string;
  fileType?: string;
  fileSize?: string;

  printable?: boolean;

}

export interface ArticleContent extends BaseContent {
  contentType: "article";

  body?: string;

  readingTimeMinutes?: number;

}

export interface VideoContent extends BaseContent {
  contentType: "video";

  videoUrl?: string;
  durationSeconds?: number;

  transcript?: string;

}

export interface TeacherResourceContent extends BaseContent {
  contentType: "teacher-resource";

  resourceType?:
    | "lesson-plan"
    | "teaching-guide"
    | "worksheet"
    | "activity"
    | "assessment"
    | "training"
    | "other";

  instructions?: string;
  materials?: string[];

}

export interface ParentResourceContent extends BaseContent {
  contentType: "parent-resource";

  resourceType?:
    | "guide"
    | "activity"
    | "project"
    | "learning-support"
    | "career-guide"
    | "other";

  instructions?: string;

  materials?: string[];

}

export interface CertificateContent extends BaseContent {
  contentType: "certificate";

  certificateType?: string;

  issuer?: string;

  requirements?: string[];

  templateUrl?: string;

}

export interface BadgeContent extends BaseContent {
  contentType: "badge";

  badgeType?: string;

  requirements?: string[];

  icon?: string;

}