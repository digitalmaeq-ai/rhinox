"use client";

import { useMemo } from "react";

import {
  getInteractiveRuntimeRenderer,
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

  // Resolve the renderer component once per runtime type instead of on
  // every render — assigning a freshly-looked-up value to a PascalCase
  // variable each render makes React treat it as a brand new component
  // type, which would remount RuntimeRenderer (and reset any state it
  // holds) on every re-render of this workspace.
  const RuntimeRenderer = useMemo(
    () => getInteractiveRuntimeRenderer(experience.runtime),
    [experience.runtime],
  );

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
