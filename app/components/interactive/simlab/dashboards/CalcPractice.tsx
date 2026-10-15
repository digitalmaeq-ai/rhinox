"use client";

import { useState, type ReactNode } from "react";

import { fmt, grade, type Verdict } from "../specs/titration-practice";
import type { CalcKindOption, CalcProblem } from "../shell/types";
import styles from "./TitrationPractice.module.css";

const VERDICT_TEXT: Record<Verdict, string> = {
  correct: "Correct.",
  close: "Close, but check your rounding.",
  wrong: "Not quite. Compare your steps with the working.",
};

type Props = {
  kinds: CalcKindOption[];
  /** Makes a new problem from a seed (and an optional kind). */
  generate: (seed: number, kind?: string) => CalcProblem;
  /** The learner's own experiment as a problem, once they have enough results. */
  mine?: CalcProblem | null;
  /** Shown beside the "My experiment" button when it is not unlocked yet. */
  mineLocked?: string;
  /** Extra sentence after a wrong or right answer for the learner's own experiment. */
  mineNote?: string;
  /** Small print under the problem (constants, units). */
  footnote?: ReactNode;
  /** Element ids so the tab and its panel stay linked. */
  tabId: string;
  panelId: string;
  hidden: boolean;
};

// Calculation practice shared by every lab: fresh numbers each time, an
// answer box graded to 1 % (and "close" to 5 %), and the full working.
export default function CalcPractice({ kinds, generate, mine, mineLocked, mineNote, footnote, tabId, panelId, hidden }: Props) {
  const [source, setSource] = useState<"generated" | "mine">("generated");
  const [kind, setKind] = useState<string>("mixed");
  const [seed, setSeed] = useState(20241);
  const [input, setInput] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [showWork, setShowWork] = useState(false);
  const [tally, setTally] = useState({ right: 0, total: 0 });

  const useMine = source === "mine" && !!mine;
  const problem = useMine && mine ? mine : generate(seed, kind === "mixed" ? undefined : kind);

  const clear = () => {
    setInput("");
    setVerdict(null);
    setShowWork(false);
  };

  function check() {
    const given = Number(input.replace(",", "."));
    if (!input.trim() || Number.isNaN(given)) return;
    const v = grade(problem.answer, given);
    setVerdict(v);
    setTally((t) => ({ right: t.right + (v === "correct" ? 1 : 0), total: t.total + 1 }));
  }

  return (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId} hidden={hidden}>
      <section className={styles.card} aria-label="Calculation practice">
        <div className={styles.head}>
          <h3>Calculation practice</h3>
          <span>{tally.right} of {tally.total} correct</span>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.tabs} role="group" aria-label="Problem source">
            <button type="button" aria-pressed={source === "generated"} className={source === "generated" ? styles.tabOn : ""} onClick={() => { setSource("generated"); clear(); }}>
              New numbers
            </button>
            <button type="button" aria-pressed={source === "mine"} className={source === "mine" ? styles.tabOn : ""} onClick={() => { setSource("mine"); clear(); }} disabled={!mine}>
              My experiment
            </button>
          </div>
          {!useMine && (
            <label className={styles.field}>
              <span>Type of problem</span>
              <select value={kind} onChange={(e) => { setKind(e.target.value); clear(); }}>
                <option value="mixed">Mixed</option>
                {kinds.map((k) => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        {source === "mine" && !mine && mineLocked && <p className={styles.note}>{mineLocked}</p>}

        <p className={styles.problem}>{problem.prompt}</p>
        <div className={styles.answerRow}>
          <input
            type="text"
            inputMode="decimal"
            aria-label={`Your answer in ${problem.unit}`}
            placeholder="Your answer"
            value={input}
            onChange={(e) => { setInput(e.target.value); setVerdict(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") check(); }}
          />
          <span>{problem.unit}</span>
          <button type="button" className={styles.btn} onClick={check} disabled={!input.trim()}>Check</button>
          <span className={styles.sep} aria-hidden="true" />        
          <button type="button" className={styles.btnGhost} onClick={() => setShowWork((v) => !v)} aria-expanded={showWork}>
            {showWork ? "Hide working" : "Show working"}
          </button>
          {!useMine && <button type="button" className={styles.btnGhost} onClick={() => { setSeed(Math.floor(Math.random() * 1e9)); clear(); }}>New problem</button>}
        </div>
        {verdict && (
          <p className={`${styles.verdict} ${verdict === "correct" ? styles.vGood : verdict === "close" ? styles.vClose : styles.vBad}`} role="status" aria-live="polite">
            {VERDICT_TEXT[verdict]} {verdict !== "correct" && <>The answer is {fmt(problem.answer)} {problem.unit}.</>}
            {useMine && mineNote && <> {mineNote}</>}
          </p>
        )}
        {showWork && (
          <ol className={styles.working}>
            {problem.working.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        )}
        {footnote && <p className={styles.note}>{footnote}</p>}
      </section>
    </div>
  );
}
