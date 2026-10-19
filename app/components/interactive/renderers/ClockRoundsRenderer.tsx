"use client";

import { useEffect, useRef, useState } from "react";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveAsset } from "@/types/interactive-assets";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { playSequenceSound, readSequenceMuted, setSequenceMuted } from "@/app/components/interactive/shared/sequenceSounds";

import styles from "./ClockRoundsRenderer.module.css";
import { Clock, DigitalTime } from "./ClockVisuals";

// Round-based clock game for the "2d" runtime (component: "clock-rounds").
// A round is a short run of questions. A question is one of:
//   read     an analogue clock, choose the time in words;
//   digital  a digital time, choose the matching clock face;
//   set      move the clock hands to a target time, then press Check;
//   story    a short time word problem.
// Content contract: see content/experiences/telling-the-time.ts. The runtime
// only remembers which round tasks ("round-N") are complete; stars, streak and
// hints are local to this component.

interface Round {
  number: number;
  title: string;
  questions: InteractiveAsset[];
}

function num(asset: InteractiveAsset, key: string, fallback = 0) {
  const value = asset.properties?.[key];
  return typeof value === "number" ? value : fallback;
}

function str(asset: InteractiveAsset, key: string) {
  const value = asset.properties?.[key];
  return typeof value === "string" ? value : "";
}

function starsFor(mistakes: number, hintUsed: boolean) {
  const base = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  return hintUsed ? Math.min(base, 2) : base;
}

