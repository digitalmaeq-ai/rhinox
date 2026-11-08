import type { QuizContent } from "@/types/quizzes";

export const worldOfUsingAiSafelyQuiz: QuizContent = {
  "id": "quiz-world-using-ai-safely",
  "title": "Using AI Safely and Wisely",
  "slug": "using-ai-safely",
  "contentType": "quiz",
  "taxonomy": [
    {
      "category": "interactive",
      "path": [
        "experiences",
        "stem-quizzes",
        "technology-quizzes"
      ]
    }
  ],
  "status": "draft",
  "description": "Good habits for using AI tools and the internet.",
  "excerpt": "Good habits for using AI tools and the internet.",
  "placements": [
    "explore",
    "education"
  ],
  "collections": [
    "quizzes",
    "world-of-stem"
  ],
  "classLevels": [
    "Primary 5",
    "Primary 6",
    "JSS1",
    "JSS2"
  ],
  "subjects": [
    "Technology"
  ],
  "topics": [
    "Digital safety",
    "Artificial intelligence"
  ],
  "difficulty": "beginner",
  "durationMinutes": 8,
  "skills": [
    "Recall",
    "Curiosity"
  ],
  "tags": [
    "quiz",
    "world of stem",
    "ai",
    "robotics"
  ],
  "audience": [
    "students",
    "teachers"
  ],
  "author": "Rhinox Scientifica",
  "createdAt": "2026-11-08",
  "updatedAt": "2026-11-08",
  "instructions": "Choose the best answer for each question.",
  "passingScore": 60,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "showExplanations": true,
  "questions": [
    {
      "type": "multiple-choice",
      "question": "Which of these should you NOT share with an online AI tool?",
      "options": [
        {
          "id": "a",
          "text": "Your home address and phone number"
        },
        {
          "id": "b",
          "text": "A question about the water cycle"
        },
        {
          "id": "c",
          "text": "A maths problem"
        },
        {
          "id": "d",
          "text": "A story idea"
        }
      ],
      "correctAnswer": "a",
      "explanation": "Keep personal details private online.",
      "points": 1,
      "id": "q1"
    },
    {
      "type": "true-false",
      "question": "If an AI tool gives an answer, you should check it with a book, a teacher or another trusted source.",
      "options": [
        {
          "id": "true",
          "text": "True"
        },
        {
          "id": "false",
          "text": "False"
        }
      ],
      "correctAnswer": "true",
      "explanation": "AI can be wrong, so checking is a good habit.",
      "points": 1,
      "id": "q2"
    },
    {
      "type": "multiple-choice",
      "question": "A friend wants to hand in an AI-written answer as their own work. What is a better choice?",
      "options": [
        {
          "id": "a",
          "text": "Use AI to help understand, then write it in your own words and say how you used it"
        },
        {
          "id": "b",
          "text": "Copy it exactly and say nothing"
        },
        {
          "id": "c",
          "text": "Ask AI to do all the homework"
        },
        {
          "id": "d",
          "text": "Hide it from the teacher"
        }
      ],
      "correctAnswer": "a",
      "explanation": "Using AI to learn is fine; passing off copied work as your own is not.",
      "points": 1,
      "id": "q3"
    },
    {
      "type": "true-false",
      "question": "Anything an AI tool says about a real person is always true.",
      "options": [
        {
          "id": "true",
          "text": "True"
        },
        {
          "id": "false",
          "text": "False"
        }
      ],
      "correctAnswer": "false",
      "explanation": "AI can get facts wrong, including about people. Be careful and check.",
      "points": 1,
      "id": "q4"
    },
    {
      "type": "multiple-choice",
      "question": "Before using an online tool, a young learner should:",
      "options": [
        {
          "id": "a",
          "text": "Ask a parent, teacher or trusted adult"
        },
        {
          "id": "b",
          "text": "Share a password with a friend"
        },
        {
          "id": "c",
          "text": "Share a photo of their school"
        },
        {
          "id": "d",
          "text": "Click every button"
        }
      ],
      "correctAnswer": "a",
      "explanation": "A trusted adult can help you use online tools safely.",
      "points": 1,
      "id": "q5"
    },
    {
      "type": "multiple-choice",
      "question": "Which is a good rule for using AI?",
      "options": [
        {
          "id": "a",
          "text": "Think for yourself first, and use AI as a helper"
        },
        {
          "id": "b",
          "text": "Let AI think for you every time"
        },
        {
          "id": "c",
          "text": "Believe the first answer always"
        },
        {
          "id": "d",
          "text": "Never ask questions"
        }
      ],
      "correctAnswer": "a",
      "explanation": "AI works best as a helper to your own thinking.",
      "points": 1,
      "id": "q6"
    }
  ]
};
