# Rhinox Code Studio — Product Architecture V2

**Status:** Product blueprint; not yet an implementation or runtime-tested design  
**Branch:** `product/rhinox-code-studio-v2`  
**Decision rule:** Product quality and curriculum integrity outrank preservation of existing code.

## 1. Product thesis

Rhinox Code Studio should be a curriculum-led STEM creation platform, not a collection of language editors. It must help a learner understand the goal, make something, see what happened, recover from mistakes, and explain the result. The interface should adapt to the learner's age, curriculum activity, device and available hardware.

## 2. Primary learner journey

1. **My learning** — show the learner's level, current term/week, next activity, progress and teacher-assigned work.
2. **Understand** — RhinoBot introduces one learning goal in age-appropriate language and shows a working example or physical demonstration.
3. **Try** — learner completes one small action at a time with optional hints and visible success criteria.
4. **Make** — learner enters an appropriate workspace: unplugged sequence, visual blocks, Python, web code, micro:bit or Arduino/C++ as required by the verified curriculum activity.
5. **Run and observe** — display a real result, a simulator result, or an explicit instruction to test physical hardware. Never imply simulated hardware is real.
6. **Improve** — guide prediction, debugging, testing and one meaningful revision.
7. **Explain and reflect** — learner describes what the program or design does; collect age-appropriate evidence.
8. **Continue** — recommend the next eligible curriculum activity based on prerequisite mastery, not a generic list of exercises.

A novice should always be able to answer: Where am I? What am I learning? What should I do now? How do I know it worked? What can I try if it fails?

## 3. Product surfaces

### A. Learning Home
- Learner's assigned pathway and current activity.
- Level, term and week navigation; resume learning.
- Clear progress states: Not started, In progress, Ready to check, Completed.
- Projects and saved work.
- No editor on the first screen by default.

### B. Guided Lesson
- One objective, a short explanation, a worked example, one active task.
- Contextual hints that reveal progressively.
- Friendly, actionable feedback; distinguish syntax errors, logic errors and unmet success criteria.
- Core path is clear and achievable; optional Stretch challenges never block completion or badges.
- No-device fallback where the master curriculum requires one.

### C. Creation Workspace
- A common frame around specialised execution tools, not one editor forced onto every activity.
- Guided mode: task, example, work area, run/test, output and next step.
- Build mode: larger editor, files, console, simulator, project controls and specialist tools.
- Responsive layout with touch-friendly controls; editor density may increase on larger screens.
- Visible Save, Run, Stop, Reset and Help controls where applicable.

### D. Project Gallery
- Learner-created projects with preview, last edited date, learning links and safe duplicate/remix flow.
- Templates linked to specific verified learning objectives.
- Version/history strategy to be decided before persistent collaboration is introduced.

### E. Teacher and School Workspace (later phase)
- Class and learner roster, assignments, completion and evidence.
- Curriculum coverage view and intervention signals.
- School-level controls and privacy boundaries.
- Teacher reporting must not expose unnecessary learner data.

## 4. Curriculum is the source of truth

The authoritative source is Think • Move • Code Master Curriculum v3.15. Do not infer official curriculum alignment from an exercise title, a year label, or an existing code comment.

Before an activity is published as curriculum-aligned, it must reference a validated Master Matrix record and carry:
- stable curriculum record ID;
- level, term, week and theme;
- strand and competency;
- prior learning and future bridge;
- Core learning actions and success/mastery criteria;
- assessment evidence;
- platform or kit requirements;
- no-device fallback, when applicable;
- optional Stretch task and its non-gating status.

Import and validate the workbook into a versioned, machine-readable curriculum catalogue. Report missing, duplicate and invalid references at build/test time. Keep source workbook version and import provenance. Do not hard-code a fabricated “first lesson” while the authoritative row has not been verified.

## 5. Architecture boundaries

Separate these concerns so each can evolve independently:

1. **Curriculum catalogue** — validated learning records, prerequisite graph, assessment criteria and content version.
2. **Lesson orchestration** — learner state, hints, task sequence, feedback and completion rules.
3. **Workspace shell** — consistent navigation, responsive layout, accessibility and common controls.
4. **Execution adapters** — isolated interfaces for blocks, Python, web code, micro:bit, Arduino/C++ and future environments.
5. **Simulation and device layer** — explicit simulator contracts, device capability detection and hardware instructions.
6. **Project and progress services** — save/load, project metadata, completion evidence and migration strategy.
7. **School/teacher services** — authorization, classes, assignments and reports, added only when the learner core is stable.
8. **Analytics and quality** — privacy-minimised product events, error monitoring, performance and curriculum coverage.

