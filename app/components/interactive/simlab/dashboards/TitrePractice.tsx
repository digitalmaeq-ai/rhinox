"use client";

import { useMemo, useState } from "react";

import {
  ACIDS,
  BASES,
  INDICATORS,
  indicatorReport,
  type IndicatorId,
  type TitParams,
} from "../specs/titration-chem";
import {
  CALC_KINDS,
  CONCORDANT_WITHIN,
  MAX_RUNS,
  concordant,
  experimentProblem,
  fmt,
  generateCalc,
  round05,
  round2,
  type CalcKind,
  type Run,
} from "../specs/titration-practice";
import CalcPractice from "./CalcPractice";
import styles from "./TitrationPractice.module.css";

type Props = {
  p: TitParams;
  /** Burette reading at the start of this run, before any is delivered. */
  start: number;
  added: number;
  /** pH of the flask now. */
  ph: number;
  tab: string;
  indicator: IndicatorId;
  colourName: string;
  /** Challenge mode: the base concentration is hidden. */
  unknown: boolean;
  onNewRun: () => void;
};

export default function TitrePractice({ p, start, added, ph, tab, indicator, colourName, unknown, onNewRun }: Props) {
  const ind = INDICATORS[indicator];
  const [runs, setRuns] = useState<Run[]>([]);
  const [initialTaken, setInitialTaken] = useState<number | null>(null);

  const reading = round05(start + added);
  const startReading = round05(start);
  const canInitial = added === 0 && initialTaken === null && runs.length < MAX_RUNS;
  const canFinal = initialTaken !== null && added > 0;

  function recordInitial() {
    setInitialTaken(startReading);
  }

  function recordFinal() {
    if (initialTaken === null) return;
    const titre = round2(reading - initialTaken);
    setRuns((r) => [
      ...r,
      { id: r.length + 1, initial: initialTaken, final: reading, titre, colour: colourName, changed: ph <= ind.high },
    ]);
    setInitialTaken(null);
  }

  function newRun() {
    setInitialTaken(null);
    onNewRun();
  }

  const accurate = runs.slice(1).map((r) => r.titre);
  const conc = concordant(accurate);
  const report = useMemo(() => indicatorReport(indicator, p), [indicator, p]);

  const mine = conc !== null ? experimentProblem(p, conc.mean) : null;

  return (
    <>
      <div id="tit-panel-record" role="tabpanel" aria-labelledby="tit-tab-record" hidden={tab !== "record"}>
      <section className={styles.card} aria-label="Titre record">
        <div className={styles.head}>
          <h3>Titre record</h3>
          <span>{runs.length} of {MAX_RUNS} runs</span>
        </div>
        <p className={styles.help}>
          Record the burette reading before you start and again at the end point. The titre is the final reading minus the initial reading. Make the first run a rough one, then repeat more carefully until two accurate titres agree within {CONCORDANT_WITHIN.toFixed(2)} cm³.
        </p>

        <div className={styles.live}>
          <div><span>Burette reading</span><strong>{reading.toFixed(2)} cm³</strong></div>
          <div><span>Initial reading taken</span><strong>{initialTaken === null ? "not yet" : `${initialTaken.toFixed(2)} cm³`}</strong></div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={recordInitial} disabled={!canInitial}>
            1. Record initial reading
          </button>
          <button type="button" className={styles.btn} onClick={recordFinal} disabled={!canFinal || runs.length >= MAX_RUNS}>
            2. Record final reading
          </button>
          <button type="button" className={styles.btnGhost} onClick={newRun}>
            Refill burette · new run
          </button>
        </div>
        {!canInitial && initialTaken === null && added > 0 && <p className={styles.note}>Press “Refill burette · new run” to start another titration, then record the initial reading.</p>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.srOnly}>Burette readings and titres for each run</caption>
            <thead>
              <tr><th scope="col">Run</th><th scope="col">Initial</th><th scope="col">Final</th><th scope="col">Titre (cm³)</th><th scope="col">Colour</th></tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr><td colSpan={5} className={styles.empty}>No runs yet. Your results will appear here.</td></tr>
              )}
              {runs.map((r, i) => {
                const used = conc !== null && i > 0 && conc.values.some((v) => Math.abs(v - r.titre) < 1e-9);
                return (
                  <tr key={r.id} className={used ? styles.rowGood : ""}>
                    <td>{i === 0 ? "Rough" : i}</td>
                    <td>{r.initial.toFixed(2)}</td>
                    <td>{r.final.toFixed(2)}</td>
                    <td><strong>{r.titre.toFixed(2)}</strong></td>
                    <td>{r.changed ? r.colour : <em>no change yet</em>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className={`${styles.status} ${conc ? styles.statusGood : ""}`} role="status" aria-live="polite">
          {runs.length === 0 && "Start with a rough titration: add the acid fairly quickly and stop when the colour changes."}
          {runs.length === 1 && `Rough titre ${runs[0].titre.toFixed(2)} cm³. Now do accurate runs: add quickly to about 2 cm³ before this volume, then drop by drop.`}
          {runs.length > 1 && !conc && `Accurate titres so far: ${accurate.map((v) => v.toFixed(2)).join(", ")} cm³. None agree within ${CONCORDANT_WITHIN.toFixed(2)} cm³ yet. Repeat.`}
          {conc && `Concordant titres: ${conc.values.map((v) => v.toFixed(2)).join(" and ")} cm³. Mean titre = ${conc.mean.toFixed(2)} cm³.`}
        </p>
        {conc && !unknown && (
          <p className={styles.note}>
            For {ind.name.toLowerCase()} the expected end point is {report.endVolume === null ? "not clear on this curve" : `${report.endVolume.toFixed(2)} cm³`}
            {report.endVolume !== null && ` (your mean differs by ${(conc.mean - report.endVolume >= 0 ? "+" : "") + (conc.mean - report.endVolume).toFixed(2)} cm³)`}.
            {!report.suitable && " This indicator is not suitable for this pair, so the end point is unreliable."}
          </p>
        )}
        {runs.length > 0 && (
          <button type="button" className={styles.link} onClick={() => { setRuns([]); setInitialTaken(null); }}>
            Clear the table
          </button>
        )}
      </section>
      </div>

      <CalcPractice
        tabId="tit-tab-calc"
        panelId="tit-panel-calc"
        hidden={tab !== "calc"}
        kinds={CALC_KINDS}
        generate={(seed, kind) => generateCalc(seed, kind as CalcKind | undefined)}
        mine={mine}
        mineLocked="Get two concordant titres in the record above to unlock this."
        mineNote={unknown ? `The actual concentration of the base was ${fmt(p.cB)} mol/dm³.` : undefined}
        footnote={`Reaction: ${ACIDS[p.acid].formula} with ${BASES[p.base].formula}. 1 mL = 1 cm³.`}
      />
    </>
  );
}
