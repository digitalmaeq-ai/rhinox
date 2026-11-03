#!/usr/bin/env node
// Titration model tests (Virtual Lab Phase 2B, Step 1).
//
// WHAT THIS IS: a regression foundation for app/components/interactive/simlab/specs/titration-chem.ts.
// It does NOT certify the model as scientifically correct.
//
// Two groups, always reported separately:
//   [baseline]     Behaviour that agrees with an independent reference (closed-form results,
//                  an independently written solver, atom-balance counting), plus "[pin]" tests
//                  that freeze a design choice. A [pin] is NOT a scientific claim.
//   [known-defect] Characterisation tests that record what the code does TODAY for a defect in
//                  docs/virtual-lab-phase-2a-chemistry-audit.md. They pass while the defect
//                  exists and are EXPECTED TO FAIL once it is fixed. A passing known-defect test
//                  is never evidence that the behaviour is right.
//
// Orientation under test (as in the lab): ACID in the burette, BASE in the conical flask.
//
// Reproduce (Node 22.18 or newer; last run on v22.23.4), from the repository root:
//   node --no-warnings --import ./scripts/chem-test-resolve-register.mjs scripts/test-chem-titration.mjs
// Or run all three chemistry suites: node scripts/test-chem-all.mjs
import assert from "node:assert/strict";
import * as T from "../app/components/interactive/simlab/specs/titration-chem.ts";

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

const P = (acid, base, cA = 0.1, cB = 0.1, vB = 25) => ({ acid, base, cA, cB, vB });
const PAIRS = [["HCl", "NaOH"], ["HCl", "KOH"], ["HCl", "NH3"], ["CH3COOH", "NaOH"], ["CH3COOH", "KOH"], ["CH3COOH", "NH3"], ["H2SO4", "NaOH"], ["H2SO4", "KOH"], ["H2SO4", "NH3"]];
const ph = (v, p) => T.titrationPh(v, p);

// ---- Independent reference chemistry (written here, not taken from the model) ---------------
// Constants from standard tables, 25 °C. Ka2 of sulfuric acid is quoted as 1.0–1.2 × 10⁻²; the
// lab uses 1.02 × 10⁻², and so does this reference so the comparison isolates the algorithm.
const REF = { kw: 1e-14, kaEthanoic: 1.8e-5, kbAmmonia: 1.8e-5, ka2Sulfuric: 1.02e-2, nH: { HCl: 1, H2SO4: 2, CH3COOH: 1 } };
const refVe = (p) => (p.cB * p.vB) / (REF.nH[p.acid] * p.cA);

// Independent solver: species-by-species charge balance, bisected on pH itself (the model
// bisects on log10[H+] using a combined "charge per mole" form).
function refPh(added, p) {
  const total = p.vB + added; // cm³
  const baseConc = (p.cB * p.vB) / total; // mol/dm³ of base in the flask
  const acidConc = (p.cA * added) / total; // mol/dm³ of acid delivered
  const positive = (h) => {
    let charge = h + (["NaOH", "KOH"].includes(p.base) ? baseConc : 0); // Na⁺ or K⁺
    if (p.base === "NH3") charge += (baseConc * h) / (h + REF.kw / REF.kbAmmonia); // NH₄⁺ = C·[H⁺]/([H⁺]+Ka)
    return charge;
  };
  const negative = (h) => {
    let charge = REF.kw / h; // OH⁻
    if (p.acid === "HCl") charge += acidConc; // Cl⁻
    if (p.acid === "CH3COOH") charge += (acidConc * REF.kaEthanoic) / (REF.kaEthanoic + h); // CH₃COO⁻
    if (p.acid === "H2SO4") {
      const so4 = (acidConc * REF.ka2Sulfuric) / (REF.ka2Sulfuric + h); // SO₄²⁻
      const hso4 = (acidConc * h) / (REF.ka2Sulfuric + h); // HSO₄⁻
      charge += hso4 + 2 * so4;
    }
    return charge;
  };
  let lo = -2;
  let hi = 17; // pH bracket
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const h = 10 ** -mid;
    if (positive(h) - negative(h) > 0) lo = mid; // too acidic → pH must be higher
    else hi = mid;
  }
  return (lo + hi) / 2;
}
const refResidual = (added, p, h) => {
  // |positive − negative| for a given [H⁺], re-evaluated independently
  const total = p.vB + added;
  const baseConc = (p.cB * p.vB) / total;
  const acidConc = (p.cA * added) / total;
  let pos = h + (p.base === "NH3" ? (baseConc * h) / (h + REF.kw / REF.kbAmmonia) : baseConc);
  let neg = REF.kw / h;
  if (p.acid === "HCl") neg += acidConc;
  if (p.acid === "CH3COOH") neg += (acidConc * REF.kaEthanoic) / (REF.kaEthanoic + h);
  if (p.acid === "H2SO4") neg += (acidConc * (h + 2 * REF.ka2Sulfuric)) / (REF.ka2Sulfuric + h);
  return { residual: Math.abs(pos - neg), scale: Math.max(pos, neg) };
};
const quadraticH = (c, k) => (-k + Math.sqrt(k * k + 4 * k * c)) / 2; // x² / (c − x) = k

