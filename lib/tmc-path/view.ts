/**
 * Turns a validated Learning Path into what a page needs: the same stops and steps, each step with
 * the address it opens. Addresses come from the registry's own resource addresses; this file holds
 * no content and no per-week data. Pure: no file, network, storage or React access.
 *
 * The two games open through the existing play page (it frames the game and links back to the
 * week), not the bare game file.
 */
import type { TmcBookRegistry } from "../../types/tmc-registry";
import type { LearningPath, LearningPathStepKind } from "../../types/tmc-learning-path";

export interface PathViewStep {
  id: string;
  kind: LearningPathStepKind;
  label: string;
  href: string;
}

export interface PathViewStop {
  id: string;
  term: number;
  week: number;
  title: string;
  /** The week page, which is also the Learn step. */
  weekHref: string;
  steps: PathViewStep[];
}

export interface PathView {
  title: string;
  level: string;
  stops: PathViewStop[];
}

/** The play page's game keys: "screen" is the Play step, "pictures" is the Match step. */
const PLAY_KEY: Readonly<Partial<Record<LearningPathStepKind, string>>> = { play: "screen", match: "pictures" };

export function buildPathView(path: LearningPath, registry: TmcBookRegistry): PathView {
  const uri = new Map(registry.resources.map((item) => [item.id, item.uri ?? ""]));
  const stops: PathViewStop[] = path.stops.map((stop) => {
    const learn = stop.steps.find((step) => step.kind === "learn");
    const weekHref = learn ? uri.get(learn.resourceId) ?? "" : "";
    const steps: PathViewStep[] = stop.steps.map((step) => {
      const playKey = PLAY_KEY[step.kind];
      const href = playKey ? `${weekHref}/play/${playKey}` : uri.get(step.resourceId) ?? "";
      return { id: step.id, kind: step.kind, label: step.label, href };
    });
    return { id: stop.id, term: stop.term, week: stop.week, title: stop.title, weekHref, steps };
  });
  return { title: path.title, level: path.level, stops };
}
