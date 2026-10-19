// Run with:  npx tsx lib/rhinobot/rhinobot.test.ts
import assert from "node:assert/strict";

import { execute, initialState } from "./interpreter";
import { MISSIONS, PLAYGROUND, evaluateMission, parMissionBlocks, worldFor } from "./missions";
import { F, L, R, PICK, DROP, ACTIVATE, c, countProgramBlocks, ifElse, programToWorkspaceJson, readWorkspace, repeat, until } from "./program";
import type { RunEvent, Stmt, World } from "./types";

function run(world: World, program: Stmt[]) {
  const events: RunEvent[] = [...execute(world, program)];
  const last = events[events.length - 1];
  return { events, last, state: last.state };
}

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}

for (const mission of MISSIONS) {
  const world = worldFor(mission);
  test(`mission ${mission.number} reference solution succeeds`, () => {
    const { last, state } = run(world, mission.solution);
    assert.equal(last.type, "end", `ended with ${last.type}`);
    assert.equal(evaluateMission(mission, world, state).success, true);
  });
  test(`mission ${mission.number} empty programme does not complete`, () => {
    const { state } = run(world, []);
    assert.equal(evaluateMission(mission, world, state).success, false);
  });
  test(`mission ${mission.number} buggy programme does not complete`, () => {
    const { last, state } = run(world, mission.debug.buggy);
    assert.equal(last.type !== "end" || !evaluateMission(mission, world, state).success, true);
  });
  test(`mission ${mission.number} prediction answer is within range`, () => {
    assert.ok(mission.prediction.answer < mission.prediction.options.length);
  });
  test(`mission ${mission.number} par`, () => {
    console.log("      par blocks:", parMissionBlocks(mission), "blocks in toolbox:", mission.blocks.length);
  });
}

test("prediction programmes (blank ground) match the answers", () => {
  const blank: World = { columns: 9, rows: 9, walls: [], start: { x: 4, y: 4 }, startDir: 0, goal: null, charger: null, base: { x: 4, y: 4 }, items: [] };
  const p1 = run(blank, MISSIONS[0].prediction.program!).state;
  assert.deepEqual([p1.x - 4, p1.y - 4, p1.dir], [1, -2, 1]);
  const p2 = run(blank, MISSIONS[1].prediction.program!).state;
  assert.deepEqual([p2.x - 4, p2.y - 4, p2.dir], [1, -1, 2]);
});

test("bumping into a rock stops the run with an error", () => {
  const world = worldFor(MISSIONS[1]);
  const { last } = run(world, [F(), F(), F()]);
  assert.equal(last.type, "error");
  assert.equal(last.type === "error" && last.code, "bump");
});

test("infinite loops are stopped", () => {
  const world = worldFor(MISSIONS[2]);
  const { last } = run(world, [until(c("atGoal"), R())]);
  assert.equal(last.type, "error");
  assert.equal(last.type === "error" && last.code, "too-long");
});

test("empty condition is reported", () => {
  const world = worldFor(MISSIONS[2]);
  const { last } = run(world, [{ t: "until", body: [F()] }]);
  assert.equal(last.type === "error" && last.code, "missing-condition");
});

test("pick up with nothing there is an error; drop outside base leaves the item", () => {
  const world = worldFor(MISSIONS[4]);
  assert.equal(run(world, [PICK()]).last.type === "error", true);
  const result = run(world, [repeat(4, F()), PICK(), L(), L(), F(), DROP()]);
  assert.equal(result.last.type, "end");
  assert.equal(result.state.delivered, 0);
  assert.equal(result.state.items.length, 2);
});

test("only the base counts as a delivery", () => {
  const world = worldFor(MISSIONS[4]);
  const mission = MISSIONS[4];
  const half = run(world, [repeat(4, F()), PICK(), L(), L(), repeat(4, F()), DROP()]).state;
  assert.equal(evaluateMission(mission, world, half).success, false);
  assert.equal(half.delivered, 1);
});

test("activate away from the charger is an error", () => {
  const world = worldFor(MISSIONS[3]);
  assert.equal(run(world, [ACTIVATE()]).last.type, "error");
});

test("workspace JSON round trip", () => {
  for (const mission of MISSIONS) {
    const json = programToWorkspaceJson(mission.solution);
    const read = readWorkspace(json);
    assert.equal(read.blockCount, countProgramBlocks(mission.solution));
    assert.equal(read.detached, 0);
    const { state } = run(worldFor(mission), read.program);
    assert.equal(evaluateMission(mission, worldFor(mission), state).success, true);
  }
});

test("detached blocks are ignored by the programme", () => {
  const json = programToWorkspaceJson([F()]);
  json.blocks!.blocks!.push({ type: "rb_forward", x: 200, y: 200 });
  const read = readWorkspace(json);
  assert.equal(read.program.length, 1);
  assert.equal(read.detached, 1);
});

test("playground world loads", () => {
  const world = worldFor(PLAYGROUND);
  assert.ok(world.columns > 0 && world.goal && world.charger && world.items.length === 2);
  assert.equal(initialState(world).x, 0);
  void ifElse;
});

console.log(`\n${passed} tests passed`);

// ---------- random challenges ----------
import { CHALLENGE_SIZES, efficiencyPercent, makeChallenge, routeProgramme, type ChallengeSize } from "./generator";

test("random challenges are solvable with the best route and are repeatable", () => {
  for (const size of Object.keys(CHALLENGE_SIZES) as ChallengeSize[]) {
    for (let seed = 1; seed <= 40; seed += 1) {
      const challenge = makeChallenge(seed, size);
      const again = makeChallenge(seed, size);
      assert.equal(challenge.mission.map, again.mission.map);
      const world = worldFor(challenge.mission);
      const program = routeProgramme(challenge);
      const { last, state } = run(world, program);
      assert.equal(last.type, "end", `${size} #${seed} ended with ${last.type}`);
      assert.equal(evaluateMission(challenge.mission, world, state).success, true, `${size} #${seed} not solved`);
      assert.equal(state.moves, challenge.optimalMoves, `${size} #${seed} moves ${state.moves} vs ${challenge.optimalMoves}`);
    }
  }
});

test("challenge: an empty programme or a half finished one does not complete", () => {
  const challenge = makeChallenge(7, "medium");
  const world = worldFor(challenge.mission);
  assert.equal(evaluateMission(challenge.mission, world, run(world, []).state).success, false);
  const half = routeProgramme(challenge).slice(0, 6);
  assert.equal(evaluateMission(challenge.mission, world, run(world, half).state).success, false);
  assert.equal(efficiencyPercent(10, 20), 50);
  assert.equal(efficiencyPercent(10, 10), 100);
});

console.log(`\n${passed} tests passed (with challenges)`);
