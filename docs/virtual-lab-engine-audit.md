# Rhinox Virtual Science Lab — Engine Audit

**Status:** Source-code audit; implementation unchanged  
**Repository:** `digitalmaeq-ai/rhinox`  
**Audit branch:** `audit/virtual-lab-engine`  
**Scope:** Existing SimLab engine, experiment runtime, routing, scientific models, student records and 3D delivery.

## 1. Executive assessment

The repository already contains a substantial simulation platform. The recommended strategy is to preserve and strengthen it, not replace it.

The current system has:
- A SimLab specification and registry architecture.
- Shared simulation state passed into 2D and 3D scene renderers.
- Three.js / React Three Fiber / Drei for 3D scenes.
- Dedicated dashboards for selected chemistry experiments.
- Guided, interactive, cinematic and classroom presentation modes.
- Learning tasks, questions, points and completion logic.
- Fifteen registered experiment specifications with corresponding 3D scene mappings, according to the current registry and scene map reviewed.

This audit is based on source inspection. It is not a claim that all experiments have passed browser, scientific, accessibility, device or performance testing.

## 2. Existing experiment inventory

| Subject | Existing experiments |
|---|---|
| Chemistry | Acids and Bases; Electrolysis; Titration |
| Physics | Electric Circuits; Projectile Motion; Forces and Motion; Gear System |
| Biology | Photosynthesis; Circulatory System; Food Tests |
| Earth and Space | Moon Phases; Earth Structure; River Processes |
| Engineering | Bridge Builder; Solar Energy |

The Solar System Explorer is implemented as a separate 3D experience. It should be reviewed as a related product experience, but should not be forced into the chemistry-style SimLab architecture without a clear technical benefit.

## 3. Architecture reviewed

Primary engine location:

`app/components/interactive/simlab/`

Key files and responsibilities:

| File / area | Responsibility | Audit direction |
|---|---|---|
| `types.ts` | Shared simulation types | Keep; document contracts |
| `registry.ts` | Experiment specification registry | Keep; add integrity validation |
| `SimLabRenderer.tsx` | Simulation state, modes, tasks, assessment and rendering orchestration | Keep; reduce coupling where justified |
| `scenes3d/Stage3D.tsx` | Shared 3D stage and rendering environment | Keep; performance profiles |
| `scenes3d/Scene3DHost.tsx` | Scene selection and 3D host | Keep; validate missing mappings |
| `scenes3d/scenes.ts` | Scene mapping | Keep; enforce registry-to-scene consistency |
| `scenes3d/*.tsx` | Subject-specific 3D scenes | Extend selectively |
| `specs/*` | Simulation models and calculations | Keep; scientific validation |
| `dashboards/*` | Experiment-specific controls, records and learning panels | Keep; improve persistence and shared patterns |
| `app/components/interactive/useInteractiveRuntime.ts` | General interactive-experience state | Keep; assess persistence boundary |
| `lib/experience-sequence.ts` | Experience ordering and destination selection | Keep; test route resolution |
| `lib/explore-experience-items.ts` | Catalogue item classification and href mapping | Keep; test lab catalogue links |

## 4. Strengths to preserve

### 4.1 Specification-led experiments
Experiment behaviour is represented through specifications rather than embedding every experiment inside one monolithic component. This is a sound foundation for extending the library.

### 4.2 Shared state for visual consistency
The 2D and 3D scene paths receive the simulation state. This gives us a route to keep apparatus visuals, displayed readings and scientific calculations synchronised.

### 4.3 Separate scientific models
The chemistry models contain reusable calculation logic outside the visual components. This separation should be preserved and expanded across the other subjects.

### 4.4 Existing learning structure
The engine already supports tasks, questions, points, completion checks and guided presentation modes. The new practical workflow should build on these capabilities.

### 4.5 Dedicated chemistry dashboards
Acids and Bases, Electrolysis and Titration have specialised interfaces. Retain these rather than flattening them into generic controls.

## 5. Findings and risks

