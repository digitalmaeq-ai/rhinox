import { defineSim } from "../types";

type MoonState = { angle: number; tilt: boolean };

const rad = (d: number) => (d * Math.PI) / 180;

function norm(a: number) {
  return ((a % 360) + 360) % 360;
}

// Angular distance from a target angle, 0–180.
function away(angle: number, target: number) {
  const d = Math.abs(norm(angle) - target);
  return Math.min(d, 360 - d);
}

export function phaseName(angle: number) {
  const a = norm(angle);
  if (a < 11.25 || a >= 348.75) return "New Moon";
  if (a < 78.75) return "Waxing crescent";
  if (a < 101.25) return "First quarter";
  if (a < 168.75) return "Waxing gibbous";
  if (a < 191.25) return "Full Moon";
  if (a < 258.75) return "Waning gibbous";
  if (a < 281.25) return "Last quarter";
  return "Waning crescent";
}

export function eclipseKind(s: MoonState): "solar" | "lunar" | null {
  if (s.tilt) return null; // the real, tilted orbit misses the shadow almost every month
  if (away(s.angle, 0) <= 6) return "solar";
  if (away(s.angle, 180) <= 6) return "lunar";
  return null;
}

function litFraction(angle: number) {
  return (1 - Math.cos(rad(angle))) / 2;
}

function litPath(angle: number, cx: number, cy: number, r: number) {
  const a = norm(angle);
  const k = Math.cos(rad(a)) * r;
  const rx = Math.abs(k).toFixed(2);
  if (a <= 180) {
    const sweep = k > 0 ? 0 : 1;
    return `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} A${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
  }
  const sweep = k > 0 ? 1 : 0;
  return `M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} A${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
}

function Scene({ state }: { state: MoonState }) {
  const cx = 250;
  const cy = 180;
  const R = 105;
  const a = rad(state.angle);
  const mx = cx - R * Math.cos(a);
  const my = cy + R * Math.sin(a);
  const eclipse = eclipseKind(state);
  const viewX = 540;
  const viewY = 150;
  const vr = 58;

  // Side view: the tilted orbit carries the Moon above or below the Sun–Earth line.
  const offset = state.tilt ? 22 * Math.sin(a + 1.0) : 0;

  return (
    <svg viewBox="0 0 660 360" aria-hidden="true">
      <defs>
        <radialGradient id="mp-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <clipPath id="mp-disc">
          <circle cx={viewX} cy={viewY} r={vr} />
        </clipPath>
      </defs>

      {/* sunlight */}
      {[100, 140, 180, 220, 260].map((y) => (
        <line key={y} x1="84" x2="124" y1={y} y2={y} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      ))}
      <circle cx="40" cy={cy} r="34" fill="url(#mp-sun)" />
      <text x="28" y="300" fontSize="13" fill="#475569">Sun</text>

      {/* orbit and Earth */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 6" />
      <circle cx={cx} cy={cy} r="24" fill="#3b82f6" />
      <path d={`M${cx - 14} ${cy - 8} q10 -10 22 -2 q-4 10 -14 10 z M${cx + 2} ${cy + 8} q8 -4 14 2 q-6 8 -14 -2 z`} fill="#22c55e" />
      <text x={cx} y={cy + 44} textAnchor="middle" fontSize="13" fill="#475569">Earth</text>

      {/* Moon: lit half faces the Sun */}
      <circle cx={mx} cy={my} r="14" fill="#334155" />
      <path d={`M${mx} ${my - 14} A14 14 0 0 0 ${mx} ${my + 14} Z`} fill="#f1f5f9" />
      <text x={mx + (mx < cx ? -22 : 22)} y={my + 5} textAnchor={mx < cx ? "end" : "start"} fontSize="13" fill="#475569">Moon</text>

      {/* view from Earth */}
      <text x={viewX} y="62" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b1f4a">What we see from Earth</text>
      <rect x={viewX - 70} y={viewY - 70} width="140" height="140" rx="16" fill="#0b1226" />
      {eclipse === "solar" ? (
        <g>
          <circle cx={viewX} cy={viewY} r={vr + 14} fill="#fde68a" opacity="0.35" />
          <circle cx={viewX} cy={viewY} r={vr + 6} fill="none" stroke="#fde68a" strokeWidth="3" opacity="0.9" />
          <circle cx={viewX} cy={viewY} r={vr} fill="#020617" />
        </g>
      ) : eclipse === "lunar" ? (
        <circle cx={viewX} cy={viewY} r={vr} fill="#9a3412" />
      ) : (
        <g>
          <circle cx={viewX} cy={viewY} r={vr} fill="#1e293b" />
          <path d={litPath(state.angle, viewX, viewY, vr)} fill="#f8fafc" />
        </g>
      )}
      <text x={viewX} y="248" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0b1f4a">
        {eclipse === "solar" ? "Solar eclipse" : eclipse === "lunar" ? "Lunar eclipse" : phaseName(state.angle)}
      </text>

      {/* side view */}
      <text x="540" y="282" textAnchor="middle" fontSize="12" fill="#475569">Side view of the orbit</text>
      <line x1="470" x2="610" y1="318" y2="318" stroke="#94a3b8" strokeDasharray="4 5" />
      <circle cx="540" cy="318" r="9" fill="#3b82f6" />
      <circle cx={540 - Math.cos(a) * 60} cy={318 - offset} r="6" fill="#f1f5f9" stroke="#64748b" />
    </svg>
  );
}

export const moonPhases = defineSim<MoonState>({
  init: { angle: 45, tilt: true },
  controls: [
    { type: "slider", key: "angle", label: "Moon's place in its orbit", min: 0, max: 360, step: 1, unit: "°" },
    { type: "toggle", key: "tilt", label: "Moon's orbit", onLabel: "Tilted 5° (real)", offLabel: "Flat (model)" },
  ],
  Scene,
  sceneLabel: "A top-down view of the Sun, Earth and Moon beside the Moon as seen from Earth.",
  readings: (s) => {
    const kind = eclipseKind(s);
    return [
      { label: "Phase", value: phaseName(s.angle) },
      { label: "Lit side facing Earth", value: `${Math.round(litFraction(s.angle) * 100)}%` },
      {
        label: "Eclipse?",
        value: kind ? (kind === "solar" ? "Solar eclipse" : "Lunar eclipse") : "No",
        tone: kind ? "good" : "info",
      },
    ];
  },
  hint: (s) => {
    const kind = eclipseKind(s);
    if (kind === "solar") return "The Moon is exactly between the Sun and Earth, so it blocks the Sun: a solar eclipse.";
    if (kind === "lunar") return "Earth is exactly between the Sun and the Moon, so Earth's shadow falls on the Moon: a lunar eclipse.";
    if (s.tilt && (away(s.angle, 0) <= 6 || away(s.angle, 180) <= 6)) {
      return "The Moon is lined up with the Sun, but its tilted orbit carries it above or below the shadow, so there is no eclipse. Switch the orbit to flat to compare.";
    }
    return "Half of the Moon is always lit by the Sun. The phase depends on how much of that lit half we can see from Earth.";
  },
  checks: {
    "new-moon": (s) => away(s.angle, 0) <= 10,
    "full-moon": (s) => away(s.angle, 180) <= 10,
    "first-quarter": (s) => away(s.angle, 90) <= 10,
    "solar-eclipse": (s) => eclipseKind(s) === "solar",
    "lunar-eclipse": (s) => eclipseKind(s) === "lunar",
  },
});
