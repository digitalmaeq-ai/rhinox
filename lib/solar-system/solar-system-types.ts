export type BodyId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type PlanetClass = "Star" | "Terrestrial planet" | "Gas giant" | "Ice giant";

export type ViewMode = "2d" | "3d";

/**
 * 3D camera presets. "follow" and "closeup" need a selected planet; with
 * nothing selected the camera falls back to "overview".
 */
export type CameraPreset = "overview" | "follow" | "closeup" | "top";

/** "teaching" compresses distances so every planet fits; "true" spaces orbits in proportion to real distance. */
export type ScaleMode = "teaching" | "true";

export interface Source {
  label: string;
  url: string;
}

export interface CelestialBody {
  id: BodyId;
  name: string;
  classification: PlanetClass;
  tagline: string;

  // --- Actual astronomical values (NASA planetary fact sheets) ---
  diameterKm: number;
  /** Mass in kilograms. */
  massKg: number;
  /** Mean distance from the Sun. Absent for the Sun. */
  distanceKm?: number;
  distanceAu?: number;
  /** Sidereal rotation period in hours; negative = retrograde (spins backwards). */
  rotationHours: number;
  /** Orbital period in Earth days. */
  orbitalDays?: number;
  /** Mean temperature in °C and what it refers to. */
  temperatureC: number;
  temperatureNote: string;
  gravityMs2: number;
  axialTiltDeg: number;
  moons?: { count: number; asOf: string; note?: string };

  characteristics: string[];
  facts: string[];

  // --- Display values (NOT astronomical) ---
  color: string;
  colorDeep: string;
  /** Radius in scene units. Deliberately exaggerated or reduced: not to scale. */
  displayRadius: number;
  /** Starting angle on the orbit (radians) so the planets are not all in a line. */
  phase: number;
  hasRings?: boolean;
  /** Optional photographic map. When missing, a procedural texture is drawn. */
  textureUrl?: string;
}

export interface SimClock {
  /** Simulated days since the start. Advances with real time × speed. */
  days: number;
  /** Seconds of playing time, used for the visual (teaching-rate) spin. */
  spin: number;
}

export interface SimSettings {
  playing: boolean;
  /** Simulated days per real second. */
  daysPerSecond: number;
  scale: ScaleMode;
  showLabels: boolean;
  showOrbits: boolean;
  showTrails: boolean;
}

export interface SpeedPreset {
  id: string;
  label: string;
  daysPerSecond: number;
}

/**
 * Integration point for later learning modules (compare, gravity, guided
 * investigations, quizzes, CBT). A module receives the shared state and can
 * render into the workspace; none are listed in the UI until they exist.
 */
export interface SolarSystemModule {
  id: string;
  title: string;
  status: "planned" | "available";
}
