// Run with:  npx tsx lib/code-studio/sandbox.test.ts
//
// Python-layer safety checks. Loads real Python (Pyodide, in Node) with the same
// setup code as the browser worker and tries to get past the import blocklist.
// This is only one layer: the browser-level layers (network removal, CSP,
// timeouts, output limits) are covered by scripts/code-studio-browser-tests.cjs.
// A worker is NOT a complete security sandbox - see docs/code-studio.md.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadPyodide } from "pyodide";

const worker = readFileSync(join(process.cwd(), "public/code-studio/python-worker.js"), "utf8");
const setup = /const PYTHON_SETUP = String\.raw`([\s\S]*?)`;/.exec(worker)?.[1];
assert.ok(setup, "could not find PYTHON_SETUP in the worker");

async function main() {
const pyodide = await loadPyodide();
const scope = pyodide.toPy({});
pyodide.runPython(setup as string, { globals: scope });
const run = scope.get("run");
let out = "";
let err = "";
pyodide.setStdout({ write: (b: Uint8Array) => ((out += new TextDecoder().decode(b)), b.length) });
pyodide.setStderr({ write: (b: Uint8Array) => ((err += new TextDecoder().decode(b)), b.length) });

type TestFile = { name: string; text: string };
function attempt(code: string, files: TestFile[] = []) {
  out = "";
  err = "";
  let ok = false;
  let outFiles: TestFile[] = [];
  let outCharts: Record<string, unknown>[] = [];
  try {
    const reply = JSON.parse(run(code, JSON.stringify(files)));
    ok = reply.ok === true;
    outFiles = reply.files;
    outCharts = reply.charts;
  } catch (error) {
    err += String(error);
  }
  pyodide.runPython("import sys\nsys.stdout.flush()\nsys.stderr.flush()");
  return { ok, out, err, files: outFiles, charts: outCharts };
}

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}

const BLOCKED = ["js", "pyodide", "pyodide_js", "socket", "urllib", "http", "subprocess", "ctypes", "gc", "importlib", "asyncio", "threading", "micropip", "ssl", "multiprocessing"];
for (const name of BLOCKED) {
  test(`import ${name} is refused`, () => {
    const r = attempt(`import ${name}`);
    assert.equal(r.ok, false);
    assert.match(r.err, new RegExp(`does not allow importing '${name}'|No module named`));
  });
}

const ESCAPES: Record<string, string> = {
  "builtins.__import__": 'import builtins\nbuiltins.__import__("js")\nprint("ESCAPED")',
  "print.__self__.__import__": 'print.__self__.__import__("js")\nprint("ESCAPED")',
  "__builtins__ dict": '__builtins__["__import__"]("js")\nprint("ESCAPED")',
  "sys.modules importlib": 'import sys\nsys.modules["importlib"].import_module("js")\nprint("ESCAPED")',
  "sys.modules js": 'import sys\nprint("ESCAPED" if sys.modules.get("js") else "none")',
  "meta_path cleared": 'import sys\nsys.meta_path.clear()\nprint.__self__.__import__("js")\nprint("ESCAPED")',
  "eval of import": 'eval("__import__(\'js\')")\nprint("ESCAPED")',
  "exec of import": 'exec("import js\\nprint(\'ESCAPED\')")',
};
for (const [name, code] of Object.entries(ESCAPES)) {
  test(`escape attempt contained: ${name}`, () => {
    const r = attempt(code);
    assert.ok(!r.out.includes("ESCAPED"), `escaped: ${r.out}`);
  });
}

test("the bridge is restored after a run that tampers with it", () => {
  attempt("import sys\nsys.meta_path.clear()");
  const r = attempt('print("fine")');
  assert.equal(r.ok, true);
  assert.equal(r.out.trim(), "fine");
});

test("ordinary standard-library imports still work", () => {
  const r = attempt("import math, random, string, json, re, datetime, statistics, collections\nprint(math.sqrt(16))");
  assert.equal(r.ok, true, r.err.trim().split("\n").pop());
  assert.equal(r.out.trim(), "4.0");
});

test("a program cannot see leftovers from the previous program", () => {
  attempt("secret = 42");
  const r = attempt("print('secret' in globals())");
  assert.equal(r.out.trim(), "False");
});

test("exceptions are reported, not thrown past the runner", () => {
  const r = attempt("1 / 0");
  assert.equal(r.ok, false);
  assert.match(r.err, /ZeroDivisionError/);
});

test("MemoryError is a normal exception", () => {
  const r = attempt("x = [0] * (10**9)");
  assert.equal(r.ok, false);
  assert.match(r.err, /MemoryError/);
});

