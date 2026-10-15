"use client";

import { useState } from "react";

import LabTabs from "../shell/LabTabs";
import TasksQuiz from "../shell/TasksQuiz";
import { foodBank } from "../specs/food-cbt";
import {
  FOODS,
  FOOD_IDS,
  NUTRIENTS,
  TESTS,
  TEST_IDS,
  contents,
  foodOf,
  observe,
  testOf,
  type FoodState,
  type Nutrient,
} from "../specs/food-model";
import type { DashboardProps } from "../types";
import CbtPanel from "./CbtPanel";
import FoodApparatus from "./FoodApparatus";
import styles from "./FoodTestsDashboard.module.css";

type Infer = "absent" | "trace" | "present";
type Row = { id: number; sample: string; test: string; saw: string; infer: Infer; right: boolean };
type TabId = "guide" | "record" | "unknown" | "quiz" | "cbt" | "notes";

const UNKNOWN_POOL = FOOD_IDS.filter((id) => id !== "sucrose");
const FIRST_SET = ["beans", "orange", "groundnut"];
const UNK_NAMES = ["Unknown sample A", "Unknown sample B", "Unknown sample C"];
const MAX_ROWS = 12;

function pickThree() {
  const pool = [...UNKNOWN_POOL];
  const out: string[] = [];
  while (out.length < 3) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}