### P0 — Route integrity
The general experience route is `/experiences/[slug]`. The virtual-lab catalogue also has a route at `/explore/virtual-lab/[slug]` which, in the reviewed version, displays a preparation/placeholder message rather than the experiment runtime.

The catalogue href helper uses `STUDIO_ROUTES[slug]` when a mapping exists and otherwise falls back to `/experiences/[slug]`. The actual links produced for every virtual-lab item must be enumerated and tested. Do not assume the placeholder route is used or unused without checking the final rendered catalogue.

**Acceptance criteria**
- Every published virtual-lab card opens a real experiment.
- No published card leads to a placeholder or dead end.
- Direct URL entry, refresh, back navigation and previous/next navigation work.
- Unknown slugs produce a proper not-found state.

### P0 — Scientific validation
The chemistry code contains substantive models. For example, the titration model computes hydrogen-ion concentration using a charge-balance solver and accounts for selected weak-acid, weak-base and diprotic-acid behaviour. The electrolysis model includes Faraday's constant, electrolyte/electrode choices and product calculations.

These are promising implementations, but source inspection alone cannot certify their correctness. Assumptions and simplifications must be explicit. In particular, simplified dilution behaviour must not be presented as a universal model for all strong and weak acids.

**Acceptance criteria**
- Every model has a documented assumptions/constants section.
- Units are explicit and consistent.
- Reference cases and boundary cases have automated tests.
- Graphs, readings, scene states and explanations derive from the same model output.
- Approximations are identified in learner-facing explanations.

### P1 — Apparatus manipulation
Some experiments primarily change state through dashboard controls. The 3D scene then reflects the state. That is valid for some learning objectives, but it is not equivalent to directly manipulating apparatus.

Introduce reusable interactions only where pedagogically justified:
- Select, move and position apparatus.
- Dispense drops or measured liquid.
- Operate taps and switches.
- Connect electrical leads.
- Start, pause and reset an experiment.
- Provide accessible equivalent controls for touch and keyboard users.

Do not make every object draggable by default. Interactions must have clear educational purpose and predictable feedback.

### P1 — Student records and persistence
Reviewed chemistry dashboards maintain some records, notes and observations in component-level React state. The general runtime state is also managed in memory. Persistent saving and resuming were not established by the inspected code.

Design a versioned experiment-attempt record before implementing database persistence.

Suggested logical record:
- learner and class identifiers (when authenticated);
- experiment slug and specification version;
- attempt identifier and timestamps;
- current state and completion state;
- predictions, observations and measurements;
- answers, scores and feedback;
- learner conclusion and teacher comments;
- report/export metadata.

Persistence should be optional for anonymous practice and should handle interrupted sessions safely. Do not store unnecessary personal data.

### P1 — 3D performance
The shared stage uses visually rich rendering features, including shadows, environment reflections and elevated pixel ratio. These may be costly on entry-level devices.

Introduce measured quality profiles:
- **Low:** reduced pixel ratio, shadows/reflections disabled or simplified.
- **Standard:** balanced rendering for typical devices.
- **High:** richer lighting and effects for capable hardware.

Measure actual frame rate, memory and load time on representative Android phones, integrated-graphics laptops and modern desktop hardware before setting defaults. Preserve a 2D fallback.

### P1 — Registry and scene integrity
The reviewed registry marks the registered experiments as having 3D support, and the reviewed scene map contains corresponding scene entries. This relationship should be enforced automatically.

Add a test that fails when:
- a spec declares 3D but has no scene mapping;
- a scene mapping references an unknown experiment;
- a published experiment has no valid specification;
- an experiment is routed to an unsupported runtime.

### P2 — Accessibility and responsive use
Audit keyboard access, focus order, visible labels, colour contrast, reduced motion, touch target sizes, screen-reader descriptions and non-3D alternatives. A 3D scene should not be the only way to obtain essential scientific information.

### P2 — Shared experiment workflow
The common learner journey should be Learn → Predict → Experiment → Observe → Analyse → Conclude → Assess. Existing dashboards need not be forced into identical layouts, but should expose these learning stages consistently where relevant.

