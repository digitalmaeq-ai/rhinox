export interface InteractiveRuntimeState {
  currentScene: number;
  completedTasks: string[];
  answers: Record<string, string | string[]>;
  submittedQuestions: string[];
  achievementsUnlocked: string[];
  awardedInteractionRewards: string[];
  points: number;
  completed: boolean;
  variables: Record<string, number | string | boolean>;
  feedback: string[];
}