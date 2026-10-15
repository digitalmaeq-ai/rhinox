import { defineSim } from "../types";
import scenes from "./SimScenes.module.css";

type PhotoState = { light: number; co2: number; temp: number };

function tempFactor(t: number) {
  if (t <= 30) return Math.max(0, (t - 5) / 25);
  return Math.max(0, (45 - t) / 15);
}

export function photoRate(s: PhotoState) {
  const limited = Math.min(s.light, s.co2);
  return Math.round(limited * tempFactor(s.temp));
}

function limiting(s: PhotoState) {
  const t = tempFactor(s.temp) * 100;
  const values: [string, number][] = [
    ["light", s.light],
    ["carbon dioxide", s.co2],
    ["temperature", t],
  ];
  values.sort((a, b) => a[1] - b[1]);
  return values[0];
}

function Scene({ state }: { state: PhotoState }) {
  const rate = photoRate(state);
  const bubbles = Math.round(rate / 9);
  const sun = state.light / 100;
  const water = state.temp > 35 ? "#fcd9c4" : state.temp < 12 ? "#cfe3fb" : "#d4ecf7";

  return (
    <svg viewBox="0 0 660 360" aria-hidden="true">
      <defs>
        <clipPath id="ps-beaker">
          <path d="M270 70 L285 290 Q286 308 304 308 H416 Q434 308 435 290 L450 70 Z" />
        </clipPath>
      </defs>

      {/* lamp */}
      <circle cx="110" cy="90" r="36" fill="#fde047" opacity={0.25 + 0.75 * sun} />
      <circle cx="110" cy="90" r="22" fill="#facc15" />
      {Array.from({ length: Math.round(sun * 6) }, (_, i) => (
        <line key={i} x1="150" y1={70 + i * 26} x2="262" y2={110 + i * 22} stroke="#facc15" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
      ))}
      <text x="110" y="150" textAnchor="middle" fontSize="14" fill="#475569">Lamp {state.light}%</text>

      {/* beaker with pondweed */}
      <g clipPath="url(#ps-beaker)">
        <rect x="260" y="110" width="200" height="210" fill={water} style={{ transition: "fill 0.5s" }} />
        {Array.from({ length: Math.round(state.co2 / 10) }, (_, i) => (
          <circle key={i} cx={290 + ((i * 37) % 140)} cy={140 + ((i * 53) % 150)} r="3" fill="#64748b" opacity="0.55" />
        ))}
        {/* plant */}
        <path d="M360 300 C360 250 340 230 335 190 M360 300 C362 240 382 220 388 180 M360 300 C360 260 360 230 358 170" stroke="#15803d" strokeWidth="5" fill="none" strokeLinecap="round" />
        {[[335, 190], [388, 180], [358, 170], [345, 225], [378, 235]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="14" ry="7" fill="#22c55e" transform={`rotate(${i % 2 ? 30 : -30} ${x} ${y})`} />
        ))}
        {Array.from({ length: bubbles }, (_, i) => (
          <circle
            key={i}
            className={scenes.bubble}
            cx={330 + ((i * 29) % 70)}
            cy="220"
            r="5"
            fill="#fff"
            stroke="#7dd3fc"
            strokeWidth="1.5"
            style={{ animationDelay: `${(i * 0.37) % 2.4}s` }}
          />
        ))}
      </g>
      <path d="M270 70 L285 290 Q286 308 304 308 H416 Q434 308 435 290 L450 70" fill="none" stroke="#64748b" strokeWidth="4" strokeLinejoin="round" />
      <text x="360" y="338" textAnchor="middle" fontSize="14" fill="#475569">Pondweed in water</text>

      {/* thermometer */}
      <rect x="520" y="70" width="18" height="190" rx="9" fill="#fff" stroke="#64748b" strokeWidth="3" />
      <rect x="525" y={260 - ((state.temp - 5) / 40) * 170} width="8" height={((state.temp - 5) / 40) * 170 + 6} rx="4" fill="#ef4444" />
      <circle cx="529" cy="270" r="16" fill="#ef4444" stroke="#64748b" strokeWidth="3" />
      <text x="560" y="170" fontSize="15" fontWeight="700" fill="#0b1f4a">{state.temp}°C</text>

      {/* rate meter */}
      <text x="610" y="48" textAnchor="middle" fontSize="13" fill="#475569">Oxygen bubbles</text>
      <text x="610" y="70" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0b1f4a">{(rate / 10).toFixed(1)}/s</text>
    </svg>
  );
}

export const photosynthesis = defineSim<PhotoState>({
  init: { light: 0, co2: 50, temp: 25 },
  controls: [
    { type: "slider", key: "light", label: "Light intensity", min: 0, max: 100, step: 5, unit: "%" },
    { type: "slider", key: "co2", label: "Carbon dioxide", min: 0, max: 100, step: 5, unit: "%" },
    { type: "slider", key: "temp", label: "Water temperature", min: 5, max: 45, step: 1, unit: "°C" },
  ],
  Scene,
  sceneLabel: "A pondweed in water under a lamp. Oxygen bubbles rise faster when photosynthesis is faster.",
  readings: (s) => {
    const rate = photoRate(s);
    const [name, value] = limiting(s);
    return [
      { label: "Rate of photosynthesis", value: `${rate}%`, tone: rate >= 90 ? "good" : "info" },
      { label: "Oxygen bubbles", value: `${(rate / 10).toFixed(1)} per second` },
      { label: "Limiting factor", value: rate === 0 && s.light === 0 ? "Light" : value >= 99 ? "None" : name[0].toUpperCase() + name.slice(1), tone: value >= 99 ? "good" : "warn" },
    ];
  },
  hint: (s) => {
    const rate = photoRate(s);
    if (s.light === 0) return "With no light there is no photosynthesis and no bubbles. Turn the lamp up.";
    const [name, value] = limiting(s);
    if (s.temp > 38) return "It is getting too hot. Enzymes start to denature, so the rate falls even though there is plenty of light and carbon dioxide.";
    if (value >= 99) return "Nothing is limiting the plant now. Photosynthesis is at its maximum rate.";
    return `Rate is ${rate}%. The limiting factor is ${name}: the factor in shortest supply sets the speed, so improving the others will not help.`;
  },
  checks: {
    "switch-on-light": (s) => s.light > 0 && photoRate(s) > 0,
    "co2-limits": (s) => s.light >= 80 && s.co2 <= 30,
    "maximum-rate": (s) => photoRate(s) >= 90,
    "too-hot": (s) => s.temp >= 40 && s.light >= 70 && s.co2 >= 70,
  },
});
