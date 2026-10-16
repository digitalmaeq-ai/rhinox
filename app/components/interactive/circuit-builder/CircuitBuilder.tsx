"use client";

import { useEffect, useMemo, useState, type DragEvent, type KeyboardEvent } from "react";

import {
  ALL_SLOTS,
  analyse,
  BRANCH_SLOTS,
  challenges,
  emptyBoard,
  PART_LABEL,
  type Analysis,
  type Board,
  type Part,
  type PartKind,
  type SlotId,
  type SlotReading,
} from "@/lib/circuit-builder/engine";
import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";

import styles from "./CircuitBuilder.module.css";

// Circuit Builder: "2d" runtime, component "circuit-builder".
// Drag (or tap, then tap a slot) parts into the loop. Brightness, current and
// faults update live. Each challenge is a required task: its id matches an
// entry in lib/circuit-builder/engine.ts and in the experience's tasks.

const TRAY: PartKind[] = ["cell", "bulb", "switch", "buzzer", "resistor", "wire"];

const TRAY_NOTE: Record<PartKind, string> = {
  cell: "1.5 V. Side and bottom slots only.",
  bulb: "Glows when current passes.",
  switch: "Click it on the board to open or close.",
  buzzer: "Sounds with enough voltage.",
  resistor: "Slows the current down.",
  wire: "Completes the loop.",
};

const SLOT_POS: Record<SlotId, { x: number; y: number; name: string }> = {
  s1: { x: 80, y: 200, name: "left side" },
  s2: { x: 320, y: 100, name: "top branch" },
  s3: { x: 560, y: 200, name: "right side" },
  s4: { x: 320, y: 190, name: "lower branch" },
  s5: { x: 320, y: 300, name: "bottom" },
};

const BOX_W = 96;
const BOX_H = 52;

const WIRES: { d: string; branch: boolean }[] = [
  { d: "M80 174 V100 H200 H272", branch: false },
  { d: "M200 100 V190 H272", branch: true },
  { d: "M368 100 H560 V174", branch: false },
  { d: "M368 190 H440 V100", branch: true },
  { d: "M560 226 V300 H368", branch: false },
  { d: "M272 300 H80 V226", branch: false },
];

function PartGlyph({ part, reading }: { part: Part; reading: SlotReading }) {
  switch (part.kind) {
    case "wire":
      return <path d="M-32 -4 H32" className={styles.glyphLine} />;
    case "cell":
      return (
        <g>
          <path d="M-32 -4 H-7 M7 -4 H32" className={styles.glyphLine} />
          <path d="M-7 -17 V9" className={styles.glyphLine} />
          <path d="M7 -10 V2" className={styles.glyphLineThick} />
          <text x="-20" y="-12" className={styles.plus}>+</text>
        </g>
      );
    case "bulb": {
      const glow = reading.brightness;
      return (
        <g>
          <path d="M-32 -4 H-14 M14 -4 H32" className={styles.glyphLine} />
          {glow > 0.02 && <circle cx="0" cy="-4" r={14 + glow * 16} fill="#ffc83d" opacity={0.18 + glow * 0.42} />}
          <circle cx="0" cy="-4" r="14" className={reading.blown ? styles.bulbBlown : styles.bulb} style={{ fill: `rgba(255, 200, 40, ${0.12 + glow * 0.88})` }} />
          {reading.blown ? (
            <path d="M-7 -10 L-2 -4 L-7 2 M7 -10 L2 -4 L7 2" className={styles.glyphLineThin} />
          ) : (
            <path d="M-6 3 L-4 -6 L0 0 L4 -6 L6 3" className={styles.glyphLineThin} />
          )}
        </g>
      );
    }
    case "switch":
      return (
        <g>
          <path d="M-32 -4 H-18 M18 -4 H32" className={styles.glyphLine} />
          <circle cx="-18" cy="-4" r="3" className={styles.dot} />
          <circle cx="18" cy="-4" r="3" className={styles.dot} />
          <path d={part.closed ? "M-18 -4 L18 -4" : "M-18 -4 L12 -22"} className={`${styles.glyphLine} ${part.closed ? styles.leverOn : ""}`} />
        </g>
      );
    case "buzzer":
      return (
        <g>
          <path d="M-32 -4 H-14 M14 -4 H32" className={styles.glyphLine} />
          <rect x="-14" y="-16" width="28" height="24" rx="6" className={styles.buzzerBody} />
          <path d="M-5 -4 h4 l5 -5 v18 l-5 -5 h-4z" fill="#475569" transform="translate(0 -3)" />
          {reading.buzzing && (
            <g className={styles.waves}>
              <path d="M7 -9 q5 5 0 10" className={styles.glyphLineThin} />
              <path d="M11 -12 q8 8 0 16" className={styles.glyphLineThin} />
            </g>
          )}
        </g>
      );
    case "resistor":
      return (
        <g>
          <path d="M-32 -4 H-20 L-15 -14 L-7 6 L1 -14 L9 6 L15 -14 L20 -4 H32" className={styles.glyphLine} fill="none" />
        </g>
      );
  }
}

