# Rhinox Code Studio V2 — Follow-up Audit (21 October 2026)

**Branch:** `product/rhinox-code-studio-v2`  
**Pull request:** [#17](https://github.com/digitalmaeq-ai/rhinox/pull/17) — open; not merged.  
**Validation:** GitHub Actions run [39611993835](https://github.com/digitalmaeq-ai/rhinox/actions/runs/39611993835) passed on commit `d68d12d8bdfca663cb53edb76562581b9afe60f6`. The run passed the curriculum importer, private-curriculum access policy, robot simulator, conditional runtime, text parser, lesson gates, lint and production build. This run's full dependency audit reported five high-severity findings and no critical findings.

## Dependency security disposition

- Updated `next` and `eslint-config-next` to `16.4.2`; the production build passed on the validated commit.
- The full `npm audit` output traces five high-severity findings to the `braces` package through the development linting dependency chain: `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`.
- The current advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects `braces <= 3.0.3` and currently lists **no patched upstream version**. The repository lockfile resolves `braces@3.0.3`. An `npm audit fix --force` suggestion downgrades `eslint-config-next` to 14.x, which is a breaking, inappropriate change for this Next.js 16 project.
- Do not claim the complete development dependency tree is vulnerability-free. Do not install an unreviewed fork or suppress the advisory as if fixed.
- Added a production-only audit gate (`npm audit --omit=dev --audit-level=high`) alongside the critical-severity full-tree gate. This distinguishes exploitable production dependencies from the currently unpatched development-tool advisory while continuing to report the latter in CI logs.

## Remaining audit items — no new feature work yet

1. Confirm the new production-only audit gate passes on the current branch head.
2. Add a regression test for the workspace Clear/reset action, including text mode, parse error and execution trace reset.
3. Run a dedicated TypeScript check if the repository has a safe, supported command; do not silently change compiler settings to make it pass.
4. Complete browser/manual keyboard, screen-reader, reduced-motion and mobile viewport checks. CI build/lint do not substitute for these.
5. Confirm private workbook and raw Master Matrix exports remain excluded from tracked files and generated artifacts.
6. Revisit the upstream `braces` advisory when a patched version or a justified alternative is available.

## Explicit limitations

Conditional execution exists as a safe runtime module but is not yet integrated into learner-written `if/else` syntax in the editor. Account-backed progress and trusted authentication/entitlement are not implemented; licensed curriculum access remains disabled. No production release or merge is authorized by this audit.
