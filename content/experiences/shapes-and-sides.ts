import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// 2D Shapes and Their Sides (Primary 2). Content-only: runtime "2d" + component
// "drag-classification" reuses the existing renderer; only artwork was added.
// Companion activity: content/activities/shapes-and-sides.ts ("companion" edge in
// lib/relationships-graph.ts).
export const shapesAndSidesExperience: InteractiveExperienceDefinition = {
  id: "exp-shapes-and-sides",
  slug: "shapes-and-sides",
  title: "2D Shapes and Their Sides",
  contentType: "experience",
  description: "Sort flat shapes by their sides: three straight sides, four straight sides, or curved with no corners.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "drag-classification",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    { id: "zone-three-sides", type: "container", label: "3 straight sides", description: "Three corners.", interactive: true, visible: true, properties: { icon: "triangle" } },
    { id: "zone-four-sides", type: "container", label: "4 straight sides", description: "Four corners.", interactive: true, visible: true, properties: { icon: "square" } },
    { id: "zone-curved", type: "container", label: "Curved sides", description: "No corners.", interactive: true, visible: true, properties: { icon: "circle" } },
    { id: "object-triangle", type: "object", label: "Triangle", interactive: true, visible: true, properties: { correctZone: "zone-three-sides" } },
    { id: "object-square", type: "object", label: "Square", interactive: true, visible: true, properties: { correctZone: "zone-four-sides" } },
    { id: "object-circle", type: "object", label: "Circle", interactive: true, visible: true, properties: { correctZone: "zone-curved" } },
    { id: "object-rectangle", type: "object", label: "Rectangle", interactive: true, visible: true, properties: { correctZone: "zone-four-sides" } },
    { id: "object-oval", type: "object", label: "Oval", interactive: true, visible: true, properties: { correctZone: "zone-curved" } },
    { id: "object-tall-triangle", type: "object", label: "Tall triangle", interactive: true, visible: true, properties: { correctZone: "zone-three-sides" } },
  ],

  // One required task per item (task id === item asset id).
  tasks: [
    { id: "object-triangle", title: "Sort the triangle", points: 10, required: true },
    { id: "object-square", title: "Sort the square", points: 10, required: true },
    { id: "object-circle", title: "Sort the circle", points: 10, required: true },
    { id: "object-rectangle", title: "Sort the rectangle", points: 10, required: true },
    { id: "object-oval", title: "Sort the oval", points: 10, required: true },
    { id: "object-tall-triangle", title: "Sort the tall triangle", points: 10, required: true },
  ],

  interactions: [
    { id: "sort-correct", assetId: "zone-three-sides", trigger: "drop", actions: [{ id: "sort-correct-feedback", type: "show-feedback", message: "Good sorting! You counted the sides correctly." }] },
    { id: "sort-incorrect", assetId: "zone-three-sides", trigger: "drop", actions: [{ id: "sort-incorrect-feedback", type: "show-feedback", message: "Try again. Count the straight sides carefully." }] },
  ],

  subjects: ["mathematics"],
  ageGroups: ["6-7"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: ["Count the sides and corners of 2D shapes.", "Sort shapes by the number and type of sides."],
  skills: ["Counting", "Classification", "Observation"],
  achievements: [{ id: "shapes-and-sides-complete", title: "Shape Spotter", description: "Sorted every shape by its sides.", points: 60 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
