// The generic parts of a CBT (computer-based test) practice exam: a bank
// is any object that can build an exam and say how many questions match.
// Every lab supplies its own bank; the exam screen (dashboards/CbtPanel)
// is shared.

import { fmt, makeRng, shuffle, type Rng } from "../specs/titration-practice";
import type { CalcProblem } from "./types";

export type Difficulty = "easy" | "medium" | "hard";
export type Level = "mixed" | Difficulty;

export type CbtQuestion = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type ExamSettings = { count: number; level: Level; topic: string | "all"; seed: number };

export type ExamResult = {
  score: number;
  total: number;
  percent: number;
  topics: Record<string, [number, number]>;
  unanswered: number;
};

export type CbtBank = {
  /** Used for the saved-progress key. */
  id: string;
  /** Sentence shown above the settings. */
  intro: string;
  /** Sentence shown at the bottom of the settings. */
  note: string;
  topics: { id: string; label: string }[];
  build: (settings: ExamSettings) => CbtQuestion[];
  poolSize: (topic: string | "all", level: Level) => number;
};

/** A question as written: the right answer and three wrong ones. */
export type Seed = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  text: string;
  correct: string;
  wrong: [string, string, string];
  explanation: string;
};

export const seed = (id: string, topic: string, difficulty: Difficulty, text: string, correct: string, wrong: [string, string, string], explanation: string): Seed => ({
  id, topic, difficulty, text, correct, wrong, explanation,
});

/**
 * Builds a bank from written questions plus an optional generator of fresh
 * numerical ones (new numbers every exam).
 */
export function makeBank(config: {
  id: string;
  intro: string;
  note: string;
  topics: { id: string; label: string }[];
  seeds: Seed[];
  generated?: { topic: string; make: (rnd: Rng) => CbtQuestion[] };
}): CbtBank {
  const { seeds, generated } = config;
  return {
    id: config.id,
    intro: config.intro,
    note: config.note,
    topics: config.topics,
    build(settings) {
      const rnd = makeRng(settings.seed);
      const written: CbtQuestion[] = seeds.map((s) => {
        const options = shuffle([s.correct, ...s.wrong], rnd);
        return { id: s.id, topic: s.topic, difficulty: s.difficulty, text: s.text, options, correct: options.indexOf(s.correct), explanation: s.explanation };
      });
      const pool = [...written, ...(generated ? generated.make(rnd) : [])].filter(
        (q) => (settings.topic === "all" || q.topic === settings.topic) && (settings.level === "mixed" || q.difficulty === settings.level),
      );
      return shuffle(pool, rnd).slice(0, settings.count);
    },
    poolSize(topic, level) {
      const written = seeds.filter((s) => (topic === "all" || s.topic === topic) && (level === "mixed" || s.difficulty === level)).length;
      const gen = generated && (topic === "all" || topic === generated.topic) ? generated.make(makeRng(1)).filter((q) => level === "mixed" || q.difficulty === level).length : 0;
      return written + gen;
    },
  };
}

export function scoreExam(questions: CbtQuestion[], answers: (number | null)[]): ExamResult {
  let score = 0;
  let unanswered = 0;
  const topics: Record<string, [number, number]> = {};
  questions.forEach((q, i) => {
    const t = topics[q.topic] ?? [0, 0];
    t[1] += 1;
    if (answers[i] === null) unanswered += 1;
    if (answers[i] === q.correct) {
      score += 1;
      t[0] += 1;
    }
    topics[q.topic] = t;
  });
  return { score, total: questions.length, percent: questions.length ? Math.round((score / questions.length) * 100) : 0, topics, unanswered };
}

export function gradeLabel(percent: number) {
  if (percent >= 80) return "Excellent";
  if (percent >= 65) return "Good";
  if (percent >= 50) return "Fair";
  return "Needs more practice";
}

/** Turns a generated calculation into a multiple-choice question, wrong answers from typical mistakes. */
export function calcQuestion(problem: CalcProblem, rnd: Rng, topic: string): CbtQuestion {
  const text = (x: number) => `${fmt(x)} ${problem.unit}`;
  const options: string[] = [text(problem.answer)];
  const used = [problem.answer];
  for (const w of [...problem.wrong, problem.answer * 0.5, problem.answer * 1.5, problem.answer * 3]) {
    if (options.length === 4) break;
    if (!Number.isFinite(w) || w <= 0) continue;
    if (used.some((u) => Math.abs(u - w) / u < 0.03)) continue;
    options.push(text(w));
    used.push(w);
  }
  const order = shuffle([0, 1, 2, 3], rnd);
  return {
    id: problem.id,
    topic,
    difficulty: problem.difficulty,
    text: problem.prompt,
    options: order.map((i) => options[i]),
    correct: order.indexOf(0),
    explanation: problem.working.join("\n"),
  };
}
