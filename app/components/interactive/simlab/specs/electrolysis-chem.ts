// The chemistry of the electrolysis lab: what is discharged at each
// electrode and how much, from Faraday's laws. Pure functions.
//
// Constants (WAEC style): 1 Faraday = 96 500 C per mole of electrons;
// 1 mole of gas = 24 dm³ at room temperature and pressure; Cu = 63.5, Ag = 108.

import { fmt, makeRng, pick, type Rng } from "./titration-practice";
import type { CalcKindOption, CalcProblem } from "../shell/types";

export const FARADAY = 96500;
export const MOLAR_VOLUME_CM3 = 24000;
export const MAX_MINUTES = 30;
export const MIN_VOLTS = 2;

export type ElectrolyteId = "water" | "copper" | "brine" | "dilute-brine" | "silver";
export type ElectrodeId = "inert" | "copper";

export type CellState = {
  electrolyte: string;
  electrode: string;
  voltage: number;
  current: number;
  minutes: number;
};

export const ELECTROLYTE_IDS: ElectrolyteId[] = ["water", "copper", "brine", "dilute-brine", "silver"];

export const ELECTROLYTES: Record<ElectrolyteId, { name: string; formula: string; colour: string; ions: string[]; cathodeWhy: string; anodeWhy: string; liquorNote: string }> = {
  water: {
    name: "Dilute sulfuric acid",
    formula: "H₂SO₄(aq)",
    colour: "#e0f2fe",
    ions: ["H⁺", "SO₄²⁻", "OH⁻ (from water)"],
    cathodeWhy: "Only H⁺ can be discharged at the cathode, so hydrogen forms.",
    anodeWhy: "OH⁻ is discharged in preference to SO₄²⁻, so oxygen forms.",
    liquorNote: "Water is used up, so the acid becomes more concentrated.",
  },
  copper: {
    name: "Copper(II) sulfate",
    formula: "CuSO₄(aq)",
    colour: "#7dd3fc",
    ions: ["Cu²⁺", "SO₄²⁻", "H⁺ (from water)", "OH⁻ (from water)"],
    cathodeWhy: "Cu²⁺ is lower than H⁺ in the electrochemical series, so copper is discharged.",
    anodeWhy: "OH⁻ is discharged in preference to SO₄²⁻, so oxygen forms (inert anode).",
    liquorNote: "With inert electrodes the blue colour fades and the solution becomes acidic. With copper electrodes the blue colour stays the same.",
  },
  brine: {
    name: "Concentrated sodium chloride (brine)",
    formula: "NaCl(aq), concentrated",
    colour: "#f1f5f9",
    ions: ["Na⁺", "Cl⁻", "H⁺ (from water)", "OH⁻ (from water)"],
    cathodeWhy: "H⁺ is lower than Na⁺ in the electrochemical series, so hydrogen forms.",
    anodeWhy: "Cl⁻ is present in high concentration, so it is discharged in preference to OH⁻ and chlorine forms.",
    liquorNote: "Na⁺ and OH⁻ are left behind, so sodium hydroxide solution forms.",
  },
  "dilute-brine": {
    name: "Dilute sodium chloride",
    formula: "NaCl(aq), dilute",
    colour: "#f8fafc",
    ions: ["Na⁺", "Cl⁻ (few)", "H⁺ (from water)", "OH⁻ (from water)"],
    cathodeWhy: "H⁺ is lower than Na⁺ in the electrochemical series, so hydrogen forms.",
    anodeWhy: "Cl⁻ is now in low concentration, so OH⁻ is discharged instead and oxygen forms.",
    liquorNote: "Compare with concentrated brine: the concentration of an ion can change what is discharged.",
  },
  silver: {
    name: "Silver nitrate",
    formula: "AgNO₃(aq)",
    colour: "#eef2f7",
    ions: ["Ag⁺", "NO₃⁻", "H⁺ (from water)", "OH⁻ (from water)"],
    cathodeWhy: "Ag⁺ is far lower than H⁺ in the electrochemical series, so silver is discharged.",
    anodeWhy: "OH⁻ is discharged in preference to NO₃⁻, so oxygen forms (inert anode).",
    liquorNote: "With inert electrodes the solution becomes acidic as silver is removed.",
  },
};

