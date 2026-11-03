#!/usr/bin/env node
// Runs the three chemistry model suites (Virtual Lab Phase 2B, Step 1) and prints one combined summary.
//
// Reproduce, from the repository root:   node scripts/test-chem-all.mjs
// Requires Node 22.18 or newer (native TypeScript type stripping on by default); last run on v22.23.4.
// No dependencies, no build step, no changes to package.json.
//
// Each suite is run in its own Node process with the test-only resolver hook registered
// (scripts/chem-test-resolve-register.mjs), so nothing here affects the app or its build.
// Results are reported in two groups and never merged:
//   baseline      agree with an independent reference, or pin a design value ("[pin]")
//   known-defect  characterise a defect listed in the Phase 2A audit; they pass while the defect
//                 exists and are expected to fail once it is fixed
// This runner exits non-zero if any test fails, any suite crashes, or a suite prints no summary.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  console.error(`Node ${process.versions.node} is too old: these tests need Node 22.18 or newer (type stripping).`);
  process.exit(1);
}

const here = (name) => fileURLToPath(new URL(name, import.meta.url));
const SUITES = ["test-chem-acids-bases.mjs", "test-chem-titration.mjs", "test-chem-electrolysis.mjs"];
const summaries = [];
let crashed = false;

console.log(`Node ${process.version}; running ${SUITES.length} chemistry suites\n`);
for (const suite of SUITES) {
  console.log(`===== ${suite} =====`);
  const run = spawnSync(process.execPath, ["--no-warnings", "--import", here("chem-test-resolve-register.mjs"), here(suite)], { encoding: "utf8", cwd: fileURLToPath(new URL("..", import.meta.url)) });
  process.stdout.write(run.stdout);
  process.stderr.write(run.stderr);
  const line = run.stdout.split("\n").find((l) => l.startsWith("SUMMARY "));
  if (!line) {
    crashed = true;
    console.error(`FAIL ${suite}: no summary line (suite crashed or exited early, status ${run.status})\n`);
    continue;
  }
  summaries.push(JSON.parse(line.slice("SUMMARY ".length)));
  if (run.status !== 0) crashed = true;
  console.log("");
}

const sum = (pick) => summaries.reduce((a, s) => ({ passed: a.passed + pick(s).passed, failed: a.failed + pick(s).failed }), { passed: 0, failed: 0 });
const baseline = sum((s) => s.baseline);
const knownDefect = sum((s) => s.knownDefect);
const skipped = summaries.reduce((a, s) => a + s.skipped, 0);

console.log("===== SUMMARY =====");
console.log("suite          | baseline (pass/fail) | known-defect (pass/fail)");
for (const s of summaries) console.log(`${s.suite.padEnd(14)} | ${`${s.baseline.passed}/${s.baseline.failed}`.padEnd(20)} | ${s.knownDefect.passed}/${s.knownDefect.failed}`);
console.log(`TOTAL          | ${`${baseline.passed}/${baseline.failed}`.padEnd(20)} | ${knownDefect.passed}/${knownDefect.failed}`);
console.log(`skipped: ${skipped}`);
console.log("\nA passing known-defect test records a defect that still exists. It is not evidence that the behaviour is correct.");
console.log("These suites are a regression foundation; they do not certify the chemistry models as scientifically correct.");

const failed = baseline.failed + knownDefect.failed;
if (crashed || failed > 0 || summaries.length !== SUITES.length) {
  console.error(`\nRESULT: FAILED (${failed} failing test(s)${crashed ? ", a suite crashed or reported failures" : ""})`);
  process.exit(1);
}
console.log("\nRESULT: all tests passed");
