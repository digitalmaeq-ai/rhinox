# Rhinox Code Studio — v3.15 Curriculum Mapping Audit

**Repository:** `digitalmaeq-ai/rhinox`  
**Curriculum inspected:** `Think-Move-Code-Master-Curriculum-v3.15.xlsx`  
**Branch:** `design/code-studio-beginner-first`  
**Status:** Static source audit; not a runtime or full automated mapping test.

## Executive finding

The existing Code Studio contains useful working foundations—browser-side Python execution, guided exercise data, hints, automated checks, saved progress/projects, a console, file/chart features and a micro:bit simulator. The main problem is that the experience is organised around a Python editor and exercise groups, not around the learner's current v3.15 curriculum pathway.

Do not discard the runtime. Build a curriculum-led learning shell around it, then extend the other age-appropriate environments.

## 1. Verified curriculum structure

The workbook's Master Matrix has 507 populated weekly records: 13 levels (Nursery 1, Nursery 2, Year 1–Year 11), 3 terms per level and 13 weeks per term. Its 43 columns include weekly theme, strand, Think/Move/Code/Build/Create, practical activity, weekly check, mastery target, prior learning, future bridge, assessment evidence, platform/kit, competency, Core parts, Stretch and no-device fallback.

The v3.15 weekly pathway must be treated as the source of truth. Examples from Term 1:
- Year 5: micro:bit and MakeCode, including buttons, loops, variables, decisions and testing.
- Year 6: pseudocode, predict/test/fix, loops and physical robotics/sensors.
- Year 7: MakeCode blocks/Python view, then Python, variables, loops, decisions and a critical AI literacy week.
- Year 8: Arduino via mBlock, flowcharts/C++, binary, sensors, Python functions and custom blocks.
- Year 9: Arduino IDE/C++, motors, line sensors, AND/OR logic, algorithm design and fair testing.

These are not interchangeable generic Python tracks. The selected studio must reflect the specific weekly learning activity and platform.

## 2. Existing exercise inventory

Source files inspected on the repository's default branch:

| Source | Exercise records | Current organisation |
|---|---:|---|
| `lib/code-studio/exercises.ts` | 5 | Starter Python: print, input/variables, loops, if/else, functions |
| `lib/code-studio/exercises-year7.ts` | 10 | Year 7 Python exercises |
| `lib/code-studio/exercises-year8.ts` | 10 | Year 8 Python exercises |
| `lib/code-studio/exercises-year9.ts` | 11 | Year 9 Python exercises |
| `lib/code-studio/exercises-microbit.ts` | 13 | micro:bit exercises, tagged across Years 5–6 |
| **Total** | **49** | Plus free-coding mode |

These 49 records are not evidence of full v3.15 coverage. They are a starting inventory to map, retain, revise or supplement.

## 3. Main gaps and risks

### P0 — The first screen starts at the wrong abstraction level

The Python Studio loader initialises to the first Starter exercise, “Hello, World!”, and the main page opens a Monaco editor with an exercise panel. That is useful for a learner who is ready for Python, but it is not a suitable universal entry point for Nursery–Year 6. A beginner can be placed in a text editor before understanding the current lesson, learning objective, task or expected outcome.

**Action:** Add a curriculum-aware entry route that selects a suitable lesson and mode first. Preserve direct access to the existing Python workspace for learners who need it.

### P0 — Exercise groups are not a curriculum pathway

The UI's exercise groups are Starter, Year 7, Year 8, Year 9 and micro:bit. There is no visible curriculum route for Nursery 1 through Year 4, and no explicit learner-facing pathway across all 13 levels. Current grouping is a tool/exercise index, not a complete learner map.

**Action:** Create the shared pathway and show the learner's current level, term, week, objective, current step and next step. Unavailable lessons should be labelled as not yet available, not implied to exist.

### P0 — Existing tags need record-by-record validation

The exercise type supports an optional free-text `lesson` such as “Term 1, Week 3”. This does not guarantee a valid link to a unique Master Matrix record. Tags must be checked against v3.15's actual theme, concept, platform, Core activity and assessment evidence. A correct term/week label alone is insufficient.

**Action:** Map each exercise to a stable curriculum record ID, then generate a discrepancy report. Preserve exercise IDs because learner progress and saved projects depend on them.

### P1 — Some existing Python content is only a companion to hardware learning

