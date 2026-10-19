"use client";

import { useEffect, useRef, useState } from "react";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveAsset } from "@/types/interactive-assets";
import type {
  InteractiveRuntimeRendererProps,
} from "@/types/interactive-runtime-renderer";

import { useDragSelect } from "@/app/components/interactive/shared/useDragSelect";
import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { playSequenceSound, readSequenceMuted, setSequenceMuted } from "@/app/components/interactive/shared/sequenceSounds";
import { toVisualKey } from "@/app/components/interactive/shared/visualKeys";

import styles from "./SequencingRenderer.module.css";
import { StepVisual } from "./SequencingVisuals";

// Generic sequencing renderer for the "2d" runtime (component: "sequencing").
// The activity is a set of ROUNDS. Each round is either:
//   - "order" (default): drag, or tap, each step into its numbered slot;
//   - "debug": the steps start in the wrong order and the learner swaps them
//     into the right one, then presses Check.
//
// Data contract (no schema changes, everything in InteractiveAsset.properties):
//   - a round is an "environment" asset with properties.round, .title and
//     optionally .mode ("debug") and .intro;
//   - a step is an asset with properties.round and a numeric properties.order
//     (its correct position in that round), optional .glyph (emoji) or .visual
//     (a drawn picture) and, in a debug round, .shown (its starting position);
//   - one required task per round, with task id "round-N".
// Input (drag, tap, keyboard) comes from the shared useDragSelect hook.

interface Round {
  number: number;
  title: string;
  mode: "order" | "debug";
  intro?: string;
  steps: InteractiveAsset[];
}

function num(asset: InteractiveAsset, key: string) {
  const value = asset.properties?.[key];
  return typeof value === "number" ? value : undefined;
}

function text(asset: InteractiveAsset, key: string) {
  const value = asset.properties?.[key];
  return typeof value === "string" ? value : undefined;
}

function slotId(position: number) {
  return `position-${position}`;
}

function visualKey(asset: InteractiveAsset) {
  const explicit = text(asset, "visual");
  return explicit ? toVisualKey(explicit) : toVisualKey(asset.label);
}

function starsFor(mistakes: number, hintUsed: boolean) {
  const base = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  return hintUsed ? Math.min(base, 2) : base;
}

