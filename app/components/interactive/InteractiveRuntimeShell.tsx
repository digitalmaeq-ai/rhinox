import InteractiveRuntimeWorkspace from "@/app/components/interactive/InteractiveRuntimeWorkspace";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

export default function InteractiveRuntimeShell({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  return (
    <section className="rx-section">
      <InteractiveRuntimeWorkspace
        experience={experience}
      />
    </section>
  );
}
