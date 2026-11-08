import type { QuizContent } from "@/types/quizzes";

export const worldOfHowRobotsSenseQuiz: QuizContent = {
  "id": "quiz-world-how-robots-sense",
  "title": "How Do Robots Sense the World?",
  "slug": "how-robots-sense",
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
  "description": "Light, touch and distance sensors, and what they tell a robot.",
  "excerpt": "Light, touch and distance sensors, and what they tell a robot.",
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
    "Sensors",
    "Robotics"
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
      "question": "Which sensor helps a robot tell how far away an object is?",
      "options": [
        {
          "id": "a",
          "text": "Distance (ultrasonic) sensor"
        },
        {
          "id": "b",
          "text": "Battery"
        },
        {
          "id": "c",
          "text": "Wheel"
        },
        {
          "id": "d",
          "text": "Screw"
        }
      ],
      "correctAnswer": "a",
      "explanation": "Distance sensors send out a signal and measure how long it takes to come back.",
      "points": 1,
      "id": "q1"
    },
    {
      "type": "multiple-choice",
      "question": "A robot follows a dark line on the floor. Which sensor does it use?",
      "options": [
        {
          "id": "a",
          "text": "A light sensor"
        },
        {
          "id": "b",
          "text": "A sound sensor only"
        },
        {
          "id": "c",
          "text": "A temperature sensor only"
        },
        {
          "id": "d",
          "text": "A rain sensor"
        }
      ],
      "correctAnswer": "a",
      "explanation": "A light sensor can tell dark from light surfaces, so the robot can stay on the line.",
      "points": 1,
      "id": "q2"
    },
    {
      "type": "multiple-choice",
      "question": "What does a touch sensor tell a robot?",
      "options": [
        {
          "id": "a",
          "text": "That it has bumped into something"
        },
        {
          "id": "b",
          "text": "What the weather is"
        },
        {
          "id": "c",
          "text": "How old it is"
        },
        {
          "id": "d",
          "text": "What colour its wheels are"
        }
      ],
      "correctAnswer": "a",
      "explanation": "A touch sensor reacts when it is pressed, such as when the robot hits a wall.",
      "points": 1,
      "id": "q3"
    },
    {
      "type": "true-false",
      "question": "A camera can be used as a sensor.",
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
      "explanation": "Cameras give a robot images that its program can use.",
      "points": 1,
      "id": "q4"
    },
    {
      "type": "multiple-choice",
      "question": "A sensor collects information. What happens to it next?",
      "options": [
        {
          "id": "a",
          "text": "The robot's program uses it to decide what to do"
        },
        {
          "id": "b",
          "text": "It disappears"
        },
        {
          "id": "c",
          "text": "It is stored in the wheels"
        },
        {
          "id": "d",
          "text": "Nothing ever happens"
        }
      ],
      "correctAnswer": "a",
      "explanation": "The program reads the sensor data and chooses an action.",
      "points": 1,
      "id": "q5"
    },
    {
      "type": "multiple-choice",
      "question": "A robot stops when its sensor detects a wall. What is the sensor reading used for?",
      "options": [
        {
          "id": "a",
          "text": "To decide when to stop"
        },
        {
          "id": "b",
          "text": "To change colour"
        },
        {
          "id": "c",
          "text": "To make music"
        },
        {
          "id": "d",
          "text": "To charge the battery"
        }
      ],
      "correctAnswer": "a",
      "explanation": "The sensor reading triggers the 'stop' action in the program.",
      "points": 1,
      "id": "q6"
    }
  ]
};
