/**
 * Server-only access boundary for the Book Registry.
 * Never import this module into a Client Component. The registry is not sent to the browser.
 *
 * Fails closed: until a trusted learner identity provider is connected
 * (see lib/code-studio-v2/learner-access.server.ts), every call returns null.
 */
import "server-only";
import { getAuthenticatedCurriculumAccess } from "../code-studio-v2/learner-access.server";
import type { TmcBookLesson } from "../../types/tmc-registry";
import { authorizeBookLesson } from "./book-registry";
import { NURSERY_1_REGISTRY } from "./seed/nursery-1";

export async function getLicensedBookLesson(lessonId: string): Promise<TmcBookLesson | null> {
  if (typeof lessonId !== "string" || lessonId.length === 0) return null;
  const access = await getAuthenticatedCurriculumAccess();
  return authorizeBookLesson(NURSERY_1_REGISTRY, lessonId, access);
}
