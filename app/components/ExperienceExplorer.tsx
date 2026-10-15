"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { formatYears, type YearRange } from "@/lib/year-groups";

import {
  ctaLabel,
  fallbackSubject,
  humanise,
  subjectOrder,
  subjectStyles,
  type MatrixItem,
} from "./InteractiveMatrix";
import styles from "./ExperienceExplorer.module.css";

type Mode = "path" | "subject" | "format";

type Group = { id: string; label: string; note: string; color: string; items: MatrixItem[] };

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "path", label: "Path", hint: "From first steps to senior secondary" },
  { id: "subject", label: "Subject", hint: "Related experiences together" },
  { id: "format", label: "Format", hint: "How you play and practise" },
];

const STAGES = [
  { id: "foundation", label: "Foundation", note: "Years 1 to 3 · first steps", from: 1, to: 3, color: "#1f9d55" },
  { id: "upper-primary", label: "Upper primary", note: "Years 4 to 6 · build confidence", from: 4, to: 6, color: "#0f6fde" },
  { id: "junior", label: "Junior secondary", note: "Years 7 to 9 · JSS · investigate", from: 7, to: 9, color: "#e0701b" },
  { id: "senior", label: "Senior secondary", note: "Years 10 to 12 · SS · exam level", from: 10, to: 12, color: "#8e44c9" },
];

const SUBJECT_NOTE: Record<string, string> = {
  coding: "Algorithms, sequences and programs",
  robotics: "Sensors, control and machines",
  mathematics: "Shapes, time, fractions and number",
  biology: "Living things, food and the body",
  physics: "Forces, circuits and motion",
  engineering: "Machines, structures and energy",
  chemistry: "Mixtures, acids, bases and reactions",
  "environmental-science": "Farming, habitats and the environment",
  "earth-and-space": "Maps, Earth and the sky",
  science: "Everyday science and reasoning",
  "basic-science": "Everyday science and reasoning",
};

function formatOf(item: MatrixItem) {
  return item.format ?? "Virtual lab";
}

function primary(item: MatrixItem) {
  return item.category[0] ?? "science";
}

type Options = { subjectOrder?: string[]; subjectNotes?: Record<string, string> };

function buildGroups(items: MatrixItem[], mode: Mode, opts: Options = {}): Group[] {
  if (mode === "path") {
    const groups: Group[] = STAGES.map((s) => ({
      id: s.id,
      label: s.label,
      note: s.note,
      color: s.color,
      items: items.filter((i) => i.yearFrom !== undefined && i.yearFrom >= s.from && i.yearFrom <= s.to),
    }));
    const rest = items.filter((i) => i.yearFrom === undefined);
    if (rest.length) groups.push({ id: "all-levels", label: "All levels", note: "Open to every learner", color: "#64748b", items: rest });
    return groups.filter((g) => g.items.length > 0);
  }
  if (mode === "subject") {
    const keys = Array.from(new Set(items.map(primary)));
    const rank = (k: string) => {
      const i = subjectOrder.indexOf(k);
      return i === -1 ? subjectOrder.length : i;
    };
    const order = opts.subjectOrder ?? subjectOrder;
    const rankIn = (k: string) => {
      const i = order.indexOf(k);
      return i === -1 ? order.length : i;
    };
    keys.sort((a, b) => (opts.subjectOrder ? rankIn(a) - rankIn(b) : rank(a) - rank(b)));
    return keys.map((k) => ({
      id: k,
      label: humanise(k),
      note: opts.subjectNotes?.[k] ?? SUBJECT_NOTE[k] ?? "Hands-on STEM",
      color: (subjectStyles[k] ?? fallbackSubject).color,
      items: items.filter((i) => primary(i) === k),
    }));
  }
  const keys = Array.from(new Set(items.map(formatOf)));
  keys.sort((a, b) => (a === "Virtual lab" ? -1 : b === "Virtual lab" ? 1 : a.localeCompare(b)));
  const note = (k: string) =>
    k === "Virtual lab" ? "Run the experiment, record results, then practise"
    : k === "Guided lesson" ? "Step-by-step lessons"
    : k === "Coding puzzle" ? "Plan a program, then run it"
    : k === "Game" ? "Play and learn"
    : k === "Quiz" ? "Test what you know"
    : "Quick 10 minute activities";
  return keys.map((k, n) => ({
    id: k,
    label: k === "Virtual lab" ? "Virtual labs" : k,
    note: note(k),
    color: ["#0f6fde", "#1f9d55", "#e0701b", "#8e44c9", "#e0483e", "#0e9f8e", "#c98a0b"][n % 7],
    items: items.filter((i) => formatOf(i) === k),
  }));
}

type Props = {
  items: MatrixItem[];
  /** Which groupings to offer, first is the default. */
  modes?: Mode[];
  noun?: string;
  cta?: string;
  subjectOrder?: string[];
  subjectNotes?: Record<string, string>;
};

