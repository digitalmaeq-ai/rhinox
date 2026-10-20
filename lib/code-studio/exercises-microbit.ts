// The micro:bit exercises. Each check runs the learner's program on the scripted
// board: a pretend clock, with button presses, shakes and sensor changes at set
// times, and a record of every picture the lights showed. Nothing here runs Python.
import { runProblem, type CheckCase, type Exercise, type RunCapture } from "./exercise-kit";
import { pictureToLeds, type DeviceScript, type DeviceTrace } from "./microbit";

// ---- Pictures the checks look for (the same drawings the simulator has) -----------

const HEART = pictureToLeds("09090:99999:99999:09990:00900");
const HAPPY = pictureToLeds("00000:09090:00000:90009:09990");
const SAD = pictureToLeds("00000:09090:00000:09990:90009");
const ASLEEP = pictureToLeds("00000:99099:00000:09990:00000");
const SURPRISED = pictureToLeds("09090:00000:00900:09090:00900");

// The number glyphs of the simulator's font: three columns wide, drawn in the middle.
const DIGIT_ROWS = ["###/#.#/#.#/#.#/###", ".#./##./.#./.#./###", "##./..#/.#./#../###", "##./..#/.#./..#/##.", "#.#/#.#/###/..#/..#", "###/#../##./..#/##.", ".##/#../###/#.#/###", "###/..#/.#./.#./.#.", "###/#.#/###/#.#/###", "###/#.#/###/..#/##."];

export function digitLeds(digit: number): string {
  const rows = DIGIT_ROWS[digit].split("/");
  let leds = "";
  for (const row of rows) leds += "0" + Array.from(row, (c) => (c === "#" ? "9" : "0")).join("") + "0";
  return leds;
}

const NAMES: Record<string, string> = {
  [HEART]: "a heart",
  [HAPPY]: "a happy face",
  [SAD]: "a sad face",
  [ASLEEP]: "a sleeping face",
  [SURPRISED]: "a surprised face",
  ["0".repeat(25)]: "nothing (the lights are off)",
};
for (let d = 0; d <= 9; d += 1) NAMES[digitLeds(d)] = `the number ${d}`;

function describeLeds(leds: string): string {
  return NAMES[leds] ?? "a different picture";
}

/** The lights at a pretend time: the last picture shown at or before it. */
export function ledsAt(trace: DeviceTrace, ms: number): string {
  let leds = "0".repeat(25);
  for (const frame of trace.frames) {
    if (frame.t <= ms) leds = frame.leds;
    else break;
  }
  return leds;
}

/** Looks at the lights at a time and says what is wrong, or returns null. */
function expectAt(trace: DeviceTrace, ms: number, expected: string, when: string): string | null {
  const actual = ledsAt(trace, ms);
  if (actual === expected) return null;
  return `${when}, the lights should show ${describeLeds(expected)}, but they show ${describeLeds(actual)}.`;
}

function boardCase(label: string, board: DeviceScript, judge: (trace: DeviceTrace, run: RunCapture) => string | null): CheckCase {
  return {
    label,
    stdin: [],
    board,
    evaluate: (run) => {
      const problem = runProblem(run);
      if (problem) return problem;
      if (!run.device) return "The micro:bit board did not run. Start your program with: from microbit import *";
      return judge(run.device, run);
    },
  };
}

const HEADER = "from microbit import *\n";

// ---- 1. Hello, micro:bit! (Year 5, Term 1, Week 1) -----------------------------

const hello: Exercise = {
  id: "mb-hello",
  group: "micro:bit",
  lesson: "Year 5, Term 1, Week 1",
  title: "Hello, micro:bit!",
  summary: "Show a picture on the 25 lights.",
  instructions: [
    "The micro:bit has 25 tiny lights in a 5 by 5 grid. In this simulator they are the red squares on the board below the code.",
    "Your program must show a heart on the display. Press Run and look at the board, then press Check.",
  ],
  starter: `${HEADER}
# Show a heart on the lights
`,
  hints: [
    "display.show(...) puts a picture on the lights.",
    "The micro:bit already knows many pictures. The heart is called Image.HEART.",
    "display.show(Image.HEART)",
  ],
  cases: [
    boardCase("The heart is on the lights", { events: [], duration: 2000 }, (trace) => {
      if (trace.frames.length === 0) return "Nothing was shown on the lights. Use display.show(...).";
      return expectAt(trace, 1500, HEART, "After the program has run");
    }),
  ],
};

