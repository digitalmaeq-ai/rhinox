// Rhinox Code Studio: the Python worker.
//
// This file is served as-is from /code-studio/python-worker.js (not bundled) so
// the site can give it its own strict response headers. It runs a learner's
// Python with Pyodide (CPython compiled to WebAssembly) away from the page.
//
// IMPORTANT: a Web Worker is risk reduction, not a complete security sandbox.
// See docs/code-studio.md for what it does and does not protect.
//
// Messages in  : { type: "init", baseUrl, inputBuffer }
//                { type: "run", id, code, stdinLines, scripted }
// Messages out : { type: "ready" } | { type: "fatal", message }
//                { type: "out", stream: "stdout" | "stderr", text }
//                { type: "input-request" }
//                { type: "done", id, ok, outputLimit, ms, heapMB }

const MAX_OUTPUT_CHARS = 100000; // everything one run may print
const MAX_INPUT_CHARS = 2000; // one line typed into input()
const FLUSH_MS = 40;

// Keep our own references, then remove the ways Python could reach the network
// or the rest of the worker. Done after Pyodide has loaded its own files.
const post = self.postMessage.bind(self);
const decoder = new TextDecoder();
const atomicsWait = Atomics.wait.bind(Atomics);

let pyodide = null;
let runPython = null; // the Python function that runs one program
let inputBuffer = null; // SharedArrayBuffer when the page is cross-origin isolated
let pendingLines = []; // scripted answers for input() (checks, or no shared buffer)
let scripted = false; // true: answer input() from pendingLines even if a shared buffer exists
let outChars = 0;
let limitHit = false;
let queue = { stdout: "", stderr: "" };
let lastFlush = 0;

function flush() {
  for (const stream of ["stdout", "stderr"]) {
    if (queue[stream]) {
      post({ type: "out", stream, text: queue[stream] });
      queue[stream] = "";
    }
  }
  lastFlush = performance.now();
}

function write(stream, bytes) {
  if (limitHit) return;
  let text = decoder.decode(bytes, { stream: true });
  if (outChars + text.length > MAX_OUTPUT_CHARS) {
    text = text.slice(0, MAX_OUTPUT_CHARS - outChars);
    limitHit = true;
  }
  outChars += text.length;
  queue[stream] += text;
  if (limitHit) {
    flush();
    // Stop the program. It is a BaseException so ordinary `except Exception`
    // blocks do not swallow it; the page also enforces its own time limit.
    throw new Error("OutputLimit");
  }
  if (performance.now() - lastFlush > FLUSH_MS || queue[stream].length > 4096) flush();
}

// input(): ask the page, then sleep until it answers through shared memory.
// Layout of inputBuffer: Int32[0] = state (0 waiting, 1 ready), Int32[1] = byte
// length, bytes from offset 8.
function readInputLine() {
  if (inputBuffer && !scripted) {
    flush();
    const flag = new Int32Array(inputBuffer, 0, 2);
    Atomics.store(flag, 0, 0);
    post({ type: "input-request" });
    while (Atomics.load(flag, 0) === 0) atomicsWait(flag, 0, 0, 1000);
    const length = Math.min(Atomics.load(flag, 1), MAX_INPUT_CHARS * 4);
    const bytes = new Uint8Array(inputBuffer, 8, length).slice();
    return decoder.decode(bytes);
  }
  if (pendingLines.length > 0) return pendingLines.shift();
  return null; // end of input: Python raises EOFError
}

