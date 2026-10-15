"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import {
  formatSingleYear,
  formatYearReference,
  formatYears,
} from "@/lib/year-groups";

import styles from "./InteractiveMatrix.module.css";

export interface MatrixItem {
  id: string;
  title: string;
  description: string;
  category: string[];
  type: string[];
  age: string[];
  // Year group, derived from the age band (1-12).
  yearFrom?: number;
  yearTo?: number;
  href: string;
  // Optional card details.
  format?: string;
  durationMinutes?: number;
  difficulty?: string;
  // Optional picture (the content item's `thumbnail`). Without one the tile
  // shows a subject-coloured illustration panel.
  image?: string;
}

interface InteractiveMatrixProps {
  items: MatrixItem[];
  categories?: string[];
  types?: string[];
  ages?: string[];
  className?: string;
}

// "earth-and-space" -> "Earth and Space"; "2d" -> "2D".
export function humanise(value: string) {
  if (/^\d+d$/i.test(value)) {
    return value.toUpperCase();
  }
  return value
    .split("-")
    .map((word, index) =>
      index > 0 && ["and", "of", "the"].includes(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

// Subject accent colours and icons (the icon fills the picture panel when an
// experience has no picture of its own).
export const subjectStyles: Record<string, { color: string; tint: string; icon: string }> = {
  biology: {
    color: "#1f9d55",
    tint: "#e7f7ee",
    icon: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14Zm0 0 8-8",
  },
  chemistry: {
    color: "#8e44c9",
    tint: "#f4ecfb",
    icon: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9",
  },
  physics: {
    color: "#e0701b",
    tint: "#fdf0e4",
    icon: "M13 2 4 14h7l-1 8 9-12h-7Z",
  },
  mathematics: {
    color: "#0f6fde",
    tint: "#e6f3fd",
    icon: "M5 7h5M7.5 4.5v5M14 7h5M5 16.5l4 4M9 16.5l-4 4M14 16h5M14 20h5",
  },
  "environmental-science": {
    color: "#0e9f8e",
    tint: "#e4f6f3",
    icon: "M12 21v-7M12 14l-4-4M12 14l4-5M7 10a5 5 0 0 1 10 0 3 3 0 0 1-1 5.8H8A3 3 0 0 1 7 10Z",
  },
  "earth-and-space": {
    color: "#4f5bd5",
    tint: "#eceefc",
    icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.5 9h17M3.5 15h17M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18",
  },
  engineering: {
    color: "#c98a0b",
    tint: "#fbf3e2",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  },
  technology: {
    color: "#0f8fb0",
    tint: "#e3f4f8",
    icon: "M7 7h10v10H7ZM10 2v5M14 2v5M10 17v5M14 17v5M2 10h5M2 14h5M17 10h5M17 14h5",
  },
  coding: {
    color: "#e0483e",
    tint: "#fdecea",
    icon: "m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  },
  robotics: {
    color: "#6a4fd5",
    tint: "#efebfc",
    icon: "M6 8h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM12 8V4M9.5 13h.01M14.5 13h.01M9 16h6",
  },
};

export const fallbackSubject = {
  color: "#0f6fde",
  tint: "#e6f3fd",
  icon: "M12 3v4M12 17v4M3 12h4M17 12h4M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5Z",
};

// Subjects are listed in this order in the side rail; any others follow.
export const subjectOrder = [
  "coding",
  "robotics",
  "mathematics",
  "biology",
  "physics",
  "engineering",
  "chemistry",
];

export function ctaLabel(format?: string) {
  if (format === "Quiz") return "Take quiz";
  if (format === "Game") return "Play";
  return "Start";
}

const arrowPath = "M5 12h14M13 6l6 6-6 6";

export default function InteractiveMatrix({
  items,
  categories = [],
  types = [],
  ages = [],
  className = "",
}: InteractiveMatrixProps) {
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [age, setAge] = useState("All");
  const [year, setYear] = useState("All");

  // Everything except the subject, so the side rail can show how many
  // experiences each subject would give with the other filters applied.
  const otherMatches = useMemo(() => {
    return items.filter((item) => {
      const typeMatch = type === "All" || item.type.includes(type);
      const ageMatch = age === "All" || item.age.includes(age);
      const yearMatch =
        year === "All" ||
        (item.yearFrom !== undefined &&
          item.yearTo !== undefined &&
          Number(year) >= item.yearFrom &&
          Number(year) <= item.yearTo);
      return typeMatch && ageMatch && yearMatch;
    });
  }, [items, type, age, year]);

  // Every year at least one experience covers.
  const years = useMemo(() => {
    const found = new Set<number>();
    for (const item of items) {
      if (item.yearFrom === undefined || item.yearTo === undefined) continue;
      for (let value = item.yearFrom; value <= item.yearTo; value += 1) {
        found.add(value);
      }
    }
    return Array.from(found)
      .sort((a, b) => a - b)
      .map(String);
  }, [items]);

  const filteredItems = useMemo(
    () =>
      category === "All"
        ? otherMatches
        : otherMatches.filter((item) => item.category.includes(category)),
    [otherMatches, category],
  );

  const railSubjects = useMemo(() => {
    const rank = (subject: string) => {
      const index = subjectOrder.indexOf(subject);
      return index === -1 ? subjectOrder.length : index;
    };
    return [...categories].sort((a, b) => rank(a) - rank(b));
  }, [categories]);

  const hasFilters =
    category !== "All" ||
    type !== "All" ||
    age !== "All" ||
    year !== "All";

  const resetFilters = () => {
    setCategory("All");
    setType("All");
    setAge("All");
    setYear("All");
  };

  const filters = [
    { id: "matrix-type", label: "Experience", all: "All experiences", value: type, set: setType, options: types, show: humanise },
    { id: "matrix-age", label: "Age", all: "All ages", value: age, set: setAge, options: ages, show: (value: string) => `Ages ${value.replace("-", "–")}` },
    { id: "matrix-year", label: "Year", all: "All years", value: year, set: setYear, options: years, show: (value: string) => formatSingleYear(Number(value)) },
  ].filter((filter) => filter.options.length > 0);

  return (
    <div className={`${styles.matrix} ${className}`}>
      {/* ---------- Filter toolbar ---------- */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {filters.map((filter) => (
            <label key={filter.id} className={styles.filter} htmlFor={filter.id}>
              <span className={styles.filterLabel}>{filter.label}</span>
              <select
                id={filter.id}
                value={filter.value}
                onChange={(event) => filter.set(event.target.value)}
                className={`${styles.select} ${filter.value !== "All" ? styles.selectActive : ""}`}
              >
                <option value="All">{filter.all}</option>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {filter.show(option)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className={styles.summary}>
          <span className={styles.count}>
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "experience" : "experiences"}
          </span>

          {hasFilters && (
            <button type="button" className={styles.clear} onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        {/* ---------- Subject rail ---------- */}
        <nav className={styles.rail} aria-label="Subjects">
          {["All", ...railSubjects].map((subject) => {
            const style = subjectStyles[subject] ?? fallbackSubject;
            const count =
              subject === "All"
                ? otherMatches.length
                : otherMatches.filter((item) => item.category.includes(subject)).length;
            const active = category === subject;

            return (
              <button
                key={subject}
                type="button"
                className={`${styles.railItem} ${active ? styles.railItemActive : ""}`}
                style={{ "--subject": style.color } as CSSProperties}
                aria-pressed={active}
                onClick={() => setCategory(subject)}
              >
                <svg className={styles.railIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={subject === "All" ? "M4 4h7v7H4ZM13 4h7v7h-7ZM4 13h7v7H4ZM13 13h7v7h-7Z" : style.icon} />
                </svg>
                <span className={styles.railLabel}>
                  {subject === "All" ? "All subjects" : humanise(subject)}
                </span>
                <span className={styles.railCount}>{count}</span>
              </button>
            );
          })}
        </nav>

        {/* ---------- Results ---------- */}
        {filteredItems.length > 0 ? (
          <ul className={styles.tiles}>
            {filteredItems.map((item, index) => {
              const subjectKey = item.category[0] ?? "";
              const subject = subjectStyles[subjectKey] ?? fallbackSubject;
              const years =
                item.yearFrom !== undefined && item.yearTo !== undefined
                  ? { from: item.yearFrom, to: item.yearTo }
                  : null;
              const meta = [
                item.age.length > 0
                  ? `Ages ${item.age.map((value) => value.replace("-", "–")).join(", ")}`
                  : null,
                item.durationMinutes ? `${item.durationMinutes} min` : null,
                item.difficulty ? humanise(item.difficulty) : null,
              ].filter(Boolean) as string[];

              return (
                <li
                  key={item.id}
                  className={`${styles.tile} ${index % 2 === 1 ? styles.tileFlip : ""}`}
                  style={{ "--subject": subject.color, "--subject-tint": subject.tint } as CSSProperties}
                >
                  <div className={styles.art} aria-hidden="true">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="(max-width: 900px) 120px, 190px" className={styles.photo} />
                    ) : (
                      <span className={styles.artIcon}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={subject.icon} />
                        </svg>
                      </span>
                    )}
                  </div>

                  <div className={styles.body}>
                    <p className={styles.subject}>
                      {item.category.map(humanise).join(" · ") || "STEM"}
                      {item.format && <span className={styles.format}>{item.format}</span>}
                    </p>
                    <h3 className={styles.title}>
                      {/* The title link covers the whole tile, so the tile
                          stays one big click target. */}
                      <Link href={item.href} className={styles.titleLink}>
                        {item.title}
                      </Link>
                    </h3>
                    {item.description && (
                      <p className={styles.description}>{item.description}</p>
                    )}
                    <div className={styles.foot}>
                      <div className={styles.metaGroup}>
                        {years && (
                          <p className={styles.year}>
                            {formatYears(years)}
                            <span className={styles.reference}>
                              {formatYearReference(years)}
                            </span>
                          </p>
                        )}
                        <p className={styles.meta}>{meta.join(" · ")}</p>
                      </div>
                      <span className={styles.cta} aria-hidden="true">
                        {ctaLabel(item.format)}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={arrowPath} />
                        </svg>
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.empty}>
            <h3>No experiences found.</h3>

            <p>
              Try changing one or more filters to discover
              other Rhinox experiences.
            </p>

            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
