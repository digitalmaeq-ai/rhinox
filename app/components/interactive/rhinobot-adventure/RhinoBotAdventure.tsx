"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

import { getChallenge, type Challenge } from "@/lib/rhinobot-adventure/challenges";
import { ENERGY_VALLEY_001 } from "@/lib/rhinobot-adventure/levels";
import { createState, formatTime, scoreFor, type AdventureState } from "@/lib/rhinobot-adventure/state";
import { TUNING } from "@/lib/rhinobot-adventure/tuning";
import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { playChargerSound, readChargerMuted, setChargerMuted } from "@/app/components/interactive/shared/chargerSounds";

import styles from "./RhinoBotAdventure.module.css";
import type { GameController, GameEvent, InputState } from "./types";

// RhinoBot STEM Adventure — Milestone 1 (World 1: The Energy Valley, Mission 001).
// This React shell owns everything that is not the game world: the HUD, menus,
// the challenge dialog, touch and keyboard input, pause and the victory screen.
// The Phaser engine (createGame.ts) is imported dynamically in an effect, so
// nothing from Phaser ever runs during server rendering.
//
// Runtime tasks (one each, all required): collect-crystals, bridge-challenge,
// reach-station.

type Phase = "intro" | "playing" | "paused" | "challenge" | "won";

const LEVEL = ENERGY_VALLEY_001;
const OPTION_LETTERS = ["A", "B", "C", "D"];

function Bolt({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={filled ? styles.cellOn : styles.cellOff}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  );
}

function Gem({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={filled ? styles.gemOn : styles.gemOff}>
      <path d="M12 2 21 10 12 22 3 10z" />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars} aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <i key={n} className={n <= count ? styles.starOn : styles.starOff} aria-hidden="true">★</i>
      ))}
    </span>
  );
}

