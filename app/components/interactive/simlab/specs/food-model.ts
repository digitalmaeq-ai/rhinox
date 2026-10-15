// The model behind the food-tests lab: what each food contains (none,
// trace, moderate or a lot of each nutrient) and what each reagent shows.
// Pure functions.

export type Nutrient = "starch" | "sugar" | "protein" | "fat" | "vitc";
export type TestId = "iodine" | "benedict" | "biuret" | "emulsion" | "dcpip";
export type Level = 0 | 1 | 2 | 3; // none, trace, moderate, a lot

export const NUTRIENTS: { id: Nutrient; label: string }[] = [
  { id: "starch", label: "Starch" },
  { id: "sugar", label: "Reducing sugar" },
  { id: "protein", label: "Protein" },
  { id: "fat", label: "Fat or oil" },
  { id: "vitc", label: "Vitamin C" },
];

export type Food = {
  name: string;
  /** Level of each nutrient; missing means none. */
  levels: Partial<Record<Nutrient, Level>>;
  /** Table sugar: not a reducing sugar until it is broken down with acid. */
  sucrose?: boolean;
  /** Colour of the sample in the tube. */
  colour: string;
};

export const FOODS: Record<string, Food> = {
  yam: { name: "Yam", levels: { starch: 3 }, colour: "#f1e3b8" },
  rice: { name: "Rice", levels: { starch: 3 }, colour: "#f4efe0" },
  beans: { name: "Beans", levels: { starch: 2, protein: 3 }, colour: "#d9b98a" },
  groundnut: { name: "Groundnut", levels: { fat: 3, protein: 2 }, colour: "#e3c08d" },
  egg: { name: "Egg white", levels: { protein: 3 }, colour: "#f6f1df" },
  milk: { name: "Milk", levels: { protein: 2, fat: 1, sugar: 2 }, colour: "#fbf8f1" },
  "palm-oil": { name: "Palm oil", levels: { fat: 3 }, colour: "#e8761a" },
  orange: { name: "Orange juice", levels: { sugar: 2, vitc: 3 }, colour: "#f6b93b" },
  glucose: { name: "Glucose solution", levels: { sugar: 3 }, colour: "#eef6fb" },
  sucrose: { name: "Table sugar solution", levels: {}, sucrose: true, colour: "#f3f7fa" },
};

export const FOOD_IDS = Object.keys(FOODS);

export type Test = {
  name: string;
  nutrient: Nutrient;
  reagent: string;
  /** Short method, used in the record. */
  method: string;
  /** Colours for level 0 to 3 and what they mean. */
  colours: [string, string, string, string];
  words: [string, string, string, string];
};

export const TESTS: Record<TestId, Test> = {
  iodine: {
    name: "Iodine (starch)",
    nutrient: "starch",
    reagent: "Iodine solution",
    method: "Add 2 to 3 drops of iodine solution to the sample.",
    colours: ["#b45309", "#78350f", "#312e81", "#1b1840"],
    words: ["Stays orange-brown: no starch", "Dark brown: a trace of starch", "Blue-black: starch present", "Deep blue-black: a lot of starch"],
  },
  benedict: {
    name: "Benedict's (reducing sugar)",
    nutrient: "sugar",
    reagent: "Benedict's solution",
    method: "Add Benedict's solution and heat in a boiling water bath for a few minutes.",
    colours: ["#3b82f6", "#65a30d", "#f59e0b", "#b91c1c"],
    words: ["Stays blue: no reducing sugar", "Green: a trace of reducing sugar", "Yellow to orange: reducing sugar present", "Brick-red precipitate: a lot of reducing sugar"],
  },
  biuret: {
    name: "Biuret (protein)",
    nutrient: "protein",
    reagent: "Biuret solution",
    method: "Add sodium hydroxide, then a few drops of dilute copper(II) sulfate.",
    colours: ["#60a5fa", "#a5b4fc", "#8b5cf6", "#6d28d9"],
    words: ["Stays blue: no protein", "Faint violet: a trace of protein", "Violet: protein present", "Deep purple: a lot of protein"],
  },
  emulsion: {
    name: "Ethanol emulsion (fat)",
    nutrient: "fat",
    reagent: "Ethanol, then water",
    method: "Shake the sample with ethanol, then pour the clear liquid into water.",
    colours: ["#dbeafe", "#e5e7eb", "#f3f4f6", "#ffffff"],
    words: ["Stays clear: no fat or oil", "Faintly cloudy: a trace of fat", "Cloudy white emulsion: fat present", "Milky white emulsion: a lot of fat"],
  },
  dcpip: {
    name: "DCPIP (vitamin C)",
    nutrient: "vitc",
    reagent: "DCPIP (blue dye)",
    method: "Add DCPIP drop by drop and count the drops until the blue is lost.",
    colours: ["#1d4ed8", "#1d4ed8", "#1d4ed8", "#1d4ed8"],
    words: ["Stays blue: no vitamin C", "", "", "Blue dye is decolourised: vitamin C present"],
  },
};

