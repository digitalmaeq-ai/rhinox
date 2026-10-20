// The micro:bit simulator, page side: the shapes of the data that cross between
// the page and the Python worker, and the checks every piece of it goes through.
// Nothing here runs Python. The worker is untrusted, so everything it sends is
// cleaned here before the board draws it.

export const LED_COUNT = 25;

/** A live micro:bit program may run this long (the normal 10 s limit is for ordinary programs). */
export const DEVICE_RUN_TIMEOUT_MS = 20 * 60 * 1000;

/** Where each input lives in the shared memory the page writes and the worker reads. */
export const INPUT = {
  a: 0,
  b: 1,
  logo: 2,
  aPresses: 3,
  bPresses: 4,
  logoPresses: 5,
  x: 6,
  y: 7,
  z: 8,
  temperature: 9,
  light: 10,
  gesture: 11,
  gestureCount: 12,
  pin0: 13, // pins 0 to 2 use 13, 14, 15
  touch0: 16, // touch on pins 0 to 2 uses 16, 17, 18
} as const;
export const INPUT_SLOTS = 24;

// Radio messages for a board arrive in a ring of 8 slots after the inputs, in the same shared memory.
// Int32 [RADIO_HEAD] counts the messages written. Slot i starts at byte RADIO_BASE + i * RADIO_SLOT_BYTES:
// int32 length, byte group, byte channel, then the data from byte 8. The worker has matching numbers.
export const RADIO_HEAD = 24;
export const RADIO_BASE = 128;
export const RADIO_SLOTS = 8;
export const RADIO_SLOT_BYTES = 264;
export const MAX_RADIO_BYTES = 251;
export const BOARD_BUFFER_BYTES = RADIO_BASE + RADIO_SLOTS * RADIO_SLOT_BYTES;

export type GestureName = "shake" | "freefall" | "3g" | "6g" | "8g";
export const GESTURE_CODES: Record<GestureName, number> = { shake: 1, freefall: 2, "3g": 3, "6g": 4, "8g": 5 };

/** True when the program asks for the micro:bit board. */
export function usesMicrobit(source: string): boolean {
  return /^[ \t]*(?:from|import)[ \t]+(?:microbit|music|radio)\b/m.test(source);
}

/** True when the program uses the radio, so there are two boards to talk to each other. */
export function usesRadio(source: string): boolean {
  return /^[ \t]*(?:from|import)[ \t]+radio\b/m.test(source);
}

// ---- What the worker may send --------------------------------------------------

export type DeviceEvent =
  | { kind: "leds"; leds: number[] }
  | { kind: "sound"; frequency: number; ms: number }
  | { kind: "pin"; pin: number; mode: "d" | "a"; value: number }
  | { kind: "radio"; group: number; channel: number; bytes: number[] };

/** The worker's message, checked. Returns null for anything that is not exactly one of the allowed shapes. */
export function cleanDeviceEvent(data: unknown): DeviceEvent | null {
  if (!data || typeof data !== "object") return null;
  const m = data as Record<string, unknown>;
  if (m.kind === "leds") {
    if (typeof m.d !== "string" || !/^[0-9]{25}$/.test(m.d)) return null;
    return { kind: "leds", leds: Array.from(m.d, (c) => Number(c)) };
  }
  if (m.kind === "sound") {
    const f = Number(m.f);
    const ms = Number(m.ms);
    if (!Number.isInteger(f) || !Number.isInteger(ms) || f < 0 || f > 20000 || ms < 0 || ms > 60000) return null;
    return { kind: "sound", frequency: f, ms };
  }
  if (m.kind === "pin") {
    const n = Number(m.n);
    const v = Number(m.v);
    if (!Number.isInteger(n) || n < 0 || n > 20 || !Number.isInteger(v) || v < 0 || v > 1023) return null;
    if (m.k !== "d" && m.k !== "a") return null;
    return { kind: "pin", pin: n, mode: m.k, value: v };
  }
  if (m.kind === "radio") {
    const g = Number(m.g);
    const ch = Number(m.ch);
    if (!Number.isInteger(g) || g < 0 || g > 255 || !Number.isInteger(ch) || ch < 0 || ch > 83) return null;
    if (typeof m.h !== "string" || m.h.length > MAX_RADIO_BYTES * 2 || !/^(?:[0-9a-f]{2})*$/.test(m.h)) return null;
    return { kind: "radio", group: g, channel: ch, bytes: hexToBytes(m.h) };
  }
  return null;
}

export function hexToBytes(hex: string): number[] {
  const out: number[] = [];
  for (let i = 0; i + 1 < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return out;
}

// The text a radio message carries when it was sent with radio.send(): the 3 marker bytes, then UTF-8.
export function radioText(bytes: readonly number[]): string | null {
  if (bytes.length < 3 || bytes[0] !== 1 || bytes[1] !== 0 || bytes[2] !== 1) return null;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes.slice(3)));
  } catch {
    return null;
  }
}

