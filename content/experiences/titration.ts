import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const titrationLab: InteractiveExperienceDefinition = {
  id: "exp-titration",
  slug: "titration",
  title: "Titration",
  contentType: "experience",
  description: "Run acid from a burette into a pipetted sample of alkali, find the end point with an indicator, and calculate the unknown concentration.",
  status: "active",
  taxonomy: [
  {
    "category": "interactive",
    "path": [
      "virtual-labs",
      "chemistry"
    ]
  }
],
  runtime: "virtual-lab",
  component: "titration",
  modes: ["interactive", "learning-tool"],
  subjects: ["chemistry"],
  ageGroups: ["16-18"],
  difficulty: "advanced",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Describe how a titration is carried out.",
  "Identify the end point using an indicator.",
  "Interpret a pH curve."
],
  skills: [
  "Precision",
  "Data interpretation",
  "Practical skills"
],
  tasks: [
  {
    "id": "start-adding",
    "title": "Start the titration",
    "description": "Add at least 10 cm³ of acid from the burette.",
    "instructions": [
      "Move the volume slider to 10 cm³ or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "end-point",
    "title": "Find the end point",
    "description": "With methyl orange, stop as soon as the yellow flask turns orange.",
    "instructions": [
      "Choose methyl orange.",
      "Add acid slowly past 24 cm³, drop by drop."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "second-indicator",
    "title": "Try phenolphthalein",
    "description": "Use phenolphthalein and watch the pink fade to colourless near the end point.",
    "instructions": [
      "Choose phenolphthalein.",
      "Add acid until the pink has gone."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "overshoot",
    "title": "Overshoot",
    "description": "Add far more acid than needed and see what happens to the pH.",
    "instructions": [
      "Add 35 cm³ or more."
    ],
    "points": 5,
    "required": false
  }
],
  questions: [
  {
    "id": "tit-q1",
    "question": "What is the pH at the end point of a strong acid and strong alkali titration?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "1"
      },
      {
        "id": "b",
        "text": "7"
      },
      {
        "id": "c",
        "text": "10"
      },
      {
        "id": "d",
        "text": "14"
      }
    ],
    "correctAnswer": "b",
    "explanation": "The solution is neutral, with a pH of 7.",
    "points": 10
  },
  {
    "id": "tit-q2",
    "question": "What is the burette used for?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Heating the flask"
      },
      {
        "id": "b",
        "text": "Measuring the volume of liquid added accurately"
      },
      {
        "id": "c",
        "text": "Mixing the solutions"
      },
      {
        "id": "d",
        "text": "Storing the indicator"
      }
    ],
    "correctAnswer": "b",
    "explanation": "A burette delivers a precisely measured volume.",
    "points": 10
  },
  {
    "id": "tit-q3",
    "question": "Phenolphthalein turns pink when the flask becomes…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Acidic"
      },
      {
        "id": "b",
        "text": "Neutral"
      },
      {
        "id": "c",
        "text": "Slightly alkaline"
      },
      {
        "id": "d",
        "text": "Very hot"
      }
    ],
    "correctAnswer": "c",
    "explanation": "It is pink in alkaline conditions and turns colourless once the solution is neutral or acidic.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "titration-complete",
    "title": "Titration Expert",
    "description": "Completed the Titration experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
