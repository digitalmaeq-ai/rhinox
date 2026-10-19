// Run with:  npx tsx lib/rhinobot-adventure/adventure.test.ts
import assert from "node:assert/strict";

import { CHALLENGES, isCorrect } from "./challenges";
import { ENERGY_VALLEY_001, validateLevel } from "./levels";
import {
  activateCheckpoint, answerChallenge, canFinish, collectCrystal, createState, finish, formatTime, loseEnergy, scoreFor,
} from "./state";
import { MAX_JUMP_DISTANCE, MAX_JUMP_HEIGHT, TUNING } from "./tuning";

let passed = 0;
function test(name: string, fn: () => void) { fn(); passed += 1; console.log("ok  ", name); }

test("jump tuning gives a sensible height and distance", () => {
  assert.ok(MAX_JUMP_HEIGHT > 95 && MAX_JUMP_HEIGHT < 130, `height ${MAX_JUMP_HEIGHT}`);
  assert.ok(MAX_JUMP_DISTANCE > 150 && MAX_JUMP_DISTANCE < 230, `distance ${MAX_JUMP_DISTANCE}`);
});

test("Mission 001 is playable (platforms, crystals and gaps reachable)", () => {
  assert.deepEqual(validateLevel(ENERGY_VALLEY_001), []);
});

test("Mission 001 has exactly three crystals, one hazard, one checkpoint and one gate", () => {
  assert.equal(ENERGY_VALLEY_001.crystals.length, 3);
  assert.equal(ENERGY_VALLEY_001.hazards.length, 1);
  assert.equal(ENERGY_VALLEY_001.checkpoints.length, 1);
  assert.ok(CHALLENGES[ENERGY_VALLEY_001.gate.challengeId]);
});

test("the chasm is too wide to jump, so the bridge challenge is required", () => {
  assert.ok(ENERGY_VALLEY_001.gate.chasm.w > MAX_JUMP_DISTANCE + 60);
});

test("the level validator catches an unreachable platform", () => {
  const broken = { ...ENERGY_VALLEY_001, platforms: [...ENERGY_VALLEY_001.platforms, { x: 600, y: 120, w: 100, h: 20 }] };
  assert.ok(validateLevel(broken).length > 0);
});

test("the challenge has one correct answer and a sound explanation", () => {
  const challenge = CHALLENGES["bridge-batteries"];
  assert.equal(challenge.options[challenge.correctIndex], "8");
  assert.equal(8 * 6, 48);
  assert.ok(isCorrect(challenge, 2));
  assert.ok(!isCorrect(challenge, 0) && !isCorrect(challenge, 1) && !isCorrect(challenge, 3));
  assert.equal(new Set(challenge.options).size, challenge.options.length);
});

test("crystals count once", () => {
  let s = createState();
  s = collectCrystal(s, "crystal-1");
  s = collectCrystal(s, "crystal-1");
  assert.equal(s.crystals.length, 1);
});

test("energy drops by one per hit and refills with a respawn at zero", () => {
  let s = createState();
  assert.equal(s.health, TUNING.maxHealth);
  let hit = loseEnergy(s); s = hit.state;
  assert.equal(s.health, 2); assert.equal(hit.respawn, false);
  hit = loseEnergy(s); s = hit.state;
  assert.equal(s.health, 1);
  hit = loseEnergy(s); s = hit.state;
  assert.equal(hit.respawn, true); assert.equal(s.health, TUNING.maxHealth); assert.equal(s.deaths, 1);
});

test("crystals are kept after a respawn", () => {
  let s = collectCrystal(createState(), "crystal-1");
  for (let i = 0; i < 3; i += 1) s = loseEnergy(s).state;
  assert.deepEqual(s.crystals, ["crystal-1"]);
});

test("checkpoint is remembered", () => {
  const s = activateCheckpoint(createState(), "checkpoint-1");
  assert.equal(s.checkpointId, "checkpoint-1");
});

test("a wrong answer does not solve the challenge; a right one does", () => {
  let s = answerChallenge(createState(), false);
  assert.equal(s.challengeSolved, false); assert.equal(s.challengeMistakes, 1);
  s = answerChallenge(s, true);
  assert.equal(s.challengeSolved, true);
  assert.equal(answerChallenge(s, false).challengeMistakes, 1);
});

test("the station only opens with all crystals AND the challenge solved", () => {
  let s = createState();
  assert.equal(canFinish(s, 3), false);
  for (const id of ["crystal-1", "crystal-2", "crystal-3"]) s = collectCrystal(s, id);
  assert.equal(canFinish(s, 3), false, "crystals alone are not enough");
  s = answerChallenge(s, true);
  assert.equal(canFinish(s, 3), true);
  assert.equal(finish(s).status, "won");
  let t = answerChallenge(createState(), true);
  t = collectCrystal(t, "crystal-1");
  assert.equal(canFinish(t, 3), false, "challenge alone is not enough");
});

test("scoring is transparent and stars follow measurable actions", () => {
  let s = createState();
  for (const id of ["crystal-1", "crystal-2", "crystal-3"]) s = collectCrystal(s, id);
  s = answerChallenge(s, true);
  const perfect = scoreFor(s);
  assert.equal(perfect.total, 300 + 150 + 150);
  assert.equal(perfect.stars, 3);
  let mistaken = answerChallenge(createState(), false);
  mistaken = answerChallenge(mistaken, true);
  assert.equal(scoreFor(mistaken).challengePoints, 100);
  assert.equal(scoreFor(mistaken).stars, 1);
  let died = s; for (let i = 0; i < 3; i += 1) died = loseEnergy(died).state;
  assert.equal(scoreFor(died).stars, 2);
});

test("time formatting", () => {
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(65_400), "1:05");
});

console.log(`\n${passed} tests passed`);
