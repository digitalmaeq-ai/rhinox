#!/usr/bin/env node
// Acids and bases model tests (Virtual Lab Phase 2B, Step 1).
//
// WHAT THIS IS: a regression foundation for app/components/interactive/simlab/specs/ab-model.ts.
// It does NOT certify the model as scientifically correct.
//
// Two groups, always reported separately:
//   [baseline]     Behaviour that agrees with an independent reference calculation or a
//                  recognised definition, plus "[pin]" tests that freeze a design value so a
//                  later change is noticed. A [pin] is NOT a scientific claim.
//   [known-defect] Characterisation tests. They record what the code does TODAY for a defect
//                  listed in docs/virtual-lab-phase-2a-chemistry-audit.md. They pass while the
//                  defect exists and are EXPECTED TO FAIL once it is fixed; the fixer then
//                  replaces them with correct-behaviour tests. A passing known-defect test is
//                  never evidence that the behaviour is right.
//
// Reproduce (Node 22.18 or newer; last run on v22.23.4), from the repository root:
//   node --no-warnings --import ./scripts/chem-test-resolve-register.mjs scripts/test-chem-acids-bases.mjs
// Or run all three chemistry suites: node scripts/test-chem-all.mjs
import assert from "node:assert/strict";
import * as A from "../app/components/interactive/simlab/specs/ab-model.ts";

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

const state = (sample, indicator = "meter", dilution = 0, added = true) => ({ sample, indicator, added, dilution });
const ph = (sample, n = 0) => A.effectivePh(sample, n);

