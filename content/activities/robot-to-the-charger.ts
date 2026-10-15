import type { ActivityContent } from "@/types/education";

// Unplugged classroom activity for the grid-coding experience in
// content/experiences/robot-to-the-charger.ts (linked by a "companion"
// relationship). Part of the Think, Move, Code! approach: act it out first.
export const robotToTheChargerActivity: ActivityContent = {
  id: "activity-robot-to-the-charger",
  title: "Code the Robot: Reach the Charger",
  slug: "robot-to-the-charger",
  contentType: "activity",
  taxonomy: [
    { category: "educational", path: ["learning", "activities"] },
    { category: "educational", path: ["technology", "coding", "computational-thinking"] },
  ],
  status: "published",
  description:
    "Be the robot! Follow arrow commands across a floor grid, then write your own program to reach the charger and fix it when it goes wrong.",
  excerpt: "Can you write a program that gets the robot home without bumping into a rock?",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "think-move-code"],
  ageGroups: ["6-7"],
  classLevels: ["Primary 2"],
  subjects: ["Coding and Robotics"],
  topics: ["Algorithms", "Debugging", "Directions"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Sequencing", "Debugging", "Directional language", "Computational thinking"],
  learningObjectives: [
    "Give a robot step-by-step instructions using direction commands.",
    "Test a program and find the step that went wrong (debugging).",
    "Understand that there can be more than one program that works.",
  ],
  tags: ["coding", "unplugged coding", "debugging", "grid", "primary 2"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "group",
  instructions:
    "Mark a 5 by 4 grid on the floor with chalk or tape. Put a 'charger' card in one corner and a few 'rock' cards in the way. One learner is the robot; the others write a program with arrow cards (up, down, left, right). The robot moves exactly one square per card. If the robot bumps into a rock, find the wrong card and fix it, then run the program again.",
  materials: ["Chalk or masking tape", "Arrow cards", "A 'charger' card and some 'rock' cards"],
  expectedOutcome:
    "Learners write and run a program of direction commands, find and fix the step that went wrong, and notice that different programs can reach the same goal.",
};
