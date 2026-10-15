import type { BaseContent } from "./content";

export interface ProjectContent extends BaseContent {
  contentType: "project";

  problem?: string;
  projectGoal?: string;

  materials?: string[];
  tools?: string[];
  equipment?: string[];

  safetyNotes?: string[];

  instructions?: string[];

  testing?: string[];
  expectedResults?: string[];

  troubleshooting?: string[];

  extensionActivities?: string[];

  skillsDeveloped?: string[];

  submissionRequirements?: string[];

}