export const TEST_IDS = Object.keys(TESTS) as TestId[];

export function testOf(id: string): Test {
  return TESTS[(id in TESTS ? id : "iodine") as TestId];
}

export function foodOf(id: string): Food {
  return FOODS[id] ?? FOODS.yam;
}

/** What the sample really contains for a test. */
export function levelOf(food: string, test: string, hydrolysed: boolean): Level {
  const f = foodOf(food);
  const t = testOf(test);
  if (t.nutrient === "sugar" && f.sucrose) return hydrolysed ? 3 : 0;
  return f.levels[t.nutrient] ?? 0;
}

/** Drops of DCPIP needed to lose the blue: more vitamin C, fewer drops. */
export function dropsNeeded(level: Level): number | null {
  return level === 0 ? null : level === 3 ? 4 : level === 2 ? 10 : 22;
}

export type FoodState = {
  food: string;
  test: string;
  heat: boolean;
  added: boolean;
  hydro: boolean;
  drops: number;
  label?: string;
};

export type Observation = {
  /** Has the learner done enough to see a result? */
  complete: boolean;
  positive: boolean;
  level: Level;
  colour: string;
  text: string;
  /** Benedict's added but not heated yet. */
  needsHeat: boolean;
  /** 0 to 1: how far the dye has faded (DCPIP only). */
  fade: number;
};

function mix(a: string, b: string, t: number) {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = (i: number) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t).toString(16).padStart(2, "0");
  return `#${c(0)}${c(1)}${c(2)}`;
}

export function observe(s: FoodState): Observation {
  const t = testOf(s.test);
  const f = foodOf(s.food);
  const level = levelOf(s.food, s.test, s.hydro);

  if (s.test === "dcpip") {
    const need = dropsNeeded(level);
    const drops = s.drops;
    if (drops <= 0) return { complete: false, positive: false, level, colour: f.colour, text: "Add DCPIP drop by drop to see the result.", needsHeat: false, fade: 0 };
    const fade = need === null ? 0 : Math.min(1, drops / need);
    const positive = need !== null && drops >= need;
    return {
      complete: true,
      positive,
      level,
      colour: mix("#1d4ed8", "#e0f2fe", fade),
      text: positive ? `The blue dye was decolourised after ${need} drops: vitamin C present` : need === null ? `${drops} drops added and the dye stays blue: no vitamin C` : `${drops} drops so far and the blue is fading. Keep adding.`,
      needsHeat: false,
      fade,
    };
  }

  if (!s.added) return { complete: false, positive: false, level, colour: f.colour, text: "Add the reagent to see a result.", needsHeat: false, fade: 0 };

  if (s.test === "benedict" && !s.heat) {
    return { complete: false, positive: false, level, colour: t.colours[0], text: "Still blue: Benedict's solution must be heated in a water bath before the colour can change.", needsHeat: true, fade: 0 };
  }

  return { complete: true, positive: level >= 2, level, colour: t.colours[level], text: t.words[level], needsHeat: false, fade: 0 };
}

/** The old shape, for the 3D scene. */
export function outcome(s: FoodState) {
  const o = observe(s);
  return { positive: o.positive, colour: o.colour, text: o.text, needsHeat: o.needsHeat };
}

/** Nutrients a sample really contains (moderate amount or more). */
export function contents(food: string): Nutrient[] {
  const f = foodOf(food);
  return NUTRIENTS.filter((n) => (f.levels[n.id] ?? 0) >= 2).map((n) => n.id);
}
