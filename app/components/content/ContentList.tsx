"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DEFAULT_TONE, pathFor } from "./tiles";
import styles from "./content.module.css";

export interface ListRow {
  id: string;
  href: string;
  title: string;
  description: string;
  type: string;
  typeLabel: string;
  subjects: string[];
  subjectLabels: string[];
  tint: string;
  ink: string;
  metaTop?: string;
  metaBottom?: string;
}

export default function ContentList({ rows }: { rows: ListRow[] }) {
  const [type, setType] = useState("all");
  const [subject, setSubject] = useState("all");
  const [query, setQuery] = useState("");

  const types = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const r of rows) m.set(r.type, { label: r.typeLabel, n: (m.get(r.type)?.n ?? 0) + 1 });
    return [...m.entries()];
  }, [rows]);

  const subjects = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    rows.forEach((r) =>
      r.subjects.forEach((s, i) => m.set(s, { label: r.subjectLabels[i], n: (m.get(s)?.n ?? 0) + 1 })),
    );
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  }, [rows]);

  const q = query.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (type === "all" || r.type === type) &&
      (subject === "all" || r.subjects.includes(subject)) &&
      (!q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)),
  );

  const showSubjects = rows.length > 8 && subjects.length > 1;
  const showSearch = rows.length > 12;
  const showTypes = types.length > 1;
  const showBar = showSubjects || showSearch || showTypes;

  return (
    <>
      {showBar && (
        <div className={styles.toolbar}>
          {showTypes && (
            <ul className={styles.pills} aria-label="Filter by kind">
              <li>
                <button type="button" aria-pressed={type === "all"} className={`${styles.pill} ${type === "all" ? styles.pillOn : ""}`} onClick={() => setType("all")}>
                  All<em>{rows.length}</em>
                </button>
              </li>
              {types.map(([id, t]) => (
                <li key={id}>
                  <button type="button" aria-pressed={type === id} className={`${styles.pill} ${type === id ? styles.pillOn : ""}`} onClick={() => setType(id)}>
                    {t.label}<em>{t.n}</em>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showSubjects && (
            <ul className={styles.pills} aria-label="Filter by subject">
              {[["all", { label: "All subjects", n: rows.length }] as const, ...subjects].map(([id, s]) => (
                <li key={id}>
                  <button type="button" aria-pressed={subject === id} className={`${styles.pill} ${subject === id ? styles.pillOn : ""}`} onClick={() => setSubject(id)}>
                    {s.label}{id !== "all" && <em>{s.n}</em>}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showSearch && (
            <input className={styles.search} type="search" placeholder="Search this page" aria-label="Search this page" value={query} onChange={(e) => setQuery(e.target.value)} />
          )}
          <span className={styles.count} role="status" aria-live="polite">
            {shown.length} {shown.length === 1 ? "result" : "results"}
          </span>
        </div>
      )}

      {shown.length === 0 ? (
        <p className={styles.empty}>Nothing matches. Try a different filter.</p>
      ) : (
        <ul className={styles.rows}>
          {shown.map((r) => (
            <li key={r.id} className={styles.row}>
              <Link href={r.href} className={styles.rowLink} style={{ ["--tint" as string]: r.tint || DEFAULT_TONE.tint, ["--ink" as string]: r.ink || DEFAULT_TONE.ink }}>
                <span className={styles.tile} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={pathFor(r.type, r.subjects)} />
                  </svg>
                </span>
                <span className={styles.rowMain}>
                  <span className={styles.kicker}>
                    <span>{r.typeLabel}</span>
                    {r.subjectLabels.slice(0, 2).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  <h2 className={styles.rowTitle}>{r.title}</h2>
                  <p className={styles.rowText}>{r.description}</p>
                </span>
                <span className={styles.rowMeta}>
                  {r.metaTop && <strong>{r.metaTop}</strong>}
                  {r.metaBottom}
                </span>
                <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