The Year 8 file explicitly describes Python exercises as the Python-on-the-laptop portion of Arduino projects. Year 9 Python exercises practise reasoning related to robotics/AI while the Arduino C++ lessons are separate. These can be useful, but must not be presented as if they replace the curriculum's hardware work.

**Action:** Distinguish “learn the concept in Python” from “complete the curriculum's hardware task”. Add the relevant MakeCode/micro:bit or Arduino workflow, simulator/practical evidence and fallback where the Master Matrix requires them.

### P1 — The first-run help is not a complete beginner teaching sequence

The current exercise panel supports instructions, hints and “Check my answer”; it does not by itself provide a consistent “see it → try it → run it → explain it → apply it” journey for every age band.

**Action:** Add short worked examples, one action at a time, immediate output/visual feedback, graduated hints and a clear recovery/reset path. Use age-appropriate representations before text code.

### P1 — Assessment and badge logic need curriculum alignment

Current Python exercises use program-output test cases, and successful checks mark exercises complete. Those checks are useful for code tasks, but the v3.15 workbook also requires observation/practical evidence, with age-specific assessment rules and optional Stretch excluded from badge requirements.

**Action:** Keep automated checks for suitable coding tasks; model practical observation and teacher evidence separately. Do not equate passing a code test with full term mastery.

### P1 — Core/Stretch and offline fallback are not part of the current exercise contract

The shared `Exercise` type includes title, summary, instructions, starter, hints, cases and optional lesson label, but does not express the v3.15 Core/Stretch distinction, official mastery target, required prior learning, fallback, platform requirement or assessment evidence.

**Action:** Add typed curriculum references and metadata centrally rather than duplicating curriculum content across UI components.

## 4. Recommended curriculum data contract

Each activity should reference a stable record from the v3.15 Master Matrix and include:
- Curriculum version and stable matrix ID.
- Level, term, week, week type and child-facing theme.
- Main strand and relevant competency/concept ladder.
- Prior learning and future bridge.
- Think, Move, Code, Build and Create steps.
- Core task and success evidence; optional Stretch clearly separated.
- Required platform/kit and a no-device fallback.
- Assessment evidence and applicable teacher observation/checklist.
- Related activity, project, simulator and assessment IDs.

The curriculum workbook remains authoritative. Avoid copying all 507 records manually into independent UI code. Prefer a generated/validated dataset with a report showing unmapped, duplicate, incomplete and conflicting records.

## 5. Priority sequence

1. **Audit and protect:** keep the existing runtime and project/progress IDs; add regression tests before structural changes.
2. **Beginner-first shell:** Learn, Code, Projects and My Progress; launch into a suitable guided activity, not a universal Python starter.
3. **Curriculum mapping:** validate each current exercise against its actual v3.15 Master Matrix row and list missing coverage. Do not infer alignment from a week label alone.
4. **Guided lesson mode:** example, try-it task, output, explanation, graduated hints and Core completion.
5. **Age-appropriate studio routing:** unplugged/visual work for early levels, MakeCode/micro:bit in the relevant levels, then the workbook's Python/Arduino progression.
6. **Assessment and offline:** implement official mastery rules, practical evidence and no-device alternatives.
7. **Verification:** automated tests, production build, keyboard accessibility, low-spec laptop/tablet/mobile, offline use, save/resume and Stop/timeout behaviour.

## 6. Acceptance criteria

- The first-run journey chooses a curriculum-appropriate activity and environment.
- No learner is sent to Python merely because it is the first available exercise.
- Every activity labelled “v3.15 aligned” links to a verified Master Matrix record.
- Core and Stretch are visibly distinct; Stretch does not gate badges.
- Practical/observation evidence is not falsely represented as automated code correctness.
- Existing Python, web and hardware functionality is preserved unless a verified defect justifies a change.
- Simulator behaviour is clearly distinguished from real hardware execution.
- Existing exercise IDs and saved project compatibility are preserved.
- Coverage claims are supported by a generated mapping report, not by exercise counts alone.

## Audit limitation

This is a source-level audit of the default-branch exercise types, inventory, current grouping and representative curriculum records. It does not certify runtime behaviour, the full Web Studio implementation, hardware fidelity, or a completed 507-record mapping. Those require tests and a dedicated mapping pass before implementation claims are made.
