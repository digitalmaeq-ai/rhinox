#!/usr/bin/env node
// Electrolysis model tests (Virtual Lab Phase 2B, Step 1).
//
// WHAT THIS IS: a regression foundation for app/components/interactive/simlab/specs/electrolysis-chem.ts.
// It does NOT certify the model as scientifically correct.
//
// Two groups, always reported separately:
//   [baseline]     Behaviour that agrees with an independent reference calculation (Faraday's
//                  laws worked by hand from literature constants, atom/charge counting of the
//                  half-equations, electron conservation), plus "[pin]" tests that freeze a
//                  design choice. A [pin] is NOT a scientific claim.
//   [known-defect] Characterisation tests that record what the code does TODAY for a defect in
//                  docs/virtual-lab-phase-2a-chemistry-audit.md. They pass while the defect
//                  exists and are EXPECTED TO FAIL once it is fixed. A passing known-defect test
//                  is never evidence that the behaviour is right.
//
// The dashboard and apparatus are React (.tsx) files that Node cannot load, so two known-defect
// tests read their SOURCE TEXT. They detect wording that exists today; they do not render the UI.
//
// Reproduce (Node 22.18 or newer; last run on v22.23.4), from the repository root. The resolver
// hook is required because electrolysis-chem.ts imports ./titration-practice without an extension:
//   node --no-warnings --import ./scripts/chem-test-resolve-register.mjs scripts/test-chem-electrolysis.mjs
// Or run all three chemistry suites: node scripts/test-chem-all.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as E from "../app/components/interactive/simlab/specs/electrolysis-chem.ts";

const results = { baseline: { passed: 0, failed: 0 }, "known-defect": { passed: 0, failed: 0 } };
function check(group, name, fn) {
  try {
    fn();
    results[group].passed += 1;
    console.log(`ok   [${group}] ${name}`);
  } catch (error) {
    results[group].failed += 1;
    process.exitCode = 1;
    console.error(`FAIL [${group}] ${name}\n     ${error.message.split("\n").join("\n     ")}`);
  }
}
const baseline = (name, fn) => check("baseline", name, fn);
const defect = (id, name, fn) => check("known-defect", `KNOWN DEFECT ${id}: ${name}`, fn);
const near = (actual, expected, tol, label = "") =>
  assert.ok(Math.abs(actual - expected) <= tol, `${label} expected ${expected} ± ${tol}, got ${actual}`);
const rel = (actual, expected, tol, label = "") =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.abs(expected), `${label} expected ${expected} within ${tol * 100}%, got ${actual}`);

const SIMLAB = "app/components/interactive/simlab";
const source = (path) => readFileSync(`${SIMLAB}/${path}`, "utf8");
const cell = (electrolyte, electrode = "inert", voltage = 5, current = 1, minutes = 10) => ({ electrolyte, electrode, voltage, current, minutes });

// ---- Independent reference values (hand-derived from the stated WAEC constants) --------------
const REF = { F: 96500, vm: 24000 /* cm³/mol at r.t.p. */, Cu: 63.5, Ag: 108 };
const refGas = (coulombs, z) => (coulombs / (z * REF.F)) * REF.vm; // cm³
const refMetal = (coulombs, z, M) => (coulombs / (z * REF.F)) * M; // g
const ELECTROLYTES = ["water", "copper", "brine", "dilute-brine", "silver"];
const ELECTRODES = ["inert", "copper"];

