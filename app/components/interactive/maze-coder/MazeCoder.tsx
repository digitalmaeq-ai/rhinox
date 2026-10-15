"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  countBlocks,
  parseLevel,
  runProgram,
  starsFor,
  type Block,
  type BlockKind,
  type RunResult,
} from "@/lib/maze-coder/engine";
import { mazeLevels } from "@/lib/maze-coder/levels";
import {
  compressActions,
  CUSTOM_LIMITS,
  DEFAULT_CUSTOM,
  DIFFICULTIES,
  generateMaze,
  solveShortest,
  treeToBlocks,
  type CustomOptions,
  type Difficulty,
  type Direction,
} from "@/lib/maze-coder/planner";
import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";

import MazeBoard from "./MazeBoard";
import styles from "./MazeCoder.module.css";

// Robot Maze Coder — "coding" runtime, component "maze-coder".
// Build a program from blocks (move, turn, repeat), press Run, and the robot
// follows it. Every level is a required task (id "level-N").

const BLOCK_INFO: Record<BlockKind, { label: string; glyph: string }> = {
  forward: { label: "Move forward", glyph: "→" },
  left: { label: "Turn left", glyph: "↺" },
  right: { label: "Turn right", glyph: "↻" },
  repeat: { label: "Repeat", glyph: "⟳" },
};

const FEEDBACK = {
  success: "The robot reached the charger.",
  blocked: "Bump! The robot hit a wall. Check the highlighted block.",
  short: "The program ended before the charger. Add more blocks.",
  chips: "You reached the charger but missed an energy chip. Collect them all first.",
  "too-long": "That program runs for too long. Check your loops.",
} as const;

let idCounter = 0;
const nextId = () => `b${(idCounter += 1)}`;

function makeBlock(kind: BlockKind): Block {
  return kind === "repeat" ? { id: nextId(), kind, count: 3, body: [] } : { id: nextId(), kind };
}

function mapBlocks(blocks: Block[], fn: (block: Block) => Block | null): Block[] {
  const out: Block[] = [];
  for (const block of blocks) {
    const mapped = fn(block);
    if (!mapped) continue;
    out.push(mapped.body ? { ...mapped, body: mapBlocks(mapped.body, fn) } : mapped);
  }
  return out;
}

function addTo(blocks: Block[], containerId: string | null, block: Block): Block[] {
  if (containerId === null) return [...blocks, block];
  return blocks.map((item) =>
    item.id === containerId
      ? { ...item, body: [...(item.body ?? []), block] }
      : item.body
        ? { ...item, body: addTo(item.body, containerId, block) }
        : item,
  );
}

function containsId(blocks: Block[], id: string): boolean {
  return blocks.some((block) => block.id === id || (block.body ? containsId(block.body, id) : false));
}

