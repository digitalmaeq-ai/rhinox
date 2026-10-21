"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./Workspace.module.css";
import { ROBOT_GOAL, ROBOT_START, runRobotProgram, type RobotCommand, type RobotPosition, type RobotRunResult } from "@/lib/code-studio-v2/robot-simulator";
import { parseRobotTextProgram } from "@/lib/code-studio-v2/text-code-parser";
import { createWorkspaceResetState } from "@/lib/code-studio-v2/workspace-state";
import { getRobotMissionFeedback } from "@/lib/code-studio-v2/robot-mission-feedback";
import { parseConditionalRobotTextProgram } from "@/lib/code-studio-v2/conditional-text-parser";
import { runConditionalRobotProgram, type ConditionalTraceEvent } from "@/lib/code-studio-v2/conditional-program";

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
  const [editorMode, setEditorMode] = useState<"blocks" | "text">("blocks");
  const [textCode, setTextCode] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [traceIndex, setTraceIndex] = useState(-1);
  const [conditionalEvents, setConditionalEvents] = useState<ConditionalTraceEvent[]>([]);
  const code = useMemo(() => blocks.map((block, index) => `// ${index + 1}. ${LABELS[block.command].title}\nrobot.${LABELS[block.command].code}`).join("\n"), [blocks]);
  const missionFeedback = result ? getRobotMissionFeedback(result) : null;
  const activeTrace = result && traceIndex >= 0 ? result.trace[Math.min(traceIndex, result.trace.length - 1)] : null;
  const current: RobotPosition = activeTrace?.position ?? (result && traceIndex === -1 ? result.position : ROBOT_START);
  const visited = new Set(result && traceIndex === -1 ? result.visited : [`${ROBOT_START.x},${ROBOT_START.y}`, ...(result?.trace.slice(0, traceIndex + 1).filter((step) => step.command === "forward" && !step.blocked).map((step) => `${step.position.x},${step.position.y}`) ?? [])]);

  function addBlock(command: Command) {
    if (blocks.length >= MAX_BLOCKS) return;
    setBlocks((items) => [...items, { id: nextId, command }]);
    setNextId((id) => id + 1);
    setResult(null);
    setParseError(null);
    setConditionalEvents([]);
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
    setConditionalEvents([]);
  }
  function removeBlock(id: number) {
    setBlocks((items) => items.filter((item) => item.id !== id));
    setResult(null);
    setConditionalEvents([]);
  }
  function reset() {
    const cleared = createWorkspaceResetState();
    setBlocks(cleared.blocks);
    setNextId(cleared.nextId);
    setTextCode(cleared.textCode);
    setResult(cleared.result);
    setParseError(cleared.parseError);
    setTraceIndex(cleared.traceIndex);
    setConditionalEvents([]);
  }
  function loadExample() {
    setBlocks(EXAMPLE_PROGRAM.map((command, index) => ({ id: index + 1, command })));
    setNextId(EXAMPLE_PROGRAM.length + 1);
    setTextCode(EXAMPLE_PROGRAM.map((command, index) => `// ${index + 1}. ${LABELS[command].title}\nrobot.${LABELS[command].code}`).join("\n"));
    setEditorMode("blocks");
    setParseError(null);
    setResult(null);
    setConditionalEvents([]);
  }
  function loadConditionalExample() {
    setTextCode([
      "// Reach the star, then choose what to do.",
      "robot.moveForward()",
      "robot.moveForward()",
      "robot.turnRight()",
      "robot.moveForward()",
      "robot.moveForward()",
      "if (robot.atGoal()) {",
      "  robot.beep()",
      "} else {",
      "  robot.turnLeft()",
      "}",
    ].join("\n"));
    setEditorMode("text");
    setParseError(null);
    setResult(null);
    setConditionalEvents([]);
    setTraceIndex(-1);
  }
  function runProgram() {
    if (editorMode === "text") {
      const hasConditionalSyntax = /^\s*if\s*\(/m.test(textCode) || /^\s*else\s*\{/m.test(textCode) || /^\s*\}\s*else\s*\{/m.test(textCode);
      if (hasConditionalSyntax) {
        const parsedConditional = parseConditionalRobotTextProgram(textCode);
        if (!parsedConditional.ok) {
          setParseError(`Line ${parsedConditional.line}: ${parsedConditional.message}`);
          setResult(null);
          setConditionalEvents([]);
          return;
        }
        const conditional = runConditionalRobotProgram(parsedConditional.instructions);
        const commandEvents = conditional.events.filter((event): event is Extract<ConditionalTraceEvent, { type: "command" }> => event.type === "command");
        setResult({ position: conditional.position, visited: conditional.visited, trace: commandEvents.map((event) => event.trace), message: conditional.message, success: conditional.success });
        setConditionalEvents(conditional.events.filter((event) => event.type === "branch"));
        setParseError(null);
        setTraceIndex(commandEvents.length ? 0 : -1);
        return;
      }
      const parsed = parseRobotTextProgram(textCode);
      if (!parsed.ok) {
        setParseError(`Line ${parsed.line}: ${parsed.message}`);
        setResult(null);
        setConditionalEvents([]);
        return;
      }
      setParseError(null);
      setConditionalEvents([]);
      setResult(runRobotProgram(parsed.commands, parsed.sourceLines, parsed.repeatPaths));
      setTraceIndex(0);
      return;
    }
    setParseError(null);
    setResult(runRobotProgram(blocks.map((block) => block.command)));
    setTraceIndex(0);
  }
  function switchToText() {
    setTextCode(code);
    setEditorMode("text");
    setParseError(null);
    setResult(null);
    setConditionalEvents([]);
  }
  function switchToBlocks() {
    const parsed = parseRobotTextProgram(textCode);
    if (!parsed.ok) {
      setParseError(`Line ${parsed.line}: ${parsed.message} Fix the text before switching back to blocks.`);
      return;
    }
    if (parsed.commands.length > MAX_BLOCKS) {
      setParseError(`This program expands to ${parsed.commands.length} instructions. The block editor supports up to ${MAX_BLOCKS}; reduce the repeat count or stay in text mode.`);
      return;
    }
    const nextBlocks = parsed.commands.map((command, index) => ({ id: index + 1, command }));
    setBlocks(nextBlocks);
    setNextId(nextBlocks.length + 1);
    setEditorMode("blocks");
    setParseError(null);
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
              <button className={styles.runButton} onClick={runProgram}>▶ Run program</button>
              <button className={styles.resetButton} onClick={loadExample}>Load example</button>
              <button className={styles.resetButton} onClick={reset}>Clear</button>
            </div>
            {missionFeedback && <div className={missionFeedback.status === "complete" ? styles.success : styles.feedback} role="status"><strong>{missionFeedback.heading}</strong><p>{missionFeedback.explanation}</p><p>{missionFeedback.nextAction}</p></div>}
            {conditionalEvents.length > 0 && (
              <section className={styles.tracePanel} aria-label="Conditional decisions">
                <div className={styles.traceHeading}><strong>How RhinoBot chose a branch</strong><span>{conditionalEvents.length} decisions</span></div>
                <ol className={styles.traceList}>
                  {conditionalEvents.map((event, index) => event.type === "branch" ? (
                    <li className={styles.traceStep} key={`${event.sourceLine}-${index}`}>
                      <div className={styles.traceJump}>
                        <span className={styles.traceNumber}>{index + 1}</span>
                        <div><strong>Line {event.sourceLine}: {event.result ? "Condition true" : "Condition false"}</strong><p>{event.explanation}</p></div>
                      </div>
                    </li>
                  ) : null)}
                </ol>
              </section>
            )}
            {result && result.trace.length > 0 && (
              <section className={styles.tracePanel} aria-label="Program execution trace">
                <div className={styles.traceHeading}><strong>What happened, step by step</strong><span>{result.trace.length} steps</span></div>
                <div className={styles.traceControls}>
                  <button type="button" onClick={() => setTraceIndex(-1)} disabled={traceIndex === -1}>Show final</button>
                  <button type="button" onClick={() => setTraceIndex((value) => Math.max(0, value - 1))} disabled={traceIndex <= 0}>Previous</button>
                  <span>{traceIndex === -1 ? "Final position" : `Step ${traceIndex + 1} of ${result.trace.length}`}</span>
                  <button type="button" onClick={() => setTraceIndex((value) => Math.min(result.trace.length - 1, value + 1))} disabled={traceIndex >= result.trace.length - 1}>Next step</button>
                </div>
                <ol className={styles.traceList}>
                  {result.trace.map((item) => (
                    <li key={item.step} className={`${item.blocked ? styles.traceBlocked : styles.traceStep} ${traceIndex === item.step - 1 ? styles.traceSelected : ""}`}>
                      <button type="button" className={styles.traceJump} onClick={() => setTraceIndex(item.step - 1)} aria-current={traceIndex === item.step - 1 ? "step" : undefined} aria-label={`Show robot after step ${item.step}: ${LABELS[item.command].title}`}>
                        <span className={styles.traceNumber}>{item.step}</span>
                        <div><strong>{LABELS[item.command].title}</strong><p>{item.description}</p></div>
                        <small>{item.sourceLine ? `Line ${item.sourceLine} · ` : ""}{item.repeatPath?.length ? `Repeat ${item.repeatPath.join(".")} · ` : ""}Col {item.position.x + 1}, row {item.position.y + 1}</small>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <div className={styles.previewColumn}>
            <section className={styles.previewPanel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>02 / TEST</span><h2>Robot playground</h2></div><span className={styles.liveTag}>LIVE PREVIEW</span></div>
              <p className={styles.helper}>Run the program to see where your instructions take the robot.</p>
              <div className={styles.grid} role="img" aria-label={`Five by five robot grid. Blue square is the start and gold star is the goal. ${result ? `After ${traceIndex === -1 ? "the full program" : `step ${traceIndex + 1}`}, RhinoBot is at column ${current.x + 1}, row ${current.y + 1}, facing ${["north", "east", "south", "west"][current.direction]}.` : "Run a program to see the robot move."}`}>
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
              <div className={styles.position} aria-live="polite" aria-atomic="true"><span>ROBOT POSITION</span><strong>Column {current.x + 1}, Row {current.y + 1}</strong><small>Facing {["North", "East", "South", "West"][current.direction]}</small>{result && <small>{traceIndex === -1 ? "Showing final program position." : `Showing position after step ${traceIndex + 1} of ${result.trace.length}.`}</small>}</div>
            </section>

            <section className={styles.codePanel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>03 / UNDERSTAND</span><h2>{editorMode === "text" ? "Text editor" : "Code view"}</h2></div><div className={styles.blockActions}><button className={styles.hintToggle} onClick={() => setShowHints((value) => !value)}>{showHints ? "Hide guide" : "Explain code"}</button>{editorMode === "text" && <button className={styles.hintToggle} onClick={loadConditionalExample}>Load if/else example</button>}<button className={styles.hintToggle} onClick={() => { if (editorMode === "blocks") switchToText(); else switchToBlocks(); }}>{editorMode === "text" ? "Use blocks" : "Edit text"}</button></div></div>
              <p className={styles.helper}>{editorMode === "text" ? "Use one robot instruction per line. For repetition, use repeat(3) { on its own line, then close the block with }. For branching, use if (robot.atGoal()) { ... } else { ... } or robot.facingNorth/East/South/West() conditions. Conditional programs use the safe, bounded robot language; arbitrary JavaScript is rejected." : "Your instruction blocks are translated into a readable code-like form. Select Edit text to try the text language."}</p>
              {editorMode === "text" ? <textarea className={styles.textEditor} aria-label="RhinoBot text code" spellCheck={false} value={textCode} onChange={(event) => { setTextCode(event.target.value); setParseError(null); setResult(null); setConditionalEvents([]); }} /> : <pre className={styles.code}><code>{code || "// Add blocks to build your program"}</code></pre>}
              {parseError && <div className={styles.feedback} role="alert"><strong>Code needs a fix</strong><p>{parseError}</p></div>}
              {showHints && <div className={styles.explanation}><strong>What is an algorithm?</strong><p>An algorithm is a set of steps that solves a problem. Computers follow instructions in order. Changing the order can change the result. A repeat block runs the instructions inside it a fixed number of times. An if/else block chooses which instructions to run based on RhinoBot’s current state.</p><strong>Try this</strong><p>Move a turn block earlier or later, then run the program again. In text mode, try a repeat block with count 2, put robot.moveForward() inside it, and close the block. Observe how repetition changes the path.</p></div>}
            </section>
          </div>
        </section>
        <footer className={styles.footer}><span>Rhinox Scientifica</span><span>Think • Move • Code!</span><span>Beginner workspace preview · No account required for this demo</span></footer>
      </div>
    </main>
  );
}
