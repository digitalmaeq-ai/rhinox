/**
 * TMC Book-First Content Registry contracts.
 *
 * ARCHITECTURAL RULE (mandatory):
 *   The approved TMC books are the single source of truth for instructional content.
 *   The Master Curriculum v3.16 only GUIDES the development of the books. It is a
 *   reference and provenance record. It is never the parent of a lesson, exercise,
 *   mission, assessment, worksheet, video or AI Tutor answer.
 *
 * Hierarchy:
 *   1. Master Curriculum (TmcCurriculumReference) guides book development.
 *   2. Approved books (TmcBook / TmcBookLesson) define the instructional content.
 *   3. Every other resource (TmcDigitalResource and its subtypes) is developed from,
 *      and must point at, an exact book lesson (TmcBookLessonRef).
 *
 * Renderer-independent: nothing here imports React or Next.js. Proprietary rows,
 * book text and answer keys are loaded from private storage and are never embedded
 * in this public repository.
 */

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export type TmcLevel =
  | "Nursery 1" | "Nursery 2"
  | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6"
  | "Year 7" | "Year 8" | "Year 9" | "Year 10" | "Year 11";

export type TmcStrand = "CT" | "RB" | "ED" | "AI";
export type TmcCurriculumVersion = "3.16";
export type TmcTerm = 1 | 2 | 3;
export type TmcWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type TmcStage = "Discover" | "Explore" | "Understand" | "Build" | "Create" | "Innovate";

export type TmcAudience = "learner" | "teacher" | "parent" | "club-leader";

/** Who may read a resource. Teacher-only and answer-key material is never "public". */
export type TmcAccessLevel = "public" | "authenticated" | "licensed" | "teacher-only" | "internal";

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

/** Stages exist only where the relevant book lesson supports them. Never imposed generically. */
export type TmcLearningStage =
  | "think" | "move" | "code" | "build" | "create" | "test" | "improve" | "explain" | "check";

/* ------------------------------------------------------------------ */
/* Approval and availability                                           */
/* ------------------------------------------------------------------ */

/**
 * Book approval states.
 * Only "approved" and "published" editions may serve as the production instructional source.
 * "revised" (including a "final draft") is NOT approved. Approval is an explicit owner decision.
 */
export type TmcBookStatus =
  | "draft"
  | "under-review"
  | "revised"
  | "approved"
  | "published"
  | "superseded";

/** Approval states of derived (non-book) resources. */
export type TmcDerivedStatus =
  | "draft"
  | "under-review"
  | "revised"
  | "approved"
  | "published"
  | "superseded";

/**
 * Whether the file or resource actually exists, independent of approval.
 * "planned" and "missing" resources must never be shown as available.
 */
export type TmcAvailability = "verified" | "unverified" | "planned" | "missing";

/* ------------------------------------------------------------------ */
/* Provenance                                                          */
/* ------------------------------------------------------------------ */

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
    | "manuscript"
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
  /** Private path or secure URI. Never a guessed location. */
  sourceLocation?: string;
  extractionMethod?: "manual" | "spreadsheet-import" | "pdf-extraction" | "editorial";
  verifiedAt?: string;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* A. Book Registry (the central instructional registry)               */
/* ------------------------------------------------------------------ */

export type TmcBookType =
  | "student-book"
  | "activity-book"
  | "teacher-guide"
  | "teacher-activity-guide"
  | "other-instructional-book";

/** One edition of one book. A new edition is a new record; old ones become "superseded". */
export interface TmcBook {
  bookId: string;
  title: string;
  bookType: TmcBookType;
  level: TmcLevel;
  /** Human edition label, e.g. "First edition". */
  edition: string;
  /** Exact version, e.g. the source file revision. Never inferred. */
  version: string;
  language: string;
  intendedAudience: TmcAudience[];
  publicationStatus: "unpublished" | "published";
  editorialStatus: TmcBookStatus;
  availability: TmcAvailability;
  /** Private file location or secure URI. Omit if unknown; never invent. */
  fileLocation?: string;
  fileSha256?: string;
  pageCount?: number;
  sourceManuscript?: TmcSourceProvenance;
  publicationDate?: string;
  provenance: TmcSourceProvenance[];
  /** Curriculum reference IDs this book was developed against (cross-reference only). */
  relatedCurriculumReferenceIds: string[];
  supersedesBookId?: string;
  accessLevel: TmcAccessLevel;
}

