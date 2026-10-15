import scenes from "../specs/SimScenes.module.css";
import { MAX_RHEO, brightnessWord, meters, solveCircuit, type CircuitState } from "../specs/circuit-model";

function Bulb({ x, y, level, blown }: { x: number; y: number; level: number; blown: boolean }) {
  return (
    <g>
      {level > 0 && <circle cx={x} cy={y} r={24 + 30 * level} fill="#fde047" opacity={0.18 + 0.32 * level} />}
      <circle cx={x} cy={y} r={24} fill="#f8fafc" />
      <circle cx={x} cy={y} r={24} fill={blown ? "#d1d5db" : `rgba(253, 224, 71, ${0.12 + 0.88 * level})`} stroke="#64748b" strokeWidth="3" />
      {blown ? (
        <path d={`M${x - 11} ${y + 8} L${x - 3} ${y - 3} M${x + 3} ${y - 3} L${x + 11} ${y + 8}`} stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M${x - 11} ${y + 9} Q${x - 5} ${y - 9} ${x} ${y + 4} Q${x + 5} ${y - 9} ${x + 11} ${y + 9}`} stroke={level > 0 ? "#b45309" : "#94a3b8"} strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      <rect x={x - 11} y={y + 22} width="22" height="9" rx="3" fill="#94a3b8" />
    </g>
  );
}

function Meter({ x, y, letter, value, unit, colour }: { x: number; y: number; letter: string; value: number; unit: string; colour: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="20" fill="#fff" stroke={colour} strokeWidth="3" />
      <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill={colour}>{letter}</text>
      <rect x={x - 32} y={y + 24} width="64" height="22" rx="5" fill="#0f172a" />
      <text x={x} y={y + 40} textAnchor="middle" fontSize="13" fontWeight="700" fill="#4ade80">{value.toFixed(2)} {unit}</text>
    </g>
  );
}

/** Battery, switch, rheostat, bulbs, an ammeter in the main line and a voltmeter across the bulbs. */
export default function CircuitApparatus({ state }: { state: CircuitState }) {
  const r = solveCircuit(state);
  const m = meters(state);
  const { cells, bulbs, closed } = state;
  const live = r.flowing;
  const wire = live ? "#2563eb" : "#64748b";
  const rheo = state.rheo ?? 0;

  const top = 100;
  const bot = 320;
  const batH = cells * 30;
  const mid = (top + bot) / 2;
  const batTop = mid - batH / 2;

  const seriesXs = Array.from({ length: bulbs }, (_, i) => 330 + ((i + 0.5) * 260) / bulbs);
  const parXs = Array.from({ length: bulbs }, (_, i) => 360 + i * 90);
  const rightX = r.series ? 610 : parXs[parXs.length - 1] + 45;
  const loop = r.series ? `M60 ${bot} V${top} H${rightX} V${bot} H60` : `M60 ${bot} V${top} H${rightX} M60 ${bot} H${rightX}`;
  const flowSeconds = Math.max(0.35, 1.6 - r.totalAmps * 0.9);
  const vx = r.series ? (seriesXs[0] + seriesXs[seriesXs.length - 1]) / 2 : (parXs[0] + parXs[parXs.length - 1]) / 2;
  const leftLead = r.series ? seriesXs[0] - 40 : parXs[0] - 35;
  const rheoFrac = rheo / MAX_RHEO;

  return (
    <svg viewBox="0 0 660 400" role="img" aria-label={`Circuit with ${cells} cells and ${bulbs} bulb${bulbs > 1 ? "s" : ""} in ${r.series ? "series" : "parallel"}. Ammeter ${m.amps.toFixed(2)} amperes, voltmeter ${m.volts.toFixed(2)} volts.`} style={{ width: "100%", height: "100%", display: "block" }}>
      <path d={loop} fill="none" stroke={wire} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {!r.series && parXs.map((x) => <path key={x} d={`M${x} ${top} V${bot}`} stroke={wire} strokeWidth="5" />)}
      {live && <path d={loop} fill="none" stroke="#facc15" strokeWidth="3" strokeLinecap="round" className={scenes.flow} style={{ animationDuration: `${flowSeconds}s` }} />}
      {live && !r.series && parXs.map((x) => <path key={x} d={`M${x} ${top} V${bot}`} stroke="#facc15" strokeWidth="3" className={scenes.flow} style={{ animationDuration: `${flowSeconds * 1.4}s` }} />)}

      {/* battery */}
      <rect x="38" y={batTop - 6} width="44" height={batH + 12} fill="#e8f1fd" />
      {Array.from({ length: cells }, (_, i) => {
        const y = batTop + i * 30 + 6;
        return (
          <g key={i}>
            <line x1="40" x2="80" y1={y} y2={y} stroke="#0b1f4a" strokeWidth="3" />
            <line x1="50" x2="70" y1={y + 11} y2={y + 11} stroke="#0b1f4a" strokeWidth="8" />
          </g>
        );
      })}
      <text x="90" y={batTop + 8} fontSize="18" fontWeight="700" fill="#0b1f4a">+</text>
      <text x="90" y={batTop + batH + 4} fontSize="22" fontWeight="700" fill="#0b1f4a">−</text>
      <text x="14" y="372" fontSize="13" fill="#475569">Battery {r.volts.toFixed(1)} V · terminal {r.terminal.toFixed(2)} V</text>

      {/* switch */}
      <rect x="130" y={top - 12} width="76" height="24" fill="#e8f1fd" />
      <circle cx="140" cy={top} r="6" fill="#0b1f4a" />
      <circle cx="196" cy={top} r="6" fill="#0b1f4a" />
      <line x1="140" y1={top} x2={closed ? 196 : 186} y2={closed ? top : top - 32} stroke="#0b1f4a" strokeWidth="5" strokeLinecap="round" />
      <text x="146" y={top + 28} fontSize="13" fill="#475569">Switch</text>

      {/* rheostat on the bottom wire */}
      <rect x="130" y={bot - 14} width="120" height="28" fill="#e8f1fd" />
      <path d={`M135 ${bot} l8 -10 l10 20 l10 -20 l10 20 l10 -20 l10 20 l10 -20 l10 20 l10 -20 l10 20 l8 -10`} fill="none" stroke="#0b1f4a" strokeWidth="3" strokeLinejoin="round" />
      <path d={`M${140 + rheoFrac * 100} ${bot - 40} V${bot - 12} m-6 0 h12`} stroke="#b45309" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="190" y={bot + 34} textAnchor="middle" fontSize="13" fill="#475569">Rheostat {rheo.toFixed(1)} Ω</text>

      {/* ammeter on the bottom wire */}
      <rect x="270" y={bot - 22} width="44" height="44" fill="#e8f1fd" />
      <Meter x={292} y={bot} letter="A" value={m.amps} unit="A" colour="#b91c1c" />

      {/* bulbs */}
      {(r.series ? seriesXs : parXs).map((x, i) => (
        <Bulb key={i} x={x} y={r.series ? top : mid} level={r.brightness} blown={r.blown} />
      ))}

      {/* voltmeter across the bulbs */}
      <path d={r.series ? `M${leftLead} ${top} V52 H${vx - 20} M${seriesXs[seriesXs.length - 1] + 40} ${top} V52 H${vx + 20}` : `M${leftLead} ${top} V52 H${vx - 20} M${vx + 20} 52 H${rightX + 30} V${bot} H${rightX}`} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="5 4" />
      <Meter x={vx} y={34} letter="V" value={m.volts} unit="V" colour="#7c3aed" />
      <text x={r.series ? 640 : rightX + 18} y="16" textAnchor="end" fontSize="13" fontWeight="700" fill={r.blown ? "#b91c1c" : "#0b1f4a"}>{brightnessWord(r.brightness, r.blown, closed)}</text>
    </svg>
  );
}