test("runaway recursion raises RecursionError", () => {
  const r = attempt("def f():\n    return f()\nf()");
  assert.equal(r.ok, false);
  assert.match(r.err, /RecursionError/);
});

// ---- Files ----------------------------------------------------------------
const named = (r: { files: TestFile[] }, name: string) => r.files.find((f) => f.name === name)?.text;
const lastErr = (r: { err: string }) => r.err.trim().split("\n").pop() ?? "";

test("the worker's file limits match limits.ts", () => {
  const limits = readFileSync(join(process.cwd(), "lib/code-studio/limits.ts"), "utf8");
  const ts = (name: string) => Number(new RegExp(`export const ${name} = ([\\d_]+);`).exec(limits)?.[1].replace(/_/g, ""));
  for (const name of ["MAX_FILES", "MAX_FILE_CHARS", "MAX_TOTAL_FILE_CHARS", "MAX_FILE_NAME_CHARS"]) {
    const py = Number(new RegExp(`^${name} = (\\d+)$`, "m").exec(setup as string)?.[1]);
    assert.ok(ts(name) > 0 && py === ts(name), `${name}: limits.ts ${ts(name)} vs worker ${py}`);
  }
  const exts = /FILE_EXTENSIONS = \[([^\]]*)\]/.exec(limits)?.[1].match(/"[^"]+"/g)?.join(", ");
  assert.ok(exts && (setup as string).includes(`FILE_EXTENSIONS = (${exts})`), "extension lists differ");
});

test("a program can write a file, read it back, and the page gets it", () => {
  const r = attempt('with open("results.csv", "w") as f:\n    f.write("a,b\\n1,2\\n")\nprint(open("results.csv").read().strip())');
  assert.equal(r.ok, true, lastErr(r));
  assert.equal(r.out.trim(), "a,b\n1,2");
  assert.equal(named(r, "results.csv"), "a,b\n1,2\n");
});

test("files given to a run can be read, and 'a' adds to the end", () => {
  const r = attempt('with open("log.txt", "a") as f:\n    f.write("two\\n")\nprint(open("log.txt").read().split())', [{ name: "log.txt", text: "one\n" }]);
  assert.equal(r.ok, true, lastErr(r));
  assert.equal(named(r, "log.txt"), "one\ntwo\n");
  assert.equal(r.out.trim(), "['one', 'two']");
});

test("a file left unclosed is still saved when the run ends", () => {
  const r = attempt('f = open("a.txt", "w")\nf.write("kept")');
  assert.equal(named(r, "a.txt"), "kept");
});

test("a failing run still keeps what it wrote before failing", () => {
  const r = attempt('open("a.txt", "w").write("x")\n1/0');
  assert.equal(r.ok, false);
  assert.equal(named(r, "a.txt"), "x");
});

test("the csv module reads and writes (reader, writer, DictReader, DictWriter)", () => {
  const code = [
    "import csv",
    'with open("t.csv", "w", newline="") as f:',
    "    w = csv.writer(f)",
    '    w.writerow(["run", "secs"])',
    "    w.writerow([1, 2.5])",
    'with open("d.csv", "w", newline="") as f:',
    '    w = csv.DictWriter(f, fieldnames=["name", "score"])',
    "    w.writeheader()",
    '    w.writerow({"name": "Ada", "score": 9})',
    'with open("t.csv", newline="") as f:',
    "    print(list(csv.reader(f)))",
    'with open("d.csv") as f:',
    "    print([dict(r) for r in csv.DictReader(f)])",
  ].join("\n");
  const r = attempt(code);
  assert.equal(r.ok, true, lastErr(r));
  assert.match(r.out, /\[\['run', 'secs'\], \['1', '2.5'\]\]/);
  assert.match(r.out, /'name': 'Ada', 'score': '9'/);
  assert.equal(named(r, "t.csv"), "run,secs\r\n1,2.5\r\n");
});

test("iterating, readline, readlines and print(file=...) work", () => {
  const r = attempt('f = open("n.txt", "w")\nprint("one", file=f)\nprint("two", file=f)\nf.close()\nprint([l for l in open("n.txt")])\nf = open("n.txt")\nprint(f.readline().strip(), f.readlines())');
  assert.equal(r.ok, true, lastErr(r));
  assert.equal(r.out.trim(), "['one\\n', 'two\\n']\none ['two\\n']");
});

test("a missing file raises the usual FileNotFoundError", () => {
  const r = attempt('open("nope.csv")');
  assert.equal(r.ok, false);
  assert.match(r.err, /FileNotFoundError: \[Errno 2\] No such file or directory: 'nope.csv'/);
});

