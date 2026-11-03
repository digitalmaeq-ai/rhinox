import Link from "next/link";

import styles from "./home.module.css";
import OpenOnHash from "./OpenOnHash";
import { NURSERY_1_TERMS, NURSERY_1_WEEKS, YEAR_FILES, weekAssets, weekPath } from "@/lib/tmc/nursery-1";
import { interactiveLessonFor, lessonsInReview, nursery1LessonPath } from "@/lib/tmc/lessons";

// The Think • Move • Code! home: every Nursery 1 week in order (Term, then Week), as accordions.
// Plain <details> elements, so it works without scripts and with the keyboard.
export default function TmcHome() {
  const inReview = lessonsInReview();

  return (
    <main className={styles.page}>
      <OpenOnHash />
      <div className={`rx-container ${styles.wrap}`}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Think • Move • Code!</p>
          <h1 className={styles.title}>Nursery 1</h1>
          <p className={styles.lead}>Open a term, then pick a week. Each week has printable cards, two games and the teacher’s lesson pack.</p>
          <Link className={styles.studioLink} href="/coding-robotics/studio">
            Practise in Code Studio →
          </Link>
        </header>

        {NURSERY_1_TERMS.map((term) => {
          const weeks = NURSERY_1_WEEKS.filter((item) => item.term === term.term);
          return (
            <details key={term.term} id={`term-${term.term}`} className={styles.term} open={term.term === 1}>
              <summary>
                <span className={styles.termName}>Term {term.term}</span>
                <span className={styles.termTitle}>{term.title}</span>
                <span className={styles.count}>{weeks.length} weeks</span>
              </summary>
              <ol className={styles.weeks}>
                {weeks.map((item) => {
                  const assets = weekAssets(item);
                  const lesson = interactiveLessonFor(item);
                  return (
                    <li key={item.week} className={styles.week}>
                      <details className={styles.weekDetails}>
                        <summary>
                          <span className={styles.weekNo}>Week {item.week}</span>
                          <span className={styles.weekTitle}>{item.title}</span>
                        </summary>
                        <div className={styles.panel}>
                          <p className={styles.goal}>{item.goal || item.kind}</p>
                          <ul className={styles.links}>
                            <li>
                              <a href={`${assets}/${item.cardsFile}`} download>
                                Printable cards (PDF)
                              </a>
                            </li>
                            <li>
                              <Link href={`${weekPath(item)}/play/pictures`}>Game: Find the Pairs</Link>
                            </li>
                            <li>
                              <Link href={`${weekPath(item)}/play/screen`}>Game: {item.screenGame}</Link>
                            </li>
                            {lesson ? (
                              <li>
                                <Link href={nursery1LessonPath(item)}>Lesson with RhinoBot</Link>
                              </li>
                            ) : null}
                            <li>
                              <Link href={weekPath(item)}>Teacher pack and parent note</Link>
                            </li>
                          </ul>
                        </div>
                      </details>
                      <Link className={styles.start} href={weekPath(item)} aria-label={`Start Week ${item.week}: ${item.title}`}>
                        Start
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}

        <details className={styles.extra}>
          <summary>
            <span className={styles.termTitle}>Whole-year downloads</span>
          </summary>
          <ul className={styles.downloads}>
            {YEAR_FILES.map((file) => (
              <li key={file.href}>
                <a href={file.href} download>
                  {file.title}
                </a>
                <span>{file.detail}</span>
                {"extra" in file ? (
                  <a href={file.extra.href} download>
                    {file.extra.label}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </details>

        {inReview.length ? (
          <details className={styles.extra}>
            <summary>
              <span className={styles.termTitle}>Interactive lessons in review</span>
              <span className={styles.count}>{inReview.length}</span>
            </summary>
            <p className={styles.reviewNote}>These RhinoBot lessons are still being checked and are not ready for learners yet.</p>
            <ul className={styles.reviewList}>
              {inReview.map((item) => (
                <li key={item.id}>
                  <strong>
                    {item.level} · Term {item.term} · Week {item.week}
                  </strong>{" "}
                  {item.theme}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </main>
  );
}
