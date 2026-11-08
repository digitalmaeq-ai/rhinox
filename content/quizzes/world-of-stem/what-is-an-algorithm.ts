import type { QuizContent } from "@/types/quizzes";

export const worldOfWhatIsAnAlgorithmQuiz: QuizContent = {
  "id": "quiz-world-what-is-an-algorithm",
  "title": "What Is an Algorithm?",
  "slug": "what-is-an-algorithm",
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
  "description": "Step-by-step instructions, in the right order.",
  "excerpt": "Step-by-step instructions, in the right order.",
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
    "Coding"
  ],
  "topics": [
    "Algorithms",
    "Sequencing"
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
      "question": "What is an algorithm?",
      "options": [
        {
          "id": "a",
          "text": "A type of computer screen"
        },
        {
          "id": "b",
          "text": "A set of steps to solve a problem or do a task"
        },
        {
          "id": "c",
          "text": "A kind of robot"
        },
        {
          "id": "d",
          "text": "A secret code word"
        }
      ],
      "correctAnswer": "b",
      "explanation": "An algorithm is a clear list of steps, in order, that leads to a result.",
      "points": 1,
      "id": "q1"
    },
    {
      "type": "multiple-choice",
      "question": "Which of these is an everyday algorithm?",
      "options": [
        {
          "id": "a",
          "text": "A recipe for cooking jollof rice"
        },
        {
          "id": "b",
          "text": "A blue sky"
        },
        {
          "id": "c",
          "text": "A loud noise"
        },
        {
          "id": "d",
          "text": "A heavy bag"
        }
      ],
      "correctAnswer": "a",
      "explanation": "A recipe lists steps in order, just like an algorithm.",
      "points": 1,
      "id": "q2"
    },
    {
      "type": "true-false",
      "question": "The order of the steps in an algorithm does not matter.",
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
      "explanation": "Changing the order can change the result, or stop it working at all.",
      "points": 1,
      "id": "q3"
    },
    {
      "type": "multiple-choice",
      "question": "A mistake in a program is called a:",
      "options": [
        {
          "id": "a",
          "text": "Bug"
        },
        {
          "id": "b",
          "text": "Wire"
        },
        {
          "id": "c",
          "text": "Pixel"
        },
        {
          "id": "d",
          "text": "Loop"
        }
      ],
      "correctAnswer": "a",
      "explanation": "Finding and fixing bugs is called debugging.",
      "points": 1,
      "id": "q4"
    },
    {
      "type": "multiple-choice",
      "question": "Which instruction repeats steps without writing them again and again?",
      "options": [
        {
          "id": "a",
          "text": "A loop"
        },
        {
          "id": "b",
          "text": "A bug"
        },
        {
          "id": "c",
          "text": "A battery"
        },
        {
          "id": "d",
          "text": "A screen"
        }
      ],
      "correctAnswer": "a",
      "explanation": "A loop tells the computer to repeat a set of steps.",
      "points": 1,
      "id": "q5"
    },
    {
      "type": "multiple-choice",
      "question": "To make a robot move forward 3 steps, which is the clearest instruction?",
      "options": [
        {
          "id": "a",
          "text": "Go"
        },
        {
          "id": "b",
          "text": "Move forward 3 steps"
        },
        {
          "id": "c",
          "text": "Do the thing"
        },
        {
          "id": "d",
          "text": "Walk maybe"
        }
      ],
      "correctAnswer": "b",
      "explanation": "Algorithms need clear, exact instructions a machine can follow.",
      "points": 1,
      "id": "q6"
    }
  ]
};
