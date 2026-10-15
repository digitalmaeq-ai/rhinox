import type { ComponentType } from "react";

import HumanBodyExplorer from "@/app/components/interactive/human-body/HumanBodyExplorer";
import SolarSystemExperiment from "@/app/components/interactive/solar-system/SolarSystemExperiment";
import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

// 3D interactions available inside the "3d" runtime, keyed by the
// experience's `component` value (same explicit pattern as TwoDRenderer).
const threeDInteractionRenderers: Record<
  string,
  ComponentType<InteractiveRuntimeRendererProps>
> = {
  "human-body": HumanBodyExplorer,
  "solar-system": SolarSystemExperiment,
};

export default function ThreeDRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  const component = props.experience.component;
  const InteractionRenderer = component
    ? threeDInteractionRenderers[component]
    : undefined;

  if (InteractionRenderer) {
    return <InteractionRenderer {...props} />;
  }

  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="3D Interactive"
    />
  );
}
