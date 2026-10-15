import type { ActivityContent } from "@/types/education";

// Classroom activity for Robot Sensors. The interactive version lives in
// content/experiences/robot-sensors.ts, linked by a "companion" relationship.
export const robotSensorsActivity: ActivityContent = {
  id: "activity-robot-sensors",
  title: "Robot Sensors",
  slug: "robot-sensors",
  contentType: "activity",
  taxonomy: [{ category: "educational", path: ["learning", "activities"] }],
  status: "published",
  description: "Match each sensor to the job it helps a robot do.",
  excerpt: "How does a robot know it is dark, or that a wall is close?",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "robot-sensors"],
  ageGroups: ["9-10"],
  classLevels: ["Primary 5"],
  subjects: ["Coding and Robotics", "Basic Technology"],
  topics: ["Sensors", "Robotics", "Input devices"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Matching", "Technical reasoning", "Computational thinking"],
  learningObjectives: ["Name four common robot sensors.", "Explain what each sensor detects and how a robot can use it."],
  tags: ["sensors", "robotics", "input devices", "primary 5"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "group",
  instructions: "For each sensor, describe a robot at home or school that could use it, and what the robot should do when the sensor is triggered.",
  materials: ["Sensor picture cards", "Worksheet: sensor, what it detects, what the robot does"],
  expectedOutcome: "Learners explain what light, touch, sound and distance sensors detect and how robots use them.",
};