export function electrolyteOf(id: string): ElectrolyteId {
  return (ELECTROLYTE_IDS as string[]).includes(id) ? (id as ElectrolyteId) : "water";
}

export type Product = {
  kind: "gas" | "metal" | "dissolves";
  name: string;
  formula: string;
  /** Moles of electrons per mole of this substance. */
  z: number;
  /** Molar mass for metals, g/mol. */
  M?: number;
  equation: string;
  look: string;
  test?: string;
};

const H2: Product = { kind: "gas", name: "Hydrogen", formula: "H₂", z: 2, equation: "2H⁺ + 2e⁻ → H₂", look: "Colourless bubbles at the cathode", test: "Burns with a squeaky pop when a lighted splint is held to it." };
const O2: Product = { kind: "gas", name: "Oxygen", formula: "O₂", z: 4, equation: "4OH⁻ → 2H₂O + O₂ + 4e⁻", look: "Colourless bubbles at the anode", test: "Relights a glowing splint." };
const CL2: Product = { kind: "gas", name: "Chlorine", formula: "Cl₂", z: 2, equation: "2Cl⁻ → Cl₂ + 2e⁻", look: "Pale green-yellow gas with a sharp smell", test: "Bleaches damp blue litmus paper." };
const CU: Product = { kind: "metal", name: "Copper", formula: "Cu", z: 2, M: 63.5, equation: "Cu²⁺ + 2e⁻ → Cu", look: "A pink-brown coating of copper builds up on the cathode" };
const AG: Product = { kind: "metal", name: "Silver", formula: "Ag", z: 1, M: 108, equation: "Ag⁺ + e⁻ → Ag", look: "A grey-white coating of silver builds up on the cathode" };
const CU_ANODE: Product = { kind: "dissolves", name: "Copper (anode dissolves)", formula: "Cu", z: 2, M: 63.5, equation: "Cu → Cu²⁺ + 2e⁻", look: "The copper anode slowly gets thinner" };

export function cathodeProduct(electrolyte: string): Product {
  const e = electrolyteOf(electrolyte);
  if (e === "copper") return CU;
  if (e === "silver") return AG;
  return H2;
}

export function anodeProduct(electrolyte: string, electrode: string): Product {
  if (electrode === "copper") return CU_ANODE;
  return electrolyteOf(electrolyte) === "brine" ? CL2 : O2;
}

export const isOn = (s: Pick<CellState, "voltage" | "current">) => s.voltage >= MIN_VOLTS && s.current > 0;

/** Charge that has passed, in coulombs: Q = I × t. */
export const chargeC = (s: Pick<CellState, "current" | "minutes">) => s.current * s.minutes * 60;

/** Amount of a product: grams for a metal, cm³ at r.t.p. for a gas. */
export function amountOf(p: Product, coulombs: number): number {
  const molesE = coulombs / FARADAY;
  const molesProduct = molesE / p.z;
  return p.kind === "gas" ? molesProduct * MOLAR_VOLUME_CM3 : molesProduct * (p.M ?? 0);
}

export type Outcome = {
  on: boolean;
  coulombs: number;
  molesE: number;
  cathode: Product;
  anode: Product;
  /** Grams (metal) or cm³ (gas) at each electrode. */
  cathodeAmount: number;
  anodeAmount: number;
  copperElectrodes: boolean;
};

export function outcome(s: CellState): Outcome {
  const on = isOn(s);
  const coulombs = on ? chargeC(s) : 0;
  const cathode = cathodeProduct(s.electrolyte);
  const anode = anodeProduct(s.electrolyte, s.electrode);
  return {
    on,
    coulombs,
    molesE: coulombs / FARADAY,
    cathode,
    anode,
    cathodeAmount: amountOf(cathode, coulombs),
    anodeAmount: amountOf(anode, coulombs),
    copperElectrodes: s.electrode === "copper",
  };
}

