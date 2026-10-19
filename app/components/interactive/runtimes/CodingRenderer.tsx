import type { ComponentType } from "react";

import ChargerLevelsRenderer from "@/app/components/interactive/renderers/ChargerLevelsRenderer";
import GridPathRenderer from "@/app/components/interactive/renderers/GridPathRenderer";
import RhinoBotLab from "@/app/components/interactive/rhinobot/RhinoBotLab";
import MazeCoder from "@/app/components/interactive/maze-coder/MazeCoder";
import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

// Coding interactions available inside the "coding" runtime, keyed by the
// experience's `component` value — the same explicit pattern as
// TwoDRenderer. An experience with no `component`, or one whose renderer
// isn't registered, gets the standard placeholder.
const codingInteractionRenderers: Record<
  string,
  ComponentType<InteractiveRuntimeRendererProps>
> = {
  "grid-path": GridPathRenderer,
  "charger-levels": ChargerLevelsRenderer,
  "maze-coder": MazeCoder,
  "rhinobot-lab": RhinoBotLab,
};

export default function CodingRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  const component = props.experience.component;
  const InteractionRenderer = component
    ? codingInteractionRenderers[component]
    : undefined;

  if (InteractionRenderer) {
    return <InteractionRenderer {...props} />;
  }

  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="Coding"
    />
  );
}
