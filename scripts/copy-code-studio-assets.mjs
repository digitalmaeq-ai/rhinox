// Copies the self-hosted Python runtime for Rhinox Code Studio into public/.
//
// Pyodide (CPython compiled to WebAssembly) is served from our own site, not a
// CDN. The copied files are generated, so they are git-ignored and rebuilt on
// every `npm run dev` / `npm run build` (this script is run by
// scripts/generate-content-index.mjs, which both already call).
//
// Monaco needs no copying: Next.js bundles it (see lib/code-studio/monaco-setup.ts).
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = (...p) => join(root, "node_modules", "pyodide", ...p);
const version = existsSync(source("package.json"))
  ? JSON.parse(readFileSync(source("package.json"), "utf8")).version
  : "not-installed";
// The version is part of the path, so the files can be cached forever and an
// upgrade can never mix old and new files.
const target = (...p) => join(root, "public", "pyodide", version, ...p);

// Only what the Python worker needs: the loader, the WebAssembly runtime, the
// standard library archive and the package index.
const FILES = [
  "pyodide.mjs",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

if (!existsSync(source("pyodide.mjs"))) {
  console.warn("[code-studio] pyodide is not installed; skipping asset copy. Run `npm install`.");
} else {
  rmSync(join(root, "public", "pyodide"), { recursive: true, force: true });
  mkdirSync(target(), { recursive: true });
  for (const file of FILES) cpSync(source(file), target(file));
  const mb = (p) => (statSync(p).size / 1048576).toFixed(1);
  console.log(
    `[code-studio] copied Pyodide ${version} to public/pyodide/${version} (wasm ${mb(target("pyodide.asm.wasm"))} MB, stdlib ${mb(target("python_stdlib.zip"))} MB)`,
  );
}
