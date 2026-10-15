// Calculation practice for the projectile lab (g = 10 m/s² in the written
// problems, and your own launch uses the lab's value).

import type { CalcKindOption, CalcProblem } from "../shell/types";
import { flight, GRAVITY, type ProjRow } from "./proj-model";
import { fmt, makeRng, pick } from "./titration-practice";

export const CALC_KINDS: CalcKindOption[] = [
  { id: "horizontal", label: "Horizontal speed" },
  { id: "vertical", label: "Vertical speed" },
  { id: "time", label: "Time of flight" },
  { id: "height", label: "Greatest height" },
  { id: "range", label: "Range" },
  { id: "fall", label: "Falling from a height" },
  { id: "cliff", label: "Horizontal launch from a cliff" },
];

const SPEEDS = [10, 12, 15, 20, 24, 30, 40];
const ANGLES = [30, 45, 60];
const HEIGHTS = [5, 20, 45, 80];
const G = 10;
const sin = (d: number) => Math.sin((d * Math.PI) / 180);
const cos = (d: number) => Math.cos((d * Math.PI) / 180);

export function generateCalc(seed: number, kind?: string): CalcProblem {
  const rnd = makeRng(seed);
  const k = kind ?? pick(CALC_KINDS, rnd).id;
  const u = pick(SPEEDS, rnd);
  const a = pick(ANGLES, rnd);
  const h = pick(HEIGHTS, rnd);
  const id = `${k}-${seed}`;
  const note = ` (Take g = 10 m/s².)`;

  if (k === "horizontal") {
    const ans = u * cos(a);
    return { id, kind: k, difficulty: "easy", unit: "m/s", answer: ans, prompt: `A ball is kicked at ${u} m/s at ${a}° above the horizontal. Calculate its horizontal speed.${note}`, working: ["Horizontal speed uₓ = u cos θ", `uₓ = ${u} × cos ${a}° = ${fmt(ans)} m/s`, "It stays constant throughout the flight."], wrong: [u * sin(a), u, u / cos(a)] };
  }
  if (k === "vertical") {
    const ans = u * sin(a);
    return { id, kind: k, difficulty: "easy", unit: "m/s", answer: ans, prompt: `A ball is kicked at ${u} m/s at ${a}° above the horizontal. Calculate its initial vertical speed.${note}`, working: ["Vertical speed u_y = u sin θ", `u_y = ${u} × sin ${a}° = ${fmt(ans)} m/s`], wrong: [u * cos(a), u, u / sin(a)] };
  }
  if (k === "time") {
    const ans = (2 * u * sin(a)) / G;
    return { id, kind: k, difficulty: "medium", unit: "s", answer: ans, prompt: `A ball is launched from level ground at ${u} m/s at ${a}° above the horizontal. Calculate the time of flight.${note}`, working: ["Time of flight T = 2u sin θ ÷ g", `T = 2 × ${u} × sin ${a}° ÷ 10`, `T = ${fmt(ans)} s`], wrong: [(u * sin(a)) / G, (2 * u * cos(a)) / G, (2 * u) / G] };
  }
  if (k === "height") {
    const ans = (u * sin(a)) ** 2 / (2 * G);
    return { id, kind: k, difficulty: "medium", unit: "m", answer: ans, prompt: `A ball is launched from level ground at ${u} m/s at ${a}° above the horizontal. Calculate the greatest height it reaches.${note}`, working: ["At the top the vertical speed is zero, so H = (u sin θ)² ÷ 2g", `H = (${u} × sin ${a}°)² ÷ 20`, `H = ${fmt(ans)} m`], wrong: [(u * sin(a)) ** 2 / G, (u * cos(a)) ** 2 / (2 * G), u * u / (2 * G)] };
  }
  if (k === "range") {
    const ans = (u * u * Math.sin((2 * a * Math.PI) / 180)) / G;
    return { id, kind: k, difficulty: "hard", unit: "m", answer: ans, prompt: `A ball is launched from level ground at ${u} m/s at ${a}° above the horizontal. Calculate the horizontal range.${note}`, working: ["Range R = u² sin 2θ ÷ g", `R = ${u}² × sin ${2 * a}° ÷ 10`, `R = ${fmt(ans)} m`], wrong: [(u * u * sin(a)) / G, (u * u) / G, (u * u * Math.sin((a * Math.PI) / 180) ** 2) / G] };
  }
  if (k === "fall") {
    const ans = Math.sqrt((2 * h) / G);
    return { id, kind: k, difficulty: "medium", unit: "s", answer: ans, prompt: `A stone is dropped from a cliff ${h} m high. Calculate the time it takes to reach the ground.${note}`, working: ["s = ½ g t²  so  t = √(2s ÷ g)", `t = √(2 × ${h} ÷ 10) = √${fmt((2 * h) / G)}`, `t = ${fmt(ans)} s`], wrong: [(2 * h) / G, h / G, Math.sqrt(h / G)] };
  }
  const ans = u * Math.sqrt((2 * h) / G);
  return {
    id, kind: "cliff", difficulty: "hard", unit: "m", answer: ans,
    prompt: `A ball is thrown horizontally at ${u} m/s from a cliff ${h} m high. Calculate how far from the base of the cliff it lands.${note}`,
    working: [`Time to fall: t = √(2h ÷ g) = √(2 × ${h} ÷ 10) = ${fmt(Math.sqrt((2 * h) / G))} s`, "The horizontal speed stays at the launch speed.", `Distance = ${u} × ${fmt(Math.sqrt((2 * h) / G))} = ${fmt(ans)} m`],
    wrong: [u * ((2 * h) / G), Math.sqrt((2 * h) / G), u * Math.sqrt(h / G)],
  };
}

/** The learner's own launch as a problem. */
export function experimentProblem(row: ProjRow | undefined): CalcProblem | null {
  if (!row) return null;
  const f = flight({ angle: row.angle, speed: row.speed, gravity: row.gravity, height: row.height });
  const where = GRAVITY[row.gravity]?.name ?? "Earth";
  return {
    id: `mine-${row.id}`, kind: "mine", difficulty: "hard", unit: "m", answer: f.range,
    prompt: `In your experiment you launched a ball at ${row.speed} m/s at ${row.angle}° on ${where} (g = ${f.g} m/s²)${row.height ? ` from a platform ${row.height} m high` : ""}. Calculate the range, then compare it with the ${row.range.toFixed(1)} m you measured.`,
    working: [
      `Horizontal speed = ${row.speed} × cos ${row.angle}° = ${fmt(f.vx)} m/s`,
      `Vertical speed = ${row.speed} × sin ${row.angle}° = ${fmt(f.vy)} m/s`,
      `Time of flight = ${fmt(f.time)} s${row.height ? " (including the fall from the platform)" : ""}`,
      `Range = ${fmt(f.vx)} × ${fmt(f.time)} = ${fmt(f.range)} m`,
    ],
    wrong: [],
  };
}
