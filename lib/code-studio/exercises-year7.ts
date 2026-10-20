// Year 7 exercises. They follow the Year 7 Python rung of the Think, Move, Code!
// curriculum: pseudocode to Python, variables and types, loops, if / elif / else,
// and writing functions. They use plain Python on the laptop, with Nka's robot as
// the story, so a learner can practise the same ideas before and after the
// micro:bit lessons. Each one is data, like the starter exercises.

import { compareLines, lastLineCase, linesCase, MARK, printedLines, runProblem, shown, squash, type CheckCase, type Exercise } from "./exercise-kit";

// ---- Term 1, Week 2: Plan it, then type it ----------------------------------

const planThenType: Exercise = {
  id: "y7-plan-then-type",
  group: "Year 7",
  lesson: "Term 1, Week 2",
  title: "Plan it, then type it",
  summary: "Turn pseudocode into Python.",
  instructions: [
    "Good programmers plan first. The pseudocode below is a plan for Nka's robot.",
    "Turn each step into a print() line, in the same order, so the program shows all four messages.",
  ],
  starter: `# Pseudocode for Nka's robot:
# 1. say "Switch on"
# 2. say "Check the battery"
# 3. say "Drive forward"
# 4. say "Stop"
# Turn each step into a print() line below.
`,
  hints: [
    'Each step becomes one line, for example: print("Switch on")',
    "Keep the steps in the same order as the plan, and copy the words exactly.",
  ],
  cases: [linesCase("Prints the four steps in order", [], ["Switch on", "Check the battery", "Drive forward", "Stop"])],
};

const fixErrors: Exercise = {
  id: "y7-fix-errors",
  group: "Year 7",
  lesson: "Term 1, Week 2",
  title: "Find and fix the errors",
  summary: "Read the error message and repair the program.",
  instructions: [
    "This program has three mistakes. Press Run and read the red error message. It tells you the line number.",
    "Fix the mistakes one at a time. When it works it should print:",
    "Robot ready",
    "Battery full",
    "Moving off",
  ],
  starter: `print("Robot ready"
prnt("Battery full")
print("Moving off)
`,
  hints: [
    "Every ( needs a ) to close it, and every opening quote needs a closing quote.",
    "One word is spelt wrongly. Python only knows print, not prnt.",
    "Fix the first error, press Run, then read the next message.",
  ],
  cases: [linesCase("Prints the three lines", [], ["Robot ready", "Battery full", "Moving off"])],
};

// ---- Term 1, Week 3: Variables and types ------------------------------------

function fruitCase(oranges: number, mangoes: number): CheckCase {
  const expected = `You sold ${oranges + mangoes} fruits.`;
  return {
    label: `${oranges} oranges and ${mangoes} mangoes`,
    stdin: [String(oranges), String(mangoes)],
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      if (squash(run.stdout).includes(expected)) return null;
      return `Expected the program to print: ${expected} It printed: "${shown(run.stdout)}"`;
    },
  };
}

const marketCounter: Exercise = {
  id: "y7-market-counter",
  group: "Year 7",
  lesson: "Term 1, Week 3",
  title: "Market stall counter",
  summary: "Add two variables together.",
  instructions: [
    "A variable keeps a number for you, like a score. This program asks how many oranges and mangoes a stall sold.",
    "Add them up in a variable called total, then print one sentence, in exactly this form (for 3 and 5):",
    "You sold 8 fruits.",
  ],
  starter: `oranges = int(input("How many oranges did you sell? "))
mangoes = int(input("How many mangoes did you sell? "))
# Make a variable called total, then print: You sold <total> fruits.
`,
  hints: [
    "total = oranges + mangoes",
    'Use an f-string to put the variable in the sentence: print(f"You sold {total} fruits.")',
  ],
  cases: [fruitCase(3, 5), fruitCase(0, 0), fruitCase(12, 30)],
};

function speedCase(name: string, speed: number): CheckCase {
  const expected = `${name} moves ${speed * 10} cm in 10 seconds.`;
  return {
    label: `Robot ${name}, speed ${speed}`,
    stdin: [name, String(speed)],
    evaluate: (run) => {
      if (run.outcome === "error" && /TypeError/.test(run.stderr)) {
        return "input() gives back text, and you cannot multiply text by a number. Change the text into a number with int(...).";
      }
      const problem = runProblem(run);
      if (problem) return problem;
      if (squash(run.stdout).includes(expected)) return null;
      if (squash(run.stdout).includes(String(speed).repeat(10))) {
        return "The digits were repeated ten times. Text times 10 repeats the text, but a number times 10 multiplies. Change speed into a number with int(...).";
      }
      return `Expected the program to print: ${expected} It printed: "${shown(run.stdout)}"`;
    },
  };
}

