"use client";

import { useEffect, useRef, useState } from "react";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveAsset } from "@/types/interactive-assets";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import { useDragSelect } from "@/app/components/interactive/shared/useDragSelect";
import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { playSequenceSound, readSequenceMuted, setSequenceMuted } from "@/app/components/interactive/shared/sequenceSounds";

import styles from "./ShapeRoundsRenderer.module.css";
import { ShapeArt, shapeName } from "./ShapeVisuals";

// Round-based shapes game for the "2d" runtime (component: "shape-rounds").
// Each round is either:
//   - "sort": drag (or tap) each shape into the group it belongs to;
//   - "quiz": a short run of questions, answered by tapping an option.
// Content contract: see content/experiences/shapes-and-sides.ts. The runtime
// only remembers which round tasks ("round-N") are complete; everything else
// (stars, streak, hints) is local to this component.

interface Round {
  number: number;
  title: string;
  mode: "sort" | "quiz";
  zones: InteractiveAsset[];
  shapes: InteractiveAsset[];
  questions: InteractiveAsset[];
}

function num(asset: InteractiveAsset, key: string) {
  const value = asset.properties?.[key];
  return typeof value === "number" ? value : undefined;
}

function str(asset: InteractiveAsset, key: string) {
  const value = asset.properties?.[key];
  return typeof value === "string" ? value : "";
}

function starsFor(mistakes: number, hintUsed: boolean) {
  const base = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  return hintUsed ? Math.min(base, 2) : base;
}

const ZONE_TONES = [
  { color: "#2f6fde", tint: "#eef4ff", border: "#b3cbf6" },
  { color: "#df4f93", tint: "#fff1f7", border: "#f4bad5" },
  { color: "#12a383", tint: "#ebfaf5", border: "#a6e3d2" },
  { color: "#e8900c", tint: "#fff6e8", border: "#f4d19b" },
];

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
  const colors = ["#2f6fde", "#df4f93", "#f59e0b", "#12a383", "#ef4444", "#06b6d4"];
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

