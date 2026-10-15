"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import TasksQuiz from "../shell/TasksQuiz";
import CbtPanel from "./CbtPanel";
import TitrePractice from "./TitrePractice";
import {
  ACIDS,
  ACID_IDS,
  BASES,
  BASE_IDS,
  BURETTE_ML,
  CONC_MAX,
  CONC_MIN,
  FLASK_VOL,
  INDICATORS,
  INDICATOR_IDS,
  STAGE_LABEL,
  buretteFit,
  curvePoints,
  equation,
  equivalenceNote,
  equivalenceVolume,
  excessMillimoles,
  explain,
  hydrogenIon,
  indicatorColour,
  indicatorReport,
  paramsOf,
  stageAt,
  titrationPh,
  type AcidId,
  type BaseId,
  type IndicatorId,
  type TitParams,
} from "../specs/titration-chem";
import { makeRng, randomStart, unknownBase } from "../specs/titration-practice";
import { titrationBank } from "../specs/titration-cbt";

import type { DashboardProps } from "../types";
import styles from "./TitrationDashboard.module.css";

const FLOW = [
  { id: "slow", label: "Slow", mlPerSec: 0.6 },
  { id: "normal", label: "Normal", mlPerSec: 1.8 },
  { id: "fast", label: "Fast", mlPerSec: 4.5 },
] as const;

const TABS = [
  ["curve", "Curve and readings"],
  ["indicators", "Indicators"],
  ["record", "Titre record"],
  ["calc", "Calculations"],
  ["quiz", "Tasks and quiz"],
  ["cbt", "CBT practice"],
  ["notes", "Notes"],
] as const;
type TabId = (typeof TABS)[number][0];

const seedNow = () => Math.floor(Math.random() * 1e9);

/* ---------------------------- 2D apparatus ---------------------------- */

