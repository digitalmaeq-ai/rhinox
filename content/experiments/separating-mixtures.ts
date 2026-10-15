import type { ExperimentContent } from "@/types/education";

// The practical experiment (the "WHAT"). The interactive treatment lives in
// content/experiences/separating-mixtures.ts, linked by a "companion"
// relationship — the same pattern as Sorting Materials and Animals and
// Their Habitats.
export const separatingMixturesExperiment: ExperimentContent = {
  id: "experiment-separating-mixtures",
  title: "Separating Mixtures",
  slug: "separating-mixtures",
  contentType: "experiment",
  taxonomy: [
    {
      category: "educational",
      path: ["learning", "experiments"],
    },
  ],
  status: "published",

  description:
    "Separate four everyday mixtures using filtering, sieving, evaporating and a magnet, and explain why each method works.",

  excerpt: "How do you get the salt back out of salt water?",

  featured: true,

  placements: ["explore", "education"],
  collections: ["experiments", "materials-and-properties"],

  ageGroups: ["9-10"],
  classLevels: ["Year 5"],

  subjects: ["Science"],
  topics: ["Mixtures", "Separating Materials", "Dissolving", "Properties of Materials"],

  difficulty: "beginner",
  durationMinutes: 45,

  skills: ["Observation", "Classification", "Reasoning", "Explaining"],

  learningObjectives: [
    "Choose a suitable method to separate a mixture.",
    "Explain how filtering, sieving, evaporating and magnetism separate materials.",
  ],

  tags: ["mixtures", "separating", "filtering", "evaporation", "year 5"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-27",
  updatedAt: "2026-09-27",

  objective:
    "To choose and use the right method to separate four mixtures, and explain which property of the materials makes each method work.",

  materials: [
    "Sand",
    "Water",
    "Salt",
    "Iron filings",
    "Pebbles",
    "Clear cups or beakers",
  ],

  equipment: [
    "Funnel and filter paper",
    "Sieve",
    "Magnet in a plastic bag (keeps the iron filings off the magnet)",
    "Shallow dish for evaporating",
  ],

  safetyNotes: [
    "Never taste any of the mixtures.",
    "Leave the salt water to evaporate in a warm, sunny place. Only heat it with an adult supervising.",
    "Keep the magnet inside a plastic bag so iron filings do not stick to it.",
  ],

  procedure: [
    "Mix sand with water, then pour it through a funnel lined with filter paper into a cup.",
    "Stir salt into warm water until it disappears, then pour a little into a shallow dish and leave it somewhere warm.",
    "Stir iron filings into dry sand, then move the bagged magnet slowly over the mixture.",
    "Mix pebbles with dry sand, then shake the mixture through a sieve.",
    "Record what is left behind for each method.",
  ],

  observations: [
    "The filter paper trapped the sand while clear water passed through.",
    "After a few days the water had gone and salt crystals were left in the dish.",
    "The iron filings were pulled onto the bagged magnet; the sand stayed behind.",
    "The sand fell through the sieve and the pebbles stayed in it.",
  ],

  results:
    "Sand and water were separated by filtering, salt water by evaporating, iron filings and sand with a magnet, and pebbles and sand by sieving.",

  conclusion:
    "Each separation method works because of a property of the materials: particle size (sieving, filtering), whether something is dissolved (evaporating), or whether it is magnetic.",

  troubleshooting: [
    "If sand gets through the filter, check the filter paper is not torn and is folded into a cone.",
    "If the salt water will not evaporate, use a shallower dish and a warmer place.",
  ],

  extensionActivities: [
    "Make a mixture of sand, salt and water and plan the order of methods needed to get all three back.",
    "Find out how evaporation is used to collect sea salt.",
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
  // No simulationVariables: choosing a separation method has no adjustable
  // parameter in this version.
};
