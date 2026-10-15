"use client";

import { useEffect, useRef } from "react";

import { defineSim } from "../types";

type GearState = {
  driver: number;
  driven: number;
  rpm: number;
  idler: boolean;
  running: boolean;
};

const IDLER_TEETH = 16;
export const PX = 3; // pitch radius = teeth * PX

export function gearRatio(s: GearState) {
  return s.driven / s.driver;
}

function gearPath(teeth: number) {
  const r = teeth * PX;
  const root = r - 5;
  const tip = r + 5;
  const p = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  const point = (rad: number, a: number) =>
    `${(Math.cos(a) * rad).toFixed(2)} ${(Math.sin(a) * rad).toFixed(2)}`;
  for (let i = 0; i < teeth; i++) {
    const c = i * p;
    pts.push(
      `${i === 0 ? "M" : "L"}${point(root, c - 0.3 * p)}`,
      `L${point(tip, c - 0.14 * p)}`,
      `L${point(tip, c + 0.14 * p)}`,
      `L${point(root, c + 0.3 * p)}`,
    );
  }
  return `${pts.join(" ")} Z`;
}

type Layout = {
  teeth: number;
  x: number;
  phase: number; // radians
  sign: 1 | -1;
  label: string;
}[];

export function buildLayout(s: GearState): { gears: Layout; scale: number; dx: number } {
  const chain: { teeth: number; label: string }[] = [{ teeth: s.driver, label: "Driver" }];
  if (s.idler) chain.push({ teeth: IDLER_TEETH, label: "Idler" });
  chain.push({ teeth: s.driven, label: "Driven" });

  const gears: Layout = [];
  let x = 0;
  let phase = 0;
  chain.forEach((g, i) => {
    const r = g.teeth * PX;
    if (i > 0) {
      const prev = gears[i - 1];
      const rp = prev.teeth * PX;
      x = prev.x + rp + r;
      // Where the previous gear has a tooth relative to the contact line (angle 0).
      const pp = (Math.PI * 2) / prev.teeth;
      const a = ((prev.phase % pp) + pp) % pp;
      const pn = (Math.PI * 2) / g.teeth;
      phase = Math.PI + ( -(prev.teeth / g.teeth) * a - 0.5 * pn);
    } else {
      x = r;
    }
    gears.push({
      teeth: g.teeth,
      x,
      phase,
      sign: i % 2 === 0 ? 1 : -1,
      label: g.label,
    });
  });

  const last = gears[gears.length - 1];
  const width = last.x + last.teeth * PX + 10;
  const scale = Math.min(1, 600 / width);
  const dx = (660 - width * scale) / 2;
  return { gears, scale, dx };
}

function Scene({ state }: { state: GearState }) {
  const { gears, scale, dx } = buildLayout(state);
  const refs = useRef<(SVGGElement | null)[]>([]);
  const angle = useRef(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();

    function apply() {
      const layout = buildLayout(stateRef.current).gears;
      layout.forEach((g, i) => {
        const el = refs.current[i];
        if (!el) return;
        const deg =
          ((g.phase * 180) / Math.PI) +
          g.sign * angle.current * (layout[0].teeth / g.teeth);
        el.setAttribute("transform", `rotate(${deg.toFixed(2)})`);
      });
    }

    function frame(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      const s = stateRef.current;
      if (s.running && !reduce) {
        angle.current = (angle.current + s.rpm * 6 * dt) % (360 * 1000);
      }
      apply();
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const maxR = Math.max(...gears.map((g) => g.teeth * PX));
  const colours = ["#2563eb", "#94a3b8", "#0ea5e9"];

  return (
    <svg viewBox="0 0 660 330" aria-hidden="true">
      <g transform={`translate(${dx} 165) scale(${scale})`}>
        {gears.map((g, i) => {
          const colour = state.idler ? colours[i] : i === 0 ? colours[0] : colours[2];
          return (
            <g key={`${i}-${g.teeth}`} transform={`translate(${g.x} 0)`}>
              <g
                ref={(el) => {
                  refs.current[i] = el;
                }}
              >
                <path d={gearPath(g.teeth)} fill={colour} stroke="#0b1f4a" strokeWidth="3" strokeLinejoin="round" />
                <circle r={g.teeth * PX * 0.45} fill="#fff" opacity="0.25" />
                <circle r="10" fill="#0b1f4a" />
                <line x1="0" y1="0" x2={g.teeth * PX * 0.7} y2="0" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
              </g>
              <text y={maxR + 30} textAnchor="middle" fontSize={14 / scale} fontWeight="700" fill="#0b1f4a">
                <tspan x="0">{g.label}</tspan>
                <tspan x="0" dy={17 / scale} fontWeight="500">{g.teeth} teeth</tspan>
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export const gearSystem = defineSim<GearState>({
  init: { driver: 20, driven: 20, rpm: 30, idler: false, running: true },
  controls: [
    { type: "slider", key: "driver", label: "Driver gear teeth", min: 8, max: 40, step: 2 },
    { type: "slider", key: "driven", label: "Driven gear teeth", min: 8, max: 40, step: 2 },
    { type: "slider", key: "rpm", label: "Motor speed", min: 10, max: 60, step: 5, unit: "rpm" },
    { type: "toggle", key: "idler", label: "Idler gear between them", onLabel: "Idler added", offLabel: "No idler" },
    { type: "toggle", key: "running", label: "Motor", onLabel: "Running", offLabel: "Stopped" },
  ],
  Scene,
  sceneLabel: "Two meshing gears, with an optional idler gear between them, turning at speeds set by their tooth counts.",
  readings: (s) => {
    const ratio = gearRatio(s);
    const out = s.rpm / ratio;
    const same = s.idler;
    return [
      { label: "Gear ratio (driven : driver)", value: `${s.driven / gcd(s.driven, s.driver)} : ${s.driver / gcd(s.driven, s.driver)}` },
      { label: "Output speed", value: `${Number.isInteger(out) ? out : out.toFixed(1)} rpm`, tone: out > s.rpm ? "good" : "info" },
      { label: "Turning force (torque)", value: `× ${ratio.toFixed(2)}`, tone: ratio > 1 ? "good" : "info" },
      { label: "Output direction", value: same ? "Same as input" : "Opposite to input" },
    ];
  },
  hint: (s) => {
    const ratio = gearRatio(s);
    if (ratio === 1) return "Both gears have the same number of teeth, so the output turns at the same speed. Change a gear to see the speed change.";
    return ratio > 1
      ? "A bigger driven gear turns slower but with more turning force. This is a speed-reducing gear train, as used in a bicycle's low gear."
      : "A smaller driven gear turns faster but with less turning force. This is a speed-increasing gear train.";
  },
  checks: {
    "speed-up": (s) => s.driven < s.driver,
    "slow-down": (s) => s.driven >= 2 * s.driver,
    "add-idler": (s) => s.idler,
    "three-to-one": (s) => s.driven === 3 * s.driver,
  },
});

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
