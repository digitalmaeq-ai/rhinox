/**
 * Shared, renderer-independent contracts for Code Studio exercises.
 * These describe behaviour and evidence; they do not imply that a UI renderer exists.
 */
export type EvidenceMode = "automatic" | "learner-confirmed" | "teacher-observed";
export type RetryPolicy = "allow-until-limit" | "single-attempt";

export type ExerciseBase = {
  id: string;
  prompt: string;
  instructions: string;
  hint: string;
  fallback: string;
  evidenceMode: EvidenceMode;
  maxAttempts: number;
  retryPolicy: RetryPolicy;
  pointsAvailable: number;
  accessibility: {
    keyboardOperable: boolean;
    touchOperable: boolean;
    textAlternative: boolean;
  };
};

export type OrderingExercise = ExerciseBase & {
  kind: "ordering";
  items: readonly { id: string; label: string }[];
  expectedOrder: readonly string[];
  scoring: {
    correctPoints: number;
    incorrectPoints: number;
    partialCredit: boolean;
  };
};

export type ChoiceExercise = ExerciseBase & {
  kind: "choice";
  options: readonly { id: string; label: string }[];
  correctOptionId: string;
};

export type UnpluggedConfirmationExercise = ExerciseBase & {
  kind: "unplugged-confirmation";
  evidenceMode: "learner-confirmed" | "teacher-observed";
  confirmationLabel: string;
};

export type CreationReflectionExercise = ExerciseBase & {
  kind: "creation-reflection";
  evidenceMode: "learner-confirmed" | "teacher-observed";
  reflectionPrompt: string;
  minimumResponseLength: number;
};

export type ExerciseDefinition =
  | OrderingExercise
  | ChoiceExercise
  | UnpluggedConfirmationExercise
  | CreationReflectionExercise;

/** Runtime guard for authored data and imported exercise contracts. */
export function isExerciseDefinition(value: unknown): value is ExerciseDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const nonEmpty = (item: unknown) => typeof item === "string" && item.trim().length > 0;
  const baseValid =
    nonEmpty(candidate.id) &&
    nonEmpty(candidate.prompt) &&
    nonEmpty(candidate.instructions) &&
    nonEmpty(candidate.hint) &&
    nonEmpty(candidate.fallback) &&
    ["automatic", "learner-confirmed", "teacher-observed"].includes(String(candidate.evidenceMode)) &&
    Number.isInteger(candidate.maxAttempts) && Number(candidate.maxAttempts) >= 1 &&
    ["allow-until-limit", "single-attempt"].includes(String(candidate.retryPolicy)) &&
    Number.isFinite(candidate.pointsAvailable) && Number(candidate.pointsAvailable) >= 0 &&
    !!candidate.accessibility && typeof candidate.accessibility === "object" &&
    ["keyboardOperable", "touchOperable", "textAlternative"].every(
      (key) => (candidate.accessibility as Record<string, unknown>)[key] === true,
    );
  if (!baseValid) return false;

  if (candidate.kind === "ordering") {
    if (!Array.isArray(candidate.items) || candidate.items.length < 2 ||
        !Array.isArray(candidate.expectedOrder) ||
        !candidate.scoring || typeof candidate.scoring !== "object") return false;
    const ids = candidate.items.map((item) => item && typeof item === "object" ? (item as Record<string, unknown>).id : undefined);
    const labelsValid = candidate.items.every((item) => item && typeof item === "object" &&
      nonEmpty((item as Record<string, unknown>).id) && nonEmpty((item as Record<string, unknown>).label));
    const scoring = candidate.scoring as Record<string, unknown>;
    return labelsValid &&
      new Set(ids).size === ids.length &&
      candidate.expectedOrder.length === ids.length &&
      candidate.expectedOrder.every((id) => typeof id === "string" && ids.includes(id)) &&
      new Set(candidate.expectedOrder).size === candidate.expectedOrder.length &&
      Number.isFinite(scoring.correctPoints) && Number(scoring.correctPoints) >= 0 &&
      Number.isFinite(scoring.incorrectPoints) && Number(scoring.incorrectPoints) >= 0 &&
      typeof scoring.partialCredit === "boolean" &&
      Number(candidate.pointsAvailable) === Number(scoring.correctPoints);
  }
  if (candidate.kind === "choice") {
    if (!Array.isArray(candidate.options) || candidate.options.length < 2) return false;
    const options = candidate.options as Record<string, unknown>[];
    return options.every((option) => option && nonEmpty(option.id) && nonEmpty(option.label)) &&
      new Set(options.map((option) => option.id)).size === options.length &&
      nonEmpty(candidate.correctOptionId) &&
      options.some((option) => option.id === candidate.correctOptionId);
  }
  if (candidate.kind === "unplugged-confirmation") {
    return candidate.evidenceMode !== "automatic" && nonEmpty(candidate.confirmationLabel);
  }
  if (candidate.kind === "creation-reflection") {
    return candidate.evidenceMode !== "automatic" &&
      nonEmpty(candidate.reflectionPrompt) &&
      Number.isInteger(candidate.minimumResponseLength) &&
      Number(candidate.minimumResponseLength) >= 0;
  }
  return false;
}