// ---- Checks: the scripted clock and what it records ---------------------------

export type ScriptEvent =
  | { at: number; do: "press_a" | "press_b" | "touch_logo"; hold?: number }
  | { at: number; do: "hold_a" | "hold_b" | "release_a" | "release_b" }
  | { at: number; do: "set"; x?: number; y?: number; z?: number; temp?: number; light?: number; pin0?: number; pin1?: number; pin2?: number }
  | { at: number; do: "gesture"; name: GestureName }
  | { at: number; do: "radio"; text: string; group?: number; channel?: number };

/** How a check drives the board: events at pretend times, and how long the program may run (pretend ms). */
export type DeviceScript = { events: ScriptEvent[]; duration: number };

export const MAX_SCRIPT_EVENTS = 200;
export const MAX_SCRIPT_MS = 120_000;

export function cleanScript(script: DeviceScript): DeviceScript {
  const events = script.events.slice(0, MAX_SCRIPT_EVENTS).filter((e) => Number.isFinite(e.at) && e.at >= 0 && e.at <= MAX_SCRIPT_MS);
  return { events, duration: Math.max(1, Math.min(MAX_SCRIPT_MS, Math.round(script.duration))) };
}

/** What the program did on the board, as the scripted clock recorded it. */
export interface DeviceTrace {
  /** Every time the lights changed: [time in ms, 25 digits]. */
  frames: { t: number; leds: string }[];
  /** Notes played: time, frequency (Hz), length (ms). */
  sounds: { t: number; frequency: number; ms: number }[];
  /** Radio messages the program sent: time, group, channel, the text (null if it was raw bytes). */
  radio: { t: number; group: number; channel: number; text: string | null }[];
  /** The lights at the end. */
  leds: string;
  /** The pretend time the program reached. */
  ms: number;
  /** True when the check's time ran out while the program was still going (normal for a forever loop). */
  ended: boolean;
}

const MAX_TRACE_FRAMES = 600;
const MAX_TRACE_SOUNDS = 200;

export function cleanTrace(data: unknown): DeviceTrace | undefined {
  if (!data || typeof data !== "object") return undefined;
  const m = data as Record<string, unknown>;
  const frames: DeviceTrace["frames"] = [];
  if (Array.isArray(m.frames)) {
    for (const item of m.frames.slice(0, MAX_TRACE_FRAMES)) {
      if (Array.isArray(item) && Number.isFinite(item[0]) && typeof item[1] === "string" && /^[0-9]{25}$/.test(item[1])) {
        frames.push({ t: Number(item[0]), leds: item[1] });
      }
    }
  }
  const sounds: DeviceTrace["sounds"] = [];
  if (Array.isArray(m.sounds)) {
    for (const item of m.sounds.slice(0, MAX_TRACE_SOUNDS)) {
      if (Array.isArray(item) && [item[0], item[1], item[2]].every((n) => Number.isFinite(n))) {
        sounds.push({ t: Number(item[0]), frequency: Number(item[1]), ms: Number(item[2]) });
      }
    }
  }
  const radio: DeviceTrace["radio"] = [];
  if (Array.isArray(m.radio)) {
    for (const item of m.radio.slice(0, MAX_TRACE_SOUNDS)) {
      if (Array.isArray(item) && Number.isFinite(item[0]) && Number.isInteger(item[1]) && item[1] >= 0 && item[1] <= 255 && Number.isInteger(item[2]) && item[2] >= 0 && item[2] <= 83 && typeof item[3] === "string" && /^(?:[0-9a-f]{2})*$/.test(item[3]) && item[3].length <= MAX_RADIO_BYTES * 2) {
        radio.push({ t: Number(item[0]), group: item[1], channel: item[2], text: radioText(hexToBytes(item[3])) });
      }
    }
  }
  const leds = typeof m.leds === "string" && /^[0-9]{25}$/.test(m.leds) ? m.leds : "0".repeat(LED_COUNT);
  return { frames, sounds, radio, leds, ms: Number(m.ms) || 0, ended: m.ended === true };
}

// ---- Reading the lights -----------------------------------------------------

/** A picture as 5 rows of 5 digits, joined with ":" (the same text Image() takes). */
export function ledRows(leds: string): string {
  return [0, 1, 2, 3, 4].map((r) => leds.slice(r * 5, r * 5 + 5)).join(":");
}

/** Turns "09090:99999:..." into 25 digits (what a check compares with). */
export function pictureToLeds(picture: string): string {
  return picture.replace(/:/g, "");
}

export function litCount(leds: string): number {
  let n = 0;
  for (const c of leds) if (c !== "0") n += 1;
  return n;
}

/** The lights as the board draws them: brightness 0-9 to a 0-1 glow. */
export function glow(level: number): number {
  return level <= 0 ? 0 : 0.18 + (Math.min(9, level) / 9) * 0.82;
}
