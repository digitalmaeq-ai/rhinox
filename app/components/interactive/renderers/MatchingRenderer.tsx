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

import styles from "./MatchingRenderer.module.css";
import { SourceVisual, TargetScene } from "./MatchingVisuals";

// Generic one-to-one matching renderer for the "2d" runtime
// (component: "matching").
//
// Data contract — no schema changes, everything through the existing
// InteractiveAsset.properties field:
//   - a SOURCE is any asset with `properties.correctTarget`;
//   - a TARGET is any asset some source points to (its `type` is free);
//   - one required task per source, with task id === source asset id;
//   - "match-correct" / "match-incorrect" interactions carry the feedback.
// Each target accepts exactly one source; once matched it locks.
//
// Input — pointer drag (mouse, touch, pen), tap-to-select, keyboard, drop
// detection and the incorrect-attempt counter — comes from the shared
// useDragSelect hook (app/components/interactive/shared/useDragSelect.ts),
// also used by DragClassificationRenderer. This file keeps what is
// specific to matching: the correctness rule, one source per target
// (matched targets lock), layout, and presentation.

function assetVisualKey(asset: InteractiveAsset) {
  const explicit = asset.properties?.visual;
  return typeof explicit === "string" ? toVisualKey(explicit) : toVisualKey(asset.label);
}

function correctTargetOf(asset: InteractiveAsset) {
  const value = asset.properties?.correctTarget;
  return typeof value === "string" ? value : undefined;
}

