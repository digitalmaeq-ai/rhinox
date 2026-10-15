"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveAsset } from "@/types/interactive-assets";
import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

import { useDragSelect } from "@/app/components/interactive/shared/useDragSelect";
import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { toVisualKey } from "@/app/components/interactive/shared/visualKeys";

import styles from "./DragClassificationRenderer.module.css";
import {
  MaterialVisual,
  ZoneIcon,
  hasZoneIcon,
} from "./DragClassificationVisuals";

// Generic drag-and-drop classification runtime for the "2d" runtime slot.
//
// This renderer is not written for Sorting Materials specifically: it
// works off any experience whose assets contain one or more `container`
// assets (the drop zones) and `object` assets (the sortable items), each
// object carrying its correct zone as `properties.correctZone`, matched
// against a `tasks` entry with the same id as the object. Any future
// classification-style experiment (sorting circuit parts, sorting states
// of matter, etc.) can reuse this renderer unchanged by shaping its
// content the same way — establishing the reusable pattern the runtime
// standard calls for, rather than a one-off built for this prototype.
//
// Visuals are data-driven too: an object's artwork is chosen by
// `properties.visual` (or its label), a zone's icon by `properties.icon`
// (or its label), and zone colours by position — see
// DragClassificationVisuals.tsx. Unknown keys fall back to neutral art.
//
// Input — pointer drag (mouse, touch, pen), tap-to-select, keyboard, drop
// detection and the incorrect-attempt counter — comes from the shared
// useDragSelect hook (app/components/interactive/shared/useDragSelect.ts),
// also used by MatchingRenderer. This file keeps what is specific to
// classification: the correctness rule, many objects per zone, layout,
// and presentation.

// Colour identities assigned to zones by position. Bright enough for young
// learners to tell apart, always paired with a visible text label and icon
// so colour is never the only cue.
const ZONE_TONES = [
  { color: "#2f6fde", tint: "#eef4ff", border: "#b3cbf6", ink: "#1d4fa6" },
  { color: "#df4f93", tint: "#fff1f7", border: "#f4bad5", ink: "#a2306a" },
  { color: "#12a383", tint: "#ebfaf5", border: "#a6e3d2", ink: "#0b6f59" },
  { color: "#e8900c", tint: "#fff6e8", border: "#f4d19b", ink: "#99590a" },
];

// Fixed burst offsets for the completion sparkle (no randomness, so the
// server and client render identically).
const SPARKS = [
  { x: "12%", y: "30%", dx: "-26px", dy: "-34px", c: "#ffd23f" },
  { x: "18%", y: "70%", dx: "-30px", dy: "26px", c: "#2f6fde" },
  { x: "46%", y: "12%", dx: "8px", dy: "-30px", c: "#df4f93" },
  { x: "62%", y: "82%", dx: "18px", dy: "30px", c: "#12a383" },
  { x: "84%", y: "26%", dx: "30px", dy: "-28px", c: "#e8900c" },
  { x: "90%", y: "68%", dx: "34px", dy: "22px", c: "#3b9bff" },
];

function assetVisualKey(asset: InteractiveAsset) {
  const explicit = asset.properties?.visual;
  return typeof explicit === "string" ? toVisualKey(explicit) : toVisualKey(asset.label);
}

function zoneIconKey(asset: InteractiveAsset) {
  const explicit = asset.properties?.icon;
  return typeof explicit === "string" ? toVisualKey(explicit) : toVisualKey(asset.label);
}

