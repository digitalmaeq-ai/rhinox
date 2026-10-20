// Guided exercises for Arduino Studio. Each one has a task, a starter, hints and checks.
// A check runs the learner's program on a pretend clock with a script of button presses and
// dial turns, then looks at what the board did. It returns null when the program did the right
// thing, or a short sentence saying what went wrong. The kit is described in arduino.ts.
import { WL, levelAt, serialOf, type BoardId, type SimScript, type SimTrace } from "./arduino";

export type ArduinoCase = {
  name: string;
  script: SimScript;
  expect: (trace: SimTrace) => string | null;
};

export type ArduinoExercise = {
  id: string;
  board: BoardId;
  title: string;
  task: string;
  starter: string;
  hints: string[];
  cases: ArduinoCase[];
};

const press = (t: number, pin: number, ms: number) => [
  { t, pin, down: true },
  { t: t + ms, pin, down: false },
];

function toggles(trace: SimTrace, pin: number): number[] {
  return trace.pins.filter((e) => e.pin === pin).map((e) => e.t);
}

function lit(trace: SimTrace, pin: number, t: number, want: boolean, what: string): string | null {
  const on = levelAt(trace, pin, t) > 0;
  return on === want ? null : `At ${(t / 1000).toFixed(1)} seconds ${what} should be ${want ? "on" : "off"}, but it was ${on ? "on" : "off"}.`;
}

