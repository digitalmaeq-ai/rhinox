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

import styles from "./LabellingRenderer.module.css";
import { DiagramVisual, LabelIcon } from "./LabellingVisuals";

// Generic labelling renderer for the "2d" runtime (component:
// "labelling") — place labels on the right spots of a diagram or map.
//
// Data contract — the Matching contract plus positions, using only fields
// InteractiveAsset already has:
//   - the DIAGRAM is the asset of type "image"; its artwork comes from
//     `properties.visual` (or its label);
//   - a LABEL is any asset with `properties.correctTarget`;
//   - a SPOT is any asset a label points to, placed on the diagram at
//     `x` / `y` given as percentages (0–100) of the diagram's width/height;
//   - one required task per label (task id === label asset id);
//   - "label-correct" / "label-incorrect" interactions carry the feedback.
// Each spot takes exactly one label; a filled spot locks.
//
// Input comes from the shared useDragSelect hook, as in the other 2D
// interactions.

function assetVisualKey(asset: InteractiveAsset) {
  const explicit = asset.properties?.visual;
  return typeof explicit === "string" ? toVisualKey(explicit) : toVisualKey(asset.label);
}

function correctTargetOf(asset: InteractiveAsset) {
  const value = asset.properties?.correctTarget;
  return typeof value === "string" ? value : undefined;
}