test("os.path.exists, os.listdir and os.remove see the program's files, and are put back", () => {
  const r = attempt('import os\nwith open("a.txt","w") as f:\n    f.write("x")\nprint(os.path.exists("a.txt"), os.listdir(), os.path.getsize("a.txt"))\nos.remove("a.txt")\nprint(os.path.exists("a.txt"))');
  assert.equal(r.ok, true, lastErr(r));
  assert.equal(r.out.trim(), "True ['a.txt'] 1\nFalse");
  assert.equal(named(r, "a.txt"), undefined);
  const after = attempt('import os\nprint(os.path.exists("/"), os.path.exists("a.txt"))');
  assert.equal(after.out.trim(), "True False");
});

const BAD_NAMES = ["../secret.txt", "/etc/passwd", "sub/x.csv", "..\\x.csv", ".hidden.csv", "x.exe", "x", "x.csv.exe", "a b.csv", ".csv", "x\\u0000.csv", "é.csv", "a".repeat(40) + ".csv"];
for (const bad of BAD_NAMES) {
  test(`file name refused: ${JSON.stringify(bad).slice(0, 40)}`, () => {
    const r = attempt(`open(${JSON.stringify(bad)}, "w").write("x")\nprint("OPENED")`);
    assert.ok(!r.out.includes("OPENED"), "opened a refused name");
    assert.equal(r.ok, false);
    assert.equal(r.files.length, 0);
  });
}

test("nothing outside the program's files can be read", () => {
  for (const target of ["/etc/passwd", "/proc/self/environ", "../../etc/passwd", "/lib/python3.14/os.py", "main.py"]) {
    const r = attempt(`print(open(${JSON.stringify(target)}).read()[:20])`);
    assert.equal(r.ok, false, target);
  }
});

test("binary, update and exclusive modes are refused", () => {
  for (const mode of ["rb", "wb", "r+", "w+", "x", "rw", "ww", "z", ""]) {
    const r = attempt(`open("a.txt", ${JSON.stringify(mode)})`);
    assert.equal(r.ok, false, `mode ${mode} was allowed`);
  }
});

test("file descriptors, pathlib, shutil, tempfile and glob are refused", () => {
  assert.equal(attempt("open(0)").ok, false);
  assert.equal(attempt("open(1, 'w')").ok, false);
  for (const name of ["pathlib", "shutil", "tempfile", "glob", "fileinput"]) {
    assert.equal(attempt(`import ${name}`).ok, false, name);
  }
});

test("a read-only file cannot be written to, and a write-only file cannot be read", () => {
  assert.equal(attempt('open("a.txt").write("x")', [{ name: "a.txt", text: "x" }]).ok, false);
  assert.equal(attempt('f = open("b.txt", "w")\nf.read()').ok, false);
});

test("one file cannot grow past the size limit, and the run fails cleanly", () => {
  const r = attempt('f = open("big.txt", "w")\nwhile True:\n    f.write("x" * 1000)');
  assert.equal(r.ok, false);
  assert.match(r.err, /OSError/);
  assert.ok((named(r, "big.txt") ?? "").length <= 200_000);
});

test("all files together cannot pass the total limit", () => {
  const code = 'for n in range(10):\n    f = open("f%d.txt" % n, "w")\n    for i in range(190):\n        f.write("x" * 1000)\n    f.close()';
  const r = attempt(code);
  assert.equal(r.ok, false);
  assert.ok(r.files.reduce((sum, f) => sum + f.text.length, 0) <= 1_000_000);
});

test("no more than 20 files can exist", () => {
  const r = attempt('for n in range(30):\n    open("f%d.txt" % n, "w").write("x")');
  assert.equal(r.ok, false);
  assert.equal(r.files.length, 20);
});

test("opening files in a loop without closing them cannot pile up handles", () => {
  const r = attempt('for n in range(500):\n    open("a.txt", "a")');
  assert.equal(r.ok, false);
  assert.match(r.err, /Too many open files/);
});

test("files from the page that break the rules are ignored by the worker", () => {
  const r = attempt('import os\nprint(os.listdir())', [
    { name: "good.csv", text: "ok" },
    { name: "../evil.csv", text: "x" },
    { name: "huge.txt", text: "x".repeat(200_001) },
    { name: "bad.exe", text: "x" },
  ]);
  assert.equal(r.out.trim(), "['good.csv']");
});

test("files do not leak between runs unless the page sends them again", () => {
  attempt('open("secret.txt","w").write("s")');
  const r = attempt('import os\nprint(os.listdir())');
  assert.equal(r.out.trim(), "[]");
});

