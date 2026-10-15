import type { ActivityContent } from "@/types/education";

// Classroom activity for the labelling experience in
// content/experiences/compass-directions.ts (linked by a "companion"
// relationship).
export const compassDirectionsActivity: ActivityContent = {
  id: "activity-compass-directions",
  title: "Compass Directions: Label the Village Map",
  slug: "compass-directions",
  contentType: "activity",
  taxonomy: [
    { category: "educational", path: ["learning", "activities"] },
  ],
  status: "published",
  description:
    "Learn the four cardinal points and use a compass rose to place the school, hospital, river and farm around a village market.",
  excerpt: "If the school is north of the market, which way do you walk to get to school?",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities"],
  ageGroups: ["8-9"],
  classLevels: ["Primary 4"],
  subjects: ["Social Studies"],
  topics: ["Maps", "Compass Directions", "Cardinal Points"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Map reading", "Using directions", "Spatial reasoning"],
  learningObjectives: [
    "Name the four cardinal points: north, south, east and west.",
    "Use a compass rose to find directions on a map.",
    "Describe where places are using compass directions.",
  ],
  tags: ["maps", "compass", "directions", "social studies", "primary 4"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "group",
  instructions:
    "Go outside in the morning and face the rising sun: that is east. Behind you is west, your left hand points north and your right hand points south. Mark N, E, S and W on the ground with chalk, then draw a simple map of your school and label places using the four directions.",
  materials: ["Chalk", "Paper and pencils", "A compass (optional)"],
  expectedOutcome:
    "Learners name the four cardinal points, find them on a compass rose and describe where places are using north, south, east and west.",
};
