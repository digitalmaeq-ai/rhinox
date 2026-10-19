"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import {
  CHARGER_LEVELS,
  DIRECTION_INFO,
  DIRECTION_ORDER,
  describeCommand,
  parFor,
  parseLevel,
  simulate,
  solveLevel,
  starsFor,
  type Cell,
  type ChargerLevel,
  type Command,
  type Direction,
  type SimResult,
} from "@/lib/robot-charger/levels";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { playChargerSound, readChargerMuted, setChargerMuted } from "@/app/components/interactive/shared/chargerSounds";

import styles from "./ChargerLevelsRenderer.module.css";
import { CommandArrow, GridSprite } from "./GridPathVisuals";

// Level-based coding game for the "coding" runtime (component:
// "charger-levels"). Ten missions: build a program of arrow blocks (later with
// repeat counts), run it, and drive the robot to the charger without hitting a
// rock or running out of battery. Bolts are an optional bonus.
// Level data and rules live in lib/robot-charger/levels.ts. The runtime only
// remembers which "level-N" tasks are complete; programs, stars and hints are
// local to this component.

const STEP_MS = 340;

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars} aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <i key={n} className={n <= count ? styles.starOn : styles.starOff} aria-hidden="true">★</i>
      ))}
    </span>
  );
}

function Confetti() {
  const colors = ["#0f6fde", "#f5b400", "#1f9d55", "#df4f93", "#ef4444", "#f08a24"];
  return (
    <div className={styles.confetti} aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 8) * 0.07}s`,
            animationDuration: `${1.1 + (i % 5) * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

function BoltSprite() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{ display: "block", width: "100%", height: "100%" }}>
      <circle cx={24} cy={24} r={15} fill="#fff4c2" opacity={0.85} />
      <path d="M27 6 14 26h9l-3 16 15-22h-9Z" fill="#f5b400" stroke="#b58300" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}

type Run = { sim: SimResult; step: number; level: ChargerLevel };
type Result = { sim: SimResult; stars: number; key: number };

