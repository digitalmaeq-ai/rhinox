import type { BaseContent } from "./content";
import type { InteractionModel } from "./interaction-model";

export interface LessonContent extends BaseContent {
  contentType: "lesson";

  lessonType?: "theory" | "practical" | "project-based" | "revision";

  introduction?: string;
  body?: string;

  materials?: string[];
  activities?: string[];
  assessment?: string[];

}

export interface ActivityContent extends BaseContent {
  contentType: "activity";

  activityType?: "classroom" | "home" | "group" | "practical";

  instructions?: string;
  materials?: string[];
  expectedOutcome?: string;

}

export interface ExperimentContent extends BaseContent {
  contentType: "experiment";

  objective?: string;

  materials?: string[];
  equipment?: string[];
  chemicals?: string[];

  safetyNotes?: string[];

  procedure?: string[];
  observations?: string[];
  results?: string;
  conclusion?: string;

  troubleshooting?: string[];
  extensionActivities?: string[];

  // Interactive-readiness metadata. Describes WHAT kind of interactive
  // treatment an experiment calls for, never HOW it is rendered — the
  // runtime ("experience" records + app/components/interactive/**) owns
  // the HOW. All three are optional and absent on most experiments.
  interactionModel?: InteractionModel;

  // Free-form capability tags (e.g. "drag-and-drop", "immediate-feedback").
  interactionFeatures?: string[];

  // Names of parameters a simulation would let a learner control (e.g.
  // "force", "mass"). A flat list of labels, not full slider definitions.
  simulationVariables?: string[];

}

export interface WorksheetContent extends BaseContent {
  contentType: "worksheet";

  instructions?: string;
  questions?: string[];

  answerKey?: string;

  printable?: boolean;
  downloadUrl?: string;

}

export interface AssessmentContent extends BaseContent {
  contentType: "assessment";

  assessmentType?:
    | "quiz"
    | "test"
    | "exam"
    | "project"
    | "practical";

  instructions?: string;

  totalMarks?: number;
  durationMinutes?: number;

  questions?: string[];
  answerKey?: string;

}