// Atom counter for balanced-equation checks. Handles ( ), subscripts ₀–₉ and leading coefficients.
const SUB = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9 };
function countAtoms(term) {
  const m = /^(\d*)(.+)$/.exec(term.trim());
  const coefficient = m[1] ? Number(m[1]) : 1;
  const stack = [{}];
  const chars = [...m[2]];
  for (let i = 0; i < chars.length; ) {
    const c = chars[i];
    if (c === "(") { stack.push({}); i++; continue; }
    let name = null;
    let group = null;
    if (c === ")") { group = stack.pop(); i++; }
    else if (/[A-Z]/.test(c)) { name = c; i++; if (/[a-z]/.test(chars[i] ?? "")) name += chars[i++]; }
    else throw new Error(`unexpected character "${c}" in "${term}"`);
    let n = "";
    while (i < chars.length && c !== "(" && chars[i] in SUB) n += SUB[chars[i++]];
    const times = n ? Number(n) : 1;
    const top = stack[stack.length - 1];
    if (group) for (const [k, v] of Object.entries(group)) top[k] = (top[k] ?? 0) + v * times;
    else top[name] = (top[name] ?? 0) + times;
  }
  return Object.fromEntries(Object.entries(stack[0]).map(([k, v]) => [k, v * coefficient]));
}
function sideAtoms(side) {
  const total = {};
  for (const term of side.split(" + ")) for (const [k, v] of Object.entries(countAtoms(term))) total[k] = (total[k] ?? 0) + v;
  return total;
}

// ---- Constants and data ---------------------------------------------------------------------
baseline("[pin] constants: Kw 1e-14 (25 °C), burette 50 cm³, pipette sizes 10/20/25 cm³, concentration limits 0.005–2 mol/dm³", () => {
  assert.equal(T.KW, 1e-14);
  assert.equal(T.BURETTE_ML, 50);
  assert.deepEqual(T.FLASK_VOL, [10, 20, 25]);
  assert.equal(T.CONC_MIN, 0.005);
  assert.equal(T.CONC_MAX, 2);
});
baseline("acid and base data: protons 1/2/1; Ka(ethanoic) 1.8e-5; Kb(ammonia) 1.8e-5; Ka2(H₂SO₄) 1.02e-2", () => {
  assert.deepEqual([T.ACIDS.HCl.protons, T.ACIDS.H2SO4.protons, T.ACIDS.CH3COOH.protons], [1, 2, 1]);
  assert.equal(T.ACIDS.CH3COOH.ka, REF.kaEthanoic);
  assert.equal(T.BASES.NH3.kb, REF.kbAmmonia);
  assert.equal(T.ACIDS.H2SO4.ka2, REF.ka2Sulfuric);
  assert.deepEqual(T.ACID_IDS.sort(), ["CH3COOH", "H2SO4", "HCl"]);
  assert.deepEqual(T.BASE_IDS.sort(), ["KOH", "NH3", "NaOH"]);
});

