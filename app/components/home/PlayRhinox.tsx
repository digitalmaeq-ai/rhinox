"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { type ContentItem } from "@/lib/content";
import { compareByDifficulty, getExperienceHref, getExperienceSequence } from "@/lib/experience-sequence";
import { formatYears, yearsFromAgeGroups } from "@/lib/year-groups";

import styles from "./PlayRhinox.module.css";

/**
 * The Play stage: a category bar, one large "now playing" stage and an
 * "up next" rail. Nothing here is typed by hand: items, counts and links come
 * from the shared content source, and only live items appear. It steps
 * through the items of a category on its own, then moves to the next
 * category, and pauses while the visitor is pointing at or focused on it.
 */

type Kind = {
  type: string; // group id
  label: string; // tab and "See all" wording
  single: string; // badge
  cta: string;
  seeAll: string;
  icon: string; // 24x24 stroke path
};

const SPOTLIGHT_COUNT = 5;
const ITEM_MS = 7000;
const RAIL_MAX = 5;
const SEE_ALL = "/explore/experiences";
const sparkle = "M12 3v4M12 17v4M3 12h4M17 12h4M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5Z";

// Known subjects get their own icon and a friendly name; any new subject you
// add to an experience still gets a tab automatically.
const subjectIcons: Record<string, string> = {
  coding: "m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  robotics: "M6 8h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM12 8V4M9.5 13h.01M14.5 13h.01M9 16h6",
  mathematics: "M5 12h14M12 5v14",
  biology: "M5 19c0-8 6-14 14-14 0 8-6 14-14 14Zm0 0 8-8",
  physics: "M13 2 4 14h7l-1 8 9-12h-7Z",
  chemistry: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9",
  engineering: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  "earth-and-space": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.5 9h17M3.5 15h17M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18",
};
const subjectLabels: Record<string, string> = { "earth-and-space": "Earth & space", "environmental-science": "Environment" };
const subjectOrder = ["coding", "robotics", "mathematics", "biology", "physics", "chemistry", "engineering", "earth-and-space"];
const gamesIcon = "M6 8h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM12 8V4M9.5 13h.01M14.5 13h.01M9 16h6";

