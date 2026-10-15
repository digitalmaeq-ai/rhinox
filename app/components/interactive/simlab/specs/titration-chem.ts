// Acid–base titration chemistry, set up as in a school (WAEC) practical:
// the ACID is in the burette and the BASE is pipetted into the flask.
// Pure functions, no UI. Everything the readings, the graph, the flask colour
// and the 3D scene show comes from here, so they can never disagree.
//
// The pH at every point is found by solving the charge balance of the flask
// exactly (no "strong/weak" shortcuts), so buffers, hydrolysis at equivalence
// and the diprotic second step all appear in the curve on their own:
//   [H⁺] + [cations from the base] = [OH⁻] + [anions from the acid]
// The pH therefore FALLS as acid is added from the burette.
// Activities are ignored and the temperature is 25 °C.

export type AcidId = "HCl" | "H2SO4" | "CH3COOH";
export type BaseId = "NaOH" | "KOH" | "NH3";

export const KW = 1e-14; // at 25 °C
export const BURETTE_ML = 50;

export type AcidInfo = {
  id: AcidId;
  name: string;
  formula: string;
  strength: "Strong acid" | "Weak acid";
  protons: number; // replaceable H⁺ per molecule
  ka?: number; // weak acid Ka
  ka2?: number; // second dissociation of H₂SO₄
  note: string;
};
export type BaseInfo = {
  id: BaseId;
  name: string;
  formula: string;
  strength: "Strong base" | "Weak base";
  kb?: number;
  note: string;
};

export const ACIDS: Record<AcidId, AcidInfo> = {
  HCl: {
    id: "HCl",
    name: "Hydrochloric acid",
    formula: "HCl",
    strength: "Strong acid",
    protons: 1,
    note: "Fully ionised in water, so pH = −log[H⁺].",
  },
  H2SO4: {
    id: "H2SO4",
    name: "Sulphuric acid",
    formula: "H₂SO₄",
    strength: "Strong acid",
    protons: 2,
    ka2: 1.02e-2,
    note: "Diprotic: the first H⁺ ionises completely, the second only partly (Ka₂ = 1.02 × 10⁻²). Each mole neutralises 2 mol of NaOH or KOH.",
  },
  CH3COOH: {
    id: "CH3COOH",
    name: "Ethanoic acid",
    formula: "CH₃COOH",
    strength: "Weak acid",
    protons: 1,
    ka: 1.8e-5,
    note: "Only a small fraction ionises (Ka = 1.8 × 10⁻⁵, pKa 4.74), so it behaves as a buffer once some base is neutralised.",
  },
};

export const BASES: Record<BaseId, BaseInfo> = {
  NaOH: { id: "NaOH", name: "Sodium hydroxide", formula: "NaOH", strength: "Strong base", note: "Fully ionised." },
  KOH: { id: "KOH", name: "Potassium hydroxide", formula: "KOH", strength: "Strong base", note: "Fully ionised; behaves like NaOH in this titration." },
  NH3: {
    id: "NH3",
    name: "Aqueous ammonia",
    formula: "NH₃",
    strength: "Weak base",
    kb: 1.8e-5,
    note: "Only partly reacts with water (Kb = 1.8 × 10⁻⁵), so NH₃ and NH₄⁺ form a buffer as acid is added.",
  },
};

export const ACID_IDS = Object.keys(ACIDS) as AcidId[];
export const BASE_IDS = Object.keys(BASES) as BaseId[];

export type TitParams = {
  acid: AcidId;
  base: BaseId;
  cA: number; // acid concentration, mol/dm³ (in the burette)
  cB: number; // base concentration, mol/dm³ (pipetted into the flask)
  vB: number; // volume of base in the flask, cm³
};

export const DEFAULT_PARAMS: TitParams = { acid: "HCl", base: "NaOH", cA: 0.1, cB: 0.1, vB: 25 };

/** Pipette sizes offered for the flask. */
export const FLASK_VOL = [10, 20, 25];
/** Limits for typed concentrations, mol/dm³. */
export const CONC_MIN = 0.005;
export const CONC_MAX = 2;

function isAcid(v: unknown): v is AcidId {
  return typeof v === "string" && v in ACIDS;
}
function isBase(v: unknown): v is BaseId {
  return typeof v === "string" && v in BASES;
}

export function paramsOf(state: Record<string, number | string | boolean>): TitParams {
  return {
    acid: isAcid(state.acid) ? state.acid : DEFAULT_PARAMS.acid,
    base: isBase(state.base) ? state.base : DEFAULT_PARAMS.base,
    cA: Number(state.cA ?? DEFAULT_PARAMS.cA),
    cB: Number(state.cB ?? DEFAULT_PARAMS.cB),
    vB: Number(state.vB ?? DEFAULT_PARAMS.vB),
  };
}

