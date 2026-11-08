"use client";

import Link from "next/link";
import { useState } from "react";

import type { TrainingTrack } from "@/lib/schools/training";
import styles from "./training.module.css";

export default function Syllabus({ tracks }: { tracks: TrainingTrack[] }) {
  const [slug, setSlug] = useState(tracks[0].slug);
  const t = tracks.find((x) => x.slug === slug) ?? tracks[0];
  return (
    <>
      <header className={styles.head}>
        <div className={`rx-container ${styles.headInner}`}>
          <p className={styles.eyebrow}>Teacher Training</p>
          <h1>Training teachers can use <span>on Monday.</span></h1>
          <p className={styles.lead}>Hands-on sessions so teachers leave with methods and materials for the next class. Choose a track to read its syllabus.</p>
        </div>
      </header>

      <section className={styles.browser}>
        <div className={`rx-container ${styles.browserInner}`}>
          <div className={styles.list} role="tablist" aria-orientation="vertical" aria-label="Training tracks">
            {tracks.map((x, i) => (
              <button key={x.slug} type="button" role="tab" id={`trk-${x.slug}`} aria-selected={slug === x.slug} aria-controls="trk-panel" className={`${styles.trk} ${slug === x.slug ? styles.trkOn : ""}`} onClick={() => setSlug(x.slug)}>
                <span className={styles.idx}>{i + 1}</span>
                <span><strong>{x.title}</strong><em>{x.summary}</em></span>
              </button>
            ))}
          </div>

          <article id="trk-panel" role="tabpanel" aria-labelledby={`trk-${t.slug}`} className={styles.panel}>
            <p className={styles.aud}>For: {t.audience}</p>
            <h2>{t.title}</h2>
            <div className={styles.cols}>
              <div>
                <h3>Topics covered</h3>
                <ul className={styles.topics}>{t.topics.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <h3>Teachers will be able to</h3>
                <ul className={styles.outcomes}>{t.outcomes.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
            <div className={styles.links}>
              {t.links.map((l) => <Link key={l.href} href={l.href}>{l.label} →</Link>)}
              <Link href={`/schools/teacher-training/${t.slug}`} className={styles.more}>Full track page</Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`rx-container ${styles.ctaInner}`}>
          <p>Training your staff? Tell us how many teachers and what they teach, and we will shape a programme to match.</p>
          <Link href="/schools/request-a-quote" className="rx-button rx-button-primary">Request a quote</Link>
        </div>
      </section>
    </>
  );
}
