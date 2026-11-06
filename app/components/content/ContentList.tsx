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
  /** Optional numbers used only for sorting. */
  minutes?: number;
  levelRank?: number;
}

const SUBJECT_LIMIT = 8;

type SortId = "featured" | "az" | "shortest" | "easiest" | "hardest";
type View = "cards" | "list";

export default function ContentList({ rows }: { rows: ListRow[] }) {
  const [type, setType] = useState("all");
  const [subject, setSubject] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("featured");
  const [view, setView] = useState<View>("cards");
  const [moreSubjects, setMoreSubjects] = useState(false);

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
  const filtered = rows.filter(
    (r) =>
      (type === "all" || r.type === type) &&
      (subject === "all" || r.subjects.includes(subject)) &&
      (!q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)),
  );

  // Long subject lists collapse to the biggest few; the chosen subject always stays visible.
  const subjectsShown =
    moreSubjects || subjects.length <= SUBJECT_LIMIT
      ? subjects
      : subjects.filter(([id], i) => i < SUBJECT_LIMIT || id === subject);

  const hasMinutes = rows.some((r) => r.minutes !== undefined);
  const hasLevels = rows.some((r) => r.levelRank !== undefined);
  const sortOptions: { id: SortId; label: string }[] = [
    { id: "featured", label: "Default order" },
    { id: "az", label: "A to Z" },
    ...(hasMinutes ? [{ id: "shortest" as const, label: "Shortest first" }] : []),
    ...(hasLevels
      ? [
          { id: "easiest" as const, label: "Easiest first" },
          { id: "hardest" as const, label: "Hardest first" },
        ]
      : []),
  ];

  const shown = useMemo(() => {
    const list = [...filtered];
    const byTitle = (a: ListRow, b: ListRow) => a.title.localeCompare(b.title);
    // Rows with no value for the chosen sort go last.
    const num = (v: number | undefined, dir: 1 | -1) => (v === undefined ? Number.POSITIVE_INFINITY : v * dir);
    if (sort === "az") list.sort(byTitle);
    else if (sort === "shortest") list.sort((a, b) => num(a.minutes, 1) - num(b.minutes, 1) || byTitle(a, b));
    else if (sort === "easiest") list.sort((a, b) => num(a.levelRank, 1) - num(b.levelRank, 1) || byTitle(a, b));
    else if (sort === "hardest") list.sort((a, b) => num(a.levelRank, -1) - num(b.levelRank, -1) || byTitle(a, b));
    return list;
  }, [filtered, sort]);

  const showSubjects = rows.length > 8 && subjects.length > 1;
  const showSearch = rows.length > 12;
  const showTypes = types.length > 1;
  const showBar = showSubjects || showSearch || showTypes || rows.length > 3;

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
              {[["all", { label: "All subjects", n: rows.length }] as const, ...subjectsShown].map(([id, s]) => (
                <li key={id}>
                  <button type="button" aria-pressed={subject === id} className={`${styles.pill} ${subject === id ? styles.pillOn : ""}`} onClick={() => setSubject(id)}>
                    {s.label}{id !== "all" && <em>{s.n}</em>}
                  </button>
                </li>
              ))}
              {subjects.length > SUBJECT_LIMIT && (
                <li>
                  <button type="button" className={styles.pillMore} aria-expanded={moreSubjects} onClick={() => setMoreSubjects((v) => !v)}>
                    {moreSubjects ? "Fewer subjects" : `More subjects (${subjects.length - SUBJECT_LIMIT})`}
                  </button>
                </li>
              )}
            </ul>
          )}
          {showSearch && (
            <input className={styles.search} type="search" placeholder="Search this page" aria-label="Search this page" value={query} onChange={(e) => setQuery(e.target.value)} />
          )}
          <span className={styles.count} role="status" aria-live="polite">
            {shown.length} {shown.length === 1 ? "result" : "results"}
          </span>
          <label className={styles.sort}>
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortId)}>
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.viewToggle} role="group" aria-label="Layout">
            <button type="button" aria-pressed={view === "cards"} className={view === "cards" ? styles.viewOn : ""} onClick={() => setView("cards")}>
              Cards
            </button>
            <button type="button" aria-pressed={view === "list"} className={view === "list" ? styles.viewOn : ""} onClick={() => setView("list")}>
              List
            </button>
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <p className={styles.empty}>Nothing matches. Try a different filter.</p>
      ) : view === "cards" ? (
        <ul className={styles.cards} key={`cards-${type}-${subject}-${sort}`}>
          {shown.map((r, i) => (
            <li key={r.id} className={styles.cardItem} style={{ ["--i" as string]: Math.min(i, 14) }}>
              <Link href={r.href} className={styles.card} style={{ ["--tint" as string]: r.tint || DEFAULT_TONE.tint, ["--ink" as string]: r.ink || DEFAULT_TONE.ink }}>
                <span className={styles.cardArt} aria-hidden="true">
                  <svg className={styles.cardGlyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={pathFor(r.type, r.subjects)} />
                  </svg>
                  <svg className={styles.cardWatermark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d={pathFor(r.type, r.subjects)} />
                  </svg>
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.kicker}>
                    <span>{r.typeLabel}</span>
                    {r.subjectLabels.slice(0, 1).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  <h2 className={styles.cardTitle}>{r.title}</h2>
                  <p className={styles.cardText}>{r.description}</p>
                </span>
                <span className={styles.cardFoot}>
                  <span className={styles.cardMeta}>
                    {r.metaTop && <strong>{r.metaTop}</strong>}
                    {r.metaBottom && <span>{r.metaBottom}</span>}
                  </span>
                  <span className={styles.cardGo} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