// ---- Independent reference calculations (written here, not taken from the model) ----------
const KW = 1e-14; // ionic product of water, 25 °C
// pH of a strong monoprotic acid of concentration c, including water's own H+ (exact).
const strongAcidPh = (c) => -Math.log10((c + Math.sqrt(c * c + 4 * KW)) / 2);
const strongBasePh = (c) => 14 + Math.log10((c + Math.sqrt(c * c + 4 * KW)) / 2);
// pH of a weak monoprotic acid (Ka, total concentration c) with water's own ionisation included.
// Charge balance: [H⁺] = [A⁻] + [OH⁻], with [A⁻] = c·Ka / ([H⁺] + Ka) and [OH⁻] = Kw / [H⁺], so
//   [H⁺] = c·Ka / ([H⁺] + Ka) + Kw / [H⁺].
// g(h) = h − c·Ka/(h + Ka) − Kw/h is strictly increasing for h > 0 (h and −Kw/h rise, −c·Ka/(h+Ka)
// rises), so there is exactly one positive root. It is found by bisection on log10(h), which stays
// positive by construction and is stable from c = 1 mol/dm³ down to c ≈ 1e-12.
function weakAcidPh(c, ka) {
  let lo = -14; // log10[H⁺] bracket: g < 0 at 1e-14 for any c, ka, and g > 0 at 10^1 = 10
  let hi = 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const h = 10 ** mid;
    if (h - (c * ka) / (h + ka) - KW / h > 0) hi = mid;
    else lo = mid;
  }
  return -(lo + hi) / 2;
}
// The same weak acid WITHOUT water autoionisation (plain x²/(c−x) = Ka). Used only to show why water matters.
const weakAcidPhIgnoringWater = (c, ka) => -Math.log10((-ka + Math.sqrt(ka * ka + 4 * ka * c)) / 2);
const SUPERSCRIPT = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
// "3.2 × 10⁻³" -> { mantissa: 3.2, exponent: -3 }
function parseSci(text) {
  const m = /^([0-9.]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/.exec(text);
  assert.ok(m, `not scientific notation: "${text}"`);
  return { mantissa: Number(m[1]), exponent: Number([...m[2]].map((c) => SUPERSCRIPT[c]).join("")) };
}
const sciValue = (text) => {
  const { mantissa, exponent } = parseSci(text);
  return mantissa * 10 ** exponent;
};

// ---- Sample data (design values, pinned) ---------------------------------------------------
const EXPECTED_SAMPLES = { hcl: 1, cola: 2.5, lime: 2.2, vinegar: 2.9, milk: 6.5, water: 7, soda: 8.3, soap: 10, antacid: 10.5, ammonia: 11.5, bleach: 12.5, naoh: 13 };

baseline("[pin] the twelve samples and their pH values are unchanged (design values, not a scientific claim)", () => {
  assert.deepEqual(A.SAMPLE_IDS.sort(), Object.keys(EXPECTED_SAMPLES).sort());
  for (const [id, value] of Object.entries(EXPECTED_SAMPLES)) assert.equal(A.SAMPLES[id].ph, value, id);
});
baseline("0.1 mol/dm³ HCl is pH 1 and 0.1 mol/dm³ NaOH is pH 13 (independent calculation)", () => {
  near(A.SAMPLES.hcl.ph, strongAcidPh(0.1), 0.001, "HCl");
  near(A.SAMPLES.naoh.ph, strongBasePh(0.1), 0.001, "NaOH");
});
baseline("every sample's pH lies on the 0–14 scale and is flagged consistently with its side of 7", () => {
  for (const id of A.SAMPLE_IDS) {
    const value = A.SAMPLES[id].ph;
    assert.ok(value >= 0 && value <= 14, id);
    if (A.SAMPLES[id].strong) assert.ok(value <= 1 || value >= 13, `${id} strong but not extreme`);
  }
  assert.equal(A.SAMPLE_IDS.filter((id) => A.SAMPLES[id].strong).length, 2, "exactly HCl and NaOH are strong");
});
baseline("MAX_DILUTION is 4 tenfold steps (UI slider limit)", () => assert.equal(A.MAX_DILUTION, 4));

// ---- pH and hydrogen-ion calculation -------------------------------------------------------
baseline("[H⁺] text equals 10^-pH within the 1-decimal rounding for pH 0 to 14 in half steps", () => {
  for (let p = 0; p <= 14; p += 0.5) {
    const shown = sciValue(A.hydrogenIon(p));
    const truth = 10 ** -p;
    assert.ok(Math.abs(shown - truth) / truth < 0.051, `pH ${p}: ${shown} vs ${truth}`);
  }
});
baseline("[H⁺] text at whole-number pH is exactly 1.0 × 10^-pH", () => {
  for (let p = 0; p <= 14; p++) assert.deepEqual(parseSci(A.hydrogenIon(p)), { mantissa: 1, exponent: p === 0 ? 0 : -p }, `pH ${p}`);
});
baseline("one pH unit down the scale means ten times as many H⁺ ions", () => {
  for (let p = 0; p < 14; p += 1) near(sciValue(A.hydrogenIon(p)) / sciValue(A.hydrogenIon(p + 1)), 10, 1e-9, `pH ${p}`);
});
baseline("[H⁺] of cola (pH 2.5) is 3.2 × 10⁻³ and of milk (pH 6.5) is 3.2 × 10⁻⁷", () => {
  assert.equal(A.hydrogenIon(2.5), "3.2 × 10⁻³");
  assert.equal(A.hydrogenIon(6.5), "3.2 × 10⁻⁷");
});

// ---- Strong acid/alkali dilution (tenfold = one pH unit) ------------------------------------
baseline("strong acid: each tenfold dilution raises pH by 1 (0.1 M HCl → 10⁻⁵ M)", () => {
  for (let n = 0; n <= A.MAX_DILUTION; n++) near(ph("hcl", n), strongAcidPh(0.1 / 10 ** n), 0.001, `${n} dilutions`);
});
baseline("strong alkali: each tenfold dilution lowers pH by 1 (0.1 M NaOH → 10⁻⁵ M)", () => {
  for (let n = 0; n <= A.MAX_DILUTION; n++) near(ph("naoh", n), strongBasePh(0.1 / 10 ** n), 0.001, `${n} dilutions`);
});
baseline("tenfold dilution of a strong acid changes [H⁺] by a factor of 10 (shown values)", () => {
  for (let n = 0; n < A.MAX_DILUTION; n++) near(sciValue(A.hydrogenIon(ph("hcl", n))) / sciValue(A.hydrogenIon(ph("hcl", n + 1))), 10, 1e-9);
});
baseline("[pin] weak samples change by 0.5 pH per tenfold dilution until they reach the asymptote (design rule, see AB-01)", () => {
  near(ph("ammonia", 1) - ph("ammonia", 0), -0.5, 1e-9);
  near(ph("cola", 1) - ph("cola", 0), 0.5, 1e-9);
  near(ph("vinegar", 2) - ph("vinegar", 0), 1, 1e-9);
});
baseline("a weak acid changes by less than a strong acid on tenfold dilution (reference: ethanoic acid, Ka 1.8e-5)", () => {
  const weakStep = weakAcidPh(0.01, 1.8e-5) - weakAcidPh(0.1, 1.8e-5);
  assert.ok(weakStep > 0.4 && weakStep < 0.7, `reference weak step ${weakStep}`);
  const modelWeak = ph("cola", 1) - ph("cola", 0);
  const modelStrong = ph("hcl", 1) - ph("hcl", 0);
  assert.ok(modelWeak > 0 && modelWeak < modelStrong);
});

baseline("weak-acid reference solver: the root is positive, finite and satisfies [H⁺] = C·Ka/([H⁺]+Ka) + Kw/[H⁺] from 1 down to 1e-12 mol/dm³", () => {
  for (const ka of [1.8e-5, 6.3e-5, 1e-3]) {
    for (let exponent = 0; exponent >= -12; exponent--) {
      const c = 10 ** exponent;
      const value = weakAcidPh(c, ka);
      assert.ok(Number.isFinite(value) && value > 0 && value < 14, `C=${c} Ka=${ka}: pH ${value}`);
      const h = 10 ** -value;
      const rhs = (c * ka) / (h + ka) + KW / h;
      assert.ok(Math.abs(h - rhs) / h < 1e-9, `C=${c} Ka=${ka}: residual ${Math.abs(h - rhs) / h}`);
    }
  }
});
baseline("weak-acid reference solver agrees with the plain quadratic at 0.1 mol/dm³ (pH 2.8753, water negligible) and with the strong-acid formula as Ka → very large", () => {
  near(weakAcidPh(0.1, 1.8e-5), 2.8753, 0.0005); // x = 1.3326e-3 from x²/(0.1−x) = Ka
  near(weakAcidPh(0.1, 1.8e-5), weakAcidPhIgnoringWater(0.1, 1.8e-5), 1e-6);
  for (const c of [0.1, 1e-3, 1e-6]) near(weakAcidPh(c, 1e9), strongAcidPh(c), 1e-4, `C=${c}`);
});
baseline("water autoionisation matters when dilute: 1e-7 mol/dm³ ethanoic acid is pH ≈ 6.8 (an acid, below 7); ignoring water gives about 7.0, no longer acidic, which is wrong", () => {
  const withWater = weakAcidPh(1e-7, 1.8e-5);
  const withoutWater = weakAcidPhIgnoringWater(1e-7, 1.8e-5);
  assert.ok(withWater < 7, `with water ${withWater}`);
  assert.ok(withWater > 6.7 && withWater < 6.9, `with water ${withWater}`);
  assert.ok(withoutWater >= 7 - 0.01, `without water ${withoutWater}`);
  assert.ok(withoutWater - withWater > 0.15, `difference ${withoutWater - withWater}`);
  // At 0.1 mol/dm³ water changes nothing, at 1e-7 it changes the answer by more than 0.15 pH units.
  assert.ok(Math.abs(weakAcidPh(0.1, 1.8e-5) - weakAcidPhIgnoringWater(0.1, 1.8e-5)) < 1e-6);
});

// ---- Bounds and monotonicity ---------------------------------------------------------------
baseline("dilution never crosses pH 7: acids stay ≤ 7, alkalis stay ≥ 7, water stays 7, for every sample and dilution", () => {
  for (const id of A.SAMPLE_IDS) {
    for (let n = 0; n <= A.MAX_DILUTION; n++) {
      const value = ph(id, n);
      assert.ok(Number.isFinite(value), `${id} ${n}`);
      if (A.SAMPLES[id].ph < 7) assert.ok(value >= A.SAMPLES[id].ph && value <= 7, `${id} ${n}: ${value}`);
      if (A.SAMPLES[id].ph > 7) assert.ok(value <= A.SAMPLES[id].ph && value >= 7, `${id} ${n}: ${value}`);
      if (A.SAMPLES[id].ph === 7) assert.equal(value, 7);
    }
  }
});
baseline("dilution is monotonic toward 7 for every sample", () => {
  for (const id of A.SAMPLE_IDS) {
    let previous = ph(id, 0);
    for (let n = 1; n <= A.MAX_DILUTION; n++) {
      const value = ph(id, n);
      if (A.SAMPLES[id].ph < 7) assert.ok(value >= previous - 1e-12, `${id} ${n}`);
      if (A.SAMPLES[id].ph > 7) assert.ok(value <= previous + 1e-12, `${id} ${n}`);
      previous = value;
    }
  }
});
baseline("the clamp keeps heavily diluted acids at or below 6.9 and alkalis at or above 7.1", () => {
  assert.equal(ph("milk", 4), 6.9);
  assert.equal(ph("soda", 4), 7.1);
  assert.equal(ph("hcl", 20), 6.9);
  assert.equal(ph("naoh", 20), 7.1);
});

// ---- Indicator transition ranges -----------------------------------------------------------
// Methyl orange 3.1–4.4 and phenolphthalein 8.2–10 are the recognised transition ranges.
baseline("methyl orange: red up to 3.1, orange between, yellow from 4.4", () => {
  const name = (p) => A.colourName("methyl", p);
  assert.deepEqual([3.0, 3.1, 3.11, 3.75, 4.39, 4.4, 5].map(name), ["red", "red", "orange", "orange", "orange", "yellow", "yellow"]);
});
baseline("phenolphthalein: colourless up to 8.2, pale pink between, pink from 10", () => {
  const name = (p) => A.colourName("phenolphthalein", p);
  assert.deepEqual([0, 7, 8.2, 8.21, 9, 9.99, 10, 14].map(name), ["colourless", "colourless", "colourless", "pale pink", "pale pink", "pale pink", "pink", "pink"]);
});
baseline("[pin] litmus: red up to 5, purple between, blue from 8 (model range; literature range is about 4.5–8.3)", () => {
  const name = (p) => A.colourName("litmus", p);
  assert.deepEqual([0, 5, 5.01, 6.5, 7.99, 8, 14].map(name), ["red", "red", "purple", "purple", "purple", "blue", "blue"]);
});
baseline("indicator colours are constant outside the transition range and change inside it", () => {
  assert.equal(A.colourAt("methyl", 0), A.colourAt("methyl", 3.1));
  assert.equal(A.colourAt("methyl", 4.4), A.colourAt("methyl", 14));
  assert.notEqual(A.colourAt("methyl", 3.1), A.colourAt("methyl", 4.4));
  assert.equal(A.colourAt("phenolphthalein", 0), A.colourAt("phenolphthalein", 8.2));
  assert.equal(A.colourAt("phenolphthalein", 10), A.colourAt("phenolphthalein", 14));
  assert.notEqual(A.colourAt("phenolphthalein", 8.2), A.colourAt("phenolphthalein", 10));
  assert.equal(A.colourAt("none", 3), A.colourAt("none", 12));
});
baseline("universal indicator: a different colour for every unit of pH 0–14, red at the acid end and violet at the alkali end", () => {
  const colours = Array.from({ length: 15 }, (_, p) => A.universalColour(p));
  assert.equal(new Set(colours).size, 15);
  assert.equal(A.universalColour(7), "rgb(34, 197, 94)"); // green at neutral
  assert.equal(A.universalColour(0), "rgb(220, 38, 38)");
  assert.equal(A.universalColour(14), "rgb(124, 58, 237)");
});
baseline("universal indicator words run red → orange → yellow → green → blue → purple with pH", () => {
  const expected = { 1: "red", 3: "orange-red", 5: "orange-yellow", 6: "yellow-green", 7: "green", 8: "blue-green", 10: "blue", 12: "dark blue", 14: "purple" };
  for (const [p, word] of Object.entries(expected)) assert.equal(A.colourName("universal", Number(p)), word, `pH ${p}`);
});

// ---- Reading and observation logic ---------------------------------------------------------
baseline("nothing is revealed until an indicator is chosen and added", () => {
  assert.equal(A.observe(state("hcl", "none", 0, true)).tested, false);
  assert.equal(A.observe(state("hcl", "litmus", 0, false)).tested, false);
  assert.equal(A.observe(state("hcl", "litmus", 0, false)).readPh, null);
  assert.equal(A.observe(state("hcl", "litmus", 0, true)).tested, true);
});
baseline("only universal indicator and the pH meter give a pH reading", () => {
  for (const id of ["litmus", "methyl", "phenolphthalein"]) assert.equal(A.observe(state("hcl", id)).readPh, null, id);
  assert.notEqual(A.observe(state("hcl", "universal")).readPh, null);
  assert.notEqual(A.observe(state("hcl", "meter")).readPh, null);
});
baseline("the pH meter reads the calculated pH to 1 decimal place", () => {
  assert.equal(A.observe(state("hcl", "meter", 2)).readPh, "3.0");
  assert.equal(A.observe(state("cola", "meter", 0)).readPh, "2.5");
  assert.equal(A.observe(state("vinegar", "meter", 1)).readPh, "3.4");
});
baseline("litmus, methyl orange and phenolphthalein conclusions agree with the colour they show for every sample", () => {
  for (const id of A.SAMPLE_IDS) {
    const l = A.observe(state(id, "litmus"));
    if (l.colourWord === "red") assert.match(l.conclusion, /^Red/);
    if (l.colourWord === "blue") assert.match(l.conclusion, /^Blue/);
    const p = A.observe(state(id, "phenolphthalein"));
    if (p.colourWord === "pink") assert.match(p.conclusion, /^Pink/);
    if (p.colourWord === "colourless") assert.match(p.conclusion, /^Colourless/);
  }
});
// The 6.5–7.5 "neutral" band is this app's classification convention, NOT a universal chemical
// definition: chemically, neutral at 25 °C means pH exactly 7 ([H⁺] = [OH⁻]), and acid/alkali are
// defined by pH below/above 7. The test freezes the convention so a change is noticed; it does not
// endorse it (see AB-03 in the Phase 2A audit, which concerns where the boundaries sit).
baseline("[pin] application design convention (not a chemical definition): pH below 6.5 is labelled acidic, above 7.5 alkaline, 6.5 to 7.5 neutral", () => {
  assert.deepEqual([0, 6.49, 6.5, 7, 7.5, 7.51, 14].map(A.kindOf), ["acidic", "acidic", "neutral", "neutral", "neutral", "alkaline", "alkaline"]);
});
baseline("hydrochloric acid, vinegar, water, soap and sodium hydroxide are classified acid, acid, neutral, alkaline, alkaline", () => {
  assert.deepEqual(["hcl", "vinegar", "water", "soap", "naoh"].map((id) => A.observe(state(id)).kind), ["acidic", "acidic", "neutral", "alkaline", "alkaline"]);
});
baseline("liquidColour (3D/2D compatibility) equals the observed colour", () => {
  for (const id of A.SAMPLE_IDS) for (const ind of ["litmus", "methyl", "universal", "phenolphthalein"]) {
    const s = state(id, ind, 1);
    assert.equal(A.liquidColour(s), A.observe(s).colour);
  }
});
baseline("every indicator and sample combination returns a complete reading (no undefined fields)", () => {
  for (const id of A.SAMPLE_IDS) for (const ind of A.INDICATORS) for (const dil of [0, 2, 4]) {
    const o = A.observe(state(id, ind.id, dil));
    assert.ok(Number.isFinite(o.ph) && o.kind && o.colour && o.colourWord && o.conclusion, `${id}/${ind.id}/${dil}`);
  }
});

// ---- Invalid and boundary inputs -----------------------------------------------------------
baseline("[pin] an unknown sample id falls back to pure water (pH 7)", () => {
  assert.equal(ph("not-a-sample"), 7);
  assert.equal(A.liquidOf("not-a-sample").name, "Pure water");
});
baseline("[pin] observe() treats a non-numeric dilution as 0", () => {
  assert.equal(A.observe(state("hcl", "meter", NaN)).ph, 1);
  assert.equal(A.observe(state("hcl", "meter", "abc")).ph, 1);
  assert.equal(A.observe(state("hcl", "meter", undefined)).ph, 1);
});

// ================== KNOWN DEFECTS (characterisation, see the Phase 2A audit) ==================
defect("AB-01", "baking soda is modelled as falling 8.3 → 7.1 on dilution; an amphoteric salt stays near ½(pKa₁+pKa₂) ≈ 8.3 (reference 6.35 and 10.33)", () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => ph("soda", n).toFixed(1)), ["8.3", "7.8", "7.3", "7.1", "7.1"]);
  const reference = (6.35 + 10.33) / 2;
  assert.ok(Math.abs(ph("soda", 3) - reference) > 1, "model should differ from the reference by more than 1 pH unit");
});
defect("AB-01", "milk of magnesia falls 10.5 → 8.5 on dilution; a saturated Mg(OH)₂ suspension keeps its pH while solid remains", () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => ph("antacid", n).toFixed(1)), ["10.5", "10.0", "9.5", "9.0", "8.5"]);
});
defect("AB-01", "vinegar uses a fixed 0.5 step; the exact weak-acid result drifts toward 1.0 per step (error ≥ 0.2 pH after 4 dilutions)", () => {
  const ka = 1.8e-5;
  const c0 = 10 ** -5.8 / ka + 10 ** -2.9; // concentration that reproduces the model's pH 2.9
  near(weakAcidPh(c0, ka), 2.9, 0.005, "reference reproduces pH 2.9");
  const reference = weakAcidPh(c0 / 1e4, ka);
  assert.ok(Math.abs(ph("vinegar", 4) - reference) >= 0.2, `model ${ph("vinegar", 4)} vs reference ${reference}`);
});
defect("AB-02", "methyl orange text says 'not a strong acid' for HCl diluted 10⁴ times, although HCl is a strong acid (pH does not measure strength)", () => {
  assert.equal(A.SAMPLES.hcl.strong, true);
  assert.match(A.observe(state("hcl", "methyl", 4)).conclusion, /not a strong acid/);
  assert.match(A.observe(state("hcl", "methyl", 0)).conclusion, /fairly strong acid/);
});
defect("AB-03", "milk (pH 6.5) is classified 'neutral' while its own note says it is slightly acidic", () => {
  assert.equal(A.observe(state("milk")).kind, "neutral");
  assert.match(A.SAMPLES.milk.note, /acidic/);
});
defect("AB-04", "hydrogenIon(3.001) prints '10 × 10⁻⁴' instead of a normalised '1.0 × 10⁻³'", () => {
  assert.equal(A.hydrogenIon(3.001), "10 × 10⁻⁴");
  assert.equal(A.hydrogenIon(7.0001), "10 × 10⁻⁸");
  near(sciValue(A.hydrogenIon(3.001)) / 10 ** -3.001, 1, 0.005, "the value is right (0.2% rounding); only the format is wrong");
});
defect("AB-07", "no input validation: negative dilution lowers HCl to pH 0, NaN gives NaN, a prototype key such as 'constructor' is not treated as unknown", () => {
  assert.equal(ph("hcl", -1), 0);
  assert.ok(Number.isNaN(ph("hcl", NaN)));
  assert.equal(typeof A.liquidOf("constructor"), "function"); // should fall back to water
  assert.equal(ph("constructor"), 7); // silently 7 because every comparison with undefined is false
});
defect("AB-09", "universal indicator reports Math.round(pH): antacid (pH 10.5) reads 'about 11' and cola (pH 2.5) reads 'about 3'", () => {
  assert.equal(A.observe(state("antacid", "universal")).readPh, "about 11");
  assert.equal(A.observe(state("cola", "universal")).readPh, "about 3");
});

const b = results.baseline;
const d = results["known-defect"];
console.log(`\nacids-bases: baseline ${b.passed} passed, ${b.failed} failed | known-defect ${d.passed} passed, ${d.failed} failed | skipped 0`);
console.log(`SUMMARY ${JSON.stringify({ suite: "acids-bases", baseline: b, knownDefect: d, skipped: 0 })}`);
