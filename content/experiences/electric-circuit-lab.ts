import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Runs on the shared experiment engine (app/components/interactive/simlab).
// `component` selects the simulation; tasks and questions below are
// checked and scored by the engine.
export const electricCircuitLab: InteractiveExperienceDefinition = {
  id: "exp-electric-circuit-lab",
  slug: "electric-circuit-lab",
  title: "Electric Circuit Lab",
  contentType: "experience",
  description: "Build a circuit with cells, a switch and bulbs. Compare series and parallel connections and see how voltage and current change the brightness.",
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
  component: "electric-circuit",
  modes: ["interactive", "learning-tool"],
  subjects: ["physics"],
  ageGroups: ["9-12", "13-15"],
  difficulty: "beginner",
  durationMinutes: 15,
  featured: true,
  learningObjectives: [
  "Explain why a circuit must be complete for current to flow.",
  "Compare bulbs connected in series and in parallel.",
  "Describe how adding cells increases voltage and brightness.",
  "Recognise that too much voltage can damage a bulb.",
  "Use an ammeter and a voltmeter and work out resistance with R = V ÷ I.",
  "Explain why a filament lamp does not obey Ohm's law."
],
  skills: [
  "Observation",
  "Cause and effect",
  "Scientific reasoning"
],
  tasks: [
  {
    "id": "close-the-switch",
    "title": "Complete the circuit",
    "description": "Close the switch so current can flow round the circuit.",
    "instructions": [
      "Press the switch control.",
      "Watch the bulb and the current reading."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "series-dimmer",
    "title": "Bulbs in series",
    "description": "Add a second bulb in series and notice how bright each one is.",
    "instructions": [
      "Set bulbs to 2 or 3.",
      "Choose “In series”.",
      "Keep the switch closed."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "parallel-bright",
    "title": "Bulbs in parallel",
    "description": "Connect two or more bulbs in parallel and compare their brightness with series.",
    "instructions": [
      "Set bulbs to 2 or 3.",
      "Choose “In parallel”."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "more-cells",
    "title": "More cells, brighter bulb",
    "description": "Use one bulb in series and raise the battery to 3 cells without blowing it.",
    "instructions": [
      "Set bulbs to 1 and choose series.",
      "Raise the cells to 3."
    ],
    "points": 10,
    "required": true
  },
  {
    "id": "blow-a-bulb",
    "title": "Overload challenge",
    "description": "Find out what happens when the voltage is too high for one bulb.",
    "instructions": [
      "Use one bulb.",
      "Add cells until the bulb blows."
    ],
    "points": 5,
    "required": false
  },
  {
    "id": "record-six",
    "title": "Record six meter readings",
    "description": "Take six readings of current and voltage with the ammeter and voltmeter.",
    "instructions": [
      "Close the switch.",
      "Change the rheostat or the cells.",
      "Press Record reading each time."
    ],
    "points": 10,
    "required": false
  },
  {
    "id": "bulb-curve",
    "title": "Find the lamp's curve",
    "description": "Take at least five single-bulb readings over a wide range of current and see the resistance rise.",
    "instructions": [
      "Use one bulb in series.",
      "Vary the rheostat and the number of cells.",
      "Compare R = V ÷ I at low and high current."
    ],
    "points": 20,
    "required": false
  }
],
  questions: [
  {
    "id": "circuit-q1",
    "question": "Why does a bulb stay off when the switch is open?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "The battery is flat"
      },
      {
        "id": "b",
        "text": "The circuit is broken so no current can flow"
      },
      {
        "id": "c",
        "text": "The bulb is too small"
      },
      {
        "id": "d",
        "text": "Electricity only flows in parallel"
      }
    ],
    "correctAnswer": "b",
    "explanation": "Current can only flow round a complete loop. An open switch breaks the loop.",
    "points": 10
  },
  {
    "id": "circuit-q2",
    "question": "Two identical bulbs are connected in series to a battery. Compared with one bulb, each bulb is…",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Brighter"
      },
      {
        "id": "b",
        "text": "The same"
      },
      {
        "id": "c",
        "text": "Dimmer"
      },
      {
        "id": "d",
        "text": "Blown"
      }
    ],
    "correctAnswer": "c",
    "explanation": "In series the battery's voltage is shared between the bulbs, so each gets less.",
    "points": 10
  },
  {
    "id": "circuit-q3",
    "question": "Why do bulbs in parallel each stay bright?",
    "type": "multiple-choice",
    "options": [
      {
        "id": "a",
        "text": "Each bulb gets the full battery voltage"
      },
      {
        "id": "b",
        "text": "They use less current"
      },
      {
        "id": "c",
        "text": "The wires are shorter"
      },
      {
        "id": "d",
        "text": "The switch is closed"
      }
    ],
    "correctAnswer": "a",
    "explanation": "Each parallel branch is connected directly across the battery, so every bulb gets the full voltage.",
    "points": 10
  }
],
  achievements: [
  {
    "id": "circuit-lab-complete",
    "title": "Circuit Builder",
    "description": "Completed the Electric Circuit Lab.",
    "points": 30
  }
],
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
};
