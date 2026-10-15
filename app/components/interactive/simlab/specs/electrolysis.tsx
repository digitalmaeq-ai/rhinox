import ElectrolysisApparatus from "../dashboards/ElectrolysisApparatus";
import ElectrolysisDashboard from "../dashboards/ElectrolysisDashboard";
import { defineSim } from "../types";
import {
  ELECTROLYTES,
  ELECTROLYTE_IDS,
  MAX_MINUTES,
  anodeProduct,
  cathodeProduct,
  electrolyteOf,
  formatAmount,
  isOn,
  outcome,
  type CellState,
} from "./electrolysis-chem";

type ElectroState = CellState & { recs: number };

// Shared with the 3D scene.
export const LIQUIDS: Record<string, { name: string; colour: string }> = Object.fromEntries(
  ELECTROLYTE_IDS.map((id) => [id, { name: ELECTROLYTES[id].name, colour: ELECTROLYTES[id].colour }]),
);

export function products(s: Pick<CellState, "electrolyte" | "electrode" | "voltage" | "current">) {
  const on = isOn(s);
  const cathode = cathodeProduct(s.electrolyte);
  const anode = anodeProduct(s.electrolyte, s.electrode);
  return { on, cathode: cathode.name, anode: anode.name, copperElectrodes: s.electrode === "copper" };
}

function Scene({ state }: { state: ElectroState }) {
  return <ElectrolysisApparatus state={state} />;
}

export const electrolysis = defineSim<ElectroState>({
  init: { electrolyte: "water", electrode: "inert", voltage: 0, current: 1, minutes: 0, recs: 0 },
  controls: [
    { type: "choice", key: "electrolyte", label: "Electrolyte", options: ELECTROLYTE_IDS.map((id) => ({ value: id, label: ELECTROLYTES[id].name })) },
    { type: "choice", key: "electrode", label: "Electrodes", options: [{ value: "inert", label: "Inert (graphite)" }, { value: "copper", label: "Copper" }] },
    { type: "slider", key: "voltage", label: "Supply voltage", min: 0, max: 12, step: 1, unit: "V" },
    { type: "slider", key: "current", label: "Current", min: 0.5, max: 3, step: 0.1, unit: "A" },
    { type: "slider", key: "minutes", label: "Time", min: 0, max: MAX_MINUTES, step: 1, unit: "min" },
  ],
  Scene,
  Dashboard: ElectrolysisDashboard,
  sceneLabel: "A beaker with two electrodes connected to a power supply and ammeter. Gas collects in tubes or a metal coats the cathode.",
  readings: (s) => {
    const o = outcome(s);
    return [
      { label: "At the cathode (−)", value: o.on ? o.cathode.name : "Nothing yet" },
      { label: "At the anode (+)", value: o.on ? o.anode.name : "Nothing yet" },
      { label: "Charge passed", value: `${Math.round(o.coulombs)} C`, tone: o.on ? "good" : "info" },
      { label: "Collected at the cathode", value: o.on && s.minutes > 0 ? formatAmount(o.cathode, o.cathodeAmount) : "None" },
    ];
  },
  hint: (s) => {
    const e = electrolyteOf(s.electrolyte);
    if (s.voltage < 2) return "The voltage is too low to split the compound. Increase it to switch the cell on.";
    if (s.minutes === 0) return "The cell is on. Now let time pass: the charge is current × time, and the amount of product is proportional to it.";
    if (s.electrode === "copper") return "With copper electrodes the anode dissolves and copper is deposited on the cathode. This is how copper is purified.";
    return `${ELECTROLYTES[e].cathodeWhy} ${ELECTROLYTES[e].anodeWhy}`;
  },
  checks: {
    "switch-on": (s) => isOn(s),
    "split-water": (s) => s.electrolyte === "water" && isOn(s) && s.minutes >= 5,
    "copper-coating": (s) => s.electrolyte === "copper" && s.electrode === "inert" && isOn(s) && s.minutes >= 5,
    "purify-copper": (s) => s.electrolyte === "copper" && s.electrode === "copper" && isOn(s) && s.minutes >= 5,
    "make-chlorine": (s) => s.electrolyte === "brine" && s.electrode === "inert" && isOn(s) && s.minutes >= 5,
    "silver-plate": (s) => s.electrolyte === "silver" && isOn(s) && s.minutes >= 5,
    "take-readings": (s) => s.recs >= 3,
  },
});
