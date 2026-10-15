import type { ComponentType } from "react";

import { Circuit3D, Projectile3D, Forces3D, Gear3D } from "./physics";
import { AcidsBases3D, Titration3D, Electrolysis3D } from "./chemistry";
import { Photosynthesis3D, Circulatory3D, FoodTests3D } from "./biology";
import { Moon3D, Earth3D, River3D } from "./earth";
import { Bridge3D, Solar3D } from "./engineering";

import type { SimState } from "../types";

export interface Scene3DDef {
  Scene: ComponentType<{ state: SimState }>;
  camera: [number, number, number];
  target?: [number, number, number];
  // The scene brings its own lighting (moon phases, solar energy).
  ownLights?: boolean;
}

// experience.component -> its 3D scene
export const scenes3d: Record<string, Scene3DDef> = {
  "electric-circuit": { Scene: Circuit3D, camera: [0, 11, 12], target: [1, 0.5, 0] },
  "acids-bases": { Scene: AcidsBases3D, camera: [0, 6, 14.5], target: [0, 2.0, 0.6] },
  photosynthesis: { Scene: Photosynthesis3D, camera: [0, 5, 15], target: [-0.5, 2.0, 0] },
  "moon-phases": { Scene: Moon3D, camera: [0, 9, 10], target: [-2, 0, 0], ownLights: true },
  "gear-system": { Scene: Gear3D, camera: [0, 1.5, 12], target: [0, 0, 0] },
  "projectile-motion": { Scene: Projectile3D, camera: [-1, 4.6, 17.5], target: [0, 1.5, 0], ownLights: true },
  "forces-motion": { Scene: Forces3D, camera: [0, 3.5, 11], target: [0, 0.8, 0] },
  titration: { Scene: Titration3D, camera: [1, 4.5, 15.5], target: [1, 3.2, 0] },
  electrolysis: { Scene: Electrolysis3D, camera: [1, 5.5, 14.5], target: [1.5, 2.2, 0] },
  "circulatory-system": { Scene: Circulatory3D, camera: [0, 1.5, 24], target: [0, 0.2, 0] },
  "food-tests": { Scene: FoodTests3D, camera: [0, 4.5, 13], target: [0, 1.9, 0] },
  "earth-structure": { Scene: Earth3D, camera: [-7, 4, -8], target: [0, 0, 0] },
  "river-processes": { Scene: River3D, camera: [9, 4.5, 11], target: [0, 1.4, 0] },
  "bridge-builder": { Scene: Bridge3D, camera: [3, 3.5, 13], target: [0, 0.4, 0] },
  "solar-energy": { Scene: Solar3D, camera: [-2, 5, 13], target: [0, 1.2, 0] },
};
