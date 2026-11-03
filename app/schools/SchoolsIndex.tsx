"use client";

import { useEffect, useState } from "react";

import styles from "./schools.module.css";

export interface IndexEntry {
  id: string;
  label: string;
}

/**
 * "On this page" index. A side list on wide screens and a strip that sticks
 * under the header on narrow ones. The current section is marked with a bar
 * and bold text, not colour alone. Choosing an entry scrolls to the section
 * and moves focus to its heading.
 */
export default function SchoolsIndex({ entries }: { entries: IndexEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    const els = entries.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (list) => {
        const visible = list.filter((l) => l.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [entries]);

  function go(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    const heading = el.querySelector<HTMLElement>("h2");
    heading?.focus({ preventScroll: true });
    setActive(id);
  }

  return (
    <nav className={styles.index} aria-label="On this page">
      <p className={styles.indexLabel}>On this page</p>
      <ul>
        {entries.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} className={active === e.id ? styles.indexOn : ""} aria-current={active === e.id ? "location" : undefined} onClick={(ev) => go(ev, e.id)}>
              {e.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
