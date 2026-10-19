// Feel and size constants for RhinoBot STEM Adventure. Kept apart from the
// Phaser scene so they can be tuned (and tested) without touching the engine.

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const TUNING = {
  gravity: 1500,
  runSpeed: 235,
  groundAccel: 1900,
  airAccel: 1200,
  groundDrag: 2200,
  jumpVelocity: -590,
  // Releasing jump early multiplies the upward speed by this, giving a
  // variable-height jump (tap = short hop, hold = full jump).
  jumpCut: 0.42,
  maxFallSpeed: 760,
  coyoteMs: 90,
  jumpBufferMs: 110,
  invulnerableMs: 1300,
  knockbackX: 220,
  knockbackY: -330,
  maxHealth: 3,
} as const;

/** Highest a full jump reaches, in pixels (v² / 2g). Level design keeps steps under this. */
export const MAX_JUMP_HEIGHT = (TUNING.jumpVelocity * TUNING.jumpVelocity) / (2 * TUNING.gravity);
/** Farthest a full jump carries on level ground, in pixels. */
export const MAX_JUMP_DISTANCE = TUNING.runSpeed * ((2 * -TUNING.jumpVelocity) / TUNING.gravity);
