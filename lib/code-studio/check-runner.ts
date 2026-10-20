// Runs an exercise's checks against a learner's program. The runner is passed
// in (not imported) so this file can be tested without a browser.
import type { CheckCase, Exercise, RunCapture } from "./exercises";
import { runProblem } from "./exercises";
import type { ProgramFile } from "./files";
import type { DeviceScript } from "./microbit";

export interface CheckRunner {
  run(
    code: string,
    stdinLines: string[],
    options: { scripted: true; quiet: true; files?: ProgramFile[]; board?: DeviceScript },
  ): Promise<RunCapture & { ms: number }>;
}

export interface CaseReport {
  label: string;
  passed: boolean;
  /** What to tell the learner when it did not pass. */
  message: string | null;
  /** The answers typed for input(), so the failure can be reproduced. */
  stdin: string[];
}

export interface CheckReport {
  passed: boolean;
  cases: CaseReport[];
  /** Set when the check could not finish (Stop was pressed, the program hung). */
  incomplete: boolean;
}

export async function runChecks(runner: CheckRunner, exercise: Exercise, code: string): Promise<CheckReport> {
  const cases: CaseReport[] = [];
  let incomplete = false;
  for (const testCase of exercise.cases) {
    const report = await runCase(runner, testCase, code);
    cases.push(report.case);
    if (report.stop) {
      incomplete = true;
      break;
    }
  }
  return { passed: !incomplete && cases.every((c) => c.passed), cases, incomplete };
}

async function runCase(runner: CheckRunner, testCase: CheckCase, code: string) {
  const result = await runner.run(code + (testCase.append ?? ""), testCase.stdin, {
    scripted: true,
    quiet: true,
    // A check starts from its own files, so it never reads or changes the learner's.
    files: testCase.files ?? ([] as ProgramFile[]),
    board: testCase.board,
  });
  // A program that hangs or is stopped would hang again on every case: end the check.
  const stop = ["stopped", "timeout", "crashed", "failed-to-start", "output-limit"].includes(result.outcome);
  const message = testCase.evaluate(result);
  return {
    stop,
    case: {
      label: testCase.label,
      passed: message === null,
      message: message ?? (stop ? runProblem(result) : null),
      stdin: testCase.stdin,
    },
  };
}
