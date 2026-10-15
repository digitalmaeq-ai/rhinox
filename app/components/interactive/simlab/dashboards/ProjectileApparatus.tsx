"use client";

import { useRef } from "react";

import { GRAVITY, TARGET, TOLERANCE, flight, pathPoints, position, type ProjState } from "../specs/proj-model";

export type Shot = { id: number; state: Required<ProjState> };
type Ball = { x: number; y: number; t: number } | null;

// Plot area inside a 700 × 430 drawing.
const W = 700;
const H = 430;
const PL = 70;
const PR = 684;
const PT = 26;
const PB = 366;
const ARROW = 3.4; // drawing units per m/s for the launch arrow

const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200];
const niceStep = (range: number) => STEPS.find((s) => range / s <= 10) ?? 200;

/**
 * A labelled graph of height against distance on a plain white background.
 * Axes, grid, time marks, top of the path, range and target are all marked.
 * Drag the round handle at the tip of the launch arrow to aim.
 */
export default function ProjectileApparatus({
  state,
  shots = [],
  ball = null,
  components = false,
  onAim,
}: {
  state: Required<ProjState>;
  shots?: Shot[];
  ball?: Ball;
  components?: boolean;
  onAim?: (angle: number, speed: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const f = flight(state);
  const all = [state, ...shots.map((s) => s.state)].map(flight);
  // The longest path (or the target) fills about 75% of the width, the highest about 80% of the height.
  const needX = Math.max(TARGET, ...all.map((x) => x.range)) / 0.75;
  const needY = Math.max(...all.map((x) => x.height), 10) / 0.8;
  const sx = (PR - PL) / needX;
  const sy = (PB - PT) / needY;
  const xMax = needX;
  const yMax = needY;
  const px = (x: number) => PL + x * sx;
  const py = (y: number) => PB - y * sy;
  const xs = niceStep(xMax);
  const ys = niceStep(yMax);
  const xTicks = Array.from({ length: Math.floor(xMax / xs) + 1 }, (_, i) => i * xs);
  const yTicks = Array.from({ length: Math.floor(yMax / ys) + 1 }, (_, i) => i * ys);

  const d = (st: Required<ProjState>) => pathPoints(st, 60).map((p, i) => `${i === 0 ? "M" : "L"}${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`).join(" ");
  const hit = Math.abs(f.range - TARGET) <= TOLERANCE;
  const rad = (state.angle * Math.PI) / 180;

  // time marks along the path
  const dt = f.time <= 2 ? 0.25 : f.time <= 5 ? 0.5 : f.time <= 12 ? 1 : 2;
  const marks: number[] = [];
  for (let t = dt; t < f.time - dt / 3; t += dt) marks.push(Math.round(t * 100) / 100);

  const ox = px(0);
  const oy = py(f.h0);
  const tipX = ox + state.speed * ARROW * Math.cos(rad);
  const tipY = oy - state.speed * ARROW * Math.sin(rad);

  function aim(e: React.PointerEvent) {
    if (!dragging.current || !onAim || !svgRef.current) return;
    const m = svgRef.current.getScreenCTM();
    if (!m) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const dx = pt.x - ox;
    const dy = oy - pt.y;
    const angle = Math.max(0, Math.min(85, Math.round((Math.atan2(dy, Math.max(dx, 0.001)) * 180) / Math.PI)));
    const speed = Math.max(5, Math.min(40, Math.round(Math.hypot(dx, dy) / ARROW)));
    onAim(angle, speed);
  }

  const arcR = 34;
  const arcEnd = `${ox + arcR * Math.cos(rad)} ${oy - arcR * Math.sin(rad)}`;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Graph of height against distance. A ball launched at ${state.angle} degrees and ${state.speed} metres per second reaches ${f.height.toFixed(1)} metres high and lands ${f.range.toFixed(1)} metres away after ${f.time.toFixed(2)} seconds.`}
      style={{ width: "100%", height: "100%", display: "block", background: "#fff", touchAction: "none" }}
      onPointerMove={aim}
      onPointerUp={() => { dragging.current = false; }}
      onPointerLeave={() => { dragging.current = false; }}
    >
      <rect x="0" y="0" width={W} height={H} fill="#ffffff" />

      {/* grid */}
      {xTicks.map((x) => <line key={`gx${x}`} x1={px(x)} x2={px(x)} y1={PT} y2={PB} stroke="#e2e8f0" strokeWidth="1" />)}
      {yTicks.map((y) => <line key={`gy${y}`} x1={PL} x2={PR} y1={py(y)} y2={py(y)} stroke="#e2e8f0" strokeWidth="1" />)}

      {/* axes */}
      <line x1={PL} x2={PR} y1={PB} y2={PB} stroke="#0b1f4a" strokeWidth="2" />
      <line x1={PL} x2={PL} y1={PT} y2={PB} stroke="#0b1f4a" strokeWidth="2" />
      {xTicks.map((x) => (
        <g key={`tx${x}`}>
          <line x1={px(x)} x2={px(x)} y1={PB} y2={PB + 6} stroke="#0b1f4a" strokeWidth="2" />
          <text x={px(x)} y={PB + 21} textAnchor="middle" fontSize="12" fill="#334155">{x}</text>
        </g>
      ))}
      {yTicks.map((y) => (
        <g key={`ty${y}`}>
          <line x1={PL - 6} x2={PL} y1={py(y)} y2={py(y)} stroke="#0b1f4a" strokeWidth="2" />
          <text x={PL - 10} y={py(y) + 4} textAnchor="end" fontSize="12" fill="#334155">{y}</text>
        </g>
      ))}
      <text x={(PL + PR) / 2} y={H - 14} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b1f4a">Horizontal distance, x (m)</text>
      <text x="18" y={(PT + PB) / 2} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b1f4a" transform={`rotate(-90 18 ${(PT + PB) / 2})`}>Height, y (m)</text>

      {/* target */}
      <rect x={px(TARGET - TOLERANCE)} y={PB - 7} width={2 * TOLERANCE * sx} height="14" rx="3" fill={hit ? "#16a34a" : "#dc2626"} />
      <line x1={px(TARGET)} x2={px(TARGET)} y1={PB - 7} y2={PB - 34} stroke={hit ? "#16a34a" : "#dc2626"} strokeWidth="2" strokeDasharray="3 3" />
      <text x={px(TARGET)} y={PB - 40} textAnchor="middle" fontSize="12" fontWeight="700" fill={hit ? "#15803d" : "#b91c1c"}>Target {TARGET} m{hit ? " ✓" : ""}</text>

      {/* earlier shots */}
      {shots.map((sh) => {
        const r = flight(sh.state).range;
        return (
          <g key={sh.id}>
            <path d={d(sh.state)} fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="5 5" />
            <circle cx={px(r)} cy={PB} r="6" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
            <text x={px(r)} y={PB - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400e">{sh.id}</text>
          </g>
        );
      })}

      {/* platform height */}
      {f.h0 > 0 && (
        <g>
          <line x1={ox} x2={ox} y1={PB} y2={oy} stroke="#64748b" strokeWidth="6" />
          <text x={ox + 10} y={(PB + oy) / 2 + 4} fontSize="12" fontWeight="700" fill="#475569">h₀ = {f.h0} m</text>
        </g>
      )}

      {/* guides to the top of the path */}
      {f.vy > 0.5 && (
        <g>
          <line x1={PL} x2={px(f.vx * f.apexTime)} y1={py(f.height)} y2={py(f.height)} stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1={px(f.vx * f.apexTime)} x2={px(f.vx * f.apexTime)} y1={py(f.height)} y2={PB} stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx={px(f.vx * f.apexTime)} cy={py(f.height)} r="5" fill="#7c3aed" stroke="#fff" strokeWidth="2" />
          <text x={px(f.vx * f.apexTime) + 9} y={py(f.height) - 8} fontSize="12" fontWeight="700" fill="#6d28d9">Top: H = {f.height.toFixed(1)} m</text>
        </g>
      )}

      {/* the path */}
      <path d={d(state)} fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
      {marks.map((t) => {
        const p = position(state, t);
        return (
          <g key={t}>
            <circle cx={px(p.x)} cy={py(p.y)} r="3.5" fill="#fff" stroke="#2563eb" strokeWidth="2" />
            <text x={px(p.x)} y={py(p.y) + 17} textAnchor="middle" fontSize="10" fill="#475569">{t} s</text>
          </g>
        );
      })}

      {/* range */}
      <line x1={ox} x2={px(f.range)} y1={PB + 0.5} y2={PB + 0.5} stroke="#f59e0b" strokeWidth="5" opacity="0.55" />
      <circle cx={px(f.range)} cy={PB} r="6.5" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
      <text x={Math.min(px(f.range) + 4, PR - 70)} y={PB - 14} textAnchor="middle" stroke="#fff" strokeWidth="4" paintOrder="stroke" fontSize="12" fontWeight="700" fill="#92400e">R = {f.range.toFixed(1)} m</text>

      {/* launch: components, arrow, angle */}
      {components && (
        <g>
          <line x1={ox} x2={tipX} y1={oy} y2={oy} stroke="#16a34a" strokeWidth="2.5" strokeDasharray="5 3" />
          <text x={tipX + 8} y={oy - 6} stroke="#fff" strokeWidth="4" paintOrder="stroke" fontSize="12" fontWeight="700" fill="#15803d">uₓ = {f.vx.toFixed(1)} m/s</text>
          {f.vy > 0.5 && (
            <>
              <line x1={tipX} x2={tipX} y1={oy} y2={tipY} stroke="#dc2626" strokeWidth="2.5" strokeDasharray="5 3" />
              <text x={tipX + 8} y={(oy + tipY) / 2 - 4} stroke="#fff" strokeWidth="4" paintOrder="stroke" fontSize="12" fontWeight="700" fill="#b91c1c">u_y = {f.vy.toFixed(1)} m/s</text>
            </>
          )}
        </g>
      )}
      <path d={`M${ox + arcR} ${oy} A${arcR} ${arcR} 0 0 0 ${arcEnd}`} fill="none" stroke="#0b1f4a" strokeWidth="2" />
      <text x={ox + (arcR + 14) * Math.cos(rad / 2) + (state.angle > 45 ? 2 : 0)} y={oy - (arcR + 14) * Math.sin(rad / 2) + 4} stroke="#fff" strokeWidth="4" paintOrder="stroke" fontSize="12" fontWeight="700" fill="#0b1f4a">θ = {state.angle}°</text>
      <line x1={ox} y1={oy} x2={tipX} y2={tipY} stroke="#0b1f4a" strokeWidth="3.5" />
      <path d={`M${tipX} ${tipY} l${-12 * Math.cos(rad - 0.4)} ${12 * Math.sin(rad - 0.4)} M${tipX} ${tipY} l${-12 * Math.cos(rad + 0.4)} ${12 * Math.sin(rad + 0.4)}`} stroke="#0b1f4a" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={ox} cy={oy} r="6" fill="#0b1f4a" stroke="#fff" strokeWidth="2" />
      <text x={tipX + 14} y={tipY - 10} stroke="#fff" strokeWidth="4" paintOrder="stroke" fontSize="12" fontWeight="700" fill="#0b1f4a">u = {state.speed} m/s</text>
      {onAim && (
        <circle
          cx={tipX}
          cy={tipY}
          r="11"
          fill="#2563eb"
          fillOpacity="0.18"
          stroke="#2563eb"
          strokeWidth="2.5"
          style={{ cursor: "grab" }}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);
          }}
        />
      )}

      {/* the ball and its live position */}
      {ball && (
        <g>
          <circle cx={px(ball.x)} cy={py(ball.y)} r="8" fill="#f97316" stroke="#fff" strokeWidth="2.5" />
          <g transform={`translate(${PL + 10} ${PT + 8})`}>
            <rect width="132" height="34" rx="6" fill="#0f172a" opacity="0.92" />
            <text x="66" y="15" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">t = {ball.t.toFixed(2)} s</text>
            <text x="66" y="28" textAnchor="middle" fontSize="11" fill="#cbd5e1">x = {ball.x.toFixed(1)} · y = {ball.y.toFixed(1)} m</text>
          </g>
        </g>
      )}

      {/* legend and conditions */}
      <g transform={`translate(${PR - 214} ${PT + 8})`}>
        <rect x="0" y="0" width="208" height="72" rx="8" fill="#ffffff" stroke="#e2e8f0" />
        <text x="10" y="18" fontSize="12" fontWeight="700" fill="#0b1f4a">{(GRAVITY[state.gravity] ?? GRAVITY.earth).name} · g = {f.g} m/s²</text>
        <line x1="10" x2="34" y1="33" y2="33" stroke="#2563eb" strokeWidth="3.5" />
        <text x="42" y="37" fontSize="11" fill="#334155">This launch (dots: time marks)</text>
        <line x1="10" x2="34" y1="49" y2="49" stroke="#93c5fd" strokeWidth="2" strokeDasharray="5 5" />
        <text x="42" y="53" fontSize="11" fill="#334155">Earlier shots (numbered)</text>
        <text x="10" y="67" fontSize="10.5" fill="#64748b">{onAim ? "Drag the blue handle to aim" : "Flight time " + f.time.toFixed(2) + " s"}</text>
      </g>
    </svg>
  );
}
