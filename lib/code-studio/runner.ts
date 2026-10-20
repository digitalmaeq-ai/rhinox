// The page-side controller for the Python worker. It owns the worker, enforces
// the time limit from OUTSIDE the worker (so an endless loop cannot hold it
// back), and treats every message from the worker as untrusted data.
import {
  HARD_OUTPUT_CAP_CHARS,
  LOAD_TIMEOUT_MS,
  MAX_INPUT_CHARS,
  PYODIDE_BASE,
  RECYCLE_HEAP_MB,
  RUN_TIMEOUT_MS,
  WORKER_URL,
} from "./limits";
import { cleanCharts, type ChartSpec } from "./charts";
import { cleanFiles, type ProgramFile } from "./files";
import {
  cleanDeviceEvent,
  cleanScript,
  cleanTrace,
  DEVICE_RUN_TIMEOUT_MS,
  GESTURE_CODES,
  BOARD_BUFFER_BYTES,
  INPUT,
  INPUT_SLOTS,
  MAX_RADIO_BYTES,
  RADIO_BASE,
  RADIO_HEAD,
  RADIO_SLOTS,
  RADIO_SLOT_BYTES,
  usesMicrobit,
  type DeviceEvent,
  type DeviceScript,
  type DeviceTrace,
  type GestureName,
} from "./microbit";

export type RunnerStatus = "idle" | "starting" | "running" | "waiting-input";

export type RunOutcome =
  | "ok" // finished normally
  | "error" // ended with a Python error (the traceback was printed)
  | "stopped" // the learner pressed Stop
  | "timeout" // ran too long
  | "output-limit" // printed too much
  | "crashed" // the worker died (for example out of memory)
  | "failed-to-start"; // the Python runtime could not be loaded

export type RunResult = {
  outcome: RunOutcome;
  ms: number;
  detail?: string;
  /** Everything the program printed (at most the output limit). */
  stdout: string;
  stderr: string;
  /** The program's files after the run. The files it started with if the run did not finish. */
  files: ProgramFile[];
  /** The charts the program drew (empty if the run did not finish). */
  charts: ChartSpec[];
  /** Set when the worker handed back files that had to be dropped. */
  fileNotes?: string[];
  /** What the program did on the scripted micro:bit board (only for runs given a board script). */
  device?: DeviceTrace;
};

/** What the board's sensors read. Tilt is in milli-g (about -1024 to 1024), temperature in °C, light 0-255. */
export type SensorValues = { x: number; y: number; z: number; temperature: number; light: number };

export const DEFAULT_SENSORS: SensorValues = { x: 0, y: 0, z: -1024, temperature: 21, light: 128 };

export type RunOptions = {
  /** The files the program can open. They are handed to the worker for this run only. */
  files?: ProgramFile[];
  /** Answer input() from the given lines instead of asking the learner. */
  scripted?: boolean;
  /** Do not show the output in the console (used by exercise checks). */
  quiet?: boolean;
  /** Where the board's sensors start (a live micro:bit run). */
  sensors?: SensorValues;
  /** Run on the scripted micro:bit board (exercise checks): buttons and sensors change at pretend times. */
  board?: DeviceScript;
};

export type RunnerListener = {
  onOutput: (stream: "stdout" | "stderr", text: string) => void;
  onStatus: (status: RunnerStatus) => void;
  /** The live micro:bit board changed (lights, sound, pins). Only called for live board runs. */
  onDevice?: (event: DeviceEvent) => void;
};

type WorkerMessage =
  | { type: "ready" }
  | { type: "fatal"; message: string }
  | { type: "out"; stream: "stdout" | "stderr"; text: string }
  | { type: "input-request" }
  | { type: "device"; event: DeviceEvent }
  | { type: "done"; id: number; ok: boolean; outputLimit: boolean; ms: number; heapMB: number; files: unknown[] | null; charts: unknown[]; device: unknown };

