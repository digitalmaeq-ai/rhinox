"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { gradeLabel, scoreExam, type CbtBank, type CbtQuestion, type ExamResult, type Level } from "../shell/cbt";
import { parseAttempts, storeFor } from "./cbtStore";
import styles from "./CbtPanel.module.css";

const COUNTS = [10, 20];
const SECONDS_PER_QUESTION = 60;
const LETTERS = ["A", "B", "C", "D"];

type Exam = {
  questions: CbtQuestion[];
  answers: (number | null)[];
  flagged: boolean[];
  index: number;
  startedAt: number;
  endsAt: number | null;
  level: Level;
};

type Finished = { exam: Exam; result: ExamResult; seconds: number; timedOut: boolean };

function clock(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function CbtPanel({ bank, bare = false }: { bank: CbtBank; bare?: boolean }) {
  const { subscribe, getSnapshot, getServerSnapshot, saveAttempt, clearAttempts } = storeFor(bank.id);
  const TOPICS = bank.topics;
  const TOPIC_LABEL: Record<string, string> = Object.fromEntries(TOPICS.map((t) => [t.id, t.label]));
  const [count, setCount] = useState(10);
  const [level, setLevel] = useState<Level>("mixed");
  const [topic, setTopic] = useState<string>("all");
  const [timed, setTimed] = useState(true);

  const [exam, setExam] = useState<Exam | null>(null);
  const [finished, setFinished] = useState<Finished | null>(null);
  const [now, setNow] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [wrongOnly, setWrongOnly] = useState(false);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const attempts = useMemo(() => parseAttempts(raw), [raw]);

  const available = bank.poolSize(topic, level);
  const asked = Math.min(count, available);

  function start() {
    if (available === 0) return;
    const questions = bank.build({ count, level, topic, seed: Math.floor(Math.random() * 1e9) });
    const t = Date.now();
    setExam({
      questions,
      answers: questions.map(() => null),
      flagged: questions.map(() => false),
      index: 0,
      startedAt: t,
      endsAt: timed ? t + questions.length * SECONDS_PER_QUESTION * 1000 : null,
      level,
    });
    setNow(t);
    setFinished(null);
    setConfirming(false);
    setWrongOnly(false);
  }

  function finish(timedOut: boolean) {
    if (!exam) return;
    const end = Date.now();
    const result = scoreExam(exam.questions, exam.answers);
    const seconds = Math.round((Math.min(end, exam.endsAt ?? end) - exam.startedAt) / 1000);
    saveAttempt({ t: end, score: result.score, total: result.total, percent: result.percent, level: exam.level, seconds, topics: result.topics });
    setFinished({ exam, result, seconds, timedOut });
    setExam(null);
    setConfirming(false);
  }

  // The timer ticks from a real clock, so it stays right even if the tab is throttled.
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });
  const endsAt = exam?.endsAt ?? null;
  useEffect(() => {
    if (endsAt === null) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= endsAt) finishRef.current(true);
    }, 500);
    return () => window.clearInterval(id);
  }, [endsAt]);

  function choose(option: number) {
    setExam((e) => (e ? { ...e, answers: e.answers.map((a, i) => (i === e.index ? option : a)) } : e));
  }
  function go(index: number) {
    setExam((e) => (e ? { ...e, index: Math.max(0, Math.min(e.questions.length - 1, index)) } : e));
    setConfirming(false);
  }
  function toggleFlag() {
    setExam((e) => (e ? { ...e, flagged: e.flagged.map((f, i) => (i === e.index ? !f : f)) } : e));
  }

  /* ------------------------------ in the exam ------------------------------ */
  if (exam) {
    const q = exam.questions[exam.index];
    const answered = exam.answers.filter((a) => a !== null).length;
    const left = exam.endsAt === null ? null : (exam.endsAt - now) / 1000;
    const unanswered = exam.questions.length - answered;
    return (
      <section className={bare ? `${styles.card} ${styles.bare}` : styles.card} aria-label="CBT practice exam">
        <div className={styles.examBar}>
          <span>Question {exam.index + 1} of {exam.questions.length}</span>
          {left !== null && (
            <span className={`${styles.timer} ${left < 60 ? styles.timerLow : ""}`} role="timer" aria-label={`Time left ${clock(left)}`}>
              ⏱ {clock(left)}
            </span>
          )}
        </div>
        <div className={styles.progress} aria-hidden="true"><span style={{ width: `${(answered / exam.questions.length) * 100}%` }} /></div>
        <p className={styles.meta}>{TOPIC_LABEL[q.topic]} · {q.difficulty[0].toUpperCase() + q.difficulty.slice(1)} · {answered} answered</p>

        <div className={styles.cols}>
        <div className={styles.colMain}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.question}>{q.text}</legend>
          <div className={styles.options}>
            {q.options.map((o, i) => (
              <label key={i} className={`${styles.option} ${exam.answers[exam.index] === i ? styles.optionOn : ""}`}>
                <input type="radio" name={`cbt-${exam.index}`} checked={exam.answers[exam.index] === i} onChange={() => choose(i)} />
                <b>{LETTERS[i]}</b>
                <span>{o}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.nav}>
          <button type="button" className={styles.ghost} onClick={() => go(exam.index - 1)} disabled={exam.index === 0}>← Back</button>
          <button type="button" className={styles.ghost} onClick={toggleFlag} aria-pressed={exam.flagged[exam.index]}>
            {exam.flagged[exam.index] ? "⚑ Flagged" : "⚐ Flag"}
          </button>
          <button type="button" className={styles.ghost} onClick={() => go(exam.index + 1)} disabled={exam.index === exam.questions.length - 1}>Next →</button>
        </div>
        </div>
        <aside className={styles.colSide}>
        <div className={styles.grid} role="group" aria-label="Question navigator">
          {exam.questions.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Question ${i + 1}${exam.answers[i] !== null ? ", answered" : ""}${exam.flagged[i] ? ", flagged" : ""}`}
              aria-current={i === exam.index ? "true" : undefined}
              className={`${exam.answers[i] !== null ? styles.gDone : ""} ${exam.flagged[i] ? styles.gFlag : ""} ${i === exam.index ? styles.gNow : ""}`}
              onClick={() => go(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {confirming ? (
          <div className={styles.confirm} role="alert">
            <p>{unanswered > 0 ? `${unanswered} question${unanswered === 1 ? " is" : "s are"} unanswered. Submit anyway?` : "Submit your answers now?"}</p>
            <div className={styles.nav}>
              <button type="button" className={styles.primary} onClick={() => finish(false)}>Yes, submit</button>
              <button type="button" className={styles.ghost} onClick={() => setConfirming(false)}>Keep working</button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.primary} onClick={() => setConfirming(true)}>Submit exam</button>
        )}
        </aside>
        </div>
      </section>
    );
  }

  /* ------------------------------ results ------------------------------ */
  if (finished) {
    const { exam: ex, result, seconds, timedOut } = finished;
    const weak = Object.entries(result.topics)
      .filter(([, [c, t]]) => t > 0 && c / t < 0.6)
      .map(([id]) => TOPIC_LABEL[id]);
    const rows = ex.questions.map((q, i) => ({ q, i, given: ex.answers[i] })).filter((r) => !wrongOnly || r.given !== r.q.correct);
    return (
      <section className={bare ? `${styles.card} ${styles.bare}` : styles.card} aria-label="CBT results">
        <div className={styles.head}><h3>Your result</h3></div>
        {timedOut && <p className={styles.warn}>Time is up. Your answers so far were submitted.</p>}
        <div className={styles.cols}>
        <div className={styles.colMain}>
        <div className={styles.score}>
          <div className={styles.ring} style={{ ["--p" as string]: `${result.percent}` }}>
            <strong>{result.percent}%</strong>
          </div>
          <div>
            <p className={styles.big}>{result.score} of {result.total} correct</p>
            <p className={styles.meta}>{gradeLabel(result.percent)} · {clock(seconds)} used{result.unanswered ? ` · ${result.unanswered} unanswered` : ""}</p>
          </div>
        </div>

        <h4 className={styles.h4}>By topic</h4>
        <ul className={styles.topics}>
          {Object.entries(result.topics).map(([id, [c, t]]) => (
            <li key={id}>
              <span>{TOPIC_LABEL[id]}</span>
              <div className={styles.bar} aria-hidden="true"><i style={{ width: `${(c / t) * 100}%` }} /></div>
              <b>{c}/{t}</b>
            </li>
          ))}
        </ul>
        {weak.length > 0 && <p className={styles.advice}>Revise: {weak.join(", ")}.</p>}

        <div className={styles.nav}>
          <button type="button" className={styles.primary} onClick={start}>New exam</button>
          <button type="button" className={styles.ghost} onClick={() => setFinished(null)}>Change settings</button>
        </div>
        </div>
        <div className={styles.colSide}>
        <div className={styles.reviewHead}>
          <h4 className={styles.h4}>Review and explanations</h4>
          <label className={styles.inline}><input type="checkbox" checked={wrongOnly} onChange={(e) => setWrongOnly(e.target.checked)} /> Wrong only</label>
        </div>
        <ol className={styles.review}>
          {rows.length === 0 && <li className={styles.perfect}>Nothing wrong to review. Well done.</li>}
          {rows.map(({ q, i, given }) => {
            const right = given === q.correct;
            return (
              <li key={q.id} value={i + 1} className={right ? styles.rGood : styles.rBad}>
                <p className={styles.question}>{q.text}</p>
                <p><b>{right ? "Your answer ✓" : "Your answer ✗"}:</b> {given === null ? "no answer" : `${LETTERS[given]}. ${q.options[given]}`}</p>
                {!right && <p><b>Correct:</b> {LETTERS[q.correct]}. {q.options[q.correct]}</p>}
                <p className={styles.why}>{q.explanation}</p>
              </li>
            );
          })}
        </ol>
        </div>
        </div>
      </section>
    );
  }

  /* ------------------------------ setup ------------------------------ */
  const best = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null;
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length) : null;
  const last = attempts[attempts.length - 1];
  const totals: Record<string, [number, number]> = {};
  for (const a of attempts) for (const [id, [c, t]] of Object.entries(a.topics)) {
    const cur = totals[id] ?? [0, 0];
    totals[id] = [cur[0] + c, cur[1] + t];
  }

  return (
    <section className={bare ? `${styles.card} ${styles.bare}` : styles.card} aria-label="CBT practice">
      <div className={styles.head}>
        <h3>CBT practice</h3>
        <span>Exam style</span>
      </div>
      <p className={styles.help}>{bank.intro}</p>

      <div className={styles.cols}>
      <div className={styles.colMain}>
      <div className={styles.fields}>
      <label className={styles.field}>
        <span>Number of questions</span>
        <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
          {COUNTS.map((c) => <option key={c} value={c}>{c} questions</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span>Difficulty</span>
        <select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
          <option value="mixed">Mixed</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <label className={styles.field}>
        <span>Topic</span>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="all">All topics</option>
          {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </label>
      </div>
      <label className={styles.inline}>
        <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
        Timed ({clock(asked * SECONDS_PER_QUESTION)} for {asked} questions)
      </label>
      {available === 0 && <p className={styles.warn}>No questions match that difficulty and topic. Try Mixed.</p>}
      {available > 0 && available < count && <p className={styles.note}>Only {available} questions match, so the exam will have {available}.</p>}
      <button type="button" className={styles.primary} onClick={start} disabled={available === 0}>Start exam</button>
      </div>
      <div className={styles.colSide}>
      <h4 className={`${styles.h4} ${styles.h4First}`}>Your progress</h4>
      {attempts.length === 0 ? (
        <p className={styles.note}>No attempts yet. Results are kept in this browser only.</p>
      ) : (
        <>
          <div className={styles.stats}>
            <div><span>Attempts</span><b>{attempts.length}</b></div>
            <div><span>Best</span><b>{best}%</b></div>
            <div><span>Average</span><b>{avg}%</b></div>
            <div><span>Last</span><b>{last.percent}%</b></div>
          </div>
          <ul className={styles.topics}>
            {Object.entries(totals).map(([id, [c, t]]) => (
              <li key={id}>
                <span>{TOPIC_LABEL[id] ?? id}</span>
                <div className={styles.bar} aria-hidden="true"><i style={{ width: `${t ? (c / t) * 100 : 0}%` }} /></div>
                <b>{t ? Math.round((c / t) * 100) : 0}%</b>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.link} onClick={clearAttempts}>Clear my progress</button>
        </>
      )}
      </div>
      </div>
      <p className={styles.note}>{bank.note}</p>
    </section>
  );
}
