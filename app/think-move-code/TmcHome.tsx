import Image from "next/image";
import Link from "next/link";

import styles from "./home.module.css";
import OpenOnHash from "./OpenOnHash";
import VideoPanel from "./VideoPanel";
import { NURSERY_1_TERMS, NURSERY_1_WEEKS, YEAR_FILES, termFiles, weekAssets, weekPath } from "@/lib/tmc/nursery-1";
import { interactiveLessonFor, lessonsInReview, nursery1LessonPath } from "@/lib/tmc/lessons";
import { TMC_VIDEOS, YOUTUBE_CHANNEL_URL } from "@/lib/tmc/videos";

// The Think • Move • Code! home: the one place for the programme's deliverables.
//   Weeks column: Term, then Week, as accordions. Week files sit inside their week and
//   term files (card pack, stickers, badge, bonus video) sit inside their term.
//   Side column: videos and whole-year downloads, then links to the rest of Rhinox.
// Plain <details> elements, so it works without scripts and with the keyboard.
export default function TmcHome() {
  const inReview = lessonsInReview();

  return (
    <main className={styles.page}>
      <OpenOnHash />
      <div className={`rx-container ${styles.wrap}`}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Rhinox Scientifica</p>
            <h1 className={styles.title}>Think • Move • Code!</h1>
            <p className={styles.sub}>
              Nursery 1 <span aria-hidden="true">·</span> {NURSERY_1_TERMS.length} terms <span aria-hidden="true">·</span> {NURSERY_1_WEEKS.length} weeks
            </p>
            <nav className={styles.jump} aria-label="On this page">
              <a href="#weeks">Weeks</a>
              <a href="#videos">Videos</a>
              <a href="#downloads">Downloads</a>
              <Link href="/coding-robotics/studio">Code Studio</Link>
            </nav>
          </div>
          <Image className={styles.ayo} src="/tmc/n1/ayo.png" alt="Ayo, the boy from the book" width={240} height={360} priority />
        </header>

        <div className={styles.grid}>
          <section id="weeks" className={styles.main} aria-labelledby="weeks-title">
            <h2 id="weeks-title" className={styles.h2}>
              Nursery 1 weeks
            </h2>

            {NURSERY_1_TERMS.map((term) => {
              const weeks = NURSERY_1_WEEKS.filter((item) => item.term === term.term);
              const files = termFiles(term.term);
              return (
                <details key={term.term} id={`term-${term.term}`} className={styles.term} open={term.term === 1}>
                  <summary>
                    <span className={styles.termNo} aria-hidden="true">
                      {term.term}
                    </span>
                    <span className={styles.termText}>
                      <strong>Term {term.term}</strong>
                      <span>{term.title}</span>
                    </span>
                    <span className={styles.count}>{weeks.length} weeks</span>
                  </summary>

                  <div className={styles.termFiles} role="group" aria-label={`Term ${term.term} resources`}>
                    <a href={files.cards} download>
                      Card pack
                    </a>
                    <a href={files.stickers} download>
                      Stickers
                    </a>
                    <a href={files.badge} download>
                      Badge
                    </a>
                    <a href="#videos">Bonus video</a>
                  </div>

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
                              <div className={styles.chips}>
                                <a href={`${assets}/${item.cardsFile}`} download>
                                  Cards
                                </a>
                                <Link href={`${weekPath(item)}/play/pictures`}>Find the Pairs</Link>
                                <Link href={`${weekPath(item)}/play/screen`}>{item.screenGame}</Link>
                                {lesson ? <Link href={nursery1LessonPath(item)}>RhinoBot lesson</Link> : null}
                                <Link href={weekPath(item)}>Teacher pack</Link>
                              </div>
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

            {inReview.length ? (
              <details className={styles.review}>
                <summary>
                  <span>Interactive lessons in review</span>
                  <span className={styles.count}>{inReview.length}</span>
                </summary>
                <p>Still being checked, so not ready for learners yet.</p>
                <ul>
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
          </section>

          <aside className={styles.side} aria-label="More from Think • Move • Code!">
            <section id="videos" className={styles.card} aria-labelledby="videos-title">
              <h2 id="videos-title" className={styles.h3}>
                Videos
              </h2>
              <VideoPanel videos={TMC_VIDEOS} channelUrl={YOUTUBE_CHANNEL_URL} />
            </section>

            <section id="downloads" className={styles.card} aria-labelledby="downloads-title">
              <h2 id="downloads-title" className={styles.h3}>
                Whole-year downloads
              </h2>
              <ul className={styles.files}>
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

            <section className={styles.card} aria-labelledby="explore-title">
              <h2 id="explore-title" className={styles.h3}>
                Keep going
              </h2>
              <ul className={styles.files}>
                <li>
                  <Link href="/coding-robotics/studio">
                    <strong>Code Studio</strong>
                    <span>Python, robots, Arduino and games</span>
                  </Link>
                </li>
                <li>
                  <Link href="/shop/books">
                    <strong>The books</strong>
                    <span>Activity books and workbooks</span>
                  </Link>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