function timeWords(h: number, m: number) {
  const hour = ((h - 1 + 12) % 12) + 1;
  const next = (hour % 12) + 1;
  if (m === 0) return `${hour} o'clock`;
  if (m === 30) return `half past ${hour}`;
  if (m === 15) return `quarter past ${hour}`;
  if (m === 45) return `quarter to ${next}`;
  return m < 30 ? `${m} past ${hour}` : `${60 - m} to ${next}`;
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

function Confetti() {
  const colors = ["#0f9d94", "#e8900c", "#df4f93", "#2f6fde", "#ef4444", "#f5c542"];
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

export default function ClockRoundsRenderer({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const assets = (experience.assets ?? []).filter((asset) => asset.visible !== false);

  const rounds: Round[] = assets
    .filter((asset) => asset.type === "environment" && typeof asset.properties?.round === "number")
    .map((asset) => {
      const number = num(asset, "round");
      return {
        number,
        title: str(asset, "title") || `Round ${number}`,
        questions: assets.filter((other) => other.type === "object" && num(other, "round", -1) === number && str(other, "q") !== ""),
      };
    })
    .sort((a, b) => a.number - b.number);

  const [roundIndex, setRoundIndex] = useState(0);
  const round = rounds[Math.min(roundIndex, rounds.length - 1)];

  const [quizIndex, setQuizIndex] = useState<Record<number, number>>({});
  const [answered, setAnswered] = useState<string | null>(null);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [clockState, setClockState] = useState<Record<string, { h: number; m: number }>>({});
  const [activeHand, setActiveHand] = useState<"hour" | "minute">("minute");
  const [mistakes, setMistakes] = useState<Record<number, number>>({});
  const [hintUsed, setHintUsed] = useState<Record<number, boolean>>({});
  const [hintText, setHintText] = useState<string | null>(null);
  const [stars, setStars] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [justDone, setJustDone] = useState<number | null>(null);
  const [message, setMessage] = useState<{ kind: "correct" | "incorrect"; text: string; key: number } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const counter = useRef(0);

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
  const total = round ? round.questions.length : 0;
  const questionIndex = round ? Math.min(quizIndex[round.number] ?? 0, Math.max(total - 1, 0)) : 0;
  const question = round && !doneHere ? round.questions[questionIndex] : undefined;
  const kind = question ? str(question, "kind") : "";

  function say(messageKind: "correct" | "incorrect", text: string) {
    counter.current += 1;
    setMessage({ kind: messageKind, text, key: counter.current });
  }

  function markCorrect() {
    if (!question) return;
    setAnswered(question.id);
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    setBestStreak((best) => Math.max(best, nextStreak));
    say("correct", str(question, "explain") || "Correct!");
    setHintText(null);
    playSequenceSound("good");
  }

  function markWrong(text: string) {
    if (!round) return;
    setMistakes((current) => ({ ...current, [round.number]: (current[round.number] ?? 0) + 1 }));
    setStreak(0);
    say("incorrect", text);
    playSequenceSound("bad");
  }

  function chooseOption(option: string) {
    if (!question || answered) return;
    if (option === str(question, "answer")) {
      markCorrect();
    } else {
      setWrongOptions((current) => [...current, `${question.id}:${option}`]);
      markWrong("Not quite. Look again, or press Hint.");
    }
  }

  const currentClock = question ? clockState[question.id] ?? { h: num(question, "startH", 12), m: num(question, "startM", 0) } : { h: 12, m: 0 };

  function updateClock(next: { h: number; m: number }) {
    if (!question || answered) return;
    setClockState((current) => ({ ...current, [question.id]: next }));
    playSequenceSound("swap");
  }

  function stepHour(delta: number) {
    updateClock({ h: ((currentClock.h - 1 + delta + 12) % 12) + 1, m: currentClock.m });
  }

  function stepMinute(delta: number) {
    const minute = (currentClock.m + delta + 60) % 60;
    // Moving the long hand past 12 also moves the short hand on, like a real clock.
    let hour = currentClock.h;
    if (delta > 0 && currentClock.m + delta >= 60) hour = (hour % 12) + 1;
    if (delta < 0 && currentClock.m + delta < 0) hour = ((hour - 2 + 12) % 12) + 1;
    updateClock({ h: hour, m: minute });
  }

  function dial(angle: number) {
    if (!question || answered) return;
    if (activeHand === "minute") {
      const minute = (Math.round(angle / 30) * 5) % 60;
      if (minute !== currentClock.m) updateClock({ h: currentClock.h, m: minute });
    } else {
      const hour = Math.round(angle / 30) % 12 || 12;
      if (hour !== currentClock.h) updateClock({ h: hour, m: currentClock.m });
    }
  }

  function checkClock() {
    if (!question || answered) return;
    const targetH = num(question, "h", 12);
    const targetM = num(question, "m", 0);
    const hourOk = currentClock.h % 12 === targetH % 12;
    const minuteOk = currentClock.m === targetM;
    if (hourOk && minuteOk) {
      markCorrect();
    } else if (!hourOk && !minuteOk) {
      markWrong("Not yet. Check both hands: the short hand shows the hour and the long hand shows the minutes.");
    } else if (!hourOk) {
      markWrong("The long hand is right. Check the short hand: which hour is it?");
    } else {
      markWrong("The short hand is right. Check the long hand: how many minutes?");
    }
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

  function nextQuestion() {
    if (!round || !question) return;
    const last = questionIndex >= total - 1;
    setAnswered(null);
    setMessage(null);
    if (last) {
      finishRound(round, mistakes[round.number] ?? 0);
    } else {
      setQuizIndex((current) => ({ ...current, [round.number]: questionIndex + 1 }));
      setActiveHand("minute");
    }
  }

  function showHint() {
    if (!round || !question) return;
    setHintText(`Hint: ${str(question, "hint")}`);
    setHintUsed((current) => ({ ...current, [round.number]: true }));
    playSequenceSound("hint");
  }

  function goToRound(index: number) {
    setRoundIndex(index);
    setJustDone(null);
    setHintText(null);
    setMessage(null);
    setAnswered(null);
  }

  function handleReset() {
    actions.resetExperience();
    setRoundIndex(0);
    setQuizIndex({});
    setAnswered(null);
    setWrongOptions([]);
    setClockState({});
    setMistakes({});
    setHintUsed({});
    setHintText(null);
    setStars({});
    setStreak(0);
    setBestStreak(0);
    setJustDone(null);
    setMessage(null);
  }

  if (!round) return null;

  const nextIndex = roundIndex + 1 < rounds.length ? roundIndex + 1 : null;
  const totalStars = Object.values(stars).reduce((sum, n) => sum + n, 0);
  const totalMistakes = Object.values(mistakes).reduce((sum, n) => sum + n, 0);
  const showToast = justDone === round.number && doneHere && !runtimeState.completed;
  const progressNow = doneHere ? total : questionIndex + (answered ? 1 : 0);
  const options = question ? str(question, "options").split("|").filter(Boolean) : [];
  const targetH = question ? num(question, "h", 12) : 12;
  const targetM = question ? num(question, "m", 0) : 0;
  const mm = (value: number) => String(value).padStart(2, "0");

  return (
    <div className={styles.root}>
      <div className={styles.board}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Clock round · Round {round.number} of {rounds.length}</p>
            <h2 className={styles.title}>{round.title}</h2>
          </div>
          <div className={styles.headerAside}>
            <div className={styles.progress}>
              <span className={styles.pips} aria-hidden="true">
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} className={`${styles.pip} ${i < progressNow ? styles.pipDone : ""}`}>{i + 1}</span>
                ))}
              </span>
              <span data-testid="clock-progress">Question {Math.min(questionIndex + 1, total)} of {total}</span>
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
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
              <div className={styles.completeText}>
                <h2 className={styles.completeTitle}>Time Keeper!</h2>
                <p className={styles.completeSummary}>You finished all {rounds.length} rounds of telling the time.</p>
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
                : kind === "set"
                  ? "Set the clock: drag the hands, or use the buttons. Then press Check."
                  : "Look carefully, then choose your answer."}
          </p>
        )}

        {hintText && !runtimeState.completed && <p className={styles.hint} role="status">{hintText}</p>}

        {/* ---------- Question ---------- */}
        {!runtimeState.completed && question && (
          <div className={styles.quiz}>
            <h3 className={styles.question}>{str(question, "q")}</h3>

            {kind === "read" && (
              <div className={styles.clockBox}>
                <Clock hour={targetH} minute={targetM} size={170} label="Clock to read" />
              </div>
            )}
            {kind === "digital" && (
              <div className={styles.clockBox}>
                <DigitalTime time={`${targetH}:${mm(targetM)}`} />
              </div>
            )}

            {kind === "set" && (
              <div className={styles.setter}>
                <div className={styles.clockBox}>
                  <Clock hour={currentClock.h} minute={currentClock.m} size={210} onDial={answered ? undefined : dial} activeHand={activeHand} label={`Your clock shows ${currentClock.h}:${mm(currentClock.m)}`} />
                </div>
                <div className={styles.controls}>
                  <p className={styles.readout} aria-live="polite">
                    Your clock: <strong>{currentClock.h}:{mm(currentClock.m)}</strong>
                  </p>
                  <div className={styles.handToggle} role="group" aria-label="Which hand to move">
                    <button type="button" aria-pressed={activeHand === "hour"} className={activeHand === "hour" ? styles.handOn : ""} onClick={() => setActiveHand("hour")}>Short hand (hours)</button>
                    <button type="button" aria-pressed={activeHand === "minute"} className={activeHand === "minute" ? styles.handOn : ""} onClick={() => setActiveHand("minute")}>Long hand (minutes)</button>
                  </div>
                  <div className={styles.stepRow}>
                    <span>Hours</span>
                    <button type="button" onClick={() => stepHour(-1)} disabled={Boolean(answered)} aria-label="One hour back">−1</button>
                    <button type="button" onClick={() => stepHour(1)} disabled={Boolean(answered)} aria-label="One hour forward">+1</button>
                  </div>
                  <div className={styles.stepRow}>
                    <span>Minutes</span>
                    <button type="button" onClick={() => stepMinute(-5)} disabled={Boolean(answered)} aria-label="Five minutes back">−5</button>
                    <button type="button" onClick={() => stepMinute(-1)} disabled={Boolean(answered)} aria-label="One minute back">−1</button>
                    <button type="button" onClick={() => stepMinute(1)} disabled={Boolean(answered)} aria-label="One minute forward">+1</button>
                    <button type="button" onClick={() => stepMinute(5)} disabled={Boolean(answered)} aria-label="Five minutes forward">+5</button>
                  </div>
                  <button type="button" className={`rx-button rx-button-primary ${styles.checkButton}`} onClick={checkClock} disabled={Boolean(answered)}>
                    Check
                  </button>
                </div>
              </div>
            )}

            {kind !== "set" && (
              <div className={`${styles.options} ${kind === "digital" ? styles.optionsClocks : ""}`} role="group" aria-label="Answers">
                {options.map((option) => {
                  const isWrong = wrongOptions.includes(`${question.id}:${option}`);
                  const isRight = answered === question.id && option === str(question, "answer");
                  const [oh, om] = kind === "digital" ? option.split(":").map(Number) : [0, 0];
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={Boolean(answered) || isWrong}
                      onClick={() => chooseOption(option)}
                      aria-label={kind === "digital" ? `Clock showing ${timeWords(oh, om)}` : option}
                      className={`${styles.option} ${isWrong ? styles.optionWrong : ""} ${isRight ? styles.optionRight : ""}`}
                    >
                      {kind === "digital" ? <Clock hour={oh} minute={om} size={96} label="" /> : <span>{option}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className={styles.actionRow}>
              <button type="button" className={styles.smallButton} onClick={showHint}>💡 Hint (max 2 stars)</button>
              {answered && (
                <button type="button" className={`rx-button rx-button-primary ${styles.checkButton}`} onClick={nextQuestion} autoFocus>
                  {questionIndex >= total - 1 ? "Finish round" : "Next question →"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
