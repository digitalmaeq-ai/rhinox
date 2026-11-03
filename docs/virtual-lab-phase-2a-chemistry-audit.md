# Rhinox Virtual Science Lab — Phase 2A Chemistry Model Audit

**Status:** Audit only. No production code, tests, routes or UI were changed.
**Base:** `main` at `3973b5d` (after PR #40).
**Scope:** `ab-model.ts`, `titration-chem.ts`, `electrolysis-chem.ts`, their spec wrappers (`acids-bases.tsx`, `titration.tsx`, `electrolysis.tsx`), dashboards, 2D apparatus, 3D scenes (`scenes3d/chemistry.tsx`), tours and the three CBT banks.
**Method:** Full source read, plus read-only numerical probes run from outside the repository (scratch scripts). Probe results quoted below are real outputs. Nothing here has been checked in a browser, and no learner or teacher review has taken place.

All paths are relative to `app/components/interactive/simlab/` unless stated.

---

## 1. Summary

| Model | Verdict | Headline |
|---|---|---|
| Titration | **Scientifically strong.** | The charge-balance solver matches independent closed-form answers to <0.01 pH at every reference point tested, and 607,500 sampled points across all 63 acid/base/concentration/pipette combinations were finite and monotonic. Defects are in the *explanatory text*, input validation and indicator-verdict thresholds, not in the pH maths. |
| Electrolysis | **Faraday maths correct; cell behaviour oversimplified.** | Q = It, electron stoichiometry, masses and gas volumes are right and conserve charge across both electrodes. The weak points are a single 2 V "on" threshold for every cell, a hint that shows the wrong explanation for copper electrodes in non-copper electrolytes, the `"water"` id/name, and chlorine safety information that only appears on a secondary tab. |
| Acids and bases | **Weakest of the three.** | The fixed "0.5 pH per tenfold dilution for every non-strong sample" rule is wrong for several samples (baking soda, milk of magnesia, bleach). Indicator text confuses *pH* with *acid strength*, and milk (pH 6.5) is classed "neutral" while the lab's own note and CBT call it slightly acidic. |

Counts: **0 critical, 4 high, 12 medium, 14 low/info (30 in total), plus 57 proposed test fixtures.** None of these is a crash in normal use. The four high items are one safety-communication gap, one scientifically misleading dilution model, one wrong on-screen explanation, and one scientifically unjustified on/off rule.

---

## 2. Severity scale

- **High** — states or computes something chemically wrong or unsafe that a learner will see in normal use.
- **Medium** — wrong in a reachable situation, or a displayed explanation contradicts the computed result.
- **Low** — edge case, cosmetic, or an approximation that should be labelled.
- **Info** — acceptable educational approximation; document only.

---

## 3. Defect register (ranked)

### High

| ID | Model | Defect | Evidence | Fix |
|---|---|---|---|---|
| **EL-01** | Electrolysis | **Chlorine safety is not shown where chlorine is produced.** The only warning ("Chlorine is poisonous: use a fume cupboard or very small amounts.") is one bullet in the *Notes → Safety* tab (`ElectrolysisDashboard.tsx` ~L343). Selecting brine and switching on shows nothing; the `hint`, the Brine tour step, the 3D scene and the 2D apparatus carry no warning. The product description says "Pale green-yellow gas **with a sharp smell**", which invites sniffing. The chlorine test reads "Bleaches damp blue litmus paper", but damp blue litmus first turns red, then bleaches. | `electrolysis-chem.ts` L95; `electrolysis.tsx` hint; `tours.ts` L76 | Persistent, non-colour-only warning (icon + text, `role="status"`) whenever the anode product is Cl₂, in the dashboard *and* above the apparatus. Rewrite: "Chlorine is toxic. Never smell it. Teacher demonstration or fume cupboard only." Change the test to "damp litmus paper turns red, then is bleached white". Add a tour caveat. |
| **AB-01** | Acids/bases | **Fixed 0.5-pH dilution step is wrong for several samples.** `effectivePh` uses 1.0 per tenfold dilution for `strong: true` and 0.5 for everything else. 0.5 is the right limit for a *simple weak acid or base at moderate dilution*, but not for: **baking soda** (NaHCO₃ is amphoteric, pH ≈ ½(pKa₁+pKa₂) ≈ 8.3–8.4 almost independent of concentration; the model falls 8.3 → 7.1); **milk of magnesia** (a saturated Mg(OH)₂ suspension holds pH ≈ 10.5 while solid remains; the model falls 10.5 → 8.5); **bleach** (mixture of NaOCl and NaOH, not a simple weak base); **milk** (protein/phosphate buffer). Even true weak acids drift from 0.5 toward 1.0 as ionisation approaches completion: probe for 0.83 M ethanoic acid gives 2.41, 2.92, 3.42, 3.95, 4.52 against the model's vinegar 2.90, 3.40, 3.90, 4.40, 4.90 (error grows to 0.4). | Probe output, Section 6.1 | Replace `strong: boolean` with a `behaviour` field and compute: strong → exact (with Kw); simple weak acid/base → exact quadratic from `c` and `Ka`/`Kb`; buffered/amphoteric/saturated-solid → *no change on dilution* (with a note explaining why); see Section 5.1. |
| **EL-02** | Electrolysis | **Hint shows the wrong explanation for copper electrodes in non-copper electrolytes.** In `electrolysis.tsx`, any `electrode === "copper"` returns "With copper electrodes the anode dissolves **and copper is deposited on the cathode**". For `water`, `brine`, `dilute-brine` the cathode product is hydrogen, which the readings correctly show. Display and calculation disagree. | Probe: `water`+copper → cathode H₂ 74.6 cm³ | Build the hint from `outcome()`: describe the actual anode and cathode product. |
| **EL-03** | Electrolysis | **One 2 V threshold for every cell.** `MIN_VOLTS = 2` and `isOn` ignore electrolyte and electrode. Real minimum voltages differ widely: copper refining (Cu anode, Cu cathode) runs at a few tenths of a volt; silver plating below about 1 V; water and dilute H₂SO₄ about 1.5–2 V in practice (1.23 V thermodynamic); chlorine from brine needs more than 2 V in practice (about 2.2 V thermodynamic, higher with overpotential). The supply voltage otherwise has **no effect** on products, current or rate: current is set independently by a slider, voltage only gates on/off. | `electrolysis-chem.ts` L13, L112 | Either (a) per-system `minVolts` shown on the slider, flagged as indicative, or (b) reframe as a constant-current supply ("compliance voltage") and say so. Always state that rate depends on **current** (Q = It), not voltage. Values need teacher sign-off before use. |

### Medium

| ID | Model | Defect | Fix |
|---|---|---|---|
| **AB-02** | Acids/bases | Indicator conclusions confuse pH with *strength*. Methyl orange yellow → "pH above 4.4, **so not a strong acid**"; red → "**a fairly strong acid**". With HCl (a strong acid) diluted ×10⁴ (pH 5) the lab says "not a strong acid", contradicting the sample's own note. Strength compares degree of ionisation at equal concentration; pH measures acidity. | Rewrite to "very acidic / weakly acidic / not acidic". Never infer strength from one pH. |
| **AB-03** | Acids/bases | `kindOf` uses a 6.5–7.5 neutral window. Milk (6.5) is "neutral", but its note and CBT `p9` say "very slightly acidic", and the Notes define acid as "pH below 7". The record-result checker compares the learner's answer to `o.kind`, so "acid" is marked wrong for milk. | Use the same band as the dilution clamps (6.9–7.1), or add a "slightly acidic/alkaline" class. |
| **AB-04** | Acids/bases | `hydrogenIon()` is not normalised near integers: pH 3.001 → "**10 × 10⁻⁴**", pH 7.0001 → "10 × 10⁻⁸". Cause: `toFixed(m >= 9.95 ? 0 : 1)`. | Round the mantissa first; if it reaches 10, use 1.0 and increment the exponent. |
| **AB-05** | Acids/bases | CBT `p1`/`p3` equate "pH 2 = strong acid" and "pH 13 = strong alkali". Same pH/strength conflation. The task check `strong-alkali` passes for any `pH > 11`, including ammonia, which the lab calls a weak alkali. | Reword to "very acidic/alkaline". Rename the check. |
| **AB-06** | Acids/bases | CBT `u7` claims a wasp sting is alkaline and vinegar soothes it. This is a widely repeated myth that is not well supported by measured venom pH. | Remove or replace with a safe, factual first-aid item. |
| **TI-01** | Titration | `explain()` for weak acid in excess says "the pH **stays near 4.7**". Probe: 0.5 cm³ past equivalence is pH 6.44; it reaches 4.745 only at 2 × Vₑ. The statement is true at one point only. | Generate the sentence from the computed pH or buffer ratio. |
| **TI-02** | Titration | `explain()` for any weak-base point before equivalence says "falls only slowly" — also at 24.9 cm³, where pH is 6.86 and about to plunge. The half-equivalence message uses a fixed ±0.5 cm³ window regardless of Vₑ. | Use fractions of Vₑ (for example ±2 %), and a separate "steep part" message near Vₑ. |
| **TI-03** | Titration | No model-level validation. `cA = 0` → Vₑ = Infinity; NaN or non-numeric input → pH −1.5 with no error, and `buretteFit` returns `"ok"`; negative concentrations return negative Vₑ. The dashboard clamps typed concentrations (`CONC_MIN/MAX`), but the model trusts its callers. | Add `sanitiseParams()` that clamps or rejects, with documented ranges. |
| **TI-04** | Titration | Orientation mismatch between CBT and lab. The lab puts the **acid in the burette and base in the flask** (curve falls). CBT `c5`/`c6` describe the textbook weak-acid-in-flask curve (pH = pKa at half-equivalence). In this lab a weak acid's pKa shows at 2 × Vₑ, and the half-equivalence statement only holds for ammonia. | Reword the questions for this set-up, or add an orientation note. |
| **EL-04** | Electrolysis | Product selection treats every copper-electrode case as "anode dissolves" (reasonable) but gives no cathode-side nuance: in dilute H₂SO₄ with a Cu anode, Cu²⁺ accumulates and eventually plates. In AgNO₃ with a Cu anode, copper also displaces silver spontaneously. | Document as simplification; optionally add a note when electrode is Cu and electrolyte is not CuSO₄. |
| **EL-05** | Electrolysis | The `"water"` id names a **dilute sulfuric acid** electrolyte. Pure water barely conducts; the id and checks (`split-water`) imply water alone. Unknown ids silently fall back to `"water"` (`electrolyteOf`). | Rename id to `dilute-h2so4` (keep `"water"` as a read alias), title "Water (with dilute sulfuric acid)". |
| **EL-06** | Electrolysis | Gas volumes assume 24 dm³/mol and no solubility. Chlorine is quite soluble and reacts with the NaOH formed, so measured volumes are well below prediction in real brine cells. The hint says "Collected" without qualification. | Label as ideal-gas, "theoretical volume". |

### Low and info

| ID | Model | Note |
|---|---|---|
| **AB-07** | Acids/bases | `liquidOf` / `SAMPLES[id]` accept prototype keys (`"constructor"`); `effectivePh(NaN)` returns NaN (scenes guard with `|| 0`, the function does not). Negative dilution is accepted. Add `Object.hasOwn` and clamp to 0…`MAX_DILUTION`. |
| **AB-08** | Acids/bases | Vinegar at pH 2.9 corresponds to about 0.09 M ethanoic acid, not 5 % vinegar (≈ 0.83 M, pH ≈ 2.4). Relabel as "Vinegar (diluted)" or set pH 2.4. |
| **AB-09** | Acids/bases | Universal indicator reads `Math.round(ph)`; antacid 10.5 shows "pH about 11", cola 2.5 shows "about 3". Acceptable for a colour chart; consider "pH 10–11". |
| **AB-10** | Acids/bases | Pure water is pH 7 (CO₂ in air gives about 5.6). Acceptable at this level. Info. |
| **AB-11** | Acids/bases | Litmus transition modelled 5–8 (real ≈ 4.5–8.3); phenolphthalein 8.2–10 and methyl orange 3.1–4.4 are correct. Info. |
| **TI-05** | Titration | Activities ignored. At `CONC_MAX = 2 M`, the model shows pH 14.30 and 0.08, off the 0–14 scale the learner is taught and not what an electrode would read. Add a footnote or cap. |
| **TI-06** | Titration | `isAcid`/`isBase` use `in`, so `"toString"` passes. Use `Object.hasOwn`. |
| **TI-07** | Titration | Indicator verdict thresholds (end point within 1.5 % of Vₑ; width ≤ 3 %/6 %) are design choices. Bromothymol blue with ethanoic acid / NaOH comes out "poor" (error +0.22 cm³, 0.9 %); most teachers would call it unsuitable. Document or tighten (for example 0.4 %, about two burette divisions). |
| **TI-08** | Titration | `indicatorReport` costs about 40 ms worst case (many solves). Memoise per (params, indicator). |
| **TI-09** | Titration | Bracket log₁₀[H⁺] ∈ [−16, 1.5] limits output to pH −1.5…16 and fails silently outside. Unreachable with current limits, but add an assertion. |
| **EL-07** | Electrolysis | `chargeC` accepts negative current/time; `GAS_FULL = 200 cm³` caps the tube drawing while the readout can reach 1,250 cm³ (3 A × 30 min). |
| **EL-08** | Electrolysis | The O₂ half-equation uses OH⁻ (WAEC convention), though in acid the OH⁻ concentration is tiny; 2H₂O → O₂ + 4H⁺ + 4e⁻ is more accurate. No net equation is shown. Optional "advanced" line. |
| **EL-09** | Electrolysis | The 3D scene does not fade the CuSO₄ colour or thin the Cu anode, while the 2D SVG does (`fade`, `wear`). Visual parity gap, not a calculation error. |
| **EL-10** | Electrolysis | `FARADAY = 96500` vs 96,485.33 (0.016 % higher). Fine for WAEC-style work; tests must use the model's constant. |

---

## 4. Per-model audit

### 4.1 Acids and bases (`ab-model.ts`)

**Inputs:** `sample` (12 liquids), `indicator` (none, litmus, methyl orange, universal, phenolphthalein, pH meter), `added` (bool), `dilution` (0–4 tenfold steps).
**Outputs:** `effectivePh`, `kind` (acidic/neutral/alkaline), colour, colour word, conclusion, `readPh`, `hydrogenIon` string.

**Equations in code:**
- Dilution: `pH' = pH + n·step`, `step = 1` (strong) or `0.5` (other), clamped at 6.9 (acids) or 7.1 (bases).
- `[H⁺] = 10^(−pH)`, formatted to scientific notation.

**Corrected model (proposed):**
- Strong acid, concentration `c`: `[H⁺] = (c + √(c² + 4Kw)) / 2`.
- Strong base: `[OH⁻]` likewise, `pH = 14 − pOH`.
- Weak acid: `x² / (c − x) = Ka`, with `[H⁺] = x + Kw/x` for very dilute cases; weak base the same with `Kb`.
- Buffered, amphoteric or saturated-solid samples: pH fixed under dilution (and say why).

**Sample pH assumptions:**

| Sample | Model pH | Assessment |
|---|---|---|
| HCl | 1 | 0.1 M strong acid. OK. |
| Cola | 2.5 | Reasonable (phosphoric/carbonic/citric). |
| Lime juice | 2.2 | Reasonable (citric acid). |
| Vinegar | 2.9 | About 0.09 M; a 5 % vinegar is ≈ 2.4 (AB-08). |
| Milk | 6.5 | Fresh milk 6.5–6.7. Buffered, so dilution barely moves it. |
| Pure water | 7 | OK at 25 °C, CO₂ ignored. |
| Baking soda | 8.3 | OK. Amphoteric: should not change on dilution. |
| Soap | 10 | Plausible (hydrolysed carboxylate). |
| Milk of magnesia | 10.5 | OK for saturated Mg(OH)₂. Pinned by the solid. |
| Ammonia | 11.5 | Matches about 0.7 M NH₃. Dilution step 0.5 is a good fit (probe: 11.55, 11.05, 10.54, 10.01, 9.43 against the model's 11.5, 11.0, 10.5, 10.0, 9.5). |
| Bleach | 12.5 | Plausible; flagged weak, but not a simple weak base (AB-01). |
| NaOH | 13 | 0.1 M. OK. |

**What is acceptable:** colour ranges for methyl orange and phenolphthalein, the 0–14 universal-indicator mapping at chart precision, the 6.9/7.1 asymptote clamps, ignoring CO₂ and activity.
**What is not:** items AB-01 to AB-06 above.

### 4.2 Titration (`titration-chem.ts`)

**Set-up:** acid in burette, base pipetted into flask (WAEC). **Inputs:** acid (HCl, H₂SO₄, CH₃COOH), base (NaOH, KOH, NH₃), `cA`, `cB` (0.005–2 mol/dm³), `vB` (10, 20, 25 cm³), `added` (0–50 cm³), indicator (4). **Outputs:** Vₑ, `[H⁺]`, pH, stage, curve points, indicator report, explanation text.

**Equations and constants (all verified):**
- `Vₑ = cB·vB / (n_H · cA)`, with n_H = 2 for H₂SO₄.
- Charge balance: `[H⁺] + cb·α_cation = Kw/[H⁺] + ca·α_anion`, with `α_anion` = 1 (HCl), `1 + Ka₂/(Ka₂+h)` (H₂SO₄), `Ka/(Ka+h)` (ethanoic acid), `α_cation` = 1 (strong base) or `h/(h + Kw/Kb)` (NH₃).
- Kw = 1.0 × 10⁻¹⁴; Ka(CH₃COOH) = Kb(NH₃) = 1.8 × 10⁻⁵; Ka₂(H₂SO₄) = 1.02 × 10⁻². All reasonable textbook values at 25 °C.
- Solver: bisection on log₁₀[H⁺] over [−16, 1.5], 70 iterations. The charge-balance function is strictly increasing in `h`, so the root is unique and bisection always converges. Throughput: about 14 µs per solve.

**Verification against independent closed forms (all within tolerance):**

| Case | Model | Reference |
|---|---|---|
| 0.1 M NaOH, 0 cm³ | 13.000 | 13.000 |
| NaOH + 10 cm³ HCl | 12.632 | 14 + log(1.5/35) = 12.632 |
| HCl excess at 50 cm³ | 1.477 | −log(2.5/75) = 1.477 |
| Strong/strong equivalence | 7.000 | 7 |
| 0.1 M NH₃ initial | 11.125 | quadratic: 11.125 |
| NH₃ half-equivalence | 9.255 | pKa(NH₄⁺) = 9.255 |
| NH₄Cl at equivalence (0.05 M) | 5.278 | 5.278 |
| CH₃COONa at equivalence (0.05 M) | 8.722 | 8.722 |
| CH₃COOH/CH₃COO⁻ 1:1 (50 cm³) | 4.745 | pKa = 4.745 |
| CH₃COOH + NH₃ equivalence | 7.000 | 7.00 (Ka = Kb) |
| H₂SO₄/NaOH at 0, 6.25, 12.5, 12.6, 13, 25 | 13.000, 12.602, 7.315, 3.902, 3.199, 1.743 | independent solver, agrees to <0.001 |

**Convergence and monotonicity:** 607,500 pH evaluations (3 acids × 3 bases × 3 `cA` × 3 `cB` × 3 `vB`, 0–50 cm³ in 0.02 steps) produced **0 non-finite and 0 non-monotone** values.

**Diprotic treatment:** first proton fully ionised, second via Ka₂. Because the base is strong (or NH₃) and Vₑ neutralises both protons, there is a single steep drop at `cB·vB/(2cA)`, correct for this orientation. Sulfate hydrolysis gives pH 7.32 at equivalence, which is physically right. Step-wise buffering of the second proton is not visible in this set-up, so no diprotic buffer claim should be made.

**Indicator end-point error (0.1 M, 25 cm³ base):**

| Pair | Phenolphthalein | Methyl orange | Methyl red | Bromothymol blue |
|---|---|---|---|---|
| HCl/NaOH | −0.01 suitable | +0.09 suitable | 0.00 suitable | 0.00 suitable |
| HCl/NH₃ | −10.29 unsuitable | +0.09 suitable | 0.00 suitable | −0.09 suitable |
| CH₃COOH/NaOH | −0.01 suitable | never reached, unsuitable | +6.96 unsuitable | +0.22 poor (see TI-07) |
| CH₃COOH/NH₃ | −10.29 unsuitable | unsuitable | unsuitable | +0.13 unsuitable |

Verdicts are chemically sensible; the one questionable verdict is TI-07.

### 4.3 Electrolysis (`electrolysis-chem.ts`)

**Inputs:** electrolyte (5), electrode (inert/copper), voltage 0–12 V, current 0.5–3 A, time 0–30 min. **Outputs:** products, charge, moles of electrons, cathode and anode amounts (g or cm³).

**Constants:** F = 96,500 C/mol; molar volume 24,000 cm³/mol (r.t.p.); Cu = 63.5, Ag = 108; `MIN_VOLTS = 2`. All consistent with the WAEC-style stated constants.

**Equations (verified balanced for mass and charge):**
`Q = It`; `n(e⁻) = Q/F`; `n(product) = n(e⁻)/z`; mass `= n·M`; gas volume `= n·24,000 cm³`.
- Cathode: 2H⁺ + 2e⁻ → H₂ (z = 2); Cu²⁺ + 2e⁻ → Cu (z = 2); Ag⁺ + e⁻ → Ag (z = 1).
- Anode: 4OH⁻ → 2H₂O + O₂ + 4e⁻ (z = 4); 2Cl⁻ → Cl₂ + 2e⁻ (z = 2); Cu → Cu²⁺ + 2e⁻ (z = 2).

**Product matrix (every combination, from the model):**

| Electrolyte | Electrode | Cathode | Anode | Verdict |
|---|---|---|---|---|
| Dilute H₂SO₄ ("water") | inert | H₂ | O₂ | Correct (volume ratio 2 : 1 verified). |
| Dilute H₂SO₄ | copper | H₂ | Cu dissolves | Acceptable (EL-04). Hint wrong (EL-02). |
| CuSO₄ | inert | Cu | O₂ | Correct. |
| CuSO₄ | copper | Cu | Cu dissolves | Correct; anode loss = cathode gain (0.197 g each at 600 C). |
| Brine (conc.) | inert | H₂ | Cl₂ | Correct. Safety gap (EL-01); Cl₂ solubility (EL-06). |
| Brine | copper | H₂ | Cu dissolves | Reasonable (Cu oxidises before Cl⁻). Hint wrong (EL-02). |
| Dilute NaCl | inert | H₂ | O₂ | Simplification: some Cl₂ also forms in practice. Label it. |
| Dilute NaCl | copper | H₂ | Cu dissolves | Acceptable. |
| AgNO₃ | inert | Ag | O₂ | Correct. |
| AgNO₃ | copper | Ag | Cu dissolves | Acceptable; Cu also displaces Ag⁺ spontaneously (EL-04). |

**Known-answer values at 1 A for 10 min (Q = 600 C):** H₂ 74.61 cm³, O₂ 37.31 cm³, Cl₂ 74.61 cm³, Cu 0.1974 g, Ag 0.6715 g. All agree with hand calculation.

**Charge conservation:** electrons at the cathode equal electrons at the anode for all ten combinations (each side computed as `n(product) × z`).

**Practice-problem generator:** formulas match the model. `calcQuestion` already drops distractors within 3 % of the answer, so silver cases (z = 1, where some wrong-answer formulas equal the right one) cannot show a duplicate correct option.

**Voltage vs current:** products depend only on the chosen cell; amount depends only on `I·t`; voltage only gates on/off (EL-03). This is a defensible "constant-current" approximation if labelled as such, but the current UI ("Supply voltage") suggests voltage drives production.

---

## 5. Corrected equations and assumptions

### 5.1 Acids/bases — replace the step rule

```
type Behaviour =
  | { kind: "strong-acid" | "strong-base"; c: number }
  | { kind: "weak-acid"; c: number; ka: number }
  | { kind: "weak-base"; c: number; kb: number }
  | { kind: "fixed"; reason: string }   // buffered, amphoteric, saturated suspension
  | { kind: "neutral" };
```
- Strong: `h = (c + √(c² + 4Kw)) / 2` (acid); `oh` likewise for base.
- Weak acid: solve `h = x + Kw/x`, `x = (−Ka + √(Ka² + 4Ka·c))/2`.
- After `n` tenfold dilutions: `c_n = c / 10ⁿ`. No hard clamp is needed once Kw is included (strong acid at 10⁻⁸ M gives pH 6.98 naturally).
- Fixed: pH unchanged; display "Dilution barely changes this liquid because …".
- State in the UI: "Weak acids change by less than one pH unit per tenfold dilution (about 0.5 at moderate concentration)."

### 5.2 Indicator wording
Replace "not a strong acid" with pH-range statements. Teach strength separately: "a strong acid ionises completely; compare two acids at the **same concentration**."

### 5.3 Titration — text driven by numbers
Generate explanations from `pH`, `added/Vₑ` and buffer ratio rather than fixed phrases. Use relative tolerances (±2 % Vₑ) for stage names.

### 5.4 Electrolysis
- Drive hints from `outcome()` (the actual products).
- Per-cell `minVolts` (indicative) or an explicit constant-current framing.
- State all assumptions beside the readout: 100 % current efficiency, ideal gas at r.t.p., no gas dissolving.

---

## 6. Probe evidence (selected)

### 6.1 Dilution (pH after 0–4 tenfold dilutions)

| Sample | Model | Independent calculation |
|---|---|---|
| HCl 0.1 M | 1, 2, 3, 4, 5 | 1.00, 2.00, 3.00, 4.00, 5.00 ✓ |
| Vinegar | 2.9, 3.4, 3.9, 4.4, 4.9 | 0.83 M: 2.41, 2.92, 3.42, 3.95, 4.52 |
| Ammonia | 11.5, 11.0, 10.5, 10.0, 9.5 | 0.7 M: 11.55, 11.05, 10.54, 10.01, 9.43 ✓ |
| Baking soda | 8.3, 7.8, 7.3, 7.1, 7.1 | ≈ 8.3–8.4 constant ✗ |
| Milk of magnesia | 10.5, 10.0, 9.5, 9.0, 8.5 | ≈ 10.5 while solid remains ✗ |
| Milk | 6.5, 6.9, 6.9, 6.9, 6.9 | buffered, little change |

### 6.2 Invalid input behaviour (titration)

| Input | Result |
|---|---|
| `cA = 0` | Vₑ = Infinity, pH 12.85, fit "too-big" |
| `cB = 0` | Vₑ = 0, pH 1.54 |
| `vB = 0` | Vₑ = 0, pH ≈ 1.0 |
| `cA = −1` | Vₑ = −2.5, pH 13.55 |
| `cA = NaN` or `"abc"` | Vₑ = NaN, pH −1.5, fit "ok" |
| `acid: "toString"` | accepted by `paramsOf` |

### 6.3 Display bugs
`hydrogenIon(3.001)` → "10 × 10⁻⁴"; `hydrogenIon(7.0001)` → "10 × 10⁻⁸"; `hydrogenIon(0.0004)` → "10 × 10⁻¹".

---

## 7. Proposed automated tests

**Format:** standalone Node scripts in `scripts/` that import the dependency-free `.ts` model files, matching `scripts/test-virtual-lab-registry.mjs`. Note: `titration-chem.ts` and `electrolysis-chem.ts` import `./titration-practice` without a file extension, so plain Node 22 type stripping fails. A test harness needs either a small resolve hook (as used for this audit) or extensionless-import tolerance added to the models. Choose before Phase 2B. No new dependency is required.

Proposed files:
- `scripts/test-chem-acids-bases.mjs`
- `scripts/test-chem-titration.mjs`
- `scripts/test-chem-electrolysis.mjs`
- `scripts/test-chem-content-claims.mjs` (texts vs numbers)

### 7.1 Fixture table

Tolerances are absolute unless stated. `F = 96,500`, `Vm = 24,000 cm³`.

#### Acids and bases

| ID | Input | Expected | Tol. | Notes |
|---|---|---|---|---|
| AB-F1 | `hcl`, 0 dil. | pH 1.00; `[H⁺]` 1.0×10⁻¹ | 0.005 | sample bound |
| AB-F2 | `hcl`, n = 1…4 | 2, 3, 4, 5 | 0.01 | strong tenfold = +1 |
| AB-F3 | `naoh`, n = 1…4 | 12, 11, 10, 9 | 0.01 | |
| AB-F4 | strong acid at c = 10⁻⁸ M | 6.98 | 0.02 | water limit (needs 5.1 model) |
| AB-F5 | `vinegar` (ethanoic, c, Ka) | exact quadratic | 0.02 | after 5.1 |
| AB-F6 | `ammonia`, n = 1 | step 0.4–0.55 | — | weak step < 1 |
| AB-F7 | `soda`, n = 0…4 | unchanged | 0.05 | amphoteric (after 5.1) |
| AB-F8 | `antacid`, n = 0…4 | unchanged | 0.05 | saturated solid |
| AB-F9 | every sample, any n | 0 ≤ pH ≤ 14; acids ≤ 7, alkalis ≥ 7 | — | bounds |
| AB-F10 | monotone: pH non-decreasing for acids as n rises (non-increasing for alkalis) | holds | — | |
| AB-F11 | `water`, any n | 7 | 0 | |
| AB-F12 | `hydrogenIon` pH 3, 2.5, 3.001, 7.0001, 14, 0 | "1.0 × 10⁻³", "3.2 × 10⁻³", "1.0 × 10⁻³", "1.0 × 10⁻⁷", "1.0 × 10⁻¹⁴", "1.0 × 10⁰" | exact | normalisation (AB-04) |
| AB-F13 | Indicator edges: litmus 4.99/5/8/8.01; methyl orange 3.1/4.4; phenolphthalein 8.2/10 | colour words switch exactly at bounds | exact | |
| AB-F14 | milk (6.5) | `kind` = "acidic" (slightly) | — | after AB-03 |
| AB-F15 | Content: no conclusion string contains "not a strong acid" or "fairly strong" | true | — | AB-02 |

#### Titration (0.1 M, 25 cm³ unless stated)

| ID | Case | Expected | Tol. |
|---|---|---|---|
| TI-F1 | Vₑ HCl/NaOH, `cA = 0.1` | 25.000 | 1e-9 |
| TI-F2 | Vₑ H₂SO₄/NaOH | 12.500 | 1e-9 |
| TI-F3 | Vₑ CH₃COOH/NH₃, `cA = 0.05` | 50.000 | 1e-9 |
| TI-F4 | HCl/NaOH pH at 0, Vₑ, 50 | 13.000, 7.000, 1.477 | 0.01 |
| TI-F5 | NH₃ pH at 0, Vₑ/2, Vₑ | 11.125, 9.255, 5.278 | 0.01 |
| TI-F6 | CH₃COOH/NaOH pH at 2·Vₑ (1:1 buffer), Vₑ | 4.745, 8.722 | 0.01 |
| TI-F7 | CH₃COOH/NH₃ pH at Vₑ | 7.000 | 0.01 |
| TI-F8 | H₂SO₄/NaOH at 0, 6.25, 12.5, 12.6, 13, 25 | 13.000, 12.602, 7.315, 3.902, 3.199, 1.743 | 0.002 |
| TI-F9 | Monotone non-increasing, all 63 combinations, 0–50 in 0.05 steps | no increase > 1e-9 | — |
| TI-F10 | Finite pH everywhere in the grid | true | — |
| TI-F11 | Charge-balance residual at returned `[H⁺]` | \|f\| < 1e-9 × scale | — |
| TI-F12 | Solver agreement with independent 300-iteration bisection | < 1e-6 pH | — |
| TI-F13 | Stoichiometry: `excessMillimoles(Vₑ) = 0` for all combos; sign flips either side | exact | 1e-9 |
| TI-F14 | Strong/strong: pH(Vₑ±0.1 cm³) = 10.30 and 3.70 | 10.30, 3.70 | 0.02 |
| TI-F15 | Indicator verdicts match Section 4.2 table (HCl/NH₃: phenolphthalein unsuitable, methyl orange suitable; weak acid/NaOH: methyl orange unsuitable) | as table | — |
| TI-F16 | `explain()` weak-acid-in-excess at Vₑ+0.5 does not contain "4.7" (TI-01) | true | — |
| TI-F17 | Boundary: `cA, cB` = 0.005, 2; `vB` = 10, 20, 25; Vₑ vs `buretteFit` thresholds 3 and 48 | as defined | — |
| TI-F18 | Invalid: 0, negative, NaN, strings, prototype keys | rejected or clamped, never NaN | — (after TI-03) |
| TI-F19 | Equation strings balance (atom count parse) for all 9 pairs | true | — |
| TI-F20 | Units: Vₑ in cm³; `cB·vB` mmol; mmol/cm³ = mol/dm³ | dimensional check | — |

#### Electrolysis

| ID | Input | Expected | Tol. |
|---|---|---|---|
| EL-F1 | 1 A, 10 min: Q | 600 C | exact |
| EL-F2 | `n(e⁻)` at 600 C | 6.2176×10⁻³ mol | 1e-8 |
| EL-F3 | H₂ at 600 C | 74.61 cm³ | 0.01 |
| EL-F4 | O₂ at 600 C | 37.31 cm³ | 0.01 |
| EL-F5 | Cl₂ at 600 C | 74.61 cm³ | 0.01 |
| EL-F6 | Cu at 600 C | 0.1974 g | 0.0005 |
| EL-F7 | Ag at 600 C | 0.6715 g | 0.0005 |
| EL-F8 | H₂ : O₂ volume ratio (water, inert) | 2.000 | 1e-9 |
| EL-F9 | Series Cu → Ag, same Q: m(Ag)/m(Cu) | (108/1)/(63.5/2) = 3.4016 | 1e-4 |
| EL-F10 | Charge conservation: `z·n` at cathode = `z·n` at anode = `n(e⁻)`, all 10 electrolyte × electrode combinations | equal | 1e-9 |
| EL-F11 | Cu electrodes in CuSO₄: anode mass loss = cathode mass gain | equal | 1e-9 |
| EL-F12 | Linearity: doubling I or t doubles every amount | ×2 | 1e-9 |
| EL-F13 | Off states: voltage < 2, current 0, time 0 → all amounts 0 | 0 | exact |
| EL-F14 | Product table: the ten combinations in Section 4.3 | exact names | — |
| EL-F15 | Half-equations balance in atoms and charge (parser) | true | — |
| EL-F16 | Hint text names the actual products (EL-02) for every combination | true | — |
| EL-F17 | Safety: when `anode.formula === "Cl₂"` the dashboard warning string exists (render test) | true | — |
| EL-F18 | Units: gas in cm³, metals in g; `measured()` within ±0.6 cm³ / ±0.002 g of truth, deterministic for the same salt | true | — |
| EL-F19 | Invalid: negative or NaN current/time/voltage → clamped or rejected | no negative amounts | — |
| EL-F20 | Unknown electrolyte id: documented fallback, or error (after EL-05) | defined | — |
| EL-F21 | Per-cell minimum volts (after EL-03) | table | — |
| EL-F22 | Practice generator: for 200 seeds and all six kinds, answer matches independent calc; options distinct; exactly one correct | true | 1e-9 rel |

---

## 8. Recommended implementation order

Small, separately reviewable PRs. Each starts with the tests that fail on current behaviour.

1. **Test harness (no behaviour change).** Resolve extensionless imports for Node tests; add the three test scripts with the fixtures that *pass today* (TI-F1…F15, EL-F1…F15, AB-F1–F3, AB-F9–F11, AB-F13). This freezes the good behaviour first.
2. **Safety and wrong-explanation fixes (EL-01, EL-02).** Chlorine warning where it is produced; hint driven by `outcome()`; chlorine test wording. Text and small UI change only. Needs approval because the dashboards are in scope.
3. **Acids/bases text and bounds (AB-02, AB-03, AB-04, AB-05, AB-06, AB-07).** Indicator wording, neutral band, `hydrogenIon` normalisation, input clamping, CBT corrections.
4. **Dilution model (AB-01, AB-08).** Sample metadata with `behaviour`, exact calculations, "no change on dilution" explanation. Biggest scientific change; do on its own with design sign-off.
5. **Titration text and validation (TI-01…TI-04, TI-06, TI-07).** Number-driven explanations, `sanitiseParams`, `Object.hasOwn`, indicator-threshold documentation, CBT orientation wording.
6. **Electrolysis model polish (EL-03, EL-05, EL-06, EL-07).** Per-cell voltage or constant-current framing, `dilute-h2so4` id with alias, theoretical-volume labelling. Requires teacher validation of the voltage values.
7. **Visual parity and optional extras (EL-09, EL-08, AB-09, TI-05, TI-08).** 3D colour fade and anode wear, net equations, caching.

Items 2 and 4 touch protected or shared learner-facing areas; none of this changes Rhinox Code Studio, Think • Move • Code! or the experience player.

---

## 9. Not done in this audit

- No browser, accessibility, performance or device testing.
- Scientific constants and sample pH values are checked against textbook values from general knowledge, not against a cited syllabus or curriculum document. Before shipping, the voltage figures (EL-03), sample pH values and CBT wording should be reviewed by a chemistry teacher.
- `titration-practice.ts`, `titration-cbt.ts` and the titration dashboard text were reviewed only where they touch model outputs; a full question-by-question content review has not been done.
- The Virtual Lab tours were checked only for chemistry claims about these three labs.

## 10. Git state

Only this file was created. No existing file was edited, nothing was committed, and no PR was opened.
