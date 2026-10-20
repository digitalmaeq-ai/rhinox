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
};

export type RunOptions = {
  /** The files the program can open. They are handed to the worker for this run only. */
  files?: ProgramFile[];
  /** Answer input() from the given lines instead of asking the learner. */
  scripted?: boolean;
  /** Do not show the output in the console (used by exercise checks). */
  quiet?: boolean;
};

export type RunnerListener = {
  onOutput: (stream: "stdout" | "stderr", text: string) => void;
  onStatus: (status: RunnerStatus) => void;
};

type WorkerMessage =
  | { type: "ready" }
  | { type: "fatal"; message: string }
  | { type: "out"; stream: "stdout" | "stderr"; text: string }
  | { type: "input-request" }
  | { type: "done"; id: number; ok: boolean; outputLimit: boolean; ms: number; heapMB: number; files: unknown[] | null; charts: unknown[] };

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
      };
    default:
      return null;
  }
}

export class PythonRunner {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private inputBuffer: SharedArrayBuffer | null = null;
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
      if (this.interactiveInput) this.inputBuffer = new SharedArrayBuffer(8 + MAX_INPUT_CHARS * 4);
      worker.postMessage({ type: "init", baseUrl: PYODIDE_BASE, inputBuffer: this.inputBuffer });
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
      this.remainingMs = RUN_TIMEOUT_MS;
      this.runStartedAt = performance.now();
      this.setStatus("running");
      this.armTimer();
      this.worker?.postMessage({ type: "run", id: this.runId, code, stdinLines, scripted: options.scripted === true, files: this.startFiles });
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
