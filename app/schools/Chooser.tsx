"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./schools.module.css";

const NEEDS = [
  { id: "year", label: "A coding programme for young children", to: "/schools/stem-school-solutions", cta: "See the Nursery 1 school year" },
  { id: "lab", label: "A science laboratory", to: "/schools/laboratory-solutions", cta: "Plan your laboratory" },
  { id: "code", label: "Coding and robotics for older learners", to: "/schools/coding-robotics", cta: "See the coding pathway" },
  { id: "staff", label: "Training for our teachers", to: "/schools/teacher-training", cta: "Browse training tracks" },
  { id: "club", label: "A STEM club for our school", to: "/schools/stem-clubs", cta: "Express interest in the pilot" },
  { id: "other", label: "Something else, or a mix", to: "/schools/request-a-quote", cta: "Request a quote" },
];

export default function Chooser() {
  const [id, setId] = useState(NEEDS[0].id);
  const need = NEEDS.find((n) => n.id === id) ?? NEEDS[0];
  return (
    <aside className={styles.chooser} aria-labelledby="chooser-title">
      <h2 id="chooser-title" className={styles.chooserTitle}>What does your school need?</h2>
      <div className={styles.needs} role="radiogroup" aria-label="What your school needs">
        {NEEDS.map((n) => (
          <button key={n.id} type="button" role="radio" aria-checked={id === n.id} className={`${styles.need} ${id === n.id ? styles.needOn : ""}`} onClick={() => setId(n.id)}>
            {n.label}
          </button>
        ))}
      </div>
      <Link href={need.to} className={`rx-button rx-button-primary ${styles.chooserGo}`}>{need.cta} →</Link>
    </aside>
  );
}
