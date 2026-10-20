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
//                { type: "run", id, code, stdinLines, scripted, files, device, script }
// Messages out : { type: "ready" } | { type: "fatal", message }
//                { type: "out", stream: "stdout" | "stderr", text }
//                { type: "input-request" }
//                { type: "device", kind: "leds" | "sound" | "pin", ... }  (micro:bit simulator)
//                { type: "done", id, ok, outputLimit, ms, heapMB, files, charts, device }

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

// ---- micro:bit simulator: the live board --------------------------------------
// Python reaches the page through ONE private device file, /dev/rxdev. Each write
// is a small JSON request and the next read is the reply. Every request is
// checked here, and everything sent on to the page is plain data the page checks
// again. The page writes the board's inputs (buttons, tilt, ...) into shared memory.
const encoder = new TextEncoder();
const requestDecoder = new TextDecoder();
const SLEEP_CELL = typeof SharedArrayBuffer === "function" ? new Int32Array(new SharedArrayBuffer(4)) : null;
const MAX_SLEEP_MS = 60000;
const LED_GAP_MS = 16;
const MAX_DEVICE_EVENTS_PER_SECOND = 60;
let boardInputs = null; // Int32Array over the page's shared memory
let boardLive = false; // true only while a live micro:bit run is going
let boardStart = 0;
let pendingLeds = null;
let lastLedPost = 0;
let deviceReply = new Uint8Array(0);
let eventTimes = [];

function boardNow() {
  return Math.round(performance.now() - boardStart);
}

function sendLeds(force) {
  if (pendingLeds === null) return;
  const now = performance.now();
  if (!force && now - lastLedPost < LED_GAP_MS) return;
  post({ type: "device", kind: "leds", d: pendingLeds });
  pendingLeds = null;
  lastLedPost = now;
}

function allowEvent() {
  const now = performance.now();
  eventTimes = eventTimes.filter((t) => now - t < 1000);
  if (eventTimes.length >= MAX_DEVICE_EVENTS_PER_SECOND) return false;
  eventTimes.push(now);
  return true;
}

function readBoard() {
  const v = boardInputs;
  const get = (i) => (v ? Atomics.load(v, i) : 0);
  return {
    a: get(0), b: get(1), logo: get(2), a_n: get(3), b_n: get(4), logo_n: get(5),
    x: v ? get(6) : 0, y: v ? get(7) : 0, z: v ? get(8) : -1024,
    temp: v ? get(9) : 21, light: v ? get(10) : 128,
    gest: get(11), gest_n: get(12),
    pin: [get(13), get(14), get(15)], touch: [get(16), get(17), get(18)],
    t: boardNow(),
  };
}

function boardSleep(ms) {
  sendLeds(true);
  let left = Math.max(0, Math.min(MAX_SLEEP_MS, Math.round(ms)));
  const until = performance.now() + left;
  while (left > 0) {
    if (SLEEP_CELL) atomicsWait(SLEEP_CELL, 0, 0, Math.min(left, 100));
    left = until - performance.now();
  }
}

function handleBoardRequest(text) {
  if (!boardLive) return {};
  let message;
  try {
    message = JSON.parse(text);
  } catch {
    return {};
  }
  if (!message || typeof message !== "object") return {};
  switch (message.c) {
    case "now":
      return { t: boardNow() };
    case "poll":
      return readBoard();
    case "sleep":
      boardSleep(Number(message.ms) || 0);
      return {};
    case "leds":
      if (typeof message.d === "string" && /^[0-9]{25}$/.test(message.d)) {
        pendingLeds = message.d;
        sendLeds(false);
      }
      return {};
    case "sound": {
      const f = Math.round(Number(message.f));
      const ms = Math.round(Number(message.ms));
      if (Number.isFinite(f) && Number.isFinite(ms) && f >= 0 && f <= 20000 && ms >= 0 && ms <= 60000 && allowEvent()) {
        post({ type: "device", kind: "sound", f, ms });
      }
      return {};
    }
    case "pin": {
      const n = Math.round(Number(message.n));
      const v = Math.round(Number(message.v));
      if (n >= 0 && n <= 20 && (message.k === "d" || message.k === "a") && v >= 0 && v <= 1023 && allowEvent()) {
        post({ type: "device", kind: "pin", n, k: message.k, v });
      }
      return {};
    }
    default:
      return {};
  }
}

