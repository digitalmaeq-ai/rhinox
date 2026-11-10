/**
 * TMC v3.16 Content Registry contracts.
 *
 * Renderer-independent contracts shared by Code Studio, Robot Lab,
 * the Learning Hub, teacher resources and future assessment services.
 * Proprietary curriculum rows and book content are loaded from private,
 * versioned content storage; do not embed the full catalogue in this public repo.
 */

export type TmcLevel =
  | "Nursery 1" | "Nursery 2"
  | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6"
  | "Year 7" | "Year 8" | "Year 9" | "Year 10" | "Year 11";

export type TmcStrand = "CT" | "RB" | "ED" | "AI";
export type TmcCurriculumVersion = "3.16";
export type TmcTerm = 1 | 2 | 3;
export type TmcWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type TmcStage = "Discover" | "Explore" | "Understand" | "Build" | "Create" | "Innovate";

export type TmcContentStatus =
  | "source-only"
  | "imported"
  | "enrichment-draft"
  | "editorial-review"
  | "curriculum-review"
  | "approved"
  | "published"
  | "archived";

export type TmcEvidenceMode =
  | "automatic"
  | "learner-confirmed"
  | "teacher-observed"
  | "portfolio-reviewed";

export type TmcPlatform =
  | "unplugged"
  | "floor-grid"
  | "cardboard-build"
  | "scratch"
  | "scratchjr-optional"
  | "makecode-microbit"
  | "microbit-hardware"
  | "arduino"
  | "python"
  | "esp32"
  | "web"
  | "robot-simulator"
  | "physical-robot"
  | "other";

export type TmcLearningStage =
  | "think" | "move" | "code" | "build" | "create" | "test" | "improve" | "explain" | "check";

export interface TmcSourceProvenance {
  sourceId: string;
  sourceTitle: string;
  sourceVersion: string;
  sourceKind:
    | "master-curriculum"
    | "student-book"
    | "activity-book"
    | "teacher-guide"
    | "teacher-activity-guide"
    | "assessment-bank"
    | "club-guide"
    | "video"
    | "illustration"
    | "worksheet"
    | "other";
  sheetName?: string;
  rowNumber?: number;
  pageStart?: number;
  pageEnd?: number;
  sourceFileSha256?: string;
  sourceLocation?: string;
  extractionMethod?: "manual" | "spreadsheet-import" | "pdf-extraction" | "editorial";
  verifiedAt?: string;
  notes?: string;
}

export interface TmcBookReference {
  bookId: string;
  editionId: string;
  bookType: "student-book" | "activity-book" | "teacher-guide" | "teacher-activity-guide" | "club-leader-guide";
  pageStart?: number;
  pageEnd?: number;
  sectionTitle?: string;
  activityLabel?: string;
  qrAssetId?: string;
}

export interface TmcMediaAsset {
  id: string;
  assetType: "image" | "illustration" | "diagram" | "audio" | "video" | "animation" | "printable" | "document" | "qr-code";
  title: string;
  description?: string;
  uri: string;
  thumbnailUri?: string;
  altText?: string;
  transcriptUri?: string;
  durationSeconds?: number;
  language?: string;
  audience?: ("learner" | "teacher" | "parent" | "club-leader")[];
  access: "public" | "authenticated" | "licensed" | "internal";
  status: TmcContentStatus;
  provenance: TmcSourceProvenance[];
}

export interface TmcCurriculumRecord {
  id: string;
  curriculumVersion: TmcCurriculumVersion;
  level: TmcLevel;
  stage: TmcStage;
  term: TmcTerm;
  week: TmcWeek;
  weekType: string;
  theme: string;
  focus: string;
  termBigIdea?: string;
  mainStrand: TmcStrand | null;
  currentConcept?: string;
  cognitiveDemand?: string;
  independenceLevel?: string;
  learningCycle: Partial<Record<TmcLearningStage, string>>;
  practicalActivity: string;
  weeklyCheck: string;
  masteryTarget: string;
  priorLearning: string;
  futureBridge: string;
  competency: string;
  keyVocabulary: string[];
  assessmentEvidence: string;
  alignment: {
    summary?: string;
    nerdc?: string;
    lagosState?: string;
    federal?: string;
    international?: string;
    teachingMethod?: string;
  };
  implementation: {
    platform: string;
    platforms: TmcPlatform[];
    coreParts: TmcLearningStage[];
    stretch?: string;
    fallback: string;
    kitRequirements?: string[];
    safetyNotes?: string[];
  };
  robotMakerLabChallenge?: string;
  videoRequirements?: {
    required: boolean;
    types?: string[];
    status?: string;
  };
  chapterGate?: string;
  sourceStatus?: string;
  sourceNotes?: string;
  sourceValidationIssues: string[];
  bookReferences: TmcBookReference[];
  assetIds: string[];
  relatedContentIds: string[];
  status: TmcContentStatus;
  provenance: TmcSourceProvenance[];
}

