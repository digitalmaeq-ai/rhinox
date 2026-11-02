// The tool directory for the Code Studio shell.
//
// Every entry is a real, working route that already exists in the product. The
// directory never invents tools: to list a new one, add its route first.
// Difficulty is editorial guidance for learners and can be adjusted here.

import type { Project, ProjectKind } from "./rhinocode/projects.ts";

export type StudioCategory = "Coding" | "Robotics" | "Game Design" | "Challenges" | "Learning";
export type StudioDifficulty = "Beginner" | "Intermediate";

export interface StudioEntry {
  id: string;
  name: string;
  category: StudioCategory;
  difficulty: StudioDifficulty;
  /** Who it suits, in plain words. */
  level: string;
  description: string;
  href: string;
}

export const STUDIO_ENTRIES: readonly StudioEntry[] = [
  {
    id: "learn",
    name: "Learn: guided lessons",
    category: "Learning",
    difficulty: "Beginner",
    level: "Nursery to Year 6",
    description: "Curriculum-led lessons, one step at a time, with RhinoBot as your guide.",
    href: "/coding-robotics/code-studio/learn",
  },
  {
    id: "workspace",
    name: "Beginner Workspace",
    category: "Robotics",
    difficulty: "Beginner",
    level: "First steps",
    description: "Build an instruction sequence, run a robot simulation and see how algorithms work.",
    href: "/coding-robotics/code-studio/workspace",
  },
  {
    id: "robot-lab",
    name: "Robot Programming Lab",
    category: "Robotics",
    difficulty: "Beginner",
    level: "Blocks",
    description: "Snap blocks together to guide a robot through missions, from first steps to loops and decisions.",
    href: "/coding-robotics/robot-lab",
  },
  {
    id: "arduino",
    name: "Arduino Studio",
    category: "Robotics",
    difficulty: "Intermediate",
    level: "Years 8 and up",
    description: "Write Arduino programs and watch them run on a simulated board with LEDs, buttons, a buzzer and a Serial Monitor.",
    href: "/coding-robotics/code-studio/arduino",
  },
  {
    id: "python",
    name: "Python Studio",
    category: "Coding",
    difficulty: "Beginner",
    level: "Years 7 and up",
    description: "Write and run real Python in your browser, with guided exercises that check your answers.",
    href: "/coding-robotics/code-studio",
  },
  {
    id: "web",
    name: "Web Studio",
    category: "Coding",
    difficulty: "Beginner",
    level: "Years 7 and up",
    description: "Write HTML and CSS and watch your web page appear as you type.",
    href: "/coding-robotics/code-studio/web",
  },
  {
    id: "game-creator",
    name: "Game Creator",
    category: "Game Design",
    difficulty: "Beginner",
    level: "All learners",
    description: "Design levels with enemies, keys and doors, choose the rules, then play the game you built.",
    href: "/coding-robotics/game-creator",
  },
  {
    id: "challenges",
    name: "Game Challenges",
    category: "Challenges",
    difficulty: "Beginner",
    level: "All learners",
    description: "Short coding puzzles and missions to practise one idea at a time.",
    href: "/coding-robotics/challenges",
  },
];

export type EntrySort = "name" | "category" | "difficulty";

const DIFFICULTY_ORDER: Record<StudioDifficulty, number> = { Beginner: 0, Intermediate: 1 };

/** Search text matches name, category, level and description, ignoring case. */
export function filterEntries(
  entries: readonly StudioEntry[],
  query: string,
  category: StudioCategory | "All",
): StudioEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    if (category !== "All" && entry.category !== category) return false;
    const haystack = `${entry.name} ${entry.category} ${entry.level} ${entry.description}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function sortEntries(entries: readonly StudioEntry[], sort: EntrySort, descending = false): StudioEntry[] {
  const sign = descending ? -1 : 1;
  return [...entries].sort((a, b) => {
    let result = 0;
    if (sort === "difficulty") result = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    else if (sort === "category") result = a.category.localeCompare(b.category);
    if (result === 0) result = a.name.localeCompare(b.name);
    return result * sign;
  });
}

/** Only categories that have at least one entry are offered as filters. */
export function availableCategories(entries: readonly StudioEntry[]): StudioCategory[] {
  const seen = new Set(entries.map((entry) => entry.category));
  return (["Coding", "Robotics", "Game Design", "Challenges", "Learning"] as const).filter((c) => seen.has(c));
}

// ---- Saved projects -------------------------------------------------------

const PROJECT_PATHS: Record<ProjectKind, string> = {
  "robot-program": "/coding-robotics/robot-lab",
  python: "/coding-robotics/code-studio",
  arduino: "/coding-robotics/code-studio/arduino",
  web: "/coding-robotics/code-studio/web",
  game: "/coding-robotics/game-creator",
};

export function projectHref(project: Pick<Project, "id" | "kind">): string {
  return `${PROJECT_PATHS[project.kind]}?project=${encodeURIComponent(project.id)}`;
}

export type ProjectSort = "updated" | "name" | "type";

export function sortProjects(projects: readonly Project[], sort: ProjectSort): Project[] {
  return [...projects].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "type") return a.kind.localeCompare(b.kind) || b.updatedAt - a.updatedAt;
    return b.updatedAt - a.updatedAt;
  });
}
