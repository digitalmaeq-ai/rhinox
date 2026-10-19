"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toolboxFor } from "@/lib/rhinobot/blocks";
import { CHALLENGE_SIZES, efficiencyPercent, makeChallenge, type ChallengeSize } from "@/lib/rhinobot/generator";
import { execute, initialState } from "@/lib/rhinobot/interpreter";
import { MISSIONS, PLAYGROUND, evaluateMission, isScoredMission, parMissionBlocks, worldFor, type Mission } from "@/lib/rhinobot/missions";
import { EMPTY_PROGRESS, clearProgress, loadProgress, saveProgress, type ChallengeStats } from "@/lib/rhinobot/progress";
import { emptyWorkspaceJson, programToWorkspaceJson, readWorkspace, type WorkspaceJson } from "@/lib/rhinobot/program";
import {
  BADGES, EMPTY_RECORD, SCORE_AREAS, accuracyPoints, efficiencyPoints, feedbackFor, predictionPoints, totalPoints, type MissionRecord,
} from "@/lib/rhinobot/scoring";
import { deleteSaved, loadSaved, saveProgramme, type SavedProgramme } from "@/lib/rhinobot/storage";
import type { Cell, RobotState, RunEvent, Stmt } from "@/lib/rhinobot/types";
import { areRequiredTasksComplete } from "@/lib/interactive-runtime-state";
import type { InteractiveRuntimeRendererProps } from "@/types/interactive-runtime-renderer";

import CompletionActions, { ActivityHeaderButtons } from "@/app/components/interactive/shared/CompletionActions";
import { playChargerSound, readChargerMuted, setChargerMuted } from "@/app/components/interactive/shared/chargerSounds";

import BlocklyWorkspace, { type WorkspaceApi } from "./BlocklyWorkspace";
import RhinoBoard from "./RhinoBoard";
import styles from "./RhinoBotLab.module.css";

// RhinoBot: Robot Programming Lab. Block coding with Google Blockly, a safe
// interpreter (lib/rhinobot/interpreter.ts) and a 2D simulation. The runtime
// only remembers which "mission-N" tasks are complete; scores, badges and saved
// programmes live in this component (saved programmes in localStorage).

type Status = "idle" | "running" | "paused" | "finished";
type Speed = "slow" | "normal" | "fast";
const DELAY: Record<Speed, number> = { slow: 800, normal: 450, fast: 150 };

interface HistoryItem {
  n: number;
  mission: string;
  blocks: number;
  moves: number;
  outcome: string;
  good: boolean;
}

interface Outcome {
  kind: "success" | "partial" | "error";
  title: string;
  detail: string;
}

function stripIds(program: Stmt[]) {
  return JSON.stringify(program, (key, value) => (key === "id" ? undefined : value));
}

function usesRepeat(program: Stmt[]): boolean {
  return program.some((stmt) => stmt.t === "repeat" || (stmt.t === "until" && usesRepeat(stmt.body)) || (stmt.t === "if" && (usesRepeat(stmt.then) || usesRepeat(stmt.else ?? []))));
}

function Confetti() {
  const colours = ["#0f6fde", "#f5b400", "#1f9d55", "#df4f93", "#ef4444", "#f08a24"];
  return (
    <div className={styles.confetti} aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} style={{ left: `${(i * 37) % 100}%`, background: colours[i % colours.length], animationDelay: `${(i % 8) * 0.07}s`, animationDuration: `${1.1 + (i % 5) * 0.18}s` }} />
      ))}
    </div>
  );
}

