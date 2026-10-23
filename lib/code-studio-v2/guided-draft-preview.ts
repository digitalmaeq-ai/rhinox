import { DRAFT_YEAR1_T1_W3_MISSIONS } from "./guided-missions.ts";
import { isGuidedRobotLaunch, type GuidedRobotLaunch } from "./guided-launch.ts";

/**
 * DRAFT launches for local development only. They are NOT reviewed, are not part of the
 * fail-closed launch registry, and must never be served in production. The page that
 * uses them checks NODE_ENV itself and labels the screen as an unreviewed draft.
 */
const DRAFT_ACTIVITY_ID = "draft-year-1-term-1-week-3";
const RETURN_PATH = "/coding-robotics/code-studio/learn" as const;

const DRAFT_LAUNCHES: Readonly<Record<string, GuidedRobotLaunch>> = Object.freeze({
  "arrow-cards-core": {
    activityId: DRAFT_ACTIVITY_ID, reviewedTaskId: "arrow-cards-core", adapter: "robot-blocks",
    starterProgram: [], mission: DRAFT_YEAR1_T1_W3_MISSIONS.core, characterName: "Ilana",
    availableCommands: ["forward", "back", "left", "right"],
    successCriteria: ["Reach the star using 6 to 8 arrow cards, including at least 2 turns."],
    returnPath: RETURN_PATH,
  },
  "arrow-cards-support": {
    activityId: DRAFT_ACTIVITY_ID, reviewedTaskId: "arrow-cards-support", adapter: "robot-blocks",
    starterProgram: [], mission: DRAFT_YEAR1_T1_W3_MISSIONS.support, characterName: "Ilana",
    availableCommands: ["forward", "back", "left", "right"],
    successCriteria: ["Reach the star using 3 or 4 arrow cards."],
    returnPath: RETURN_PATH,
  },
});

export function resolveDraftPreviewLaunch(activityId: string, taskId: string): GuidedRobotLaunch | null {
  if (activityId !== DRAFT_ACTIVITY_ID || typeof taskId !== "string" || !Object.hasOwn(DRAFT_LAUNCHES, taskId)) return null;
  const launch = DRAFT_LAUNCHES[taskId];
  return isGuidedRobotLaunch(launch) ? launch : null;
}
