"use client";

import { Component, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import { BODY_PARTS, LAYERS, PART_BY_ID, partsInLayer, type LayerId } from "@/lib/human-body/body-data";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";

import HumanBody2D from "./HumanBody2D";
import type { BodyViewApi } from "./view-types";
import styles from "./human-body.module.css";

// Human Body Explorer: "3d" runtime, component "human-body".
// Peel the body back layer by layer (skin, muscles, organs, skeleton), tap a
// part to learn what it does, then test yourself in the Find-it challenge.

// The 3D view is client-only (WebGL) and loaded on demand.
const HumanBody3D = dynamic(() => import("./HumanBody3D"), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading the 3D body…</div>,
});

class ViewBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? <div className={styles.loading}>The 3D view could not start on this device. Showing the flat view instead.</div> : this.props.children;
  }
}

let webglCache: boolean | null = null;
function webglAvailable() {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    webglCache = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}
const subscribeNothing = () => () => undefined;

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const readReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const QUIZ_LENGTH = 5;

interface Quiz {
  order: string[];
  index: number;
  misses: number;
  firstTry: number;
  message: { tone: "good" | "bad"; text: string } | null;
  done: boolean;
}

/** Five different parts (never the skin), in a random order. Called from a click only. */
function newQuiz(): Quiz {
  const pool = BODY_PARTS.filter((part) => part.layer !== "skin").map((part) => part.id);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { order: pool.slice(0, QUIZ_LENGTH), index: 0, misses: 0, firstTry: 0, message: null, done: false };
}

/** Hands a layer colour to the CSS (as --layer). */
const tint = (color?: string) => ({ "--layer": color }) as CSSProperties;

const layerLabel = (id: LayerId) => LAYERS.find((layer) => layer.id === id)?.label ?? id;

