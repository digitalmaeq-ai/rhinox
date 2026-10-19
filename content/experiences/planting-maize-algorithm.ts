import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Put the Algorithm in Order (Primary 1-3, Think, Move, Code!). runtime "2d" +
// component "sequencing" selects SequencingRenderer. The slug stays
// "planting-maize-algorithm" so existing links keep working; planting maize is
// now round 2 of five.
//
// Sequencing data contract (no schema changes):
//   - a ROUND is an "environment" asset with properties.round (1, 2, ...),
//     properties.title, and optionally properties.mode "debug";
//   - each STEP is an asset with properties.round and properties.order (its
//     correct position in that round), optional properties.glyph (an emoji used
//     when there is no drawn picture) and, in a debug round, properties.shown
//     (the wrong position it starts in);
//   - one required task per round, with task id "round-N".
// Steps are deliberately listed out of order so the tray never shows the answer.
// Companion activity: content/activities/planting-maize-algorithm.ts.
export const plantingMaizeAlgorithmExperience: InteractiveExperienceDefinition = {
  id: "exp-planting-maize-algorithm",
  slug: "planting-maize-algorithm",
  title: "Put the Algorithm in Order",
  contentType: "experience",
  description:
    "An algorithm is a set of steps in the right order. Work through five rounds, from brushing teeth to getting ready for school, and fix the mistakes in a broken algorithm.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "games", "coding-games"] }],

  runtime: "2d",
  component: "sequencing",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    // ---- Round 1: Brush your teeth (4 steps) ----
    { id: "r1", type: "environment", label: "Round 1", interactive: false, visible: true, properties: { round: 1, title: "Brush your teeth" } },
    { id: "teeth-brush", type: "object", label: "Brush your teeth", description: "Scrub every tooth, front and back.", interactive: true, visible: true, properties: { round: 1, order: 3, glyph: "🪥" } },
    { id: "teeth-wet", type: "object", label: "Wet your toothbrush", description: "Hold the brush under a little water.", interactive: true, visible: true, properties: { round: 1, order: 1, glyph: "💧" } },
    { id: "teeth-rinse", type: "object", label: "Rinse your mouth", description: "Spit out the foam and rinse with water.", interactive: true, visible: true, properties: { round: 1, order: 4, glyph: "💦" } },
    { id: "teeth-paste", type: "object", label: "Put on toothpaste", description: "Squeeze a small blob onto the brush.", interactive: true, visible: true, properties: { round: 1, order: 2, glyph: "🧴" } },

    // ---- Round 2: Plant the maize (5 steps) ----
    { id: "r2", type: "environment", label: "Round 2", interactive: false, visible: true, properties: { round: 2, title: "Plant the maize" } },
    { id: "step-drop-seeds", type: "object", label: "Drop in the seeds", description: "Put two or three maize seeds in the hole.", interactive: true, visible: true, properties: { round: 2, order: 3, visual: "drop-in-the-seeds" } },
    { id: "step-clear-land", type: "object", label: "Clear the land", description: "Cut away the grass and weeds.", interactive: true, visible: true, properties: { round: 2, order: 1, visual: "clear-the-land" } },
    { id: "step-water", type: "object", label: "Water the soil", description: "Give the seeds a drink so they can grow.", interactive: true, visible: true, properties: { round: 2, order: 5, visual: "water-the-soil" } },
    { id: "step-dig-hole", type: "object", label: "Dig a small hole", description: "Make a hole in the soil for the seeds.", interactive: true, visible: true, properties: { round: 2, order: 2, visual: "dig-a-hole" } },
    { id: "step-cover", type: "object", label: "Cover with soil", description: "Push the soil back over the seeds.", interactive: true, visible: true, properties: { round: 2, order: 4, visual: "cover-with-soil" } },

    // ---- Round 3: Cook the rice (6 steps) ----
    { id: "r3", type: "environment", label: "Round 3", interactive: false, visible: true, properties: { round: 3, title: "Cook the rice" } },
    { id: "rice-cover", type: "object", label: "Cover the pot", description: "Put the lid on so the steam stays inside.", interactive: true, visible: true, properties: { round: 3, order: 4, glyph: "🍲" } },
    { id: "rice-serve", type: "object", label: "Serve on a plate", description: "Spoon the cooked rice onto a plate.", interactive: true, visible: true, properties: { round: 3, order: 6, glyph: "🍽️" } },
    { id: "rice-wash", type: "object", label: "Wash the rice", description: "Rinse the rice in clean water until it looks clear.", interactive: true, visible: true, properties: { round: 3, order: 1, glyph: "🚰" } },
    { id: "rice-add", type: "object", label: "Add the rice", description: "Pour the rice into the boiling water.", interactive: true, visible: true, properties: { round: 3, order: 3, glyph: "🍚" } },
    { id: "rice-wait", type: "object", label: "Wait until it is soft", description: "Let it cook until the grains are soft.", interactive: true, visible: true, properties: { round: 3, order: 5, glyph: "⏰" } },
    { id: "rice-boil", type: "object", label: "Boil the water", description: "Heat water in the pot until it bubbles.", interactive: true, visible: true, properties: { round: 3, order: 2, glyph: "♨️" } },

    // ---- Round 4: Debug - wash your hands (5 steps, two are swapped) ----
    { id: "r4", type: "environment", label: "Round 4", interactive: false, visible: true, properties: { round: 4, title: "Fix the mistakes", mode: "debug", intro: "This algorithm for washing hands has two steps in the wrong place. Tap one step, then tap another to swap them. Press Check when you think it is right." } },
    { id: "hands-wet", type: "object", label: "Wet your hands", description: "Hold your hands under running water.", interactive: true, visible: true, properties: { round: 4, order: 1, shown: 2, glyph: "💧" } },
    { id: "hands-soap", type: "object", label: "Add soap", description: "Rub soap onto your hands until it foams.", interactive: true, visible: true, properties: { round: 4, order: 2, shown: 1, glyph: "🧼" } },
    { id: "hands-scrub", type: "object", label: "Scrub for 20 seconds", description: "Rub your palms, backs, fingers and thumbs.", interactive: true, visible: true, properties: { round: 4, order: 3, shown: 3, glyph: "👐" } },
    { id: "hands-rinse", type: "object", label: "Rinse off the soap", description: "Wash all the soap away with clean water.", interactive: true, visible: true, properties: { round: 4, order: 4, shown: 5, glyph: "🚿" } },
    { id: "hands-dry", type: "object", label: "Dry with a clean towel", description: "Pat your hands dry.", interactive: true, visible: true, properties: { round: 4, order: 5, shown: 4, glyph: "🧻" } },

    // ---- Round 5: Final challenge - get ready for school (8 steps) ----
    { id: "r5", type: "environment", label: "Round 5", interactive: false, visible: true, properties: { round: 5, title: "Final challenge: get ready for school" } },
    { id: "school-bag", type: "object", label: "Pack your school bag", description: "Put in your books, pencil and lunch.", interactive: true, visible: true, properties: { round: 5, order: 5, glyph: "🎒" } },
    { id: "school-class", type: "object", label: "Sit in class", description: "Find your seat and get ready to learn.", interactive: true, visible: true, properties: { round: 5, order: 8, glyph: "🪑" } },
    { id: "school-wake", type: "object", label: "Wake up", description: "Open your eyes and get out of bed.", interactive: true, visible: true, properties: { round: 5, order: 1, glyph: "🛏️" } },
    { id: "school-walk", type: "object", label: "Walk to school", description: "Set off on the road, with a grown-up if you need one.", interactive: true, visible: true, properties: { round: 5, order: 7, glyph: "🚶" } },
    { id: "school-face", type: "object", label: "Wash your face", description: "Splash water on your face and dry it.", interactive: true, visible: true, properties: { round: 5, order: 2, glyph: "😊" } },
    { id: "school-breakfast", type: "object", label: "Eat breakfast", description: "Have something to eat so you have energy.", interactive: true, visible: true, properties: { round: 5, order: 4, glyph: "🥣" } },
    { id: "school-uniform", type: "object", label: "Put on your uniform", description: "Get dressed in your school clothes.", interactive: true, visible: true, properties: { round: 5, order: 3, glyph: "👕" } },
    { id: "school-wave", type: "object", label: "Say goodbye", description: "Wave to your family before you leave.", interactive: true, visible: true, properties: { round: 5, order: 6, glyph: "👋" } },
  ],

  tasks: [
    { id: "round-1", title: "Round 1: Brush your teeth", points: 20, required: true },
    { id: "round-2", title: "Round 2: Plant the maize", points: 30, required: true },
    { id: "round-3", title: "Round 3: Cook the rice", points: 40, required: true },
    { id: "round-4", title: "Round 4: Fix the mistakes", points: 50, required: true },
    { id: "round-5", title: "Round 5: Get ready for school", points: 60, required: true },
  ],

  subjects: ["coding"],
  ageGroups: ["5-6", "6-7", "7-8"],
  difficulty: "beginner",
  durationMinutes: 15,
  featured: true,
  learningObjectives: [
    "Understand that an algorithm is a set of steps in the right order.",
    "Put the steps of an everyday task in the correct sequence.",
    "Find and fix mistakes in an algorithm (debugging).",
    "Order longer algorithms of up to eight steps.",
  ],
  skills: ["Sequencing", "Debugging", "Computational thinking", "Logical reasoning"],
  achievements: [{ id: "planting-maize-algorithm-complete", title: "Algorithm Builder", description: "Put every algorithm in the right order and fixed the broken one.", points: 50 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-10-17",
};
