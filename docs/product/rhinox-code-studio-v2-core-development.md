# Code Studio V2 — Core development continuation

**Status:** implementation plan; comprehensive audit deferred by product decision on 21 October 2026. This is not a release approval.

## Verified starting point

- The public preview currently includes one reviewed Nursery 1, Term 1, Week 1 lesson. Its Code task is a three-card ordering exercise; it is deliberately unplugged and does not need the robot simulator.
- The separate beginner workspace has a safe text parser, blocks, a 5×5 robot simulator, trace and reset controls. Its sample robot program is not evidence of alignment with the Nursery lesson.
- The full 507-record curriculum catalogue is private. A curriculum row alone is not a reviewed interactive lesson. One source gap remains at Year 4, Term 3, Week 13: Build is core but the source Build field is blank.
- Licensed lesson delivery remains closed until trusted authentication and entitlement exist.

## Development order

1. **Finish the first vertical slice.** Make the reviewed Nursery sequence activity reliable as a complete Think → Move → Code → optional Build → Create → Check journey. Preserve its no-device fallback and clearly label movement/drawing confirmation as self-reported. Do not force a code editor into an unplugged lesson.
2. **Introduce a typed lesson-to-workspace launch contract.** A reviewed lesson spec may identify an appropriate workspace adapter, a reviewed task ID, starter content, expected observable outcome, fallback, and return destination. The curriculum catalogue cannot itself launch code. Reject unknown adapters, unreviewed tasks, mismatched activity IDs and missing required evidence.
3. **Connect a separately reviewed robot lesson.** Only after its curriculum row and authored exercise have been checked, launch the existing beginner workspace in guided mode with a task, starter commands, safe run/stop or bounded execution, trace, feedback and return to the lesson. Keep free-play mode independent.
4. **Progress and evidence.** Keep the current preview session-only and disclose that limitation. Record exercise-specific evidence and distinguish automatic results from learner/teacher confirmation. Never describe a chosen material or a clicked confirmation as sensor-verified mastery.
5. **Expand adapters incrementally.** Blocks and text robot first; Python, web code, micro:bit and Arduino only with explicit runtime boundaries and verified age/platform fit. No new paid service, AI tutor, account database or school reporting in this core slice.

## Proposed launch contract (design, not implemented)

```ts
type GuidedLaunch = {
  activityId: string;
  reviewedTaskId: string;
  adapter: "robot-blocks" | "robot-text";
  starterProgram: readonly ("forward" | "left" | "right" | "beep")[];
  successCriteria: readonly string[];
  returnPath: "/coding-robotics/code-studio/learn";
};
```

Resolve the launch from a server-controlled/reviewed allowlist, not arbitrary URL parameters. Never expose answer keys or private catalogue content in the client bundle. Validate all client-provided state independently of the launch definition.

## Acceptance checks for the first connected coding task

- A learner starts from a reviewed activity, understands the task and can return without losing the current session unexpectedly.
- The correct adapter opens with the intended starter state. Free-play remains usable.
- Run results and trace reflect actual simulator output; unsuccessful runs receive actionable feedback without fabricated success.
- Reset clears the active program and stale results. Invalid or oversized input fails safely.
- Keyboard and touch controls work; reduced-motion and text alternatives are considered.
- The implementation has focused regression tests, lint, typecheck and build checks as practical. Broader browser/accessibility/security audit is deferred, **not waived**.

## Deferred audit register

Return to the existing follow-up audit before merge/release: latest CI status, real-browser V2 journeys, keyboard/screen-reader/reduced-motion/mobile review, dependency advisory disposition, source/import privacy, entitlement boundary and regression checks. Fix critical blockers when discovered during development rather than deferring them.

**Branch policy:** work only on `product/rhinox-code-studio-v2`; do not merge PR #17 or alter `main` without explicit approval.
