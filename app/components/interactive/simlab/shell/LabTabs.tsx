"use client";

import type { ReactNode } from "react";

import styles from "./shell.module.css";

export type LabTab = { id: string; label: string; badge?: string; content: ReactNode };

type Props = {
  /** Prefix for element ids: `${prefix}-tab-${id}` and `${prefix}-panel-${id}`. */
  prefix: string;
  tabs: LabTab[];
  active: string;
  onChange: (id: string) => void;
  /** A tab whose content brings its own panel wrapper (and so its own padding). */
  bare?: string[];
  label?: string;
};

// The tabbed workspace shared by every lab. All panels stay mounted (only
// hidden), so a learner's record and answers survive switching tabs.
export default function LabTabs({ prefix, tabs, active, onChange, bare = [], label = "Workspace sections" }: Props) {
  function key(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    onChange(tabs[n].id);
    document.getElementById(`${prefix}-tab-${tabs[n].id}`)?.focus();
  }
  return (
    <section className={`${styles.card} ${styles.work}`} aria-label="Workspace">
      <div className={styles.tabs} role="tablist" aria-label={label}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            id={`${prefix}-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`${prefix}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className={active === t.id ? styles.tabOn : ""}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => key(e, i)}
          >
            {t.label}
            {t.badge && <em>{t.badge}</em>}
          </button>
        ))}
      </div>
      {tabs.map((t) =>
        bare.includes(t.id) ? (
          <div key={t.id} hidden={active !== t.id} className={styles.panel}>{t.content}</div>
        ) : (
          <div key={t.id} id={`${prefix}-panel-${t.id}`} role="tabpanel" aria-labelledby={`${prefix}-tab-${t.id}`} hidden={active !== t.id} className={styles.panel}>
            {t.content}
          </div>
        ),
      )}
    </section>
  );
}
