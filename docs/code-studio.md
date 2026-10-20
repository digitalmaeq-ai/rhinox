# Rhinox Code Studio: how it works, and what it does not protect

Route: `/coding-robotics/code-studio`. Python runs **in the learner's own browser**.
There is no server-side code execution service.

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
| `lib/code-studio/sandbox.test.ts` | `npx tsx lib/code-studio/sandbox.test.ts` | Python layer, real Python in Node: 15 blocked imports, 8 escape attempts, import machinery restored, stdlib still works, no state carried between runs, MemoryError, RecursionError |
| `lib/code-studio/exercises.test.ts` | `npx tsx lib/code-studio/exercises.test.ts` | Every exercise: correct solutions pass, wrong ones fail; project and progress storage |
| `scripts/code-studio-browser-tests.cjs` | build and start the site, `npm install --no-save playwright`, then `node scripts/code-studio-browser-tests.cjs http://localhost:3000` | Real browser, 42 checks: headers on Code Studio and 8 other pages, blocked modules, network, endless loop (stopped at ~10 s), Stop, output flooding (with and without newlines), memory, recursion, recovery after each, page never blocked for long (worst 316 ms), no requests leave the site, in-site navigation ends up isolated |

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
