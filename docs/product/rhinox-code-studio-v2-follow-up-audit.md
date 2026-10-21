# Rhinox Code Studio V2 — Follow-up Audit (21 October 2026)

**Branch:** `product/rhinox-code-studio-v2`  
**Pull request:** [#17](https://github.com/digitalmaeq-ai/rhinox/pull/17) — open; not merged.  
**Validation:** GitHub Actions run [39618046414](https://github.com/digitalmaeq-ai/rhinox/actions/runs/39618046414) passed on commit `bb48d110f03646a2276dba804aed71a8e74a9fc0`, including the conditional text parser tests, lint, TypeScript check and production build. The full development dependency audit still reports five high-severity findings and no critical findings. The comprehensive audit is paused by product decision while planned core development resumes; this is not release approval.

## Dependency security disposition

- Updated `next` and `eslint-config-next` to `16.4.2`; the production build passed on the validated commit.
- The full `npm audit` output traces five high-severity findings to the `braces` package through the development linting dependency chain: `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`.
- The current advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects `braces <= 3.0.3` and currently lists **no patched upstream version**. The repository lockfile resolves `braces@3.0.3`. An `npm audit fix --force` suggestion downgrades `eslint-config-next` to 14.x, which is a breaking, inappropriate change for this Next.js 16 project.
- Do not claim the complete development dependency tree is vulnerability-free. Do not install an unreviewed fork or suppress the advisory as if fixed.
- Added a production-only audit gate (`npm audit --omit=dev --audit-level=high`) alongside the critical-severity full-tree gate. This distinguishes exploitable production dependencies from the currently unpatched development-tool advisory while continuing to report the latter in CI logs.

## Deferred audit items — resume after the planned development milestone

1. **Completed and validated:** centralised workspace Clear/reset state and added regression assertions for blocks, text content, parser errors, results/traces and trace navigation. The check passed in run [39616683368](https://github.com/digitalmaeq-ai/rhinox/actions/runs/39616683368).
2. **Completed and validated:** added a dedicated `npm run typecheck` (`tsc --noEmit`) script and CI step; it passed in run [39616683368](https://github.com/digitalmaeq-ai/rhinox/actions/runs/39616683368).
3. Complete browser/manual keyboard, screen-reader, reduced-motion and mobile viewport checks. Existing browser test scripts require a real browser and Playwright; CI build/lint do not substitute for these.
4. Rechecked the feature-branch tree at commit `e3300bf6bb6ec7821116972579e23fad0413e89c`: no source workbook or raw Master Matrix CSV filename matches were present. Recheck generated artifacts before release.
5. Revisit the upstream `braces` advisory when a patched version or a justified alternative is available.
6. Conditional parser, lint, TypeScript and production build checks passed in run [39618046414](https://github.com/digitalmaeq-ai/rhinox/actions/runs/39618046414). Still validate the V2 workspace in a real browser, including conditional branch feedback, keyboard use, screen-reader output, reduced motion and mobile viewport.

## Explicit limitations

The conditional runtime is integrated with learner-written `if/else` syntax through a bounded parser, and its automated CI checks passed in run [39618046414](https://github.com/digitalmaeq-ai/rhinox/actions/runs/39618046414). Browser-level validation remains outstanding. Account-backed progress and trusted authentication/entitlement are not implemented; licensed curriculum access remains disabled. No production release or merge is authorized by this audit.
