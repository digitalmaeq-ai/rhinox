import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

import { createInitialInteractiveRuntimeState } from "@/lib/interactive-runtime-state";
import type {
  InteractiveAction,
  InteractiveInteraction,
  InteractiveRule,
} from "@/types/interactive-assets";
import type { InteractiveRuntimeState } from "@/types/interactive-runtime-state";

function setVariableValue(
  experience: InteractiveExperienceDefinition,
  state: InteractiveRuntimeState,
  variableId: string,
  value: string | number | boolean,
): InteractiveRuntimeState {
  const definition = experience.variables?.find(
    (variable) => variable.id === variableId,
  );

  if (!definition) {
    return state;
  }

  if (definition.type === "number") {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return state;
    }

    let nextValue = value;

    if (definition.min !== undefined) {
      nextValue = Math.max(definition.min, nextValue);
    }

    if (definition.max !== undefined) {
      nextValue = Math.min(definition.max, nextValue);
    }

    if (definition.step !== undefined && definition.step > 0) {
      const base = definition.min ?? 0;

      nextValue =
        base +
        Math.round((nextValue - base) / definition.step) *
          definition.step;

      if (definition.min !== undefined) {
        nextValue = Math.max(definition.min, nextValue);
      }

      if (definition.max !== undefined) {
        nextValue = Math.min(definition.max, nextValue);
      }
    }

    return {
      ...state,
      variables: {
        ...state.variables,
        [variableId]: nextValue,
      },
    };
  }

  if (definition.type === "string") {
    if (typeof value !== "string") {
      return state;
    }

    return {
      ...state,
      variables: {
        ...state.variables,
        [variableId]: value,
      },
    };
  }

  if (definition.type === "boolean") {
    if (typeof value !== "boolean") {
      return state;
    }

    return {
      ...state,
      variables: {
        ...state.variables,
        [variableId]: value,
      },
    };
  }

  return state;
}

function changeVariableValue(
  experience: InteractiveExperienceDefinition,
  state: InteractiveRuntimeState,
  variableId: string,
  amount: number,
): InteractiveRuntimeState {
  if (Number.isNaN(amount)) {
    return state;
  }

  const currentValue = state.variables[variableId];

  if (typeof currentValue !== "number") {
    return state;
  }

  return setVariableValue(
    experience,
    state,
    variableId,
    currentValue + amount,
  );
}

