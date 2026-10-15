import { useRef, useState } from "react";
import type {
  RefObject,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

// Shared input mechanics for 2D "move an item onto a target" interactions
// (DragClassificationRenderer, MatchingRenderer). Extracted after both
// renderers existed and were measured: their input handling was 86%
// identical line-for-line.
//
// What this hook owns — HOW the learner indicates "this item goes there":
//   - pointer drag (mouse, touch and pen on one code path) with a movement
//     threshold, pointer capture and a live position for a drag preview;
//   - tap-to-select then tap-a-target, and the same with the keyboard
//     (Enter/Space select, Escape cancels, focus returns to the tray);
//   - finding the target under the pointer and which one is hovered;
//   - the incorrect-attempt counter, and resetting all of the above.
//
// What it deliberately does NOT own — WHETHER the placement is right, and
// what happens next. Every placement is handed to the renderer's `onDrop`,
// which checks correctness against its own content contract, calls the
// runtime, and records a wrong attempt via `recordIncorrectAttempt`.
// Correctness never lives here or in the runtime.
//
// The drag is held in a ref (read synchronously by the handlers) and only
// mirrored into state so the preview re-renders. No side effect ever runs
// inside a state updater: React may run updaters during render, and twice
// in development, which previously caused a setState-in-render error.

const DRAG_THRESHOLD_PX = 6;

export interface DragSelectPointerState {
  itemId: string;
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

export interface UseDragSelectOptions {
  // Attribute that marks a drop target and holds its id,
  // e.g. "data-drop-zone-id".
  targetAttribute: string;
  // Attribute that marks an item button in the tray and holds its id,
  // e.g. "data-object-id" — used to return keyboard focus.
  itemAttribute: string;
  // The renderer's tray element (it owns the element, so it owns the ref).
  // Used only inside event handlers, to return keyboard focus.
  trayRef: RefObject<HTMLDivElement | null>;
  // Called for every placement attempt: a finished drag (targetId is null
  // when released over nothing) or a tap/keyboard selection placed on a
  // target. The renderer decides correctness here.
  onDrop: (itemId: string, targetId: string | null) => void;
  // Renderer rule: may this item be picked up right now? (default: yes)
  canPickUp?: (itemId: string) => boolean;
  // Renderer rule: should this target react while an item is dragged over
  // it? (default: yes — e.g. Matching says no for already-matched targets)
  canHoverTarget?: (targetId: string) => boolean;
}

export function useDragSelect({
  targetAttribute,
  itemAttribute,
  trayRef,
  onDrop,
  canPickUp,
  canHoverTarget,
}: UseDragSelectOptions) {
  const pointerDragRef = useRef<DragSelectPointerState | null>(null);
  const [pointerDrag, setPointerDrag] = useState<DragSelectPointerState | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

  function updatePointerDrag(next: DragSelectPointerState | null) {
    pointerDragRef.current = next;
    setPointerDrag(next);
  }

  function targetIdAtPoint(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY);
    const target = element?.closest<HTMLElement>(`[${targetAttribute}]`);
    return target?.getAttribute(targetAttribute) ?? null;
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    itemId: string,
  ) {
    if (canPickUp && !canPickUp(itemId)) {
      return;
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is an enhancement (keeps move/up events on this element
      // if the pointer leaves it); the drag still works without it.
    }

    updatePointerDrag({
      itemId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      isDragging: false,
    });
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLButtonElement>,
    itemId: string,
  ) {
    const current = pointerDragRef.current;

    if (!current || current.itemId !== itemId) {
      return;
    }

    const isDragging =
      current.isDragging ||
      Math.hypot(event.clientX - current.startX, event.clientY - current.startY) >
        DRAG_THRESHOLD_PX;

    updatePointerDrag({
      ...current,
      currentX: event.clientX,
      currentY: event.clientY,
      isDragging,
    });

    // Only real, accepting targets react — empty space and the tray give
    // no feedback, so nothing confusing is "hovered".
    const under = isDragging ? targetIdAtPoint(event.clientX, event.clientY) : null;
    const nextHover = under && (!canHoverTarget || canHoverTarget(under)) ? under : null;
    if (nextHover !== hoverTargetId) {
      setHoverTargetId(nextHover);
    }
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLButtonElement>,
    itemId: string,
  ) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Capture may already be released by the browser — safe to ignore.
    }

    const current = pointerDragRef.current;
    updatePointerDrag(null);
    setHoverTargetId(null);

    if (!current || current.itemId !== itemId) {
      return;
    }

    if (current.isDragging) {
      onDrop(itemId, targetIdAtPoint(event.clientX, event.clientY));
    } else {
      // A tap/click rather than a drag: toggle selection for the
      // tap-to-select, tap-to-place path.
      setSelectedItemId(selectedItemId === itemId ? null : itemId);
    }
  }

  function handlePointerCancel() {
    updatePointerDrag(null);
    setHoverTargetId(null);
  }

  // Keyboard selection. Enter/Space on a button fire a click with
  // detail === 0; mouse and touch clicks have detail >= 1 and are already
  // handled by the pointer handlers, so they are ignored here to avoid
  // toggling the selection twice.
  function handleItemClick(
    event: ReactMouseEvent<HTMLButtonElement>,
    itemId: string,
  ) {
    if (event.detail !== 0) {
      return;
    }

    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  }

  // Place the selected item on a target (tap or keyboard).
  function activateTarget(
    event: ReactMouseEvent<HTMLButtonElement>,
    targetId: string,
  ) {
    if (!selectedItemId) {
      return;
    }

    const itemId = selectedItemId;
    const fromKeyboard = event.detail === 0;

    onDrop(itemId, targetId);

    // Keep keyboard users in the flow: return focus to the item they just
    // tried if it is still in the tray (a wrong placement), otherwise to
    // the next item waiting.
    if (fromKeyboard) {
      window.setTimeout(() => {
        const tray = trayRef.current;
        const retry = tray?.querySelector<HTMLButtonElement>(
          `[${itemAttribute}="${itemId}"]`,
        );
        (retry ?? tray?.querySelector<HTMLButtonElement>("button"))?.focus();
      }, 0);
    }
  }

  function handleBoardKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && selectedItemId) {
      setSelectedItemId(null);
    }
  }

  function recordIncorrectAttempt() {
    setIncorrectAttempts((count) => count + 1);
  }

  function clearSelection() {
    setSelectedItemId(null);
  }

  // Clears everything this hook owns. Renderers call it alongside
  // actions.resetExperience() and their own presentation resets.
  function reset() {
    updatePointerDrag(null);
    setSelectedItemId(null);
    setIncorrectAttempts(0);
    setHoverTargetId(null);
  }

  return {
    pointerDrag,
    selectedItemId,
    hoverTargetId,
    incorrectAttempts,
    // Attach to each item button as inline handlers, e.g.
    //   onPointerDown={(event) => dragSelect.handlePointerDown(event, id)}
    // (never call them during render).
    handleItemClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    activateTarget,
    handleBoardKeyDown,
    recordIncorrectAttempt,
    clearSelection,
    reset,
  };
}
