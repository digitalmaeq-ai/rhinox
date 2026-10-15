import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const projectileMotionLab: InteractiveExperienceDefinition = {
  id: "exp-projectile-motion",
  slug: "projectile-motion",
  title: "Projectile Motion",
  contentType: "experience",
  description: "Launch a ball at different angles and speeds, on Earth, Mars or the Moon, and hit a target 60 metres away.",
  status: "active",
  taxonomy: [
  {
    "category": "interactive",
    "path": [
      "virtual-labs",
      "physics"
    ]
  }
],
  runtime: "simulation",
  component: "projectile-motion",
  modes: ["interactive", "learning-tool"],
  subjects: ["physics"],
  ageGroups: ["13-15", "16-18"],
  difficulty: "intermediate",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Describe the curved path of a projectile.",
  "Explain how angle and speed change the range.",
  "Explain how gravity affects the flight.",
  "Resolve a launch into horizontal and vertical speeds.",
  "Show from your own readings that 45° gives the longest range."
],
  skills: [
  "Experimentation",
  "Prediction",
  "Cause and effect"
],
  tasks: [
  {
    "id": "hit-target",
    "title": "Hit the target",
    "description": "Adjust the angle and speed so the ball lands on the target.",
    "instructions": [
      "Change the launch speed.",
      "Change the launch angle.",
      "Aim for the green target."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "best-angle",
    "title": "Find the best angle",
    "description": "Find the angle that gives the longest range for a given speed.",
    "instructions": [
      "Set the speed to 15 m/s or more.",
      "Try angles between 30° and 60°."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "low-gravity",
    "title": "Launch on the Moon",
    "description": "See how weaker gravity changes the flight.",
    "instructions": [
      "Choose the Moon.",
      "Make the ball travel more than 100 m."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "same-range",
    "title": "Complementary angles",
    "description": "Set the angle to 60° with a speed of 20 m/s or more, then compare with 30°.",
    "instructions": [
      "Set 30° and note the range.",
      "Set 60° and compare."
    ],
    "points": 5,
    "required": false
  },
  {
    "id": "record-six",
    "title": "Record six shots",
    "description": "Fire six shots and record the range, time and height of each.",
    "instructions": [
      "Fire a shot and wait for it to land.",
      "Press Record shot.",
      "Change the angle and repeat."
    ],
    "points": 10,
    "required": false
  },
  {
    "id": "find-peak",
    "title": "Find the best angle",
    "description": "Record at least five angles at the same speed from ground level and see which goes furthest.",
    "instructions": [
      "Keep the speed and the height the same.",
      "Include angles below 35° and above 55°.",
      "Look at the range against angle graph."
    ],
    "points": 20,
    "required": false
  },
  {
    "id": "complementary-angles",
    "title": "Two angles, one range",
    "description": "Record two shots whose angles add up to 90° and land at the same distance.",
    "instructions": [
      "Use the same speed from ground level.",
      "Try 30° and 60°, or 25° and 65°."
    ],
    "points": 10,
    "required": false
  },
  {
    "id": "cliff-launch",
    "title": "Launch from a cliff",
    "description": "Fire a ball horizontally (0°) from a platform at least 10 m high.",
    "instructions": [
      "Set the launch angle to 0°.",
      "Set the launch height to 10 m or more.",
      "Press Fire."
    ],
    "points": 10,
    "required": false
  }
],
  questions: [
  {
    "id": "proj-q1",
    "question": "Which launch angle gives the greatest range on level ground?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "30°"
      },
      {
        "id": "b",
        "text": "45°"
      },
      {
        "id": "c",
        "text": "60°"
      },
      {
        "id": "d",
        "text": "90°"
      }
    ],
    "correctAnswer": "b",
    "explanation": "With no air resistance, 45° balances height and horizontal speed.",
    "points": 10
  },
  {
    "id": "proj-q2",
    "question": "Why does the ball travel much farther on the Moon?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "The Moon is smaller"
      },
      {
        "id": "b",
        "text": "Gravity is weaker so the ball stays up longer"
      },
      {
        "id": "c",
        "text": "There is no ground"
      },
      {
        "id": "d",
        "text": "The ball is lighter"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Weaker gravity pulls the ball down more slowly, so it flies for longer.",
    "points": 10
  },
  {
    "id": "proj-q3",
    "question": "During the flight, which part of the velocity stays constant (ignoring air resistance)?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Horizontal"
      },
      {
        "id": "b",
        "text": "Vertical"
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
    "explanation": "Gravity only acts downwards, so the horizontal velocity does not change.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "projectile-complete",
    "title": "Sharp Shooter",
    "description": "Completed the Projectile Motion experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
