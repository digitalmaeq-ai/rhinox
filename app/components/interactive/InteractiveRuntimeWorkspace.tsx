"use client";

import {
  interactiveRuntimeRenderers,
} from "@/lib/interactive-runtime";

import {
  useInteractiveRuntime,
} from "@/app/components/interactive/useInteractiveRuntime";

import ProgressStrip from "@/app/components/interactive/shared/ProgressStrip";

import type {
  InteractiveRuntimeWorkspaceProps,
} from "@/types/interactive-runtime-workspace";

export default function InteractiveRuntimeWorkspace({
  experience,
}: InteractiveRuntimeWorkspaceProps) {
  const {
    runtimeState,
    actions,
  } = useInteractiveRuntime(experience);

  // The registry maps each runtime type to a component defined once at
  // module level, so this lookup returns the same component on every
  // render and RuntimeRenderer keeps its state; it only remounts when the
  // runtime type itself changes. Indexing the registry directly (rather
  // than calling a lookup function) lets the React lint rules see that.
  // There is no fallback: a new runtime type must be added to the registry.
  const RuntimeRenderer = interactiveRuntimeRenderers[experience.runtime];

  // Virtual labs and the standard runtime show their own tasks and score;
  // every other activity gets the slim progress strip under it.
  const showStrip =
    (experience.tasks?.length ?? 0) > 0 &&
    !["simulation", "virtual-lab", "standard"].includes(experience.runtime);

  return (
    <>
      <RuntimeRenderer
        experience={experience}
        runtimeState={runtimeState}
        actions={actions}
      />
      {showStrip && (
        <ProgressStrip experience={experience} runtimeState={runtimeState} />
      )}
    </>
  );
}
