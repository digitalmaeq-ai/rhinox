"use client";

import { useEffect, useRef, useState } from "react";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveAsset } from "@/types/interactive-assets";
import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { toVisualKey } from "@/app/components/interactive/shared/visualKeys";

import styles from "./GridPathRenderer.module.css";
import { CommandArrow, GridSprite } from "./GridPathVisuals";

// Grid-path coding renderer for the "coding" runtime (component:
// "grid-path") — build a program of arrow commands, run it, and guide the
// robot to the goal without bumping into anything.
//
// Data contract — existing InteractiveAsset fields only:
//   - the GRID is the asset of type "environment", with
//     `properties.columns`, `properties.rows` and (optional)
//     `properties.maxCommands`;
//   - the ROBOT is the asset of type "character"; `x` / `y` is its start
//     cell (0-based column / row, row 0 at the top);
//   - the GOAL is the asset with `properties.role` "goal", at `x` / `y`;
//   - a WALL is any asset with `properties.role` "wall", at `x` / `y`;
//   - one required task, with task id === goal asset id; it completes when
//     a run ends on the goal;
//   - "code-success", "code-blocked" (the robot bumped into a wall or the
//     edge) and "code-short" (the program ended somewhere else) carry the
//     feedback.
// The art for every asset comes from `properties.visual` (or its label).

type Direction = "up" | "right" | "down" | "left";

const DIRECTIONS: { id: Direction; label: string; dx: number; dy: number }[] = [
  { id: "up", label: "Up", dx: 0, dy: -1 },
  { id: "right", label: "Right", dx: 1, dy: 0 },
  { id: "down", label: "Down", dx: 0, dy: 1 },
  { id: "left", label: "Left", dx: -1, dy: 0 },
];

type Cell = { x: number; y: number };
type Outcome = "success" | "blocked" | "short";

// One entry per command: where the robot is after it, and whether that
// command was blocked (the robot stays put and the run stops).
type TraceStep = Cell & { blocked: boolean };

const STEP_MS = 420;

function numberProperty(asset: InteractiveAsset | undefined, key: string, fallback: number) {
  const value = asset?.properties?.[key];
  return typeof value === "number" ? value : fallback;
}

function assetVisualKey(asset: InteractiveAsset) {
  const explicit = asset.properties?.visual;
  return typeof explicit === "string" ? toVisualKey(explicit) : toVisualKey(asset.label);
}

function cellOf(asset: InteractiveAsset | undefined): Cell {
  return { x: asset?.x ?? 0, y: asset?.y ?? 0 };
}