// Half-equation balance: atoms and charge on both sides. Handles coefficients, subscripts, charges and e⁻.
const SUB = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9 };
const SUP = { "⁺": "+", "⁻": "-", "²": "2", "³": "3" };
function parseTerm(term) {
  const t = term.trim();
  const m = /^(\d*)(.+)$/.exec(t);
  const coefficient = m[1] ? Number(m[1]) : 1;
  let body = m[2];
  if (body === "e⁻") return { coefficient, atoms: {}, charge: -1 * coefficient, electrons: coefficient };
  let charge = 0;
  const cm = /([²³]?)([⁺⁻])$/.exec(body);
  if (cm) {
    charge = (cm[1] ? Number(SUP[cm[1]]) : 1) * (cm[2] === "⁺" ? 1 : -1);
    body = body.slice(0, body.length - cm[0].length);
  }
  const atoms = {};
  for (const [, name, n] of body.matchAll(/([A-Z][a-z]?)([₀-₉]*)/g)) atoms[name] = (atoms[name] ?? 0) + (n ? Number([...n].map((c) => SUB[c]).join("")) : 1);
  return { coefficient, atoms: Object.fromEntries(Object.entries(atoms).map(([k, v]) => [k, v * coefficient])), charge: charge * coefficient, electrons: 0 };
}
function totals(side) {
  const atoms = {};
  let charge = 0;
  let electrons = 0;
  for (const term of side.split(" + ")) {
    const p = parseTerm(term);
    for (const [k, v] of Object.entries(p.atoms)) atoms[k] = (atoms[k] ?? 0) + v;
    charge += p.charge;
    electrons += p.electrons;
  }
  return { atoms, charge, electrons };
}
const molesOf = (product, amount) => (product.kind === "gas" ? amount / REF.vm : amount / product.M);

// ---- Constants and data --------------------------------------------------------------------
baseline("[pin] WAEC constants: F = 96 500 C/mol, molar volume 24 000 cm³, Cu = 63.5, Ag = 108, 30 min maximum", () => {
  assert.equal(E.FARADAY, REF.F);
  assert.equal(E.MOLAR_VOLUME_CM3, REF.vm);
  assert.equal(E.MAX_MINUTES, 30);
  assert.equal(E.cathodeProduct("copper").M, REF.Cu);
  assert.equal(E.cathodeProduct("silver").M, REF.Ag);
});
baseline("the exam constant 96 500 is within 0.02 % of the CODATA Faraday constant 96 485.33 C/mol", () => {
  rel(E.FARADAY, 96485.33, 0.0002);
});
baseline("five electrolytes in the order water, copper, brine, dilute-brine, silver, each with ions and reasons", () => {
  assert.deepEqual(E.ELECTROLYTE_IDS, ELECTROLYTES);
  for (const id of ELECTROLYTES) {
    const e = E.ELECTROLYTES[id];
    assert.ok(e.name && e.formula && e.ions.length >= 3 && e.cathodeWhy && e.anodeWhy && e.liquorNote, id);
  }
});

// ---- Q = It --------------------------------------------------------------------------------
baseline("charge Q = I × t with t converted from minutes to seconds", () => {
  assert.equal(E.chargeC({ current: 1, minutes: 10 }), 600);
  assert.equal(E.chargeC({ current: 2.5, minutes: 30 }), 4500);
  assert.equal(E.chargeC({ current: 0.5, minutes: 1 }), 30);
  assert.equal(E.chargeC({ current: 3, minutes: 0 }), 0);
});
baseline("moles of electrons = Q ÷ F (600 C → 6.2176 × 10⁻³ mol)", () => {
  near(E.outcome(cell("water")).molesE, 600 / 96500, 1e-12);
  near(E.outcome(cell("water")).molesE, 6.2176e-3, 1e-7);
});

