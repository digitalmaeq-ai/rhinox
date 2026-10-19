"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { playChargerSound, readChargerMuted, setChargerMuted } from "@/app/components/interactive/shared/chargerSounds";
import {
  addLevel, checkProject, coinPoints, countCoins, createGame, goalNeedsAllCoins, hasAction, inBounds, paintTile, removeLevel, resizeGrid, setLives, setRules, setTitle, step,
} from "@/lib/game-creator/engine";
import { blankTemplate, mazeEscapeTemplate } from "@/lib/game-creator/template";
import {
  GRID_SIZES, MAX_LEVELS, MAX_LIVES, MAX_TITLE,
  type Direction, type GameEvent, type GameProject, type GameState, type Rule, type Tile,
} from "@/lib/game-creator/types";
import { createProject, renameProject, updateProjectData } from "@/lib/rhinocode/projects";

import GameBoard from "./GameBoard";
import { TileArt } from "./TileArt";
import styles from "./GameCreator.module.css";

const TOOLS: { tile: Tile; label: string; hint: string }[] = [
  { tile: "wall", label: "Wall", hint: "Blocks the player" },
  { tile: "floor", label: "Floor", hint: "Rubs out anything" },
  { tile: "start", label: "Start", hint: "Where the player begins" },
  { tile: "goal", label: "Goal", hint: "Where the player finishes" },
  { tile: "coin", label: "Coin", hint: "Something to collect" },
  { tile: "hazard", label: "Hazard", hint: "Danger!" },
  { tile: "key", label: "Key", hint: "Opens every door in the level" },
  { tile: "door", label: "Door", hint: "Locked until the player has a key" },
  { tile: "enemy-h", label: "Enemy ↔", hint: "Patrols side to side" },
  { tile: "enemy-v", label: "Enemy ↕", hint: "Patrols up and down" },
];

const KEYS: Record<string, Direction> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
};

const ARROWS: Record<Direction, string> = { up: "↑", down: "↓", left: "←", right: "→" };

const GUIDE = [
  "Pick a tool, then click or drag on the grid to draw your level. Every level needs one start and one goal.",
  "Add coins to collect, hazards and patrolling enemies for danger, and a key with a door to lock a part of the maze.",
  "Open the Rules panel and choose what happens: how many points a coin is worth, what a hazard or enemy does, and when the goal wins.",
  "Use the + Add level button to make a longer game. Reaching the goal takes the player to the next level.",
  "Press Play to test it. If something is wrong, the Ready box tells you what to fix. Then save it to My Projects.",
];

function sizeKey(project: GameProject): string {
  const hit = Object.entries(GRID_SIZES).find(([, size]) => size.cols === project.cols && size.rows === project.rows);
  return hit ? hit[0] : "custom";
}

function Hearts({ lives, total }: { lives: number; total: number }) {
  return (
    <span className={styles.hearts} role="img" aria-label={`${lives} of ${total} lives left`}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={i < lives ? styles.heartOn : styles.heartOff} aria-hidden="true">
          <path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11Z" />
        </svg>
      ))}
    </span>
  );
}

/** The sound that goes with what just happened. */
function soundFor(before: GameState, after: GameState) {
  if (after.status === "won") return playChargerSound("win");
  if (after.status === "lost") return playChargerSound("bump");
  if (after.level > before.level) return playChargerSound("level");
  if (after.lives < before.lives) return playChargerSound("flat");
  if (after.hasKey && !before.hasKey) return playChargerSound("charge");
  if (after.score > before.score) return playChargerSound("bolt");
  if (after.message && after.message !== before.message) return playChargerSound("hint");
}

interface GameCreatorProps {
  initial: GameProject;
  /** The My Projects id when this game was opened from there. */
  savedId: string | null;
}

