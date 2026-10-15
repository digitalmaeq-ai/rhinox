import type { ComponentType } from "react";

import StandardRenderer from "@/app/components/interactive/StandardRenderer";

import CodingRenderer from "@/app/components/interactive/runtimes/CodingRenderer";
import DesignToolRenderer from "@/app/components/interactive/runtimes/DesignToolRenderer";
import GameRenderer from "@/app/components/interactive/runtimes/GameRenderer";
import InteractiveStoryRenderer from "@/app/components/interactive/runtimes/InteractiveStoryRenderer";
import RoboticsRenderer from "@/app/components/interactive/runtimes/RoboticsRenderer";
import SandboxRenderer from "@/app/components/interactive/runtimes/SandboxRenderer";
import SimulationRenderer from "@/app/components/interactive/runtimes/SimulationRenderer";
import ThreeDRenderer from "@/app/components/interactive/runtimes/ThreeDRenderer";
import TwoDRenderer from "@/app/components/interactive/runtimes/TwoDRenderer";
import VirtualLabRenderer from "@/app/components/interactive/runtimes/VirtualLabRenderer";

import type {
  InteractiveExperienceRuntime,
} from "@/types/interactive-runtime";

import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

export const interactiveRuntimeRenderers: Record<
  InteractiveExperienceRuntime,
  ComponentType<InteractiveRuntimeRendererProps>
> = {
  standard: StandardRenderer,
  "2d": TwoDRenderer,
  "3d": ThreeDRenderer,
  simulation: SimulationRenderer,
  "virtual-lab": VirtualLabRenderer,
  game: GameRenderer,
  sandbox: SandboxRenderer,
  "interactive-story": InteractiveStoryRenderer,
  "design-tool": DesignToolRenderer,
  coding: CodingRenderer,
  robotics: RoboticsRenderer,
};

export function getInteractiveRuntimeRenderer(
  runtime: InteractiveExperienceRuntime,
) {
  return interactiveRuntimeRenderers[runtime];
}