export default function DragClassificationRenderer({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  const assets = experience.assets ?? [];
  const tasks = experience.tasks ?? [];

  const zones = assets.filter(
    (asset) => asset.type === "container" && asset.visible !== false,
  );

  const objects = assets.filter(
    (asset) => asset.type === "object" && asset.visible !== false,
  );

  const totalObjects = objects.length;
  const sortedObjectIds = runtimeState.completedTasks;
  const sortedCount = sortedObjectIds.length;

  // Same check the runtime applies before it allows completion — one source
  // of truth, rather than a second copy of the rule in the renderer.
  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);

  const trayRef = useRef<HTMLDivElement>(null);
  const dragSelect = useDragSelect({
    targetAttribute: "data-drop-zone-id",
    itemAttribute: "data-object-id",
    trayRef,
    onDrop: attemptSort,
    // A sorted object has left the tray and cannot be picked up again.
    canPickUp: (objectId) => !sortedObjectIds.includes(objectId),
  });
  const {
    pointerDrag,
    selectedItemId: selectedObjectId,
    hoverTargetId: hoverZoneId,
    incorrectAttempts,
  } = dragSelect;

  // Presentation-only state. None of this feeds back into the runtime.
  const [lastOutcome, setLastOutcome] = useState<"correct" | "incorrect" | null>(null);
  const [landing, setLanding] = useState<{ objectId: string; zoneId: string; key: number } | null>(null);
  const [rejection, setRejection] = useState<{ objectId: string; key: number } | null>(null);
  const animationCounter = useRef(0);
  const [feedbackKey, setFeedbackKey] = useState(0);

  // Auto-complete the experience the moment every object has been
  // correctly sorted, reusing completeExperience/areRequiredTasksComplete
  // exactly as already implemented — no new completion mechanism.
  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) {
      actions.completeExperience();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  // Classification's correctness rule: the drop zone must equal the
  // object's properties.correctZone. Called by the shared hook for every
  // drag release and every tap/keyboard placement.
  function attemptSort(objectId: string, zoneId: string | null) {
    if (!zoneId || sortedObjectIds.includes(objectId)) {
      return;
    }

    const object = objects.find((asset) => asset.id === objectId);
    const correctZone = object?.properties?.correctZone;
    const task = tasks.find((item) => item.id === objectId);

    animationCounter.current += 1;
    setFeedbackKey(animationCounter.current);

    if (zoneId === correctZone) {
      actions.completeTask(objectId, task?.points ?? 0);
      actions.triggerInteraction("sort-correct");
      setLastOutcome("correct");
      setLanding({ objectId, zoneId, key: animationCounter.current });
    } else {
      dragSelect.recordIncorrectAttempt();
      actions.triggerInteraction("sort-incorrect");
      setLastOutcome("incorrect");
      setRejection({ objectId, key: animationCounter.current });
    }

    dragSelect.clearSelection();
  }

  function handleReset() {
    actions.resetExperience();
    dragSelect.reset();
    setLastOutcome(null);
    setLanding(null);
    setRejection(null);
    setFeedbackKey(0);
  }

  const latestFeedback =
    runtimeState.feedback[runtimeState.feedback.length - 1];

  const draggingObject = pointerDrag?.isDragging
    ? objects.find((asset) => asset.id === pointerDrag.itemId)
    : undefined;

  const zoneToneById = new Map(
    zones.map((zone, index) => [zone.id, ZONE_TONES[index % ZONE_TONES.length]]),
  );

  // Sorted objects in the order they were placed, so each zone fills up
  // left-to-right as the learner works.
  const placedObjects = sortedObjectIds
    .map((id) => objects.find((asset) => asset.id === id))
    .filter((asset): asset is InteractiveAsset => asset !== undefined);

  const trayObjects = objects.filter(
    (object) => !sortedObjectIds.includes(object.id),
  );

  const showOutcome = Boolean(latestFeedback) && lastOutcome !== null && !runtimeState.completed;

  return (
    // No rx-section/rx-container wrapper of its own: the experience page
    // already places the workspace inside one, and nesting a second
    // container doubled the side padding on small screens.
    <div className={styles.root}>
        <div className={styles.board} onKeyDown={dragSelect.handleBoardKeyDown}>
          {/* ---------- Header ---------- */}
          <div className={styles.header}>
            <div className={styles.headerText}>
              <p className={styles.eyebrow}>Sorting activity</p>
              <h2 className={styles.title}>Sort each object into its group</h2>
            </div>

            <div className={styles.headerAside}>
              <div className={styles.progress}>
                <span className={styles.dots} aria-hidden="true">
                  {objects.map((object, index) => {
                    const placed = placedObjects[index];
                    const placedZone = placed
                      ? String(placed.properties?.correctZone ?? "")
                      : "";
                    const tone = zoneToneById.get(placedZone);
                    return (
                      <span
                        key={object.id}
                        className={`${styles.dot} ${tone ? styles.dotFilled : ""}`}
                        style={tone ? ({ "--dot-color": tone.color } as CSSProperties) : undefined}
                      />
                    );
                  })}
                </span>
                <span data-testid="sort-progress">
                  {sortedCount} of {totalObjects} sorted
                  {incorrectAttempts > 0
                    ? ` · ${incorrectAttempts} attempt${
                        incorrectAttempts === 1 ? "" : "s"
                      } to try again`
                    : ""}
                </span>
              </div>

              <ActivityHeaderButtons onReset={handleReset} buttonClassName={styles.resetButton} />
            </div>
          </div>

          {/* ---------- Feedback / completion ---------- */}
          {runtimeState.completed ? (
            <div className={styles.complete} role="status">
              {SPARKS.map((spark) => (
                <span
                  key={spark.x + spark.y}
                  aria-hidden="true"
                  className={styles.spark}
                  style={{
                    left: spark.x,
                    top: spark.y,
                    background: spark.c,
                    "--dx": spark.dx,
                    "--dy": spark.dy,
                  } as CSSProperties}
                />
              ))}
              <span className={styles.completeBadge} aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9Z" />
                </svg>
              </span>
              <div className={styles.completeText}>
                <h2 className={styles.completeTitle}>Experiment complete!</h2>
                <p className={styles.completeSummary}>
                  You correctly sorted {sortedCount} of {totalObjects} objects.
                </p>
              </div>
              <CompletionActions onTryAgain={handleReset} buttonClassName={styles.completeButton} />
            </div>
          ) : (
            <p
              role="status"
              className={`${styles.feedback} ${
                showOutcome
                  ? lastOutcome === "correct"
                    ? styles.feedbackCorrect
                    : styles.feedbackIncorrect
                  : styles.feedbackIdle
              }`}
              // Re-key so the entrance animation replays on every attempt.
              key={showOutcome ? `outcome-${feedbackKey}` : "idle"}
            >
              {showOutcome ? (
                <>
                  <span className={styles.feedbackIcon} aria-hidden="true">
                    {lastOutcome === "correct" ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                        <circle cx="10.5" cy="10.5" r="6" />
                        <path d="m15 15 5 5" />
                      </svg>
                    )}
                  </span>
                  {latestFeedback}
                </>
              ) : (
                "Drag an object into a group — or tap (or press Enter on) an object, then choose a group."
              )}
            </p>
          )}

          {/* ---------- Zones ---------- */}
          <div className={styles.zones}>
            {zones.map((zone, index) => {
              const tone = ZONE_TONES[index % ZONE_TONES.length];
              const inZone = placedObjects.filter(
                (object) => object.properties?.correctZone === zone.id,
              );
              const isHover = hoverZoneId === zone.id && Boolean(draggingObject);
              const isArmed = Boolean(selectedObjectId) && !runtimeState.completed;
              const iconKey = zoneIconKey(zone);

              return (
                <button
                  key={zone.id}
                  type="button"
                  data-drop-zone-id={zone.id}
                  onClick={(event) => dragSelect.activateTarget(event, zone.id)}
                  aria-label={`${zone.label} group, ${inZone.length} object${inZone.length === 1 ? "" : "s"}`}
                  className={`${styles.zone} ${isHover ? styles.zoneHover : ""} ${isArmed ? styles.zoneArmed : ""}`}
                  style={{
                    "--zone-color": tone.color,
                    "--zone-tint": tone.tint,
                    "--zone-border": tone.border,
                    "--zone-ink": tone.ink,
                  } as CSSProperties}
                >
                  {landing?.zoneId === zone.id && (
                    <span key={landing.key} className={styles.zonePulse} aria-hidden="true" />
                  )}

                  <span className={styles.zoneHeader}>
                    <span className={styles.zoneBadge} aria-hidden="true">
                      <ZoneIcon iconKey={iconKey} />
                      {/* Letter badge when no icon exists for this zone. */}
                      <ZoneLetter iconKey={iconKey} label={zone.label} />
                    </span>
                    <span className={styles.zoneTitles}>
                      <span className={styles.zoneLabel}>{zone.label}</span>
                      {zone.description && (
                        <span className={styles.zoneDescription}>{zone.description}</span>
                      )}
                    </span>
                    <span className={styles.zoneCount} aria-hidden="true">
                      {inZone.length}
                    </span>
                  </span>

                  <span className={styles.zoneShelf}>
                    {inZone.length === 0 && (
                      <span className={styles.zoneHint}>
                        {isArmed ? "Tap to place here" : "Drop objects here"}
                      </span>
                    )}
                    {inZone.map((object) => (
                      <span
                        key={object.id}
                        role="img"
                        aria-label={`${object.label}, sorted into ${zone.label}`}
                        data-placed-object-id={object.id}
                        className={`${styles.placed} ${
                          landing?.objectId === object.id ? styles.placedLanding : ""
                        }`}
                      >
                        <MaterialVisual visualKey={assetVisualKey(object)} label={object.label} size={50} />
                        <span className={styles.placedLabel}>{object.label}</span>
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ---------- Objects still to sort ---------- */}
          {!runtimeState.completed && (
            <div className={styles.tray}>
              <p className={styles.trayTitle}>Objects to investigate</p>

              <div className={styles.trayItems} ref={trayRef}>
                {trayObjects.map((object) => {
                  const isSelected = selectedObjectId === object.id;
                  const isBeingDragged =
                    pointerDrag?.itemId === object.id && pointerDrag.isDragging;
                  const isRejected = rejection?.objectId === object.id;

                  return (
                    <button
                      key={object.id}
                      type="button"
                      aria-label={object.label}
                      aria-pressed={isSelected}
                      data-object-id={object.id}
                      onClick={(event) => dragSelect.handleItemClick(event, object.id)}
                      onPointerDown={(event) =>
                        dragSelect.handlePointerDown(event, object.id)
                      }
                      onPointerMove={(event) =>
                        dragSelect.handlePointerMove(event, object.id)
                      }
                      onPointerUp={(event) =>
                        dragSelect.handlePointerUp(event, object.id)
                      }
                      onPointerCancel={dragSelect.handlePointerCancel}
                      className={`${styles.object} ${isSelected ? styles.objectSelected : ""} ${
                        isBeingDragged ? styles.objectLifted : ""
                      }`}
                    >
                      <span
                        // Re-mounted per rejection so the shake replays.
                        key={isRejected ? `rejected-${rejection.key}` : "idle"}
                        className={`${styles.objectArt} ${isRejected ? styles.objectArtRejected : ""}`}
                      >
                        <MaterialVisual visualKey={assetVisualKey(object)} label={object.label} size={60} />
                      </span>
                      <span className={styles.objectLabel}>{object.label}</span>
                      <span className={styles.grip} aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedObjectId && (
                <p className={styles.trayHint}>
                  Now tap the group it belongs in.
                </p>
              )}
            </div>
          )}
        </div>

      {draggingObject && pointerDrag && (
        <div
          aria-hidden
          className={styles.ghost}
          style={{ left: pointerDrag.currentX, top: pointerDrag.currentY }}
        >
          <MaterialVisual visualKey={assetVisualKey(draggingObject)} label={draggingObject.label} size={60} />
          <span className={styles.objectLabel}>{draggingObject.label}</span>
        </div>
      )}
    </div>
  );
}

// Shown inside a zone badge only when the visual library has no icon for
// that zone, so an unknown category still gets a clear identity mark.
function ZoneLetter({ iconKey, label }: { iconKey: string; label: string }) {
  if (hasZoneIcon(iconKey)) {
    return null;
  }

  return (
    <span className={styles.zoneBadgeLetter}>
      {label.trim().charAt(0).toUpperCase()}
    </span>
  );
}