/** One lesson or content unit inside one specific book edition. This is the parent of digital content. */
export interface TmcBookLesson {
  lessonId: string;
  bookId: string;
  level: TmcLevel;
  term?: TmcTerm;
  week?: TmcWeek;
  chapterOrUnit?: string;
  lessonTitle: string;
  pageStart: number;
  pageEnd: number;
  conceptsTaught: string[];
  keyVocabulary: string[];
  learningInstructions: string[];
  activities: TmcBookContentItem[];
  examples: TmcBookContentItem[];
  practicalTasks: TmcBookContentItem[];
  projects: TmcBookContentItem[];
  exercises: TmcBookContentItem[];
  reviewQuestions: TmcBookContentItem[];
  relatedIllustrationIds: string[];
  relatedDigitalResourceIds: string[];
  approvalStatus: TmcBookStatus;
  /** Cross-reference only; never used to supply instructional content. */
  curriculumReferenceIds: string[];
  provenance: TmcSourceProvenance[];
}

/** A faithfully transcribed item from the book. Not summarised or rewritten. */
export interface TmcBookContentItem {
  itemId: string;
  label?: string;
  /** Verbatim book wording, held in private storage only. */
  text: string;
  pageStart?: number;
  pageEnd?: number;
  /** Teacher-only items (e.g. answers) carry "teacher-only"; never "public". */
  accessLevel: TmcAccessLevel;
}

/** Exact source location of book content. Every digital resource must carry one. */
export interface TmcBookLessonRef {
  bookId: string;
  lessonId: string;
  pageStart?: number;
  pageEnd?: number;
  sectionTitle?: string;
  activityLabel?: string;
}

/* ------------------------------------------------------------------ */
/* B. Curriculum reference (guide to book development; NOT content)    */
/* ------------------------------------------------------------------ */

/**
 * One Master Curriculum v3.16 weekly row. Used for development provenance, editorial
 * checks and coverage comparison only. It must never be loaded as runtime lesson content.
 *
 * ID format: tmc-v3-16-{level-slug}-t{term}-w{week}
 */
export interface TmcCurriculumReference {
  id: string;
  curriculumVersion: string;
  /** Marker so tooling can refuse to treat these as instructional records. */
  role: "reference-only";
  level: TmcLevel;
  /** From the Level & Term Map sheet. Not a Master Matrix column, so the matrix importer leaves it unset. */
  stage?: TmcStage;
  term: TmcTerm;
  week: TmcWeek;
  weekType: string | null;
  theme: string | null;
  focus: string | null;
  termBigIdea: string | null;
  mainStrand: TmcStrand | null;
  currentConcept: string | null;
  alignmentSummary: string | null;
  visualRequirements: string | null;
  qrLearningHubLink: string | null;
  teacherVideosRequired: string | null;
  videoType: string | null;
  videoStatus: string | null;
  chapterGateAuto: string | null;
  cognitiveDemand: string | null;
  independenceLevel: string | null;
  /** Curriculum intent per stage (Think/Move/Code/Build/Create). Intent only, not lesson text. */
  learningCycle: Partial<Record<TmcLearningStage, string>>;
  practicalActivity: string | null;
  weeklyCheck: string | null;
  masteryTarget: string | null;
  priorLearning: string | null;
  futureBridge: string | null;
  competency: string | null;
  /** Source list split on commas and semicolons. The original text is in rawSourceFields. */
  keyVocabulary: string[];
  assessmentEvidence: string | null;
  alignment: {
    summary: string | null;
    nerdc: string | null;
    lagosState: string | null;
    federal: string | null;
    international: string | null;
    teachingMethod: string | null;
  };
  implementation: {
    platform: string | null;
    /** Stage words found in the free-text "Core parts this week (must do)" column. */
    coreParts: TmcLearningStage[];
    stretch: string | null;
    fallback: string | null;
  };
  robotMakerLabChallenge: string | null;
  sourceStatus: string | null;
  sourceNotes: string | null;
  /** Lossless copy of every original Master Matrix column and value (43-column source row). */
  rawSourceFields: Record<string, string | null>;
  sourceValidationIssues: string[];
  provenance: TmcSourceProvenance[];
}

