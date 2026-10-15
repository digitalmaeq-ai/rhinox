import { defineSim } from "../types";

type BridgeState = { design: string; material: string; span: number; load: number };

export const DESIGNS: Record<string, { name: string; strength: number }> = {
  beam: { name: "Beam", strength: 12 },
  arch: { name: "Arch", strength: 30 },
  truss: { name: "Truss", strength: 40 },
  suspension: { name: "Suspension", strength: 55 },
};
export const MATERIALS: Record<string, { name: string; factor: number }> = {
  wood: { name: "Wood", factor: 0.5 },
  concrete: { name: "Concrete", factor: 1 },
  steel: { name: "Steel", factor: 1.5 },
};

export function capacity(s: BridgeState) {
  const cap = (DESIGNS[s.design].strength * MATERIALS[s.material].factor * Math.pow(30 / s.span, 1.5));
  return { cap, holds: s.load <= cap, ratio: s.load / cap };
}

function Scene({ state }: { state: BridgeState }) {
  const { holds, ratio } = capacity(state);
  const left = 90;
  const right = 570;
  const deck = 220;
  const mid = (left + right) / 2;
  const sag = holds ? Math.min(ratio, 1) * 14 : 70;
  const col = MATERIALS[state.material].name === "Wood" ? "#a16207" : state.material === "steel" ? "#475569" : "#9ca3af";
  const structure = (() => {
    switch (state.design) {
      case "arch":
        return <path d={`M${left} 290 Q${mid} 100 ${right} 290`} fill="none" stroke={col} strokeWidth="14" />;
      case "truss":
        return (
          <g stroke={col} strokeWidth="6" fill="none">
            <path d={`M${left} ${deck} V150 H${right} V${deck}`} />
            {Array.from({ length: 8 }, (_, i) => {
              const x = left + (i * (right - left)) / 8;
              const x2 = left + ((i + 1) * (right - left)) / 8;
              return <path key={i} d={`M${x} ${deck} L${i % 2 ? x : x2} 150 M${x} 150 L${x2} ${deck}`} />;
            })}
          </g>
        );
      case "suspension":
        return (
          <g stroke={col} strokeWidth="6" fill="none">
            <path d={`M${left + 60} ${deck} V90 M${right - 60} ${deck} V90`} strokeWidth="12" />
            <path d={`M${left - 10} ${deck - 6} Q${mid} 200 ${right + 10} ${deck - 6}`} opacity="0" />
            <path d={`M${left - 10} ${deck - 10} L${left + 60} 90 Q${mid} 230 ${right - 60} 90 L${right + 10} ${deck - 10}`} />
            {Array.from({ length: 7 }, (_, i) => {
              const x = left + 100 + (i * (right - left - 200)) / 6;
              return <path key={i} d={`M${x} ${deck} V${150 + Math.abs(x - mid) * 0.2 + 20 - 18}`} strokeWidth="2" />;
            })}
          </g>
        );
      default:
        return null;
    }
  })();

  return (
    <svg viewBox="0 0 660 360" aria-hidden="true">
      <rect y="290" width="660" height="70" fill="#38bdf8" />
      <rect x="0" y={deck} width={left} height="150" fill="#86c98b" />
      <rect x={right} y={deck} width={660 - left} height="150" fill="#86c98b" />
      {holds ? (
        <path d={`M${left} ${deck} Q${mid} ${deck + sag * 2} ${right} ${deck}`} fill="none" stroke={col} strokeWidth="14" />
      ) : (
        <g stroke={col} strokeWidth="14" strokeLinecap="round">
          <path d={`M${left} ${deck} L${mid - 30} ${deck + sag}`} />
          <path d={`M${right} ${deck} L${mid + 30} ${deck + sag + 20}`} />
        </g>
      )}
      {structure}
      {/* load */}
      <g transform={`translate(${holds ? mid - 40 : mid - 10} ${holds ? deck - 40 + sag : deck + 10 + sag})`}>
        <rect width="80" height="30" rx="4" fill="#dc2626" />
        <text x="40" y="20" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">{state.load} t</text>
        <circle cx="16" cy="34" r="7" fill="#0b1f4a" />
        <circle cx="64" cy="34" r="7" fill="#0b1f4a" />
      </g>
      <text x="20" y="32" fontSize="15" fontWeight="700" fill="#0b1f4a">{DESIGNS[state.design].name} bridge · {MATERIALS[state.material].name} · {state.span} m span</text>
      {!holds && <text x="330" y="70" textAnchor="middle" fontSize="22" fontWeight="800" fill="#b91c1c">The bridge has collapsed!</text>}
    </svg>
  );
}

export const bridgeBuilder = defineSim<BridgeState>({
  init: { design: "beam", material: "concrete", span: 30, load: 5 },
  controls: [
    { type: "choice", key: "design", label: "Bridge design", options: Object.entries(DESIGNS).map(([value, v]) => ({ value, label: v.name })) },
    { type: "choice", key: "material", label: "Material", options: Object.entries(MATERIALS).map(([value, v]) => ({ value, label: v.name })) },
    { type: "slider", key: "span", label: "Span across the river", min: 10, max: 60, step: 5, unit: "m" },
    { type: "slider", key: "load", label: "Load on the bridge", min: 0, max: 80, step: 5, unit: "tonnes" },
  ],
  Scene,
  sceneLabel: "A bridge across a river carrying a lorry. The bridge collapses if the load is more than it can take.",
  readings: (s) => {
    const c = capacity(s);
    return [
      { label: "Strength (maximum load)", value: `${c.cap.toFixed(0)} tonnes` },
      { label: "Load on the bridge", value: `${s.load} tonnes` },
      { label: "Result", value: c.holds ? (c.ratio > 0.8 ? "Holds, but near its limit" : "Safe") : "Collapses", tone: c.holds ? (c.ratio > 0.8 ? "warn" : "good") : "warn" },
    ];
  },
  hint: (s) => {
    const c = capacity(s);
    if (!c.holds) return "The load is greater than the bridge's strength. Try a stronger design or material, a shorter span, or a smaller load.";
    if (s.design === "beam") return "A simple beam bends under load, so it is only suitable for short spans.";
    if (s.design === "arch") return "The arch turns the load into compression, pushing outwards and down into the supports.";
    if (s.design === "truss") return "Triangles are rigid shapes, so a truss spreads the load through many small members.";
    return "Suspension bridges hang the deck from cables in tension, making very long spans possible.";
  },
  checks: {
    "safe-bridge": (s) => capacity(s).holds && s.load >= 20,
    "beam-fails": (s) => s.design === "beam" && !capacity(s).holds,
    "long-span": (s) => s.span >= 50 && s.load >= 10 && capacity(s).holds,
    "heavy-load": (s) => s.load >= 50 && capacity(s).holds,
  },
});
