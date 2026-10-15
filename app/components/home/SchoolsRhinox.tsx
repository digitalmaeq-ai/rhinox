"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { navigation } from "@/lib/site-navigation";

import styles from "./SchoolsRhinox.module.css";

/**
 * Schools & institutions. The right-hand list is the services (names, short
 * descriptions and links come from the Schools menu in lib/site-navigation.ts).
 * The left panel tells the story of whichever service is active, with its own
 * headline, pitch and highlights, so it never repeats the row text. The
 * active service rotates on its own, forever, and pauses while the visitor
 * is pointing at or focused on the section. Hovering, focusing or tapping a
 * service brings its story to the left.
 */

type Story = {
  tag: string;
  title: string;
  accent: string;
  text: string;
  points: string[];
  cta: string;
};

// Left-panel copy, one story per service (keyed by its page).
const stories: Record<string, Story> = {
  "/schools/stem-school-solutions": {
    tag: "Programmes",
    title: "A STEM programme that fits",
    accent: "the way your school runs.",
    text: "We work with school leaders and teachers to build a year-round STEM programme: lessons that follow your curriculum, hands-on activities every term and a clear picture of how learners are progressing.",
    points: ["Termly plans aligned to your curriculum", "Hands-on kits and activity guides", "Learner progress, badges and certificates"],
    cta: "See school programmes",
  },
  "/schools/laboratory-solutions": {
    tag: "Laboratories",
    title: "From an empty room to",
    accent: "a working laboratory.",
    text: "We plan the layout, supply apparatus and chemicals, install and commission everything, and stay on hand so practicals run safely and the lab keeps its stock.",
    points: ["Lab planning, design and fit-out", "Apparatus, chemicals and consumables", "Safety setup and ongoing support"],
    cta: "See laboratory solutions",
  },
  "/schools/coding-robotics": {
    tag: "Training",
    title: "Learners who can build,",
    accent: "code and control.",
    text: "Structured coding and robotics programmes take learners from their first blocks of code to working robots, with kits, lesson guides and showcase projects the whole school can see.",
    points: ["Think, Move, Code! lesson series", "Robotics kits and project guides", "Ready for clubs and competitions"],
    cta: "See coding & robotics",
  },
  "/education/books": {
    tag: "Publishing",
    title: "Books that carry the learning",
    accent: "into every classroom.",
    text: "Rhinox publishes STEM books, workbooks and activity books, including the Think • Move • Code series, so schools can pair hands-on programmes with quality print resources.",
    points: ["Think • Move • Code series", "STEM workbooks and activity books", "Supplied for schools and institutions"],
    cta: "Browse Rhinox books",
  },
  "/schools/teacher-training": {
    tag: "Educators",
    title: "Confident teachers make",
    accent: "confident learners.",
    text: "Practical, hands-on training that equips educators to teach STEM with confidence, run practicals safely and bring digital tools into everyday lessons.",
    points: ["Hands-on workshops, not lectures", "Lesson plans and classroom resources", "Certificates for every participant"],
    cta: "See teacher training",
  },
};

const fallbackStory: Story = {
  tag: "Schools",
  title: "Build a stronger STEM",
  accent: "ecosystem for your school.",
  text: "From laboratories and equipment to coding programmes and teacher training, we plan, supply and support practical STEM learning.",
  points: ["Planning and supply", "Training and support"],
  cta: "View school solutions",
};

const icons: Record<string, string> = {
  "/schools/stem-school-solutions": "M3 10l9-5 9 5-9 5-9-5ZM7 12.5V17c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.5",
  "/schools/laboratory-solutions": "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9",
  "/schools/coding-robotics": "M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16",
  "/education/books": "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3ZM5 17a3 3 0 0 1 3-3h10",
  "/schools/teacher-training": "M4 5h16v11H4ZM8 20h8M12 16v4M9 9h6",
};
const fallbackIcon = "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7Z";

const ROTATE_MS = 7000;

export default function SchoolsRhinox() {
  const menu = navigation.find((item) => item.href === "/schools");
  const items = (menu?.megaMenu?.columns ?? []).flatMap((column) => column.items);
  const quote = items.find((item) => item.href === "/schools/request-a-quote");
  const services = items.filter((item) => item !== quote);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCalm(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Rotates forever; the key restarts the timer whenever the visitor picks one.
  useEffect(() => {
    if (paused || calm || services.length < 2) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % services.length);
    }, ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, calm, services.length]);

  const select = (index: number) => setActive(index);

  return (
    <section
      className={styles.schools}
      aria-labelledby="schools-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={`rx-container ${styles.inner}`}>
        <h2 id="schools-title" className={styles.srOnly}>Schools and institutions</h2>

        <div className={styles.panel}>
          <div className={styles.pitch}>
            <div className={styles.stage}>
              {services.map((item, index) => {
                const story = stories[item.href] ?? fallbackStory;
                const on = index === active;
                return (
                  <article
                    key={item.href}
                    className={`${styles.story} ${on ? styles.storyOn : ""}`}
                    aria-hidden={!on}
                    // Inactive stories stay in the layout (so the panel never
                    // jumps in height) but cannot be tabbed to.
                    {...(!on ? { inert: true } : {})}
                  >
                    <p className={styles.eyebrow}>{story.tag}</p>
                    <h3 className={styles.title}>
                      {story.title}
                      <span>{story.accent}</span>
                    </h3>
                    <p className={styles.text}>{story.text}</p>
                    <ul className={styles.points}>
                      {story.points.map((point) => (
                        <li key={point}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <Link href={item.href} className={styles.more}>
                      {story.cta}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          <div className={styles.side}>
          <ul className={styles.list}>
            {services.map((item, index) => {
              const on = index === active;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.row} ${on ? styles.rowOn : ""}`}
                    aria-current={on ? "true" : undefined}
                    onMouseEnter={() => select(index)}
                    onFocus={() => select(index)}
                  >
                    <span className={styles.icon} aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={icons[item.href] ?? fallbackIcon} />
                      </svg>
                    </span>
                    <span className={styles.rowBody}>
                      <strong>{item.label}</strong>
                      {item.description && <small>{item.description}</small>}
                    </span>
                    <span className={styles.go} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link href={quote?.href ?? "/schools/request-a-quote"} className={styles.quote}>
            <span>
              <strong>Request a quote</strong>
              <small>{quote?.description ?? "Tell us what your school or institution needs."}</small>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
