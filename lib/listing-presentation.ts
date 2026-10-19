// How each content section is presented: the photograph, the two-line title
// and the short lead. Photographs live in /public/images.

export interface ListingPresentation {
  image: string;
  alt: string;
  lineTwo: string;
  chips: string[];
}

const fallback: ListingPresentation = {
  image: "/images/hero/stem-lab.jpg",
  alt: "A bright STEM laboratory",
  lineTwo: "made practical.",
  chips: [],
};

const map: Record<string, ListingPresentation> = {
  "/education/stem-steam": {
    image: "/images/journey/journey-science.jpg",
    alt: "A teacher and a young learner at a chalkboard of equations",
    lineTwo: "learning by doing.",
    chips: ["Science", "Maths", "Engineering"],
  },
  "/education/think-move-code": {
    image: "/images/hero/coding.jpg",
    alt: "Lines of code on a screen",
    lineTwo: "the book and the practice.",
    chips: ["Think", "Move", "Code"],
  },
  "/education/books": {
    image: "/images/hero/classroom.jpg",
    alt: "Learners reading together in a classroom",
    lineTwo: "that make STEM practical.",
    chips: ["Books", "Workbooks"],
  },
  "/education/coding-robotics": {
    image: "/images/journey/journey-robotics.jpg",
    alt: "Young people building a robotics project together",
    lineTwo: "from first steps to robots.",
    chips: ["Coding", "Robotics"],
  },
  "/education/teacher-parent-resources": {
    image: "/images/hero/stem-lab.jpg",
    alt: "A bright STEM laboratory ready for a class",
    lineTwo: "for school and home.",
    chips: ["Teachers", "Parents"],
  },
  "/explore/experiments": {
    image: "/images/hero/microscope.jpg",
    alt: "A compound microscope on a laboratory bench",
    lineTwo: "to try and to question.",
    chips: ["Investigate", "Observe"],
  },
  "/explore/project-lab": {
    image: "/images/journey/journey-pexels.jpg",
    alt: "Students working with laboratory apparatus",
    lineTwo: "ideas into working things.",
    chips: ["Build", "Test", "Improve"],
  },
  "/explore/stem-challenges": {
    image: "/images/journey/journey-robotics.jpg",
    alt: "Learners solving a building challenge together",
    lineTwo: "with no single answer.",
    chips: ["Design", "Solve"],
  },
  "/explore/stem-games": {
    image: "/images/journey/journey-unsplash.jpg",
    alt: "A learner concentrating on a screen",
    lineTwo: "that teach as you play.",
    chips: ["Play", "Sort", "Match"],
  },
  "/coding-robotics/challenges": {
    image: "/images/hero/coding.jpg",
    alt: "A learner coding at a laptop",
    lineTwo: "to solve with code.",
    chips: ["Puzzles", "Missions", "Robots"],
  },
  "/explore/stem-quizzes": {
    image: "/images/journey/journey-pixabay.jpg",
    alt: "Blue liquid being poured in a laboratory",
    lineTwo: "that check what you know.",
    chips: ["Quick", "Scored"],
  },
  "/resources/articles": {
    image: "/images/journey/journey-science.jpg",
    alt: "A teacher and a young learner at a chalkboard of equations",
    lineTwo: "worth reading twice.",
    chips: ["Read", "Think"],
  },
  "/resources/videos": {
    image: "/images/journey/journey-unsplash.jpg",
    alt: "A student looking through a microscope",
    lineTwo: "then try it yourself.",
    chips: ["Watch", "Try"],
  },
  "/resources/free-downloads": {
    image: "/images/hero/classroom.jpg",
    alt: "Learners in a classroom",
    lineTwo: "ready to print and use.",
    chips: ["Guides", "Worksheets"],
  },
  "/resources/badges": {
    image: "/images/hero/classroom.jpg",
    alt: "Learners celebrating in a classroom",
    lineTwo: "for every step forward.",
    chips: ["Earn", "Collect"],
  },
  "/resources/certificates": {
    image: "/images/hero/classroom.jpg",
    alt: "Learners in a classroom",
    lineTwo: "of what they have learned.",
    chips: ["Achieve"],
  },
  "/shop/digital-resources": {
    image: "/images/hero/coding.jpg",
    alt: "Lines of code on a screen",
    lineTwo: "you can download today.",
    chips: ["Instant", "Digital"],
  },
};

export function getListingPresentation(path: string): ListingPresentation {
  return map[path] ?? fallback;
}

// The photograph for a single item's page, by what kind of content it is.
const byType: Record<string, string> = {
  lesson: "/images/journey/journey-science.jpg",
  activity: "/images/hero/classroom.jpg",
  experiment: "/images/hero/microscope.jpg",
  worksheet: "/images/hero/classroom.jpg",
  assessment: "/images/hero/classroom.jpg",
  project: "/images/journey/journey-pexels.jpg",
  game: "/images/journey/journey-unsplash.jpg",
  quiz: "/images/journey/journey-pixabay.jpg",
  challenge: "/images/journey/journey-robotics.jpg",
  experience: "/images/hero/stem-lab.jpg",
  download: "/images/hero/classroom.jpg",
  article: "/images/journey/journey-science.jpg",
  video: "/images/journey/journey-unsplash.jpg",
  "teacher-resource": "/images/hero/stem-lab.jpg",
  "parent-resource": "/images/hero/classroom.jpg",
  product: "/images/hero/classroom.jpg",
  certificate: "/images/hero/classroom.jpg",
  badge: "/images/hero/classroom.jpg",
};

export function imageForType(type: string): string {
  return byType[type] ?? "/images/hero/stem-lab.jpg";
}

export const TYPE_LABEL: Record<string, string> = {
  lesson: "Lesson",
  activity: "Activity",
  experiment: "Experiment",
  worksheet: "Worksheet",
  assessment: "Assessment",
  project: "Project",
  game: "Game",
  quiz: "Quiz",
  challenge: "Challenge",
  experience: "Experience",
  download: "Download",
  article: "Article",
  video: "Video",
  "teacher-resource": "Teacher resource",
  "parent-resource": "Parent resource",
  product: "Product",
  certificate: "Certificate",
  badge: "Badge",
};
