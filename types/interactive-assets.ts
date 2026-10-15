export type InteractiveAssetType =
  | "object"
  | "image"
  | "text"
  | "model"
  | "container"
  | "control"
  | "measurement"
  | "character"
  | "environment";

export type InteractiveActionType =
  | "set-variable"
  | "change-variable"
  | "show-feedback"
  | "complete-task"
  | "add-points"
  | "unlock-achievement"
  | "next-scene"
  | "previous-scene"
  | "reset";

export type InteractiveRuleOperator =
  | "equals"
  | "not-equals"
  | "greater-than"
  | "less-than"
  | "greater-than-or-equal"
  | "less-than-or-equal";

export interface InteractiveAsset {
  id: string;
  type: InteractiveAssetType;
  label: string;
  description?: string;
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  visible?: boolean;
  interactive?: boolean;
  properties?: Record<string, string | number | boolean>;
}

export interface InteractiveAction {
  id: string;
  type: InteractiveActionType;
  targetId?: string;
  variableId?: string;
  value?: string | number | boolean;
  points?: number;
  message?: string;
}

export interface InteractiveRule {
  id: string;
  variableId: string;
  operator: InteractiveRuleOperator;
  value: string | number | boolean;
  actions: InteractiveAction[];
}

export interface InteractiveInteraction {
  id: string;
  assetId: string;
  trigger:
    | "click"
    | "drag"
    | "drop"
    | "input"
    | "hover"
    | "select"
    | "submit";
  actions?: InteractiveAction[];
  rules?: InteractiveRule[];
}
