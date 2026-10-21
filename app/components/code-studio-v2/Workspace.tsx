"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./Workspace.module.css";
import { ROBOT_GOAL, ROBOT_START, runRobotProgram, type RobotCommand, type RobotPosition, type RobotRunResult } from "@/lib/code-studio-v2/robot-simulator";

type Command = RobotCommand;
type Block = { id: number; command: Command };

const LABELS: Record<Command, { title: string; icon: string; code: string; hint: string }> = {
  forward: { title: "Move forward", icon: "⬆️", code: "moveForward()", hint: "Move one square in the direction the robot faces." },
  left: { title: "Turn left", icon: "↶", code: "turnLeft()", hint: "Turn 90 degrees to the left without moving." },
  right: { title: "Turn right", icon: "↷", code: "turnRight()", hint: "Turn 90 degrees to the right without moving." },
  beep: { title: "Beep", icon: "🔔", code: "beep()", hint: "Make the robot signal that it reached a checkpoint." },
};
const EXAMPLE_PROGRAM: Command[] = ["forward", "forward", "right", "forward", "forward"];
const MAX_BLOCKS = 30;

export default function Workspace() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [nextId, setNextId] = useState(1);
  const [result, setResult] = useState<RobotRunResult | null>(null);
  const [showHints, setShowHints] = useState(false);
  const code = useMemo(() => blocks.map((block, index) => `// ${index + 1}. ${LABELS[block.command].title}\nrobot.${LABELS[block.command].code}`).join("\n"), [blocks]);
  const current: RobotPosition = result?.position ?? ROBOT_START;
  const visited = new Set(result?.visited ?? [`${ROBOT_START.x},${ROBOT_START.y}`]);

  function addBlock(command: Command) {
    if (blocks.length >= MAX_BLOCKS) return;
    setBlocks((items) => [...items, { id: nextId, command }]);
    setNextId((id) => id + 1);
    setResult(null);
  }
  function moveBlock(index: number, offset: -1 | 1) {
    setBlocks((items) => {
      const destination = index + offset;
      if (destination < 0 || destination >= items.length) return items;
      const copy = [...items];
      [copy[index], copy[destination]] = [copy[destination], copy[index]];
      return copy;
    });
    setResult(null);
  }
  function removeBlock(id: number) {
    setBlocks((items) => items.filter((item) => item.id !== id));
    setResult(null);
  }
  function reset() {
    setBlocks([]);
    setNextId(1);
    setResult(null);
  }
  function loadExample() {
    setBlocks(EXAMPLE_PROGRAM.map((command, index) => ({ id: index + 1, command })));
    setNextId(EXAMPLE_PROGRAM.length + 1);
    setResult(null);
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/coding-robotics/code-studio/learn" className={styles.back}>← Back to learning</Link>
        <Link href="/" className={styles.brand}><span className={styles.brandMark}>R</span><span>RHINOX <small>CODE STUDIO</small></span></Link>
        <span className={styles.level}>BEGINNER WORKSPACE</span>
      </header>
      <div className={styles.container}>
        <section className={styles.welcome}>
          <div>
            <span className={styles.eyebrow}>YOUR FIRST PROGRAM</span>
            <h1>Give RhinoBot a mission.</h1>
            <p>Add instructions, put them in the right order, then run your program. You are learning the same core idea used in real coding: precise instructions in a sequence.</p>
          </div>
          <div className={styles.mission}><span>🎯 MISSION</span><strong>Guide RhinoBot to the star.</strong><small>Start at the blue square. Reach the gold star without leaving the grid.</small></div>
        </section>

        <section className={styles.workspace}>
          <div className={styles.programPanel}>
            <div className={styles.panelHeader}><div><span className={styles.panelKicker}>01 / BUILD</span><h2>Your instructions</h2></div><span className={styles.count}>{blocks.length}/{MAX_BLOCKS} blocks</span></div>
            <p className={styles.helper}>Add an instruction from the toolbox. Use the arrows to change its order. You can use up to {MAX_BLOCKS} instructions in one mission.</p>
            <div className={styles.toolbox}>
              {(Object.keys(LABELS) as Command[]).map((command) => (
                <button key={command} className={styles.tool} onClick={() => addBlock(command)} disabled={blocks.length >= MAX_BLOCKS} title={blocks.length >= MAX_BLOCKS ? `Maximum ${MAX_BLOCKS} instructions reached` : LABELS[command].hint}>
                  <span>{LABELS[command].icon}</span><span>{LABELS[command].title}</span><b>+</b>
                </button>
              ))}
            </div>
            <div className={styles.programList} aria-label="Program instructions">
              {blocks.length === 0 ? <div className={styles.emptyProgram}>Your program is empty. Add your first instruction above.</div> : blocks.map((block, index) => (
                <div className={styles.programBlock} key={block.id}>
                  <span className={styles.blockNumber}>{index + 1}</span><span className={styles.blockIcon}>{LABELS[block.command].icon}</span><strong>{LABELS[block.command].title}</strong>
                  <div className={styles.blockActions}>
                    <button onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label={`Move instruction ${index + 1} up`}>↑</button>
                    <button onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} aria-label={`Move instruction ${index + 1} down`}>↓</button>
                    <button onClick={() => removeBlock(block.id)} aria-label={`Remove instruction ${index + 1}`}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.programActions}>
              <button className={styles.runButton} onClick={() => setResult(runRobotProgram(blocks.map((block) => block.command)))}>▶ Run program</button>
              <button className={styles.resetButton} onClick={loadExample}>Load example</button>
              <button className={styles.resetButton} onClick={reset}>Clear</button>
            </div>
            {result && <div className={result.success ? styles.success : styles.feedback} role="status"><strong>{result.success ? "Mission accomplished" : "Keep experimenting"}</strong><p>{result.message}</p></div>}
          </div>

          <div className={styles.previewColumn}>
            <section className={styles.previewPanel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>02 / TEST</span><h2>Robot playground</h2></div><span className={styles.liveTag}>LIVE PREVIEW</span></div>
              <p className={styles.helper}>Run the program to see where your instructions take the robot.</p>
              <div className={styles.grid} role="img" aria-label="Five by five robot grid. Blue square is the start and gold star is the goal.">
                {Array.from({ length: 25 }, (_, index) => {
                  const x = index % 5; const y = Math.floor(index / 5);
                  const isRobot = current.x === x && current.y === y;
                  const isStart = ROBOT_START.x === x && ROBOT_START.y === y;
                  const isGoal = ROBOT_GOAL.x === x && ROBOT_GOAL.y === y;
                  const hasVisited = visited.has(`${x},${y}`);
                  const rotation = current.direction * 90;
                  return <div key={index} className={`${styles.cell} ${hasVisited ? styles.visited : ""} ${isStart ? styles.startCell : ""} ${isGoal ? styles.goalCell : ""} ${isRobot ? styles.robotCell : ""}`}>
                    {isGoal && <span className={styles.goalIcon}>★</span>}
                    {isRobot && <span className={styles.robotIcon} style={{ transform: `rotate(${rotation}deg)` }} aria-label="RhinoBot">▲</span>}
                    {isStart && !isRobot && <span className={styles.startDot} />}
                  </div>;
                })}
              </div>
              <div className={styles.legend}><span><i className={styles.legendStart} />Start</span><span><i className={styles.legendGoal} />Goal</span><span><i className={styles.legendPath} />Robot path</span></div>
              <div className={styles.position}><span>ROBOT POSITION</span><strong>Column {current.x + 1}, Row {current.y + 1}</strong><small>Facing {["North", "East", "South", "West"][current.direction]}</small></div>
            </section>

            <section className={styles.codePanel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>03 / UNDERSTAND</span><h2>Code view</h2></div><button className={styles.hintToggle} onClick={() => setShowHints((value) => !value)}>{showHints ? "Hide guide" : "Explain code"}</button></div>
              <p className={styles.helper}>Your instruction blocks are translated into a readable code-like form.</p>
              <pre className={styles.code}><code>{code || "// Add blocks to build your program"}</code></pre>
              {showHints && <div className={styles.explanation}><strong>What is an algorithm?</strong><p>An algorithm is a set of steps that solves a problem. Computers follow instructions in order. Changing the order can change the result.</p><strong>Try this</strong><p>Move a turn block earlier or later, then run the program again. Observe how the robot&apos;s path changes.</p></div>}
            </section>
          </div>
        </section>
        <footer className={styles.footer}><span>Rhinox Scientifica</span><span>Think • Move • Code!</span><span>Beginner workspace preview · No account required for this demo</span></footer>
      </div>
    </main>
  );
}
