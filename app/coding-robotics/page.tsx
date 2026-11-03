import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "../components/Breadcrumbs";
import PageHeader from "../components/PageHeader";
import { getSectionByPath, getSectionItems } from "@/lib/content-sections";
import styles from "./coding-robotics.module.css";

export const metadata: Metadata = {
  title: "Coding & Robotics | Rhinox Scientifica",
  description:
    "RhinoCode: program a robot, write Python, build games and practise with coding challenges. Everything runs in the browser.",
};

// Live challenge count, read from the same source as the challenges page.
function challengeCount(): number {
  const section = getSectionByPath("/coding-robotics/challenges");
  return section ? getSectionItems(section).length : 0;
}

const STEPS = ["Think", "Code", "Run", "Improve"];

export default function CodingRoboticsPage() {
  const challenges = challengeCount();
  const rows = [
    {
      title: "Rhinox Code Studio",
      text: "Write and run real Python in your browser, with guided exercises that check your answers.",
      href: "/coding-robotics/code-studio",
    },
    {
      title: "RhinoBot: Robot Lab",
      text: "Snap blocks together to guide a robot through missions, from first steps to loops and decisions.",
      href: "/coding-robotics/robot-lab",
    },
    {
      title: "RhinoCode Game Creator",
      text: "Design levels with enemies, keys and doors, set the rules, then play the game you built.",
      href: "/coding-robotics/game-creator",
    },
    {
      title: "Game Challenges",
      text: "Short coding puzzles and missions to practise one idea at a time.",
      href: "/coding-robotics/challenges",
      count: challenges > 0 ? `${challenges} ${challenges === 1 ? "challenge" : "challenges"}` : "Being added",
    },
    {
      title: "My Projects",
      text: "Your saved programmes and games, kept together and ready to reopen.",
      href: "/coding-robotics/my-projects",
    },
  ];

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Coding & Robotics" }]} />
      </div>
      <PageHeader
        eyebrow="RhinoCode"
        title="Learn to code by building"
        lead="Program a robot, write Python, make games and practise with challenges. Everything runs in the browser."
      />

      <section className={styles.indexSection} aria-label="Where to start">
        <div className="rx-container">
          <ol className={styles.index}>
            {rows.map((row, i) => (
              <li key={row.href}>
                <Link href={row.href} className={styles.row}>
                  <span className={styles.num} aria-hidden="true">{i + 1}</span>
                  <span className={styles.text}>
                    <span className={styles.rowTitle}>{row.title}</span>
                    <span className={styles.desc}>{row.text}</span>
                    {row.count && <span className={styles.countMobile}>{row.count}</span>}
                  </span>
                  <span className={styles.count}>{row.count}</span>
                  <span className={styles.arrow} aria-hidden="true">{"→"}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.method} aria-label="How it works">
        <div className={`rx-container ${styles.methodInner}`}>
          <p className={styles.methodLabel}>How it works</p>
          <ol className={styles.steps}>
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className={styles.methodText}>Plan the steps, build your instructions, watch them run, then fix and try again.</p>
        </div>
      </section>

      <section className={styles.closing} aria-label="For schools">
        <div className={`rx-container ${styles.closingInner}`}>
          <p>Teaching coding at school? See our programmes.</p>
          <Link href="/schools/coding-robotics" className="rx-button rx-button-primary">School programmes</Link>
        </div>
      </section>
    </main>
  );
}
