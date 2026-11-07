import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Breadcrumbs from "../../../components/Breadcrumbs";
import { TRAINING_TRACKS, getTrack } from "@/lib/schools/training";
import styles from "../training.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return TRAINING_TRACKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const track = getTrack((await params).slug);
  return track ? { title: `${track.title} | Teacher Training | Rhinox Scientifica`, description: track.summary } : {};
}

export default async function TeacherTrainingTrackPage({ params }: PageProps) {
  const t = getTrack((await params).slug);
  if (!t) notFound();
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions", href: "/schools" }, { label: "Teacher Training", href: "/schools/teacher-training" }, { label: t.title }]} />
      </div>
      <section className={styles.track}>
        <div className={`rx-container ${styles.trackInner}`}>
          <p className={styles.eyebrow}>Teacher Training track</p>
          <h1>{t.title}</h1>
          <p className={styles.lead}>{t.summary}</p>
          <article className={styles.panel}>
            <p className={styles.aud}>For: {t.audience}</p>
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
            </div>
          </article>
          <div className={styles.links} style={{ borderTop: 0 }}>
            <Link href="/schools/teacher-training">← All tracks</Link>
            <Link href="/schools/request-a-quote" className="rx-button rx-button-primary">Request this training</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
