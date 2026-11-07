"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import styles from "./library.module.css";

export interface DeskWeek { term: number; week: number; title: string; href: string }
export interface DeskTerm { term: number; title: string; colour: string; soft: string; ink: string; badge: string }

const KEY = "rhinox-library-n1";
const EVENT = "rhinox-library-change";
const EMPTY = "[]";

// The progress lives only in this browser. Reads and writes are wrapped because storage can be blocked.
function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export default function LibraryDesk({ weeks, terms }: { weeks: DeskWeek[]; terms: DeskTerm[] }) {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY);
  let done: string[] = [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) done = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    done = [];
  }
  const isDone = (w: DeskWeek) => done.includes(`${w.term}-${w.week}`);

  const toggle = (w: DeskWeek) => {
    const id = `${w.term}-${w.week}`;
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage blocked: nothing is saved */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  const reset = () => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  const total = weeks.length;
  const count = weeks.filter(isDone).length;

  return (
    <div className={styles.desk}>
      <aside className={styles.side} aria-label="Your progress">
        <p className={styles.sideHead}>Nursery 1</p>
        <div className={styles.big} aria-label={`${count} of ${total} weeks done`}>
          <strong>{count}</strong><span>of {total} weeks</span>
          <div className={styles.bar}><i style={{ width: `${(count / total) * 100}%` }} /></div>
        </div>
        <ul className={styles.termList}>
          {terms.map((t) => {
            const tw = weeks.filter((w) => w.term === t.term);
            const n = tw.filter(isDone).length;
            return (
              <li key={t.term}>
                <a href={`#term-${t.term}`} style={{ ["--c" as string]: t.colour }}>
                  <span className={styles.dot} />
                  <span>Term {t.term}</span>
                  <em>{n}/{tw.length}</em>
                </a>
              </li>
            );
          })}
        </ul>
        <button type="button" className={styles.reset} onClick={reset} disabled={count === 0}>Start again</button>
        <p className={styles.local}>Saved on this device only. Nobody else can see it.</p>
      </aside>

      <div className={styles.main}>
        {terms.map((t) => {
          const tw = weeks.filter((w) => w.term === t.term);
          const n = tw.filter(isDone).length;
          const complete = n === tw.length;
          return (
            <section key={t.term} id={`term-${t.term}`} className={styles.term} style={{ ["--c" as string]: t.colour, ["--soft" as string]: t.soft, ["--ink" as string]: t.ink }}>
              <header className={styles.termHead}>
                <div>
                  <p className={styles.termKicker}>Term {t.term}</p>
                  <h2 className={styles.termTitle}>{t.title}</h2>
                </div>
                <div className={`${styles.reward} ${complete ? styles.rewardOn : ""}`}>
                  <Image src={t.badge} alt="" width={44} height={53} />
                  {complete ? (
                    <span>Term complete! <a href={t.badge} download>Badge</a> · <Link href="/resources/certificates">Certificate</Link></span>
                  ) : (
                    <span>{tw.length - n} weeks to your badge</span>
                  )}
                </div>
              </header>
              <ul className={styles.weeks}>
                {tw.map((w) => (
                  <li key={w.week}>
                    <label className={`${styles.week} ${isDone(w) ? styles.weekDone : ""}`}>
                      <input type="checkbox" checked={isDone(w)} onChange={() => toggle(w)} />
                      <span className={styles.tick} aria-hidden="true">✓</span>
                      <span className={styles.weekText}>
                        <b>Week {w.week}</b>
                        <span>{w.title}</span>
                      </span>
                    </label>
                    <Link href={w.href} className={styles.open}>Open</Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