export function unitOf(p: Product) {
  return p.kind === "gas" ? "cm³" : "g";
}

export function formatAmount(p: Product, amount: number) {
  return p.kind === "gas" ? `${amount.toFixed(1)} cm³` : `${amount.toFixed(3)} g`;
}

/** A fixed, repeatable "measurement error": a balance reads to 0.001 g and a gas tube to 0.5 cm³. */
export function measured(p: Product, amount: number, salt: number): number {
  const h = Math.sin(salt * 12.9898 + amount * 78.233) * 43758.5453;
  const r = h - Math.floor(h) - 0.5; // −0.5 … 0.5
  if (p.kind === "gas") return Math.max(0, Math.round((amount + r * 1.2) * 2) / 2);
  return Math.max(0, Math.round((amount + r * 0.004) * 1000) / 1000);
}

/* ------------------------------ practice problems ------------------------------ */

export const CALC_KINDS: CalcKindOption[] = [
  { id: "mass", label: "Mass of metal deposited" },
  { id: "time", label: "Time needed" },
  { id: "gas", label: "Volume of gas" },
  { id: "charge", label: "Quantity of electricity" },
  { id: "current", label: "Current needed" },
  { id: "series", label: "Two cells in series" },
];

const CURRENTS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
const TIMES = [5, 10, 15, 20, 30, 45, 60];
const METALS = [
  { name: "copper", sym: "Cu", M: 63.5, z: 2, salt: "copper(II) sulfate", ion: "Cu²⁺" },
  { name: "silver", sym: "Ag", M: 108, z: 1, salt: "silver nitrate", ion: "Ag⁺" },
] as const;
const GASES = [
  { name: "hydrogen", f: "H₂", z: 2, where: "cathode", cell: "dilute sulfuric acid" },
  { name: "oxygen", f: "O₂", z: 4, where: "anode", cell: "dilute sulfuric acid" },
  { name: "chlorine", f: "Cl₂", z: 2, where: "anode", cell: "concentrated sodium chloride solution" },
] as const;

const CONSTANTS = "(1 Faraday = 96 500 C; Cu = 63.5, Ag = 108; molar volume of a gas = 24 dm³ at r.t.p.)";

