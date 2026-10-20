// Limits that keep a learner's program from taking the page down. They are
// shared by the page-side runner and described in docs/code-studio.md.
// The Python worker (public/code-studio/python-worker.js) has matching output
// and input caps, because it cannot import from this file.

/** A program that runs longer than this (not counting time spent waiting at input()) is stopped. */
export const RUN_TIMEOUT_MS = 10_000;

/** The most text one run may print. The worker stops the program at this point. */
export const MAX_OUTPUT_CHARS = 100_000;

/** A backstop on the page: if the worker ever sends more than this, it is stopped. */
export const HARD_OUTPUT_CAP_CHARS = 150_000;

/** The longest line a learner can send to input(). */
export const MAX_INPUT_CHARS = 2_000;

/** After a run that grew Python's memory beyond this, the worker is replaced with a fresh one. */
export const RECYCLE_HEAP_MB = 256;

/** First start downloads the runtime; give slow connections time, but not forever. */
export const LOAD_TIMEOUT_MS = 90_000;

/** Where the self-hosted runtime lives. The version is in the path so caching can be permanent. */
export const PYODIDE_BASE = `/pyodide/${process.env.NEXT_PUBLIC_PYODIDE_VERSION ?? "unknown"}/`;

export const WORKER_URL = "/code-studio/python-worker.js";
