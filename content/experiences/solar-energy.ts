import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const solarEnergyLab: InteractiveExperienceDefinition = {
  id: "exp-solar-energy",
  slug: "solar-energy",
  title: "Solar Energy",
  contentType: "experience",
  description: "Place solar panels on a roof and see how time of day, tilt and cloud cover change the electricity produced.",
  status: "active",
  taxonomy: [
  {
    "category": "interactive",
    "path": [
      "virtual-labs",
      "engineering"
    ]
  }
],
  runtime: "simulation",
  component: "solar-energy",
  modes: ["interactive", "learning-tool"],
  subjects: ["engineering"],
  ageGroups: ["13-15", "16-18"],
  difficulty: "intermediate",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Explain how solar panels make electricity.",
  "Describe how angle and cloud affect output.",
  "Evaluate solar energy as a renewable source."
],
  skills: [
  "Systems thinking",
  "Optimisation",
  "Interpreting data"
],
  tasks: [
  {
    "id": "power-home",
    "title": "Power the home",
    "description": "Produce 1,000 W or more.",
    "instructions": [
      "Add panels.",
      "Choose a sunny time of day."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "tilt-panels",
    "title": "Tilt for the Sun",
    "description": "Tilt the panels so they face the Sun directly.",
    "instructions": [
      "Tilt the panels by 20° or more.",
      "Watch the efficiency reading."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "cloudy-day",
    "title": "A cloudy day",
    "description": "Add 70% cloud in the middle of the day and see the output fall.",
    "instructions": [
      "Set cloud to 70% or more.",
      "Choose a time near noon."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "night-time",
    "title": "Night time",
    "description": "See what happens when the Sun goes down.",
    "instructions": [
      "Set the time before 6 am or after 6 pm."
    ],
    "points": 5,
    "required": false
  }
],
  questions: [
  {
    "id": "solar-q1",
    "question": "Solar panels change…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Light into electricity"
      },
      {
        "id": "b",
        "text": "Wind into heat"
      },
      {
        "id": "c",
        "text": "Water into steam"
      },
      {
        "id": "d",
        "text": "Heat into light"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Photovoltaic cells convert sunlight directly into electrical energy.",
    "points": 10
  },
  {
    "id": "solar-q2",
    "question": "Why is solar output lower on a cloudy day?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Clouds block sunlight"
      },
      {
        "id": "b",
        "text": "Panels get colder"
      },
      {
        "id": "c",
        "text": "The Sun is smaller"
      },
      {
        "id": "d",
        "text": "Electricity is heavier"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Less sunlight reaches the cells.",
    "points": 10
  },
  {
    "id": "solar-q3",
    "question": "Solar energy is called renewable because…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "It is expensive"
      },
      {
        "id": "b",
        "text": "The Sun will not run out in our lifetime"
      },
      {
        "id": "c",
        "text": "It is stored in coal"
      },
      {
        "id": "d",
        "text": "It uses fuel"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Sunlight is continually supplied.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "solar-complete",
    "title": "Solar Engineer",
    "description": "Completed the Solar Energy experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
