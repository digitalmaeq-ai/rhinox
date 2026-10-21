export type RobotCommand = "forward" | "left" | "right" | "beep";
export type RobotPosition = { x: number; y: number; direction: 0 | 1 | 2 | 3 };
export type RobotRunResult = {
  position: RobotPosition;
  visited: string[];
  message: string;
  success: boolean;
};

export const ROBOT_START: RobotPosition = { x: 1, y: 3, direction: 0 };
export const ROBOT_GOAL = { x: 3, y: 1 };
const DIRECTIONS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

export function runRobotProgram(commands: readonly RobotCommand[]): RobotRunResult {
  let position = { ...ROBOT_START };
  const visited = [`${position.x},${position.y}`];
  let beeps = 0;
  for (let index = 0; index < commands.length; index += 1) {
    const command = commands[index];
    if (command === "left") {
      position.direction = ((position.direction + 3) % 4) as RobotPosition["direction"];
    } else if (command === "right") {
      position.direction = ((position.direction + 1) % 4) as RobotPosition["direction"];
    } else if (command === "beep") {
      beeps += 1;
    } else if (command === "forward") {
      const next = {
        x: position.x + DIRECTIONS[position.direction].x,
        y: position.y + DIRECTIONS[position.direction].y,
      };
      if (next.x < 0 || next.x > 4 || next.y < 0 || next.y > 4) {
        return {
          position,
          visited,
          message: `Step ${index + 1}: the robot would leave the grid. Try changing the commands.`,
          success: false,
        };
      }
      position = { ...position, ...next };
      visited.push(`${position.x},${position.y}`);
    }
  }
  const success = position.x === ROBOT_GOAL.x && position.y === ROBOT_GOAL.y;
  const signal = beeps ? ` The robot beeped ${beeps} time${beeps === 1 ? "" : "s"}.` : "";
  return {
    position,
    visited,
    message: success
      ? `Mission complete! RhinoBot reached the star in ${commands.length} instructions.${signal}`
      : `Program finished, but RhinoBot stopped at column ${position.x + 1}, row ${position.y + 1}. The star is still waiting.${signal}`,
    success,
  };
}