export function generateCalc(seed: number, kind?: string): CalcProblem {
  const rnd = makeRng(seed);
  const k = kind ?? pick(CALC_KINDS, rnd).id;
  const I = pick(CURRENTS, rnd);
  const t = pick(TIMES, rnd);
  const metal = pick(METALS, rnd);
  const gas = pick(GASES, rnd);
  const id = `${k}-${seed}`;
  const Q = I * t * 60;

  if (k === "mass") {
    const ans = (Q * metal.M) / (metal.z * FARADAY);
    return {
      id, kind: k, difficulty: "medium", unit: "g", answer: ans,
      prompt: `A current of ${fmt(I)} A is passed through ${metal.salt} solution for ${t} minutes. Calculate the mass of ${metal.name} deposited at the cathode. ${CONSTANTS}`,
      working: [
        `${metal.ion} + ${metal.z === 2 ? "2e⁻" : "e⁻"} → ${metal.sym}   (${metal.z} mol of electrons per mole of ${metal.sym})`,
        `Time in seconds = ${t} × 60 = ${t * 60} s`,
        `Charge Q = I × t = ${fmt(I)} × ${t * 60} = ${fmt(Q)} C`,
        `Moles of electrons = ${fmt(Q)} ÷ 96 500 = ${fmt(Q / FARADAY)} mol`,
        `Moles of ${metal.sym} = ${fmt(Q / FARADAY)} ÷ ${metal.z} = ${fmt(Q / FARADAY / metal.z)} mol`,
        `Mass = ${fmt(Q / FARADAY / metal.z)} × ${metal.M} = ${fmt(ans)} g`,
      ],
      wrong: [(I * t * metal.M) / (metal.z * FARADAY), (Q * metal.M) / FARADAY, (Q * metal.M * metal.z) / FARADAY],
    };
  }

  if (k === "time") {
    const mass = Math.round(((I * 900 * metal.M) / (metal.z * FARADAY)) * 100) / 100 || 0.1;
    const secs = (mass * metal.z * FARADAY) / (metal.M * I);
    const ans = secs / 60;
    return {
      id, kind: k, difficulty: "hard", unit: "minutes", answer: ans,
      prompt: `How long, in minutes, must a current of ${fmt(I)} A flow through ${metal.salt} solution to deposit ${mass.toFixed(2)} g of ${metal.name} on the cathode? ${CONSTANTS}`,
      working: [
        `Moles of ${metal.sym} = ${mass.toFixed(2)} ÷ ${metal.M} = ${fmt(mass / metal.M)} mol`,
        `Moles of electrons = ${fmt(mass / metal.M)} × ${metal.z} = ${fmt((mass / metal.M) * metal.z)} mol`,
        `Charge Q = ${fmt((mass / metal.M) * metal.z)} × 96 500 = ${fmt(secs * I)} C`,
        `Time = Q ÷ I = ${fmt(secs * I)} ÷ ${fmt(I)} = ${fmt(secs)} s`,
        `In minutes: ${fmt(secs)} ÷ 60 = ${fmt(ans)} minutes`,
      ],
      wrong: [secs, ans * metal.z, ans / metal.z],
    };
  }

  if (k === "gas") {
    const ans = (Q / (gas.z * FARADAY)) * MOLAR_VOLUME_CM3;
    return {
      id, kind: k, difficulty: "hard", unit: "cm³", answer: ans,
      prompt: `Dilute sulfuric acid or brine is electrolysed with a current of ${fmt(I)} A for ${t} minutes. Calculate the volume of ${gas.name} released at the ${gas.where} (${gas.cell}, inert electrodes). ${CONSTANTS}`,
      working: [
        `Charge Q = ${fmt(I)} × ${t * 60} = ${fmt(Q)} C`,
        `Moles of electrons = ${fmt(Q)} ÷ 96 500 = ${fmt(Q / FARADAY)} mol`,
        `${gas.f} needs ${gas.z} mol of electrons per mole, so moles of ${gas.f} = ${fmt(Q / FARADAY)} ÷ ${gas.z} = ${fmt(Q / FARADAY / gas.z)} mol`,
        `Volume = ${fmt(Q / FARADAY / gas.z)} × 24 000 cm³ = ${fmt(ans)} cm³`,
      ],
      wrong: [(Q / FARADAY) * MOLAR_VOLUME_CM3, ans / 24, (Q / (gas.z * FARADAY)) * 22400],
    };
  }

  if (k === "charge") {
    const mass = Math.round(rnd() * 150 + 50) / 100;
    const ans = (mass * metal.z * FARADAY) / metal.M;
    return {
      id, kind: k, difficulty: "medium", unit: "C", answer: ans,
      prompt: `Calculate the quantity of electricity, in coulombs, needed to deposit ${mass.toFixed(2)} g of ${metal.name} from a solution containing ${metal.ion} ions. ${CONSTANTS}`,
      working: [
        `Moles of ${metal.sym} = ${mass.toFixed(2)} ÷ ${metal.M} = ${fmt(mass / metal.M)} mol`,
        `${metal.ion} + ${metal.z === 2 ? "2e⁻" : "e⁻"} → ${metal.sym}, so moles of electrons = ${fmt(mass / metal.M)} × ${metal.z} = ${fmt((mass / metal.M) * metal.z)} mol`,
        `Q = moles of electrons × 96 500 = ${fmt(ans)} C`,
      ],
      wrong: [(mass * FARADAY) / metal.M, ans / metal.z, ans * metal.z],
    };
  }

  if (k === "current") {
    const tt = pick([10, 20, 30, 40, 60], rnd);
    const mass = Math.round(((I * tt * 60 * metal.M) / (metal.z * FARADAY)) * 1000) / 1000 || 0.01;
    const ans = (mass * metal.z * FARADAY) / (metal.M * tt * 60);
    return {
      id, kind: k, difficulty: "hard", unit: "A", answer: ans,
      prompt: `${mass.toFixed(3)} g of ${metal.name} is deposited from ${metal.salt} solution in ${tt} minutes. What current flowed? ${CONSTANTS}`,
      working: [
        `Moles of ${metal.sym} = ${mass.toFixed(3)} ÷ ${metal.M} = ${fmt(mass / metal.M)} mol`,
        `Moles of electrons = ${fmt(mass / metal.M)} × ${metal.z} = ${fmt((mass / metal.M) * metal.z)} mol`,
        `Q = ${fmt((mass / metal.M) * metal.z)} × 96 500 = ${fmt(ans * tt * 60)} C`,
        `I = Q ÷ t = ${fmt(ans * tt * 60)} ÷ ${tt * 60} = ${fmt(ans)} A`,
      ],
      wrong: [ans * 60, ans / metal.z, ans * metal.z],
    };
  }

  // series: the same charge passes through both cells
  const massCu = Math.round((0.3 + rnd() * 1.2) * 100) / 100;
  const molE = (massCu / 63.5) * 2;
  const ans = molE * 108;
  return {
    id, kind: "series", difficulty: "hard", unit: "g", answer: ans,
    prompt: `A copper(II) sulfate cell and a silver nitrate cell are connected in series, so the same charge passes through both. ${massCu.toFixed(2)} g of copper is deposited in the first cell. What mass of silver is deposited in the second? ${CONSTANTS}`,
    working: [
      `Moles of Cu = ${massCu.toFixed(2)} ÷ 63.5 = ${fmt(massCu / 63.5)} mol`,
      `Cu²⁺ + 2e⁻ → Cu, so moles of electrons = ${fmt(molE)} mol`,
      `The same ${fmt(molE)} mol of electrons passes through the silver cell`,
      `Ag⁺ + e⁻ → Ag (1 mol of electrons per mole of Ag), so moles of Ag = ${fmt(molE)} mol`,
      `Mass of Ag = ${fmt(molE)} × 108 = ${fmt(ans)} g`,
    ],
    wrong: [massCu * (108 / 63.5), ans / 2, ans * 2],
  };
}

