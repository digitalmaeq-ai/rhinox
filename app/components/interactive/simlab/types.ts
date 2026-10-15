import type { ComponentType, ReactNode } from "react";

import type { InteractiveExperienceDefinition, InteractiveExperienceTask } from "@/types/interactive-experiences";
import type { InteractiveRuntimeActions } from "@/types/interactive-runtime-renderer";
import type { InteractiveRuntimeState } from "@/types/interactive-runtime-state";
import type { QuizQuestion } from "@/types/quizzes";

// The experiment engine's vocabulary.
//
//   Experiment Engine → Scene → Objects → Interactions → Simulation →
//   Tasks → Assessment → Feedback → Progress
//
// An experiment is a SimSpec: a little state machine (init + controls),
// a drawn Scene, derived readings, and one pure "check" per task. All the
// shared machinery — layout, controls, live hint, task latching, assessment
// questions, feedback, progress and completion — lives in SimLabRenderer
// and talks to the existing runtime actions, so a new experiment is mostly
// data (content file) plus one spec file.

export type SimValue = number | string | boolean;
export type SimState = Record<string, SimValue>;

export type Control =
  | {
      type: "slider";
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
      unit?: string;
    }
  | {
      type: "toggle";
      key: string;
      label: string;
      onLabel: string;
      offLabel: string;
    }
  | {
      type: "choice";
      key: string;
      label: string;
      options: { value: string; label: string }[];
    };

export interface Reading {
  label: string;
  value: string;
  tone?: "good" | "warn" | "info";
}

// One stop on a guided tour. Used by Cinematic mode (plays automatically)
// and Classroom mode (the teacher steps through it).
export interface TourStep {
  title: string;
  text: string;
  fact?: string;
  // Controls to move to for this step (numbers glide there smoothly).
  set: Record<string, SimValue>;
  // Teacher prompt for Classroom mode, with the answer to reveal.
  ask?: string;
  answer?: string;
}

// Everything a custom Interactive-mode layout needs. A spec may supply a
// `Dashboard` to replace the standard stage + controls + tasks layout (the
// titration lab does). The engine still owns the state, task latching,
// scoring, completion and the Cinematic and Classroom modes.
export interface DashboardProps {
  state: SimState;
  onChange: (key: string, value: SimValue) => void;
  setMany: (patch: Record<string, SimValue>) => void;
  experience: InteractiveExperienceDefinition;
  tasks: InteractiveExperienceTask[];
  completedTasks: string[];
  points: number;
  requiredDone: boolean;
  questions: QuizQuestion[];
  runtimeState: InteractiveRuntimeState;
  actions: InteractiveRuntimeActions;
  view: "2d" | "3d";
  setView: (view: "2d" | "3d") => void;
  render3D: (state: SimState) => ReactNode;
  onReset: () => void;
  onWatchTour: () => void;
  checkKey: number;
}

export interface SimSpec<S extends SimState = SimState> {
  // Optional custom Interactive-mode layout.
  Dashboard?: ComponentType<DashboardProps>;
  init: S;
  controls: Control[];
  Scene: ComponentType<{ state: S }>;
  readings: (state: S) => Reading[];
  // taskId -> does the current state satisfy the task? Latched by the engine.
  checks: Record<string, (state: S) => boolean>;
  // One line of live guidance shown under the scene.
  hint: (state: S) => string;
  // Accessible description of the scene.
  sceneLabel: string;
  // Guided journey shared by Cinematic and Classroom modes.
  tour?: TourStep[];
  // Set by the registry when a 3D scene exists for this experiment.
  has3D?: boolean;
}

// Specs are written against their own precise state type; the engine
// handles them all as SimState. This is the one place that is cast.
export function defineSim<S extends SimState>(spec: SimSpec<S>): SimSpec {
  return spec as unknown as SimSpec;
}
