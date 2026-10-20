// Limits that keep a learner's program from taking the page down. They are
// shared by the page-side runner and described in docs/code-studio.md.
// The Python worker (public/coding-robotics/code-studio/python-worker.js) has matching output
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

/** Files a program can keep between runs (text only: CSV, TXT and similar). */
export const MAX_FILES = 20;
/** The most characters one file may hold. */
export const MAX_FILE_CHARS = 200_000;
/** The most characters all files together may hold. */
export const MAX_TOTAL_FILE_CHARS = 1_000_000;
/** The longest file name. */
export const MAX_FILE_NAME_CHARS = 40;
/** The kinds of file that are kept. The Python worker has a matching list. */
export const FILE_EXTENSIONS = [".csv", ".txt", ".tsv", ".json", ".md", ".log"] as const;

/** Where the self-hosted runtime lives. The version is in the path so caching can be permanent. */
export const PYODIDE_BASE = `/pyodide/${process.env.NEXT_PUBLIC_PYODIDE_VERSION ?? "unknown"}/`;

// Inside the Code Studio page's own path, so the offline service worker (whose scope is that
// path) is allowed to serve it. Browsers only let a service worker serve a worker script in its scope.
export const WORKER_URL = "/coding-robotics/code-studio/python-worker.js";

/** Charts a program can draw (bar and line). The Python worker has matching numbers. */
export const MAX_CHARTS = 5;
/** The most bars or points in one chart. */
export const MAX_CHART_POINTS = 100;
/** The longest title or axis name. */
export const MAX_CHART_TEXT = 60;
/** The longest label under a bar or point. */
export const MAX_LABEL_CHARS = 24;
