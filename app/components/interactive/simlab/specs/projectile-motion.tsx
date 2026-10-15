import ProjectileApparatus from "../dashboards/ProjectileApparatus";
import ProjectileDashboard from "../dashboards/ProjectileDashboard";
import { defineSim } from "../types";
import { GRAVITY, TARGET, TOLERANCE, flight, type ProjState } from "./proj-model";

// Shared with the 3D scene.
export { flight, TARGET, TOLERANCE };

type SimProj = Required<ProjState> & { fired: number; lastAngle: number; lastHeight: number; recs: number; peak: boolean; pair: boolean };

function Scene({ state }: { state: SimProj }) {
  return <ProjectileApparatus state={state} />;
}

export const projectileMotion = defineSim<SimProj>({
  init: { angle: 30, speed: 15, gravity: "earth", height: 0, fired: 0, lastAngle: -1, lastHeight: 0, recs: 0, peak: false, pair: false },
  controls: [
    { type: "slider", key: "angle", label: "Launch angle", min: 0, max: 85, step: 1, unit: "°" },
    { type: "slider", key: "speed", label: "Launch speed", min: 5, max: 40, step: 1, unit: "m/s" },
    { type: "choice", key: "gravity", label: "Where are you?", options: Object.entries(GRAVITY).map(([value, v]) => ({ value, label: v.name })) },
    { type: "slider", key: "height", label: "Launch height", min: 0, max: 20, step: 5, unit: "m" },
  ],
  Scene,
  Dashboard: ProjectileDashboard,
  sceneLabel: "The path of a launched ball, drawn as a curve, with a target on the ground 60 metres away.",
  readings: (s) => {
    const f = flight(s);
    const hit = Math.abs(f.range - TARGET) <= TOLERANCE;
    return [
      { label: "Range", value: `${f.range.toFixed(1)} m`, tone: hit ? "good" : "info" },
      { label: "Maximum height", value: `${f.height.toFixed(1)} m` },
      { label: "Time in the air", value: `${f.time.toFixed(2)} s` },
      { label: "Target", value: hit ? "Hit!" : "Not yet", tone: hit ? "good" : "warn" },
    ];
  },
  hint: (s) => {
    const f = flight(s);
    if (Math.abs(f.range - TARGET) <= TOLERANCE) return "Direct hit. The sideways speed stays constant while gravity changes the upward speed.";
    return f.range < TARGET ? "Too short. Try a faster launch or an angle closer to 45°, where the range is greatest." : "Too far. Reduce the speed or move the angle away from 45°.";
  },
  checks: {
    "hit-target": (s) => Math.abs(flight(s).range - TARGET) <= TOLERANCE,
    "best-angle": (s) => s.angle >= 44 && s.angle <= 46 && s.speed >= 15 && s.height === 0,
    "low-gravity": (s) => s.gravity === "moon" && flight(s).range > 100,
    "same-range": (s) => s.angle === 60 && s.speed >= 20 && s.gravity === "earth" && s.height === 0,
    "record-six": (s) => s.recs >= 6,
    "find-peak": (s) => s.peak,
    "complementary-angles": (s) => s.pair,
    "cliff-launch": (s) => s.fired > 0 && s.lastAngle === 0 && s.lastHeight >= 10,
  },
});
