import type { ProjectContent } from "@/types/projects";

export const waterCycleModel: ProjectContent = {
  id: "project-water-cycle-model",
  title: "Build a Water Cycle Model",
  slug: "water-cycle-model",
  contentType: "project",
  taxonomy: [
    {
      category: "educational",
      path: ["projects", "science-projects", "environmental-projects"],
    },
  ],
  status: "published",
  description: "Build a simple physical model that demonstrates the movement of water through the water cycle.",
  excerpt: "Design and build a model of the water cycle.",
  featured: true,
  placements: ["explore", "education"],
  collections: ["projects", "water-cycle"],
  ageGroups: ["9-14"],
  classLevels: ["Primary 5", "Primary 6", "JSS1", "JSS2"],
  subjects: ["Basic Science", "STEM"],
  topics: ["Water Cycle", "Modelling", "Engineering"],
  difficulty: "beginner",
  durationMinutes: 60,
  skills: ["Design", "Building", "Problem solving"],
  learningObjectives: [
    "Build a simple water-cycle model.",
    "Explain the processes represented by the model."
  ],
  tags: ["project", "water cycle", "model"],
  audience: ["students", "teachers", "parents"],
  author: "Rhinox Scientifica",
  createdAt: "2026-09-16",
  updatedAt: "2026-09-16",
  problem: "How can we create a physical model that represents the water cycle?",
  projectGoal: "Build a simple working model of the water cycle.",
  materials: ["Clear container", "Water", "Plastic wrap", "Ice"],
  tools: ["Scissors"],
  instructions: [
    "Prepare the container.",
    "Add a small amount of water.",
    "Cover the container.",
    "Use cooling to demonstrate condensation.",
    "Observe and explain the changes."
  ],
  testing: ["Observe water movement inside the model."],
  expectedResults: ["Visible condensation should form under suitable conditions."],
  troubleshooting: ["Check that the container is properly covered."]
};



