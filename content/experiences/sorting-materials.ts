import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// The interactive treatment of the "Sorting Materials" experiment
// (content/experiments/sorting-materials.ts, linked via a "companion"
// relationship in lib/relationships-graph.ts). This is a first-class
// ContentItem (contentType: "experience", engine: "runtime"), auto-loaded
// by scripts/generate-content-index.mjs and rendered through the existing
// dedicated /experiences/[slug] route — no routing or registry change was
// needed to make it discoverable.
//
// runtime: "2d" selects the drag-and-drop classification renderer
// (app/components/interactive/renderers/DragClassificationRenderer.tsx,
// wired in via app/components/interactive/runtimes/TwoDRenderer.tsx) —
// the first real implementation of the "2d" runtime slot, which
// previously only rendered a placeholder. The renderer is written
// generically against any "object"/"container" assets matched to tasks,
// not hardcoded to this experience, so future classification-style
// experiments can reuse it without any new runtime work.
export const sortingMaterialsExperience: InteractiveExperienceDefinition = {
  id: "exp-sorting-materials",
  slug: "sorting-materials",
  title: "Sorting Materials",
  contentType: "experience",
  description:
    "Drag each object into the Hard or Soft group and get instant feedback on your sorting.",
  status: "active",

  taxonomy: [
    {
      category: "interactive",
      path: ["experiences", "interactive-learning", "explorations"],
    },
  ],

  runtime: "2d",

  // Which 2D interaction renderer runs this experience (see the registry in
  // app/components/interactive/runtimes/TwoDRenderer.tsx).
  component: "drag-classification",

  modes: ["interactive", "2d", "learning-tool"],

  // "container" assets are the two drop zones a learner sorts objects
  // into. "object" assets are the ten sortable items; each carries its
  // correct zone in `properties` (the field the type system already
  // provides for this kind of domain data) so the renderer can check a
  // drop without any new asset shape.
  assets: [
    {
      id: "zone-hard",
      type: "container",
      label: "Hard",
      description: "Objects that keep their shape when pressed.",
      interactive: true,
      visible: true,
    },
    {
      id: "zone-soft",
      type: "container",
      label: "Soft",
      description: "Objects that change shape easily when pressed.",
      interactive: true,
      visible: true,
    },
    {
      id: "object-stone",
      type: "object",
      label: "Stone",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-hard" },
    },
    {
      id: "object-sponge",
      type: "object",
      label: "Sponge",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-soft" },
    },
    {
      id: "object-wooden-block",
      type: "object",
      label: "Wooden block",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-hard" },
    },
    {
      id: "object-cotton-ball",
      type: "object",
      label: "Cotton ball",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-soft" },
    },
    {
      id: "object-metal-spoon",
      type: "object",
      label: "Metal spoon",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-hard" },
    },
    {
      id: "object-rubber-ball",
      type: "object",
      label: "Rubber ball",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-soft" },
    },
    {
      id: "object-iron-nail",
      type: "object",
      label: "Iron nail",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-hard" },
    },
    {
      id: "object-glass-marble",
      type: "object",
      label: "Glass marble",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-hard" },
    },
    {
      id: "object-pillow",
      type: "object",
      label: "Pillow",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-soft" },
    },
    {
      id: "object-play-dough",
      type: "object",
      label: "Play dough",
      interactive: true,
      visible: true,
      properties: { correctZone: "zone-soft" },
    },
  ],

  // One required task per object. Reusing the existing
  // completeTask/areRequiredTasksComplete/completeExperience machinery
  // verbatim: a task is completed only when its object is dropped in its
  // correct zone, so "all required tasks complete" already means "all
  // objects correctly sorted" with no extra state model needed.
  tasks: [
    {
      id: "object-stone",
      title: "Sort the stone",
      description: "Drag the stone into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-sponge",
      title: "Sort the sponge",
      description: "Drag the sponge into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-wooden-block",
      title: "Sort the wooden block",
      description: "Drag the wooden block into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-cotton-ball",
      title: "Sort the cotton ball",
      description: "Drag the cotton ball into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-metal-spoon",
      title: "Sort the metal spoon",
      description: "Drag the metal spoon into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-rubber-ball",
      title: "Sort the rubber ball",
      description: "Drag the rubber ball into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-iron-nail",
      title: "Sort the iron nail",
      description: "Drag the iron nail into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-glass-marble",
      title: "Sort the glass marble",
      description: "Drag the glass marble into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-pillow",
      title: "Sort the pillow",
      description: "Drag the pillow into the group it belongs in.",
      points: 10,
      required: true,
    },
    {
      id: "object-play-dough",
      title: "Sort the play dough",
      description: "Drag the play dough into the group it belongs in.",
      points: 10,
      required: true,
    },
  ],

  // Two generic feedback interactions, carrying the exact required copy.
  // The renderer decides correct/incorrect itself (by comparing the
  // dropped object's properties.correctZone to the drop target) and then
  // calls actions.triggerInteraction with the matching id — the same
  // "trigger an interaction by id" mechanism executeInteractiveInteraction
  // already provides, just invoked from drag/drop instead of click.
  interactions: [
    {
      id: "sort-correct",
      assetId: "zone-hard",
      trigger: "drop",
      actions: [
        {
          id: "sort-correct-feedback",
          type: "show-feedback",
          message: "Good sorting!",
        },
      ],
    },
    {
      id: "sort-incorrect",
      assetId: "zone-hard",
      trigger: "drop",
      actions: [
        {
          id: "sort-incorrect-feedback",
          type: "show-feedback",
          message: "Try again. Look closely at the material.",
        },
      ],
    },
  ],

  subjects: ["physics"],

  ageGroups: ["5-6"],

  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,

  learningObjectives: [
    "Group everyday objects by an observable property (hard or soft).",
    "Use trial and feedback to correct a sorting mistake.",
  ],

  skills: ["Observation", "Classification", "Comparing"],

  achievements: [
    {
      id: "sorting-materials-complete",
      title: "Materials Sorter",
      description: "Correctly sorted every object in the Sorting Materials experience.",
      points: 100,
    },
  ],

  createdAt: "2026-09-26",
  updatedAt: "2026-09-26",
};
