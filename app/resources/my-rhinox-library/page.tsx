import type { Metadata } from "next";
import Link from "next/link";

import { badges, NURSERY_1_TERMS, NURSERY_1_WEEKS, TERM_COLOURS } from "@/lib/resources/library";
import LibraryDesk, { type DeskTerm, type DeskWeek } from "./LibraryDesk";
import styles from "./library.module.css";

export const metadata: Metadata = {
  title: "My Rhinox Library | Rhinox Scientifica",
  description: "Keep track of your Think • Move • Code! Nursery 1 weeks and see your badges come in. Saved in your own browser.",
};

export default function MyLibraryPage() {
  const weeks: DeskWeek[] = NURSERY_1_WEEKS.map((w) => ({ term: w.term, week: w.week, title: w.title, href: `/think-move-code/nursery-1/term-${w.term}/week-${w.week}` }));
  const terms: DeskTerm[] = NURSERY_1_TERMS.map((t) => ({
    term: t.term,
    title: t.title,
    colour: TERM_COLOURS[t.term].main,
    soft: TERM_COLOURS[t.term].soft,
    ink: TERM_COLOURS[t.term].ink,
    badge: badges[t.term - 1].image,
  }));

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={`rx-container ${styles.heroInner}`}>
          <div>
            <p className={styles.eyebrow}>Resources · My Rhinox Library</p>
            <h1 className={styles.title}>My learning <span>desk.</span></h1>
            <p className={styles.lead}>Tick off each Nursery 1 week as you finish it and watch your badges come in. No account needed: it is saved in this browser, on this device.</p>
          </div>
          <p className={styles.soon}>Full accounts, saved resources and projects are coming in a later phase. <Link href="/resources">Browse all resources</Link></p>
        </div>
      </header>
      <section className={styles.deskWrap} aria-label="My progress">
        <div className={`rx-container ${styles.deskInner}`}>
          <LibraryDesk weeks={weeks} terms={terms} />
        </div>
      </section>
    </main>
  );
}
