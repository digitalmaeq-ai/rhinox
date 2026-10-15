import { defineSim } from "../types";

type EarthState = { view: string; depth: number; boundary: string; time: number };

export const LAYERS = [
  { name: "Crust", from: 0, to: 35, colour: "#a16207", state: "Solid rock" },
  { name: "Mantle", from: 35, to: 2890, colour: "#ea580c", state: "Hot, slowly flowing rock" },
  { name: "Outer core", from: 2890, to: 5150, colour: "#f59e0b", state: "Liquid iron and nickel" },
  { name: "Inner core", from: 5150, to: 6371, colour: "#fde047", state: "Solid iron and nickel" },
];
const TEMPS: [number, number][] = [[0, 15], [35, 900], [2890, 3700], [5150, 5000], [6371, 5400]];

export function layerAt(depth: number) {
  return LAYERS.find((l) => depth < l.to) ?? LAYERS[3];
}

function tempAt(depth: number) {
  for (let i = 1; i < TEMPS.length; i++) {
    if (depth <= TEMPS[i][0]) {
      const [d0, t0] = TEMPS[i - 1];
      const [d1, t1] = TEMPS[i];
      return Math.round(t0 + ((t1 - t0) * (depth - d0)) / (d1 - d0));
    }
  }
  return 5400;
}

function Layers({ depth }: { depth: number }) {
  const cx = 330;
  const cy = 190;
  const R = 150;
  const r = (km: number) => R * (1 - km / 6371);
  const markerR = r(depth);
  return (
    <g>
      {[...LAYERS].reverse().map((l) => (
        <circle key={l.name} cx={cx} cy={cy} r={r(l.from)} fill={l.colour} stroke="#fff" strokeWidth="2" />
      ))}
      <circle cx={cx} cy={cy} r={r(35) + 1} fill="none" stroke="#7c2d12" strokeWidth="1" />
      {LAYERS.map((l, i) => (
        <text key={l.name} x={cx} y={cy - r((l.from + l.to) / 2) + 5} textAnchor="middle" fontSize={i === 0 ? 0 : 13} fontWeight="700" fill="#431407">{l.name}</text>
      ))}
      <line x1={cx} y1={cy} x2={cx} y2={cy - R} stroke="#0b1f4a" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx={cx} cy={cy - markerR} r="8" fill="#0b1f4a" stroke="#fff" strokeWidth="3" />
      <text x={cx + 170} y={cy - markerR + 5} fontSize="14" fontWeight="700" fill="#0b1f4a">{depth.toLocaleString()} km deep</text>
      <path d={`M${cx + 160} ${cy - markerR} H${cx + 16}`} stroke="#0b1f4a" strokeDasharray="3 4" />
      <text x="20" y="28" fontSize="13" fill="#475569">Crust is only about 35 km thick, too thin to show clearly</text>
    </g>
  );
}

function Plates({ boundary, time }: { boundary: string; time: number }) {
  const m = 330;
  if (boundary === "divergent") {
    const g = time * 1.4;
    return (
      <g>
        <rect x="0" y="150" width="660" height="210" fill="#ea580c" />
        <rect x="0" y="110" width={m - g} height="46" fill="#a16207" />
        <rect x={m + g} y="110" width={660 - m - g} height="46" fill="#a16207" />
        <rect x={m - g} y="124" width={2 * g} height="32" fill="#4d2f0a" />
        <path d={`M${m - 12} 150 C${m - 8} 120 ${m + 8} 120 ${m + 12} 150 Z`} fill="#f97316" />
        <path d="M200 180 L120 180 M120 180 l12 -10 M120 180 l12 10 M460 180 H540 M540 180 l-12 -10 M540 180 l-12 10" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <text x="20" y="32" fontSize="15" fontWeight="700" fill="#0b1f4a">Divergent: plates pull apart, new crust forms</text>
        <text x="330" y="260" textAnchor="middle" fontSize="13" fill="#fff">Magma rises from the mantle · gap {Math.round(2 * g / 1.4)} units wide</text>
      </g>
    );
  }
  if (boundary === "convergent") {
    const s = time * 2;
    const rise = time * 0.9;
    return (
      <g>
        <rect x="0" y="150" width="660" height="210" fill="#ea580c" />
        <polygon points={`0,120 ${m},120 ${m},150 0,150`} fill="#475569" />
        <polygon points={`${m},120 ${m + s},${120 + s * 0.7} ${m + s},${150 + s * 0.7} ${m},150`} fill="#475569" />
        <polygon points={`${m},${100 - rise * 0.4} 660,${100 - rise * 0.4} 660,160 ${m + 5},160 ${m},140`} fill="#a16207" />
        <polygon points={`${m + 90},${100 - rise * 0.4} ${m + 120},${40 - rise * 0.4} ${m + 150},${100 - rise * 0.4}`} fill={time >= 30 ? "#78350f" : "none"} />
        {time >= 30 && <circle cx={m + 120} cy={36 - rise * 0.4} r="9" fill="#f97316" />}
        <text x="20" y="32" fontSize="15" fontWeight="700" fill="#0b1f4a">Convergent: the oceanic plate sinks under the continent</text>
        <text x="330" y="330" textAnchor="middle" fontSize="13" fill="#fff">Time raises mountains and volcanoes above the trench</text>
      </g>
    );
  }
  const off = time * 1.2;
  return (
    <g>
      <rect x="0" y="40" width="660" height="300" fill="#bbf7d0" />
      <rect x="0" y={120 + off / 2} width="300" height="90" fill="#a16207" />
      <rect x="360" y={120 - off / 2} width="300" height="90" fill="#a16207" />
      <rect x="300" y="40" width="60" height="300" fill="#4d2f0a" />
      <path d="M0 165 H300 M360 165 H660" stroke="#fde047" strokeWidth="4" strokeDasharray="12 10" transform={`translate(0 0)`} />
      <text x="150" y="110" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0b1f4a">↓ plate moves</text>
      <text x="510" y="260" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0b1f4a">↑ plate moves</text>
      <text x="20" y="28" fontSize="15" fontWeight="700" fill="#0b1f4a">Transform (top view): plates slide past each other</text>
      {time >= 20 && <text x="330" y="360" textAnchor="middle" fontSize="13" fill="#b91c1c">Stress builds up, then releases as an earthquake</text>}
    </g>
  );
}

