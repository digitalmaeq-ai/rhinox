import type { ActivityContent } from "@/types/education";

// Classroom activity for 2D Shapes and Their Sides. The interactive version lives in
// content/experiences/shapes-and-sides.ts, linked by a "companion" relationship.
export const shapesAndSidesActivity: ActivityContent = {
  id: "activity-shapes-and-sides",
  title: "2D Shapes and Their Sides",
  slug: "shapes-and-sides",
  contentType: "activity",
  taxonomy: [{ category: "educational", path: ["learning", "activities"] }],
  status: "published",
  description: "Sort flat shapes by their sides: three straight sides, four straight sides, or curved with no corners.",
  excerpt: "Count the sides — does it have three, four, or none at all?",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "shapes-and-sides"],
  ageGroups: ["6-7"],
  classLevels: ["Primary 2"],
  subjects: ["Mathematics"],
  topics: ["2D Shapes", "Sides and Corners", "Geometry"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Counting", "Classification", "Observation"],
  learningObjectives: ["Count the sides and corners of 2D shapes.", "Sort shapes by the number and type of sides."],
  tags: ["2d shapes", "sides and corners", "geometry", "primary 2"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "classroom",
  instructions: "Cut out paper shapes. For each one, trace your finger along the edges and count the straight sides, then place it in the right group.",
  materials: ["Paper cut-outs of a triangle, square, rectangle, circle and oval", "Three labelled sheets: 3 sides, 4 sides, curved"],
  expectedOutcome: "Learners count sides and sort 2D shapes into groups by their sides.",
};
