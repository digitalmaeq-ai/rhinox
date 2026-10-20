// Shared pieces for the guided exercises: the types and the helpers every
// exercise's checks use. Nothing here runs Python itself.

/** What one run of the learner's program produced. */
export interface RunCapture {
  outcome: "ok" | "error" | "stopped" | "timeout" | "output-limit" | "crashed" | "failed-to-start";
  stdout: string;
  stderr: string;
}

export interface CheckCase {
  /** Shown to the learner, for example "Name Ada, age 12". */
  label: string;
  /** The answers given to input(), one per call. */
  stdin: string[];
  /** Hidden code added after the learner's program (used to call their function). */
  append?: string;
  /** Returns null when the run is right, otherwise a helpful sentence. */
  evaluate: (run: RunCapture) => string | null;
}

/** The lesson group an exercise belongs to. More years are added here. */
export type ExerciseGroup = "Starter" | "Year 7" | "Year 8" | "Year 9";

export interface Exercise {
  id: string;
  group: ExerciseGroup;
  /** Where it fits in the curriculum, for example "Term 1, Week 3". Optional. */
  lesson?: string;
  title: string;
  summary: string;
  /** The task, one paragraph per entry. */
  instructions: string[];
  starter: string;
  hints: string[];
  cases: CheckCase[];
}

/** Collapses every run of spaces and new lines to one space. */
export function squash(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function lastLine(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines[lines.length - 1] ?? "";
}

export function shown(text: string): string {
  const t = squash(text);
  return t.length > 160 ? `${t.slice(0, 160)}…` : t;
}

/** The sentence to show when the program did not even finish. null if it did. */
export function runProblem(run: RunCapture): string | null {
  switch (run.outcome) {
    case "ok":
      return null;
    case "error":
      return `Your program stopped with an error: ${lastLine(run.stderr) || "unknown error"}. Press Run to see the full message.`;
    case "timeout":
      return "Your program ran for too long. Look for a loop that never ends, or for input() being called more times than the exercise asks.";
    case "output-limit":
      return "Your program printed far too much. Look for a loop that never ends.";
    case "stopped":
      return "The check was stopped.";
    default:
      return "Python could not run the check. Press Run once, then try Check again.";
  }
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Marks a line the check code printed, so the check can find the function's answer. */
export const MARK = "@@RX@@";

/** The non-empty lines the program printed, trimmed. */
export function printedLines(run: RunCapture): string[] {
  return run.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Checks that the printed lines match exactly, in order. Returns a helpful sentence or null. */
export function compareLines(actual: string[], expected: string[], what = "line"): string | null {
  for (let i = 0; i < expected.length; i += 1) {
    if (actual[i] === undefined) {
      return `Line ${i + 1} is missing. It should be: ${expected[i]}`;
    }
    if (actual[i] !== expected[i]) {
      if (actual[i].toLowerCase() === expected[i].toLowerCase()) {
        return `Nearly! Check the capital letters in ${what} ${i + 1}. It should be: ${expected[i]}`;
      }
      return `${what[0].toUpperCase()}${what.slice(1)} ${i + 1} should be: ${expected[i]} (yours is: ${shown(actual[i])})`;
    }
  }
  if (actual.length > expected.length) {
    return `There is an extra line: ${shown(actual[expected.length])}. The program should print ${expected.length} line${expected.length === 1 ? "" : "s"}.`;
  }
  return null;
}

/** A case where the whole output must be exactly these lines. */
export function linesCase(label: string, stdin: string[], expected: string[]): CheckCase {
  return {
    label,
    stdin,
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      if (run.stdout.trim() === "") return "Your program did not print anything. Use print().";
      return compareLines(printedLines(run), expected);
    },
  };
}

/** A case where the last printed line must be this word or sentence. */
export function lastLineCase(label: string, stdin: string[], expected: string): CheckCase {
  return {
    label,
    stdin,
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      const last = lastLine(run.stdout);
      if (last === "") return `The program should print ${expected}, but it printed nothing.`;
      if (last === expected) return null;
      if (last.toLowerCase() === expected.toLowerCase()) return `Nearly! Check the capital letters. It should print: ${expected}`;
      return `The program should print ${expected}, but the last line was "${shown(last)}".`;
    },
  };
}

export type Expected = number | boolean | string;

export function pythonValue(value: Expected): string {
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "string") return `'${value}'`;
  return String(value);
}

/** A case that calls the learner's function with some arguments and checks what it gives back. */
export function returnCase(functionName: string, signature: string, args: Expected[], expected: Expected): CheckCase {
  const call = `${functionName}(${args.map(pythonValue).join(", ")})`;
  return {
    label: call,
    stdin: [],
    append: `\nprint("${MARK}", repr(${call}))\n`,
    evaluate: (run) => {
      if (run.outcome === "error" && /NameError/.test(run.stderr) && new RegExp(`name '${functionName}' is not defined`).test(run.stderr)) {
        return `I could not find a function called ${functionName}. Define it with: def ${functionName}(${signature}):`;
      }
      if (run.outcome === "error" && /TypeError/.test(run.stderr) && /argument/.test(run.stderr)) {
        return `${functionName} was given the wrong number of values. It should take: ${signature}`;
      }
      const problem = runProblem(run);
      if (problem) return problem;
      const line = run.stdout.split("\n").find((l) => l.startsWith(MARK));
      if (!line) return "The check could not read your function's answer. Make sure your program does not call exit().";
      const value = line.slice(MARK.length).trim();
      if (value === "None") return "Your function gave back nothing. Use return (not print) to hand the answer back.";
      if (typeof expected === "number") {
        const number = Number(value);
        if (Number.isFinite(number) && Math.abs(number - expected) < 0.0001) return null;
      } else if (value === pythonValue(expected)) {
        return null;
      }
      return `${call} should give ${pythonValue(expected)}, but gave ${shown(value)}.`;
    },
  };
}
