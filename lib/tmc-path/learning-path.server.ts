/**
 * Server-only access to the Nursery 1 Learning Path for pages. The path is built from the registry's
 * public, learner-facing resources only and checked before it is used; a failed check stops the build
 * instead of showing a broken trail. Never import this module into a Client Component.
 */
import "server-only";
import { NURSERY_1_REGISTRY } from "../tmc-registry/seed/nursery-1";
import { buildLearningPath, validateLearningPath } from "./learning-path";
import { buildPathView, type PathView } from "./view";

export function getNursery1PathView(): PathView {
  const path = buildLearningPath(NURSERY_1_REGISTRY, "Nursery 1");
  const check = validateLearningPath(path, NURSERY_1_REGISTRY);
  if (!check.ok) throw new Error(`Learning Path failed its checks: ${check.errors.slice(0, 3).join("; ")}`);
  return buildPathView(path, NURSERY_1_REGISTRY);
}
