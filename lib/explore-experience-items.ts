import type { MatrixItem } from "@/app/components/InteractiveMatrix";
import type { ContentItem } from "@/lib/content";
import { getExperienceHref } from "@/lib/experience-sequence";
import { yearsFromAgeGroups } from "@/lib/year-groups";
import type { InteractiveExperienceDefinition } from "@/types/interactive-experiences";

/** Games and quizzes have their own pages, so the Experiences page leaves them out. */
export function isOwnPageContent(item: ContentItem) {
  const branch = (item as ContentItem & { taxonomy?: { category: string; path: string[] }[] }).taxonomy
    ?.find((t) => t.category === "interactive")?.path[1];
  return isVirtualExperiment(item) || branch === "games" || branch === "stem-quizzes" || item.contentType === "quiz" || item.contentType === "game";
}

/** Virtual experiments: the simulation and virtual-lab runtimes (physics, chemistry, biology and similar labs). */
export function isVirtualExperiment(item: ContentItem) {
  return item.contentType === "experience" && ["simulation", "virtual-lab"].includes((item as InteractiveExperienceDefinition).runtime as string);
}

// Plain-language name for how each experience is played, shown on its card.
const formatLabels: Record<string, string> = {
  "drag-classification": "Sorting",
  matching: "Matching",
  sequencing: "Sequencing",
  "shape-rounds": "Sorting & quiz",
  "clock-rounds": "Clock quiz",
  "rhinobot-adventure": "Platform game",
  labelling: "Labelling",
  "grid-path": "Coding puzzle",
  "charger-levels": "Coding levels",
  "rhinobot-lab": "Block coding",
};

// Other content types that can sit in the Experiences branch.
const typeLabels: Record<string, string> = {
  game: "Game",
  quiz: "Quiz",
  challenge: "Challenge",
};

function formatOf(item: ContentItem) {
  if (item.contentType === "experience") {
    const experience = item as InteractiveExperienceDefinition;
    if (experience.component && formatLabels[experience.component]) {
      return formatLabels[experience.component];
    }
    return experience.runtime === "standard" ? "Guided lesson" : undefined;
  }
  return typeLabels[item.contentType];
}

// "Experience" filter values: an interactive experience's modes, or the
// content type ("game", "quiz") for everything else.
function typesOf(item: ContentItem) {
  return item.contentType === "experience"
    ? (item as InteractiveExperienceDefinition).modes
    : [item.contentType];
}

export function toMatrixItems(library: ContentItem[]): MatrixItem[] {
  return library.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    category: item.subjects ?? [],
    type: typesOf(item),
    age: item.ageGroups ?? [],
    yearFrom: yearsFromAgeGroups(item.ageGroups)?.from,
    yearTo: yearsFromAgeGroups(item.ageGroups)?.to,
    href: getExperienceHref(item),
    format: formatOf(item),
    durationMinutes: item.durationMinutes,
    difficulty: item.difficulty,
    image: item.thumbnail,
  }));
}