function Stars({ count, label }: { count: number; label?: string }) {
  return (
    <span className={styles.stars} aria-label={label ?? `${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <i key={n} className={n <= count ? styles.starOn : styles.starOff} aria-hidden="true">★</i>
      ))}
    </span>
  );
}

// Pure-CSS celebration; positions come from the index so the render stays pure.
function Confetti() {
  const colors = ["#9b59d0", "#0f6fde", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];
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

export default function SequencingRenderer({
  experience,
  runtimeState,
  actions,
}: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const assets = (experience.assets ?? []).filter((asset) => asset.visible !== false);

  // Build the rounds from the content.
  const rounds: Round[] = assets
    .filter((asset) => asset.type === "environment" && num(asset, "round") !== undefined)
    .map((asset) => {
      const number = num(asset, "round") as number;
      return {
        number,
        title: text(asset, "title") ?? `Round ${number}`,
        mode: text(asset, "mode") === "debug" ? ("debug" as const) : ("order" as const),
        intro: text(asset, "intro"),
        steps: assets.filter((step) => num(step, "order") !== undefined && num(step, "round") === number),
      };
    })
    .sort((a, b) => a.number - b.number);

  const [roundIndex, setRoundIndex] = useState(0);
  const round = rounds[Math.min(roundIndex, rounds.length - 1)];

  // Local game state (the runtime only remembers which round tasks are done).
  const [placed, setPlaced] = useState<string[]>([]);
  const [arrangements, setArrangements] = useState<Record<number, string[]>>({});
  const [swapFrom, setSwapFrom] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<Record<number, number>>({});
  const [hintUsed, setHintUsed] = useState<Record<number, boolean>>({});
  const [hintText, setHintText] = useState<string | null>(null);
  const [stars, setStars] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [justDone, setJustDone] = useState<number | null>(null);
  const [message, setMessage] = useState<{ kind: "correct" | "incorrect"; text: string; key: number } | null>(null);
  const [joinedSlotId, setJoinedSlotId] = useState<string | null>(null);
  const [rejection, setRejection] = useState<{ stepId: string; slotId: string; key: number } | null>(null);
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

  const stepsHere = round ? round.steps : [];
  const positions = stepsHere.map((step) => num(step, "order") as number).sort((a, b) => a - b);
  const doneHere = round ? roundDone(round.number) : false;

  // ---------- Order rounds ----------
  const stepBySlot = new Map<string, InteractiveAsset>();
  for (const step of stepsHere) {
    if (placed.includes(step.id) || (doneHere && round?.mode === "order")) {
      stepBySlot.set(slotId(num(step, "order") as number), step);
    }
  }
  const placedCount = stepBySlot.size;

  const dragSelect = useDragSelect({
    targetAttribute: "data-sequence-slot-id",
    itemAttribute: "data-step-id",
    trayRef,
    onDrop: attemptPlace,
    canHoverTarget: (id) => !stepBySlot.has(id),
  });
  const { pointerDrag, selectedItemId: selectedStepId, hoverTargetId } = dragSelect;

  function say(kind: "correct" | "incorrect", messageText: string) {
    counter.current += 1;
    setMessage({ kind, text: messageText, key: counter.current });
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
    setSwapFrom(null);
  }

  function attemptPlace(stepId: string, targetSlotId: string | null) {
    if (!round || round.mode !== "order" || doneHere) return;
    if (!targetSlotId || stepBySlot.has(targetSlotId) || placed.includes(stepId)) return;

    const step = stepsHere.find((asset) => asset.id === stepId);
    if (step && slotId(num(step, "order") as number) === targetSlotId) {
      const nextPlaced = [...placed, stepId];
      setPlaced(nextPlaced);
      setJoinedSlotId(targetSlotId);
      setHintText(null);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((best) => Math.max(best, nextStreak));
      say("correct", nextStreak >= 3 ? `Brilliant! ${nextStreak} in a row.` : "Well done! That step is in the right place.");
      if (stepsHere.every((item) => nextPlaced.includes(item.id))) {
        finishRound(round, mistakes[round.number] ?? 0);
      } else {
        playSequenceSound("good");
      }
    } else {
      setMistakes((current) => ({ ...current, [round.number]: (current[round.number] ?? 0) + 1 }));
      setStreak(0);
      counter.current += 1;
      setRejection({ stepId, slotId: targetSlotId, key: counter.current });
      say("incorrect", "Not yet. Think about what must happen before this step.");
      playSequenceSound("bad");
    }
    dragSelect.clearSelection();
  }

  // ---------- Debug rounds ----------
  function initialArrangement(r: Round) {
    return [...r.steps].sort((a, b) => (num(a, "shown") ?? 0) - (num(b, "shown") ?? 0)).map((step) => step.id);
  }

  function arrangementOf(r: Round) {
    if (roundDone(r.number)) {
      return [...r.steps].sort((a, b) => (num(a, "order") as number) - (num(b, "order") as number)).map((step) => step.id);
    }
    return arrangements[r.number] ?? initialArrangement(r);
  }

  function tapDebugSlot(index: number) {
    if (!round || round.mode !== "debug" || doneHere) return;
    if (swapFrom === null) {
      setSwapFrom(index);
      playSequenceSound("pick");
      return;
    }
    if (swapFrom === index) {
      setSwapFrom(null);
      return;
    }
    const next = [...arrangementOf(round)];
    [next[swapFrom], next[index]] = [next[index], next[swapFrom]];
    setArrangements((current) => ({ ...current, [round.number]: next }));
    setSwapFrom(null);
    setHintText(null);
    playSequenceSound("swap");
  }

  function wrongSlots(r: Round, arrangement: string[]) {
    return arrangement
      .map((id, index) => {
        const step = r.steps.find((item) => item.id === id);
        return step && num(step, "order") === index + 1 ? -1 : index;
      })
      .filter((index) => index >= 0);
  }

  function checkDebug() {
    if (!round || round.mode !== "debug" || doneHere) return;
    const wrong = wrongSlots(round, arrangementOf(round));
    if (wrong.length === 0) {
      say("correct", "You fixed the algorithm!");
      finishRound(round, mistakes[round.number] ?? 0);
    } else {
      setMistakes((current) => ({ ...current, [round.number]: (current[round.number] ?? 0) + 1 }));
      say("incorrect", `Not yet: ${wrong.length} ${wrong.length === 1 ? "step is" : "steps are"} still in the wrong place. Read it from the top, one step at a time.`);
      playSequenceSound("bad");
    }
  }

  // ---------- Hint ----------
  function showHint() {
    if (!round || doneHere) return;
    let target: InteractiveAsset | undefined;
    let slot = 0;
    if (round.mode === "order") {
      const free = positions.find((position) => !stepBySlot.has(slotId(position)));
      slot = free ?? 0;
      target = stepsHere.find((step) => num(step, "order") === free);
    } else {
      const wrong = wrongSlots(round, arrangementOf(round));
      slot = (wrong[0] ?? 0) + 1;
      target = stepsHere.find((step) => num(step, "order") === slot);
    }
    if (!target) return;
    setHintUsed((current) => ({ ...current, [round.number]: true }));
    setHintText(`Hint for step ${slot}: ${target.description ?? target.label}`);
    playSequenceSound("hint");
  }

  function goToRound(index: number) {
    setRoundIndex(index);
    setJustDone(null);
    setHintText(null);
    setSwapFrom(null);
    setMessage(null);
    dragSelect.clearSelection();
  }

  function handleReset() {
    actions.resetExperience();
    dragSelect.reset();
    setRoundIndex(0);
    setPlaced([]);
    setArrangements({});
    setSwapFrom(null);
    setMistakes({});
    setHintUsed({});
    setHintText(null);
    setStars({});
    setStreak(0);
    setBestStreak(0);
    setJustDone(null);
    setMessage(null);
    setJoinedSlotId(null);
    setRejection(null);
  }

  if (!round) return null;

  const draggingStep = pointerDrag?.isDragging ? stepsHere.find((asset) => asset.id === pointerDrag.itemId) : undefined;
  const selectedStep = selectedStepId ? stepsHere.find((asset) => asset.id === selectedStepId) : undefined;
  const isArmed = Boolean(selectedStepId) && !doneHere;
  const traySteps = stepsHere.filter((step) => !placed.includes(step.id));
  const arrangement = round.mode === "debug" ? arrangementOf(round) : [];
  const nextIndex = roundIndex + 1 < rounds.length ? roundIndex + 1 : null;
  const totalStars = Object.values(stars).reduce((sum, n) => sum + n, 0);
  const totalMistakes = Object.values(mistakes).reduce((sum, n) => sum + n, 0);
  const showToast = justDone === round.number && doneHere && !runtimeState.completed;

  const progressNow = round.mode === "debug"
    ? (doneHere ? stepsHere.length : stepsHere.length - wrongSlots(round, arrangement).length)
    : placedCount;

  return (
    <div className={styles.root}>
      <div className={styles.board} onKeyDown={dragSelect.handleBoardKeyDown}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>
              {round.mode === "debug" ? "Debug it" : "Sequencing activity"} · Round {round.number} of {rounds.length}
            </p>
            <h2 className={styles.title}>{round.title}</h2>
          </div>

          <div className={styles.headerAside}>
            <div className={styles.progress}>
              <span className={styles.pips} aria-hidden="true">
                {positions.map((position) => (
                  <span
                    key={position}
                    className={`${styles.pip} ${position <= progressNow ? styles.pipDone : ""}`}
                  >
                    {position}
                  </span>
                ))}
              </span>
              <span data-testid="sequence-progress">
                {round.mode === "debug" ? `${progressNow} of ${stepsHere.length} in place` : `${placedCount} of ${stepsHere.length} placed`}
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
          <span className={styles.streak} title="Steps placed correctly in a row">
            Streak <strong>{streak}</strong>
          </span>
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h10M4 12h13M4 17h7" />
                  <path d="m15 16 2.5 2.5L21 14" />
                </svg>
              </span>
              <div className={styles.completeText}>
                <h2 className={styles.completeTitle}>Algorithm Builder!</h2>
                <p className={styles.completeSummary}>
                  You put all {rounds.length} algorithms in the right order and fixed the broken one.
                </p>
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
              <p>
                {round.mode === "debug" ? "You found and fixed the mistakes." : `You put all ${stepsHere.length} steps in order.`}
                {" "}{mistakes[round.number] ? `${mistakes[round.number]} mistake${mistakes[round.number] === 1 ? "" : "s"}.` : "No mistakes!"}
              </p>
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
            key={message && !selectedStep ? `m-${message.key}` : "idle"}
            className={`${styles.feedback} ${
              message && !selectedStep && !doneHere
                ? message.kind === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect
                : styles.feedbackIdle
            }`}
          >
            {message && !selectedStep && !doneHere
              ? message.text
              : doneHere
                ? "This round is complete. Pick another round or press Next."
                : round.mode === "debug"
                  ? (round.intro ?? "Tap one step, then another, to swap them. Press Check when it is right.")
                  : selectedStep
                    ? `${selectedStep.label}${selectedStep.description ? `: ${selectedStep.description}` : ""} Now choose its step number.`
                    : "Drag each step into its place — or tap (or press Enter on) a step, then choose its number."}
          </p>
        )}

        {hintText && !runtimeState.completed && <p className={styles.hint} role="status">{hintText}</p>}

        {/* ---------- Slots ---------- */}
        {!runtimeState.completed && (
          <>
            <ol className={styles.slots}>
              {round.mode === "order"
                ? positions.map((position) => {
                    const id = slotId(position);
                    const filled = stepBySlot.get(id);
                    const isHover = hoverTargetId === id && Boolean(draggingStep);
                    const isRejected = rejection?.slotId === id;
                    return (
                      <li key={id} className={styles.slotItem}>
                        <button
                          type="button"
                          data-sequence-slot-id={id}
                          disabled={Boolean(filled)}
                          onClick={(event) => dragSelect.activateTarget(event, id)}
                          aria-label={
                            filled
                              ? `Step ${position}: ${filled.label}`
                              : `Step ${position}${isArmed && selectedStep ? `, place ${selectedStep.label} here` : ", empty"}`
                          }
                          className={[styles.slot, filled ? styles.slotFilled : "", isHover ? styles.slotHover : "", isArmed && !filled ? styles.slotArmed : ""].join(" ")}
                        >
                          <span className={styles.slotNumber} aria-hidden="true">{position}</span>
                          <span key={isRejected ? `rejected-${rejection.key}` : "body"} className={`${styles.slotBody} ${isRejected ? styles.slotRejected : ""}`}>
                            {filled ? (
                              <span className={`${styles.placed} ${joinedSlotId === id ? styles.placedJoining : ""}`} data-sequenced-step-id={filled.id}>
                                <StepVisual visualKey={visualKey(filled)} label={filled.label} glyph={text(filled, "glyph")} size={36} />
                                <span className={styles.placedLabel}>{filled.label}</span>
                              </span>
                            ) : (
                              <span className={styles.slotHint}>{isArmed ? "Tap to place" : "Drop step here"}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })
                : arrangement.map((id, index) => {
                    const step = stepsHere.find((item) => item.id === id) as InteractiveAsset;
                    const selected = swapFrom === index;
                    return (
                      <li key={`slot-${index}`} className={styles.slotItem}>
                        <button
                          type="button"
                          disabled={doneHere}
                          onClick={() => tapDebugSlot(index)}
                          aria-pressed={selected}
                          aria-label={`Step ${index + 1}: ${step.label}${selected ? ", selected" : ""}`}
                          className={[styles.slot, styles.slotSwap, selected ? styles.slotSelected : "", doneHere ? styles.slotFilled : ""].join(" ")}
                        >
                          <span className={styles.slotNumber} aria-hidden="true">{index + 1}</span>
                          <span className={styles.slotBody}>
                            <span className={styles.placed}>
                              <StepVisual visualKey={visualKey(step)} label={step.label} glyph={text(step, "glyph")} size={36} />
                              <span className={styles.placedLabel}>{step.label}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
            </ol>

            {!doneHere && (
              <div className={styles.actionRow}>
                {round.mode === "debug" && (
                  <button type="button" className={`rx-button rx-button-primary ${styles.checkButton}`} onClick={checkDebug}>
                    Check
                  </button>
                )}
                <button type="button" className={styles.smallButton} onClick={showHint}>
                  💡 Hint (max 2 stars)
                </button>
              </div>
            )}

            {round.mode === "order" && !doneHere && (
              <div className={styles.tray}>
                <p className={styles.trayTitle}>Steps to place</p>
                <div className={styles.trayItems} ref={trayRef}>
                  {traySteps.map((step) => {
                    const isSelected = selectedStepId === step.id;
                    const isBeingDragged = pointerDrag?.itemId === step.id && pointerDrag.isDragging;
                    const isRejected = rejection?.stepId === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        aria-label={step.label}
                        aria-pressed={isSelected}
                        data-step-id={step.id}
                        onClick={(event) => dragSelect.handleItemClick(event, step.id)}
                        onPointerDown={(event) => dragSelect.handlePointerDown(event, step.id)}
                        onPointerMove={(event) => dragSelect.handlePointerMove(event, step.id)}
                        onPointerUp={(event) => dragSelect.handlePointerUp(event, step.id)}
                        onPointerCancel={dragSelect.handlePointerCancel}
                        className={`${styles.step} ${isSelected ? styles.stepSelected : ""} ${isBeingDragged ? styles.stepLifted : ""}`}
                      >
                        <span key={isRejected ? `rejected-${rejection.key}` : "idle"} className={`${styles.stepArt} ${isRejected ? styles.stepArtRejected : ""}`}>
                          <StepVisual visualKey={visualKey(step)} label={step.label} glyph={text(step, "glyph")} size={44} />
                        </span>
                        <span className={styles.stepLabel}>{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {draggingStep && pointerDrag && (
        <div aria-hidden className={styles.ghost} style={{ left: pointerDrag.currentX, top: pointerDrag.currentY }}>
          <StepVisual visualKey={visualKey(draggingStep)} label={draggingStep.label} glyph={text(draggingStep, "glyph")} size={44} />
          <span className={styles.stepLabel}>{draggingStep.label}</span>
        </div>
      )}
    </div>
  );
}
