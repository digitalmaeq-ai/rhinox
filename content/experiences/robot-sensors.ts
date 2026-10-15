import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

// Robot Sensors (Primary 5). Content-only: runtime "2d" + component
// "matching" reuses the existing renderer; only artwork was added.
// Companion activity: content/activities/robot-sensors.ts ("companion" edge in
// lib/relationships-graph.ts).
export const robotSensorsExperience: InteractiveExperienceDefinition = {
  id: "exp-robot-sensors",
  slug: "robot-sensors",
  title: "Robot Sensors",
  contentType: "experience",
  description: "Match each sensor to the job it helps a robot do.",
  status: "active",

  taxonomy: [{ category: "interactive", path: ["experiences", "interactive-learning", "interactive-lessons"] }],

  runtime: "2d",
  component: "matching",
  modes: ["interactive", "2d", "learning-tool"],

  assets: [
    { id: "item-light-sensor", type: "object", label: "Light sensor", description: "Detects how bright or dark it is.", interactive: true, visible: true, properties: { correctTarget: "target-headlights", visual: "sensor-light" } },
    { id: "item-touch-sensor", type: "object", label: "Touch sensor", description: "Detects when something presses it.", interactive: true, visible: true, properties: { correctTarget: "target-bump", visual: "sensor-touch" } },
    { id: "item-sound-sensor", type: "object", label: "Sound sensor", description: "Detects noise, like a clap.", interactive: true, visible: true, properties: { correctTarget: "target-clap", visual: "sensor-sound" } },
    { id: "item-distance-sensor", type: "object", label: "Distance sensor", description: "Sends out sound waves to measure how far away things are.", interactive: true, visible: true, properties: { correctTarget: "target-slow-down", visual: "sensor-distance" } },
    { id: "target-slow-down", type: "object", label: "Slow down near a wall", description: "Before it touches anything.", interactive: true, visible: true, properties: { visual: "job-slow-down" } },
    { id: "target-headlights", type: "object", label: "Headlights at night", description: "Switch lights on when it gets dark.", interactive: true, visible: true, properties: { visual: "job-headlights" } },
    { id: "target-clap", type: "object", label: "Start on a clap", description: "Begin moving when someone claps.", interactive: true, visible: true, properties: { visual: "job-clap" } },
    { id: "target-bump", type: "object", label: "Stop on a bump", description: "Stop moving after hitting something.", interactive: true, visible: true, properties: { visual: "job-bump" } },
  ],

  // One required task per item (task id === item asset id).
  tasks: [
    { id: "item-light-sensor", title: "Match the light sensor", points: 10, required: true },
    { id: "item-touch-sensor", title: "Match the touch sensor", points: 10, required: true },
    { id: "item-sound-sensor", title: "Match the sound sensor", points: 10, required: true },
    { id: "item-distance-sensor", title: "Match the distance sensor", points: 10, required: true },
  ],

  interactions: [
    { id: "match-correct", assetId: "target-slow-down", trigger: "drop", actions: [{ id: "match-correct-feedback", type: "show-feedback", message: "Great match! That sensor gives the robot the information it needs." }] },
    { id: "match-incorrect", assetId: "target-slow-down", trigger: "drop", actions: [{ id: "match-incorrect-feedback", type: "show-feedback", message: "Not quite. Think about what the sensor can detect: light, touch, sound or distance." }] },
  ],

  subjects: ["robotics"],
  ageGroups: ["9-10"],
  difficulty: "beginner",
  durationMinutes: 10,
  featured: true,
  learningObjectives: ["Name four common robot sensors.", "Explain what each sensor detects and how a robot can use it."],
  skills: ["Matching", "Technical reasoning", "Computational thinking"],
  achievements: [{ id: "robot-sensors-complete", title: "Sensor Specialist", description: "Matched every sensor to its job.", points: 40 }],
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
};
