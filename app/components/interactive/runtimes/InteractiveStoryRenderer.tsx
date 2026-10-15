import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

export default function InteractiveStoryRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="Interactive Story"
    />
  );
}