// ---- Equivalence volume from stoichiometry --------------------------------------------------
baseline("equivalence volume Vₑ = cB·vB ÷ (n_H·cA) for all nine acid/base pairs", () => {
  for (const [a, b] of PAIRS) {
    for (const [cA, cB, vB] of [[0.1, 0.1, 25], [0.05, 0.1, 20], [0.2, 0.15, 10], [0.5, 0.1, 25], [0.012, 0.01, 25]]) {
      near(T.equivalenceVolume(P(a, b, cA, cB, vB)), refVe(P(a, b, cA, cB, vB)), 1e-9, `${a}/${b} ${cA}/${cB}/${vB}`);
    }
  }
});
baseline("worked examples: HCl/NaOH 25.0; H₂SO₄/NaOH 12.5; ethanoic acid 0.05 M/NH₃ 50.0 cm³", () => {
  near(T.equivalenceVolume(P("HCl", "NaOH")), 25, 1e-9);
  near(T.equivalenceVolume(P("H2SO4", "NaOH")), 12.5, 1e-9);
  near(T.equivalenceVolume(P("CH3COOH", "NH3", 0.05)), 50, 1e-9);
});
baseline("Vₑ scales with the flask volume and base concentration, and inversely with acid concentration and protons (unit check, cm³)", () => {
  const v = T.equivalenceVolume(P("HCl", "NaOH", 0.1, 0.1, 10));
  near(T.equivalenceVolume(P("HCl", "NaOH", 0.1, 0.1, 20)), 2 * v, 1e-9);
  near(T.equivalenceVolume(P("HCl", "NaOH", 0.1, 0.2, 10)), 2 * v, 1e-9);
  near(T.equivalenceVolume(P("HCl", "NaOH", 0.2, 0.1, 10)), v / 2, 1e-9);
  near(T.equivalenceVolume(P("H2SO4", "NaOH", 0.1, 0.1, 10)), v / 2, 1e-9);
});
baseline("stoichiometric excess (mmol) is zero at Vₑ, negative before and positive after, and equals n_H·cA·V − cB·vB", () => {
  for (const [a, b] of PAIRS) {
    const p = P(a, b, 0.08, 0.1, 20);
    const ve = T.equivalenceVolume(p);
    near(T.excessMillimoles(ve, p), 0, 1e-9, `${a}/${b}`);
    assert.ok(T.excessMillimoles(ve - 1, p) < 0 && T.excessMillimoles(ve + 1, p) > 0);
    near(T.excessMillimoles(10, p), REF.nH[a] * 0.08 * 10 - 0.1 * 20, 1e-9);
  }
});
baseline("burette fit: 'too-big' above 48 cm³, 'too-small' below 3 cm³, otherwise 'ok' (checked either side of each limit)", () => {
  const withVe = (ve) => P("HCl", "NaOH", 0.1, (ve * 0.1) / 25, 25); // Vₑ = ve for HCl/NaOH, 25 cm³ flask
  assert.equal(T.buretteFit(withVe(48.5)), "too-big");
  assert.equal(T.buretteFit(withVe(47.5)), "ok");
  assert.equal(T.buretteFit(withVe(3.5)), "ok");
  assert.equal(T.buretteFit(withVe(2.5)), "too-small");
});
baseline("stage labels: 'equivalence' within ±0.05 cm³ of Vₑ, 'alkali' before, 'acid' after", () => {
  const p = P("HCl", "NaOH");
  assert.deepEqual([0, 24.9, 24.96, 25, 25.04, 25.1, 50].map((v) => T.stageAt(v, p)), ["alkali", "alkali", "equivalence", "equivalence", "equivalence", "acid", "acid"]);
});
baseline("paramsOf fills defaults for missing or unknown acid/base ids and keeps valid values", () => {
  assert.deepEqual(T.paramsOf({}), T.DEFAULT_PARAMS);
  assert.deepEqual(T.paramsOf({ acid: "H2SO4", base: "NH3", cA: 0.05, cB: 0.2, vB: 10 }), { acid: "H2SO4", base: "NH3", cA: 0.05, cB: 0.2, vB: 10 });
  assert.equal(T.paramsOf({ acid: "HNO3" }).acid, "HCl");
  assert.equal(T.paramsOf({ base: "Ca(OH)2" }).base, "NaOH");
});

