# Rhinox Code Studio: how it works, and what it does not protect

Route: `/coding-robotics/code-studio`. Python runs **in the learner's own browser**.
There is no server-side code execution service.

## Exercises

Exercises are data, not code that runs Python: a task, a starter program, hints
and checks (`lib/code-studio/exercise-kit.ts` has the shared types and helpers).
There are five starters (`exercises.ts`), ten Year 7 exercises
(`exercises-year7.ts`), ten Year 8 exercises (`exercises-year8.ts`) and eleven Year 9
exercises (`exercises-year9.ts`), each tagged with its curriculum term and week. To add a
year, add a file like `exercises-year9.ts`, add the year to `ExerciseGroup` in the
kit, list it in `GROUPS` in `ExercisePanel.tsx`, and add model solutions and
wrong-answer tests to `exercises.test.ts`. Exercise ids are saved in learners'
progress and projects, so never rename one.

## Files and CSV (Stage 2.2)

Programs can use `open()` with `"r"`, `"w"` and `"a"` (text only), and the `csv`
module. The files are **not real files**:

- The page owns them (`lib/code-studio/files.ts`, kept in `localStorage` under
  `rhinox-code-studio-files`) and sends a copy with every run. The worker keeps
  them in a Python dictionary, and gives the learner a replacement `open()` that
  only knows that dictionary. Whatever is left after the run is sent back and
  **checked again by the page** (`cleanFiles`) before it is kept.
- Names are flat and simple (`^[A-Za-z0-9][A-Za-z0-9_.-]{0,39}$`, ending in `.csv`,
  `.txt`, `.tsv`, `.json`, `.md` or `.log`). Paths, `..`, hidden names, other
  extensions and file numbers are refused. Binary and `+` and `x` modes are refused.
- Limits: 20 files, 200,000 characters each, 1,000,000 in all, 50 open at once.
  A program that goes over gets an `OSError` instead of a crash. The limits are
  written in `limits.ts` and in the worker; a test checks they match.
- `os.path.exists`, `os.path.isfile`, `os.path.getsize`, `os.listdir`,
  `os.remove` and `os.unlink` look at the same files while a program runs and are
  put back afterwards. `pathlib`, `shutil`, `tempfile`, `glob`, `fnmatch` and
  `fileinput` cannot be imported.
- A run that is stopped, times out or crashes does not change the files. A run
  that fails with a Python error keeps what it had written.
- Exercise checks give each case its own starting files (`CheckCase.files`) and
  read the files left behind (`RunCapture.files`). A check never reads or changes
  the learner's own files.
- The Files panel (`FilesPanel.tsx`) lists, views, downloads (CSV with a
  byte-order mark so spreadsheets read it), adds from the computer (size,
  name and binary checks) and deletes (asks first) files.
- Residual: `io.open` and `os` calls we have not replaced still act on the
  worker's temporary in-memory file system. Nothing there is saved or sent out,
  and it is thrown away when the worker restarts.

## Charts (Stage 2.3)

`import charts` gives a program `bar_chart(labels, values, title, x_label, y_label)`
and `line_chart(x_values, y_values, title, x_label, y_label)`.

- The worker only **collects plain data** (a kind, text labels and finite numbers).
  It does not draw anything and gives the program no way to send markup.
- The page checks that data again (`cleanCharts` in `lib/code-studio/charts.ts`:
  kind, matching lengths, finite numbers, at most 5 charts and 100 points, text cut
  to length) and **draws the SVG itself** in React (`ChartsPanel.tsx`). Labels and
  titles are text nodes, so a label such as `<img onerror=...>` is shown as text.
- A run that does not finish (timeout, Stop, crash) draws no chart. The charts are
  not stored: they are cleared on the next run.
- Every chart has a text description, a "Show the numbers" table, and a download as
  SVG. Exercise checks read the chart data (`RunCapture.charts`), so a check never
  draws on the page.
- The `charts` module object is rebuilt for every run, so a program that changes it
  does not affect the next run. Limits are in `limits.ts` and in the worker; a test
  checks that they match.

## Pieces

