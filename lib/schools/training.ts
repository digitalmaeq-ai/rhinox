// Teacher training tracks. Content describes what each track covers; durations, fees and dates are
// agreed per school and are deliberately not listed here.

export interface TrainingTrack {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  topics: string[];
  outcomes: string[];
  links: { label: string; href: string }[];
}

export const TRAINING_TRACKS: TrainingTrack[] = [
  {
    slug: "stem-teaching-methods",
    title: "STEM teaching methods",
    summary: "Practical ways to teach through enquiry, play and making.",
    audience: "Early years, primary and secondary teachers",
    topics: [
      "Teaching through questions and enquiry",
      "Planning a lesson around a hands-on project",
      "Using low-cost materials for practical work",
      "Observing and assessing without a test",
      "Running a class showcase",
    ],
    outcomes: ["Plan an enquiry-based lesson", "Run a simple project with local materials", "Record what children can do using observation"],
    links: [{ label: "See the Nursery 1 lesson plans", href: "/think-move-code/nursery-1" }],
  },
  {
    slug: "coding-and-robotics-for-teachers",
    title: "Coding & robotics for teachers",
    summary: "Build the confidence to lead coding and robotics lessons.",
    audience: "Teachers with no coding background are welcome",
    topics: [
      "Thinking in steps: sequences, loops and conditions",
      "Screen-free coding with movement and cards",
      "Block coding with the RhinoBot Robot Lab",
      "Introducing Python, Arduino and web basics",
      "Helping learners debug without giving the answer",
    ],
    outcomes: ["Teach a screen-free coding lesson", "Guide a class through a robot challenge", "Know which studio suits which age group"],
    links: [
      { label: "Robot Lab", href: "/coding-robotics/robot-lab" },
      { label: "Code Studio", href: "/coding-robotics/code-studio" },
    ],
  },
  {
    slug: "laboratory-skills-and-safety",
    title: "Laboratory skills & safety",
    summary: "Run practicals confidently, safely and with the equipment you have.",
    audience: "Science teachers and laboratory attendants",
    topics: [
      "Setting up and putting away a practical",
      "Handling, storing and labelling equipment",
      "Basic safety rules and what to do when something goes wrong",
      "Using virtual labs when a practical is not possible",
      "Care of equipment and simple stock records",
    ],
    outcomes: ["Prepare a practical with a clear safety routine", "Choose between a real and a virtual experiment", "Keep the laboratory organised"],
    links: [
      { label: "Laboratory equipment", href: "/shop/laboratory-equipment" },
      { label: "Virtual labs", href: "/experiences" },
    ],
  },
  {
    slug: "using-rhinox-resources",
    title: "Using Rhinox resources",
    summary: "Get the most from the books, weekly packs and experiences.",
    audience: "Any teacher or school leader using Rhinox materials",
    topics: [
      "Finding and printing the weekly teacher files",
      "Using the weekly QR code for parents and newsletters",
      "Printable card packs and Step Star stickers",
      "Assessment weeks and the end-of-term showcase",
      "Step Thinker badges and certificates",
    ],
    outcomes: ["Prepare a full week in minutes", "Share learning with parents through QR codes", "Plan an assessment and showcase week"],
    links: [
      { label: "Free resources", href: "/resources" },
      { label: "Nursery 1 programme", href: "/think-move-code/nursery-1" },
    ],
  },
];

export const getTrack = (slug: string) => TRAINING_TRACKS.find((t) => t.slug === slug);
