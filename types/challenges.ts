import type { BaseContent } from "./content";

export interface ChallengeContent extends BaseContent {
  contentType: "challenge";

  mission?: string;

  problem?: string;

  constraints?: string[];

  materials?: string[];

  tools?: string[];

  instructions?: string[];

  submissionRequirements?: string[];

  evaluationCriteria?: string[];

  timeLimitMinutes?: number;

  badgeSlug?: string;

}