// ---- pH: closed-form reference calculations ------------------------------------------------
baseline("strong acid + strong base at 0, mid-way, equivalence (25 cm³) and after (50 cm³): 13.000, 12.632 (10 cm³), 7.000, 1.477", () => {
  const p = P("HCl", "NaOH");
  near(ph(0, p), 14 + Math.log10(0.1), 0.005, "initial");
  near(ph(10, p), 14 + Math.log10(1.5 / 35), 0.005, "10 cm³");
  near(ph(25, p), 7, 0.001, "equivalence");
  near(ph(50, p), -Math.log10(2.5 / 75), 0.005, "excess acid");
});
baseline("strong/strong curve is symmetric about 7 at equal concentration: pH(Vₑ−0.1) + pH(Vₑ+0.1) = 14, from the excess OH⁻ / H⁺ left", () => {
  const p = P("HCl", "NaOH");
  const before = 14 + Math.log10((0.1 * 25 - 0.1 * 24.9) / (25 + 24.9)); // excess OH⁻ in 49.9 cm³
  const after = -Math.log10((0.1 * 25.1 - 0.1 * 25) / (25 + 25.1)); // excess H⁺ in 50.1 cm³
  near(ph(24.9, p), before, 0.005, "before Vₑ");
  near(ph(25.1, p), after, 0.005, "after Vₑ");
  near(ph(24.9, p) + ph(25.1, p), 14, 0.01);
});
baseline("weak base start: 0.1 M NH₃ has pH 11.125 (x²/(0.1−x) = Kb)", () => {
  const x = quadraticH(0.1, REF.kbAmmonia); // [OH⁻]
  near(ph(0, P("HCl", "NH3")), 14 + Math.log10(x), 0.01);
});
baseline("half-equivalence of NH₃ titrated with acid: pH = pKa of NH₄⁺ = 14 − pKb = 9.255 (ratio [NH₃]:[NH₄⁺] = 1:1)", () => {
  for (const acid of ["HCl", "CH3COOH"]) {
    const p = P(acid, "NH3");
    near(ph(T.equivalenceVolume(p) / 2, p), 14 + Math.log10(REF.kbAmmonia), 0.01, acid);
  }
});
baseline("equivalence, strong acid + NH₃: 0.05 M NH₄Cl, pH 5.278 (Ka = Kw/Kb)", () => {
  const ka = REF.kw / REF.kbAmmonia;
  near(ph(25, P("HCl", "NH3")), -Math.log10(quadraticH(0.05, ka)), 0.01);
});
baseline("equivalence, ethanoic acid + NaOH/KOH: 0.05 M ethanoate, pH 8.722 (Kb = Kw/Ka)", () => {
  const kb = REF.kw / REF.kaEthanoic;
  for (const base of ["NaOH", "KOH"]) near(ph(25, P("CH3COOH", base)), 14 + Math.log10(quadraticH(0.05, kb)), 0.01, base);
});
baseline("ethanoic acid in excess at twice Vₑ gives a 1:1 ethanoic acid/ethanoate buffer, pH = pKa = 4.745", () => {
  near(ph(50, P("CH3COOH", "NaOH")), -Math.log10(REF.kaEthanoic), 0.01);
});
baseline("ethanoic acid + NH₃ with Ka = Kb: pH is 7.00 at equivalence (ammonium ethanoate)", () => {
  near(ph(25, P("CH3COOH", "NH3")), 7, 0.01);
});
baseline("HCl in excess: pH = −log of the excess H⁺ concentration (exact for a strong monoprotic acid)", () => {
  for (const v of [26, 30, 40, 50]) {
    const excessH = (0.1 * v - 0.1 * 25) / (25 + v); // mol/dm³
    near(ph(v, P("HCl", "NaOH")), -Math.log10(excessH), 0.005, `@${v} cm³`);
  }
});
baseline("equivalence pH by type: strong/strong = 7; weak acid/strong base > 7; strong acid/weak base < 7", () => {
  near(ph(25, P("HCl", "KOH")), 7, 0.001);
  assert.ok(ph(25, P("CH3COOH", "NaOH")) > 8);
  assert.ok(ph(25, P("HCl", "NH3")) < 6);
});

