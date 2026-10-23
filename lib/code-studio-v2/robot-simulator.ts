export type RobotCommand = "forward" | "back" | "left" | "right" | "beep";
export type RobotPosition = { x: number; y: number; direction: 0 | 1 | 2 | 3 };
export type RobotTraceStep = {
  step: number;
  sourceLine: number | undefined;
  repeatPath?: number[];
  command: RobotCommand;
  position: RobotPosition;
  description: string;
  blocked: boolean;
};
export type RobotRunResult = {
  position: RobotPosition;
  visited: string[];
  trace: RobotTraceStep[];
  message: string;
  success: boolean;
};

export const ROBOT_START: RobotPosition = { x: 1, y: 3, direction: 0 };
export const ROBOT_GOAL = { x: 3, y: 1 };

/** A square grid and a goal. Free play uses the default; guided lessons supply their own. */
export type RobotMission = { gridSize: number; goal: { x: number; y: number } };
export const DEFAULT_ROBOT_MISSION: RobotMission = { gridSize: 5, goal: ROBOT_GOAL };
const MIN_GRID_SIZE = 3;
const MAX_GRID_SIZE = 8;

export function isRobotMission(value: unknown): value is RobotMission {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const mission = value as Record<string, unknown>;
  const goal = mission.goal as Record<string, unknown> | undefined;
  return Number.isInteger(mission.gridSize) &&
    (mission.gridSize as number) >= MIN_GRID_SIZE && (mission.gridSize as number) <= MAX_GRID_SIZE &&
    !!goal && typeof goal === "object" &&
    Number.isInteger(goal.x) && Number.isInteger(goal.y) &&
    (goal.x as number) >= 0 && (goal.x as number) < (mission.gridSize as number) &&
    (goal.y as number) >= 0 && (goal.y as number) < (mission.gridSize as number);
}

function isValidStart(start: RobotPosition, gridSize: number): boolean {
  return Number.isInteger(start.x) && Number.isInteger(start.y) &&
    start.x >= 0 && start.x < gridSize && start.y >= 0 && start.y < gridSize &&
    [0, 1, 2, 3].includes(start.direction);
}
const DIRECTIONS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
const DIRECTION_NAMES = ["north", "east", "south", "west"];

export function runRobotProgram(commands: readonly RobotCommand[], sourceLines?: readonly number[], repeatPaths?: readonly (readonly number[])[], startPosition: RobotPosition = ROBOT_START, mission: RobotMission = DEFAULT_ROBOT_MISSION): RobotRunResult {
  if (!isRobotMission(mission) || !isValidStart(startPosition, mission.gridSize)) {
    return {
      position: { ...startPosition }, visited: [], trace: [],
      message: "This mission is not set up correctly, so the robot did not run.", success: false,
    };
  }
  const last = mission.gridSize - 1;
  let position = { ...startPosition };
  const visited = [`${position.x},${position.y}`];
  const trace: RobotTraceStep[] = [];
  let beeps = 0;
  for (let index = 0; index < commands.length; index += 1) {
    const command = commands[index];
    let description: string;
    if (command === "left") {
      position.direction = ((position.direction + 3) % 4) as RobotPosition["direction"];
      description = `Turned left. Now facing ${DIRECTION_NAMES[position.direction]}.`;
    } else if (command === "right") {
      position.direction = ((position.direction + 1) % 4) as RobotPosition["direction"];
      description = `Turned right. Now facing ${DIRECTION_NAMES[position.direction]}.`;
    } else if (command === "beep") {
      beeps += 1;
      description = "RhinoBot beeped without changing position.";
    } else {
      // "back" moves one square opposite to the facing direction and does not turn.
      const sign = command === "back" ? -1 : 1;
      const next = {
        x: position.x + sign * DIRECTIONS[position.direction].x,
        y: position.y + sign * DIRECTIONS[position.direction].y,
      };
      if (next.x < 0 || next.x > last || next.y < 0 || next.y > last) {
        trace.push({
          step: index + 1,
          sourceLine: sourceLines?.[index],
          ...(repeatPaths?.[index]?.length ? { repeatPath: [...(repeatPaths[index] ?? [])] } : {}),
          command,
          position: { ...position },
          description: "Blocked: this move would take RhinoBot outside the grid.",
          blocked: true,
        });
        return {
          position,
          visited,
          trace,
          message: `Step ${index + 1}: the robot would leave the grid. Try changing the commands.`,
          success: false,
        };
      }
      position = { ...position, ...next };
      visited.push(`${position.x},${position.y}`);
      description = `${command === "back" ? "Moved back" : "Moved"} to column ${position.x + 1}, row ${position.y + 1}.`;
    }
    trace.push({
      step: index + 1,
      sourceLine: sourceLines?.[index],
      ...(repeatPaths?.[index]?.length ? { repeatPath: [...repeatPaths[index]] } : {}),
      command,
      position: { ...position },
      description,
      blocked: false,
    });
  }
  const success = position.x === mission.goal.x && position.y === mission.goal.y;
  const signal = beeps ? ` The robot beeped ${beeps} time${beeps === 1 ? "" : "s"}.` : "";
  return {
    position,
    visited,
    trace,
    message: success
      ? `Mission complete! RhinoBot reached the star in ${commands.length} instructions.${signal}`
      : `Program finished, but RhinoBot stopped at column ${position.x + 1}, row ${position.y + 1}. The star is still waiting.${signal}`,
    success,
  };
}
