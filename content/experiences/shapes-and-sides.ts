import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";
import type { InteractiveAsset } from "@/types/interactive-assets";

// 2D Shapes and Their Sides (Primary 2-4). runtime "2d" + component
// "shape-rounds" selects ShapeRoundsRenderer. The slug stays "shapes-and-sides"
// so existing links and the companion activity keep working.
//
// Data contract (no schema changes, everything in InteractiveAsset.properties):
//   - a ROUND is an "environment" asset with properties.round, .title, and
//     .mode "sort" or "quiz";
//   - sort rounds: "container" assets are the groups (properties.round), and
//     "object" assets are the shapes (properties.round, .shape, .correctZone);
//   - quiz rounds: "object" assets with properties.q (the question) are the
//     questions, in order; .shape is the picture to show, .options is a pipe
//     separated list, .answer the right option, .optionShapes true when the
//     options are shapes, .hint and .explain are short texts;
//   - one required task per round, with task id "round-N".
// Companion activity: content/activities/shapes-and-sides.ts.

const round = (n: number, title: string, mode: "sort" | "quiz"): InteractiveAsset => ({
  id: `r${n}`,
  type: "environment",
  label: `Round ${n}`,
  interactive: false,
  visible: true,
  properties: { round: n, title, mode },
});

const zone = (n: number, key: string, label: string, description: string, icon: string): InteractiveAsset => ({
  id: `r${n}-zone-${key}`,
  type: "container",
  label,
  description,
  interactive: true,
  visible: true,
  properties: { round: n, icon },
});

const item = (n: number, shape: string, label: string, zoneKey: string): InteractiveAsset => ({
  id: `r${n}-${shape}`,
  type: "object",
  label,
  interactive: true,
  visible: true,
  properties: { round: n, shape, correctZone: `r${n}-zone-${zoneKey}` },
});

interface QuestionSpec {
  q: string;
  shape?: string;
  options: string;
  answer: string;
  optionShapes?: boolean;
  hint: string;
  explain: string;
}

const question = (n: number, index: number, spec: QuestionSpec): InteractiveAsset => ({
  id: `r${n}-q${index}`,
  type: "object",
  label: spec.q,
  interactive: true,
  visible: true,
  properties: {
    round: n,
    q: spec.q,
    shape: spec.shape ?? "",
    options: spec.options,
    answer: spec.answer,
    optionShapes: spec.optionShapes ?? false,
    hint: spec.hint,
    explain: spec.explain,
  },
});

