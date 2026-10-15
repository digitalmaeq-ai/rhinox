import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";
import type { InteractiveRuntimeState } from "@/types/interactive-runtime-state";

export interface InteractiveRuntimeActions {
  nextScene: () => void;
  previousScene: () => void;
  completeTask: (taskId: string, points?: number) => void;
  setAnswer: (questionId: string, answer: string | string[]) => void;
  submitQuestion: (
    questionId: string,
    answer: string | string[],
    points?: number,
    correct?: boolean,
  ) => void;
  addPoints: (points: number) => void;
  setVariable: (
    variableId: string,
    value: number | string | boolean,
  ) => void;
  changeVariable: (
    variableId: string,
    amount: number,
  ) => void;
  triggerInteraction: (interactionId: string) => void;
  completeExperience: () => void;
  resetExperience: () => void;
}

export interface InteractiveRuntimeRendererProps {
  experience: InteractiveExperienceDefinition;
  runtimeState: InteractiveRuntimeState;
  actions: InteractiveRuntimeActions;
}