/** Editorial comparison between the book lesson as written and the curriculum intent. */
export interface TmcBookCurriculumCrosswalk {
  bookLessonId: string;
  curriculumReferenceId: string;
  /** "coverage" means the book lesson covers the curriculum intent. Differences are recorded, not fixed. */
  relation: "coverage" | "partial-coverage" | "not-covered" | "book-extends-curriculum";
  discrepancies: string[];
  reviewedBy?: string;
  reviewedAt?: string;
}

/* ------------------------------------------------------------------ */
/* C. Derived resources (everything digital points at a book lesson)   */
/* ------------------------------------------------------------------ */

/**
 * "book"        = reproduces or directly follows an activity written in the book.
 * "enrichment"  = digital extension. Must be labelled as enrichment to the learner and teacher,
 *                 must name its originating book lesson, must not contradict or replace the book.
 */
export type TmcContentOrigin = "book" | "enrichment";

export interface TmcDerivedBase {
  id: string;
  title: string;
  /** REQUIRED. A resource without an exact book source cannot be registered as approved. */
  source: TmcBookLessonRef;
  origin: TmcContentOrigin;
  /** Shown to users when origin is "enrichment". */
  enrichmentLabel?: string;
  level: TmcLevel;
  term?: TmcTerm;
  week?: TmcWeek;
  audience: TmcAudience[];
  accessLevel: TmcAccessLevel;
  availability: TmcAvailability;
  status: TmcDerivedStatus;
  provenance: TmcSourceProvenance[];
}

export interface TmcLearningStep {
  id: string;
  /** Only stages the book lesson actually contains. */
  stage: TmcLearningStage;
  bookItemId?: string;
  title: string;
  learnerInstruction: string;
  expectedEvidence: string;
  hint?: string;
  isCore: boolean;
  exerciseIds: string[];
  assetIds: string[];
}