export default function HumanBodyExplorer({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const allDone = areRequiredTasksComplete(experience, runtimeState);

  const webgl = useSyncExternalStore(subscribeNothing, webglAvailable, () => true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);

  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [layer, setLayer] = useState<LayerId>("skin");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [spin, setSpin] = useState(true);
  const [visitedLayers, setVisitedLayers] = useState<Set<LayerId>>(new Set<LayerId>(["skin"]));
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [onScreen, setOnScreen] = useState(true);

  const viewportRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<BodyViewApi | null>(null);

  // Draw only while the viewport is on screen.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // People who prefer reduced motion start with the slow spin off.
  useEffect(() => {
    if (!reducedMotion) return;
    const timer = window.setTimeout(() => setSpin(false), 0);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  function completeOnce(taskId: string) {
    if (runtimeState.completedTasks.includes(taskId)) return;
    const task = tasks.find((item) => item.id === taskId);
    if (task) actions.completeTask(taskId, task.points ?? 0);
  }

  useEffect(() => {
    if (allDone && !runtimeState.completed) actions.completeExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, runtimeState.completed]);

  const countIn = (id: LayerId) => [...seen].filter((partId) => PART_BY_ID[partId]?.layer === id).length;
  const organsSeen = countIn("organs");
  const musclesSeen = countIn("muscle");
  const bonesSeen = countIn("skeleton");

  useEffect(() => {
    if (visitedLayers.size === LAYERS.length) completeOnce("peel-layers");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitedLayers]);
  useEffect(() => {
    if (organsSeen >= 6) completeOnce("meet-organs");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organsSeen]);
  useEffect(() => {
    if (musclesSeen >= 4 && bonesSeen >= 4) completeOnce("muscles-and-bones");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musclesSeen, bonesSeen]);
  useEffect(() => {
    if (quiz?.done) completeOnce("find-challenge");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.done]);

  function changeLayer(next: LayerId) {
    setLayer(next);
    setVisitedLayers((current) => (current.has(next) ? current : new Set(current).add(next)));
    // A part from a different layer can no longer be tapped, so let it go.
    setSelectedId((current) => (current && PART_BY_ID[current]?.layer !== next ? null : current));
  }

  function select(id: string | null) {
    setSelectedId(id);
    if (!id) return;
    setSeen((current) => (current.has(id) ? current : new Set(current).add(id)));

    // In the Find-it challenge a tap is an answer.
    if (quiz && !quiz.done) {
      const target = PART_BY_ID[quiz.order[quiz.index]];
      const picked = PART_BY_ID[id];
      if (id === target.id) {
        const firstTry = quiz.misses === 0 ? quiz.firstTry + 1 : quiz.firstTry;
        const nextIndex = quiz.index + 1;
        setQuiz({ ...quiz, index: nextIndex, misses: 0, firstTry, done: nextIndex >= QUIZ_LENGTH, message: { tone: "good", text: `Correct! That is the ${target.name.toLowerCase()}.` } });
      } else {
        setQuiz({ ...quiz, misses: quiz.misses + 1, message: { tone: "bad", text: `That is the ${picked.name.toLowerCase()}. Try again.` } });
      }
    }
  }

  function startQuiz() {
    setQuiz(newQuiz());
    setSelectedId(null);
    changeLayer("skin");
    apiRef.current?.resetView();
  }

  function handleReset() {
    actions.resetExperience();
    setSelectedId(null);
    setLayer("skin");
    setVisitedLayers(new Set<LayerId>(["skin"]));
    setSeen(new Set());
    setQuiz(null);
    setSpin(!reducedMotion);
    apiRef.current?.resetView();
  }

  const show3d = mode === "3d" && webgl;
  const selected = selectedId ? PART_BY_ID[selectedId] : null;
  const quizTarget = quiz && !quiz.done ? PART_BY_ID[quiz.order[quiz.index]] : null;
  const layerIndex = LAYERS.findIndex((item) => item.id === layer);
  const activeLayer = LAYERS[layerIndex];

  const progress: Record<string, string> = {
    "peel-layers": `${visitedLayers.size}/${LAYERS.length}`,
    "meet-organs": `${Math.min(organsSeen, 6)}/6`,
    "muscles-and-bones": `${Math.min(musclesSeen, 4)}+${Math.min(bonesSeen, 4)}/8`,
    "find-challenge": quiz && !quiz.done ? `${quiz.index}/${QUIZ_LENGTH}` : "",
  };

  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        <header className={styles.toolbar}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.6" /><path d="M12 8v6M7 10.5l5 1.5 5-1.5M12 14l-3.5 7M12 14l3.5 7" /></svg>
            </span>
            <div>
              <p className={styles.eyebrow}>Rhinox</p>
              <h2 className={styles.title}>Human Body Explorer</h2>
            </div>
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.segment} role="group" aria-label="View mode">
              <button type="button" className={mode === "3d" ? styles.segmentOn : ""} aria-pressed={mode === "3d"} onClick={() => setMode("3d")} disabled={!webgl} title={webgl ? undefined : "3D needs WebGL, which this device does not support"}>
                3D
              </button>
              <button type="button" className={mode === "2d" ? styles.segmentOn : ""} aria-pressed={mode === "2d"} onClick={() => setMode("2d")}>
                Flat
              </button>
            </div>
            {show3d && (
              <>
                <button type="button" className={`${styles.pill} ${spin ? styles.pillOn : ""}`} aria-pressed={spin} onClick={() => setSpin(!spin)}>
                  Spin
                </button>
                <button type="button" className={styles.pill} onClick={() => apiRef.current?.resetView()}>
                  Reset view
                </button>
              </>
            )}
            <button type="button" className={`${styles.pill} ${quiz ? styles.pillOn : ""}`} aria-pressed={Boolean(quiz)} onClick={() => (quiz ? setQuiz(null) : startQuiz())}>
              Find-it challenge
            </button>
            <ActivityHeaderButtons onReset={handleReset} buttonClassName={styles.headerButton} />
          </div>
        </header>

        {!webgl && <p className={styles.notice}>3D is not available on this device (WebGL is off or unsupported), so the flat view is shown.</p>}

        {runtimeState.completed && (
          <div className={styles.complete} role="status">
            <div>
              <h3>Body expert!</h3>
              <p>You have peeled back every layer, met the organs, muscles and bones, and won the Find-it challenge. Keep exploring any time.</p>
            </div>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.headerButton} />
          </div>
        )}

        <div className={styles.workspace}>
          <div className={styles.center}>
            <div ref={viewportRef} className={styles.viewport}>
              {show3d ? (
                <ViewBoundary onFail={() => setMode("2d")}>
                  <div className={styles.stage}>
                    <HumanBody3D
                      layer={layer}
                      selectedId={selectedId}
                      onSelect={select}
                      spin={spin}
                      onUserMove={() => setSpin(false)}
                      reducedMotion={reducedMotion}
                      active={onScreen}
                      apiRef={apiRef}
                      hideLabels={Boolean(quizTarget)}
                    />
                  </div>
                  <div className={styles.vignette} aria-hidden="true" />
                </ViewBoundary>
              ) : (
                <div className={styles.flat}>
                  <HumanBody2D layer={layer} selectedId={selectedId} onSelect={select} />
                </div>
              )}

              {/* The peel rail: choose how deep to look */}
              <div className={styles.rail} role="group" aria-label="Body layers">
                <span className={styles.railTitle}>Peel back</span>
                {LAYERS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.railButton} ${layer === item.id ? styles.railOn : ""}`}
                    style={tint(item.color)}
                    aria-pressed={layer === item.id}
                    onClick={() => changeLayer(item.id)}
                  >
                    <span className={styles.railDot} aria-hidden="true">{visitedLayers.has(item.id) && layer !== item.id ? "✓" : index + 1}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              {quizTarget && quiz && (
                <div className={styles.ask} role="status">
                  <span className={styles.askStep}>{quiz.index + 1}/{QUIZ_LENGTH}</span>
                  <strong>Find the {quizTarget.name.toLowerCase()}</strong>
                  {quiz.misses >= 2 && <span className={styles.askHint}>Hint: peel to {layerLabel(quizTarget.layer)}</span>}
                </div>
              )}
              <p className={styles.hint}>{show3d ? "Drag to turn · scroll or pinch to zoom · tap a part" : "Tap a part"}</p>
            </div>

            {quiz ? (
              <div className={styles.listBox}>
                <p className={styles.listTitle}>Find-it challenge</p>
                <p className={styles.listNote}>Peel to the right layer, then tap the part on the body. The list of parts is hidden so you have to know it.</p>
              </div>
            ) : (
              <div className={styles.listBox}>
                <p className={styles.listTitle}>{activeLayer.label}: {partsInLayer(layer).length} part{partsInLayer(layer).length === 1 ? "" : "s"}</p>
                <ul className={styles.chips}>
                  {partsInLayer(layer).map((part) => (
                    <li key={part.id}>
                      <button type="button" className={`${styles.chip} ${selectedId === part.id ? styles.chipOn : ""}`} aria-pressed={selectedId === part.id} onClick={() => select(part.id)}>
                        {seen.has(part.id) && <span className={styles.seen} aria-hidden="true">✓</span>}
                        {part.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className={styles.side}>
            {quiz ? (
              <div className={styles.card} style={tint(activeLayer.color)}>
                {quiz.done ? (
                  <>
                    <p className={styles.cardTag}>Challenge complete</p>
                    <h3 className={styles.cardName}>{quiz.firstTry}/{QUIZ_LENGTH} on the first try</h3>
                    <p className={styles.cardText}>You found all five parts. Play again for a different set.</p>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.primary} onClick={startQuiz}>Play again</button>
                      <button type="button" className={styles.ghost} onClick={() => setQuiz(null)}>Back to exploring</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.cardTag}>Find-it challenge · {quiz.index + 1} of {QUIZ_LENGTH}</p>
                    <h3 className={styles.cardName}>Find the {quizTarget?.name.toLowerCase()}</h3>
                    <p className={styles.cardText}>{quizTarget?.does.split(". ")[0].replace(/\.$/, "")}.</p>
                    {quiz.message && <p className={`${styles.feedback} ${quiz.message.tone === "good" ? styles.good : styles.bad}`} role="status">{quiz.message.text}</p>}
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.ghost} onClick={() => setQuiz(null)}>Stop</button>
                    </div>
                  </>
                )}
              </div>
            ) : selected ? (
              <div className={styles.card} style={tint(LAYERS.find((item) => item.id === selected.layer)?.color)}>
                <p className={styles.cardTag}>{layerLabel(selected.layer)} · {selected.system}</p>
                <h3 className={styles.cardName}>{selected.name}</h3>
                <h4 className={styles.cardLabel}>What it does</h4>
                <p className={styles.cardText}>{selected.does}</p>
                <h4 className={styles.cardLabel}>Did you know?</h4>
                <p className={styles.cardText}>{selected.fact}</p>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.ghost} onClick={() => setSelectedId(null)}>Clear</button>
                </div>
              </div>
            ) : (
              <div className={styles.card} style={tint(activeLayer.color)}>
                <p className={styles.cardTag}>{activeLayer.label} layer</p>
                <h3 className={styles.cardName}>Tap a part to learn about it</h3>
                <p className={styles.cardText}>{activeLayer.blurb}</p>
                <p className={styles.cardText}>Use <b>Peel back</b> to go deeper: skin, muscles, organs, then bones.</p>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.primary} onClick={startQuiz}>Start Find-it challenge</button>
                </div>
              </div>
            )}

            <div className={styles.missions}>
              <p className={styles.listTitle}>Missions</p>
              <ul>
                {tasks.map((task) => {
                  const done = runtimeState.completedTasks.includes(task.id);
                  return (
                    <li key={task.id} className={done ? styles.missionDone : ""}>
                      <span className={styles.tick} aria-hidden="true">{done ? "✓" : ""}</span>
                      <span className={styles.missionText}>{task.title}</span>
                      {!done && progress[task.id] && <span className={styles.missionCount}>{progress[task.id]}</span>}
                      <span className={styles.srOnly}>{done ? " (done)" : ""}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