// ---- Product selection for every electrolyte/electrode combination --------------------------
const MATRIX = {
  "water/inert": ["Hydrogen", "Oxygen"], "water/copper": ["Hydrogen", "Copper (anode dissolves)"],
  "copper/inert": ["Copper", "Oxygen"], "copper/copper": ["Copper", "Copper (anode dissolves)"],
  "brine/inert": ["Hydrogen", "Chlorine"], "brine/copper": ["Hydrogen", "Copper (anode dissolves)"],
  "dilute-brine/inert": ["Hydrogen", "Oxygen"], "dilute-brine/copper": ["Hydrogen", "Copper (anode dissolves)"],
  "silver/inert": ["Silver", "Oxygen"], "silver/copper": ["Silver", "Copper (anode dissolves)"],
};
baseline("cathode and anode products for all ten electrolyte × electrode combinations", () => {
  for (const [key, [cathode, anode]] of Object.entries(MATRIX)) {
    const [electrolyte, electrode] = key.split("/");
    const o = E.outcome(cell(electrolyte, electrode));
    assert.equal(o.cathode.name, cathode, `${key} cathode`);
    assert.equal(o.anode.name, anode, `${key} anode`);
  }
});
baseline("concentration effect: concentrated brine gives chlorine at the anode, dilute brine gives oxygen; the cathode is hydrogen in both", () => {
  assert.equal(E.anodeProduct("brine", "inert").formula, "Cl₂");
  assert.equal(E.anodeProduct("dilute-brine", "inert").formula, "O₂");
  assert.equal(E.cathodeProduct("brine").formula, "H₂");
  assert.equal(E.cathodeProduct("dilute-brine").formula, "H₂");
});
baseline("electrode effect: a copper anode always dissolves instead of releasing a gas; an inert anode never dissolves", () => {
  for (const id of ELECTROLYTES) {
    assert.equal(E.anodeProduct(id, "copper").kind, "dissolves", id);
    assert.notEqual(E.anodeProduct(id, "inert").kind, "dissolves", id);
  }
});
baseline("metals above hydrogen (Na⁺) are never discharged: the cathode is never sodium", () => {
  for (const id of ELECTROLYTES) assert.notEqual(E.cathodeProduct(id).formula, "Na");
});
baseline("balanced half-equations: atoms and charge match on both sides, and electrons per mole of product equals z", () => {
  for (const p of [E.cathodeProduct("water"), E.anodeProduct("water", "inert"), E.anodeProduct("brine", "inert"), E.cathodeProduct("copper"), E.cathodeProduct("silver"), E.anodeProduct("water", "copper")]) {
    const [left, right] = p.equation.split(" → ");
    const L = totals(left);
    const R = totals(right);
    assert.deepEqual(L.atoms, R.atoms, `${p.equation} atoms`);
    assert.equal(L.charge, R.charge, `${p.equation} charge`);
    const electrons = L.electrons + R.electrons; // e⁻ appears on exactly one side
    assert.ok(electrons > 0, `${p.equation} has no electrons`);
    const productTerm = [...left.split(" + "), ...right.split(" + ")].find((t) => t.replace(/^\d+/, "") === p.formula);
    assert.ok(productTerm, `${p.equation} does not contain ${p.formula}`);
    assert.equal(electrons / parseTerm(productTerm).coefficient, p.z, `${p.equation}: electrons per ${p.formula}`);
  }
});
baseline("the products' physical descriptions and tests match standard school chemistry (H₂ squeaky pop, O₂ relights splint, Cu pink-brown, Ag grey-white)", () => {
  assert.match(E.cathodeProduct("water").test, /squeaky pop/);
  assert.match(E.anodeProduct("water", "inert").test, /glowing splint/);
  assert.match(E.cathodeProduct("copper").look, /pink-brown/);
  assert.match(E.cathodeProduct("silver").look, /grey-white/);
  assert.equal(E.cathodeProduct("water").kind, "gas");
  assert.equal(E.cathodeProduct("copper").kind, "metal");
});

