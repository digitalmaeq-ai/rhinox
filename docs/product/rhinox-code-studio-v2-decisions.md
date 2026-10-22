# Code Studio V2 — Decision log

Decisions taken under the standing instruction "make the best decision". Each can be reversed by the Product Director.

## 22 October 2026

1. **Recovery policy (Nursery 1 T1 W1).** After all attempts, the learner sees the correct order and can continue only through a recorded adult-assisted finish. It is saved as *completed with help*, never as a pass. Done and tested.
2. **Official check.** The curriculum check is adult observation (confirmed or "check later"). The multiple-choice question is optional extra practice and never unlocks or replaces the check. Done and tested.
3. **Answer key in the browser.** Accepted for this low-stakes formative nursery preview only. Not acceptable for any secure assessment.
4. **Years 1–4 block coding.** Direction chosen: a narrow "Rhinox block coding" editor built on Blockly (Apache 2.0), about 12 blocks, never named Scratch. Scratch is not embedded or forked unless its licence and branding terms are read and shown to allow it. Fallback if the prototype fails its gates: link out to Scratch with a clear guide.
5. **Sequence.** The launch/adapter contract (Priority Three) is proven first, because any new editor must plug into it. The Blockly prototype starts only after one reviewed activity has launched, been validated by the receiving environment, evaluated and returned with truthful evidence. No new library is added to the project before then.
6. **Nursery weeks are unplugged.** Nursery 1 Term 1 weeks 1–13 name cards or a floor robot, so Code Studio's role there is a teacher and parent companion, not a coding editor.
7. **Cleanup.** Merged old branches are deleted by the owner in GitHub when convenient. They do not affect development. Source files are not renamed before the V2 merge, so the open pull request and live route stay untouched.

## 22 October 2026 (later)

8. **Merge of PR #17.** The Product Director approved merging. Merging also deploys V2 to the live site, so the agreed timing is: merge only after (a) the launch contract has launched one reviewed activity end to end and (b) the Nursery pilot passes. Until then PR #17 stays a draft.
9. **First activity to prove the launch contract: Year 1, Term 1, Week 3, "Arrow Cards on the Grid" (core: Code + Move).** It fits the robot workspace better than any other early week: write a 6–8 card algorithm from START to FINISH on a 5×5 grid with at least two turns; support track 3–4 cards on a 4×4 grid. Official evidence stays teacher observation plus the picture task; the app can only check that a program reaches FINISH within the card and turn rules.
10. **Gaps found in the current robot workspace for that lesson (not yet changed):** (a) no *back* command (the curriculum's ↓ card moves one square back without turning); (b) start, goal and grid size are fixed (1,3), (3,1), 5×5, so a lesson cannot set its own mission or the 4×4 support track; (c) no card-count rule (6–8) or minimum-turns rule; (d) the workspace names the robot RhinoBot while the Year 1 lessons use the character Ilana; (e) the workspace offers repeat and if blocks that Year 1 Term 1 has not yet introduced. Each needs a small, tested change before the lesson can launch, and free play must stay as it is.
11. **Lesson specs stay "draft" until the owner reviews the wording.** Nothing is marked "reviewed" by the developer.
12. **Polish phase after Year 1 (Product Director, 22 Oct).** When Year 1 is done, we fine-tune all work and then develop the related content: downloads, badges, workbook/activity-book material, and QR codes and links, all checked to be in place. The finished Year 1 set becomes the template guide for the other levels. Until then, each week is built to that pattern: curriculum record, reviewed spec, guided or unplugged activity, teacher/parent guide, and a review sheet. QR codes and badges are not added before the pages they point to are reviewed and live.
