/**
 * The pedagogical "what kind of interactive experience does this content
 * need" classification — deliberately separate from
 * `InteractiveExperienceRuntime` (types/interactive-runtime.ts).
 *
 * These two types look similar but answer different questions, and
 * collapsing them into one would blur a distinction the architecture needs
 * to keep:
 *
 *   - InteractionModel (this file) is a WHAT: a content-authoring label
 *     that says an experiment calls for, e.g., 2D physics manipulation or
 *     a guided step-by-step investigation. It carries no implementation
 *     detail — no renderer name, no asset/rule/variable wiring.
 *   - InteractiveExperienceRuntime is a HOW: the actual engine mode a real,
 *     already-built `experience` record's `runtime` field selects, wired
 *     directly into lib/interactive-runtime-engine.ts and the
 *     app/components/interactive/** renderers.
 *
 * A future content pipeline can go InteractionModel -> (human/AI decision)
 * -> InteractiveExperienceRuntime + the rest of InteractiveExperienceDefinition,
 * but the two are not the same value and this file does not attempt to
 * union or map between them — see the Rhinox interactive-experiments
 * architecture note (batch: "one deliberate architectural update").
 */
export type InteractionModel =
  | "interactive-2d"
  | "interactive-3d"
  | "interactive-2d-physics"
  | "interactive-3d-physics"
  | "virtual-lab"
  | "data-simulation"
  | "guided-investigation";
