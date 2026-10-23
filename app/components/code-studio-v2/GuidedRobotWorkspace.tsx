"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Workspace.module.css";
import extra from "./GuidedRobotWorkspace.module.css";
import { isGuidedRobotLaunch, type GuidedRobotLaunch } from "@/lib/code-studio-v2/guided-launch";
import { evaluateGuidedRobotRun, type GuidedRunEvaluation } from "@/lib/code-studio-v2/guided-mission";
import type { RobotCommand } from "@/lib/code-studio-v2/robot-simulator";

type Card = { id: number; command: RobotCommand };

const LABELS: Record<RobotCommand, { title: string; icon: string }> = {
  forward: { title: "Move forward", icon: "↑" },
  back: { title: "Move back", icon: "↓" },
  left: { title: "Turn left", icon: "↶" },
  right: { title: "Turn right", icon: "↷" },
  beep: { title: "Beep", icon: "🔔" },
};
const DIRECTIONS = ["north", "east", "south", "west"] as const;

function resultMessage(evaluation: GuidedRunEvaluation, name: string) {
  switch (evaluation.status) {
    case "met-all-rules":
      return { good: true, heading: `${name} reached the star!`, text: "Your cards followed the rules for this mission. Now show a grown-up how you made it, and say what each card did." };
    case "reached-finish-outside-rules":
      return { good: false, heading: `${name} reached the star, but the cards need a change`, text: "Look at the rules below, change your cards, and run again." };
    case "blocked":
      return { good: false, heading: `${name} bumped into the edge`, text: "One card would take the robot off the grid. Look at the steps, change that card, and run again." };
    case "invalid-setup":
      return { good: false, heading: "This mission is not ready", text: "Go back to the lesson and ask a grown-up for help." };
    default:
      return { good: false, heading: `${name} has not reached the star yet`, text: "Watch the steps, change your cards, and try again." };
  }
}