const robotSpeed: Exercise = {
  id: "y7-robot-speed",
  group: "Year 7",
  lesson: "Term 1, Week 3",
  title: "How far does the robot go?",
  summary: "Text and numbers are different types.",
  instructions: [
    "Python keeps text and numbers as different types. Whatever input() gives you is text, even if you typed digits.",
    "The robot's speed is in cm per second. Make the program work out how far it goes in 10 seconds and print, for example:",
    "Nka moves 50 cm in 10 seconds.",
  ],
  starter: `name = input("Robot name: ")
speed = input("Speed in cm per second: ")
# Change speed into a number, then print how far the robot goes in 10 seconds.
`,
  hints: [
    "int(...) turns text into a whole number. Try speed = int(input(...)).",
    "Distance in 10 seconds is speed * 10.",
    'print(f"{name} moves {speed * 10} cm in 10 seconds.")',
  ],
  cases: [speedCase("Nka", 5), speedCase("Tunde", 12), speedCase("Ada", 0)],
};

// ---- Term 1, Week 4: Loops --------------------------------------------------

function stepsCase(n: number): CheckCase {
  const expected = [...Array.from({ length: n }, (_, i) => `Step ${i + 1}`), "Done!"];
  return { ...linesCase(`${n} step${n === 1 ? "" : "s"}`, [String(n)], expected) };
}

const forSteps: Exercise = {
  id: "y7-for-steps",
  group: "Year 7",
  lesson: "Term 1, Week 4",
  title: "Count the robot's steps",
  summary: "Repeat a set number of times with for.",
  instructions: [
    "A for loop repeats code a set number of times.",
    "The program asks how many steps the robot should take. Print Step 1, Step 2, and so on up to that number, one per line, then print Done! at the end. For 3 steps:",
    "Step 1",
    "Step 2",
    "Step 3",
    "Done!",
  ],
  starter: `steps = int(input("How many steps? "))
# Use a for loop to print Step 1, Step 2 ... then print Done!
`,
  hints: [
    "range(1, steps + 1) gives the numbers 1 up to steps. range stops one before the last number.",
    "Put the print for each step inside the loop (indented), and Done! after it (not indented).",
    'for i in range(1, steps + 1):  print(f"Step {i}")',
  ],
  cases: [stepsCase(3), stepsCase(1), stepsCase(6)],
};

function countdownCase(start: number): CheckCase {
  const expected = [...Array.from({ length: start }, (_, i) => String(start - i)), "Lift off!"];
  return linesCase(`Start from ${start}`, [String(start)], expected);
}

const countdown: Exercise = {
  id: "y7-countdown",
  group: "Year 7",
  lesson: "Term 1, Week 4",
  title: "Rocket countdown",
  summary: "Repeat until something changes with while.",
  instructions: [
    "A while loop keeps repeating until its condition stops being true.",
    "The program asks where to start counting. Count down to 1, one number per line, then print Lift off! For a start of 3:",
    "3",
    "2",
    "1",
    "Lift off!",
  ],
  starter: `count = int(input("Start counting from: "))
# Use a while loop to print count, then make count one smaller each time.
# After the loop, print Lift off!
`,
  hints: [
    "The loop should keep going while count is more than 0: while count > 0:",
    "Inside the loop, print count and then do count = count - 1. If you forget that line the loop never ends!",
    "Print Lift off! after the loop, so it only happens once.",
  ],
  cases: [countdownCase(3), countdownCase(5), countdownCase(1)],
};

// ---- Term 1, Week 5: if, elif, else -----------------------------------------

const distanceDecision: Exercise = {
  id: "y7-distance-decision",
  group: "Year 7",
  lesson: "Term 1, Week 5",
  title: "Robot distance sensor",
  summary: "Choose between three actions with if, elif, else.",
  instructions: [
    "Nka's robot has a sensor that measures the distance to a wall in centimetres. The program must decide what the robot does:",
    "Less than 10 cm: print Stop",
    "Less than 30 cm (but not less than 10): print Slow down",
    "Otherwise: print Go",
    "Print only that one decision as your last line.",
  ],
  starter: `distance = int(input("Distance to the wall in cm: "))
# if / elif / else: print Stop, Slow down or Go
`,
  hints: [
    "Start with if distance < 10: then elif distance < 30: then else:",
    "elif is only checked when the if above it was not true, so you do not need to check 10 again.",
    'if distance < 10:  print("Stop")  elif distance < 30:  print("Slow down")  else:  print("Go")',
  ],
  cases: [
    lastLineCase("5 cm", ["5"], "Stop"),
    lastLineCase("9 cm", ["9"], "Stop"),
    lastLineCase("10 cm", ["10"], "Slow down"),
    lastLineCase("29 cm", ["29"], "Slow down"),
    lastLineCase("30 cm", ["30"], "Go"),
    lastLineCase("100 cm", ["100"], "Go"),
  ],
};

const batteryLight: Exercise = {
  id: "y7-battery-light",
  group: "Year 7",
  lesson: "Term 1, Week 5",
  title: "Battery light",
  summary: "Match each range to a colour.",
  instructions: [
    "The robot shows its battery level with a coloured light.",
    "60 or more per cent: print Green",
    "20 or more (but under 60): print Amber",
    "Under 20: print Red",
    "Print only the colour as your last line.",
  ],
  starter: `battery = int(input("Battery percent: "))
# Print Green, Amber or Red
`,
  hints: [
    "Check the highest range first: if battery >= 60:",
    "Then elif battery >= 20: and finally else: for Red.",
  ],
  cases: [
    lastLineCase("100 per cent", ["100"], "Green"),
    lastLineCase("60 per cent", ["60"], "Green"),
    lastLineCase("59 per cent", ["59"], "Amber"),
    lastLineCase("20 per cent", ["20"], "Amber"),
    lastLineCase("19 per cent", ["19"], "Red"),
    lastLineCase("0 per cent", ["0"], "Red"),
  ],
};

