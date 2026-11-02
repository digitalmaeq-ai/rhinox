# Rhinox Code Studio — Beginner-First Redesign Specification

**Status:** Design specification for review  
**Curriculum source of truth:** Think • Move • Code! Master Curriculum v3.15  
**Repository:** `digitalmaeq-ai/rhinox`  
**Branch:** `design/code-studio-beginner-first`

## 1. Product objective

Rhinox Code Studio must help a learner who has never coded understand what to do, complete a first activity, run it, interpret the result, correct a simple mistake and save work without needing an adult to explain the interface. The same product must support curriculum-led progression into increasingly complex coding, robotics, engineering and AI projects.

This is a learning product with coding tools, not just an editor with exercises beside it.

## 2. Curriculum is the source of product sequence

The v3.15 workbook states that Think • Move • Code! is the developmental curriculum. NERDC, Lagos/Federal schemes and international standards are evidence/reference layers and must not determine the learning sequence.

The workbook defines:
- 13 levels: Nursery 1, Nursery 2, Year 1–Year 11.
- 3 terms per level and 13 weeks per term: 507 weekly records across 39 terms.
- Four core strands: Coding & Computational Thinking (CT), Robotics & Physical Computing (RB), Engineering Design & Making (ED), and AI, Automation & Emerging Technology (AI).
- Core learning cycle: Think → Move → Code → Build → Create → Test → Improve → Explain.
- Term rhythm: weeks 1–6 new learning; weeks 7–8 Practice & Play; week 9 integration; week 10 revision; week 11 mini-project; week 12 assessment/station check; week 13 showcase/reflection.
- Core and Stretch distinction: Core leads to the Minimum Viable Learner Outcome (MVL); Stretch is optional and must not count towards badges.
- Offline-first requirement and an unplugged fallback for every Core lesson.
- Teacher-facing assessment evidence and answer keys must remain separate from student-facing answer content.

### Hardware and language progression (follow v3.15)

- Nursery 1–Year 2: unplugged, picture commands, floor grids and cardboard/human robots; ScratchJr is optional and never assessed.
- Years 3–4: Scratch app, offline; first circuits only in Year 4 Term 3.
- Years 5–6: micro:bit + MakeCode as the budget reference.
- Year 7: keep the micro:bit; introduce Python progressively. Term 1 stays within MakeCode blocks/Python view; from Term 2 use MicroPython in Mu with a translation card.
- Year 8: Arduino in blocks (mBlock).
- Year 9: C++ begins, alongside Python, robotics and AI.
- Year 10: ESP32 with MicroPython and data/IoT.
- Year 11: Python, AI and robotics systems.

The interface must not force a learner into a text editor or a physical-kit requirement before the curriculum calls for it.

## 3. Learner-facing information architecture

Use one shared shell and clear destinations:

1. **Learn** — current level, term, week, objective and guided lessons.
2. **Code** — the correct environment for the selected activity (visual/arrow-based guidance, Scratch guidance, Python, MakeCode/micro:bit, Arduino blocks/C++, web where appropriate).
3. **Projects** — guided projects, saved work and Create & Apply challenges.
4. **My Progress** — completed activities, current mastery evidence, term badge progress and next recommended lesson.

Teacher/classroom administration is a later phase; do not crowd the initial learner navigation with teacher controls.

### Two workspace modes

- **Guided Learning:** one task at a time, plain-language directions, worked example, clear Run/Try action, visible result, small explanation and graduated hints.
- **Build Mode:** full editor, output/console, project files, simulator and specialist controls.

A learner must be able to move between modes without losing code or activity state.

## 4. First-time learner journey

The first screen should answer, in order:
1. Where am I in my learning path?
2. What will I learn today?
3. What do I need to do first?
4. How will I know it worked?
5. What can I try if it does not work?

The first-run experience should start with a curriculum-appropriate guided activity, not an unlabelled editor. A first Python lesson may use a simple `print()` example only where appropriate to that learner's approved pathway; it must not be the default for Nursery–Year 6.

Every lesson view should include:
- Level, term, week and stage.
- Child-facing theme and a short objective.
- One-step-at-a-time task directions.
- “Watch / See an example”, “Try it”, “Run”, “Check my work” and “Get a hint” where appropriate.
- Output or a visual/simulator response.
- Plain-language explanation and a next action.
- Core/Stretch labels; Stretch never blocks completion of Core.
- A clear save/resume state.

RhinoBot is the series guide and narrator. The year buddy is the learner who speaks short story lines and may make mistakes the learner fixes. Avoid making RhinoBot and the year buddy competing narrators.

## 5. Curriculum data model

Create or adapt a typed, centrally validated curriculum record based on Master Matrix columns. Do not hand-maintain curriculum labels separately inside each studio.

Required fields:
- `curriculumVersion` (v3.15)
- `level`, `stage`, `term`, `week`, `weekType`
- `theme`, `teacherFocus`, `termBigIdea`, `mainStrand`
- `think`, `move`, `code`, `build`, `create`
- `keyVocabulary`, `practicalActivity`, `weeklyCheck`, `masteryTarget`
- `priorLearning`, `futureBridge`, `assessmentEvidence`
- `competencyStatement`, `currentConcept`, `cognitiveDemand`, `independenceLevel`
- `coreParts`, `stretch`, `fallbackNoDevice`, `kitOrPlatform`
- `visualRequirements`, `learningHubLink`, `status`, `chapterGate`
- Explicit activity references: `activityIds`, `projectIds`, `simulatorIds`, `assessmentIds`.

