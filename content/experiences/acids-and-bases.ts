import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const acidsAndBasesLab: InteractiveExperienceDefinition = {
  id: "exp-acids-and-bases",
  slug: "acids-and-bases",
  title: "Acids and Bases",
  contentType: "experience",
  description: "Test everyday liquids with litmus, universal indicator and phenolphthalein, and place each one on the pH scale.",
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
  component: "acids-bases",
  modes: ["interactive", "learning-tool"],
  subjects: ["chemistry"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "beginner",
  durationMinutes: 15,
  featured: false,
  learningObjectives: [
  "Use indicators to tell acids from alkalis.",
  "Read a pH value from universal indicator.",
  "Place everyday substances on the pH scale.",
  "Describe what a neutral solution is.",
  "Explain how diluting an acid changes its pH.",
  "Compare indicators and choose the right one."
],
  skills: [
  "Observation",
  "Classification",
  "Scientific reasoning"
],
  tasks: [
  {
    "id": "acid-litmus",
    "title": "Find an acid",
    "description": "Use litmus to test an acidic liquid and see the colour it gives.",
    "instructions": [
      "Pick an acid such as lime juice.",
      "Choose litmus."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "alkali-litmus",
    "title": "Find an alkali",
    "description": "Use litmus to test an alkaline liquid and see the colour it gives.",
    "instructions": [
      "Pick soap solution or bleach.",
      "Choose litmus."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "find-neutral",
    "title": "Find a neutral liquid",
    "description": "Use universal indicator to find a liquid with a pH of 7.",
    "instructions": [
      "Choose universal indicator.",
      "Try different liquids until the colour is green."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "strong-alkali",
    "title": "Find a strong alkali",
    "description": "Use universal indicator to find a liquid with a pH above 11.",
    "instructions": [
      "Choose universal indicator.",
      "Try bleach or sodium hydroxide."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "pink-test",
    "title": "Phenolphthalein test",
    "description": "Make phenolphthalein turn pink.",
    "instructions": [
      "Choose phenolphthalein.",
      "Test different liquids."
    ],
    "points": 5,
    "required": false
  },
  {
    "id": "methyl-orange",
    "title": "Methyl orange turns red",
    "description": "Add methyl orange to a strong acid.",
    "instructions": [
      "Choose methyl orange.",
      "Add it to dilute hydrochloric acid, lime juice or cola."
    ],
    "points": 5,
    "required": false
  },
  {
    "id": "dilute-acid",
    "title": "Dilute a strong acid",
    "description": "Dilute hydrochloric acid three times (tenfold each time) and read the pH with the pH meter.",
    "instructions": [
      "Choose dilute hydrochloric acid and the pH meter.",
      "Move the dilution slider to 3 and dip the probe.",
      "Notice that the pH went up by 3."
    ],
    "points": 10,
    "required": false
  },
  {
    "id": "record-five",
    "title": "Record five results",
    "description": "Write five results in your record table.",
    "instructions": [
      "Test a liquid and press Record result.",
      "Say whether it is an acid, neutral or an alkali."
    ],
    "points": 10,
    "required": false
  },
  {
    "id": "identify-liquids",
    "title": "Name the mystery liquids",
    "description": "Correctly identify the type and pH of three unknown liquids.",
    "instructions": [
      "Open Unknown liquids.",
      "Test each liquid, then give its type and pH to within 1."
    ],
    "points": 20,
    "required": false
  }
],
  questions: [
  {
    "id": "ab-q1",
    "question": "A solution turns blue litmus paper red. It is…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "An acid"
      },
      {
        "id": "b",
        "text": "An alkali"
      },
      {
        "id": "c",
        "text": "Neutral"
      },
      {
        "id": "d",
        "text": "Impossible to tell"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Acids turn blue litmus red.",
    "points": 10
  },
  {
    "id": "ab-q2",
    "question": "What is the pH of pure water?",
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
    "explanation": "Pure water is neutral, with a pH of 7.",
    "points": 10
  },
  {
    "id": "ab-q3",
    "question": "Phenolphthalein turns pink in…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Strong acids"
      },
      {
        "id": "b",
        "text": "Pure water"
      },
      {
        "id": "c",
        "text": "Alkalis"
      },
      {
        "id": "d",
        "text": "Vinegar"
      }
    ],
    "correctAnswer": "c",
    "explanation": "Phenolphthalein is colourless in acids and neutral liquids and pink in alkalis.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "acids-bases-complete",
    "title": "pH Detective",
    "description": "Completed the Acids and Bases experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
