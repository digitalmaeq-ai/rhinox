import type { ComponentType } from "react";

import GridPathRenderer from "@/app/components/interactive/renderers/GridPathRenderer";
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
  "maze-coder": MazeCoder,
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
