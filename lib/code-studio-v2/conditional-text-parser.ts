import type { RobotCommand } from "./robot-simulator.ts";
import type { RobotCondition, RobotInstruction } from "./conditional-program.ts";
export type ConditionalTextParseResult = { ok: true; instructions: RobotInstruction[] } | { ok: false; line: number; message: string };
const COMMANDS: Record<string, RobotCommand> = { "robot.moveForward()": "forward", "robot.moveBack()": "back", "robot.turnLeft()": "left", "robot.turnRight()": "right", "robot.beep()": "beep" };
const CONDITIONS: Record<string, RobotCondition> = { "robot.atGoal()": "atGoal", "robot.facingNorth()": "facingNorth", "robot.facingEast()": "facingEast", "robot.facingSouth()": "facingSouth", "robot.facingWest()": "facingWest" };
const MAX_SOURCE_CHARS = 20_000, MAX_SOURCE_LINES = 500, MAX_NESTING_DEPTH = 10, MAX_INSTRUCTIONS = 500;
/** Parse a small if/else language without evaluating JavaScript or executing source text. */
export function parseConditionalRobotTextProgram(source: string): ConditionalTextParseResult {
  if (typeof source !== "string") return { ok: false, line: 1, message: "Program must be text." };
  if (source.length > MAX_SOURCE_CHARS) return { ok: false, line: 1, message: `Programs are limited to ${MAX_SOURCE_CHARS} characters.` };
  const lines = source.split(/\r?\n/);
  if (lines.length > MAX_SOURCE_LINES) return { ok: false, line: MAX_SOURCE_LINES + 1, message: `Programs are limited to ${MAX_SOURCE_LINES} lines.` };
  let index = 0, instructionCount = 0;
  type BlockResult = { instructions: RobotInstruction[]; terminator: "close" | "else" | "end" } | { error: { ok: false; line: number; message: string } };
  function nextStatement(): { line: number; statement: string } | null {
    while (index < lines.length) { const line = index + 1; const statement = lines[index].replace(/\/\/.*$/, "").trim(); index += 1; if (statement) return { line, statement }; }
    return null;
  }
  function parseBlock(depth: number, nested: boolean): BlockResult {
    const instructions: RobotInstruction[] = [];
    while (true) {
      const current = nextStatement();
      if (!current) {
        if (nested) return { error: { ok: false, line: lines.length || 1, message: "This conditional block is missing its closing brace }." } };
        return { instructions, terminator: "end" };
      }
      const { line, statement } = current;
      if (statement === "}" || statement === "} else {") {
        if (!nested) return { error: { ok: false, line, message: "There is no matching conditional block for this closing brace." } };
        return { instructions, terminator: statement === "} else {" ? "else" : "close" };
      }
      if (statement === "else {" || statement.startsWith("else")) return { error: { ok: false, line, message: "Use else { immediately after an if block's closing brace." } };
      const conditional = statement.match(/^if\s*\(\s*(robot\.(?:atGoal|facingNorth|facingEast|facingSouth|facingWest)\(\))\s*\)\s*\{$/);
      if (conditional) {
        if (depth >= MAX_NESTING_DEPTH) return { error: { ok: false, line, message: `If/else blocks can be nested only ${MAX_NESTING_DEPTH} levels deep.` } };
        const condition = CONDITIONS[conditional[1]];
        const thenResult = parseBlock(depth + 1, true);
        if ("error" in thenResult) return thenResult;
        let elseBranch: RobotInstruction[] = [];
        if (thenResult.terminator === "else") {
          const elseResult = parseBlock(depth + 1, true);
          if ("error" in elseResult) return elseResult;
          if (elseResult.terminator !== "close") return { error: { ok: false, line, message: "An else block must end with a closing brace }." } };
          elseBranch = elseResult.instructions;
        } else {
          const savedIndex = index, next = nextStatement();
          if (next?.statement === "else {") {
            const elseResult = parseBlock(depth + 1, true);
            if ("error" in elseResult) return elseResult;
            if (elseResult.terminator !== "close") return { error: { ok: false, line: next.line, message: "An else block must end with a closing brace }." } };
            elseBranch = elseResult.instructions;
          } else index = savedIndex;
        }
        instructions.push({ type: "if", condition, thenBranch: thenResult.instructions, elseBranch, sourceLine: line });
        instructionCount += 1;
      } else {
        const normalized = statement.endsWith(";") ? statement.slice(0, -1).trim() : statement, command = COMMANDS[normalized];
        if (!command) return { error: { ok: false, line, message: "Use a supported robot instruction or an if (robot.atGoal()) { ... } condition. Arbitrary JavaScript is not allowed." } };
        instructions.push({ type: "command", command, sourceLine: line });
        instructionCount += 1;
      }
      if (instructionCount > MAX_INSTRUCTIONS) return { error: { ok: false, line, message: `Programs are limited to ${MAX_INSTRUCTIONS} instructions and conditional blocks.` } };
    }
  }
  const parsed = parseBlock(0, false);
  if ("error" in parsed) return parsed.error;
  return { ok: true, instructions: parsed.instructions };
}
