import FoodApparatus from "../dashboards/FoodApparatus";
import FoodTestsDashboard from "../dashboards/FoodTestsDashboard";
import { defineSim } from "../types";
import { FOODS, FOOD_IDS, TESTS, TEST_IDS, observe, outcome as outcomeOf, testOf, type FoodState } from "./food-model";

// Shared with the 3D scene.
export { FOODS };
export const outcome = outcomeOf;

type SimFood = FoodState & { label: string; recs: number; solved: number };

function Scene({ state }: { state: SimFood }) {
  return <FoodApparatus state={state} />;
}

export const foodTests = defineSim<SimFood>({
  init: { food: "egg", test: "iodine", heat: false, added: false, hydro: false, drops: 0, label: "", recs: 0, solved: 0 },
  controls: [
    { type: "choice", key: "food", label: "Food sample", options: FOOD_IDS.map((value) => ({ value, label: FOODS[value].name })) },
    { type: "choice", key: "test", label: "Test to carry out", options: TEST_IDS.map((value) => ({ value, label: TESTS[value].name })) },
    { type: "toggle", key: "added", label: "Reagent", onLabel: "Added", offLabel: "Not added" },
    { type: "toggle", key: "heat", label: "Heat the test tube", onLabel: "Heating", offLabel: "Not heated" },
  ],
  Scene,
  Dashboard: FoodTestsDashboard,
  sceneLabel: "Two test tubes: the food sample before the test, and the colour it turns after the reagent is added.",
  readings: (s) => {
    const o = observe(s);
    return [
      { label: "Result", value: !o.complete ? "Not tested yet" : o.positive ? "Positive" : o.level === 1 ? "Trace" : "Negative", tone: o.positive ? "good" : "info" },
      { label: "Observation", value: o.text },
    ];
  },
  hint: (s) => {
    const o = observe(s);
    if (o.needsHeat) return "Benedict's solution only changes colour when it is heated. Turn on heating to see the real result.";
    if (!o.complete) return `Add the reagent: ${testOf(s.test).method}`;
    if (s.test === "benedict") return "Benedict's test needs gentle heating in a water bath. Sugar turns it from blue to green, yellow, then brick-red.";
    return o.positive ? "A positive result: the food contains this nutrient." : "A negative or trace result: the reagent keeps (nearly) its original colour.";
  },
  checks: {
    "find-starch": (s) => s.test === "iodine" && observe(s).positive,
    "find-sugar": (s) => s.test === "benedict" && observe(s).positive,
    "find-protein": (s) => s.test === "biuret" && observe(s).positive,
    "find-fat": (s) => s.test === "emulsion" && observe(s).positive,
    "find-vitamin-c": (s) => s.test === "dcpip" && observe(s).positive,
    "sucrose-trick": (s) => s.food === "sucrose" && s.test === "benedict" && s.hydro && observe(s).positive,
    "record-five": (s) => s.recs >= 5,
    "identify-unknowns": (s) => s.solved >= 3,
  },
});
