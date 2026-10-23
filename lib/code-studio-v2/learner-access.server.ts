/**
 * Trusted authentication/entitlement adapter for licensed curriculum.
 *
 * This repository currently has no connected learner identity provider.
 * Fail closed until a real server-side auth integration is implemented.
 * Do not replace this with client-supplied IDs, cookies parsed without
 * verification, query parameters, or a caller-provided entitlement boolean.
 */
import "server-only";

import type { CurriculumAccess } from "./curriculum-access-core";

export async function getAuthenticatedCurriculumAccess(): Promise<CurriculumAccess | null> {
  // No trusted authentication provider is configured in this release.
  // Licensed curriculum must remain unavailable until this function verifies
  // the session and resolves entitlements from a trusted server-side source.
  return null;
}