const PYTHON_SETUP = String.raw`
import builtins, linecache, sys, traceback

# Modules a learner's program may not import. Network, process and
# introspection tools are excluded so the program stays a plain Python exercise.
BLOCKED = frozenset([
    "js", "pyodide", "pyodide_js", "_pyodide", "_pyodide_core", "micropip",
    "pyodide_http", "socket", "ssl", "select", "selectors", "asyncio",
    "http", "urllib", "ftplib", "smtplib", "poplib", "imaplib", "telnetlib",
    "xmlrpc", "webbrowser", "subprocess", "multiprocessing", "threading",
    "ctypes", "_ctypes", "gc", "importlib", "pkgutil", "zipimport", "runpy",
    "code", "codeop", "pty", "signal", "resource",
])
_real_import = builtins.__import__

def _guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
    if level == 0:
        top = name.partition(".")[0]
        if top in BLOCKED:
            raise ImportError(
                "Rhinox Code Studio does not allow importing '" + top + "'."
            )
    return _real_import(name, globals, locals, fromlist, level)

# Runtime internals are taken out of sys.modules while a program runs, so
# sys.modules cannot be used to look them up. Pyodide keeps its own references.
_HIDDEN = ("js", "pyodide", "pyodide_js", "_pyodide", "_pyodide_core", "micropip", "pyodide_http")

def _take_bridge_finders():
    # The finder that makes "import js" work is switched off while a program
    # runs (and put back by the saved copy of sys.meta_path), so even the real
    # __import__ cannot reach the JavaScript bridge by name. (Python introspection could still rebuild it: see docs/code-studio.md.)
    taken = []
    for index, finder in reversed(list(enumerate(sys.meta_path))):
        if type(finder).__name__ == "JsFinder":
            taken.append((index, sys.meta_path.pop(index)))
    return list(reversed(taken))

def run(source):
    hidden = {
        name: sys.modules.pop(name)
        for name in list(sys.modules)
        if name.partition(".")[0] in _HIDDEN
    }
    # Import machinery is saved and put back after the run, so a program that
    # empties sys.meta_path or edits sys.path cannot break the runs after it.
    saved_meta_path = list(sys.meta_path)
    saved_path = list(sys.path)
    saved_hooks = list(sys.path_hooks)
    _take_bridge_finders()
    before = set(sys.modules)
    user_builtins = dict(vars(builtins))
    user_builtins["__import__"] = _guarded_import
    for unsafe in ("breakpoint", "help", "exit", "quit"):
        user_builtins.pop(unsafe, None)
    namespace = {"__name__": "__main__", "__builtins__": user_builtins}
    linecache.cache["main.py"] = (len(source), None, source.splitlines(True), "main.py")
    ok = True
    try:
        exec(compile(source, "main.py", "exec"), namespace)
    except SystemExit:
        pass
    except BaseException as error:
        frames = [f for f in traceback.extract_tb(error.__traceback__)[1:] if f.filename == "main.py"]
        lines = []
        if frames:
            lines.append("Traceback (most recent call last):\n")
            lines.extend(traceback.format_list(frames))
        lines.extend(traceback.format_exception_only(type(error), error))
        sys.stderr.write("".join(lines))
        ok = False
    finally:
        for name in set(sys.modules) - before:
            sys.modules.pop(name, None)
        sys.modules.update(hidden)
        sys.meta_path[:] = saved_meta_path
        sys.path[:] = saved_path
        sys.path_hooks[:] = saved_hooks
        sys.path_importer_cache.clear()
        linecache.cache.pop("main.py", None)
    return ok
`;

async function init(baseUrl, shared) {
  inputBuffer = shared || null;
  const { loadPyodide } = await import(baseUrl + "pyodide.mjs");
  pyodide = await loadPyodide({ indexURL: baseUrl, fullStdLib: false });

  pyodide.setStdout({ write: (bytes) => (write("stdout", bytes), bytes.length) });
  pyodide.setStderr({ write: (bytes) => (write("stderr", bytes), bytes.length) });
  pyodide.setStdin({ stdin: readInputLine, isatty: false });

  const scope = pyodide.toPy({});
  pyodide.runPython(PYTHON_SETUP, { globals: scope });
  runPython = scope.get("run");
  scope.destroy();

  // From here on the program has no way to open a connection or start workers.
  for (const name of [
    "fetch", "XMLHttpRequest", "WebSocket", "EventSource", "WebTransport",
    "importScripts", "Worker", "SharedWorker", "indexedDB", "caches",
    "BroadcastChannel", "RTCPeerConnection",
  ]) {
    try {
      delete self[name];
    } catch {
      /* some properties cannot be removed; the page's headers still apply */
    }
  }
  try {
    Object.defineProperty(self.navigator, "sendBeacon", { value: undefined });
  } catch {
    /* ignore */
  }
  post({ type: "ready" });
}

function heapMB() {
  try {
    return Math.round(pyodide._module.HEAPU8.length / 1048576);
  } catch {
    return 0;
  }
}

function run(id, code, lines, isScripted) {
  scripted = isScripted === true;
  outChars = 0;
  limitHit = false;
  queue = { stdout: "", stderr: "" };
  pendingLines = Array.isArray(lines) ? lines.slice(0, 500).map(String) : [];
  const started = performance.now();
  let ok = false;
  try {
    ok = runPython(code) === true;
  } catch (error) {
    if (!limitHit) queue.stderr += "Internal error: " + String(error && error.message ? error.message : error) + "\n";
  }
  // Push out anything Python still holds (print(end="") and the like). After an
  // output-limit stop, write() discards it instead.
  try {
    pyodide.runPython("import sys\nsys.stdout.flush()\nsys.stderr.flush()");
  } catch {
    /* the streams were already shut by the output limit */
  }
  flush();
  post({ type: "done", id, ok, outputLimit: limitHit, ms: Math.round(performance.now() - started), heapMB: heapMB() });
}

self.onmessage = (event) => {
  const message = event.data || {};
  if (message.type === "init" && !pyodide) {
    const baseUrl = typeof message.baseUrl === "string" ? message.baseUrl : "/pyodide/";
    init(baseUrl, message.inputBuffer).catch((error) =>
      post({ type: "fatal", message: String(error && error.message ? error.message : error) }),
    );
  } else if (message.type === "run" && runPython) {
    run(message.id, String(message.code).slice(0, 100000), message.stdinLines, message.scripted);
  }
};
