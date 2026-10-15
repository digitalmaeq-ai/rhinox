"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import LabTabs from "../shell/LabTabs";
import TasksQuiz from "../shell/TasksQuiz";
import { electrolysisBank } from "../specs/electrolysis-cbt";
import {
  CALC_KINDS,
  ELECTROLYTES,
  ELECTROLYTE_IDS,
  FARADAY,
  MAX_MINUTES,
  MIN_VOLTS,
  amountOf,
  electrolyteOf,
  experimentProblem,
  formatAmount,
  generateCalc,
  measured,
  outcome,
  unitOf,
  type CellState,
} from "../specs/electrolysis-chem";
import { fmt } from "../specs/titration-practice";
import type { DashboardProps } from "../types";
import CalcPractice from "./CalcPractice";
import CbtPanel from "./CbtPanel";
import ElectrolysisApparatus from "./ElectrolysisApparatus";
import styles from "./ElectrolysisDashboard.module.css";

type Row = { id: number; minutes: number; current: number; coulombs: number; cathode: number; cathodeCalc: number; anode: number; electrolyte: string; electrode: string };

const SERIES = ["K", "Na", "Ca", "Mg", "Al", "Zn", "Fe", "Pb", "H", "Cu", "Ag"];
type TabId = "cell" | "record" | "calc" | "quiz" | "cbt" | "notes";
const RATE = 4; // minutes of experiment per second while running

