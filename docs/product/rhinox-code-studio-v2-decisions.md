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
