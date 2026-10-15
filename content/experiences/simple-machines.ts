import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Simple Machines Around Us (JSS 1). Content-only: runtime "2d" + component
// "drag-classification" reuses the existing renderer; only artwork was added.
// Companion activity: content/activities/simple-machines.ts ("companion" edge in
// lib/relationships-graph.ts).
export const simpleMachinesExperience: InteractiveExperienceDefinition = {
  id: "exp-simple-machines",
  slug: "simple-machines",
  title: "Simple Machines Around Us",
  contentType: "experience",
  description: "Sort everyday objects into the type of simple machine they use.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "drag-classification",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    { id: "zone-lever", type: "container", label: "Lever", description: "A bar that turns on a pivot.", interactive: true, visible: true, properties: { icon: "lever" } },
    { id: "zone-pulley", type: "container", label: "Pulley", description: "A rope over a turning wheel.", interactive: true, visible: true, properties: { icon: "pulley" } },
    { id: "zone-inclined-plane", type: "container", label: "Inclined plane", description: "A sloping surface.", interactive: true, visible: true, properties: { icon: "ramp" } },
    { id: "zone-wheel-and-axle", type: "container", label: "Wheel and axle", description: "A wheel fixed to a rod that turns with it.", interactive: true, visible: true, properties: { icon: "wheel" } },
    { id: "object-see-saw", type: "object", label: "See-saw", interactive: true, visible: true, properties: { correctZone: "zone-lever" } },
    { id: "object-flagpole", type: "object", label: "Flagpole", interactive: true, visible: true, properties: { correctZone: "zone-pulley" } },
    { id: "object-ramp", type: "object", label: "Ramp", interactive: true, visible: true, properties: { correctZone: "zone-inclined-plane" } },
    { id: "object-door-knob", type: "object", label: "Door knob", interactive: true, visible: true, properties: { correctZone: "zone-wheel-and-axle" } },
    { id: "object-bottle-opener", type: "object", label: "Bottle opener", interactive: true, visible: true, properties: { correctZone: "zone-lever" } },
    { id: "object-well-bucket", type: "object", label: "Well bucket", interactive: true, visible: true, properties: { correctZone: "zone-pulley" } },
    { id: "object-slide", type: "object", label: "Slide", interactive: true, visible: true, properties: { correctZone: "zone-inclined-plane" } },
    { id: "object-steering-wheel", type: "object", label: "Steering wheel", interactive: true, visible: true, properties: { correctZone: "zone-wheel-and-axle" } },
  ],

  // One required task per item (task id === item asset id).
  tasks: [
    { id: "object-see-saw", title: "Sort the see-saw", points: 10, required: true },
    { id: "object-flagpole", title: "Sort the flagpole", points: 10, required: true },
    { id: "object-ramp", title: "Sort the ramp", points: 10, required: true },
    { id: "object-door-knob", title: "Sort the door knob", points: 10, required: true },
    { id: "object-bottle-opener", title: "Sort the bottle opener", points: 10, required: true },
    { id: "object-well-bucket", title: "Sort the well bucket", points: 10, required: true },
    { id: "object-slide", title: "Sort the slide", points: 10, required: true },
    { id: "object-steering-wheel", title: "Sort the steering wheel", points: 10, required: true },
  ],

  interactions: [
    { id: "sort-correct", assetId: "zone-lever", trigger: "drop", actions: [{ id: "sort-correct-feedback", type: "show-feedback", message: "Good sorting! That object uses that simple machine." }] },
    { id: "sort-incorrect", assetId: "zone-lever", trigger: "drop", actions: [{ id: "sort-incorrect-feedback", type: "show-feedback", message: "Try again. Look at how the object moves or lifts a load." }] },
  ],

  subjects: ["engineering"],
  ageGroups: ["10-12"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: ["Identify four types of simple machine.", "Classify everyday objects by the simple machine they use."],
  skills: ["Classification", "Observation", "Technical reasoning"],
  achievements: [{ id: "simple-machines-complete", title: "Machine Detective", description: "Sorted every object by its simple machine.", points: 80 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