export default function LabellingRenderer({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  const assets = (experience.assets ?? []).filter((asset) => asset.visible !== false);
  const tasks = experience.tasks ?? [];

  const diagram = assets.find((asset) => asset.type === "image");
  const labels = assets.filter((asset) => correctTargetOf(asset) !== undefined);
  const spotIds = new Set(labels.map((label) => correctTargetOf(label)));
  const spots = assets.filter((asset) => spotIds.has(asset.id));

  const placedLabelIds = runtimeState.completedTasks;
  const placedCount = placedLabelIds.length;
  const totalLabels = labels.length;

  const labelBySpot = new Map<string, InteractiveAsset>();
  for (const label of labels) {
    const spotId = correctTargetOf(label);
    if (spotId && placedLabelIds.includes(label.id)) {
      labelBySpot.set(spotId, label);
    }
  }

  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);

  const trayRef = useRef<HTMLDivElement>(null);
  const dragSelect = useDragSelect({
    targetAttribute: "data-label-spot-id",
    itemAttribute: "data-label-id",
    trayRef,
    onDrop: attemptLabel,
    // A labelled spot is locked and does not react.
    canHoverTarget: (id) => !labelBySpot.has(id),
  });
  const {
    pointerDrag,
    selectedItemId: selectedLabelId,
    hoverTargetId,
    incorrectAttempts,
  } = dragSelect;

  // Presentation-only state.
  const [lastOutcome, setLastOutcome] = useState<"correct" | "incorrect" | null>(null);
  const [joinedSpotId, setJoinedSpotId] = useState<string | null>(null);
  const [rejection, setRejection] = useState<{ labelId: string; spotId: string; key: number } | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const animationCounter = useRef(0);

  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) {
      actions.completeExperience();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  // Labelling's correctness rule: the spot must equal the label's
  // properties.correctTarget.
  function attemptLabel(labelId: string, spotId: string | null) {
    if (!spotId || labelBySpot.has(spotId) || placedLabelIds.includes(labelId)) {
      return;
    }

    const label = labels.find((asset) => asset.id === labelId);
    const task = tasks.find((item) => item.id === labelId);

    animationCounter.current += 1;
    setFeedbackKey(animationCounter.current);

    if (label && correctTargetOf(label) === spotId) {
      actions.completeTask(labelId, task?.points ?? 0);
      actions.triggerInteraction("label-correct");
      setLastOutcome("correct");
      setJoinedSpotId(spotId);
    } else {
      dragSelect.recordIncorrectAttempt();
      actions.triggerInteraction("label-incorrect");
      setLastOutcome("incorrect");
      setRejection({ labelId, spotId, key: animationCounter.current });
    }

    dragSelect.clearSelection();
  }

  function handleReset() {
    actions.resetExperience();
    dragSelect.reset();
    setLastOutcome(null);
    setJoinedSpotId(null);
    setRejection(null);
    setFeedbackKey(0);
  }

  const draggingLabel = pointerDrag?.isDragging
    ? labels.find((asset) => asset.id === pointerDrag.itemId)
    : undefined;

  const selectedLabel = selectedLabelId
    ? labels.find((asset) => asset.id === selectedLabelId)
    : undefined;

  const latestFeedback = runtimeState.feedback[runtimeState.feedback.length - 1];
  const showOutcome =
    Boolean(latestFeedback) && lastOutcome !== null && !selectedLabel && !runtimeState.completed;

  const trayLabels = labels.filter((label) => !placedLabelIds.includes(label.id));
  const isArmed = Boolean(selectedLabelId) && !runtimeState.completed;

  return (
    <div className={styles.root}>
      <div className={styles.board} onKeyDown={dragSelect.handleBoardKeyDown}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Labelling activity</p>
            <h2 className={styles.title}>Put each label in the right place</h2>
          </div>

          <div className={styles.headerAside}>
            <div className={styles.progress}>
              <span className={styles.pips} aria-hidden="true">
                {labels.map((label, index) => (
                  <span key={label.id} className={`${styles.pip} ${index < placedCount ? styles.pipDone : ""}`} />
                ))}
              </span>
              <span data-testid="label-progress">
                {placedCount} of {totalLabels} labelled
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
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12 12 20 4 12V4h8Z" />
                <circle cx="8.5" cy="8.5" r="1.5" />
              </svg>
            </span>
            <div className={styles.completeText}>
              <h2 className={styles.completeTitle}>Experiment complete!</h2>
              <p className={styles.completeSummary}>
                You placed all {totalLabels} labels correctly.
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
              : selectedLabel
                ? `${selectedLabel.label}${selectedLabel.description ? `: ${selectedLabel.description}` : ""} Now choose its place.`
                : "Drag each label onto the diagram — or tap (or press Enter on) a label, then choose its place."}
          </p>
        )}

        {/* ---------- Diagram with spots ---------- */}
        <div className={styles.diagram}>
          {diagram && <DiagramVisual visualKey={assetVisualKey(diagram)} label={diagram.label} />}

          {spots.map((spot) => {
            const placed = labelBySpot.get(spot.id);
            const isHover = hoverTargetId === spot.id && Boolean(draggingLabel);
            const isRejected = rejection?.spotId === spot.id;

            return (
              <button
                key={spot.id}
                type="button"
                data-label-spot-id={spot.id}
                disabled={Boolean(placed)}
                onClick={(event) => dragSelect.activateTarget(event, spot.id)}
                aria-label={
                  placed
                    ? `${spot.label}: ${placed.label}`
                    : `${spot.label}${isArmed && selectedLabel ? `, place ${selectedLabel.label} here` : ", empty"}`
                }
                style={{ left: `${spot.x ?? 50}%`, top: `${spot.y ?? 50}%` }}
                className={[
                  styles.spot,
                  placed ? styles.spotFilled : "",
                  isHover ? styles.spotHover : "",
                  isArmed && !placed ? styles.spotArmed : "",
                ].join(" ")}
              >
                {placed ? (
                  <span
                    className={`${styles.placed} ${joinedSpotId === spot.id ? styles.placedJoining : ""}`}
                    data-labelled-id={placed.id}
                  >
                    <LabelIcon visualKey={assetVisualKey(placed)} size={22} />
                    <span>{placed.label}</span>
                  </span>
                ) : (
                  <span
                    key={isRejected ? `rejected-${rejection.key}` : "empty"}
                    className={`${styles.spotEmpty} ${isRejected ? styles.spotRejected : ""}`}
                    aria-hidden="true"
                  >
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ---------- Labels still to place ---------- */}
        {!runtimeState.completed && (
          <div className={styles.tray}>
            <p className={styles.trayTitle}>Labels to place</p>

            <div className={styles.trayItems} ref={trayRef}>
              {trayLabels.map((label) => {
                const isSelected = selectedLabelId === label.id;
                const isBeingDragged = pointerDrag?.itemId === label.id && pointerDrag.isDragging;
                const isRejected = rejection?.labelId === label.id;

                return (
                  <button
                    key={label.id}
                    type="button"
                    aria-label={label.label}
                    aria-pressed={isSelected}
                    data-label-id={label.id}
                    onClick={(event) => dragSelect.handleItemClick(event, label.id)}
                    onPointerDown={(event) => dragSelect.handlePointerDown(event, label.id)}
                    onPointerMove={(event) => dragSelect.handlePointerMove(event, label.id)}
                    onPointerUp={(event) => dragSelect.handlePointerUp(event, label.id)}
                    onPointerCancel={dragSelect.handlePointerCancel}
                    className={`${styles.label} ${isSelected ? styles.labelSelected : ""} ${
                      isBeingDragged ? styles.labelLifted : ""
                    }`}
                  >
                    <span
                      key={isRejected ? `rejected-${rejection.key}` : "idle"}
                      className={`${styles.labelInner} ${isRejected ? styles.labelRejected : ""}`}
                    >
                      <LabelIcon visualKey={assetVisualKey(label)} size={26} />
                      <span>{label.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {draggingLabel && pointerDrag && (
        <div
          aria-hidden
          className={styles.ghost}
          style={{ left: pointerDrag.currentX, top: pointerDrag.currentY }}
        >
          <LabelIcon visualKey={assetVisualKey(draggingLabel)} size={26} />
          <span>{draggingLabel.label}</span>
        </div>
      )}
    </div>
  );
}
