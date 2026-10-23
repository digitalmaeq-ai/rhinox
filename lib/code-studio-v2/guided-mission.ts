import {
  isRobotMission, runRobotProgram,
  type RobotCommand, type RobotMission, type RobotPosition, type RobotRunResult,
} from "./robot-simulator.ts";

/** Rules a reviewed lesson places on the learner's program. */
export type GuidedProgramRules = { minCards: number; maxCards: number; minTurns: number };

export type GuidedMissionDefinition = {
  mission: RobotMission;
  start: RobotPosition;
  rules: GuidedProgramRules;
};

export type GuidedRunStatus =
  | "met-all-rules"          // reached the finish and followed the card and turn rules
  | "reached-finish-outside-rules"
  | "blocked"
  | "not-yet"
  | "invalid-setup";

export type GuidedRunEvaluation = {
  status: GuidedRunStatus;
  cards: number;
  turns: number;
  problems: string[];
  /** What the app measured. This is simulator evidence only, never proof of mastery or of a physical robot. */
  evidenceNote: string;
  run: RobotRunResult | null;
};

const EVIDENCE_NOTE =
  "The app checked this run on the screen. Whether the child understood each card is for a teacher to observe.";

export function isGuidedProgramRules(value: unknown): value is GuidedProgramRules {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  return Number.isInteger(r.minCards) && Number.isInteger(r.maxCards) && Number.isInteger(r.minTurns) &&
    (r.minCards as number) >= 1 && (r.maxCards as number) >= (r.minCards as number) && (r.maxCards as number) <= 30 &&
    (r.minTurns as number) >= 0 && (r.minTurns as number) <= (r.maxCards as number);
}

export function isGuidedMissionDefinition(value: unknown): value is GuidedMissionDefinition {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const d = value as Record<string, unknown>;
  const start = d.start as Record<string, unknown> | undefined;
  return isRobotMission(d.mission) && isGuidedProgramRules(d.rules) && !!start &&
    Number.isInteger(start.x) && Number.isInteger(start.y) && [0, 1, 2, 3].includes(start.direction as number) &&
    (start.x as number) >= 0 && (start.x as number) < (d.mission as RobotMission).gridSize &&
    (start.y as number) >= 0 && (start.y as number) < (d.mission as RobotMission).gridSize;
}

/** Run a learner's program for a reviewed guided mission and report truthfully what happened. */
export function evaluateGuidedRobotRun(commands: readonly RobotCommand[], definition: GuidedMissionDefinition): GuidedRunEvaluation {
  if (!isGuidedMissionDefinition(definition) || !Array.isArray(commands)) {
    return { status: "invalid-setup", cards: 0, turns: 0, problems: ["This lesson mission is not set up correctly."], evidenceNote: EVIDENCE_NOTE, run: null };
  }
  const cards = commands.length;
  const turns = commands.filter((command) => command === "left" || command === "right").length;
  const run = runRobotProgram(commands, undefined, undefined, definition.start, definition.mission);
  const problems: string[] = [];
  const { minCards, maxCards, minTurns } = definition.rules;
  if (cards < minCards) problems.push(`Use at least ${minCards} cards. You used ${cards}.`);
  if (cards > maxCards) problems.push(`Use no more than ${maxCards} cards. You used ${cards}.`);
  if (turns < minTurns) problems.push(`Use at least ${minTurns} turn card${minTurns === 1 ? "" : "s"}. You used ${turns}.`);

  if (run.trace.some((step) => step.blocked)) {
    return { status: "blocked", cards, turns, problems, evidenceNote: EVIDENCE_NOTE, run };
  }
  if (!run.success) return { status: "not-yet", cards, turns, problems, evidenceNote: EVIDENCE_NOTE, run };
  return { status: problems.length === 0 ? "met-all-rules" : "reached-finish-outside-rules", cards, turns, problems, evidenceNote: EVIDENCE_NOTE, run };
}