// ---- 2. Press A, Press B (Year 5, Term 1, Week 2) -------------------------------

const buttons: Exercise = {
  id: "mb-buttons",
  group: "micro:bit",
  lesson: "Year 5, Term 1, Week 2",
  title: "Press A, Press B",
  summary: "Do something different for each button.",
  instructions: [
    "A program that waits for a button needs a loop that keeps checking. while True: repeats forever. The program below does nothing yet.",
    "When button A is pressed, show a happy face (Image.HAPPY). When button B is pressed, show a sad face (Image.SAD).",
    "Click the A and B buttons on the board to try it.",
  ],
  starter: `${HEADER}
while True:
    # If button A is pressed, show Image.HAPPY
    # If button B is pressed, show Image.SAD
    sleep(50)
`,
  hints: [
    "button_a.is_pressed() is True while button A is held down.",
    "if button_a.is_pressed():  then, indented underneath, display.show(Image.HAPPY)",
    "Add a second if for button_b with Image.SAD.",
  ],
  cases: [
    boardCase(
      "A then B",
      { duration: 4000, events: [{ at: 500, do: "press_a", hold: 300 }, { at: 2000, do: "press_b", hold: 300 }] },
      (trace) => expectAt(trace, 1500, HAPPY, "After button A is pressed") ?? expectAt(trace, 3500, SAD, "After button B is pressed"),
    ),
    boardCase(
      "B then A",
      { duration: 4000, events: [{ at: 500, do: "press_b", hold: 300 }, { at: 2000, do: "press_a", hold: 300 }] },
      (trace) => expectAt(trace, 1500, SAD, "After button B is pressed") ?? expectAt(trace, 3500, HAPPY, "After button A is pressed"),
    ),
  ],
};

// ---- 3. Ike keeps count (Year 5, Term 1, Week 4) --------------------------------

const counter: Exercise = {
  id: "mb-counter",
  group: "micro:bit",
  lesson: "Year 5, Term 1, Week 4",
  title: "Ike keeps count",
  summary: "Count button presses in a variable.",
  instructions: [
    "A variable remembers a number. Make a counter: every time button A is pressed, the number goes up by one and the micro:bit shows it. Button B sets the count back to 0.",
    "Show the number with display.show(count). It starts at 0.",
  ],
  starter: `${HEADER}
count = 0
display.show(count)

while True:
    # When A is pressed: add 1 to count and show it
    # When B is pressed: set count to 0 and show it
    sleep(50)
`,
  hints: [
    "button_a.was_pressed() is True once for every press, even a quick one.",
    "count = count + 1  adds one to the variable. Then display.show(count).",
    "if button_b.was_pressed():  count = 0  display.show(count)",
  ],
  cases: [
    boardCase(
      "Three presses of A",
      { duration: 4000, events: [{ at: 400, do: "press_a" }, { at: 1000, do: "press_a" }, { at: 1600, do: "press_a" }] },
      (trace) =>
        expectAt(trace, 300, digitLeds(0), "At the start") ??
        expectAt(trace, 800, digitLeds(1), "After one press of A") ??
        expectAt(trace, 1300, digitLeds(2), "After two presses of A") ??
        expectAt(trace, 3000, digitLeds(3), "After three presses of A"),
    ),
    boardCase(
      "B sets it back to 0",
      { duration: 4000, events: [{ at: 400, do: "press_a" }, { at: 1000, do: "press_a" }, { at: 1800, do: "press_b" }, { at: 2500, do: "press_a" }] },
      (trace) => expectAt(trace, 1500, digitLeds(2), "After two presses of A") ?? expectAt(trace, 2200, digitLeds(0), "After B") ?? expectAt(trace, 3500, digitLeds(1), "After A is pressed again"),
    ),
  ],
};

// ---- 4. Light level detective (Year 5, Term 2, Week 2) --------------------------

