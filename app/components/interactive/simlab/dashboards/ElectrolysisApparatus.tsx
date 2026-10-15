import scenes from "../specs/SimScenes.module.css";
import { ELECTROLYTES, electrolyteOf, outcome, type CellState } from "../specs/electrolysis-chem";

/** Gas collected is drawn on a tube that reads 0 to GAS_FULL cm³. */
const GAS_FULL = 200;

/**
 * The electrolysis cell: power supply and ammeter, a beaker with two
 * electrodes, inverted tubes that collect gas, and a coating that builds on
 * the cathode (or an anode that wears away).
 */
export default function ElectrolysisApparatus({ state, compact = false }: { state: CellState; compact?: boolean }) {
  const o = outcome(state);
  const liquid = ELECTROLYTES[electrolyteOf(state.electrolyte)];
  const copperLiquid = electrolyteOf(state.electrolyte) === "copper";
  // The blue of copper(II) sulfate fades while copper is being removed and not replaced.
  const fade = copperLiquid && !o.copperElectrodes ? Math.min(0.65, o.coulombs / 8000) : 0;
  const gasAtCathode = o.cathode.kind === "gas";
  const gasAtAnode = o.anode.kind === "gas";
  const cathodeFill = gasAtCathode ? Math.min(1, o.cathodeAmount / GAS_FULL) : 0;
  const anodeFill = gasAtAnode ? Math.min(1, o.anodeAmount / GAS_FULL) : 0;
  const coating = o.cathode.kind === "metal" && o.cathodeAmount > 0 ? Math.min(14, 2.5 + o.cathodeAmount * 12) : 0;
  const wear = o.anode.kind === "dissolves" ? Math.min(8, o.anodeAmount * 12) : 0;
  const metalColour = o.cathode.name === "Silver" ? "#cbd5e1" : "#d97706";
  const electrodeColour = o.copperElectrodes ? "#c2410c" : "#334155";
  const bubbles = o.on ? Math.max(3, Math.min(9, Math.round(state.current * 3))) : 0;

  const tubeTop = 118;
  const tubeH = 130;
  const tube = (cx: number, fill: number, gas: string, show: boolean, side: "left" | "right") => show && (
    <g aria-hidden="true">
      <rect x={cx - 22} y={tubeTop} width="44" height={tubeH} rx="4" fill="#f4f9ff" fillOpacity="0.92" stroke="#64748b" strokeWidth="2.5" />
      <rect x={cx - 20} y={tubeTop + 2} width="40" height={Math.max(0, fill * (tubeH - 4))} fill="#bae6fd" fillOpacity="0.9" />
      <text x={cx + (side === "left" ? -30 : 30)} y={tubeTop + 16} textAnchor={side === "left" ? "end" : "start"} fontSize="13" fontWeight="700" fill="#0b1f4a">{gas}</text>
    </g>
  );

  return (
    <svg viewBox="0 0 660 380" role="img" aria-label="An electrolysis cell: a beaker with two electrodes connected to a power supply and ammeter." style={{ width: "100%", height: "100%", display: "block" }}>
      {/* supply and ammeter */}
      <rect x="170" y="14" width="190" height="40" rx="8" fill="#e8f1fd" stroke="#64748b" strokeWidth="3" />
      <text x="265" y="39" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0b1f4a">Supply · {state.voltage} V</text>
      <circle cx="430" cy="34" r="22" fill="#fff" stroke="#64748b" strokeWidth="3" />
      <text x="430" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0b1f4a">A</text>
      <text x="430" y="46" textAnchor="middle" fontSize="11" fill="#475569">{o.on ? state.current.toFixed(1) : "0.0"}</text>
      <path d="M205 54 V160 M360 34 H408 M452 34 H475 V160" fill="none" stroke="#475569" strokeWidth="4" strokeLinejoin="round" />

      {/* beaker and liquid */}
      <path d="M150 150 L160 330 Q161 352 183 352 H497 Q519 352 520 330 L530 150 Z" fill={liquid.colour} stroke="none" />
      {copperLiquid && <path d="M150 150 L160 330 Q161 352 183 352 H497 Q519 352 520 330 L530 150 Z" fill="#7dd3fc" opacity={0.75 * (1 - fade / 0.65 * 0.85)} style={{ transition: "opacity .4s" }} />}
      <path d="M142 112 L152 330 Q153 360 183 360 H497 Q527 360 528 330 L538 112" fill="none" stroke="#64748b" strokeWidth="4" strokeLinejoin="round" />

      {/* electrodes */}
      <rect x={205 - Math.max(6, 14 - wear) / 2} y="160" width={Math.max(6, 14 - wear)} height="150" rx="3" fill={electrodeColour} />
      <rect x="468" y="160" width="14" height="150" rx="3" fill={electrodeColour} />
      {coating > 0 && <rect x="482" y="160" width={coating} height="150" rx="2" fill={metalColour} />}
      <text x="205" y="338" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0b1f4a">Anode (+)</text>
      <text x="475" y="338" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0b1f4a">Cathode (−)</text>

      {tube(205, anodeFill, o.anode.formula, gasAtAnode && o.on, "left")}
      {tube(475, cathodeFill, o.cathode.formula, gasAtCathode && o.on, "right")}

      {/* bubbles */}
      {gasAtAnode && Array.from({ length: bubbles }, (_, i) => (
        <circle key={`a${i}`} className={scenes.bubble} cx={196 + (i % 4) * 7} cy="300" r="4" fill="#fff" stroke="#7dd3fc" strokeWidth="1.5" style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
      {gasAtCathode && Array.from({ length: bubbles * 2 }, (_, i) => (
        <circle key={`c${i}`} className={scenes.bubble} cx={466 + (i % 4) * 7} cy="300" r="3.5" fill="#fff" stroke="#7dd3fc" strokeWidth="1.5" style={{ animationDelay: `${i * 0.22}s` }} />
      ))}

      {!compact && <text x="340" y="374" textAnchor="middle" fontSize="13" fill="#475569">{liquid.name}</text>}
    </svg>
  );
}