Use stable IDs, not display names, for relationships. Keep reference/alignment evidence separate from fields that control sequence. Preserve the workbook's Core/Stretch, assessment, offline fallback and chapter-gate rules.

### Validation gates

A lesson must not be published as curriculum-aligned unless it has the required prior learning, future bridge, competency statement, practical challenge and assessment evidence, consistent with the Master Matrix production gate. Missing records should be flagged for curriculum review, not filled with invented objectives.

Do not award badges based on optional Stretch work. Use the official Minimum Viable Learner Outcome for year mastery and the relevant term checklist for term badges.

## 6. Assessment rules by age band

Follow the v3.15 Assessment sheet:
- Nursery 1–2: observation checklist and practical activity only; no written tests.
- Year 1–2: observation and picture tasks plus practical demonstration; no written test.
- Years 3–6: brief oral/show-me exit questions and practical coding/building; term assessment combines practical and short questions as specified.
- Years 7–11: brief weekly checks; term practical/project carries 70% and written assessment 30%, about 15 items.

Automated tests are suitable only when they assess the actual learning objective. For unplugged and practical tasks, provide teacher observation evidence rather than pretending an automated code test is sufficient.

## 7. Premium visual system

- Bright, calm learning surface: white, very light blue and navy text; restrained cyan/blue accents.
- Code editor may use a dark surface, but the surrounding learning interface should remain light and readable.
- Clear typographic hierarchy, generous spacing, consistent buttons and predictable placement of help.
- Avoid excessive cards, dense sidebars and multiple equally prominent actions.
- Responsive at school laptop, tablet and mobile widths.
- Keyboard accessible, visible focus states, accessible labels and meaningful status messages.
- Plain English first; explain terms at the point of use.
- Do not rely on colour alone to communicate pass/fail or status.

## 8. Useful learning tools — staged

### First release
1. Guided lesson and first-run onboarding.
2. “Explain this” panel for the current concept and code line.
3. Graduated hints that reveal one step at a time.
4. Visible success criteria and feedback tied to the lesson objective.
5. Save/resume, reset and safe recovery from accidental edits.

### Second release
1. Step-by-step code visualiser for supported constructs.
2. Debugging coach with likely cause, relevant line and next hint.
3. Curriculum-tagged project templates and challenge variants.
4. More accessible simulator controls and explicit simulator-versus-real-hardware labels.

### Later
Teacher class assignment/reporting, offline curriculum packs, optional AI tutor and AI-assisted challenge creation. Prefer deterministic local explanations/checks first to control operating costs and keep the product usable offline.

## 9. Engineering constraints

- Preserve working Python, Web and hardware runtimes unless a specific audit/test identifies a defect.
- Do not execute arbitrary learner code on the Next.js server.
- Keep execution isolated in the existing browser worker/sandbox boundaries; retain timeouts, Stop controls and input/output limits.
- Clearly state where Arduino/ESP32 is simulated or uses a supported subset rather than a full hardware toolchain.
- Keep local storage/offline behaviour honest and test storage failure paths.
- Shared shell components should not force all studios into the same editor implementation.
- Do not remove current functionality simply to make the first screen look cleaner.

## 10. Phased implementation

1. Audit existing routes, studio components, curriculum exercises, progress/project storage, offline support and the open Web Studio PR.
2. Add shared navigation and beginner-first landing/lesson shell behind a dedicated branch.
3. Add curriculum record types, validation and a mapping audit against the actual v3.15 Master Matrix.
4. Map current exercises to verified curriculum records; flag missing coverage and mismatches.
5. Integrate Guided Learning with Python first only for curriculum stages that use Python; extend the shared shell to other studios.
6. Add learning tools in the priority order above.
7. Test on a low-spec school laptop, a tablet and mobile, including keyboard navigation, offline use, saved work and runtime interruption.

## 11. Acceptance criteria

- A learner new to coding can start an appropriate first activity, follow it, run/perform it, understand the result and find the next step without adult explanation.
- No Nursery–Year 6 learner is sent to Python as the default entry experience.
- Every published curriculum lesson maps to an actual v3.15 Master Matrix record.
- Each Core lesson exposes its required objective, prior learning, practical task, success evidence and fallback.
- Stretch is optional and does not gate completion or badges.
- Term rhythm and assessment rules match v3.15.
- Learners can save, resume and recover work.
- Existing runtimes retain their security limits and pass regression tests.
- Responsive, keyboard-accessible UI with clear status feedback.
- No unverified claims that simulated hardware equals real hardware.

## 12. Immediate implementation scope

The first code change should establish the shared beginner-first shell and one curriculum-backed guided lesson flow while leaving existing runtimes intact. Do not rebuild every studio at once. Before claiming full curriculum coverage, produce a mapping report with: mapped activities, missing weeks/objectives, duplicate or mismatched activities, and records needing curriculum-team decisions.