const lightDetective: Exercise = {
  id: "mb-light",
  group: "micro:bit",
  lesson: "Year 5, Term 2, Week 2",
  title: "Light level detective",
  summary: "Read the light sensor and decide.",
  instructions: [
    "The 25 lights can also work as a light sensor: display.read_light_level() gives a number from 0 (dark) to 255 (bright).",
    "Show a happy face (Image.HAPPY) when the light level is 60 or more, and a sleeping face (Image.ASLEEP) when it is below 60. Move the Light level slider to try it.",
  ],
  starter: `${HEADER}
while True:
    level = display.read_light_level()
    # If level is below 60 show Image.ASLEEP, otherwise show Image.HAPPY
    sleep(100)
`,
  hints: [
    "Use if level < 60: ... else: ...",
    "Inside each part, indent a display.show(...) line.",
    "if level < 60:  display.show(Image.ASLEEP)  else:  display.show(Image.HAPPY)",
  ],
  cases: [
    boardCase(
      "Bright, dark, bright",
      {
        duration: 4000,
        events: [{ at: 0, do: "set", light: 200 }, { at: 1200, do: "set", light: 15 }, { at: 2600, do: "set", light: 180 }],
      },
      (trace) =>
        expectAt(trace, 900, HAPPY, "In bright light") ??
        expectAt(trace, 2200, ASLEEP, "In the dark") ??
        expectAt(trace, 3800, HAPPY, "When the light comes back"),
    ),
    boardCase(
      "Right on the line",
      { duration: 2000, events: [{ at: 0, do: "set", light: 60 }, { at: 800, do: "set", light: 59 }] },
      (trace) => expectAt(trace, 600, HAPPY, "At a light level of 60") ?? expectAt(trace, 1800, ASLEEP, "At a light level of 59"),
    ),
  ],
};

// ---- 5. Shake dice (Year 6) ------------------------------------------------------

const dice: Exercise = {
  id: "mb-dice",
  group: "micro:bit",
  lesson: "Year 6, Term 1, Week 3",
  title: "Shake the dice",
  summary: "Pick a random number when the micro:bit is shaken.",
  instructions: [
    "Turn the micro:bit into a dice. When it is shaken, show a random whole number from 1 to 6.",
    "Press Shake on the board to try it. The random module is ready for you to use.",
  ],
  starter: `${HEADER}import random

display.show("?")
while True:
    # When the micro:bit is shaken, show a random number from 1 to 6
    sleep(100)
`,
  hints: [
    "accelerometer.was_gesture('shake') is True once after the micro:bit has been shaken.",
    "random.randint(1, 6) gives a random whole number from 1 to 6, including both ends.",
    "if accelerometer.was_gesture('shake'):  display.show(random.randint(1, 6))",
  ],
  cases: [
    boardCase(
      "Eight shakes",
      {
        duration: 12000,
        events: Array.from({ length: 8 }, (_, i) => ({ at: 800 + i * 1400, do: "gesture" as const, name: "shake" as const })),
      },
      (trace) => {
        const seen = new Set<number>();
        for (let i = 0; i < 8; i += 1) {
          const leds = ledsAt(trace, 800 + i * 1400 + 900);
          const digit = [1, 2, 3, 4, 5, 6].find((d) => digitLeds(d) === leds);
          if (digit === undefined) return `After shake ${i + 1} the lights should show a number from 1 to 6, but they show ${describeLeds(leds)}.`;
          seen.add(digit);
        }
        if (seen.size < 2) return "The dice showed the same number every time. Use random.randint(1, 6) so it changes.";
        return null;
      },
    ),
    boardCase("No shake, no roll", { duration: 2000, events: [] }, (trace) => {
      const leds = ledsAt(trace, 1800);
      return [1, 2, 3, 4, 5, 6].some((d) => digitLeds(d) === leds) ? "The dice showed a number without being shaken. It should only roll when shaken." : null;
    }),
  ],
};

// ---- 6. Temperature alert (Year 5, Term 2, Week 4) ------------------------------

