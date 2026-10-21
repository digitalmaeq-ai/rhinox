import type { RobotRunResult } from "./robot-simulator.ts";

/** Feedback for the public robot playground, not evidence of curriculum mastery. */
export type RobotMissionFeedback = {
  status: "complete" | "blocked" | "not-yet";
  heading: string;
  explanation: string;
  nextAction: string;
};

export function getRobotMissionFeedback(result: RobotRunResult): RobotMissionFeedback {
  const blocked = result.trace.find((step) => step.blocked);
  if (blocked) return {
    status: "blocked",
    heading: "A move was blocked",
    explanation: blocked.description,
    nextAction: `Review instruction ${blocked.step}. Turn or change the route before trying again.`,
  };
  if (result.success) return {
    status: "complete",
    heading: "Mission accomplished",
    explanation: result.message,
    nextAction: "Review the trace to explain how RhinoBot reached the star.",
  };
  return {
    status: "not-yet",
    heading: "Keep experimenting",
    explanation: result.message,
    nextAction: result.trace.length === 0
      ? "Add a movement instruction, then run your program."
      : "Compare the final position with the star, then adjust your instructions and run again.",
  };
}
