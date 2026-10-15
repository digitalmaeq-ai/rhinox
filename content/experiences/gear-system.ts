import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const gearSystemLab: InteractiveExperienceDefinition = {
  id: "exp-gear-system",
  slug: "gear-system",
  title: "Gear System",
  contentType: "experience",
  description: "Change the size of meshing gears and add an idler to discover how gear ratios change speed, force and direction.",
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
  component: "gear-system",
  modes: ["interactive", "learning-tool"],
  subjects: ["engineering"],
  ageGroups: ["13-15", "16-18"],
  difficulty: "intermediate",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Calculate a gear ratio from tooth counts.",
  "Explain the trade-off between speed and turning force.",
  "Describe what an idler gear does."
],
  skills: [
  "Design thinking",
  "Ratio reasoning",
  "Problem solving"
],
  tasks: [
  {
    "id": "speed-up",
    "title": "Speed it up",
    "description": "Make the output gear turn faster than the driver.",
    "instructions": [
      "Give the driven gear fewer teeth than the driver."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "slow-down",
    "title": "More force",
    "description": "Make the output turn at half the speed or slower, giving more turning force.",
    "instructions": [
      "Give the driven gear at least twice as many teeth."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "add-idler",
    "title": "Add an idler",
    "description": "Add an idler gear and see what it does to the direction.",
    "instructions": [
      "Turn on the idler gear."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "three-to-one",
    "title": "Build a 3 : 1 reduction",
    "description": "Set the gears so the driver turns three times for each turn of the driven gear.",
    "instructions": [
      "Choose a driven gear with three times the teeth, such as 10 and 30."
    ],
    "points": 10,
    "required": true
  }
],
  questions: [
  {
    "id": "gear-q1",
    "question": "A 20-tooth driver turns at 60 rpm and drives a 40-tooth gear. How fast does the driven gear turn?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "30 rpm"
      },
      {
        "id": "b",
        "text": "60 rpm"
      },
      {
        "id": "c",
        "text": "120 rpm"
      },
      {
        "id": "d",
        "text": "20 rpm"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Speed is divided by the ratio: 60 × 20 ÷ 40 = 30 rpm.",
    "points": 10
  },
  {
    "id": "gear-q2",
    "question": "What does an idler gear do?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Changes the speed ratio"
      },
      {
        "id": "b",
        "text": "Reverses the direction without changing the ratio"
      },
      {
        "id": "c",
        "text": "Stores energy"
      },
      {
        "id": "d",
        "text": "Doubles the torque"
      }
    ],
    "correctAnswer": "b",
    "explanation": "The idler's tooth count cancels out, so it only changes the direction of rotation.",
    "points": 10
  },
  {
    "id": "gear-q3",
    "question": "A small gear driving a large gear gives…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "More speed, less force"
      },
      {
        "id": "b",
        "text": "More force, less speed"
      },
      {
        "id": "c",
        "text": "No change"
      },
      {
        "id": "d",
        "text": "Faster rotation and more force"
      }
    ],
    "correctAnswer": "b",
    "explanation": "The large gear turns slower but with more turning force (torque).",
    "points": 10
  }
],
  achievements: [
  {
    "id": "gear-system-complete",
    "title": "Gear Engineer",
    "description": "Completed the Gear System experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