// ---- Faraday's laws: amounts ---------------------------------------------------------------
baseline("1 A for 10 min (600 C): H₂ 74.61 cm³, O₂ 37.31 cm³, Cl₂ 74.61 cm³, Cu 0.1974 g, Ag 0.6715 g", () => {
  near(E.outcome(cell("water")).cathodeAmount, refGas(600, 2), 1e-9, "H₂");
  near(E.outcome(cell("water")).cathodeAmount, 74.61, 0.01, "H₂ value");
  near(E.outcome(cell("water")).anodeAmount, refGas(600, 4), 1e-9, "O₂");
  near(E.outcome(cell("water")).anodeAmount, 37.31, 0.01, "O₂ value");
  near(E.outcome(cell("brine")).anodeAmount, refGas(600, 2), 1e-9, "Cl₂");
  near(E.outcome(cell("copper")).cathodeAmount, refMetal(600, 2, REF.Cu), 1e-9, "Cu");
  near(E.outcome(cell("copper")).cathodeAmount, 0.1974, 0.0005, "Cu value");
  near(E.outcome(cell("silver")).cathodeAmount, refMetal(600, 1, REF.Ag), 1e-9, "Ag");
  near(E.outcome(cell("silver")).cathodeAmount, 0.6715, 0.0005, "Ag value");
});
baseline("amountOf equals the Faraday formula for a spread of charges (rel. tolerance 1e-12)", () => {
  for (const q of [1, 30, 600, 1800, 4500, 5400, 12345.6]) {
    rel(E.amountOf(E.cathodeProduct("water"), q), refGas(q, 2), 1e-12, `H₂ ${q}`);
    rel(E.amountOf(E.anodeProduct("water", "inert"), q), refGas(q, 4), 1e-12, `O₂ ${q}`);
    rel(E.amountOf(E.anodeProduct("brine", "inert"), q), refGas(q, 2), 1e-12, `Cl₂ ${q}`);
    rel(E.amountOf(E.cathodeProduct("copper"), q), refMetal(q, 2, REF.Cu), 1e-12, `Cu ${q}`);
    rel(E.amountOf(E.cathodeProduct("silver"), q), refMetal(q, 1, REF.Ag), 1e-12, `Ag ${q}`);
    rel(E.amountOf(E.anodeProduct("water", "copper"), q), refMetal(q, 2, REF.Cu), 1e-12, `Cu anode ${q}`);
  }
});
baseline("one faraday (96 500 C) deposits 31.75 g Cu, 108 g Ag, 0.5 mol H₂ (12 000 cm³), 0.25 mol O₂ (6 000 cm³)", () => {
  near(E.amountOf(E.cathodeProduct("copper"), 96500), 31.75, 1e-9);
  near(E.amountOf(E.cathodeProduct("silver"), 96500), 108, 1e-9);
  near(E.amountOf(E.cathodeProduct("water"), 96500), 12000, 1e-9);
  near(E.amountOf(E.anodeProduct("water", "inert"), 96500), 6000, 1e-9);
});
baseline("water electrolysis gives hydrogen : oxygen = 2 : 1 by volume at any charge", () => {
  for (const [i, t] of [[0.5, 3], [1, 10], [3, 30]]) {
    const o = E.outcome(cell("water", "inert", 5, i, t));
    near(o.cathodeAmount / o.anodeAmount, 2, 1e-9);
  }
});
baseline("Faraday's first law: doubling the current or the time doubles every amount; the amount per coulomb is constant", () => {
  for (const [electrolyte, electrode] of [["water", "inert"], ["copper", "inert"], ["brine", "inert"], ["silver", "inert"], ["copper", "copper"]]) {
    const one = E.outcome(cell(electrolyte, electrode, 5, 1, 10));
    const doubleI = E.outcome(cell(electrolyte, electrode, 5, 2, 10));
    const doubleT = E.outcome(cell(electrolyte, electrode, 5, 1, 20));
    for (const o of [doubleI, doubleT]) {
      rel(o.cathodeAmount, 2 * one.cathodeAmount, 1e-12);
      rel(o.anodeAmount, 2 * one.anodeAmount, 1e-12);
      rel(o.coulombs, 2 * one.coulombs, 1e-12);
    }
    rel(one.cathodeAmount / one.coulombs, E.outcome(cell(electrolyte, electrode, 5, 2.5, 30)).cathodeAmount / 4500, 1e-12);
  }
});
baseline("Faraday's second law: the same charge gives mass ∝ M/z — Ag : Cu = (108/1) : (63.5/2) = 3.4016", () => {
  const ag = E.outcome(cell("silver", "inert", 5, 2, 15)).cathodeAmount;
  const cu = E.outcome(cell("copper", "inert", 5, 2, 15)).cathodeAmount;
  near(ag / cu, (108 / 1) / (63.5 / 2), 1e-9);
});

