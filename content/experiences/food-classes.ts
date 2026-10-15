import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Classes of Food (Primary 4). Content-only: runtime "2d" + component
// "drag-classification" reuses the existing renderer; only artwork was added.
// Companion activity: content/activities/food-classes.ts ("companion" edge in
// lib/relationships-graph.ts).
export const foodClassesExperience: InteractiveExperienceDefinition = {
  id: "exp-food-classes",
  slug: "food-classes",
  title: "Classes of Food",
  contentType: "experience",
  description: "Sort everyday Nigerian foods into the food class each one mostly belongs to.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "drag-classification",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    { id: "zone-carbohydrates", type: "container", label: "Carbohydrates", description: "Give us energy.", interactive: true, visible: true, properties: { icon: "energy" } },
    { id: "zone-proteins", type: "container", label: "Proteins", description: "Help us grow and repair the body.", interactive: true, visible: true, properties: { icon: "growth" } },
    { id: "zone-vitamins", type: "container", label: "Vitamins", description: "Protect us from illness.", interactive: true, visible: true, properties: { icon: "protection" } },
    { id: "zone-fats-and-oils", type: "container", label: "Fats and oils", description: "Give energy and keep us warm.", interactive: true, visible: true, properties: { icon: "oil-drop" } },
    { id: "object-yam", type: "object", label: "Yam", interactive: true, visible: true, properties: { correctZone: "zone-carbohydrates" } },
    { id: "object-beans", type: "object", label: "Beans", interactive: true, visible: true, properties: { correctZone: "zone-proteins" } },
    { id: "object-orange", type: "object", label: "Orange", interactive: true, visible: true, properties: { correctZone: "zone-vitamins" } },
    { id: "object-palm-oil", type: "object", label: "Palm oil", interactive: true, visible: true, properties: { correctZone: "zone-fats-and-oils" } },
    { id: "object-garri", type: "object", label: "Garri", interactive: true, visible: true, properties: { correctZone: "zone-carbohydrates" } },
    { id: "object-fish", type: "object", label: "Fish", interactive: true, visible: true, properties: { correctZone: "zone-proteins" } },
    { id: "object-carrot", type: "object", label: "Carrot", interactive: true, visible: true, properties: { correctZone: "zone-vitamins" } },
    { id: "object-groundnut-oil", type: "object", label: "Groundnut oil", interactive: true, visible: true, properties: { correctZone: "zone-fats-and-oils" } },
  ],

  // One required task per item (task id === item asset id).
  tasks: [
    { id: "object-yam", title: "Sort the yam", points: 10, required: true },
    { id: "object-beans", title: "Sort the beans", points: 10, required: true },
    { id: "object-orange", title: "Sort the orange", points: 10, required: true },
    { id: "object-palm-oil", title: "Sort the palm oil", points: 10, required: true },
    { id: "object-garri", title: "Sort the garri", points: 10, required: true },
    { id: "object-fish", title: "Sort the fish", points: 10, required: true },
    { id: "object-carrot", title: "Sort the carrot", points: 10, required: true },
    { id: "object-groundnut-oil", title: "Sort the groundnut oil", points: 10, required: true },
  ],

  interactions: [
    { id: "sort-correct", assetId: "zone-carbohydrates", trigger: "drop", actions: [{ id: "sort-correct-feedback", type: "show-feedback", message: "Good sorting! That food belongs in that class." }] },
    { id: "sort-incorrect", assetId: "zone-carbohydrates", trigger: "drop", actions: [{ id: "sort-incorrect-feedback", type: "show-feedback", message: "Try again. Think about what this food mostly does for the body." }] },
  ],

  subjects: ["biology"],
  ageGroups: ["8-9"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: ["Name four classes of food.", "Sort common foods into their main food class.", "Say what each food class does for the body."],
  skills: ["Classification", "Recall", "Healthy choices"],
  achievements: [{ id: "food-classes-complete", title: "Food Class Expert", description: "Sorted every food into its food class.", points: 80 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
