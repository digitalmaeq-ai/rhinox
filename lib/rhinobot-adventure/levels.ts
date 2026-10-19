import { MAX_JUMP_DISTANCE, MAX_JUMP_HEIGHT } from "./tuning";

// Data-driven level definitions. A level is plain data: the Phaser scene reads
// it and builds the world, so new levels and worlds are new data files rather
// than new engine code. All rectangles use top-left x/y in world pixels.

export interface Rect { x: number; y: number; w: number; h: number }
export interface Point { x: number; y: number }
export interface CrystalSpawn { id: string; x: number; y: number }
export interface CheckpointSpawn { id: string; x: number; y: number }

export interface LevelData {
  id: string;
  world: string;
  title: string;
  objective: string;
  width: number;
  height: number;
  /** Where RhinoBot starts (feet position). */
  spawn: Point;
  /** Falling below this y counts as falling into a chasm. */
  killY: number;
  ground: Rect[];
  platforms: Rect[];
  crystals: CrystalSpawn[];
  /** Electric hazards: touching one costs one energy cell. */
  hazards: Rect[];
  checkpoints: CheckpointSpawn[];
  gate: {
    challengeId: string;
    /** Walking into this zone opens the challenge. */
    trigger: Rect;
    /** The chasm the bridge crosses. */
    chasm: Rect;
    /** Where the bridge deck appears once powered. */
    bridge: Rect;
  };
  station: Rect;
  crystalsNeeded: number;
}

const GROUND_Y = 480;

export const ENERGY_VALLEY_001: LevelData = {
  id: "energy-valley-001",
  world: "World 1: The Energy Valley",
  title: "Energy Valley — Mission 001",
  objective: "Help RhinoBot collect three energy crystals and reach the research station.",
  width: 2600,
  height: 540,
  spawn: { x: 90, y: GROUND_Y },
  killY: 620,
  ground: [
    { x: 0, y: GROUND_Y, w: 1760, h: 60 },
    { x: 2100, y: GROUND_Y, w: 500, h: 60 },
  ],
  platforms: [
    { x: 380, y: 392, w: 170, h: 24 },
    { x: 1010, y: 392, w: 150, h: 24 },
    { x: 1190, y: 304, w: 170, h: 24 },
  ],
  crystals: [
    { id: "crystal-1", x: 465, y: 350 },
    { id: "crystal-2", x: 810, y: 370 },
    { id: "crystal-3", x: 1275, y: 262 },
  ],
  hazards: [{ x: 770, y: GROUND_Y - 26, w: 84, h: 26 }],
  checkpoints: [{ id: "checkpoint-1", x: 1450, y: GROUND_Y }],
  gate: {
    challengeId: "bridge-batteries",
    trigger: { x: 1600, y: 300, w: 150, h: 180 },
    chasm: { x: 1760, y: GROUND_Y, w: 340, h: 140 },
    bridge: { x: 1760, y: GROUND_Y, w: 340, h: 26 },
  },
  station: { x: 2380, y: GROUND_Y - 150, w: 130, h: 150 },
  crystalsNeeded: 3,
};

export const LEVELS: Record<string, LevelData> = { [ENERGY_VALLEY_001.id]: ENERGY_VALLEY_001 };

/**
 * Checks a level can be finished with the player's real jump abilities:
 * every platform is within one jump of something to stand on, every crystal
 * is within reach, and every gap that is not a bridged chasm is jumpable.
 * Returns a list of problems (empty when the level is playable).
 */
export function validateLevel(level: LevelData): string[] {
  const problems: string[] = [];
  const standable: Rect[] = [...level.ground, ...level.platforms];
  const reach = MAX_JUMP_HEIGHT - 12; // keep a safety margin

  for (const platform of level.platforms) {
    const supports = standable.filter((other) => other !== platform).filter((other) => {
      const dx = Math.max(other.x - (platform.x + platform.w), platform.x - (other.x + other.w), 0);
      const rise = other.y - platform.y; // positive when the platform is higher
      return dx <= MAX_JUMP_DISTANCE * 0.6 && rise <= reach && rise > -1000;
    });
    if (supports.length === 0) problems.push(`Platform at ${platform.x},${platform.y} cannot be reached.`);
  }

  for (const crystal of level.crystals) {
    const reachable = standable.some((rect) => {
      const withinX = crystal.x >= rect.x - 40 && crystal.x <= rect.x + rect.w + 40;
      const rise = rect.y - crystal.y; // how far above the surface
      return withinX && rise >= 0 && rise <= reach + 50;
    });
    if (!reachable) problems.push(`${crystal.id} is out of reach.`);
  }

  // Ground gaps other than the bridged chasm must be jumpable.
  const sorted = [...level.ground].sort((a, b) => a.x - b.x);
  for (let index = 1; index < sorted.length; index += 1) {
    const gap = sorted[index].x - (sorted[index - 1].x + sorted[index - 1].w);
    const isBridge = Math.abs(gap - level.gate.chasm.w) < 1;
    if (gap > MAX_JUMP_DISTANCE - 30 && !isBridge) problems.push(`Gap of ${gap}px is too wide.`);
    if (isBridge && gap <= MAX_JUMP_DISTANCE) problems.push("The bridged chasm should be too wide to jump.");
  }

  if (level.crystals.length < level.crystalsNeeded) problems.push("Not enough crystals in the level.");
  return problems;
}