/** Volume of acid that exactly neutralises the base, in cm³. */
export function equivalenceVolume(p: TitParams = DEFAULT_PARAMS) {
  return (p.cB * p.vB) / (ACIDS[p.acid].protons * p.cA);
}

export type BuretteFit = "ok" | "too-big" | "too-small";

/** Will the end point land on the 50 cm³ burette, and be big enough to read well? */
export function buretteFit(p: TitParams): BuretteFit {
  const ve = equivalenceVolume(p);
  if (ve > 48) return "too-big";
  if (ve < 3) return "too-small";
  return "ok";
}

/* ------------------------------ pH from charge balance ------------------------------ */

function chargeBalance(h: number, added: number, p: TitParams) {
  const total = p.vB + added;
  const cb = (p.cB * p.vB) / total; // base left in the flask, mol/dm³
  const ca = (p.cA * added) / total; // acid delivered, mol/dm³
  const acid = ACIDS[p.acid];
  const base = BASES[p.base];

  // negative charge per mole of acid
  let anion: number;
  if (acid.id === "HCl") anion = 1;
  else if (acid.id === "H2SO4") anion = 1 + (acid.ka2 as number) / ((acid.ka2 as number) + h);
  else anion = (acid.ka as number) / ((acid.ka as number) + h);

  // positive charge per mole of base
  let cation = 1;
  if (base.id === "NH3") {
    const kaNH4 = KW / (base.kb as number);
    cation = h / (h + kaNH4);
  }
  return h + cb * cation - KW / h - ca * anion;
}

/** [H⁺] in mol/dm³ after `added` cm³ of acid. */
export function hydrogenIon(added: number, p: TitParams = DEFAULT_PARAMS) {
  let lo = -16; // log10[H⁺]
  let hi = 1.5;
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2;
    if (chargeBalance(Math.pow(10, mid), added, p) > 0) hi = mid;
    else lo = mid;
  }
  return Math.pow(10, (lo + hi) / 2);
}

export function titrationPh(added: number, p: TitParams = DEFAULT_PARAMS) {
  return -Math.log10(hydrogenIon(added, p));
}

/** Stoichiometric excess in millimoles: positive = excess acid, negative = base still unreacted. */
export function excessMillimoles(added: number, p: TitParams = DEFAULT_PARAMS) {
  return ACIDS[p.acid].protons * p.cA * added - p.cB * p.vB;
}

/** "alkali" = flask still alkaline (before equivalence), "acid" = acid in excess (after). */
export type Stage = "alkali" | "equivalence" | "acid";

export function stageAt(added: number, p: TitParams = DEFAULT_PARAMS): Stage {
  const ve = equivalenceVolume(p);
  if (Math.abs(added - ve) < 0.05) return "equivalence";
  return added < ve ? "alkali" : "acid";
}

export const STAGE_LABEL: Record<Stage, string> = {
  alkali: "Alkali still in excess",
  equivalence: "At equivalence point",
  acid: "Acid in excess",
};

/** Points for the curve, from 0 to `max` cm³, denser around the steep fall. */
export function curvePoints(p: TitParams = DEFAULT_PARAMS, max = BURETTE_ML) {
  const ve = equivalenceVolume(p);
  const volumes = new Set<number>();
  for (let v = 0; v <= max + 1e-9; v += 0.25) volumes.add(Math.round(v * 1000) / 1000);
  for (let d = -1; d <= 1.0001; d += 0.02) {
    const v = Math.round((ve + d) * 1000) / 1000;
    if (v >= 0 && v <= max) volumes.add(v);
  }
  return [...volumes].sort((a, b) => a - b).map((v) => ({ v, ph: titrationPh(v, p) }));
}

/** The balanced equation for the chosen pair. */
export function equation(p: TitParams = DEFAULT_PARAMS) {
  const a = p.acid;
  const b = p.base;
  if (b === "NH3") {
    if (a === "HCl") return "HCl + NH₃ → NH₄Cl";
    if (a === "H2SO4") return "H₂SO₄ + 2NH₃ → (NH₄)₂SO₄";
    return "CH₃COOH + NH₃ → CH₃COONH₄";
  }
  const m = b === "NaOH" ? "Na" : "K";
  if (a === "HCl") return `HCl + ${b} → ${m}Cl + H₂O`;
  if (a === "H2SO4") return `H₂SO₄ + 2${b} → ${m}₂SO₄ + 2H₂O`;
  return `CH₃COOH + ${b} → CH₃COO${m} + H₂O`;
}

