import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";
import SimLabRenderer from "@/app/components/interactive/simlab/SimLabRenderer";
import { simRegistry } from "@/app/components/interactive/simlab/registry";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

// experience.component picks the simulation from the experiment engine's
// registry; anything not registered yet keeps the placeholder.
export default function VirtualLabRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  const spec = props.experience.component
    ? simRegistry[props.experience.component]
    : undefined;

  if (spec) {
    return <SimLabRenderer key={props.experience.id} {...props} spec={spec} />;
  }

  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="Virtual Lab"
    />
  );
}
