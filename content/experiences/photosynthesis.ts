import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const photosynthesisLab: InteractiveExperienceDefinition = {
  id: "exp-photosynthesis",
  slug: "photosynthesis",
  title: "Photosynthesis Lab",
  contentType: "experience",
  description: "Change the light, carbon dioxide and temperature around a pondweed and watch how the rate of photosynthesis responds.",
  status: "active",
  taxonomy: [
  {
    "category": "interactive",
    "path": [
      "virtual-labs",
      "biology"
    ]
  }
],
  runtime: "simulation",
  component: "photosynthesis",
  modes: ["interactive", "learning-tool"],
  subjects: ["biology"],
  ageGroups: ["13-15", "16-18"],
  difficulty: "intermediate",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "State what plants need for photosynthesis.",
  "Explain how light, carbon dioxide and temperature affect the rate.",
  "Identify the limiting factor.",
  "Explain why very high temperatures slow photosynthesis."
],
  skills: [
  "Investigation",
  "Interpreting data",
  "Cause and effect"
],
  tasks: [
  {
    "id": "switch-on-light",
    "title": "Switch on the lamp",
    "description": "Turn the light on and watch for oxygen bubbles.",
    "instructions": [
      "Raise the light intensity above 0."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "co2-limits",
    "title": "Spot a limiting factor",
    "description": "Show that bright light does not help when there is little carbon dioxide.",
    "instructions": [
      "Set light to 80% or more.",
      "Set carbon dioxide to 30% or less."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "maximum-rate",
    "title": "Reach the maximum rate",
    "description": "Set all three factors so the rate reaches 90% or more.",
    "instructions": [
      "Raise light and carbon dioxide.",
      "Keep the water near 30°C."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "too-hot",
    "title": "Too hot",
    "description": "Heat the water above 40°C with plenty of light and carbon dioxide and see what happens to the rate.",
    "instructions": [
      "Set light and carbon dioxide to 70% or more.",
      "Raise the temperature to 40°C or more."
    ],
    "points": 10,
    "required": true
  }
],
  questions: [
  {
    "id": "ps-q1",
    "question": "Which gas do plants take in for photosynthesis?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Oxygen"
      },
      {
        "id": "b",
        "text": "Nitrogen"
      },
      {
        "id": "c",
        "text": "Carbon dioxide"
      },
      {
        "id": "d",
        "text": "Hydrogen"
      }
    ],
    "correctAnswer": "c",
    "explanation": "Plants use carbon dioxide and water to make glucose.",
    "points": 10
  },
  {
    "id": "ps-q2",
    "question": "Light is increased but the rate stops rising. What does this mean?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Photosynthesis has stopped"
      },
      {
        "id": "b",
        "text": "Another factor is now limiting the rate"
      },
      {
        "id": "c",
        "text": "The plant is dead"
      },
      {
        "id": "d",
        "text": "Light is no longer needed"
      }
    ],
    "correctAnswer": "b",
    "explanation": "When another factor is in short supply it limits the rate, however much light there is.",
    "points": 10
  },
  {
    "id": "ps-q3",
    "question": "Why does the rate fall at very high temperatures?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Enzymes are denatured"
      },
      {
        "id": "b",
        "text": "There is more oxygen"
      },
      {
        "id": "c",
        "text": "The light dims"
      },
      {
        "id": "d",
        "text": "The water evaporates"
      }
    ],
    "correctAnswer": "a",
    "explanation": "High temperatures change the shape of the enzymes, so they stop working.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "photosynthesis-complete",
    "title": "Leaf Scientist",
    "description": "Completed the Photosynthesis Lab.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
