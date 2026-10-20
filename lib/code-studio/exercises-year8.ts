// Year 8 exercises. They follow the Python-on-the-laptop parts of the Year 8
// curriculum: functions with parameters and return values, lists, if / else on
// text length, counting results, nested decisions, and on-off control. The story
// is Echiche's Arduino projects, so a learner can practise the Python half of
// each project here, before or after the Arduino lesson. Each one is data.

import { lastLineCase, linesCase, returnCase, type CheckCase, type Exercise } from "./exercise-kit";

// ---- Term 1, Week 5: Python functions ---------------------------------------

const change: Exercise = {
  id: "y8-naira-change",
  group: "Year 8",
  lesson: "Term 1, Week 5",
  title: "Naira change",
  summary: "A function with two parameters.",
  instructions: [
    "A market trader needs to work out the change to give back. A function can do it every time.",
    "Write a function called change that takes the price and the amount paid (both in naira) and returns the change.",
    "For example, change(350, 500) should give back 150.",
  ],
  starter: `def change(price, paid):
    # work out the change and return it
    pass

print(change(350, 500))
`,
  hints: [
    "The change is the amount paid minus the price.",
    "return paid - price",
  ],
  cases: [
    returnCase("change", "price, paid", [350, 500], 150),
    returnCase("change", "price, paid", [1200, 2000], 800),
    returnCase("change", "price, paid", [500, 500], 0),
  ],
};

const percent: Exercise = {
  id: "y8-light-percent",
  group: "Year 8",
  lesson: "Term 1, Week 5",
  title: "Light sensor as a percent",
  summary: "Turn a sensor reading into a percentage.",
  instructions: [
    "Echiche's light sensor gives a reading from 0 (dark) to 1023 (brightest). People understand percentages better.",
    "Write a function called percent that takes a reading and returns it as a whole-number percentage: divide by 1023, multiply by 100, and round to the nearest whole number.",
    "For example, percent(512) should give back 50.",
  ],
  starter: `def percent(reading):
    # return the reading as a whole-number percentage
    pass

print(percent(512))
`,
  hints: [
    "reading / 1023 * 100 gives the exact percentage, with decimals.",
    "round(...) rounds to the nearest whole number. int(...) would cut the decimals off instead, which gives a different answer for some readings.",
    "return round(reading / 1023 * 100)",
  ],
  cases: [
    returnCase("percent", "reading", [1023], 100),
    returnCase("percent", "reading", [0], 0),
    returnCase("percent", "reading", [512], 50),
    returnCase("percent", "reading", [300], 29),
    returnCase("percent", "reading", [767], 75),
  ],
};

// ---- Term 1, Week 11: Night light -------------------------------------------

const nightLight: Exercise = {
  id: "y8-night-light",
  group: "Year 8",
  lesson: "Term 1, Week 11",
  title: "Is it dark? (night light)",
  summary: "A function that answers True or False.",
  instructions: [
    "Echiche's market stall night light must switch on when the light reading is below a threshold.",
    "Write a function called is_dark that takes a reading and a threshold, and returns True if the reading is below the threshold, otherwise False.",
    "For example, is_dark(250, 300) gives True, and is_dark(300, 300) gives False.",
  ],
  starter: `def is_dark(reading, threshold):
    # return True or False
    pass

print(is_dark(250, 300))
`,
  hints: [
    "A comparison such as reading < threshold already is True or False.",
    "return reading < threshold",
  ],
  cases: [
    returnCase("is_dark", "reading, threshold", [250, 300], true),
    returnCase("is_dark", "reading, threshold", [300, 300], false),
    returnCase("is_dark", "reading, threshold", [900, 300], false),
    returnCase("is_dark", "reading, threshold", [0, 300], true),
  ],
};

// ---- Term 2, Week 2: Python lists -------------------------------------------

function statsCase(list: number[]): CheckCase {
  const total = list.reduce((a, b) => a + b, 0);
  return linesCase(`Readings ${list.join(", ")}`, [list.join(",")], [
    `Total: ${total}`,
    `Highest: ${Math.max(...list)}`,
    `Lowest: ${Math.min(...list)}`,
    `Average: ${(total / list.length).toFixed(1)}`,
  ]);
}

const listStats: Exercise = {
  id: "y8-list-stats",
  group: "Year 8",
  lesson: "Term 2, Week 2",
  title: "Climate readings: totals and averages",
  summary: "Loop through a list to find the total, highest, lowest and average.",
  instructions: [
    "Echiche logged temperature readings. The program turns the typed readings into a list.",
    "Use a loop to work out the total, the highest and the lowest. Then print four lines, in this form (for 28, 29, 30, 31, 31, 32, 32, 31, 30, 29):",
    "Total: 303",
    "Highest: 32",
    "Lowest: 28",
    "Average: 30.3",
    "Print the average to one decimal place.",
  ],
  starter: `temps = [int(x) for x in input("Readings, separated by commas: ").split(",")]
# Use a loop to find the total, highest and lowest.
# Then print: Total, Highest, Lowest and Average (one decimal place).
`,
  hints: [
    "Start with total = 0, then for t in temps: total = total + t",
    "For the highest, start with highest = temps[0] and change it whenever you meet a bigger reading. The lowest works the same way.",
    "average = total / len(temps), and f\"{average:.1f}\" shows one decimal place.",
  ],
  cases: [statsCase([28, 29, 30, 31, 31, 32, 32, 31, 30, 29]), statsCase([5, 10, 15]), statsCase([7])],
};

// ---- Term 2, Week 5: Cyber safe ---------------------------------------------

