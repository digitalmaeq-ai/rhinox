import RuntimePlaceholderRenderer from "./RuntimePlaceholderRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

export default function SandboxRenderer(
  props: InteractiveRuntimeRendererProps,
) {
  return (
    <RuntimePlaceholderRenderer
      {...props}
      runtimeLabel="Sandbox"
    />
  );
}
