import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "../../../tmc.module.css";
import {
  N1_BASE,
  NURSERY_1_TERMS,
  NURSERY_1_WEEKS,
  findWeek,
  gameTitle,
  neighbours,
  weekAssets,
  weekPath,
} from "@/lib/tmc/nursery-1";

interface WeekPageProps {
  params: Promise<{ term: string; week: string }>;
}

// All 39 weeks are built ahead of time; any other address is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return NURSERY_1_WEEKS.map((item) => ({ term: `term-${item.term}`, week: `week-${item.week}` }));
}

export async function generateMetadata({ params }: WeekPageProps): Promise<Metadata> {
  const { term, week } = await params;
  const item = findWeek(term, week);
  if (!item) return {};
  return {
    title: `${item.title} · Nursery 1 Term ${item.term} Week ${item.week} | Rhinox Scientifica`,
    description: `Think • Move • Code! Nursery 1, Term ${item.term} Week ${item.week}: printable cards, games and a note for parents.`,
  };
}

const ICONS = {
  game: "M7 9h4M9 7v4M15 10h.01M17 8h.01M6 5h12a4 4 0 0 1 4 4v4a6 6 0 0 1-10.4 4.1l-.6-.6-.6.6A6 6 0 0 1 2 13V9a4 4 0 0 1 4-4Z",
  cards: "M12 3v12m0 0-4-4m4 4 4-4M5 21h14",
} as const;

function Icon({ path }: { path: string }) {
  return (
    <span className={styles.actionIcon} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </span>
  );
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { term, week } = await params;
  const item = findWeek(term, week);
  if (!item) notFound();

  const assets = weekAssets(item);
  const termTitle = NURSERY_1_TERMS.find((entry) => entry.term === item.term)?.title ?? "";
  const { previous, next } = neighbours(item);
  const showcase = item.week === 13;

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.narrow}`}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link href={N1_BASE}>Think • Move • Code! Nursery 1</Link>
            </li>
            <li>
              <Link href={`${N1_BASE}#term-${item.term}`}>Term {item.term}</Link>
            </li>
            <li aria-current="page">Week {item.week}</li>
          </ol>
        </nav>

        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>
              Nursery 1 · Term {item.term} · Week {item.week}
            </p>
            <h1 className={styles.title}>{item.title}</h1>
            {item.goal ? <p className={styles.goal}>{item.goal}</p> : null}
          </div>
          <Image className={styles.ayo} src="/tmc/n1/ayo.png" alt="Ayo, the boy from the book" width={240} height={360} priority />
        </header>

        <section className={styles.section} aria-labelledby="cards">
          <h2 id="cards" className={styles.sectionTitle}>
            Printable cards
          </h2>
          <p className={styles.sectionLead}>The cards for this week’s games. Print, cut along the dashed lines and play.</p>
          <div className={styles.actions}>
            <a className={styles.action} href={`${assets}/${item.cardsFile}`} download>
              <Icon path={ICONS.cards} />
              <span className={styles.actionText}>
                <strong>Download the cards</strong>
                <span>
                  PDF · {item.pages} pages · {item.cardsKB < 1000 ? `${item.cardsKB} KB` : `${(item.cardsKB / 1024).toFixed(1)} MB`}
                </span>
              </span>
            </a>
            {showcase ? (
              <a className={styles.action} href={`${assets}/TMC-N1-Term${item.term}-Step-Star-Stickers.pdf`} download>
                <Icon path={ICONS.cards} />
                <span className={styles.actionText}>
                  <strong>Step Star stickers</strong>
                  <span>PDF · 20 round stickers · optional</span>
                </span>
              </a>
            ) : null}
          </div>
          <p className={styles.note}>No printer? Draw the pictures on paper. The games work just as well.</p>
        </section>

        <section className={styles.section} aria-labelledby="games">
          <h2 id="games" className={styles.sectionTitle}>
            Games
          </h2>
          <p className={styles.sectionLead}>Two short games to play together after the lesson.</p>
          <div className={styles.actions}>
            <Link className={styles.action} href={`${weekPath(item)}/play/pictures`}>
              <Icon path={ICONS.game} />
              <span className={styles.actionText}>
                <strong>{gameTitle(item, "pictures")}</strong>
                <span>Picture matching game</span>
              </span>
            </Link>
            <Link className={styles.action} href={`${weekPath(item)}/play/screen`}>
              <Icon path={ICONS.game} />
              <span className={styles.actionText}>
                <strong>{gameTitle(item, "screen")}</strong>
                <span>Help Ayo on the screen</span>
              </span>
            </Link>
          </div>
          <p className={styles.note}>Optional: about 5 minutes is plenty. The lesson never needs a screen.</p>
        </section>

        <section className={styles.section} aria-labelledby="parents">
          <h2 id="parents" className={styles.sectionTitle}>
            {showcase ? "For families" : "For parents and carers"}
          </h2>
          <div className={styles.prose}>
            {showcase && item.invite ? (
              <>
                <h3 className={styles.subTitle}>You are invited!</h3>
                <p className={styles.invite}>{item.invite}</p>
                <h3 className={styles.subTitle}>What your child learned this term</h3>
              </>
            ) : (
              <h3 className={styles.subTitle}>This week</h3>
            )}
            <p>{item.learned}</p>

            {item.tryAtHome.length ? (
              <>
                <h3 className={styles.subTitle}>{item.tryHeading} (5 minutes)</h3>
                <ul className={styles.list}>
                  {item.tryAtHome.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {item.keyWords.length ? (
              <>
                <h3 className={styles.subTitle}>Words to use together</h3>
                <ul className={styles.words}>
                  {item.keyWords.map((word) => (
                    <li key={word}>{word}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {item.signs.length ? (
              <details className={styles.signs}>
                <summary>How to say them, with hand signs</summary>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Word</th>
                      <th scope="col">Say it like this</th>
                      <th scope="col">Hand sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.signs.map((sign) => (
                      <tr key={sign.word}>
                        <td>{sign.word}</td>
                        <td>“{sign.say}”</td>
                        <td>{sign.sign}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ) : null}

            <div className={styles.tip}>
              <strong>RhinoBot tip</strong>
              {item.tip}
            </div>
          </div>

          {showcase ? (
            <div className={styles.badges}>
              <a href={`${assets}/step-thinker-term${item.term}-badge.png`} download>
                <Image src={`${assets}/step-thinker-term${item.term}-badge.png`} alt={`Step Thinker Term ${item.term} badge`} width={120} height={120} />
                Term {item.term} badge
              </a>
              {item.term === 3 ? (
                <a href={`${assets}/step-thinker-year-badge.png`} download>
                  <Image src={`${assets}/step-thinker-year-badge.png`} alt="Step Thinker Year badge" width={120} height={120} />
                  Year badge
                </a>
              ) : null}
            </div>
          ) : null}
        </section>

        <p className={styles.teacher}>
          <strong>Teachers:</strong> the full lesson for this week is on page {item.teacherGuidePage} of the Teacher Guide
          {item.activityBookPage ? `, and the children’s page is page ${item.activityBookPage} of the Activity Book` : ""}.
          Term {item.term}: {termTitle}.
        </p>

        <nav className={styles.pager} aria-label="Other weeks">
          {previous ? (
            <Link href={weekPath(previous)}>
              <span>← Term {previous.term} · Week {previous.week}</span>
              {previous.title}
            </Link>
          ) : null}
          {next ? (
            <Link href={weekPath(next)} className={styles.pagerNext}>
              <span>Term {next.term} · Week {next.week} →</span>
              {next.title}
            </Link>
          ) : null}
        </nav>
      </div>
    </main>
  );
}