const hot: Exercise = {
  id: "mb-hot",
  group: "micro:bit",
  lesson: "Year 5, Term 2, Week 4",
  title: "If it's hot…",
  summary: "Use the temperature sensor to give a warning.",
  instructions: [
    "temperature() gives the temperature in degrees Celsius.",
    "Show a surprised face (Image.SURPRISED) when it is 30 degrees or more, and a happy face (Image.HAPPY) when it is cooler. Move the Temperature slider to try it.",
  ],
  starter: `${HEADER}
while True:
    heat = temperature()
    # 30 or more: show Image.SURPRISED. Otherwise: show Image.HAPPY
    sleep(200)
`,
  hints: [
    "Use if heat >= 30: ... else: ...",
    ">= means 'greater than or equal to', so exactly 30 counts as hot.",
    "if heat >= 30:  display.show(Image.SURPRISED)  else:  display.show(Image.HAPPY)",
  ],
  cases: [
    boardCase(
      "Cool, hot, cool",
      { duration: 4500, events: [{ at: 0, do: "set", temp: 22 }, { at: 1200, do: "set", temp: 34 }, { at: 2800, do: "set", temp: 25 }] },
      (trace) => expectAt(trace, 900, HAPPY, "At 22 degrees") ?? expectAt(trace, 2400, SURPRISED, "At 34 degrees") ?? expectAt(trace, 4200, HAPPY, "At 25 degrees"),
    ),
    boardCase(
      "Exactly 30",
      { duration: 2000, events: [{ at: 0, do: "set", temp: 30 }, { at: 800, do: "set", temp: 29 }] },
      (trace) => expectAt(trace, 600, SURPRISED, "At exactly 30 degrees") ?? expectAt(trace, 1800, HAPPY, "At 29 degrees"),
    ),
  ],
};

// ---- 7. Ike's music box (Year 5, Term 2, Week 1) ---------------------------------

const musicBox: Exercise = {
  id: "mb-music",
  group: "micro:bit",
  lesson: "Year 5, Term 2, Week 1",
  title: "Ike's music box",
  summary: "Play notes through the speaker.",
  instructions: [
    "The micro:bit can play notes. Import the music module and play three notes, C, D and E, when button A is pressed. Turn the sound on (the Mute box must be empty) to hear them.",
    "A note looks like 'c4' (the letter, then the octave). Add a colon and a length, like 'c4:4'.",
  ],
  starter: `${HEADER}import music

while True:
    # When A is pressed, play C, then D, then E
    sleep(50)
`,
  hints: [
    "music.play(['c4:4', 'd4:4', 'e4:4']) plays a list of notes, one after another.",
    "Put it inside: if button_a.was_pressed():",
    "if button_a.was_pressed():  music.play(['c4:4', 'd4:4', 'e4:4'])",
  ],
  cases: [
    boardCase("Press A once", { duration: 4000, events: [{ at: 500, do: "press_a" }] }, (trace) => {
      const notes = trace.sounds.map((s) => s.frequency);
      if (notes.length === 0) return "No sound was played. Use music.play(...) when button A is pressed.";
      if (trace.sounds[0].t < 500) return "The music played before button A was pressed.";
      const expected = [262, 294, 330];
      if (notes.length !== 3 || notes.some((f, i) => f !== expected[i])) {
        return `It should play three notes, C, D and E ('c4', 'd4', 'e4'), but it played ${notes.length} note${notes.length === 1 ? "" : "s"}.`;
      }
      return null;
    }),
    boardCase("Never pressed", { duration: 2000, events: [] }, (trace) =>
      trace.sounds.length > 0 ? "A sound played without a button press. The music should only play when A is pressed." : null,
    ),
  ],
};

// ---- 8. Scroll a message (Year 5, Term 1, Week 1) ---------------------------------

const scroll: Exercise = {
  id: "mb-scroll",
  group: "micro:bit",
  lesson: "Year 5, Term 1, Week 1",
  title: "Scroll a message",
  summary: "Move words across the lights.",
  instructions: [
    "Numbers fit on the 25 lights, but words are too wide, so the micro:bit scrolls them from right to left.",
    "Make the micro:bit scroll the word RHINO once, then stop.",
  ],
  starter: `${HEADER}
# Scroll the word RHINO across the lights
`,
  hints: [
    "display.scroll(...) moves text across the lights.",
    "Text goes inside quotes: display.scroll(\"Hello\").",
    'display.scroll("RHINO")',
  ],
  cases: [
    boardCase("Scrolls RHINO", { events: [], duration: 20000 }, (trace) => {
      if (trace.frames.length === 0) return "Nothing was shown on the lights. Use display.scroll(...).";
      if (trace.frames.length < 20) return "That is too short to be the word RHINO. Check that you scrolled the whole word, in capitals.";
      if (trace.frames.length > 120) return "That scrolled for too long. Scroll the word RHINO once.";
      if (trace.leds !== "0".repeat(25)) return "When the word has gone past, the lights should be empty.";
      return null;
    }),
  ],
};

// ---- 9. Forever and count (Year 5, Term 1, Week 3) --------------------------------

