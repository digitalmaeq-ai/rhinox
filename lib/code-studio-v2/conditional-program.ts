import { ROBOT_GOAL, ROBOT_START, runRobotProgram, type RobotCommand, type RobotPosition, type RobotTraceStep } from "./robot-simulator.ts";

export type RobotCondition = "atGoal" | "facingNorth" | "facingEast" | "facingSouth" | "facingWest";
export type RobotInstruction =
  | { type: "command"; command: RobotCommand; sourceLine: number }
  | { type: "if"; condition: RobotCondition; thenBranch: RobotInstruction[]; elseBranch: RobotInstruction[]; sourceLine: number };
export type ConditionalTraceEvent =
  | { type: "command"; trace: RobotTraceStep }
  | { type: "branch"; sourceLine: number; condition: RobotCondition; result: boolean; explanation: string };
export type ConditionalRunResult = {
  position: RobotPosition;
  visited: string[];
  events: ConditionalTraceEvent[];
  message: string;
  success: boolean;
};

const MAX_EXECUTED_COMMANDS = 100;
const MAX_EVALUATED_INSTRUCTIONS = 500;
const MAX_CONDITIONAL_DEPTH = 10;
const DIRECTION_CONDITIONS: Record<Exclude<RobotCondition, "atGoal">, RobotPosition["direction"]> = {
  facingNorth: 0, facingEast: 1, facingSouth: 2, facingWest: 3,
};
function evaluate(condition: RobotCondition, position: RobotPosition): boolean {
  if (condition === "atGoal") return position.x === ROBOT_GOAL.x && position.y === ROBOT_GOAL.y;
  return position.direction === DIRECTION_CONDITIONS[condition];
}

/** Executes a trusted instruction tree without evaluating JavaScript. */
export function runConditionalRobotProgram(instructions: readonly RobotInstruction[]): ConditionalRunResult {
  let position = { ...ROBOT_START };
  const visited = [`${position.x},${position.y}`];
  const events: ConditionalTraceEvent[] = [];
  let executedCommands = 0, beeps = 0, blocked = false;
  let evaluatedInstructions = 0, safetyLimitHit = false;
  function execute(list: readonly RobotInstruction[], depth = 0): void {
    if (depth > MAX_CONDITIONAL_DEPTH) {
      safetyLimitHit = true;
      return;
    }
    for (const instruction of list) {
      if (blocked) return;
      if (evaluatedInstructions >= MAX_EVALUATED_INSTRUCTIONS ||
          executedCommands >= MAX_EXECUTED_COMMANDS) {
        safetyLimitHit = true;
        return;
      }
      evaluatedInstructions += 1;
      if (instruction.type === "if") {
        const result = evaluate(instruction.condition, position);
        const conditionText = instruction.condition === "atGoal" ? "RhinoBot is at the goal" : `RhinoBot is facing ${instruction.condition.slice(6).toLowerCase()}`;
        events.push({ type: "branch", sourceLine: instruction.sourceLine, condition: instruction.condition, result,
          explanation: `${conditionText}: ${result ? "yes" : "no"}. The ${result ? "if" : "else"} branch runs.` });
        execute(result ? instruction.thenBranch : instruction.elseBranch, depth + 1);
        continue;
      }
      const one = runRobotProgram([instruction.command], [instruction.sourceLine], undefined, position);
      const step = one.trace[0];
      if (step) events.push({ type: "command", trace: { ...step, step: executedCommands + 1 } });
      executedCommands += 1;
      position = { ...one.position };
      if (instruction.command === "beep") beeps += 1;
      if (instruction.command === "forward" && !step?.blocked) visited.push(`${position.x},${position.y}`);
      if (step?.blocked) blocked = true;
    }
  }
  execute(instructions);
  const success = !blocked && position.x === ROBOT_GOAL.x && position.y === ROBOT_GOAL.y;
  const limitReached = safetyLimitHit;
  const signal = beeps ? ` RhinoBot beeped ${beeps} time${beeps === 1 ? "" : "s"}.` : "";
  return { position, visited, events, success,
    message: blocked ? "RhinoBot stopped safely because the next move would leave the grid."
      : limitReached ? `Execution stopped at the safety limit of ${MAX_EXECUTED_COMMANDS} commands.`
      : success ? `Mission complete! RhinoBot reached the star in ${executedCommands} commands.${signal}`
      : `Program finished, but RhinoBot stopped at column ${position.x + 1}, row ${position.y + 1}. The star is still waiting.${signal}` };
}
