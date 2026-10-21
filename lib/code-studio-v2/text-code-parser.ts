import type { RobotCommand } from "./robot-simulator.ts";

export type TextProgramParseResult =
  | { ok: true; commands: RobotCommand[]; sourceLines: number[] }
  | { ok: false; line: number; message: string };

const COMMANDS: Record<string, RobotCommand> = {
  "robot.moveForward()": "forward",
  "robot.turnLeft()": "left",
  "robot.turnRight()": "right",
  "robot.beep()": "beep",
};

/**
 * Parse the deliberately small RhinoBot text language.
 * This is a whitelist parser, not JavaScript evaluation: unknown syntax is rejected.
 */
export function parseRobotTextProgram(source: string): TextProgramParseResult {
  const commands: RobotCommand[] = [];
  const sourceLines: number[] = [];
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const statement = lines[index].replace(/\/\/.*$/, "").trim();
    if (!statement) continue;

    const normalized = statement.endsWith(";") ? statement.slice(0, -1).trim() : statement;
    const command = COMMANDS[normalized];
    if (!command) {
      return {
        ok: false,
        line: index + 1,
        message: "Use one supported robot instruction per line. Arbitrary JavaScript is not allowed.",
      };
    }
    commands.push(command);
    sourceLines.push(index + 1);
  }

  return { ok: true, commands, sourceLines };
}
