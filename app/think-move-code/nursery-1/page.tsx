import type { Metadata } from "next";
import Link from "next/link";

import styles from "../tmc.module.css";
import { NURSERY_1_TERMS, NURSERY_1_WEEKS, YEAR_FILES, weekPath } from "@/lib/tmc/nursery-1";

export const metadata: Metadata = {
  title: "Think • Move • Code! Nursery 1 week pages | Rhinox Scientifica",
  description: "Printable cards, games and parent notes for every week of Think • Move • Code! Nursery 1.",
};

export default function Nursery1Page() {
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.narrow}`}>
        <p className={styles.eyebrow}>Think • Move • Code!</p>
        <h1 className={styles.title}>Nursery 1 week pages</h1>
        <p className={styles.intro}>
          Every week of the book has a page with printable cards, two short games, a note for parents and carers, and the teacher’s lesson plan, guide, project sheet, review sheet and question bank.
          Scan the QR code on the week’s Activity Book page, or choose a week below.
        </p>

        <section className={`${styles.section} ${styles.term}`} aria-labelledby="year-files">
          <h2 id="year-files" className={styles.sectionTitle}>
            Whole-year downloads
          </h2>
          <p className={styles.sectionLead}>For teachers who like to print a whole term at once.</p>
          <ul className={styles.fileList}>
            {YEAR_FILES.map((file) => (
              <li key={file.href}>
                <a href={file.href} download>
                  <strong>{file.title}</strong>
                  <span>{file.detail}</span>
                </a>
                {"extra" in file ? (
                  <a className={styles.fileExtra} href={file.extra.href} download>
                    {file.extra.label}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {NURSERY_1_TERMS.map((term) => (
          <section key={term.term} id={`term-${term.term}`} className={`${styles.section} ${styles.term}`} aria-labelledby={`term-${term.term}-title`}>
            <h2 id={`term-${term.term}-title`} className={styles.sectionTitle}>
              Term {term.term}: {term.title}
            </h2>
            <ul className={styles.weekList}>
              {NURSERY_1_WEEKS.filter((item) => item.term === term.term).map((item) => (
                <li key={item.week}>
                  <Link href={weekPath(item)}>
                    <small>Week {item.week}</small>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
