"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./CodeStudioBand.module.css";

// A small maze that shows what the Game Creator makes. # wall, S start, G goal,
// c coin, e enemy, k key, D door, . floor.
const MAZE = ["#########", "#S..c..e#", "#.##.##.#", "#c.#k#.c#", "#.##D##.#", "#...c...G", "#########"];
const CELL: Record<string, string> = { "#": styles.wall, S: styles.start, G: styles.goal, c: styles.coin, e: styles.enemy, k: styles.key, D: styles.door };

type Tool = { id: string; tab: string; title: string; text: string; href: string; cta: string };

// Every link goes to a real Code Studio workspace.
const TOOLS: Tool[] = [
  { id: "python", tab: "Python", title: "Write and run Python", text: "Type a program, press run and see the output straight away.", href: "/coding-robotics/code-studio", cta: "Open Python" },
  { id: "web", tab: "Web", title: "Build a web page", text: "Write HTML and watch the page change beside your code.", href: "/coding-robotics/code-studio/web", cta: "Open Web Studio" },
  { id: "arduino", tab: "Arduino", title: "Program a board", text: "Make an LED blink by writing the instructions yourself.", href: "/coding-robotics/code-studio/arduino", cta: "Open Arduino" },
  { id: "robot", tab: "Robot", title: "Steer RhinoBot", text: "Snap blocks together to guide the robot through a maze.", href: "/coding-robotics/robot-lab", cta: "Open Robot Lab" },
  { id: "game", tab: "Game", title: "Design your own game", text: "Place walls, coins, keys, doors and enemies, then play your level.", href: "/coding-robotics/game-creator", cta: "Open Game Creator" },
];

const ROTATE_MS = 7000;

function Preview({ id }: { id: string }) {
  switch (id) {
    case "python":
      return (
        <div className={styles.split}>
          <pre className={styles.code} aria-label="Python code">{`for n in range(1, 4):\n    print("Rhino", n)`}</pre>
          <pre className={styles.out} aria-label="Output">{`Rhino 1\nRhino 2\nRhino 3`}</pre>
        </div>
      );
    case "web":
      return (
        <div className={styles.split}>
          <pre className={styles.code} aria-label="HTML code">{`<h1>My page</h1>\n<p>Hello, Lagos!</p>`}</pre>
          <div className={styles.page} aria-label="Page preview">
            <strong>My page</strong>
            <span>Hello, Lagos!</span>
          </div>
        </div>
      );
    case "arduino":
      return (
        <div className={styles.split}>
          <pre className={styles.code} aria-label="Arduino code">{`digitalWrite(13, HIGH);\ndelay(500);\ndigitalWrite(13, LOW);`}</pre>
          <div className={styles.board} aria-label="LED blinking"><i className={styles.led} /></div>
        </div>
      );
    case "robot":
      return (
        <div className={styles.split}>
          <div className={styles.blocks} aria-label="Code blocks">
            <b>Repeat 3×</b>
            <span>Move forward</span>
            <em>Turn right</em>
          </div>
          <div className={styles.track} aria-label="Robot moving along a path">
            {Array.from({ length: 6 }, (_, i) => <i key={i} className={i === 5 ? styles.goal : ""} />)}
            <u className={styles.bot} />
          </div>
        </div>
      );
    default:
      return (
        <div className={styles.maze} aria-label="A level made in Game Creator">
          {MAZE.flatMap((row, y) => [...row].map((ch, x) => <i key={`${x}-${y}`} className={CELL[ch] ?? ""} />))}
        </div>
      );
  }
}

/** Home page band: Rhinox Code Studio, showing what is inside it. */
export default function CodeStudioBand() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [chosen, setChosen] = useState(false); // the learner picked a tab: stop auto-rotation
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || chosen || reduced) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % TOOLS.length), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, chosen, reduced]);

  const tool = TOOLS[index];

  return (
    <section className={styles.band} aria-labelledby="code-studio-band-title">
      <div className={`rx-container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.kind}>Rhinox Code Studio</p>
          <h2 id="code-studio-band-title" className={styles.title}>
            Learn to code. <span>Then build something.</span>
          </h2>
          <p className={styles.text}>
            Write Python, build web pages, program Arduino, steer RhinoBot through a maze and design your own game levels. Save everything in My Projects.
          </p>
          <div className={styles.actions}>
            <Link href="/coding-robotics" className={styles.primary}>Start coding</Link>
            <Link href="/coding-robotics/game-creator" className={styles.secondary}>Open Game Creator</Link>
          </div>
        </div>

        <div className={styles.window} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <div className={styles.tabs} role="tablist" aria-label="Inside Rhinox Code Studio">
            {TOOLS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`cs-tab-${t.id}`}
                aria-selected={i === index}
                aria-controls="cs-panel"
                tabIndex={i === index ? 0 : -1}
                className={i === index ? styles.tabOn : ""}
                onClick={() => {
                  setIndex(i);
                  setChosen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowRight" ? 1 : TOOLS.length - 1)) % TOOLS.length;
                  setIndex(next);
                  setChosen(true);
                  document.getElementById(`cs-tab-${TOOLS[next].id}`)?.focus();
                }}
              >
                {t.tab}
              </button>
            ))}
          </div>
          <div id="cs-panel" role="tabpanel" aria-labelledby={`cs-tab-${tool.id}`} className={styles.panel} key={tool.id}>
            <Preview id={tool.id} />
            <div className={styles.caption}>
              <div>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
              </div>
              <Link href={tool.href} className={styles.open}>{tool.cta} <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
