// Year 9 exercises. They follow the Python parts of the Year 9 curriculum: the
// Boolean logic and decisions behind Ogbon's robots, comparing solutions by
// testing, the confidence rule for the AI camera, a fairness check with a
// dictionary, debugging, and working with a test log. The Arduino C++ lessons
// themselves are not here; these exercises practise the same thinking in Python.
// Each one is data, like the others.

import { linesCase, returnCase, type CheckCase, type Exercise } from "./exercise-kit";

// ---- Term 1, Week 5: Design the algorithm -----------------------------------

const lineDecision: Exercise = {
  id: "y9-line-decision",
  group: "Year 9",
  lesson: "Term 1, Week 5",
  title: "Line follower decisions",
  summary: "Turn a flowchart into and / not conditions.",
  instructions: [
    "Ogbon's line follower has two sensors. A sensor is True when it sees the black line.",
    "Write a function called line_action(left_black, right_black) that returns:",
    "forward if both sensors see black",
    "turn left if only the left sensor sees black",
    "turn right if only the right sensor sees black",
    "stop if neither sees black",
  ],
  starter: `def line_action(left_black, right_black):
    # return "forward", "turn left", "turn right" or "stop"
    pass

print(line_action(True, True))
`,
  hints: [
    "Combine the two sensors in one condition with and: if left_black and right_black:",
    "For only the left sensor you can use: left_black and not right_black.",
    "Finish with else: return \"stop\".",
  ],
  cases: [
    returnCase("line_action", "left_black, right_black", [true, true], "forward"),
    returnCase("line_action", "left_black, right_black", [true, false], "turn left"),
    returnCase("line_action", "left_black, right_black", [false, true], "turn right"),
    returnCase("line_action", "left_black, right_black", [false, false], "stop"),
  ],
};

// ---- Term 1, Week 6: Which is better? ---------------------------------------

function compareCase(a: number[], b: number[]): CheckCase {
  const avgA = a.reduce((x, y) => x + y, 0) / a.length;
  const avgB = b.reduce((x, y) => x + y, 0) / b.length;
  const better = Math.abs(avgA - avgB) < 1e-9 ? "tie" : avgA < avgB ? "A" : "B";
  return linesCase(`A: ${a.join(", ")} / B: ${b.join(", ")}`, [a.join(","), b.join(",")], [
    `Average A: ${avgA.toFixed(1)}`,
    `Average B: ${avgB.toFixed(1)}`,
    `Better: ${better}`,
  ]);
}

const compareVersions: Exercise = {
  id: "y9-compare-versions",
  group: "Year 9",
  lesson: "Term 1, Week 6",
  title: "Which version is better?",
  summary: "Compare two sets of lap times.",
  instructions: [
    "You timed the robot three times with version A of the code and three times with version B. Lower times are better.",
    "The program turns the typed times into two lists. Print the average of each (one decimal place), then which version is better. For A: 22, 24, 23 and B: 20, 21, 22:",
    "Average A: 23.0",
    "Average B: 21.0",
    "Better: B",
    "If the averages are equal, print Better: tie",
  ],
  starter: `a = [float(x) for x in input("Times for version A, separated by commas: ").split(",")]
b = [float(x) for x in input("Times for version B, separated by commas: ").split(",")]
# Print Average A, Average B and Better: A, B or tie
`,
  hints: [
    "sum(a) / len(a) is the average of a list.",
    'f"Average A: {average_a:.1f}" shows one decimal place.',
    "The version with the smaller average is the better one.",
  ],
  cases: [compareCase([22, 24, 23], [20, 21, 22]), compareCase([10, 12], [15, 17]), compareCase([5, 7], [6, 6])],
};

// ---- Term 2, Week 2: NOT and truth tables -----------------------------------

const truthTable: Exercise = {
  id: "y9-truth-table",
  group: "Year 9",
  lesson: "Term 2, Week 2",
  title: "AND and OR truth table",
  summary: "Print a truth table with two loops.",
  instructions: [
    "A truth table lists every combination of two inputs A and B, with 1 for True and 0 for False.",
    "Print the table for A AND B and A OR B, using loops, in exactly this form:",
    "A B AND OR",
    "0 0 0 0",
    "0 1 0 1",
    "1 0 0 1",
    "1 1 1 1",
  ],
  starter: `print("A B AND OR")
# Use two loops, one for A and one for B, over the values 0 and 1.
# For each pair print: A B (A and B) (A or B)
`,
  hints: [
    "for a in [0, 1]: and, inside it, for b in [0, 1]: gives all four pairs in the right order.",
    "With 0 and 1, a and b and a or b already give 0 or 1.",
    'print(a, b, a and b, a or b) prints the four values separated by spaces.',
  ],
  cases: [linesCase("Prints the table", [], ["A B AND OR", "0 0 0 0", "0 1 0 1", "1 0 0 1", "1 1 1 1"])],
};

