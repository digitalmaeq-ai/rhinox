import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const forcesMotionLab: InteractiveExperienceDefinition = {
  id: "exp-forces-and-motion",
  slug: "forces-and-motion",
  title: "Forces and Motion",
  contentType: "experience",
  description: "Push a block across ice, wood and rough ground and see how force, mass and friction decide how it moves.",
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
  component: "forces-motion",
  modes: ["interactive", "learning-tool"],
  subjects: ["physics"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "beginner",
  durationMinutes: 15,
  featured: false,
  learningObjectives: [
  "Explain that unbalanced forces change motion.",
  "Use F = m × a.",
  "Describe how friction opposes motion."
],
  skills: [
  "Observation",
  "Calculation",
  "Cause and effect"
],
  tasks: [
  {
    "id": "balanced-forces",
    "title": "Balanced forces",
    "description": "Push the block gently so friction cancels the push and it does not accelerate.",
    "instructions": [
      "Choose wood or rough ground.",
      "Use a small force."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "no-friction",
    "title": "Frictionless ice",
    "description": "Push a block on ice and watch it speed up with no friction.",
    "instructions": [
      "Choose ice.",
      "Push with 10 N or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "big-acceleration",
    "title": "Big acceleration",
    "description": "Make the block accelerate at 8 m/s² or more.",
    "instructions": [
      "Use a large force and a small mass."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "heavy-block",
    "title": "Move a heavy block",
    "description": "Move a block of 8 kg or more.",
    "instructions": [
      "Choose a large mass.",
      "Push hard enough to overcome friction."
    ],
    "points": 10,
    "required": true
  }
],
  questions: [
  {
    "id": "force-q1",
    "question": "A 4 kg block is pushed with 20 N on ice. What is its acceleration?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "2 m/s²"
      },
      {
        "id": "b",
        "text": "5 m/s²"
      },
      {
        "id": "c",
        "text": "80 m/s²"
      },
      {
        "id": "d",
        "text": "0.2 m/s²"
      }
    ],
    "correctAnswer": "b",
    "explanation": "a = F ÷ m = 20 ÷ 4 = 5 m/s².",
    "points": 10
  },
  {
    "id": "force-q2",
    "question": "When the forces on an object are balanced, the object…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Speeds up"
      },
      {
        "id": "b",
        "text": "Slows down"
      },
      {
        "id": "c",
        "text": "Keeps moving the same way or stays at rest"
      },
      {
        "id": "d",
        "text": "Falls"
      }
    ],
    "correctAnswer": "c",
    "explanation": "Balanced forces mean no change in motion.",
    "points": 10
  },
  {
    "id": "force-q3",
    "question": "Friction always acts…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "In the direction of motion"
      },
      {
        "id": "b",
        "text": "Against the motion"
      },
      {
        "id": "c",
        "text": "Upwards"
      },
      {
        "id": "d",
        "text": "Only on ice"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Friction opposes the motion of surfaces sliding over each other.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "forces-complete",
    "title": "Force Finder",
    "description": "Completed Forces and Motion.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