export interface TmcLearningStep {
  id: string;
  stage: TmcLearningStage;
  title: string;
  learnerInstruction: string;
  activity: string;
  expectedEvidence: string;
  hint?: string;
  workedExample?: string;
  fallback?: string;
  isCore: boolean;
  estimatedMinutes?: number;
  exerciseIds: string[];
  assetIds: string[];
}

export interface TmcExercise {
  id: string;
  curriculumRecordId: string;
  title: string;
  kind:
    | "ordering" | "multiple-choice" | "matching" | "sorting" | "sequence"
    | "code-completion" | "block-program" | "text-code" | "debugging"
    | "simulation" | "reflection" | "teacher-check" | "project-task";
  prompt: string;
  instructions: string;
  hintPolicy: "progressive" | "always-visible" | "teacher-led";
  attemptsAllowed?: number;
  evidenceMode: TmcEvidenceMode;
  scoring?: {
    pointsAvailable: number;
    partialCredit: boolean;
    rubricId?: string;
  };
  interactionConfigRef: string;
  accessibility: {
    keyboardOperable: boolean;
    touchOperable: boolean;
    textAlternative: boolean;
    reducedMotionSafe: boolean;
  };
  status: TmcContentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  provenance: TmcSourceProvenance[];
}

export interface TmcCodeStudioActivity {
  id: string;
  curriculumRecordId: string;
  exerciseIds: string[];
  environment: "unplugged" | "block-editor" | "scratch" | "makecode" | "python" | "web" | "arduino" | "mixed";
  starterProjectId?: string;
  allowedConcepts: string[];
  allowedBlocksOrCommands?: string[];
  constraints?: string[];
  expectedBehaviour: string;
  automatedChecks: string[];
  teacherObservationRequired: boolean;
  noDeviceFallback: string;
  status: TmcContentStatus;
}

export interface TmcRobotLabMission {
  id: string;
  curriculumRecordId: string;
  title: string;
  mode: "virtual" | "physical" | "hybrid" | "unplugged";
  robotProfileId?: string;
  simulatorProfileId?: string;
  missionConfigRef: string;
  learnerGoal: string;
  setupInstructions: string[];
  allowedCommands?: string[];
  missionRules?: Record<string, number | string | boolean>;
  successCriteria: string[];
  measuredEvidence: string[];
  evidenceLimitations: string;
  hardwareRequirements: string[];
  safetyNotes: string[];
  fallback: string;
  status: TmcContentStatus;
}

export interface TmcAssessment {
  id: string;
  curriculumRecordId: string;
  assessmentType: "weekly-check" | "observation" | "picture-task" | "quiz" | "test" | "practical" | "project" | "station-check" | "showcase";
  title: string;
  instructions: string;
  evidenceMode: TmcEvidenceMode;
  criteria: string[];
  rubricId?: string;
  marks?: number;
  durationMinutes?: number;
  answerKeyRef?: string;
  teacherOnly: boolean;
  status: TmcContentStatus;
  provenance: TmcSourceProvenance[];
}

export interface TmcLearningResource {
  id: string;
  curriculumRecordId?: string;
  title: string;
  resourceType: "student-book" | "activity-book" | "teacher-guide" | "teacher-activity-guide" | "video" | "worksheet" | "printable" | "game" | "badge" | "certificate" | "lesson-note" | "club-module";
  audience: ("learner" | "teacher" | "parent" | "club-leader")[];
  uri: string;
  access: "public" | "authenticated" | "licensed" | "internal";
  pageStart?: number;
  pageEnd?: number;
  status: TmcContentStatus;
  provenance: TmcSourceProvenance[];
}

export interface TmcRelationship {
  fromId: string;
  toId: string;
  relation:
    | "prerequisite" | "follows" | "teaches" | "assesses" | "supports"
    | "extends" | "companion" | "references" | "unlocks" | "part-of";
  rationale?: string;
}

export interface TmcRegistryManifest {
  registryId: "rhinox-tmc-content-registry";
  schemaVersion: string;
  curriculumVersion: TmcCurriculumVersion;
  sourceWorkbook: {
    filename: string;
    sha256: string;
    masterMatrixRows: number;
    expectedLevels: number;
    expectedTermsPerLevel: number;
    expectedWeeksPerTerm: number;
    importedAt?: string;
  };
  counts: {
    curriculumRecords: number;
    learningSteps: number;
    exercises: number;
    codeStudioActivities: number;
    robotLabMissions: number;
    assessments: number;
    learningResources: number;
    mediaAssets: number;
    relationships: number;
  };
  levelIds: TmcLevel[];
  validation: {
    passed: boolean;
    errors: string[];
    warnings: string[];
    unresolvedSourceIssues: string[];
  };
  generatedAt: string;
}
