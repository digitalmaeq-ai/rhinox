export type InteractiveExperienceRuntime =
  | "standard"
  | "2d"
  | "3d"
  | "simulation"
  | "virtual-lab"
  | "game"
  | "sandbox"
  | "interactive-story"
  | "design-tool"
  | "coding"
  | "robotics";

export interface InteractiveRuntimeDefinition {
  runtime: InteractiveExperienceRuntime;
  label: string;
  description: string;
}

export const interactiveRuntimes: InteractiveRuntimeDefinition[] = [
  {
    runtime: "standard",
    label: "Interactive",
    description:
      "A standard interactive learning experience.",
  },
  {
    runtime: "2d",
    label: "2D Interactive",
    description:
      "A two dimensional interactive experience.",
  },
  {
    runtime: "3d",
    label: "3D Interactive",
    description:
      "A three dimensional interactive experience.",
  },
  {
    runtime: "simulation",
    label: "Simulation",
    description:
      "An interactive simulation based on rules, variables and user actions.",
  },
  {
    runtime: "virtual-lab",
    label: "Virtual Lab",
    description:
      "A virtual laboratory environment for practical science learning.",
  },
  {
    runtime: "game",
    label: "Game",
    description:
      "A game based learning experience.",
  },
  {
    runtime: "sandbox",
    label: "Sandbox",
    description:
      "An open ended environment where learners can experiment and build.",
  },
  {
    runtime: "interactive-story",
    label: "Interactive Story",
    description:
      "A story driven experience with interactive decisions and activities.",
  },
  {
    runtime: "design-tool",
    label: "Design Tool",
    description:
      "An interactive environment for designing and solving problems.",
  },
  {
    runtime: "coding",
    label: "Coding",
    description:
      "An interactive programming and computational learning environment.",
  },
  {
    runtime: "robotics",
    label: "Robotics",
    description:
      "An interactive robotics learning and simulation environment.",
  },
];

export function getInteractiveRuntime(
  runtime: InteractiveExperienceRuntime,
): InteractiveRuntimeDefinition {
  return (
    interactiveRuntimes.find(
      (item) => item.runtime === runtime,
    ) ?? interactiveRuntimes[0]
  );
}

