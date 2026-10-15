"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CompletionActions, {
  ActivityHeaderButtons,
} from "@/app/components/interactive/shared/CompletionActions";

import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";
import type { Control, SimSpec, SimState, TourStep } from "./types";
import { quizBank } from "./quizBank";
import NumberSlider from "./shell/NumberSlider";
import LabTabs from "./shell/LabTabs";
import TasksQuiz from "./shell/TasksQuiz";
import styles from "./SimLab.module.css";

function subjectLabel(subject?: string) {
  if (!subject) return "Virtual lab";
  const name = subject
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return `Virtual lab · ${name}`;
}

// three.js is only downloaded the first time a 3D view is shown.
const Scene3DHost = dynamic(() => import("./scenes3d/Scene3DHost"), {
  ssr: false,
  loading: () => <div className={styles.loading3d}>Loading 3D view…</div>,
});

type Mode = "interactive" | "cinematic" | "classroom";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "interactive", label: "Interactive", hint: "You control the experiment" },
  { id: "cinematic", label: "Cinematic", hint: "A guided journey that plays itself" },
  { id: "classroom", label: "Classroom", hint: "Teacher-led, for a projector" },
];

function ModeIcon({ id }: { id: Mode }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (id === "interactive")
    return (
      <svg {...common}>
        <path d="M4 8h9M17 8h3M4 16h3M11 16h9" />
        <circle cx="15" cy="8" r="2" />
        <circle cx="9" cy="16" r="2" />
      </svg>
    );
  if (id === "cinematic")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.8v6.4l5.2-3.2z" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4M8 20h8M7.5 9.5l3 2.5 3-4 3 2" />
    </svg>
  );
}

function liveValue(control: Control, state: SimState) {
  const v = state[control.key];
  if (control.type === "slider") return `${v}${control.unit ? ` ${control.unit}` : ""}`;
  if (control.type === "toggle") return v ? control.onLabel : control.offLabel;
  return control.options.find((o) => o.value === v)?.label ?? String(v);
}

const STEP_MS = 9000;
const GLIDE_MS = 1100;
const SPEEDS = [
  { label: "Slow", value: 0.6 },
  { label: "Normal", value: 1 },
  { label: "Fast", value: 1.6 },
];

