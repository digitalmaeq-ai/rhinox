"use client";

import { celestialBodies } from "@/lib/solar-system/planet-data";
import type { BodyId } from "@/lib/solar-system/solar-system-types";

import styles from "./solar-system.module.css";

export default function PlanetSelector({
  selectedId,
  visited,
  onSelect,
}: {
  selectedId: BodyId | null;
  visited: ReadonlySet<BodyId>;
  onSelect: (id: BodyId | null) => void;
}) {
  return (
    <nav className={styles.selector} aria-label="Choose a planet">
      <p className={styles.panelTitle}>Explore</p>
      <ul className={styles.selectorList}>
        <li>
          <button type="button" className={`${styles.selectorItem} ${selectedId === null ? styles.selectorActive : ""}`} aria-pressed={selectedId === null} onClick={() => onSelect(null)}>
            <span className={styles.overviewDot} aria-hidden="true" />
            <span>Overview</span>
          </button>
        </li>
        {celestialBodies.map((body) => (
          <li key={body.id}>
            <button
              type="button"
              className={`${styles.selectorItem} ${selectedId === body.id ? styles.selectorActive : ""}`}
              aria-pressed={selectedId === body.id}
              onClick={() => onSelect(body.id)}
            >
              <span className={styles.dot} style={{ background: `radial-gradient(circle at 35% 30%, ${body.color}, ${body.colorDeep})` }} aria-hidden="true" />
              <span>{body.name}</span>
              {body.id !== "sun" && visited.has(body.id) && (
                <svg className={styles.seen} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Visited">
                  <path d="m5 12 5 5 9-10" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
