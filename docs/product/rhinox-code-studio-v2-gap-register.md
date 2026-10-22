# Code Studio V2 — Implementation gap register

**Updated:** 22 October 2026 · **Branch:** `product/rhinox-code-studio-v2` · **PR #17:** draft, not merged · **Curriculum:** Think • Move • Code! Master Curriculum v3.15

Source workbook (kept private, not in this repository): SHA-256 `1258742f7c808eb16d2c35bc2c2283a152e3121afda21a6f25fc9eb1f39bb980`; Master Matrix has 507 records, 39 per level, unique level/term/week keys. Only Year 4 Term 3 Week 13 (Excel row 235) has a core part (Build) with a blank field.

| # | Finding | Class | Status |
|---|---|---|---|
| G1 | Nursery 1 T1 W1 record checked against the workbook (row 2): 17 of 18 fields identical; `platform` is shortened (Kit Corner text omitted). Teacher Guide and Activity Book agree. | Blocking for sign-off | **Closed** |
| G2 | Dead end: after all attempts were used the learner could not continue. Reproduced in a real browser at 390 px. Fixed: worked example plus a recorded "A grown-up helped me finish", saved as *completed with help*, never a pass, 0 points. | Milestone 1 | **Fixed** (unit and browser tests) |
| G3 | The expected card order ships in the public client bundle (verified in `.next/static`). Accepted for this low-stakes formative nursery preview only. Not acceptable for any secure assessment. | Before release | **Accepted, documented** |
| G4 | No reviewed robot lesson exists; `REVIEWED_LAUNCHES` stays empty and fails closed. Needs a curriculum row and reviewed spec. | Dependency | Blocked on source |
| G5 | Honest progress model. Added `describeLessonOutcome`: assistance, postponed teacher check and extra practice are each reported separately and never as a pass. Re-entry and cross-session behaviour still need tests. | Milestone 4 | Partly done |
| G6 | Real-browser journey tests (`scripts/code-studio-v2-browser-tests.cjs`, 93 checks): phone, desktop, reduced motion, keyboard. Screen-reader testing and a longer keyboard audit are still outstanding. | Milestone 1 gate | Partly done |
| G7 | Dev-only `braces@3.0.3` advisory (5 high); no upstream patch. Production audit clean. | Before release | Accepted, monitored |
| G8 | Importer and private catalogue are tested; a fresh import needs the workbook on the owner's machine. | Milestone 8 | Deferred |
| G9 | `lib/content-items.generated.ts` is rewritten by `prebuild`; revert it before committing. | Low | Noted |
| G10 | Repository is public. No curriculum, workbook or secret was found in any branch history. | Before release | Owner action: make private |
| G11 | The weekly check in the workbook is teacher observation. The app's "why does order matter?" question and one success criterion were not in the curriculum. The check now records an adult observation (or "check later"); the question is labelled optional extra practice and cannot unlock or replace the check. Spec success criterion revised to the workbook's mastery target. | Milestone 1 | **Fixed** |
| G12 | `npm run lint` after a build also scans generated `public/pyodide` files and fails. CI lints before building, so it is unaffected. | Low | Noted |
| G13 | An adult "confirmed" record cannot be tied to a person (no accounts). Shown to the user as unverified. | By design | Accepted |

## Not yet verified
Screen-reader output, a long keyboard audit, real devices, Vercel preview behaviour, PR/CI status for the latest change.
