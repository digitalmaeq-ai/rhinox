// The five guided exercises. Each one is data: the task, a starter program, hints,
// and a list of checks. A check runs the learner's program with some typed
// answers and looks at what it printed. Nothing here runs Python itself.

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

export interface Exercise {
  id: string;
  title: string;
  summary: string;
  /** The task, one paragraph per entry. */
  instructions: string[];
  starter: string;
  hints: string[];
  cases: CheckCase[];
}

/** Collapses every run of spaces and new lines to one space. */
function squash(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function lastLine(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines[lines.length - 1] ?? "";
}

function shown(text: string): string {
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

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---- 1. Hello, World! -------------------------------------------------------

const helloWorld: Exercise = {
  id: "hello-world",
  title: "Hello, World!",
  summary: "Make the computer say hello with print().",
  instructions: [
    "Every programmer starts here. Use print() to show this exact message on the screen:",
    "Hello, World!",
  ],
  starter: `# Print the message "Hello, World!"\n`,
  hints: [
    'print() shows whatever is between the quotes, like print("Good morning").',
    "Copy the message exactly: capital H and W, a comma, and an exclamation mark.",
  ],
  cases: [
    {
      label: "Prints the message",
      stdin: [],
      evaluate: (run) => {
        const problem = runProblem(run);
        if (problem) return problem;
        const out = squash(run.stdout);
        if (out === "") return "Your program did not print anything. Use print().";
        if (out === "Hello, World!") return null;
        if (out.toLowerCase() === "hello, world!") return "Nearly! Check the capital letters: Hello, World!";
        return `Your program printed "${shown(run.stdout)}" but the message should be exactly: Hello, World!`;
      },
    },
  ],
};

// ---- 2. Variables and input() -----------------------------------------------

function greetingCase(name: string, age: number): CheckCase {
  const expected = `Hello, ${name}! Next year you will be ${age + 1}.`;
  return {
    label: `Name ${name}, age ${age}`,
    stdin: [name, String(age)],
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      const out = squash(run.stdout);
      if (out.includes(expected)) return null;
      if (out.includes(`Hello, ${name}!`)) {
        return `The age is not right. After typing ${age}, the program should say you will be ${age + 1}. Expected: ${expected}`;
      }
      return `Expected the program to print: ${expected} It printed: "${shown(run.stdout)}"`;
    },
  };
}

const variables: Exercise = {
  id: "variables-input",
  title: "Variables and input()",
  summary: "Store what someone types, then use it.",
  instructions: [
    "A variable stores a value. The program below already asks for a name and an age.",
    "Finish it so it prints one sentence, in exactly this form (for Ada, aged 12):",
    "Hello, Ada! Next year you will be 13.",
  ],
  starter: `name = input("What is your name? ")
age = int(input("How old are you? "))
# Print: Hello, <name>! Next year you will be <age + 1>.
`,
  hints: [
    "int(...) already turned the age into a number, so age + 1 does the sum for you.",
    'Use an f-string: print(f"Hello, {name}! ...") puts variables inside the text.',
    'print(f"Hello, {name}! Next year you will be {age + 1}.")',
  ],
  cases: [greetingCase("Ada", 12), greetingCase("Tunde", 9), greetingCase("Zainab", 30)],
};

// ---- 3. Loops: times tables --------------------------------------------------

function timesTableCase(n: number): CheckCase {
  return {
    label: `The ${n} times table`,
    stdin: [String(n)],
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      const out = squash(run.stdout);
      let from = 0;
      for (let i = 1; i <= 12; i += 1) {
        const line = `${n} x ${i} = ${n * i}`;
        const found = new RegExp(`(?<![\\d])${escapeRegExp(line)}(?!\\d)`).exec(out.slice(from));
        if (!found) {
          return `The line "${line}" is missing, or is not in the right place. Each line should look like: ${n} x ${i} = ${n * i}`;
        }
        from += found.index + line.length;
      }
      return null;
    },
  };
}

const loops: Exercise = {
  id: "times-table",
  title: "Loops: times tables",
  summary: "Repeat work with a for loop.",
  instructions: [
    "A loop repeats code so you do not have to write it twelve times.",
    "The program asks which times table you want. Use a for loop to print that table from 1 to 12, one line each, like this for 7:",
    "7 x 1 = 7",
    "7 x 2 = 14",
    "... and so on up to 7 x 12 = 84",
  ],
  starter: `n = int(input("Which times table? "))
# Use a for loop to print n x 1 up to n x 12
`,
  hints: [
    "range(1, 13) gives the numbers 1 to 12. range stops one before the last number.",
    "for i in range(1, 13):  then, indented underneath, a print() that uses n and i.",
    'print(f"{n} x {i} = {n * i}")',
  ],
  cases: [timesTableCase(7), timesTableCase(12), timesTableCase(3)],
};

