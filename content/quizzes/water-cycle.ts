import type { QuizContent } from "@/types/quizzes";

export const waterCycleQuiz: QuizContent = {
  id: "quiz-water-cycle",
  title: "Water Cycle Quiz",
  slug: "water-cycle",
  contentType: "quiz",
  taxonomy: [
    {
      category: "interactive",
      path: ["experiences", "stem-quizzes", "science-quizzes"],
    },
  ],
  status: "published",
  description: "Test your understanding of evaporation, condensation and precipitation.",
  excerpt: "How much do you know about the water cycle?",
  featured: true,
  placements: ["explore", "education"],
  collections: ["quizzes", "water-cycle"],
  ageGroups: ["9-14"],
  classLevels: ["Primary 5", "Primary 6", "JSS1", "JSS2"],
  subjects: ["Basic Science"],
  topics: ["Water Cycle"],
  difficulty: "beginner",
  durationMinutes: 10,
  skills: ["Recall", "Scientific understanding"],
  tags: ["quiz", "water cycle"],
  audience: ["students", "teachers"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  instructions: "Answer each question.",
  passingScore: 70,
  attemptsAllowed: 3,
  shuffleQuestions: true,
  shuffleOptions: true,
  showExplanations: true,
  questions: [
    {
      id: "q1",
      type: "multiple-choice",
      question: "What process changes liquid water into water vapour?",
      options: [
        { id: "a", text: "Condensation" },
        { id: "b", text: "Evaporation" },
        { id: "c", text: "Precipitation" }
      ],
      correctAnswer: "b",
      explanation: "Evaporation changes liquid water into water vapour.",
      points: 1
    },
    {
      id: "q2",
      type: "multiple-choice",
      question: "What process forms water droplets when water vapour cools?",
      options: [
        { id: "a", text: "Condensation" },
        { id: "b", text: "Evaporation" },
        { id: "c", text: "Collection" }
      ],
      correctAnswer: "a",
      explanation: "Condensation occurs when water vapour cools and changes into liquid water.",
      points: 1
    }
  ]
};

