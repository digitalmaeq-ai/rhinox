// The page-side controller for the Arduino worker. A fresh worker is made for every run and
// thrown away at the end, so nothing carries over between runs. The time limit and the output
// limit are enforced here, outside the worker, and every message is checked before use.
import {
  ANALOG_BASE,
  ARDUINO_HARD_SERIAL_CAP,
  ARDUINO_INPUT_BYTES,
  ARDUINO_MAX_CODE_CHARS,
  ARDUINO_RUN_LIMIT_MS,
  ARDUINO_WORKER_URL,
  cleanArduinoMessage,
  cleanSimResult,
  type SimResult,
  type SimScript,
  type PinState,
} from "./arduino";

export type ArduinoOutcome = "ended" | "error" | "stopped" | "timeout" | "output-limit" | "crashed" | "unavailable";

export type ArduinoHandlers = {
  onState: (state: PinState) => void;
  onSerial: (text: string) => void;
  onTone: (frequency: number, ms: number) => void;
  onRunning: (running: boolean) => void;
};

export type ArduinoResult = { outcome: ArduinoOutcome; error: string | null; line: number; serial: string };

export class ArduinoRunner {
  private worker: Worker | null = null;
  private input: Int32Array | null = null;
  private finish: ((result: ArduinoResult) => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private serial = "";
  private held = new Array<number>(20).fill(0);
  private dials = [512, 512, 512, 512, 512, 512];

  constructor(private readonly handlers: ArduinoHandlers) {}

  get running(): boolean {
    return this.worker !== null;
  }

  /** Dial positions are remembered so a run that starts later still sees them. */
  setDial(analog: number, value: number) {
    if (!Number.isInteger(analog) || analog < 0 || analog > 5) return;
    this.dials[analog] = Math.max(0, Math.min(1023, Math.round(value)));
    if (this.input) Atomics.store(this.input, ANALOG_BASE + analog, this.dials[analog]);
  }

  setButton(pin: number, down: boolean) {
    if (!Number.isInteger(pin) || pin < 0 || pin > 19) return;
    this.held[pin] = down ? 1 : 0;
    if (this.input) Atomics.store(this.input, pin, this.held[pin]);
  }

  run(code: string): Promise<ArduinoResult> {
    this.stop();
    if (code.length > ARDUINO_MAX_CODE_CHARS) {
      return Promise.resolve({ outcome: "error", error: "the program is too long", line: 0, serial: "" });
    }
    if (typeof SharedArrayBuffer === "undefined" || !window.crossOriginIsolated) {
      return Promise.resolve({
        outcome: "unavailable",
        error: "The board needs the page in secure mode. Reload the page, then press Run again.",
        line: 0,
        serial: "",
      });
    }
    this.serial = "";
    const shared = new SharedArrayBuffer(ARDUINO_INPUT_BYTES);
    const input = new Int32Array(shared);
    this.held.forEach((v, i) => Atomics.store(input, i, v));
    this.dials.forEach((v, i) => Atomics.store(input, ANALOG_BASE + i, v));
    this.input = input;
    let worker: Worker;
    try {
      worker = new Worker(ARDUINO_WORKER_URL, { type: "module", name: "rhinox-arduino" });
    } catch {
      this.input = null;
      return Promise.resolve({ outcome: "unavailable", error: "The Arduino engine could not start in this browser.", line: 0, serial: "" });
    }
    this.worker = worker;
    this.handlers.onRunning(true);
    return new Promise<ArduinoResult>((resolve) => {
      this.finish = resolve;
      this.timer = setTimeout(() => this.end("timeout", "The program ran for 30 minutes, so it was stopped.", 0), ARDUINO_RUN_LIMIT_MS);
      worker.onmessage = (event: MessageEvent) => {
        if (this.worker !== worker) return;
        const message = cleanArduinoMessage(event.data);
        if (!message) return;
        switch (message.kind) {
          case "state":
            this.handlers.onState(message.state);
            break;
          case "tone":
            this.handlers.onTone(message.frequency, message.ms);
            break;
          case "serial":
            this.serial += message.text;
            this.handlers.onSerial(message.text);
            if (this.serial.length > ARDUINO_HARD_SERIAL_CAP) this.end("output-limit", "The program printed too much, so it was stopped.", 0);
            break;
          case "done":
            this.end(message.error ? "error" : "ended", message.error, message.line);
            break;
          default:
            break;
        }
      };
      worker.onerror = () => {
        if (this.worker === worker) this.end("crashed", "The Arduino engine stopped working. Press Run to try again.", 0);
      };
      worker.postMessage({ kind: "run", code, shared });
    });
  }

  stop() {
    if (this.worker) this.end("stopped", null, 0);
  }

  /** A scripted run on a pretend clock, in a worker of its own. Resolves to null if it fails or takes too long. */
  simulate(code: string, script: SimScript): Promise<SimResult | null> {
    if (code.length > ARDUINO_MAX_CODE_CHARS) return Promise.resolve(null);
    let worker: Worker;
    try {
      worker = new Worker(ARDUINO_WORKER_URL, { type: "module", name: "rhinox-arduino-check" });
    } catch {
      return Promise.resolve(null);
    }
    return new Promise<SimResult | null>((resolve) => {
      const finish = (value: SimResult | null) => {
        clearTimeout(timer);
        worker.onmessage = null;
        worker.onerror = null;
        worker.terminate();
        resolve(value);
      };
      const timer = setTimeout(() => finish(null), 15_000);
      worker.onmessage = (event: MessageEvent) => finish(cleanSimResult(event.data));
      worker.onerror = () => finish(null);
      worker.postMessage({ kind: "simulate", code, script });
    });
  }

  dispose() {
    this.stop();
  }

  private end(outcome: ArduinoOutcome, error: string | null, line: number) {
    const worker = this.worker;
    if (!worker) return;
    this.worker = null;
    this.input = null;
    worker.onmessage = null;
    worker.onerror = null;
    worker.terminate();
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.handlers.onRunning(false);
    const finish = this.finish;
    this.finish = null;
    finish?.({ outcome, error, line, serial: this.serial });
  }
}
