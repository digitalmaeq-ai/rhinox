/**
 * Learning Path core: builds the path from the book registry and checks it. Pure functions only:
 * no file, network, storage or React access. The registry is passed in, never imported, so this
 * module can be used by any caller that already has the registry.
 *
 * Rule: the path holds order, labels and progress. It never copies content. Every step points to a
 * registry resource that is public, meant for learners, verified, and not an interactive lesson
 * (the Code Studio lessons are set aside until the owner picks between the two designs).
 *
 * Keep this file free of runtime imports so scripts can load it with node --experimental-strip-types.
 */
import type { TmcBookRegistry, TmcLearningResource } from "../../types/tmc-registry";
import type { LearningPath, LearningPathStep, LearningPathStepKind, LearningPathStop } from "../../types/tmc-learning-path";

/** Steps appear in this order on every stop. */
export const STEP_ORDER: readonly LearningPathStepKind[] = ["learn", "play", "match", "quiz"];

/** The registry resource type each kind of step must point at. */
export const RESOURCE_TYPE_FOR_STEP: Readonly<Record<LearningPathStepKind, TmcLearningResource["resourceType"]>> = {
  learn: "learning-hub-page",
  play: "game",
  match: "game",
  quiz: "quiz",
};

const LABEL_FOR_STEP: Readonly<Record<LearningPathStepKind, string>> = {
  learn: "Learn",
  play: "Play",
  match: "Match",
  quiz: "Quiz",
};

/** Registry ids end with these, for example "tmc-n1-t1-w1-screen-game". */
const ID_SUFFIX_FOR_STEP: Readonly<Record<LearningPathStepKind, string>> = {
  learn: "-week-page",
  play: "-screen-game",
  match: "-matching-game",
  quiz: "-quiz",
};

/** A resource the child path may open: public, for learners, verified. Never teacher-only or licensed. */
export function isLearnerSafeResource(resource: TmcLearningResource): boolean {
  return resource.accessLevel === "public"
    && resource.audience.includes("learner")
    && resource.availability === "verified"
    && resource.resourceType !== "interactive-lesson";
}

export function buildLearningPath(registry: TmcBookRegistry, level: string): LearningPath {
  const resources = registry.resources.filter((item) => item.level === level);
  const byId = new Map(resources.map((item) => [item.id, item]));
  const weeks = new Map<string, { term: number; week: number; title: string }>();
  for (const lesson of registry.lessons) {
    if (lesson.level !== level || lesson.unitKind !== "week" || lesson.term === undefined || lesson.week === undefined) continue;
    const key = `${lesson.term}-${lesson.week}`;
    if (!weeks.has(key)) weeks.set(key, { term: lesson.term, week: lesson.week, title: lesson.lessonTitle });
  }
  const stops: LearningPathStop[] = [];
  for (const { term, week, title } of [...weeks.values()].sort((a, b) => a.term - b.term || a.week - b.week)) {
    const page = resources.find((item) => item.resourceType === "learning-hub-page" && item.term === term && item.week === week);
    if (!page) continue;
    const prefix = page.id.slice(0, page.id.length - ID_SUFFIX_FOR_STEP.learn.length);
    const steps: LearningPathStep[] = [];
    for (const kind of STEP_ORDER) {
      const resource = byId.get(`${prefix}${ID_SUFFIX_FOR_STEP[kind]}`);
      if (!resource || !isLearnerSafeResource(resource)) continue;
      steps.push({ id: `${prefix}:${kind}`, kind, resourceId: resource.id, label: LABEL_FOR_STEP[kind] });
    }
    stops.push({ id: prefix, level, term, week, title, steps });
  }
  return { id: `tmc-learning-path-${level.toLowerCase().replace(/\s+/g, "-")}`, level, title: `${level} Learning Path`, order: "soft", stops };
}

export interface PathValidation {
  ok: boolean;
  errors: string[];
}

export interface PathValidateOptions {
  /** Every week the registry knows for the level must have a stop. Default true. */
  requireEveryWeek?: boolean;
}

export function validateLearningPath(path: LearningPath, registry: TmcBookRegistry, options: PathValidateOptions = {}): PathValidation {
  const errors: string[] = [];
  const err = (message: string) => errors.push(message);
  const resources = new Map(registry.resources.map((item) => [item.id, item]));
  if (path.order !== "soft") err(`path order must be "soft", found "${String(path.order)}"`);
  const seenStops = new Set<string>();
  const seenSteps = new Set<string>();
  for (const stop of path.stops) {
    if (seenStops.has(stop.id)) err(`duplicate stop ${stop.id}`);
    seenStops.add(stop.id);
    if (stop.level !== path.level) err(`${stop.id}: level ${stop.level} is not the path level ${path.level}`);
    if (stop.steps.length === 0) err(`${stop.id}: a stop needs at least one step`);
    let lastIndex = -1;
    for (const step of stop.steps) {
      if (seenSteps.has(step.id)) err(`duplicate step ${step.id}`);
      seenSteps.add(step.id);
      const index = STEP_ORDER.indexOf(step.kind);
      if (index < 0) { err(`${step.id}: unknown step kind ${String(step.kind)}`); continue; }
      if (index <= lastIndex) err(`${step.id}: steps must follow the order ${STEP_ORDER.join(", ")} with no repeats`);
      lastIndex = index;
      const resource = resources.get(step.resourceId);
      if (!resource) { err(`${step.id}: resource ${step.resourceId} is not in the registry`); continue; }
      if (resource.resourceType !== RESOURCE_TYPE_FOR_STEP[step.kind]) err(`${step.id}: a ${step.kind} step must point at a ${RESOURCE_TYPE_FOR_STEP[step.kind]}, found ${resource.resourceType}`);
      if (!step.resourceId.endsWith(ID_SUFFIX_FOR_STEP[step.kind])) err(`${step.id}: resource ${step.resourceId} is not this week's ${step.kind} resource`);
      if (resource.level !== stop.level || resource.term !== stop.term || resource.week !== stop.week) err(`${step.id}: resource ${step.resourceId} belongs to a different week`);
      if (!isLearnerSafeResource(resource)) err(`${step.id}: resource ${step.resourceId} is not safe for the child path (needs public, learner, verified, not an interactive lesson)`);
      if (!step.label.trim()) err(`${step.id}: label is empty`);
    }
  }
  if (options.requireEveryWeek !== false) {
    const wanted = new Set(registry.lessons.filter((lesson) => lesson.level === path.level && lesson.unitKind === "week").map((lesson) => `t${lesson.term}-w${lesson.week}`));
    const have = new Set(path.stops.map((stop) => `t${stop.term}-w${stop.week}`));
    for (const key of wanted) if (!have.has(key)) err(`missing stop for ${key}`);
  }
  return { ok: errors.length === 0, errors };
}
