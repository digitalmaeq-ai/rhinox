"use client";

import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";

import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import { DEFAULT_SPEED, planets } from "@/lib/solar-system/planet-data";
import { advanceClock, formatElapsed } from "@/lib/solar-system/orbital-engine";
import type { BodyId, CameraPreset, ScaleMode, SimClock, SimSettings, ViewMode } from "@/lib/solar-system/solar-system-types";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";

import PlanetInfoPanel from "./PlanetInfoPanel";
import PlanetSelector from "./PlanetSelector";
import SimulationControls from "./SimulationControls";
import SolarSystem2D from "./SolarSystem2D";
import type { ViewApi } from "./view-types";
import styles from "./solar-system.module.css";

// The 3D view is client-only (WebGL) and loaded on demand.
const SolarSystem3D = dynamic(() => import("./SolarSystem3D"), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading the 3D Solar System…</div>,
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
    return this.state.failed ? <div className={styles.loading}>The 3D view could not start on this device. Showing the 2D view instead.</div> : this.props.children;
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

const EARTH_YEAR_DAYS = 365.25;

const cameraOptions: { id: CameraPreset; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "A raised view of the whole Solar System" },
  { id: "follow", label: "Follow", hint: "Follow the selected planet round its orbit" },
  { id: "closeup", label: "Close-up", hint: "Move in close to study the selected planet" },
  { id: "top", label: "Top", hint: "Straight-down map view, good for comparing orbits" },
];