// RhinoCode Game Creator: build a Maze Escape game with several levels, set its
// rules, play it, and save it to My Projects. The game is data (lib/game-creator).
export default function GameCreator({ initial, savedId: initialId }: GameCreatorProps) {
  const [project, setProject] = useState<GameProject>(initial);
  const [level, setLevel] = useState(0);
  const [tool, setTool] = useState<Tile>("wall");
  const [mode, setMode] = useState<"build" | "play">("build");
  const [game, setGame] = useState(() => createGame(initial));
  const [savedId, setSavedId] = useState<string | null>(initialId);
  const [savedJson, setSavedJson] = useState<string | null>(initialId ? JSON.stringify(initial) : null);
  const [notice, setNotice] = useState("");
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [confirm, setConfirm] = useState<"maze" | "blank" | "level" | null>(null);
  const [soundOn, setSoundOn] = useState(() => !readChargerMuted());
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChargerMuted(!soundOn);
  }, [soundOn]);

  const check = useMemo(() => checkProject(project), [project]);
  const dirty = savedJson !== JSON.stringify(project);
  const playable = check.problems.length === 0;
  const levelCount = project.levels.length;
  const safeLevel = Math.min(level, levelCount - 1);

  function edit(next: GameProject) {
    setProject(next);
    setNotice("");
  }

  function paint(x: number, y: number) {
    edit(paintTile(project, safeLevel, x, y, tool));
  }

  function onEditorKey(event: KeyboardEvent<HTMLDivElement>) {
    const dir = KEYS[event.key];
    const at = cursor ?? { x: 0, y: 0 };
    if (dir && !/^[wasdWASD]$/.test(event.key)) {
      event.preventDefault();
      const dx = dir === "left" ? -1 : dir === "right" ? 1 : 0;
      const dy = dir === "up" ? -1 : dir === "down" ? 1 : 0;
      const next = { x: at.x + dx, y: at.y + dy };
      if (inBounds(project, next.x, next.y)) setCursor(next);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      paint(at.x, at.y);
    }
  }

  function startPlaying() {
    if (!playable) return;
    setGame(createGame(project));
    setMode("play");
    setNotice("");
    boardRef.current?.focus();
  }

  function move(direction: Direction) {
    const next = step(project, game, direction);
    if (next === game) return;
    setGame(next);
    soundFor(game, next);
  }

  function onPlayKey(event: KeyboardEvent<HTMLDivElement>) {
    const dir = KEYS[event.key];
    if (!dir) return;
    event.preventDefault();
    move(dir);
  }

  function save() {
    const title = project.title.trim() || "My game";
    if (savedId) {
      updateProjectData(savedId, project);
      renameProject(savedId, title);
      setNotice("Changes saved.");
    } else {
      const created = createProject("game", title, project);
      setSavedId(created.id);
      setNotice("Saved to My Projects.");
    }
    setSavedJson(JSON.stringify(project));
  }

  function applyTemplate(which: "maze" | "blank") {
    const next = which === "maze" ? mazeEscapeTemplate() : blankTemplate();
    setProject(next);
    setLevel(0);
    setConfirm(null);
    setNotice("");
    setGame(createGame(next));
  }

  function addNewLevel() {
    if (levelCount >= MAX_LEVELS) return;
    edit(addLevel(project));
    setLevel(levelCount);
  }

  function deleteLevel() {
    edit(removeLevel(project, safeLevel));
    setLevel(Math.max(0, safeLevel - 1));
    setConfirm(null);
  }

  // ----- rule helpers -----
  function setCoinPoints(amount: number) {
    const clean = Math.min(100, Math.max(0, Math.round(amount) || 0));
    edit(setRules(project, "touch-coin", [{ when: "touch-coin", do: { type: "add-points", amount: clean } }]));
  }

  function toggleOutcome(when: GameEvent, type: "lose-life" | "go-to-start", on: boolean) {
    const wants = {
      "lose-life": type === "lose-life" ? on : hasAction(project, when, "lose-life"),
      "go-to-start": type === "go-to-start" ? on : hasAction(project, when, "go-to-start"),
    };
    const rules: Rule[] = [];
    if (wants["lose-life"]) rules.push({ when, do: { type: "lose-life" } });
    if (wants["go-to-start"]) rules.push({ when, do: { type: "go-to-start" } });
    edit(setRules(project, when, rules));
  }

  function setGoalRule(needsCoins: boolean) {
    edit(setRules(project, "reach-goal", [{ when: "reach-goal", ...(needsCoins ? { requires: "all-coins" as const } : {}), do: { type: "win" } }]));
  }

  const playing = mode === "play";
  const levelCoins = countCoins(project, playing ? game.level : safeLevel);
  const collectedCoins = game.collected.filter((spot) => {
    const [x, y] = spot.split(",").map(Number);
    return project.levels[game.level][y]?.[x] === "c";
  }).length;

  function outcomes(when: GameEvent, legend: string) {
    return (
      <fieldset className={styles.fieldset}>
        <legend>{legend}</legend>
        <label><input type="checkbox" checked={hasAction(project, when, "lose-life")} onChange={(event) => toggleOutcome(when, "lose-life", event.target.checked)} /> Lose a life</label>
        <label><input type="checkbox" checked={hasAction(project, when, "go-to-start")} onChange={(event) => toggleOutcome(when, "go-to-start", event.target.checked)} /> Go back to the start</label>
      </fieldset>
    );
  }

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.wrap}`}>
        <header className={styles.bar}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/coding-robotics">RhinoCode</Link>
            <span aria-hidden="true">/</span>
            <h1>RhinoCode Game Creator</h1>
          </nav>
          <div className={styles.links}>
            <button type="button" className={styles.soundButton} aria-pressed={soundOn} onClick={() => setSoundOn(!soundOn)}>
              {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
            </button>
            <Link href="/coding-robotics/my-projects">My Projects</Link>
            <Link href="/coding-robotics/challenges">Game Challenges</Link>
          </div>
        </header>

        <details className={styles.guide}>
          <summary>How to make a game</summary>
          <ol>{GUIDE.map((text) => <li key={text}>{text}</li>)}</ol>
        </details>

        <div className={styles.toolbar}>
          <div className={styles.modes} role="group" aria-label="Mode">
            <button type="button" aria-pressed={!playing} className={!playing ? styles.modeOn : ""} onClick={() => setMode("build")}>Build</button>
            <button type="button" aria-pressed={playing} className={playing ? styles.modeOn : ""} onClick={startPlaying} disabled={!playable} title={playable ? "" : "Fix the problems first"}>Play</button>
          </div>
          <label className={styles.titleField}>
            <span className={styles.srOnly}>Game title</span>
            <input value={project.title} maxLength={MAX_TITLE} onChange={(event) => edit(setTitle(project, event.target.value))} placeholder="Name your game" />
          </label>
          <div className={styles.saveGroup}>
            <button type="button" className={styles.primary} onClick={save} disabled={!dirty && savedId !== null}>
              {savedId ? "Save changes" : "Save to My Projects"}
            </button>
            <span className={styles.status} role="status" aria-live="polite">
              {notice || (dirty ? "Unsaved changes" : savedId ? "All changes saved" : "")}
            </span>
          </div>
        </div>

        <div className={styles.layout}>
          <section className={styles.stage} aria-label={playing ? "Game" : "Level editor"}>
            {!playing ? (
              <div className={styles.levelTabs} role="group" aria-label="Levels">
                {project.levels.map((_, i) => (
                  <button key={i} type="button" aria-pressed={i === safeLevel} className={i === safeLevel ? styles.levelOn : ""} onClick={() => { setLevel(i); setConfirm(null); }}>
                    Level {i + 1}
                  </button>
                ))}
                <button type="button" className={styles.addLevel} onClick={addNewLevel} disabled={levelCount >= MAX_LEVELS} title={levelCount >= MAX_LEVELS ? `A game can have up to ${MAX_LEVELS} levels` : ""}>
                  + Add level
                </button>
              </div>
            ) : null}

            <div className={styles.hud} aria-live="off">
              {playing ? (
                <>
                  <Hearts lives={game.lives} total={project.lives} />
                  <span>Level <b>{game.level + 1}/{levelCount}</b></span>
                  <span>Score <b>{game.score}</b></span>
                  <span>Coins <b>{collectedCoins}/{levelCoins}</b></span>
                  {game.hasKey ? <span className={styles.keyBadge}>🔑 Key</span> : null}
                  <span>Moves <b>{game.moves}</b></span>
                </>
              ) : (
                <span className={styles.helper}>Pick a tool, then click or drag on the grid. With the keyboard, use the arrow keys and press Space.</span>
              )}
            </div>

            <div
              ref={boardRef}
              className={styles.boardFrame}
              tabIndex={0}
              role="application"
              aria-label={playing ? "Game board. Use the arrow keys or W A S D to move." : "Level editor. Arrow keys move the cursor, Space paints."}
              onKeyDown={playing ? onPlayKey : onEditorKey}
              onFocus={() => { if (!playing && !cursor) setCursor({ x: 0, y: 0 }); }}
              onBlur={() => setCursor(null)}
            >
              <GameBoard project={project} level={safeLevel} game={playing ? game : undefined} onPaint={playing ? undefined : paint} cursor={playing ? null : cursor} />
              {playing && game.message && game.status === "playing" ? <p className={styles.toast} role="status">{game.message}</p> : null}
              {playing && game.status !== "playing" ? (
                <div className={styles.overlay} role="dialog" aria-modal="false" aria-label={game.status === "won" ? "You escaped" : "Game over"}>
                  <h2>{game.status === "won" ? (levelCount > 1 ? "You beat every level!" : "You escaped!") : "Out of lives"}</h2>
                  <p>
                    {game.status === "won"
                      ? `Score ${game.score}, ${game.moves} moves, ${game.lives} ${game.lives === 1 ? "life" : "lives"} left.`
                      : `You reached level ${game.level + 1}. Try a different route, or make the game a little easier.`}
                  </p>
                  <div className={styles.overlayActions}>
                    <button type="button" className={styles.primary} onClick={startPlaying}>Play again</button>
                    <button type="button" onClick={() => setMode("build")}>Keep editing</button>
                  </div>
                </div>
              ) : null}
            </div>

            {playing ? (
              <div className={styles.dpad} role="group" aria-label="On-screen controls">
                {(["up", "left", "down", "right"] as Direction[]).map((dir) => (
                  <button key={dir} type="button" className={styles[`dpad_${dir}`]} onClick={() => move(dir)} aria-label={`Move ${dir}`}>{ARROWS[dir]}</button>
                ))}
              </div>
            ) : (
              <>
                <div className={styles.palette} role="group" aria-label="Tools">
                  {TOOLS.map((item) => (
                    <button key={item.tile} type="button" aria-pressed={tool === item.tile} className={tool === item.tile ? styles.toolOn : ""} onClick={() => setTool(item.tile)} title={item.hint}>
                      <span className={`${styles.swatch} ${styles[`tile_${item.tile === "key" || item.tile === "door" || item.tile === "enemy-h" || item.tile === "enemy-v" ? "coin" : item.tile}`]}`}><TileArt tile={item.tile} /></span>
                      {item.label}
                    </button>
                  ))}
                </div>
                {levelCount > 1 ? (
                  <div className={styles.removeLevel}>
                    {confirm === "level" ? (
                      <span role="alertdialog" aria-label={`Remove level ${safeLevel + 1}?`}>
                        Remove level {safeLevel + 1} for good?{" "}
                        <button type="button" className={styles.danger} onClick={deleteLevel}>Remove</button>{" "}
                        <button type="button" onClick={() => setConfirm(null)}>Keep it</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => setConfirm("level")}>Remove level {safeLevel + 1}</button>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </section>

          <aside className={styles.side} aria-label="Game settings">
            <section className={styles.card} aria-label="Is it ready?">
              <h2>{playable ? "Ready to play" : "Not ready yet"}</h2>
              {check.problems.length > 0 ? (
                <ul className={styles.problems}>{check.problems.map((text) => <li key={text}>{text}</li>)}</ul>
              ) : (
                <p className={styles.okText}>Every level has a way to win.</p>
              )}
              {check.tips.length > 0 ? <ul className={styles.tips}>{check.tips.map((text) => <li key={text}>{text}</li>)}</ul> : null}
              {!playing && playable ? <button type="button" className={styles.primary} onClick={startPlaying}>Play my game</button> : null}
            </section>

            <section className={styles.card} aria-label="Rules" hidden={playing}>
              <h2>Rules</h2>
              <p className={styles.helper}>Choose what happens in your game. Rules apply to every level.</p>

              <label className={styles.field}>
                <span>When you touch a coin, score</span>
                <input type="number" min={0} max={100} step={5} value={coinPoints(project)} onChange={(event) => setCoinPoints(Number(event.target.value))} />
                <span>points</span>
              </label>

              {outcomes("touch-hazard", "When you touch a hazard")}
              {outcomes("touch-enemy", "When an enemy catches you")}

              <fieldset className={styles.fieldset}>
                <legend>When you reach the goal</legend>
                <label><input type="radio" name="goal-rule" checked={!goalNeedsAllCoins(project)} onChange={() => setGoalRule(false)} /> You win straight away</label>
                <label><input type="radio" name="goal-rule" checked={goalNeedsAllCoins(project)} onChange={() => setGoalRule(true)} /> You win only after collecting every coin</label>
              </fieldset>

              <label className={styles.field}>
                <span>Lives</span>
                <select value={project.lives} onChange={(event) => edit(setLives(project, Number(event.target.value)))}>
                  {Array.from({ length: MAX_LIVES }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </section>

            <section className={styles.card} aria-label="Game" hidden={playing}>
              <h2>Game</h2>
              <label className={styles.field}>
                <span>Size</span>
                <select
                  value={sizeKey(project)}
                  onChange={(event) => {
                    const size = GRID_SIZES[event.target.value as keyof typeof GRID_SIZES];
                    if (size) edit(resizeGrid(project, size.cols, size.rows));
                  }}
                >
                  {Object.entries(GRID_SIZES).map(([id, size]) => <option key={id} value={id}>{size.label}</option>)}
                  {sizeKey(project) === "custom" ? <option value="custom">{project.cols} × {project.rows}</option> : null}
                </select>
              </label>
              <p className={styles.helper}>The size applies to every level. A bigger size keeps what you drew and adds empty floor.</p>

              <div className={styles.templates}>
                <span>Start again from</span>
                {confirm === "maze" || confirm === "blank" ? (
                  <div className={styles.confirm} role="alertdialog" aria-label="Replace your game?">
                    <span>This replaces your whole game.</span>
                    <button type="button" className={styles.danger} onClick={() => applyTemplate(confirm)}>Replace</button>
                    <button type="button" onClick={() => setConfirm(null)}>Keep mine</button>
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => setConfirm("maze")}>Maze Escape template</button>
                    <button type="button" onClick={() => setConfirm("blank")}>Blank arena</button>
                  </>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