// Only these exact shapes are accepted. Anything else from the worker is ignored.
function parseMessage(data: unknown): WorkerMessage | null {
  if (!data || typeof data !== "object") return null;
  const m = data as Record<string, unknown>;
  switch (m.type) {
    case "ready":
    case "input-request":
      return { type: m.type } as WorkerMessage;
    case "fatal":
      return { type: "fatal", message: String(m.message ?? "").slice(0, 300) };
    case "out":
      if ((m.stream === "stdout" || m.stream === "stderr") && typeof m.text === "string") {
        return { type: "out", stream: m.stream, text: m.text.slice(0, HARD_OUTPUT_CAP_CHARS) };
      }
      return null;
    case "device": {
      const event = cleanDeviceEvent(m);
      return event ? { type: "device", event } : null;
    }
    case "done":
      return {
        type: "done",
        id: Number(m.id),
        ok: m.ok === true,
        outputLimit: m.outputLimit === true,
        ms: Number(m.ms) || 0,
        heapMB: Number(m.heapMB) || 0,
        files: Array.isArray(m.files) ? m.files.slice(0, 100) : null,
        charts: Array.isArray(m.charts) ? m.charts.slice(0, 20) : [],
        device: m.device,
      };
    default:
      return null;
  }
}

function clampInt(value: number, low: number, high: number): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.max(low, Math.min(high, n)) : low;
}

