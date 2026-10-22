#!/usr/bin/env node
import assert from "node:assert/strict";
import { resolveDraftPreviewLaunch } from "../lib/code-studio-v2/guided-draft-preview.ts";
import { resolveGuidedRobotLaunch, isGuidedRobotLaunch } from "../lib/code-studio-v2/guided-launch.ts";
import { evaluateGuidedRobotRun } from "../lib/code-studio-v2/guided-mission.ts";

const core = resolveDraftPreviewLaunch("draft-year-1-term-1-week-3", "arrow-cards-core");
const support = resolveDraftPreviewLaunch("draft-year-1-term-1-week-3", "arrow-cards-support");
assert.ok(core && isGuidedRobotLaunch(core) && support && isGuidedRobotLaunch(support));
assert.equal(resolveDraftPreviewLaunch("draft-year-1-term-1-week-3", "__proto__"), null);
assert.equal(resolveDraftPreviewLaunch("other", "arrow-cards-core"), null);
assert.equal(resolveGuidedRobotLaunch("draft-year-1-term-1-week-3", "arrow-cards-core"), null,
  "Draft launches must never resolve through the reviewed registry.");
// Core: start (0,0) north, goal (3,2). Right, 3 forward, right, 2 forward = 7 cards, 2 turns.
const solved = evaluateGuidedRobotRun(["right", "forward", "forward", "forward", "right", "forward", "forward"], core.mission);
assert.equal(solved.status, "met-all-rules");
// Support: goal (1,1). Right, forward, right, forward = 4 cards.
assert.equal(evaluateGuidedRobotRun(["right", "forward", "right", "forward"], support.mission).status, "met-all-rules");
// Six cards stop one square short of the star.
assert.equal(evaluateGuidedRobotRun(["right", "forward", "forward", "forward", "right", "forward"], core.mission).status, "not-yet");
console.log("Guided draft preview checks passed: drafts stay out of the reviewed registry and solve correctly.");
