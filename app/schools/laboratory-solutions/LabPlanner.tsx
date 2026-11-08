"use client";

import Link from "next/link";
import { useState } from "react";

import ExploreHero from "@/app/components/ExploreHero";
import type { LabProduct, VirtualLab } from "@/lib/schools/data";
import styles from "./lab.module.css";

const STAGES = [
  { id: "plan", title: "Plan", text: "We look at your space, class sizes and syllabus, then agree what the laboratory should do." },
  { id: "supply", title: "Supply", text: "Equipment and consumables are chosen from our laboratory range to match the plan." },
  { id: "setup", title: "Set up", text: "Benches, storage and equipment are arranged so practicals run smoothly and safely." },
  { id: "support", title: "Support", text: "Teachers are trained, and virtual labs fill the gaps when a practical is not possible." },
];
const SUBJECTS = ["all", "physics", "chemistry", "biology"] as const;
type Subject = (typeof SUBJECTS)[number];

export default function LabPlanner({ equipment, labs }: { equipment: LabProduct[]; labs: VirtualLab[] }) {
  const [stage, setStage] = useState(STAGES[0].id);
  const [subject, setSubject] = useState<Subject>("all");
  const current = STAGES.find((s) => s.id === stage) ?? STAGES[0];
  const items = equipment.filter((e) => subject === "all" || e.subjects.includes(subject));
  const virtual = labs.filter((l) => subject === "all" || l.subject === subject);

  return (
    <>
      <ExploreHero
        image="/images/hero/stem-lab.jpg"
        alt="A bright, modern school science laboratory"
        eyebrow="Laboratory Solutions"
        lineOne="Build a laboratory"
        lineTwo="that gets used."
        lead="Choose a stage to see how we work, then choose a subject to see the real equipment and virtual labs available today."
        actions={[{ label: "Request a quote", href: "/schools/request-a-quote" }, { label: "See what is available", href: "#catalog", secondary: true }]}
        stats={[{ value: String(equipment.length), label: "equipment items" }, { value: String(labs.length), label: "virtual labs" }, { value: "4", label: "stages: plan to support" }]}
        align="left"
        tone="sky"
      />

      <section className={styles.stepper} aria-label="How we build a laboratory">
        <div className={`rx-container ${styles.stepInner}`}>
          <div className={styles.tabs} role="tablist" aria-label="Stages">
            {STAGES.map((s, i) => (
              <button key={s.id} role="tab" type="button" id={`tab-${s.id}`} aria-selected={stage === s.id} aria-controls="stage-panel" className={`${styles.tab} ${stage === s.id ? styles.tabOn : ""}`} onClick={() => setStage(s.id)}>
                <span>{i + 1}</span>{s.title}
              </button>
            ))}
          </div>
          <div id="stage-panel" role="tabpanel" aria-labelledby={`tab-${current.id}`} className={styles.panel}>
            <h2>{current.title}</h2>
            <p>{current.text}</p>
          </div>
        </div>
      </section>

      <section id="catalog" className={styles.catalog} aria-labelledby="cat-title" style={{ scrollMarginTop: 80 }}>
        <div className={`rx-container ${styles.catInner}`}>
          <div className={styles.catHead}>
            <h2 id="cat-title">What is available now</h2>
            <div className={styles.toggles} role="group" aria-label="Filter by subject">
              {SUBJECTS.map((s) => (
                <button key={s} type="button" aria-pressed={subject === s} className={`${styles.toggle} ${subject === s ? styles.toggleOn : ""}`} onClick={() => setSubject(s)}>
                  {s === "all" ? "All subjects" : s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.cols}>
            <div>
              <h3>Equipment from the shop <span>({items.length})</span></h3>
              {items.length === 0 ? (
                <p className={styles.empty}>No equipment is tagged for this subject yet. <Link href="/schools/request-a-quote">Ask us</Link> and we will source it.</p>
              ) : (
                <ul className={styles.items}>
                  {items.map((p) => (
                    <li key={p.href}>
                      <Link href={p.href}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className={styles.noImg} aria-hidden="true" />}
                        <span><strong>{p.title}</strong><em>{p.excerpt}</em></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <aside className={styles.virtual}>
              <h3>Virtual labs <span>({virtual.length})</span></h3>
              <p>Run the experiment on screen when equipment, time or safety is a limit.</p>
              {virtual.length === 0 ? (
                <p className={styles.empty}>No virtual labs for this subject yet.</p>
              ) : (
                <ul>
                  {virtual.map((l) => (
                    <li key={l.href}><Link href={l.href}>{l.title}</Link><span>{l.subject}</span></li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`rx-container ${styles.ctaInner}`}>
          <p>Not sure what your laboratory needs? Tell us about your school and we will recommend a list.</p>
          <Link href="/schools/request-a-quote" className="rx-button rx-button-primary">Request a quote</Link>
        </div>
      </section>
    </>
  );
}