function executeAction(
  experience: InteractiveExperienceDefinition,
  state: InteractiveRuntimeState,
  action: InteractiveAction,
  interactionRewardKey?: string,
): InteractiveRuntimeState {
  switch (action.type) {
    case "set-variable": {
      if (
        action.variableId === undefined ||
        action.value === undefined
      ) {
        return state;
      }

      return setVariableValue(
        experience,
        state,
        action.variableId,
        action.value,
      );
    }

    case "change-variable": {
      if (
        action.variableId === undefined ||
        typeof action.value !== "number"
      ) {
        return state;
      }

      const nextState = changeVariableValue(
        experience,
        state,
        action.variableId,
        action.value,
      );

      const rewardAlreadyAwarded =
        interactionRewardKey !== undefined &&
        nextState.awardedInteractionRewards.includes(
          interactionRewardKey,
        );

      const rewardPoints =
        rewardAlreadyAwarded || interactionRewardKey === undefined
          ? 0
          : action.points ?? 0;

      return {
        ...nextState,
        awardedInteractionRewards:
          interactionRewardKey !== undefined &&
          !rewardAlreadyAwarded &&
          action.points !== undefined
            ? [
                ...nextState.awardedInteractionRewards,
                interactionRewardKey,
              ]
            : nextState.awardedInteractionRewards,
        points: nextState.points + rewardPoints,
        feedback: action.message
          ? [...nextState.feedback, action.message]
          : nextState.feedback,
      };
    }

    case "show-feedback": {
      if (!action.message) {
        return state;
      }

      return {
        ...state,
        feedback: [...state.feedback, action.message],
      };
    }

    case "complete-task": {
      if (
        !action.targetId ||
        state.completedTasks.includes(action.targetId)
      ) {
        return state;
      }

      return {
        ...state,
        completedTasks: [
          ...state.completedTasks,
          action.targetId,
        ],
        points: state.points + (action.points ?? 0),
      };
    }

    case "add-points": {
      const rewardAlreadyAwarded =
        interactionRewardKey !== undefined &&
        state.awardedInteractionRewards.includes(
          interactionRewardKey,
        );

      if (
        interactionRewardKey !== undefined &&
        rewardAlreadyAwarded
      ) {
        return state;
      }

      return {
        ...state,
        awardedInteractionRewards:
          interactionRewardKey !== undefined &&
          action.points !== undefined
            ? [
                ...state.awardedInteractionRewards,
                interactionRewardKey,
              ]
            : state.awardedInteractionRewards,
        points: state.points + (action.points ?? 0),
      };
    }

    case "unlock-achievement": {
      if (
        !action.targetId ||
        state.achievementsUnlocked.includes(action.targetId)
      ) {
        return state;
      }

      return {
        ...state,
        achievementsUnlocked: [
          ...state.achievementsUnlocked,
          action.targetId,
        ],
      };
    }

    case "next-scene": {
      const sceneCount = experience.scenes?.length ?? 0;

      if (sceneCount === 0) {
        return state;
      }

      return {
        ...state,
        currentScene: Math.min(
          state.currentScene + 1,
          sceneCount - 1,
        ),
      };
    }

    case "previous-scene": {
      return {
        ...state,
        currentScene: Math.max(
          0,
          state.currentScene - 1,
        ),
      };
    }

    case "reset": {
      return createInitialInteractiveRuntimeState(
        experience,
      );
    }

    default:
      return state;
  }
}

function evaluateRule(
  experience: InteractiveExperienceDefinition,
  state: InteractiveRuntimeState,
  rule: InteractiveRule,
): InteractiveRuntimeState {
  const currentValue = state.variables[rule.variableId];

  if (currentValue === undefined) {
    return state;
  }

  let matches = false;

  switch (rule.operator) {
    case "equals":
      matches = currentValue === rule.value;
      break;

    case "not-equals":
      matches = currentValue !== rule.value;
      break;

    case "greater-than":
      matches =
        typeof currentValue === "number" &&
        typeof rule.value === "number" &&
        currentValue > rule.value;
      break;

    case "less-than":
      matches =
        typeof currentValue === "number" &&
        typeof rule.value === "number" &&
        currentValue < rule.value;
      break;

    case "greater-than-or-equal":
      matches =
        typeof currentValue === "number" &&
        typeof rule.value === "number" &&
        currentValue >= rule.value;
      break;

    case "less-than-or-equal":
      matches =
        typeof currentValue === "number" &&
        typeof rule.value === "number" &&
        currentValue <= rule.value;
      break;
  }

  if (!matches) {
    return state;
  }

  return rule.actions.reduce(
    (currentState, action) =>
      executeAction(experience, currentState, action),
    state,
  );
}

export function executeInteractiveInteraction(
  experience: InteractiveExperienceDefinition,
  state: InteractiveRuntimeState,
  interactionId: string,
): InteractiveRuntimeState {
  const interaction = (
    experience.interactions ?? []
  ).find(
    (item: InteractiveInteraction) =>
      item.id === interactionId,
  );

  if (!interaction) {
    return state;
  }

  let nextState = state;

  for (const action of interaction.actions ?? []) {
    const interactionRewardKey =
      `${interaction.id}:${action.id}`;

    nextState = executeAction(
      experience,
      nextState,
      action,
      interactionRewardKey,
    );
  }

  for (const rule of experience.rules ?? []) {
    nextState = evaluateRule(
      experience,
      nextState,
      rule,
    );
  }

  return nextState;
}