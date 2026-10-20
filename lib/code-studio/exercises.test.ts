// Run with:  npx tsx lib/code-studio/exercises.test.ts
//
// Runs every exercise's checks against real Python (Pyodide, in Node) using the
// same setup code as the browser worker (public/code-studio/python-worker.js).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadPyodide } from "pyodide";

import { runChecks, type CheckRunner } from "./check-runner";
import { EXERCISES, getExercise, type RunCapture } from "./exercises";
import { MAX_CODE_CHARS, parseProjectData, toProjectData } from "./project";
import { parseProgress, progressFromSnapshot, progressSnapshot, markCompleted, saveDraft, PROGRESS_KEY, type KeyValue } from "./progress";

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed += 1;
  console.log("ok  ", name);
}

const worker = readFileSync(join(process.cwd(), "public/code-studio/python-worker.js"), "utf8");
const setup = /const PYTHON_SETUP = String\.raw`([\s\S]*?)`;/.exec(worker)?.[1];
assert.ok(setup, "could not find PYTHON_SETUP in the worker");

async function makeRunner(): Promise<CheckRunner> {
  const pyodide = await loadPyodide();
  const scope = pyodide.toPy({});
  pyodide.runPython(setup as string, { globals: scope });
  const runPython = scope.get("run");
  let lines: string[] = [];
  let out = "";
  let err = "";
  pyodide.setStdout({ write: (b: Uint8Array) => ((out += new TextDecoder().decode(b)), b.length) });
  pyodide.setStderr({ write: (b: Uint8Array) => ((err += new TextDecoder().decode(b)), b.length) });
  pyodide.setStdin({ stdin: () => (lines.length ? lines.shift()! : null), isatty: false });
  return {
    async run(code, stdin) {
      lines = [...stdin];
      out = "";
      err = "";
      let ok = false;
      try {
        ok = runPython(code) === true;
      } catch {
        ok = false;
      }
      pyodide.runPython("import sys\nsys.stdout.flush()\nsys.stderr.flush()");
      const capture: RunCapture & { ms: number } = { outcome: ok ? "ok" : "error", stdout: out, stderr: err, ms: 0 };
      return capture;
    },
  };
}

const SOLUTIONS: Record<string, string> = {
  "hello-world": 'print("Hello, World!")\n',
  "variables-input": `name = input("What is your name? ")
age = int(input("How old are you? "))
print(f"Hello, {name}! Next year you will be {age + 1}.")
`,
  "times-table": `n = int(input("Which times table? "))
for i in range(1, 13):
    print(f"{n} x {i} = {n * i}")
`,
  "odd-even": `number = int(input("Enter a whole number: "))
if number % 2 == 0:
    print("Even")
else:
    print("Odd")
`,
  "temperature-function": `def celsius_to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32

print(celsius_to_fahrenheit(100))
`,
};