export const ARDUINO_EXERCISES: ArduinoExercise[] = [
  {
    id: "ar-blink-fast",
    board: "uno",
    title: "Blink faster",
    task: "Make the built-in LED (pin 13) blink quickly: on for 250 milliseconds, then off for 250 milliseconds, over and over.",
    starter: `void setup() {
  // set pin 13 to OUTPUT here
}

void loop() {
  // turn the LED on, wait, turn it off, wait
}
`,
    hints: ["pinMode(13, OUTPUT); goes in setup().", "delay(250); waits a quarter of a second.", "Use digitalWrite(13, HIGH); and digitalWrite(13, LOW);"],
    cases: [
      {
        name: "The LED blinks every 250 milliseconds",
        script: { duration: 3000, events: [] },
        expect: (trace) => {
          const t = toggles(trace, 13);
          if (t.length < 4) return "The LED did not blink. Did you set pin 13 to OUTPUT and write HIGH and LOW?";
          const gaps = t.slice(1).map((v, i) => v - t[i]);
          const bad = gaps.find((g) => Math.abs(g - 250) > 30);
          return bad === undefined ? null : `The LED changed after ${bad} milliseconds. It should change every 250.`;
        },
      },
    ],
  },
  {
    id: "ar-button-led",
    board: "uno",
    title: "Button lights the red LED",
    task: "The red LED (pin 12) should be on only while the button on pin 2 is held. The button joins the pin to ground, so use INPUT_PULLUP: a held button reads LOW.",
    starter: `void setup() {
  pinMode(12, OUTPUT);
  // set up the button on pin 2
}

void loop() {
  // if the button is held, light the LED; otherwise turn it off
}
`,
    hints: ["pinMode(2, INPUT_PULLUP);", "if (digitalRead(2) == LOW) { ... } else { ... }"],
    cases: [
      {
        name: "The LED follows the button",
        script: { duration: 3000, events: press(1000, 2, 800) },
        expect: (trace) => lit(trace, 12, 500, false, "the red LED") ?? lit(trace, 12, 1500, true, "the red LED") ?? lit(trace, 12, 2500, false, "the red LED"),
      },
    ],
  },
  {
    id: "ar-traffic",
    board: "uno",
    title: "Traffic lights",
    task: "Red (pin 12) for 2 seconds, then green (pin 10) for 2 seconds, then yellow (pin 11) for 1 second, then repeat. Only one light is on at a time.",
    starter: `void setup() {
  // set the three LED pins to OUTPUT
}

void loop() {
  // red, green, yellow
}
`,
    hints: ["Turn the old light off before the next one comes on.", "Use delay(2000); for two seconds."],
    cases: [
      {
        name: "The lights follow the pattern",
        script: { duration: 6000, events: [] },
        expect: (trace) =>
          lit(trace, 12, 1000, true, "red") ??
          lit(trace, 10, 1000, false, "green") ??
          lit(trace, 12, 3000, false, "red") ??
          lit(trace, 10, 3000, true, "green") ??
          lit(trace, 11, 4500, true, "yellow") ??
          lit(trace, 10, 4500, false, "green") ??
          lit(trace, 12, 5500, true, "red (the pattern should repeat)"),
      },
    ],
  },
  {
    id: "ar-dimmer",
    board: "uno",
    title: "Dial dims the blue LED",
    task: "Read the dial on A0 (0 to 1023) and use it to set the brightness of the blue LED on pin 9 (analogWrite takes 0 to 255). Turn the dial all the way down and the LED is off; all the way up and it is fully bright.",
    starter: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  // read A0, turn it into 0 to 255, write it to pin 9
  delay(20);
}
`,
    hints: ["int reading = analogRead(A0);", "map(reading, 0, 1023, 0, 255) scales the number.", "analogWrite(9, brightness);"],
    cases: [
      {
        name: "Brightness follows the dial",
        script: {
          duration: 3000,
          events: [
            { t: 500, dial: 0, value: 0 },
            { t: 1200, dial: 0, value: 1023 },
            { t: 2000, dial: 0, value: 512 },
          ],
        },
        expect: (trace) => {
          const a = levelAt(trace, 9, 1000);
          const b = levelAt(trace, 9, 1800);
          const c = levelAt(trace, 9, 2800);
          if (a > 0.02) return "With the dial at 0 the LED should be off.";
          if (b < 0.98) return "With the dial at 1023 the LED should be fully bright (255).";
          if (Math.abs(c - 0.5) > 0.03) return "With the dial in the middle the LED should be about half bright.";
          return null;
        },
      },
    ],
  },
  {
    id: "ar-serial-count",
    board: "uno",
    title: "Count to five",
    task: "Print the numbers 1, 2, 3, 4, 5 to the Serial Monitor, one per line, one second apart, starting at once. After 5, stop printing (the program can keep running).",
    starter: `int count = 1;

void setup() {
  Serial.begin(9600);
}

void loop() {
  // print count, add one, wait one second
}
`,
    hints: ["Serial.println(count); prints on its own line.", "count = count + 1;", "Only print while count <= 5."],
    cases: [
      {
        name: "Serial shows 1 to 5, a second apart",
        script: { duration: 8000, events: [] },
        expect: (trace) => {
          const text = serialOf(trace).replace(/\r/g, "");
          if (text.trim() !== "1\n2\n3\n4\n5") return `Serial should show 1, 2, 3, 4, 5 and nothing else. It showed: ${JSON.stringify(text.slice(0, 40))}`;
          const times = trace.serial.filter((e) => /\d/.test(e.text)).map((e) => e.t);
          const gap = times[1] - times[0];
          return Math.abs(gap - 1000) <= 100 ? null : "The numbers should be one second apart.";
        },
      },
    ],
  },
  {
    id: "ar-toggle",
    board: "uno",
    title: "Press to switch",
    task: "Each press of the button on pin 3 switches the green LED (pin 10): on, off, on, off. The LED must change once per press, not while the button is held.",
    starter: `bool ledOn = false;
bool wasDown = false;

void setup() {
  pinMode(10, OUTPUT);
  pinMode(3, INPUT_PULLUP);
}

void loop() {
  // notice the moment the button goes down, then flip ledOn
  delay(10);
}
`,
    hints: ["bool down = (digitalRead(3) == LOW);", "Flip only when down is true and wasDown is false.", "ledOn = !ledOn; digitalWrite(10, ledOn); wasDown = down;"],
    cases: [
      {
        name: "One press, one change",
        script: { duration: 4000, events: [...press(500, 3, 600), ...press(1700, 3, 600), ...press(2900, 3, 300)] },
        expect: (trace) =>
          lit(trace, 10, 300, false, "the green LED") ??
          lit(trace, 10, 1000, true, "the green LED (after press 1)") ??
          lit(trace, 10, 1500, true, "the green LED (it must stay on while you are not pressing)") ??
          lit(trace, 10, 2200, false, "the green LED (after press 2)") ??
          lit(trace, 10, 3500, true, "the green LED (after press 3)"),
      },
    ],
  },
  {
    id: "ar-alarm",
    board: "uno",
    title: "Light alarm",
    task: "When the dial on A1 is above 600, the red LED (pin 12) is on and the buzzer (pin 8) plays 880 Hz. When it is 600 or below, the LED is off and the buzzer is quiet.",
    starter: `void setup() {
  pinMode(12, OUTPUT);
}

void loop() {
  // read A1 and decide
  delay(50);
}
`,
    hints: ["int level = analogRead(A1);", "tone(8, 880); starts the buzzer and noTone(8); stops it.", "if (level > 600) { ... } else { ... }"],
    cases: [
      {
        name: "Alarm on and off",
        script: { duration: 3000, events: [{ t: 500, dial: 1, value: 200 }, { t: 1200, dial: 1, value: 900 }, { t: 2200, dial: 1, value: 300 }] },
        expect: (trace) => {
          const first = lit(trace, 12, 900, false, "the red LED") ?? lit(trace, 12, 1800, true, "the red LED");
          if (first) return first;
          const sounded = trace.tones.some((e) => e.f === 880 && e.t >= 1200 && e.t <= 1800);
          if (!sounded) return "When the dial is high, the buzzer should play 880 Hz.";
          const last = trace.tones[trace.tones.length - 1];
          if (last && last.f !== 0 && last.ms === 0 && last.t < 2500) return "When the dial goes back down, the buzzer should go quiet (noTone).";
          return lit(trace, 12, 2800, false, "the red LED");
        },
      },
    ],
  },
  {
    id: "ar-sum",
    board: "uno",
    title: "Add up with a loop",
    task: "Use a for loop to add the numbers 1 to 10 and print the total (it should print 55) once, in setup().",
    starter: `void setup() {
  Serial.begin(9600);
  int total = 0;
  // add 1 to 10 with a for loop
  Serial.println(total);
}

void loop() {
}
`,
    hints: ["for (int i = 1; i <= 10; i++) { ... }", "total = total + i;"],
    cases: [
      {
        name: "Serial prints 55",
        script: { duration: 500, events: [] },
        expect: (trace) => (serialOf(trace).trim() === "55" ? null : `Serial should print 55. It printed: ${JSON.stringify(serialOf(trace).slice(0, 30))}`),
      },
    ],
  },
  {
    id: "es-blink",
    board: "esp32",
    title: "ESP32: blink and report",
    task: "On the ESP32, blink the built-in LED (GPIO 2): on for 500 ms, off for 500 ms. Each time you switch it, print LED on or LED off to the Serial Monitor (the ESP32 uses Serial.begin(115200)).",
    starter: `void setup() {
  Serial.begin(115200);
  // set GPIO 2 to OUTPUT
}

void loop() {
  // on, print, wait, off, print, wait
}
`,
    hints: ["pinMode(2, OUTPUT); goes in setup().", "Serial.println(\"LED on\"); right after digitalWrite(2, HIGH);"],
    cases: [
      {
        name: "Blinks and reports",
        script: { duration: 3000, events: [] },
        expect: (trace) => {
          const t = toggles(trace, 2);
          if (t.length < 4) return "The built-in LED (GPIO 2) did not blink.";
          const gaps = t.slice(1).map((v, i) => v - t[i]);
          if (gaps.some((g) => Math.abs(g - 500) > 40)) return "The LED should change every 500 milliseconds.";
          const text = serialOf(trace).replace(/\r/g, "");
          return text.startsWith("LED on\nLED off\nLED on\n") ? null : `Serial should show LED on, LED off, LED on, ... It showed: ${JSON.stringify(text.slice(0, 40))}`;
        },
      },
    ],
  },
  {
    id: "es-touch",
    board: "esp32",
    title: "ESP32: touch switch",
    task: "Light the yellow LED (GPIO 16) while the touch pad on GPIO 4 is touched. touchRead(4) is about 70 normally and about 8 when touched, so use 40 as the dividing line.",
    starter: `void setup() {
  pinMode(16, OUTPUT);
}

void loop() {
  // read the touch pad and set the LED
  delay(50);
}
`,
    hints: ["int touch = touchRead(4);", "if (touch < 40) { ... } else { ... }"],
    cases: [
      {
        name: "The LED follows the touch pad",
        script: { duration: 3000, events: press(1000, 4, 800) },
        expect: (trace) => lit(trace, 16, 500, false, "the yellow LED") ?? lit(trace, 16, 1500, true, "the yellow LED") ?? lit(trace, 16, 2500, false, "the yellow LED"),
      },
    ],
  },
  {
    id: "es-percent",
    board: "esp32",
    title: "ESP32: dial in percent",
    task: "The dial on GPIO 34 gives 0 to 4095. Print it as a percentage (0 to 100, a whole number) on its own line, every 200 milliseconds.",
    starter: `void setup() {
  Serial.begin(115200);
}

void loop() {
  // read GPIO 34 and print the percentage
  delay(200);
}
`,
    hints: ["map(raw, 0, 4095, 0, 100) turns the reading into a percentage.", "Use Serial.println(percent);"],
    cases: [
      {
        name: "Percent follows the dial",
        script: { duration: 3000, events: [{ t: 100, dial: 0, value: 0 }, { t: 1000, dial: 0, value: 4095 }, { t: 2000, dial: 0, value: 2048 }] },
        expect: (trace) => {
          const at = (ms: number) => {
            const e = trace.serial.filter((x) => x.t <= ms && /\d/.test(x.text)).pop();
            return e ? Number(e.text.trim()) : NaN;
          };
          if (at(900) !== 0) return "With the dial at 0 it should print 0.";
          if (at(1900) !== 100) return "With the dial at 4095 it should print 100.";
          const mid = at(2900);
          return Math.abs(mid - 50) <= 1 ? null : "With the dial in the middle it should print about 50.";
        },
      },
    ],
  },
  {
    id: "es-fade",
    board: "esp32",
    title: "ESP32: fade up",
    task: "Use PWM to fade the blue LED (GPIO 18) from off to fully bright in about 2 seconds (256 steps with delay(8)), then start again. Set it up with ledcAttach(18, 5000, 8) and change it with ledcWrite(18, duty).",
    starter: `void setup() {
  // ledcAttach(pin, frequency, resolution)
}

void loop() {
  // for duty from 0 to 255: ledcWrite, delay(8)
}
`,
    hints: ["ledcAttach(18, 5000, 8); 8 bits means duty goes from 0 to 255.", "for (int duty = 0; duty <= 255; duty++) { ledcWrite(18, duty); delay(8); }"],
    cases: [
      {
        name: "Brightness rises steadily",
        script: { duration: 2400, events: [] },
        expect: (trace) => {
          const a = levelAt(trace, 18, 500);
          const b = levelAt(trace, 18, 1000);
          const c = levelAt(trace, 18, 1900);
          if (!(a > 0.1 && a < 0.4)) return "After half a second the LED should be about a quarter bright.";
          if (!(b > 0.38 && b < 0.62)) return "After one second the LED should be about half bright.";
          return c > 0.85 ? null : "After almost two seconds the LED should be nearly fully bright.";
        },
      },
    ],
  },
  {
    id: "es-wifi",
    board: "esp32",
    title: "ESP32: join the lab Wi-Fi",
    task: "Connect to the network RhinoxLab (password stem2026). Wait until WiFi.status() is WL_CONNECTED, then print Connected, then the IP address on the next line (WiFi.localIP()), and light the built-in LED (GPIO 2).",
    starter: `void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  // start Wi-Fi, wait, report
}