/** The learner's own run: the mass or volume their settings should give. */
export function experimentProblem(s: CellState): CalcProblem | null {
  if (!isOn(s) || s.minutes <= 0) return null;
  const p = cathodeProduct(s.electrolyte);
  const Q = chargeC(s);
  const ans = amountOf(p, Q);
  const unit = unitOf(p);
  return {
    id: `mine-${s.electrolyte}-${s.current}-${s.minutes}`,
    kind: "mine",
    difficulty: "medium",
    unit,
    answer: ans,
    prompt: `In your experiment a current of ${fmt(s.current)} A flowed for ${s.minutes} minutes through ${ELECTROLYTES[electrolyteOf(s.electrolyte)].name.toLowerCase()}. Calculate the ${p.kind === "gas" ? `volume of ${p.name.toLowerCase()} at the cathode` : `mass of ${p.name.toLowerCase()} deposited`}, then compare with your measured value. ${CONSTANTS}`,
    working: [
      `Charge Q = ${fmt(s.current)} × ${s.minutes * 60} = ${fmt(Q)} C`,
      `Moles of electrons = ${fmt(Q)} ÷ 96 500 = ${fmt(Q / FARADAY)} mol`,
      `${p.equation} (${p.z} mol of electrons per mole of ${p.formula})`,
      `Moles of ${p.formula} = ${fmt(Q / FARADAY)} ÷ ${p.z} = ${fmt(Q / FARADAY / p.z)} mol`,
      p.kind === "gas" ? `Volume = ${fmt(Q / FARADAY / p.z)} × 24 000 = ${fmt(ans)} cm³` : `Mass = ${fmt(Q / FARADAY / p.z)} × ${p.M} = ${fmt(ans)} g`,
    ],
    wrong: [],
  };
}

export const rngOf = (seed: number): Rng => makeRng(seed);
