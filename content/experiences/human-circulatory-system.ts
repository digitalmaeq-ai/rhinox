import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const circulatorySystemLab: InteractiveExperienceDefinition = {
  id: "exp-human-circulatory-system",
  slug: "human-circulatory-system",
  title: "Human Circulatory System",
  contentType: "experience",
  description: "Follow the blood around the heart, lungs and body, and see how exercise changes your heart rate and blood flow.",
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
  component: "circulatory-system",
  modes: ["interactive", "learning-tool"],
  subjects: ["biology"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "intermediate",
  durationMinutes: 15,
  featured: false,
  learningObjectives: [
  "Describe the double circulation of blood.",
  "Distinguish oxygenated and deoxygenated blood.",
  "Explain why heart rate rises during exercise."
],
  skills: [
  "Systems thinking",
  "Observation",
  "Interpreting data"
],
  tasks: [
  {
    "id": "lung-circuit",
    "title": "Follow the lung circuit",
    "description": "Trace blood from the heart to the lungs and back.",
    "instructions": [
      "Choose “Heart → lungs → heart”."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "body-circuit",
    "title": "Follow the body circuit",
    "description": "Trace blood from the heart round the body and back.",
    "instructions": [
      "Choose “Heart → body → heart”."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "exercise",
    "title": "Exercise",
    "description": "Set the activity to jogging or sprinting and watch the heart rate rise.",
    "instructions": [
      "Choose jogging or sprinting."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "max-output",
    "title": "Maximum output",
    "description": "Reach a blood output of 15 litres per minute or more.",
    "instructions": [
      "Choose sprinting."
    ],
    "points": 5,
    "required": false
  }
],
  questions: [
  {
    "id": "circ-q1",
    "question": "Which side of the heart pumps blood to the lungs?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Right side"
      },
      {
        "id": "b",
        "text": "Left side"
      },
      {
        "id": "c",
        "text": "Both"
      },
      {
        "id": "d",
        "text": "Neither"
      }
    ],
    "correctAnswer": "a",
    "explanation": "The right side pumps deoxygenated blood to the lungs.",
    "points": 10
  },
  {
    "id": "circ-q2",
    "question": "Why does your heart rate increase during exercise?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Muscles need more oxygen and glucose"
      },
      {
        "id": "b",
        "text": "You are cooler"
      },
      {
        "id": "c",
        "text": "Blood is thicker"
      },
      {
        "id": "d",
        "text": "The lungs stop working"
      }
    ],
    "correctAnswer": "a",
    "explanation": "A faster heart delivers more oxygen to working muscles.",
    "points": 10
  },
  {
    "id": "circ-q3",
    "question": "Blood returning from the lungs is…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Rich in carbon dioxide"
      },
      {
        "id": "b",
        "text": "Rich in oxygen"
      },
      {
        "id": "c",
        "text": "Without cells"
      },
      {
        "id": "d",
        "text": "Pumped by the right side"
      }
    ],
    "correctAnswer": "b",
    "explanation": "It has picked up oxygen in the lungs and enters the left side.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "circulatory-complete",
    "title": "Heart Explorer",
    "description": "Completed the Human Circulatory System experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