| Piece | Where | Notes |
|---|---|---|
| Editor | `lib/code-studio/monaco-setup.ts`, `app/components/code-studio/PythonEditor.tsx` | Monaco core plus Python colouring only, bundled by Next.js (no CDN, no copied files). |
| Page | `app/components/code-studio/CodeStudio.tsx` | Run, Stop, Reset, console, input line. |
| Controller | `lib/code-studio/runner.ts`, `limits.ts` | Owns the worker. Enforces the time limit **from outside** the worker. Treats every message from the worker as untrusted. |
| Worker | `public/code-studio/python-worker.js` | Served as a plain file so it can have its own headers. Runs Pyodide (CPython compiled to WebAssembly). |
| Runtime files | `public/pyodide/<version>/` | Copied from `node_modules/pyodide` by `scripts/copy-code-studio-assets.mjs` on every `predev`/`prebuild`. Git-ignored. |
| Headers | `next.config.ts` | Route-scoped. See below. |

## A Web Worker is risk reduction, not a complete security sandbox

The worker keeps a learner's program off the page (no DOM, no cookies, no
`localStorage`, no access to React state) and lets the page kill it at any time.
That is all it is. It is **not** a hardened sandbox. A determined person running
code in their own browser tab can still try to abuse it, and the design assumes
that. What matters is that the worst case stays inside the learner's own tab.

### Layers in place

1. **Separate worker.** Python never runs on the page thread. The page can
   `terminate()` it at any moment, so an endless loop cannot freeze the page.
2. **Time limit** (10 s of running time; time spent waiting at `input()` is not
   counted). Enforced by a timer on the page, not inside the worker.
3. **Output limit** (100,000 characters). The worker stops the program; the page
   has a second cap (150,000) as a backstop.
4. **Network removed from the worker** before any learner code runs: `fetch`,
   `XMLHttpRequest`, `WebSocket`, `EventSource`, `WebTransport`, `importScripts`,
   `Worker`, `SharedWorker`, `indexedDB`, `caches`, `BroadcastChannel`,
   `RTCPeerConnection` are deleted from the worker's global scope.
5. **Blocked imports** in the learner's program: `js`, `pyodide`, `pyodide_js`,
   `micropip`, `socket`, `ssl`, `urllib`, `http`, `subprocess`, `multiprocessing`,
   `threading`, `ctypes`, `gc`, `importlib`, `asyncio` and a few more. The
   runtime's own modules are also removed from `sys.modules` while a program runs.
   The finder that makes `import js` work is switched off during a run, so even
   Python's real `__import__` (reached through `import builtins`,
   `print.__self__.__import__` or `importlib`) answers `No module named 'js'`.
   The import machinery (`sys.meta_path`, `sys.path`, `sys.path_hooks`) is saved
   before and restored after every run, so a program that empties it cannot break
   later runs.
6. **No package installs.** Only the standard library is available.
7. **Worker response headers** (CSP `default-src 'none'; script-src 'self'
   'wasm-unsafe-eval'; connect-src 'self'`): the worker may load scripts and
   fetch files from this site only, never from another origin.
8. **Page CSP** on the Code Studio route only: no scripts, frames or connections
   to other origins.
9. **Untrusted messages.** The page accepts only exact message shapes from the
   worker and caps their size.
10. **Recovery.** After a timeout, Stop, crash or a memory-heavy run, the worker
    is discarded and a clean one is started on the next Run.

### Known residual risks (not fixed in Milestone 1)

- **Not a complete sandbox.** Deeper Python introspection tricks (for example
  walking `object.__subclasses__()` to find the bridge's finder class and put it
  back) might reach the JavaScript bridge. The one attempt of this kind in the
  test suite did not succeed in the browser, but we do not claim it is
  impossible. If one did, the
  program would still find no network functions and no DOM, and the CSP would
  block other origins, but it could still, for example, post fake messages to the
  page (the page validates them) or burn CPU until the time limit.
- **Memory.** A program can allocate roughly 1.5 GB before Python refuses
  (measured: a 1.5 GB `bytearray` succeeded; a 10^9-element list raised
  `MemoryError` immediately). Nothing inside the browser can lower that ceiling.
  On a low-memory device the browser may close the tab. Mitigation: after any run
  that grows Python's memory beyond 256 MB the worker is replaced.