function registerBoardDevice() {
  const FS = pyodide.FS;
  const id = FS.makedev(64, 0);
  FS.registerDevice(id, {
    open() {},
    close() {},
    read(stream, buffer, offset, length) {
      const n = Math.min(length, deviceReply.length);
      buffer.set(deviceReply.subarray(0, n), offset);
      deviceReply = deviceReply.subarray(n);
      return n;
    },
    write(stream, buffer, offset, length) {
      const text = requestDecoder.decode(buffer.subarray(offset, offset + Math.min(length, 4096)));
      deviceReply = encoder.encode(JSON.stringify(handleBoardRequest(text)));
      return length;
    },
  });
  FS.mkdev("/dev/rxdev", 0o666, id);
}

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
import builtins, io, json, linecache, os, re, sys, traceback, types

# Modules a learner's program may not import. Network, process and
# introspection tools are excluded so the program stays a plain Python exercise.
BLOCKED = frozenset([
    "js", "pyodide", "pyodide_js", "_pyodide", "_pyodide_core", "micropip",
    "pyodide_http", "socket", "ssl", "select", "selectors", "asyncio",
    "http", "urllib", "ftplib", "smtplib", "poplib", "imaplib", "telnetlib",
    "xmlrpc", "webbrowser", "subprocess", "multiprocessing", "threading",
    "ctypes", "_ctypes", "gc", "importlib", "pkgutil", "zipimport", "runpy",
    "code", "codeop", "pty", "signal", "resource",
    "pathlib", "shutil", "tempfile", "glob", "fnmatch", "fileinput",
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

# ---- Files -----------------------------------------------------------------
# A program's files are NOT real files. They are kept in this dictionary: the
# page hands them over at the start of a run and takes them back at the end.
# open() is replaced by a version that only knows this dictionary, so a program
# cannot reach any other file. Keep these limits equal to lib/code-studio/limits.ts
# (a test checks that they match).
MAX_FILES = 20
MAX_FILE_CHARS = 200000
MAX_TOTAL_FILE_CHARS = 1000000
MAX_FILE_NAME_CHARS = 40
MAX_OPEN_FILES = 50
FILE_EXTENSIONS = (".csv", ".txt", ".tsv", ".json", ".md", ".log")
_NAME = re.compile("^[A-Za-z0-9][A-Za-z0-9_.-]{0,39}$")
_dumps = json.dumps
_loads = json.loads
_StringIO = io.StringIO
_Unsupported = io.UnsupportedOperation
_files = {}
_sizes = {}
_handles = set()

def _good_name(name):
    if not isinstance(name, str) or not _NAME.match(name):
        return False
    lower = name.lower()
    return any(lower.endswith(e) and len(lower) > len(e) for e in FILE_EXTENSIONS)

def _check_name(name):
    if isinstance(name, bytes) or not isinstance(name, str):
        name = str(name)
    if not _good_name(name):
        raise PermissionError(
            1,
            "Rhinox Code Studio only opens files with simple names, like results.csv "
            "(letters, numbers, dots, dashes or underscores; ending in .csv, .txt, .tsv, .json, .md or .log)",
            name,
        )
    return name

def _room_error(what):
    return OSError(28, what)

class _FileHandle(_StringIO):
    def __init__(self, name, mode, initial, newline):
        _StringIO.__init__(self, initial, newline)
        self.name = name
        self.mode = mode
        self._can_write = mode != "r"
        self._size = len(initial)
        if self._can_write:
            self.seek(0, 2)
            _handles.add(self)

    def readable(self):
        return not self._can_write

    def writable(self):
        return self._can_write

    def write(self, text):
        if not self._can_write:
            raise _Unsupported("not writable")
        if not isinstance(text, str):
            raise TypeError("write() argument must be str, not " + type(text).__name__)
        size = self._size + len(text)
        if size > MAX_FILE_CHARS:
            raise _room_error("File too large: a file can hold at most " + str(MAX_FILE_CHARS) + " characters in Rhinox Code Studio")
        _sizes[self.name] = size
        if sum(_sizes.values()) > MAX_TOTAL_FILE_CHARS:
            _sizes[self.name] = self._size
            raise _room_error("No room left: all files together can hold at most " + str(MAX_TOTAL_FILE_CHARS) + " characters in Rhinox Code Studio")
        self._size = size
        return _StringIO.write(self, text)

    def writelines(self, lines):
        for line in lines:
            self.write(line)

    def _need_read(self):
        if self._can_write:
            raise _Unsupported("not readable")

    def read(self, *args):
        self._need_read()
        return _StringIO.read(self, *args)

    def readline(self, *args):
        self._need_read()
        return _StringIO.readline(self, *args)

    def readlines(self, *args):
        self._need_read()
        return _StringIO.readlines(self, *args)

    def __next__(self):
        self._need_read()
        line = _StringIO.readline(self)
        if not line:
            raise StopIteration
        return line

    def _commit(self):
        if self._can_write and not self.closed:
            _files[self.name] = self.getvalue()
            _sizes[self.name] = len(_files[self.name])
            self._size = _sizes[self.name]

    def flush(self):
        self._commit()
        return _StringIO.flush(self)

    def close(self):
        if not self.closed:
            self._commit()
            _handles.discard(self)
        _StringIO.close(self)

def _open(file, mode="r", buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None):
    if isinstance(file, int) or opener is not None:
        raise PermissionError(1, "Rhinox Code Studio only opens files by name")
    name = _check_name(file)
    if not isinstance(mode, str):
        raise TypeError("open() argument 'mode' must be str, not " + type(mode).__name__)
    letters = set(mode)
    if "b" in letters:
        raise ValueError("Rhinox Code Studio opens text files only: remove the 'b' from the mode")
    if "+" in letters or len(mode) != len(letters) or not letters or not letters <= set("rwat") or sum(c in "rwa" for c in mode) != 1:
        raise ValueError("invalid mode: '" + mode + "'. Use 'r' to read, 'w' to write or 'a' to add to the end of a file")
    kind = "r" if "r" in letters else ("w" if "w" in letters else "a")
    if newline not in (None, "", "\n", "\r", "\r\n"):
        raise ValueError("illegal newline value: " + repr(newline))
    if kind == "r":
        if name not in _files:
            raise FileNotFoundError(2, "No such file or directory", name)
        return _FileHandle(name, "r", _files[name], newline)
    if len(_handles) >= MAX_OPEN_FILES:
        raise OSError(24, "Too many open files: close files with f.close() or use with open(...)")
    if name not in _files and len(_files) >= MAX_FILES:
        raise _room_error("Too many files: Rhinox Code Studio keeps at most " + str(MAX_FILES) + " files")
    if kind == "w":
        _files[name] = ""
        _sizes[name] = 0
        return _FileHandle(name, "w", "", newline)
    _files.setdefault(name, "")
    _sizes[name] = len(_files[name])
    return _FileHandle(name, "a", _files[name], newline)

# os.path.exists, os.listdir and os.remove are pointed at the same files while
# a program runs, then put back.

def _flat(path):
    return path if isinstance(path, str) and path in _files else None

def _make_os_patches():
    real = {"exists": os.path.exists, "isfile": os.path.isfile, "getsize": os.path.getsize,
            "listdir": os.listdir, "remove": os.remove, "unlink": os.unlink}
    def exists(path):
        return True if _flat(path) else real["exists"](path)
    def isfile(path):
        return True if _flat(path) else real["isfile"](path)
    def getsize(path):
        if _flat(path):
            return len(_files[path].encode("utf-8"))
        return real["getsize"](path)
    def listdir(path="."):
        if path in (".", ""):
            return sorted(_files)
        return real["listdir"](path)
    def remove(path, *args, **kwargs):
        if _flat(path):
            del _files[path]
            _sizes.pop(path, None)
            return None
        raise FileNotFoundError(2, "No such file or directory", path)
    return real, {"exists": exists, "isfile": isfile, "getsize": getsize,
                  "listdir": listdir, "remove": remove, "unlink": remove}

# ---- Charts ----------------------------------------------------------------
# "import charts" gives a program bar_chart and line_chart. They only collect
# plain data (labels and numbers). The page checks it again and draws the
# picture itself. Keep these limits equal to lib/code-studio/limits.ts (a test
# checks that they match).
MAX_CHARTS = 5
MAX_CHART_POINTS = 100
MAX_CHART_TEXT = 60
MAX_LABEL_CHARS = 24
_charts = []

def _plain_text(value, limit):
    if value is None:
        return ""
    return str(value)[:limit]

def _as_list(values, what):
    if isinstance(values, (str, bytes, dict)) or not hasattr(values, "__iter__"):
        raise TypeError(what + " must be a list, like [1, 2, 3]")
    return list(values)

def _numbers(values, what):
    out = []
    for value in _as_list(values, what):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(what + " must hold numbers only, but it has " + repr(value)[:30])
        if value != value or value in (float("inf"), float("-inf")):
            raise ValueError(what + " must hold ordinary numbers, not nan or infinity")
        if abs(value) > 1e15:
            raise ValueError(what + " has a number that is too big to draw")
        out.append(value)
    return out

def _add_chart(kind, labels, values, title, x_label, y_label, label_name, value_name):
    names = [_plain_text(item, MAX_LABEL_CHARS) for item in _as_list(labels, label_name)]
    numbers = _numbers(values, value_name)
    if len(names) != len(numbers):
        raise ValueError(label_name + " and " + value_name + " must be the same length (" + str(len(names)) + " and " + str(len(numbers)) + ")")
    if not numbers:
        raise ValueError("There is nothing to draw: " + value_name + " is empty")
    if len(numbers) > MAX_CHART_POINTS:
        raise ValueError("A chart can show at most " + str(MAX_CHART_POINTS) + " " + ("bars" if kind == "bar" else "points"))
    if len(_charts) >= MAX_CHARTS:
        raise ValueError("A program can draw at most " + str(MAX_CHARTS) + " charts")
    _charts.append({
        "kind": kind,
        "title": _plain_text(title, MAX_CHART_TEXT),
        "xLabel": _plain_text(x_label, MAX_CHART_TEXT),
        "yLabel": _plain_text(y_label, MAX_CHART_TEXT),
        "labels": names,
        "values": numbers,
    })

def bar_chart(labels, values, title="", x_label="", y_label=""):
    """Draw a bar chart: one bar for each label, as tall as its value."""
    _add_chart("bar", labels, values, title, x_label, y_label, "labels", "values")

def line_chart(x_values, y_values, title="", x_label="", y_label=""):
    """Draw a line chart: one point for each x value (a number or a name), joined by a line."""
    _add_chart("line", x_values, y_values, title, x_label, y_label, "x_values", "y_values")

def _make_charts_module():
    # A fresh module for every run, so a program that changes it cannot affect the next one.
    module = types.ModuleType("charts")
    module.__doc__ = "Rhinox Code Studio charts: bar_chart(labels, values, title) and line_chart(x_values, y_values, title)."
    module.bar_chart = bar_chart
    module.line_chart = line_chart
    return module

def _load_files(files_json):
    _files.clear()
    _sizes.clear()
    _handles.clear()
    try:
        items = _loads(files_json)
    except Exception:
        items = []
    total = 0
    for item in items if isinstance(items, list) else []:
        if (isinstance(item, dict) and _good_name(item.get("name")) and isinstance(item.get("text"), str)
                and item["name"] not in _files and len(_files) < MAX_FILES
                and len(item["text"]) <= MAX_FILE_CHARS and total + len(item["text"]) <= MAX_TOTAL_FILE_CHARS):
            _files[item["name"]] = item["text"]
            _sizes[item["name"]] = len(item["text"])
            total += len(item["text"])

# ---- micro:bit simulator ---------------------------------------------------
# microbit.py is fetched by the worker and compiled once. For each run that
# imports it, it is executed afresh (so nothing a program changes lasts) with
# builtins that have the same import guard as the program itself.
_MB = {"code": None}

def install_microbit(source):
    _MB["code"] = compile(source, "microbit.py", "exec")

def _start_microbit(mode, script_json, guarded_builtins):
    namespace = {"__name__": "_rx_microbit", "__builtins__": guarded_builtins}
    exec(_MB["code"], namespace)
    fd = None
    if mode == "live":
        fd = os.open("/dev/rxdev", os.O_RDWR)
        def ask(message):
            os.write(fd, _dumps(message).encode())
            return json.loads(os.read(fd, 8192))
        backend = namespace["LiveBackend"](ask)
    else:
        backend = namespace["ScriptedBackend"](json.loads(script_json) if script_json else {})
    microbit_module, music_module = namespace["build"](backend)
    return namespace, backend, microbit_module, music_module, fd

def run(source, files_json="[]", device_mode="", script_json=""):
    _load_files(files_json)
    del _charts[:]
    sys.modules["charts"] = _make_charts_module()
    real_os, fake_os = _make_os_patches()
    os.path.exists, os.path.isfile, os.path.getsize = fake_os["exists"], fake_os["isfile"], fake_os["getsize"]
    os.listdir, os.remove, os.unlink = fake_os["listdir"], fake_os["remove"], fake_os["unlink"]
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
    user_builtins["open"] = _open
    for unsafe in ("breakpoint", "help", "exit", "quit"):
        user_builtins.pop(unsafe, None)
    namespace = {"__name__": "__main__", "__builtins__": user_builtins}
    device = None
    if device_mode in ("live", "script") and _MB["code"] is not None:
        device = _start_microbit(device_mode, script_json, user_builtins)
        sys.modules["microbit"] = device[2]
        sys.modules["music"] = device[3]
    linecache.cache["main.py"] = (len(source), None, source.splitlines(True), "main.py")
    ok = True
    try:
        exec(compile(source, "main.py", "exec"), namespace)
    except SystemExit:
        pass
    except BaseException as error:
        if device is not None and type(error).__name__ == "_SimulationEnd":
            pass
        else:
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
        if device is not None and device[4] is not None:
            try:
                os.close(device[4])
            except BaseException:
                pass
        for handle in list(_handles):
            try:
                handle.close()
            except BaseException:
                pass
        os.path.exists, os.path.isfile, os.path.getsize = real_os["exists"], real_os["isfile"], real_os["getsize"]
        os.listdir, os.remove, os.unlink = real_os["listdir"], real_os["remove"], real_os["unlink"]
    return _dumps({"ok": ok, "files": [{"name": n, "text": _files[n]} for n in sorted(_files)], "charts": list(_charts), "device": (device[1].trace() if device is not None else None)})
`;

async function init(baseUrl, shared, board) {
  inputBuffer = shared || null;
  boardInputs = board ? new Int32Array(board) : null;
  const { loadPyodide } = await import(baseUrl + "pyodide.mjs");
  pyodide = await loadPyodide({ indexURL: baseUrl, fullStdLib: false });

  pyodide.setStdout({ write: (bytes) => (write("stdout", bytes), bytes.length) });
  pyodide.setStderr({ write: (bytes) => (write("stderr", bytes), bytes.length) });
  pyodide.setStdin({ stdin: readInputLine, isatty: false });

  const scope = pyodide.toPy({});
  pyodide.runPython(PYTHON_SETUP, { globals: scope });
  runPython = scope.get("run");
  // The micro:bit module is a plain file next to this worker. If it cannot be
  // fetched, programs that import microbit say so; everything else still works.
  try {
    const reply = await fetch(new URL("microbit.py", self.location.href));
    if (reply.ok) {
      scope.get("install_microbit")(await reply.text());
      registerBoardDevice();
    }
  } catch {
    /* the simulator is optional */
  }
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

function run(id, code, lines, isScripted, files, device, script) {
  scripted = isScripted === true;
  const mode = device === "live" || device === "script" ? device : "";
  boardLive = mode === "live";
  boardStart = performance.now();
  pendingLeds = null;
  eventTimes = [];
  deviceReply = new Uint8Array(0);
  outChars = 0;
  limitHit = false;
  queue = { stdout: "", stderr: "" };
  pendingLines = Array.isArray(lines) ? lines.slice(0, 500).map(String) : [];
  const started = performance.now();
  let ok = false;
  let outFiles = null; // null: the page keeps the files it already has
  let outCharts = [];
  let outDevice = null;
  try {
    const reply = JSON.parse(
      runPython(code, JSON.stringify(Array.isArray(files) ? files : []), mode, mode === "script" ? JSON.stringify(script || {}) : ""),
    );
    outDevice = reply.device && typeof reply.device === "object" ? reply.device : null;
    ok = reply.ok === true;
    outFiles = Array.isArray(reply.files) ? reply.files : null;
    outCharts = Array.isArray(reply.charts) ? reply.charts : [];
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
  sendLeds(true);
  boardLive = false;
  post({ type: "done", id, ok, outputLimit: limitHit, ms: Math.round(performance.now() - started), heapMB: heapMB(), files: outFiles, charts: outCharts, device: outDevice });
}

self.onmessage = (event) => {
  const message = event.data || {};
  if (message.type === "init" && !pyodide) {
    const baseUrl = typeof message.baseUrl === "string" ? message.baseUrl : "/pyodide/";
    init(baseUrl, message.inputBuffer, message.boardBuffer).catch((error) =>
      post({ type: "fatal", message: String(error && error.message ? error.message : error) }),
    );
  } else if (message.type === "run" && runPython) {
    run(message.id, String(message.code).slice(0, 100000), message.stdinLines, message.scripted, message.files, message.device, message.script);
  }
};