void loop() {
}
`,
    hints: ["WiFi.begin(\"RhinoxLab\", \"stem2026\");", "while (WiFi.status() != WL_CONNECTED) { delay(250); }", "Serial.println(WiFi.localIP());"],
    cases: [
      {
        name: "Connects and reports",
        script: { duration: 6000, events: [] },
        expect: (trace) => {
          if (!trace.wifi.some((e) => e.status === WL.CONNECTED)) return "The ESP32 never connected. Check the network name and password.";
          const text = serialOf(trace).replace(/\r/g, "");
          if (!/Connected\n192\.168\.1\.42\n/.test(text)) return `Serial should show Connected and then the IP address on the next line. It showed: ${JSON.stringify(text.slice(0, 60))}`;
          return lit(trace, 2, 5500, true, "the built-in LED");
        },
      },
    ],
  },
  {
    id: "es-wifi-light",
    board: "esp32",
    title: "ESP32: Wi-Fi status light",
    task: "Join the open network RhinoxGuest (no password: WiFi.begin(\"RhinoxGuest\")). The green LED (GPIO 17) must be on while connected and the yellow LED (GPIO 16) on while not connected. The Wi-Fi router will be switched off for a while, and your program has to notice and show it.",
    starter: `void setup() {
  pinMode(16, OUTPUT);
  pinMode(17, OUTPUT);
  // start Wi-Fi
}

