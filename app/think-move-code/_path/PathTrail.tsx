"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "./path.module.css";
import {
  nextUp,
  progressStorageKey,
  parseProgress,
  serializeProgress,
  stopProgress,
  summarize,
  toggleStep,
} from "@/lib/tmc-path/progress";
import { HINT_TIERS, MAX_HINT_LEVEL, hintsUpTo, todaysStep, type StepKind } from "@/lib/tmc-path/guide";
import type { PathView } from "@/lib/tmc-path/view";

const KIND_HINT: Record<string, string> = {
  learn: "Read the week",
  play: "Put it in order",
  match: "Find the pairs",
  quiz: "Try the quiz",
};

// The trail with progress. An adult marks each step done; the ticks are kept only in this browser
// on this device (see lib/tmc-path/progress.ts). Nothing is sent anywhere.
export default function PathTrail({ view, levelSlug }: { view: PathView; levelSlug: string }) {
  const storageKey = useMemo(() => progressStorageKey(levelSlug), [levelSlug]);
  const validIds = useMemo(() => new Set(view.stops.flatMap((stop) => stop.steps.map((step) => step.id))), [view]);
  const [done, setDone] = useState<ReadonlySet<string>>(() => new Set());
  const [canSave, setCanSave] = useState(true);
  const [askReset, setAskReset] = useState(false);
  // How many hints are showing per step. Kept in memory only, never stored.
  // Weeks the visitor opened or closed by hand. Otherwise only the week with the next step is open.
  const [openByHand, setOpenByHand] = useState<Record<string, boolean>>({});
  const [hintLevel, setHintLevel] = useState<Record<string, number>>({});

  // Read what this browser remembers once the page is on screen, and follow changes from other tabs.
  useEffect(() => {
    const load = () => {
      try {
        setDone(parseProgress(window.localStorage.getItem(storageKey), validIds));
      } catch {
        setCanSave(false);
      }
    };
    load();
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [validIds, storageKey]);

  const save = (next: ReadonlySet<string>) => {
    setDone(next);
    try {
      if (next.size === 0) window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, serializeProgress(next));
      setCanSave(true);
    } catch {
      setCanSave(false);
    }
  };

  const summary = summarize(view, done);
  const next = nextUp(view, done);
  const nothingDone = summary.stepsDone === 0;
  const today = todaysStep(view, done);
  const terms = [...new Set(view.stops.map((stop) => stop.term))];

  return (
    <>
      <div className={styles.topRow}>
      <section className={styles.today} aria-labelledby="today-title">
        <Image className={styles.todayAyo} src="/tmc/n1/ayo.png" alt="" width={72} height={108} />
        <div className={styles.todayBody}>
          <h2 id="today-title" className={styles.panelTitle}>
            Today&apos;s next step
          </h2>
          {today ? (
            <>
              <p className={styles.todayText}>{today.message}</p>
              <Link className={styles.todayLink} href={today.href}>
                Go to {today.stepLabel}
              </Link>
            </>
          ) : (
            <p className={styles.todayText}>RhinoBot says: every step is done. Well done! You can open any week again to practise.</p>
          )}
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="progress-title">
        <h2 id="progress-title" className={styles.panelTitle}>
          Your progress
        </h2>
        <p className={styles.panelNumbers} aria-live="polite">
          <strong>
            {summary.stepsDone} of {summary.stepsTotal}
          </strong>{" "}
          steps done · <strong>{summary.weeksComplete}</strong> of {summary.weeksTotal} weeks complete
        </p>
        <p className={styles.privacy}>
          A grown-up marks each step done. Progress is saved only in this browser, on this device. There are no names or accounts, and nothing is sent to us. Clearing your browser data, or using another device, starts again from the beginning.
        </p>
        {!canSave ? (
          <p className={styles.warn} role="status">
            This browser is not letting us save progress, so ticks will be lost when you leave this page.
          </p>
        ) : null}
        <div className={styles.panelActions}>
          {askReset ? (
            <>
              <span className={styles.confirmText}>Clear all saved progress on this device?</span>
              <button
                type="button"
                className={styles.danger}
                onClick={() => {
                  save(new Set());
                  setAskReset(false);
                }}
              >
                Yes, clear it
              </button>
              <button type="button" className={styles.secondary} onClick={() => setAskReset(false)}>
                Keep it
              </button>
            </>
          ) : (
            <button type="button" className={styles.secondary} disabled={nothingDone} onClick={() => setAskReset(true)}>
              Reset progress
            </button>
          )}
        </div>
      </section>
      </div>

      {terms.map((term) => (
        <section key={term} className={styles.term} aria-labelledby={`term-${term}`}>
          <h2 id={`term-${term}`} className={styles.termTitle}>
            Term {term}
          </h2>
          <ol className={styles.trail}>
            {view.stops
              .filter((stop) => stop.term === term)
              .map((stop) => {
                const progress = stopProgress(stop, done);
                const showStart = nothingDone && stop.term === 1 && stop.week === 1;
                const autoOpen = today?.stopId === stop.id;
                const isOpen = openByHand[stop.id] ?? autoOpen;
                return (
                  <li key={stop.id} className={styles.stop}>
                    <span className={`${styles.badge} ${progress.complete ? styles.badgeDone : ""}`} aria-hidden="true">
                      {progress.complete ? "✓" : stop.week}
                    </span>
                    <details
                      className={styles.card}
                      open={isOpen}
                      onToggle={(event) => {
                        const open = event.currentTarget.open;
                        if (open !== isOpen) setOpenByHand((prev) => ({ ...prev, [stop.id]: open }));
                      }}
                    >
                      <summary className={styles.summary}>
                      <h3 className={styles.stopTitle}>
                        <span className={styles.weekLabel}>Week {stop.week}</span> {stop.title}
                        {showStart ? <span className={styles.start}>Start here</span> : null}
                        {progress.complete ? <span className={styles.complete}>Week complete</span> : null}
                      </h3>
                      <span className={styles.stars} role="img" aria-label={`${progress.done} of ${progress.total} steps done`}>
                        <span aria-hidden="true">
                          {Array.from({ length: progress.total }, (_, index) => (index < progress.done ? "★" : "☆")).join(" ")}
                        </span>
                        <span className={styles.starsText} aria-hidden="true">
                          {progress.done} of {progress.total}
                        </span>
                      </span>
                      </summary>
                      {progress.complete ? (
                        <p className={styles.celebrate}>
                          <span aria-hidden="true">🎉 </span>Well done! All four steps are done.
                        </p>
                      ) : null}
                      <ul className={styles.steps}>
                        {stop.steps.map((step) => {
                          const isDone = done.has(step.id);
                          const isNext = next?.stepId === step.id;
                          return (
                            <li key={step.id} className={`${styles.stepItem} ${isDone ? styles.stepDone : ""}`}>
                              <Link className={styles.step} href={step.href}>
                                <span className={styles.stepLabel}>{step.label}</span>
                                <span className={styles.stepHint}>{KIND_HINT[step.kind] ?? ""}</span>
                                {isNext && !nothingDone ? <span className={styles.nextUp}>Next up</span> : null}
                              </Link>
                              <button
                                type="button"
                                className={styles.tick}
                                aria-pressed={isDone}
                                aria-label={`Term ${stop.term} week ${stop.week} ${step.label}: ${isDone ? "done" : "mark as done"}`}
                                onClick={() => save(toggleStep(done, step.id, validIds))}
                              >
                                {isDone ? "✓ Done" : "Mark done"}
                              </button>
                              {(() => {
                                const level = hintLevel[step.id] ?? 0;
                                const kind = step.kind as StepKind;
                                if (!(kind in HINT_TIERS)) return null;
                                return (
                                  <div className={styles.hints}>
                                    {level > 0 ? (
                                      <ul className={styles.hintList} aria-live="polite">
                                        {hintsUpTo(kind, level).map((text) => (
                                          <li key={text}>{text}</li>
                                        ))}
                                      </ul>
                                    ) : null}
                                    {level < MAX_HINT_LEVEL ? (
                                      <button
                                        type="button"
                                        className={styles.hintButton}
                                        onClick={() => setHintLevel((prev) => ({ ...prev, [step.id]: level + 1 }))}
                                      >
                                        {level === 0 ? "Need a hint?" : "Another hint"}
                                        <span className={styles.srOnly}>{` for term ${stop.term} week ${stop.week} ${step.label}`}</span>
                                      </button>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </li>
                );
              })}
          </ol>
        </section>
      ))}
    </>
  );
}