// ---- Electron stoichiometry and conservation -----------------------------------------------
baseline("electrons conserved: moles of electrons at the cathode = at the anode = Q/F, for all ten combinations and several charges", () => {
  for (const [key] of Object.entries(MATRIX)) {
    const [electrolyte, electrode] = key.split("/");
    for (const [i, t] of [[0.5, 1], [1, 10], [2.7, 25]]) {
      const o = E.outcome(cell(electrolyte, electrode, 5, i, t));
      const q = i * t * 60;
      rel(molesOf(o.cathode, o.cathodeAmount) * o.cathode.z, q / REF.F, 1e-12, `${key} cathode`);
      rel(molesOf(o.anode, o.anodeAmount) * o.anode.z, q / REF.F, 1e-12, `${key} anode`);
      rel(o.molesE, q / REF.F, 1e-12, `${key} molesE`);
    }
  }
});
baseline("copper electrodes in copper(II) sulfate: mass lost by the anode equals mass gained by the cathode (copper purification)", () => {
  for (const [i, t] of [[0.5, 5], [1.7, 18], [3, 30]]) {
    const o = E.outcome(cell("copper", "copper", 5, i, t));
    near(o.anodeAmount, o.cathodeAmount, 1e-12);
  }
});
baseline("electrons per mole: Cu²⁺ 2, Ag⁺ 1, H₂ 2, O₂ 4, Cl₂ 2, Cu dissolving 2", () => {
  assert.deepEqual([E.cathodeProduct("copper").z, E.cathodeProduct("silver").z, E.cathodeProduct("water").z, E.anodeProduct("water", "inert").z, E.anodeProduct("brine", "inert").z, E.anodeProduct("water", "copper").z], [2, 1, 2, 4, 2, 2]);
});

// ---- Units, formatting, switch-on logic, measured values -----------------------------------
baseline("units: gases are reported in cm³, metals in g; formatAmount shows 1 decimal for gas and 3 for metal", () => {
  assert.equal(E.unitOf(E.cathodeProduct("water")), "cm³");
  assert.equal(E.unitOf(E.cathodeProduct("copper")), "g");
  assert.equal(E.formatAmount(E.cathodeProduct("water"), 74.6114), "74.6 cm³");
  assert.equal(E.formatAmount(E.cathodeProduct("copper"), 0.19741), "0.197 g");
});
baseline("the cell is off (all amounts and charge zero) when the voltage is below the threshold, and when time is zero", () => {
  const off = E.outcome(cell("water", "inert", 0, 1, 10));
  assert.deepEqual([off.on, off.coulombs, off.molesE, off.cathodeAmount, off.anodeAmount], [false, 0, 0, 0, 0]);
  const zeroTime = E.outcome(cell("copper", "inert", 5, 1, 0));
  assert.deepEqual([zeroTime.on, zeroTime.coulombs, zeroTime.cathodeAmount], [true, 0, 0]);
  assert.equal(E.isOn({ voltage: 5, current: 0 }), false);
  assert.equal(E.isOn({ voltage: NaN, current: 1 }), false);
});
baseline("[pin] the switch-on threshold is MIN_VOLTS = 2 V, inclusive (see EL-03: the value itself is not justified chemically)", () => {
  assert.equal(E.MIN_VOLTS, 2);
  assert.equal(E.isOn({ voltage: 1.99, current: 1 }), false);
  assert.equal(E.isOn({ voltage: 2, current: 1 }), true);
});
baseline("measured(): deterministic for the same salt, never negative, and within the stated reading error of the true value (±0.85 cm³ gas, ±0.0025 g metal)", () => {
  const gas = E.cathodeProduct("water");
  const metal = E.cathodeProduct("copper");
  for (const salt of [1, 2, 3, 17, 99]) {
    for (const [p, truth, tol] of [[gas, 74.6, 0.85], [gas, 5, 0.85], [metal, 0.197, 0.0025], [metal, 1.5, 0.0025]]) {
      const value = E.measured(p, truth, salt);
      assert.equal(value, E.measured(p, truth, salt));
      assert.ok(value >= 0 && Math.abs(value - truth) <= tol, `${p.name} ${truth} salt ${salt}: ${value}`);
    }
  }
  const distinct = new Set([1, 2, 3, 4, 5, 6].map((s) => E.measured(E.cathodeProduct("water"), 74.6, s)));
  assert.ok(distinct.size > 1, "different salts must give different measurements");
});
baseline("[pin] an unknown electrolyte id falls back to 'water' (dilute sulfuric acid); known ids are returned unchanged", () => {
  assert.equal(E.electrolyteOf("nonsense"), "water");
  for (const id of ELECTROLYTES) assert.equal(E.electrolyteOf(id), id);
});

