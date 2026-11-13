"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "./path.module.css";
import { saveStepDone } from "@/lib/tmc-path/save-step";

// Frames a game from the weekly pack. When the child finishes the first round, the matching
// Learning Path step is ticked in this browser only. The games are untouched: this watches the
// "well done" panel each one already shows (#win, or #done in the pairs game).
export default function GameFrame({
  src,
  title,
  className,
  levelSlug,
  stepId,
  pathHref,
}: {
  src: string;
  title: string;
  className: string;
  levelSlug: string;
  stepId: string;
  pathHref: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<"idle" | "saved" | "blocked">("idle");

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let observer: MutationObserver | null = null;

    const attach = () => {
      observer?.disconnect();
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        const finished = () => {
          const win = doc.getElementById("win");
          const done = doc.getElementById("done");
          return Boolean(win?.classList.contains("show") || (done && !done.hidden));
        };
        const check = () => {
          if (!finished()) return;
          setState(saveStepDone(levelSlug, stepId) === "blocked" ? "blocked" : "saved");
        };
        observer = new MutationObserver(check);
        observer.observe(doc.documentElement, { subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
        check();
      } catch {
        // If the game cannot be watched, the grown-up can still tick the step on the path.
      }
    };

    frame.addEventListener("load", attach);
    if (frame.contentDocument?.readyState === "complete") attach();
    return () => {
      frame.removeEventListener("load", attach);
      observer?.disconnect();
    };
  }, [levelSlug, stepId]);

  return (
    <>
      {state !== "idle" ? (
        <p className={styles.gameNote} role="status">
          {state === "saved" ? (
            <>
              Well done! This step is ticked on your <Link href={pathHref}>Learning Path</Link>, saved only in this browser.
            </>
          ) : (
            <>Well done! This browser is not letting us save progress.</>
          )}
        </p>
      ) : null}
      <iframe ref={frameRef} className={className} src={src} title={title} />
    </>
  );
}
