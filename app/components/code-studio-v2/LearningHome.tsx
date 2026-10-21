"use client";

import { useState } from "react";
import Link from "next/link";
import ChoiceExercise from "./ChoiceExercise";

import type { CurriculumActivity } from "@/lib/code-studio-v2/curriculum";
import { isBuildRequired } from "@/lib/code-studio-v2/lesson-gates";
import { canAdvanceLessonStep } from "@/lib/code-studio-v2/lesson-progress";
import { canAttemptExercise, scoreOrderingAttempt } from "@/lib/code-studio-v2/exercise-types";
import { getLessonSpec, isReviewedInteractiveLesson } from "@/lib/code-studio-v2/lesson-specs";
import styles from "./LearningHome.module.css";

type Stage = "home" | "lesson";

const STEPS = [
  { key: "think", label: "Think", icon: "💡", title: "Think about the steps" },
  { key: "move", label: "Move", icon: "🤸", title: "Move like a robot" },
  { key: "code", label: "Code", icon: "🧩", title: "Put the picture steps in order" },
  { key: "build", label: "Build", icon: "🛠️", title: "Build it and try it" },
  { key: "create", label: "Create", icon: "🎨", title: "Create your own sequence" },
  { key: "check", label: "Show what you know", icon: "⭐", title: "Show what you know" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function activityText(activity: CurriculumActivity, key: StepKey): string {
  const reviewedInstruction = getLessonSpec(activity.id)?.steps[key]?.instruction;
  if (reviewedInstruction) return reviewedInstruction;
  switch (key) {
    case "think": return activity.think;
    case "move": return activity.move;
    case "code": return activity.code;
    case "build": return activity.build;
    case "create": return activity.create;
    case "check": return activity.weeklyCheck;
  }
}

export default function LearningHome({ activities }: { activities: readonly CurriculumActivity[] }) {
  const [selectedActivityId, setSelectedActivityId] = useState(activities.find((item) => isReviewedInteractiveLesson(item.id))?.id ?? activities[0]?.id ?? "");
  const activity = activities.find((item) => item.id === selectedActivityId) ?? activities[0];
  const [stage, setStage] = useState<Stage>("home");
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const step = STEPS[stepIndex];

  function startLesson(activityId?: string) {
    const requestedActivity = activityId
      ? activities.find((item) => item.id === activityId)
      : activity;
    if (!requestedActivity || !isReviewedInteractiveLesson(requestedActivity.id)) return;
    if (activityId) setSelectedActivityId(activityId);
    setStepIndex(0);
    setDone(false);
    setStage("lesson");
  }

  function nextStep() {
    if (stepIndex === STEPS.length - 1) {
      setDone(true);
      return;
    }
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function backStep() {
    if (done) {
      setDone(false);
      return;
    }
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand} aria-label="Rhinox Scientifica home">
            <span className={styles.brandMark}>R</span>
            <span>RHINOX <small>CODE STUDIO</small></span>
          </Link>
          <div className={styles.topActions}>
            <span className={styles.previewPill}>V2 learning preview</span>
            <Link className={styles.exitLink} href="/coding-robotics/code-studio/workspace">Beginner Workspace ↗</Link>
            <Link className={styles.exitLink} href="/coding-robotics/code-studio">Python Studio ↗</Link>
          </div>
        </header>

        {!activity ? (
          <section className={styles.emptyState}>
            <span className={styles.emptyIcon}>🧭</span>
            <h1>Your learning path is being prepared</h1>
            <p>No verified lessons are available in this build yet. We will show activities here after their curriculum records have been imported and validated.</p>
          </section>
        ) : stage === "home" ? (
          <>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>THINK · MOVE · CODE · CREATE</span>
                <h1>Big ideas start with <span>one small step.</span></h1>
                <p className={styles.heroText}>Learn by trying things, seeing what happens, and making something of your own. RhinoBot will guide you along the way.</p>
                <div className={styles.heroActions}>
                  <button className={styles.primaryButton} onClick={() => startLesson()}>Start my lesson <span aria-hidden="true">→</span></button>
                  <span className={styles.timeNote}><span className={styles.dot} /> First activity · about 10 minutes</span>
                </div>
              </div>
              <div className={styles.heroArt} aria-label="Learning steps: think, move, code, create" role="img">
                <div className={styles.orbit} />
                <div className={styles.robotCard}>
                  <div className={styles.robotFace}><span /><span /></div>
                  <div className={styles.robotSmile} />
                  <strong>RhinoBot</strong>
                  <small>Your learning guide</small>
                </div>
                <span className={styles.floatTag + " " + styles.tagThink}>💡 Think</span>
                <span className={styles.floatTag + " " + styles.tagMove}>👣 Move</span>
                <span className={styles.floatTag + " " + styles.tagCode}>🧩 Code</span>
                <span className={styles.floatTag + " " + styles.tagCreate}>✨ Create</span>
              </div>
            </section>

            <section className={styles.pathway}>
              <div className={styles.sectionHeading}>
                <div><span className={styles.eyebrow}>YOUR LEARNING PATH</span><h2>Your next adventure</h2></div>
                <span className={styles.versionTag}>Master Curriculum v3.15</span>
              </div>
              <div className={styles.lessonList}>
                {activities.map((item) => (
                  <article className={styles.lessonCard} key={item.id}>
                    <div className={styles.lessonIcon}>🧠</div>
                    <div className={styles.lessonInfo}>
                      <div className={styles.lessonMeta}><span>{item.level}</span><span>Term {item.term}</span><span>Week {item.week}</span><span className={styles.strand}>{item.strand === "CT" ? "Coding & Computational Thinking" : item.strand === "RB" ? "Robotics" : item.strand === "ED" ? "Engineering Design" : item.strand === "AI" ? "Artificial Intelligence" : "Integrated learning"}</span></div>
                      <h3>{item.theme}</h3>
                      <p>{item.focus}</p>
                      <div className={styles.lessonFooter}><span>✓ Curriculum linked</span><span>✓ RhinoBot guided</span><span>✓ Mastery target included</span></div>
                    </div>
                    <button className={styles.cardButton} onClick={() => startLesson(item.id)} disabled={!isReviewedInteractiveLesson(item.id)}>{isReviewedInteractiveLesson(item.id) ? "Start" : "In review"} <span aria-hidden="true">{isReviewedInteractiveLesson(item.id) ? "→" : "•"}</span></button>
                  </article>
                ))}
              </div>
              <p className={styles.scopeNote}><strong>Curriculum and exercise status:</strong> {activities.length} curriculum {activities.length === 1 ? "record is" : "records are"} available in this preview. Only activities with a reviewed, activity-specific interactive lesson can be launched. Records marked “In review” are not presented as completed learning experiences.</p>
            </section>

            <section className={styles.principles}>
              <div><span className={styles.principleIcon}>🧭</span><strong>Always know what to do</strong><p>One clear task at a time, with help when you need it.</p></div>
              <div><span className={styles.principleIcon}>🛠️</span><strong>Learn by making</strong><p>Try, test, fix and improve instead of only reading.</p></div>
              <div><span className={styles.principleIcon}>🌱</span><strong>Grow at your pace</strong><p>Build confidence before moving to the next challenge.</p></div>
            </section>
          </>
        ) : (
          <LessonView
            activity={activity}
            stepIndex={stepIndex}
            stepKey={step.key}
            stepTitle={step.title}
            stepIcon={step.icon}
            done={done}
            onBack={backStep}
            onNext={nextStep}
            onExit={() => setStage("home")}
            content={activityText(activity, step.key)}
          />
        )}

        <footer className={styles.footer}><span>Rhinox Scientifica</span><span>Innovative scientific solutions</span><span>Built around Think • Move • Code!</span></footer>
      </div>
    </main>
  );
}

function LessonView({
  activity, stepIndex, stepKey, stepTitle, stepIcon, done, onBack, onNext, onExit, content,
}: {
  activity: CurriculumActivity;
  stepIndex: number;
  stepKey: StepKey;
  stepTitle: string;
  stepIcon: string;
  done: boolean;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
  content: string;
}) {
  const lessonSpec = getLessonSpec(activity.id);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [orderingAttempts, setOrderingAttempts] = useState(0);
  const [orderingResult, setOrderingResult] = useState<"correct" | "incorrect" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [choicePassed, setChoicePassed] = useState(false);
  const [orderingPoints, setOrderingPoints] = useState(0);
  const [choicePoints, setChoicePoints] = useState(0);
  const [buildChoice, setBuildChoice] = useState("");
  const [buildCompleted, setBuildCompleted] = useState(false);
  const [movePracticed, setMovePracticed] = useState(false);
  const [creationCompleted, setCreationCompleted] = useState(false);
  const [learnerReflection, setLearnerReflection] = useState("");

  const orderingExercise = lessonSpec?.steps.code.exercise?.kind === "ordering"
    ? lessonSpec.steps.code.exercise
    : undefined;
  const choiceExercise = lessonSpec?.steps.check.exercise?.kind === "choice"
    ? lessonSpec.steps.check.exercise
    : undefined;
  const orderingPointsAvailable = orderingExercise?.pointsAvailable ?? 0;
  const choicePointsAvailable = choiceExercise?.pointsAvailable ?? 0;
  const totalPointsAvailable = orderingPointsAvailable + choicePointsAvailable;
  const pictures = orderingExercise?.items.map((item) => ({
    ...item,
    icon: item.id === "wake-up" ? "☀️" : item.id === "brush-teeth" ? "🪥" : item.id === "eat-breakfast" ? "🥣" : "🧩",
  })) ?? [];
  const chosen = new Set(selectedOrder);
  const attemptsExhausted = Boolean(orderingExercise && !canAttemptExercise(orderingAttempts, orderingExercise) && orderingResult !== "correct");
  function checkOrderingAnswer() {
    if (!orderingExercise || selectedOrder.length !== orderingExercise.items.length || !canAttemptExercise(orderingAttempts, orderingExercise)) return;
    const result = scoreOrderingAttempt(selectedOrder, orderingExercise);
    setOrderingAttempts((attempts) => attempts + 1);
    setOrderingPoints(result.points);
    setOrderingResult(result.correct ? "correct" : "incorrect");
  }
  function resetOrderingAnswer() {
    if (attemptsExhausted) return;
    setSelectedOrder([]);
    setOrderingResult(null);
  }
  const buildRequired = isBuildRequired(activity.coreParts);
  const canContinue = canAdvanceLessonStep(stepKey, {
    movePracticed,
    orderingCorrect: orderingResult === "correct",
    buildRequired,
    buildChoiceSelected: Boolean(buildChoice) && (!buildRequired || buildCompleted),
    creationCompleted,
    choicePassed,
  });

  return (
    <section className={styles.lessonView}>
      <div className={styles.lessonTop}>
        <button className={styles.backLink} onClick={onExit}>← Learning home</button>
        <span>{activity.level} · Term {activity.term} · Week {activity.week}</span>
      </div>
      <div className={styles.lessonProgress}>
        {STEPS.map((item, index) => <div key={item.key} className={styles.progressStep} data-active={index === stepIndex} data-done={index < stepIndex || done} aria-current={index === stepIndex ? "step" : undefined}><span>{index < stepIndex || done ? "✓" : index + 1}</span><small>{item.label}</small></div>)}
      </div>
      {done ? (
        <div className={styles.completion}>
          <div className={styles.completionIcon}>🏆</div>
          <span className={styles.eyebrow}>ACTIVITY COMPLETE</span>
          <h1>Great work. You completed the activity!</h1>
          <p>You practised following instructions, building a sequence and checking your work. These are foundations of computational thinking.</p>
          <p className={styles.coreNote}>Assessment: your picture sequence and final answer were checked automatically. Movement and drawing were marked by your own confirmation, not by a camera or teacher. Progress and points are kept only for this session.</p>
          <div className={styles.mastery}><strong>Assessment score</strong><span>{orderingPoints + choicePoints} of {totalPointsAvailable} points earned</span><span>Sequence exercise: {orderingPoints} of {orderingPointsAvailable} points</span><span>Knowledge check: {choicePoints} of {choicePointsAvailable} points</span></div>
          <div className={styles.mastery}><strong>What you practised</strong><span>✓ Following steps in order</span><span>✓ Giving clear instructions</span><span>✓ Creating a sequence</span></div>
          <p className={styles.masteryTarget}>{lessonSpec?.successCriteria.join(" ") ?? activity.masteryTarget}</p>
          <div className={styles.buildPanel}>
            <label htmlFor="lesson-reflection"><strong>RhinoBot asks: What did you learn?</strong></label>
            <p>You can write one thing you learned or leave a short note for yourself. This reflection is not graded or saved to an account.</p>
            <textarea id="lesson-reflection" value={learnerReflection} onChange={(event) => setLearnerReflection(event.target.value.slice(0, 500))} maxLength={500} rows={3} placeholder="I learned that instructions need to be in the right order..." />
            <small>{learnerReflection.length}/500 characters · stays in this session</small>
          </div>
          <button className={styles.primaryButton} onClick={onExit}>Back to my learning <span aria-hidden="true">→</span></button>
        </div>
      ) : (
        <div className={styles.lessonGrid}>
          <aside className={styles.lessonSidebar}>
            <div className={styles.rhinoAvatar}><span>🤖</span></div>
            <strong>RhinoBot says</strong>
            <p>“We can teach a computer by giving it clear steps. Let’s try it together!”</p>
            <div className={styles.sidebarRule} />
            <small>YOUR GOAL</small>
            <p>{lessonSpec?.objective ?? activity.masteryTarget}</p>
            <div className={styles.sidebarBadge}>Core activity</div>
          </aside>
          <article className={styles.lessonMain}>
            <div className={styles.lessonTitleRow}><span className={styles.bigStepIcon}>{stepIcon}</span><div><span className={styles.eyebrow}>STEP {stepIndex + 1} OF {STEPS.length}</span><h1>{stepTitle}</h1></div></div>
            <p className={styles.instruction}>{content}</p>
            {lessonSpec?.steps[stepKey] && <p className={styles.instruction}><strong>Your task:</strong> {lessonSpec.steps[stepKey].task}</p>}

            {stepKey === "code" && orderingExercise && (
              <div className={styles.sequenceBuilder}>
                <div className={styles.builderHeading}>
                  <div><strong>{orderingExercise.prompt}</strong><p>{orderingExercise.instructions}</p></div>
                  <button className={styles.resetButton} onClick={resetOrderingAnswer} disabled={attemptsExhausted || orderingResult === "correct"}>Reset</button>
                </div>
                <div className={styles.pictureChoices}>
                  {pictures.filter((picture) => !chosen.has(picture.id)).map((picture) => (
                    <button key={picture.id} className={styles.pictureChoice}
                      disabled={attemptsExhausted || orderingResult === "correct" || selectedOrder.length >= orderingExercise.items.length}
                      onClick={() => { setSelectedOrder((old) => [...old, picture.id]); setOrderingResult(null); }}>
                      <span aria-hidden="true">{picture.icon}</span><strong>{picture.label}</strong><small>Tap to add</small>
                    </button>
                  ))}
                </div>
                <div className={styles.sequenceSlots}>
                  {Array.from({ length: orderingExercise.items.length }, (_, index) => {
                    const item = pictures.find((picture) => picture.id === selectedOrder[index]);
                    return <div key={index} className={styles.sequenceSlot}><small>STEP {index + 1}</small>{item
                      ? <button disabled={attemptsExhausted || orderingResult === "correct"} onClick={() => { setSelectedOrder((old) => old.filter((id) => id !== item.id)); setOrderingResult(null); }} aria-label={`Remove ${item.label} from step ${index + 1}`}><span aria-hidden="true">{item.icon}</span><strong>{item.label}</strong><span>Remove</span></button>
                      : <span className={styles.emptySlot}>Choose a picture</span>}</div>;
                  })}
                </div>
                <div className={styles.orderingActions}>
                  <span>Attempts: {orderingAttempts} of {orderingExercise.maxAttempts}</span>
                  <button className={styles.primaryButton} onClick={checkOrderingAnswer} disabled={selectedOrder.length !== orderingExercise.items.length || attemptsExhausted || orderingResult !== null}>Check my order</button>
                </div>
                {orderingResult && <div role="status" aria-live="polite" className={orderingResult === "correct" ? styles.feedbackSuccess : styles.feedbackTry}>
                  <strong>{orderingResult === "correct" ? "Well done! 🎉" : attemptsExhausted ? "Let’s learn from this try." : "Good try. You can try again."}</strong>
                  <p>{orderingResult === "correct" ? `You earned ${orderingExercise.scoring.correctPoints} point. You put the morning steps in the right order.` : attemptsExhausted ? orderingExercise.fallback : orderingExercise.hint}</p>
                  {attemptsExhausted && <p>Ask a teacher or caregiver to help you arrange the picture cards.</p>}
                </div>}
                {attemptsExhausted && <p className={styles.coreNote}>You have used all your tries. You can still review the correct order with a teacher or caregiver.</p>}
              </div>
            )}

            {stepKey === "check" && choiceExercise && (
              <ChoiceExercise exercise={choiceExercise} onCorrect={(points) => { setChoicePassed(true); setChoicePoints(points); }} />
            )}

            {stepKey === "think" && <div className={styles.exampleStrip}><span>☀️</span><span>Wake up</span><b>→</b><span>🪥</span><span>Brush teeth</span><b>→</b><span>🥣</span><span>Eat breakfast</span></div>}
            {stepKey === "move" && <div className={styles.moveChallenge}><span>👏</span><b>Clap</b><span>→</span><span>👣</span><b>Stamp</b><span>→</span><span>🔄</span><b>Turn</b><p>Ask a grown-up or classmate to call the steps. Follow them in order, then swap and make a new order.</p><button className={styles.secondaryButton} type="button" onClick={() => setMovePracticed(true)} aria-pressed={movePracticed}>{movePracticed ? "✓ I tried the movement challenge" : "I tried the movement challenge"}</button></div>}
            {stepKey === "build" && (
              <div className={styles.buildPanel}>
                <div className={styles.buildPanelHeading}><span>🛠️</span><div><strong>Make your idea real</strong><p>{activity.practicalActivity}</p></div></div>
                <p className={styles.buildMaterialsTitle}>{buildRequired ? "Choose what you will use:" : "Optional extension: choose materials if you want to build a model."}</p>
                <div className={styles.buildChoices}>
                  {["Paper or picture cards", "Blocks or classroom objects", "Drawings in a notebook"].map((choice) => (
                    <button key={choice} className={buildChoice === choice ? styles.buildChoiceSelected : ""} onClick={() => { setBuildChoice(choice); setBuildCompleted(false); }} aria-pressed={buildChoice === choice}>{choice}</button>
                  ))}
                </div>
                <p className={styles.buildPlatform}><strong>Suggested platform:</strong> {activity.platform}</p>
                {!buildRequired && <p className={styles.buildFallback}>This week’s core parts are {activity.coreParts}. Building is optional, so you can continue without choosing materials.</p>}
                {buildChoice && <p className={styles.buildReady}>Good choice. Use {buildChoice.toLowerCase()} to represent each step, then test whether the steps are in the correct order.</p>}
                {buildRequired && buildChoice && <div className={styles.buildReady}><p>When you have made and tested your model, confirm that you completed it. This is your confirmation, not an automatic check.</p><button className={styles.secondaryButton} type="button" onClick={() => setBuildCompleted((value) => !value)} aria-pressed={buildCompleted}>{buildCompleted ? "✓ I built and tested my model" : "I built and tested my model"}</button></div>}
                <p className={styles.buildFallback}><strong>If you do not have these materials:</strong> {activity.fallback}</p>
              </div>
            )}

            {stepKey === "create" && <div className={styles.createPrompt}><span>🎨</span><div><strong>Your turn to create</strong><p>Draw three things you do every day. Number them 1, 2 and 3 to show the order.</p><small>Core task: complete the three-step drawing. Stretch: add a fourth step.</small><p><button className={styles.secondaryButton} type="button" onClick={() => setCreationCompleted((value) => !value)} aria-pressed={creationCompleted}>{creationCompleted ? "✓ I completed my three-step drawing" : "I completed my three-step drawing"}</button></p></div></div>}

            {stepKey !== "check" && <button className={styles.hintButton} onClick={() => setShowHint((shown) => !shown)}>{showHint ? "Hide hint" : "Need a hint?"}</button>}
            {showHint && <div className={styles.hintBox}><strong>RhinoBot’s hint</strong><p>{lessonSpec?.steps[stepKey].hint ?? "Choose one small step and try again."}</p></div>}

            <div className={styles.lessonControls}>
              <button className={styles.secondaryButton} onClick={onBack} disabled={stepIndex === 0}>← Back</button>
              <span>{stepIndex + 1} / {STEPS.length}</span>
              <button className={styles.primaryButton} onClick={onNext} disabled={!canContinue}>{stepIndex === STEPS.length - 1 ? "Finish activity" : stepKey === "build" && !buildRequired ? "Skip optional build →" : "Next step →"}</button>
            </div>
            {!canContinue && <p className={styles.coreNote}>Complete this step’s task before moving on. Your progress is only for this session and is not saved to an account yet.</p>}
            <p className={styles.coreNote}>Core: {activity.coreParts} · Optional Stretch: {activity.stretch}</p>
          </article>
        </div>
      )}
    </section>
  );
}
