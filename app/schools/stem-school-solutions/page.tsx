import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "../../components/Breadcrumbs";
import ExploreHero from "../../components/ExploreHero";
import { KIND_LABEL, termPlans, type WeekKind } from "@/lib/schools/data";
import { TEACHER_FILES, N1_BASE } from "@/lib/tmc/nursery-1";
import styles from "./solutions.module.css";

export const metadata: Metadata = {
  title: "STEM School Solutions | Rhinox Scientifica",
  description:
    "A complete school year of STEM and coding for Nursery 1: 39 weekly lessons across three terms, with teacher guides, assessment and a showcase.",
};

const KINDS: WeekKind[] = ["learn", "practice", "revision", "project", "assessment", "showcase"];
const MARK: Record<WeekKind, string> = { learn: "L", practice: "P", revision: "R", project: "M", assessment: "A", showcase: "S" };

const WHO = [
  { who: "Teachers", text: "A lesson plan, question bank and project sheet for every week, so preparation is quick." },
  { who: "Parents", text: "A take-home note and QR code each week, so learning continues at home." },
  { who: "Children", text: "Screen-free play, movement and hands-on projects, finishing with a Step Thinker badge." },
];

export default function Page() {
  const terms = termPlans();
  const total = terms.reduce((n, t) => n + t.weeks.length, 0);
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions", href: "/schools" }, { label: "STEM School Solutions" }]} />
      </div>

      <ExploreHero
        image="/images/hero/classroom.jpg"
        alt="Learners and a teacher around a microscope in a classroom"
        imagePosition="50% 30%"
        eyebrow="STEM School Solutions"
        lineOne="One school year,"
        lineTwo="planned week by week."
        lead={`Our completed Nursery 1 programme gives your school ${total} ready-to-teach weeks across three terms. This is the whole year at a glance.`}
        actions={[{ label: "Open the Nursery 1 programme", href: N1_BASE }, { label: "Request a quote", href: "/schools/request-a-quote", secondary: true }]}
        stats={[{ value: String(total), label: "weeks" }, { value: "3", label: "terms" }, { value: "6", label: "files every week" }]}
        align="center"
        tone="sky"
      />

      <section className={styles.road} aria-labelledby="road-title">
        <div className={`rx-container ${styles.roadInner}`}>
          <div className={styles.roadHead}>
            <h2 id="road-title">The school year roadmap</h2>
            <ul className={styles.legend} aria-label="Week types">
              {KINDS.map((k) => (
                <li key={k}><span className={`${styles.chip} ${styles[k]}`} aria-hidden="true">{MARK[k]}</span>{KIND_LABEL[k]}</li>
              ))}
            </ul>
          </div>
          <div className={styles.lanes}>
            {terms.map((t) => (
              <article key={t.term} className={styles.lane} aria-labelledby={`term-${t.term}`}>
                <div className={styles.laneLabel}>
                  <span className={styles.termNum}>Term {t.term}</span>
                  <h3 id={`term-${t.term}`}>{t.title}</h3>
                  <p>{t.weeks.length} weeks</p>
                </div>
                <ol className={styles.weeks}>
                  {t.weeks.map((w) => (
                    <li key={w.week}>
                      <Link href={`${N1_BASE}/term-${t.term}/week-${w.week}`} className={`${styles.week} ${styles[w.kind]}`} title={`Week ${w.week}: ${w.title} (${KIND_LABEL[w.kind]})`}>
                        <span className={styles.wn}>{w.week}</span>
                        <span className={styles.wk} aria-hidden="true">{MARK[w.kind]}</span>
                        <span className={styles.srOnly}>Week {w.week}, {w.title}, {KIND_LABEL[w.kind]}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <p className={styles.hint}>Select any week to open its lesson page.</p>
        </div>
      </section>

      <section className={styles.pack} aria-labelledby="pack-title">
        <div className={`rx-container ${styles.packInner}`}>
          <div>
            <h2 id="pack-title">What is in every week</h2>
            <p>Each week has the same six files, so teachers always know where to look.</p>
          </div>
          <ul className={styles.files}>
            {TEACHER_FILES.map((f, i) => (
              <li key={f.title}>
                <span className={styles.fi}>{i + 1}</span>
                <strong>{f.title}</strong>
                <span>{f.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.who} aria-labelledby="who-title">
        <div className={`rx-container ${styles.whoInner}`}>
          <h2 id="who-title">Who gets what</h2>
          <div className={styles.whoGrid}>
            {WHO.map((w) => (
              <div key={w.who} className={styles.whoItem}>
                <h3>{w.who}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`rx-container ${styles.ctaInner}`}>
          <div>
            <h2>Bring this to your school</h2>
            <p>Tell us your class sizes and we will propose how to run it.</p>
          </div>
          <Link href="/schools/request-a-quote" className="rx-button rx-button-primary">Request a quote</Link>
        </div>
      </section>
    </main>
  );
}