/** What kind of solution sits at the equivalence point, and why the pH is where it is. */
export function equivalenceNote(p: TitParams = DEFAULT_PARAMS) {
  const weakA = ACIDS[p.acid].strength === "Weak acid";
  const weakB = BASES[p.base].strength === "Weak base";
  if (!weakA && !weakB) return "Strong acid + strong base: the salt does not react with water, so the pH is 7.";
  if (weakA && !weakB) return "Weak acid + strong base: the ethanoate ion takes H⁺ from water, leaving extra OH⁻, so the pH is above 7.";
  if (!weakA && weakB) return "Strong acid + weak base: the ammonium ion gives H⁺ to water, so the pH is below 7.";
  return "Weak acid + weak base: the curve has no sharp drop, so no ordinary indicator gives a reliable end point.";
}

/* ------------------------------ Indicators ------------------------------ */

export type IndicatorId = "phenolphthalein" | "methyl-orange" | "methyl-red" | "bromothymol-blue";

type IndicatorInfo = {
  name: string;
  low: number;
  high: number;
  acidSide: string;
  alkaliSide: string;
  note: string;
  stops: [number, string][];
  names: [number, string][];
};

export const INDICATORS: Record<IndicatorId, IndicatorInfo> = {
  phenolphthalein: {
    name: "Phenolphthalein",
    low: 8.2,
    high: 10,
    acidSide: "Colourless",
    alkaliSide: "Pink",
    note: "Colourless in acid, turns pink between pH 8.2 and 10.",
    stops: [[0, "#e8f3fb"], [0.9, "#e9338f"], [1, "#e9338f"]],
    names: [[0, "Colourless"], [0.45, "Pale pink"], [0.9, "Pink"], [1.01, "Deep pink"]],
  },
  "methyl-orange": {
    name: "Methyl orange",
    low: 3.1,
    high: 4.4,
    acidSide: "Red",
    alkaliSide: "Yellow",
    note: "Red in acid, turns through orange to yellow between pH 3.1 and 4.4.",
    stops: [[0, "#e53935"], [1, "#fbc02d"]],
    names: [[0, "Red"], [0.99, "Orange"], [1.01, "Yellow"]],
  },
  "methyl-red": {
    name: "Methyl red",
    low: 4.4,
    high: 6.2,
    acidSide: "Red",
    alkaliSide: "Yellow",
    note: "Red in acid, turns through orange to yellow between pH 4.4 and 6.2.",
    stops: [[0, "#e53935"], [0.5, "#f08a3c"], [1, "#f9d423"]],
    names: [[0, "Red"], [0.35, "Red-orange"], [0.99, "Orange"], [1.01, "Yellow"]],
  },
  "bromothymol-blue": {
    name: "Bromothymol blue",
    low: 6,
    high: 7.6,
    acidSide: "Yellow",
    alkaliSide: "Blue",
    note: "Yellow in acid, green near neutral, blue in alkali (pH 6.0 to 7.6).",
    stops: [[0, "#f6d63c"], [0.5, "#4caf50"], [1, "#2563eb"]],
    names: [[0, "Yellow"], [0.35, "Yellow-green"], [0.65, "Green"], [0.99, "Blue-green"], [1.01, "Blue"]],
  },
};

export const INDICATOR_IDS = Object.keys(INDICATORS) as IndicatorId[];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const k = Math.min(1, Math.max(0, t));
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function indicatorColour(id: string, ph: number): { hex: string; name: string } {
  const ind = INDICATORS[id as IndicatorId] ?? INDICATORS.phenolphthalein;
  const t = Math.min(1, Math.max(0, (ph - ind.low) / (ind.high - ind.low)));
  let hex = ind.stops[ind.stops.length - 1][1];
  for (let i = 0; i < ind.stops.length - 1; i++) {
    const [t0, c0] = ind.stops[i];
    const [t1, c1] = ind.stops[i + 1];
    if (t <= t1) {
      hex = mix(c0, c1, (t - t0) / Math.max(1e-9, t1 - t0));
      break;
    }
  }
  const name = (ind.names.find(([bound]) => t <= bound) ?? ind.names[ind.names.length - 1])[1];
  return { hex, name };
}

export type IndicatorReport = {
  id: IndicatorId;
  /** Volume at which the colour is half-way through its change, or null if the curve never gets there. */
  endVolume: number | null;
  /** End point minus equivalence volume, in cm³. */
  error: number | null;
  /** How many cm³ of acid the whole colour change is spread over (smaller is sharper). */
  width: number | null;
  /** suitable: sharp and on target. poor: on target but the change is gradual. unsuitable: wrong place. */
  verdict: "suitable" | "poor" | "unsuitable";
  suitable: boolean;
};

