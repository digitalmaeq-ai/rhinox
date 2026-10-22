import type { GuidedMissionDefinition } from "./guided-mission.ts";

/**
 * DRAFT missions for Year 1, Term 1, Week 3 "Arrow Cards on the Grid".
 * The curriculum sets the rules (6–8 cards, at least two turns, 5×5 grid; support
 * track 3–4 cards on a 4×4 grid). The start and finish squares are software
 * authoring choices that a curriculum reviewer must approve. Nothing here is
 * launchable: it is not registered in REVIEWED_LAUNCHES until it is reviewed.
 * Directions: 0 north, 1 east, 2 south, 3 west. Row 0 is the top row.
 */
export const DRAFT_YEAR1_T1_W3_MISSIONS: Readonly<Record<"core" | "support", GuidedMissionDefinition>> = Object.freeze({
  core: {
    mission: { gridSize: 5, goal: { x: 3, y: 2 } },
    start: { x: 0, y: 0, direction: 0 },
    rules: { minCards: 6, maxCards: 8, minTurns: 2 },
  },
  support: {
    mission: { gridSize: 4, goal: { x: 1, y: 1 } },
    start: { x: 0, y: 0, direction: 0 },
    rules: { minCards: 3, maxCards: 4, minTurns: 0 },
  },
});