export default function MatchingRenderer({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  const assets = (experience.assets ?? []).filter(
    (asset) => asset.visible !== false,
  );
  const tasks = experience.tasks ?? [];

  const sources = assets.filter((asset) => correctTargetOf(asset) !== undefined);
  const targetIds = new Set(sources.map((source) => correctTargetOf(source)));
  const targets = assets.filter((asset) => targetIds.has(asset.id));

  const matchedSourceIds = runtimeState.completedTasks;
  const matchedCount = matchedSourceIds.length;
  const totalPairs = sources.length;

  // target id -> source currently matched to it (derived from runtime
  // state, so reset and completion need no extra bookkeeping here).
  const sourceByTarget = new Map<string, InteractiveAsset>();
  for (const source of sources) {
    const targetId = correctTargetOf(source);
    if (targetId && matchedSourceIds.includes(source.id)) {
      sourceByTarget.set(targetId, source);
    }
  }

  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);

  const trayRef = useRef<HTMLDivElement>(null);
  const dragSelect = useDragSelect({
    targetAttribute: "data-match-target-id",
    itemAttribute: "data-source-id",
    trayRef,
    onDrop: attemptMatch,
    // One-to-one: a target that already has its match does not react.
    canHoverTarget: (targetId) => !sourceByTarget.has(targetId),
  });
  const {
    pointerDrag,
    selectedItemId: selectedSourceId,
    hoverTargetId,
    incorrectAttempts,
  } = dragSelect;

  // Presentation-only state.
  const [lastOutcome, setLastOutcome] = useState<"correct" | "incorrect" | null>(null);
  const [joinedTargetId, setJoinedTargetId] = useState<string | null>(null);
  const [rejection, setRejection] = useState<{ sourceId: string; targetId: string; key: number } | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const animationCounter = useRef(0);

  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) {
      actions.completeExperience();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  // Matching's correctness rule: the target must equal the source's
  // properties.correctTarget. Called by the shared hook for every drag
  // release and every tap/keyboard placement.
  function attemptMatch(sourceId: string, targetId: string | null) {
    // Dropping on nothing, or on a target that is already matched, is not
    // an attempt: the source simply stays where it was.
    if (!targetId || sourceByTarget.has(targetId) || matchedSourceIds.includes(sourceId)) {
      return;
    }

    const source = sources.find((asset) => asset.id === sourceId);
    const task = tasks.find((item) => item.id === sourceId);

    animationCounter.current += 1;
    setFeedbackKey(animationCounter.current);

    if (source && correctTargetOf(source) === targetId) {
      actions.completeTask(sourceId, task?.points ?? 0);
      actions.triggerInteraction("match-correct");
      setLastOutcome("correct");
      setJoinedTargetId(targetId);
    } else {
      dragSelect.recordIncorrectAttempt();
      actions.triggerInteraction("match-incorrect");
      setLastOutcome("incorrect");
      setRejection({ sourceId, targetId, key: animationCounter.current });
    }

    dragSelect.clearSelection();
  }

  function handleReset() {
    actions.resetExperience();
    dragSelect.reset();
    setLastOutcome(null);
    setJoinedTargetId(null);
    setRejection(null);
    setFeedbackKey(0);
  }

  const draggingSource = pointerDrag?.isDragging
    ? sources.find((asset) => asset.id === pointerDrag.itemId)
    : undefined;

  const selectedSource = selectedSourceId
    ? sources.find((asset) => asset.id === selectedSourceId)
    : undefined;

  // A fresh selection takes priority over the previous attempt's result,
  // so the learner always sees the clue for the item they just picked up.
  const latestFeedback = runtimeState.feedback[runtimeState.feedback.length - 1];
  const showOutcome =
    Boolean(latestFeedback) && lastOutcome !== null && !selectedSource && !runtimeState.completed;

  const traySources = sources.filter((source) => !matchedSourceIds.includes(source.id));
  const isArmed = Boolean(selectedSourceId) && !runtimeState.completed;

  return (
    <div className={styles.root}>
      <div className={styles.board} onKeyDown={dragSelect.handleBoardKeyDown}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Matching activity</p>
            <h2 className={styles.title}>Find the right match for each one</h2>
          </div>

          <div className={styles.headerAside}>
            <div className={styles.progress}>
              <span className={styles.pairs} aria-hidden="true">
                {sources.map((source, index) => (
                  <span
                    key={source.id}
                    className={`${styles.pip} ${index < matchedCount ? styles.pipDone : ""}`}
                  />
                ))}
              </span>
              <span data-testid="match-progress">
                {matchedCount} of {totalPairs} matched
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12.5 11.5 15 16 9.5" />
                <path d="M4.5 12a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0Z" />
              </svg>
            </span>
            <div className={styles.completeText}>
              <h2 className={styles.completeTitle}>Experiment complete!</h2>
              <p className={styles.completeSummary}>
                You correctly matched {matchedCount} of {totalPairs} pairs.
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
              : selectedSource
                ? `${selectedSource.label}${selectedSource.description ? `: ${selectedSource.description}` : ""} Now choose its match.`
                : "Drag each one onto its match — or tap (or press Enter on) one, then choose its match."}
          </p>
        )}

        {/* ---------- Targets ---------- */}
        <div className={styles.targets}>
          {targets.map((target) => {
            const matched = sourceByTarget.get(target.id);
            const isHover = hoverTargetId === target.id && Boolean(draggingSource);
            const isRejected = rejection?.targetId === target.id;

            return (
              <button
                key={target.id}
                type="button"
                data-match-target-id={target.id}
                disabled={Boolean(matched)}
                onClick={(event) => dragSelect.activateTarget(event, target.id)}
                aria-label={
                  matched
                    ? `${target.label}, matched with ${matched.label}`
                    : `${target.label}${isArmed && selectedSource ? `, match with ${selectedSource.label}` : ""}`
                }
                className={[
                  styles.target,
                  matched ? styles.targetMatched : "",
                  isHover ? styles.targetHover : "",
                  isArmed && !matched ? styles.targetArmed : "",
                ].join(" ")}
              >
                <span className={styles.scene}>
                  <TargetScene visualKey={assetVisualKey(target)} label={target.label} />
                  {matched && (
                    <span className={styles.tick} aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                  )}
                </span>

                <span className={styles.targetBody}>
                  <span className={styles.targetLabel}>{target.label}</span>
                  {target.description && (
                    <span className={styles.targetDescription}>{target.description}</span>
                  )}

                  <span
                    // Re-keyed per rejection so the "no" flash replays.
                    key={isRejected ? `rejected-${rejection.key}` : "slot"}
                    className={`${styles.slot} ${matched ? styles.slotFilled : ""} ${
                      isRejected ? styles.slotRejected : ""
                    }`}
                  >
                    {matched ? (
                      <span
                        className={`${styles.docked} ${joinedTargetId === target.id ? styles.dockedJoining : ""}`}
                        data-matched-source-id={matched.id}
                      >
                        <SourceVisual visualKey={assetVisualKey(matched)} label={matched.label} size={40} />
                        <span className={styles.dockedLabel}>{matched.label}</span>
                      </span>
                    ) : (
                      <span className={styles.slotHint}>
                        {isArmed ? "Tap to match" : "Drop here"}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ---------- Sources still to match ---------- */}
        {!runtimeState.completed && (
          <div className={styles.tray}>
            <p className={styles.trayTitle}>Still to match</p>

            <div className={styles.trayItems} ref={trayRef}>
              {traySources.map((source) => {
                const isSelected = selectedSourceId === source.id;
                const isBeingDragged =
                  pointerDrag?.itemId === source.id && pointerDrag.isDragging;
                const isRejected = rejection?.sourceId === source.id;

                return (
                  <button
                    key={source.id}
                    type="button"
                    aria-label={source.label}
                    aria-pressed={isSelected}
                    data-source-id={source.id}
                    onClick={(event) => dragSelect.handleItemClick(event, source.id)}
                    onPointerDown={(event) => dragSelect.handlePointerDown(event, source.id)}
                    onPointerMove={(event) => dragSelect.handlePointerMove(event, source.id)}
                    onPointerUp={(event) => dragSelect.handlePointerUp(event, source.id)}
                    onPointerCancel={dragSelect.handlePointerCancel}
                    className={`${styles.source} ${isSelected ? styles.sourceSelected : ""} ${
                      isBeingDragged ? styles.sourceLifted : ""
                    }`}
                  >
                    <span
                      key={isRejected ? `rejected-${rejection.key}` : "idle"}
                      className={`${styles.sourceArt} ${isRejected ? styles.sourceArtRejected : ""}`}
                    >
                      <SourceVisual visualKey={assetVisualKey(source)} label={source.label} size={56} />
                    </span>
                    <span className={styles.sourceLabel}>{source.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {draggingSource && pointerDrag && (
        <div
          aria-hidden
          className={styles.ghost}
          style={{ left: pointerDrag.currentX, top: pointerDrag.currentY }}
        >
          <SourceVisual visualKey={assetVisualKey(draggingSource)} label={draggingSource.label} size={56} />
          <span className={styles.sourceLabel}>{draggingSource.label}</span>
        </div>
      )}
    </div>
  );
}
