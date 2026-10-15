import { defineSim } from "../types";

type SolarState = { panels: number; hour: number; tilt: number; cloud: number };

export function sunElevation(hour: number) {
  const e = 90 * Math.sin((Math.PI * (hour - 6)) / 12);
  return Math.max(0, e);
}

export function solar(s: SolarState) {
  const e = sunElevation(s.hour);
  const delta = Math.abs(e - (90 - s.tilt));
  const angleFactor = e > 0 ? Math.max(0, Math.cos((delta * Math.PI) / 180)) : 0;
  const clear = s.panels * 250 * angleFactor;
  const power = clear * (1 - 0.8 * (s.cloud / 100));
  return { e, angleFactor, power: Math.round(power), clear: Math.round(clear) };
}

function Scene({ state }: { state: SolarState }) {
  const r = solar(state);
  const t = (state.hour - 6) / 12;
  const sx = 80 + t * 500;
  const sy = 190 - Math.sin(Math.PI * Math.max(0, Math.min(1, t))) * 150;
  const night = r.e <= 0;
  const lights = Math.min(8, Math.floor(r.power / 150));

  return (
    <svg viewBox="0 0 660 360" aria-hidden="true">
      <rect width="660" height="360" fill={night ? "#1e293b" : "#bae6fd"} />
      <path d="M80 190 Q330 -30 580 190" fill="none" stroke="#fff" strokeOpacity="0.6" strokeDasharray="5 7" />
      <circle cx={sx} cy={sy} r="26" fill={night ? "#e2e8f0" : "#fde047"} />
      {!night && <circle cx={sx} cy={sy} r="40" fill="#fde047" opacity="0.3" />}
      {state.cloud > 10 && [[160, 80], [400, 60], [500, 110]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={50} ry={20} fill="#fff" opacity={0.25 + (state.cloud / 100) * 0.7} />
      ))}
      <rect y="300" width="660" height="60" fill="#86c98b" />
      {/* house */}
      <rect x="250" y="220" width="160" height="80" fill="#f8fafc" stroke="#475569" strokeWidth="3" />
      <polygon points="235,220 330,160 425,220" fill="#9a3412" />
      <rect x="310" y="255" width="36" height="45" fill="#7c2d12" />
      {/* panels on roof, drawn tilted */}
      <g transform={`translate(330 190) rotate(${-(Math.min(state.tilt, 60) - 32) + 0})`}>
        {Array.from({ length: Math.min(state.panels, 10) }, (_, i) => (
          <rect key={i} x={-40 + (i % 5) * 16} y={-6 + Math.floor(i / 5) * 12 - 8} width="14" height="10" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1" />
        ))}
      </g>
      {/* lights */}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={470 + i * 22} cy="330" r="8" fill={i < lights ? "#fde047" : "#64748b"} stroke="#0b1f4a" strokeWidth="2" />
      ))}
      <text x="470" y="352" fontSize="12" fill="#0b1f4a">Lights powered</text>
      <text x="20" y="32" fontSize="16" fontWeight="700" fill={night ? "#fff" : "#0b1f4a"}>{state.hour <= 12 ? `${Math.floor(state.hour)}:00 am` : `${Math.floor(state.hour) - (state.hour > 12 ? 12 : 0)}:00 pm`}{state.hour === 12 ? " (noon)" : ""}</text>
    </svg>
  );
}

export const solarEnergy = defineSim<SolarState>({
  init: { panels: 2, hour: 8, tilt: 0, cloud: 20 },
  controls: [
    { type: "slider", key: "panels", label: "Number of solar panels", min: 1, max: 10, step: 1 },
    { type: "slider", key: "hour", label: "Time of day", min: 5, max: 19, step: 1, unit: "h" },
    { type: "slider", key: "tilt", label: "Panel tilt from flat", min: 0, max: 90, step: 5, unit: "°" },
    { type: "slider", key: "cloud", label: "Cloud cover", min: 0, max: 100, step: 10, unit: "%" },
  ],
  Scene,
  sceneLabel: "A house with solar panels on the roof, the Sun crossing the sky, and a row of lights showing how much power is produced.",
  readings: (s) => {
    const r = solar(s);
    return [
      { label: "Sun height above horizon", value: `${Math.round(r.e)}°` },
      { label: "Panel efficiency (angle)", value: `${Math.round(r.angleFactor * 100)}%` },
      { label: "Power produced", value: `${r.power} W`, tone: r.power >= 1000 ? "good" : "info" },
    ];
  },
  hint: (s) => {
    const r = solar(s);
    if (r.e <= 0) return "It is night, so solar panels produce no electricity. Storing energy in batteries solves this.";
    if (s.cloud >= 70) return "Heavy cloud blocks much of the sunlight, so the panels produce far less power.";
    if (r.angleFactor < 0.8) return "The Sun's rays are hitting the panels at a slant. Adjust the tilt so the panels face the Sun more directly.";
    return "Panels work best when they face the Sun directly and the sky is clear. Add more panels for more power.";
  },
  checks: {
    "power-home": (s) => solar(s).power >= 1000,
    "tilt-panels": (s) => s.tilt >= 20 && solar(s).angleFactor >= 0.95 && sunElevation(s.hour) >= 15,
    "cloudy-day": (s) => s.cloud >= 70 && sunElevation(s.hour) >= 40,
    "night-time": (s) => sunElevation(s.hour) <= 0,
  },
});
