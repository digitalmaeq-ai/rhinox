// Practice maths for the titration lab: burette readings, concordant titres,
// the "unknown concentration" challenge and generated calculation problems.
// Pure functions, seeded so a problem can be reproduced from its seed.

import { ACIDS, BASES, equation, type TitParams } from "./titration-chem";

export type Rng = () => number;

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rnd: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pick<T>(items: readonly T[], rnd: Rng): T {
  return items[Math.floor(rnd() * items.length)];
}

/* ------------------------------ number formatting ------------------------------ */

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

/** 0.0025 → "2.50 × 10⁻³" */
export function sci(x: number, sf = 3) {
  if (x === 0) return "0";
  const [m, e] = x.toExponential(sf - 1).split("e");
  const exp = String(Number(e)).split("").map((c) => SUP[c] ?? c).join("");
  return `${m} × 10${exp}`;
}

/** Significant figures, keeping trailing zeros (0.1 → "0.100"). */
export function fmt(x: number, sf = 3) {
  if (x === 0) return "0";
  const a = Math.abs(x);
  if (a < 0.001 || a >= 10000) return sci(x, sf);
  const s = x.toPrecision(sf);
  return s.includes("e") ? sci(x, sf) : s;
}

/* ------------------------------ burette readings ------------------------------ */

/** A burette is read to the nearest 0.05 cm³. */
export const round05 = (x: number) => Math.round(x * 20) / 20;
export const round2 = (x: number) => Math.round(x * 100) / 100;

/** A new fill rarely starts exactly on zero: 0.00 to 1.00 cm³. */
export function randomStart(rnd: Rng) {
  return Math.round(rnd() * 20) / 20;
}

export type Run = {
  id: number;
  initial: number;
  final: number;
  titre: number;
  colour: string;
  changed: boolean;
};

export const CONCORDANT_WITHIN = 0.1;
export const MAX_RUNS = 6;

/**
 * The largest group of accurate titres that agree to within 0.10 cm³ (at
 * least two). Ties go to the tightest group. Returns the group and its mean.
 */
export function concordant(titres: number[]): { values: number[]; mean: number } | null {
  const sorted = [...titres].sort((a, b) => a - b);
  let best: number[] | null = null;
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j] - sorted[i] > CONCORDANT_WITHIN + 1e-9) break;
      const group = sorted.slice(i, j + 1);
      const better =
        !best ||
        group.length > best.length ||
        (group.length === best.length && group[group.length - 1] - group[0] < best[best.length - 1] - best[0]);
      if (better) best = group;
    }
  }
  if (!best) return null;
  const mean = best.reduce((s, v) => s + v, 0) / best.length;
  return { values: best, mean: round2(mean) };
}

/** A base of unknown strength whose titre lands comfortably on the burette (14 to 38 cm³). */
export function unknownBase(p: TitParams, rnd: Rng) {
  const target = 14 + rnd() * 24;
  const raw = (target * ACIDS[p.acid].protons * p.cA) / p.vB;
  return Number(raw.toPrecision(3));
}

/* ------------------------------ calculation problems ------------------------------ */
// WAEC set-up: acid in the burette (titre = Vₐ), base pipetted into the flask (V_b).

export type CalcKind = "base-conc" | "acid-conc" | "volume" | "diprotic" | "moles" | "mass-conc";

export const CALC_KINDS: { id: CalcKind; label: string }[] = [
  { id: "base-conc", label: "Base concentration (flask)" },
  { id: "acid-conc", label: "Acid concentration (burette)" },
  { id: "volume", label: "Volume of acid needed" },
  { id: "diprotic", label: "Sulphuric acid (1 : 2)" },
  { id: "moles", label: "Moles" },
  { id: "mass-conc", label: "Concentration in g/dm³" },
];

export type Difficulty = "easy" | "medium" | "hard";

export type CalcProblem = {
  id: string;
  kind: CalcKind;
  difficulty: Difficulty;
  prompt: string;
  answer: number;
  unit: string;
  working: string[];
  /** Typical wrong answers (inverted ratio, forgotten division …). */
  wrong: number[];
};

const CA = [0.05, 0.08, 0.1, 0.125, 0.15, 0.2];
const CB = [0.04, 0.05, 0.06, 0.075, 0.08, 0.1, 0.12, 0.15];
const VB = [20, 25];