export default function MazeCoder({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const allDone = areRequiredTasksComplete(experience, runtimeState);

  // "levels": the six required levels. "challenge": endless generated mazes (bonus, not required).
  const [mode, setMode] = useState<"levels" | "challenge">("levels");
  const [levelIndex, setLevelIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty | "custom">("easy");
  const [custom, setCustom] = useState<CustomOptions>(DEFAULT_CUSTOM);
  const [seed, setSeed] = useState(1);
  const [challengeWins, setChallengeWins] = useState(0);
  const [showRoute, setShowRoute] = useState(false);
  // Compact: blocks flow left to right as small numbered chips; Detailed: the full-width list.
  const [compact, setCompact] = useState(true);
  // Wrong attempts on this maze. The play-area message grows with it: result, then the level hint, then the route.
  const [fails, setFails] = useState(0);
  const [solutionUsed, setSolutionUsed] = useState(false);

  const challenge = useMemo(() => generateMaze(seed, difficulty === "custom" ? { custom } : difficulty), [seed, difficulty, custom]);
  const level = mode === "levels" ? mazeLevels[levelIndex] : challenge.level;
  const parsed = useMemo(() => parseLevel(level), [level]);
  // The shortest route, found by the planner: powers the hint, the "shortest possible" score and Show solution.
  const plan = useMemo(() => solveShortest(level), [level]);

  const [program, setProgram] = useState<Block[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [playhead, setPlayhead] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [fast, setFast] = useState(false);
  const [stars, setStars] = useState<Record<string, number>>({});
  const finished = useRef(false);

  const used = countBlocks(program);

  useEffect(() => {
    if (allDone && !runtimeState.completed) actions.completeExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, runtimeState.completed]);

  function settle(done: RunResult) {
    if (finished.current) return;
    finished.current = true;
    if (done.outcome === "success") {
      // Using "Show solution" still counts as finishing, but caps the stars at one.
      const earned = solutionUsed ? 1 : starsFor(used, level.par);
      setStars((current) => ({ ...current, [level.id]: Math.max(current[level.id] ?? 0, earned) }));
      if (mode === "challenge") {
        setChallengeWins((count) => count + 1);
        setFails(0);
        return;
      }
      setFails(0);
      const task = tasks.find((item) => item.id === level.id);
      actions.completeTask(level.id, task?.points ?? level.points);
    } else {
      setFails((count) => count + 1);
    }
  }

  // Playback: advance one step per tick, then settle on the outcome.
  useEffect(() => {
    if (!playing || !result) return;
    const timer = window.setTimeout(() => {
      if (playhead + 1 < result.steps.length) {
        setPlayhead(playhead + 1);
      } else {
        setPlaying(false);
        settle(result);
      }
    }, playhead < 0 ? 200 : fast ? 170 : 420);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, playhead, result, fast]);

  function edit(next: Block[]) {
    setProgram(next);
    setResult(null);
    setPlayhead(-1);
    setPlaying(false);
    finished.current = false;
  }

  function resetRun() {
    setResult(null);
    setPlayhead(-1);
    setPlaying(false);
    finished.current = false;
  }

  function add(kind: BlockKind) {
    if (playing || used >= level.maxBlocks) return;
    const container = target && containsId(program, target) ? target : null;
    const block = makeBlock(kind);
    edit(addTo(program, container, block));
    if (kind === "repeat") setTarget(block.id);
  }

  function remove(id: string) {
    if (playing) return;
    if (target === id) setTarget(null);
    edit(mapBlocks(program, (block) => (block.id === id ? null : block)));
  }

  function setCount(id: string, delta: number) {
    if (playing) return;
    edit(
      mapBlocks(program, (block) =>
        block.id === id ? { ...block, count: Math.min(9, Math.max(2, (block.count ?? 2) + delta)) } : block,
      ),
    );
  }

  function run() {
    if (playing || program.length === 0) return;
    finished.current = false;
    setResult(runProgram(level, program));
    setPlayhead(-1);
    setPlaying(true);
  }

  function stepOnce() {
    if (playing) return;
    const current = result ?? runProgram(level, program);
    if (!result) {
      if (program.length === 0) return;
      finished.current = false;
      setResult(current);
      setPlayhead(0);
      return;
    }
    if (playhead + 1 < current.steps.length) {
      setPlayhead(playhead + 1);
    } else {
      settle(current);
      setPlayhead(current.steps.length - 1);
    }
  }

  function clearBoard() {
    setFails(0);
    setProgram([]);
    setTarget(null);
    setShowRoute(false);
    setSolutionUsed(false);
    resetRun();
  }

  function goTo(index: number) {
    setMode("levels");
    setLevelIndex(index);
    clearBoard();
  }

  function newChallenge(nextDifficulty: Difficulty | "custom" = difficulty) {
    if (playing) return;
    setMode("challenge");
    setDifficulty(nextDifficulty);
    setSeed((current) => ((current * 48271 + 11) % 90000) + 10); // deterministic sequence of mazes (also keeps render pure)
    clearBoard();
  }

  // Changing a Custom setting builds a new maze of that kind (same seed, so only that setting changes).
  function updateCustom(change: Partial<CustomOptions>) {
    if (playing) return;
    setCustom((current) => ({ ...current, ...change }));
    clearBoard();
  }

  function undo() {
    if (playing || program.length === 0) return;
    // Remove the most recently added block: the last one in the target loop, else the last top-level block.
    const container = target && containsId(program, target) ? target : null;
    const removeLast = (blocks: Block[]): Block[] => {
      if (container === null) return blocks.slice(0, -1);
      return blocks.map((item) =>
        item.id === container
          ? { ...item, body: (item.body ?? []).slice(0, -1) }
          : item.body
            ? { ...item, body: removeLast(item.body) }
            : item,
      );
    };
    edit(removeLast(program));
  }

  // "Show solution": loads the planner's shortest program into the editor.
  function showSolution() {
    if (playing || !plan.actions) return;
    // Levels that do not unlock Repeat get the plain step-by-step version.
    const flat = !level.allowed.includes("repeat");
    const tree = flat
      ? plan.actions.map((action) => ({ kind: "A" as const, action }))
      : compressActions(plan.actions).tree;
    setSolutionUsed(true);
    setTarget(null);
    edit(treeToBlocks(tree, nextId));
  }

  function handleReset() {
    actions.resetExperience();
    setStars({});
    setChallengeWins(0);
    goTo(0);
  }

  // Where the robot is drawn right now.
  const step = result && playhead >= 0 ? result.steps[Math.min(playhead, result.steps.length - 1)] : null;
  const pose = step
    ? { x: step.x, y: step.y, angle: step.angle }
    : { x: parsed.start.x, y: parsed.start.y, angle: level.heading * 90 };
  const taken = new Set<number>();
  if (result && playhead >= 0) {
    for (let i = 0; i <= Math.min(playhead, result.steps.length - 1); i += 1) {
      const chip = result.steps[i].chip;
      if (chip !== null) taken.add(chip);
    }
  }
  const atEnd = Boolean(result && playhead >= result.steps.length - 1 && !playing);
  const bumping = Boolean(step && step.kind === "bump");
  const activeId = step?.blockId ?? null;
  const arrived = Boolean(atEnd && result?.outcome === "success");
  // Turning on the spot after reaching the charger is harmless, so it is not counted.
  const actionsTaken = result ? result.steps.length - (result.steps.length - 1 - (result.steps.map((item) => item.kind).lastIndexOf("move"))) : 0;
  const earnedStars = solutionUsed ? 1 : starsFor(used, level.par);

  // The banner above the board only says what to do; results appear on the play area.
  const status = playing ? "Running your program…" : program.length === 0 ? level.goal : "Press Run to test your program.";

  function renderBlocks(blocks: Block[], depth = 0) {
    return (
      <ol className={depth === 0 ? styles.program : styles.nested} aria-label={depth === 0 ? "Your program" : "Inside the repeat"}>
        {blocks.map((block) => {
          const info = BLOCK_INFO[block.kind];
          const isActive = activeId === block.id && playing;
          const isBump = bumping && activeId === block.id;
          const cls = [
            styles.block,
            styles[`kind_${block.kind}`],
            isActive ? styles.blockActive : "",
            isBump ? styles.blockBump : "",
            target === block.id ? styles.blockTarget : "",
          ].join(" ");

          return (
            <li key={block.id} className={cls}>
              <div className={styles.blockRow}>
                <span className={styles.glyph} aria-hidden="true">{info.glyph}</span>
                {block.kind === "repeat" ? (
                  <>
                    <button
                      type="button"
                      className={styles.blockLabel}
                      onClick={() => setTarget(target === block.id ? null : block.id)}
                      aria-pressed={target === block.id}
                      disabled={playing}
                    >
                      Repeat
                    </button>
                    <span className={styles.stepper}>
                      <button type="button" onClick={() => setCount(block.id, -1)} disabled={playing} aria-label="Fewer repeats">−</button>
                      <strong aria-label={`${block.count} times`}>{block.count}×</strong>
                      <button type="button" onClick={() => setCount(block.id, 1)} disabled={playing} aria-label="More repeats">+</button>
                    </span>
                  </>
                ) : (
                  <span className={styles.blockText}>{info.label}</span>
                )}
                <button type="button" className={styles.remove} onClick={() => remove(block.id)} disabled={playing} aria-label={`Remove ${info.label}`}>
                  ×
                </button>
              </div>
              {block.kind === "repeat" && (
                <div className={styles.loopBody}>
                  {block.body && block.body.length > 0 ? (
                    renderBlocks(block.body, depth + 1)
                  ) : (
                    <p className={styles.loopEmpty}>{target === block.id ? "Add blocks here" : "Select Repeat to fill it"}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  // Compact view: every block is a small chip in reading order (1, 2, 3...), so a long
  // program stays short and the sequence is easy to follow. Loops wrap their chips in a
  // bracket with the repeat count.
  function renderCompact(blocks: Block[], counter: { n: number }, depth = 0) {
    return (
      <ol className={depth === 0 ? styles.chipsRow : styles.chipsNested} aria-label={depth === 0 ? "Your program" : "Inside the repeat"}>
        {blocks.map((block) => {
          const info = BLOCK_INFO[block.kind];
          const isActive = activeId === block.id && playing;
          const isBump = bumping && activeId === block.id;
          const state = [isActive ? styles.blockActive : "", isBump ? styles.blockBump : "", target === block.id ? styles.blockTarget : ""].join(" ");

          if (block.kind === "repeat") {
            return (
              <li key={block.id} className={`${styles.repeatChip} ${styles.kind_repeat} ${state}`}>
                <div className={styles.repeatHead}>
                  <button
                    type="button"
                    className={styles.repeatToggle}
                    onClick={() => setTarget(target === block.id ? null : block.id)}
                    aria-pressed={target === block.id}
                    disabled={playing}
                    title={target === block.id ? "New blocks go inside this loop" : "Select to add blocks inside this loop"}
                  >
                    <span aria-hidden="true">{info.glyph}</span> Repeat
                  </button>
                  <span className={styles.stepper}>
                    <button type="button" onClick={() => setCount(block.id, -1)} disabled={playing} aria-label="Fewer repeats">−</button>
                    <strong aria-label={`${block.count} times`}>{block.count}×</strong>
                    <button type="button" onClick={() => setCount(block.id, 1)} disabled={playing} aria-label="More repeats">+</button>
                  </span>
                  <button type="button" className={styles.removeInline} onClick={() => remove(block.id)} disabled={playing} aria-label="Remove Repeat">×</button>
                </div>
                {block.body && block.body.length > 0 ? (
                  renderCompact(block.body, counter, depth + 1)
                ) : (
                  <p className={styles.loopEmpty}>{target === block.id ? "Add blocks here" : "Select Repeat to fill it"}</p>
                )}
              </li>
            );
          }

          counter.n += 1;
          return (
            <li key={block.id} className={`${styles.chip} ${styles[`kind_${block.kind}`]} ${state}`} title={info.label}>
              <span className={styles.glyph} aria-hidden="true">{info.glyph}</span>
              <span className={styles.srOnly}>{info.label}</span>
              <span className={styles.chipNum} aria-hidden="true">{counter.n}</span>
              <button type="button" className={styles.chipRemove} onClick={() => remove(block.id)} disabled={playing} aria-label={`Remove step ${counter.n}, ${info.label}`}>×</button>
            </li>
          );
        })}
      </ol>
    );
  }

  const nextLevel = levelIndex < mazeLevels.length - 1 ? levelIndex + 1 : null;

  // The message on the play area. Wrong attempts add help step by step; a solved maze
  // reveals its stars, then the route report, then the button to move on.
  let resultToast: ReactNode = null;
  if (atEnd && result) {
    if (result.outcome === "success") {
      const perfect = plan.actions ? actionsTaken <= plan.actions.length : false;
      const lastLevel = mode === "levels" && nextLevel === null;
      resultToast = (
        <div className={`${styles.toast} ${styles.toastGood}`} role="status">
          <div className={styles.toastHead}>
            <strong>{mode === "challenge" ? "Maze solved!" : lastLevel ? "Final level complete!" : `Level ${levelIndex + 1} complete!`}</strong>
            <span className={styles.toastStars} aria-label={`${earnedStars} of 3 stars`}>
              {[1, 2, 3].map((n) => (
                <i key={n} className={n <= earnedStars ? styles.starOn : styles.starOff} style={{ animationDelay: `${0.15 + n * 0.22}s` }} aria-hidden="true">★</i>
              ))}
            </span>
          </div>
          <p className={styles.toastLine} style={{ animationDelay: "0.9s" }}>
            <b>{perfect ? "Perfect" : "Route check"}</b>
            <span>{actionsTaken}/{plan.actions ? plan.actions.length : actionsTaken} steps</span>
            <span>{used} blocks</span>
          </p>
          {(mode === "challenge" || nextLevel !== null) && (
            <button
              type="button"
              className={styles.toastButton}
              style={{ animationDelay: "1.15s" }}
              onClick={() => (mode === "challenge" ? newChallenge() : goTo(nextLevel as number))}
              autoFocus
            >
              {mode === "challenge" ? "Next challenge →" : "Next level →"}
            </button>
          )}
        </div>
      );
    } else {
      resultToast = (
        <div className={`${styles.toast} ${styles.toastBad}`} role="status">
          <div className={styles.toastHead}>
            <strong>{result.outcome === "blocked" ? "Bump!" : "Not quite yet"}</strong>
          </div>
          <p className={styles.toastLine}>{FEEDBACK[result.outcome]}</p>
          {fails >= 2 && <p className={styles.toastLine}>Hint: {level.hint}</p>}
          <div className={styles.toastActions}>
            <button type="button" className={styles.toastButton} onClick={resetRun} autoFocus>
              Try again
            </button>
            {fails >= 3 && plan.actions && (
              <button type="button" className={styles.toastGhost} onClick={() => { setShowRoute(true); resetRun(); }}>
                Show the route
              </button>
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              {mode === "levels" ? `Coding · Level ${levelIndex + 1} of ${mazeLevels.length}` : `Challenge · ${difficulty === "custom" ? "Custom" : DIFFICULTIES[difficulty].label} · maze #${seed}`}
            </p>
            <h2 className={styles.title}>{level.title}</h2>
          </div>
          <div className={styles.headerAside}>
            <ActivityHeaderButtons onReset={handleReset} resetDisabled={playing} buttonClassName={styles.headerButton} />
          </div>
        </header>

        <nav className={styles.levels} aria-label="Levels">
          {mazeLevels.map((item, index) => {
            const done = runtimeState.completedTasks.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                disabled={playing}
                aria-current={mode === "levels" && index === levelIndex ? "step" : undefined}
                className={`${styles.levelPill} ${mode === "levels" && index === levelIndex ? styles.levelActive : ""} ${done ? styles.levelDone : ""}`}
              >
                <span>{index + 1}</span>
                {done && <em aria-label={`${stars[item.id] ?? 1} stars`}>{"★".repeat(stars[item.id] ?? 1)}</em>}
              </button>
            );
          })}
          <span className={styles.navDivider} aria-hidden="true" />
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => newChallenge(key)}
              disabled={playing}
              title={`New ${DIFFICULTIES[key].label} challenge: ${DIFFICULTIES[key].blurb}`}
              aria-current={mode === "challenge" && difficulty === key ? "step" : undefined}
              className={`${styles.levelPill} ${styles.challengePill} ${mode === "challenge" && difficulty === key ? styles.levelActive : ""}`}
            >
              {DIFFICULTIES[key].label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => newChallenge("custom")}
            disabled={playing}
            title="Custom challenge: choose the number of blocks, chips and direction"
            aria-current={mode === "challenge" && difficulty === "custom" ? "step" : undefined}
            className={`${styles.levelPill} ${styles.challengePill} ${mode === "challenge" && difficulty === "custom" ? styles.levelActive : ""}`}
          >
            Custom
          </button>
        </nav>

        {runtimeState.completed && mode === "levels" ? (
          <div className={styles.complete} role="status">
            <div>
              <h3>All levels complete!</h3>
              <p>You guided the robot through every maze. That is real programming: sequences, loops and debugging.</p>
            </div>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.headerButton} />
          </div>
        ) : (
          <p className={styles.status}>{status}</p>
        )}

        <div className={styles.workspace}>
          <div className={styles.stage}>
            <div className={styles.arenaWrap}>
            <div className={styles.arena}>
            <MazeBoard
              key={level.id}
              fit
              level={parsed}
              robot={pose}
              takenChips={taken}
              bumping={bumping}
              arrived={arrived}
              route={showRoute ? plan.route : undefined}
              label={`Maze ${level.title}. ${parsed.columns} by ${parsed.rows} tiles. ${level.goal}`}
            />
            </div>
            {atEnd && result && !runtimeState.completed && resultToast}
            </div>
            <div className={styles.stageFoot}>
              <span>
                {parsed.chips.length > 0 ? `Chips ${taken.size}/${parsed.chips.length}` : "No chips on this level"}
              </span>
              <span>Hint: {level.hint}</span>
            </div>

          </div>

          <div className={styles.panel}>
            <p className={styles.panelTitle}>Blocks</p>
            <div className={styles.palette}>
              {level.allowed.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={`${styles.paletteBlock} ${styles[`kind_${kind}`]}`}
                  onClick={() => add(kind)}
                  disabled={playing || used >= level.maxBlocks}
                >
                  <span className={styles.glyph} aria-hidden="true">{BLOCK_INFO[kind].glyph}</span>
                  {BLOCK_INFO[kind].label}
                </button>
              ))}
            </div>

            <div className={styles.programHead}>
              <p className={styles.panelTitle}>Your program</p>
              <span className={styles.count}>
                {used}/{level.maxBlocks} blocks · best {level.par}
              </span>
              <button type="button" className={styles.viewToggle} onClick={() => setCompact(!compact)} aria-pressed={compact} title={compact ? "Switch to the detailed list" : "Switch to compact chips"}>
                {compact ? "Compact" : "Detailed"}
              </button>
            </div>
            <div className={styles.programBox}>
              {program.length === 0 ? <p className={styles.empty}>Tap a block above to add it.</p> : (compact ? renderCompact(program, { n: 0 }) : renderBlocks(program))}
            </div>

            <div className={styles.controls}>
              <button type="button" className={styles.run} onClick={run} disabled={playing || program.length === 0}>
                ▶ Run
              </button>
              <button type="button" className={styles.ghost} onClick={stepOnce} disabled={playing || program.length === 0}>
                Step
              </button>
              <button type="button" className={styles.ghost} onClick={undo} disabled={playing || program.length === 0}>
                Undo
              </button>
              <button type="button" className={styles.ghost} onClick={() => edit([])} disabled={playing || program.length === 0}>
                Clear
              </button>
              <button type="button" className={styles.ghost} onClick={() => setFast(!fast)} aria-pressed={fast}>
                {fast ? "Fast" : "Normal"}
              </button>
            </div>

            <div className={styles.helpers} role="group" aria-label="Help">
              <button type="button" className={styles.helper} onClick={() => setShowRoute(!showRoute)} aria-pressed={showRoute} disabled={!plan.actions}>
                {showRoute ? "Hide route" : "Show route"}
              </button>
              <button type="button" className={styles.helper} onClick={showSolution} disabled={playing || !plan.actions} title="Loads a shortest program. Caps this level at one star.">
                Show solution
              </button>
              {mode === "challenge" && (
                <button type="button" className={styles.helper} onClick={() => newChallenge()} disabled={playing}>
                  New maze ↻
                </button>
              )}
            </div>
            {mode === "challenge" && (
              <p className={styles.challengeNote}>
                Bonus challenges are generated fresh each time and are not required. Solved this session: <strong>{challengeWins}</strong>
              </p>
            )}

            {mode === "challenge" && difficulty === "custom" && (
              <fieldset className={styles.custom} disabled={playing}>
                <legend>Custom maze</legend>
                <label className={styles.customRow}>
                  <span>Blocks in the route</span>
                  <input
                    type="range"
                    min={CUSTOM_LIMITS.minBlocks}
                    max={CUSTOM_LIMITS.maxBlocks}
                    value={custom.blocks}
                    onChange={(event) => updateCustom({ blocks: Number(event.target.value) })}
                  />
                  <output>{custom.blocks}</output>
                </label>
                <label className={styles.customRow}>
                  <span>Energy chips</span>
                  <input
                    type="range"
                    min={0}
                    max={CUSTOM_LIMITS.maxChips}
                    value={custom.chips}
                    onChange={(event) => updateCustom({ chips: Number(event.target.value) })}
                  />
                  <output>{custom.chips}</output>
                </label>
                <div className={styles.customRow} role="group" aria-label="Direction">
                  <span>Direction</span>
                  <span className={styles.seg}>
                    {([["right", "Right →"], ["left", "← Left"], ["random", "Random ⇄"]] as [Direction, string][]).map(([value, text]) => (
                      <button key={value} type="button" aria-pressed={custom.direction === value} className={custom.direction === value ? styles.segOn : ""} onClick={() => updateCustom({ direction: value })}>
                        {text}
                      </button>
                    ))}
                  </span>
                </div>
                <button type="button" className={styles.helper} onClick={() => newChallenge("custom")}>
                  Shuffle ⇄ new shape
                </button>
                {challenge.fallback && <p className={styles.customNote} role="status">That size is too big to fit well, so this is a plain corridor. Try fewer blocks.</p>}
              </fieldset>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
