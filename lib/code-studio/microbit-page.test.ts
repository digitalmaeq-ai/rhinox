// Run with:  npx tsx lib/code-studio/microbit-page.test.ts
// The page-side checks for the micro:bit simulator: what the worker may send, and what a script may ask for.
import assert from "node:assert/strict";

import { cleanDeviceEvent, cleanScript, cleanTrace, glow, hexToBytes, ledRows, litCount, radioText, usesMicrobit, usesRadio } from "./microbit";
import { digitLeds } from "./exercises-microbit";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}

test("usesMicrobit sees real imports only", () => {
  assert.equal(usesMicrobit("from microbit import *\n"), true);
  assert.equal(usesMicrobit("import music\n"), true);
  assert.equal(usesMicrobit("print('x')\n  import microbit as mb"), true);
  assert.equal(usesMicrobit("# from microbit import *\nprint(1)"), false);
  assert.equal(usesMicrobit('print("import microbit")'), false);
  assert.equal(usesMicrobit("import microbiology"), false);
});

test("device events: only exact shapes are accepted", () => {
  assert.deepEqual(cleanDeviceEvent({ kind: "leds", d: "0".repeat(25) }), { kind: "leds", leds: new Array(25).fill(0) });
  assert.equal(cleanDeviceEvent({ kind: "leds", d: "0".repeat(24) }), null);
  assert.equal(cleanDeviceEvent({ kind: "leds", d: "a".repeat(25) }), null);
  assert.equal(cleanDeviceEvent({ kind: "leds", d: 5 }), null);
  assert.deepEqual(cleanDeviceEvent({ kind: "sound", f: 440, ms: 100 }), { kind: "sound", frequency: 440, ms: 100 });
  assert.equal(cleanDeviceEvent({ kind: "sound", f: -1, ms: 100 }), null);
  assert.equal(cleanDeviceEvent({ kind: "sound", f: 440, ms: 1e9 }), null);
  assert.equal(cleanDeviceEvent({ kind: "sound", f: 1.5, ms: 5 }), null);
  assert.equal(cleanDeviceEvent({ kind: "pin", n: 99, k: "d", v: 1 }), null);
  assert.equal(cleanDeviceEvent({ kind: "pin", n: 3, k: "x", v: 1 }), null);
  assert.deepEqual(cleanDeviceEvent({ kind: "pin", n: 3, k: "a", v: 1023 }), { kind: "pin", pin: 3, mode: "a", value: 1023 });
  assert.equal(cleanDeviceEvent({ kind: "alert" }), null);
  assert.equal(cleanDeviceEvent(null), null);
  assert.equal(cleanDeviceEvent("leds"), null);
});

test("scripts are limited in size and time", () => {
  const big = cleanScript({ duration: 1e9, events: Array.from({ length: 1000 }, (_, i) => ({ at: i, do: "press_a" as const })) });
  assert.equal(big.events.length, 200);
  assert.equal(big.duration, 120_000);
  assert.equal(cleanScript({ duration: 0, events: [] }).duration, 1);
  assert.equal(cleanScript({ duration: 10, events: [{ at: -5, do: "press_a" }, { at: 1e9, do: "press_a" }] }).events.length, 0);
});

test("traces are cleaned", () => {
  const trace = cleanTrace({
    frames: [[0, "0".repeat(25)], [5, "bad"], ["x", "0".repeat(25)], [10, "9".repeat(25)]],
    sounds: [[1, 440, 100], [2, "a", 3]],
    leds: "9".repeat(25),
    ms: 12,
    ended: true,
  });
  assert.equal(trace?.frames.length, 2);
  assert.equal(trace?.sounds.length, 1);
  assert.equal(trace?.ended, true);
  assert.equal(cleanTrace(null), undefined);
  assert.equal(cleanTrace({ leds: "oops" })?.leds, "0".repeat(25));
});

test("pictures, digits and glow", () => {
  assert.equal(ledRows("0".repeat(25)), "00000:00000:00000:00000:00000");
  assert.equal(litCount(digitLeds(8)), 13);
  assert.equal(litCount(digitLeds(1)), 8);
  assert.equal(glow(0), 0);
  assert.ok(glow(9) === 1 && glow(1) > 0.18);
});

test("radio: events, text and what counts as using the radio", () => {
  assert.deepEqual(cleanDeviceEvent({ kind: "radio", g: 5, ch: 7, h: "010001" + "6869" }), { kind: "radio", group: 5, channel: 7, bytes: [1, 0, 1, 104, 105] });
  assert.equal(cleanDeviceEvent({ kind: "radio", g: 256, ch: 7, h: "00" }), null);
  assert.equal(cleanDeviceEvent({ kind: "radio", g: 1, ch: 84, h: "00" }), null);
  assert.equal(cleanDeviceEvent({ kind: "radio", g: 1, ch: 1, h: "0" }), null);
  assert.equal(cleanDeviceEvent({ kind: "radio", g: 1, ch: 1, h: "zz" }), null);
  assert.equal(cleanDeviceEvent({ kind: "radio", g: 1, ch: 1, h: "00".repeat(252) }), null);
  assert.equal(cleanDeviceEvent({ kind: "radio", g: 1, ch: 1, h: "00".repeat(251) })?.kind, "radio");
  assert.equal(radioText(hexToBytes("010001" + "6869")), "hi");
  assert.equal(radioText(hexToBytes("6869")), null);
  assert.equal(radioText(hexToBytes("010001ff")), null);
  assert.equal(usesRadio("import radio\n"), true);
  assert.equal(usesRadio("from microbit import *\n"), false);
  assert.equal(usesMicrobit("import radio\n"), true);
  const trace = cleanTrace({ radio: [[10, 5, 7, "01000168"], [1, 300, 7, "00"], [2, 1, 1, "zz"]], leds: "0".repeat(25) });
  assert.deepEqual(trace?.radio, [{ t: 10, group: 5, channel: 7, text: "h" }]);
});

console.log(`\n${passed} micro:bit page checks passed`);
