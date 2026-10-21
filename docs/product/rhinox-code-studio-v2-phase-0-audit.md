# Rhinox Code Studio V2 — Phase 0 Repository Audit

**Branch:** `product/rhinox-code-studio-v2`  
**Scope:** Static review of selected files on `main` and the open Web Studio PR (#15).  
**Not performed:** Local install, lint, TypeScript check, production build, browser execution, automated tests, security penetration testing, or review of all repository files.  
**Curriculum source status:** The authoritative v3.15 workbook was subsequently located in the Library and materialized for inspection. Its Master Matrix has 507 rows and 43 columns. This audit now uses it to ground the first prototype record; it does not certify all existing exercises as aligned to v3.15.

## Executive decision

Build the learner experience around a curriculum and lesson model. Do not make the existing Python Studio the universal front door. Retain execution engines only where they pass explicit product, safety, accessibility, maintainability and learning-quality checks.

The current code has reusable capabilities worth evaluating: browser-side Python execution, exercise checks and hints, project storage, progress tracking, a micro:bit simulation and a proposed HTML/CSS workspace. The major structural gap is that the learner's journey is still organised primarily around studio routes and exercise groups rather than a verified curriculum record and lesson flow.

## Findings

### P0 — No verified curriculum catalogue in the inspected Code Studio contract

The shared `Exercise` type in `lib/code-studio/exercise-kit.ts` has an optional free-text `lesson` field, for example `"Term 1, Week 3"`. It does not require a stable Master Matrix ID, curriculum version, strand, competency, prior learning, Core task, mastery target, assessment evidence, platform requirement or fallback.

**Decision:** Introduce a validated, versioned curriculum data contract. Link activities to stable IDs. Do not label current exercises as official v3.15 coverage until they have been mapped against the actual v3.15 workbook.

### P0 — Default entry route is a tool, not a learning journey

`app/coding-robotics/code-studio/page.tsx` renders `CodeStudioLoader`. `CodeStudioLoader` opens the saved Python project if a project query is present; otherwise the Python workspace starts with its first exercise. The main studio UI is a Monaco-based Python editor with an exercise panel.

This is reasonable as a direct Python workspace but is not an age-neutral entry point for a curriculum that begins with unplugged, movement, sequencing and physical activities.

**Decision:** Create a learner Learning Home and Guided Lesson layer. Keep direct studio routes for users who intentionally choose a specific workspace.

### P1 — Progress is browser-local, not a school learning record

`lib/code-studio/progress.ts` stores completed exercise IDs and drafts in localStorage. `lib/rhinocode/projects.ts` stores project records in localStorage. The project format is versioned, which is useful, but local-only data does not provide cross-device continuity, teacher visibility, assignment management or school-level reporting.

**Decision:** Keep local storage for the low-cost prototype. Define an interface boundary now so a future account-backed service can be introduced without rewriting lessons and UI. Do not add a database before the first end-to-end learning slice proves the need.

### P1 — Environment choice is currently route/exercise driven

The existing Code Studio has separate Python, Arduino and micro:bit-related UI paths; PR #15 proposes a Web Studio. The current exercise groups include Starter, Year 7, Year 8, Year 9 and micro:bit, but the group itself is not a sufficient environment-selection contract.

**Decision:** The curriculum activity should declare its required environment and capability. A router should select a compatible execution adapter and clearly identify whether the result is a simulation or physical hardware test.

### P1 — Web Studio PR #15 is a candidate, not an automatic merge

PR #15 adds the Web Studio route, editor, preview, exercise checks, offline handling and saved-project support. Its project-store change adds the `web` project kind and label. The inspected preview builder removes scripts and external resource paths, adds a restrictive Content Security Policy, and displays the result in a sandboxed iframe; this is a promising layered design.

However, a static diff review cannot establish runtime security or correctness. The PR adds `scripts/web-browser-tests.cjs`, but this review has not run it. The browser-test coverage, preview edge cases, storage migration, offline behaviour, accessibility, performance and full production build still require verification.

**Decision:** Do not merge solely because the feature exists. Run the PR's checks, inspect the preview sandbox and project-store tests, verify the route and offline behaviour, and test on a mobile viewport. If it passes, retain it as an execution adapter that can be opened by the curriculum journey; do not let its standalone exercise list define the overall product architecture.

### P0/P1 — The existing mapping sheet contains likely semantic mismatches

The mapping CSV contains 49 exercise records: 5 Starter exercises are untagged, and 44 have a level/term/week tag whose theme string matches the corresponding v3.15 Master Matrix row. That exact string match is necessary but not sufficient: comparing the mapped row's actual Code activity with the exercise source reveals candidate misalignments.

Examples to verify and correct before official release:
- `mb-dice` (“Shake the dice”) is tagged Year 6 T1 W3, “Choose the Right Loop”. The matrix row's Core activity teaches three loop patterns and a countdown; the exercise teaches shake detection and random numbers. This is a substantive concept mismatch.
- `mb-hot` (“If it's hot…”) is tagged Year 5 T2 W4, “If It’s Dark…”. The matrix activity uses the light sensor and corrects a reversed light threshold; the exercise uses the temperature sensor and a hot-temperature threshold.
- `mb-radio-send` is tagged Year 6 T2 W1, “Readings in a List”, while its title implies radio messaging. The matrix row teaches collecting sensor readings in a list.
- `mb-radio-receive` is tagged Year 6 T2 W2, “First Spreadsheet”, while its title implies radio receiving. The matrix row teaches collecting readings and building a spreadsheet/chart.
- `mb-radio-group` is tagged Year 6 T2 W3, “And / Or”, while its title implies radio group messaging. The matrix row teaches AND/OR sensor conditions and a truth table.

These are review flags, not a complete exercise-by-exercise disposition. They show why a matching free-text theme does not certify an activity. Inspect the full instructions, starter code, hints, tests, hardware requirements and no-device fallback for all 44 tagged exercises. Keep the exercise IDs where practical, but remap, rewrite or retire records where the learning objective differs.

### P1 — Existing exercise content needs curriculum and pedagogy review

The inspected Year 7 exercises contain useful planning, debugging and variables tasks. The `lesson` values are useful hints but do not prove that a task matches the intended week, progression, platform or assessment evidence. A title and a year-group tag are not adequate mapping evidence.

**Decision:** Inventory all exercise records; map each to a real matrix record; classify as retain, revise, move, replace or retire. Validate the task, starter code, hints, checks, prerequisite assumptions and age-appropriateness. Preserve stable exercise IDs or define an explicit migration when records change.

### P1 — Quality gates are not exposed in package scripts

The inspected `package.json` provides content indexing, development, build and lint scripts, but no standard `test`, `typecheck` or `test:e2e` script. A standalone exercise test file exists in the repository, and PR #15 introduces a browser test script; neither has been executed in this audit.

**Decision:** Define repeatable checks before broad implementation: lint, TypeScript, production build, curriculum-data validation, unit tests, browser-level smoke tests, and critical execution/security tests. Avoid claiming a release is verified unless those checks actually pass.

## Reuse / refactor / replace recommendation

| Area | Initial decision | Reason / condition |
|---|---|---|
| Python runner and limits | Evaluate and likely retain behind an adapter | Valuable execution capability; inspect isolation, Stop, timeout, output and error recovery with tests |
| Existing exercise panel | Refactor or replace in Guided Lesson | Tool-oriented list is not a novice-first lesson flow |
| Exercise records | Audit and remap | Optional free-text lesson tags are insufficient for verified curriculum alignment |
| Project store | Retain for prototype; introduce a service boundary | Versioned local storage is a useful low-cost starting point but not multi-device school infrastructure |
| Progress store | Refactor behind a progress interface | Current completion/drafts model does not capture curriculum evidence or mastery criteria |
| micro:bit / Arduino work | Evaluate separately | Must match curriculum activity, supported hardware and truthful simulation labels |
| Web Studio PR #15 | Hold pending checks; likely integrate as an adapter if it passes | Promising isolated HTML/CSS capability, but static review is not validation |
| Current Code Studio entry page | Replace as the default learner entry point | Starts with Python before learner context and curriculum activity |
| PR #16 design docs | Use as reference only | Product V2 architecture now supersedes the assumption that a shell should preserve existing structures |

## Required next inputs and actions

1. Locate and inspect the authoritative v3.15 workbook; the current Library search did not find it. Import it into a validated data model with source/version provenance.
2. Complete a full exercise inventory with stable IDs, current group, environment, current lesson label, mapped matrix ID, disposition and evidence.
3. Review PR #15's complete changed-file list and run its browser tests, lint, typecheck and production build in a real checkout.
4. Define the first vertical slice from one actual curriculum record: Learning Home → Guided Lesson → correct workspace → run/test → feedback → evidence/progress → next step.
5. Prototype the new experience on the isolated V2 branch; do not merge or delete production work until acceptance tests and a rollback/migration plan exist.

## Confidence and limits

This is a targeted static audit of selected GitHub source files and PR #15, plus inspection of the v3.15 Master Matrix structure and first Nursery 1 row. It is not a full repository audit. It identifies architectural risks and decisions, not proof that the current runtime is broken or secure. The V2 branch now contains an isolated learner home and guided activity preview; no code has been removed or changed on `main`. The new UI has not yet passed a local build or browser test.
