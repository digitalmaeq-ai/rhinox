// Calculation practice for the electric circuit lab: fresh numbers every
// time, with working and typical wrong answers.

import type { CalcKindOption, CalcProblem } from "../shell/types";
import { fmt, makeRng, pick } from "./titration-practice";
import { rowOhms, type CircuitRow } from "./circuit-model";

export const CALC_KINDS: CalcKindOption[] = [
  { id: "voltage", label: "Voltage, V = I × R" },
  { id: "current", label: "Current, I = V ÷ R" },
  { id: "resistance", label: "Resistance, R = V ÷ I" },
  { id: "series", label: "Resistors in series" },
  { id: "parallel", label: "Resistors in parallel" },
  { id: "power", label: "Electrical power" },
  { id: "emf", label: "Battery with internal resistance" },
];

const CURRENTS = [0.2, 0.25, 0.4, 0.5, 0.8, 1.2, 1.5, 2, 2.5];
const OHMS = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
const VOLTS = [3, 4.5, 6, 9, 12, 24];
const PAIRS: [number, number][] = [[6, 3], [12, 4], [10, 10], [20, 5], [15, 10], [12, 6], [30, 20]];

export function generateCalc(seed: number, kind?: string): CalcProblem {
  const rnd = makeRng(seed);
  const k = kind ?? pick(CALC_KINDS, rnd).id;
  const I = pick(CURRENTS, rnd);
  const R = pick(OHMS, rnd);
  const V = pick(VOLTS, rnd);
  const id = `${k}-${seed}`;

  if (k === "voltage") {
    const ans = I * R;
    return { id, kind: k, difficulty: "easy", unit: "V", answer: ans, prompt: `A current of ${fmt(I)} A flows through a resistor of ${R} Ω. Calculate the voltage across the resistor.`, working: ["V = I × R", `V = ${fmt(I)} × ${R} = ${fmt(ans)} V`], wrong: [R / I, I / R] };
  }
  if (k === "current") {
    const ans = V / R;
    return { id, kind: k, difficulty: "easy", unit: "A", answer: ans, prompt: `A ${fmt(V)} V supply is connected across a ${R} Ω resistor. Calculate the current.`, working: ["I = V ÷ R", `I = ${fmt(V)} ÷ ${R} = ${fmt(ans)} A`], wrong: [V * R, R / V] };
  }
  if (k === "resistance") {
    const v = Math.round(I * R * 100) / 100;
    const ans = v / I;
    return { id, kind: k, difficulty: "easy", unit: "Ω", answer: ans, prompt: `A voltmeter reads ${fmt(v)} V across a lamp while the ammeter reads ${fmt(I)} A. Calculate the resistance of the lamp.`, working: ["R = V ÷ I", `R = ${fmt(v)} ÷ ${fmt(I)} = ${fmt(ans)} Ω`], wrong: [v * I, I / v] };
  }
  if (k === "series") {
    const [a, b, c] = [pick(OHMS, rnd), pick(OHMS, rnd), pick(OHMS, rnd)];
    const ans = a + b + c;
    return { id, kind: k, difficulty: "medium", unit: "Ω", answer: ans, prompt: `Three resistors of ${a} Ω, ${b} Ω and ${c} Ω are connected in series. Calculate the total resistance.`, working: ["In series, R(total) = R₁ + R₂ + R₃", `R(total) = ${a} + ${b} + ${c} = ${ans} Ω`], wrong: [1 / (1 / a + 1 / b + 1 / c), a * b * c, (a + b + c) / 3] };
  }
  if (k === "parallel") {
    const [a, b] = pick(PAIRS, rnd);
    const ans = 1 / (1 / a + 1 / b);
    return { id, kind: k, difficulty: "medium", unit: "Ω", answer: ans, prompt: `A ${a} Ω resistor and a ${b} Ω resistor are connected in parallel. Calculate the total resistance.`, working: ["1 ÷ R(total) = 1 ÷ R₁ + 1 ÷ R₂", `1 ÷ R(total) = 1 ÷ ${a} + 1 ÷ ${b} = ${fmt(1 / a + 1 / b)}`, `R(total) = ${fmt(ans)} Ω`], wrong: [a + b, (a + b) / 2, a * b] };
  }
  if (k === "power") {
    const ans = V * I;
    return { id, kind: k, difficulty: "medium", unit: "W", answer: ans, prompt: `A lamp carries a current of ${fmt(I)} A from a ${fmt(V)} V supply. Calculate the power it uses.`, working: ["P = V × I", `P = ${fmt(V)} × ${fmt(I)} = ${fmt(ans)} W`], wrong: [V / I, I * I * V, V * V * I] };
  }
  // emf
  const E = pick([6, 9, 12], rnd);
  const r = pick([0.5, 1, 2], rnd);
  const Rl = pick([4, 5, 8, 10], rnd);
  const cur = E / (Rl + r);
  const ans = cur * Rl;
  return {
    id, kind: "emf", difficulty: "hard", unit: "V", answer: ans,
    prompt: `A battery of e.m.f. ${E} V and internal resistance ${r} Ω is connected to a ${Rl} Ω resistor. Calculate the voltage across the ${Rl} Ω resistor (the terminal voltage).`,
    working: [`Total resistance = ${Rl} + ${r} = ${fmt(Rl + r)} Ω`, `Current = E ÷ R(total) = ${E} ÷ ${fmt(Rl + r)} = ${fmt(cur)} A`, `Terminal voltage = I × R = ${fmt(cur)} × ${Rl} = ${fmt(ans)} V`, `(The "lost volts" are I × r = ${fmt(cur * r)} V.)`],
    wrong: [E, E - r, cur * (Rl + r)],
  };
}

/** The learner's own latest reading as a problem. */
export function experimentProblem(row: CircuitRow | undefined): CalcProblem | null {
  if (!row || row.amps <= 0) return null;
  const ans = rowOhms(row);
  return {
    id: `mine-${row.id}`, kind: "mine", difficulty: "easy", unit: "Ω", answer: ans,
    prompt: `In your experiment the voltmeter read ${row.volts.toFixed(2)} V and the ammeter read ${row.amps.toFixed(3)} A. Calculate the resistance of the bulb${row.bulbs > 1 ? "s" : ""}.`,
    working: ["R = V ÷ I", `R = ${row.volts.toFixed(2)} ÷ ${row.amps.toFixed(3)} = ${fmt(ans)} Ω`],
    wrong: [],
  };
}
