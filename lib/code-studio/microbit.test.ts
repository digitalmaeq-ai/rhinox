// Run with:  npx tsx lib/code-studio/microbit.test.ts
//
// The micro:bit simulator's Python side, driven by the scripted clock (the same
// mode the exercise checks use). The live board needs a browser: see
// scripts/code-studio-browser-tests.cjs.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadPyodide } from "pyodide";

const root = process.cwd();
const worker = readFileSync(join(root, "public/coding-robotics/code-studio/python-worker.js"), "utf8");
const microbitSource = readFileSync(join(root, "public/coding-robotics/code-studio/microbit.py"), "utf8");
const setup = /const PYTHON_SETUP = String\.raw`([\s\S]*?)`;/.exec(worker)?.[1];
assert.ok(setup, "could not find PYTHON_SETUP in the worker");

type Trace = { frames: [number, string][]; sounds: number[][]; pins: unknown[][]; leds: string; ms: number; ended: boolean };

async function main() {
  const pyodide = await loadPyodide();
  const scope = pyodide.toPy({});
  pyodide.runPython(setup as string, { globals: scope });
  const run = scope.get("run");
  scope.get("install_microbit")(microbitSource);
  let out = "";
  let err = "";
  pyodide.setStdout({ write: (b: Uint8Array) => ((out += new TextDecoder().decode(b)), b.length) });
  pyodide.setStderr({ write: (b: Uint8Array) => ((err += new TextDecoder().decode(b)), b.length) });

  function board(code: string, script: object = {}) {
    out = "";
    err = "";
    const reply = JSON.parse(run(code, "[]", "script", JSON.stringify(script)));
    pyodide.runPython("import sys\nsys.stdout.flush()\nsys.stderr.flush()");
    return { ok: reply.ok as boolean, out, err, trace: reply.device as Trace | null };
  }

  const HEART = "09090" + "99999" + "99999" + "09990" + "00900";
  let passed = 0;
  const test = (name: string, fn: () => void) => {
    fn();
    passed += 1;
    console.log("ok  ", name);
  };

  test("show(Image.HEART) lights the heart", () => {
    const r = board("from microbit import *\ndisplay.show(Image.HEART)");
    assert.equal(r.ok, true, r.err);
    assert.equal(r.trace?.leds, HEART);
  });

  test("without a device nothing is imported", () => {
    out = "";
    err = "";
    const reply = JSON.parse(run("import microbit", "[]", "", ""));
    pyodide.runPython("import sys\nsys.stderr.flush()");
    assert.equal(reply.ok, false);
    assert.match(err, /No module named 'microbit'/);
  });

  test("a forever loop ends when the check's time is up", () => {
    const r = board("from microbit import *\nwhile True:\n    sleep(100)", { duration: 1000 });
    assert.equal(r.ok, true, r.err);
    assert.equal(r.trace?.ended, true);
    assert.equal(r.trace?.ms, 1000);
  });

  test("button presses are counted, in time order", () => {
    const code = [
      "from microbit import *",
      "n = 0",
      "while True:",
      "    if button_a.was_pressed():",
      "        n += 1",
      "        display.show(n)",
      "    sleep(50)",
    ].join("\n");
    const r = board(code, { duration: 3000, events: [{ at: 200, do: "press_a" }, { at: 900, do: "press_a" }, { at: 1500, do: "press_a" }] });
    assert.equal(r.ok, true, r.err);
    assert.equal(r.trace?.frames.length, 3);
    // The digit 3 drawn by our font.
    assert.notEqual(r.trace?.leds, "0".repeat(25));
  });

  test("a very short press is not missed during a long sleep", () => {
    const code = "from microbit import *\nsleep(1000)\nprint(button_a.get_presses())";
    const r = board(code, { duration: 2000, events: [{ at: 100, do: "press_a", hold: 20 }] });
    assert.equal(r.out.trim(), "1");
  });

  test("is_pressed follows hold and release", () => {
    const code = "from microbit import *\nsleep(300)\nprint(button_b.is_pressed())\nsleep(500)\nprint(button_b.is_pressed())";
    const r = board(code, { duration: 2000, events: [{ at: 100, do: "hold_b" }, { at: 600, do: "release_b" }] });
    assert.equal(r.out.trim().split("\n").join(","), "True,False");
  });

  test("scroll draws many frames and ends blank", () => {
    const r = board('from microbit import *\ndisplay.scroll("Hi", delay=50)');
    assert.equal(r.ok, true, r.err);
    assert.ok((r.trace?.frames.length ?? 0) > 10);
    assert.equal(r.trace?.leds, "0".repeat(25));
  });

  test("set_pixel and get_pixel, with range errors", () => {
    const r = board("from microbit import *\ndisplay.set_pixel(1, 2, 7)\nprint(display.get_pixel(1, 2))");
    assert.equal(r.out.trim(), "7");
    const bad = board("from microbit import *\ndisplay.set_pixel(5, 0, 9)");
    assert.equal(bad.ok, false);
    assert.match(bad.err, /ValueError: index out of bounds/);
    const bright = board("from microbit import *\ndisplay.set_pixel(0, 0, 10)");
    assert.match(bright.err, /brightness out of bounds/);
  });

  test("Image maths: invert, shift, add, copy, readonly", () => {
    const code = [
      "from microbit import *",
      "a = Image.HEART.copy()",
      "a.set_pixel(0, 0, 5)",
      "print(a.get_pixel(0, 0), Image.HEART.get_pixel(0, 0))",
      "print(Image.HEART.invert().get_pixel(0, 0))",
      "print(Image.HEART.shift_left(1).get_pixel(0, 0))",
      "print((Image.HEART + Image.HEART).get_pixel(1, 0))",
      "print(Image('90000:00000:00000:00000:00000:').get_pixel(0, 0))",
      "Image.HEART.set_pixel(0, 0, 9)",
    ].join("\n");
    const r = board(code);
    assert.equal(r.out.trim().split("\n").join("|"), "5 0|9|9|9|9");
    assert.match(r.err, /image cannot be modified/);
  });

  test("tilt gestures and shake", () => {
    const code = [
      "from microbit import *",
      "sleep(100)",
      "print(accelerometer.current_gesture())",
      "sleep(600)",
      "print(accelerometer.was_gesture('shake'))",
      "print(accelerometer.get_x())",
    ].join("\n");
    const r = board(code, { duration: 3000, events: [{ at: 50, do: "set", x: -800, y: 0, z: -400 }, { at: 120, do: "gesture", name: "shake" }] });
    assert.equal(r.ok, true, r.err);
    const lines = r.out.trim().split("\n");
    assert.equal(lines[0], "left");
    assert.equal(lines[2], "-800");
  });

  test("temperature, light level and pins come from the script", () => {
    const code = [
      "from microbit import *",
      "sleep(200)",
      "print(temperature(), display.read_light_level(), pin0.read_digital(), pin1.read_analog())",
    ].join("\n");
    const r = board(code, { duration: 1000, events: [{ at: 100, do: "set", temp: 30, light: 77, pin0: 1023, pin1: 512 }] });
    assert.equal(r.out.trim(), "30 77 1 512");
  });

  test("music notes make sounds and take time", () => {
    const r = board("import music\nmusic.play(['c4:4', 'e4:4', 'g4:4'])", { duration: 5000 });
    assert.equal(r.ok, true, r.err);
    assert.equal(r.trace?.sounds.length, 3);
    assert.equal(r.trace?.sounds[0][1], 262);
    assert.equal(r.trace?.ms, 1500);
    const pitch = board("import music\nmusic.pitch(440, 200)");
    assert.equal(pitch.trace?.sounds[0][1], 440);
  });

  test("running_time follows the pretend clock", () => {
    const r = board("from microbit import *\nsleep(750)\nprint(running_time())");
    assert.equal(r.out.trim(), "750");
  });

  test("panic shows the sad face and stops", () => {
    const r = board("from microbit import *\npanic(7)\ndisplay.show(Image.HEART)");
    assert.equal(r.ok, false);
    assert.equal(r.trace?.leds, "00000" + "09090" + "00000" + "09990" + "90009");
  });

  test("the frame list is capped", () => {
    const r = board("from microbit import *\nwhile True:\n    display.show(Image.HEART)\n    sleep(1)\n    display.clear()\n    sleep(1)", { duration: 20000 });
    assert.ok((r.trace?.frames.length ?? 0) <= 600);
    assert.equal(r.ok, true, r.err);
  });

  test("the module's own internals do not open a way to the JavaScript bridge", () => {
    for (const probe of [
      'import microbit\nmicrobit.sleep.__globals__["__builtins__"]["__import__"]("js")',
      'import microbit\nmicrobit.display.show.__globals__["__builtins__"]["__import__"]("pyodide")',
      'import microbit\nmicrobit.sleep.__closure__[0].cell_contents',
    ]) {
      const r = board(probe);
      assert.doesNotMatch(r.out + r.err, /JsProxy|pyodide\.ffi|<module 'js'/);
    }
  });

  test("a second run starts clean", () => {
    board("from microbit import *\nImage.HEART = 5\nbutton_a.was_pressed()\ndisplay.set_pixel(0,0,9)");
    const r = board("from microbit import *\nprint(type(Image.HEART).__name__, display.get_pixel(0, 0))");
    assert.equal(r.out.trim(), "Image 0");
  });

  test("radio: send records text with group and channel", () => {
    const code = "from microbit import *\nimport radio\nradio.on()\nradio.config(group=4, channel=9)\nsleep(100)\nradio.send('hello')\nradio.send_bytes(b'ab')";
    const r = board(code, { duration: 2000 });
    assert.equal(r.ok, true, r.err);
    const radio = (r.trace as unknown as { radio: [number, number, number, string][] }).radio;
    assert.deepEqual(radio.map((m) => [m[0], m[1], m[2], m[3]]), [[100, 4, 9, "010001" + "68656c6c6f"], [100, 4, 9, "6162"]]);
  });

  test("radio: receive hears the same group only, in order", () => {
    const code = [
      "from microbit import *", "import radio", "radio.on()", "radio.config(group=5)",
      "got = []", "while True:", "    m = radio.receive()", "    if m is not None:", "        print(m)", "    sleep(50)",
    ].join("\n");
    const r = board(code, {
      duration: 1500,
      events: [
        { at: 100, do: "radio", text: "one", group: 5 },
        { at: 200, do: "radio", text: "wrong group", group: 6 },
        { at: 300, do: "radio", text: "two", group: 5 },
        { at: 400, do: "radio", text: "wrong channel", group: 5, channel: 8 },
      ],
    });
    assert.equal(r.out.trim().split("\n").join("|"), "one|two");
  });

  test("radio: off by default, bad settings and too long messages are refused", () => {
    assert.match(board("import radio\nradio.send('x')").err, /RuntimeError: radio is off/);
    assert.match(board("import radio\nradio.on()\nradio.config(group=300)").err, /group out of bounds/);
    assert.match(board("import radio\nradio.on()\nradio.config(colour=1)").err, /TypeError/);
    assert.match(board("import radio\nradio.on()\nradio.send('x' * 40)").err, /message too long/);
    assert.match(board("import radio\nradio.on()\nradio.send(5)").err, /TypeError/);
    const bytes = board("import radio\nradio.on()\nprint(radio.receive_bytes())\n", { duration: 100, events: [] });
    assert.equal(bytes.out.trim(), "None");
  });

  test("radio: a bytes message is not a string", () => {
    const r = board("from microbit import *\nimport radio\nradio.on()\nsleep(200)\nradio.receive()\n", { duration: 1000, events: [{ at: 100, do: "radio", hex: "0102" }] });
    assert.match(r.err, /received packet is not a string/);
  });

  test("radio: the queue keeps only the newest messages", () => {
    const events = Array.from({ length: 6 }, (_, i) => ({ at: 10 + i, do: "radio", text: "m" + i }));
    const r = board("from microbit import *\nimport radio\nradio.on()\nsleep(100)\nwhile True:\n    m = radio.receive()\n    if m is None:\n        break\n    print(m)\n", { duration: 1000, events });
    assert.equal(r.out.trim().split("\n").join("|"), "m3|m4|m5");
  });

  console.log(`\n${passed} micro:bit checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