test("a program cannot make open() unsafe for the next run", () => {
  attempt('import builtins\nbuiltins.open = lambda *a, **k: None\nopen = None');
  const r = attempt('print(open("../x.txt", "w"))');
  assert.equal(r.ok, false);
});


// ---- Charts ----------------------------------------------------------------
test("the worker's chart limits match limits.ts", () => {
  const limits = readFileSync(join(process.cwd(), "lib/code-studio/limits.ts"), "utf8");
  for (const name of ["MAX_CHARTS", "MAX_CHART_POINTS", "MAX_CHART_TEXT", "MAX_LABEL_CHARS"]) {
    const ts = Number(new RegExp(`export const ${name} = (\\d+);`).exec(limits)?.[1]);
    const py = Number(new RegExp(`^${name} = (\\d+)$`, "m").exec(setup as string)?.[1]);
    assert.ok(ts > 0 && ts === py, `${name}: limits.ts ${ts} vs worker ${py}`);
  }
});

test("bar_chart and line_chart hand plain data to the page", () => {
  const r = attempt('import charts\ncharts.bar_chart(["a", "b"], [3, 4.5], "Scores", "Name", "Points")\nfrom charts import line_chart\nline_chart([1, 2, 3], (5, 6, 7), title="Times")');
  assert.equal(r.ok, true, lastErr(r));
  assert.deepEqual(r.charts, [
    { kind: "bar", title: "Scores", xLabel: "Name", yLabel: "Points", labels: ["a", "b"], values: [3, 4.5] },
    { kind: "line", title: "Times", xLabel: "", yLabel: "", labels: ["1", "2", "3"], values: [5, 6, 7] },
  ]);
});

test("charts work with range(), a list from a file, and numbers as labels", () => {
  const r = attempt('import charts\nrows = open("d.csv").read().split()\ncharts.line_chart(range(len(rows)), [int(x) for x in rows])', [{ name: "d.csv", text: "4\n5\n6\n" }]);
  assert.equal(r.ok, true, lastErr(r));
  assert.deepEqual(r.charts[0].values, [4, 5, 6]);
});

test("charts from one run are not carried to the next", () => {
  attempt('import charts\ncharts.bar_chart(["a"], [1])');
  assert.equal(attempt("print(1)").charts.length, 0);
});

test("a chart is still handed over when the program fails later", () => {
  const r = attempt('import charts\ncharts.bar_chart(["a"], [1])\n1/0');
  assert.equal(r.ok, false);
  assert.equal(r.charts.length, 1);
});

test("bad chart data gives a helpful error, and nothing is drawn", () => {
  const cases: [string, RegExp][] = [
    ['charts.bar_chart(["a", "b"], [1])', /same length \(2 and 1\)/],
    ['charts.bar_chart([], [])', /nothing to draw/],
    ['charts.bar_chart(["a"], ["x"])', /numbers only/],
    ['charts.bar_chart(["a"], [True])', /numbers only/],
    ['charts.bar_chart(["a"], [float("nan")])', /ordinary numbers/],
    ['charts.bar_chart(["a"], [float("inf")])', /ordinary numbers/],
    ['charts.bar_chart(["a"], [10**30])', /too big/],
    ['charts.bar_chart("abc", [1, 2, 3])', /must be a list/],
    ['charts.bar_chart(5, [1])', /must be a list/],
    ['charts.bar_chart(list(range(101)), list(range(101)))', /at most 100/],
    ['for i in range(6):\n    charts.bar_chart(["a"], [1])', /at most 5 charts/],
  ];
  for (const [code, expected] of cases) {
    const r = attempt("import charts\n" + code);
    assert.equal(r.ok, false, code);
    assert.match(r.err, expected, code);
  }
});

test("chart text is cut to size, and is only ever text", () => {
  const r = attempt('import charts\nclass Odd:\n    def __str__(self):\n        return "<b>" * 50\ncharts.bar_chart([Odd(), "x" * 100], [1, 2], "t" * 200, Odd(), None)');
  assert.equal(r.ok, true, lastErr(r));
  const chart = r.charts[0] as { title: string; xLabel: string; yLabel: string; labels: string[] };
  assert.equal(chart.title.length, 60);
  assert.equal(chart.xLabel.length, 60);
  assert.equal(chart.yLabel, "");
  assert.ok(chart.labels.every((l) => l.length <= 24));
});

test("a program cannot swap the charts module for a later run", () => {
  attempt('import sys, charts\nsys.modules["charts"] = None\ncharts.bar_chart = lambda *a: 1');
  const r = attempt('import charts\ncharts.bar_chart(["a"], [1])');
  assert.equal(r.ok, true, lastErr(r));
  assert.equal(r.charts.length, 1);
});

console.log(`\n${passed} tests passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