/** Volume at which the curve first crosses a given pH, or null if it never does. */
export function crossVolume(level: number, p: TitParams = DEFAULT_PARAMS): number | null {
  const below = titrationPh(0, p) < level; // does the pH start below the level?
  const hit = (v: number) => (below ? titrationPh(v, p) >= level : titrationPh(v, p) <= level);
  if (hit(0)) return 0;
  let prev = 0;
  for (let v = 0.05; v <= BURETTE_ML + 1e-9; v += 0.05) {
    if (hit(v)) {
      let lo = prev;
      let hi = v;
      for (let i = 0; i < 30; i++) {
        const m = (lo + hi) / 2;
        if (hit(m)) hi = m;
        else lo = m;
      }
      return (lo + hi) / 2;
    }
    prev = v;
  }
  return null;
}

/**
 * Is this indicator right for this titration? Two things must hold, and both
 * come straight from the curve:
 *  1. its colour change (middle of its range) happens within 1.5 % of the
 *     equivalence volume, and
 *  2. the whole colour change happens over a small volume (3 % of ve), so you
 *     see a sharp change from one drop to the next. A change spread over up to
 *     6 % still works but is "poor"; anything wider is not suitable.
 */
export function indicatorReport(id: IndicatorId, p: TitParams = DEFAULT_PARAMS): IndicatorReport {
  const ind = INDICATORS[id];
  const ve = equivalenceVolume(p);
  const endVolume = crossVolume((ind.low + ind.high) / 2, p);
  const vLow = crossVolume(ind.low, p);
  const vHigh = crossVolume(ind.high, p);
  const error = endVolume === null ? null : endVolume - ve;
  const width = vLow === null || vHigh === null ? null : Math.abs(vLow - vHigh);
  const onTarget = error !== null && Math.abs(error) <= Math.max(0.1, 0.015 * ve);
  const verdict: IndicatorReport["verdict"] =
    onTarget && width !== null && width <= Math.max(0.3, 0.03 * ve)
      ? "suitable"
      : onTarget && width !== null && width <= Math.max(0.6, 0.06 * ve)
        ? "poor"
        : "unsuitable";
  return { id, endVolume, error, width, verdict, suitable: verdict === "suitable" };
}

/* ------------------------------ Explanations ------------------------------ */

/** What is happening in the flask, in a sentence or two. */
export function explain(added: number, p: TitParams = DEFAULT_PARAMS) {
  const acid = ACIDS[p.acid];
  const base = BASES[p.base];
  const ve = equivalenceVolume(p);
  const stage = stageAt(added, p);
  const mmol = Math.abs(excessMillimoles(added, p));
  const weakA = acid.strength === "Weak acid";
  const weakB = base.strength === "Weak base";
  const total = (p.vB + added).toFixed(1);

  if (added === 0) {
    if (weakB) return `The flask holds ${p.vB} cm³ of ${p.cB} mol/dm³ ${base.formula}, a weak base. It reacts only partly with water, so the pH is lower than for a strong base of the same concentration.`;
    return `The flask holds ${p.vB} cm³ of ${p.cB} mol/dm³ ${base.formula}, a strong base. It is fully ionised, so the pH is high (14 + log ${p.cB}).`;
  }
  if (stage === "alkali") {
    if (weakB) {
      const half = Math.abs(added - ve / 2) < 0.5;
      return half
        ? "Half of the ammonia has been neutralised, so [NH₃] = [NH₄⁺]. This is the half-equivalence point, where pH = pKa of NH₄⁺ (9.25)."
        : "NH₃ and NH₄⁺ now form a buffer, so the pH falls only slowly before the steep drop.";
    }
    return `The acid is neutralising the alkali: H⁺ + OH⁻ → H₂O. About ${mmol.toFixed(2)} mmol of OH⁻ is still left in ${total} cm³, so the solution is still alkaline.`;
  }
  if (stage === "equivalence") {
    return `The base is exactly neutralised, so the flask holds only the salt and water. ${equivalenceNote(p)} Equivalence is at ${ve.toFixed(1)} cm³.`;
  }
  if (weakA) return `All the base is gone. Extra CH₃COOH makes a buffer with CH₃COO⁻, so the pH stays near 4.7 and falls only slowly (${mmol.toFixed(2)} mmol in excess, ${total} cm³ in total).`;
  if (acid.id === "H2SO4") return `All the alkali is gone and ${mmol.toFixed(2)} mmol of acid is in excess in ${total} cm³. The first H⁺ is fully ionised and the second partly, so the solution is acidic.`;
  return `All the alkali is gone and ${mmol.toFixed(2)} mmol of extra H⁺ is left in ${total} cm³, so the solution is acidic.`;
}