// ---- Term 3, Week 3: Write your own function --------------------------------

function routineCase(label: string, calls: string[], expected: string[]): CheckCase {
  return {
    label,
    stdin: [],
    append: `\n${calls.join("\n")}\n`,
    evaluate: (run) => {
      if (run.outcome === "error" && /NameError/.test(run.stderr)) {
        const missing = /name '([A-Za-z_]+)' is not defined/.exec(run.stderr)?.[1];
        if (missing === "forward" || missing === "turn_left") {
          return `I could not find a function called ${missing}. Define it with: def ${missing}(${missing === "forward" ? "steps" : ""}):`;
        }
      }
      if (run.outcome === "error" && /TypeError/.test(run.stderr) && /argument/.test(run.stderr)) {
        return "A function was given the wrong number of values. forward needs one (steps), and turn_left needs none.";
      }
      const problem = runProblem(run);
      if (problem) return problem;
      const lines = printedLines(run);
      return compareLines(lines.slice(Math.max(0, lines.length - expected.length)), expected);
    },
  };
}

const robotFunctions: Exercise = {
  id: "y7-robot-functions",
  group: "Year 7",
  lesson: "Term 3, Week 3",
  title: "Robot moves as functions",
  summary: "Write functions to reuse robot moves.",
  instructions: [
    "A function is a named block of code. You write it once with def, then use it as many times as you like.",
    "Write two functions:",
    "forward(steps) prints: Moving forward <steps> steps",
    "turn_left() prints: Turning left",
    "For example, forward(3) should print: Moving forward 3 steps",
  ],
  starter: `# Write the two functions here.
# forward(steps) prints   Moving forward <steps> steps
# turn_left() prints      Turning left

`,
  hints: [
    "A function starts with def, then its name, brackets and a colon, then indented lines: def turn_left():",
    "forward needs one thing in its brackets so it knows how many steps: def forward(steps):",
    'def forward(steps):  print(f"Moving forward {steps} steps")',
  ],
  cases: [
    routineCase("forward(3)", ["forward(3)"], ["Moving forward 3 steps"]),
    routineCase("turn_left()", ["turn_left()"], ["Turning left"]),
    routineCase("A short route", ["forward(2)", "turn_left()", "forward(10)"], ["Moving forward 2 steps", "Turning left", "Moving forward 10 steps"]),
  ],
};

function travelCase(speed: number, seconds: number): CheckCase {
  const distance = speed * seconds;
  return {
    label: `Speed ${speed}, ${seconds} seconds`,
    stdin: [],
    append: `\nprint("${MARK}", repr(distance_travelled(${speed}, ${seconds})))\n`,
    evaluate: (run) => {
      if (run.outcome === "error" && /NameError/.test(run.stderr) && /distance_travelled/.test(run.stderr)) {
        return "I could not find a function called distance_travelled. Define it with: def distance_travelled(speed, seconds):";
      }
      const problem = runProblem(run);
      if (problem) return problem;
      const line = run.stdout.split("\n").find((l) => l.startsWith(MARK));
      if (!line) return "The check could not read your function's answer. Make sure your program does not call exit().";
      const value = line.slice(MARK.length).trim();
      if (value === "None") return "Your function gave back nothing. Use return (not print) to hand the answer back.";
      const number = Number(value);
      if (Number.isFinite(number) && Math.abs(number - distance) < 0.0001) return null;
      return `distance_travelled(${speed}, ${seconds}) should give ${distance}, but gave ${shown(value)}.`;
    },
  };
}

const distanceTravelled: Exercise = {
  id: "y7-distance-travelled",
  group: "Year 7",
  lesson: "Term 3, Week 3",
  title: "Distance travelled",
  summary: "A function that gives back an answer.",
  instructions: [
    "Some functions do not print. They return an answer for the rest of the program to use.",
    "Write a function called distance_travelled that takes a speed (cm per second) and a time (seconds) and returns the distance in cm.",
    "For example, distance_travelled(5, 10) should give back 50.",
  ],
  starter: `def distance_travelled(speed, seconds):
    # work out the distance and return it
    pass

print(distance_travelled(5, 10))
`,
  hints: [
    "distance is speed multiplied by time.",
    "Replace pass with a return line: return hands the answer back.",
    "return speed * seconds",
  ],
  cases: [travelCase(5, 10), travelCase(12, 3), travelCase(0, 100), travelCase(2.5, 4)],
};

export const YEAR_7_EXERCISES: Exercise[] = [
  planThenType,
  fixErrors,
  marketCounter,
  robotSpeed,
  forSteps,
  countdown,
  distanceDecision,
  batteryLight,
  robotFunctions,
  distanceTravelled,
];
