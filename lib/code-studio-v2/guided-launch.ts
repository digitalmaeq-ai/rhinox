import { getCurriculumActivity } from "./curriculum.ts";
import { getLessonSpec, isLessonSpecConsistent } from "./lesson-specs.ts";
import { isGuidedMissionDefinition, type GuidedMissionDefinition } from "./guided-mission.ts";
import type { RobotCommand } from "./robot-simulator.ts";

/** A reviewed, public-preview coding task; never derive this from a raw curriculum row or URL. */
export type GuidedRobotLaunch = {
  activityId: string;
  reviewedTaskId: string;
  adapter: "robot-blocks" | "robot-text";
  starterProgram: readonly RobotCommand[];
  /** Grid, start square, finish square and card rules the reviewed lesson sets. */
  mission: GuidedMissionDefinition;
  /** Name shown for the robot in this lesson. */
  characterName: string;
  /** The only instructions the learner is offered in this lesson. */
  availableCommands: readonly RobotCommand[];
  successCriteria: readonly string[];
  returnPath: "/coding-robotics/code-studio/learn";
};

const VALID_COMMANDS = new Set<RobotCommand>(["forward", "back", "left", "right", "beep"]);
const RETURN_PATH = "/coding-robotics/code-studio/learn" as const;
const REVIEWED_LAUNCHES: Readonly<Record<string, GuidedRobotLaunch>> = Object.freeze(Object.create(null));

/** Validate authored launch metadata independently of its registration or UI. */
export function isGuidedRobotLaunch(value: unknown): value is GuidedRobotLaunch {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.activityId === "string" && item.activityId.trim().length > 0 &&
    typeof item.reviewedTaskId === "string" && item.reviewedTaskId.trim().length > 0 &&
    (item.adapter === "robot-blocks" || item.adapter === "robot-text") &&
    item.returnPath === RETURN_PATH &&
    isGuidedMissionDefinition(item.mission) &&
    typeof item.characterName === "string" && item.characterName.trim().length > 0 && item.characterName.length <= 30 &&
    Array.isArray(item.availableCommands) && item.availableCommands.length > 0 && item.availableCommands.length <= 5 &&
    item.availableCommands.every((command: unknown) => VALID_COMMANDS.has(command as RobotCommand)) &&
    new Set(item.availableCommands).size === item.availableCommands.length &&
    Array.isArray(item.starterProgram) && item.starterProgram.length <= 100 &&
    item.starterProgram.every((command: unknown) => VALID_COMMANDS.has(command as RobotCommand)) &&
    Array.isArray(item.successCriteria) && item.successCriteria.length > 0 &&
    item.successCriteria.every((criterion: unknown) => typeof criterion === "string" && criterion.trim().length > 0);
}

/**
 * Fail closed until a curriculum-linked robot task is separately authored and reviewed.
 * The current Nursery 1 Week 1 exercise is unplugged ordering, not a robot simulator task.
 */
export function resolveGuidedRobotLaunch(activityId: string, taskId: string): GuidedRobotLaunch | null {
  if (typeof activityId !== "string" || typeof taskId !== "string" || !activityId || !taskId) return null;
  const activity = getCurriculumActivity(activityId);
  const spec = getLessonSpec(activityId);
  if (!activity || !spec || !isLessonSpecConsistent(spec, activity)) return null;
  if (!Object.hasOwn(REVIEWED_LAUNCHES, taskId)) return null;
  const launch = REVIEWED_LAUNCHES[taskId];
  if (!isGuidedRobotLaunch(launch) || launch.activityId !== activityId || launch.reviewedTaskId !== taskId) return null;
  return launch;
}