// ---- Independent solver agreement and charge balance ----------------------------------------
baseline("model pH agrees with the independent species-by-species solver within 0.002 pH for every pair, concentration and volume tested", () => {
  const volumes = [0, 0.5, 5, 12, 12.4, 12.5, 12.6, 24, 24.9, 25, 25.1, 26, 37.5, 50, 49.95];
  let worst = 0;
  for (const [a, b] of PAIRS) for (const [cA, cB, vB] of [[0.1, 0.1, 25], [0.005, 0.005, 10], [2, 2, 25], [0.05, 0.2, 20], [0.5, 0.01, 10]]) for (const v of volumes) {
    const p = P(a, b, cA, cB, vB);
    worst = Math.max(worst, Math.abs(ph(v, p) - refPh(v, p)));
  }
  assert.ok(worst < 0.002, `worst disagreement ${worst}`);
});
baseline("the returned [H⁺] satisfies the independently written charge balance (relative residual < 1e-6) everywhere tested", () => {
  for (const [a, b] of PAIRS) for (const v of [0, 3, 12.5, 24.99, 25, 25.01, 30, 50]) {
    const p = P(a, b);
    const { residual, scale } = refResidual(v, p, T.hydrogenIon(v, p));
    assert.ok(residual / scale < 1e-6, `${a}/${b} @${v}: ${residual} / ${scale}`);
  }
});
baseline("solver converges and is finite for every pair at the concentration and pipette limits, 0 to 50 cm³ (243 systems × 1001 points)", () => {
  for (const a of T.ACID_IDS) for (const b of T.BASE_IDS) for (const cA of [T.CONC_MIN, 0.1, T.CONC_MAX]) for (const cB of [T.CONC_MIN, 0.1, T.CONC_MAX]) for (const vB of T.FLASK_VOL) {
    const p = P(a, b, cA, cB, vB);
    for (let v = 0; v <= 50 + 1e-9; v += 0.05) assert.ok(Number.isFinite(ph(v, p)), `${a}/${b} ${cA}/${cB}/${vB} @${v}`);
  }
});
baseline("pH never rises as acid is added, for every system above (curve monotonicity, 243 systems × 1001 points)", () => {
  for (const a of T.ACID_IDS) for (const b of T.BASE_IDS) for (const cA of [T.CONC_MIN, 0.1, T.CONC_MAX]) for (const cB of [T.CONC_MIN, 0.1, T.CONC_MAX]) for (const vB of T.FLASK_VOL) {
    const p = P(a, b, cA, cB, vB);
    let previous = Infinity;
    for (let v = 0; v <= 50 + 1e-9; v += 0.05) {
      const value = ph(v, p);
      assert.ok(value <= previous + 1e-9, `${a}/${b} ${cA}/${cB}/${vB} @${v}: ${value} > ${previous}`);
      previous = value;
    }
  }
});
baseline("pH changes steeply at Vₑ: a drop of more than 3 pH units across ±0.1 cm³ for 0.1 M strong/strong and strong/weak systems", () => {
  for (const [a, b] of [["HCl", "NaOH"], ["HCl", "NH3"], ["CH3COOH", "NaOH"], ["H2SO4", "NaOH"]]) {
    const p = P(a, b);
    const ve = T.equivalenceVolume(p);
    assert.ok(ph(ve - 0.1, p) - ph(ve + 0.1, p) > 3, `${a}/${b}`);
  }
});

// ---- Buffer regions and half-equivalence ----------------------------------------------------
baseline("NH₃ buffer region follows Henderson–Hasselbalch, pH = 9.255 + log([NH₃]/[NH₄⁺]), within 0.02 for 20–80 % of Vₑ", () => {
  const p = P("HCl", "NH3");
  const ve = T.equivalenceVolume(p);
  for (const f of [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]) {
    const expected = 14 + Math.log10(REF.kbAmmonia) + Math.log10((1 - f) / f);
    near(ph(f * ve, p), expected, 0.02, `fraction ${f}`);
  }
});
baseline("ethanoic acid excess buffer: pH = pKa + log([ethanoate]/[ethanoic acid]) between 1.2 and 1.8 × Vₑ (±0.02)", () => {
  const p = P("CH3COOH", "NaOH");
  const ve = T.equivalenceVolume(p);
  for (const f of [1.2, 1.4, 1.6, 1.8]) {
    const salt = ve; // mmol of ethanoate formed = mmol of base
    const left = (f - 1) * ve; // mmol of ethanoic acid remaining (same concentration scale)
    near(ph(f * ve, p), -Math.log10(REF.kaEthanoic) + Math.log10(salt / left), 0.02, `f=${f}`);
  }
});
baseline("a buffer resists change: pH moves < 1 unit between 20 % and 80 % of Vₑ for NH₃, but > 3 units across Vₑ±0.1 cm³", () => {
  const p = P("HCl", "NH3");
  const ve = T.equivalenceVolume(p);
  assert.ok(ph(0.2 * ve, p) - ph(0.8 * ve, p) < 1.5);
  assert.ok(ph(ve - 0.1, p) - ph(ve + 0.1, p) > 2.5);
});

