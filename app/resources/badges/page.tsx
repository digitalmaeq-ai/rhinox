import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { badges, NURSERY_1_WEEKS, termKits } from "@/lib/resources/library";
import styles from "./badges.module.css";

export const metadata: Metadata = {
  title: "Learning Badges | Rhinox Scientifica",
  description: "The Step Thinker badges for Think • Move • Code! Nursery 1: one for each term and a year badge. See what each one celebrates and download them.",
};

const [t1, t2, t3, year] = badges;
const showcase = NURSERY_1_WEEKS.filter((w) => w.week === 13);

export default function BadgesPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.stars} aria-hidden="true" />
        <div className={`rx-container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Resources · Learning badges</p>
            <h1 className={styles.title}>Every step <span>earns a star.</span></h1>
            <p className={styles.lead}>
              Four Step Thinker badges: one for each term of Think • Move • Code! Nursery 1, and a gold one for the whole year. Download them, print them and award them at the Week 13 Showcase.
            </p>
          </div>
          <div className={styles.cabinet} aria-hidden="true">
            {[t1, t2, t3].map((b, i) => (
              <div key={b.id} className={styles.mini} style={{ ["--d" as string]: `${i * 0.12}s` }}>
                <Image src={b.image} alt="" width={120} height={144} />
              </div>
            ))}
            <div className={`${styles.mini} ${styles.miniYear}`}>
              <Image src={year.image} alt="" width={150} height={180} />
            </div>
          </div>
        </div>
      </header>

      <section className={styles.grid} aria-labelledby="all-badges">
        <div className={`rx-container ${styles.gridInner}`}>
          <h2 id="all-badges" className={styles.sr}>All badges</h2>
          <ul className={styles.cards}>
            {badges.map((b) => (
              <li key={b.id} className={`${styles.card} ${b.id === "year" ? styles.cardYear : ""}`} style={{ ["--main" as string]: b.colour.main, ["--soft" as string]: b.colour.soft, ["--ink" as string]: b.colour.ink }}>
                <div className={styles.medal}>
                  <Image src={b.image} alt={`${b.name}, ${b.sub} badge`} width={300} height={361} sizes="(max-width: 700px) 60vw, 280px" />
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.sub}>{b.sub}</p>
                  <h3 className={styles.name}>{b.name}</h3>
                  <p className={styles.idea}>{b.idea}</p>
                  <p className={styles.skillsHead}>{b.id === "year" ? "Brings together" : "Celebrates a child who can"}</p>
                  <ul className={styles.skills}>
                    {b.skills.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                  <div className={styles.actions}>
                    <a href={b.image} download className={styles.btn}>Download badge</a>
                    {b.term && <a href={termKits[b.term - 1].stickers} download className={styles.btnGhost}>Step Star stickers</a>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.how} aria-labelledby="how-title">
        <div className={`rx-container ${styles.howInner}`}>
          <h2 id="how-title" className={styles.howTitle}>How a badge is awarded</h2>
          <ol className={styles.steps}>
            <li><strong>Learn all term.</strong><span>Twelve weeks of lessons, games and hands-on practice.</span></li>
            <li><strong>Show it in Week 12.</strong><span>An observation and a practical check. Nothing is marked or graded.</span></li>
            <li><strong>Celebrate in Week 13.</strong><span>The Showcase: children show their family what they can do, and the badges are given out.</span></li>
          </ol>
          <p className={styles.note}>Teachers: every child receives warm praise for what they can now do. The badge recognises secure skills, so keep encouraging the rest.</p>
          <div className={styles.links}>
            {showcase.map((w) => (
              <Link key={w.term} href={`/think-move-code/nursery-1/term-${w.term}/week-${w.week}`}>Term {w.term} Showcase week →</Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