const foreverCount: Exercise = {
  id: "mb-forever",
  group: "micro:bit",
  lesson: "Year 5, Term 1, Week 3",
  title: "Forever and count",
  summary: "Count the seconds on the lights.",
  instructions: [
    "A loop that never ends lets the micro:bit keep working. Build a seconds counter: it shows 1 after one second, 2 after two seconds, and so on. It only needs to count up to 9.",
    "sleep(1000) waits one second (1000 milliseconds).",
  ],
  starter: `${HEADER}
count = 0
while count < 9:
    sleep(100)  # this waits only a tenth of a second: change it to one second
    # Then add 1 to count and show it
`,
  hints: [
    "Do the steps in order: sleep(1000), then count = count + 1, then display.show(count).",
    "Change the sleep to 1000, then add the other two lines underneath, indented the same.",
    "sleep(1000)  count = count + 1  display.show(count)",
  ],
  cases: [
    boardCase("Counts the seconds", { events: [], duration: 12000 }, (trace) =>
      expectAt(trace, 1500, digitLeds(1), "After one second") ??
      expectAt(trace, 3500, digitLeds(3), "After three seconds") ??
      expectAt(trace, 6500, digitLeds(6), "After six seconds") ??
      expectAt(trace, 11000, digitLeds(9), "After nine seconds"),
    ),
  ],
};

// ---- 10. Ike's smart night light (Year 5, Term 2, Week 9) ---------------------------

const nightLight: Exercise = {
  id: "mb-night-light",
  group: "micro:bit",
  lesson: "Year 5, Term 2, Week 9",
  title: "Ike's smart night light",
  summary: "Switch every light on when it gets dark.",
  instructions: [
    "Make a night light. When the light level is below 50 (dark), switch all 25 lights on at full brightness. When it is 50 or more, switch them all off.",
    "Image('99999:99999:99999:99999:99999') is a picture with every light at brightness 9. display.clear() switches them all off.",
  ],
  starter: `${HEADER}
while True:
    level = display.read_light_level()
    # Dark (below 50): all lights on. Otherwise: all lights off.
    sleep(100)
`,
  hints: [
    "if level < 50:  then display.show(...) for the full picture, else:  display.clear()",
    "The full picture is Image('99999:99999:99999:99999:99999').",
    "if level < 50:  display.show(Image('99999:99999:99999:99999:99999'))  else:  display.clear()",
  ],
  cases: [
    boardCase(
      "Day, night, day",
      { duration: 4000, events: [{ at: 0, do: "set", light: 180 }, { at: 1200, do: "set", light: 10 }, { at: 2600, do: "set", light: 150 }] },
      (trace) =>
        (ledsAt(trace, 900) === "0".repeat(25) ? null : "In daylight, all the lights should be off.") ??
        (ledsAt(trace, 2200) === "9".repeat(25) ? null : "In the dark, all 25 lights should be on at full brightness (9).") ??
        (ledsAt(trace, 3800) === "0".repeat(25) ? null : "When the light comes back, all the lights should go off."),
    ),
    boardCase("Right on the line", { duration: 2000, events: [{ at: 0, do: "set", light: 50 }, { at: 800, do: "set", light: 49 }] }, (trace) =>
      (ledsAt(trace, 600) === "0".repeat(25) ? null : "At a light level of 50 the lights should be off.") ??
      (ledsAt(trace, 1800) === "9".repeat(25) ? null : "At a light level of 49 the lights should be on."),
    ),
  ],
};

// ---- 11. Send a message (Year 6) --------------------------------------------------

const radioSend: Exercise = {
  id: "mb-radio-send",
  group: "micro:bit",
  lesson: "Year 6, Term 2, Week 1",
  title: "Send a message",
  summary: "Send words to another micro:bit by radio.",
  instructions: [
    "A micro:bit can talk to other micro:bits with its radio. The radio starts switched off, so a program has to switch it on first.",
    "When button A is pressed, send the message hello. When button B is pressed, send the message bye. Because your program uses the radio, Code Studio shows two boards. A message sent on board 1 arrives on board 2.",
  ],
  starter: `${HEADER}import radio

radio.on()
while True:
    # A: send "hello"      B: send "bye"
    sleep(50)
`,
  hints: [
    "radio.send(\"hello\") sends the words inside the quotes.",
    "Use if button_a.was_pressed(): and then, indented underneath, radio.send(...).",
    'if button_a.was_pressed():  radio.send("hello")  if button_b.was_pressed():  radio.send("bye")',
  ],
  cases: [
    boardCase(
      "A then B",
      { duration: 4000, events: [{ at: 500, do: "press_a" }, { at: 1500, do: "press_b" }] },
      (trace) => {
        const sent = trace.radio.map((m) => m.text);
        if (sent.length === 0) return "No message was sent. Use radio.send(...) when a button is pressed.";
        if (sent[0] !== "hello") return `After button A, the message should be hello, but it was ${sent[0] === null ? "not text" : sent[0]}.`;
        if (sent.length < 2) return "Button B should send the message bye.";
        if (sent[1] !== "bye") return `After button B, the message should be bye, but it was ${sent[1] === null ? "not text" : sent[1]}.`;
        if (sent.length > 2) return "Only two messages should be sent: one for A, one for B.";
        return null;
      },
    ),
    boardCase("No buttons, no messages", { duration: 1500, events: [] }, (trace) =>
      trace.radio.length > 0 ? "A message was sent without a button press. Send only when A or B is pressed." : null,
    ),
  ],
};