export default function ShapeRoundsRenderer({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const assets = (experience.assets ?? []).filter((asset) => asset.visible !== false);

  const rounds: Round[] = assets
    .filter((asset) => asset.type === "environment" && num(asset, "round") !== undefined)
    .map((asset) => {
      const number = num(asset, "round") as number;
      const here = assets.filter((other) => num(other, "round") === number && other.type !== "environment");
      return {
        number,
        title: str(asset, "title") || `Round ${number}`,
        mode: str(asset, "mode") === "quiz" ? ("quiz" as const) : ("sort" as const),
        zones: here.filter((other) => other.type === "container"),
        shapes: here.filter((other) => other.type === "object" && str(other, "correctZone") !== ""),
        questions: here.filter((other) => other.type === "object" && str(other, "q") !== ""),
      };
    })
    .sort((a, b) => a.number - b.number);

  const [roundIndex, setRoundIndex] = useState(0);
  const round = rounds[Math.min(roundIndex, rounds.length - 1)];

  const [placed, setPlaced] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState<Record<number, number>>({});
  const [answered, setAnswered] = useState<string | null>(null);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<Record<number, number>>({});
  const [hintUsed, setHintUsed] = useState<Record<number, boolean>>({});
  const [hintText, setHintText] = useState<string | null>(null);
  const [stars, setStars] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [justDone, setJustDone] = useState<number | null>(null);
  const [message, setMessage] = useState<{ kind: "correct" | "incorrect"; text: string; key: number } | null>(null);
  const [landing, setLanding] = useState<{ shapeId: string; zoneId: string; key: number } | null>(null);
  const [rejection, setRejection] = useState<{ shapeId: string; key: number } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const counter = useRef(0);
  const trayRef = useRef<HTMLDivElement>(null);

  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);
  const roundDone = (number: number) => runtimeState.completedTasks.includes(`round-${number}`);

  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) {
      actions.completeExperience();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  useEffect(() => {
    const off = readSequenceMuted();
    setSequenceMuted(off);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (off) setSoundOn(false);
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSequenceMuted(!next);
    if (next) playSequenceSound("pick");
  }

  const doneHere = round ? roundDone(round.number) : false;
  const placedHere = round ? round.shapes.filter((shape) => doneHere || placed.includes(shape.id)) : [];
  const trayShapes = round ? round.shapes.filter((shape) => !placedHere.includes(shape)) : [];

  const dragSelect = useDragSelect({
    targetAttribute: "data-drop-zone-id",
    itemAttribute: "data-object-id",
    trayRef,
    onDrop: attemptSort,
    canPickUp: (id) => !placed.includes(id),
  });
  const { pointerDrag, selectedItemId, hoverTargetId } = dragSelect;

  function say(kind: "correct" | "incorrect", text: string) {
    counter.current += 1;
    setMessage({ kind, text, key: counter.current });
  }

  function finishRound(finished: Round, mistakeCount: number) {
    const earned = starsFor(mistakeCount, Boolean(hintUsed[finished.number]));
    setStars((current) => ({ ...current, [finished.number]: earned }));
    const task = tasks.find((item) => item.id === `round-${finished.number}`);
    actions.completeTask(`round-${finished.number}`, task?.points ?? 0);
    const lastOne = rounds.every((item) => item.number === finished.number || roundDone(item.number));
    playSequenceSound(lastOne ? "win" : "round");
    setJustDone(finished.number);
    setHintText(null);
  }

  function attemptSort(shapeId: string, zoneId: string | null) {
    if (!round || round.mode !== "sort" || doneHere) return;
    if (!zoneId || placed.includes(shapeId)) return;
    const shape = round.shapes.find((item) => item.id === shapeId);
    if (!shape) return;

    if (str(shape, "correctZone") === zoneId) {
      const nextPlaced = [...placed, shapeId];
      setPlaced(nextPlaced);
      counter.current += 1;
      setLanding({ shapeId, zoneId, key: counter.current });
      setHintText(null);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((best) => Math.max(best, nextStreak));
      say("correct", nextStreak >= 3 ? `Great sorting! ${nextStreak} in a row.` : "Good sorting! You counted the sides correctly.");
      if (round.shapes.every((item) => nextPlaced.includes(item.id))) {
        finishRound(round, mistakes[round.number] ?? 0);
      } else {
        playSequenceSound("good");
      }
    } else {
      setMistakes((current) => ({ ...current, [round.number]: (current[round.number] ?? 0) + 1 }));
      setStreak(0);
      counter.current += 1;
      setRejection({ shapeId, key: counter.current });
      say("incorrect", "Try again. Count the straight sides carefully.");
      playSequenceSound("bad");
    }
    dragSelect.clearSelection();
  }

  // ---------- Quiz rounds ----------
  const currentQuestionIndex = round ? Math.min(quizIndex[round.number] ?? 0, Math.max(round.questions.length - 1, 0)) : 0;
  const question = round && round.mode === "quiz" ? round.questions[currentQuestionIndex] : undefined;

  function chooseOption(option: string) {
    if (!round || !question || doneHere || answered) return;
    if (option === str(question, "answer")) {
      setAnswered(question.id);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((best) => Math.max(best, nextStreak));
      say("correct", str(question, "explain") || "Correct!");
      setHintText(null);
      playSequenceSound("good");
    } else {
      setWrongOptions((current) => [...current, `${question.id}:${option}`]);
      setMistakes((current) => ({ ...current, [round.number]: (current[round.number] ?? 0) + 1 }));
      setStreak(0);
      say("incorrect", "Not quite. Look again, or press Hint.");
      playSequenceSound("bad");
    }
  }

  function nextQuestion() {
    if (!round || !question) return;
    const last = currentQuestionIndex >= round.questions.length - 1;
    setAnswered(null);
    setMessage(null);
    if (last) {
      finishRound(round, mistakes[round.number] ?? 0);
    } else {
      setQuizIndex((current) => ({ ...current, [round.number]: currentQuestionIndex + 1 }));
    }
  }

  // ---------- Hint ----------
  function showHint() {
    if (!round || doneHere) return;
    if (round.mode === "quiz" && question) {
      setHintText(`Hint: ${str(question, "hint")}`);
    } else {
      const target = trayShapes.find((shape) => shape.id === selectedItemId) ?? trayShapes[0];
      if (!target) return;
      const zone = round.zones.find((item) => item.id === str(target, "correctZone"));
      setHintText(`Hint: count the sides of the ${target.label.toLowerCase()}. It belongs in "${zone?.label ?? "its group"}".`);
    }
    setHintUsed((current) => ({ ...current, [round.number]: true }));
    playSequenceSound("hint");
  }

  function goToRound(index: number) {
    setRoundIndex(index);
    setJustDone(null);
    setHintText(null);
    setMessage(null);
    setAnswered(null);
    dragSelect.clearSelection();
  }

  function handleReset() {
    actions.resetExperience();
    dragSelect.reset();
    setRoundIndex(0);
    setPlaced([]);
    setQuizIndex({});
    setAnswered(null);
    setWrongOptions([]);
    setMistakes({});
    setHintUsed({});
    setHintText(null);
    setStars({});
    setStreak(0);
    setBestStreak(0);
    setJustDone(null);
    setMessage(null);
    setLanding(null);
    setRejection(null);
  }

  if (!round) return null;

  const draggingShape = pointerDrag?.isDragging ? round.shapes.find((item) => item.id === pointerDrag.itemId) : undefined;
  const selectedShape = selectedItemId ? round.shapes.find((item) => item.id === selectedItemId) : undefined;
  const isArmed = Boolean(selectedItemId) && !doneHere;
  const nextIndex = roundIndex + 1 < rounds.length ? roundIndex + 1 : null;
  const totalStars = Object.values(stars).reduce((sum, n) => sum + n, 0);
  const totalMistakes = Object.values(mistakes).reduce((sum, n) => sum + n, 0);
  const showToast = justDone === round.number && doneHere && !runtimeState.completed;
  const total = round.mode === "sort" ? round.shapes.length : round.questions.length;
  const progressNow = round.mode === "sort" ? placedHere.length : doneHere ? total : currentQuestionIndex + (answered ? 1 : 0);

  const options = question ? str(question, "options").split("|") : [];
  const optionShapes = question ? question.properties?.optionShapes === true : false;

  return (
    <div className={styles.root}>
      <div className={styles.board} onKeyDown={dragSelect.handleBoardKeyDown}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>
              {round.mode === "sort" ? "Sorting round" : "Quiz round"} · Round {round.number} of {rounds.length}
            </p>
            <h2 className={styles.title}>{round.title}</h2>
          </div>
          <div className={styles.headerAside}>
            <div className={styles.progress}>
              <span className={styles.pips} aria-hidden="true">
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} className={`${styles.pip} ${i < progressNow ? styles.pipDone : ""}`}>{i + 1}</span>
                ))}
              </span>
              <span data-testid="shape-progress">
                {round.mode === "sort" ? `${progressNow} of ${total} sorted` : `Question ${Math.min(currentQuestionIndex + 1, total)} of ${total}`}
              </span>
            </div>
            <ActivityHeaderButtons onReset={handleReset} buttonClassName={styles.resetButton} />
          </div>
        </div>

        {/* ---------- Round picker ---------- */}
        <nav className={styles.rounds} aria-label="Rounds">
          {rounds.map((item, index) => {
            const done = roundDone(item.number);
            return (
              <button
                key={item.number}
                type="button"
                onClick={() => goToRound(index)}
                aria-current={index === roundIndex ? "step" : undefined}
                title={item.title}
                className={`${styles.roundPill} ${index === roundIndex ? styles.roundActive : ""} ${done ? styles.roundDone : ""}`}
              >
                <span>{item.number}</span>
                {done && <em aria-label={`${stars[item.number] ?? 1} stars`}>{"★".repeat(stars[item.number] ?? 1)}</em>}
              </button>
            );
          })}
          <span className={styles.navSpacer} />
          <span className={styles.streak} title="Correct answers in a row">Streak <strong>{streak}</strong></span>
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
                <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9Z" />
                </svg>
              </span>
              <div className={styles.completeText}>
                <h2 className={styles.completeTitle}>Shape Spotter!</h2>
                <p className={styles.completeSummary}>You finished all {rounds.length} rounds of shapes and their sides.</p>
              </div>
            </div>
            <dl className={styles.resultStats}>
              <div><dt>Stars</dt><dd>{totalStars} / {rounds.length * 3}</dd></div>
              <div><dt>Mistakes</dt><dd>{totalMistakes}</dd></div>
              <div><dt>Best streak</dt><dd>{bestStreak}</dd></div>
            </dl>
            <ul className={styles.resultRounds}>
              {rounds.map((item) => (
                <li key={item.number}>
                  <span>Round {item.number}: {item.title}</span>
                  <Stars count={stars[item.number] ?? 1} />
                </li>
              ))}
            </ul>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.completeButton} />
          </div>
        ) : showToast ? (
          <div className={styles.roundToast} role="status">
            <Confetti />
            <div>
              <strong>Round {round.number} complete!</strong>
              <Stars count={stars[round.number] ?? 1} />
              <p>{mistakes[round.number] ? `${mistakes[round.number]} mistake${mistakes[round.number] === 1 ? "" : "s"}.` : "No mistakes!"}</p>
            </div>
            {nextIndex !== null && (
              <button type="button" className={`rx-button rx-button-primary ${styles.nextButton}`} onClick={() => goToRound(nextIndex)} autoFocus>
                Next round →
              </button>
            )}
          </div>
        ) : (
          <p
            role="status"
            key={message ? `m-${message.key}` : "idle"}
            className={`${styles.feedback} ${message && !doneHere ? (message.kind === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect) : styles.feedbackIdle}`}
          >
            {message && !doneHere
              ? message.text
              : doneHere
                ? "This round is complete. Pick another round or press Next."
                : round.mode === "quiz"
                  ? "Look at the question, then tap your answer."
                  : selectedShape
                    ? `${selectedShape.label} selected. Now tap the group it belongs in.`
                    : "Drag each shape into its group — or tap (or press Enter on) a shape, then choose a group."}
          </p>
        )}

        {hintText && !runtimeState.completed && <p className={styles.hint} role="status">{hintText}</p>}

        {!runtimeState.completed && !doneHere && (
          <div className={styles.actionRow}>
            <button type="button" className={styles.smallButton} onClick={showHint}>💡 Hint (max 2 stars)</button>
            {round.mode === "quiz" && answered && (
              <button type="button" className={`rx-button rx-button-primary ${styles.checkButton}`} onClick={nextQuestion} autoFocus>
                {currentQuestionIndex >= round.questions.length - 1 ? "Finish round" : "Next question →"}
              </button>
            )}
          </div>
        )}

        {/* ---------- Sort round ---------- */}
        {!runtimeState.completed && round.mode === "sort" && (
          <>
            <div className={styles.zones}>
              {round.zones.map((zone, index) => {
                const tone = ZONE_TONES[index % ZONE_TONES.length];
                const inZone = placedHere.filter((shape) => str(shape, "correctZone") === zone.id);
                const isHover = hoverTargetId === zone.id && Boolean(draggingShape);
                return (
                  <button
                    key={zone.id}
                    type="button"
                    data-drop-zone-id={zone.id}
                    disabled={doneHere}
                    onClick={(event) => dragSelect.activateTarget(event, zone.id)}
                    aria-label={`${zone.label} group, ${inZone.length} shape${inZone.length === 1 ? "" : "s"}`}
                    className={`${styles.zone} ${isHover ? styles.zoneHover : ""} ${isArmed ? styles.zoneArmed : ""}`}
                    style={{ "--zone-color": tone.color, "--zone-tint": tone.tint, "--zone-border": tone.border } as React.CSSProperties}
                  >
                    <span className={styles.zoneHeader}>
                      <span className={styles.zoneBadge} aria-hidden="true">
                        <ShapeArt shape={str(zone, "icon")} size={30} />
                      </span>
                      <span className={styles.zoneTitles}>
                        <span className={styles.zoneLabel}>{zone.label}</span>
                        {zone.description && <span className={styles.zoneDescription}>{zone.description}</span>}
                      </span>
                      <span className={styles.zoneCount} aria-hidden="true">{inZone.length}</span>
                    </span>
                    <span className={styles.zoneShelf}>
                      {inZone.length === 0 && <span className={styles.zoneHint}>{isArmed ? "Tap to place here" : "Drop shapes here"}</span>}
                      {inZone.map((shape) => (
                        <span
                          key={shape.id}
                          role="img"
                          aria-label={`${shape.label}, sorted into ${zone.label}`}
                          data-placed-object-id={shape.id}
                          className={`${styles.placed} ${landing?.shapeId === shape.id ? styles.placedLanding : ""}`}
                        >
                          <ShapeArt shape={str(shape, "shape")} size={44} />
                          <span className={styles.placedLabel}>{shape.label}</span>
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>

            {!doneHere && (
              <div className={styles.tray}>
                <p className={styles.trayTitle}>Shapes to sort</p>
                <div className={styles.trayItems} ref={trayRef}>
                  {trayShapes.map((shape) => {
                    const isSelected = selectedItemId === shape.id;
                    const isBeingDragged = pointerDrag?.itemId === shape.id && pointerDrag.isDragging;
                    const isRejected = rejection?.shapeId === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        aria-label={shape.label}
                        aria-pressed={isSelected}
                        data-object-id={shape.id}
                        onClick={(event) => dragSelect.handleItemClick(event, shape.id)}
                        onPointerDown={(event) => dragSelect.handlePointerDown(event, shape.id)}
                        onPointerMove={(event) => dragSelect.handlePointerMove(event, shape.id)}
                        onPointerUp={(event) => dragSelect.handlePointerUp(event, shape.id)}
                        onPointerCancel={dragSelect.handlePointerCancel}
                        className={`${styles.shape} ${isSelected ? styles.shapeSelected : ""} ${isBeingDragged ? styles.shapeLifted : ""}`}
                      >
                        <span key={isRejected ? `rejected-${rejection.key}` : "idle"} className={`${styles.shapeArt} ${isRejected ? styles.shapeArtRejected : ""}`}>
                          <ShapeArt shape={str(shape, "shape")} size={64} />
                        </span>
                        <span className={styles.shapeLabel}>{shape.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ---------- Quiz round ---------- */}
        {!runtimeState.completed && round.mode === "quiz" && !doneHere && question && (
          <div className={styles.quiz}>
            {str(question, "shape") && (
              <div className={styles.quizShape}>
                <ShapeArt shape={str(question, "shape")} size={110} />
              </div>
            )}
            <h3 className={styles.question}>{str(question, "q")}</h3>
            <div className={`${styles.options} ${optionShapes ? styles.optionsShapes : ""}`} role="group" aria-label="Answers">
              {options.map((option) => {
                const isWrong = wrongOptions.includes(`${question.id}:${option}`);
                const isRight = answered === question.id && option === str(question, "answer");
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={Boolean(answered) || isWrong}
                    onClick={() => chooseOption(option)}
                    aria-label={optionShapes ? shapeName(option) : option}
                    className={`${styles.option} ${isWrong ? styles.optionWrong : ""} ${isRight ? styles.optionRight : ""}`}
                  >
                    {optionShapes && <ShapeArt shape={option} size={64} />}
                    <span>{optionShapes ? shapeName(option) : option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {draggingShape && pointerDrag && (
        <div aria-hidden className={styles.ghost} style={{ left: pointerDrag.currentX, top: pointerDrag.currentY }}>
          <ShapeArt shape={str(draggingShape, "shape")} size={60} />
          <span className={styles.shapeLabel}>{draggingShape.label}</span>
        </div>
      )}
    </div>
  );
}