export default function RhinoBotLab({ experience, runtimeState, actions }: InteractiveRuntimeRendererProps) {
  const tasks = experience.tasks ?? [];

  const [challengeStats, setChallengeStats] = useState<ChallengeStats>(EMPTY_PROGRESS.challenge);
  const [challengeCfg, setChallengeCfg] = useState<{ seed: number; size: ChallengeSize }>({ seed: 1, size: "small" });
  const challenge = useMemo(() => makeChallenge(challengeCfg.seed, challengeCfg.size), [challengeCfg]);
  const ALL: Mission[] = useMemo(() => [...MISSIONS, PLAYGROUND, challenge.mission], [challenge]);

  const [missionIndex, setMissionIndex] = useState(0);
  const mission = ALL[Math.min(missionIndex, ALL.length - 1)];
  const isPlayground = mission.id === PLAYGROUND.id;
  const isChallenge = mission.id.startsWith("challenge-");
  const scored = isScoredMission(mission);
  const world = useMemo(() => worldFor(mission), [mission]);
  const par = scored ? parMissionBlocks(mission) : 0;

  const [records, setRecords] = useState<Record<string, MissionRecord>>({});
  const record = records[mission.id] ?? EMPTY_RECORD;
  const [badges, setBadges] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [robot, setRobot] = useState<RobotState>(() => initialState(worldFor(MISSIONS[0])));
  const [bump, setBump] = useState<Cell | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [liveObjectives, setLiveObjectives] = useState<{ id: string; label: string; done: boolean }[]>([]);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [tick, setTick] = useState(0);
  const [blockInfo, setBlockInfo] = useState({ blockCount: 0, detached: 0 });
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hintLevel, setHintLevel] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState<Record<string, { wrong: number[]; right: boolean }>>({});
  const [debugActive, setDebugActive] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<SavedProgramme[]>([]);
  const [saveName, setSaveName] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [ready, setReady] = useState(false);
  const [justWon, setJustWon] = useState<string | null>(null);

  const api = useRef<WorkspaceApi | null>(null);
  const stash = useRef<Record<string, WorkspaceJson>>({});
  const debugBaseline = useRef<Record<string, string>>({});
  const run = useRef<{ events: RunEvent[]; cursor: number; program: Stmt[]; blocks: number; missionId: string } | null>(null);
  const runCount = useRef(0);
  const currentMission = useRef(mission);
  const speedRef = useRef(speed);
  const latest = useRef({ records, badges, challengeStats });
  const saveTimer = useRef<number | undefined>(undefined);
  const restored = useRef(false);

  useEffect(() => {
    currentMission.current = mission;
    speedRef.current = speed;
    latest.current = { records, badges, challengeStats };
  });

  const persist = useCallback(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (!restored.current) return;
      const keep: Record<string, WorkspaceJson> = {};
      for (const [id, json] of Object.entries(stash.current)) {
        if (!id.startsWith("challenge-") && !id.endsWith("-mine")) keep[id] = json;
      }
      saveProgress({ version: 1, records: latest.current.records, badges: latest.current.badges, challenge: latest.current.challengeStats, workspaces: keep });
    }, 400);
  }, []);

  const allRequiredComplete = areRequiredTasksComplete(experience, runtimeState);
  const missionDone = (m: Mission) => runtimeState.completedTasks.includes(`mission-${m.number}`);
  const running = status === "running" || status === "paused";

  useEffect(() => {
    if (allRequiredComplete && !runtimeState.completed) actions.completeExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredComplete, runtimeState.completed]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSaved(loadSaved());
    const off = readChargerMuted();
    setChargerMuted(off);
    if (off) setSoundOn(false);

    const progress = loadProgress();
    setRecords(progress.records);
    setBadges(progress.badges);
    setChallengeStats(progress.challenge);
    setChallengeCfg({ seed: progress.challenge.seed, size: progress.challenge.size });
    stash.current = { ...progress.workspaces };
    for (const item of MISSIONS) {
      if (progress.records[item.id]?.completed) {
        const id = `mission-${item.number}`;
        if (!runtimeState.completedTasks.includes(id)) {
          actions.completeTask(id, tasks.find((task) => task.id === id)?.points ?? 0);
        }
      }
    }
    // Opened from My Projects (?project=...): load that programme in the playground.
    const wanted = new URLSearchParams(window.location.search).get("project");
    const project = wanted ? loadSaved().find((entry) => entry.id === wanted) : undefined;
    if (project) {
      stash.current[PLAYGROUND.id] = project.workspace;
      currentMission.current = PLAYGROUND;
      setMissionIndex(MISSIONS.length);
      resetSimulation(PLAYGROUND);
      if (api.current) {
        api.current.setToolbox(toolboxFor(PLAYGROUND.blocks));
        api.current.load(project.workspace);
      }
    } else if (api.current && progress.workspaces[MISSIONS[0].id]) {
      // The workspace may already be waiting: show the saved blocks for mission 1.
      api.current.load(progress.workspaces[MISSIONS[0].id]);
    }
    restored.current = true;
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    persist();
  }, [records, badges, challengeStats, persist]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const award = useCallback((id: string) => {
    setBadges((current) => {
      if (current.includes(id)) return current;
      const badge = BADGES.find((item) => item.id === id);
      if (badge) setToast(`Badge earned: ${badge.title}`);
      return [...current, id];
    });
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setChargerMuted(!next);
    if (next) playChargerSound("pick");
  }

  // ----- workspace plumbing -----
  const handleReady = useCallback((workspaceApi: WorkspaceApi) => {
    api.current = workspaceApi;
    workspaceApi.setToolbox(toolboxFor(currentMission.current.blocks));
    workspaceApi.load(stash.current[currentMission.current.id] ?? emptyWorkspaceJson());
    setReady(true);
  }, []);

  const handleChange = useCallback((json: WorkspaceJson) => {
    const read = readWorkspace(json);
    setBlockInfo({ blockCount: read.blockCount, detached: read.detached });
    stash.current[currentMission.current.id] = json;
    persist();
    setOutcome((current) => (run.current ? current : null));
    setNotice(null);
  }, [persist]);

  const resetSimulation = useCallback((target: Mission) => {
    run.current = null;
    setStatus("idle");
    setTick(0);
    setBump(null);
    setLiveObjectives([]);
    setRobot(initialState(worldFor(target)));
    api.current?.highlight(null);
  }, []);

  function newChallenge(size: ChallengeSize) {
    if (running) return;
    const seed = 1 + Math.floor(Math.random() * 9998);
    const next = makeChallenge(seed, size);
    if (api.current) stash.current[mission.id] = api.current.getJson();
    setChallengeCfg({ seed, size });
    setChallengeStats((stats) => ({ ...stats, seed, size }));
    resetSimulation(next.mission);
    setOutcome(null);
    setJustWon(null);
    setMissionIndex(MISSIONS.length + 1);
    currentMission.current = next.mission;
    if (api.current) {
      api.current.setToolbox(toolboxFor(next.mission.blocks));
      api.current.load(stash.current[next.mission.id] ?? emptyWorkspaceJson());
    }
    playChargerSound("pick");
  }

  function switchMission(index: number) {
    if (index === missionIndex) return;
    const target = ALL[index];
    if (api.current) stash.current[mission.id] = api.current.getJson();
    resetSimulation(target);
    setOutcome(null);
    setJustWon(null);
    setMissionIndex(index);
    currentMission.current = target;
    if (api.current) {
      api.current.setToolbox(toolboxFor(target.blocks));
      api.current.load(stash.current[target.id] ?? emptyWorkspaceJson());
    }
  }

  // ----- running a programme -----
  function compile(): { events: RunEvent[]; program: Stmt[]; blocks: number } | null {
    if (!api.current) return null;
    const read = readWorkspace(api.current.getJson());
    if (!read.hasStart) {
      setNotice("Add the “when programme starts” block from the Events category.");
      return null;
    }
    if (read.program.length === 0) {
      setNotice("Snap some blocks under “when programme starts” first.");
      playChargerSound("hint");
      return null;
    }
    let events = [...execute(world, read.program)];
    const last = events[events.length - 1];
    if (last.type === "error" && (last.code === "too-long" || last.code === "too-many-moves")) {
      events = [...events.slice(0, 60), last];
    }
    return { events, program: read.program, blocks: read.blockCount };
  }

  function startRun(stepFirst: boolean) {
    if (!ready) return;
    const compiled = compile();
    if (!compiled) return;
    setOutcome(null);
    setJustWon(null);
    setBump(null);
    setRobot(initialState(world));
    setLiveObjectives([]);
    run.current = { ...compiled, cursor: 0, missionId: mission.id };
    playChargerSound("run");
    if (stepFirst) {
      setStatus("paused");
      window.setTimeout(() => applyNext(), 0);
    } else {
      setStatus("running");
      setTick((value) => value + 1);
    }
  }

  function applyNext() {
    const current = run.current;
    if (!current) return;
    const event = current.events[current.cursor];
    if (!event) return;
    current.cursor += 1;
    setRobot(event.state);
    if (event.type === "step") {
      api.current?.highlight(event.id ?? null);
      const sounds = { forward: "move", left: "pick", right: "pick", wait: "pick", pickup: "bolt", drop: "add", activate: "charge" } as const;
      if (event.action !== "flow") playChargerSound(sounds[event.action]);
    } else {
      api.current?.highlight(event.type === "error" ? event.id ?? null : null);
      finishRun(event);
    }
  }

  function finishRun(event: Extract<RunEvent, { type: "end" | "error" }>) {
    const current = run.current;
    if (!current) return;
    const target = ALL.find((item) => item.id === current.missionId) ?? mission;
    const targetWorld = worldFor(target);
    runCount.current += 1;
    setStatus("finished");
    if (event.type === "error" && event.bump) setBump(event.bump);

    const playground = !isScoredMission(target);
    const isChallengeRun = target.id.startsWith("challenge-");
    const evaluation = evaluateMission(target, targetWorld, event.state);
    const ended = event.type === "end";
    const success = ended && evaluation.success;
    setLiveObjectives(evaluation.objectives);

    let outcomeText: Outcome;
    if (event.type === "error") {
      playChargerSound(event.code === "bump" ? "bump" : "flat");
      outcomeText = { kind: "error", title: event.code === "bump" ? "Bump!" : "Programme stopped", detail: `${event.message} The block that caused it is highlighted.` };
    } else if (isChallengeRun && success) {
      const efficiency = efficiencyPercent(challenge.optimalMoves, event.state.moves);
      outcomeText = {
        kind: "success",
        title: "Challenge complete!",
        detail: `Route efficiency ${efficiency}%: ${event.state.moves} moves against a best of ${challenge.optimalMoves}.${efficiency < 100 ? " Can you find a shorter route?" : " A perfect route!"}`,
      };
    } else if (playground && !isChallengeRun) {
      outcomeText = { kind: "success", title: "Programme finished", detail: "RhinoBot completed every block. Change it and try again!" };
    } else if (!success && ended && !evaluation.success && isChallengeRun) {
      const missing = evaluation.objectives.filter((objective) => !objective.done).map((objective) => objective.label.toLowerCase());
      playChargerSound("hint");
      outcomeText = { kind: "partial", title: "Not there yet", detail: `The programme finished, but RhinoBot has not managed to: ${missing.join(", ")}.` };
    } else if (success) {
      outcomeText = { kind: "success", title: "Mission complete!", detail: target.successMessage };
    } else {
      const missing = evaluation.objectives.filter((objective) => !objective.done).map((objective) => objective.label.toLowerCase());
      playChargerSound("hint");
      outcomeText = { kind: "partial", title: "Not there yet", detail: `The programme finished, but RhinoBot has not managed to: ${missing.join(", ")}. Check your blocks and try again.` };
    }
    setOutcome(outcomeText);

    setHistory((list) => [
      { n: runCount.current, mission: isChallengeRun ? "Challenge" : playground ? "Playground" : `Mission ${target.number}`, blocks: current.blocks, moves: event.state.moves, outcome: outcomeText.title, good: outcomeText.kind === "success" },
      ...list,
    ].slice(0, 8));

    if (isChallengeRun) {
      if (success) {
        const efficiency = efficiencyPercent(challenge.optimalMoves, event.state.moves);
        const already = challengeStats.ids.includes(target.id);
        const ids = already ? challengeStats.ids : [...challengeStats.ids, target.id];
        setChallengeStats({ ...challengeStats, ids, completed: ids.length, bestEfficiency: Math.max(challengeStats.bestEfficiency, efficiency) });
        setJustWon(target.id);
        playChargerSound("level");
        if (efficiency >= 90) award("pathfinder");
        if (ids.length >= 3) award("challenger");
      }
      return;
    }
    if (playground) return;

    const before = records[target.id] ?? EMPTY_RECORD;
    const next: MissionRecord = { ...before, attempts: before.attempts + 1 };
    next.accuracy = Math.max(before.accuracy, success ? 30 : accuracyPoints(evaluation.objectives.filter((o) => o.done).length, evaluation.objectives.length));
    if (!success) {
      next.failedRuns = before.failedRuns + 1;
    } else {
      const wasDone = missionDone(target);
      next.completed = true;
      next.completion = 10;
      next.bestBlocks = before.bestBlocks === null ? current.blocks : Math.min(before.bestBlocks, current.blocks);
      next.efficiency = Math.max(before.efficiency, efficiencyPoints(current.blocks, parMissionBlocks(target)));
      if (before.failedRuns > 0) next.recovered = true;
      if (debugActive[target.id] && stripIds(current.program) !== debugBaseline.current[target.id]) next.debugSolved = true;
      next.debugging = (next.recovered ? 10 : 0) + (next.debugSolved ? 10 : 0);
      if (current.blocks <= parMissionBlocks(target)) next.advancedDone = true;

      setJustWon(target.id);
      const total = totalPoints(next);
      if (!wasDone) {
        const task = tasks.find((item) => item.id === `mission-${target.number}`);
        actions.completeTask(`mission-${target.number}`, task?.points ?? 0);
      }
      const lastOne = MISSIONS.every((item) => item.id === target.id || missionDone(item));
      playChargerSound(lastOne && !wasDone ? "win" : "level");
      const byNumber: Record<number, string> = { 1: "first-programme", 3: "decision-maker", 4: "sensor-specialist", 5: "master-programmer" };
      if (byNumber[target.number]) award(byNumber[target.number]);
      if (target.number === 2 && usesRepeat(current.program)) award("loop-master");
      if (next.debugSolved) award("bug-hunter");
      if (next.advancedDone) award("efficiency-expert");
      if (total >= 100) award("perfect-score");
    }
    setRecords((all) => ({ ...all, [target.id]: next }));
  }

  // Animation clock: one event per tick while running.
  useEffect(() => {
    if (status !== "running") return;
    const current = run.current;
    if (!current) return;
    const upcoming = current.events[current.cursor];
    if (!upcoming) return;
    const isFlow = upcoming.type === "step" && upcoming.action === "flow";
    const timer = window.setTimeout(() => {
      applyNext();
      setTick((value) => value + 1);
    }, current.cursor === 0 ? 250 : isFlow ? DELAY[speedRef.current] * 0.4 : DELAY[speedRef.current]);
    return () => window.clearTimeout(timer);
    // applyNext reads only refs and stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, tick]);

  function pauseOrResume() {
    if (status === "running") setStatus("paused");
    else if (status === "paused") {
      setStatus("running");
      setTick((value) => value + 1);
    }
  }

  function stepOnce() {
    if (status === "idle" || status === "finished") {
      startRun(true);
    } else if (status === "running") {
      setStatus("paused");
    } else {
      applyNext();
    }
  }

  function stop() {
    resetSimulation(mission);
    setOutcome(null);
    playChargerSound("remove");
  }

  // ----- learning supports -----
  function answerPrediction(option: number) {
    const state = prediction[mission.id] ?? { wrong: [], right: false };
    if (state.right || state.wrong.includes(option)) return;
    if (option === mission.prediction.answer) {
      const tries = state.wrong.length + 1;
      setPrediction({ ...prediction, [mission.id]: { ...state, right: true } });
      setRecords((all) => {
        const before = all[mission.id] ?? EMPTY_RECORD;
        return { ...all, [mission.id]: { ...before, predictionTries: tries, thinking: predictionPoints(tries) } };
      });
      if (tries === 1) award("fortune-teller");
      playChargerSound("charge");
    } else {
      setPrediction({ ...prediction, [mission.id]: { ...state, wrong: [...state.wrong, option] } });
      playChargerSound("bump");
    }
  }

  function showHint() {
    const level = Math.min((hintLevel[mission.id] ?? 0) + 1, mission.hints.length);
    setHintLevel({ ...hintLevel, [mission.id]: level });
    setRecords((all) => {
      const before = all[mission.id] ?? EMPTY_RECORD;
      return { ...all, [mission.id]: { ...before, hintsUsed: Math.max(before.hintsUsed, level) } };
    });
    playChargerSound("hint");
  }

  function loadDebugChallenge() {
    if (!api.current || running) return;
    stash.current[`${mission.id}-mine`] = api.current.getJson();
    const buggy = programToWorkspaceJson(mission.debug.buggy);
    debugBaseline.current[mission.id] = stripIds(mission.debug.buggy);
    setDebugActive({ ...debugActive, [mission.id]: true });
    resetSimulation(mission);
    setOutcome(null);
    api.current.load(buggy);
    playChargerSound("hint");
  }

  function restoreMine() {
    if (!api.current || running) return;
    setDebugActive({ ...debugActive, [mission.id]: false });
    api.current.load(stash.current[`${mission.id}-mine`] ?? emptyWorkspaceJson());
  }

  function clearBlocks() {
    if (!api.current || running) return;
    resetSimulation(mission);
    setOutcome(null);
    api.current.load(emptyWorkspaceJson());
    playChargerSound("remove");
  }

  function saveCurrent() {
    if (!api.current) return;
    setSaved(saveProgramme(saveName || `Programme ${saved.length + 1}`, api.current.getJson()));
    setSaveName("");
    award("explorer");
    playChargerSound("add");
  }

  function loadSavedProgramme(item: SavedProgramme) {
    if (!api.current || running) return;
    resetSimulation(mission);
    setOutcome(null);
    api.current.load(item.workspace);
    playChargerSound("pick");
  }

  function handleReset() {
    actions.resetExperience();
    resetSimulation(MISSIONS[0]);
    stash.current = {};
    setRecords({});
    setBadges([]);
    setHistory([]);
    setHintLevel({});
    setPrediction({});
    setDebugActive({});
    setOutcome(null);
    setJustWon(null);
    setMissionIndex(0);
    clearProgress();
    setChallengeStats((stats) => ({ ...EMPTY_PROGRESS.challenge, seed: stats.seed, size: stats.size }));
    currentMission.current = MISSIONS[0];
    if (api.current) {
      api.current.setToolbox(toolboxFor(MISSIONS[0].blocks));
      api.current.load(emptyWorkspaceJson());
    }
  }

  const toolboxKey = mission.id;
  const stateForBoard = status === "idle" ? initialState(world) : robot;
  const totals = MISSIONS.map((item) => totalPoints(records[item.id] ?? EMPTY_RECORD));
  const overall = Math.round(totals.reduce((sum, value) => sum + value, 0) / MISSIONS.length);
  const preds = prediction[mission.id] ?? { wrong: [], right: false };
  const hints = hintLevel[mission.id] ?? 0;
  const objectiveRows = mission.objectives.map((id) => {
    const live = liveObjectives.find((item) => item.id === id);
    return { id, label: evaluateMission(mission, world, initialState(world)).objectives.find((item) => item.id === id)?.label ?? id, done: Boolean(live?.done) };
  });
  const nextMission = missionIndex + 1 < MISSIONS.length ? missionIndex + 1 : null;

  return (
    <div className={styles.root} data-toolbox={toolboxKey}>
      <div className={styles.board}>
        {/* ---------- Header ---------- */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>RhinoBot · Robot Programming Lab</p>
            <h2 className={styles.title}>{scored ? `Mission ${mission.number}: ${mission.title}` : mission.title}</h2>
          </div>
          <div className={styles.headerAside}>
            <span className={styles.score} title="Average of your five mission scores">Overall score <strong>{overall}</strong> / 100</span>
            <ActivityHeaderButtons onReset={handleReset} resetDisabled={running} buttonClassName={styles.resetButton} />
          </div>
        </div>

        <nav className={styles.missions} aria-label="Missions">
          {ALL.map((item, index) => {
            const done = item.number > 0 && missionDone(item);
            return (
              <button
                key={item.id}
                type="button"
                disabled={running && index !== missionIndex}
                onClick={() => switchMission(index)}
                aria-current={index === missionIndex ? "step" : undefined}
                title={item.title}
                className={`${styles.pill} ${index === missionIndex ? styles.pillActive : ""} ${done ? styles.pillDone : ""}`}
              >
                <span>{item.number > 0 ? item.number : item.id === PLAYGROUND.id ? "∞" : "🎲"}</span>
                <em>{item.number > 0 ? item.title : item.id === PLAYGROUND.id ? "Playground" : "Random challenge"}</em>
                {done && <b aria-label="complete">✓</b>}
              </button>
            );
          })}
          <span className={styles.spacer} />
          <button type="button" className={styles.smallButton} onClick={toggleSound} aria-pressed={soundOn}>
            {soundOn ? "🔊 Sound on" : "🔇 Sound off"}
          </button>
        </nav>

        {runtimeState.completed && (
          <div className={styles.complete} role="status">
            <Confetti />
            <div className={styles.completeText}>
              <h2 className={styles.completeTitle}>Master Programmer!</h2>
              <p className={styles.completeSummary}>
                You finished all five missions with an overall score of {overall} out of 100. Keep experimenting in the playground, or replay a mission to beat your score.
              </p>
            </div>
            <CompletionActions onTryAgain={handleReset} buttonClassName={styles.completeButton} />
          </div>
        )}

        {/* ---------- Briefing and prediction side by side ---------- */}
        <div className={`${styles.topRow} ${scored ? "" : styles.topRowSingle}`}>
        <section className={styles.briefing} aria-label="Mission briefing">
          <div className={styles.briefingMain}>
            <p className={styles.concept}>{mission.concept}</p>
            <p className={styles.briefText}>{mission.briefing}</p>
            {scored && <p className={styles.learn}><strong>Learning objective:</strong> {mission.learningObjective}</p>}
            {isChallenge && (
              <div className={styles.challengeBar}>
                <label>
                  Size
                  <select value={challengeCfg.size} onChange={(event) => newChallenge(event.target.value as ChallengeSize)} disabled={running}>
                    {(Object.keys(CHALLENGE_SIZES) as ChallengeSize[]).map((size) => (
                      <option key={size} value={size}>{CHALLENGE_SIZES[size].label}</option>
                    ))}
                  </select>
                </label>
                <button type="button" className={styles.smallButton} onClick={() => newChallenge(challengeCfg.size)} disabled={running || !ready}>🎲 New random challenge</button>
                <span className={styles.seed}>Challenge #{challengeCfg.seed}</span>
              </div>
            )}
          </div>
          {!isPlayground && (
            <ul className={styles.objectives} aria-label="Success conditions">
              {objectiveRows.map((row) => (
                <li key={row.id} className={row.done ? styles.objDone : ""}>
                  <span aria-hidden="true">{row.done ? "✓" : "○"}</span>
                  {row.label}
                </li>
              ))}
              {scored && (
                <li className={`${styles.objAdvanced} ${record.advancedDone ? styles.objDone : ""}`}>
                  <span aria-hidden="true">{record.advancedDone ? "★" : "☆"}</span>
                  Advanced: {mission.advanced} (best: {par} blocks)
                </li>
              )}
              {isChallenge && (
                <li className={styles.objAdvanced}>
                  <span aria-hidden="true">☆</span>
                  Best possible route: {challenge.optimalMoves} moves
                </li>
              )}
            </ul>
          )}
        </section>

        {scored && (
          <section className={styles.predict} aria-label="Prediction challenge">
            <p className={styles.predictQ}><strong>Predict first{preds.right ? "" : " (up to 15 points)"}:</strong> {mission.prediction.question}</p>
            <div className={styles.predictOptions} role="group" aria-label="Answers">
              {mission.prediction.options.map((option, index) => {
                const wrong = preds.wrong.includes(index);
                const right = preds.right && index === mission.prediction.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={preds.right || wrong}
                    onClick={() => answerPrediction(index)}
                    className={`${styles.option} ${wrong ? styles.optionWrong : ""} ${right ? styles.optionRight : ""}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {preds.right && <p className={styles.explain}>✓ {mission.prediction.explain}</p>}
            {!preds.right && preds.wrong.length > 0 && <p className={styles.explainWrong}>Not quite. Trace it step by step and try again.</p>}
          </section>
        )}
        </div>

        {/* ---------- Workspace + simulation ---------- */}
        <div className={styles.lab}>
          <div className={styles.editor}>
            <BlocklyWorkspace
              toolbox={toolboxFor(MISSIONS[0].blocks)}
              onReady={handleReady}
              onChange={handleChange}
              onNotice={setNotice}
              locked={running}
            />
            <div className={styles.editorBar}>
              <span>{blockInfo.blockCount} block{blockInfo.blockCount === 1 ? "" : "s"}</span>
              <ol className={styles.steps} aria-label="How it works">
                <li><b>1</b> Pick blocks</li>
                <li><b>2</b> Snap under “when programme starts”</li>
                <li><b>3</b> Run and watch</li>
              </ol>
              {blockInfo.detached > 0 && <span className={styles.warn}>{blockInfo.detached} not connected</span>}
              <span className={styles.spacer} />
              <button type="button" className={styles.smallButton} onClick={clearBlocks} disabled={running}>Clear blocks</button>
            </div>
            {notice && <p className={styles.noticeLine} role="status">{notice}</p>}
          </div>

          <div className={styles.sim}>
            <RhinoBoard world={world} state={stateForBoard} bump={bump} running={status === "running"} />

            <div className={styles.controls} role="group" aria-label="Programme controls">
              <button type="button" className={`rx-button rx-button-primary ${styles.runButton}`} onClick={() => startRun(false)} disabled={!ready || running}>
                ▶ Run programme
              </button>
              <button type="button" className={styles.smallButton} onClick={pauseOrResume} disabled={!running}>
                {status === "paused" ? "▶ Resume" : "⏸ Pause"}
              </button>
              <button type="button" className={styles.smallButton} onClick={stepOnce} disabled={!ready}>
                ⏭ Step
              </button>
              <button type="button" className={styles.smallButton} onClick={stop} disabled={status === "idle"}>
                ⏹ Stop
              </button>
              <label className={styles.speed}>
                Speed
                <select value={speed} onChange={(event) => setSpeed(event.target.value as Speed)}>
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </label>
            </div>

            <p
              role="status"
              data-testid="rhinobot-outcome"
              className={`${styles.outcome} ${outcome ? styles[`outcome_${outcome.kind}`] : styles.outcome_idle}`}
              key={outcome ? `o-${runCount.current}` : status}
            >
              {outcome ? (
                <>
                  <strong>{outcome.title}</strong> {outcome.detail}
                </>
              ) : status === "running" ? (
                "Running your programme…"
              ) : status === "paused" ? "Paused. Press Step to go one block at a time, or Resume." : "Build a programme, then press Run. Use Step to watch one block at a time."}
            </p>

            {justWon === mission.id && scored && (
              <div className={styles.winCard}>
                <Confetti />
                <strong>Mission {mission.number} score: {totalPoints(record)} / 100</strong>
                {nextMission !== null && (
                  <button type="button" className={`rx-button rx-button-primary ${styles.runButton}`} onClick={() => switchMission(nextMission)}>
                    Next mission →
                  </button>
                )}
              </div>
            )}
            {justWon === mission.id && isChallenge && (
              <div className={styles.winCard}>
                <Confetti />
                <strong>Challenges completed: {challengeStats.completed} · best efficiency {challengeStats.bestEfficiency}%</strong>
                <button type="button" className={`rx-button rx-button-primary ${styles.runButton}`} onClick={() => newChallenge(challengeCfg.size)}>
                  🎲 Next random challenge
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Score, hints, debugging, history ---------- */}
        <div className={styles.lower}>
          {scored ? (
            <section className={styles.card} aria-label="Score">
              <h3>Mission score <span>{totalPoints(record)} / 100</span></h3>
              <ul className={styles.scoreList}>
                {SCORE_AREAS.map((area) => (
                  <li key={area.key} title={area.how}>
                    <span>{area.label}</span>
                    <meter min={0} max={area.max} value={record[area.key]} aria-label={area.label} />
                    <b>{record[area.key]}/{area.max}</b>
                  </li>
                ))}
              </ul>
              {feedbackFor(record).map((tip) => (
                <p key={tip} className={styles.tip}>{tip}</p>
              ))}
              {!record.completed && <p className={styles.tip}>Points are only awarded for things you do: reaching objectives, using fewer blocks, fixing bugs and predicting correctly. Mistakes never lose points.</p>}
            </section>
          ) : isChallenge ? (
            <section className={styles.card} aria-label="Challenge progress">
              <h3>Challenge progress <span>{challengeStats.completed} completed</span></h3>
              <ul className={styles.scoreList}>
                <li><span>Best route efficiency</span><meter min={0} max={100} value={challengeStats.bestEfficiency} aria-label="Best route efficiency" /><b>{challengeStats.bestEfficiency}%</b></li>
              </ul>
              <p className={styles.tip}>Efficiency compares your moves with the shortest possible route. Loops and sensors can help, but only if the robot takes the short way. Each new challenge is a different map, and the same number always gives the same map, so you can share a number with a friend.</p>
            </section>
          ) : (
            <section className={styles.card} aria-label="Playground ideas">
              <h3>Playground ideas</h3>
              <ul className={styles.ideas}>
                <li>Collect both batteries and bring them to the base.</li>
                <li>Reach the flag, then drive on and activate the charging station.</li>
                <li>Write one programme that works whatever is ahead, using sensors.</li>
                <li>Find the programme with the fewest blocks that reaches the flag.</li>
              </ul>
              <p className={styles.tip}>No targets and no scores here. Save programmes you like below.</p>
            </section>
          )}

          <section className={styles.card} aria-label="Help">
            <h3>Help and debugging</h3>
            {scored && (
              <>
                {hints > 0 && (
                  <ol className={styles.hintList}>
                    {mission.hints.slice(0, hints).map((hint) => <li key={hint}>{hint}</li>)}
                  </ol>
                )}
                <div className={styles.helpRow}>
                  <button type="button" className={styles.smallButton} onClick={showHint} disabled={hints >= mission.hints.length}>
                    💡 {hints === 0 ? "Show a hint" : hints >= mission.hints.length ? "No more hints" : "Another hint"}
                  </button>
                  {debugActive[mission.id] ? (
                    <button type="button" className={styles.smallButton} onClick={restoreMine} disabled={running}>↩ Back to my programme</button>
                  ) : (
                    <button type="button" className={styles.smallButton} onClick={loadDebugChallenge} disabled={running || !ready}>🐞 Debugging challenge</button>
                  )}
                </div>
                {debugActive[mission.id] && (
                  <p className={styles.debugBrief}><strong>Debug it:</strong> {mission.debug.brief} <em>{mission.debug.fixTip}</em></p>
                )}
                <p className={styles.tip}>Hints are free: they never reduce your score.</p>
              </>
            )}
            <h4>Programme history</h4>
            {history.length === 0 ? <p className={styles.tip}>Your runs appear here.</p> : (
              <ul className={styles.history}>
                {history.map((item) => (
                  <li key={item.n} className={item.good ? styles.historyGood : ""}>
                    <b>#{item.n}</b> {item.mission} · {item.blocks} block{item.blocks === 1 ? "" : "s"} · {item.moves} move{item.moves === 1 ? "" : "s"} · {item.outcome}
                  </li>
                ))}
              </ul>
            )}
          </section>
        <section className={`${styles.card} ${styles.savedCard}`} aria-label="Saved programmes">
          <h3>Saved programmes <span>{saved.length}</span></h3>
          <div className={styles.saveRow}>
            <input value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Name your programme" aria-label="Programme name" maxLength={40} />
            <button type="button" className={styles.smallButton} onClick={saveCurrent} disabled={!ready || blockInfo.blockCount === 0}>Save</button>
          </div>
          {saved.length === 0 ? <p className={styles.tip}>Nothing saved yet. Save any programme, then load it later in any mission or in the playground. Saved programmes stay in this browser. <Link href="/coding-robotics/my-projects">See all in My Projects</Link>.</p> : (
            <ul className={styles.savedList}>
              {saved.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <button type="button" className={styles.smallButton} onClick={() => loadSavedProgramme(item)} disabled={running}>Load</button>
                  <button type="button" className={styles.smallButton} onClick={() => setSaved(deleteSaved(item.id))} aria-label={`Delete ${item.name}`}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </section>
        </div>

        <details className={styles.badges} aria-label="Badges">
          <summary>Badges <span>{badges.length} / {BADGES.length}</span></summary>
          <ul>
            {BADGES.map((badge) => (
              <li key={badge.id} className={badges.includes(badge.id) ? styles.badgeOn : styles.badgeOff} title={badge.description}>
                <span aria-hidden="true">{badges.includes(badge.id) ? "🏅" : "🔒"}</span>
                <strong>{badge.title}</strong>
                <em>{badge.description}</em>
              </li>
            ))}
          </ul>
        </details>

        {toast && <div className={styles.toast} role="status">🏅 {toast}</div>}
      </div>
    </div>
  );
}