function Apparatus2D({ added, reading, colour, flowing, burF, flaskF }: { added: number; reading: number; colour: string; flowing: boolean; burF: string; flaskF: string }) {
  const uid = useId().replace(/:/g, "");
  const top = 78; // burette 0 mL
  const per = 5; // px per mL
  const level = top + reading * per;
  const bottom = top + BURETTE_ML * per; // 50 mL line
  const flaskLevel = 478 - (added / BURETTE_ML) * 22;
  const ticks = Array.from({ length: BURETTE_ML + 1 }, (_, i) => i);
  return (
    <svg viewBox="0 0 320 560" className={styles.apparatus} role="img" aria-label={`A burette of ${burF} above a conical flask of ${flaskF} and indicator`}>
      <defs>
        <linearGradient id={`${uid}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#f4f9ff" />
        </linearGradient>
        <linearGradient id={`${uid}rod`} x1="0" x2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="0.5" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id={`${uid}glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#dbeafe" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${uid}bench`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <clipPath id={`${uid}flask`}>
          <path d="M138 392 H182 V438 L246 512 Q252 522 238 524 H82 Q68 522 74 512 L138 438 Z" />
        </clipPath>
      </defs>
      <rect width="320" height="560" rx="18" fill={`url(#${uid}bg)`} />
      {/* bench */}
      <rect x="0" y="524" width="320" height="36" fill={`url(#${uid}bench)`} />
      {/* stand */}
      <rect x="30" y="514" width="120" height="14" rx="4" fill="#334155" />
      <rect x="36" y="514" width="108" height="3" rx="1.5" fill="#64748b" />
      <rect x="62" y="30" width="9" height="488" rx="4" fill={`url(#${uid}rod)`} />
      {/* clamp */}
      <rect x="54" y="170" width="25" height="30" rx="5" fill="#2563eb" />
      <rect x="79" y="180" width="56" height="9" rx="3" fill="#cbd5e1" />
      <rect x="130" y="170" width="40" height="30" rx="6" fill="#3b82f6" opacity="0.9" />
      {/* burette */}
      <rect x="132" y="56" width="36" height={bottom - 56 + 8} rx="4" fill={`url(#${uid}glass)`} stroke="#64748b" strokeWidth="2.5" />
      <rect x="135" y={level} width="30" height={Math.max(0, bottom + 6 - level)} fill="#f8a5a5" opacity="0.85" />
      <rect x="135" y={level - 2} width="30" height="4" rx="2" fill="#fecaca" />
      {ticks.map((t) => {
        const y = top + t * per;
        const major = t % 10 === 0;
        const mid = t % 5 === 0;
        return (
          <g key={t}>
            <line x1="132" x2={major ? 148 : mid ? 143 : 139} y1={y} y2={y} stroke="#334155" strokeWidth={major ? 1.4 : 0.8} />
            {major && (
              <text x="124" y={y + 3.5} textAnchor="end" fontSize="10" fill="#334155">
                {t}
              </text>
            )}
          </g>
        );
      })}
      <text x="150" y="44" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e3a8a">{burF}</text>
      {/* stopcock and tip */}
      <path d={`M138 ${bottom + 8} H162 L154 ${bottom + 30} H146 Z`} fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
      <rect x="140" y={bottom + 28} width="20" height="12" rx="3" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
      <rect x="116" y={bottom + 31} width="68" height="7" rx="3.5" fill="#2563eb" />
      <path d={`M147 ${bottom + 40} H153 L151 ${bottom + 58} H149 Z`} fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
      {flowing && <circle className={styles.drip} cx="150" cy={bottom + 62} r="3.6" fill="#f87171" />}
      {/* tile and flask */}
      <rect x="52" y="520" width="196" height="8" rx="3" fill="#fff" stroke="#cbd5e1" />
      <path d="M138 392 H182 V438 L246 512 Q252 522 238 524 H82 Q68 522 74 512 L138 438 Z" fill={`url(#${uid}glass)`} stroke="#64748b" strokeWidth="2.5" strokeLinejoin="round" />
      <g clipPath={`url(#${uid}flask)`}>
        <rect x="60" y={flaskLevel} width="200" height="80" fill={colour} style={{ transition: "fill .35s ease" }} />
        <ellipse cx="160" cy={flaskLevel} rx="62" ry="4" fill="#ffffff" opacity="0.35" />
      </g>
      <path d="M96 488 L124 452" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      {[490, 470, 450].map((y, i) => (
        <g key={y}>
          <line x1="92" x2="106" y1={y} y2={y} stroke="#475569" strokeWidth="1.2" />
          <text x="112" y={y + 3.5} fontSize="9" fill="#475569">{(i + 1) * 50}</text>
        </g>
      ))}
      <text x="160" y="552" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e3a8a">{flaskF} + indicator</text>
    </svg>
  );
}

/* ------------------------------ Titration curve ------------------------------ */

function Curve({ added, ph, ve, p, blind, reached }: { added: number; ph: number; ve: number; p: TitParams; blind: boolean; reached: number }) {
  const W = 560;
  const H = 330;
  const m = { l: 46, r: 16, t: 14, b: 44 };
  const gx = (v: number) => m.l + (v / BURETTE_ML) * (W - m.l - m.r);
  const gy = (y: number) => H - m.b - (y / 14) * (H - m.t - m.b);
  const points = useMemo(() => curvePoints(p), [p]);
  const shown = blind ? points.filter((pt) => pt.v <= reached + 1e-9) : points;
  const d = shown.map((pt, i) => `${i === 0 ? "M" : "L"}${gx(pt.v).toFixed(1)} ${gy(pt.ph).toFixed(1)}`).join(" ");
  const eqPh = titrationPh(ve, p);
  const calloutRight = ve < BURETTE_ML * 0.55;
  const cx = calloutRight ? gx(ve) + 14 : gx(ve) - 200;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.curve} role="img" aria-label={`Titration curve. Current point: ${added.toFixed(1)} cm³, pH ${ph.toFixed(2)}. ${blind ? "The equivalence point is hidden in challenge mode." : `Equivalence point at ${ve.toFixed(1)} cm³, pH ${eqPh.toFixed(2)}.`}`}>
      {[0, 2, 4, 6, 8, 10, 12, 14].map((y) => (
        <g key={y}>
          <line x1={m.l} x2={W - m.r} y1={gy(y)} y2={gy(y)} stroke="#e2eaf5" />
          <text x={m.l - 8} y={gy(y) + 4} textAnchor="end" fontSize="11" fill="#475569">{y}</text>
        </g>
      ))}
      {[0, 10, 20, 30, 40, 50].map((v) => (
        <g key={v}>
          <line x1={gx(v)} x2={gx(v)} y1={m.t} y2={H - m.b} stroke="#eef3fa" />
          <text x={gx(v)} y={H - m.b + 16} textAnchor="middle" fontSize="11" fill="#475569">{v}</text>
        </g>
      ))}
      <line x1={m.l} x2={m.l} y1={m.t} y2={H - m.b} stroke="#64748b" strokeWidth="1.5" />
      <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="#64748b" strokeWidth="1.5" />
      <text x={(m.l + W - m.r) / 2} y={H - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill="#334155">Volume of {ACIDS[p.acid].formula} added (cm³)</text>
      <text transform={`translate(12 ${(m.t + H - m.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fontWeight="600" fill="#334155">pH</text>
      {/* equivalence */}
      <path d={d} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" />
      {!blind && (
        <>
      <line x1={gx(ve)} x2={gx(ve)} y1={m.t} y2={H - m.b} stroke="#7c3aed" strokeDasharray="5 5" strokeWidth="1.5" />
      <circle cx={gx(ve)} cy={gy(eqPh)} r="6" fill="#d946ef" stroke="#fff" strokeWidth="2" />
      <g transform={`translate(${Math.max(m.l + 4, cx)} ${Math.max(m.t, Math.min(gy(eqPh) + 16, H - m.b - 46))})`}>
        <rect width="186" height="40" rx="8" fill="#fff" stroke="#d946ef" />
        <text x="10" y="17" fontSize="12" fontWeight="700" fill="#a21caf">Equivalence point</text>
        <text x="10" y="32" fontSize="11.5" fill="#a21caf">({ve.toFixed(1)} cm³, pH {eqPh.toFixed(2)})</text>
      </g>
        </>
      )}
      {/* current */}
      <line x1={gx(added)} x2={gx(added)} y1={m.t} y2={H - m.b} stroke="#f59e0b" strokeDasharray="3 4" opacity="0.7" />
      <circle cx={gx(added)} cy={gy(ph)} r="7" fill="#f59e0b" stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

/* ----------------------------- typed concentration ----------------------------- */

// Commits on Enter or when the field loses focus, so a half-typed number never
// reaches the experiment. An invalid entry snaps back to the current value.
function ConcField({ label, value, onCommit, disabled }: { label: string; value: number; onCommit: (v: number) => void; disabled?: boolean }) {
  const [bump, setBump] = useState(0);
  const id = useId();
  function commit(raw: string) {
    const v = Number(raw.trim().replace(",", "."));
    if (!Number.isFinite(v) || v < CONC_MIN || v > CONC_MAX) {
      setBump((b) => b + 1);
      return;
    }
    const rounded = Number(v.toPrecision(3));
    if (rounded !== value) onCommit(rounded);
    else setBump((b) => b + 1);
  }
  return (
    <div className={styles.conc}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.concBox}>
        {disabled ? (
          <input id={id} value="Unknown" disabled readOnly aria-label={`${label}: unknown, find it by titration`} />
        ) : (
          <input
            id={id}
            key={`${value}-${bump}`}
            type="text"
            inputMode="decimal"
            defaultValue={String(value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            aria-describedby={`${id}-hint`}
          />
        )}
        <span>mol/dm³</span>
      </div>
      <span id={`${id}-hint`} className={styles.srOnly}>
        Type a value from {CONC_MIN} to {CONC_MAX}, then press Enter.
      </span>
    </div>
  );
}

/* --------------------------------- Dashboard --------------------------------- */

export default function TitrationDashboard({
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
  const added = Number(state.added);
  const start = Number(state.start ?? 0);
  const reading = Math.round((start + added) * 100) / 100;
  const maxAdded = Math.round((BURETTE_ML - start) * 100) / 100;
  const indicator = String(state.indicator) as IndicatorId;
  const p = useMemo(() => paramsOf(state), [state]);
  const ve = equivalenceVolume(p);
  const ph = titrationPh(added, p);
  const stage = stageAt(added, p);
  const colour = indicatorColour(indicator, ph);
  const ind = INDICATORS[indicator] ?? INDICATORS["methyl-orange"];
  const excess = excessMillimoles(added, p);
  const hIon = hydrogenIon(added, p);
  const eqPh = titrationPh(ve, p);
  const burF = ACIDS[p.acid].formula;
  const flaskF = BASES[p.base].formula;
  const fit = buretteFit(p);

  const { acid: kA, base: kB, cA: kcA, cB: kcB, vB: kvB } = p;
  const reports = useMemo(
    () => INDICATOR_IDS.map((id) => indicatorReport(id, { acid: kA, base: kB, cA: kcA, cB: kcB, vB: kvB })),
    [kA, kB, kcA, kcB, kvB],
  );

  const [tab, setTab] = useState<TabId>("curve");
  const [flow, setFlow] = useState<(typeof FLOW)[number]["id"]>("normal");
  const [playing, setPlaying] = useState(false);
  const [dripping, setDripping] = useState(false);
  const [mine, setMine] = useState<{ v: number; ph: number; colour: string }[]>([]);
  const [notes, setNotes] = useState("");
  const [unknown, setUnknown] = useState(false);
  const [reached, setReached] = useState(0);

  const addedRef = useRef(added);
  useEffect(() => {
    addedRef.current = added;
  });
  const dripTimer = useRef<number | null>(null);
  const rate = FLOW.find((f) => f.id === flow)?.mlPerSec ?? 1.8;

  // Play: run acid in at the chosen rate. It pauses at the equivalence point
  // so the learner can look (not in challenge mode, where that would give the
  // answer away) and stops when the burette is empty.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = -1;
    const tick = (now: number) => {
      if (last < 0) last = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const from = addedRef.current;
      let next = Math.min(maxAdded, from + rate * dt);
      let stop = next >= maxAdded;
      if (!unknown && from < ve - 0.02 && next >= ve) {
        next = ve;
        stop = true;
      }
      next = Math.round(next * 100) / 100;
      addedRef.current = next;
      onChange("added", next);
      setReached((r) => Math.max(r, next));
      if (stop) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, rate, ve, onChange, maxAdded, unknown]);

  useEffect(
    () => () => {
      if (dripTimer.current) window.clearTimeout(dripTimer.current);
    },
    [],
  );

  function nudge(value: number) {
    setPlaying(false);
    const v = Math.min(maxAdded, Math.max(0, Math.round(value * 100) / 100));
    onChange("added", v);
    setReached((r) => Math.max(r, v));
    setDripping(true);
    if (dripTimer.current) window.clearTimeout(dripTimer.current);
    dripTimer.current = window.setTimeout(() => setDripping(false), 700);
  }

  // Any change to the solutions is a fresh experiment.
  function change(patch: Partial<TitParams>) {
    setPlaying(false);
    setMine([]);
    setReached(0);
    let next: TitParams = { ...p, ...patch };
    if (unknown) next = { ...next, cB: unknownBase(next, makeRng(seedNow())) };
    setMany({ ...next, added: 0, start: 0 });
  }

  // A fresh fill: the burette rarely starts exactly on zero.
  function newRun() {
    setPlaying(false);
    setReached(0);
    setMany({ added: 0, start: randomStart(makeRng(seedNow())) });
  }

  function toggleUnknown(on: boolean) {
    setPlaying(false);
    setMine([]);
    setReached(0);
    setUnknown(on);
    const cB = on ? unknownBase(p, makeRng(seedNow())) : 0.1;
    setMany({ cB, added: 0, start: 0 });
  }

  function reset() {
    setPlaying(false);
    setMine([]);
    setNotes("");
    setUnknown(false);
    setReached(0);
    onReset();
  }

  function togglePlay() {
    if (!playing && added >= maxAdded) onChange("added", 0);
    setPlaying((v) => !v);
  }

  function tabKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[n][0]);
    document.getElementById(`tit-tab-${TABS[n][0]}`)?.focus();
  }

  const flowing = playing || dripping;
  const equivalent = stage === "equivalence";
  const phPercent = (ph / 14) * 100;
  const doneCount = completedTasks.filter((id) => tasks.some((t) => t.id === id)).length;

  // Standard readings around this titration's own equivalence point.
  const table = (() => {
    const raw = [0, ve * 0.4, ve * 0.8, ve * 0.96, ve, ve * 1.04, ve * 1.2, ve * 1.6];
    const vols = [...new Set(raw.map((v) => Math.round(Math.min(v, BURETTE_ML) * 10) / 10))];
    return vols.map((v) => {
      const phv = titrationPh(v, p);
      return { v, ph: phv, colour: indicatorColour(indicator, phv) };
    });
  })();

  return (
    <div className={styles.dash}>
      <div className={styles.top}>
        {/* ------------------------------ set-up ------------------------------ */}
        <section className={styles.card} aria-label="Set-up">
          <h3 className={styles.h3}>Set-up</h3>

          <fieldset className={styles.group}>
            <legend>Burette: acid</legend>
            <select aria-label="Acid in the burette" value={p.acid} onChange={(e) => change({ acid: e.target.value as AcidId })}>
              {ACID_IDS.map((id) => (
                <option key={id} value={id}>{ACIDS[id].name} ({ACIDS[id].formula}) · {ACIDS[id].strength.toLowerCase().replace(" acid", "")}</option>
              ))}
            </select>
            <ConcField label="Concentration" value={p.cA} onCommit={(v) => change({ cA: v })} />
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Pipette: base in the flask</legend>
            <select aria-label="Base in the flask" value={p.base} onChange={(e) => change({ base: e.target.value as BaseId })}>
              {BASE_IDS.map((id) => (
                <option key={id} value={id}>{BASES[id].name} ({BASES[id].formula}) · {BASES[id].strength.toLowerCase().replace(" base", "")}</option>
              ))}
            </select>
            <div className={styles.pair}>
              <ConcField label="Concentration" value={p.cB} onCommit={(v) => change({ cB: v })} disabled={unknown} />
              <div className={styles.conc}>
                <label htmlFor="tit-vb">Pipette volume</label>
                <div className={styles.concBox}>
                  <select id="tit-vb" value={p.vB} onChange={(e) => change({ vB: Number(e.target.value) })}>
                    {FLASK_VOL.map((v) => (
                      <option key={v} value={v}>{v.toFixed(1)}</option>
                    ))}
                  </select>
                  <span>cm³</span>
                </div>
              </div>
            </div>
          </fieldset>

          <label className={styles.field}>
            <span>Indicator</span>
            <select value={indicator} onChange={(e) => onChange("indicator", e.target.value)}>
              {INDICATOR_IDS.map((id) => (
                <option key={id} value={id}>{INDICATORS[id].name} (pH {INDICATORS[id].low} to {INDICATORS[id].high})</option>
              ))}
            </select>
          </label>

          <label className={styles.check}>
            <input type="checkbox" checked={unknown} onChange={(e) => toggleUnknown(e.target.checked)} />
            <span>Challenge: the base concentration is unknown</span>
          </label>

          {fit === "too-big" && !unknown && <p className={styles.warn} role="status">This needs {ve.toFixed(1)} cm³, more than the 50 cm³ burette holds. Use a stronger acid or less base.</p>}
          {fit === "too-small" && !unknown && <p className={styles.warn} role="status">Only {ve.toFixed(1)} cm³ is needed: too small to read accurately. Use a weaker acid or more base.</p>}
          {fit === "ok" && !unknown && <p className={styles.small}>Expected titre about {ve.toFixed(1)} cm³.</p>}
        </section>

        {/* ------------------------------ apparatus ------------------------------ */}
        <section className={`${styles.card} ${styles.stage}`} aria-label="Apparatus">
          <div className={styles.viewBar}>
            <p className={styles.caption}>Acid in the burette · base in the flask</p>
            <div className={styles.viewToggle} role="group" aria-label="Choose a view">
              <button type="button" aria-pressed={view === "2d"} className={view === "2d" ? styles.segOn : ""} onClick={() => setView("2d")}>2D</button>
              <button type="button" aria-pressed={view === "3d"} className={view === "3d" ? styles.segOn : ""} onClick={() => setView("3d")}>3D</button>
            </div>
          </div>
          <div className={view === "3d" ? styles.stage3d : styles.stage2d}>
            {view === "3d" ? render3D({ ...state, compact: true }) : <Apparatus2D added={added} reading={reading} colour={colour.hex} flowing={flowing} burF={burF} flaskF={flaskF} />}
          </div>
          {view === "3d" && <p className={styles.small}>Drag to rotate · scroll or pinch to zoom</p>}
        </section>

        {/* ------------------------------ run ------------------------------ */}
        <section className={styles.card} aria-label="Run the titration">
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span>pH</span>
              <strong className={styles.bigBlue}>{ph.toFixed(2)}</strong>
            </div>
            <div className={styles.stat}>
              <span>Burette reading</span>
              <strong>{reading.toFixed(2)} cm³</strong>
            </div>
            <div className={styles.stat}>
              <span>Colour</span>
              <strong className={styles.colourName}>
                <i className={styles.swatch} style={{ background: colour.hex }} aria-hidden="true" />
                {colour.name}
              </strong>
            </div>
            <div className={`${styles.chip} ${unknown ? styles.chipNeutral : equivalent ? styles.chipGood : stage === "acid" ? styles.chipAcid : styles.chipAlk}`} role="status" aria-live="polite">
              {unknown ? "Watch the colour" : STAGE_LABEL[stage]}
            </div>
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={togglePlay} aria-pressed={playing}>
              {playing ? "Pause" : added > 0 && added < maxAdded ? "Resume" : "Run acid in"}
            </button>
            <button type="button" className={styles.ghost} onClick={reset}>Reset</button>
          </div>

          <label className={styles.slider} htmlFor="tit-added">
            <span>Acid added</span>
            <output>{added.toFixed(2)} cm³</output>
          </label>
          <input id="tit-added" type="range" min={0} max={maxAdded} step={0.05} value={added} onChange={(e) => nudge(Number(e.target.value))} aria-valuetext={`${added.toFixed(2)} cubic centimetres`} />
          <div className={styles.fine}>
            <button type="button" onClick={() => nudge(Math.max(0, added - 0.05))} aria-label="Remove one drop, 0.05 cm³">− 1 drop</button>
            <button type="button" onClick={() => nudge(Math.min(maxAdded, added + 0.05))} aria-label="Add one drop, 0.05 cm³">+ 1 drop</button>
            {!unknown && <button type="button" onClick={() => nudge(Math.max(0, ve - 0.5))}>Near end</button>}
          </div>

          <p className={styles.label}>Flow rate</p>
          <div className={styles.segment} role="group" aria-label="Flow rate">
            {FLOW.map((f) => (
              <button key={f.id} type="button" aria-pressed={flow === f.id} className={flow === f.id ? styles.segOn : ""} onClick={() => setFlow(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ------------------------------ tabbed workspace ------------------------------ */}
      <section className={`${styles.card} ${styles.work}`} aria-label="Workspace">
        <div className={styles.tabs} role="tablist" aria-label="Workspace sections">
          {TABS.map(([id, label], i) => (
            <button
              key={id}
              id={`tit-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`tit-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              className={tab === id ? styles.tabOn : ""}
              onClick={() => setTab(id)}
              onKeyDown={(e) => tabKey(e, i)}
            >
              {label}
              {id === "quiz" && <em>{doneCount}/{tasks.length}</em>}
            </button>
          ))}
        </div>

        {/* Curve and readings */}
        <div id="tit-panel-curve" role="tabpanel" aria-labelledby="tit-tab-curve" hidden={tab !== "curve"} className={styles.panel}>
          <div className={styles.curveGrid}>
            <div>
              <Curve added={added} ph={ph} ve={ve} p={p} blind={unknown} reached={Math.max(reached, added)} />
              <ul className={styles.legend} aria-hidden="true">
                <li><i style={{ background: "#2563eb" }} /> Titration curve</li>
                {!unknown && <li><i className={styles.dotPink} /> Equivalence point</li>}
                <li><i className={styles.dotAmber} /> Current volume</li>
              </ul>
            </div>
            <div>
              <div className={styles.readGrid}>
                <div><span>pH</span><strong className={styles.bigBlue}>{ph.toFixed(2)}</strong></div>
                <div><span>Acid added</span><strong>{added.toFixed(2)} cm³</strong></div>
                <div><span>[H⁺]</span><strong>{hIon.toExponential(2)}</strong></div>
                {unknown ? (
                  <div><span>Colour</span><strong>{colour.name}</strong></div>
                ) : (
                  <>
                    <div><span>{excess >= 0 ? "Excess H⁺" : "OH⁻ left"}</span><strong>{Math.abs(excess).toFixed(2)} mmol</strong></div>
                    <div><span>Equivalence</span><strong>{ve.toFixed(1)} cm³</strong></div>
                  </>
                )}
                <div><span>Indicator range</span><strong>{ind.low} to {ind.high}</strong></div>
              </div>
              <div className={styles.phBar} aria-hidden="true">
                <div className={styles.phTrack} />
                <i className={styles.phWindow} style={{ left: `${(ind.low / 14) * 100}%`, width: `${((ind.high - ind.low) / 14) * 100}%` }} />
                <i className={styles.phMarker} style={{ left: `${phPercent}%` }} />
              </div>
              <div className={styles.phScale} aria-hidden="true"><span>0</span><span>7</span><span>14</span></div>
              <p className={styles.equation}><span>Reaction</span> {equation(p)}</p>
              {unknown ? (
                <p className={styles.small}>Challenge mode: the equivalence point and the explanation are hidden. Find the end point from the colour and the curve.</p>
              ) : (
                <>
                  <p className={styles.explain}>{explain(added, p)}</p>
                  <p className={styles.small}>{equivalenceNote(p)} Equivalence: {ve.toFixed(1)} cm³ at pH {eqPh.toFixed(2)}.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div id="tit-panel-indicators" role="tabpanel" aria-labelledby="tit-tab-indicators" hidden={tab !== "indicators"} className={styles.panel}>
          {unknown ? (
            <p className={styles.small}>Hidden in challenge mode, because the end-point volumes would give the answer away. Choose the indicator you think suits {ACIDS[p.acid].strength.toLowerCase()} with {BASES[p.base].strength.toLowerCase()}.</p>
          ) : (
            <>
              <p className={styles.small}>
                An indicator is suitable when its colour change is sharp and happens right at the equivalence point. The table is worked out from the curve for <strong>{burF}</strong> run into <strong>{flaskF}</strong>.
              </p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.srOnly}>Indicator suitability for the chosen acid and base</caption>
                  <thead>
                    <tr><th scope="col">Indicator</th><th scope="col">pH range</th><th scope="col">End point (cm³)</th><th scope="col">Change spread over</th><th scope="col">Verdict</th></tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className={r.id === indicator ? styles.rowOn : ""}>
                        <td>{INDICATORS[r.id].name}</td>
                        <td>{INDICATORS[r.id].low} to {INDICATORS[r.id].high}</td>
                        <td>{r.endVolume === null ? "no clear change" : `${r.endVolume.toFixed(2)} (${r.error! >= 0 ? "+" : ""}${r.error!.toFixed(2)})`}</td>
                        <td>{r.width === null ? "n/a" : `${r.width.toFixed(2)} cm³`}</td>
                        <td><span className={r.verdict === "suitable" ? styles.good : r.verdict === "poor" ? styles.mid : styles.bad}>{r.verdict === "suitable" ? "Suitable" : r.verdict === "poor" ? "Gradual change" : "Not suitable"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.small}>
                <strong>End point vs equivalence point:</strong> the equivalence point is where the alkali is exactly neutralised. The end point is where the indicator changes colour. The figure in brackets is how far each end point is from equivalence.
              </p>
            </>
          )}
        </div>

        {/* Titre record and calculations (state is kept while you switch tabs) */}
        <TitrePractice
          key={`${p.acid}-${p.base}-${p.cA}-${p.cB}-${p.vB}-${unknown}`}
          tab={tab}
          p={p}
          start={start}
          added={added}
          ph={ph}
          indicator={indicator}
          colourName={colour.name}
          unknown={unknown}
          onNewRun={newRun}
        />

        {/* Tasks and quiz */}
        <div id="tit-panel-quiz" role="tabpanel" aria-labelledby="tit-tab-quiz" hidden={tab !== "quiz"} className={styles.panel}>
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
        </div>

        {/* CBT practice */}
        <div id="tit-panel-cbt" role="tabpanel" aria-labelledby="tit-tab-cbt" hidden={tab !== "cbt"} className={styles.panel}>
          <CbtPanel bank={titrationBank} bare />
        </div>

        {/* Notes */}
        <div id="tit-panel-notes" role="tabpanel" aria-labelledby="tit-tab-notes" hidden={tab !== "notes"} className={styles.panel}>
          <div className={styles.notesGrid}>
            <div>
              <h3 className={styles.h3}>Experiment guide</h3>
              <ol className={styles.steps}>
                <li>Rinse the burette with the acid and fill it. Note the initial reading.</li>
                <li>Pipette {p.vB.toFixed(1)} cm³ of {unknown ? "the base of unknown concentration" : `${p.cB} mol/dm³ ${flaskF}`} into the conical flask. Add 2 or 3 drops of indicator and stand it on a white tile.</li>
                <li>Run in {burF} while swirling. Go drop by drop near the end.</li>
                <li>Stop at the first permanent colour change. Record the final reading and the titre.</li>
                <li>Repeat until two titres agree within 0.10 cm³.</li>
              </ol>
              <h3 className={styles.h3}>Safety</h3>
              <ul className={styles.steps}>
                <li>Wear a lab coat and safety goggles.</li>
                <li>Handle acids and alkalis with care. Never pipette by mouth.</li>
                <li>Rinse spills with plenty of water.</li>
              </ul>
            </div>
            <div>
              <h3 className={styles.h3}>Key concepts</h3>
              <dl className={styles.concepts}>
                <div><dt>Equivalence point</dt><dd>Where the moles of acid and base are exactly in the ratio of the equation.</dd></div>
                <div><dt>End point</dt><dd>Where the indicator changes colour. Close to, but not always exactly at, the equivalence point.</dd></div>
                <div><dt>Titre</dt><dd>The volume run from the burette: final reading minus initial reading.</dd></div>
                <div><dt>{ACIDS[p.acid].strength}</dt><dd>{ACIDS[p.acid].note}</dd></div>
                <div><dt>{BASES[p.base].strength}</dt><dd>{BASES[p.base].note}</dd></div>
              </dl>
            </div>
            <div>
              <div className={styles.rowHead}>
                <h3 className={styles.h3}>Observations</h3>
                <button type="button" className={styles.ghostSmall} onClick={() => setMine((rows) => [...rows.slice(-7), { v: added, ph, colour: colour.name }])}>
                  Record this reading
                </button>
              </div>
              {unknown ? (
                <p className={styles.small}>The standard table is hidden in challenge mode. Use “Record this reading” to build your own.</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <caption className={styles.srOnly}>pH and indicator colour at standard volumes for this titration</caption>
                    <thead>
                      <tr><th scope="col">Acid (cm³)</th><th scope="col">pH</th><th scope="col">Colour</th></tr>
                    </thead>
                    <tbody>
                      {table.map((row) => (
                        <tr key={row.v} className={Math.abs(row.v - added) < 0.5 ? styles.rowOn : ""}>
                          <td>{row.v.toFixed(1)}</td>
                          <td>{row.ph.toFixed(2)}</td>
                          <td><i className={styles.swatchSm} style={{ background: row.colour.hex }} aria-hidden="true" /> {row.colour.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {mine.length > 0 && (
                <ul className={styles.mine}>
                  {mine.map((row, i) => (
                    <li key={i}>{row.v.toFixed(2)} cm³ · pH {row.ph.toFixed(2)} · {row.colour}</li>
                  ))}
                </ul>
              )}
              <label className={styles.field}>
                <span>Observation notes</span>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What colour was the solution at the start? How did it change?" />
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
