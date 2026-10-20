// Run with:  npx tsx lib/code-studio/exercises.test.ts
//
// Runs every exercise's checks against real Python (Pyodide, in Node) using the
// same setup code as the browser worker (public/coding-robotics/code-studio/python-worker.js).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadPyodide } from "pyodide";

import { runChecks, type CheckRunner } from "./check-runner";
import { EXERCISES, getExercise, type RunCapture } from "./exercises";
import { cleanScript, cleanTrace } from "./microbit";
import { MAX_CODE_CHARS, parseProjectData, toProjectData } from "./project";
import { parseProgress, progressFromSnapshot, progressSnapshot, markCompleted, saveDraft, PROGRESS_KEY, type KeyValue } from "./progress";

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed += 1;
  console.log("ok  ", name);
}

const worker = readFileSync(join(process.cwd(), "public/coding-robotics/code-studio/python-worker.js"), "utf8");
const setup = /const PYTHON_SETUP = String\.raw`([\s\S]*?)`;/.exec(worker)?.[1];
assert.ok(setup, "could not find PYTHON_SETUP in the worker");

async function makeRunner(): Promise<CheckRunner> {
  const pyodide = await loadPyodide();
  const scope = pyodide.toPy({});
  pyodide.runPython(setup as string, { globals: scope });
  const runPython = scope.get("run");
  scope.get("install_microbit")(readFileSync(join(process.cwd(), "public/coding-robotics/code-studio/microbit.py"), "utf8"));
  let lines: string[] = [];
  let out = "";
  let err = "";
  // Like the real worker, a program that prints more than the limit is stopped.
  let limitHit = false;
  pyodide.setStdout({
    write: (b: Uint8Array) => {
      out += new TextDecoder().decode(b);
      if (out.length > 100_000) {
        limitHit = true;
        throw new Error("OutputLimit");
      }
      return b.length;
    },
  });
  pyodide.setStderr({ write: (b: Uint8Array) => ((err += new TextDecoder().decode(b)), b.length) });
  pyodide.setStdin({ stdin: () => (lines.length ? lines.shift()! : null), isatty: false });
  return {
    async run(code, stdin, options) {
      lines = [...stdin];
      out = "";
      err = "";
      limitHit = false;
      let ok = false;
      let files: { name: string; text: string }[] = [];
      let charts: RunCapture["charts"] = [];
      let device: RunCapture["device"];
      try {
        const reply = JSON.parse(
          runPython(code, JSON.stringify(options.files ?? []), options.board ? "script" : "", options.board ? JSON.stringify(cleanScript(options.board)) : ""),
        );
        ok = reply.ok === true;
        files = reply.files;
        charts = reply.charts;
        device = cleanTrace(reply.device);
      } catch {
        ok = false;
      }
      try {
        pyodide.runPython("import sys\nsys.stdout.flush()\nsys.stderr.flush()");
      } catch {
        // a flush after the output limit was hit is discarded, as in the worker
      }
      const capture: RunCapture & { ms: number } = { outcome: limitHit ? "output-limit" : ok ? "ok" : "error", stdout: out, stderr: err, ms: 0, files, charts, device };
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
  "y7-plan-then-type": 'print("Switch on")\nprint("Check the battery")\nprint("Drive forward")\nprint("Stop")\n',
  "y7-fix-errors": 'print("Robot ready")\nprint("Battery full")\nprint("Moving off")\n',
  "y7-market-counter": `oranges = int(input())
mangoes = int(input())
total = oranges + mangoes
print(f"You sold {total} fruits.")
`,
  "y7-robot-speed": `name = input()
speed = int(input())
print(f"{name} moves {speed * 10} cm in 10 seconds.")
`,
  "y7-for-steps": `steps = int(input())
for i in range(1, steps + 1):
    print(f"Step {i}")
print("Done!")
`,
  "y7-countdown": `count = int(input())
while count > 0:
    print(count)
    count = count - 1
print("Lift off!")
`,
  "y7-distance-decision": `distance = int(input())
if distance < 10:
    print("Stop")
elif distance < 30:
    print("Slow down")
else:
    print("Go")
`,
  "y7-battery-light": `battery = int(input())
if battery >= 60:
    print("Green")
elif battery >= 20:
    print("Amber")
else:
    print("Red")
`,
  "y7-robot-functions": `def forward(steps):
    print(f"Moving forward {steps} steps")

def turn_left():
    print("Turning left")
`,
  "y8-naira-change": "def change(price, paid):\n    return paid - price\n",
  "y8-light-percent": "def percent(reading):\n    return round(reading / 1023 * 100)\n",
  "y8-night-light": "def is_dark(reading, threshold):\n    return reading < threshold\n",
  "y8-list-stats": `temps = [int(x) for x in input().split(",")]
total = 0
highest = temps[0]
lowest = temps[0]
for t in temps:
    total = total + t
    if t > highest:
        highest = t
    if t < lowest:
        lowest = t
average = total / len(temps)
print(f"Total: {total}")
print(f"Highest: {highest}")
print(f"Lowest: {lowest}")
print(f"Average: {average:.1f}")
`,
  "y8-password-length": `password = input()
if len(password) >= 12:
    print("Good length")
else:
    print("Too short")
`,
  "y8-accuracy": `results = input().split(",")
correct = results.count("right")
print(f"Accuracy: {correct / len(results) * 100:.0f}%")
`,
  "y8-smart-bin": `def bin_action(hand_near, bin_full):
    if hand_near:
        if bin_full:
            return "Flash red"
        else:
            return "Open lid"
    else:
        return "Stay closed"
`,
  "y8-keep-distance": `def car_action(distance):
    if distance > 30:
        return "forward"
    elif distance < 20:
        return "backward"
    else:
        return "stop"
`,
  "y9-line-decision": `def line_action(left_black, right_black):
    if left_black and right_black:
        return "forward"
    elif left_black and not right_black:
        return "turn left"
    elif right_black and not left_black:
        return "turn right"
    else:
        return "stop"
`,
  "y9-compare-versions": `a = [float(x) for x in input().split(",")]
b = [float(x) for x in input().split(",")]
avg_a = sum(a) / len(a)
avg_b = sum(b) / len(b)
print(f"Average A: {avg_a:.1f}")
print(f"Average B: {avg_b:.1f}")
if avg_a < avg_b:
    print("Better: A")
elif avg_b < avg_a:
    print("Better: B")
else:
    print("Better: tie")
`,
  "y9-truth-table": `print("A B AND OR")
for a in [0, 1]:
    for b in [0, 1]:
        print(a, b, a and b, a or b)
`,
  "y9-stop-guard": 'def can_go(command, on_stop_line):\n    return command == "F" and not on_stop_line\n',
  "y9-confidence-rule": `def sort_leaf(label, confidence):
    if confidence < 70:
        return "ask a person"
    if label == "healthy":
        return "left basket"
    return "right basket"
`,
  "y9-fairness-check": `pairs = [item.split(":") for item in input().split(",")]
totals = {}
rights = {}
for group, result in pairs:
    totals[group] = totals.get(group, 0) + 1
    if result == "right":
        rights[group] = rights.get(group, 0) + 1
for group in sorted(totals):
    print(f"{group}: {rights.get(group, 0) / totals[group] * 100:.0f}%")
`,
  "y9-debug-average": `a = int(input())
b = int(input())
c = int(input())
average = (a + b + c) / 3
print("Average:", average)
`,
  "y8-save-readings": `count = int(input())
readings = []
for i in range(count):
    readings.append(int(input()))
with open("climate.txt", "w") as file:
    for reading in readings:
        file.write(str(reading) + "\\n")
word = "reading" if count == 1 else "readings"
print(f"Saved {count} {word}")
print(f"Warmest: {max(readings)}")
`,
  "y9-log-it": `import csv
count = int(input())
correct = 0
with open("results.csv", "a", newline="") as file:
    writer = csv.writer(file)
    for number in range(1, count + 1):
        result = input()
        if result == "right":
            correct += 1
        writer.writerow([number, result])
print(f"Saved {count} results")
print(f"Correct: {correct}")
`,
  "y9-read-test-log": `with open("test_log.txt") as file:
    lines = file.read().splitlines()
seconds = 0
errors = 0
runs = 0
for line in lines[1:]:
    if line.strip() == "":
        continue
    parts = line.split(",")
    seconds += int(parts[1])
    errors += int(parts[2])
    runs += 1
print(f"Average time: {seconds / runs:.1f} seconds")
print(f"Total errors: {errors}")
`,
  "y8-chart-readings": `import charts
with open("climate.txt") as file:
    lines = file.read().split()
labels = []
values = []
for number, line in enumerate(lines, 1):
    labels.append(f"Day {number}")
    values.append(int(line))
charts.bar_chart(labels, values, "Daily temperatures", "Day", "Degrees")
`,
  "y9-chart-test-log": `import charts
with open("test_log.txt") as file:
    lines = file.read().splitlines()
runs = []
seconds = []
for line in lines[1:]:
    if line.strip() == "":
        continue
    parts = line.split(",")
    runs.append(parts[0])
    seconds.append(int(parts[1]))
charts.line_chart(runs, seconds, "Test times", "Run", "Seconds")
`,
  "y9-test-log": `count = int(input())
lines = [input() for _ in range(count)]
seconds = 0
errors = 0
for line in lines:
    run, s, e = line.split(",")
    seconds += int(s)
    errors += int(e)
print(f"Average time: {seconds / count:.1f} seconds")
print(f"Total errors: {errors}")
`,
  "mb-scroll": `from microbit import *
display.scroll("RHINO")
`,
  "mb-forever": `from microbit import *
count = 0
while count < 9:
    sleep(1000)
    count = count + 1
    display.show(count)
`,
  "mb-night-light": `from microbit import *
while True:
    level = display.read_light_level()
    if level < 50:
        display.show(Image('99999:99999:99999:99999:99999'))
    else:
        display.clear()
    sleep(100)
`,
  "mb-radio-send": `from microbit import *
import radio
radio.on()
while True:
    if button_a.was_pressed():
        radio.send("hello")
    if button_b.was_pressed():
        radio.send("bye")
    sleep(50)
`,
  "mb-radio-receive": `from microbit import *
import radio
radio.on()
while True:
    message = radio.receive()
    if message == "happy":
        display.show(Image.HAPPY)
    elif message == "sad":
        display.show(Image.SAD)
    sleep(50)
`,
  "mb-radio-group": `from microbit import *
import radio
radio.on()
radio.config(group=5)
while True:
    message = radio.receive()
    if message is not None:
        display.show(Image.HEART)
    sleep(50)
`,
  "mb-hello": `from microbit import *
display.show(Image.HEART)
`,
  "mb-buttons": `from microbit import *
while True:
    if button_a.is_pressed():
        display.show(Image.HAPPY)
    if button_b.is_pressed():
        display.show(Image.SAD)
    sleep(50)
`,
  "mb-counter": `from microbit import *
count = 0
display.show(count)
while True:
    if button_a.was_pressed():
        count = count + 1
        display.show(count)
    if button_b.was_pressed():
        count = 0
        display.show(count)
    sleep(50)
`,
  "mb-light": `from microbit import *
while True:
    level = display.read_light_level()
    if level < 60:
        display.show(Image.ASLEEP)
    else:
        display.show(Image.HAPPY)
    sleep(100)
`,
  "mb-hot": `from microbit import *
while True:
    heat = temperature()
    if heat >= 30:
        display.show(Image.SURPRISED)
    else:
        display.show(Image.HAPPY)
    sleep(200)
`,
  "mb-music": `from microbit import *
import music
while True:
    if button_a.was_pressed():
        music.play(['c4:4', 'd4:4', 'e4:4'])
    sleep(50)
`,
  "mb-dice": `from microbit import *
import random
display.show("?")
while True:
    if accelerometer.was_gesture('shake'):
        display.show(random.randint(1, 6))
    sleep(100)
`,
  "y7-distance-travelled": `def distance_travelled(speed, seconds):
    return speed * seconds

print(distance_travelled(5, 10))
`,
};

function exerciseStarter(id: string): string {
  return getExercise(id)!.starter;
}

async function main() {
  const runner = await makeRunner();

  await test("there are five starters and ten, ten and eleven exercises for Years 7, 8 and 9, each with a starter, hints and checks", () => {
    assert.equal(EXERCISES.length, 49);
    assert.equal(EXERCISES.filter((e) => e.group === "micro:bit").length, 13);
    assert.equal(EXERCISES.filter((e) => e.group === "Starter").length, 5);
    assert.equal(EXERCISES.filter((e) => e.group === "Year 7").length, 10);
    assert.equal(EXERCISES.filter((e) => e.group === "Year 8").length, 10);
    assert.equal(EXERCISES.filter((e) => e.group === "Year 9").length, 11);
    assert.ok(EXERCISES.filter((e) => e.group.startsWith("Year")).every((e) => e.lesson && /^Term [123], Week \d+$/.test(e.lesson)));
    assert.ok(EXERCISES.filter((e) => e.group === "micro:bit").every((e) => e.lesson && /^Year [4-8], Term [123], Week \d+$/.test(e.lesson)));
    const ids = new Set(EXERCISES.map((e) => e.id));
    assert.equal(ids.size, 49);
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

  await test("year 7: common wrong answers are explained, not just failed", async () => {
    await failsWith("y7-plan-then-type", 'print("Switch on")\nprint("Drive forward")\nprint("Check the battery")\nprint("Stop")', /Line 2 should be/);
    await failsWith("y7-plan-then-type", 'print("switch on")\nprint("Check the battery")\nprint("Drive forward")\nprint("Stop")', /capital letters/);
    await failsWith("y7-fix-errors", 'print("Robot ready"\nprint("Battery full")\nprint("Moving off")', /error/i);
    await failsWith("y7-market-counter", 'a = int(input())\nb = int(input())\nprint(f"You sold {a} fruits.")', /Expected the program to print/);
    await failsWith("y7-robot-speed", 'name = input()\nspeed = input()\nprint(f"{name} moves {speed * 10}")', /repeated ten times/);
    await failsWith("y7-for-steps", 'n = int(input())\nfor i in range(n):\n    print(f"Step {i}")\nprint("Done!")', /Line 1 should be: Step 1/);
    await failsWith("y7-for-steps", 'n = int(input())\nfor i in range(1, n + 1):\n    print(f"Step {i}")', /Line \d+ is missing/);
    await failsWith("y7-countdown", "count = int(input())\nwhile count > 0:\n    print(count)\nprint(\"Lift off!\")", /too long|ran for|printed far too much/i);
    await failsWith("y7-countdown", 'count = int(input())\nwhile count > 1:\n    print(count)\n    count = count - 1\nprint("Lift off!")', /missing|should be/);
    await failsWith("y7-distance-decision", 'd = int(input())\nif d <= 10:\n    print("Stop")\nelif d < 30:\n    print("Slow down")\nelse:\n    print("Go")', /Stop|Slow down/);
    await failsWith("y7-distance-decision", 'd = int(input())\nprint("Go")', /should print Stop/);
    await failsWith("y7-battery-light", 'b = int(input())\nif b > 60:\n    print("Green")\nelif b >= 20:\n    print("Amber")\nelse:\n    print("Red")', /Green/);
    await failsWith("y7-robot-functions", "def forward(steps):\n    print(steps)\n", /should be: Moving forward/);
    await failsWith("y7-robot-functions", "def forward(steps):\n    print(f\"Moving forward {steps} steps\")\n", /turn_left/);
    await failsWith("y7-robot-functions", "def forward():\n    print(\"Moving forward\")\ndef turn_left():\n    print(\"Turning left\")\n", /wrong number/);
    await failsWith("y7-distance-travelled", "def distance_travelled(speed, seconds):\n    print(speed * seconds)\n", /gave back nothing/);
    await failsWith("y7-distance-travelled", "def distance_travelled(speed, seconds):\n    return speed + seconds\n", /should give/);
  });

  await test("year 8: common wrong answers are explained", async () => {
    await failsWith("y8-naira-change", "def change(price, paid):\n    return price - paid\n", /should give 150/);
    await failsWith("y8-naira-change", "def change(price, paid):\n    print(paid - price)\n", /gave back nothing/);
    await failsWith("y8-light-percent", "def percent(reading):\n    return int(reading / 1023 * 100)\n", /percent\(767\) should give 75/);
    await failsWith("y8-light-percent", "def percent(reading):\n    return reading / 1023\n", /should give/);
    await failsWith("y8-night-light", "def is_dark(reading, threshold):\n    return reading <= threshold\n", /is_dark\(300, 300\) should give False/);
    await failsWith("y8-night-light", "def is_dark(reading):\n    return reading < 300\n", /wrong number of values/);
    await failsWith("y8-list-stats", 'temps = [int(x) for x in input().split(",")]\nprint(f"Total: {sum(temps)}")', /Line 2 is missing/);
    await failsWith("y8-list-stats", 'temps = [int(x) for x in input().split(",")]\nprint(f"Total: {sum(temps)}")\nprint(f"Highest: {max(temps)}")\nprint(f"Lowest: {min(temps)}")\nprint(f"Average: {sum(temps) // len(temps)}")', /Line 4 should be: Average: 30\.3/);
    await failsWith("y8-password-length", 'p = input()\nif len(p) > 12:\n    print("Good length")\nelse:\n    print("Too short")', /12 characters|Good length/);
    await failsWith("y8-accuracy", 'r = input().split(",")\nc = r.count("right")\nprint(f"Accuracy: {c / len(r) * 100}%")', /Accuracy: 75%|Accuracy: 100%|Accuracy: 33%|Accuracy: 67%/);
    await failsWith("y8-smart-bin", 'def bin_action(hand_near, bin_full):\n    if bin_full:\n        return "Flash red"\n    if hand_near:\n        return "Open lid"\n    return "Stay closed"\n', /bin_action\(False, True\) should give 'Stay closed'/);
    await failsWith("y8-keep-distance", 'def car_action(distance):\n    if distance >= 30:\n        return "forward"\n    elif distance < 20:\n        return "backward"\n    return "stop"\n', /car_action\(30\) should give 'stop'/);
  });

  await test("year 9: common wrong answers are explained", async () => {
    await failsWith("y9-line-decision", 'def line_action(left_black, right_black):\n    if left_black:\n        return "turn left"\n    if right_black:\n        return "turn right"\n    return "stop"\n', /line_action\(True, True\) should give 'forward'/);
    await failsWith("y9-compare-versions", 'a = [float(x) for x in input().split(",")]\nb = [float(x) for x in input().split(",")]\nprint(f"Average A: {sum(a):.1f}")\nprint(f"Average B: {sum(b):.1f}")\nprint("Better: A")', /Line 1 should be: Average A: 23\.0/);
    await failsWith("y9-truth-table", 'print("A B AND OR")\nfor a in [0, 1]:\n    for b in [0, 1]:\n        print(a, b, a and b, a and b)', /Line 3 should be: 0 1 0 1/);
    await failsWith("y9-truth-table", 'print("A B AND OR")', /Line 2 is missing/);
    await failsWith("y9-stop-guard", 'def can_go(command, on_stop_line):\n    return command == "F"\n', /can_go\(.F., True\) should give False/);
    await failsWith("y9-confidence-rule", 'def sort_leaf(label, confidence):\n    if confidence <= 70:\n        return "ask a person"\n    return "left basket" if label == "healthy" else "right basket"\n', /sort_leaf\('healthy', 70\) should give 'left basket'/);
    await failsWith("y9-fairness-check", 'pairs = [item.split(":") for item in input().split(",")]\nprint("dim: 50%")', /should be:|missing/);
    await failsWith("y9-debug-average", exerciseStarter("y9-debug-average"), /Line 1 should be: Average: 20\.0/);
    await failsWith("y9-test-log", 'count = int(input())\nlines = [input() for _ in range(count)]\nprint("Average time: 0.0 seconds")\nprint("Total errors: 0")', /should be: Average time/);
  });


  await test("files: common wrong answers are explained", async () => {
    const logHeader = 'count = int(input())\ncorrect = 0\n';
    // Write mode wipes the old line: the second case must catch it.
    await failsWith("y9-log-it", logHeader + 'with open("results.csv", "w") as f:\n    for n in range(1, count + 1):\n        r = input()\n        correct += r == "right"\n        f.write(f"{n},{r}\\n")\nprint(f"Saved {count} results")\nprint(f"Correct: {correct}")\n', /line 1 should be: 9,right|missing line 1/);
    // Never creates the file.
    await failsWith("y9-log-it", 'count = int(input())\nfor n in range(count):\n    input()\nprint(f"Saved {count} results")\nprint("Correct: 0")', /Correct: |did not create results\.csv/);
    await failsWith("y9-log-it", logHeader + 'with open("results.csv", "a") as f:\n    for n in range(1, count + 1):\n        r = input()\n        correct += r == "right"\n        f.write(f"{n},{r}\\n")\nprint(f"Saved {count} results")\nprint(f"Correct: {correct + 1}")\n', /Correct:/);
    await failsWith("y9-log-it", logHeader + 'with open("results.csv", "a") as f:\n    for n in range(count):\n        r = input()\n        correct += r == "right"\n        f.write(f"{n},{r}\\n")\nprint(f"Saved {count} results")\nprint(f"Correct: {correct}")\n', /line 1 should be: 1,/);
    await failsWith("y9-read-test-log", 'open("test_log.txt").read()', /did not print anything/);
    await failsWith("y9-read-test-log", 'lines = open("test_log.txt").read().splitlines()\nprint("Average time: 0.0 seconds")\nprint("Total errors: 0")', /should be: Average time/);
    await failsWith("y9-read-test-log", 'open("other.csv")', /FileNotFoundError|error/i);
    await failsWith("y8-save-readings", 'n = int(input())\nr = [int(input()) for _ in range(n)]\nprint(f"Saved {n} readings")\nprint(f"Warmest: {max(r)}")', /did not create climate\.txt|Saved 1 reading/);
    // Append mode keeps the old lines, but the exercise asks for a fresh file.
    await failsWith("y8-save-readings", 'n = int(input())\nr = [int(input()) for _ in range(n)]\nwith open("climate.txt", "a") as f:\n    for x in r:\n        f.write(str(x) + "\\n")\nprint(f"Saved {n} reading" + ("" if n == 1 else "s"))\nprint(f"Warmest: {max(r)}")', /extra line|should be: 25/);
  });

  await test("files: a check starts from its own files and never needs the learner's", async () => {
    const report = await runChecks(runner, getExercise("y9-read-test-log")!, SOLUTIONS["y9-read-test-log"]);
    assert.equal(report.passed, true);
    // The same program with no test_log.txt of its own fails: files do not leak between checks.
    const bare = await runner.run('import os\nprint(os.listdir())', [], { scripted: true, quiet: true });
    assert.equal(bare.stdout.trim(), "[]");
  });


  await test("charts: common wrong answers are explained", async () => {
    const readLog = 'import charts\nlines = open("test_log.txt").read().splitlines()[1:]\nruns = [l.split(",")[0] for l in lines if l.strip()]\nsecs = [int(l.split(",")[1]) for l in lines if l.strip()]\n';
    await failsWith("y9-chart-test-log", readLog + "print(secs)", /did not draw a chart/);
    await failsWith("y9-chart-test-log", readLog + 'charts.bar_chart(runs, secs, "Test times", "Run", "Seconds")', /line_chart/);
    await failsWith("y9-chart-test-log", readLog + 'charts.line_chart(runs, secs, "test times", "Run", "Seconds")', /capital letters in the chart title/);
    await failsWith("y9-chart-test-log", readLog + 'charts.line_chart(runs, secs, "Test times")', /x_label\) should be: Run/);
    await failsWith("y9-chart-test-log", readLog + 'charts.line_chart(runs, secs, "Test times", "Run", "Errors")', /y_label\) should be: Seconds/);
    await failsWith("y9-chart-test-log", readLog + 'charts.line_chart(runs[1:], secs[1:], "Test times", "Run", "Seconds")', /should show \d points/);
    await failsWith("y9-chart-test-log", readLog + 'charts.line_chart(runs, [s + 1 for s in secs], "Test times", "Run", "Seconds")', /Value 1 should be: 22/);
    await failsWith("y9-chart-test-log", readLog + 'charts.line_chart(runs, secs[:-1], "Test times", "Run", "Seconds")', /same length/);
    await failsWith("y9-chart-test-log", readLog + 'charts.line_chart(runs, secs, "Test times", "Run", "Seconds")\ncharts.line_chart(runs, secs, "Test times", "Run", "Seconds")', /drew 2 charts/);
    await failsWith("y8-chart-readings", 'import charts\nv = [int(x) for x in open("climate.txt").read().split()]\ncharts.bar_chart(v, v, "Daily temperatures", "Day", "Degrees")', /Label 1 should be: Day 1/);
    await failsWith("y8-chart-readings", 'import charts\nv = [int(x) for x in open("climate.txt").read().split()]\ncharts.bar_chart([f"Day {i+1}" for i in range(len(v))], v, "Temperatures", "Day", "Degrees")', /title should be: Daily temperatures/);
  });

  await test("micro:bit: common wrong answers are explained", async () => {
    await failsWith("mb-hello", "from microbit import *\ndisplay.show(Image.SAD)\n", /should show a heart, but they show a sad face/);
    await failsWith("mb-hello", "from microbit import *\nprint('hi')\n", /Nothing was shown/);
    await failsWith("mb-hello", "print('no import')\n", /micro:bit board did not run|Your program stopped with an error|Nothing was shown/);
    await failsWith("mb-buttons", SOLUTIONS["mb-buttons"].replace("Image.HAPPY", "Image.SAD"), /After button A is pressed/);
    await failsWith("mb-counter", SOLUTIONS["mb-counter"].replace("count + 1", "count + 2"), /After one press of A/);
    await failsWith("mb-counter", SOLUTIONS["mb-counter"].replace("button_b.was_pressed", "button_a.is_pressed"), /After|At the start|should show/);
    await failsWith("mb-light", SOLUTIONS["mb-light"].replace("< 60", "<= 60"), /light level of 60/);
    await failsWith("mb-hot", SOLUTIONS["mb-hot"].replace(">= 30", "> 30"), /exactly 30/);
    await failsWith("mb-music", SOLUTIONS["mb-music"].replace("'d4:4', ", ""), /three notes/);
    await failsWith("mb-music", "from microbit import *\nimport music\nmusic.play(['c4:4', 'd4:4', 'e4:4'])\n", /before button A|only play when A/);
    await failsWith("mb-scroll", 'from microbit import *\ndisplay.scroll("R")\n', /too short/);
    await failsWith("mb-forever", SOLUTIONS["mb-forever"].replace("1000", "500"), /After one second|After three seconds/);
    await failsWith("mb-night-light", SOLUTIONS["mb-night-light"].replace("< 50", "<= 50"), /light level of 50/);
    await failsWith("mb-radio-send", SOLUTIONS["mb-radio-send"].replace('"bye"', '"hello"'), /After button B, the message should be bye/);
    await failsWith("mb-radio-send", SOLUTIONS["mb-radio-send"].replace("radio.on()\n", ""), /radio is off/);
    await failsWith("mb-radio-receive", SOLUTIONS["mb-radio-receive"].replace('"sad"', '"hello there"'), /After a message it does not know|After the message sad/);
    await failsWith("mb-radio-group", SOLUTIONS["mb-radio-group"].replace("group=5", "group=0"), /other groups/);
    await failsWith("mb-dice", SOLUTIONS["mb-dice"].replace("random.randint(1, 6)", "4"), /same number every time/);
    await failsWith("mb-dice", SOLUTIONS["mb-dice"].replace("random.randint(1, 6)", "random.randint(1, 9)"), /from 1 to 6|same number/);
  });

  console.log(`\n${passed} tests passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
