import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const moonPhasesEclipses: InteractiveExperienceDefinition = {
  id: "exp-moon-phases-and-eclipses",
  slug: "moon-phases-and-eclipses",
  title: "Moon Phases and Eclipses",
  contentType: "experience",
  description: "Move the Moon around its orbit to see why it changes shape, and find out when eclipses can happen.",
  status: "active",
  taxonomy: [
  {
    "category": "interactive",
    "path": [
      "virtual-labs",
      "earth-space"
    ]
  }
],
  runtime: "simulation",
  component: "moon-phases",
  modes: ["interactive", "learning-tool"],
  subjects: ["earth-and-space"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "intermediate",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Explain that half of the Moon is always lit by the Sun.",
  "Name the main phases of the Moon in order.",
  "Explain solar and lunar eclipses.",
  "Explain why eclipses do not happen every month."
],
  skills: [
  "Spatial reasoning",
  "Modelling",
  "Cause and effect"
],
  tasks: [
  {
    "id": "new-moon",
    "title": "Find the New Moon",
    "description": "Place the Moon between the Earth and the Sun.",
    "instructions": [
      "Move the slider until the Moon is next to the Sun side."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "full-moon",
    "title": "Find the Full Moon",
    "description": "Place the Moon on the far side of the Earth from the Sun.",
    "instructions": [
      "Move the slider to the opposite side."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "first-quarter",
    "title": "Find the First Quarter",
    "description": "Find the phase where the right half of the Moon is lit.",
    "instructions": [
      "Move the Moon a quarter of the way round."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "solar-eclipse",
    "title": "Create a solar eclipse",
    "description": "Switch the orbit to flat and line the Moon up between the Sun and Earth.",
    "instructions": [
      "Set the orbit to Flat.",
      "Find the New Moon position."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "lunar-eclipse",
    "title": "Create a lunar eclipse",
    "description": "With a flat orbit, line the Earth up between the Sun and the Moon.",
    "instructions": [
      "Keep the orbit Flat.",
      "Find the Full Moon position."
    ],
    "points": 10,
    "required": true
  }
],
  questions: [
  {
    "id": "moon-q1",
    "question": "Why don't we have an eclipse every month?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "The Moon's orbit is tilted"
      },
      {
        "id": "b",
        "text": "The Sun moves"
      },
      {
        "id": "c",
        "text": "The Moon is too small"
      },
      {
        "id": "d",
        "text": "Earth's shadow disappears"
      }
    ],
    "correctAnswer": "a",
    "explanation": "The Moon's orbit is tilted about 5°, so it usually passes above or below the Sun–Earth line.",
    "points": 10
  },
  {
    "id": "moon-q2",
    "question": "Which phase occurs when the Moon is between the Earth and the Sun?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Full Moon"
      },
      {
        "id": "b",
        "text": "New Moon"
      },
      {
        "id": "c",
        "text": "First quarter"
      },
      {
        "id": "d",
        "text": "Last quarter"
      }
    ],
    "correctAnswer": "b",
    "explanation": "The side facing us is unlit, so we see a New Moon.",
    "points": 10
  },
  {
    "id": "moon-q3",
    "question": "A lunar eclipse can only happen at…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "New Moon"
      },
      {
        "id": "b",
        "text": "First quarter"
      },
      {
        "id": "c",
        "text": "Full Moon"
      },
      {
        "id": "d",
        "text": "Last quarter"
      }
    ],
    "correctAnswer": "c",
    "explanation": "Earth must be between the Sun and the Moon, which is the Full Moon position.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "moon-complete",
    "title": "Sky Watcher",
    "description": "Completed Moon Phases and Eclipses.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
