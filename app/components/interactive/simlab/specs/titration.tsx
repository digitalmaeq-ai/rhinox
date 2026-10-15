import { defineSim } from "../types";
import TitrationDashboard from "../dashboards/TitrationDashboard";
import {
  ACIDS,
  BASES,
  BURETTE_ML,
  DEFAULT_PARAMS,
  INDICATORS,
  INDICATOR_IDS,
  STAGE_LABEL,
  equation,
  equivalenceVolume,
  indicatorColour,
  paramsOf,
  stageAt,
  titrationPh as phFor,
  type IndicatorId,
  type TitParams,
} from "./titration-chem";

type TitState = { start: number; added: number; indicator: string; acid: string; base: string; cA: number; cB: number; vB: number };

// Re-exported so the 3D scene and the dashboard share the same calculation.
export function titrationPh(added: number, p: TitParams = DEFAULT_PARAMS) {
  return phFor(added, p);
}

export function flaskColour(s: { added: number; indicator: string; acid?: string; base?: string; cA?: number; cB?: number; vB?: number }) {
  const p = paramsOf(s as unknown as Record<string, number>);
  return indicatorColour(s.indicator, phFor(s.added, p)).hex;
}

// A simple 2D picture for Cinematic and Classroom modes: the acid burette
// above the flask of base, beside the pH curve (which FALLS as acid is added).
function Scene({ state }: { state: TitState }) {
  const p = paramsOf(state);
  const ph = phFor(state.added, p);
  const ve = equivalenceVolume(p);
  const level = BURETTE_ML - state.start - state.added;
  const gx = (v: number) => 400 + (v / BURETTE_ML) * 230;
  const gy = (pp: number) => 290 - (pp / 14) * 200;
  const curve = Array.from({ length: 101 }, (_, i) => {
    const v = i * 0.5;
    return `${i === 0 ? "M" : "L"}${gx(v).toFixed(1)} ${gy(phFor(v, p)).toFixed(1)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 660 360" aria-hidden="true">
      {/* burette of acid */}
      <rect x="80" y="20" width="28" height="220" rx="4" fill="#fff" stroke="#64748b" strokeWidth="3" />
      <rect x="82" y={20 + ((BURETTE_ML - level) / BURETTE_ML) * 216 + 2} width="24" height={Math.max(0, (level / BURETTE_ML) * 216)} fill="#fca5a5" />
      <path d="M86 240 H102 L98 262 H90 Z" fill="#94a3b8" />
      {state.added > 0 && <circle cx="94" cy="272" r="3" fill="#f87171" />}
      <text x="94" y="14" textAnchor="middle" fontSize="12" fill="#475569">{ACIDS[p.acid].formula}</text>
      {/* flask of base + indicator */}
      <path d="M62 295 L82 330 H112 L132 295 L108 280 V262 H86 V280 Z" fill={flaskColour(state)} stroke="#64748b" strokeWidth="3" strokeLinejoin="round" style={{ transition: "fill .4s" }} />
      <text x="94" y="352" textAnchor="middle" fontSize="12" fill="#475569">{BASES[p.base].formula} + indicator</text>
      {/* graph */}
      <line x1="400" y1="90" x2="400" y2="290" stroke="#64748b" strokeWidth="2" />
      <line x1="400" y1="290" x2="630" y2="290" stroke="#64748b" strokeWidth="2" />
      <text x="392" y="94" textAnchor="end" fontSize="12" fill="#475569">14</text>
      <text x="392" y="294" textAnchor="end" fontSize="12" fill="#475569">0</text>
      <text x="392" y={gy(7) + 4} textAnchor="end" fontSize="12" fill="#475569">7</text>
      <text x="515" y="332" textAnchor="middle" fontSize="13" fill="#475569">Volume of {ACIDS[p.acid].formula} added (cm³)</text>
      <text x="400" y="306" textAnchor="middle" fontSize="12" fill="#475569">0</text>
      <text x={gx(ve)} y="306" textAnchor="middle" fontSize="12" fill="#475569">{ve.toFixed(1)}</text>
      <text x="630" y="306" textAnchor="middle" fontSize="12" fill="#475569">{BURETTE_ML}</text>
      <line x1={gx(ve)} x2={gx(ve)} y1="90" y2="290" stroke="#94a3b8" strokeDasharray="4 5" />
      <path d={curve} fill="none" stroke="#2563eb" strokeWidth="3" />
      <circle cx={gx(state.added)} cy={gy(ph)} r="7" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
      <text x="515" y="60" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0b1f4a">pH during the titration</text>
    </svg>
  );
}

export const titration = defineSim<TitState>({
  init: { start: 0, added: 0, indicator: "methyl-orange", acid: "HCl", base: "NaOH", cA: 0.1, cB: 0.1, vB: 25 },
  controls: [
    { type: "slider", key: "added", label: "Acid added from the burette", min: 0, max: BURETTE_ML, step: 0.05, unit: "cm³" },
    {
      type: "choice",
      key: "indicator",
      label: "Indicator in the flask",
      options: INDICATOR_IDS.map((id) => ({ value: id, label: INDICATORS[id].name })),
    },
  ],
  Scene,
  Dashboard: TitrationDashboard,
  sceneLabel: "A burette of acid above a flask of alkali with indicator, beside a graph of pH against volume of acid added.",
  readings: (s) => {
    const p = paramsOf(s);
    const ph = phFor(s.added, p);
    const stage = stageAt(s.added, p);
    const colour = indicatorColour(s.indicator, ph);
    return [
      { label: "Volume added", value: `${s.added.toFixed(2)} cm³` },
      { label: "pH of the flask", value: ph.toFixed(2) },
      { label: "Flask contains", value: STAGE_LABEL[stage], tone: stage === "equivalence" ? "good" : "info" },
      { label: "Indicator colour", value: colour.name },
    ];
  },
  hint: (s) => {
    const p = paramsOf(s);
    const ve = equivalenceVolume(p);
    const ind = INDICATORS[s.indicator as IndicatorId] ?? INDICATORS["methyl-orange"];
    if (s.added === 0) return `The flask holds ${p.vB} cm³ of ${p.cB} mol/dm³ ${BASES[p.base].name.toLowerCase()}. Add ${p.cA} mol/dm³ ${ACIDS[p.acid].name.toLowerCase()} (${equation(p)}) a little at a time. ${ind.note}`;
    if (s.added < ve - 3) return "Plenty of alkali is still left, so the pH falls slowly. Keep adding.";
    if (s.added < ve - 0.05) return "Nearly there: the pH is about to drop sharply. In a real titration you add drop by drop here.";
    if (Math.abs(s.added - ve) < 0.05) return `Exactly ${ve.toFixed(1)} cm³: the alkali is neutralised and the pH is ${phFor(s.added, p).toFixed(2)}. The indicator changes just after this point, which is why the end point and equivalence point are close but not identical.`;
    return "You have gone past the equivalence point. Excess acid makes the pH keep falling.";
  },
  checks: {
    "start-adding": (s) => s.added >= 10,
    // The end point: methyl orange has just turned from yellow to orange, and you stopped close to equivalence.
    "end-point": (s) => {
      const p = paramsOf(s);
      return s.indicator === "methyl-orange" && phFor(s.added, p) <= 4.4 && s.added <= equivalenceVolume(p) + 0.6;
    },
    // Phenolphthalein: the pink has faded to colourless.
    "second-indicator": (s) => s.indicator === "phenolphthalein" && phFor(s.added, paramsOf(s)) <= 8.2,
    overshoot: (s) => s.added >= equivalenceVolume(paramsOf(s)) + 10,
  },
});