export const shapesAndSidesExperience: InteractiveExperienceDefinition = {
  id: "exp-shapes-and-sides",
  slug: "shapes-and-sides",
  title: "2D Shapes and Their Sides",
  contentType: "experience",
  description:
    "Count sides and corners, sort shapes into groups, name them and find the odd one out. Ten rounds take you from triangles and circles to hexagons, octagons and four-sided families.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "shape-rounds",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    // ---- Round 1: sort by sides ----
    round(1, "Sort by sides", "sort"),
    zone(1, "three", "3 straight sides", "Three corners.", "triangle"),
    zone(1, "four", "4 straight sides", "Four corners.", "square"),
    zone(1, "curved", "Curved sides", "No corners.", "circle"),
    item(1, "triangle", "Triangle", "three"),
    item(1, "square", "Square", "four"),
    item(1, "circle", "Circle", "curved"),
    item(1, "rectangle", "Rectangle", "four"),
    item(1, "oval", "Oval", "curved"),
    item(1, "tall-triangle", "Tall triangle", "three"),

    // ---- Round 2: count the sides ----
    round(2, "Count the sides", "quiz"),
    question(2, 1, { q: "How many straight sides does this shape have?", shape: "triangle", options: "3|4|5|6", answer: "3", hint: "Touch each straight edge and count out loud.", explain: "A triangle has 3 sides." }),
    question(2, 2, { q: "How many straight sides does this shape have?", shape: "rectangle", options: "3|4|5|6", answer: "4", hint: "Count the long sides and the short sides.", explain: "A rectangle has 4 sides: two long and two short." }),
    question(2, 3, { q: "How many straight sides does this shape have?", shape: "pentagon", options: "4|5|6|8", answer: "5", hint: "Count slowly and keep track of where you started.", explain: "A pentagon has 5 sides." }),
    question(2, 4, { q: "How many straight sides does this shape have?", shape: "hexagon", options: "5|6|7|8", answer: "6", hint: "A hexagon is like the cells of a honeycomb.", explain: "A hexagon has 6 sides." }),

    // ---- Round 3: more sides ----
    round(3, "More sides", "sort"),
    zone(3, "three", "3 sides", "A triangle family.", "triangle"),
    zone(3, "four", "4 sides", "Four corners.", "square"),
    zone(3, "five", "5 sides", "Five corners.", "pentagon"),
    zone(3, "six", "6 or more sides", "Lots of sides.", "hexagon"),
    item(3, "triangle", "Triangle", "three"),
    item(3, "right-triangle", "Right triangle", "three"),
    item(3, "rhombus", "Rhombus", "four"),
    item(3, "trapezium", "Trapezium", "four"),
    item(3, "rectangle", "Rectangle", "four"),
    item(3, "pentagon", "Pentagon", "five"),
    item(3, "hexagon", "Hexagon", "six"),
    item(3, "octagon", "Octagon", "six"),

    // ---- Round 4: name that shape ----
    round(4, "Name that shape", "quiz"),
    question(4, 1, { q: "What is this shape called?", shape: "pentagon", options: "Pentagon|Hexagon|Octagon|Triangle", answer: "Pentagon", hint: "\"Pent\" means five.", explain: "A pentagon has 5 sides." }),
    question(4, 2, { q: "What is this shape called?", shape: "hexagon", options: "Pentagon|Hexagon|Octagon|Square", answer: "Hexagon", hint: "\"Hex\" means six.", explain: "A hexagon has 6 sides." }),
    question(4, 3, { q: "What is this shape called?", shape: "octagon", options: "Hexagon|Pentagon|Octagon|Circle", answer: "Octagon", hint: "An octopus has eight arms. \"Oct\" means eight.", explain: "An octagon has 8 sides. A stop sign is an octagon." }),
    question(4, 4, { q: "What is this shape called?", shape: "rhombus", options: "Rectangle|Rhombus|Kite|Triangle", answer: "Rhombus", hint: "It is like a square that has been pushed over. All four sides are the same length.", explain: "A rhombus has 4 sides that are all the same length." }),

    // ---- Round 5: curved or straight ----
    round(5, "Curved or straight?", "sort"),
    zone(5, "curved", "All curved", "No straight sides.", "circle"),
    zone(5, "straight", "All straight", "No curved sides.", "square"),
    zone(5, "both", "Curved and straight", "A bit of both.", "semicircle"),
    item(5, "circle", "Circle", "curved"),
    item(5, "oval", "Oval", "curved"),
    item(5, "square", "Square", "straight"),
    item(5, "star", "Star", "straight"),
    item(5, "triangle", "Triangle", "straight"),
    item(5, "hexagon", "Hexagon", "straight"),
    item(5, "semicircle", "Semicircle", "both"),
    item(5, "quarter-circle", "Quarter circle", "both"),

    // ---- Round 6: count the corners ----
    round(6, "Count the corners", "quiz"),
    question(6, 1, { q: "How many corners does this shape have?", shape: "circle", options: "0|1|2|4", answer: "0", hint: "A corner is where two straight sides meet. Does a circle have any?", explain: "A circle is one smooth curve, so it has 0 corners." }),
    question(6, 2, { q: "How many corners does this shape have?", shape: "semicircle", options: "0|1|2|3", answer: "2", hint: "Look at the two ends of the straight edge.", explain: "A semicircle has 2 corners, where the straight edge meets the curve." }),
    question(6, 3, { q: "How many corners does this shape have?", shape: "rhombus", options: "2|3|4|5", answer: "4", hint: "A shape has the same number of corners as sides, if all its sides are straight.", explain: "A rhombus has 4 corners." }),
    question(6, 4, { q: "How many corners does this shape have?", shape: "hexagon", options: "5|6|7|8", answer: "6", hint: "Count the points where two sides meet.", explain: "A hexagon has 6 corners." }),

    // ---- Round 7: odd one out ----
    round(7, "Odd one out", "quiz"),
    question(7, 1, { q: "Which shape does NOT have 4 sides?", options: "square|rectangle|triangle|rhombus", optionShapes: true, answer: "triangle", hint: "Count the sides of each one.", explain: "A triangle has 3 sides. The others have 4." }),
    question(7, 2, { q: "Which shape has NO corners?", options: "square|triangle|circle|hexagon", optionShapes: true, answer: "circle", hint: "Look for the smooth shape.", explain: "A circle has no corners." }),
    question(7, 3, { q: "Which shape has the MOST sides?", options: "pentagon|octagon|hexagon|square", optionShapes: true, answer: "octagon", hint: "Pentagon 5, hexagon 6, octagon 8. Which is biggest?", explain: "An octagon has 8 sides, more than the others." }),
    question(7, 4, { q: "Which shape has a curved side?", options: "semicircle|trapezium|kite|pentagon", optionShapes: true, answer: "semicircle", hint: "Three of these have only straight sides.", explain: "A semicircle has one curved side and one straight side." }),

    // ---- Round 8: four-sided families ----
    round(8, "Four-sided families", "sort"),
    zone(8, "equal", "All 4 sides the same", "Every side is equally long.", "square"),
    zone(8, "opposite", "Opposite sides the same", "Two long sides, two short sides.", "rectangle"),
    zone(8, "other", "Other 4-sided shapes", "Sides are not matching in pairs across.", "trapezium"),
    item(8, "square", "Square", "equal"),
    item(8, "rhombus", "Rhombus", "equal"),
    item(8, "rectangle", "Rectangle", "opposite"),
    item(8, "parallelogram", "Parallelogram", "opposite"),
    item(8, "kite", "Kite", "other"),
    item(8, "trapezium", "Trapezium", "other"),

    // ---- Round 9: shape facts ----
    round(9, "Shape facts challenge", "quiz"),
    question(9, 1, { q: "How many straight sides does a circle have?", shape: "circle", options: "0|1|2|4", answer: "0", hint: "Is the edge of a circle straight or curved?", explain: "A circle has 0 straight sides." }),
    question(9, 2, { q: "True or false: a square and a rectangle both have 4 sides.", options: "True|False", answer: "True", hint: "Count the sides of each.", explain: "True. Both have 4 sides." }),
    question(9, 3, { q: "A hexagon has one more side than a pentagon. How many sides does a hexagon have?", options: "5|6|7|8", answer: "6", hint: "A pentagon has 5 sides. Add one.", explain: "5 + 1 = 6 sides." }),
    question(9, 4, { q: "I have 3 corners and 3 straight sides. What am I?", options: "Triangle|Square|Circle|Hexagon", answer: "Triangle", hint: "Which shape has exactly three sides?", explain: "A triangle has 3 corners and 3 sides." }),
    question(9, 5, { q: "True or false: an oval has straight sides.", shape: "oval", options: "True|False", answer: "False", hint: "Run your finger around the edge. Is it straight anywhere?", explain: "False. An oval is all curved." }),
    question(9, 6, { q: "I have 8 straight sides. Which shape am I?", options: "Octagon|Hexagon|Pentagon|Square", answer: "Octagon", hint: "Think of the octopus.", explain: "An octagon has 8 sides." }),

    // ---- Round 10: grand challenge ----
    round(10, "Grand challenge", "sort"),
    zone(10, "three", "3 sides", "Three corners.", "triangle"),
    zone(10, "four", "4 sides", "Four corners.", "square"),
    zone(10, "many", "5 or more sides", "Five, six, eight...", "hexagon"),
    zone(10, "curved", "Curved", "No straight sides.", "circle"),
    item(10, "octagon", "Octagon", "many"),
    item(10, "triangle", "Triangle", "three"),
    item(10, "oval", "Oval", "curved"),
    item(10, "trapezium", "Trapezium", "four"),
    item(10, "pentagon", "Pentagon", "many"),
    item(10, "right-triangle", "Right triangle", "three"),
    item(10, "circle", "Circle", "curved"),
    item(10, "rhombus", "Rhombus", "four"),
    item(10, "hexagon", "Hexagon", "many"),
    item(10, "square", "Square", "four"),
  ],

  tasks: [
    { id: "round-1", title: "Round 1: Sort by sides", points: 20, required: true },
    { id: "round-2", title: "Round 2: Count the sides", points: 20, required: true },
    { id: "round-3", title: "Round 3: More sides", points: 30, required: true },
    { id: "round-4", title: "Round 4: Name that shape", points: 30, required: true },
    { id: "round-5", title: "Round 5: Curved or straight?", points: 40, required: true },
    { id: "round-6", title: "Round 6: Count the corners", points: 40, required: true },
    { id: "round-7", title: "Round 7: Odd one out", points: 50, required: true },
    { id: "round-8", title: "Round 8: Four-sided families", points: 60, required: true },
    { id: "round-9", title: "Round 9: Shape facts challenge", points: 70, required: true },
    { id: "round-10", title: "Round 10: Grand challenge", points: 80, required: true },
  ],

  subjects: ["mathematics"],
  ageGroups: ["6-7", "7-8", "8-9"],
  difficulty: "beginner",
  durationMinutes: 25,
  featured: true,
  learningObjectives: [
    "Count the sides and corners of 2D shapes.",
    "Sort shapes by the number and type of sides.",
    "Name common shapes, including pentagons, hexagons and octagons.",
    "Tell apart straight, curved and mixed shapes, and the four-sided families.",
  ],
  skills: ["Counting", "Classification", "Observation", "Reasoning"],
  achievements: [{ id: "shapes-and-sides-complete", title: "Shape Spotter", description: "Finished all ten rounds of shapes and their sides.", points: 60 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-10-17",
};
