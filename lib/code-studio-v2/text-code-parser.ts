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
const MAX_EXPANDED_COMMANDS = 100;
const MAX_REPEAT_COUNT = 10;
const MAX_REPEAT_DEPTH = 3;

/** Parse a small, safe robot language; never evaluates JavaScript. */
export function parseRobotTextProgram(source: string): TextProgramParseResult {
  const lines = source.split(/\r?\n/);
  const commands: RobotCommand[] = [];
  const sourceLines: number[] = [];
  let index = 0;

  function fail(line: number, message: string): TextProgramParseResult {
    return { ok: false, line, message };
  }

  function parseBlock(depth: number, isNested: boolean): TextProgramParseResult | null {
    while (index < lines.length) {
      const lineNumber = index + 1;
      const statement = lines[index].replace(/\/\/.*$/, "").trim();
      index += 1;
      if (!statement) continue;
      if (statement === "}") {
        return isNested ? null : fail(lineNumber, "There is no matching repeat block for this closing brace.");
      }
      const repeat = statement.match(/^repeat\s*\(\s*(\d+)\s*\)\s*\{$/);
      if (repeat) {
        if (depth >= MAX_REPEAT_DEPTH) return fail(lineNumber, "Repeat blocks can be nested only " + MAX_REPEAT_DEPTH + " levels deep.");
        const count = Number(repeat[1]);
        if (count < 1 || count > MAX_REPEAT_COUNT) return fail(lineNumber, "Repeat count must be between 1 and " + MAX_REPEAT_COUNT + ".");
        const bodyCommands: RobotCommand[] = [];
        const bodyLines: number[] = [];
        const commandStart = commands.length;
        const lineStart = sourceLines.length;
        const nestedResult = parseBlock(depth + 1, true);
        if (nestedResult) return nestedResult;
        bodyCommands.push(...commands.splice(commandStart));
        bodyLines.push(...sourceLines.splice(lineStart));
        for (let iteration = 0; iteration < count; iteration += 1) {
          commands.push(...bodyCommands);
          sourceLines.push(...bodyLines);
          if (commands.length > MAX_EXPANDED_COMMANDS) return fail(lineNumber, "This repeat would create more than " + MAX_EXPANDED_COMMANDS + " instructions. Use a smaller program.");
        }
        continue;
      }
      if (statement.startsWith("repeat")) return fail(lineNumber, "Use repeat(3) { on its own line, then put instructions inside and close with }.");
      const normalized = statement.endsWith(";") ? statement.slice(0, -1).trim() : statement;
      const command = COMMANDS[normalized];
      if (!command) return fail(lineNumber, "Use one supported robot instruction per line. Arbitrary JavaScript is not allowed.");
      commands.push(command);
      sourceLines.push(lineNumber);
      if (commands.length > MAX_EXPANDED_COMMANDS) return fail(lineNumber, "Programs are limited to " + MAX_EXPANDED_COMMANDS + " executed instructions.");
    }
    return isNested ? fail(lines.length || 1, "This repeat block is missing its closing brace }.") : null;
  }

  const error = parseBlock(0, false);
  if (error) return error;
  return { ok: true, commands, sourceLines };
}