export class PythonRunner {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private inputBuffer: SharedArrayBuffer | null = null;
  private boardBuffer: SharedArrayBuffer | null = null;
  private boardInputs: Int32Array | null = null;
  private boardBytes: Uint8Array | null = null;
  private liveBoard = false;
  private sensors: SensorValues = DEFAULT_SENSORS;
  private status: RunnerStatus = "idle";
  private listener: RunnerListener;
  private runId = 0;
  private outputChars = 0;
  private finish: ((result: RunResult) => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private remainingMs = RUN_TIMEOUT_MS;
  private timerStartedAt = 0;
  private runStartedAt = 0;
  private failRun: ((error: Error) => void) | null = null;
  private quiet = false;
  private stdout = "";
  private stderr = "";
  private startFiles: ProgramFile[] = [];

  constructor(listener: RunnerListener) {
    this.listener = listener;
  }

  get isBusy(): boolean {
    return this.status !== "idle";
  }

  /** True when input() can pause the program and wait for the learner to type. */
  get interactiveInput(): boolean {
    return typeof SharedArrayBuffer !== "undefined" && typeof crossOriginIsolated !== "undefined" && crossOriginIsolated;
  }

  private setStatus(status: RunnerStatus) {
    this.status = status;
    this.listener.onStatus(status);
  }

  private killWorker() {
    if (this.worker) {
      this.worker.onmessage = null;
      this.worker.onerror = null;
      this.worker.onmessageerror = null;
      this.worker.terminate();
    }
    this.worker = null;
    this.ready = null;
    this.inputBuffer = null;
    this.boardBuffer = null;
    this.boardInputs = null;
    this.boardBytes = null;
    this.liveBoard = false;
    this.clearTimer();
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private armTimer() {
    this.clearTimer();
    this.timerStartedAt = performance.now();
    this.timer = setTimeout(() => this.end("timeout"), this.remainingMs);
  }

  private pauseTimer() {
    if (!this.timer) return;
    this.clearTimer();
    this.remainingMs = Math.max(0, this.remainingMs - (performance.now() - this.timerStartedAt));
  }

  /** Ends the current run: used by Stop, the timeout and crash handling. */
  private end(outcome: RunOutcome, detail?: string) {
    const finish = this.finish;
    this.finish = null;
    this.killWorker();
    this.setStatus("idle");
    finish?.({
      outcome,
      ms: Math.round(performance.now() - this.runStartedAt),
      detail,
      stdout: this.stdout,
      stderr: this.stderr,
      files: this.startFiles,
      charts: [],
    });
  }

  private start(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise<void>((resolve, reject) => {
      let worker: Worker;
      try {
        worker = new Worker(WORKER_URL, { type: "module" });
      } catch (error) {
        reject(new Error(error instanceof Error ? error.message : "Workers are not available."));
        return;
      }
      this.worker = worker;
      this.failRun = reject;
      const loadTimer = setTimeout(() => reject(new Error("Python took too long to load.")), LOAD_TIMEOUT_MS);
      const settle = (fn: () => void) => {
        clearTimeout(loadTimer);
        fn();
      };
      worker.onmessage = (event: MessageEvent) => {
        const message = parseMessage(event.data);
        if (!message) return;
        if (message.type === "ready") settle(resolve);
        else if (message.type === "fatal") settle(() => reject(new Error(message.message || "Python could not start.")));
        else this.handle(message);
      };
      worker.onerror = () => {
        settle(() => reject(new Error("The Python worker could not be started.")));
        if (this.finish) this.end("crashed");
      };
      worker.onmessageerror = () => {
        if (this.finish) this.end("crashed");
      };
      if (this.interactiveInput) {
        this.inputBuffer = new SharedArrayBuffer(8 + MAX_INPUT_CHARS * 4);
        this.boardBuffer = new SharedArrayBuffer(BOARD_BUFFER_BYTES);
        this.boardInputs = new Int32Array(this.boardBuffer);
        this.boardBytes = new Uint8Array(this.boardBuffer);
      }
      worker.postMessage({ type: "init", baseUrl: PYODIDE_BASE, inputBuffer: this.inputBuffer, boardBuffer: this.boardBuffer });
    });
    return this.ready;
  }

  private handle(message: WorkerMessage) {
    if (!this.finish) return; // output from a run that has already ended
    if (message.type === "out") {
      this.outputChars += message.text.length;
      if (this.outputChars > HARD_OUTPUT_CAP_CHARS) {
        this.end("output-limit");
        return;
      }
      if (message.stream === "stderr") this.stderr += message.text;
      else this.stdout += message.text;
      if (!this.quiet) this.listener.onOutput(message.stream, message.text);
    } else if (message.type === "device") {
      if (this.liveBoard) this.listener.onDevice?.(message.event);
    } else if (message.type === "input-request") {
      this.pauseTimer();
      this.setStatus("waiting-input");
    } else if (message.type === "done" && message.id === this.runId) {
      const finish = this.finish;
      this.finish = null;
      this.clearTimer();
      // Whatever the worker sends back is checked again here: it is only trusted
      // as far as the same rules that apply to every file.
      const returned = message.files === null ? null : cleanFiles(message.files);
      const result: RunResult = {
        outcome: message.outputLimit ? "output-limit" : message.ok ? "ok" : "error",
        ms: message.ms,
        stdout: this.stdout,
        stderr: this.stderr,
        files: returned ? returned.files : this.startFiles,
        charts: cleanCharts(message.charts),
        device: cleanTrace(message.device),
        fileNotes: returned && returned.notes.length > 0 ? returned.notes : undefined,
      };
      // Python's memory only ever grows. After a heavy run, start a clean worker.
      if (message.heapMB > RECYCLE_HEAP_MB) this.killWorker();
      this.setStatus("idle");
      finish?.(result);
    }
  }

  /** Runs one program. Never rejects: problems come back as an outcome. */
  async run(code: string, stdinLines: string[] = [], options: RunOptions = {}): Promise<RunResult> {
    const startFiles = cleanFiles(options.files ?? []).files;
    if (this.status !== "idle") return { outcome: "error", ms: 0, detail: "Already running.", stdout: "", stderr: "", files: startFiles, charts: [] };
    this.startFiles = startFiles;
    this.quiet = options.quiet === true;
    this.stdout = "";
    this.stderr = "";
    this.setStatus("starting");
    this.runStartedAt = performance.now();
    try {
      await this.start();
    } catch (error) {
      this.killWorker();
      this.setStatus("idle");
      return { outcome: "failed-to-start", ms: 0, detail: error instanceof Error ? error.message : String(error), stdout: "", stderr: "", files: startFiles, charts: [] };
    }
    return new Promise<RunResult>((resolve) => {
      this.finish = resolve;
      this.runId += 1;
      this.outputChars = 0;
      // A micro:bit program that is not a check runs on the live board, in real time. It has its own
      // (much longer) limit, because a board program is normally a forever loop. Stop always works.
      const board = options.board ? cleanScript(options.board) : null;
      const live = !board && options.scripted !== true && this.boardBuffer !== null && usesMicrobit(code);
      this.liveBoard = live;
      if (options.sensors) this.sensors = options.sensors;
      if (live) this.resetBoardInputs();
      this.remainingMs = live ? DEVICE_RUN_TIMEOUT_MS : RUN_TIMEOUT_MS;
      this.runStartedAt = performance.now();
      this.setStatus("running");
      this.armTimer();
      this.worker?.postMessage({
        type: "run",
        id: this.runId,
        code,
        stdinLines,
        scripted: options.scripted === true,
        files: this.startFiles,
        device: board ? "script" : live ? "live" : "",
        script: board ?? undefined,
      });
    });
  }

  /** Answers the program's input() call. Only works when the worker is waiting. */
  submitInput(line: string) {
    if (this.status !== "waiting-input" || !this.inputBuffer) return;
    const bytes = new TextEncoder().encode(line.slice(0, MAX_INPUT_CHARS));
    const flag = new Int32Array(this.inputBuffer, 0, 2);
    new Uint8Array(this.inputBuffer, 8, bytes.length).set(bytes);
    Atomics.store(flag, 1, bytes.length);
    this.setStatus("running");
    this.armTimer();
    Atomics.store(flag, 0, 1);
    Atomics.notify(flag, 0);
  }

  /** True while a live micro:bit program is running. */
  get boardRunning(): boolean {
    return this.liveBoard && this.status !== "idle";
  }

  private resetBoardInputs() {
    const v = this.boardInputs;
    if (!v) return;
    for (let i = 0; i < INPUT_SLOTS; i += 1) Atomics.store(v, i, 0);
    Atomics.store(v, RADIO_HEAD, 0);
    this.setSensors(this.sensors);
  }

  /** Puts the sensors back where they were, for a new run (the page calls this with the sliders' values). */
  setSensors(values: SensorValues) {
    // Remembered even when no run is going yet, so a slider moved while Python is still starting is not lost.
    this.sensors = values;
    const v = this.boardInputs;
    if (!v) return;
    Atomics.store(v, INPUT.x, clampInt(values.x, -2048, 2048));
    Atomics.store(v, INPUT.y, clampInt(values.y, -2048, 2048));
    Atomics.store(v, INPUT.z, clampInt(values.z, -2048, 2048));
    Atomics.store(v, INPUT.temperature, clampInt(values.temperature, -5, 50));
    Atomics.store(v, INPUT.light, clampInt(values.light, 0, 255));
  }

  /** A button or the logo goes down (true) or up (false). Counts a press when it goes down. */
  setButton(button: "a" | "b" | "logo", down: boolean) {
    const v = this.boardInputs;
    if (!v || !this.liveBoard) return;
    const slot = button === "a" ? INPUT.a : button === "b" ? INPUT.b : INPUT.logo;
    const counter = button === "a" ? INPUT.aPresses : button === "b" ? INPUT.bPresses : INPUT.logoPresses;
    if (down && Atomics.load(v, slot) === 0) Atomics.add(v, counter, 1);
    Atomics.store(v, slot, down ? 1 : 0);
  }

  /** Pins 0 to 2: a voltage (0-1023) or a touch. */
  setPin(pin: 0 | 1 | 2, value: number, touched?: boolean) {
    const v = this.boardInputs;
    if (!v) return;
    Atomics.store(v, INPUT.pin0 + pin, clampInt(value, 0, 1023));
    if (touched !== undefined) Atomics.store(v, INPUT.touch0 + pin, touched ? 1 : 0);
  }

  /** A radio message from the other board. It is put in this board's inbox (8 slots; the oldest is lost if it is full). */
  deliverRadio(message: { group: number; channel: number; bytes: number[] }) {
    const v = this.boardInputs;
    const bytes = this.boardBytes;
    if (!v || !bytes || !this.liveBoard) return;
    if (message.bytes.length > MAX_RADIO_BYTES) return;
    const head = Atomics.load(v, RADIO_HEAD);
    const at = RADIO_BASE + (head % RADIO_SLOTS) * RADIO_SLOT_BYTES;
    bytes[at + 4] = message.group & 255;
    bytes[at + 5] = message.channel & 255;
    bytes.set(message.bytes, at + 8);
    Atomics.store(v, at / 4, message.bytes.length);
    Atomics.add(v, RADIO_HEAD, 1);
  }

  /** The learner shakes (or drops) the micro:bit. */
  doGesture(name: GestureName) {
    const v = this.boardInputs;
    if (!v || !this.liveBoard) return;
    Atomics.store(v, INPUT.gesture, GESTURE_CODES[name]);
    Atomics.add(v, INPUT.gestureCount, 1);
  }

  /** The learner pressed Stop. */
  stop() {
    if (this.status === "idle") return;
    if (this.finish) this.end("stopped");
    else {
      this.failRun?.(new Error("Stopped."));
      this.killWorker();
      this.setStatus("idle");
    }
  }

  dispose() {
    this.finish = null;
    this.killWorker();
  }
}