export default function GridPathRenderer({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  const assets = (experience.assets ?? []).filter((asset) => asset.visible !== false);
  const tasks = experience.tasks ?? [];

  const grid = assets.find((asset) => asset.type === "environment");
  const robot = assets.find((asset) => asset.type === "character");
  const goal = assets.find((asset) => asset.properties?.role === "goal");
  const walls = assets.filter((asset) => asset.properties?.role === "wall");

  const columns = numberProperty(grid, "columns", 5);
  const rows = numberProperty(grid, "rows", 4);
  const maxCommands = numberProperty(grid, "maxCommands", 12);
  const start = cellOf(robot);
  const goalCell = cellOf(goal);

  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);

  // Presentation-only state: the program being built and the current run.
  const [program, setProgram] = useState<Direction[]>([]);
  const [run, setRun] = useState<{ trace: TraceStep[]; step: number } | null>(null);
  const [result, setResult] = useState<{
    outcome: Outcome;
    at: Cell;
    blockedAt: Cell | null;
    blockedIndex: number | null;
    key: number;
  } | null>(null);
  const [runs, setRuns] = useState(0);
  const runCounter = useRef(0);

  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) {
      actions.completeExperience();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  function isWall(cell: Cell) {
    return walls.some((wall) => wall.x === cell.x && wall.y === cell.y);
  }

  function isInside(cell: Cell) {
    return cell.x >= 0 && cell.y >= 0 && cell.x < columns && cell.y < rows;
  }

  // Works out the whole run up front; the animation just replays it.
  function traceProgram(commands: Direction[]): TraceStep[] {
    const trace: TraceStep[] = [];
    let position = start;

    for (const command of commands) {
      const direction = DIRECTIONS.find((item) => item.id === command);
      if (!direction) {
        continue;
      }
      const next = { x: position.x + direction.dx, y: position.y + direction.dy };
      if (!isInside(next) || isWall(next)) {
        trace.push({ ...position, blocked: true });
        break;
      }
      position = next;
      trace.push({ ...position, blocked: false });
    }

    return trace;
  }

  function finishRun(trace: TraceStep[]) {
    const last = trace[trace.length - 1];
    const end = last ? { x: last.x, y: last.y } : start;
    const blocked = Boolean(last?.blocked);
    const reachedGoal = !blocked && end.x === goalCell.x && end.y === goalCell.y;
    const outcome: Outcome = reachedGoal ? "success" : blocked ? "blocked" : "short";

    runCounter.current += 1;
    setRun(null);
    setResult({
      outcome,
      at: end,
      blockedAt: blocked ? blockedCell(trace) : null,
      blockedIndex: blocked ? trace.length - 1 : null,
      key: runCounter.current,
    });

    if (outcome === "success" && goal) {
      const task = tasks.find((item) => item.id === goal.id);
      actions.completeTask(goal.id, task?.points ?? 0);
      actions.triggerInteraction("code-success");
    } else {
      actions.triggerInteraction(outcome === "blocked" ? "code-blocked" : "code-short");
    }
  }

  // The cell the robot tried to move into when it was blocked.
  function blockedCell(trace: TraceStep[]): Cell | null {
    const index = trace.length - 1;
    const direction = DIRECTIONS.find((item) => item.id === program[index]);
    const from = trace[index];
    return direction && from ? { x: from.x + direction.dx, y: from.y + direction.dy } : null;
  }

  // Replays the trace one command at a time.
  useEffect(() => {
    if (!run) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (run.step >= run.trace.length) {
        finishRun(run.trace);
      } else {
        setRun({ trace: run.trace, step: run.step + 1 });
      }
    }, run.step === 0 ? 150 : STEP_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const isRunning = run !== null;
  const locked = isRunning || runtimeState.completed;

  function editProgram(next: Direction[]) {
    setProgram(next);
    setResult(null);
  }

  function addCommand(direction: Direction) {
    if (locked || program.length >= maxCommands) {
      return;
    }
    editProgram([...program, direction]);
  }

  function removeCommand(index: number) {
    if (locked) {
      return;
    }
    editProgram(program.filter((_, position) => position !== index));
  }

  function runProgram() {
    if (locked || program.length === 0) {
      return;
    }
    setResult(null);
    setRuns((count) => count + 1);
    setRun({ trace: traceProgram(program), step: 0 });
  }

  function handleReset() {
    actions.resetExperience();
    setProgram([]);
    setRun(null);
    setResult(null);
    setRuns(0);
  }

  // Where to draw the robot right now.
  let robotCell: Cell = start;
  if (run && run.step > 0) {
    const current = run.trace[run.step - 1];
    robotCell = { x: current.x, y: current.y };
  } else if (result) {
    robotCell = result.at;
  }
  const bumping = Boolean(run && run.step > 0 && run.trace[run.step - 1].blocked);
  const activeIndex = run && run.step > 0 ? run.step - 1 : -1;

  const latestFeedback = runtimeState.feedback[runtimeState.feedback.length - 1];
  const showOutcome = Boolean(latestFeedback) && result !== null && !runtimeState.completed;

  const cells: Cell[] = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      cells.push({ x, y });
    }
  }

  const cellPercent = (value: number, count: number) => `${(value / count) * 100}%`;

  return (
    <div className={styles.root}>
      <div className={styles.board}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Coding activity</p>
            <h2 className={styles.title}>Program the robot to reach the goal</h2>
          </div>

          <div className={styles.headerAside}>
            <div className={styles.progress}>
              <span data-testid="code-progress">
                {program.length} of {maxCommands} commands
                {runs > 0 ? ` · ${runs} run${runs === 1 ? "" : "s"}` : ""}
              </span>
            </div>

            <ActivityHeaderButtons onReset={handleReset} resetDisabled={isRunning} buttonClassName={styles.resetButton} />
          </div>
        </div>

        {/* ---------- Feedback / completion ---------- */}
        {runtimeState.completed ? (
          <div className={styles.complete} role="status">
            <span className={styles.completeBadge} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
              </svg>
            </span>
            <div className={styles.completeText}>
              <h2 className={styles.completeTitle}>Experiment complete!</h2>
              <p className={styles.completeSummary}>
                Your {program.length}-command program reached the goal.
              </p>
            </div>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.completeButton} />
          </div>
        ) : (
          <p
            role="status"
            key={showOutcome && result ? `outcome-${result.key}` : isRunning ? "running" : "idle"}
            className={`${styles.feedback} ${
              showOutcome && result
                ? result.outcome === "success"
                  ? styles.feedbackCorrect
                  : styles.feedbackIncorrect
                : styles.feedbackIdle
            }`}
          >
            {showOutcome
              ? latestFeedback
              : isRunning
                ? "Running your program…"
                : program.length === 0
                  ? "Add arrow commands to build a program, then press Run."
                  : "Press Run to test your program. Tap a step in your program to remove it."}
          </p>
        )}

        <div className={styles.workspace}>
          {/* ---------- Grid ---------- */}
          <div
            className={styles.grid}
            style={{ aspectRatio: `${columns} / ${rows}` }}
            role="img"
            aria-label={`A grid with ${columns} columns and ${rows} rows. The robot starts in column ${start.x + 1}, row ${start.y + 1}; the goal is in column ${goalCell.x + 1}, row ${goalCell.y + 1}.`}
          >
            <div
              className={styles.cells}
              style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {cells.map((cell) => {
                const wall = walls.find((item) => item.x === cell.x && item.y === cell.y);
                const isGoal = goal && cell.x === goalCell.x && cell.y === goalCell.y;
                const isStart = cell.x === start.x && cell.y === start.y;
                const wasBlocked =
                  result?.blockedAt?.x === cell.x && result?.blockedAt?.y === cell.y;

                return (
                  <div
                    key={`${cell.x}-${cell.y}`}
                    data-cell={`${cell.x}-${cell.y}`}
                    className={[
                      styles.cell,
                      (cell.x + cell.y) % 2 === 0 ? styles.cellEven : "",
                      isStart ? styles.cellStart : "",
                      wasBlocked ? styles.cellBlocked : "",
                    ].join(" ")}
                  >
                    {wall && <GridSprite visualKey={assetVisualKey(wall)} />}
                    {isGoal && goal && (
                      <span className={result?.outcome === "success" || runtimeState.completed ? styles.goalReached : ""}>
                        <GridSprite visualKey={assetVisualKey(goal)} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {robot && (
              <div
                data-testid="robot"
                data-x={robotCell.x}
                data-y={robotCell.y}
                className={`${styles.robot} ${bumping ? styles.robotBump : ""}`}
                style={{
                  width: cellPercent(1, columns),
                  height: cellPercent(1, rows),
                  left: cellPercent(robotCell.x, columns),
                  top: cellPercent(robotCell.y, rows),
                }}
                aria-hidden="true"
              >
                <GridSprite visualKey={assetVisualKey(robot)} />
              </div>
            )}
          </div>

          {/* ---------- Program ---------- */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Commands</p>
            <div className={styles.palette}>
              {DIRECTIONS.map((direction) => (
                <button
                  key={direction.id}
                  type="button"
                  data-command={direction.id}
                  aria-label={`Add ${direction.label}`}
                  disabled={locked || program.length >= maxCommands}
                  onClick={() => addCommand(direction.id)}
                  className={styles.command}
                >
                  <CommandArrow direction={direction.id} />
                  <span>{direction.label}</span>
                </button>
              ))}
            </div>

            <p className={styles.panelTitle}>Your program</p>
            <ol className={styles.program} aria-label="Your program">
              {program.length === 0 && (
                <li className={styles.programEmpty}>No commands yet</li>
              )}
              {program.map((command, index) => {
                const direction = DIRECTIONS.find((item) => item.id === command);
                const isActive = index === activeIndex;
                const isBlockedHere = result?.blockedIndex === index;

                return (
                  <li key={`${index}-${command}`}>
                    <button
                      type="button"
                      data-program-step={index}
                      disabled={locked}
                      onClick={() => removeCommand(index)}
                      aria-label={`Step ${index + 1}: ${direction?.label}. Remove`}
                      className={[
                        styles.programStep,
                        isActive ? styles.programStepActive : "",
                        isBlockedHere ? styles.programStepBlocked : "",
                      ].join(" ")}
                    >
                      <span className={styles.programNumber}>{index + 1}</span>
                      <CommandArrow direction={command} size={20} />
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className={styles.programActions}>
              <button
                type="button"
                onClick={runProgram}
                disabled={locked || program.length === 0}
                className={`rx-button rx-button-primary ${styles.runButton}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M7 4v16l13-8Z" /></svg>
                Run program
              </button>
              <button
                type="button"
                onClick={() => editProgram(program.slice(0, -1))}
                disabled={locked || program.length === 0}
                className={`rx-button rx-button-secondary ${styles.smallButton}`}
              >
                Undo
              </button>
              <button
                type="button"
                onClick={() => editProgram([])}
                disabled={locked || program.length === 0}
                className={`rx-button rx-button-secondary ${styles.smallButton}`}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
