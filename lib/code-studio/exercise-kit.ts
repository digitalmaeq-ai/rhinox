// Shared pieces for the guided exercises: the types and the helpers every
// exercise's checks use. Nothing here runs Python itself.
import type { ChartSpec } from "./charts";
import type { ProgramFile } from "./files";

/** What one run of the learner's program produced. */
export interface RunCapture {
  outcome: "ok" | "error" | "stopped" | "timeout" | "output-limit" | "crashed" | "failed-to-start";
  stdout: string;
  stderr: string;
  /** The program's files after the run (absent in older tests that build a capture by hand). */
  files?: ProgramFile[];
  /** The charts the program drew (absent in older tests that build a capture by hand). */
  charts?: ChartSpec[];
}

export interface CheckCase {
  /** Shown to the learner, for example "Name Ada, age 12". */
  label: string;
  /** The answers given to input(), one per call. */
  stdin: string[];
  /** Files the program starts with (for example a CSV to read). Only for this case; the learner's own files are never touched by a check. */
  files?: ProgramFile[];
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

/** The non-blank lines of a file the program left behind, or null if there is no such file. */
export function fileLines(run: RunCapture, name: string): string[] | null {
  const file = run.files?.find((f) => f.name === name);
  if (!file) return null;
  return file.text.split(/\r?\n/).filter((line) => line.trim() !== "");
}

/**
 * A case for programs that use files. The program starts with `files`, then must
 * print `printed` (when given) and leave `file` with exactly these lines (when given).
 */
export function filesCase(options: {
  label: string;
  stdin: string[];
  files?: ProgramFile[];
  printed?: string[];
  file?: { name: string; lines: string[] };
}): CheckCase {
  const { label, stdin, files, printed, file } = options;
  return {
    label,
    stdin,
    files,
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      if (printed) {
        if (run.stdout.trim() === "") return "Your program did not print anything. Use print().";
        const wrong = compareLines(printedLines(run), printed);
        if (wrong) return wrong;
      }
      if (file) {
        const actual = fileLines(run, file.name);
        if (actual === null) {
          return `Your program did not create ${file.name}. Open it with open("${file.name}", ...) and write to it.`;
        }
        for (let i = 0; i < file.lines.length; i += 1) {
          if (actual[i] === undefined) return `${file.name} is missing line ${i + 1}. It should be: ${file.lines[i]}`;
          if (actual[i].trim() !== file.lines[i]) {
            return `In ${file.name}, line ${i + 1} should be: ${file.lines[i]} (yours is: ${shown(actual[i])})`;
          }
        }
        if (actual.length > file.lines.length) {
          return `${file.name} has an extra line: ${shown(actual[file.lines.length])}. It should have ${file.lines.length} line${file.lines.length === 1 ? "" : "s"}.`;
        }
      }
      return null;
    },
  };
}

/** What a chart exercise expects the program to draw. */
export interface ExpectedChart {
  kind: "bar" | "line";
  title: string;
  xLabel?: string;
  yLabel?: string;
  labels: string[];
  values: number[];
}

/** A case for programs that draw a chart: the program starts with `files` and must draw exactly this one chart. */
export function chartCase(options: { label: string; stdin?: string[]; files?: ProgramFile[]; chart: ExpectedChart }): CheckCase {
  const { label, files, chart } = options;
  const word = chart.kind === "bar" ? "bar_chart" : "line_chart";
  const other = chart.kind === "bar" ? "line_chart" : "bar_chart";
  return {
    label,
    stdin: options.stdin ?? [],
    files,
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      const drawn = run.charts ?? [];
      if (drawn.length === 0) {
        return `Your program did not draw a chart. Write import charts, then call charts.${word}(...) with your labels, your values and a title.`;
      }
      if (drawn.length > 1) return `Your program drew ${drawn.length} charts. This exercise needs just one.`;
      const got = drawn[0];
      if (got.kind !== chart.kind) return `This chart should be drawn with ${word}, but your program used ${other}.`;
      if (got.title !== chart.title) {
        if (got.title.toLowerCase() === chart.title.toLowerCase()) return `Nearly! Check the capital letters in the chart title. It should be: ${chart.title}`;
        return `The chart title should be: ${chart.title} (yours is: ${shown(got.title) || "empty"})`;
      }
      if (chart.xLabel !== undefined && got.xLabel !== chart.xLabel) {
        return `The label under the chart (x_label) should be: ${chart.xLabel} (yours is: ${shown(got.xLabel) || "empty"})`;
      }
      if (chart.yLabel !== undefined && got.yLabel !== chart.yLabel) {
        return `The label beside the chart (y_label) should be: ${chart.yLabel} (yours is: ${shown(got.yLabel) || "empty"})`;
      }
      if (got.values.length !== chart.values.length) {
        return `The chart should show ${chart.values.length} ${chart.kind === "bar" ? "bars" : "points"}, but yours shows ${got.values.length}.`;
      }
      for (let i = 0; i < chart.labels.length; i += 1) {
        if (got.labels[i] !== chart.labels[i]) return `Label ${i + 1} should be: ${chart.labels[i]} (yours is: ${shown(got.labels[i])})`;
      }
      for (let i = 0; i < chart.values.length; i += 1) {
        if (Math.abs(got.values[i] - chart.values[i]) > 1e-6) return `Value ${i + 1} should be: ${chart.values[i]} (yours is: ${got.values[i]})`;
      }
      return null;
    },
  };
}
