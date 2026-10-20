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

const attempt = (code: string) => attemptWith(code);
function attemptWith(code: string) {
  out = "";
  err = "";
  let ok = false;
  try {
    ok = run(code) === true;
  } catch (error) {
    err += String(error);
  }
  pyodide.runPython("import sys\nsys.stdout.flush()\nsys.stderr.flush()");
  return { ok, out, err };
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

console.log(`\n${passed} tests passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
