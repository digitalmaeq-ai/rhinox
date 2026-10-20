// Rhinox Code Studio: the Arduino simulator's worker.
//
// It runs the language engine (arduino-vm.js) in its own thread, away from the page.
// A learner's program is only ever read by that engine; it is never run as JavaScript.
// The only ways out of here are the messages below, and the page checks every one of them.
// Inputs (buttons, dials) come from a shared buffer the page writes; delay() sleeps
// for real, so a blinking LED blinks at the speed the program says.
import { ArduinoError, Machine } from "./arduino-vm.js";

const PIN_COUNT = 20;
const BUTTON_PINS = new Set([2, 3]);
const PWM_PINS = new Set([3, 5, 6, 9, 10, 11]);
const ANALOG_BASE = 20;
const MAX_CODE_CHARS = 30000;
const MAX_SERIAL_CHARS = 100000;
const FLUSH_MS = 16;

let started = false;

self.onmessage = (event) => {
  const data = event.data;
  if (started || !data || data.kind !== "run" || typeof data.code !== "string" || data.code.length > MAX_CODE_CHARS) return;
  if (!(data.shared instanceof SharedArrayBuffer) || data.shared.byteLength !== 128) return;
  started = true;
  runProgram(data.code, new Int32Array(data.shared));
};

function runProgram(code, input) {
  const level = new Array(PIN_COUNT).fill(0);
  const pwm = new Array(PIN_COUNT).fill(-1);
  const mode = new Array(PIN_COUNT).fill(0);
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  const t0 = performance.now();
  let lastFlush = 0;
  let dirty = true;
  let serialBuffer = "";
  let serialTotal = 0;
  let toneCount = 0;
  let toneWindow = 0;
  let sleptThisLoop = false;

  const post = (message) => self.postMessage(message);
  const flushSerial = () => {
    if (serialBuffer) {
      post({ kind: "serial", text: serialBuffer });
      serialBuffer = "";
    }
  };
  const flush = (force) => {
    const now = performance.now();
    if (!force && now - lastFlush < FLUSH_MS) return;
    lastFlush = now;
    if (dirty) {
      dirty = false;
      post({ kind: "state", level: level.slice(), pwm: pwm.slice(), mode: mode.slice() });
    }
    flushSerial();
  };
  const sleep = (ms) => {
    flush(true);
    sleptThisLoop = true;
    let left = ms;
    while (left > 0) {
      const slice = Math.min(left, 200);
      Atomics.wait(sleeper, 0, 0, slice);
      left -= slice;
    }
  };

  const host = {
    pinMode(pin, m) {
      mode[pin] = m === 1 ? 1 : m === 2 ? 2 : 0;
      if (m !== 1) {
        level[pin] = 0;
        pwm[pin] = -1;
      }
      dirty = true;
      flush(false);
    },
    digitalWrite(pin, value) {
      if (mode[pin] === 1) {
        level[pin] = value;
        pwm[pin] = -1;
      } else if (value) {
        mode[pin] = mode[pin] === 0 ? 2 : mode[pin]; // like the real chip: writing HIGH to an input turns its pull-up on
      }
      dirty = true;
      flush(false);
    },
    digitalRead(pin) {
      if (mode[pin] === 1) return level[pin];
      if (pin >= 14) return input[ANALOG_BASE + pin - 14] >= 512 ? 1 : 0;
      const pressed = BUTTON_PINS.has(pin) && Atomics.load(input, pin) === 1;
      // The kit's buttons join the pin to ground when held: with the pull-up on, held reads LOW.
      // Without it, the pin is tied to 5 volts through the button, so held reads HIGH.
      return mode[pin] === 2 ? (pressed ? 0 : 1) : pressed ? 1 : 0;
    },
    analogRead(pin) {
      if (pin < 14) return 0;
      return Math.max(0, Math.min(1023, Atomics.load(input, ANALOG_BASE + pin - 14)));
    },
    analogWrite(pin, value) {
      if (mode[pin] !== 1) return;
      if (PWM_PINS.has(pin)) {
        pwm[pin] = value;
        level[pin] = value > 0 ? 1 : 0;
      } else {
        level[pin] = value >= 128 ? 1 : 0;
        pwm[pin] = -1;
      }
      dirty = true;
      flush(false);
    },
    tone(pin, frequency, ms) {
      if (pin !== 8) return;
      const now = performance.now();
      if (now - toneWindow > 1000) {
        toneWindow = now;
        toneCount = 0;
      }
      toneCount += 1;
      if (toneCount <= 60) post({ kind: "tone", f: Math.min(20000, frequency), ms: Math.min(60000, ms) });
    },
    noTone(pin) {
      if (pin === 8) post({ kind: "tone", f: 0, ms: 0 });
    },
    serial(text) {
      serialTotal += text.length;
      if (serialTotal > MAX_SERIAL_CHARS) throw new ArduinoError("the Serial Monitor is full: too much text was printed");
      serialBuffer += text;
      if (serialBuffer.length > 2000) flushSerial();
      else flush(false);
    },
    delay: sleep,
    micros: () => (performance.now() - t0) * 1000,
    step() {},
  };

  let error = null;
  let line = 0;
  try {
    const machine = new Machine(host);
    machine.load(code);
    post({ kind: "ready" });
    machine.runSetup();
    for (;;) {
      sleptThisLoop = false;
      machine.runLoop();
      flush(false);
      // A loop() that never waits would spin the processor; the real board is slow enough that this never shows.
      if (!sleptThisLoop) Atomics.wait(sleeper, 0, 0, 1);
    }
  } catch (e) {
    if (e instanceof ArduinoError) {
      error = e.message;
      line = e.line || 0;
    } else {
      error = "the simulator stopped unexpectedly";
    }
  }
  flush(true);
  post({ kind: "done", error, line });
}
