import assert from "node:assert/strict";
import { createWorkspaceResetState } from "../lib/code-studio-v2/workspace-state.ts";

const cleared = createWorkspaceResetState();
assert.deepEqual(cleared, {
  blocks: [],
  nextId: 1,
  result: null,
  textCode: "",
  parseError: null,
  traceIndex: -1,
});
assert.equal(cleared.result, null, "Clear must remove execution results and traces");
assert.equal(cleared.parseError, null, "Clear must remove parser errors");
assert.equal(cleared.textCode, "", "Clear must remove text editor content");
assert.equal(cleared.traceIndex, -1, "Clear must reset trace navigation");
assert.deepEqual(cleared.blocks, [], "Clear must remove all blocks");
console.log("Workspace reset state checks passed.");
