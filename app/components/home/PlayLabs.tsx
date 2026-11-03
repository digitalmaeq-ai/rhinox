"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { type ContentItem } from "@/lib/content";
import { getExperienceHref, getExperienceSequence } from "@/lib/experience-sequence";
import { pairCount, pickPair, SHOWCASE_ROTATE_MS, showcaseEntries, type ShowcaseEntry } from "@/lib/showcase-experiences";
import { parseLevel, runProgram, type Block } from "@/lib/maze-coder/engine";
import { mazeLevels } from "@/lib/maze-coder/levels";
import MazeBoard from "@/app/components/interactive/maze-coder/MazeBoard";

import styles from "./PlayLabs.module.css";

/**
 * "Hands-on labs": the continuation of Play. Two live experiences are shown
 * side by side, each with a small animated preview, and the pair rotates
 * through the pool in lib/showcase-experiences.ts. Pauses while the visitor
 * is pointing at or focused on it, and never rotates for reduced motion.
 */

// ---------- Solar System preview ----------
// A live 3D side view (all eight planets circling the Sun, slowly). The CSS
// orbits below are the placeholder while it loads and the fallback when WebGL
// is missing or fails, so the card is never empty.
const SolarShowcase = dynamic(() => import("@/app/components/interactive/solar-system/SolarShowcase"), { ssr: false });

const orbits = [
  { size: 74, seconds: 7, color: "#a8a39d", dot: 6 },
  { size: 112, seconds: 11, color: "#e8c98a", dot: 8 },
  { size: 154, seconds: 16, color: "#3a86e8", dot: 9 },
  { size: 198, seconds: 24, color: "#d9683f", dot: 7 },
  { size: 252, seconds: 40, color: "#d9a066", dot: 15 },
  { size: 306, seconds: 58, color: "#e3c78d", dot: 12 },
];

