// The page side of the Arduino simulator: the shape of the board, and the checks applied to
// everything the Arduino worker sends back. The worker is not trusted: whatever it posts is
// reduced here to plain numbers and short text before anything on the page uses it.

import { ANALOG_BASE as ANALOG, BOARDS, INPUT_SLOTS, PIN_COUNT as PINS, ROUTER_SLOT as ROUTER, WL as WL_CODES, NETWORKS as NETS, boardById } from "../../public/coding-robotics/code-studio/arduino-boards.js";

/** The numbers about each board live in one file shared with the worker, so they cannot disagree. */
export { BOARDS, boardById };
export type BoardId = "uno" | "esp32";
export type Kit = (typeof BOARDS)["uno"] | (typeof BOARDS)["esp32"];
export const PIN_COUNT: number = PINS;
export const ANALOG_BASE: number = ANALOG;
export const ROUTER_SLOT: number = ROUTER;
export const WL = WL_CODES;
export const NETWORKS = NETS;
export function kitOf(id: BoardId): Kit {
  return boardById(id);
}

/** Slots in the shared input buffer (Int32Array): slot p is 1 while the button or touch pad on pin p is held; ANALOG_BASE + d is dial d in ADC units; ROUTER_SLOT is 1 while the pretend router is on. */
export const ARDUINO_INPUT_SLOTS: number = INPUT_SLOTS;
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
  /** 1 for OUTPUT, 0 for INPUT, 2 for INPUT_PULLUP, 3 for INPUT_PULLDOWN. */
  mode: number[];
};

export type ArduinoMessage =
  | { kind: "ready" }
  | { kind: "state"; state: PinState }
  | { kind: "tone"; frequency: number; ms: number }
  | { kind: "serial"; text: string }
  | { kind: "wifi"; status: number; ssid: string }
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
      const mode = intsIn(m.mode, PIN_COUNT, 0, 3);
      return level && pwm && mode ? { kind: "state", state: { level, pwm, mode } } : null;
    }
    case "tone": {
      const f = m.f;
      const ms = m.ms;
      if (typeof f !== "number" || !Number.isInteger(f) || f < 0 || f > 20_000) return null;
      if (typeof ms !== "number" || !Number.isInteger(ms) || ms < 0 || ms > 60_000) return null;
      return { kind: "tone", frequency: f, ms };
    }
    case "wifi": {
      const status = m.status;
      if (typeof status !== "number" || !Number.isInteger(status) || status < 0 || status > 255) return null;
      return { kind: "wifi", status, ssid: typeof m.ssid === "string" ? m.ssid.slice(0, 32) : "" };
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

// ---- Scripted runs for exercise checks -----------------------------------------------
export type SimEvent = { t: number; pin: number; down: boolean } | { t: number; dial: number; value: number } | { t: number; router: boolean };
export type SimScript = { duration: number; events: SimEvent[] };
export type SimTrace = {
  pins: { t: number; pin: number; level: number; pwm: number }[];
  serial: { t: number; text: string }[];
  tones: { t: number; f: number; ms: number }[];
  wifi: { t: number; status: number }[];
};
export type SimResult = { error: string | null; line: number; trace: SimTrace };

const isInt = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

/** Reduces what the worker sent back from a scripted run to plain, bounded data. */
export function cleanSimResult(data: unknown): SimResult | null {
  if (typeof data !== "object" || data === null) return null;
  const m = data as Record<string, unknown>;
  if (m.kind !== "trace" || typeof m.trace !== "object" || m.trace === null) return null;
  const t = m.trace as Record<string, unknown>;
  const pins: SimTrace["pins"] = [];
  const serial: SimTrace["serial"] = [];
  const tones: SimTrace["tones"] = [];
  const wifi: SimTrace["wifi"] = [];
  if (Array.isArray(t.pins)) {
    for (const e of t.pins.slice(0, 2000)) {
      const r = e as Record<string, unknown>;
      if (r && isInt(r.t, 0, 1e7) && isInt(r.pin, 0, PIN_COUNT - 1) && isInt(r.level, 0, 1) && isInt(r.pwm, -1, 255)) pins.push({ t: r.t, pin: r.pin, level: r.level, pwm: r.pwm });
    }
  }
  if (Array.isArray(t.serial)) {
    for (const e of t.serial.slice(0, 2000)) {
      const r = e as Record<string, unknown>;
      if (r && isInt(r.t, 0, 1e7) && typeof r.text === "string" && r.text.length <= 4000) serial.push({ t: r.t, text: r.text });
    }
  }
  if (Array.isArray(t.tones)) {
    for (const e of t.tones.slice(0, 500)) {
      const r = e as Record<string, unknown>;
      if (r && isInt(r.t, 0, 1e7) && isInt(r.f, 0, 20000) && isInt(r.ms, 0, 60000)) tones.push({ t: r.t, f: r.f, ms: r.ms });
    }
  }
  if (Array.isArray(t.wifi)) {
    for (const e of t.wifi.slice(0, 200)) {
      const r = e as Record<string, unknown>;
      if (r && isInt(r.t, 0, 1e7) && isInt(r.status, 0, 255)) wifi.push({ t: r.t, status: r.status });
    }
  }
  const error = typeof m.error === "string" ? m.error.slice(0, 400) : null;
  const line = isInt(m.line, 0, 99999) ? m.line : 0;
  return { error, line, trace: { pins, serial, tones, wifi } };
}

/** The level (0 to 1, PWM counted) of a pin at a time, read back from a trace. */
export function levelAt(trace: SimTrace, pin: number, t: number): number {
  let value = 0;
  for (const e of trace.pins) if (e.pin === pin && e.t <= t) value = e.pwm >= 0 ? e.pwm / 255 : e.level;
  return value;
}

/** Everything printed to Serial, joined. */
export function serialOf(trace: SimTrace): string {
  return trace.serial.map((e) => e.text).join("");
}