// Solar System Explorer: "3d" runtime, component "solar-system".
// One shared state (selection, speed, scale, toggles, clock) drives both the
// 2D and 3D views, so switching modes keeps everything the learner set up.
export default function SolarSystemExperiment({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];
  const allDone = areRequiredTasksComplete(experience, runtimeState);

  const [mode, setMode] = useState<ViewMode>("2d");
  const webgl = useSyncExternalStore(subscribeNothing, webglAvailable, () => true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const [selectedId, setSelectedId] = useState<BodyId | null>(null);
  // 3D camera framing, shared with SolarSystem3D (the 2D view ignores it).
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("overview");
  const [visited, setVisited] = useState<Set<BodyId>>(new Set());
  const [infoOpen, setInfoOpen] = useState(true);
  const [elapsed, setElapsed] = useState("0 days");
  const [fullscreen, setFullscreen] = useState(false);
  const [settings, setSettings] = useState<SimSettings>({
    playing: true,
    daysPerSecond: DEFAULT_SPEED.daysPerSecond,
    scale: "teaching",
    showLabels: true,
    showOrbits: true,
    showTrails: false,
  });

  const clockRef = useRef<SimClock>({ days: 0, spin: 0 });
  const apiRef = useRef<ViewApi | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const live = useRef({ settings });
  useEffect(() => {
    live.current = { settings };
  }, [settings]);

  // People who prefer reduced motion start paused (they can press Play).
  useEffect(() => {
    if (!reducedMotion) return;
    const timer = window.setTimeout(() => setSettings((current) => ({ ...current, playing: false })), 0);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    const handler = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // One clock for both views.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const { playing, daysPerSecond } = live.current.settings;
      if (playing) advanceClock(clockRef.current, dt, daysPerSecond);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Throttled readout + the "watch a whole Earth year" task.
  useEffect(() => {
    const id = window.setInterval(() => {
      const days = clockRef.current.days;
      setElapsed(formatElapsed(days));
      if (days >= EARTH_YEAR_DAYS) completeOnce("one-earth-year");
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeState.completedTasks]);

  function completeOnce(taskId: string) {
    if (runtimeState.completedTasks.includes(taskId)) return;
    const task = tasks.find((item) => item.id === taskId);
    if (task) actions.completeTask(taskId, task.points ?? 0);
  }

  useEffect(() => {
    if (allDone && !runtimeState.completed) actions.completeExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, runtimeState.completed]);

  const select = useCallback(
    (id: BodyId | null) => {
      setSelectedId(id);
      // Nothing selected: back to the overview (top view is kept, it needs no
      // planet). A planet selected from the overview starts in Follow; if the
      // learner already chose Follow, Close-up or Top, that choice stays.
      setCameraPreset((current) => (id === null ? (current === "top" ? "top" : "overview") : current === "overview" ? "follow" : current));
      if (id && id !== "sun") {
        setVisited((current) => {
          if (current.has(id)) return current;
          const next = new Set(current);
          next.add(id);
          return next;
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (planets.every((planet) => visited.has(planet.id))) completeOnce("meet-the-planets");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited]);

  useEffect(() => {
    if (mode === "3d") completeOnce("try-3d");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const patch = (change: Partial<SimSettings>) => setSettings((current) => ({ ...current, ...change }));

  function resetSimulation() {
    clockRef.current.days = 0;
    clockRef.current.spin = 0;
    setElapsed("0 days");
    patch({ daysPerSecond: DEFAULT_SPEED.daysPerSecond, playing: !reducedMotion });
    apiRef.current?.resetView();
  }

  function handleReset() {
    actions.resetExperience();
    setSelectedId(null);
    setVisited(new Set());
    resetSimulation();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void rootRef.current?.requestFullscreen?.();
    }
  }

  const viewProps = { clockRef, settings, selectedId, onSelect: select, apiRef, reducedMotion, cameraPreset };
  const scaleLabel: Record<ScaleMode, string> = { teaching: "Teaching scale", true: "Distances to scale" };
  const show3d = mode === "3d" && webgl;

  return (
    <div className={styles.root}>
      <div ref={rootRef} className={`${styles.shell} ${fullscreen ? styles.fullscreen : ""}`}>
        <header className={styles.toolbar}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" fill="currentColor" /><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-25 12 12)" /></svg>
            </span>
            <div>
              <p className={styles.eyebrow}>Rhinox</p>
              <h2 className={styles.title}>Solar System Explorer</h2>
            </div>
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.segment} role="group" aria-label="View mode">
              <button type="button" className={mode === "2d" ? styles.segmentOn : ""} aria-pressed={mode === "2d"} onClick={() => setMode("2d")}>
                2D
              </button>
              <button
                type="button"
                className={mode === "3d" ? styles.segmentOn : ""}
                aria-pressed={mode === "3d"}
                onClick={() => setMode("3d")}
                disabled={!webgl}
                title={webgl ? undefined : "3D needs WebGL, which this device does not support"}
              >
                3D
              </button>
            </div>
            {show3d && (
              <div className={styles.segment} role="group" aria-label="Camera view">
                {cameraOptions.map((option) => {
                  const needsPlanet = option.id === "follow" || option.id === "closeup";
                  const disabled = needsPlanet && selectedId === null;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={cameraPreset === option.id ? styles.segmentOn : ""}
                      aria-pressed={cameraPreset === option.id}
                      disabled={disabled}
                      title={disabled ? "Select a planet first" : option.hint}
                      onClick={() => setCameraPreset(option.id)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className={styles.segment} role="group" aria-label="Scale">
              {(["teaching", "true"] as ScaleMode[]).map((value) => (
                <button key={value} type="button" className={settings.scale === value ? styles.segmentOn : ""} aria-pressed={settings.scale === value} onClick={() => patch({ scale: value })}>
                  {scaleLabel[value]}
                </button>
              ))}
            </div>
            <button type="button" className={styles.iconText} onClick={toggleFullscreen} aria-pressed={fullscreen}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
              {fullscreen ? "Exit" : "Fullscreen"}
            </button>
            <ActivityHeaderButtons onReset={handleReset} buttonClassName={styles.headerButton} />
          </div>
        </header>

        {!webgl && <p className={styles.notice}>3D is not available on this device (WebGL is off or unsupported), so the 2D view is shown.</p>}

        {runtimeState.completed && (
          <div className={styles.complete} role="status">
            <div>
              <h3>Mission complete!</h3>
              <p>You have met all eight planets, tried the 3D view and watched a full Earth year. Keep exploring any time.</p>
            </div>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.headerButton} />
          </div>
        )}

        <div className={styles.workspace}>
          <PlanetSelector selectedId={selectedId} visited={visited} onSelect={select} />

          <div className={styles.center}>
            <div className={styles.viewport}>
              {show3d ? (
                <ViewBoundary onFail={() => setMode("2d")}>
                  <SolarSystem3D {...viewProps} />
                  <div className={styles.vignette} aria-hidden="true" />
                  <div className={styles.introFade} aria-hidden="true" />
                </ViewBoundary>
              ) : (
                <SolarSystem2D {...viewProps} />
              )}
              <p className={styles.scaleNote}>
                {settings.scale === "teaching"
                  ? "Teaching scale: distances compressed and planets enlarged, not to scale."
                  : "Distances to scale (inner orbits nudged apart). Planets enlarged."}
              </p>
              <p className={styles.hint}>{show3d ? "Drag to rotate · scroll or pinch to zoom · tap a planet" : "Drag to move · scroll or pinch to zoom · tap a planet"}</p>
            </div>

            <SimulationControls settings={settings} elapsed={elapsed} onChange={patch} onReset={resetSimulation} onZoom={(factor) => apiRef.current?.zoomBy(factor)} />
          </div>

          <div className={styles.infoWrap}>
            <button type="button" className={styles.infoToggle} onClick={() => setInfoOpen(!infoOpen)} aria-expanded={infoOpen}>
              {infoOpen ? "Hide details" : "Show details"}
            </button>
            <div className={infoOpen ? "" : styles.infoHidden}>
              <PlanetInfoPanel selectedId={selectedId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