const stopGuard: Exercise = {
  id: "y9-stop-guard",
  group: "Year 9",
  lesson: "Term 2, Week 2",
  title: "The stop-line guard",
  summary: "Use not to guard a command.",
  instructions: [
    "The robot receives typed commands: F (forward), L, R and S. Forward must only run when the robot is NOT on the stop line.",
    "Write a function called can_go(command, on_stop_line) that returns True only when the command is F and the robot is not on the stop line. In every other case it returns False.",
  ],
  starter: `def can_go(command, on_stop_line):
    # return True or False
    pass

print(can_go("F", False))
`,
  hints: [
    'Two things must both be true: command == "F" and not on_stop_line.',
    'return command == "F" and not on_stop_line',
  ],
  cases: [
    returnCase("can_go", "command, on_stop_line", ["F", false], true),
    returnCase("can_go", "command, on_stop_line", ["F", true], false),
    returnCase("can_go", "command, on_stop_line", ["L", false], false),
    returnCase("can_go", "command, on_stop_line", ["S", true], false),
  ],
};

// ---- Term 2, Week 4: How sure is it? ----------------------------------------

const confidenceRule: Exercise = {
  id: "y9-confidence-rule",
  group: "Year 9",
  lesson: "Term 2, Week 4",
  title: "The 70% confidence rule",
  summary: "Let a person decide when the model is unsure.",
  instructions: [
    "The leaf model gives a label (healthy or disease) and a confidence from 0 to 100. A human stays in the loop: if the model is not sure enough, a person decides.",
    "Write a function called sort_leaf(label, confidence) that returns:",
    "ask a person if the confidence is below 70",
    "left basket if it is 70 or more and the label is healthy",
    "right basket if it is 70 or more and the label is disease",
  ],
  starter: `def sort_leaf(label, confidence):
    # return "ask a person", "left basket" or "right basket"
    pass

print(sort_leaf("healthy", 91))
`,
  hints: [
    "Check the confidence first. A low confidence means ask a person, whatever the label says.",
    'if confidence < 70: return "ask a person"',
    "After that, one if for the healthy label and an else for disease.",
  ],
  cases: [
    returnCase("sort_leaf", "label, confidence", ["healthy", 91], "left basket"),
    returnCase("sort_leaf", "label, confidence", ["disease", 85], "right basket"),
    returnCase("sort_leaf", "label, confidence", ["healthy", 70], "left basket"),
    returnCase("sort_leaf", "label, confidence", ["disease", 69], "ask a person"),
    returnCase("sort_leaf", "label, confidence", ["healthy", 40], "ask a person"),
  ],
};

// ---- Term 2, Week 6: AI on the farm (fairness check) ------------------------

function groupCase(pairs: [string, boolean][]): CheckCase {
  const totals = new Map<string, { right: number; all: number }>();
  for (const [group, right] of pairs) {
    const entry = totals.get(group) ?? { right: 0, all: 0 };
    entry.all += 1;
    if (right) entry.right += 1;
    totals.set(group, entry);
  }
  const expected = [...totals.keys()]
    .sort()
    .map((group) => `${group}: ${((totals.get(group)!.right / totals.get(group)!.all) * 100).toFixed(0)}%`);
  return linesCase(
    pairs.map(([g, r]) => `${g}:${r ? "right" : "wrong"}`).join(", "),
    [pairs.map(([g, r]) => `${g}:${r ? "right" : "wrong"}`).join(",")],
    expected,
  );
}

