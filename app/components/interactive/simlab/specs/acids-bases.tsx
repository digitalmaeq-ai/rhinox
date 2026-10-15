import AcidsApparatus from "../dashboards/AcidsApparatus";
import AcidsBasesDashboard from "../dashboards/AcidsBasesDashboard";
import { defineSim } from "../types";
import { INDICATORS, SAMPLES, SAMPLE_IDS, MAX_DILUTION, liquidColour as liquidColourOf, observe, universalColour as universalColourOf, type AcidState } from "./ab-model";

// Shared with the 3D scene.
export { SAMPLES };
export const liquidColour = liquidColourOf;
export const universalColour = universalColourOf;

type SimAcid = AcidState & { label: string; recs: number; solved: number };

function Scene({ state }: { state: SimAcid }) {
  return <AcidsApparatus state={state} />;
}

const tone = (kind: string) => (kind === "acidic" ? "warn" : kind === "alkaline" ? "good" : "info");

export const acidsBases = defineSim<SimAcid>({
  init: { sample: "water", indicator: "none", added: false, dilution: 0, label: "", recs: 0, solved: 0 },
  controls: [
    { type: "choice", key: "sample", label: "Test liquid", options: SAMPLE_IDS.map((value) => ({ value, label: SAMPLES[value].name })) },
    { type: "choice", key: "indicator", label: "Indicator", options: INDICATORS.map((i) => ({ value: i.id, label: i.label })) },
    { type: "toggle", key: "added", label: "Indicator", onLabel: "Added", offLabel: "Not added" },
    { type: "slider", key: "dilution", label: "Tenfold dilutions", min: 0, max: MAX_DILUTION, step: 1 },
  ],
  Scene,
  Dashboard: AcidsBasesDashboard,
  sceneLabel: "A beaker of liquid that changes colour depending on the indicator added, above a pH scale from 0 to 14.",
  readings: (s) => {
    const o = observe(s);
    return [
      { label: "pH value", value: o.readPh ?? "Needs universal indicator or the pH meter" },
      { label: "Type of liquid", value: o.tested ? o.kind[0].toUpperCase() + o.kind.slice(1) : "Add an indicator", tone: o.tested ? tone(o.kind) : "info" },
    ];
  },
  hint: (s) => {
    const o = observe(s);
    if (s.indicator === "none") return "The liquid looks the same whatever it is. Choose an indicator to find out whether it is an acid or an alkali.";
    if (!s.added) return "Add the indicator to the liquid.";
    return o.conclusion;
  },
  checks: {
    "acid-litmus": (s) => s.indicator === "litmus" && s.added && observe(s).ph <= 5,
    "alkali-litmus": (s) => s.indicator === "litmus" && s.added && observe(s).ph >= 8,
    "find-neutral": (s) => s.indicator === "universal" && s.added && observe(s).ph === 7,
    "strong-alkali": (s) => s.indicator === "universal" && s.added && observe(s).ph > 11,
    "pink-test": (s) => s.indicator === "phenolphthalein" && s.added && observe(s).ph >= 10,
    "methyl-orange": (s) => s.indicator === "methyl" && s.added && observe(s).ph <= 3.1,
    "dilute-acid": (s) => s.sample === "hcl" && s.indicator === "meter" && s.added && Number(s.dilution) >= 3,
    "record-five": (s) => s.recs >= 5,
    "identify-liquids": (s) => s.solved >= 3,
  },
});