const vol = (x: number) => x.toFixed(1);
const dm3 = (cm3: number) => fmt(cm3 / 1000);
const titre = (rnd: Rng, lo: number, hi: number) => Math.round((lo + rnd() * (hi - lo)) * 2) / 2;

export function generateCalc(seed: number, kind?: CalcKind): CalcProblem {
  const rnd = makeRng(seed);
  const k = kind ?? pick(CALC_KINDS, rnd).id;
  const ca = pick(CA, rnd); // acid in the burette
  const cb = pick(CB, rnd); // base in the flask
  const vb = pick(VB, rnd); // pipette volume
  const id = `${k}-${seed}`;

  if (k === "base-conc") {
    const va = titre(rnd, 12, 32);
    const na = (ca * va) / 1000;
    const ans = (ca * va) / vb;
    return {
      id, kind: k, difficulty: "medium", unit: "mol/dm³", answer: ans,
      prompt: `${vol(vb)} cm³ of sodium hydroxide solution, measured with a pipette, required ${vol(va)} cm³ of ${fmt(ca)} mol/dm³ hydrochloric acid from the burette for complete neutralisation. Calculate the concentration of the sodium hydroxide in mol/dm³.`,
      working: [
        "HCl + NaOH → NaCl + H₂O   (mole ratio 1 : 1)",
        `Moles of HCl = ${fmt(ca)} × ${vol(va)} ÷ 1000 = ${sci(na)} mol`,
        `Moles of NaOH = ${sci(na)} mol`,
        `Concentration of NaOH = ${sci(na)} ÷ ${dm3(vb)} dm³ = ${fmt(ans)} mol/dm³`,
      ],
      wrong: [(ca * vb) / va, ca * va, na, ans * 2],
    };
  }
  if (k === "acid-conc") {
    const va = titre(rnd, 12, 32);
    const nb = (cb * vb) / 1000;
    const ans = (cb * vb) / va;
    return {
      id, kind: k, difficulty: "medium", unit: "mol/dm³", answer: ans,
      prompt: `A burette contains hydrochloric acid of unknown concentration. ${vol(vb)} cm³ of ${fmt(cb)} mol/dm³ sodium hydroxide needed ${vol(va)} cm³ of the acid for complete neutralisation. Calculate the concentration of the acid in mol/dm³.`,
      working: [
        "HCl + NaOH → NaCl + H₂O   (mole ratio 1 : 1)",
        `Moles of NaOH = ${fmt(cb)} × ${vol(vb)} ÷ 1000 = ${sci(nb)} mol`,
        `Moles of HCl = ${sci(nb)} mol`,
        `Concentration of HCl = ${sci(nb)} ÷ ${dm3(va)} dm³ = ${fmt(ans)} mol/dm³`,
      ],
      wrong: [(cb * va) / vb, cb * vb, nb, ans * 2],
    };
  }
  if (k === "volume") {
    const nb = (cb * vb) / 1000;
    const ans = (cb * vb) / ca;
    return {
      id, kind: k, difficulty: "medium", unit: "cm³", answer: ans,
      prompt: `What volume of ${fmt(ca)} mol/dm³ hydrochloric acid from the burette is needed to neutralise ${vol(vb)} cm³ of ${fmt(cb)} mol/dm³ sodium hydroxide?`,
      working: [
        "HCl + NaOH → NaCl + H₂O   (mole ratio 1 : 1)",
        `Moles of NaOH = ${fmt(cb)} × ${vol(vb)} ÷ 1000 = ${sci(nb)} mol`,
        `Moles of HCl needed = ${sci(nb)} mol`,
        `Volume = ${sci(nb)} ÷ ${fmt(ca)} = ${sci(nb / ca)} dm³ = ${fmt(ans)} cm³`,
      ],
      wrong: [(ca * vb) / cb, ans * 2, ans / 2, ca * cb * vb],
    };
  }
  if (k === "diprotic") {
    const va = titre(rnd, 12, 30);
    const na = (ca * va) / 1000;
    const ans = (2 * ca * va) / vb;
    return {
      id, kind: k, difficulty: "hard", unit: "mol/dm³", answer: ans,
      prompt: `${vol(vb)} cm³ of sodium hydroxide solution required ${vol(va)} cm³ of ${fmt(ca)} mol/dm³ sulphuric acid from the burette for complete neutralisation. Calculate the concentration of the sodium hydroxide in mol/dm³.`,
      working: [
        "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O   (mole ratio acid : base = 1 : 2)",
        `Moles of H₂SO₄ = ${fmt(ca)} × ${vol(va)} ÷ 1000 = ${sci(na)} mol`,
        `Moles of NaOH = 2 × ${sci(na)} = ${sci(2 * na)} mol`,
        `Concentration of NaOH = ${sci(2 * na)} ÷ ${dm3(vb)} dm³ = ${fmt(ans)} mol/dm³`,
      ],
      wrong: [(ca * va) / vb, (ca * va) / (2 * vb), (4 * ca * va) / vb, na],
    };
  }
  if (k === "moles") {
    const va = titre(rnd, 10, 40);
    const ans = (ca * va) / 1000;
    return {
      id, kind: k, difficulty: "easy", unit: "mol", answer: ans,
      prompt: `How many moles of hydrochloric acid are in ${vol(va)} cm³ of a ${fmt(ca)} mol/dm³ solution?`,
      working: [
        "Moles = concentration (mol/dm³) × volume (dm³)",
        `Volume = ${vol(va)} ÷ 1000 = ${dm3(va)} dm³`,
        `Moles = ${fmt(ca)} × ${dm3(va)} = ${sci(ans)} mol`,
      ],
      wrong: [ca * va, ans * 10, ans / 10, va / (ca * 1000)],
    };
  }
  // mass concentration of NaOH, Na = 23, O = 16, H = 1
  const va = titre(rnd, 12, 32);
  const na = (ca * va) / 1000;
  const conc = (ca * va) / vb;
  const ans = conc * 40;
  return {
    id, kind: "mass-conc", difficulty: "hard", unit: "g/dm³", answer: ans,
    prompt: `${vol(vb)} cm³ of sodium hydroxide solution was neutralised by ${vol(va)} cm³ of ${fmt(ca)} mol/dm³ hydrochloric acid. Calculate the concentration of the sodium hydroxide in g/dm³. (Na = 23, O = 16, H = 1)`,
    working: [
      "HCl + NaOH → NaCl + H₂O   (mole ratio 1 : 1)",
      `Moles of HCl = ${fmt(ca)} × ${vol(va)} ÷ 1000 = ${sci(na)} mol = moles of NaOH`,
      `Concentration of NaOH = ${sci(na)} ÷ ${dm3(vb)} = ${fmt(conc)} mol/dm³`,
      "Molar mass of NaOH = 23 + 16 + 1 = 40 g/mol",
      `Mass concentration = ${fmt(conc)} × 40 = ${fmt(ans)} g/dm³`,
    ],
    wrong: [conc, ans / 40 * 36.5, ans * 2, (ca * va * 40) / 1000],
  };
}

