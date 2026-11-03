"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import PageHeader from "../components/PageHeader";
import styles from "./resources.module.css";

export interface ResourceRow {
  title: string;
  text: string;
  href: string;
  type: "articles" | "videos" | "downloads";
}

export interface ResourceColumn {
  id: ResourceRow["type"];
  label: string;
  singular: string;
  seeAll: string;
  items: ResourceRow[]; // newest first
}

type Filter = "all" | ResourceRow["type"];

/** Search band, type grid and search results for the Resources hub. */
export default function ResourcesBrowser({ columns }: { columns: ResourceColumn[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return columns
      .filter((c) => filter === "all" || c.id === filter)
      .flatMap((c) => c.items)
      .filter((row) => `${row.title} ${row.text}`.toLowerCase().includes(q));
  }, [columns, filter, query]);

  const chips: { id: Filter; label: string }[] = [{ id: "all", label: "All" }, ...columns.map((c) => ({ id: c.id as Filter, label: c.label }))];

  return (
    <>
      <PageHeader eyebrow="Rhinox resources" title="Keep learning beyond the classroom" lead="Search articles, videos and free downloads.">
        <div className={styles.searchBand}>
          <form role="search" className={styles.search} onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="resource-search" className={styles.hidden}>Search resources</label>
            <input
              id="resource-search"
              type="search"
              className={styles.input}
              placeholder="Search resources"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </form>
          <div className={styles.chips} role="group" aria-label="Filter by type">
            {chips.map((chip) => (
              <button key={chip.id} type="button" className={filter === chip.id ? styles.chipOn : ""} aria-pressed={filter === chip.id} onClick={() => setFilter(chip.id)}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      {searching ? (
        <section className={styles.results} aria-live="polite" aria-label="Search results">
          <div className="rx-container">
            <button type="button" className={styles.back} onClick={() => setQuery("")}>
              <span aria-hidden="true">←</span> Back to resources
            </button>
            <p className={styles.resultCount}>
              {results.length === 0 ? `No resources match “${query.trim()}”.` : `${results.length} ${results.length === 1 ? "result" : "results"}`}
            </p>
            <ul className={styles.resultList}>
              {results.map((row) => (
                <li key={row.href}>
                  <Link href={row.href} className={styles.resultRow}>
                    <span className={styles.kind}>{columns.find((c) => c.id === row.type)?.singular}</span>
                    <span className={styles.resultTitle}>{row.title}</span>
                    <span className={styles.resultText}>{row.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className={styles.typeGrid} aria-label="Resource types">
          <div className={`rx-container ${styles.columns}`}>
            {columns
              .filter((c) => filter === "all" || c.id === filter)
              .map((c) => {
                const newest = c.items[0];
                return (
                  <div key={c.id} className={styles.column}>
                    <h2 className={styles.colTitle}>
                      {c.label} <span className={styles.colCount}>{c.items.length}</span>
                    </h2>
                    {newest ? (
                      <Link href={newest.href} className={styles.newest}>
                        <span className={styles.newestLabel}>Newest</span>
                        <span className={styles.newestTitle}>{newest.title}</span>
                        <span className={styles.newestText}>{newest.text}</span>
                      </Link>
                    ) : (
                      <p className={styles.empty}>None yet. New {c.label.toLowerCase()} are on the way.</p>
                    )}
                    <Link href={c.seeAll} className={styles.seeAll}>See all {c.label.toLowerCase()} <span aria-hidden="true">→</span></Link>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </>
  );
}
