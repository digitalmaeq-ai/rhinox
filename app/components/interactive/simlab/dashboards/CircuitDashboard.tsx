"use client";

import { useMemo, useState } from "react";

import LabTabs from "../shell/LabTabs";
import TasksQuiz from "../shell/TasksQuiz";
import { circuitBank } from "../specs/circuit-cbt";
import {
  MAX_RHEO,
  brightnessWord,
  meters,
  noise,
  rowOhms,
  showsCurve,
  solveCircuit,
  type CircuitRow,
  type CircuitState,
} from "../specs/circuit-model";
import { CALC_KINDS, experimentProblem, generateCalc } from "../specs/circuit-practice";
import type { DashboardProps } from "../types";
import CalcPractice from "./CalcPractice";
import CbtPanel from "./CbtPanel";
import CircuitApparatus from "./CircuitApparatus";
import styles from "./CircuitDashboard.module.css";

type TabId = "guide" | "record" | "calc" | "quiz" | "cbt" | "notes";
const MAX_ROWS = 12;

export default function CircuitDashboard({
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
  const cs: CircuitState & { rheo: number } = {
    closed: Boolean(state.closed),
    cells: Number(state.cells),
    bulbs: Number(state.bulbs),
    layout: String(state.layout),
    rheo: Number(state.rheo),
  };
  const r = solveCircuit(cs);
  const m = meters(cs);
  const ohms = m.amps > 0 ? m.volts / m.amps : 0;

  const [tab, setTab] = useState<TabId>("guide");
  const [rows, setRows] = useState<CircuitRow[]>([]);
  const [notes, setNotes] = useState("");

  const canRecord = r.flowing && rows.length < MAX_ROWS;
  function record() {
    if (!canRecord) return;
    const id = rows.length + 1;
    const row: CircuitRow = {
      id,
      cells: cs.cells,
      bulbs: cs.bulbs,
      layout: cs.layout,
      rheo: cs.rheo,
      volts: m.volts * noise(id, 1),
      amps: m.amps * noise(id, 2),
    };
    const next = [...rows, row];
    setRows(next);
    setMany({ recs: next.length, curved: showsCurve(next) });
  }
  function clearRows() {
    setRows([]);
    setMany({ recs: 0, curved: false });
  }
  function reset() {
    setRows([]);
    setNotes("");
    onReset();
  }

  const single = rows.filter((x) => x.bulbs === 1);
  const curved = showsCurve(rows);
  const graph = useMemo(() => {
    const W = 330;
    const H = 230;
    const L = 46;
    const B = 36;
    const maxI = Math.max(0.5, ...single.map((x) => x.amps)) * 1.15;
    const maxV = Math.max(2, ...single.map((x) => x.volts)) * 1.15;
    const gx = (i: number) => L + (i / maxI) * (W - L - 10);
    const gy = (v: number) => H - B - (v / maxV) * (H - B - 12);
    const low = [...single].sort((a, b) => a.amps - b.amps)[0];
    const slope = low ? low.volts / low.amps : 0;
    return { W, H, L, B, maxI, maxV, gx, gy, slope };
  }, [single]);

  const doneCount = completedTasks.filter((id) => tasks.some((t) => t.id === id)).length;
  const calcMine = experimentProblem(rows[rows.length - 1]);

  const tabs = [
    {
      id: "guide",
      label: "Circuit guide",
      content: (
        <div className={styles.guide}>
          <div className={styles.guideCard}>
            <h4>Series</h4>
            <p className={styles.small}>One path. The same current flows through every bulb. The battery voltage is shared between the bulbs, so each is dimmer. Total resistance: R = R₁ + R₂ + R₃.</p>
            <p className={styles.formula}>I = same everywhere · V = V₁ + V₂ + …</p>
          </div>
          <div className={styles.guideCard}>
            <h4>Parallel</h4>
            <p className={styles.small}>Each bulb has its own branch across the battery, so each gets the full voltage and stays bright. The branch currents add up. Total resistance is less than any single branch.</p>
            <p className={styles.formula}>V = same across each branch · I = I₁ + I₂ + …</p>
          </div>
          <div className={styles.guideCard}>
            <h4>Ohm&apos;s law and power</h4>
            <p className={styles.small}>For a resistor at constant temperature, V = I × R. The power used is P = V × I.</p>
            <p className={styles.formula}>V = IR · R = V ÷ I · P = VI</p>
          </div>
          <div className={styles.guideCard}>
            <h4>A real battery and a real lamp</h4>
            <p className={styles.small}>Each cell has a little internal resistance, so the terminal voltage falls as the current rises (&quot;lost volts&quot;). A filament lamp gets hotter as the current rises, so its resistance increases and its V–I graph curves.</p>
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
              <h3 className={styles.h3}>Meter readings</h3>
              <span className={styles.small}>{rows.length} of {MAX_ROWS} readings</span>
            </div>
            <p className={styles.small}>
              Close the switch, then press <strong>Record reading</strong>. The meters carry a small error of about 1 %, like real ones. For the lamp&apos;s V–I curve use one bulb in series and change the rheostat and the number of cells to get at least six different currents.
            </p>
            <div className={styles.buttons}>
              <button type="button" className={styles.primary} onClick={record} disabled={!canRecord}>Record reading</button>
              <button type="button" className={styles.ghost} onClick={clearRows} disabled={rows.length === 0}>Clear table</button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>Ammeter and voltmeter readings</caption>
                <thead>
                  <tr><th scope="col">#</th><th scope="col">Set-up</th><th scope="col">I (A)</th><th scope="col">V (V)</th><th scope="col">R = V ÷ I (Ω)</th><th scope="col">P (W)</th></tr>
                </thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={6} className={styles.empty}>No readings yet.</td></tr>}
                  {rows.map((x) => (
                    <tr key={x.id}>
                      <td>{x.id}</td>
                      <td style={{ whiteSpace: "normal", minWidth: 130 }}>{x.cells} cell{x.cells > 1 ? "s" : ""}, {x.bulbs} bulb{x.bulbs > 1 ? "s" : ""} {x.layout === "series" ? "series" : "parallel"}, {x.rheo.toFixed(1)} Ω</td>
                      <td>{x.amps.toFixed(3)}</td>
                      <td>{x.volts.toFixed(2)}</td>
                      <td><strong>{rowOhms(x).toFixed(2)}</strong></td>
                      <td>{(x.volts * x.amps).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`${styles.status} ${curved ? styles.statusGood : ""}`} role="status" aria-live="polite">
              {rows.length === 0 && "Start with one bulb in series and take a reading."}
              {rows.length > 0 && !curved && single.length < 5 && `${single.length} single-bulb reading${single.length === 1 ? "" : "s"}. Take at least five at clearly different currents.`}
              {rows.length > 0 && !curved && single.length >= 5 && "Spread your readings over a wider range of current: use the rheostat and the cells."}
              {curved && "The resistance of the lamp rises as the current rises: the filament gets hotter. That is why the graph curves and a lamp does not obey Ohm's law."}
            </p>
          </div>
          <div>
            <h3 className={styles.h3}>Lamp: voltage against current</h3>
            <svg viewBox={`0 0 ${graph.W} ${graph.H}`} className={styles.graph} role="img" aria-label="Graph of voltage against current for a single bulb. A straight dashed line shows what a fixed resistor would do.">
              <line x1={graph.L} y1={graph.H - graph.B} x2={graph.W - 6} y2={graph.H - graph.B} stroke="#64748b" strokeWidth="2" />
              <line x1={graph.L} y1="8" x2={graph.L} y2={graph.H - graph.B} stroke="#64748b" strokeWidth="2" />
              {graph.slope > 0 && <line x1={graph.gx(0)} y1={graph.gy(0)} x2={graph.gx(Math.min(graph.maxI, graph.maxV / graph.slope))} y2={graph.gy(Math.min(graph.maxV, graph.maxI * graph.slope))} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth="2" />}
              {single.map((x) => <circle key={x.id} cx={graph.gx(x.amps)} cy={graph.gy(x.volts)} r="5" fill="#2563eb" stroke="#fff" strokeWidth="2" />)}
              <text x={(graph.W + graph.L) / 2} y={graph.H - 6} textAnchor="middle" fontSize="12" fill="#475569">Current I (A)</text>
              <text x="12" y={(graph.H - graph.B) / 2} textAnchor="middle" fontSize="12" fill="#475569" transform={`rotate(-90 12 ${(graph.H - graph.B) / 2})`}>Voltage V (V)</text>
              <text x={graph.L} y={graph.H - graph.B + 14} textAnchor="middle" fontSize="11" fill="#475569">0</text>
              <text x={graph.W - 10} y={graph.H - graph.B + 14} textAnchor="end" fontSize="11" fill="#475569">{graph.maxI.toFixed(1)}</text>
            </svg>
            <ul className={styles.legend} aria-hidden="true">
              <li><i style={{ background: "#2563eb" }} /> Your readings (one bulb)</li>
              <li><i style={{ background: "#94a3b8" }} /> Fixed resistor with the lamp&apos;s lowest-current resistance</li>
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
    { id: "cbt", label: "CBT practice", content: <CbtPanel bank={circuitBank} bare /> },
    {
      id: "notes",
      label: "Notes",
      content: (
        <div className={styles.notesGrid}>
          <div>
            <h3 className={styles.h3}>Method</h3>
            <ol className={styles.steps}>
              <li>Build the circuit with the switch open.</li>
              <li>Put the ammeter in series and the voltmeter across the bulb.</li>
              <li>Close the switch and read both meters.</li>
              <li>Change the rheostat and record again, then compute R = V ÷ I.</li>
              <li>Plot V against I and describe the shape.</li>
            </ol>
            <h3 className={styles.h3}>Safety</h3>
            <ul className={styles.steps}>
              <li>Open the switch when changing connections.</li>
              <li>Do not exceed a bulb&apos;s rated voltage.</li>
            </ul>
          </div>
          <div>
            <h3 className={styles.h3}>Key ideas</h3>
            <dl className={styles.concepts}>
              <div><dt>Current</dt><dd>The rate of flow of charge, in amperes.</dd></div>
              <div><dt>Voltage</dt><dd>The energy given to each unit of charge, in volts.</dd></div>
              <div><dt>Resistance</dt><dd>How much a component opposes the current, in ohms.</dd></div>
            </dl>
          </div>
          <div>
            <h3 className={styles.h3}>Observation notes</h3>
            <label className={styles.field}>
              <span>What happened to the bulb and the readings?</span>
              <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Brightness, current, voltage, shape of the graph…" />
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
          <h3 className={styles.h3}>Set-up</h3>
          <button type="button" className={cs.closed ? styles.ghost : styles.primary} style={{ width: "100%", marginBottom: 10 }} onClick={() => onChange("closed", !cs.closed)} aria-pressed={cs.closed}>
            {cs.closed ? "Switch closed: open it" : "Switch open: close it"}
          </button>
          <label className={styles.slider} htmlFor="ec-cells"><span>Cells</span><output>{cs.cells} ({(cs.cells * 1.5).toFixed(1)} V)</output></label>
          <input id="ec-cells" type="range" min={1} max={4} step={1} value={cs.cells} onChange={(e) => onChange("cells", Number(e.target.value))} />
          <label className={styles.slider} htmlFor="ec-bulbs"><span>Bulbs</span><output>{cs.bulbs}</output></label>
          <input id="ec-bulbs" type="range" min={1} max={3} step={1} value={cs.bulbs} onChange={(e) => onChange("bulbs", Number(e.target.value))} />
          <label className={styles.field} style={{ marginTop: 10 }}>
            <span>Bulbs are connected</span>
            <select value={cs.layout} onChange={(e) => onChange("layout", e.target.value)}>
              <option value="series">In series</option>
              <option value="parallel">In parallel</option>
            </select>
          </label>
          <label className={styles.slider} htmlFor="ec-rheo"><span>Rheostat</span><output>{cs.rheo.toFixed(1)} Ω</output></label>
          <input id="ec-rheo" type="range" min={0} max={MAX_RHEO} step={0.5} value={cs.rheo} onChange={(e) => onChange("rheo", Number(e.target.value))} aria-valuetext={`${cs.rheo} ohms`} />
          <p className={styles.small}>Each cell has an internal resistance of 0.3 Ω.</p>
          {r.blown && <p className={styles.warn} role="status">The bulbs have blown: the voltage across each is too high.</p>}
        </section>

        <section className={`${styles.card} ${styles.stage}`} aria-label="Apparatus">
          <div className={styles.viewBar}>
            <p className={styles.caption}>{cs.bulbs} bulb{cs.bulbs > 1 ? "s" : ""} in {cs.layout}</p>
            <div className={styles.viewToggle} role="group" aria-label="Choose a view">
              <button type="button" aria-pressed={view === "2d"} className={view === "2d" ? styles.segOn : ""} onClick={() => setView("2d")}>2D</button>
              <button type="button" aria-pressed={view === "3d"} className={view === "3d" ? styles.segOn : ""} onClick={() => setView("3d")}>3D</button>
            </div>
          </div>
          <div className={view === "3d" ? styles.stage3d : styles.stage2d}>
            {view === "3d" ? render3D({ ...state, compact: true }) : <CircuitApparatus state={cs} />}
          </div>
          {view === "3d" && <p className={styles.small}>Drag to rotate · scroll or pinch to zoom</p>}
        </section>

        <section className={styles.card} aria-label="Meters">
          <h3 className={styles.h3}>Meters</h3>
          <div className={styles.stats}>
            <div className={styles.stat}><span>Ammeter</span><strong className={styles.bigBlue}>{m.amps.toFixed(2)} A</strong></div>
            <div className={styles.stat}><span>Voltmeter</span><strong>{m.volts.toFixed(2)} V</strong></div>
            <div className={styles.stat}><span>R = V ÷ I</span><strong>{ohms > 0 ? `${ohms.toFixed(2)} Ω` : "—"}</strong></div>
            <div className={styles.stat}><span>Brightness</span><strong>{brightnessWord(r.brightness, r.blown, cs.closed)}</strong></div>
          </div>
          <p className={styles.small}>
            {!cs.closed ? "The circuit is open, so both meters read zero." : r.blown ? "The bulb has blown, so no current flows." : `Power in each bulb: ${r.power.toFixed(2)} W. The battery terminal reads ${r.terminal.toFixed(2)} V because of its internal resistance.`}
          </p>
          <div className={styles.buttons} style={{ marginTop: 12 }}>
            <button type="button" className={styles.primary} onClick={() => { setTab("record"); record(); }} disabled={!canRecord}>Record reading</button>
            <button type="button" className={styles.ghost} onClick={reset}>Reset</button>
          </div>
        </section>
      </div>

      <LabTabs
        prefix="ec"
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        bare={["calc"]}
        tabs={tabs.map((t) =>
          t.id === "calc"
            ? {
                ...t,
                content: (
                  <CalcPractice
                    tabId="ec-tab-calc"
                    panelId="ec-panel-calc"
                    hidden={tab !== "calc"}
                    kinds={CALC_KINDS}
                    generate={generateCalc}
                    mine={calcMine}
                    mineLocked="Record a reading to unlock this."
                    footnote="Formulas: V = IR · P = VI · series R = R₁ + R₂ · parallel 1/R = 1/R₁ + 1/R₂ · e.m.f. E = V + Ir"
                  />
                ),
              }
            : t,
        )}
      />
    </div>
  );
}