export type Verdict = "correct" | "close" | "wrong";

/** Within 1 % is correct; within 5 % is close (a rounding slip). */
export function grade(answer: number, given: number): Verdict {
  if (!Number.isFinite(given) || answer === 0) return "wrong";
  const err = Math.abs(given - answer) / Math.abs(answer);
  if (err <= 0.01) return "correct";
  if (err <= 0.05) return "close";
  return "wrong";
}

/** The learner's own result: concentration of the base in the flask from their mean titre. */
export function experimentProblem(p: TitParams, meanTitre: number): CalcProblem {
  const acid = ACIDS[p.acid];
  const base = BASES[p.base];
  const na = (p.cA * meanTitre) / 1000;
  const nb = na * acid.protons;
  const ans = nb / (p.vB / 1000);
  return {
    id: "mine",
    kind: acid.protons === 2 ? "diprotic" : "base-conc",
    difficulty: acid.protons === 2 ? "hard" : "medium",
    unit: "mol/dm³",
    answer: ans,
    prompt: `Your mean titre was ${meanTitre.toFixed(2)} cm³ of ${fmt(p.cA)} mol/dm³ ${acid.name.toLowerCase()} for ${vol(p.vB)} cm³ of ${base.name.toLowerCase()}. Calculate the concentration of the base in mol/dm³.`,
    working: [
      `${equation(p)}   (mole ratio acid : base = 1 : ${acid.protons})`,
      `Moles of ${acid.formula} = ${fmt(p.cA)} × ${meanTitre.toFixed(2)} ÷ 1000 = ${sci(na)} mol`,
      `Moles of ${base.formula} = ${sci(na)} × ${acid.protons} = ${sci(nb)} mol`,
      `Concentration = ${sci(nb)} ÷ ${dm3(p.vB)} dm³ = ${fmt(ans)} mol/dm³`,
    ],
    wrong: [],
  };
}
