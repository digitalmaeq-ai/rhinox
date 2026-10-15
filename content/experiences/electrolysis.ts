import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const electrolysisLab: InteractiveExperienceDefinition = {
  id: "exp-electrolysis",
  slug: "electrolysis",
  title: "Electrolysis",
  contentType: "experience",
  description: "Pass electricity through different liquids, find what forms at each electrode, then measure the amount and check it with Faraday's law.",
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
  component: "electrolysis",
  modes: ["interactive", "learning-tool"],
  subjects: ["chemistry"],
  ageGroups: ["16-18"],
  difficulty: "advanced",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Define electrolysis.",
  "Predict the products at each electrode.",
  "Explain copper purification and electroplating.",
  "Use charge = current × time and Faraday's law to calculate the amount deposited."
],
  skills: [
  "Prediction",
  "Investigation",
  "Scientific reasoning"
],
  tasks: [
  {
    "id": "switch-on",
    "title": "Switch on",
    "description": "Raise the supply voltage to 2 V or more so the cell conducts.",
    "instructions": [
      "Set the supply voltage to 2 V or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "split-water",
    "title": "Split water",
    "description": "Electrolyse dilute sulfuric acid for 5 minutes and see hydrogen and oxygen collect.",
    "instructions": [
      "Choose dilute sulfuric acid.",
      "Switch the cell on, then run it for 5 minutes or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "copper-coating",
    "title": "Copper plating",
    "description": "Electrolyse copper(II) sulfate with graphite electrodes for 5 minutes and coat the cathode with copper.",
    "instructions": [
      "Choose copper(II) sulfate and graphite electrodes.",
      "Run the cell for 5 minutes or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "purify-copper",
    "title": "Purify copper",
    "description": "Use copper electrodes in copper(II) sulfate and watch the anode dissolve.",
    "instructions": [
      "Choose copper electrodes.",
      "Run the cell for 5 minutes or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "make-chlorine",
    "title": "Make chlorine",
    "description": "Electrolyse concentrated sodium chloride solution with graphite electrodes.",
    "instructions": [
      "Choose concentrated sodium chloride (brine) and graphite electrodes.",
      "Run the cell for 5 minutes or more."
    ],
    "points": 5,
    "required": false
  },
  {
    "id": "silver-plate",
    "title": "Silver plating",
    "description": "Electrolyse silver nitrate and coat the cathode with silver.",
    "instructions": [
      "Choose silver nitrate.",
      "Run the cell for 5 minutes or more."
    ],
    "points": 5,
    "required": false
  },
  {
    "id": "take-readings",
    "title": "Take three readings",
    "description": "Record the amount collected at three different times and see that it is proportional to the charge.",
    "instructions": [
      "Open the Record tab.",
      "Press Record reading at three different times."
    ],
    "points": 10,
    "required": false
  }
],
  questions: [
  {
    "id": "elec-q1",
    "question": "Which gas forms at the cathode when dilute sulfuric acid is electrolysed?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Oxygen"
      },
      {
        "id": "b",
        "text": "Hydrogen"
      },
      {
        "id": "c",
        "text": "Chlorine"
      },
      {
        "id": "d",
        "text": "Nitrogen"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Hydrogen ions gain electrons at the negative electrode.",
    "points": 10
  },
  {
    "id": "elec-q2",
    "question": "In the electrolysis of water, hydrogen and oxygen are made in the ratio…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "1 : 1"
      },
      {
        "id": "b",
        "text": "2 : 1"
      },
      {
        "id": "c",
        "text": "1 : 2"
      },
      {
        "id": "d",
        "text": "3 : 1"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Water is H₂O, so twice as much hydrogen as oxygen.",
    "points": 10
  },
  {
    "id": "elec-q3",
    "question": "The cathode is the electrode that is…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Positive"
      },
      {
        "id": "b",
        "text": "Negative"
      },
      {
        "id": "c",
        "text": "Made of copper only"
      },
      {
        "id": "d",
        "text": "Not connected"
      }
    ],
    "correctAnswer": "b",
    "explanation": "The cathode is connected to the negative terminal, where positive ions gain electrons.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "electrolysis-complete",
    "title": "Electro Chemist",
    "description": "Completed the Electrolysis experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