export default function FoodTestsDashboard({
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
  const fs: FoodState = {
    food: String(state.food),
    test: String(state.test),
    heat: Boolean(state.heat),
    added: Boolean(state.added),
    hydro: Boolean(state.hydro),
    drops: Number(state.drops),
    label: String(state.label || ""),
  };
  const o = observe(fs);
  const food = foodOf(fs.food);
  const test = testOf(fs.test);
  const shownName = fs.label || food.name;

  const [tab, setTab] = useState<TabId>("guide");
  const [rows, setRows] = useState<Row[]>([]);
  const [infer, setInfer] = useState<Infer>("present");
  const [notes, setNotes] = useState("");
  const [unknowns, setUnknowns] = useState<string[]>(FIRST_SET);
  const [ticks, setTicks] = useState<Record<string, Nutrient[]>>({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const fresh = { added: false, heat: false, drops: 0, hydro: false };
  const sampleValue = fs.label ? String(UNK_NAMES.indexOf(fs.label)) : fs.food;

  function chooseSample(v: string) {
    if (/^\d$/.test(v)) setMany({ ...fresh, food: unknowns[Number(v)], label: UNK_NAMES[Number(v)] });
    else setMany({ ...fresh, food: v, label: "" });
  }
  function chooseTest(v: string) {
    setMany({ ...fresh, test: v });
  }

  // A tube of DCPIP only counts once the dye has gone (or clearly will not).
  const stillFading = fs.test === "dcpip" && o.level > 0 && !o.positive;
  const canRecord = o.complete && !stillFading && rows.length < MAX_ROWS;

  function record() {
    if (!canRecord) return;
    const real = o.level === 0 ? "absent" : o.level === 1 ? "trace" : "present";
    const row: Row = {
      id: rows.length + 1,
      sample: shownName,
      test: test.name,
      saw: fs.test === "dcpip" ? o.text : o.text,
      infer,
      right: infer === real,
    };
    setRows((r) => [...r, row]);
    setMany({ recs: rows.length + 1 });
  }

  function reset() {
    setRows([]);
    setNotes("");
    setTicks({});
    setChecked(false);
    setRevealed(false);
    setSolvedIds([]);
    onReset();
  }

  function toggleTick(i: number, n: Nutrient) {
    setChecked(false);
    setTicks((t) => {
      const cur = t[i] ?? [];
      return { ...t, [i]: cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n] };
    });
  }

  const same = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
  function checkAnswers() {
    const ok = unknowns.map((f, i) => same(ticks[i] ?? [], contents(f)));
    const ids = ok.flatMap((v, i) => (v ? [String(i)] : []));
    const next = Array.from(new Set([...solvedIds, ...ids]));
    setChecked(true);
    setSolvedIds(next);
    setMany({ solved: next.length });
  }
  function newSet() {
    setUnknowns(pickThree());
    setTicks({});
    setChecked(false);
    setRevealed(false);
    setSolvedIds([]);
    setMany({ ...fresh, food: "egg", label: "", solved: 0 });
  }

  const doneCount = completedTasks.filter((id) => tasks.some((t) => t.id === id)).length;
  const correctRows = rows.filter((r) => r.right).length;
  const dropFill = fs.test === "dcpip" ? Math.min(100, (fs.drops / 25) * 100) : 0;

  const tabs = [
    {
      id: "guide",
      label: "Test guide",
      content: (
        <div className={styles.guide}>
          {TEST_IDS.map((id) => {
            const t = TESTS[id];
            const rowsShown = id === "dcpip" ? [0, 3] : [0, 1, 2, 3];
            return (
              <div key={id} className={styles.guideCard}>
                <h4>{t.name}</h4>
                <p className={styles.small}>{t.method}</p>
                <ul className={styles.chips}>
                  {rowsShown.map((l) => (
                    <li key={l}>
                      <span className={styles.swatch} style={{ background: id === "dcpip" && l === 3 ? "#e0f2fe" : t.colours[l] }} />
                      {t.words[l]}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className={`${styles.guideCard} ${styles.guideNote}`}>
            <h4>Reading the result</h4>
            <p className={styles.small}>
              A trace means the nutrient is there in a very small amount. In the unknown-samples challenge a trace does not count as &ldquo;contains&rdquo;. Table sugar (sucrose) is not a reducing sugar: boil it with dilute acid first, and Benedict&apos;s test then turns positive.
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
        <div>
          <div className={styles.rowHead}>
            <h3 className={styles.h3}>Results table</h3>
            <span className={styles.small}>{rows.length} of {MAX_ROWS} · {correctRows} correct</span>
          </div>
          <p className={styles.small}>
            Do a test, then say what you think it shows and press <strong>Record result</strong>. Your conclusion is checked against what the sample really contains.
          </p>
          <div className={styles.pick}>
            <label className={styles.srOnly} htmlFor="ft-infer">What does the result show?</label>
            <select id="ft-infer" value={infer} onChange={(e) => setInfer(e.target.value as Infer)}>
              <option value="present">Nutrient present</option>
              <option value="trace">Only a trace</option>
              <option value="absent">Nutrient absent</option>
            </select>
            <button type="button" className={styles.primary} onClick={record} disabled={!canRecord} style={{ flex: "0 0 auto", padding: "0 16px" }}>Record result</button>
            <button type="button" className={styles.ghost} onClick={() => { setRows([]); setMany({ recs: 0 }); }} disabled={rows.length === 0} style={{ flex: "0 0 auto", padding: "0 16px" }}>Clear</button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Food test results</caption>
              <thead>
                <tr><th scope="col">#</th><th scope="col">Sample</th><th scope="col">Test</th><th scope="col">Observation</th><th scope="col">Conclusion</th><th scope="col">Check</th></tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={6} className={styles.empty}>No results yet.</td></tr>}
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.sample}</td>
                    <td>{r.test}</td>
                    <td style={{ whiteSpace: "normal", minWidth: 180 }}>{r.saw}</td>
                    <td>{r.infer === "present" ? "Present" : r.infer === "trace" ? "Trace" : "Absent"}</td>
                    <td><span className={`${styles.mark} ${r.right ? styles.markGood : styles.markBad}`}>{r.right ? "Correct" : "Check again"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${styles.status} ${rows.length >= 5 ? styles.statusGood : ""}`} role="status" aria-live="polite">
            {rows.length < 5 ? `${rows.length} of 5 results recorded. Try different foods and different tests.` : "Five results recorded. A good results table covers every test, including a negative result."}
          </p>
        </div>
      ),
    },
    {
      id: "unknown",
      label: "Unknown samples",
      badge: `${solvedIds.length}/3`,
      content: (
        <div>
          <h3 className={styles.h3}>Mystery samples</h3>
          <p className={styles.small}>
            Three samples have lost their labels. Choose a sample, test it with each reagent, then tick what it contains. Only count a nutrient as present if the test is clearly positive.
          </p>
          <ul className={styles.unkList}>
            {unknowns.map((f, i) => {
              const ok = checked && same(ticks[i] ?? [], contents(f));
              return (
                <li key={`${f}-${i}`} className={`${styles.unk} ${sampleValue === String(i) ? styles.unkOn : ""}`}>
                  <div className={styles.unkHead}>
                    <strong>{UNK_NAMES[i]}</strong>
                    <button type="button" className={styles.ghost} style={{ flex: "0 0 auto", padding: "0 14px" }} onClick={() => chooseSample(String(i))}>Test this sample</button>
                  </div>
                  <div className={styles.ticks} role="group" aria-label={`What ${UNK_NAMES[i]} contains`}>
                    {NUTRIENTS.map((n) => (
                      <label key={n.id}>
                        <input type="checkbox" checked={(ticks[i] ?? []).includes(n.id)} onChange={() => toggleTick(i, n.id)} />
                        {n.label}
                      </label>
                    ))}
                  </div>
                  {checked && <p className={`${styles.verdict} ${ok ? styles.markGood : styles.markBad}`}>{ok ? "Correct." : "Not quite. Test it again with every reagent."}</p>}
                  {revealed && <p className={styles.small}>It was {FOODS[f].name}: {contents(f).length ? contents(f).map((n) => NUTRIENTS.find((x) => x.id === n)!.label.toLowerCase()).join(", ") : "none of the five nutrients"}.</p>}
                </li>
              );
            })}
          </ul>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={checkAnswers}>Check answers</button>
            <button type="button" className={styles.ghost} onClick={() => setRevealed(true)} disabled={!checked || revealed}>Reveal</button>
            <button type="button" className={styles.ghost} onClick={newSet}>New set</button>
          </div>
          <p className={`${styles.status} ${solvedIds.length === 3 ? styles.statusGood : ""}`} role="status" aria-live="polite">
            {solvedIds.length === 3 ? "All three identified. Well done." : `${solvedIds.length} of 3 identified.`}
          </p>
        </div>
      ),
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
    { id: "cbt", label: "CBT practice", content: <CbtPanel bank={foodBank} bare /> },
    {
      id: "notes",
      label: "Notes",
      content: (
        <div className={styles.notesGrid}>
          <div>
            <h3 className={styles.h3}>Good practice</h3>
            <ol className={styles.steps}>
              <li>Use a clean test tube for every test.</li>
              <li>Crush solid food and mix it with a little water first.</li>
              <li>Test water too, as a control that shows a negative result.</li>
              <li>Heat Benedict&apos;s mixtures in a water bath and point the tube away from people.</li>
              <li>Compare colours with the guide before you decide.</li>
            </ol>
          </div>
          <div>
            <h3 className={styles.h3}>Key ideas</h3>
            <dl className={styles.concepts}>
              <div><dt>Reducing sugar</dt><dd>A sugar, like glucose, that changes the colour of Benedict&apos;s solution on heating.</dd></div>
              <div><dt>Control</dt><dd>A test with water that shows what &ldquo;no nutrient&rdquo; looks like.</dd></div>
              <div><dt>Semi-quantitative</dt><dd>The colour or number of drops shows roughly how much, not exactly how much.</dd></div>
            </dl>
          </div>
          <div>
            <h3 className={styles.h3}>Observation notes</h3>
            <label className={styles.field}>
              <span>Write what you saw and what you decided.</span>
              <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Colour before and after, how long it took…" />
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
          <label className={styles.field}>
            <span>Sample</span>
            <select value={sampleValue} onChange={(e) => chooseSample(e.target.value)}>
              <optgroup label="Known foods">
                {FOOD_IDS.map((id) => (
                  <option key={id} value={id}>{FOODS[id].name}</option>
                ))}
              </optgroup>
              <optgroup label="Mystery samples">
                {UNK_NAMES.map((n, i) => (
                  <option key={n} value={String(i)}>{n}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className={styles.field}>
            <span>Test to carry out</span>
            <select value={fs.test} onChange={(e) => chooseTest(e.target.value)}>
              {TEST_IDS.map((id) => (
                <option key={id} value={id}>{TESTS[id].name}</option>
              ))}
            </select>
          </label>
          {fs.test === "benedict" && (
            <label className={styles.check}>
              <input type="checkbox" checked={fs.hydro} onChange={(e) => setMany({ hydro: e.target.checked, added: false, heat: false })} />
              <span>Boil the sample with dilute acid first, then neutralise</span>
            </label>
          )}
          <p className={styles.method}><strong>Method:</strong> {test.method}</p>
          <button type="button" className={styles.ghost} style={{ width: "100%" }} onClick={() => setMany({ ...fresh })}>New test tube</button>
        </section>

        <section className={`${styles.card} ${styles.stage}`} aria-label="Apparatus">
          <div className={styles.viewBar}>
            <p className={styles.caption}>{shownName}</p>
            <div className={styles.viewToggle} role="group" aria-label="Choose a view">
              <button type="button" aria-pressed={view === "2d"} className={view === "2d" ? styles.segOn : ""} onClick={() => setView("2d")}>2D</button>
              <button type="button" aria-pressed={view === "3d"} className={view === "3d" ? styles.segOn : ""} onClick={() => setView("3d")}>3D</button>
            </div>
          </div>
          <div className={view === "3d" ? styles.stage3d : styles.stage2d}>
            {view === "3d" ? render3D({ ...state, compact: true }) : <FoodApparatus state={fs} />}
          </div>
          {view === "3d" && <p className={styles.small}>Drag to rotate · scroll or pinch to zoom</p>}
        </section>

        <section className={styles.card} aria-label="Run the test">
          <h3 className={styles.h3}>Run the test</h3>
          {fs.test === "dcpip" ? (
            <>
              <div className={styles.fine} style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <button type="button" onClick={() => onChange("drops", fs.drops + 1)}>+1 drop</button>
                <button type="button" onClick={() => onChange("drops", fs.drops + 5)}>+5 drops</button>
                <button type="button" onClick={() => onChange("drops", 0)} disabled={fs.drops === 0}>Clear</button>
              </div>
              <p className={styles.small}>Drops added: <strong>{fs.drops}</strong></p>
              <div className={styles.dropBar} aria-hidden="true"><i style={{ width: `${dropFill}%` }} /></div>
            </>
          ) : (
            <div className={styles.buttons}>
              <button type="button" className={styles.primary} onClick={() => setMany({ added: true })} disabled={fs.added}>{fs.added ? "Reagent added" : "Add reagent"}</button>
              {fs.test === "benedict" && (
                <button type="button" className={styles.ghost} onClick={() => onChange("heat", !fs.heat)} disabled={!fs.added} aria-pressed={fs.heat}>{fs.heat ? "Stop heating" : "Heat in water bath"}</button>
              )}
            </div>
          )}
          <div className={`${styles.resultBox} ${o.complete && o.positive ? styles.resultGood : ""}`} role="status" aria-live="polite">
            <span className={styles.swatch} style={{ background: o.colour }} />
            <div>
              <strong>{!o.complete ? "Not tested yet" : o.positive ? "Positive" : o.level === 1 ? "Trace" : "Negative"}</strong>
              {o.text}
            </div>
          </div>
          <div className={styles.buttons} style={{ marginTop: 12 }}>
            <button type="button" className={styles.primary} onClick={() => { setTab("record"); record(); }} disabled={!canRecord}>Record result</button>
            <button type="button" className={styles.ghost} onClick={reset}>Reset</button>
          </div>
        </section>
      </div>

      <LabTabs prefix="ft" active={tab} onChange={(id) => setTab(id as TabId)} tabs={tabs} />
    </div>
  );
}