export interface TmcExercise extends TmcDerivedBase {
  kind:
    | "ordering" | "multiple-choice" | "matching" | "sorting" | "sequence"
    | "code-completion" | "block-program" | "text-code" | "debugging"
    | "simulation" | "reflection" | "teacher-check" | "project-task";
  prompt: string;
  instructions: string;
  hintPolicy: "progressive" | "always-visible" | "teacher-led";
  attemptsAllowed?: number;
  evidenceMode: TmcEvidenceMode;
  interactionConfigRef: string;
  accessibility: {
    keyboardOperable: boolean;
    touchOperable: boolean;
    textAlternative: boolean;
    reducedMotionSafe: boolean;
  };
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TmcCodeStudioActivity extends TmcDerivedBase {
  exerciseIds: string[];
  environment: "unplugged" | "block-editor" | "scratch" | "makecode" | "python" | "web" | "arduino" | "mixed";
  starterProjectId?: string;
  allowedConcepts: string[];
  constraints?: string[];
  expectedBehaviour: string;
  automatedChecks: string[];
  teacherObservationRequired: boolean;
  noDeviceFallback: string;
}

export interface TmcRobotLabMission extends TmcDerivedBase {
  mode: "virtual" | "physical" | "hybrid" | "unplugged";
  robotProfileId?: string;
  simulatorProfileId?: string;
  missionConfigRef: string;
  learnerGoal: string;
  allowedCommands?: string[];
  successCriteria: string[];
  measuredEvidence: string[];
  evidenceLimitations: string;
  hardwareRequirements: string[];
  safetyNotes: string[];
  fallback: string;
}

export interface TmcAssessment extends TmcDerivedBase {
  assessmentType: "weekly-check" | "observation" | "picture-task" | "quiz" | "test" | "practical" | "project" | "station-check" | "showcase";
  instructions: string;
  evidenceMode: TmcEvidenceMode;
  criteria: string[];
  /** Concepts and skills in the book lesson that this assessment covers. */
  coversBookItemIds: string[];
  answerKeyRef?: string;
  teacherOnly: boolean;
}

export interface TmcLearningResource extends TmcDerivedBase {
  resourceType:
    | "lesson-plan" | "teacher-parent-guide" | "printable" | "project-sheet"
    | "question-bank" | "review-sheet" | "qr-code" | "learning-hub-page"
    | "video" | "transcript" | "worksheet" | "game"
    | "illustration" | "diagram" | "badge" | "certificate";
  uri?: string;
  pageStart?: number;
  pageEnd?: number;
}

/* ------------------------------------------------------------------ */
/* D. Legacy lessons (v3.15 era) that cannot be trusted yet            */
/* ------------------------------------------------------------------ */

/**
 * A lesson built before the book-first rule. It is never relabelled as v3.16 and never
 * promoted by curriculum similarity alone. It stays out of the approved catalogue until a
 * person confirms the matching book lesson and page.
 */
export interface TmcLegacyLessonMapping {
  legacyId: string;
  legacyCurriculumVersion: "3.15";
  level: TmcLevel;
  term?: TmcTerm;
  week?: TmcWeek;
  status: "unresolved" | "mapped" | "rejected";
  candidateBookLessonId?: string;
  discrepancies: string[];
  editorialReviewRequired: boolean;
  /** Existing data is preserved for compatibility. */
  preservedForCompatibility: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

/* ------------------------------------------------------------------ */
/* E. Relationships and programmes                                     */
/* ------------------------------------------------------------------ */

export interface TmcRelationship {
  fromId: string;
  toId: string;
  relation:
    | "prerequisite" | "follows" | "teaches" | "assesses" | "supports"
    | "extends" | "companion" | "references" | "unlocks" | "part-of";
  rationale?: string;
}

/**
 * Club Edition is a separate programme. Its IDs use their own namespace and are never mixed
 * with book lesson IDs or the 507 school curriculum references.
 * ID format: tmc-club-{module-slug}
 */
export interface TmcClubModule {
  clubModuleId: string;
  title: string;
  /** Book lessons this module may reuse. References only. */
  relatedBookLessonIds: string[];
  relatedCurriculumReferenceIds: string[];
  status: TmcDerivedStatus;
  availability: TmcAvailability;
}

/* ------------------------------------------------------------------ */
/* F. Manifests                                                        */
/* ------------------------------------------------------------------ */

export interface TmcCurriculumReferenceManifest {
  registryId: "rhinox-tmc-curriculum-reference";
  schemaVersion: string;
  curriculumVersion: string;
  sourceWorkbook: {
    /** Null when the workbook file was not supplied to the importer. */
    filename: string | null;
    sha256: string | null;
    masterMatrixRows: number;
    expectedLevels: number;
    expectedTermsPerLevel: number;
    expectedWeeksPerTerm: number;
  };
  sourceCsv: { filename: string | null; sha256: string; columns: number };
  importedAt: string;
  counts: {
    records: number;
    levels: number;
    recordsPerLevel: Record<string, number>;
  };
  validation: {
    passed: boolean;
    errors: string[];
    warnings: string[];
    /** Source problems reported and deliberately NOT corrected. */
    unresolvedSourceIssues: string[];
  };
}

export interface TmcBookRegistryManifest {
  registryId: "rhinox-tmc-book-registry";
  schemaVersion: string;
  counts: {
    books: number;
    bookLessons: number;
    derivedResources: number;
    legacyMappings: number;
    unresolvedLegacyMappings: number;
  };
  booksByStatus: Record<TmcBookStatus, number>;
  validation: {
    passed: boolean;
    errors: string[];
    warnings: string[];
  };
  generatedAt: string;
}
