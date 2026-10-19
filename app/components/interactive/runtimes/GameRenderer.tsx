import type { ComponentType } from "react";

import RhinoBotAdventure from "@/app/components/interactive/rhinobot-adventure/RhinoBotAdventure";
import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

// Game interactions available inside the "game" runtime, keyed by the
// experience's `component`. An experience with no `component`, or one whose
// renderer is not listed here, falls back to the placeholder.
const gameInteractionRenderers: Record<
  string,
  ComponentType<InteractiveRuntimeRendererProps>
> = {
  "rhinobot-adventure": RhinoBotAdventure,
};

export default function GameRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  const component = props.experience.component;
  const InteractionRenderer = component
    ? gameInteractionRenderers[component]
    : undefined;

  if (InteractionRenderer) {
    return <InteractionRenderer {...props} />;
  }

  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="Game"
    />
  );
}
