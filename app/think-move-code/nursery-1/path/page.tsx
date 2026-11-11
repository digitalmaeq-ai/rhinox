import type { Metadata } from "next";
import Link from "next/link";

import styles from "./path.module.css";
import { getNursery1PathView } from "@/lib/tmc-path/learning-path.server";

export const metadata: Metadata = {
  title: "Learning Path · Think • Move • Code! Nursery 1 | Rhinox Scientifica",
  description: "Follow Think • Move • Code! Nursery 1 one step at a time: learn, play, match and quiz, week by week.",
};

const KIND_HINT: Record<string, string> = {
  learn: "Read the week",
  play: "Put it in order",
  match: "Find the pairs",
  quiz: "Try the quiz",
};

// A read-only trail through the Nursery 1 weeks. It holds only order and links; every step opens
// content that already exists. Nothing is saved: progress comes in a later phase.
export default function LearningPathPage() {
  const view = getNursery1PathView();
  const terms = [...new Set(view.stops.map((stop) => stop.term))];

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.wrap}`}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link href="/think-move-code">Think • Move • Code! Nursery 1</Link>
            </li>
            <li aria-current="page">Learning Path</li>
          </ol>
        </nav>

        <header className={styles.head}>
          <p className={styles.eyebrow}>Nursery 1</p>
          <h1 className={styles.title}>Learning Path</h1>
          <p className={styles.lead}>
            One week at a time, in four short steps: learn, play, match and quiz. Start at Week 1, or jump to any week you like. Nothing is locked.
          </p>
          <p className={styles.note}>
            Grown-ups: this path only links to the games and quizzes already on the week pages. It does not save progress yet.{" "}
            <Link href="/think-move-code#weeks">Prefer printables and guides? Use Week by week.</Link>
          </p>
        </header>

        {terms.map((term) => (
          <section key={term} className={styles.term} aria-labelledby={`term-${term}`}>
            <h2 id={`term-${term}`} className={styles.termTitle}>
              Term {term}
            </h2>
            <ol className={styles.trail}>
              {view.stops
                .filter((stop) => stop.term === term)
                .map((stop) => {
                  const first = stop.term === 1 && stop.week === 1;
                  return (
                    <li key={stop.id} className={styles.stop}>
                      <span className={styles.badge} aria-hidden="true">
                        {stop.week}
                      </span>
                      <div className={styles.card}>
                        <h3 className={styles.stopTitle}>
                          <span className={styles.weekLabel}>Week {stop.week}</span> {stop.title}
                          {first ? <span className={styles.start}>Start here</span> : null}
                        </h3>
                        <ul className={styles.steps}>
                          {stop.steps.map((step) => (
                            <li key={step.id}>
                              <Link className={styles.step} href={step.href}>
                                <span className={styles.stepLabel}>{step.label}</span>
                                <span className={styles.stepHint}>{KIND_HINT[step.kind] ?? ""}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
