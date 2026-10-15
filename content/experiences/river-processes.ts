import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const riverProcessesLab: InteractiveExperienceDefinition = {
  id: "exp-river-processes",
  slug: "river-processes",
  title: "River Processes",
  contentType: "experience",
  description: "Explore the upper, middle and lower course of a river and see how erosion, transport and deposition shape the land.",
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
  component: "river-processes",
  modes: ["interactive", "learning-tool"],
  subjects: ["earth-and-space"],
  ageGroups: ["13-15"],
  difficulty: "intermediate",
  durationMinutes: 15,
  featured: false,
  learningObjectives: [
  "Describe erosion, transport and deposition.",
  "Compare the three courses of a river.",
  "Explain why rivers flood."
],
  skills: [
  "Observation",
  "Comparing",
  "Cause and effect"
],
  tasks: [
  {
    "id": "upper-course",
    "title": "Visit the upper course",
    "description": "See the steep, V-shaped valley with plenty of flow.",
    "instructions": [
      "Choose Upper course.",
      "Raise the flow to 3 or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "middle-course",
    "title": "Visit the middle course",
    "description": "See the wider valley with plenty of flow.",
    "instructions": [
      "Choose Middle course.",
      "Raise the flow to 3 or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "lower-course",
    "title": "Visit the lower course",
    "description": "See the flat flood plain with plenty of flow.",
    "instructions": [
      "Choose Lower course.",
      "Raise the flow to 3 or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "cause-flood",
    "title": "Cause a flood",
    "description": "Raise the flow in the lower course until the river floods.",
    "instructions": [
      "Choose Lower course.",
      "Increase the flow."
    ],
    "points": 10,
    "required": true
  }
],
  questions: [
  {
    "id": "river-q1",
    "question": "Which process mainly forms a V-shaped valley?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Deposition"
      },
      {
        "id": "b",
        "text": "Vertical erosion"
      },
      {
        "id": "c",
        "text": "Evaporation"
      },
      {
        "id": "d",
        "text": "Weathering by wind"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Fast water cuts downwards in the steep upper course.",
    "points": 10
  },
  {
    "id": "river-q2",
    "question": "Where does most deposition happen?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Upper course"
      },
      {
        "id": "b",
        "text": "Waterfall"
      },
      {
        "id": "c",
        "text": "Lower course"
      },
      {
        "id": "d",
        "text": "Source"
      }
    ],
    "correctAnswer": "c",
    "explanation": "The slow, wide river drops fine silt.",
    "points": 10
  },
  {
    "id": "river-q3",
    "question": "Sediment gets smaller downstream because…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Rocks are knocked together and worn down"
      },
      {
        "id": "b",
        "text": "Rivers get colder"
      },
      {
        "id": "c",
        "text": "Gravity weakens"
      },
      {
        "id": "d",
        "text": "Plants grow"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Attrition rounds and breaks rocks into smaller pieces.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "river-complete",
    "title": "River Guide",
    "description": "Completed River Processes.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
