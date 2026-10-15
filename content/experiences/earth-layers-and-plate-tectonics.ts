import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const earthStructureLab: InteractiveExperienceDefinition = {
  id: "exp-earth-layers-and-plate-tectonics",
  slug: "earth-layers-and-plate-tectonics",
  title: "Earth Layers and Plate Tectonics",
  contentType: "experience",
  description: "Travel to the centre of the Earth, then watch plates collide, separate and slide over millions of years.",
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
  component: "earth-structure",
  modes: ["interactive", "learning-tool"],
  subjects: ["earth-and-space"],
  ageGroups: ["13-15", "16-18"],
  difficulty: "intermediate",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Name the four layers of the Earth.",
  "Describe how temperature changes with depth.",
  "Compare divergent, convergent and transform boundaries."
],
  skills: [
  "Spatial reasoning",
  "Modelling",
  "Comparing"
],
  tasks: [
  {
    "id": "find-mantle",
    "title": "Reach the mantle",
    "description": "Move the depth marker into the mantle.",
    "instructions": [
      "Choose Earth's layers.",
      "Go deeper than 35 km."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "find-outer-core",
    "title": "Reach the outer core",
    "description": "Find the liquid layer.",
    "instructions": [
      "Go deeper than 2,890 km."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "find-inner-core",
    "title": "Reach the inner core",
    "description": "Find the solid centre.",
    "instructions": [
      "Go deeper than 5,150 km."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "divergent",
    "title": "Pull plates apart",
    "description": "Watch a divergent boundary for 40 million years.",
    "instructions": [
      "Choose Plate boundaries.",
      "Choose Divergent.",
      "Set time to 40 or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "convergent",
    "title": "Collide plates",
    "description": "Watch a convergent boundary for 40 million years.",
    "instructions": [
      "Choose Convergent.",
      "Set time to 40 or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "transform",
    "title": "Slide plates",
    "description": "Watch a transform boundary for 20 million years.",
    "instructions": [
      "Choose Transform.",
      "Set time to 20 or more."
    ],
    "points": 10,
    "required": true
  }
],
  questions: [
  {
    "id": "earth-q1",
    "question": "Which layer of the Earth is liquid?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Crust"
      },
      {
        "id": "b",
        "text": "Mantle"
      },
      {
        "id": "c",
        "text": "Outer core"
      },
      {
        "id": "d",
        "text": "Inner core"
      }
    ],
    "correctAnswer": "c",
    "explanation": "The outer core is liquid iron and nickel.",
    "points": 10
  },
  {
    "id": "earth-q2",
    "question": "What happens at a convergent boundary between oceanic and continental plates?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "New crust forms"
      },
      {
        "id": "b",
        "text": "The oceanic plate sinks beneath the continental plate"
      },
      {
        "id": "c",
        "text": "Plates slide sideways"
      },
      {
        "id": "d",
        "text": "Nothing"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Dense oceanic crust is forced down in a process called subduction.",
    "points": 10
  },
  {
    "id": "earth-q3",
    "question": "New crust is made at…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Divergent boundaries"
      },
      {
        "id": "b",
        "text": "Convergent boundaries"
      },
      {
        "id": "c",
        "text": "Transform boundaries"
      },
      {
        "id": "d",
        "text": "The inner core"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Magma rises and cools as plates move apart.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "earth-structure-complete",
    "title": "Earth Explorer",
    "description": "Completed Earth Layers and Plate Tectonics.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
