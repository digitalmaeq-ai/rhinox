import { defineSim } from "../types";
import scenes from "./SimScenes.module.css";

type ForceState = { force: number; mass: number; surface: string };

const SURFACES: Record<string, { mu: number; name: string }> = {
  ice: { mu: 0, name: "Ice (no friction)" },
  wood: { mu: 0.3, name: "Wood" },
  rough: { mu: 0.6, name: "Rough ground" },
};
const g = 10;

export function motion(s: ForceState) {
  const maxFriction = SURFACES[s.surface].mu * s.mass * g;
  const friction = Math.min(s.force, maxFriction);
  const net = s.force - friction;
  return { friction, net, accel: net / s.mass, weight: s.mass * g };
}

function Scene({ state }: { state: ForceState }) {
  const m = motion(state);
  const moving = m.accel > 0;
  const dur = Math.max(0.25, 2.2 - m.accel * 0.2);
  const bw = 60 + state.mass * 6;
  const bx = 250;
  const by = 250 - bw * 0.7;

  return (
    <svg viewBox="0 0 660 360" aria-hidden="true">
      <rect x="0" y="250" width="660" height="110" fill={state.surface === "ice" ? "#cfe9fb" : state.surface === "wood" ? "#d6b48a" : "#a3a3a3"} />
      <line x1="0" x2="660" y1="252" y2="252" stroke={moving ? "#475569" : "#94a3b8"} strokeWidth="3" strokeDasharray="14 12" className={moving ? scenes.flow : undefined} style={{ animationDuration: `${dur}s`, animationDirection: "reverse" }} />
      <text x="20" y="290" fontSize="14" fontWeight="700" fill="#0b1f4a">{SURFACES[state.surface].name}</text>
      <rect x={bx} y={by} width={bw} height={bw * 0.7} rx="6" fill="#2563eb" stroke="#0b1f4a" strokeWidth="3" />
      <text x={bx + bw / 2} y={by + bw * 0.4} textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">{state.mass} kg</text>
      {state.force > 0 && (
        <g>
          <line x1={bx - 8 - state.force * 1.6} x2={bx - 8} y1={by + bw * 0.35} y2={by + bw * 0.35} stroke="#16a34a" strokeWidth="8" />
          <path d={`M${bx - 8} ${by + bw * 0.35 - 14} l16 14 l-16 14 z`} fill="#16a34a" />
          <text x={bx - 8 - state.force * 1.6} y={by + bw * 0.35 - 14} fontSize="14" fontWeight="700" fill="#166534">Push {state.force} N</text>
        </g>
      )}
      {m.friction > 0 && (
        <g>
          <line x1={bx + bw + 8 + m.friction * 1.6} x2={bx + bw + 8} y1={by + bw * 0.55} y2={by + bw * 0.55} stroke="#dc2626" strokeWidth="8" />
          <path d={`M${bx + bw + 8} ${by + bw * 0.55 - 14} l-16 14 l16 14 z`} fill="#dc2626" />
          <text x={bx + bw + 8} y={by + bw * 0.55 + 32} textAnchor="start" fontSize="14" fontWeight="700" fill="#991b1b">Friction {m.friction.toFixed(0)} N</text>
        </g>
      )}
    </svg>
  );
}

export const forcesMotion = defineSim<ForceState>({
  init: { force: 0, mass: 4, surface: "wood" },
  controls: [
    { type: "slider", key: "force", label: "Pushing force", min: 0, max: 100, step: 5, unit: "N" },
    { type: "slider", key: "mass", label: "Mass of the block", min: 1, max: 10, step: 1, unit: "kg" },
    { type: "choice", key: "surface", label: "Surface", options: Object.entries(SURFACES).map(([value, v]) => ({ value, label: v.name })) },
  ],
  Scene,
  sceneLabel: "A block on a surface being pushed with a force, with a friction arrow pushing back.",
  readings: (s) => {
    const m = motion(s);
    return [
      { label: "Friction", value: `${m.friction.toFixed(0)} N` },
      { label: "Resultant force", value: `${m.net.toFixed(0)} N`, tone: m.net === 0 ? "info" : "good" },
      { label: "Acceleration (F = m × a)", value: `${m.accel.toFixed(2)} m/s²` },
      { label: "State", value: s.force === 0 ? "At rest" : m.net === 0 ? "Balanced: not accelerating" : "Speeding up", tone: m.net > 0 ? "good" : "info" },
    ];
  },
  hint: (s) => {
    const m = motion(s);
    if (s.force === 0) return "No force means no change in motion. Push the block to begin.";
    if (m.net === 0) return "Friction matches the push, so the forces are balanced and the block does not accelerate.";
    return `The unbalanced force is ${m.net.toFixed(0)} N, so acceleration = ${m.net.toFixed(0)} ÷ ${s.mass} = ${m.accel.toFixed(2)} m/s².`;
  },
  checks: {
    "balanced-forces": (s) => s.force > 0 && motion(s).net === 0,
    "no-friction": (s) => s.surface === "ice" && s.force >= 10,
    "big-acceleration": (s) => motion(s).accel >= 8,
    "heavy-block": (s) => s.mass >= 8 && motion(s).accel > 0,
  },
});
