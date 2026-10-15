"use client";

import { useState } from "react";

import {
  areRequiredTasksComplete,
  createInitialInteractiveRuntimeState,
} from "@/lib/interactive-runtime-state";

import { executeInteractiveInteraction } from "@/lib/interactive-runtime-engine";

import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";
import type { InteractiveRuntimeActions } from "@/types/interactive-runtime-renderer";
import type { InteractiveRuntimeState } from "@/types/interactive-runtime-state";

export function useInteractiveRuntime(
  experience: InteractiveExperienceDefinition,
) {
  const [runtimeState, setRuntimeState] =
    useState<InteractiveRuntimeState>(() =>
      createInitialInteractiveRuntimeState(experience),
    );

  function nextScene() {
    setRuntimeState((current) => {
      const sceneCount = experience.scenes?.length ?? 0;

      if (
        sceneCount === 0 ||
        current.currentScene >= sceneCount - 1
      ) {
        return current;
      }

      return {
        ...current,
        currentScene: current.currentScene + 1,
      };
    });
  }

  function previousScene() {
    setRuntimeState((current) => ({
      ...current,
      currentScene: Math.max(0, current.currentScene - 1),
    }));
  }

  function completeTask(taskId: string, points = 0) {
    setRuntimeState((current) => {
      if (current.completedTasks.includes(taskId)) {
        return current;
      }

      return {
        ...current,
        completedTasks: [...current.completedTasks, taskId],
        points: current.points + points,
      };
    });
  }

  function setAnswer(
    questionId: string,
    answer: string | string[],
  ) {
    setRuntimeState((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [questionId]: answer,
      },
    }));
  }

  function submitQuestion(
    questionId: string,
    answer: string | string[],
    points = 0,
    correct = false,
  ) {
    setRuntimeState((current) => {
      if (current.submittedQuestions.includes(questionId)) {
        return current;
      }

      return {
        ...current,
        answers: {
          ...current.answers,
          [questionId]: answer,
        },
        submittedQuestions: [
          ...current.submittedQuestions,
          questionId,
        ],
        points: correct
          ? current.points + points
          : current.points,
      };
    });
  }

  function addPoints(points: number) {
    setRuntimeState((current) => ({
      ...current,
      points: current.points + points,
    }));
  }

  function setVariable(
    variableId: string,
    value: number | string | boolean,
  ) {
    setRuntimeState((current) => {
      const definition = experience.variables?.find(
        (variable) => variable.id === variableId,
      );

      if (!definition) {
        return current;
      }

      if (definition.type === "number") {
        if (typeof value !== "number" || Number.isNaN(value)) {
          return current;
        }

        let nextValue = value;

        if (definition.min !== undefined) {
          nextValue = Math.max(definition.min, nextValue);
        }

        if (definition.max !== undefined) {
          nextValue = Math.min(definition.max, nextValue);
        }

        if (
          definition.step !== undefined &&
          definition.step > 0
        ) {
          const base = definition.min ?? 0;

          nextValue =
            base +
            Math.round(
              (nextValue - base) / definition.step,
            ) * definition.step;

          if (definition.min !== undefined) {
            nextValue = Math.max(
              definition.min,
              nextValue,
            );
          }

          if (definition.max !== undefined) {
            nextValue = Math.min(
              definition.max,
              nextValue,
            );
          }
        }

        return {
          ...current,
          variables: {
            ...current.variables,
            [variableId]: nextValue,
          },
        };
      }

      if (definition.type === "string") {
        if (typeof value !== "string") {
          return current;
        }

        return {
          ...current,
          variables: {
            ...current.variables,
            [variableId]: value,
          },
        };
      }

      if (definition.type === "boolean") {
        if (typeof value !== "boolean") {
          return current;
        }

        return {
          ...current,
          variables: {
            ...current.variables,
            [variableId]: value,
          },
        };
      }

      return current;
    });
  }

  function changeVariable(
    variableId: string,
    amount: number,
  ) {
    setRuntimeState((current) => {
      const currentValue = current.variables[variableId];

      if (
        typeof currentValue !== "number" ||
        Number.isNaN(amount)
      ) {
        return current;
      }

      const definition = experience.variables?.find(
        (variable) => variable.id === variableId,
      );

      if (!definition || definition.type !== "number") {
        return current;
      }

      let nextValue = currentValue + amount;

      if (definition.min !== undefined) {
        nextValue = Math.max(definition.min, nextValue);
      }

      if (definition.max !== undefined) {
        nextValue = Math.min(definition.max, nextValue);
      }

      if (
        definition.step !== undefined &&
        definition.step > 0
      ) {
        const base = definition.min ?? 0;

        nextValue =
          base +
          Math.round(
            (nextValue - base) / definition.step,
          ) * definition.step;

        if (definition.min !== undefined) {
          nextValue = Math.max(
            definition.min,
            nextValue,
          );
        }

        if (definition.max !== undefined) {
          nextValue = Math.min(
            definition.max,
            nextValue,
          );
        }
      }

      return {
        ...current,
        variables: {
          ...current.variables,
          [variableId]: nextValue,
        },
      };
    });
  }

  function triggerInteraction(interactionId: string) {
    setRuntimeState((current) =>
      executeInteractiveInteraction(
        experience,
        current,
        interactionId,
      ),
    );
  }

  function completeExperience() {
    setRuntimeState((current) => {
      if (
        current.completed ||
        !areRequiredTasksComplete(experience, current)
      ) {
        return current;
      }

      const achievementIds = (
        experience.achievements ?? []
      ).map((achievement) => achievement.id);

      return {
        ...current,
        completed: true,
        achievementsUnlocked: achievementIds,
      };
    });
  }

  function resetExperience() {
    setRuntimeState(
      createInitialInteractiveRuntimeState(experience),
    );
  }

  const actions: InteractiveRuntimeActions = {
    nextScene,
    previousScene,
    completeTask,
    setAnswer,
    submitQuestion,
    addPoints,
    setVariable,
    changeVariable,
    triggerInteraction,
    completeExperience,
    resetExperience,
  };

  return {
    runtimeState,
    actions,
  };
}
