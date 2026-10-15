import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

export default function GameRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="Game"
    />
  );
}
