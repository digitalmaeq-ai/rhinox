import type { Metadata } from "next";
import Link from "next/link";

import { termKits, totals, weekPacks, YEAR_FILES } from "@/lib/resources/library";
import DownloadsShelf from "./DownloadsShelf";
import styles from "./downloads.module.css";

export const metadata: Metadata = {
  title: "Free Downloads | Rhinox Scientifica",
  description: "Free lesson plans, printable cards, guides, review sheets and question banks for all 39 weeks of Think • Move • Code! Nursery 1.",
};

export default function FreeDownloadsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={`rx-container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Resources · Free downloads</p>
            <h1 className={styles.title}>Print it. Cut it. <span>Teach it today.</span></h1>
            <p className={styles.lead}>
              The full Think • Move • Code! Nursery 1 pack, free for teachers and parents: a lesson plan, cards, guide, project sheet, review sheet and question bank for every week.
            </p>
            <ul className={styles.stats} aria-label="What is here">
              <li><strong>{totals.weeks}</strong> weeks</li>
              <li><strong>3</strong> terms</li>
              <li><strong>{totals.files}</strong> files</li>
            </ul>
          </div>
          <div className={styles.stack} aria-hidden="true">
            <span className={`${styles.sheet} ${styles.s1}`}>Lesson plan</span>
            <span className={`${styles.sheet} ${styles.s2}`}>Cards</span>
            <span className={`${styles.sheet} ${styles.s3}`}>Question bank</span>
            <span className={`${styles.sheet} ${styles.s4}`}>Review sheet</span>
          </div>
        </div>
      </header>

      <section className={styles.kits} aria-labelledby="kits-title">
        <div className={`rx-container ${styles.kitsInner}`}>
          <h2 id="kits-title" className={styles.kitsTitle}>Whole-term packs</h2>
          <ul className={styles.kitList}>
            {termKits.map((k) => (
              <li key={k.term} className={styles.kit} data-term={k.term}>
                <p className={styles.kitTerm}>Term {k.term}</p>
                <p className={styles.kitName}>{k.title}</p>
                <div className={styles.kitLinks}>
                  <a href={k.cards} download>All printable cards</a>
                  <a href={k.stickers} download>Step Star stickers</a>
                  <a href={k.badge} download>Badge image</a>
                </div>
              </li>
            ))}
            <li className={`${styles.kit} ${styles.kitYear}`}>
              <p className={styles.kitTerm}>Whole year</p>
              <p className={styles.kitName}>All 39 weeks together</p>
              <div className={styles.kitLinks}>
                {YEAR_FILES.map((y) => (
                  <a key={y.href} href={y.href} download>{y.title}</a>
                ))}
                {YEAR_FILES[0].extra && <a href={YEAR_FILES[0].extra.href} download>Question bank (Word)</a>}
              </div>
            </li>
          </ul>
        </div>
      </section>

      <DownloadsShelf packs={weekPacks} />

      <section className={styles.more}>
        <div className={`rx-container ${styles.moreInner}`}>
          <p>Looking for books, kits or lab equipment? <Link href="/shop">Visit the shop</Link>. To print the book itself or order for a whole school, <Link href="/schools/request-a-quote">request a quote</Link>.</p>
        </div>
      </section>
    </main>
  );
}
