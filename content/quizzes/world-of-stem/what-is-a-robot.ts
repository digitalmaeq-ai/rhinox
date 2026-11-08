import type { QuizContent } from "@/types/quizzes";

export const worldOfWhatIsARobotQuiz: QuizContent = {
  "id": "quiz-world-what-is-a-robot",
  "title": "What Is a Robot?",
  "slug": "what-is-a-robot",
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
  "description": "Sense, think, act: the three jobs every robot does.",
  "excerpt": "Sense, think, act: the three jobs every robot does.",
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
    "Robotics"
  ],
  "topics": [
    "Robots",
    "Sensors"
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
      "question": "Which list gives the three jobs of most robots?",
      "options": [
        {
          "id": "a",
          "text": "Sleep, eat, grow"
        },
        {
          "id": "b",
          "text": "Sense, think, act"
        },
        {
          "id": "c",
          "text": "Talk, sing, dance"
        },
        {
          "id": "d",
          "text": "Open, close, lock"
        }
      ],
      "correctAnswer": "b",
      "explanation": "A robot senses its surroundings, thinks (runs its program) and then acts.",
      "points": 1,
      "id": "q1"
    },
    {
      "type": "multiple-choice",
      "question": "What do we call the parts that let a robot sense the world?",
      "options": [
        {
          "id": "a",
          "text": "Sensors"
        },
        {
          "id": "b",
          "text": "Wheels"
        },
        {
          "id": "c",
          "text": "Batteries"
        },
        {
          "id": "d",
          "text": "Screws"
        }
      ],
      "correctAnswer": "a",
      "explanation": "Sensors collect information, such as light, touch or distance.",
      "points": 1,
      "id": "q2"
    },
    {
      "type": "multiple-choice",
      "question": "What does the program inside a robot do?",
      "options": [
        {
          "id": "a",
          "text": "It gives the robot energy"
        },
        {
          "id": "b",
          "text": "It tells the robot what to do, step by step"
        },
        {
          "id": "c",
          "text": "It paints the robot"
        },
        {
          "id": "d",
          "text": "It makes the robot alive"
        }
      ],
      "correctAnswer": "b",
      "explanation": "A program is a set of instructions the robot follows.",
      "points": 1,
      "id": "q3"
    },
    {
      "type": "true-false",
      "question": "A robot always looks like a person.",
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
      "explanation": "Robots come in many shapes: arms in factories, wheeled robots, drones and more.",
      "points": 1,
      "id": "q4"
    },
    {
      "type": "multiple-choice",
      "question": "A robot arm in a factory picks up a box. Which part of 'sense, think, act' is picking up the box?",
      "options": [
        {
          "id": "a",
          "text": "Sense"
        },
        {
          "id": "b",
          "text": "Think"
        },
        {
          "id": "c",
          "text": "Act"
        },
        {
          "id": "d",
          "text": "None of them"
        }
      ],
      "correctAnswer": "c",
      "explanation": "Moving a motor to do something is the 'act' step.",
      "points": 1,
      "id": "q5"
    },
    {
      "type": "true-false",
      "question": "A robot can only do what its program and parts allow it to do.",
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
      "explanation": "Robots follow their programs and are limited by their parts, such as motors and sensors.",
      "points": 1,
      "id": "q6"
    }
  ]
};
