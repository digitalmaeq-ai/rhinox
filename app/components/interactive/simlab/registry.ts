import { electricCircuit } from "./specs/electric-circuit";
import { acidsBases } from "./specs/acids-bases";
import { photosynthesis } from "./specs/photosynthesis";
import { moonPhases } from "./specs/moon-phases";
import { gearSystem } from "./specs/gear-system";
import { projectileMotion } from "./specs/projectile-motion";
import { forcesMotion } from "./specs/forces-motion";
import { titration } from "./specs/titration";
import { electrolysis } from "./specs/electrolysis";
import { circulatorySystem } from "./specs/circulatory-system";
import { foodTests } from "./specs/food-tests";
import { earthStructure } from "./specs/earth-structure";
import { riverProcesses } from "./specs/river-processes";
import { bridgeBuilder } from "./specs/bridge-builder";
import { solarEnergy } from "./specs/solar-energy";

import { tours } from "./tours";
import type { SimSpec } from "./types";

// experience.component -> simulation. Add a new experiment by writing a
// spec in ./specs, registering it here, and adding a content file whose
// `component` is the key below (runtime "simulation" or "virtual-lab").
const base: Record<string, SimSpec> = {
  "electric-circuit": electricCircuit,
  "acids-bases": acidsBases,
  photosynthesis,
  "moon-phases": moonPhases,
  "gear-system": gearSystem,
  "projectile-motion": projectileMotion,
  "forces-motion": forcesMotion,
  "titration": titration,
  "electrolysis": electrolysis,
  "circulatory-system": circulatorySystem,
  "food-tests": foodTests,
  "earth-structure": earthStructure,
  "river-processes": riverProcesses,
  "bridge-builder": bridgeBuilder,
  "solar-energy": solarEnergy,
};

// Every experiment gets its guided journey from tours.ts, which powers the
// Cinematic and Classroom modes.
export const simRegistry: Record<string, SimSpec> = Object.fromEntries(
  Object.entries(base).map(([key, spec]) => [key, { ...spec, tour: tours[key], has3D: true }]),
);