export default function RhinoBotAdventure({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<GameController | null>(null);
  const inputRef = useRef<InputState>({ left: false, right: false, jump: false });
  const mutedRef = useRef(false);
  const phaseRef = useRef<Phase>("intro");
  const toastTimer = useRef<number | undefined>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [phase, setPhaseState] = useState<Phase>("intro");
  const [engine, setEngine] = useState<"loading" | "ready" | "error">("loading");
  const [hud, setHud] = useState<AdventureState>(() => createState());
  const [message, setMessage] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solvedIndex, setSolvedIndex] = useState<number | null>(null);
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [loadAttempt, setLoadAttempt] = useState(0);

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const clearInput = useCallback(() => {
    inputRef.current.left = false;
    inputRef.current.right = false;
    inputRef.current.jump = false;
    setPressed({});
  }, []);

  const say = useCallback((text: string) => {
    setMessage(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setMessage(""), 2800);
  }, []);

  /* ------------------------------ engine ------------------------------- */

  useEffect(() => {
    let cancelled = false;
    let created: GameController | null = null;
    const host = hostRef.current;
    if (!host) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onEvent = (event: GameEvent) => {
      switch (event.type) {
        case "state":
          setHud(event.state);
          break;
        case "sfx":
          if (!mutedRef.current) playChargerSound(event.name);
          break;
        case "announce":
          say(event.message);
          break;
        case "station-locked":
          say(
            event.have < event.need
              ? `The research station needs ${event.need} crystals. You have ${event.have}.`
              : "The bridge to the station is still locked. Solve the challenge first.",
          );
          break;
        case "challenge": {
          const found = getChallenge(event.challengeId);
          if (!found) break;
          inputRef.current.left = false;
          inputRef.current.right = false;
          inputRef.current.jump = false;
          setChallenge(found);
          setWrong([]);
          setSolvedIndex(null);
          setPhase("challenge");
          created?.setPaused(true);
          break;
        }
        case "won":
          setHud(event.state);
          setPhase("won");
          break;
      }
    };

    import("./createGame")
      .then(({ createGame }) => {
        if (cancelled) return;
        created = createGame(host, { level: LEVEL, input: inputRef.current, reducedMotion, startPaused: true, emit: onEvent });
        controllerRef.current = created;
        mutedRef.current = readChargerMuted();
        setSoundOn(!mutedRef.current);
        setEngine("ready");
      })
      .catch(() => {
        if (!cancelled) setEngine("error");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(toastTimer.current);
      created?.destroy();
      controllerRef.current = null;
      host.replaceChildren();
    };
  }, [loadAttempt, say, setPhase]);

  /* ------------------------------ progress ----------------------------- */

  const done = (id: string) => runtimeState.completedTasks.includes(id);
  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);

  useEffect(() => {
    if (hud.crystals.length >= LEVEL.crystalsNeeded && !done("collect-crystals")) actions.completeTask("collect-crystals", 30);
    if (hud.challengeSolved && !done("bridge-challenge")) actions.completeTask("bridge-challenge", 30);
    if (hud.status === "won" && !done("reach-station")) actions.completeTask("reach-station", 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hud.crystals.length, hud.challengeSolved, hud.status]);

  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) actions.completeExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  /* ------------------------------- flow -------------------------------- */

  const focusShell = useCallback(() => shellRef.current?.focus({ preventScroll: true }), []);

  const pause = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    clearInput();
    setPhase("paused");
    controllerRef.current?.setPaused(true);
  }, [clearInput, setPhase]);

  const resume = useCallback(() => {
    if (phaseRef.current !== "paused" && phaseRef.current !== "intro") return;
    setPhase("playing");
    controllerRef.current?.setPaused(false);
    focusShell();
  }, [focusShell, setPhase]);

  const restart = useCallback(() => {
    clearInput();
    setHud(createState());
    setMessage("");
    setChallenge(null);
    setPhase("playing");
    controllerRef.current?.restart();
    focusShell();
  }, [clearInput, focusShell, setPhase]);

  function handleReset() {
    actions.resetExperience();
    clearInput();
    setHud(createState());
    setMessage("");
    setChallenge(null);
    setPhase("intro");
    controllerRef.current?.restart();
    controllerRef.current?.setPaused(true);
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    mutedRef.current = !next;
    setChargerMuted(!next);
    if (next) playChargerSound("pick");
  }

  function chooseAnswer(index: number) {
    if (!challenge || solvedIndex !== null || wrong.includes(index)) return;
    if (index === challenge.correctIndex) {
      setSolvedIndex(index);
      controllerRef.current?.resolveChallenge(true);
    } else {
      setWrong((list) => [...list, index]);
      controllerRef.current?.resolveChallenge(false);
    }
  }

  function closeChallenge() {
    if (solvedIndex === null) controllerRef.current?.dismissChallenge();
    setPhase("playing");
    controllerRef.current?.setPaused(false);
    focusShell();
  }

  /* ------------------------------- input ------------------------------- */

  function keyTarget(key: string): keyof InputState | null {
    if (key === "ArrowLeft" || key === "a" || key === "A") return "left";
    if (key === "ArrowRight" || key === "d" || key === "D") return "right";
    if (key === " " || key === "Spacebar" || key === "ArrowUp" || key === "w" || key === "W") return "jump";
    return null;
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      if (phaseRef.current === "playing") pause();
      else if (phaseRef.current === "paused") resume();
      else if (phaseRef.current === "challenge") closeChallenge();
      else return;
      event.preventDefault();
      return;
    }
    if (phaseRef.current === "challenge" && event.key === "Tab") {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (phaseRef.current !== "playing") return;
    const target = keyTarget(event.key);
    if (!target) return;
    event.preventDefault();
    inputRef.current[target] = true;
  }

  function onKeyUp(event: ReactKeyboardEvent<HTMLDivElement>) {
    const target = keyTarget(event.key);
    if (!target) return;
    if (phaseRef.current === "playing") event.preventDefault();
    inputRef.current[target] = false;
  }

  function onShellBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget && shellRef.current?.contains(event.relatedTarget as Node)) return;
    clearInput();
    if (phaseRef.current === "playing") pause();
  }

  useEffect(() => {
    const onHidden = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [pause]);

  useEffect(() => {
    if (phase === "challenge") dialogRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();
  }, [phase, challenge]);

  function hold(key: keyof InputState) {
    return {
      onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (phaseRef.current !== "playing") return;
        event.currentTarget.setPointerCapture(event.pointerId);
        inputRef.current[key] = true;
        setPressed((state) => ({ ...state, [key]: true }));
      },
      onPointerUp: () => { inputRef.current[key] = false; setPressed((state) => ({ ...state, [key]: false })); },
      onPointerCancel: () => { inputRef.current[key] = false; setPressed((state) => ({ ...state, [key]: false })); },
      onLostPointerCapture: () => { inputRef.current[key] = false; setPressed((state) => ({ ...state, [key]: false })); },
      onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
    };
  }

  /* ------------------------------ rendering ---------------------------- */

  const score = scoreFor(hud);
  const livePoints = score.crystalPoints + score.challengePoints;
  const solved = solvedIndex !== null;

  return (
    <section className={styles.root} aria-label={LEVEL.title}>
      <div
        ref={shellRef}
        className={styles.shell}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={onShellBlur}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{LEVEL.world}</p>
            <h2 className={styles.title}>{LEVEL.title}</h2>
          </div>
          <ActivityHeaderButtons onReset={handleReset} buttonClassName={styles.headerButton} />
        </header>

        <div className={styles.hud} aria-label="Game status">
          <div className={styles.stat} aria-label={`Energy: ${hud.health} of ${TUNING.maxHealth} cells`}>
            <span className={styles.statLabel}>Energy</span>
            <span className={styles.icons}>{Array.from({ length: TUNING.maxHealth }, (_, i) => <Bolt key={i} filled={i < hud.health} />)}</span>
          </div>
          <div className={styles.stat} aria-label={`Crystals: ${hud.crystals.length} of ${LEVEL.crystalsNeeded}`}>
            <span className={styles.statLabel}>Crystals</span>
            <span className={styles.icons}>{Array.from({ length: LEVEL.crystalsNeeded }, (_, i) => <Gem key={i} filled={i < hud.crystals.length} />)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Score</span>
            <strong className={styles.statValue}>{livePoints}</strong>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Time</span>
            <strong className={styles.statValue}>{formatTime(hud.elapsedMs)}</strong>
          </div>
          <span className={styles.spacer} />
          <button type="button" className={styles.hudButton} onClick={pause} disabled={phase !== "playing"} aria-label="Pause game">⏸ Pause</button>
          <button type="button" className={styles.hudButton} onClick={toggleSound} aria-pressed={soundOn}>{soundOn ? "🔊" : "🔇"}<span className={styles.srOnly}> Sound {soundOn ? "on" : "off"}</span></button>
          <button type="button" className={styles.hudButton} onClick={restart} disabled={phase === "intro" || phase === "challenge"}>↻ Restart</button>
        </div>

        <div className={styles.stage}>
          <div
            ref={hostRef}
            className={styles.canvasHost}
            role="img"
            aria-label="Game view. RhinoBot, a blue robot with an orange horn, runs through a sunny valley of wind turbines. Use the keyboard or the on-screen buttons to play."
          />

          {engine === "loading" && <div className={styles.cover}><p>Loading the Energy Valley…</p></div>}
          {engine === "error" && (
            <div className={styles.cover}>
              <p>The game could not start on this device.</p>
              <button type="button" className="rx-button rx-button-primary" onClick={() => { setEngine("loading"); setLoadAttempt((n) => n + 1); }}>Try again</button>
            </div>
          )}

          {message && phase === "playing" && <p className={styles.toast} role="status">{message}</p>}

          {engine === "ready" && phase === "intro" && (
            <div className={styles.overlay}>
              <div className={styles.panel}>
                <p className={styles.panelEyebrow}>Mission briefing</p>
                <h3 className={styles.panelTitle}>{LEVEL.objective}</h3>
                <p className={styles.panelText}>Watch out for high voltage, and solve the maths challenge to power the locked bridge.</p>
                <ul className={styles.keys} aria-label="Controls">
                  <li><kbd>A</kbd> <kbd>D</kbd> or <kbd>←</kbd> <kbd>→</kbd> move</li>
                  <li><kbd>Space</kbd> jump (hold for higher)</li>
                  <li><kbd>Esc</kbd> pause</li>
                </ul>
                <button type="button" className={`rx-button rx-button-primary ${styles.bigButton}`} onClick={resume} autoFocus>▶ Start mission</button>
              </div>
            </div>
          )}

          {phase === "paused" && (
            <div className={styles.overlay}>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Paused</h3>
                <div className={styles.panelButtons}>
                  <button type="button" className={`rx-button rx-button-primary ${styles.bigButton}`} onClick={resume} autoFocus>▶ Resume</button>
                  <button type="button" className="rx-button rx-button-secondary" onClick={restart}>↻ Restart mission</button>
                </div>
                <p className={styles.panelHint}>Press Esc to resume.</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.touch} role="group" aria-label="Touch controls">
          <div className={styles.dpad}>
            <button type="button" className={`${styles.padButton} ${pressed.left ? styles.padActive : ""}`} aria-label="Move left" {...hold("left")}>◀</button>
            <button type="button" className={`${styles.padButton} ${pressed.right ? styles.padActive : ""}`} aria-label="Move right" {...hold("right")}>▶</button>
          </div>
          <button type="button" className={`${styles.padButton} ${styles.jumpButton} ${pressed.jump ? styles.padActive : ""}`} aria-label="Jump" {...hold("jump")}>▲ Jump</button>
        </div>

        <p className={styles.rotate}>Tip: turn your device sideways for a bigger view.</p>

        <p className={styles.srOnly} aria-live="polite">{message}</p>

        {phase === "challenge" && challenge && (
          <div className={styles.modalBackdrop}>
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="adv-challenge-title" className={styles.modal}>
              <p className={styles.panelEyebrow}>Locked bridge · {challenge.curriculum.subject}</p>
              <h3 id="adv-challenge-title" className={styles.modalTitle}>{challenge.title}</h3>
              <p className={styles.panelText}>{challenge.scene}</p>
              <p className={styles.question}>{challenge.prompt}</p>
              <div className={styles.options} role="group" aria-label="Answers">
                {challenge.options.map((option, index) => {
                  const isWrong = wrong.includes(index);
                  const isRight = solvedIndex === index;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`${styles.option} ${isWrong ? styles.optionWrong : ""} ${isRight ? styles.optionRight : ""}`}
                      onClick={() => chooseAnswer(index)}
                      disabled={isWrong || (solved && !isRight)}
                      aria-label={`${OPTION_LETTERS[index]}: ${option}${isWrong ? ", not correct" : ""}${isRight ? ", correct" : ""}`}
                    >
                      <b>{OPTION_LETTERS[index]}</b> {option}
                    </button>
                  );
                })}
              </div>
              <p className={`${styles.feedback} ${solved ? styles.feedbackGood : wrong.length ? styles.feedbackTry : ""}`} role="status">
                {solved ? `Correct! ${challenge.explanation}` : wrong.length ? `Not quite. ${challenge.hint}` : "Choose the answer that powers the bridge."}
              </p>
              <div className={styles.panelButtons}>
                {solved ? (
                  <button type="button" className={`rx-button rx-button-primary ${styles.bigButton}`} onClick={closeChallenge}>⚡ Power the bridge</button>
                ) : (
                  <button type="button" className="rx-button rx-button-secondary" onClick={closeChallenge}>Not now (Esc)</button>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === "won" && (
          <div className={styles.modalBackdrop}>
            <div role="dialog" aria-modal="true" aria-labelledby="adv-win-title" className={styles.modal}>
              <p className={styles.panelEyebrow}>Mission complete</p>
              <h3 id="adv-win-title" className={styles.modalTitle}>Research station reached!</h3>
              <Stars count={score.stars} />
              <p className={styles.panelText}>RhinoBot powered the bridge, collected every energy crystal and reached the research station in {formatTime(hud.elapsedMs)}.</p>
              <ul className={styles.breakdown} aria-label="Score breakdown">
                <li><span>Energy crystals ({hud.crystals.length} × 100)</span><b>{score.crystalPoints}</b></li>
                <li><span>Bridge challenge{hud.challengeMistakes > 0 ? ` (${hud.challengeMistakes} wrong ${hud.challengeMistakes === 1 ? "answer" : "answers"})` : " (first try)"}</span><b>{score.challengePoints}</b></li>
                <li><span>Energy left ({hud.health} × 50)</span><b>{score.energyPoints}</b></li>
                <li className={styles.total}><span>Total</span><b>{score.total}</b></li>
              </ul>
              <p className={styles.panelHint}>Stars: finish the mission, solve the challenge first time, and never run out of energy.</p>
              <CompletionActions onTryAgain={restart} buttonClassName={styles.headerButton} />
            </div>
          </div>
        )}
      </div>

      <div className={styles.help}>
        <section aria-label="How to play">
          <h3>How to play</h3>
          <ul>
            <li><b>Move:</b> A / D or the arrow keys. On a phone or tablet, use the ◀ ▶ buttons.</li>
            <li><b>Jump:</b> Space or the Jump button. Tap for a short hop, hold for a high jump.</li>
            <li><b>Pause:</b> Esc or the Pause button.</li>
            <li><b>Goal:</b> collect {LEVEL.crystalsNeeded} energy crystals, power the bridge, then reach the research station.</li>
          </ul>
        </section>
        <section aria-label="What you learn">
          <h3>What you learn</h3>
          <ul>
            {experience.learningObjectives?.map((objective) => <li key={objective}>{objective}</li>)}
          </ul>
        </section>
      </div>
    </section>
  );
}
