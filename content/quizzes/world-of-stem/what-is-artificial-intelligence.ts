import type { QuizContent } from "@/types/quizzes";

export const worldOfWhatIsArtificialIntelligenceQuiz: QuizContent = {
  "id": "quiz-world-what-is-artificial-intelligence",
  "title": "What Is Artificial Intelligence?",
  "slug": "what-is-artificial-intelligence",
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
  "status": "published",
  "description": "How computers learn patterns, and what they cannot do.",
  "excerpt": "How computers learn patterns, and what they cannot do.",
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
    "Artificial intelligence",
    "Data"
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
      "question": "Artificial intelligence (AI) is best described as:",
      "options": [
        {
          "id": "a",
          "text": "Computer systems that can do tasks that usually need human thinking, like recognising speech or pictures"
        },
        {
          "id": "b",
          "text": "A type of robot body"
        },
        {
          "id": "c",
          "text": "A kind of battery"
        },
        {
          "id": "d",
          "text": "A web browser"
        }
      ],
      "correctAnswer": "a",
      "explanation": "AI covers computer systems that perform tasks such as recognising patterns, language or images.",
      "points": 1,
      "id": "q1"
    },
    {
      "type": "multiple-choice",
      "question": "Many AI systems learn by:",
      "options": [
        {
          "id": "a",
          "text": "Finding patterns in lots of examples (data)"
        },
        {
          "id": "b",
          "text": "Going to school"
        },
        {
          "id": "c",
          "text": "Eating electricity"
        },
        {
          "id": "d",
          "text": "Guessing at random only"
        }
      ],
      "correctAnswer": "a",
      "explanation": "They are trained on large amounts of example data and learn patterns from it.",
      "points": 1,
      "id": "q2"
    },
    {
      "type": "true-false",
      "question": "AI always gives correct answers.",
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
      "explanation": "AI can make mistakes, so people should check important answers.",
      "points": 1,
      "id": "q3"
    },
    {
      "type": "true-false",
      "question": "AI is alive and has feelings like a person.",
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
      "explanation": "AI is software running on computers. It does not have feelings.",
      "points": 1,
      "id": "q4"
    },
    {
      "type": "multiple-choice",
      "question": "Which of these is a way AI is used today?",
      "options": [
        {
          "id": "a",
          "text": "Suggesting words as you type on a phone"
        },
        {
          "id": "b",
          "text": "Making rain fall"
        },
        {
          "id": "c",
          "text": "Growing plants without light"
        },
        {
          "id": "d",
          "text": "Changing the speed of light"
        }
      ],
      "correctAnswer": "a",
      "explanation": "Text suggestions, voice assistants and photo sorting are everyday uses of AI.",
      "points": 1,
      "id": "q5"
    },
    {
      "type": "multiple-choice",
      "question": "Who is responsible for checking and using AI results wisely?",
      "options": [
        {
          "id": "a",
          "text": "Only the AI"
        },
        {
          "id": "b",
          "text": "People"
        },
        {
          "id": "c",
          "text": "Nobody"
        },
        {
          "id": "d",
          "text": "The battery"
        }
      ],
      "correctAnswer": "b",
      "explanation": "People should check results and decide how to use them.",
      "points": 1,
      "id": "q6"
    }
  ]
};
