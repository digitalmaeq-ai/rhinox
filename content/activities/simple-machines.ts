import type { ActivityContent } from "@/types/education";

// Classroom activity for Simple Machines Around Us. The interactive version lives in
// content/experiences/simple-machines.ts, linked by a "companion" relationship.
export const simpleMachinesActivity: ActivityContent = {
  id: "activity-simple-machines",
  title: "Simple Machines Around Us",
  slug: "simple-machines",
  contentType: "activity",
  taxonomy: [{ category: "educational", path: ["learning", "activities"] }],
  status: "published",
  description: "Sort everyday objects into the type of simple machine they use.",
  excerpt: "A see-saw, a flagpole and a slide are all machines. Which kind is each?",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "simple-machines"],
  ageGroups: ["10-12"],
  classLevels: ["JSS 1"],
  subjects: ["Basic Technology"],
  topics: ["Simple Machines", "Levers", "Pulleys", "Inclined Planes", "Wheel and Axle"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Classification", "Observation", "Technical reasoning"],
  learningObjectives: ["Identify four types of simple machine.", "Classify everyday objects by the simple machine they use."],
  tags: ["simple machines", "levers", "pulleys", "inclined planes", "jss 1"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "group",
  instructions: "Walk around the school and find one example of each simple machine: a lever, a pulley, an inclined plane and a wheel and axle. Sketch each one and label the part that makes it a machine.",
  materials: ["Notebook and pencil", "Worksheet with four columns: lever, pulley, inclined plane, wheel and axle"],
  expectedOutcome: "Learners identify simple machines in their environment and explain how each makes work easier.",
};
