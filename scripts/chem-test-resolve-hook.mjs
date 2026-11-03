// Test-only module resolver hook for the chemistry model tests (Phase 2B).
//
// Some production model files import sibling TypeScript files without a file
// extension (for example `./titration-practice`). The app's bundler accepts
// that, but Node's native TypeScript support does not. This hook lets Node
// load those files WITHOUT editing the production imports.
//
// Safety limits (by design):
//  - It only exists inside the Node process that registers it through
//    chem-test-resolve-register.mjs. The Next.js build, dev server and
//    production runtime never load it.
//  - It only acts on RELATIVE specifiers ("./x" or "../x") that have no file
//    extension, and only when a matching ".ts" file (or "/index.ts") exists on
//    disk. Everything else, including packages, absolute paths, "node:"
//    modules and specifiers that already have an extension, goes straight to
//    Node's normal resolution.
//  - It never swallows errors: if no .ts file matches, Node's own error is
//    raised unchanged.
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const HAS_EXTENSION = /\.[a-z0-9]+$/i;

function isFile(url) {
  try {
    return statSync(fileURLToPath(url)).isFile();
  } catch {
    return false;
  }
}

export async function resolve(specifier, context, nextResolve) {
  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  if (relative && !HAS_EXTENSION.test(specifier) && context.parentURL?.startsWith("file:")) {
    const base = new URL(specifier, context.parentURL);
    for (const suffix of [".ts", "/index.ts"]) {
      const candidate = new URL(base.href + suffix);
      if (existsSync(fileURLToPath(candidate)) && isFile(candidate)) {
        return nextResolve(candidate.href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
