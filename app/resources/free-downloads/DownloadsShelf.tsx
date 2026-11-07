"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { WeekPack } from "@/lib/resources/library";
import styles from "./downloads.module.css";

const TERMS = [
  { id: 0, label: "All terms" },
  { id: 1, label: "Term 1" },
  { id: 2, label: "Term 2" },
  { id: 3, label: "Term 3" },
];

const KINDS = ["All files", "Lesson plan", "Printable cards", "Teacher and parent guide", "Project sheet", "Review sheet", "Question bank", "QR code for this week"];

export default function DownloadsShelf({ packs }: { packs: WeekPack[] }) {
  const [term, setTerm] = useState(0);
  const [kind, setKind] = useState("All files");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packs.filter((p) => (term === 0 || p.term === term) && (!q || `${p.title} ${p.goal}`.toLowerCase().includes(q)));
  }, [packs, term, query]);

  return (
    <section className={styles.shelf} aria-labelledby="shelf-title">
      <div className={`rx-container ${styles.shelfInner}`}>
        <div className={styles.shelfHead}>
          <h2 id="shelf-title" className={styles.shelfTitle}>Weekly packs</h2>
          <p className={styles.count} aria-live="polite">{shown.length} of {packs.length} weeks</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.tabs} role="group" aria-label="Term">
            {TERMS.map((t) => (
              <button key={t.id} type="button" className={`${styles.tab} ${term === t.id ? styles.tabOn : ""}`} aria-pressed={term === t.id} onClick={() => setTerm(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <label className={styles.searchWrap}>
            <span className={styles.srOnly}>Search weeks</span>
            <input className={styles.search} type="search" placeholder="Search weeks, e.g. pattern" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <label className={styles.kindWrap}>
            <span className={styles.srOnly}>Show only one kind of file</span>
            <select className={styles.kind} value={kind} onChange={(e) => setKind(e.target.value)}>
              {KINDS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
        </div>

        {shown.length === 0 ? (
          <p className={styles.empty}>No week matches that search. Try a different word.</p>
        ) : (
          <ol className={styles.weeks}>
            {shown.map((p) => {
              const files = kind === "All files" ? p.files : p.files.filter((f) => f.label.startsWith(kind));
              return (
                <li key={`${p.term}-${p.week}`} className={styles.week} data-term={p.term}>
                  <div className={styles.weekNo} aria-hidden="true">
                    <span>T{p.term}</span>
                    <strong>{String(p.week).padStart(2, "0")}</strong>
                  </div>
                  <div className={styles.weekBody}>
                    <h3 className={styles.weekTitle}>
                      <Link href={p.href}>{p.title}</Link>
                    </h3>
                    <p className={styles.weekGoal}>{p.goal || p.kind}</p>
                    <ul className={styles.files}>
                      {files.map((f) => (
                        <li key={f.href}>
                          <a href={f.href} download className={styles.file} data-type={f.type} title={f.detail}>
                            <span className={styles.fileType}>{f.type}</span>
                            <span>{f.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