function ControlField({
  control,
  state,
  onChange,
  disabled = false,
}: {
  control: Control;
  state: SimState;
  onChange: (key: string, value: number | string | boolean) => void;
  disabled?: boolean;
}) {
  const id = `sim-${control.key}`;

  if (control.type === "slider") {
    return (
      <NumberSlider
        id={id}
        label={control.label}
        unit={control.unit}
        min={control.min}
        max={control.max}
        step={control.step}
        value={Number(state[control.key])}
        onChange={(value) => onChange(control.key, value)}
        disabled={disabled}
      />
    );
  }

  if (control.type === "toggle") {
    const on = Boolean(state[control.key]);
    return (
      <div className={styles.field}>
        <span className={styles.fieldLabel} id={`${id}-label`}>
          <span>{control.label}</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby={`${id}-label`}
          disabled={disabled}
          onClick={() => onChange(control.key, !on)}
          className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
        >
          <span className={styles.toggleKnob} aria-hidden="true" />
          <span>{on ? control.onLabel : control.offLabel}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.field} role="group" aria-labelledby={`${id}-label`}>
      <span className={styles.fieldLabel} id={`${id}-label`}>
        <span>{control.label}</span>
      </span>
      <div className={styles.choices}>
        {control.options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={state[control.key] === option.value}
            disabled={disabled}
            onClick={() => onChange(control.key, option.value)}
            className={`${styles.choice} ${
              state[control.key] === option.value ? styles.choiceOn : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SimLabRenderer({
  experience,
  runtimeState,
  actions,
  spec,
}: InteractiveRuntimeRendererProps & { spec: SimSpec }) {
  const [state, setState] = useState<SimState>(spec.init);
  const [mode, setMode] = useState<Mode>("interactive");
  const [view, setView] = useState<"2d" | "3d">("3d");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [revealed, setRevealed] = useState<string[]>([]);
  const labRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef<SimState>(state);
  const frameRef = useRef(0);
  const tour: TourStep[] = useMemo(() => spec.tour ?? [], [spec.tour]);
  const step = tour[stepIndex];

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // Glide the controls to a step's values, like a camera move: numbers ease
  // there (snapping to each slider's step), everything else switches at once.
  const glideTo = useCallback(
    (target: Record<string, number | string | boolean>) => {
      cancelAnimationFrame(frameRef.current);
      const from = { ...stateRef.current };
      const begin = performance.now();
      const stepOf = (key: string) => {
        const c = spec.controls.find((control) => control.key === key);
        return c && c.type === "slider" ? c.step : 0;
      };
      const tick = (now: number) => {
        const t = Math.min(1, (now - begin) / GLIDE_MS);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setState((current) => {
          const next: SimState = { ...current };
          for (const [key, to] of Object.entries(target)) {
            const was = from[key];
            if (typeof to === "number" && typeof was === "number") {
              const raw = t >= 1 ? to : was + (to - was) * e;
              const unit = stepOf(key);
              next[key] = t >= 1 ? to : unit >= 1 ? Math.round(raw / unit) * unit : Math.round(raw * 100) / 100;
            } else {
              next[key] = to;
            }
          }
          return next;
        });
        if (t < 1) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    },
    [spec.controls],
  );

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(tour.length - 1, index));
      setStepIndex(clamped);
      if (tour[clamped]) glideTo(tour[clamped].set);
    },
    [tour, glideTo],
  );

  function changeMode(next: Mode) {
    if (next === mode) return;
    cancelAnimationFrame(frameRef.current);
    setMode(next);
    setRevealed([]);
    if (next === "interactive") {
      setPlaying(false);
      setState(spec.init);
      return;
    }
    setState(spec.init);
    setStepIndex(0);
    setPlaying(next === "cinematic");
    window.setTimeout(() => goToStep(0), 0);
  }

  // Cinematic: move to the next stop on a timer, then rest at the end.
  useEffect(() => {
    if (mode !== "cinematic" || !playing) return;
    const id = window.setTimeout(() => {
      if (stepIndex < tour.length - 1) {
        goToStep(stepIndex + 1);
      } else {
        setPlaying(false);
      }
    }, STEP_MS / speed);
    return () => window.clearTimeout(id);
  }, [mode, playing, stepIndex, speed, tour.length, goToStep]);

  function restartTour() {
    setPlaying(true);
    setState(spec.init);
    setStepIndex(0);
    window.setTimeout(() => goToStep(0), 0);
  }

  function handleKey(event: React.KeyboardEvent) {
    if (mode !== "classroom") return;
    if ((event.target as HTMLElement).tagName === "INPUT") return;
    if (event.key === "ArrowRight") goToStep(stepIndex + 1);
    if (event.key === "ArrowLeft") goToStep(stepIndex - 1);
  }

  function toggleFullscreen() {
    const el = labRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }

  function toggleReveal(id: string) {
    setRevealed((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  const [checkKey, setCheckKey] = useState(0);

  const tasks = useMemo(() => experience.tasks ?? [], [experience.tasks]);
  // The content file's questions, plus the bank, make a 10-question check.
  const classQuestions = useMemo(() => experience.questions ?? [], [experience.questions]);
  const questions = useMemo(
    () => [...classQuestions, ...(quizBank[experience.component ?? ""] ?? [])],
    [classQuestions, experience.component],
  );
  const completedTasks = runtimeState.completedTasks;
  const requiredTasks = tasks.filter((task) => task.required !== false);
  const requiredDone = requiredTasks.every((task) =>
    completedTasks.includes(task.id),
  );
  const allQuestionsDone = questions.every((question) =>
    runtimeState.submittedQuestions.includes(question.id),
  );
  const readyToFinish = requiredDone && allQuestionsDone;

  // Tasks latch the first time the live state satisfies them.
  useEffect(() => {
    if (mode !== "interactive") return;
    for (const task of tasks) {
      if (completedTasks.includes(task.id)) continue;
      if (spec.checks[task.id]?.(state)) {
        actions.completeTask(task.id, task.points ?? 0);
      }
    }
  }, [mode, state, tasks, completedTasks, spec, actions]);

  // Progress: everything required is done and every question answered.
  useEffect(() => {
    if (readyToFinish && !runtimeState.completed) {
      actions.completeExperience();
    }
  }, [readyToFinish, runtimeState.completed, actions]);

  function handleChange(key: string, value: number | string | boolean) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function handleReset() {
    setCheckKey((value) => value + 1);
    cancelAnimationFrame(frameRef.current);
    setMode("interactive");
    setPlaying(false);
    setState(spec.init);
    actions.resetExperience();
  }

  const readings = spec.readings(state);
  const doneCount = completedTasks.filter((id) =>
    tasks.some((task) => task.id === id),
  ).length;
  const Scene = spec.Scene;
  const Dashboard = spec.Dashboard;
  const useDash = mode === "interactive" && !!Dashboard;

  return (
    <section
      ref={labRef}
      className={`${styles.lab} ${mode === "classroom" ? styles.classroom : ""}`}
      aria-label={experience.title}
      tabIndex={-1}
      onKeyDown={handleKey}
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          {subjectLabel(experience.subjects?.[0])}
        </p>
        <ActivityHeaderButtons
          onReset={handleReset}
          buttonClassName={styles.headerButton}
        />
      </header>

      {tour.length > 0 && (
        <div className={`${styles.modes} ${Dashboard ? styles.modesCompact : ""}`} role="group" aria-label="Choose a mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => changeMode(m.id)}
              className={`${styles.modeButton} ${mode === m.id ? styles.modeOn : ""}`}
            >
              <i className={styles.modeIcon}>
                <ModeIcon id={m.id} />
              </i>
              <strong>{m.label}</strong>
              <span>{m.hint}</span>
            </button>
          ))}
        </div>
      )}

      {useDash && Dashboard && (
        <Dashboard
          state={state}
          onChange={handleChange}
          setMany={(patch) => setState((current) => ({ ...current, ...patch }))}
          experience={experience}
          tasks={tasks}
          completedTasks={completedTasks}
          points={runtimeState.points}
          requiredDone={requiredDone}
          questions={questions}
          runtimeState={runtimeState}
          actions={actions}
          view={view}
          setView={setView}
          render3D={(s3) => (
            <Scene3DHost
              sceneKey={experience.component ?? ""}
              state={s3}
              autoRotate={false}
              fallback={null}
            />
          )}
          onReset={handleReset}
          onWatchTour={() => changeMode("cinematic")}
          checkKey={checkKey}
        />
      )}

      {!useDash && (
      <div className={styles.workbench}>
        <div className={styles.stage}>
          {spec.has3D && experience.component && (
            <div className={styles.viewBar}>
              <div className={styles.viewToggle} role="group" aria-label="Choose a view">
                {(["3d", "2d"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={`${styles.viewButton} ${view === v ? styles.viewOn : ""}`}
                  >
                    {v === "3d" ? "3D view" : "2D view"}
                  </button>
                ))}
              </div>
              {view === "3d" && <span className={styles.viewHint}>Drag to rotate · scroll or pinch to zoom</span>}
            </div>
          )}
          <div className={styles.sceneWrap}>
            <div
              className={`${styles.scene} ${view === "3d" && spec.has3D ? styles.scene3d : ""}`}
              role="img"
              aria-label={spec.sceneLabel}
            >
              {view === "3d" && spec.has3D && experience.component ? (
                <Scene3DHost
                  sceneKey={experience.component}
                  state={state}
                  autoRotate={mode === "cinematic" && playing}
                  fallback={<Scene state={state} />}
                />
              ) : (
                <Scene state={state} />
              )}
            </div>
            {mode !== "interactive" && step && (
              <div key={stepIndex} className={styles.overlay} role="status" aria-live="polite">
                <p className={styles.captionMeta}>
                  Stop {stepIndex + 1} of {tour.length}
                </p>
                <h3 className={styles.captionTitle}>{step.title}</h3>
                <p className={styles.captionText}>{step.text}</p>
                {step.fact && (
                  <p className={styles.captionFact}>
                    <strong>Did you know?</strong> {step.fact}
                  </p>
                )}
              </div>
            )}
          </div>
          {(mode === "interactive" || !step) && (
            <p className={styles.hint} role="status" aria-live="polite">
              {spec.hint(state)}
            </p>
          )}
        </div>

        <aside className={styles.panel}>
          {mode === "cinematic" ? (
            <>
              <h3 className={styles.panelTitle}>Live settings</h3>
              <dl className={styles.live}>
                {spec.controls.map((control) => (
                  <div key={control.key}>
                    <dt>{control.label}</dt>
                    <dd>{liveValue(control, state)}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.note}>The journey is setting these for you. Switch to Interactive to try them yourself.</p>
            </>
          ) : (
            <>
              <h3 className={styles.panelTitle}>{mode === "classroom" ? "Teacher controls" : "Controls"}</h3>
              {spec.controls.map((control) => (
                <ControlField key={control.key} control={control} state={state} onChange={handleChange} />
              ))}
            </>
          )}

          <h3 className={styles.panelTitle}>Readings</h3>
          <dl className={styles.readings}>
            {readings.map((reading) => (
              <div
                key={reading.label}
                className={`${styles.reading} ${
                  reading.tone ? styles[`tone_${reading.tone}`] : ""
                }`}
              >
                <dt>{reading.label}</dt>
                <dd>{reading.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
      )}

      {mode === "cinematic" && tour.length > 0 && (
        <div className={styles.controller} aria-label="Cinematic controller">
          <div className={styles.controllerRow}>
            <button
              type="button"
              className={`rx-button rx-button-primary ${styles.headerButton}`}
              onClick={() => {
                if (!playing && stepIndex >= tour.length - 1) restartTour();
                else setPlaying((p) => !p);
              }}
            >
              {playing ? "Pause" : stepIndex >= tour.length - 1 && !playing ? "Play again" : "Play"}
            </button>
            <button type="button" className={`rx-button rx-button-secondary ${styles.headerButton}`} onClick={restartTour}>
              Restart
            </button>
            <div className={styles.speed} role="group" aria-label="Speed">
              {SPEEDS.map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  aria-pressed={speed === sp.value}
                  onClick={() => setSpeed(sp.value)}
                  className={`${styles.chip} ${speed === sp.value ? styles.chipOn : ""}`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
            <span className={styles.progressText}>
              {stepIndex + 1} / {tour.length}
            </span>
          </div>
          <div
            className={styles.progress}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={tour.length}
            aria-valuenow={stepIndex + 1}
            style={{ ["--dur" as string]: `${STEP_MS / speed}ms` }}
          >
            {tour.map((t, i) => (
              <span
                key={t.title}
                className={`${styles.seg} ${i < stepIndex ? styles.segDone : ""} ${i === stepIndex ? (playing ? styles.segNow : styles.segDone) : ""}`}
              />
            ))}
          </div>
          <ol className={styles.timeline}>
            {tour.map((t, i) => (
              <li key={t.title}>
                <button
                  type="button"
                  aria-current={i === stepIndex ? "step" : undefined}
                  onClick={() => {
                    setPlaying(false);
                    goToStep(i);
                  }}
                  className={`${styles.stop} ${i === stepIndex ? styles.stopOn : ""} ${i < stepIndex ? styles.stopDone : ""}`}
                >
                  <span>{i + 1}</span>
                  {t.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {mode === "classroom" && step && (
        <div className={styles.teacher} aria-label="Teacher controls">
          <div className={styles.teacherBar}>
            <button type="button" className={`rx-button rx-button-secondary ${styles.headerButton}`} disabled={stepIndex === 0} onClick={() => goToStep(stepIndex - 1)}>
              ← Previous
            </button>
            <span className={styles.progressText}>Stop {stepIndex + 1} of {tour.length}</span>
            <button type="button" className={`rx-button rx-button-primary ${styles.headerButton}`} disabled={stepIndex === tour.length - 1} onClick={() => goToStep(stepIndex + 1)}>
              Next →
            </button>
            <button type="button" className={`rx-button rx-button-secondary ${styles.headerButton}`} onClick={toggleFullscreen}>
              Full screen
            </button>
          </div>
          <ol className={styles.timeline}>
            {tour.map((t, i) => (
              <li key={t.title}>
                <button type="button" aria-current={i === stepIndex ? "step" : undefined} onClick={() => goToStep(i)} className={`${styles.stop} ${i === stepIndex ? styles.stopOn : ""}`}>
                  <span>{i + 1}</span>
                  {t.title}
                </button>
              </li>
            ))}
          </ol>
          <div className={styles.teacherGrid}>
            {step.ask && (
              <section className={styles.card}>
                <h3>Ask the class</h3>
                <p className={styles.askText}>{step.ask}</p>
                <button type="button" className={`rx-button rx-button-secondary ${styles.headerButton}`} onClick={() => toggleReveal(`step-${stepIndex}`)} aria-expanded={revealed.includes(`step-${stepIndex}`)}>
                  {revealed.includes(`step-${stepIndex}`) ? "Hide answer" : "Reveal answer"}
                </button>
                {revealed.includes(`step-${stepIndex}`) && <p className={styles.answer}>{step.answer}</p>}
              </section>
            )}
            {classQuestions.length > 0 && (
              <section className={styles.card}>
                <h3>Class quiz</h3>
                <ol className={styles.classQuiz}>
                  {classQuestions.map((q) => (
                    <li key={q.id}>
                      <p className={styles.questionText}>{q.question}</p>
                      <ul className={styles.optionList}>
                        {q.options?.map((o) => (
                          <li key={o.id} className={revealed.includes(q.id) && o.id === q.correctAnswer ? styles.optionRight : ""}>
                            {o.text}
                          </li>
                        ))}
                      </ul>
                      <button type="button" className={`rx-button rx-button-secondary ${styles.headerButton}`} onClick={() => toggleReveal(q.id)} aria-expanded={revealed.includes(q.id)}>
                        {revealed.includes(q.id) ? "Hide answer" : "Reveal answer"}
                      </button>
                      {revealed.includes(q.id) && <p className={styles.answer}>{q.explanation}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      )}

      {mode === "interactive" && !spec.Dashboard && (
        <div className={styles.shellScope}>
        <LabTabs
          prefix="sim"
          active="quiz"
          onChange={() => undefined}
          tabs={[
            {
              id: "quiz",
              label: "Tasks and quiz",
              badge: `${doneCount}/${tasks.length}`,
              content: (
                <TasksQuiz
                  experience={experience}
                  tasks={tasks}
                  completedTasks={completedTasks}
                  points={runtimeState.points}
                  requiredDone={requiredDone}
                  questions={questions}
                  runtimeState={runtimeState}
                  actions={actions}
                  onWatchTour={() => setMode("cinematic")}
                  checkKey={checkKey}
                />
              ),
            },
          ]}
        />
        </div>
      )}

      {mode === "interactive" && runtimeState.completed && (
        <div className={styles.complete} role="status">
          <div>
            <strong>Experiment complete</strong>
            <p>
              You scored {runtimeState.points} points
              {experience.achievements?.[0]
                ? ` and earned “${experience.achievements[0].title}”.`
                : "."}
            </p>
          </div>
          <CompletionActions
            onTryAgain={handleReset}
            buttonClassName={styles.headerButton}
          />
        </div>
      )}
    </section>
  );
}
