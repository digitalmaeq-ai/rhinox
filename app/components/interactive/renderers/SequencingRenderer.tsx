"use client";

import { useEffect, useRef, useState } from "react";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveAsset } from "@/types/interactive-assets";
import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

import { useDragSelect } from "@/app/components/interactive/shared/useDragSelect";
import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { toVisualKey } from "@/app/components/interactive/shared/visualKeys";

import styles from "./SequencingRenderer.module.css";
import { StepVisual } from "./SequencingVisuals";

// Generic sequencing renderer for the "2d" runtime
// (component: "sequencing") — put the steps of a process in order.
//
// Data contract — no schema changes, everything through the existing
// InteractiveAsset.properties field:
//   - a STEP is any asset with a numeric `properties.order` (1, 2, 3, ...);
//   - the numbered slots are generated from the number of steps, so the
//     content never lists them;
//   - one required task per step, with task id === step asset id;
//   - "sequence-correct" / "sequence-incorrect" interactions carry the
//     feedback.
// A step is correct in slot N when its order is N; a filled slot locks.
//
// Input (drag, tap, keyboard, drop detection, attempt counter) comes from
// the shared useDragSelect hook, as in Sorting and Matching.

function orderOf(asset: InteractiveAsset) {
  const value = asset.properties?.order;
  return typeof value === "number" ? value : undefined;
}

function slotId(position: number) {
  return `position-${position}`;
}

function assetVisualKey(asset: InteractiveAsset) {
  const explicit = asset.properties?.visual;
  return typeof explicit === "string" ? toVisualKey(explicit) : toVisualKey(asset.label);
}

