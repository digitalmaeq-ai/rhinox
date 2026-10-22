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
const DIRECTIONS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
const DIRECTION_NAMES = ["north", "east", "south", "west"];

export function runRobotProgram(commands: readonly RobotCommand[], sourceLines?: readonly number[], repeatPaths?: readonly (readonly number[])[], startPosition: RobotPosition = ROBOT_START): RobotRunResult {
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
      if (next.x < 0 || next.x > 4 || next.y < 0 || next.y > 4) {
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
  const success = position.x === ROBOT_GOAL.x && position.y === ROBOT_GOAL.y;
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
