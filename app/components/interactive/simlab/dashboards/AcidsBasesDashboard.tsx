"use client";

import { useState } from "react";

import LabTabs from "../shell/LabTabs";
import TasksQuiz from "../shell/TasksQuiz";
import { abBank } from "../specs/ab-cbt";
import {
  INDICATORS,
  MAX_DILUTION,
  SAMPLES,
  SAMPLE_IDS,
  colourAt,
  hydrogenIon,
  kindOf,
  liquidOf,
  observe,
  type AcidState,
  type Kind,
} from "../specs/ab-model";
import type { DashboardProps } from "../types";
import AcidsApparatus from "./AcidsApparatus";
import styles from "./AcidsBasesDashboard.module.css";
import CbtPanel from "./CbtPanel";

type Row = { id: number; sample: string; indicator: string; saw: string; says: Kind; right: boolean };
type TabId = "guide" | "record" | "unknown" | "quiz" | "cbt" | "notes";

const UNK_NAMES = ["Unknown liquid A", "Unknown liquid B", "Unknown liquid C"];
const FIRST_SET = ["vinegar", "antacid", "water"];
const MAX_ROWS = 12;
const GUIDE = ["litmus", "methyl", "phenolphthalein", "universal"] as const;
const GUIDE_NAMES: Record<string, string> = { litmus: "Litmus", methyl: "Methyl orange", phenolphthalein: "Phenolphthalein", universal: "Universal indicator" };
const GUIDE_NOTE: Record<string, string> = {
  litmus: "Red in acids, blue in alkalis, purple when nearly neutral.",
  methyl: "Red in strong acids, orange in between, yellow above pH 4.4.",
  phenolphthalein: "Colourless in acids and neutral liquids, pink in alkalis.",
  universal: "A mixture that shows a full range of colours, so you can read the pH.",
};
const KIND_LABEL: Record<Kind, string> = { acidic: "Acid", neutral: "Neutral", alkaline: "Alkali" };