## 6. Recommended reusable architecture additions

These are proposed extensions, not existing implemented features.

1. **Apparatus interaction layer:** reusable interaction primitives for selecting, positioning, connecting, dispensing and operating apparatus.
2. **Experiment event/observation model:** structured records for learner actions, measurements and observations.
3. **Scientific validation suite:** unit tests and reference fixtures for calculations and state transitions.
4. **Device quality manager:** low, standard and high rendering profiles with a 2D fallback.
5. **Attempt and report model:** save, resume, submit and export a practical attempt.
6. **Registry integrity tests:** automated checks for experiment/spec/scene/route alignment.

Avoid introducing a second state engine or replacing React Three Fiber.

## 7. Pilot sequence

Use three existing chemistry experiments as the first controlled improvement group.

| Pilot | Primary interaction pattern | Validation focus |
|---|---|---|
| Acids and Bases | Select sample, indicator and add reagent | pH, indicator colour, dilution assumptions and observation record |
| Electrolysis | Configure cell, operate power and observe products | Ion discharge, electrode effects, Faraday calculations and gas products |
| Titration | Operate burette and add measured volumes | Equivalence volume, pH curve, indicator behaviour and readings |

The pilot must improve the shared engine where possible. Experiment-specific behaviour should remain in the relevant specification/dashboard/scene.

## 8. Required test plan before release

### Routing
- Enumerate every published lab slug and its generated href.
- Open each route directly.
- Refresh each route.
- Test previous/next navigation within the lab collection.
- Verify unknown and unpublished slugs.

### Simulation logic
- Unit-test each scientific calculation independently.
- Test minimum, maximum and invalid input values.
- Verify reset returns all state to the correct initial values.
- Verify changing a key experimental parameter updates every dependent output.
- Check that 2D and 3D views represent the same state.

### User experience
- Complete an experiment using mouse, keyboard and touch.
- Test guided and independent use.
- Verify that learners can understand the task without relying only on colour.
- Check loading, error and WebGL fallback states.

### Performance
- Record initial load time and sustained frame rate.
- Test Low, Standard and High profiles.
- Test at narrow mobile widths and tablet widths.
- Check memory use and behaviour after switching experiments repeatedly.

### Learning and records
- Complete, abandon and resume an attempt.
- Verify saved observations and answers.
- Verify scoring and completion rules.
- Generate and review a practical report.
- Confirm teacher review permissions before enabling class submissions.

## 9. Recommended implementation order

| Order | Change | Scope |
|---|---|---|
| 1 | Route audit and route correction | Small, isolated |
| 2 | Registry/scene integrity tests | Small, isolated |
| 3 | Scientific model tests | One model at a time |
| 4 | Rendering quality profiles | Shared 3D stage |
| 5 | Reusable apparatus interaction primitives | One interaction at a time |
| 6 | Pilot improvements to three chemistry experiments | Separate PRs |
| 7 | Attempt persistence and report model | After data design |
| 8 | Extend patterns to remaining experiments | Incremental |

## 10. Explicit exclusions from this audit

The following have not been completed and must not be treated as verified:
- Live browser testing of all 15 experiments.
- Full line-by-line scientific validation of every subject model.
- Automated test execution or production build.
- Profiling on actual Android and low-end laptop devices.
- Full accessibility audit.
- Database schema or security review for student records.
- Verification of all catalogue links in the rendered production UI.

## 11. Definition of done for the audit stage

The audit stage is complete when:
- The experiment inventory and route map are verified against the rendered application.
- Each experiment has a documented specification, state model, scene mapping and test status.
- Scientific assumptions and validation status are recorded.
- Existing functionality is classified as Keep, Improve, Extend or Replace.
- The first implementation PR has a narrow scope and explicit acceptance tests.

**Final recommendation:** preserve the existing engine. Start with route integrity and automated registry checks, then validate the three chemistry models. Do not begin a broad 3D rewrite or persistence implementation until these baselines are established.