export default function ExperienceExplorer({ items, modes = ["path", "subject", "format"], noun = "experiences", cta, subjectOrder: order, subjectNotes }: Props) {
  const opts = useMemo<Options>(() => ({ subjectOrder: order, subjectNotes }), [order, subjectNotes]);
  const [mode, setMode] = useState<Mode>(modes[0]);
  const [active, setActive] = useState<string>("all");
  // Which groups are open. Only the first one starts open, so the page stays short.
  const [open, setOpen] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.title} ${i.description} ${i.category.join(" ")} ${i.format ?? ""}`.toLowerCase().includes(q));
  }, [items, query]);

  const groups = useMemo(() => buildGroups(searched, mode, opts), [searched, mode, opts]);
  const allGroups = useMemo(() => buildGroups(items, mode, opts), [items, mode, opts]);
  const shown = active === "all" ? groups : groups.filter((g) => g.id === active);
  const openIds = open ?? (groups[0] ? [groups[0].id] : []);
  const isOpen = (id: string) => active !== "all" || openIds.includes(id);
  const toggle = (id: string) => setOpen(openIds.includes(id) ? openIds.filter((x) => x !== id) : [...openIds, id]);
  const allOpen = shown.every((g) => isOpen(g.id));
  const total = shown.reduce((n, g) => n + g.items.length, 0);

  const pick = (m: Mode) => {
    setMode(m);
    setActive("all");
    setOpen(null);
  };

  return (
    <div className={styles.explorer}>
      <div className={styles.top}>
        <div className={styles.search}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${noun}, subjects or skills`} aria-label={`Search ${noun}`} />
        </div>
        <span className={styles.count}>
          {total} of {items.length} {noun}
          {active === "all" && groups.length > 1 && (
            <button type="button" className={styles.expand} onClick={() => setOpen(allOpen ? [] : groups.map((g) => g.id))}>
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          )}
        </span>
      </div>

      <div className={styles.modeBar}>
        <span className={styles.eyebrow}>Explore by</span>
        <div className={styles.modes} style={{ gridTemplateColumns: `repeat(${modes.length}, 1fr)` }} role="tablist" aria-label="Group experiences by">
          {MODES.filter((m) => modes.includes(m.id)).map((m) => (
            <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} className={mode === m.id ? styles.modeOn : ""} onClick={() => pick(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <p className={styles.hint}>{MODES.find((m) => m.id === mode)?.hint}</p>
      </div>

      <div className={styles.panel}>
        <aside className={styles.side} aria-label="Browse experiences">
          <ul className={styles.nav}>
            <li>
              <button type="button" className={`${styles.navItem} ${active === "all" ? styles.navOn : ""}`} aria-pressed={active === "all"} onClick={() => setActive("all")}>
                <span className={styles.dot} style={{ background: "#0f6fde" }} />
                <span className={styles.navText}><strong>All {noun}</strong></span>
                <span className={styles.badge}>{searched.length}</span>
              </button>
            </li>
            {allGroups.map((g) => {
              const n = groups.find((x) => x.id === g.id)?.items.length ?? 0;
              return (
                <li key={g.id}>
                  <button type="button" disabled={n === 0} className={`${styles.navItem} ${active === g.id ? styles.navOn : ""}`} aria-pressed={active === g.id} onClick={() => { setActive(g.id); }} style={{ "--g": g.color } as CSSProperties}>
                    <span className={styles.dot} style={{ background: g.color }} />
                    <span className={styles.navText}>
                      <strong>{g.label}</strong>
                      <small>{g.note}</small>
                    </span>
                    <span className={styles.badge}>{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className={styles.main}>
          {shown.length === 0 && (
            <div className={styles.empty}>
              <h3>No experiences found.</h3>
              <p>Try a different word, or clear the search.</p>
              <button type="button" onClick={() => { setQuery(""); setActive("all"); }}>Clear search</button>
            </div>
          )}
          {shown.map((g, gi) => (
            <section key={g.id} className={styles.group} aria-labelledby={`grp-${g.id}`} style={{ "--g": g.color } as CSSProperties}>
              <h2 id={`grp-${g.id}`} className={styles.groupTitle}>
                <button type="button" className={styles.groupHead} aria-expanded={isOpen(g.id)} onClick={() => { if (active === "all") toggle(g.id); }}>
                  {mode === "path" && <span className={styles.step}>{gi + 1}</span>}
                  <span className={styles.groupText}>
                    <strong>{g.label}</strong>
                    <small>{g.note}</small>
                  </span>
                  <span className={styles.badge}>{g.items.length}</span>
                  <svg className={`${styles.chev} ${isOpen(g.id) ? styles.chevOpen : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </h2>
              {isOpen(g.id) && <ul className={styles.rows}>
                {g.items.map((item) => {
                  const sub = subjectStyles[primary(item)] ?? fallbackSubject;
                  const years: YearRange | null = item.yearFrom !== undefined && item.yearTo !== undefined ? { from: item.yearFrom, to: item.yearTo } : null;
                  const meta = [years ? formatYears(years) : null, item.durationMinutes ? `${item.durationMinutes} min` : null, item.difficulty ? humanise(item.difficulty) : null].filter(Boolean).join(" · ");
                  const tag = mode === "subject" ? formatOf(item) : humanise(primary(item));
                  return (
                    <li key={item.id} className={styles.row} style={{ "--subject": sub.color, "--subject-tint": sub.tint } as CSSProperties}>
                      <span className={styles.chip} aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={sub.icon} /></svg>
                      </span>
                      <div className={styles.rowBody}>
                        <h3><Link href={item.href} className={styles.link}>{item.title}</Link></h3>
                        <p className={styles.rowMeta}><span className={styles.tag}>{tag}</span>{meta}</p>
                      </div>
                      <span className={styles.go} aria-hidden="true">
                        {cta ?? ctaLabel(item.format)}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </span>
                    </li>
                  );
                })}
              </ul>}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
