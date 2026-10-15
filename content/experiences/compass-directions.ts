import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Compass Directions: Label the Village Map (Primary 4 Social Studies).
// runtime "2d" + component "labelling" selects LabellingRenderer.
//
// Labelling data contract (no schema changes):
//   - the DIAGRAM is the asset of type "image" (art from properties.visual);
//   - each LABEL carries the spot it belongs on in properties.correctTarget;
//   - each SPOT is placed on the diagram with x / y as percentages;
//   - one required task per label (task id === label asset id);
//   - "label-correct" / "label-incorrect" feedback interactions.
// The clue in each label's description names a direction, so learners
// must read the compass rose to find the right place.
// Companion activity: content/activities/compass-directions.ts.
export const compassDirectionsExperience: InteractiveExperienceDefinition = {
  id: "exp-compass-directions",
  slug: "compass-directions",
  title: "Compass Directions: Label the Village Map",
  contentType: "experience",
  description:
    "The market is in the middle of the village. Use the compass rose to find north, south, east and west, then put each place where it belongs.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "labelling",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    { id: "diagram-village-map", type: "image", label: "Map of a village with the market in the centre and a compass rose", interactive: false, visible: true, properties: { visual: "village-map" } },

    { id: "spot-north", type: "container", label: "North plot", x: 50, y: 18, interactive: true, visible: true },
    { id: "spot-east", type: "container", label: "East plot", x: 82, y: 50, interactive: true, visible: true },
    { id: "spot-south", type: "container", label: "South plot", x: 50, y: 82, interactive: true, visible: true },
    { id: "spot-west", type: "container", label: "West plot", x: 18, y: 50, interactive: true, visible: true },

    { id: "label-hospital", type: "object", label: "Hospital", description: "The hospital is east of the market.", interactive: true, visible: true, properties: { correctTarget: "spot-east", visual: "hospital" } },
    { id: "label-school", type: "object", label: "School", description: "The school is north of the market.", interactive: true, visible: true, properties: { correctTarget: "spot-north", visual: "school" } },
    { id: "label-farm", type: "object", label: "Farm", description: "The farm is west of the market.", interactive: true, visible: true, properties: { correctTarget: "spot-west", visual: "farm" } },
    { id: "label-river", type: "object", label: "River", description: "The river is south of the market.", interactive: true, visible: true, properties: { correctTarget: "spot-south", visual: "river" } },
  ],

  tasks: [
    { id: "label-school", title: "Label: School", points: 10, required: true },
    { id: "label-hospital", title: "Label: Hospital", points: 10, required: true },
    { id: "label-river", title: "Label: River", points: 10, required: true },
    { id: "label-farm", title: "Label: Farm", points: 10, required: true },
  ],

  interactions: [
    { id: "label-correct", assetId: "label-school", trigger: "drop", actions: [{ id: "label-correct-feedback", type: "show-feedback", message: "Correct! You found the right direction." }] },
    { id: "label-incorrect", assetId: "label-school", trigger: "drop", actions: [{ id: "label-incorrect-feedback", type: "show-feedback", message: "Not there. Check the compass rose: N is north, E is east, S is south and W is west." }] },
  ],

  subjects: ["earth-and-space"],
  ageGroups: ["8-9"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: [
    "Name the four cardinal points: north, south, east and west.",
    "Use a compass rose to find directions on a map.",
    "Describe where places are using compass directions.",
  ],
  skills: ["Map reading", "Using directions", "Spatial reasoning"],
  achievements: [{ id: "compass-directions-complete", title: "Map Reader", description: "Placed every label in the right direction on the map.", points: 50 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