function readingText(part: Part, reading: SlotReading, flowing: boolean): string {
  if (!flowing) return part.kind === "switch" ? (part.closed ? "closed" : "open") : "";
  if (part.kind === "cell") return "+1.5 V";
  if (part.kind === "wire") return "";
  if (part.kind === "switch") return part.closed ? "closed" : "open";
  return `${reading.current.toFixed(2)} A`;
}

export default function CircuitBuilder({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const allDone = areRequiredTasksComplete(experience, runtimeState);

  const [board, setBoard] = useState<Board>(emptyBoard);
  const [held, setHeld] = useState<PartKind | null>(null);
  const [switchToggled, setSwitchToggled] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const analysis: Analysis = useMemo(() => analyse(board), [board]);

  // Mark challenges complete as soon as the board meets them.
  useEffect(() => {
    for (const challenge of challenges) {
      if (runtimeState.completedTasks.includes(challenge.id)) continue;
      if (challenge.met({ board, analysis, switchToggled })) {
        const task = tasks.find((item) => item.id === challenge.id);
        actions.completeTask(challenge.id, task?.points);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, analysis, switchToggled]);

  useEffect(() => {
    if (allDone && !runtimeState.completed) actions.completeExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, runtimeState.completed]);

  function place(slot: SlotId, kind: PartKind) {
    if (kind === "cell" && BRANCH_SLOTS.includes(slot)) {
      setNote("Cells only fit in the side and bottom slots, where all the current passes through them.");
      return;
    }
    setNote(null);
    setBoard((current) => ({ ...current, [slot]: kind === "switch" ? { kind, closed: false } : { kind } }));
  }

  function clearSlot(slot: SlotId) {
    setNote(null);
    setBoard((current) => ({ ...current, [slot]: null }));
  }

  function activate(slot: SlotId) {
    const part = board[slot];
    if (held) {
      place(slot, held);
      setHeld(null);
      return;
    }
    if (part?.kind === "switch") {
      setSwitchToggled(true);
      setBoard((current) => ({ ...current, [slot]: { kind: "switch", closed: !part.closed } }));
    }
  }

  function onKey(event: KeyboardEvent, slot: SlotId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(slot);
    }
    if ((event.key === "Delete" || event.key === "Backspace") && board[slot]) {
      event.preventDefault();
      clearSlot(slot);
    }
  }

  function onDrop(event: DragEvent, slot: SlotId) {
    event.preventDefault();
    const kind = event.dataTransfer.getData("text/plain") as PartKind;
    if (TRAY.includes(kind)) place(slot, kind);
  }

  function handleReset() {
    setBoard(emptyBoard());
    setHeld(null);
    setSwitchToggled(false);
    setNote(null);
    setPicked(null);
    actions.resetExperience();
  }

  const firstOpen = challenges.findIndex((item) => !runtimeState.completedTasks.includes(item.id));
  const shownIndex = picked ?? (firstOpen === -1 ? challenges.length - 1 : firstOpen);
  const shown = challenges[shownIndex];

  const statusClass =
    analysis.status === "working" ? styles.statusOk : analysis.status === "short" || analysis.status === "blown" ? styles.statusBad : styles.statusInfo;

  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Physics · Challenge {shownIndex + 1} of {challenges.length}</p>
            <h2 className={styles.title}>{shown.title}</h2>
          </div>
          <div className={styles.headerAside}>
            <ActivityHeaderButtons onReset={handleReset} buttonClassName={styles.headerButton} />
          </div>
        </header>

        <nav className={styles.levels} aria-label="Challenges">
          {challenges.map((item, index) => {
            const done = runtimeState.completedTasks.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPicked(index)}
                aria-current={index === shownIndex ? "step" : undefined}
                title={item.title}
                className={`${styles.levelPill} ${index === shownIndex ? styles.levelActive : ""} ${done ? styles.levelDone : ""}`}
              >
                <span>{index + 1}</span>
                {done && <em aria-label="done">✓</em>}
              </button>
            );
          })}
        </nav>

        {runtimeState.completed ? (
          <div className={styles.complete} role="status">
            <div>
              <h3>All challenges complete!</h3>
              <p>You built series and parallel circuits, switched them on and off, and even caused a short circuit. You can keep experimenting on the board.</p>
            </div>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.headerButton} />
          </div>
        ) : (
          <p className={styles.goal}><strong>Goal:</strong> {shown.goal}</p>
        )}

        <div className={styles.workspace}>
          <div className={styles.stage}>
            <p className={`${styles.status} ${statusClass}`} role="status">{note ?? analysis.message}</p>
            <div className={styles.boardWrap}>
              <svg viewBox="0 0 640 340" className={styles.board} role="group" aria-label="Circuit board with five slots">
                {WIRES.map((wire) => (
                  <path key={wire.d} d={wire.d} className={styles.wire} />
                ))}
                {WIRES.map((wire) => {
                  const active = wire.branch ? analysis.slots.s4.current > 0 : analysis.flowing;
                  return active ? <path key={`f-${wire.d}`} d={wire.d} className={styles.flow} /> : null;
                })}
                <circle cx="200" cy="100" r="5" className={styles.node} />
                <circle cx="440" cy="100" r="5" className={styles.node} />

                {ALL_SLOTS.map((slot) => {
                  const pos = SLOT_POS[slot];
                  const part = board[slot];
                  const reading = analysis.slots[slot];
                  const isBranch = BRANCH_SLOTS.includes(slot);
                  const problem = analysis.problemSlot === slot;
                  const label = `${pos.name}: ${part ? PART_LABEL[part.kind] + (part.kind === "switch" ? (part.closed ? ", closed" : ", open") : "") : "empty"}`;
                  const text = part ? readingText(part, reading, analysis.flowing) : "";
                  return (
                    <g
                      key={slot}
                      transform={`translate(${pos.x} ${pos.y})`}
                      role="button"
                      tabIndex={0}
                      aria-label={label}
                      className={`${styles.slot} ${held ? styles.slotArmed : ""} ${problem ? styles.slotProblem : ""}`}
                      onClick={() => activate(slot)}
                      onKeyDown={(event) => onKey(event, slot)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => onDrop(event, slot)}
                    >
                      <rect
                        x={-BOX_W / 2}
                        y={-BOX_H / 2}
                        width={BOX_W}
                        height={BOX_H}
                        rx="10"
                        className={`${styles.slotBox} ${part ? styles.slotFilled : isBranch ? styles.slotOptional : styles.slotEmpty}`}
                      />
                      {part ? (
                        <>
                          <g transform="translate(0 -8)"><PartGlyph part={part} reading={reading} /></g>
                          {text && <text x="0" y="21" className={styles.reading}>{text}</text>}
                        </>
                      ) : (
                        <text x="0" y="4" className={styles.emptyLabel}>{isBranch ? "optional branch" : "drop here"}</text>
                      )}
                      {part && (
                        <g
                          className={styles.remove}
                          transform={`translate(${BOX_W / 2 - 4} ${-BOX_H / 2 + 4})`}
                          onClick={(event) => { event.stopPropagation(); clearSlot(slot); }}
                          role="button"
                          aria-label={`Remove ${PART_LABEL[part.kind]} from ${pos.name}`}
                        >
                          <circle r="9" />
                          <path d="M-3.5 -3.5 L3.5 3.5 M3.5 -3.5 L-3.5 3.5" />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className={styles.readouts}>
              <div><span>Voltage</span><strong>{analysis.volts.toFixed(1)} V</strong></div>
              <div><span>Current</span><strong>{analysis.status === "short" ? "very high" : `${analysis.current.toFixed(2)} A`}</strong></div>
              <div><span>Bulbs glowing</span><strong>{analysis.bulbsLit}</strong></div>
            </div>
            <p className={styles.hint}>Hint: {shown.hint}</p>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTitle}>Parts</p>
            <p className={styles.panelNote}>Drag a part onto a slot, or tap a part and then tap a slot.</p>
            <div className={styles.tray}>
              {TRAY.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  draggable
                  onDragStart={(event) => { event.dataTransfer.setData("text/plain", kind); event.dataTransfer.effectAllowed = "copy"; }}
                  onClick={() => setHeld((current) => (current === kind ? null : kind))}
                  aria-pressed={held === kind}
                  className={`${styles.trayPart} ${held === kind ? styles.trayHeld : ""}`}
                >
                  <svg viewBox="-40 -24 80 40" width="52" height="26" aria-hidden="true">
                    <PartGlyph part={kind === "switch" ? { kind, closed: true } : { kind }} reading={{ current: 0, volts: 0, brightness: kind === "bulb" ? 0.7 : 0, blown: false, buzzing: false }} />
                  </svg>
                  <span><b>{PART_LABEL[kind]}</b><small>{TRAY_NOTE[kind]}</small></span>
                </button>
              ))}
            </div>
            <button type="button" className={styles.clear} onClick={() => { setBoard(emptyBoard()); setHeld(null); setNote(null); }}>
              Clear the board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
