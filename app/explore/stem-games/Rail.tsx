"use client";

import { useRef } from "react";

import styles from "./games.module.css";

export default function Rail({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <section className={styles.rail} aria-label={title}>
      <header className={styles.railHead}>
        <div>
          <h2>{title}</h2>
          {hint && <p>{hint}</p>}
        </div>
        <div className={styles.railBtns}>
          <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>←</button>
          <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>→</button>
        </div>
      </header>
      <ul className={styles.track} ref={track}>{children}</ul>
    </section>
  );
}