function titleCase(value: string) {
  const text = value.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// What kind of experience is it? Read from where it is filed in the taxonomy.
function formatLabel(item: ContentItem) {
  const path = item.taxonomy?.find((entry) => entry.category === "interactive")?.path ?? [];
  const branch = path[1];
  if (path[0] === "virtual-labs") return "Virtual lab";
  if (branch === "games") return "Game";
  if (branch === "interactive-lessons" || branch === "interactive-learning") return "Interactive lesson";
  return "Interactive experience";
}

function ctaFor(item: ContentItem) {
  return formatLabel(item) === "Game" ? "Play" : "Start";
}

function isGame(item: ContentItem) {
  return formatLabel(item) === "Game";
}

type Extras = {
  thumbnail?: string;
  excerpt?: string;
  difficulty?: string;
  durationMinutes?: number;
  ageGroups?: string[];
  featured?: boolean;
  updatedAt?: string;
  createdAt?: string;
};

const extras = (item: ContentItem) => item as ContentItem & Extras;

function featuredFirst(a: ContentItem, b: ContentItem, fallback: (x: ContentItem, y: ContentItem) => number) {
  return Number(!!extras(b).featured) - Number(!!extras(a).featured) || fallback(a, b);
}

function describe(item: ContentItem) {
  const e = extras(item);
  return e.excerpt || item.description || "";
}

function metaLine(item: ContentItem) {
  const e = extras(item);
  const years = yearsFromAgeGroups(e.ageGroups);
  const parts: string[] = [];
  if (years) parts.push(formatYears(years));
  if (e.ageGroups?.length) parts.push(`Ages ${e.ageGroups.join(", ")}`);
  if (e.durationMinutes) parts.push(`${e.durationMinutes} min`);
  if (e.difficulty) parts.push(e.difficulty.charAt(0).toUpperCase() + e.difficulty.slice(1));
  return parts;
}

type Tab = {
  id: string;
  label: string;
  icon: string;
  total: number; // everything in this category, not just what the rail shows
  items: ContentItem[];
};

// Each experience has a live screenshot at /images/play/experience-<slug>.jpg
// (for now). Set `thumbnail` on an experience to replace it with your own
// picture. With neither, the panel falls back to a blue gradient and icon.
function imageFor(item: ContentItem) {
  const thumb = extras(item).thumbnail;
  return thumb
    ? { src: thumb, shot: false }
    : { src: `/images/play/experience-${item.slug}.jpg`, shot: true };
}

function Picture({ item, icon, sizes, className }: { item: ContentItem; icon: string; sizes: string; className?: string }) {
  const { src, shot } = imageFor(item);
  const [failed, setFailed] = useState(false);

  return (
    <span className={`${styles.picture} ${className ?? ""}`} aria-hidden="true">
      {!failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className={`${styles.photo} ${shot ? styles.shot : ""}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.fallback}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </span>
      )}
    </span>
  );
}

export default function PlayRhinox() {
  const tabs = useMemo<Tab[]>(() => {
    // Everything here is an interactive experience, easiest first.
    const experiences = getExperienceSequence().filter((item) => item.contentType === "experience");
    const pick = (list: ContentItem[]) =>
      [...list].sort((a, b) => featuredFirst(a, b, compareByDifficulty)).slice(0, RAIL_MAX);

    // Featured: featured experiences first, then the easiest, one per subject
    // so the stage shows variety.
    const ordered = [...experiences].sort((a, b) => featuredFirst(a, b, () => 0));
    const featured: ContentItem[] = [];
    const seenSubjects = new Set<string>();
    for (const item of ordered) {
      const subject = item.subjects?.[0] ?? item.id;
      if (seenSubjects.has(subject)) continue;
      seenSubjects.add(subject);
      featured.push(item);
      if (featured.length >= SPOTLIGHT_COUNT) break;
    }

    const built: Tab[] = [];
    if (featured.length) built.push({ id: "featured", label: "Featured", icon: sparkle, total: featured.length, items: featured });

    const games = experiences.filter(isGame);
    if (games.length) built.push({ id: "games", label: "Games", icon: gamesIcon, total: games.length, items: pick(games) });

    const subjects = Array.from(new Set(experiences.map((item) => item.subjects?.[0]).filter(Boolean) as string[]));
    subjects.sort((a, b) => {
      const ia = subjectOrder.indexOf(a);
      const ib = subjectOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    });
    for (const subject of subjects) {
      const all = experiences.filter((item) => item.subjects?.[0] === subject);
      if (!all.length) continue;
      built.push({ id: subject, label: subjectLabels[subject] ?? titleCase(subject), icon: subjectIcons[subject] ?? sparkle, total: all.length, items: pick(all) });
    }
    return built;
  }, []);

  const [tabIndex, setTabIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [calm, setCalm] = useState(false);

  const tab = tabs[tabIndex % Math.max(tabs.length, 1)];
  const item = tab?.items[itemIndex % Math.max(tab?.items.length ?? 1, 1)];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCalm(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Steps through the items of a category, then on to the next category.
  useEffect(() => {
    if (paused || calm || !tab) return;
    const timer = window.setTimeout(() => {
      if (itemIndex + 1 < tab.items.length) {
        setItemIndex(itemIndex + 1);
      } else {
        setTabIndex((tabIndex + 1) % tabs.length);
        setItemIndex(0);
      }
    }, ITEM_MS);
    return () => window.clearTimeout(timer);
  }, [paused, calm, tab, tabs.length, tabIndex, itemIndex]);

  const chooseTab = (index: number) => {
    setTabIndex(index);
    setItemIndex(0);
  };

  if (!tab || !item) {
    return (
      <section className={`rx-play ${styles.play}`} id="play" aria-labelledby="rhinox-play-title">
        <div className={`rx-container ${styles.inner}`}>
          <h2 id="rhinox-play-title" className={styles.title}>Learn by doing</h2>
          <div className={styles.soon}>More to play is coming soon.</div>
        </div>
      </section>
    );
  }

  const meta = metaLine(item);

  return (
    <section className={`rx-play ${styles.play}`} id="play" aria-labelledby="rhinox-play-title">
      <div className={`rx-container ${styles.inner}`}>
        <header className={styles.head}>
          <div>
            <span className="rx-eyebrow">Play</span>
            <h2 id="rhinox-play-title" className={styles.title}>
              Learn by doing,
              <span> starting right now</span>
            </h2>
          </div>
          <p className={styles.intro}>
            Interactive experiences, games and virtual labs across coding, robotics, maths and science, all in one
            window. Pick something and start in a click.
          </p>
        </header>

        <div
          className={styles.window}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className={styles.chips} role="tablist" aria-label="Kinds of experience">
            {tabs.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={index === tabIndex}
                className={`${styles.chip} ${index === tabIndex ? styles.chipActive : ""}`}
                onClick={() => chooseTab(index)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            <article key={`${tab.id}-${item.id}`} className={styles.stage} aria-live="polite">
              <div className={styles.stageCopy}>
                <span className={styles.badge}>
                  <i aria-hidden="true" />
                  {formatLabel(item)}
                </span>
                <h3 className={styles.stageTitle}>{item.title}</h3>
                <p className={styles.stageText}>{describe(item)}</p>
                {meta.length > 0 && (
                  <ul className={styles.pills}>
                    {meta.map((part) => (
                      <li key={part}>{part}</li>
                    ))}
                  </ul>
                )}
                <Link href={getExperienceHref(item)} className={styles.play_btn}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7Z" />
                  </svg>
                  {ctaFor(item) === "Play" ? "Play now" : "Start now"}
                </Link>
              </div>

              <div className={styles.device} aria-hidden="true">
                <Picture item={item} icon={tab.icon} sizes="(max-width: 900px) 100vw, 620px" className={styles.deviceScreen} />
              </div>
            </article>

            <aside className={styles.rail} aria-label={`Up next in ${tab.label}`}>
              <div className={styles.railHead}>
                <strong>Up next</strong>
                <span>{tab.label}</span>
              </div>
              <ol className={styles.railList}>
                {tab.items.map((entry, index) => {
                  const on = index === itemIndex;
                  const info = metaLine(entry).slice(-2).join(" · ");
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={`${styles.railItem} ${on ? styles.railItemOn : ""}`}
                        aria-current={on ? "true" : undefined}
                        onClick={() => setItemIndex(index)}
                      >
                        <Picture item={entry} icon={tab.icon} sizes="96px" className={styles.thumb} />
                        <span className={styles.railBody}>
                          <strong>{entry.title}</strong>
                          <small>{[formatLabel(entry), info].filter(Boolean).join(" · ")}</small>
                        </span>
                        {on && !calm && <span className={styles.timer} style={{ animationDuration: `${ITEM_MS}ms`, animationPlayState: paused ? "paused" : "running" }} aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <Link href={SEE_ALL} className={styles.seeAll}>
                See all experiences
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
