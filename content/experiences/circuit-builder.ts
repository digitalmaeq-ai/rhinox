import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Circuit Builder. runtime "2d" + component "circuit-builder" selects
// CircuitBuilder. The circuit model and the seven challenges live in
// lib/circuit-builder/engine.ts; each challenge is one required task whose id
// matches the challenge id.
export const circuitBuilderExperience: InteractiveExperienceDefinition = {
  id: "exp-circuit-builder",
  slug: "circuit-builder",
  title: "Circuit Builder",
  contentType: "experience",
  description:
    "Drag cells, bulbs, switches, buzzers and wires into a loop and watch the current flow. Compare series and parallel circuits, blow a bulb with too much voltage, and see what a short circuit really does.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "games", "science-games"] }],

  runtime: "2d",
  component: "circuit-builder",
  modes: ["interactive", "game", "learning-tool"],

  tasks: [
    { id: "light-bulb", title: "Light the bulb", description: "Build a complete loop with a cell, a bulb and wire.", points: 10, required: true },
    { id: "switch", title: "Add a switch", description: "Put a switch in the loop and use it to turn the bulb on and off.", points: 10, required: true },
    { id: "brighter", title: "Make it brighter", description: "Reach full brightness without blowing the bulb.", points: 15, required: true },
    { id: "buzzer-bulb", title: "Bulb and buzzer", description: "Make a bulb glow and a buzzer sound together.", points: 15, required: true },
    { id: "series-dim", title: "Two bulbs in series", description: "Light two bulbs in one line and see how bright each is.", points: 15, required: true },
    { id: "parallel", title: "Bulbs in parallel", description: "Light two bulbs side by side at full brightness.", points: 20, required: true },
    { id: "short-circuit", title: "Cause a short circuit", description: "Put a wire across a bulb and watch it go out.", points: 15, required: true },
  ],

  subjects: ["physics"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "intermediate",
  durationMinutes: 15,
  featured: true,
  learningObjectives: [
    "Build a complete circuit and explain why a gap stops the current.",
    "Use a switch to control a circuit.",
    "Compare bulbs connected in series and in parallel.",
    "Explain how more cells give more voltage and brighter bulbs.",
    "Describe what a short circuit is and why it is dangerous.",
  ],
  skills: ["Building", "Cause and effect", "Scientific reasoning", "Problem solving"],
  achievements: [
    { id: "circuit-builder-complete", title: "Circuit Engineer", description: "Completed all seven circuit challenges.", points: 40 },
  ],
  createdAt: "2026-10-15",
  updatedAt: "2026-10-15",
};
