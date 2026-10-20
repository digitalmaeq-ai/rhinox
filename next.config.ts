import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { NextConfig } from "next";

// The Pyodide version is part of its URL (see scripts/copy-code-studio-assets.mjs),
// so the page and the copied files always agree.
function pyodideVersion(): string {
  const file = join(process.cwd(), "node_modules", "pyodide", "package.json");
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")).version as string) : "not-installed";
}

// Rhinox Code Studio needs a "cross-origin isolated" page so Python's input()
// can pause and wait for the learner (SharedArrayBuffer). The browser only
// grants that when these two headers are present, so they are sent for the Code
// Studio route and for the files it loads, and for nothing else on the site.
const isolation = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
];

const dev = process.env.NODE_ENV !== "production";

// The Code Studio page: only this site's own files, no connections elsewhere.
// 'unsafe-inline' scripts are needed by Next.js's own page bootstrap.
const pageCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

// The Python worker: it may load scripts and fetch files from this site only.
// (The worker also removes fetch and friends from itself before it runs
// learner code; this header is the second layer.)
const workerCsp = [
  "default-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_PYODIDE_VERSION: pyodideVersion() },
  async headers() {
    return [
      {
        source: "/coding-robotics/code-studio",
        headers: [...isolation, { key: "Content-Security-Policy", value: pageCsp }],
      },
      {
        source: "/code-studio/:path*",
        headers: [
          ...isolation,
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: workerCsp },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // The version is in the path, so these files never change.
        source: "/pyodide/:path*",
        headers: [
          ...isolation,
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