// ---- 12. Receive a message (Year 6) ------------------------------------------------

const radioReceive: Exercise = {
  id: "mb-radio-receive",
  group: "micro:bit",
  lesson: "Year 6, Term 2, Week 2",
  title: "Receive a message",
  summary: "Show a picture for each message that arrives.",
  instructions: [
    "radio.receive() gives the next message that has arrived, or None if there is nothing new. Always check for None before you use it.",
    "When the message happy arrives, show a happy face. When sad arrives, show a sad face. Ignore any other message.",
  ],
  starter: `${HEADER}import radio

radio.on()
while True:
    message = radio.receive()
    # If message is "happy": show Image.HAPPY. If it is "sad": show Image.SAD.
    sleep(50)
`,
  hints: [
    "When nothing has arrived, message is None. Comparing None with \"happy\" is just False, so a plain if message == \"happy\": is safe.",
    "Add a second if (or elif) for \"sad\".",
    'if message == "happy":  display.show(Image.HAPPY)  elif message == "sad":  display.show(Image.SAD)',
  ],
  cases: [
    boardCase(
      "Happy, sad, junk, happy",
      {
        duration: 6000,
        events: [
          { at: 500, do: "radio", text: "happy" },
          { at: 1500, do: "radio", text: "sad" },
          { at: 2500, do: "radio", text: "hello there" },
          { at: 3500, do: "radio", text: "happy" },
        ],
      },
      (trace) =>
        expectAt(trace, 1000, HAPPY, "After the message happy") ??
        expectAt(trace, 2000, SAD, "After the message sad") ??
        expectAt(trace, 3000, SAD, "After a message it does not know (it should change nothing)") ??
        expectAt(trace, 5000, HAPPY, "After the message happy again"),
    ),
  ],
};

// ---- 13. A secret group (Year 6) ---------------------------------------------------

const radioGroup: Exercise = {
  id: "mb-radio-group",
  group: "micro:bit",
  lesson: "Year 6, Term 2, Week 3",
  title: "A secret group",
  summary: "Only listen to micro:bits in your group.",
  instructions: [
    "Many micro:bits in one room can all use the radio. A group number keeps your messages apart: a micro:bit only hears messages from its own group.",
    "Put this micro:bit in group 5. Show a heart whenever any message arrives, and ignore messages sent to other groups.",
  ],
  starter: `${HEADER}import radio

radio.on()
# Put the radio in group 5
while True:
    message = radio.receive()
    # When a message arrives, show Image.HEART
    sleep(50)
`,
  hints: [
    "radio.config(group=5) sets the group. Do it once, before the loop.",
    "if message is not None:  then display.show(Image.HEART).",
    "radio.config(group=5)  ...  if message is not None:  display.show(Image.HEART)",
  ],
  cases: [
    boardCase(
      "Another group, then group 5",
      { duration: 4000, events: [{ at: 500, do: "radio", text: "hi", group: 0 }, { at: 1500, do: "radio", text: "psst", group: 3 }, { at: 2500, do: "radio", text: "hi", group: 5 }] },
      (trace) =>
        expectAt(trace, 2000, "0".repeat(25), "After messages from other groups") ?? expectAt(trace, 3500, HEART, "After a message from group 5"),
    ),
  ],
};

export const MICROBIT_EXERCISES: Exercise[] = [hello, scroll, buttons, counter, foreverCount, lightDetective, hot, nightLight, musicBox, dice, radioSend, radioReceive, radioGroup];
