// Registers chem-test-resolve-hook.mjs for the current Node process only.
// Use it with `node --import`, never from application code:
//   node --no-warnings --import ./scripts/chem-test-resolve-register.mjs scripts/test-chem-titration.mjs
import { register } from "node:module";

register("./chem-test-resolve-hook.mjs", import.meta.url);