// ---- Diprotic acid --------------------------------------------------------------------------
baseline("H₂SO₄ + NaOH matches the independent solver at 0, ½Vₑ, Vₑ and past Vₑ, and equivalence is 7.315 (sulfate hydrolysis)", () => {
  const p = P("H2SO4", "NaOH");
  for (const v of [0, 6.25, 12.5, 12.6, 13, 25]) near(ph(v, p), refPh(v, p), 0.002, `@${v}`);
  near(ph(12.5, p), 7.315, 0.01);
});
baseline("H₂SO₄ + NaOH: Vₑ is half that of HCl (two protons) and the single steep drop at Vₑ exceeds 3 pH units", () => {
  const hcl = T.equivalenceVolume(P("HCl", "NaOH"));
  const h2 = T.equivalenceVolume(P("H2SO4", "NaOH"));
  near(h2, hcl / 2, 1e-9);
  const drop = ph(h2 - 0.1, P("H2SO4", "NaOH")) - ph(h2 + 0.1, P("H2SO4", "NaOH"));
  assert.ok(drop > 3);
});

// ---- Indicators -----------------------------------------------------------------------------
// Transition ranges: phenolphthalein 8.2–10, methyl orange 3.1–4.4, methyl red 4.4–6.2, bromothymol blue 6.0–7.6.
baseline("indicator ranges match the recognised transition ranges", () => {
  const r = (id) => [T.INDICATORS[id].low, T.INDICATORS[id].high];
  assert.deepEqual(r("phenolphthalein"), [8.2, 10]);
  assert.deepEqual(r("methyl-orange"), [3.1, 4.4]);
  assert.deepEqual(r("methyl-red"), [4.4, 6.2]);
  assert.deepEqual(r("bromothymol-blue"), [6.0, 7.6]);
});
baseline("[pin] indicator colour names at and beyond the ends of each range (colour words are a design choice)", () => {
  const name = (id, p) => T.indicatorColour(id, p).name;
  assert.deepEqual([7, 8.2, 9, 9.7, 10, 12].map((p) => name("phenolphthalein", p)), ["Colourless", "Colourless", "Pale pink", "Pink", "Deep pink", "Deep pink"]);
  assert.equal(name("methyl-orange", 3.1), "Red");
  assert.equal(name("methyl-orange", 3.75), "Orange");
  assert.equal(name("methyl-orange", 4.4), "Yellow");
  assert.equal(name("methyl-red", 4.4), "Red");
  assert.equal(name("methyl-red", 6.2), "Yellow");
  assert.equal(name("bromothymol-blue", 6.0), "Yellow");
  assert.equal(name("bromothymol-blue", 6.8), "Green");
  assert.equal(name("bromothymol-blue", 7.6), "Blue");
});
baseline("indicator colour is constant outside its range and changes inside it", () => {
  for (const id of T.INDICATOR_IDS) {
    const { low, high } = T.INDICATORS[id];
    assert.equal(T.indicatorColour(id, low - 2).hex, T.indicatorColour(id, low).hex, `${id} below`);
    assert.equal(T.indicatorColour(id, high).hex, T.indicatorColour(id, high + 2).hex, `${id} above`);
    assert.notEqual(T.indicatorColour(id, low).hex, T.indicatorColour(id, high).hex, `${id} across`);
  }
});
baseline("end-point volume = where the independent curve crosses the middle of the indicator range (within 0.02 cm³) for four representative systems", () => {
  const cross = (level, p) => {
    let lo = 0;
    let hi = 50;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (refPh(mid, p) > level) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  for (const [a, b, id] of [["HCl", "NaOH", "phenolphthalein"], ["HCl", "NaOH", "methyl-orange"], ["HCl", "NH3", "methyl-red"], ["CH3COOH", "NaOH", "phenolphthalein"]]) {
    const p = P(a, b);
    const ind = T.INDICATORS[id];
    const expected = cross((ind.low + ind.high) / 2, p);
    const report = T.indicatorReport(id, p);
    near(report.endVolume, expected, 0.02, `${a}/${b}/${id}`);
    near(report.error, expected - refVe(p), 0.02, `${a}/${b}/${id} error`);
  }
});
baseline("indicator verdicts that are chemically uncontroversial: right indicator suitable, wrong indicator unsuitable", () => {
  const v = (a, b, id) => T.indicatorReport(id, P(a, b)).verdict;
  for (const id of T.INDICATOR_IDS) assert.equal(v("HCl", "NaOH", id), "suitable", `HCl/NaOH ${id}`);
  assert.equal(v("HCl", "NH3", "phenolphthalein"), "unsuitable"); // ends at pH 8.2–10, far above equivalence pH 5.3
  assert.equal(v("HCl", "NH3", "methyl-orange"), "suitable");
  assert.equal(v("CH3COOH", "NaOH", "phenolphthalein"), "suitable");
  assert.equal(v("CH3COOH", "NaOH", "methyl-orange"), "unsuitable"); // pH never falls below 4.7, so it never changes
  assert.equal(v("CH3COOH", "NaOH", "methyl-red"), "unsuitable");
  assert.equal(v("CH3COOH", "NH3", "phenolphthalein"), "unsuitable");
});
baseline("a titration that never reaches an indicator's range reports a null end point rather than a number", () => {
  const r = T.indicatorReport("methyl-orange", P("CH3COOH", "NaOH"));
  assert.equal(r.endVolume, null);
  assert.equal(r.error, null);
  assert.equal(r.suitable, false);
});
baseline("crossVolume finds the volume where pH equals a given level, and null when the curve never gets there", () => {
  const p = P("HCl", "NaOH");
  near(ph(T.crossVolume(7, p), p), 7, 1e-3);
  near(T.crossVolume(7, p), 25, 0.01);
  assert.equal(T.crossVolume(0.5, p), null); // pH never falls to 0.5 within 50 cm³ at 0.1 M
});

// ---- Curve points, equations and text structure ---------------------------------------------
baseline("curvePoints: strictly increasing volumes from 0 to 50, finite pH, denser around Vₑ", () => {
  const pts = T.curvePoints(P("HCl", "NaOH"));
  assert.equal(pts[0].v, 0);
  assert.equal(pts[pts.length - 1].v, 50);
  for (let i = 1; i < pts.length; i++) assert.ok(pts[i].v > pts[i - 1].v && Number.isFinite(pts[i].ph));
  const near25 = pts.filter((q) => Math.abs(q.v - 25) <= 1).length;
  const near10 = pts.filter((q) => Math.abs(q.v - 10) <= 1).length;
  assert.ok(near25 > 2 * near10, `${near25} vs ${near10}`);
});
baseline("balanced equations: atoms on both sides match for all nine acid/base pairs", () => {
  for (const [a, b] of PAIRS) {
    const [left, right] = T.equation(P(a, b)).split(" → ");
    assert.deepEqual(sideAtoms(left), sideAtoms(right), `${a}/${b}: ${T.equation(P(a, b))}`);
  }
});
baseline("equation mole ratio agrees with the model's stoichiometry: 1 H₂SO₄ : 2 base, 1 HCl : 1 base", () => {
  assert.match(T.equation(P("H2SO4", "NaOH")), /^H₂SO₄ \+ 2NaOH/);
  assert.match(T.equation(P("HCl", "KOH")), /^HCl \+ KOH/);
  assert.match(T.equation(P("H2SO4", "NH3")), /^H₂SO₄ \+ 2NH₃/);
});
baseline("equivalence note names the right direction for each acid/base type", () => {
  assert.match(T.equivalenceNote(P("HCl", "NaOH")), /pH is 7/);
  assert.match(T.equivalenceNote(P("CH3COOH", "NaOH")), /above 7/);
  assert.match(T.equivalenceNote(P("HCl", "NH3")), /below 7/);
  assert.match(T.equivalenceNote(P("CH3COOH", "NH3")), /no sharp drop/);
});
baseline("explain(): initial text matches strength; equivalence text quotes Vₑ; excess text quotes the stoichiometric millimoles", () => {
  assert.match(T.explain(0, P("HCl", "NaOH")), /strong base/);
  assert.match(T.explain(0, P("HCl", "NH3")), /weak base/);
  assert.match(T.explain(25, P("HCl", "NaOH")), /Equivalence is at 25\.0 cm³/);
  assert.match(T.explain(40, P("HCl", "NaOH")), /1\.50 mmol of extra H⁺/);
  assert.match(T.explain(10, P("HCl", "NaOH")), /1\.50 mmol of OH⁻/);
});
baseline("half-equivalence message for NH₃ appears at Vₑ/2 and quotes pKa 9.25", () => {
  assert.match(T.explain(12.5, P("HCl", "NH3")), /half-equivalence point.*9\.25/);
});

// ---- Boundary and invalid inputs ------------------------------------------------------------
baseline("added = 0 and added = 50 are valid and distinct; volumes beyond the burette still give a finite pH", () => {
  const p = P("HCl", "NaOH");
  assert.ok(ph(0, p) > ph(50, p));
  assert.ok(Number.isFinite(ph(60, p)) && ph(60, p) < ph(50, p));
});
baseline("a very dilute strong/strong system (0.005 M) still has equivalence at 7.000 and a steep, symmetric drop", () => {
  const p = P("HCl", "NaOH", 0.005, 0.005, 25);
  near(ph(25, p), 7, 0.001);
  near(ph(24.95, p) + ph(25.05, p), 14, 0.01);
});

// ================== KNOWN DEFECTS (characterisation, see the Phase 2A audit) ==================
defect("TI-01", "for ethanoic acid in excess the text says the pH 'stays near 4.7', but 0.5 cm³ past Vₑ the pH is about 6.4 (4.745 only at 2 × Vₑ)", () => {
  const p = P("CH3COOH", "NaOH");
  assert.match(T.explain(25.5, p), /near 4\.7/);
  assert.ok(ph(25.5, p) > 6, `pH ${ph(25.5, p)}`);
  near(ph(50, p), 4.745, 0.01); // the statement is only true here
});
defect("TI-02", "for NH₃ the text says the pH 'falls only slowly' right up to the end of the alkali stage, although at 24.9 cm³ the pH is about to fall by more than 2 units in 0.2 cm³", () => {
  const p = P("HCl", "NH3");
  assert.match(T.explain(24.9, p), /falls only slowly/);
  assert.ok(ph(24.9, p) - ph(25.1, p) > 2);
});
defect("TI-02", "half-equivalence window is a fixed ±0.5 cm³, so with Vₑ = 5 cm³ the 'half-equivalence' message is shown from 2.0 to 3.0 cm³ (±20 % of Vₑ)", () => {
  const p = P("HCl", "NH3", 0.1, 0.02, 25); // Vₑ = 5 cm³
  assert.match(T.explain(2.01, p), /half-equivalence/);
  assert.match(T.explain(2.99, p), /half-equivalence/);
});
defect("TI-03", "no model-level validation: cA = 0 gives Vₑ = Infinity; NaN or text gives Vₑ = NaN, pH −1.5 and buretteFit 'ok'; negative concentration gives a negative Vₑ", () => {
  assert.equal(T.equivalenceVolume(P("HCl", "NaOH", 0)), Infinity);
  const nan = P("HCl", "NaOH", NaN);
  assert.ok(Number.isNaN(T.equivalenceVolume(nan)));
  near(ph(10, nan), -1.5, 1e-6, "pH for NaN input");
  assert.equal(T.buretteFit(nan), "ok");
  assert.ok(T.equivalenceVolume(P("HCl", "NaOH", -1)) < 0);
  assert.equal(T.buretteFit(P("HCl", "NaOH", 0.1, 0.1, 0)), "too-small");
});
defect("TI-05", "activities are ignored: at the 2 mol/dm³ limit the model reports pH above 14 and below 0.1, outside the 0–14 scale students are taught", () => {
  assert.ok(ph(0, P("HCl", "NaOH", 2, 2, 25)) > 14);
  assert.ok(ph(60, P("HCl", "NaOH", 2, 2, 25)) < 0.1);
});
defect("TI-06", "paramsOf accepts prototype keys such as 'toString' as an acid or base, which then produces NaN instead of the default", () => {
  assert.equal(T.paramsOf({ acid: "toString" }).acid, "toString");
  assert.equal(T.paramsOf({ base: "hasOwnProperty" }).base, "hasOwnProperty");
  assert.ok(Number.isNaN(T.equivalenceVolume(T.paramsOf({ acid: "toString" }))));
});
defect("TI-07", "bromothymol blue (range 6.0–7.6) is rated 'poor' rather than unsuitable for ethanoic acid + NaOH (equivalence pH 8.7), with an end-point error of about +0.22 cm³ (0.9 %)", () => {
  const r = T.indicatorReport("bromothymol-blue", P("CH3COOH", "NaOH"));
  assert.equal(r.verdict, "poor");
  near(r.error, 0.22, 0.03);
  assert.ok(T.INDICATORS["bromothymol-blue"].high < 8.7); // its whole range lies below the equivalence pH
});

const b = results.baseline;
const d = results["known-defect"];
console.log(`\ntitration: baseline ${b.passed} passed, ${b.failed} failed | known-defect ${d.passed} passed, ${d.failed} failed | skipped 0`);
console.log(`SUMMARY ${JSON.stringify({ suite: "titration", baseline: b, knownDefect: d, skipped: 0 })}`);