async function main() {
  const runner = await makeRunner();

  await test("there are exactly five exercises, each with a starter, hints and checks", () => {
    assert.equal(EXERCISES.length, 5);
    const ids = new Set(EXERCISES.map((e) => e.id));
    assert.equal(ids.size, 5);
    for (const e of EXERCISES) {
      assert.ok(e.starter.length > 0 && e.hints.length >= 2 && e.cases.length >= 1 && e.instructions.length >= 1, e.id);
      assert.ok(SOLUTIONS[e.id], `solution for ${e.id}`);
    }
  });

  for (const exercise of EXERCISES) {
    await test(`${exercise.id}: the model solution passes every check`, async () => {
      const report = await runChecks(runner, exercise, SOLUTIONS[exercise.id]);
      assert.deepEqual(report.cases.filter((c) => !c.passed), [], JSON.stringify(report.cases));
      assert.equal(report.passed, true);
    });

    await test(`${exercise.id}: the untouched starter does not pass`, async () => {
      const report = await runChecks(runner, exercise, exercise.starter);
      assert.equal(report.passed, false);
      assert.ok(report.cases.some((c) => c.message && c.message.length > 10));
    });
  }

  async function failsWith(id: string, code: string, fragment: RegExp) {
    const report = await runChecks(runner, getExercise(id)!, code);
    assert.equal(report.passed, false, `${id} should fail`);
    const messages = report.cases.map((c) => c.message ?? "").join(" | ");
    assert.match(messages, fragment);
  }

  await test("hello-world: wrong capitals, extra text and nothing printed are told apart", async () => {
    await failsWith("hello-world", 'print("hello, world!")', /capital/i);
    await failsWith("hello-world", 'print("Hello World")', /exactly/i);
    await failsWith("hello-world", "x = 1", /did not print anything/i);
    await failsWith("hello-world", 'print("Hello, World!"', /error/i);
  });

  await test("variables-input: a wrong sum is explained, a crash is reported", async () => {
    await failsWith("variables-input", 'name = input()\nage = int(input())\nprint(f"Hello, {name}! Next year you will be {age}.")', /age is not right/);
    await failsWith("variables-input", 'name = input()\nage = input()\nprint("Hello, " + name + "! Next year you will be " + age + 1)', /error/i);
  });

  await test("times-table: a table that stops at 10, or has the wrong format, fails", async () => {
    await failsWith("times-table", 'n = int(input())\nfor i in range(1, 11):\n    print(f"{n} x {i} = {n*i}")', /7 x 11 = 77/);
    await failsWith("times-table", 'n = int(input())\nfor i in range(1, 13):\n    print(f"{n} * {i} = {n*i}")', /missing/);
  });

  await test("times-table: 7 x 1 = 7 is not mistaken for 7 x 1 = 70", async () => {
    await failsWith("times-table", 'n = int(input())\nfor i in range(1, 13):\n    print(f"{n} x {i} = {n*i}0")', /missing/);
  });

  await test("odd-even: swapped answers and a missing branch fail", async () => {
    await failsWith("odd-even", 'n = int(input())\nprint("Odd" if n % 2 == 0 else "Even")', /should print/);
    await failsWith("odd-even", 'n = int(input())\nif n % 2 == 0:\n    print("Even")', /should print Odd/);
  });

  await test("odd-even: negative numbers and zero are handled and prompts do not confuse the check", async () => {
    const code = 'n = int(input("Is this odd or even? "))\nprint("Even" if n % 2 == 0 else "Odd")';
    const report = await runChecks(runner, getExercise("odd-even")!, code);
    assert.equal(report.passed, true, JSON.stringify(report.cases));
  });

  await test("temperature-function: printing instead of returning, and a wrong name, are explained", async () => {
    await failsWith("temperature-function", "def celsius_to_fahrenheit(c):\n    print(c * 9 / 5 + 32)", /return/);
    await failsWith("temperature-function", "def c_to_f(c):\n    return c * 9 / 5 + 32", /could not find a function called celsius_to_fahrenheit/);
    await failsWith("temperature-function", "def celsius_to_fahrenheit(c):\n    return c * 2 + 30", /should give/);
  });

  await test("temperature-function: extra printing in the learner's program does not matter", async () => {
    const code = SOLUTIONS["temperature-function"] + 'print("done")\n';
    const report = await runChecks(runner, getExercise("temperature-function")!, code);
    assert.equal(report.passed, true);
  });

  await test("a check ends early when the program cannot finish", async () => {
    const fake: CheckRunner = { run: async () => ({ outcome: "timeout", stdout: "", stderr: "", ms: 1 }) };
    const report = await runChecks(fake, getExercise("odd-even")!, "while True: pass");
    assert.equal(report.incomplete, true);
    assert.equal(report.cases.length, 1);
    assert.match(report.cases[0].message ?? "", /too long/);
  });

  await test("saved Python projects: valid data round-trips and bad data is rejected", () => {
    const data = toProjectData("odd-even", "print(1)");
    assert.deepEqual(parseProjectData(data), data);
    assert.deepEqual(parseProjectData({ version: 1, exerciseId: "nope", code: "x" }), { version: 1, exerciseId: null, code: "x" });
    assert.equal(parseProjectData(null), null);
    assert.equal(parseProjectData({ version: 2, code: "x" }), null);
    assert.equal(parseProjectData({ version: 1, code: 5 }), null);
    assert.equal(parseProjectData({ version: 1, exerciseId: null, code: "x".repeat(MAX_CODE_CHARS + 1) }), null);
  });

  await test("progress: completions and drafts are kept, junk is ignored", () => {
    const data: Record<string, string> = {};
    const kv: KeyValue = { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
    markCompleted("hello-world", kv);
    markCompleted("hello-world", kv);
    saveDraft("odd-even", "print(2)", kv);
    saveDraft("odd-even", "x".repeat(MAX_CODE_CHARS + 1), kv);
    const progress = progressFromSnapshot(progressSnapshot(kv));
    assert.deepEqual(progress.completed, ["hello-world"]);
    assert.deepEqual(progress.drafts, { "odd-even": "print(2)" });
    assert.deepEqual(parseProgress("{not json"), { completed: [], drafts: {} });
    assert.deepEqual(parseProgress(JSON.stringify({ completed: [1, "a"], drafts: { a: 1, b: "ok" } })), { completed: ["a"], drafts: { b: "ok" } });
    assert.ok(data[PROGRESS_KEY]);
    assert.equal(progressSnapshot(null), "");
  });

  console.log(`\n${passed} tests passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
