"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import type { SimState } from "../interactive/simlab/types";
import styles from "./LabPreviews.module.css";

// The real 3D scenes from the experiments themselves (glass, liquid, metal),
// shown slowly turning with a looping demo. three.js is heavy, so it loads
// only when the card is near the screen. The picture is decorative: it ignores
// the pointer so the page still scrolls normally. If WebGL is missing, the
// flat drawing passed as `fallback` is shown instead.
const Scene3DHost = dynamic(() => import("../interactive/simlab/scenes3d/Scene3DHost"), { ssr: false });

export type Lab3DKind = "titration" | "acids-bases" | "electrolysis" | "electric-circuit";

const SAMPLE_CYCLE = ["lime", "water", "soap"];

function demoState(kind: Lab3DKind, tick: number, reduced: boolean): SimState {
  switch (kind) {
    case "titration": {
      // Acid runs in, the flask turns at the end point (about 25 cm³), then it resets.
      const added = reduced ? 25 : Math.min(25.4, (tick % 90) * 0.3);
      return { start: 0, added, indicator: "phenolphthalein", acid: "HCl", base: "NaOH", cA: 0.1, cB: 0.1, vB: 25, compact: true };
    }
    case "acids-bases":
      return { sample: SAMPLE_CYCLE[reduced ? 0 : Math.floor(tick / 30) % SAMPLE_CYCLE.length], indicator: "universal", added: true, dilution: 0, label: "", recs: 0, solved: 0 };
    case "electrolysis":
      return { electrolyte: "water", electrode: "inert", voltage: 6, current: 2, minutes: 5, recs: 0, bare: true };
    default:
      return { closed: true, cells: 2, bulbs: 2, layout: "parallel", rheo: 0, recs: 0, curved: false };
  }
}

export default function Lab3DPreview({ kind, label, reducedMotion, fallback }: { kind: Lab3DKind; label: string; reducedMotion: boolean; fallback: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Only titration and the pH cards change over time; the others move by themselves.
  const animated = !reducedMotion && near && (kind === "titration" || kind === "acids-bases");
  useEffect(() => {
    if (!animated) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 150);
    return () => window.clearInterval(id);
  }, [animated]);

  return (
    <div ref={box} className={styles.scene3d} role="img" aria-label={label}>
      {near ? <Scene3DHost sceneKey={kind} state={demoState(kind, tick, reducedMotion)} autoRotate={!reducedMotion} fallback={fallback} /> : fallback}
    </div>
  );
}