function pickThree() {
  const pool = SAMPLE_IDS.filter((id) => id !== "water");
  const out: string[] = ["water"];
  while (out.length < 3) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  // shuffle so water is not always first
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function AcidsBasesDashboard({
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
  const as: AcidState = {
    sample: String(state.sample),
    indicator: String(state.indicator),
    added: Boolean(state.added),
    dilution: Number(state.dilution),
    label: String(state.label || ""),
  };
  const o = observe(as);
  const liquid = liquidOf(as.sample);
  const shownName = as.label || liquid.name;
  const meter = as.indicator === "meter";

  const [tab, setTab] = useState<TabId>("guide");
  const [rows, setRows] = useState<Row[]>([]);
  const [says, setSays] = useState<Kind>("acidic");
  const [notes, setNotes] = useState("");
  const [unknowns, setUnknowns] = useState<string[]>(FIRST_SET);
  const [guessKind, setGuessKind] = useState<Record<number, Kind>>({});
  const [guessPh, setGuessPh] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const fresh = { added: false, dilution: 0 };
  const sampleValue = as.label ? String(UNK_NAMES.indexOf(as.label)) : as.sample;

  function chooseSample(v: string) {
    if (/^\d$/.test(v)) setMany({ ...fresh, sample: unknowns[Number(v)], label: UNK_NAMES[Number(v)] });
    else setMany({ ...fresh, sample: v, label: "" });
  }

  const canRecord = o.tested && rows.length < MAX_ROWS;
  function record() {
    if (!canRecord) return;
    setRows((r) => [
      ...r,
      { id: r.length + 1, sample: shownName + (as.dilution ? ` (diluted ${Math.pow(10, as.dilution).toLocaleString("en")}×)` : ""), indicator: INDICATORS.find((i) => i.id === as.indicator)?.short ?? "", saw: meter ? `pH ${o.readPh}` : o.colourWord, says, right: says === o.kind },
    ]);
    setMany({ recs: rows.length + 1 });
  }

  function reset() {
    setRows([]);
    setNotes("");
    setGuessKind({});
    setGuessPh({});
    setChecked(false);
    setRevealed(false);
    setSolvedIds([]);
    onReset();
  }

  function checkAnswers() {
    const ids = unknowns.flatMap((id, i) => {
      const real = liquidOf(id).ph;
      return guessKind[i] === kindOf(real) && guessPh[i] !== undefined && Math.abs(guessPh[i] - real) <= 1 ? [String(i)] : [];
    });
    const next = Array.from(new Set([...solvedIds, ...ids]));
    setChecked(true);
    setSolvedIds(next);
    setMany({ solved: next.length });
  }
  function newSet() {
    setUnknowns(pickThree());
    setGuessKind({});
    setGuessPh({});
    setChecked(false);
    setRevealed(false);
    setSolvedIds([]);
    setMany({ ...fresh, sample: "water", label: "", solved: 0 });
  }

  const doneCount = completedTasks.filter((id) => tasks.some((t) => t.id === id)).length;
  const correctRows = rows.filter((r) => r.right).length;
  const h = Math.pow(10, -o.ph);

  const tabs = [
    {
      id: "guide",
      label: "Indicator guide",
      content: (
        <div className={styles.guide}>
          {GUIDE.map((id) => (
            <div key={id} className={styles.guideCard}>
              <h4>{GUIDE_NAMES[id]}</h4>
              <p className={styles.small}>{GUIDE_NOTE[id]}</p>
              <div className={styles.strip} style={{ background: `linear-gradient(to right, ${Array.from({ length: 15 }, (_, p) => colourAt(id, p)).join(", ")})` }} role="img" aria-label={`${GUIDE_NAMES[id]} colour from pH 0 to pH 14`} />
              <div className={styles.ticksRow} aria-hidden="true"><span>0</span><span>7</span><span>14</span></div>
            </div>
          ))}
          <div className={`${styles.guideCard} ${styles.guideNote}`}>
            <h4>Everyday liquids on the pH scale</h4>
            <p className={styles.small}>
              {SAMPLE_IDS.map((id) => `${SAMPLES[id].name} (${SAMPLES[id].ph})`).join(" · ")}
            </p>
            <p className={styles.small}>
              Each step down the scale means ten times as many hydrogen ions. A strong acid fully splits into ions, so diluting it ten times raises the pH by one. A weak acid only partly splits, so its pH changes by less.
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
          <p className={styles.small}>Test a liquid, then say whether it is an acid, neutral or an alkali and press <strong>Record result</strong>. Your conclusion is checked against its real pH.</p>
          <div className={styles.pick}>
            <label className={styles.srOnly} htmlFor="ab-says">What type of liquid is it?</label>
            <select id="ab-says" value={says} onChange={(e) => setSays(e.target.value as Kind)}>
              <option value="acidic">It is an acid</option>
              <option value="neutral">It is neutral</option>
              <option value="alkaline">It is an alkali</option>
            </select>
            <button type="button" className={styles.primary} onClick={record} disabled={!canRecord} style={{ flex: "0 0 auto", padding: "0 16px" }}>Record result</button>
            <button type="button" className={styles.ghost} onClick={() => { setRows([]); setMany({ recs: 0 }); }} disabled={rows.length === 0} style={{ flex: "0 0 auto", padding: "0 16px" }}>Clear</button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Indicator test results</caption>
              <thead>
                <tr><th scope="col">#</th><th scope="col">Liquid</th><th scope="col">Indicator</th><th scope="col">Result</th><th scope="col">Conclusion</th><th scope="col">Check</th></tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={6} className={styles.empty}>No results yet.</td></tr>}
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.sample}</td>
                    <td>{r.indicator}</td>
                    <td>{r.saw}</td>
                    <td>{KIND_LABEL[r.says]}</td>
                    <td><span className={`${styles.mark} ${r.right ? styles.markGood : styles.markBad}`}>{r.right ? "Correct" : "Check again"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${styles.status} ${rows.length >= 5 ? styles.statusGood : ""}`} role="status" aria-live="polite">
            {rows.length < 5 ? `${rows.length} of 5 results recorded. Try different liquids and indicators.` : "Five results recorded. Compare what different indicators say about the same liquid."}
          </p>
        </div>
      ),
    },
    {
      id: "unknown",
      label: "Unknown liquids",
      badge: `${solvedIds.length}/3`,
      content: (
        <div>
          <h3 className={styles.h3}>Mystery liquids</h3>
          <p className={styles.small}>Three beakers have lost their labels. Test each (use universal indicator or the pH meter), then decide if it is an acid, neutral or an alkali and estimate its pH to within 1.</p>
          <ul className={styles.unkList}>
            {unknowns.map((id, i) => {
              const real = liquidOf(id).ph;
              const ok = checked && guessKind[i] === kindOf(real) && guessPh[i] !== undefined && Math.abs(guessPh[i] - real) <= 1;
              return (
                <li key={`${id}-${i}`} className={`${styles.unk} ${sampleValue === String(i) ? styles.unkOn : ""}`}>
                  <div className={styles.unkHead}>
                    <strong>{UNK_NAMES[i]}</strong>
                    <button type="button" className={styles.ghost} style={{ flex: "0 0 auto", padding: "0 14px" }} onClick={() => chooseSample(String(i))}>Test this liquid</button>
                  </div>
                  <div className={styles.selects}>
                    <label>Type
                      <select value={guessKind[i] ?? ""} onChange={(e) => { setChecked(false); setGuessKind((g) => ({ ...g, [i]: e.target.value as Kind })); }}>
                        <option value="" disabled>Choose…</option>
                        <option value="acidic">Acid</option>
                        <option value="neutral">Neutral</option>
                        <option value="alkaline">Alkali</option>
                      </select>
                    </label>
                    <label>pH
                      <select value={guessPh[i] ?? ""} onChange={(e) => { setChecked(false); setGuessPh((g) => ({ ...g, [i]: Number(e.target.value) })); }}>
                        <option value="" disabled>Choose…</option>
                        {Array.from({ length: 15 }, (_, p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </label>
                  </div>
                  {checked && <p className={`${styles.verdict} ${ok ? styles.markGood : styles.markBad}`}>{ok ? "Correct." : "Not quite. Test it again."}</p>}
                  {revealed && <p className={styles.small}>It was {SAMPLES[id].name}, pH {SAMPLES[id].ph}.</p>}
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
    { id: "cbt", label: "CBT practice", content: <CbtPanel bank={abBank} bare /> },
    {
      id: "notes",
      label: "Notes",
      content: (
        <div className={styles.notesGrid}>
          <div>
            <h3 className={styles.h3}>Good practice</h3>
            <ol className={styles.steps}>
              <li>Never taste or touch unknown liquids. Wear goggles.</li>
              <li>Use a clean beaker and dropper for every liquid.</li>
              <li>Add only a few drops of indicator.</li>
              <li>Compare the colour with the guide before you decide.</li>
              <li>Use universal indicator or a pH meter when you need a number.</li>
            </ol>
          </div>
          <div>
            <h3 className={styles.h3}>Key ideas</h3>
            <dl className={styles.concepts}>
              <div><dt>Acid</dt><dd>A substance that gives hydrogen ions (H⁺) in water. pH below 7.</dd></div>
              <div><dt>Alkali</dt><dd>A base that dissolves in water and gives hydroxide ions (OH⁻). pH above 7.</dd></div>
              <div><dt>Neutralisation</dt><dd>Acid + alkali → salt + water.</dd></div>
            </dl>
          </div>
          <div>
            <h3 className={styles.h3}>Observation notes</h3>
            <label className={styles.field}>
              <span>Write what you saw and what you decided.</span>
              <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Colour in each indicator, pH estimates…" />
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
            <span>Test liquid</span>
            <select value={sampleValue} onChange={(e) => chooseSample(e.target.value)}>
              <optgroup label="Known liquids">
                {SAMPLE_IDS.map((id) => <option key={id} value={id}>{SAMPLES[id].name}</option>)}
              </optgroup>
              <optgroup label="Mystery liquids">
                {UNK_NAMES.map((n, i) => <option key={n} value={String(i)}>{n}</option>)}
              </optgroup>
            </select>
          </label>
          <label className={styles.field}>
            <span>Indicator</span>
            <select value={as.indicator} onChange={(e) => setMany({ indicator: e.target.value, added: false })}>
              {INDICATORS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
          </label>
          <label className={styles.slider} htmlFor="ab-dil">
            <span>Dilute the liquid</span>
            <output>{as.dilution === 0 ? "Not diluted" : `${Math.pow(10, as.dilution).toLocaleString("en")} times`}</output>
          </label>
          <input id="ab-dil" type="range" min={0} max={MAX_DILUTION} step={1} value={as.dilution} onChange={(e) => onChange("dilution", Number(e.target.value))} aria-valuetext={`${as.dilution} tenfold dilutions`} />
          <p className={styles.small}>{as.label ? "Dilute it, then see how the pH moves toward 7." : liquid.note}</p>
          <button type="button" className={styles.ghost} style={{ width: "100%", marginTop: 8 }} onClick={() => setMany({ ...fresh })}>New beaker</button>
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
            {view === "3d" ? render3D({ ...state, compact: true }) : <AcidsApparatus state={as} />}
          </div>
          {view === "3d" && <p className={styles.small}>Drag to rotate · scroll or pinch to zoom</p>}
        </section>

        <section className={styles.card} aria-label="Run the test">
          <h3 className={styles.h3}>Run the test</h3>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={() => onChange("added", true)} disabled={as.indicator === "none" || as.added}>
              {as.indicator === "none" ? "Choose an indicator" : as.added ? (meter ? "Probe in liquid" : "Indicator added") : meter ? "Dip the probe" : "Add indicator"}
            </button>
          </div>
          <div className={`${styles.resultBox} ${o.tested ? styles.resultGood : ""}`} role="status" aria-live="polite">
            <span className={styles.swatch} style={{ background: o.colour }} />
            <div>
              <strong>{o.tested ? `${o.readPh ? `pH ${o.readPh.replace("about ", "≈ ")} · ` : ""}${KIND_LABEL[o.kind]}` : "Not tested yet"}</strong>
              {o.conclusion}
            </div>
          </div>
          {o.tested && as.indicator === "meter" && <p className={styles.ionLine}>Hydrogen ions: about {hydrogenIon(o.ph)} mol per dm³ ({h < 1e-7 ? "fewer" : h > 1e-7 ? "more" : "the same"} than pure water).</p>}
          <div className={styles.buttons} style={{ marginTop: 12 }}>
            <button type="button" className={styles.primary} onClick={() => { setTab("record"); record(); }} disabled={!canRecord}>Record result</button>
            <button type="button" className={styles.ghost} onClick={reset}>Reset</button>
          </div>
        </section>
      </div>

      <LabTabs prefix="ab" active={tab} onChange={(id) => setTab(id as TabId)} tabs={tabs} />
    </div>
  );
}