export default function ElectrolysisDashboard({
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
  const cell: CellState = {
    electrolyte: String(state.electrolyte),
    electrode: String(state.electrode),
    voltage: Number(state.voltage),
    current: Number(state.current),
    minutes: Number(state.minutes),
  };
  const o = outcome(cell);
  const current = cell.current;
  const eid = electrolyteOf(cell.electrolyte);
  const liquid = ELECTROLYTES[eid];

  const [tab, setTab] = useState<TabId>("cell");
  const [playing, setPlaying] = useState(false);
  const [blind, setBlind] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [notes, setNotes] = useState("");

  const minutesRef = useRef(cell.minutes);
  useEffect(() => {
    minutesRef.current = cell.minutes;
  });

  // Run: let the experiment time pass at a steady pace.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = -1;
    const tick = (now: number) => {
      if (last < 0) last = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const next = Math.min(MAX_MINUTES, Math.round((minutesRef.current + RATE * dt) * 10) / 10);
      minutesRef.current = next;
      onChange("minutes", next);
      if (next >= MAX_MINUTES) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, onChange]);

  // Changing the cell starts a fresh experiment.
  function change(patch: Record<string, string | number>) {
    setPlaying(false);
    setRows([]);
    setMany({ ...patch, minutes: 0, recs: 0 });
  }

  function reset() {
    setPlaying(false);
    setRows([]);
    setNotes("");
    setBlind(false);
    onReset();
  }

  function togglePlay() {
    if (!o.on) return;
    if (!playing && cell.minutes >= MAX_MINUTES) onChange("minutes", 0);
    setPlaying((v) => !v);
  }

  const canRecord = o.on && cell.minutes > 0 && rows.length < 8;
  function record() {
    if (!canRecord) return;
    const id = rows.length + 1;
    const minutes = Math.round(cell.minutes * 10) / 10;
    const coulombs = cell.current * minutes * 60;
    const cathodeCalc = amountOf(o.cathode, coulombs);
    const anodeCalc = amountOf(o.anode, coulombs);
    setRows((r) => [
      ...r,
      {
        id,
        minutes,
        current: cell.current,
        coulombs,
        cathode: measured(o.cathode, cathodeCalc, id),
        cathodeCalc,
        anode: measured(o.anode, anodeCalc, id + 40),
        electrolyte: cell.electrolyte,
        electrode: cell.electrode,
      },
    ]);
    setMany({ recs: rows.length + 1 });
  }

  const unit = unitOf(o.cathode);
  const anodeUnit = unitOf(o.anode);
  const sameRows = rows;
  const ratios = sameRows.filter((r) => r.coulombs > 0).map((r) => r.cathode / r.coulombs);
  const proportional = ratios.length >= 3 && Math.max(...ratios) / Math.min(...ratios) <= 1.1;
  const meanPerC = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;

  // Graph of what you measured at the cathode against charge.
  const graph = useMemo(() => {
    const W = 320;
    const H = 200;
    const L = 44;
    const B = 34;
    const maxQ = Math.max(1, ...sameRows.map((r) => r.coulombs), current * MAX_MINUTES * 60 * 0.25);
    const perC = amountOf(o.cathode, 1);
    const maxY = Math.max(perC * maxQ, ...sameRows.map((r) => r.cathode), 0.001) * 1.1;
    const gx = (q: number) => L + (q / maxQ) * (W - L - 10);
    const gy = (y: number) => H - B - (y / maxY) * (H - B - 12);
    return { W, H, L, B, maxQ, maxY, gx, gy, perC };
  }, [sameRows, current, o.cathode]);

  const doneCount = completedTasks.filter((id) => tasks.some((t) => t.id === id)).length;
  const calcMine = experimentProblem(cell);
  const last = rows[rows.length - 1];

  const tabs = [
    {
      id: "cell",
      label: "Cell and ions",
      content: (
        <div className={styles.cellGrid}>
          <div>
            <h3 className={styles.h3}>Ions in {liquid.name.toLowerCase()}</h3>
            <p className={styles.ions}>{liquid.ions.map((ion) => <span key={ion}>{ion}</span>)}</p>
            <div className={styles.series} aria-label="Electrochemical series, hardest to discharge on the left">
              <p className={styles.seriesCap}>Electrochemical series: easier to discharge →</p>
              <ul>
                {SERIES.map((m) => {
                  const dis = (o.cathode.formula === "Cu" && m === "Cu") || (o.cathode.formula === "Ag" && m === "Ag") || (o.cathode.formula === "H₂" && m === "H");
                  return <li key={m} className={dis ? styles.serOn : ""}>{m}</li>;
                })}
              </ul>
            </div>
            <p className={styles.small}>When two positive ions are present, the one lower in the series (further right) is discharged at the cathode.</p>
            <p className={styles.small}><strong>The solution:</strong> {liquid.liquorNote}</p>
          </div>

          <div className={styles.half}>
            <h4>Cathode (−)</h4>
            <p className={styles.eq}>{o.cathode.equation}</p>
            <p>{o.cathode.look}.</p>
            {o.cathode.test && <p className={styles.small}><strong>Test:</strong> {o.cathode.test}</p>}
            <p className={styles.small}><strong>Why:</strong> {liquid.cathodeWhy}</p>
          </div>

          <div className={styles.half}>
            <h4>Anode (+)</h4>
            <p className={styles.eq}>{o.anode.equation}</p>
            <p>{o.anode.look}.</p>
            {o.anode.test && <p className={styles.small}><strong>Test:</strong> {o.anode.test}</p>}
            <p className={styles.small}>
              <strong>Why:</strong>{" "}
              {o.copperElectrodes
                ? "Copper atoms lose electrons more easily than any ion in the solution, so the copper anode itself dissolves."
                : liquid.anodeWhy}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "record",
      label: "Record",
      badge: `${rows.length}`,
      content: (
        <div className={styles.recordGrid}>
          <div>
            <div className={styles.rowHead}>
              <h3 className={styles.h3}>Measurements</h3>
              <span className={styles.small}>{rows.length} of 8 readings</span>
            </div>
            <p className={styles.small}>
              Switch the cell on, let it run, then press <strong>Record reading</strong>. {o.cathode.kind === "metal" ? "The cathode is weighed on a balance" : "The gas is read from the collecting tube"}, so your numbers carry a small measuring error, just like a real experiment. Take at least three readings at different times.
            </p>
            <div className={styles.live}>
              <div><span>Time</span><strong>{cell.minutes.toFixed(1)} min</strong></div>
              <div><span>Charge Q = I × t</span><strong>{Math.round(o.coulombs)} C</strong></div>
            </div>
            <div className={styles.buttons}>
              <button type="button" className={styles.primary} onClick={record} disabled={!canRecord}>Record reading</button>
              <button type="button" className={styles.ghost} onClick={() => { setRows([]); setMany({ recs: 0 }); }} disabled={rows.length === 0}>Clear table</button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>Measured amounts at the electrodes for each reading</caption>
                <thead>
                  <tr>
                    <th scope="col">t (min)</th>
                    <th scope="col">I (A)</th>
                    <th scope="col">Q (C)</th>
                    <th scope="col">Cathode ({unit})</th>
                    <th scope="col">Anode ({anodeUnit})</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={5} className={styles.empty}>No readings yet.</td></tr>}
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.minutes.toFixed(1)}</td>
                      <td>{r.current.toFixed(1)}</td>
                      <td>{Math.round(r.coulombs)}</td>
                      <td><strong>{unit === "g" ? r.cathode.toFixed(3) : r.cathode.toFixed(1)}</strong></td>
                      <td>{anodeUnit === "g" ? r.anode.toFixed(3) : r.anode.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`${styles.status} ${proportional ? styles.statusGood : ""}`} role="status" aria-live="polite">
              {rows.length === 0 && "Start with a short run, record, then let more time pass and record again."}
              {rows.length > 0 && rows.length < 3 && `${rows.length} of 3 readings. Record at a different time for each one.`}
              {rows.length >= 3 && proportional && `The amount at the cathode divided by the charge is steady (about ${fmt(meanPerC)} ${unit} per coulomb). The amount is proportional to the charge: Faraday\u2019s first law.`}
              {rows.length >= 3 && !proportional && "Your readings do not agree yet. Make sure each is at a different time and the current has not been changed."}
            </p>
          </div>

          <div>
            <h3 className={styles.h3}>Cathode amount against charge</h3>
            <svg viewBox={`0 0 ${graph.W} ${graph.H}`} className={styles.graph} role="img" aria-label={`Graph of ${o.cathode.name.toLowerCase()} collected against charge. Your points lie near the straight line from the origin.`}>
              <line x1={graph.L} y1={graph.H - graph.B} x2={graph.W - 6} y2={graph.H - graph.B} stroke="#64748b" strokeWidth="2" />
              <line x1={graph.L} y1="8" x2={graph.L} y2={graph.H - graph.B} stroke="#64748b" strokeWidth="2" />
              <line x1={graph.gx(0)} y1={graph.gy(0)} x2={graph.gx(graph.maxQ)} y2={graph.gy(graph.perC * graph.maxQ)} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth="2" />
              {rows.map((r) => (
                <circle key={r.id} cx={graph.gx(r.coulombs)} cy={graph.gy(r.cathode)} r="5" fill="#2563eb" stroke="#fff" strokeWidth="2" />
              ))}
              <text x={(graph.W + graph.L) / 2} y={graph.H - 6} textAnchor="middle" fontSize="12" fill="#475569">Charge Q (C)</text>
              <text x="12" y={(graph.H - graph.B) / 2} textAnchor="middle" fontSize="12" fill="#475569" transform={`rotate(-90 12 ${(graph.H - graph.B) / 2})`}>{o.cathode.name} ({unit})</text>
              <text x={graph.L} y={graph.H - graph.B + 14} textAnchor="middle" fontSize="11" fill="#475569">0</text>
              <text x={graph.W - 10} y={graph.H - graph.B + 14} textAnchor="end" fontSize="11" fill="#475569">{Math.round(graph.maxQ)}</text>
            </svg>
            <ul className={styles.legend} aria-hidden="true">
              <li><i style={{ background: "#2563eb" }} /> Your readings</li>
              {!blind && <li><i style={{ background: "#94a3b8" }} /> Calculated line</li>}
            </ul>
            {last && !blind && (
              <p className={styles.small}>
                Latest reading: you measured {unit === "g" ? last.cathode.toFixed(3) : last.cathode.toFixed(1)} {unit}; Faraday&apos;s law gives {unit === "g" ? last.cathodeCalc.toFixed(3) : last.cathodeCalc.toFixed(1)} {unit}.
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "calc",
      label: "Calculations",
      content: null,
    },
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
    { id: "cbt", label: "CBT practice", content: <CbtPanel bank={electrolysisBank} bare /> },
    {
      id: "notes",
      label: "Notes",
      content: (
        <div className={styles.notesGrid}>
          <div>
            <h3 className={styles.h3}>Experiment guide</h3>
            <ol className={styles.steps}>
              <li>Pour {liquid.name.toLowerCase()} into the beaker and place the two electrodes in it.</li>
              <li>Connect them to the supply through an ammeter and a rheostat. The anode joins the positive terminal.</li>
              <li>Switch on and set the current with the rheostat. Keep it steady.</li>
              <li>Note the time. {o.cathode.kind === "metal" ? "Weigh the dried cathode before and after." : "Read the gas volumes in the collecting tubes."}</li>
              <li>Record at several times and compare the amount collected with the charge, Q = I × t.</li>
            </ol>
            <h3 className={styles.h3}>Safety</h3>
            <ul className={styles.steps}>
              <li>Wear goggles. Dilute acids can irritate the skin and eyes.</li>
              <li>Chlorine is poisonous: use a fume cupboard or very small amounts.</li>
              <li>Never test hydrogen near a flame in a large volume.</li>
            </ul>
          </div>
          <div>
            <h3 className={styles.h3}>Key ideas</h3>
            <dl className={styles.concepts}>
              <div><dt>Electrolyte</dt><dd>A molten or dissolved compound with ions free to move.</dd></div>
              <div><dt>Cathode and anode</dt><dd>The cathode (−) attracts positive ions, which gain electrons. The anode (+) attracts negative ions, which lose electrons.</dd></div>
              <div><dt>Faraday</dt><dd>One mole of electrons carries {FARADAY.toLocaleString("en")} C. Charge Q = current × time in seconds.</dd></div>
              <div><dt>Amount deposited</dt><dd>Moles of electrons ÷ electrons per ion × molar mass. For example Cu²⁺ needs 2 mol of electrons per mole of copper.</dd></div>
            </dl>
          </div>
          <div>
            <h3 className={styles.h3}>Observation notes</h3>
            <label className={styles.field}>
              <span>What did you see at each electrode?</span>
              <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Colour of the solution, bubbles, any coating on the cathode…" />
            </label>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.dash}>
      <div className={styles.top}>
        {/* ------------------------------ set-up ------------------------------ */}
        <section className={styles.card} aria-label="Set-up">
          <h3 className={styles.h3}>Set-up</h3>
          <label className={styles.field}>
            <span>Electrolyte</span>
            <select value={eid} onChange={(e) => change({ electrolyte: e.target.value })}>
              {ELECTROLYTE_IDS.map((id) => (
                <option key={id} value={id}>{ELECTROLYTES[id].name}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Electrodes</span>
            <select value={cell.electrode} onChange={(e) => change({ electrode: e.target.value })}>
              <option value="inert">Graphite (inert)</option>
              <option value="copper">Copper</option>
            </select>
          </label>

          <label className={styles.slider} htmlFor="el-volts">
            <span>Supply voltage</span>
            <output>{cell.voltage} V</output>
          </label>
          <input id="el-volts" type="range" min={0} max={12} step={1} value={cell.voltage} onChange={(e) => onChange("voltage", Number(e.target.value))} aria-valuetext={`${cell.voltage} volts`} />
          <p className={styles.scale}><span>0</span><span>{MIN_VOLTS} V needed</span><span>12</span></p>

          <label className={styles.slider} htmlFor="el-amps">
            <span>Current (rheostat)</span>
            <output>{cell.current.toFixed(1)} A</output>
          </label>
          <input id="el-amps" type="range" min={0.5} max={3} step={0.1} value={cell.current} onChange={(e) => { setPlaying(false); setRows([]); setMany({ current: Number(e.target.value), minutes: 0, recs: 0 }); }} aria-valuetext={`${cell.current.toFixed(1)} amperes`} />
          <p className={styles.small}>Changing the current starts the run again.</p>

          <label className={styles.check}>
            <input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} />
            <span>Practical mode: hide the calculated amounts</span>
          </label>
          {!o.on && <p className={styles.warn} role="status">The cell is off. Set the voltage to {MIN_VOLTS} V or more.</p>}
        </section>

        {/* ------------------------------ apparatus ------------------------------ */}
        <section className={`${styles.card} ${styles.stage}`} aria-label="Apparatus">
          <div className={styles.viewBar}>
            <p className={styles.caption}>{liquid.name}</p>
            <div className={styles.viewToggle} role="group" aria-label="Choose a view">
              <button type="button" aria-pressed={view === "2d"} className={view === "2d" ? styles.segOn : ""} onClick={() => setView("2d")}>2D</button>
              <button type="button" aria-pressed={view === "3d"} className={view === "3d" ? styles.segOn : ""} onClick={() => setView("3d")}>3D</button>
            </div>
          </div>
          <div className={view === "3d" ? styles.stage3d : styles.stage2d}>
            {view === "3d" ? render3D({ ...state, compact: true }) : <ElectrolysisApparatus state={cell} />}
          </div>
          {view === "3d" && <p className={styles.small}>Drag to rotate · scroll or pinch to zoom</p>}
        </section>

        {/* ------------------------------ run ------------------------------ */}
        <section className={styles.card} aria-label="Run the experiment">
          <div className={styles.stats}>
            <div className={styles.stat}><span>Time</span><strong className={styles.bigBlue}>{cell.minutes.toFixed(1)} min</strong></div>
            <div className={styles.stat}><span>Charge Q</span><strong>{Math.round(o.coulombs)} C</strong></div>
            <div className={styles.stat}>
              <span>At the cathode (−)</span>
              <strong>{o.on ? o.cathode.name : "Nothing yet"}</strong>
              <small>{!o.on || cell.minutes === 0 ? "" : blind ? "calculated value hidden" : formatAmount(o.cathode, o.cathodeAmount)}</small>
            </div>
            <div className={styles.stat}>
              <span>At the anode (+)</span>
              <strong>{o.on ? o.anode.name : "Nothing yet"}</strong>
              <small>{!o.on || cell.minutes === 0 ? "" : blind ? "calculated value hidden" : formatAmount(o.anode, o.anodeAmount)}</small>
            </div>
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={togglePlay} aria-pressed={playing} disabled={!o.on}>
              {playing ? "Pause" : cell.minutes > 0 && cell.minutes < MAX_MINUTES ? "Resume" : "Run the cell"}
            </button>
            <button type="button" className={styles.ghost} onClick={reset}>Reset</button>
          </div>

          <label className={styles.slider} htmlFor="el-time">
            <span>Time elapsed</span>
            <output>{cell.minutes.toFixed(1)} min</output>
          </label>
          <input id="el-time" type="range" min={0} max={MAX_MINUTES} step={0.5} value={cell.minutes} disabled={!o.on} onChange={(e) => { setPlaying(false); onChange("minutes", Number(e.target.value)); }} aria-valuetext={`${cell.minutes.toFixed(1)} minutes`} />
          <div className={styles.fine}>
            <button type="button" onClick={() => { setPlaying(false); onChange("minutes", Math.max(0, cell.minutes - 1)); }} disabled={!o.on}>− 1 min</button>
            <button type="button" onClick={() => { setPlaying(false); onChange("minutes", Math.min(MAX_MINUTES, cell.minutes + 1)); }} disabled={!o.on}>+ 1 min</button>
            <button type="button" onClick={() => { setTab("record"); record(); }} disabled={!canRecord}>Record</button>
          </div>
          <p className={styles.eqline}><span>Cathode</span> {o.cathode.equation}</p>
          <p className={styles.eqline}><span>Anode</span> {o.anode.equation}</p>
          {cell.minutes > 0 && o.on && !blind && <p className={styles.small}>{fmt(o.molesE)} mol of electrons have passed ({Math.round(o.coulombs)} C ÷ 96 500).</p>}
        </section>
      </div>

      <LabTabs
        prefix="el"
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        bare={["calc"]}
        tabs={tabs.map((t) =>
          t.id === "calc"
            ? {
                ...t,
                content: (
                  <CalcPractice
                    tabId="el-tab-calc"
                    panelId="el-panel-calc"
                    hidden={tab !== "calc"}
                    kinds={CALC_KINDS}
                    generate={generateCalc}
                    mine={calcMine}
                    mineLocked="Switch the cell on and let it run to unlock this."
                    mineNote={last ? `You measured ${unit === "g" ? last.cathode.toFixed(3) : last.cathode.toFixed(1)} ${unit} at your latest reading.` : undefined}
                    footnote="Constants: 1 Faraday = 96 500 C; Cu = 63.5; Ag = 108; 1 mol of gas = 24 dm³ (24 000 cm³) at r.t.p."
                  />
                ),
              }
            : t,
        )}
      />
    </div>
  );
}
