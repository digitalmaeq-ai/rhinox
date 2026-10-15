import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const foodTestsLab: InteractiveExperienceDefinition = {
  id: "exp-food-tests",
  slug: "food-tests",
  title: "Food Tests",
  contentType: "experience",
  description: "Test everyday foods for starch, sugar, protein, fat and vitamin C using the standard laboratory reagents.",
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
  runtime: "virtual-lab",
  component: "food-tests",
  modes: ["interactive", "learning-tool"],
  subjects: ["biology"],
  ageGroups: ["13-15"],
  difficulty: "beginner",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Name the reagent for each nutrient.",
  "Record positive and negative results.",
  "Explain why Benedict's test needs heating.",
  "Compare amounts of vitamin C by counting DCPIP drops.",
  "Identify what unknown samples contain from their test results."
],
  skills: [
  "Practical skills",
  "Observation",
  "Classification"
],
  tasks: [
  {
    "id": "find-starch",
    "title": "Test for starch",
    "description": "Get a positive iodine test.",
    "instructions": [
      "Choose iodine.",
      "Try yam or beans."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "find-sugar",
    "title": "Test for sugar",
    "description": "Get a positive Benedict's test.",
    "instructions": [
      "Choose Benedict's.",
      "Heat the tube.",
      "Try orange juice or glucose."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "find-protein",
    "title": "Test for protein",
    "description": "Get a positive Biuret test.",
    "instructions": [
      "Choose Biuret.",
      "Try egg white or beans."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "find-fat",
    "title": "Test for fat",
    "description": "Get a positive ethanol emulsion test.",
    "instructions": [
      "Choose the ethanol test.",
      "Try groundnut."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "find-vitamin-c",
    "title": "Test for vitamin C",
    "description": "Get a positive DCPIP test.",
    "instructions": [
      "Choose DCPIP.",
      "Try orange juice."
    ],
    "points": 5,
    "required": false
  },
  {
    "id": "sucrose-trick",
    "title": "Catch the sugar that hides",
    "description": "Show that table sugar gives a positive Benedict's test only after it is broken down with acid.",
    "instructions": [
      "Choose table sugar solution and Benedict's.",
      "Test it first: it stays blue.",
      "Turn on acid hydrolysis, then add the reagent and heat."
    ],
    "points": 10,
    "required": false
  },
  {
    "id": "record-five",
    "title": "Record five tests",
    "description": "Write five results in your record table.",
    "instructions": [
      "Do a test and press Record result.",
      "Say what you think the result shows."
    ],
    "points": 10,
    "required": false
  },
  {
    "id": "identify-unknowns",
    "title": "Name the mystery samples",
    "description": "Correctly identify the contents of three unknown samples.",
    "instructions": [
      "Open Unknown samples.",
      "Test each sample with the five reagents.",
      "Tick what each contains and check your answers."
    ],
    "points": 20,
    "required": false
  }
],
  questions: [
  {
    "id": "food-q1",
    "question": "What colour does iodine turn when starch is present?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Blue-black"
      },
      {
        "id": "b",
        "text": "Brick-red"
      },
      {
        "id": "c",
        "text": "Purple"
      },
      {
        "id": "d",
        "text": "Colourless"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Starch turns orange-brown iodine solution blue-black.",
    "points": 10
  },
  {
    "id": "food-q2",
    "question": "Why must Benedict's solution be heated?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "The reaction only happens when warm"
      },
      {
        "id": "b",
        "text": "To kill bacteria"
      },
      {
        "id": "c",
        "text": "To dissolve the food"
      },
      {
        "id": "d",
        "text": "To make it blue"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Reducing sugars only react with Benedict's solution on heating.",
    "points": 10
  },
  {
    "id": "food-q3",
    "question": "A purple colour in the Biuret test shows…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Starch"
      },
      {
        "id": "b",
        "text": "Fat"
      },
      {
        "id": "c",
        "text": "Protein"
      },
      {
        "id": "d",
        "text": "Sugar"
      }
    ],
    "correctAnswer": "c",
    "explanation": "Biuret reagent turns purple with protein.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "food-tests-complete",
    "title": "Food Detective",
    "description": "Completed the Food Tests experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