- **Same-origin requests.** The worker's CSP allows same-origin `connect`, which
  the runtime itself needs. Learner code cannot call it (fetch is removed), but
  this is why removal in the worker matters.
- **Monkeypatching.** A program can change Python's standard library behaviour for
  later runs in the same worker. This affects only that learner's tab and is
  cleared whenever the worker restarts.
- **Learner can only attack themselves today.** There is no project sharing, so
  nobody else ever runs another person's code. If sharing or teacher-view of
  student code is added, this must be reviewed first.
- **CPU.** A tight loop can use a full core for up to 10 s.
- **Support.** Needs module workers and WebAssembly (current Chrome, Edge,
  Firefox, Safari). `input()` waiting needs cross-origin isolation; without it a
  "Program input" box is shown instead.

## Security tests (repeatable)

Run all three before changing the worker, the CSP or `next.config.ts`:

| Test | How to run | What it covers |
| --- | --- | --- |
| `lib/code-studio/sandbox.test.ts` | `npx tsx lib/code-studio/sandbox.test.ts` | Python layer, real Python in Node (70 checks): 15 blocked imports, 8 escape attempts, import machinery restored, stdlib still works, no state carried between runs, MemoryError, RecursionError; files: write/read/append, csv module, 13 refused names, no reading outside the files, refused modes, size, count and handle limits, limits match `limits.ts` |
| `lib/code-studio/charts.test.ts` | `npx tsx lib/code-studio/charts.test.ts` | Page-side chart rules: junk dropped, text cut, limits, axis scale |
| `lib/code-studio/files.test.ts` | `npx tsx lib/code-studio/files.test.ts` | The page-side file rules: names, cleaning, limits, storage, downloads |
| `lib/code-studio/exercises.test.ts` | `npx tsx lib/code-studio/exercises.test.ts` | Every exercise: correct solutions pass, wrong ones fail; project and progress storage |
| `scripts/code-studio-browser-tests.cjs` | build and start the site, `npm install --no-save playwright`, then `node scripts/code-studio-browser-tests.cjs http://localhost:3000` | Real browser, 88 checks (including charts: draw, hostile labels, errors, timeouts, limits, clearing; and files: write, view, download, upload, delete, reload, timeouts, path tricks, flooding, junk in storage, checks leave learner files alone): headers on Code Studio and 8 other pages, blocked modules, network, endless loop (stopped at ~10 s), Stop, output flooding (with and without newlines), memory, recursion, recovery after each, page never blocked for long (worst 316 ms), no requests leave the site, in-site navigation ends up isolated |

Measured on the production build: `os.system("echo hi")` prints nothing in the
browser worker; a 1.5 GB allocation succeeds (known residual risk above);
a program that empties `sys.meta_path` and `sys.path` does not affect the next run.

## Cross-origin isolation (COOP/COEP)

`input()` has to pause the program until the learner types. That needs
`SharedArrayBuffer`, which browsers only allow on pages sent with:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These headers are sent **only** for `/coding-robotics/code-studio`,
`/code-studio/*` and `/pyodide/*`. Verified: the home page and all other pages
send neither header. The site's own images, fonts and scripts are same-origin, so
nothing on the Code Studio page was blocked (0 failed requests in the browser
test). If a third-party embed (a video, a map) is ever added to this page it must
send `Cross-Origin-Resource-Policy`, or it will be blocked.

Headers only apply on a full page load. When a learner arrives from another page
through a client-side link, the page reloads itself once to pick them up.

## Assets, caching, performance

- Pyodide 314.0.7 in `public/pyodide/314.0.7/` (13 MB on disk): WebAssembly 9.2 MB
  (about 3.5 MB gzipped), standard library 2.4 MB (about 2.5 MB gzipped).
- The version is in the path and served `max-age=31536000, immutable`: downloaded
  once per visitor, cached for a year, and an upgrade can never mix old and new
  files.
- The runtime is fetched only when someone presses **Run** for the first time.
  Opening the page costs the editor only (about 1.2 MB of JavaScript gzipped).
  No other page of the site loads any of this.
- Later runs reuse the same worker (a few milliseconds). A fresh worker after a
  Stop or timeout starts in about 2 s from cache.
- Hosting: about 6 MB per new visitor, once. Plan bandwidth accordingly if many
  classes start together.