export default function SequencingRenderer({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const steps = (experience.assets ?? []).filter(
    (asset) => asset.visible !== false && orderOf(asset) !== undefined,
  );
  const positions = steps
    .map((step) => orderOf(step) as number)
    .sort((a, b) => a - b);

  const placedStepIds = runtimeState.completedTasks;
  const placedCount = placedStepIds.length;
  const totalSteps = steps.length;

  // slot id -> step placed there (derived from runtime state).
  const stepBySlot = new Map<string, InteractiveAsset>();
  for (const step of steps) {
    if (placedStepIds.includes(step.id)) {
      stepBySlot.set(slotId(orderOf(step) as number), step);
    }
  }

  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);

  const trayRef = useRef<HTMLDivElement>(null);
  const dragSelect = useDragSelect({
    targetAttribute: "data-sequence-slot-id",
    itemAttribute: "data-step-id",
    trayRef,
    onDrop: attemptPlace,
    // A filled slot is locked and does not react.
    canHoverTarget: (id) => !stepBySlot.has(id),
  });
  const {
    pointerDrag,
    selectedItemId: selectedStepId,
    hoverTargetId,
    incorrectAttempts,
  } = dragSelect;

  // Presentation-only state.
  const [lastOutcome, setLastOutcome] = useState<"correct" | "incorrect" | null>(null);
  const [joinedSlotId, setJoinedSlotId] = useState<string | null>(null);
  const [rejection, setRejection] = useState<{ stepId: string; slotId: string; key: number } | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const animationCounter = useRef(0);

  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) {
      actions.completeExperience();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  // Sequencing's correctness rule: a step belongs in the slot numbered
  // with its properties.order.
  function attemptPlace(stepId: string, targetSlotId: string | null) {
    if (!targetSlotId || stepBySlot.has(targetSlotId) || placedStepIds.includes(stepId)) {
      return;
    }

    const step = steps.find((asset) => asset.id === stepId);
    const task = tasks.find((item) => item.id === stepId);

    animationCounter.current += 1;
    setFeedbackKey(animationCounter.current);

    if (step && slotId(orderOf(step) as number) === targetSlotId) {
      actions.completeTask(stepId, task?.points ?? 0);
      actions.triggerInteraction("sequence-correct");
      setLastOutcome("correct");
      setJoinedSlotId(targetSlotId);
    } else {
      dragSelect.recordIncorrectAttempt();
      actions.triggerInteraction("sequence-incorrect");
      setLastOutcome("incorrect");
      setRejection({ stepId, slotId: targetSlotId, key: animationCounter.current });
    }

    dragSelect.clearSelection();
  }

  function handleReset() {
    actions.resetExperience();
    dragSelect.reset();
    setLastOutcome(null);
    setJoinedSlotId(null);
    setRejection(null);
    setFeedbackKey(0);
  }

  const draggingStep = pointerDrag?.isDragging
    ? steps.find((asset) => asset.id === pointerDrag.itemId)
    : undefined;

  const selectedStep = selectedStepId
    ? steps.find((asset) => asset.id === selectedStepId)
    : undefined;

  const latestFeedback = runtimeState.feedback[runtimeState.feedback.length - 1];
  const showOutcome =
    Boolean(latestFeedback) && lastOutcome !== null && !selectedStep && !runtimeState.completed;

  // Steps are shown in content order, which authors keep shuffled.
  const traySteps = steps.filter((step) => !placedStepIds.includes(step.id));
  const isArmed = Boolean(selectedStepId) && !runtimeState.completed;

  return (
    <div className={styles.root}>
      <div className={styles.board} onKeyDown={dragSelect.handleBoardKeyDown}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Sequencing activity</p>
            <h2 className={styles.title}>Put the steps in the right order</h2>
          </div>

          <div className={styles.headerAside}>
            <div className={styles.progress}>
              <span className={styles.pips} aria-hidden="true">
                {positions.map((position) => (
                  <span
                    key={position}
                    className={`${styles.pip} ${stepBySlot.has(slotId(position)) ? styles.pipDone : ""}`}
                  >
                    {position}
                  </span>
                ))}
              </span>
              <span data-testid="sequence-progress">
                {placedCount} of {totalSteps} placed
                {incorrectAttempts > 0
                  ? ` · ${incorrectAttempts} attempt${incorrectAttempts === 1 ? "" : "s"} to try again`
                  : ""}
              </span>
            </div>

            <ActivityHeaderButtons onReset={handleReset} buttonClassName={styles.resetButton} />
          </div>
        </div>

        {/* ---------- Feedback / completion ---------- */}
        {runtimeState.completed ? (
          <div className={styles.complete} role="status">
            <span className={styles.completeBadge} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h10M4 12h13M4 17h7" />
                <path d="m15 16 2.5 2.5L21 14" />
              </svg>
            </span>
            <div className={styles.completeText}>
              <h2 className={styles.completeTitle}>Experiment complete!</h2>
              <p className={styles.completeSummary}>
                You put all {totalSteps} steps in the right order.
              </p>
            </div>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.completeButton} />
          </div>
        ) : (
          <p
            role="status"
            key={showOutcome ? `outcome-${feedbackKey}` : "idle"}
            className={`${styles.feedback} ${
              showOutcome
                ? lastOutcome === "correct"
                  ? styles.feedbackCorrect
                  : styles.feedbackIncorrect
                : styles.feedbackIdle
            }`}
          >
            {showOutcome
              ? latestFeedback
              : selectedStep
                ? `${selectedStep.label}${selectedStep.description ? `: ${selectedStep.description}` : ""} Now choose its step number.`
                : "Drag each step into its place — or tap (or press Enter on) a step, then choose its number."}
          </p>
        )}

        {/* ---------- Numbered slots ---------- */}
        <ol className={styles.slots}>
          {positions.map((position) => {
            const id = slotId(position);
            const placed = stepBySlot.get(id);
            const isHover = hoverTargetId === id && Boolean(draggingStep);
            const isRejected = rejection?.slotId === id;

            return (
              <li key={id} className={styles.slotItem}>
                <button
                  type="button"
                  data-sequence-slot-id={id}
                  disabled={Boolean(placed)}
                  onClick={(event) => dragSelect.activateTarget(event, id)}
                  aria-label={
                    placed
                      ? `Step ${position}: ${placed.label}`
                      : `Step ${position}${isArmed && selectedStep ? `, place ${selectedStep.label} here` : ", empty"}`
                  }
                  className={[
                    styles.slot,
                    placed ? styles.slotFilled : "",
                    isHover ? styles.slotHover : "",
                    isArmed && !placed ? styles.slotArmed : "",
                  ].join(" ")}
                >
                  <span className={styles.slotNumber} aria-hidden="true">{position}</span>
                  <span
                    key={isRejected ? `rejected-${rejection.key}` : "body"}
                    className={`${styles.slotBody} ${isRejected ? styles.slotRejected : ""}`}
                  >
                    {placed ? (
                      <span
                        className={`${styles.placed} ${joinedSlotId === id ? styles.placedJoining : ""}`}
                        data-sequenced-step-id={placed.id}
                      >
                        <StepVisual visualKey={assetVisualKey(placed)} label={placed.label} size={36} />
                        <span className={styles.placedLabel}>{placed.label}</span>
                      </span>
                    ) : (
                      <span className={styles.slotHint}>{isArmed ? "Tap to place" : "Drop step here"}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* ---------- Steps still to place ---------- */}
        {!runtimeState.completed && (
          <div className={styles.tray}>
            <p className={styles.trayTitle}>Steps to place</p>

            <div className={styles.trayItems} ref={trayRef}>
              {traySteps.map((step) => {
                const isSelected = selectedStepId === step.id;
                const isBeingDragged = pointerDrag?.itemId === step.id && pointerDrag.isDragging;
                const isRejected = rejection?.stepId === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    aria-label={step.label}
                    aria-pressed={isSelected}
                    data-step-id={step.id}
                    onClick={(event) => dragSelect.handleItemClick(event, step.id)}
                    onPointerDown={(event) => dragSelect.handlePointerDown(event, step.id)}
                    onPointerMove={(event) => dragSelect.handlePointerMove(event, step.id)}
                    onPointerUp={(event) => dragSelect.handlePointerUp(event, step.id)}
                    onPointerCancel={dragSelect.handlePointerCancel}
                    className={`${styles.step} ${isSelected ? styles.stepSelected : ""} ${
                      isBeingDragged ? styles.stepLifted : ""
                    }`}
                  >
                    <span
                      key={isRejected ? `rejected-${rejection.key}` : "idle"}
                      className={`${styles.stepArt} ${isRejected ? styles.stepArtRejected : ""}`}
                    >
                      <StepVisual visualKey={assetVisualKey(step)} label={step.label} size={44} />
                    </span>
                    <span className={styles.stepLabel}>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {draggingStep && pointerDrag && (
        <div
          aria-hidden
          className={styles.ghost}
          style={{ left: pointerDrag.currentX, top: pointerDrag.currentY }}
        >
          <StepVisual visualKey={assetVisualKey(draggingStep)} label={draggingStep.label} size={44} />
          <span className={styles.stepLabel}>{draggingStep.label}</span>
        </div>
      )}
    </div>
  );
}
