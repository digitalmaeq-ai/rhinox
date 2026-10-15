// The model behind the acids and bases lab: each liquid has a pH, indicators
// change colour over a pH range, and diluting moves the pH toward 7 (a strong
// acid or alkali by one unit per tenfold dilution, a weak one by less).
// Pure functions.

export type Liquid = { name: string; ph: number; strong: boolean; note: string };

export const SAMPLES: Record<string, Liquid> = {
  hcl: { name: "Dilute hydrochloric acid", ph: 1, strong: true, note: "A strong acid: it is fully split into ions in water." },
  cola: { name: "Cola drink", ph: 2.5, strong: false, note: "Contains phosphoric and carbonic acids." },
  lime: { name: "Lime juice", ph: 2.2, strong: false, note: "Contains citric acid." },
  vinegar: { name: "Vinegar", ph: 2.9, strong: false, note: "Contains ethanoic (acetic) acid, a weak acid." },
  milk: { name: "Milk", ph: 6.5, strong: false, note: "Very slightly acidic because of lactic acid." },
  water: { name: "Pure water", ph: 7, strong: false, note: "Neutral: equal amounts of H⁺ and OH⁻ ions." },
  soda: { name: "Baking soda solution", ph: 8.3, strong: false, note: "Sodium hydrogencarbonate, a weak alkali." },
  soap: { name: "Soap solution", ph: 10, strong: false, note: "Soaps are made with alkalis." },
  antacid: { name: "Milk of magnesia", ph: 10.5, strong: false, note: "An antacid: magnesium hydroxide that neutralises stomach acid." },
  ammonia: { name: "Ammonia solution", ph: 11.5, strong: false, note: "A weak alkali used in cleaners." },
  bleach: { name: "Bleach", ph: 12.5, strong: false, note: "Strongly alkaline and corrosive." },
  naoh: { name: "Dilute sodium hydroxide", ph: 13, strong: true, note: "A strong alkali: it is fully split into ions in water." },
};

export const SAMPLE_IDS = Object.keys(SAMPLES);
export const MAX_DILUTION = 4;

export type IndicatorId = "none" | "litmus" | "methyl" | "universal" | "phenolphthalein" | "meter";

export const INDICATORS: { id: IndicatorId; label: string; short: string }[] = [
  { id: "none", label: "None", short: "No indicator" },
  { id: "litmus", label: "Litmus", short: "Litmus" },
  { id: "methyl", label: "Methyl orange", short: "Methyl orange" },
  { id: "universal", label: "Universal indicator", short: "Universal indicator" },
  { id: "phenolphthalein", label: "Phenolphthalein", short: "Phenolphthalein" },
  { id: "meter", label: "pH meter", short: "pH meter" },
];

export type AcidState = {
  sample: string;
  indicator: string;
  added: boolean;
  dilution: number;
  label?: string;
};

export function liquidOf(id: string): Liquid {
  return SAMPLES[id] ?? SAMPLES.water;
}

/** pH after diluting tenfold `dilution` times. */
export function effectivePh(sample: string, dilution: number): number {
  const l = liquidOf(sample);
  const step = l.strong ? 1 : 0.5;
  if (l.ph < 7) return Math.min(l.ph + dilution * step, Math.max(l.ph, 6.9));
  if (l.ph > 7) return Math.max(l.ph - dilution * step, Math.min(l.ph, 7.1));
  return 7;
}

const UNIVERSAL: [number, string][] = [
  [0, "#dc2626"], [3, "#f97316"], [5, "#facc15"], [7, "#22c55e"], [9, "#06b6d4"], [11, "#3b5bdb"], [14, "#7c3aed"],
];

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, t))));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function universalColour(ph: number) {
  for (let i = 1; i < UNIVERSAL.length; i++) {
    const [p1, c1] = UNIVERSAL[i];
    const [p0, c0] = UNIVERSAL[i - 1];
    if (ph <= p1) return mix(c0, c1, (ph - p0) / (p1 - p0));
  }
  return UNIVERSAL[UNIVERSAL.length - 1][1];
}

const CLEAR = "#dcebfa";

