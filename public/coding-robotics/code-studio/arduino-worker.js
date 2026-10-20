// Rhinox Code Studio: the Arduino simulator's worker.
//
// It runs the language engine (arduino-vm.js) in its own thread, away from the page.
// A learner's program is only ever read by that engine; it is never run as JavaScript.
// The only ways out of here are the messages below, and the page checks every one of them.
// Inputs (buttons, dials, touch pads, the pretend router) come from a shared buffer the page
// writes; delay() sleeps for real, so a blinking LED blinks at the speed the program says.
// There is no real network: Wi-Fi is a pretend chip (arduino-boards.js).
import { ANALOG_BASE, INPUT_SLOTS, PIN_COUNT, ROUTER_SLOT, TOUCH_TOUCHED, TOUCH_UNTOUCHED, WifiSim, boardById, canPwm, dialIndex } from "./arduino-boards.js";
import { ArduinoError, Machine, simulate } from "./arduino-vm.js";

const MAX_CODE_CHARS = 30000;
const MAX_SERIAL_CHARS = 100000;
const FLUSH_MS = 16;

let started = false;

self.onmessage = (event) => {
  const data = event.data;
  if (!started && data && data.kind === "simulate" && typeof data.code === "string" && data.code.length <= MAX_CODE_CHARS && data.script && typeof data.script === "object") {
    started = true;
    // A scripted run on a pretend clock, for exercise checks.
    const result = simulate(data.code, data.script, data.board === "esp32" ? "esp32" : "uno");
    self.postMessage({ kind: "trace", error: result.error, line: result.line, trace: result.trace });
    return;
  }
  if (started || !data || data.kind !== "run" || typeof data.code !== "string" || data.code.length > MAX_CODE_CHARS) return;
  if (!(data.shared instanceof SharedArrayBuffer) || data.shared.byteLength !== INPUT_SLOTS * 4) return;
  started = true;
  runProgram(data.code, new Int32Array(data.shared), boardById(data.board));
};

function runProgram(code, input, board) {
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
  let lastWifi = -1;
  let lastSsid = "";

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

  const wifiChip = new WifiSim(() => performance.now() - t0, () => Atomics.load(input, ROUTER_SLOT) === 1);
  const noteWifi = () => {
    const code = wifiChip.code;
    const ssid = wifiChip.ssid();
    if (code !== lastWifi || ssid !== lastSsid) {
      lastWifi = code;
      lastSsid = ssid;
      post({ kind: "wifi", status: code, ssid });
    }
  };

  const host = {
    pinMode(pin, m) {
      if (m === 1 && board.inputOnly.includes(pin)) return;
      mode[pin] = m === 1 ? 1 : m === 2 || m === 3 ? m : 0;
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
      } else if (value && mode[pin] === 0) {
        mode[pin] = 2; // like the real chip: writing HIGH to an input turns its pull-up on
      }
      dirty = true;
      flush(false);
    },
    digitalRead(pin) {
      if (mode[pin] === 1) return level[pin];
      const d = dialIndex(board, pin);
      if (d >= 0) return Atomics.load(input, ANALOG_BASE + d) >= (board.adcMax + 1) / 2 ? 1 : 0;
      const pressed = Atomics.load(input, pin) === 1;
      // The kit's buttons join the pin to ground when held: with the pull-up on, held reads LOW.
      // Without it, the pin is tied to the supply through the button, so held reads HIGH.
      return mode[pin] === 2 ? (pressed ? 0 : 1) : pressed ? 1 : 0;
    },
    analogRead(pin) {
      const d = dialIndex(board, pin);
      return d < 0 ? 0 : Math.max(0, Math.min(board.adcMax, Atomics.load(input, ANALOG_BASE + d)));
    },
    touchRead(pin) {
      return board.touchPins.includes(pin) && Atomics.load(input, pin) === 1 ? TOUCH_TOUCHED : TOUCH_UNTOUCHED;
    },
    analogWrite(pin, value) {
      if (mode[pin] !== 1) return;
      if (canPwm(board, pin)) {
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
      if (pin !== board.buzzerPin) return;
      const now = performance.now();
      if (now - toneWindow > 1000) {
        toneWindow = now;
        toneCount = 0;
      }
      toneCount += 1;
      if (toneCount <= 60) post({ kind: "tone", f: Math.min(20000, frequency), ms: Math.min(60000, ms) });
    },
    noTone(pin) {
      if (pin === board.buzzerPin) post({ kind: "tone", f: 0, ms: 0 });
    },
    serial(text) {
      serialTotal += text.length;
      if (serialTotal > MAX_SERIAL_CHARS) throw new ArduinoError("the Serial Monitor is full: too much text was printed");
      serialBuffer += text;
      if (serialBuffer.length > 2000) flushSerial();
      else flush(false);
    },
    wifi: {
      mode() {},
      begin(ssid, pass) {
        wifiChip.begin(ssid, pass);
        noteWifi();
      },
      status() {
        const code = wifiChip.status();
        noteWifi();
        return code;
      },
      ip: () => (wifiChip.status(), noteWifi(), wifiChip.ip()),
      ssid: () => (wifiChip.status(), noteWifi(), wifiChip.ssid()),
      rssi: () => (wifiChip.status(), noteWifi(), wifiChip.rssi()),
      disconnect() {
        wifiChip.disconnect();
        noteWifi();
      },
      reconnect() {
        wifiChip.reconnect();
      },
    },
    delay: sleep,
    micros: () => (performance.now() - t0) * 1000,
    step() {},
  };

  let error = null;
  let line = 0;
  try {
    const machine = new Machine(host, board);
    machine.load(code);
    post({ kind: "ready" });
    machine.runSetup();
    for (;;) {
      sleptThisLoop = false;
      machine.runLoop();
      // The chip keeps its Wi-Fi going between the program's calls.
      if (wifiChip.target) {
        wifiChip.tick();
        noteWifi();
      }
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