const passwordCheck: Exercise = {
  id: "y8-password-length",
  group: "Year 8",
  lesson: "Term 2, Week 5",
  title: "Password length checker",
  summary: "Decide with if and len().",
  instructions: [
    "Long passwords are harder to guess. Practise with made-up passwords only. Never type a real one.",
    "Print Good length if the password has 12 or more characters, otherwise print Too short. Print only that as your last line.",
  ],
  starter: `password = input("Try a made-up password: ")
# Print Good length or Too short
`,
  hints: [
    "len(password) gives the number of characters.",
    'if len(password) >= 12:  print("Good length")  else:  print("Too short")',
  ],
  cases: [
    lastLineCase("An empty password", [""], "Too short"),
    lastLineCase("abc", ["abc"], "Too short"),
    lastLineCase("11 characters", ["elevenchars"], "Too short"),
    lastLineCase("12 characters", ["twelvechars!"], "Good length"),
    lastLineCase("20 characters", ["blue-mango-river-77"], "Good length"),
  ],
};

// ---- Term 2, Week 6: Can we trust it? ---------------------------------------

function accuracyCase(results: string[]): CheckCase {
  const correct = results.filter((r) => r === "right").length;
  return lastLineCase(`${correct} right out of ${results.length}`, [results.join(",")], `Accuracy: ${((correct / results.length) * 100).toFixed(0)}%`);
}

const accuracy: Exercise = {
  id: "y8-accuracy",
  group: "Year 8",
  lesson: "Term 2, Week 6",
  title: "How accurate is the classifier?",
  summary: "Count results and work out a percentage.",
  instructions: [
    "You tested a classifier and wrote down right or wrong for each item. The program turns the typed results into a list.",
    "Count the right answers and print the accuracy as a whole-number percentage, in this form (3 right out of 4):",
    "Accuracy: 75%",
    "Print only that as your last line.",
  ],
  starter: `results = input("Results (right or wrong), separated by commas: ").split(",")
# Count how many are "right", then print: Accuracy: <percent>%
`,
  hints: [
    'results.count("right") counts how many times "right" appears in the list.',
    "The percentage is correct / len(results) * 100. Use an f-string with :.0f to show a whole number.",
    'print(f"Accuracy: {correct / len(results) * 100:.0f}%")',
  ],
  cases: [
    accuracyCase(["right", "wrong", "right", "right"]),
    accuracyCase(["right", "right"]),
    accuracyCase(["wrong", "wrong", "right"]),
    accuracyCase(["right", "right", "wrong"]),
  ],
};

// ---- Term 3, Week 4: Decisions inside decisions -----------------------------

const smartBin: Exercise = {
  id: "y8-smart-bin",
  group: "Year 8",
  lesson: "Term 3, Week 4",
  title: "Smart bin decisions",
  summary: "Nested if with True/False values.",
  instructions: [
    "Echiche's smart bin has two True/False inputs: hand_near (is a hand close to the lid?) and bin_full (is the bin full?).",
    "Write a function called bin_action(hand_near, bin_full) that returns one of three texts:",
    "If a hand is near and the bin is full: Flash red",
    "If a hand is near and the bin is not full: Open lid",
    "If no hand is near: Stay closed",
    "Use an if inside another if.",
  ],
  starter: `def bin_action(hand_near, bin_full):
    # return "Flash red", "Open lid" or "Stay closed"
    pass

print(bin_action(True, False))
`,
  hints: [
    "First decide on hand_near. Only if it is True do you need to look at bin_full.",
    'if hand_near:  then, indented under it, another if bin_full: return "Flash red", else return "Open lid".',
    'The outside else (no hand) returns "Stay closed".',
  ],
  cases: [
    returnCase("bin_action", "hand_near, bin_full", [true, false], "Open lid"),
    returnCase("bin_action", "hand_near, bin_full", [true, true], "Flash red"),
    returnCase("bin_action", "hand_near, bin_full", [false, false], "Stay closed"),
    returnCase("bin_action", "hand_near, bin_full", [false, true], "Stay closed"),
  ],
};

// ---- Term 3, Week 5: Keep your distance -------------------------------------

const keepDistance: Exercise = {
  id: "y8-keep-distance",
  group: "Year 8",
  lesson: "Term 3, Week 5",
  title: "Keep your distance",
  summary: "On-off control: sense, compare, act.",
  instructions: [
    "The Arduino car must keep a distance from the object in front of it. Each time round its loop it senses the distance, compares it, and acts.",
    "Write a function called car_action(distance) that returns:",
    "forward if the distance is more than 30 cm",
    "backward if the distance is less than 20 cm",
    "stop if it is between 20 and 30 cm (including 20 and 30)",
  ],
  starter: `def car_action(distance):
    # return "forward", "backward" or "stop"
    pass

print(car_action(45))
`,
  hints: [
    "Check one end first: if distance > 30: return \"forward\".",
    'Then elif distance < 20: return "backward", and else: return "stop".',
  ],
  cases: [
    returnCase("car_action", "distance", [45], "forward"),
    returnCase("car_action", "distance", [31], "forward"),
    returnCase("car_action", "distance", [30], "stop"),
    returnCase("car_action", "distance", [25], "stop"),
    returnCase("car_action", "distance", [20], "stop"),
    returnCase("car_action", "distance", [19], "backward"),
    returnCase("car_action", "distance", [3], "backward"),
  ],
};

export const YEAR_8_EXERCISES: Exercise[] = [change, percent, nightLight, listStats, passwordCheck, accuracy, smartBin, keepDistance];
