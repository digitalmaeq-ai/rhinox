"use client";

import NumberSlider from "../shell/NumberSlider";
import { useEffect, useMemo, useRef, useState } from "react";

import LabTabs from "../shell/LabTabs";
import TasksQuiz from "../shell/TasksQuiz";
import { projBank } from "../specs/proj-cbt";
import {
  GRAVITY,
  HEIGHTS,
  TARGET,
  TOLERANCE,
  findsPeak,
  flight,
  hasComplementPair,
  measure,
  position,
  sameSetup,
  type ProjRow,
  type ProjState,
} from "../specs/proj-model";
import { CALC_KINDS, experimentProblem, generateCalc } from "../specs/proj-practice";
import type { DashboardProps } from "../types";
import CalcPractice from "./CalcPractice";
import CbtPanel from "./CbtPanel";
import ProjectileApparatus, { type Shot } from "./ProjectileApparatus";
import styles from "./ProjectileDashboard.module.css";

type TabId = "guide" | "record" | "calc" | "quiz" | "cbt" | "notes";
const MAX_ROWS = 16;
const FLIGHT_SECONDS = 2.6;
const MAX_TRAILS = 8;

export default function ProjectileDashboard({
  state,
  onChange,
  setMany,
  experience,
  tasks,
  completedTasks,
  points,
  requiredDone,
  questions,
  runtimeState,
  actions,
  view,
  setView,
  render3D,
  onReset,
  onWatchTour,
  checkKey,
}: DashboardProps) {
  const ps: Required<ProjState> = {
    angle: Number(state.angle),
    speed: Number(state.speed),
    gravity: String(state.gravity),
    height: Number(state.height),
  };
  const f = flight(ps);
  const hit = Math.abs(f.range - TARGET) <= TOLERANCE;

  const [tab, setTab] = useState<TabId>("guide");
  const [shots, setShots] = useState<Shot[]>([]);
  const [shotCount, setShotCount] = useState(0);
  const [last, setLast] = useState<Shot | null>(null);
  const [flying, setFlying] = useState(false);
  const [landed, setLanded] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [ballT, setBallT] = useState(0);
  const [rows, setRows] = useState<ProjRow[]>([]);
  const [practical, setPractical] = useState(false);
  const [components, setComponents] = useState(false);
  const [notes, setNotes] = useState("");

  // Let the ball fly for a steady couple of seconds, whatever the real flight time.
  const lastRef = useRef<Shot | null>(null);
  useEffect(() => {
    lastRef.current = last;
  });
  useEffect(() => {
    if (!flying) return;
    let frame = 0;
    let start = -1;
    const tick = (now: number) => {
      const shot = lastRef.current;
      if (!shot) return;
      if (start < 0) start = now;
      const total = flight(shot.state).time;
      const u = Math.min(1, (now - start) / 1000 / FLIGHT_SECONDS);
      setBallT(total * u);
      if (u >= 1) {
        setFlying(false);
        setLanded(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [flying]);

  function fire() {
    if (flying) return;
    const id = shotCount + 1;
    const shot: Shot = { id, state: { ...ps } };
    setShotCount(id);
    setShots((prev) => [...prev, shot].slice(-MAX_TRAILS));
    setLast(shot);
    setBallT(0);
    setLanded(false);
    setRecorded(false);
    setFlying(true);
    setMany({ fired: Number(state.fired) + 1, lastAngle: ps.angle, lastHeight: ps.height });
  }

  const reading = useMemo(() => (last ? measure(last.id, last.state) : null), [last]);
  const ball = last && (flying || landed) ? { ...position(last.state, ballT), t: ballT } : null;

  function record() {
    if (!last || !landed || recorded || !reading || rows.length >= MAX_ROWS) return;
    const next = [...rows, { ...reading, id: rows.length + 1 }];
    setRows(next);
    setRecorded(true);
    setMany({ recs: next.length, peak: findsPeak(next), pair: hasComplementPair(next) });
  }
  function clearRows() {
    setRows([]);
    setMany({ recs: 0, peak: false, pair: false });
  }
  function reset() {
    setFlying(false);
    setShots([]);
    setShotCount(0);
    setLast(null);
    setLanded(false);
    setRecorded(false);
    setBallT(0);
    setRows([]);
    setNotes("");
    onReset();
  }

  const group = sameSetup(rows);
  const peaked = findsPeak(rows);
  const graph = useMemo(() => {
    const W = 330;
    const H = 240;
    const L = 46;
    const B = 38;
    const setup = group[0];
    const theory = setup ? Array.from({ length: 31 }, (_, i) => ({ a: i * 3, r: flight({ angle: i * 3, speed: setup.speed, gravity: setup.gravity, height: setup.height }).range })) : [];
    const maxY = Math.max(10, ...theory.map((p) => p.r), ...group.map((r) => r.range)) * 1.1;
    const gx = (a: number) => L + (a / 90) * (W - L - 10);
    const gy = (r: number) => H - B - (r / maxY) * (H - B - 12);
    return { W, H, L, B, maxY, gx, gy, theory, setup };
  }, [group]);

  const doneCount = completedTasks.filter((id) => tasks.some((t) => t.id === id)).length;
  const calcMine = experimentProblem(rows[rows.length - 1]);
  const g = f.g;

  const tabs = [
    {
      id: "guide",
      label: "Projectile guide",
      content: (
        <div className={styles.guide}>
          <div className={styles.guideCard}>
            <h4>Two motions at once</h4>
            <p className={styles.small}>Sideways, nothing speeds the ball up or slows it down, so the horizontal speed stays constant. Downward, gravity changes the vertical speed by g every second. The two motions do not affect each other.</p>
            <p className={styles.formula}>uₓ = u cos θ · u_y = u sin θ</p>
          </div>
          <div className={styles.guideCard}>
            <h4>Level ground</h4>
            <p className={styles.small}>The ball rises for u sin θ ÷ g, then takes the same time to fall. The longest range at a given speed is at 45°, and angles that add up to 90° have equal range.</p>
            <p className={styles.formula}>T = 2u sin θ ÷ g · H = (u sin θ)² ÷ 2g · R = u² sin 2θ ÷ g</p>
          </div>
          <div className={styles.guideCard}>
            <h4>From a platform or cliff</h4>
            <p className={styles.small}>The ball starts higher, so it stays in the air longer. For a horizontal launch the fall time is the same as for a dropped ball.</p>
            <p className={styles.formula}>t = √(2h ÷ g) · distance = u × t</p>
          </div>
          <div className={styles.guideCard}>
            <h4>In the lab</h4>
            <p className={styles.small}>Your readings carry small errors: a tape for the range (about 1 %), a stopwatch for the time (about 3 %) and a scale for the height (about 2 %). The real world has air resistance too, which this model leaves out.</p>
          </div>
        </div>
      ),
    },
    {
      id: "record",
      label: "Record",
      badge: `${rows.length}`,
      content: (
        <div className={styles.recGrid}>
          <div>
            <div className={styles.rowHead}>
              <h3 className={styles.h3}>Measurements</h3>
              <span className={styles.small}>{rows.length} of {MAX_ROWS} shots</span>
            </div>
            <p className={styles.small}>
              Fire a shot, wait for it to land, then press <strong>Record shot</strong>. To find the best angle keep the speed and height the same and change only the angle: try 15°, 30°, 45°, 60° and 75°.
            </p>
            <div className={styles.buttons}>
              <button type="button" className={styles.primary} onClick={record} disabled={!landed || recorded || rows.length >= MAX_ROWS}>Record shot</button>
              <button type="button" className={styles.ghost} onClick={clearRows} disabled={rows.length === 0}>Clear table</button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>Measured range, time and height for each shot</caption>
                <thead>
                  <tr><th scope="col">#</th><th scope="col">Angle</th><th scope="col">u (m/s)</th><th scope="col">Set-up</th><th scope="col">Range (m)</th><th scope="col">Time (s)</th><th scope="col">Top (m)</th></tr>
                </thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={7} className={styles.empty}>No shots recorded yet.</td></tr>}
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.angle}°</td>
                      <td>{r.speed}</td>
                      <td style={{ whiteSpace: "normal" }}>{GRAVITY[r.gravity]?.name}{r.height ? `, ${r.height} m` : ""}</td>
                      <td><strong>{r.range.toFixed(1)}</strong></td>
                      <td>{r.time.toFixed(2)}</td>
                      <td>{r.top.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`${styles.status} ${peaked ? styles.statusGood : ""}`} role="status" aria-live="polite">
              {rows.length === 0 && "Start with 45° and a speed of 20 m/s from ground level."}
              {rows.length > 0 && !peaked && "Record at least five different angles at the same speed from ground level, some below 35° and some above 55°."}
              {peaked && "The longest range is near 45°, and shots at angles that add up to 90° (such as 30° and 60°) land about the same distance away."}
            </p>
          </div>
          <div>
            <h3 className={styles.h3}>Range against launch angle</h3>
            <svg viewBox={`0 0 ${graph.W} ${graph.H}`} className={styles.graph} role="img" aria-label="Graph of range against launch angle. The points rise to a maximum near 45 degrees and fall again.">
              <line x1={graph.L} y1={graph.H - graph.B} x2={graph.W - 6} y2={graph.H - graph.B} stroke="#64748b" strokeWidth="2" />
              <line x1={graph.L} y1="8" x2={graph.L} y2={graph.H - graph.B} stroke="#64748b" strokeWidth="2" />
              {!practical && graph.theory.length > 0 && (
                <path d={graph.theory.map((p, i) => `${i === 0 ? "M" : "L"}${graph.gx(p.a).toFixed(1)} ${graph.gy(p.r).toFixed(1)}`).join(" ")} fill="none" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth="2" />
              )}
              {group.map((r) => <circle key={r.id} cx={graph.gx(r.angle)} cy={graph.gy(r.range)} r="5" fill="#2563eb" stroke="#fff" strokeWidth="2" />)}
              <text x={(graph.W + graph.L) / 2} y={graph.H - 6} textAnchor="middle" fontSize="12" fill="#475569">Launch angle (degrees)</text>
              <text x="12" y={(graph.H - graph.B) / 2} textAnchor="middle" fontSize="12" fill="#475569" transform={`rotate(-90 12 ${(graph.H - graph.B) / 2})`}>Range (m)</text>
              {[0, 45, 90].map((a) => <text key={a} x={graph.gx(a)} y={graph.H - graph.B + 14} textAnchor="middle" fontSize="11" fill="#475569">{a}</text>)}
            </svg>
            <ul className={styles.legend} aria-hidden="true">
              <li><i style={{ background: "#2563eb" }} /> Your shots{graph.setup ? ` (${graph.setup.speed} m/s, ${GRAVITY[graph.setup.gravity]?.name}${graph.setup.height ? `, ${graph.setup.height} m` : ""})` : ""}</li>
              {!practical && <li><i style={{ background: "#94a3b8" }} /> Calculated curve</li>}
            </ul>
          </div>
        </div>
      ),
    },
    { id: "calc", label: "Calculations", content: null },
    {
      id: "quiz",
      label: "Tasks and quiz",
      badge: `${doneCount}/${tasks.length}`,
      content: (
        <TasksQuiz
          experience={experience}
          tasks={tasks}
          completedTasks={completedTasks}
          points={points}
          requiredDone={requiredDone}
          questions={questions}
          runtimeState={runtimeState}
          actions={actions}
          onWatchTour={onWatchTour}
          checkKey={checkKey}
        />
      ),
    },
    { id: "cbt", label: "CBT practice", content: <CbtPanel bank={projBank} bare /> },
    {
      id: "notes",
      label: "Notes",
      content: (
        <div className={styles.notesGrid}>
          <div>
            <h3 className={styles.h3}>Method</h3>
            <ol className={styles.steps}>
              <li>Set the speed, height and gravity and keep them fixed.</li>
              <li>Change only the angle and fire.</li>
              <li>Measure the range with the tape and the time with the stopwatch.</li>
              <li>Record each shot, then plot range against angle.</li>
              <li>Find the angle with the longest range.</li>
            </ol>
            <h3 className={styles.h3}>Safety</h3>
            <ul className={styles.steps}>
              <li>Keep everyone behind the launcher.</li>
              <li>Use soft balls and an open, clear field.</li>
            </ul>
          </div>
          <div>
            <h3 className={styles.h3}>Key ideas</h3>
            <dl className={styles.concepts}>
              <div><dt>Projectile</dt><dd>An object moving through the air under gravity alone.</dd></div>
              <div><dt>Range</dt><dd>The horizontal distance from launch to landing.</dd></div>
              <div><dt>Independence</dt><dd>The horizontal and vertical motions do not affect each other.</dd></div>
            </dl>
          </div>
          <div>
            <h3 className={styles.h3}>Observation notes</h3>
            <label className={styles.field}>
              <span>What did you notice about the angles?</span>
              <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Which angle went furthest? Which pairs matched?" />
            </label>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.dash}>
      <div className={styles.top}>
        <section className={styles.card} aria-label="Set-up">
          <h3 className={styles.h3}>Launcher</h3>
          <NumberSlider id="pj-angle" label="Launch angle" unit="°" min={0} max={85} step={1} value={ps.angle} onChange={(v) => onChange("angle", v)} />
          <NumberSlider id="pj-speed" label="Launch speed" unit="m/s" min={5} max={40} step={1} value={ps.speed} onChange={(v) => onChange("speed", v)} />
          <label className={styles.field} style={{ marginTop: 10 }}>
            <span>Where are you?</span>
            <select value={ps.gravity} onChange={(e) => onChange("gravity", e.target.value)}>
              {Object.entries(GRAVITY).map(([k, v]) => <option key={k} value={k}>{v.name} (g = {v.g})</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>Launch height</span>
            <select value={ps.height} onChange={(e) => onChange("height", Number(e.target.value))}>
              {HEIGHTS.map((h) => <option key={h} value={h}>{h === 0 ? "Ground level" : `${h} m platform`}</option>)}
            </select>
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={components} onChange={(e) => setComponents(e.target.checked)} />
            <span>Show the horizontal and vertical speeds</span>
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={practical} onChange={(e) => setPractical(e.target.checked)} />
            <span>Practical mode: hide the calculated values</span>
          </label>
        </section>

        <section className={`${styles.card} ${styles.stage}`} aria-label="Apparatus">
          <div className={styles.viewBar}>
            <p className={styles.caption}>{ps.angle}° at {ps.speed} m/s · {(GRAVITY[ps.gravity] ?? GRAVITY.earth).name}</p>
            <div className={styles.viewToggle} role="group" aria-label="Choose a view">
              <button type="button" aria-pressed={view === "2d"} className={view === "2d" ? styles.segOn : ""} onClick={() => setView("2d")}>2D</button>
              <button type="button" aria-pressed={view === "3d"} className={view === "3d" ? styles.segOn : ""} onClick={() => setView("3d")}>3D</button>
            </div>
          </div>
          <div className={view === "3d" ? styles.stage3d : styles.stage2d}>
            {view === "3d" ? render3D({ ...state, compact: true }) : <ProjectileApparatus state={ps} shots={shots} ball={ball} components={components} onAim={(angle, speed) => !flying && setMany({ angle, speed })} />}
          </div>
          {view === "3d" && <p className={styles.small}>Drag to rotate · scroll or pinch to zoom</p>}
        </section>

        <section className={styles.card} aria-label="Fire and measure">
          <h3 className={styles.h3}>Fire and measure</h3>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={fire} disabled={flying}>{flying ? "In flight…" : "Fire"}</button>
            <button type="button" className={styles.ghost} onClick={() => setShots([])} disabled={shots.length === 0 || flying}>Clear paths</button>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}><span>Range (measured)</span><strong className={styles.bigBlue}>{landed && reading ? `${reading.range.toFixed(1)} m` : "—"}</strong></div>
            <div className={styles.stat}><span>Time (stopwatch)</span><strong>{landed && reading ? `${reading.time.toFixed(2)} s` : "—"}</strong></div>
            <div className={styles.stat}><span>Top height</span><strong>{landed && reading ? `${reading.top.toFixed(1)} m` : "—"}</strong></div>
            <div className={styles.stat}><span>Target {TARGET} m</span><strong>{landed && reading ? (Math.abs(reading.range - TARGET) <= TOLERANCE ? "Hit!" : "Missed") : "—"}</strong></div>
          </div>
          {!practical ? (
            <p className={styles.small}>Calculated for these settings: range {f.range.toFixed(1)} m, top {f.height.toFixed(1)} m, time {f.time.toFixed(2)} s{hit ? " (on target)" : ""}. Horizontal speed {f.vx.toFixed(1)} m/s, vertical {f.vy.toFixed(1)} m/s, g = {g} m/s².</p>
          ) : (
            <p className={styles.small}>Calculated values are hidden. Fire, measure, then compare with your own working.</p>
          )}
          <div className={styles.buttons} style={{ marginTop: 12 }}>
            <button type="button" className={styles.primary} onClick={() => { setTab("record"); record(); }} disabled={!landed || recorded || rows.length >= MAX_ROWS}>{recorded ? "Recorded" : "Record shot"}</button>
            <button type="button" className={styles.ghost} onClick={reset}>Reset</button>
          </div>
        </section>
      </div>

      <LabTabs
        prefix="pj"
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        bare={["calc"]}
        tabs={tabs.map((t) =>
          t.id === "calc"
            ? {
                ...t,
                content: (
                  <CalcPractice
                    tabId="pj-tab-calc"
                    panelId="pj-panel-calc"
                    hidden={tab !== "calc"}
                    kinds={CALC_KINDS}
                    generate={generateCalc}
                    mine={calcMine}
                    mineLocked="Record a shot to unlock this."
                    footnote="Formulas: uₓ = u cos θ · u_y = u sin θ · T = 2u sin θ ÷ g · H = (u sin θ)² ÷ 2g · R = u² sin 2θ ÷ g · t = √(2h ÷ g)"
                  />
                ),
              }
            : t,
        )}
      />
    </div>
  );
}
