import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const bridgeBuilderLab: InteractiveExperienceDefinition = {
  id: "exp-bridge-builder",
  slug: "bridge-builder",
  title: "Bridge Builder",
  contentType: "experience",
  description: "Choose a design, a material and a span, then load the bridge to find out what holds and what collapses.",
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
  component: "bridge-builder",
  modes: ["interactive", "learning-tool"],
  subjects: ["engineering"],
  ageGroups: ["9-12", "13-15", "16-18"],
  difficulty: "intermediate",
  durationMinutes: 20,
  featured: false,
  learningObjectives: [
  "Compare beam, arch, truss and suspension bridges.",
  "Explain how span, material and load affect strength.",
  "Use testing to improve a design."
],
  skills: [
  "Design thinking",
  "Testing",
  "Problem solving"
],
  tasks: [
  {
    "id": "safe-bridge",
    "title": "Build a safe bridge",
    "description": "Make a bridge that safely carries 20 tonnes or more.",
    "instructions": [
      "Choose a stronger design or material.",
      "Set the load to 20 t or more."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "beam-fails",
    "title": "Break a beam",
    "description": "Overload a simple beam bridge.",
    "instructions": [
      "Choose Beam.",
      "Increase the load until it collapses."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "long-span",
    "title": "Cross a wide river",
    "description": "Build a bridge with a span of 50 m or more that carries 10 tonnes.",
    "instructions": [
      "Increase the span.",
      "Choose a strong design."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "heavy-load",
    "title": "Carry a heavy load",
    "description": "Carry 50 tonnes or more without collapse.",
    "instructions": [
      "Choose steel and a strong design."
    ],
    "points": 5,
    "required": false
  }
],
  questions: [
  {
    "id": "bridge-q1",
    "question": "Which bridge type is best for very long spans?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Beam"
      },
      {
        "id": "b",
        "text": "Suspension"
      },
      {
        "id": "c",
        "text": "Log"
      },
      {
        "id": "d",
        "text": "Stepping stones"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Cables in tension can carry a deck across great distances.",
    "points": 10
  },
  {
    "id": "bridge-q2",
    "question": "Why do trusses use triangles?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "They look good"
      },
      {
        "id": "b",
        "text": "Triangles are rigid and spread the load"
      },
      {
        "id": "c",
        "text": "They are cheap"
      },
      {
        "id": "d",
        "text": "They float"
      }
    ],
    "correctAnswer": "b",
    "explanation": "A triangle cannot change shape without changing the length of a side.",
    "points": 10
  },
  {
    "id": "bridge-q3",
    "question": "What happens to the strength as the span gets longer?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "It increases"
      },
      {
        "id": "b",
        "text": "It stays the same"
      },
      {
        "id": "c",
        "text": "It decreases"
      },
      {
        "id": "d",
        "text": "It doubles"
      }
    ],
    "correctAnswer": "c",
    "explanation": "Longer spans bend more under the same load.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "bridge-complete",
    "title": "Bridge Engineer",
    "description": "Completed the Bridge Builder experiment.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
