import type { ExperimentContent } from "@/types/education";

// The physical/educational description of the activity (the "WHAT"). The
// interactive treatment lives in content/experiences/animals-and-habitats.ts,
// linked by a "companion" relationship — the same pattern as Sorting
// Materials.
export const animalsAndHabitatsExperiment: ExperimentContent = {
  id: "experiment-animals-and-habitats",
  title: "Animals and Their Habitats",
  slug: "animals-and-habitats",
  contentType: "experiment",
  taxonomy: [
    {
      category: "educational",
      path: ["learning", "experiments"],
    },
  ],
  status: "published",

  description:
    "Look closely at five animals, work out which habitat each one is suited to, and explain the features that help it survive there.",

  excerpt: "Why does a camel live in the desert and not in the Arctic?",

  featured: true,

  placements: ["explore", "education"],
  collections: ["experiments", "living-things-and-habitats"],

  ageGroups: ["6-7"],
  classLevels: ["Year 2"],

  subjects: ["Science"],
  topics: ["Living Things", "Habitats", "Adaptation"],

  difficulty: "beginner",
  durationMinutes: 20,

  skills: ["Observation", "Matching", "Explaining"],

  learningObjectives: [
    "Match animals to the habitats they are suited to.",
    "Describe a feature that helps an animal survive in its habitat.",
  ],

  tags: ["animals", "habitats", "living things", "year 2"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",

  objective:
    "To match each animal to its habitat and explain which of its features help it live there.",

  materials: [
    "Picture cards of a fish, a camel, a polar bear, a monkey and an owl",
    "Picture cards of a pond, a desert, the Arctic, a rainforest and a woodland",
  ],

  procedure: [
    "Look carefully at each animal card and describe what you notice about its body.",
    "Look at each habitat card and describe what it is like there: hot or cold, wet or dry, trees or water.",
    "Place each animal next to the habitat you think it is suited to.",
    "For each match, say one feature that helps the animal survive in that habitat.",
  ],

  observations: [
    "The fish has fins and gills, which only work in water.",
    "The camel's hump stores fat, helping it survive with little food or water.",
    "The polar bear's thick fur keeps it warm in freezing temperatures.",
    "The monkey's long arms and tail help it climb in tall trees.",
    "The owl rests in trees during the day and hunts at night.",
  ],

  results:
    "Fish matched to the pond, camel to the desert, polar bear to the Arctic, monkey to the rainforest and owl to the woodland.",

  conclusion:
    "Animals live in habitats that provide what they need, and their body features help them survive there.",

  extensionActivities: [
    "Choose another animal and decide which habitat it would suit best, giving a reason.",
    "Draw an animal that could live in two different habitats and explain how.",
  ],

  // Interactive-readiness metadata (types/education.ts). Built as a real
  // interactive experience — see the paired "experience" record.
  interactionModel: "interactive-2d",
  interactionFeatures: [
    "drag-and-drop",
    "matching",
    "immediate-feedback",
    "retry",
  ],
  // No simulationVariables: matching animals to habitats has no adjustable
  // scientific parameter.
};