function SolarFallback() {
  return (
    <div className={styles.solar} aria-hidden="true">
      <span className={styles.sun} />
      {orbits.map((orbit, index) => (
        <span key={orbit.size} className={styles.orbit} style={{ width: orbit.size, height: orbit.size, animationDuration: `${orbit.seconds}s`, animationDelay: `-${index * 3}s` }}>
          <i style={{ width: orbit.dot, height: orbit.dot, background: orbit.color }} />
        </span>
      ))}
    </div>
  );
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// If the 3D scene throws, keep the CSS fallback instead of breaking the page.
class SolarBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function SolarPreview({ reducedMotion }: { reducedMotion: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);

  // Mount the canvas only in the browser and only if WebGL exists.
  useEffect(() => {
    const timer = window.setTimeout(() => setWebgl(hasWebGL()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Draw frames only while the card is on screen.
  useEffect(() => {
    const node = box.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className={styles.solarLive} role="img" aria-label="Animated 3D side view of the Solar System: the eight planets slowly orbiting the Sun">
      <div className={`${styles.solarFallback} ${ready ? styles.solarFallbackOff : ""}`}>
        <SolarFallback />
      </div>
      {webgl && (
        <div className={`${styles.solarCanvas} ${ready ? styles.solarCanvasOn : ""}`}>
          <SolarBoundary fallback={null}>
            <SolarShowcase active={visible} reducedMotion={reducedMotion} onReady={() => setReady(true)} />
          </SolarBoundary>
        </div>
      )}
      <span className={styles.modeTag}>Live 3D · Side view</span>
    </div>
  );
}

// ---------- Maze preview: the real engine and board, replaying a solution ----------
const demoLevel = mazeLevels[4]; // Battery run
const demoParsed = parseLevel(demoLevel);
let demoId = 0;
const demoBlock = (kind: Block["kind"], extra: Partial<Block> = {}): Block => ({ id: `demo-${(demoId += 1)}`, kind, ...extra });
const demoProgram: Block[] = [
  demoBlock("repeat", { count: 5, body: [demoBlock("forward")] }),
  demoBlock("right"),
  demoBlock("repeat", { count: 3, body: [demoBlock("forward")] }),
];
const demoRun = runProgram(demoLevel, demoProgram);

function MazePreview({ active }: { active: boolean }) {
  const [tick, setTick] = useState(-1);
  const total = demoRun.steps.length;

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setTick((value) => (value >= total + 3 ? -1 : value + 1)), tick === -1 ? 900 : tick >= total ? 700 : 380);
    return () => window.clearTimeout(timer);
  }, [tick, active, total]);

  const index = Math.min(tick, total - 1);
  const step = index >= 0 ? demoRun.steps[index] : null;
  const taken = new Set<number>();
  for (let i = 0; i <= index; i += 1) {
    const chip = demoRun.steps[i]?.chip;
    if (chip !== null && chip !== undefined) taken.add(chip);
  }
  const pose = step ? { x: step.x, y: step.y, angle: step.angle } : { x: demoParsed.start.x, y: demoParsed.start.y, angle: demoLevel.heading * 90 };

  return (
    <div className={styles.maze} aria-hidden="true">
      <div className={styles.mazeBoard}>
        <MazeBoard level={demoParsed} robot={pose} takenChips={taken} arrived={tick >= total} label="Animated preview of the Robot Maze Coder" />
      </div>
      <ul className={styles.codeBlocks}>
        <li className={styles.cb_repeat}>⟳ Repeat 5×<span>→ Move forward</span></li>
        <li className={styles.cb_turn}>↻ Turn right</li>
        <li className={styles.cb_repeat}>⟳ Repeat 3×<span>→ Move forward</span></li>
      </ul>
    </div>
  );
}

function GenericPreview() {
  return <div className={styles.generic} aria-hidden="true" />;
}

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const readReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Card = { entry: ShowcaseEntry; item: ContentItem };

function metaOf(item: ContentItem) {
  const extra = item as ContentItem & { durationMinutes?: number; difficulty?: string };
  const parts: string[] = [];
  if (extra.durationMinutes) parts.push(`${extra.durationMinutes} min`);
  if (extra.difficulty) parts.push(extra.difficulty.charAt(0).toUpperCase() + extra.difficulty.slice(1));
  return parts;
}

export default function PlayLabs() {
  const pool = useMemo<Card[]>(() => {
    const library = getExperienceSequence();
    return showcaseEntries.flatMap((entry) => {
      const item = library.find((candidate) => candidate.slug === entry.slug);
      return item ? [{ entry, item }] : [];
    });
  }, []);

  const pairs = pairCount(pool.length);
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);

  // Start from a different pair on each visit (after mount, so the server and
  // browser render the same first frame).
  useEffect(() => {
    if (pairs < 2) return;
    const timer = window.setTimeout(() => setStart(Math.floor(Math.random() * pairs)), 0);
    return () => window.clearTimeout(timer);
  }, [pairs]);

  useEffect(() => {
    if (pairs < 2 || paused || reduced) return;
    const timer = window.setTimeout(() => setStart((value) => (value + 1) % pairs), SHOWCASE_ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [start, pairs, paused, reduced]);

  if (pool.length === 0) return null;
  const shown = pickPair(pool, start);

  return (
    <section className={styles.labs} aria-labelledby="play-labs-title">
      <div className={`rx-container ${styles.inner}`}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Hands-on labs</p>
            <h2 id="play-labs-title" className={styles.title}>
              Don&apos;t just read it. <span>Run it yourself.</span>
            </h2>
          </div>
          {pairs > 1 && (
            <div className={styles.dots} role="group" aria-label="Choose a pair of labs">
              {Array.from({ length: pairs }, (_, index) => (
                <button key={index} type="button" className={index === start ? styles.dotOn : ""} aria-label={`Show labs ${index + 1} of ${pairs}`} aria-current={index === start} onClick={() => setStart(index)} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.grid} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          {shown.map(({ entry, item }) => (
            <article key={`${entry.slug}-${start}`} className={styles.card}>
              <div className={styles.preview}>
                {entry.preview === "solar-system" ? <SolarPreview reducedMotion={reduced} /> : entry.preview === "maze-coder" ? <MazePreview active /> : <GenericPreview />}
                <span className={styles.kicker}>{entry.kicker}</span>
              </div>
              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <span className={styles.meta}>{metaOf(item).join(" · ")}</span>
                </div>
                <p className={styles.text}>{item.description}</p>
                <div className={styles.foot}>
                  <ul className={styles.points}>
                    {entry.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <Link href={getExperienceHref(item)} className={styles.play}>
                    Play now
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
