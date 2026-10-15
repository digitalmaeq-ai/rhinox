export type InteractiveVariableValue =
  | number
  | string
  | boolean;

export interface InteractiveExperienceVariable {
  id: string;
  label: string;
  type: "number" | "string" | "boolean";
  initialValue: InteractiveVariableValue;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
}