// ---- Practice-problem generator and the learner's own run -----------------------------------
const num = (text, re) => Number(re.exec(text)[1]);
function independentAnswer(problem) {
  const t = problem.prompt;
  const metal = /silver/.test(t) ? { M: REF.Ag, z: 1 } : { M: REF.Cu, z: 2 };
  switch (problem.kind) {
    case "mass": return ((num(t, /current of ([\d.]+) A/) * num(t, /for (\d+) minutes/) * 60) * metal.M) / (metal.z * REF.F);
    case "time": return ((num(t, /deposit ([\d.]+) g/) * metal.z * REF.F) / (metal.M * num(t, /current of ([\d.]+) A/))) / 60;
    case "gas": {
      const z = /hydrogen/.test(t) ? 2 : /oxygen/.test(t) ? 4 : 2;
      return ((num(t, /current of ([\d.]+) A/) * num(t, /for (\d+) minutes/) * 60) / (z * REF.F)) * REF.vm;
    }
    case "charge": return (num(t, /needed to deposit ([\d.]+) g/) * metal.z * REF.F) / metal.M;
    case "current": return (num(t, /^([\d.]+) g of/) * metal.z * REF.F) / (metal.M * num(t, /in (\d+) minutes/) * 60);
    case "series": return ((num(t, /([\d.]+) g of copper is deposited/) / REF.Cu) * 2) * REF.Ag;
    default: throw new Error(`unknown kind ${problem.kind}`);
  }
}
baseline("generateCalc: for 150 seeds × 6 kinds the model's answer equals an independent recalculation from the numbers printed in the question", () => {
  for (const { id: kind } of E.CALC_KINDS) {
    for (let seed = 1; seed <= 150; seed++) {
      const problem = E.generateCalc(seed, kind);
      assert.equal(problem.kind, kind);
      rel(problem.answer, independentAnswer(problem), 1e-9, `${kind} seed ${seed}`);
      assert.ok(Number.isFinite(problem.answer) && problem.answer > 0 && problem.working.length >= 3);
    }
  }
});
baseline("generateCalc is repeatable: the same seed and kind give the same problem; units match the kind", () => {
  for (const { id: kind } of E.CALC_KINDS) assert.deepEqual(E.generateCalc(42, kind), E.generateCalc(42, kind));
  assert.deepEqual(E.CALC_KINDS.map((k) => E.generateCalc(5, k.id).unit), ["g", "minutes", "cm³", "C", "A", "g"]);
});
baseline("experimentProblem returns the learner's own expected amount, and null when the cell is off or no time has passed", () => {
  const s = cell("copper", "inert", 5, 1.5, 12);
  const p = E.experimentProblem(s);
  rel(p.answer, refMetal(1.5 * 12 * 60, 2, REF.Cu), 1e-12);
  assert.equal(p.unit, "g");
  assert.equal(E.experimentProblem(cell("water", "inert", 5, 1, 0)), null);
  assert.equal(E.experimentProblem(cell("water", "inert", 1, 1, 10)), null);
  assert.equal(E.experimentProblem(cell("water", "inert", 5, 1, 10)).unit, "cm³");
});

