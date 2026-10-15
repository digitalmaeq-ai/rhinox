import type { ActivityContent } from "@/types/education";

// Classroom activity for Telling the Time. The interactive version lives in
// content/experiences/telling-the-time.ts, linked by a "companion" relationship.
export const tellingTheTimeActivity: ActivityContent = {
  id: "activity-telling-the-time",
  title: "Telling the Time",
  slug: "telling-the-time",
  contentType: "activity",
  taxonomy: [{ category: "educational", path: ["learning", "activities"] }],
  status: "published",
  description: "Read the clocks for a school day and match each one to the right time.",
  excerpt: "What time does school start? Read the clock and match it.",
  featured: true,
  placements: ["explore", "education"],
  collections: ["activities", "telling-the-time"],
  ageGroups: ["6-7"],
  classLevels: ["Primary 2"],
  subjects: ["Mathematics"],
  topics: ["Time", "Clocks", "O'clock", "Half past", "Quarter past", "Quarter to"],
  difficulty: "beginner",
  durationMinutes: 30,
  skills: ["Reading clocks", "Matching", "Number sense"],
  learningObjectives: ["Read o'clock, half past, quarter past and quarter to on an analogue clock.", "Match a clock face to a written time."],
  tags: ["time", "clocks", "o'clock", "half past", "primary 2"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",
  activityType: "home",
  instructions: "Make a paper clock with moving hands. Set it to the times you wake up, start school, have break and go to bed, and say each time aloud.",
  materials: ["Paper plate", "Card for the clock hands", "Split pin", "Marker"],
  expectedOutcome: "Learners read and set o'clock, half past, quarter past and quarter to times.",
};