// ---- 4. If / else: odd or even ----------------------------------------------

function oddEvenCase(n: number): CheckCase {
  const expected = n % 2 === 0 ? "Even" : "Odd";
  return {
    label: `The number ${n}`,
    stdin: [String(n)],
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      const last = lastLine(run.stdout).split(/\s+/).pop() ?? "";
      const word = last.replace(/[^A-Za-z]/g, "").toLowerCase();
      if (word === expected.toLowerCase()) return null;
      if (word === "") return `For ${n} the program should print ${expected}, but it printed nothing at the end.`;
      return `For ${n} the program should print ${expected}, but it printed "${shown(lastLine(run.stdout))}".`;
    },
  };
}

const ifElse: Exercise = {
  id: "odd-even",
  title: "If / else: odd or even",
  summary: "Make the program decide.",
  instructions: [
    "An if statement lets a program choose what to do.",
    "The program asks for a whole number. Print the word Even if the number is even, otherwise print the word Odd.",
    "Print only that one word as your last line.",
  ],
  starter: `number = int(input("Enter a whole number: "))
# Print Even if number is even, otherwise print Odd
`,
  hints: [
    "The % sign gives the remainder after dividing. 7 % 2 is 1, and 8 % 2 is 0.",
    "A number is even when number % 2 == 0.",
    'if number % 2 == 0:  print("Even")  else:  print("Odd")  (indent the print lines)',
  ],
  cases: [oddEvenCase(4), oddEvenCase(7), oddEvenCase(0), oddEvenCase(-3), oddEvenCase(100)],
};

// ---- 5. Functions: temperature ----------------------------------------------

const MARK = "@@RX@@";

function temperatureCase(celsius: number, fahrenheit: number): CheckCase {
  return {
    label: `${celsius} °C`,
    stdin: [],
    append: `\nprint("${MARK}", repr(celsius_to_fahrenheit(${celsius})))\n`,
    evaluate: (run) => {
      if (run.outcome === "error" && /NameError/.test(run.stderr) && /celsius_to_fahrenheit/.test(run.stderr)) {
        return "I could not find a function called celsius_to_fahrenheit. Define it with: def celsius_to_fahrenheit(celsius):";
      }
      const problem = runProblem(run);
      if (problem) return problem;
      const line = run.stdout.split("\n").find((l) => l.startsWith(MARK));
      if (!line) return "The check could not read your function's answer. Make sure your program does not call exit().";
      const value = line.slice(MARK.length).trim();
      if (value === "None") {
        return "Your function gave back nothing. Use return (not print) to hand the answer back: return celsius * 9 / 5 + 32";
      }
      const number = Number(value);
      if (Number.isFinite(number) && Math.abs(number - fahrenheit) < 0.01) return null;
      return `celsius_to_fahrenheit(${celsius}) should give ${fahrenheit}, but gave ${shown(value)}.`;
    },
  };
}

const functions: Exercise = {
  id: "temperature-function",
  title: "Functions: temperature",
  summary: "Write a function that gives back an answer.",
  instructions: [
    "A function is a named piece of code you can use again and again.",
    "Write a function called celsius_to_fahrenheit that takes a temperature in Celsius and returns it in Fahrenheit.",
    "The rule is: multiply by 9, divide by 5, then add 32. For example, 100 °C is 212 °F.",
  ],
  starter: `def celsius_to_fahrenheit(celsius):
    # work out the answer and return it
    pass

print(celsius_to_fahrenheit(100))
`,
  hints: [
    "Replace the word pass with a return line. return hands the answer back to whoever called the function.",
    "The formula in Python is celsius * 9 / 5 + 32.",
    "return celsius * 9 / 5 + 32",
  ],
  cases: [temperatureCase(0, 32), temperatureCase(100, 212), temperatureCase(-40, -40), temperatureCase(37, 98.6)],
};

export const EXERCISES: Exercise[] = [helloWorld, variables, loops, ifElse, functions];

export function getExercise(id: string | null | undefined): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id);
}