export default function ChargerLevelsRenderer({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const levels = CHARGER_LEVELS;

  const [levelIndex, setLevelIndex] = useState(0);
  const level = levels[Math.min(levelIndex, levels.length - 1)];
  const map = parseLevel(level);

  const [programs, setPrograms] = useState<Record<number, Command[]>>({});
  const [times, setTimes] = useState(1);
  const [run, setRun] = useState<Run | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [hintUsed, setHintUsed] = useState<Record<number, boolean>>({});
  const [hintText, setHintText] = useState<string | null>(null);
  const [stars, setStars] = useState<Record<number, number>>({});
  const [bestBolts, setBestBolts] = useState<Record<number, number>>({});
  const [justDone, setJustDone] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const counter = useRef(0);

  const program = programs[level.number] ?? [];
  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);
  const levelDone = (number: number) => runtimeState.completedTasks.includes(`level-${number}`);
  const isRunning = run !== null;
  const par = useMemo(() => parFor(level), [level]);

  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) {
      actions.completeExperience();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  useEffect(() => {
    const off = readChargerMuted();
    setChargerMuted(off);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (off) setSoundOn(false);
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setChargerMuted(!next);
    if (next) playChargerSound("pick");
  }

  function finishRun(finished: Run) {
    const { sim } = finished;
    const current = finished.level;
    counter.current += 1;
    const used = programs[current.number] ?? [];
    const earned = sim.outcome === "success" ? starsFor(current, used, sim.boltsCollected.length, Boolean(hintUsed[current.number])) : 0;
    setRun(null);
    setResult({ sim, stars: earned, key: counter.current });

    if (sim.outcome !== "success") {
      if (sim.outcome === "short") playChargerSound("hint");
      return;
    }

    const wasDone = levelDone(current.number);
    setStars((old) => ({ ...old, [current.number]: Math.max(old[current.number] ?? 0, earned) }));
    setBestBolts((old) => ({ ...old, [current.number]: Math.max(old[current.number] ?? 0, sim.boltsCollected.length) }));
    setJustDone(current.number);
    setHintText(null);
    if (!wasDone) {
      const task = tasks.find((item) => item.id === `level-${current.number}`);
      actions.completeTask(`level-${current.number}`, task?.points ?? 0);
    }
    const lastOne = levels.every((item) => item.number === current.number || levelDone(item.number));
    playChargerSound(lastOne && !wasDone ? "win" : "charge");
  }

  // Replays the pre-computed run one unit move at a time.
  useEffect(() => {
    if (!run) return;
    const timer = window.setTimeout(() => {
      if (run.step >= run.sim.steps.length) {
        finishRun(run);
        return;
      }
      const shown = run.sim.steps[run.step];
      playChargerSound(shown.kind === "bump" ? "bump" : shown.kind === "flat" ? "flat" : shown.bolt >= 0 ? "bolt" : "move");
      setRun({ ...run, step: run.step + 1 });
    }, run.step === 0 ? 180 : STEP_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  function setProgram(next: Command[]) {
    setPrograms((old) => ({ ...old, [level.number]: next }));
    setResult(null);
    setJustDone(null);
  }

  function addCommand(dir: Direction) {
    if (isRunning || program.length >= level.maxCommands) return;
    setProgram([...program, { dir, times: Math.min(times, level.maxTimes) }]);
    playChargerSound("add");
  }

  function removeCommand(index: number) {
    if (isRunning) return;
    setProgram(program.filter((_, position) => position !== index));
    playChargerSound("remove");
  }

  function runProgram() {
    if (isRunning || program.length === 0) return;
    setResult(null);
    setJustDone(null);
    setAttempts((old) => ({ ...old, [level.number]: (old[level.number] ?? 0) + 1 }));
    playChargerSound("run");
    setRun({ sim: simulate(level, program), step: 0, level });
  }

  function showHint() {
    if (isRunning) return;
    const solution = solveLevel(level, true) ?? solveLevel(level, false);
    if (!solution) return;
    const lead = solution.slice(0, Math.min(3, solution.length)).map(describeCommand).join(", then ");
    setHintText(`Hint: a good plan starts with ${lead}${solution.length > 3 ? ", and then keep going" : ""}.`);
    setHintUsed((old) => ({ ...old, [level.number]: true }));
    playChargerSound("hint");
  }

  function goToLevel(index: number) {
    if (isRunning) return;
    setLevelIndex(index);
    setResult(null);
    setJustDone(null);
    setHintText(null);
    setTimes(1);
  }

  function handleReset() {
    actions.resetExperience();
    setLevelIndex(0);
    setPrograms({});
    setRun(null);
    setResult(null);
    setAttempts({});
    setHintUsed({});
    setHintText(null);
    setStars({});
    setBestBolts({});
    setJustDone(null);
    setTimes(1);
  }

  function panelKey(event: React.KeyboardEvent) {
    const arrows: Record<string, Direction> = { ArrowUp: "up", ArrowRight: "right", ArrowDown: "down", ArrowLeft: "left" };
    if (arrows[event.key]) {
      event.preventDefault();
      addCommand(arrows[event.key]);
    } else if (event.key === "Backspace") {
      event.preventDefault();
      if (program.length > 0) removeCommand(program.length - 1);
    }
  }

  // ----- what to draw right now -----
  const shown = run ? run.sim : result?.sim ?? null;
  const stepCount = run ? run.step : result ? result.sim.steps.length : 0;
  const visible = shown ? shown.steps.slice(0, stepCount) : [];
  const lastStep = visible[visible.length - 1];
  const robotCell: Cell = lastStep ? { x: lastStep.x, y: lastStep.y } : map.start;
  const collected = new Set(visible.filter((s) => s.bolt >= 0).map((s) => s.bolt));
  const movesMade = visible.filter((s) => s.kind === "move").length;
  const energyLeft = Math.max(level.energy - movesMade, 0);
  const activeCommand = run && lastStep ? lastStep.command : -1;
  const bumping = Boolean(run && lastStep && lastStep.kind !== "move");
  const trail = new Set(visible.filter((s) => s.kind === "move").map((s) => `${s.x},${s.y}`));
  const bumpedKey = result?.sim.bumpedInto ? `${result.sim.bumpedInto.x},${result.sim.bumpedInto.y}` : "";
  const blockedCommand = result?.sim.outcome === "blocked" || result?.sim.outcome === "flat" ? result.sim.steps[result.sim.steps.length - 1]?.command : -1;
  const atCharger = robotCell.x === map.charger.x && robotCell.y === map.charger.y && (!run || run.step >= run.sim.steps.length);

  const totalStars = Object.values(stars).reduce((sum, n) => sum + n, 0);
  const totalBolts = Object.values(bestBolts).reduce((sum, n) => sum + n, 0);
  const totalAttempts = Object.values(attempts).reduce((sum, n) => sum + n, 0);
  const allBoltsHere = levels.reduce((sum, item) => sum + parseLevel(item).bolts.length, 0);
  const nextIndex = levelIndex + 1 < levels.length ? levelIndex + 1 : null;
  const showToast = justDone === level.number && !runtimeState.completed && result?.sim.outcome === "success";

  let message = "Add arrow blocks to build a program, then press Run.";
  let messageKind = "idle" as "idle" | "correct" | "incorrect";
  if (isRunning) {
    message = "Running your program…";
  } else if (result) {
    if (result.sim.outcome === "blocked") {
      message = "Bump! The robot hit something. Find the step shown in red and change it.";
      messageKind = "incorrect";
    } else if (result.sim.outcome === "flat") {
      message = "The battery ran flat! Use a shorter route or repeat blocks.";
      messageKind = "incorrect";
    } else if (result.sim.outcome === "short") {
      message = "The program ended before the robot reached the charger. Add more steps.";
      messageKind = "incorrect";
    }
  } else if (program.length > 0) {
    message = "Press Run to test your program. Tap a block to remove it.";
  } else {
    message = level.intro;
  }

  return (
    <div className={styles.root}>
      <div className={styles.board}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Mission {level.number} of {levels.length}</p>
            <h2 className={styles.title}>{level.title}</h2>
          </div>
          <div className={styles.headerAside}>
            <div className={styles.progress}>
              <span data-testid="code-progress">
                {program.length} of {level.maxCommands} blocks
                {attempts[level.number] ? ` · ${attempts[level.number]} run${attempts[level.number] === 1 ? "" : "s"}` : ""}
              </span>
            </div>
            <ActivityHeaderButtons onReset={handleReset} resetDisabled={isRunning} buttonClassName={styles.resetButton} />
          </div>
        </div>

        {/* ---------- Level picker ---------- */}
        <nav className={styles.rounds} aria-label="Missions">
          {levels.map((item, index) => {
            const finished = levelDone(item.number);
            return (
              <button
                key={item.number}
                type="button"
                onClick={() => goToLevel(index)}
                disabled={isRunning && index !== levelIndex}
                aria-current={index === levelIndex ? "step" : undefined}
                title={item.title}
                className={`${styles.roundPill} ${index === levelIndex ? styles.roundActive : ""} ${finished ? styles.roundDone : ""}`}
              >
                <span>{item.number}</span>
                {finished && <em aria-label={`${stars[item.number] ?? 1} stars`}>{"★".repeat(stars[item.number] ?? 1)}</em>}
              </button>
            );
          })}
          <span className={styles.navSpacer} />
          <button type="button" className={styles.smallButton} onClick={toggleSound} aria-pressed={soundOn}>
            {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
          </button>
        </nav>

        {/* ---------- Results / feedback ---------- */}
        {runtimeState.completed ? (
          <div className={styles.results} role="status">
            <Confetti />
            <div className={styles.resultsTop}>
              <span className={styles.completeBadge} aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
                </svg>
              </span>
              <div className={styles.completeText}>
                <h2 className={styles.completeTitle}>Master Programmer!</h2>
                <p className={styles.completeSummary}>The robot is fully charged. You finished all {levels.length} missions.</p>
              </div>
            </div>
            <dl className={styles.resultStats}>
              <div><dt>Stars</dt><dd>{totalStars} / {levels.length * 3}</dd></div>
              <div><dt>Bolts</dt><dd>{totalBolts} / {allBoltsHere}</dd></div>
              <div><dt>Runs</dt><dd>{totalAttempts}</dd></div>
            </dl>
            <ul className={styles.resultRounds}>
              {levels.map((item) => (
                <li key={item.number}>
                  <span>Mission {item.number}: {item.title}</span>
                  <Stars count={stars[item.number] ?? 1} />
                </li>
              ))}
            </ul>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.completeButton} />
          </div>
        ) : showToast && result ? (
          <div className={styles.roundToast} role="status">
            <Confetti />
            <div>
              <strong>Charged! Mission {level.number} complete</strong>
              <Stars count={result.stars} />
              <p>
                {result.sim.boltsCollected.length} of {map.bolts.length} bolts · {program.length} block{program.length === 1 ? "" : "s"} (best is {par}).
                {result.stars < 3 && !hintUsed[level.number] ? " Try again for more stars!" : ""}
              </p>
            </div>
            {nextIndex !== null && (
              <button type="button" className={`rx-button rx-button-primary ${styles.nextButton}`} onClick={() => goToLevel(nextIndex)} autoFocus>
                Next mission →
              </button>
            )}
          </div>
        ) : (
          <p
            role="status"
            key={result ? `r-${result.key}` : isRunning ? "running" : `idle-${level.number}-${program.length === 0}`}
            className={`${styles.feedback} ${messageKind === "correct" ? styles.feedbackCorrect : messageKind === "incorrect" ? styles.feedbackIncorrect : styles.feedbackIdle}`}
          >
            {message}
          </p>
        )}

        {hintText && !runtimeState.completed && <p className={styles.hint}>{hintText}</p>}

        <div className={styles.workspace}>
          {/* ---------- Grid ---------- */}
          <div className={styles.gridWrap}>
            <div className={styles.battery} aria-label={`Battery: ${energyLeft} of ${level.energy} squares left`}>
              <span className={styles.batteryLabel}>🔋 Battery</span>
              <span className={styles.batteryTrack}>
                <span
                  className={`${styles.batteryFill} ${energyLeft <= 3 ? styles.batteryLow : ""}`}
                  style={{ width: `${(energyLeft / level.energy) * 100}%` }}
                />
              </span>
              <span className={styles.batteryCount}>{energyLeft}</span>
              {map.bolts.length > 0 && (
                <span className={styles.boltCount} title="Bolts collected">⚡ {collected.size}/{map.bolts.length}</span>
              )}
            </div>

            <div
              className={styles.grid}
              style={{ aspectRatio: `${map.columns} / ${map.rows}` }}
              role="img"
              aria-label={`A grid with ${map.columns} columns and ${map.rows} rows. The robot starts in column ${map.start.x + 1}, row ${map.start.y + 1}; the charger is in column ${map.charger.x + 1}, row ${map.charger.y + 1}.`}
            >
              <div
                className={styles.cells}
                style={{ gridTemplateColumns: `repeat(${map.columns}, 1fr)`, gridTemplateRows: `repeat(${map.rows}, 1fr)` }}
              >
                {Array.from({ length: map.columns * map.rows }, (_, i) => {
                  const x = i % map.columns;
                  const y = Math.floor(i / map.columns);
                  const key = `${x},${y}`;
                  const rock = map.rocks.some((r) => r.x === x && r.y === y);
                  const boltIndex = map.bolts.findIndex((b) => b.x === x && b.y === y);
                  const isCharger = x === map.charger.x && y === map.charger.y;
                  const isStart = x === map.start.x && y === map.start.y;
                  return (
                    <div
                      key={key}
                      data-cell={`${x}-${y}`}
                      className={[
                        styles.cell,
                        (x + y) % 2 === 0 ? styles.cellEven : "",
                        isStart ? styles.cellStart : "",
                        trail.has(key) ? styles.cellTrail : "",
                        bumpedKey === key ? styles.cellBlocked : "",
                      ].join(" ")}
                    >
                      {rock && <GridSprite visualKey="rock" />}
                      {boltIndex >= 0 && (
                        <span className={`${styles.bolt} ${collected.has(boltIndex) ? styles.boltTaken : ""}`} data-bolt={boltIndex}>
                          <BoltSprite />
                        </span>
                      )}
                      {isCharger && (
                        <span className={`${styles.charger} ${atCharger && result?.sim.outcome === "success" ? styles.chargerOn : ""}`}>
                          <GridSprite visualKey="charger" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                data-testid="robot"
                data-x={robotCell.x}
                data-y={robotCell.y}
                className={`${styles.robot} ${bumping ? styles.robotBump : ""} ${run ? styles.robotMoving : ""}`}
                style={{
                  width: `${100 / map.columns}%`,
                  height: `${100 / map.rows}%`,
                  left: `${(robotCell.x / map.columns) * 100}%`,
                  top: `${(robotCell.y / map.rows) * 100}%`,
                }}
                aria-hidden="true"
              >
                <GridSprite visualKey="robot" />
              </div>
            </div>
            <p className={styles.legend}>
              <span>🤖 Robot</span><span>🪨 Rock</span>{map.bolts.length > 0 && <span>⚡ Bolt (bonus)</span>}<span>🔌 Charger</span>
              <span>Par: {par} blocks</span>
            </p>
          </div>

          {/* ---------- Program ---------- */}
          <div className={styles.panel} onKeyDown={panelKey}>
            <p className={styles.panelTitle}>Commands</p>
            <div className={styles.palette}>
              {DIRECTION_ORDER.map((dir) => (
                <button
                  key={dir}
                  type="button"
                  data-command={dir}
                  aria-label={`Add ${DIRECTION_INFO[dir].label}`}
                  disabled={isRunning || program.length >= level.maxCommands}
                  onClick={() => addCommand(dir)}
                  className={styles.command}
                >
                  <CommandArrow direction={dir} />
                  <span>{DIRECTION_INFO[dir].label}{times > 1 ? ` ×${times}` : ""}</span>
                </button>
              ))}
            </div>

            {level.maxTimes > 1 && (
              <div className={styles.repeatRow} role="group" aria-label="Repeat count">
                <span className={styles.repeatLabel}>Repeat</span>
                {Array.from({ length: level.maxTimes }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={times === n}
                    onClick={() => { setTimes(n); playChargerSound("pick"); }}
                    className={`${styles.repeatChip} ${times === n ? styles.repeatOn : ""}`}
                  >
                    ×{n}
                  </button>
                ))}
              </div>
            )}

            <p className={styles.panelTitle}>Your program</p>
            <ol className={styles.program} aria-label="Your program">
              {program.length === 0 && <li className={styles.programEmpty}>No blocks yet</li>}
              {program.map((command, index) => (
                <li key={`${index}-${command.dir}-${command.times}`}>
                  <button
                    type="button"
                    data-program-step={index}
                    disabled={isRunning}
                    onClick={() => removeCommand(index)}
                    aria-label={`Step ${index + 1}: ${describeCommand(command)}. Remove`}
                    className={[
                      styles.programStep,
                      index === activeCommand ? styles.programStepActive : "",
                      index === blockedCommand ? styles.programStepBlocked : "",
                    ].join(" ")}
                  >
                    <span className={styles.programNumber}>{index + 1}</span>
                    <CommandArrow direction={command.dir} size={20} />
                    {command.times > 1 && <b className={styles.programTimes}>×{command.times}</b>}
                  </button>
                </li>
              ))}
            </ol>

            <div className={styles.programActions}>
              <button
                type="button"
                onClick={runProgram}
                disabled={isRunning || program.length === 0}
                className={`rx-button rx-button-primary ${styles.runButton}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M7 4v16l13-8Z" /></svg>
                Run program
              </button>
              <button type="button" onClick={() => removeCommand(program.length - 1)} disabled={isRunning || program.length === 0} className={styles.smallButton}>
                Undo
              </button>
              <button type="button" onClick={() => setProgram([])} disabled={isRunning || program.length === 0} className={styles.smallButton}>
                Clear
              </button>
              <button type="button" onClick={showHint} disabled={isRunning} className={styles.smallButton}>
                💡 Hint (max 2 stars)
              </button>
            </div>
            <p className={styles.keyTip}>Tip: click here, then use the arrow keys to add blocks and Backspace to undo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
