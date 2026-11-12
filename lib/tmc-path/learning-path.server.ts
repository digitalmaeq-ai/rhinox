/**
 * Server-only access to a level's Learning Path for pages. The path is built from the registry's
 * public, learner-facing resources only and checked before it is used; a failed check stops the build
 * instead of showing a broken trail. Never import this module into a Client Component.
 *
 * To add a level: add its registry here, add it to PATH_LEVELS in ./levels, and add a small page.
 */
import "server-only";
import type { TmcBookRegistry } from "../../types/tmc-registry";
import { NURSERY_1_REGISTRY } from "../tmc-registry/seed/nursery-1";
import { buildLearningPath, validateLearningPath } from "./learning-path";
import { pathLevelFor } from "./levels";
import { buildPathView, type PathView } from "./view";

/** One registry per level slug. Levels without book data are not listed. */
const REGISTRIES: Readonly<Record<string, TmcBookRegistry>> = {
  "nursery-1": NURSERY_1_REGISTRY,
};

export function getPathView(levelSlug: string): PathView {
  const config = pathLevelFor(levelSlug);
  const registry = REGISTRIES[levelSlug];
  if (!config || !registry) throw new Error(`No Learning Path is set up for level "${levelSlug}"`);
  const path = buildLearningPath(registry, config.level);
  const check = validateLearningPath(path, registry);
  if (!check.ok) throw new Error(`Learning Path failed its checks: ${check.errors.slice(0, 3).join("; ")}`);
  return buildPathView(path, registry);
}