Curriculum records must not depend on React components. The interface must not contain curriculum rules scattered across page conditionals. Execution engines must not be trusted with arbitrary server-side execution of learner code.

## 6. Engineering principles

- Keep learner code execution client-side or in a deliberately isolated sandbox with time, memory and output limits. Provide a reliable Stop action.
- Treat saved learner content as untrusted input. Validate imports and stored project data.
- Design for intermittent connectivity. Cache only what can be safely supported and clearly state offline limits.
- Do not add a database, AI API, real-time collaboration or paid infrastructure until a measured product requirement justifies it.
- Track accessibility, mobile usability, load time, runtime errors and curriculum correctness as release criteria.
- Use stable IDs for curriculum records, exercises and projects. Preserve user data during migrations.
- Prefer small, reversible releases with explicit acceptance tests over a large rewrite without checkpoints.

## 7. Rebuild versus reuse policy

Existing Claude-authored work is neither protected nor automatically rejected. Audit each part against product requirements and evidence.

- **Retain** only when behaviour is understood, secure, maintainable and meets the new requirements.
- **Refactor** when the core capability is valuable but the interface, contracts or curriculum integration are weak.
- **Replace** when a design decision blocks the learner journey, creates coupling, compromises safety/accessibility, or costs more to repair than to rebuild.
- **Delete** only after confirming dependencies, route usage, project/progress data implications and a rollback path.

The existing Python runner, exercise checks, project saving, micro:bit simulator, Arduino work and proposed Web Studio are candidates for evaluation—not assumptions about the final architecture. No existing feature should dictate the product model.

## 8. Delivery sequence

### Phase 0 — Product and repository audit
- Map routes, components, execution engines, storage, dependencies, accessibility and current test coverage.
- Review PR #15 (Web Studio) and PR #16 (design documents) separately.
- Identify duplicated or coupled logic, security risks and data migration concerns.
- Import and validate the actual v3.15 Master Matrix before publishing official lesson labels.
- Produce a retain/refactor/replace/delete matrix with evidence.

### Phase 1 — Experience prototype
- Implement a premium Learning Home and one complete Guided Lesson flow on an isolated branch.
- Use a verified curriculum record, or mark the prototype as non-curriculum demo content.
- Test the first-time learner journey on phone, tablet and desktop.
- Keep existing direct workspace routes available during the pilot.

### Phase 2 — Vertical slice
- Connect one verified curriculum activity to lesson orchestration, its appropriate execution adapter, checks, evidence and progress.
- Add error recovery, reset/stop behaviour, accessibility checks and offline fallback where required.
- Run lint, type checks, production build, unit/integration tests and a manual browser smoke test.

### Phase 3 — Expand by curriculum pathway
- Add the next age/platform bands only after the first vertical slice meets acceptance criteria.
- Validate every mapping; do not count a route or exercise as coverage without tested learning alignment.

### Phase 4 — School-ready product
- Teacher assignment and evidence review, school bundles, reporting and access control.
- Add AI tutoring only after curriculum retrieval, privacy boundaries, evaluation and operating costs are defined.

## 9. First release acceptance criteria

- A first-time learner can identify their current activity and start without being dropped into an unexplained editor.
- Every official activity maps to a real, validated v3.15 record.
- The selected environment matches the activity's required learning platform and hardware.
- Instructions, hints, run/test feedback and completion criteria are understandable for the target age band.
- Stretch tasks do not gate Core mastery or badges.
- Existing project and progress data are preserved or migrated with a documented plan.
- Learner code cannot run unchecked on the Next.js server.
- The release passes lint, TypeScript, production build, relevant automated tests and manual responsive/accessibility smoke tests.
- Known limitations are documented; no claim of testing is made without evidence.

## 10. Immediate next action

Complete Phase 0 against the live repository and the actual v3.15 workbook. Do not start a broad rewrite until the product architecture, curriculum data contract, first vertical slice and migration risks are clear. Then implement the smallest end-to-end experience that proves the product model.