void loop() {
  // show the status with the two LEDs
  delay(100);
}
`,
    hints: ["Check WiFi.status() == WL_CONNECTED in loop(), not only in setup().", "if (connected) { green on, yellow off } else { green off, yellow on }"],
    cases: [
      {
        name: "Lights follow the connection",
        script: { duration: 15000, events: [{ t: 6000, router: false }, { t: 10000, router: true }] },
        expect: (trace) =>
          lit(trace, 16, 500, true, "the yellow LED (still connecting)") ??
          lit(trace, 17, 500, false, "the green LED (still connecting)") ??
          lit(trace, 17, 4000, true, "the green LED (connected)") ??
          lit(trace, 16, 4000, false, "the yellow LED (connected)") ??
          lit(trace, 16, 8000, true, "the yellow LED (router off)") ??
          lit(trace, 17, 8000, false, "the green LED (router off)") ??
          lit(trace, 17, 14000, true, "the green LED (router back on)"),
      },
    ],
  },
  {
    id: "es-bigint",
    board: "esp32",
    title: "ESP32: big whole numbers",
    task: "On the ESP32 an int has 32 bits, so it can hold numbers over two billion (on an Uno it stops at 32767). Write a function int factorial(int n) that returns n x (n-1) x ... x 1, and print factorial(10) (it is 3628800).",
    starter: `int factorial(int n) {
  // return n times factorial of n-1, and 1 for n <= 1
  return 0;
}

void setup() {
  Serial.begin(115200);
  Serial.println(factorial(10));
}

void loop() {
}
`,
    hints: ["if (n <= 1) return 1;", "return n * factorial(n - 1);"],
    cases: [
      {
        name: "factorial(10) is 3628800",
        script: { duration: 500, events: [] },
        expect: (trace) => (serialOf(trace).trim() === "3628800" ? null : `Serial should print 3628800. It printed: ${JSON.stringify(serialOf(trace).slice(0, 30))}`),
      },
    ],
  },
];

export function getArduinoExercise(id: string | null | undefined): ArduinoExercise | undefined {
  return ARDUINO_EXERCISES.find((e) => e.id === id);
}