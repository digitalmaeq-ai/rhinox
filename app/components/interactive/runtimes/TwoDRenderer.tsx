import type { ComponentType } from "react";

import DragClassificationRenderer from "@/app/components/interactive/renderers/DragClassificationRenderer";
import MatchingRenderer from "@/app/components/interactive/renderers/MatchingRenderer";
import LabellingRenderer from "@/app/components/interactive/renderers/LabellingRenderer";
import CircuitBuilder from "@/app/components/interactive/circuit-builder/CircuitBuilder";
import SequencingRenderer from "@/app/components/interactive/renderers/SequencingRenderer";
import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

// Interaction renderers available inside the "2d" runtime, keyed by the
// experience's `component` value. The runtime ("2d") says WHERE an
// experience runs; `component` says WHICH interaction it is. Adding a new
// 2D interaction (matching, sequencing, labelling, ...) means adding one
// entry here, never a new runtime slot.
const twoDInteractionRenderers: Record<
  string,
  ComponentType<InteractiveRuntimeRendererProps>
> = {
  "drag-classification": DragClassificationRenderer,
  matching: MatchingRenderer,
  sequencing: SequencingRenderer,
  labelling: LabellingRenderer,
  "circuit-builder": CircuitBuilder,
};

// Selection is explicit on purpose. This used to infer the renderer from
// the shape of the assets (any container + object assets => classification),
// but other 2D interactions such as matching use the same asset shapes and
// would have been silently routed to the wrong renderer. An experience with
// no `component`, or one whose renderer isn't registered yet, gets the
// standard placeholder rather than a guess.
export default function TwoDRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  const component = props.experience.component;
  const InteractionRenderer = component
    ? twoDInteractionRenderers[component]
    : undefined;

  if (InteractionRenderer) {
    return <InteractionRenderer {...props} />;
  }

  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="2D Interactive"
    />
  );
}