const fairnessCheck: Exercise = {
  id: "y9-fairness-check",
  group: "Year 9",
  lesson: "Term 2, Week 6",
  title: "Is the model fair to every group?",
  summary: "Use a dictionary to compare accuracy by group.",
  instructions: [
    "You tested the model on photos from different places, such as sunny or dim, and noted right or wrong. Is the model weaker on one group?",
    "The program turns the typed results into a list of pairs like (\"sunny\", \"right\"). Use a dictionary to count how many each group got right and how many it had in total. Then print each group's accuracy as a whole-number percentage, with the groups in alphabetical order. For sunny:right, sunny:right, sunny:wrong, dim:wrong, dim:right:",
    "dim: 50%",
    "sunny: 67%",
  ],
  starter: `pairs = [item.split(":") for item in input("Results like sunny:right, separated by commas: ").split(",")]
# pairs looks like [["sunny", "right"], ["dim", "wrong"], ...]
# Use dictionaries to count right answers and totals for each group,
# then print each group in alphabetical order: <group>: <percent>%
`,
  hints: [
    "Make two dictionaries: totals = {} and rights = {}. For each pair, add one to totals[group], and also to rights[group] when the result is right.",
    "totals[group] = totals.get(group, 0) + 1 works even the first time you meet a group.",
    "for group in sorted(totals): then print(f\"{group}: {rights.get(group, 0) / totals[group] * 100:.0f}%\")",
  ],
  cases: [
    groupCase([
      ["sunny", true],
      ["sunny", true],
      ["sunny", false],
      ["dim", false],
      ["dim", true],
    ]),
    groupCase([
      ["cassava", true],
      ["maize", false],
      ["cassava", true],
      ["maize", false],
    ]),
    groupCase([["dim", false]]),
  ],
};

// ---- Term 3, Week 4: Review my code (debugging) ----------------------------

function averageCase(a: number, b: number, c: number): CheckCase {
  return linesCase(`${a}, ${b}, ${c}`, [String(a), String(b), String(c)], [`Average: ${((a + b + c) / 3).toFixed(1)}`]);
}

const debugAverage: Exercise = {
  id: "y9-debug-average",
  group: "Year 9",
  lesson: "Term 3, Week 4",
  title: "Debug: the wrong average",
  summary: "Find a bug that does not show an error message.",
  instructions: [
    "This program runs without an error, but the answer is wrong. Some of the hardest bugs are like this.",
    "It should print the average of three numbers. For 10, 20 and 30 it should print:",
    "Average: 20.0",
    "Try the program, read what it prints, and use print() to look at the values. Change one thing at a time.",
  ],
  starter: `a = int(input())
b = int(input())
c = int(input())
average = a + b + c / 3
print("Average:", average)
`,
  hints: [
    "Run it with 10, 20 and 30. It prints 40.0, not 20.0. Which part is wrong?",
    "Python does the division before the additions. Brackets change the order.",
    "average = (a + b + c) / 3",
  ],
  cases: [averageCase(10, 20, 30), averageCase(6, 9, 12), averageCase(0, 0, 0), averageCase(3, 3, 6)],
};

// ---- Term 3, Week 5: Chart the test results ---------------------------------

function logCase(rows: [number, number, number][]): CheckCase {
  const secs = rows.map((r) => r[1]);
  const average = secs.reduce((a, b) => a + b, 0) / secs.length;
  const errors = rows.reduce((a, r) => a + r[2], 0);
  return linesCase(
    `${rows.length} runs`,
    [String(rows.length), ...rows.map((r) => r.join(","))],
    [`Average time: ${average.toFixed(1)} seconds`, `Total errors: ${errors}`],
  );
}

const testLog: Exercise = {
  id: "y9-test-log",
  group: "Year 9",
  lesson: "Term 3, Week 5",
  title: "Read the test log",
  summary: "Split lines of data and summarise them.",
  instructions: [
    "Your team logged each test run as a line: run number, seconds, errors. For example 1,22,0 means run 1 took 22 seconds with no errors.",
    "The program reads the typed log lines into a list. Work out the average time and the total number of errors, and print two lines, in this form:",
    "Average time: 23.3 seconds",
    "Total errors: 3",
    "Print the average to one decimal place.",
  ],
  starter: `count = int(input("How many log lines? "))
lines = [input() for _ in range(count)]
# Each line looks like "1,22,0" (run, seconds, errors).
# Split each line, then work out the average seconds and the total errors.
`,
  hints: [
    'line.split(",") turns "1,22,0" into ["1", "22", "0"]. The parts are text, so use int(...) or float(...).',
    "Use two lists or two running totals: one for the seconds (index 1) and one for the errors (index 2).",
    "Average = total seconds / number of runs. Print it with :.1f.",
  ],
  cases: [
    logCase([
      [1, 22, 0],
      [2, 24, 1],
      [3, 23, 2],
    ]),
    logCase([
      [1, 30, 0],
      [2, 20, 0],
    ]),
    logCase([[1, 19, 4]]),
  ],
};

export const YEAR_9_EXERCISES: Exercise[] = [
  lineDecision,
  compareVersions,
  truthTable,
  stopGuard,
  confidenceRule,
  fairnessCheck,
  debugAverage,
  testLog,
];