export default function GuidedRobotWorkspace({ launch, draft }: { launch: unknown; draft: boolean }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [nextId, setNextId] = useState(1);
  const [evaluation, setEvaluation] = useState<GuidedRunEvaluation | null>(null);
  const [step, setStep] = useState(-1); // -1 shows the final position

  // The workspace validates the launch itself; it never trusts the caller.
  if (!isGuidedRobotLaunch(launch)) return <GuidedUnavailable />;
  const lesson: GuidedRobotLaunch = launch;
  const { mission, start, rules } = lesson.mission;
  const name = lesson.characterName;
  const size = mission.gridSize;
  const run = evaluation?.run ?? null;
  const shown = run && step >= 0 ? run.trace[Math.min(step, run.trace.length - 1)] : null;
  const current = shown?.position ?? (run && step === -1 ? run.position : start);
  const visited = new Set<string>([`${start.x},${start.y}`]);
  if (run) {
    if (step === -1) run.visited.forEach((cell) => visited.add(cell));
    else run.trace.slice(0, step + 1).forEach((item) => visited.add(`${item.position.x},${item.position.y}`));
  }
  const message = evaluation ? resultMessage(evaluation, name) : null;
  const atMax = cards.length >= rules.maxCards;
  const countText = rules.minCards === rules.maxCards ? `${rules.minCards}` : `${rules.minCards} to ${rules.maxCards}`;

  function changed() { setEvaluation(null); setStep(-1); }
  function addCard(command: RobotCommand) {
    if (cards.length >= rules.maxCards) return;
    setCards((items) => [...items, { id: nextId, command }]);
    setNextId((id) => id + 1);
    changed();
  }
  function moveCard(index: number, offset: -1 | 1) {
    setCards((items) => {
      const to = index + offset;
      if (to < 0 || to >= items.length) return items;
      const copy = [...items];
      [copy[index], copy[to]] = [copy[to], copy[index]];
      return copy;
    });
    changed();
  }
  function removeCard(id: number) { setCards((items) => items.filter((item) => item.id !== id)); changed(); }
  function clearAll() { setCards([]); changed(); }
  function runCards() {
    const result = evaluateGuidedRobotRun(cards.map((card) => card.command), lesson.mission);
    setEvaluation(result);
    setStep(result.run && result.run.trace.length ? 0 : -1);
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={lesson.returnPath} className={styles.back}>← Back to learning</Link>
        <Link href="/" className={styles.brand}><span className={styles.brandMark}>R</span><span>RHINOX <small>CODE STUDIO</small></span></Link>
        <span className={styles.level}>GUIDED LESSON</span>
      </header>
      <div className={styles.container}>
        {draft && <p className={extra.draftBanner} role="note"><strong>Draft preview.</strong> This mission has not been reviewed by the curriculum team. It is shown for development only.</p>}
        <section className={styles.welcome}>
          <div>
            <span className={styles.eyebrow}>ARROW CARDS ON THE GRID</span>
            <h1>Help {name} reach the star.</h1>
            <p>Choose arrow cards and put them in order. Then press Run and watch what {name} does.</p>
          </div>
          <div className={styles.mission}><span>🎯 MISSION</span><strong>Use {countText} cards{rules.minTurns > 0 ? `, with at least ${rules.minTurns} turn${rules.minTurns === 1 ? "" : "s"}` : ""}.</strong><small>{name} starts on the blue square and must reach the gold star.</small></div>
        </section>

        <section className={styles.workspace}>
          <div className={styles.programPanel}>
            <div className={styles.panelHeader}><div><span className={styles.panelKicker}>01 / CHOOSE</span><h2>Your arrow cards</h2></div><span className={styles.count} aria-live="polite">{cards.length} cards · use {countText}</span></div>
            <p className={styles.helper}>Press a card to add it. Use the arrows to change the order.</p>
            <div className={styles.toolbox}>
              {lesson.availableCommands.map((command) => (
                <button key={command} type="button" className={styles.tool} onClick={() => addCard(command)} disabled={atMax} title={atMax ? `You can use at most ${rules.maxCards} cards` : LABELS[command].title}>
                  <span aria-hidden="true">{LABELS[command].icon}</span><span>{LABELS[command].title}</span><b aria-hidden="true">+</b>
                </button>
              ))}
            </div>
            <ol className={`${styles.programList} ${extra.plainList}`} aria-label="Your cards in order">
              {cards.length === 0 ? <li className={styles.emptyProgram}>No cards yet. Press a card above.</li> : cards.map((card, index) => (
                <li className={styles.programBlock} key={card.id}>
                  <span className={styles.blockNumber}>{index + 1}</span><span className={styles.blockIcon} aria-hidden="true">{LABELS[card.command].icon}</span><strong>{LABELS[card.command].title}</strong>
                  <div className={styles.blockActions}>
                    <button type="button" onClick={() => moveCard(index, -1)} disabled={index === 0} aria-label={`Move card ${index + 1} earlier`}>↑</button>
                    <button type="button" onClick={() => moveCard(index, 1)} disabled={index === cards.length - 1} aria-label={`Move card ${index + 1} later`}>↓</button>
                    <button type="button" onClick={() => removeCard(card.id)} aria-label={`Remove card ${index + 1}`}>×</button>
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.programActions}>
              <button type="button" className={styles.runButton} onClick={runCards} disabled={cards.length === 0}>▶ Run</button>
              <button type="button" className={styles.resetButton} onClick={clearAll} disabled={cards.length === 0}>Clear</button>
            </div>
            {evaluation && message && (
              <div className={message.good ? styles.success : styles.feedback} role="status">
                <strong>{message.heading}</strong>
                <p>{message.text}</p>
                {evaluation.problems.length > 0 && <ul className={extra.problems}>{evaluation.problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>}
                <p className={extra.evidence}>{evaluation.evidenceNote}</p>
              </div>
            )}
            {run && run.trace.length > 0 && (
              <section className={styles.tracePanel} aria-label="What happened, step by step">
                <div className={styles.traceHeading}><strong>What happened, step by step</strong><span>{run.trace.length} steps</span></div>
                <div className={styles.traceControls}>
                  <button type="button" onClick={() => setStep(-1)} disabled={step === -1}>Show final</button>
                  <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step <= 0}>Previous</button>
                  <span>{step === -1 ? "Final position" : `Step ${step + 1} of ${run.trace.length}`}</span>
                  <button type="button" onClick={() => setStep((value) => Math.min(run.trace.length - 1, value + 1))} disabled={step >= run.trace.length - 1}>Next step</button>
                </div>
              </section>
            )}
          </div>

          <div className={styles.previewColumn}>
            <section className={styles.previewPanel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>02 / WATCH</span><h2>{name}&apos;s grid</h2></div></div>
              <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }} role="img"
                aria-label={`${size} by ${size} grid. Blue square is the start and gold star is the finish at column ${mission.goal.x + 1}, row ${mission.goal.y + 1}. ${name} is at column ${current.x + 1}, row ${current.y + 1}, facing ${DIRECTIONS[current.direction]}.`}>
                {Array.from({ length: size * size }, (_, index) => {
                  const x = index % size; const y = Math.floor(index / size);
                  const isRobot = current.x === x && current.y === y;
                  const isStart = start.x === x && start.y === y;
                  const isGoal = mission.goal.x === x && mission.goal.y === y;
                  return <div key={index} data-testid={isGoal ? "goal-cell" : undefined} className={`${styles.cell} ${visited.has(`${x},${y}`) ? styles.visited : ""} ${isStart ? styles.startCell : ""} ${isGoal ? styles.goalCell : ""} ${isRobot ? styles.robotCell : ""}`}>
                    {isGoal && <span className={styles.goalIcon}>★</span>}
                    {isRobot && <span className={styles.robotIcon} style={{ transform: `rotate(${current.direction * 90}deg)` }}>▲</span>}
                    {isStart && !isRobot && <span className={styles.startDot} />}
                  </div>;
                })}
              </div>
              <div className={styles.legend}><span><i className={styles.legendStart} />Start</span><span><i className={styles.legendGoal} />Finish star</span><span><i className={styles.legendPath} />Path</span></div>
              <div className={styles.position} aria-live="polite" aria-atomic="true"><span>{name.toUpperCase()}&apos;S POSITION</span><strong>Column {current.x + 1}, Row {current.y + 1}</strong><small>Facing {DIRECTIONS[current.direction]}</small></div>
            </section>
          </div>
        </section>
        <footer className={styles.footer}><span>Rhinox Scientifica</span><span>Think • Move • Code!</span><span>Your cards are not saved when you close this page.</span></footer>
      </div>
    </main>
  );
}

export function GuidedUnavailable() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={extra.unavailable} aria-labelledby="guided-unavailable-title">
          <h1 id="guided-unavailable-title">This activity is not ready yet</h1>
          <p>We could not open this coding activity. You can still do the lesson on paper or with a grown-up.</p>
          <Link href="/coding-robotics/code-studio/learn" className={styles.runButton}>Back to learning</Link>
        </section>
      </div>
    </main>
  );
}
