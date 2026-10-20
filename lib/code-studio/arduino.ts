// The page side of the Arduino simulator: the shape of the board, and the checks applied to
// everything the Arduino worker sends back. The worker is not trusted: whatever it posts is
// reduced here to plain numbers and short text before anything on the page uses it.

/** The board is an Arduino Uno with a small kit wired to it. */
export const PIN_COUNT = 20; // 0 to 13, then A0 to A5 as 14 to 19
export const BUTTON_PINS = [2, 3] as const;
export const LED_PINS = [13, 12, 11, 10, 9] as const;
export const PWM_PINS = [11, 10, 9, 6, 5, 3] as const;
export const BUZZER_PIN = 8;
export const POT_PINS = [14, 15] as const; // A0, A1

/** Slots in the shared input buffer (Int32Array). Slot p (0 to 19): 1 while the button on pin p is held. Slot 20 + a: analog input a, 0 to 1023. */
export const ANALOG_BASE = 20;
export const ARDUINO_INPUT_SLOTS = 32;
export const ARDUINO_INPUT_BYTES = ARDUINO_INPUT_SLOTS * 4;

/** The longest program, the most Serial text, and how long a live run may last. */
export const ARDUINO_MAX_CODE_CHARS = 30_000;
export const ARDUINO_MAX_SERIAL_CHARS = 100_000;
export const ARDUINO_HARD_SERIAL_CAP = 150_000;
export const ARDUINO_RUN_LIMIT_MS = 30 * 60 * 1000;
export const ARDUINO_WORKER_URL = "/coding-robotics/code-studio/arduino-worker.js";

export type PinState = {
  /** 0 or 1 for each pin, as the program last wrote it (inputs read 0). */
  level: number[];
  /** The analogWrite value for each pin, or -1 when the pin is not in PWM mode. */
  pwm: number[];
  /** 1 for OUTPUT, 0 for INPUT, 2 for INPUT_PULLUP. */
  mode: number[];
};

export type ArduinoMessage =
  | { kind: "ready" }
  | { kind: "state"; state: PinState }
  | { kind: "tone"; frequency: number; ms: number }
  | { kind: "serial"; text: string }
  | { kind: "done"; error: string | null; line: number };

export function emptyPins(): PinState {
  return { level: new Array(PIN_COUNT).fill(0), pwm: new Array(PIN_COUNT).fill(-1), mode: new Array(PIN_COUNT).fill(0) };
}

function intsIn(value: unknown, count: number, min: number, max: number): number[] | null {
  if (!Array.isArray(value) || value.length !== count) return null;
  const out: number[] = [];
  for (const v of value) {
    if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) return null;
    out.push(v);
  }
  return out;
}

/** Accepts exactly the messages the worker is meant to send; everything else is dropped. */
export function cleanArduinoMessage(data: unknown): ArduinoMessage | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
  const m = data as Record<string, unknown>;
  switch (m.kind) {
    case "ready":
      return { kind: "ready" };
    case "state": {
      const level = intsIn(m.level, PIN_COUNT, 0, 1);
      const pwm = intsIn(m.pwm, PIN_COUNT, -1, 255);
      const mode = intsIn(m.mode, PIN_COUNT, 0, 2);
      return level && pwm && mode ? { kind: "state", state: { level, pwm, mode } } : null;
    }
    case "tone": {
      const f = m.f;
      const ms = m.ms;
      if (typeof f !== "number" || !Number.isInteger(f) || f < 0 || f > 20_000) return null;
      if (typeof ms !== "number" || !Number.isInteger(ms) || ms < 0 || ms > 60_000) return null;
      return { kind: "tone", frequency: f, ms };
    }
    case "serial":
      return typeof m.text === "string" && m.text.length <= 4_000 ? { kind: "serial", text: m.text } : null;
    case "done": {
      const error = typeof m.error === "string" ? m.error.slice(0, 400) : null;
      const line = typeof m.line === "number" && Number.isInteger(m.line) && m.line >= 0 && m.line < 100_000 ? m.line : 0;
      return { kind: "done", error, line };
    }
    default:
      return null;
  }
}

/** Brightness 0 to 1 of the LED on a pin: a PWM value, or fully on/off. */
export function brightness(state: PinState, pin: number): number {
  if (state.pwm[pin] >= 0) return state.pwm[pin] / 255;
  return state.level[pin] ? 1 : 0;
}
