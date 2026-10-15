import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

export default function DesignToolRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="Design Tool"
    />
  );
}