// ================== KNOWN DEFECTS (characterisation, see the Phase 2A audit) ==================
defect("EL-01", "no chlorine safety information is attached to the chlorine product and its description invites sniffing; the only warning is one line in the Notes tab", () => {
  const cl2 = E.anodeProduct("brine", "inert");
  assert.match(cl2.look, /sharp smell/);
  assert.match(cl2.test, /damp blue litmus/); // damp blue litmus turns red first, then bleaches
  assert.equal("safety" in cl2, false);
  const files = ["specs/electrolysis.tsx", "dashboards/ElectrolysisApparatus.tsx", "scenes3d/chemistry.tsx", "tours.ts"];
  for (const f of files) assert.doesNotMatch(source(f), /poisonous|toxic|fume cupboard/i, `${f} unexpectedly mentions a chlorine warning`);
  const dashboard = source("dashboards/ElectrolysisDashboard.tsx");
  assert.equal((dashboard.match(/Chlorine is poisonous/g) ?? []).length, 1, "exactly one warning line, in the Notes tab");
});
defect("EL-02", "the hint says copper is deposited on the cathode for ANY copper-electrode cell, although water, brine and dilute brine give hydrogen at the cathode", () => {
  assert.match(source("specs/electrolysis.tsx"), /s\.electrode === "copper"\) return "With copper electrodes the anode dissolves and copper is deposited on the cathode\./);
  for (const electrolyte of ["water", "brine", "dilute-brine"]) assert.equal(E.outcome(cell(electrolyte, "copper")).cathode.name, "Hydrogen");
});
defect("EL-03", "one 2 V threshold for every cell: a copper-purification cell (real minimum a few tenths of a volt) is off at 1.9 V, and 12 V gives exactly the same products and amounts as 2 V", () => {
  for (const electrolyte of ELECTROLYTES) for (const electrode of ELECTRODES) {
    assert.equal(E.isOn({ voltage: 1.9, current: 1 }), false);
    assert.equal(E.isOn({ voltage: 2, current: 1 }), true);
    assert.deepEqual(E.outcome(cell(electrolyte, electrode, 12, 1, 10)), E.outcome(cell(electrolyte, electrode, 2, 1, 10)));
  }
  assert.equal(E.outcome(cell("copper", "copper", 1.9, 1, 10)).cathodeAmount, 0);
});
defect("EL-05", "the id 'water' is dilute sulfuric acid, and unknown ids silently become it", () => {
  assert.equal(E.ELECTROLYTES.water.name, "Dilute sulfuric acid");
  assert.equal(E.ELECTROLYTES.water.formula, "H₂SO₄(aq)");
  assert.equal(E.electrolyteOf("pure-water"), "water");
});
defect("EL-06", "gas volumes are ideal 24 000 cm³/mol with no solubility, so chlorine is predicted at the same volume as hydrogen although real chlorine dissolves and reacts with the NaOH formed", () => {
  const o = E.outcome(cell("brine"));
  assert.equal(o.anodeAmount, o.cathodeAmount);
});
defect("EL-07", "no input validation in the model: a negative current gives negative charge, and the gas tube drawing is capped at 200 cm³ while the readout can reach 671.5 cm³ of hydrogen (3 A for 30 min)", () => {
  assert.equal(E.chargeC({ current: -1, minutes: 5 }), -300);
  assert.match(source("dashboards/ElectrolysisApparatus.tsx"), /const GAS_FULL = 200;/);
  near(E.outcome(cell("water", "inert", 12, 3, 30)).cathodeAmount, refGas(3 * 30 * 60, 2), 1e-9); // 5400 C → 671.5 cm³, far beyond the 200 cm³ tube
  assert.ok(refGas(5400, 2) > 200 * 3);
});

const b = results.baseline;
const d = results["known-defect"];
console.log(`\nelectrolysis: baseline ${b.passed} passed, ${b.failed} failed | known-defect ${d.passed} passed, ${d.failed} failed | skipped 0`);
console.log(`SUMMARY ${JSON.stringify({ suite: "electrolysis", baseline: b, knownDefect: d, skipped: 0 })}`);
