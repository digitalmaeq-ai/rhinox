import StandardExperienceRenderer from "@/app/components/interactive/renderers/StandardExperienceRenderer";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

export default function StandardRenderer({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  return (
    <StandardExperienceRenderer
      experience={experience}
      runtimeState={runtimeState}
      actions={actions}
    />
  );
}
