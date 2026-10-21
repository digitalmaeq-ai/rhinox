import { getCurriculumActivity } from "./curriculum.ts";
import { getLessonSpec, isLessonSpecConsistent } from "./lesson-specs.ts";
import type { RobotCommand } from "./robot-simulator.ts";

/** A reviewed, public-preview coding task; never derive this from a raw curriculum row or URL. */
export type GuidedRobotLaunch = {
  activityId: string;
  reviewedTaskId: string;
  adapter: "robot-blocks" | "robot-text";
  starterProgram: readonly RobotCommand[];
  successCriteria: readonly string[];
  returnPath: "/coding-robotics/code-studio/learn";
};

const REVIEWED_LAUNCHES: Readonly<Record<string, GuidedRobotLaunch>> = Object.freeze({});

/**
 * Fail closed until a curriculum-linked robot task is separately authored and reviewed.
 * The current Nursery 1 Week 1 exercise is unplugged ordering, not a robot simulator task.
 */
export function resolveGuidedRobotLaunch(activityId: string, taskId: string): GuidedRobotLaunch | null {
  if (typeof activityId !== "string" || typeof taskId !== "string") return null;
  const activity = getCurriculumActivity(activityId);
  const spec = getLessonSpec(activityId);
  if (!activity || !spec || !isLessonSpecConsistent(spec, activity)) return null;
  const launch = REVIEWED_LAUNCHES[taskId];
  if (!launch || launch.activityId !== activityId || launch.reviewedTaskId !== taskId) return null;
  if (launch.adapter !== "robot-blocks" && launch.adapter !== "robot-text") return null;
  if (!launch.successCriteria.length || !launch.successCriteria.every((item) => item.trim())) return null;
  if (launch.starterProgram.length > 100 ||
      !launch.starterProgram.every((command) => ["forward", "left", "right", "beep"].includes(command))) return null;
  return launch;
}