/** Colour of the liquid for an indicator at a given pH. */
export function colourAt(indicator: string, ph: number): string {
  switch (indicator) {
    case "litmus":
      return ph <= 5 ? "#e5484d" : ph >= 8 ? "#3b6fe0" : ph < 6.5 ? mix("#e5484d", "#8e6bd0", (ph - 5) / 1.5) : mix("#8e6bd0", "#3b6fe0", (ph - 6.5) / 1.5);
    case "methyl":
      return ph <= 3.1 ? "#dc2626" : ph >= 4.4 ? "#facc15" : mix("#dc2626", "#f59e0b", (ph - 3.1) / 1.3);
    case "universal":
      return universalColour(ph);
    case "phenolphthalein":
      return ph <= 8.2 ? CLEAR : ph >= 10 ? "#e0489a" : mix("#f3dff0", "#e0489a", (ph - 8.2) / 1.8);
    default:
      return CLEAR;
  }
}

/** Plain-words colour for the record table and the readout. */
export function colourName(indicator: string, ph: number): string {
  switch (indicator) {
    case "litmus":
      return ph <= 5 ? "red" : ph >= 8 ? "blue" : "purple";
    case "methyl":
      return ph <= 3.1 ? "red" : ph >= 4.4 ? "yellow" : "orange";
    case "universal":
      return ph < 2 ? "red" : ph < 4 ? "orange-red" : ph < 5.5 ? "orange-yellow" : ph < 6.5 ? "yellow-green" : ph <= 7.5 ? "green" : ph < 9 ? "blue-green" : ph < 11 ? "blue" : ph < 13 ? "dark blue" : "purple";
    case "phenolphthalein":
      return ph <= 8.2 ? "colourless" : ph >= 10 ? "pink" : "pale pink";
    default:
      return "no change";
  }
}

export type Kind = "acidic" | "neutral" | "alkaline";

export type Reading = {
  ph: number;
  kind: Kind;
  /** An indicator has been added (or the probe dipped). */
  tested: boolean;
  colour: string;
  colourWord: string;
  /** What the learner can conclude from this indicator. */
  conclusion: string;
  /** The pH the learner can read from it, if any. */
  readPh: string | null;
};

export function kindOf(ph: number): Kind {
  return ph < 6.5 ? "acidic" : ph > 7.5 ? "alkaline" : "neutral";
}

export function observe(s: AcidState): Reading {
  const ph = effectivePh(s.sample, Number(s.dilution) || 0);
  const kind = kindOf(ph);
  const base = { ph, kind };
  if (s.indicator === "none" || !s.added) {
    return { ...base, tested: false, colour: s.indicator === "meter" ? CLEAR : CLEAR, colourWord: "no change", conclusion: s.indicator === "none" ? "The liquid looks the same whatever it is. Choose an indicator." : s.indicator === "meter" ? "Dip the probe in the liquid." : "Add the indicator to the liquid.", readPh: null };
  }
  const colour = colourAt(s.indicator, ph);
  const colourWord = colourName(s.indicator, ph);
  let conclusion = "";
  let readPh: string | null = null;
  switch (s.indicator) {
    case "litmus":
      conclusion = ph <= 5 ? "Red: an acid (pH below 5)." : ph >= 8 ? "Blue: an alkali (pH above 8)." : "Purple: nearly neutral (pH about 5 to 8).";
      break;
    case "methyl":
      conclusion = ph <= 3.1 ? "Red: pH below 3.1, a fairly strong acid." : ph >= 4.4 ? "Yellow: pH above 4.4, so not a strong acid." : "Orange: pH about 3.1 to 4.4.";
      break;
    case "universal":
      readPh = `about ${Math.round(ph)}`;
      conclusion = `${colourWord[0].toUpperCase()}${colourWord.slice(1)}: pH about ${Math.round(ph)} (${kind}).`;
      break;
    case "phenolphthalein":
      conclusion = ph >= 10 ? "Pink: an alkali (pH above 10)." : ph > 8.2 ? "Pale pink: pH just above 8.2." : "Colourless: acid, neutral, or only a very weak alkali.";
      break;
    case "meter":
      readPh = ph.toFixed(1);
      conclusion = `The probe reads pH ${ph.toFixed(1)} (${kind}).`;
      break;
  }
  return { ...base, tested: true, colour: s.indicator === "meter" ? CLEAR : colour, colourWord, conclusion, readPh };
}

/** Compatibility for the 3D scene. */
export function liquidColour(s: AcidState): string {
  return observe(s).colour;
}

/** Ten times as many H⁺ ions for every unit down the pH scale. */
export function hydrogenIon(ph: number): string {
  const exp = -ph;
  const e = Math.floor(exp);
  const m = Math.pow(10, exp - e);
  return `${m.toFixed(m >= 9.95 ? 0 : 1)} × 10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)])}`;
}