function Scene({ state }: { state: EarthState }) {
  return (
    <svg viewBox="0 0 660 380" aria-hidden="true">
      {state.view === "layers" ? <Layers depth={state.depth} /> : <Plates boundary={state.boundary} time={state.time} />}
    </svg>
  );
}

export const earthStructure = defineSim<EarthState>({
  init: { view: "layers", depth: 10, boundary: "divergent", time: 0 },
  controls: [
    { type: "choice", key: "view", label: "Explore", options: [{ value: "layers", label: "Earth's layers" }, { value: "plates", label: "Plate boundaries" }] },
    { type: "slider", key: "depth", label: "Depth below the surface", min: 0, max: 6371, step: 10, unit: "km" },
    { type: "choice", key: "boundary", label: "Plate boundary", options: [{ value: "divergent", label: "Divergent" }, { value: "convergent", label: "Convergent" }, { value: "transform", label: "Transform" }] },
    { type: "slider", key: "time", label: "Time passing", min: 0, max: 100, step: 5, unit: "million yrs" },
  ],
  Scene,
  sceneLabel: "Either a cross-section of the Earth's layers with a depth marker, or a plate boundary changing over time.",
  readings: (s) => {
    if (s.view === "layers") {
      const l = layerAt(s.depth);
      return [
        { label: "Layer", value: l.name },
        { label: "State", value: l.state },
        { label: "Temperature", value: `about ${tempAt(s.depth).toLocaleString()} °C`, tone: "warn" },
      ];
    }
    const info: Record<string, string[]> = {
      divergent: ["Mid-ocean ridge, rift valleys", "New crust is made", "Weak earthquakes"],
      convergent: ["Trenches, volcanoes, fold mountains", "Crust is destroyed", "Strong earthquakes"],
      transform: ["Fault lines", "Crust is neither made nor destroyed", "Strong, shallow earthquakes"],
    };
    const [feature, crust, quake] = info[s.boundary];
    return [{ label: "Landforms", value: feature }, { label: "Crust", value: crust }, { label: "Earthquakes", value: quake }];
  },
  hint: (s) => {
    if (s.view === "layers") return "Drag the depth slider towards the centre. Temperature and pressure both increase with depth.";
    if (s.time === 0) return "Move the time slider forward to watch the plates move over millions of years.";
    return s.boundary === "divergent" ? "Convection currents in the mantle drag the plates apart." : s.boundary === "convergent" ? "The denser oceanic plate is forced down into the mantle." : "The plates grind past each other, locking and then slipping suddenly.";
  },
  checks: {
    "find-mantle": (s) => s.view === "layers" && layerAt(s.depth).name === "Mantle",
    "find-outer-core": (s) => s.view === "layers" && layerAt(s.depth).name === "Outer core",
    "find-inner-core": (s) => s.view === "layers" && layerAt(s.depth).name === "Inner core",
    "divergent": (s) => s.view === "plates" && s.boundary === "divergent" && s.time >= 40,
    "convergent": (s) => s.view === "plates" && s.boundary === "convergent" && s.time >= 40,
    "transform": (s) => s.view === "plates" && s.boundary === "transform" && s.time >= 20,
  },
});
