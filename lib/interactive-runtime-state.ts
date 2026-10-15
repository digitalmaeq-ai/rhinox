import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";
import type { InteractiveRuntimeState } from "@/types/interactive-runtime-state";

export function createInitialInteractiveRuntimeState(
  experience: InteractiveExperienceDefinition,
): InteractiveRuntimeState {
  const variables: Record<string, number | string | boolean> = {};

  for (const variable of experience.variables ?? []) {
    variables[variable.id] = variable.initialValue;
  }

  return {
    currentScene: 0,
    completedTasks: [],
    answers: {},
    submittedQuestions: [],
    achievementsUnlocked: [],
    awardedInteractionRewards: [],
    points: 0,
    completed: false,
    variables,
    feedback: [],
  };
}

export function getRequiredTasks(
  experience: InteractiveExperienceDefinition,
) {
  return (experience.tasks ?? []).filter(
    (task) => task.required !== false,
  );
}

export function areRequiredTasksComplete(
  experience: InteractiveExperienceDefinition,
  state: InteractiveRuntimeState,
) {
  const requiredTasks = getRequiredTasks(experience);

  return (
    requiredTasks.length > 0 &&
    requiredTasks.every((task) =>
      state.completedTasks.includes(task.id),
    )
  );
}

export function getCompletedAchievements(
  experience: InteractiveExperienceDefinition,
  state: InteractiveRuntimeState,
) {
  return (experience.achievements ?? []).filter((achievement) =>
    state.achievementsUnlocked.includes(achievement.id),
  );
}