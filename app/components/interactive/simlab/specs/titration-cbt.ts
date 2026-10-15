// CBT practice for the titration lab: an original question bank, generated
// numerical questions, a randomised exam builder and scoring.
// The bank is written for Rhinox and follows the topics in the Nigerian
// secondary Chemistry syllabus. It is not copied from past papers.

import type { CbtBank } from "../shell/cbt";
import { CALC_KINDS, fmt, generateCalc, makeRng, shuffle, type Difficulty, type Rng } from "./titration-practice";

export type Topic = "apparatus" | "indicators" | "curves" | "acids-bases" | "calculations";

export const TOPICS: { id: Topic; label: string }[] = [
  { id: "apparatus", label: "Apparatus and technique" },
  { id: "indicators", label: "Indicators" },
  { id: "curves", label: "Titration curves" },
  { id: "acids-bases", label: "Acids and bases" },
  { id: "calculations", label: "Calculations" },
];

export const TOPIC_LABEL: Record<Topic, string> = Object.fromEntries(TOPICS.map((t) => [t.id, t.label])) as Record<Topic, string>;

type Seed = {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  text: string;
  correct: string;
  wrong: [string, string, string];
  explanation: string;
};

export type CbtQuestion = {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

const Q = (id: string, topic: Topic, difficulty: Difficulty, text: string, correct: string, wrong: [string, string, string], explanation: string): Seed => ({ id, topic, difficulty, text, correct, wrong, explanation });

const BANK: Seed[] = [
  // Apparatus and technique
  Q("a0", "apparatus", "easy", "In the titration set-up used here, which solution is measured with the pipette and which is run from the burette?", "The alkali is pipetted into the flask and the acid is run from the burette", ["The acid is pipetted into the flask and the alkali is run from the burette", "The indicator is run from the burette", "Both solutions are measured with the pipette"], "In this practical the alkali (base) is measured with a pipette into the conical flask, and the acid is added from the burette until the indicator changes colour."),
  Q("a1", "apparatus", "easy", "Which apparatus should be used to transfer exactly 25.0 cm³ of the alkali into the conical flask?", "A pipette", ["A measuring cylinder", "A beaker", "A gas jar"], "A pipette delivers one fixed volume very accurately. A measuring cylinder and a beaker are far less precise."),
  Q("a2", "apparatus", "easy", "Why is the conical flask swirled during a titration?", "To mix the reacting solutions thoroughly", ["To increase the concentration of the acid", "To increase the volume in the burette", "To change the indicator permanently"], "Swirling mixes each addition into the whole solution, so the colour change you see really shows the reaction is complete."),
  Q("a3", "apparatus", "easy", "Why is a white tile placed under the conical flask?", "It makes the colour change easier to see", ["It keeps the flask cool", "It speeds up the reaction", "It neutralises spilt acid"], "A white background shows even a faint colour change clearly."),
  Q("a4", "apparatus", "medium", "Before filling, the burette is rinsed with a little of the solution it will hold. Why?", "Water left inside would dilute the solution and change its concentration", ["To make the glass warm", "To increase the volume the burette can hold", "To stop the indicator reacting"], "Any water left on the glass would dilute the solution, so the burette is rinsed with the solution itself."),
  Q("a5", "apparatus", "medium", "Why is the filter funnel removed from the burette before the initial reading is taken?", "A drop left in the funnel could fall into the burette and change the reading", ["The funnel makes the solution acidic", "The funnel blocks the meniscus from view", "The funnel changes the concentration"], "Drops that run down from the funnel during the titration would add volume that is not measured."),
  Q("a6", "apparatus", "medium", "A burette reading is taken with your eye level with the meniscus. For a colourless solution the reading is taken at the", "bottom of the meniscus", ["top of the meniscus", "edge of the glass", "tip of the burette"], "The curved surface is read at its lowest point, with the eye level to avoid a parallax error."),
  Q("a7", "apparatus", "hard", "The conical flask is rinsed with distilled water and left wet before the alkali is pipetted into it. The effect on the titre is", "none, because the number of moles of acid is unchanged", ["the titre is smaller because the alkali is diluted", "the titre is larger because more alkali is present", "the end point can no longer be seen"], "The pipette delivers a fixed number of moles of alkali. Extra water changes the concentration in the flask but not the moles, and it is moles that react."),
  Q("a8", "apparatus", "hard", "An air bubble is trapped in the burette tip at the start and is washed out during the titration. The measured titre will be", "larger than the true value", ["smaller than the true value", "unchanged", "impossible to read"], "The level falls by the volume of the bubble as well as by the liquid delivered, so the reading overstates the volume that reached the flask."),
  Q("a9", "apparatus", "medium", "What is the purpose of the rough titration?", "To find the approximate end point so later titrations can go drop by drop near it", ["To rinse the burette", "To make the indicator work", "To neutralise the acid in advance"], "The rough run is quick. It tells you where to slow down in the accurate titrations."),
  Q("a10", "apparatus", "medium", "Titres are described as concordant when they", "agree to within 0.10 cm³", ["are exactly equal", "add up to 50 cm³", "are all below 20 cm³"], "Concordant titres agree closely, usually within 0.10 cm³. Their mean is used in the calculation."),

  // Indicators
  Q("i1", "indicators", "easy", "Phenolphthalein in an alkaline solution is", "pink", ["colourless", "yellow", "red"], "Phenolphthalein is colourless in acid and turns pink above about pH 8.2."),
  Q("i2", "indicators", "easy", "Methyl orange in an acidic solution is", "red", ["yellow", "colourless", "blue"], "Methyl orange is red in acid, orange near pH 3.1 to 4.4 and yellow in alkali."),
  Q("i3", "indicators", "medium", "Which indicator is most suitable for titrating ethanoic acid with sodium hydroxide?", "Phenolphthalein", ["Methyl orange", "Methyl red", "Bromothymol blue"], "The salt formed, sodium ethanoate, is slightly alkaline (pH about 8.7). Phenolphthalein changes colour at that pH, but the others change far too early."),
  Q("i4", "indicators", "medium", "Which indicator is suitable for titrating hydrochloric acid with aqueous ammonia?", "Methyl orange", ["Phenolphthalein", "No indicator can be used", "Universal indicator paper"], "The salt formed, ammonium chloride, makes the solution slightly acidic (pH about 5.3). Methyl orange changes in the acid range, so it signals the end point correctly."),
  Q("i5", "indicators", "medium", "Why is the end point not always exactly the same as the equivalence point?", "The indicator changes colour over a pH range that may not sit exactly on the equivalence pH", ["The indicator is added after the titration", "The burette is not accurate", "Acids and bases never react completely"], "The equivalence point is calculated from the equation. The end point is where the indicator is seen to change, so a small difference is possible."),
  Q("i6", "indicators", "hard", "Why is phenolphthalein unsuitable for titrating hydrochloric acid with aqueous ammonia?", "Its colour change (pH 8.2 to 10) lies well above the pH at equivalence (about 5)", ["It is only soluble in strong bases", "It turns pink in acid", "Ammonia destroys the indicator"], "Ammonia is a weak base. The pH only reaches 8.2 long after the equivalence point, so the colour change appears much too late."),
  Q("i7", "indicators", "medium", "Only a few drops of indicator are added because", "the indicator is itself a weak acid or base and would react with some of the titrant", ["it is expensive", "more would make the solution boil", "more would stop the neutralisation"], "Indicators are weak acids or bases. Too much would use up some of the titrant and shift the end point."),
  Q("i8", "indicators", "easy", "Methyl orange in an alkaline solution is", "yellow", ["red", "pink", "colourless"], "Methyl orange is yellow above about pH 4.4."),

  // Titration curves
  Q("c1", "curves", "easy", "At the equivalence point of a strong acid and a strong base the pH is", "7", ["1", "10", "14"], "The salt formed does not react with water, so the solution is neutral (at 25 °C)."),
  Q("c2", "curves", "medium", "At the equivalence point of a weak acid and a strong base the pH is", "above 7", ["exactly 7", "below 7", "always 14"], "The anion of the weak acid takes H⁺ from water, leaving extra OH⁻, so the solution is slightly alkaline."),
  Q("c3", "curves", "medium", "At the equivalence point of a strong acid and a weak base the pH is", "below 7", ["exactly 7", "above 7", "always 0"], "The cation of the weak base gives H⁺ to water, so the solution is slightly acidic."),
  Q("c4", "curves", "medium", "The steep, almost vertical part of a titration curve shows that", "a very small volume of titrant causes a large change in pH", ["no reaction is taking place", "the acid has been used up long before", "the temperature is rising rapidly"], "Near equivalence almost all the acid has gone, so one drop of base changes the pH by several units."),
  Q("c5", "curves", "hard", "At the half-equivalence point in the titration of a weak acid, the pH equals", "the pKa of the acid", ["7", "the pKa of the base", "14"], "Half the acid has been converted to its conjugate base, so [HA] = [A⁻] and pH = pKa."),
  Q("c6", "curves", "hard", "Why does the curve for a weak acid rise slowly before the steep section?", "A buffer of the weak acid and its conjugate base resists the change in pH", ["The acid is stronger than expected", "The base is being diluted", "The indicator slows the reaction"], "The mixture of HA and A⁻ is a buffer: added base is mostly absorbed by HA."),
  Q("c7", "curves", "medium", "0.1 mol/dm³ ethanoic acid has a higher starting pH than 0.1 mol/dm³ hydrochloric acid because", "ethanoic acid is only partly ionised", ["it is more concentrated", "it contains no hydrogen", "it is a base"], "A weak acid releases only a small fraction of its H⁺, so [H⁺] is lower than in the strong acid."),
  Q("c8", "curves", "easy", "On a titration curve the equivalence point is found", "at the middle of the steep vertical section", ["at the start of the curve", "at the end of the curve", "where the pH is 1"], "The centre of the steep rise is the equivalence point."),

  // Acids and bases
  Q("b1", "acids-bases", "easy", "A strong acid is one that", "ionises completely in water", ["has a high concentration", "ionises only slightly in water", "has no hydrogen ions"], "Strength is about how much ionises, not how concentrated the solution is."),
  Q("b2", "acids-bases", "easy", "Which of these is a weak base?", "Aqueous ammonia", ["Sodium hydroxide", "Potassium hydroxide", "Barium hydroxide"], "Ammonia reacts only partly with water. The others are strong bases."),
  Q("b3", "acids-bases", "medium", "Which equation represents the complete neutralisation of sulphuric acid by sodium hydroxide?", "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O", ["H₂SO₄ + NaOH → Na₂SO₄ + H₂O", "H₂SO₄ + 2NaOH → NaSO₄ + 2H₂O", "H₂SO₄ + NaOH → NaHSO₄ + 2H₂O"], "Each H₂SO₄ has two replaceable hydrogens, so it needs two NaOH and forms Na₂SO₄."),
  Q("b4", "acids-bases", "medium", "What is the pH of 0.01 mol/dm³ hydrochloric acid?", "2", ["1", "0.01", "12"], "HCl ionises fully, so [H⁺] = 0.01 = 10⁻² and pH = 2."),
  Q("b5", "acids-bases", "medium", "Which salt is formed when ethanoic acid is neutralised by sodium hydroxide?", "Sodium ethanoate", ["Sodium chloride", "Sodium sulphate", "Ethanol"], "CH₃COOH + NaOH → CH₃COONa + H₂O."),
  Q("b6", "acids-bases", "hard", "One mole of H₂SO₄ needs twice as much NaOH as one mole of HCl because H₂SO₄ is", "dibasic: it has two replaceable hydrogen ions", ["a weaker acid", "less concentrated", "a reducing agent"], "Each H₂SO₄ molecule can give two H⁺, so it neutralises two OH⁻."),
  Q("b7", "acids-bases", "easy", "At 25 °C a neutral solution has a pH of", "7", ["0", "1", "14"], "Pure water has equal [H⁺] and [OH⁻] of 10⁻⁷ mol/dm³ at 25 °C."),
  Q("b8", "acids-bases", "hard", "At 25 °C a solution has pH 9. Its pOH is", "5", ["9", "14", "23"], "pH + pOH = 14 at 25 °C, so pOH = 14 − 9 = 5."),

  // Calculations (conceptual)
  Q("k1", "calculations", "medium", "HCl (in the burette, titre Vₐ) neutralises NaOH (pipetted, volume V_b) in a 1 : 1 ratio. Which expression gives the base concentration C_b?", "C_b = (Cₐ × Vₐ) ÷ V_b", ["C_b = (Cₐ × V_b) ÷ Vₐ", "C_b = Cₐ × Vₐ × V_b", "C_b = V_b ÷ (Cₐ × Vₐ)"], "Moles of acid = Cₐ Vₐ. At 1 : 1 this equals the moles of base, C_b V_b, so C_b = Cₐ Vₐ ÷ V_b."),
  Q("k2", "calculations", "medium", "Number of moles of solute in a solution is", "concentration (mol/dm³) × volume (dm³)", ["concentration ÷ volume", "volume ÷ concentration", "mass × volume"], "n = C × V, with the volume in dm³."),
  Q("k3", "calculations", "hard", "When H₂SO₄ from the burette neutralises NaOH, which relationship between moles of acid (nₐ) and moles of base (n_b) is correct?", "n_b = 2 × nₐ", ["nₐ = 2 × n_b", "nₐ = n_b", "n_b = nₐ + 2"], "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O: two moles of base for each mole of acid."),
  Q("k4", "calculations", "easy", "A volume of 25.0 cm³ expressed in dm³ is", "0.0250 dm³", ["2.50 dm³", "0.250 dm³", "25 000 dm³"], "1 dm³ = 1000 cm³, so divide by 1000."),
  Q("k5", "calculations", "medium", "A titration used 20.0 cm³ of 0.100 mol/dm³ NaOH. How many moles of NaOH is that?", "2.00 × 10⁻³ mol", ["2.00 mol", "2.00 × 10⁻² mol", "5.00 × 10⁻³ mol"], "n = 0.100 × 20.0 ÷ 1000 = 0.00200 mol."),
];

const GEN_TOPIC: Topic = "calculations";

function formatOption(x: number, unit: string) {
  return `${fmt(x)} ${unit}`;
}

/** A generated numerical question, with wrong answers taken from typical mistakes. */
export function generatedQuestions(rnd: Rng): CbtQuestion[] {
  return CALC_KINDS.map((k) => {
    const problem = generateCalc(Math.floor(rnd() * 1e9), k.id);
    const options: string[] = [formatOption(problem.answer, problem.unit)];
    const used = [problem.answer];
    const extra = [problem.answer * 0.5, problem.answer * 1.5, problem.answer * 3];
    for (const w of [...problem.wrong, ...extra]) {
      if (options.length === 4) break;
      if (!Number.isFinite(w) || w <= 0) continue;
      if (used.some((u) => Math.abs(u - w) / u < 0.03)) continue;
      options.push(formatOption(w, problem.unit));
      used.push(w);
    }
    const order = shuffle([0, 1, 2, 3], rnd);
    return {
      id: problem.id,
      topic: GEN_TOPIC,
      difficulty: problem.difficulty,
      text: problem.prompt,
      options: order.map((i) => options[i]),
      correct: order.indexOf(0),
      explanation: problem.working.join("\n"),
    };
  });
}

export type Level = "mixed" | Difficulty;

export type ExamSettings = {
  count: number;
  level: Level;
  topic: Topic | "all";
  seed: number;
};

/** Randomised exam: questions drawn from the bank plus fresh numerical ones, options shuffled. */
export function buildExam(settings: ExamSettings): CbtQuestion[] {
  const rnd = makeRng(settings.seed);
  const fromBank: CbtQuestion[] = BANK.map((s) => {
    const options = shuffle([s.correct, ...s.wrong], rnd);
    return { id: s.id, topic: s.topic, difficulty: s.difficulty, text: s.text, options, correct: options.indexOf(s.correct), explanation: s.explanation };
  });
  const pool = [...fromBank, ...generatedQuestions(rnd)].filter(
    (q) => (settings.topic === "all" || q.topic === settings.topic) && (settings.level === "mixed" || q.difficulty === settings.level),
  );
  return shuffle(pool, rnd).slice(0, settings.count);
}

/** How many questions are available for a setting (so the screen can warn). */
export function poolSize(topic: Topic | "all", level: Level) {
  const bank = BANK.filter((s) => (topic === "all" || s.topic === topic) && (level === "mixed" || s.difficulty === level)).length;
  const gen = CALC_KINDS.length;
  const genMatch = topic === "all" || topic === GEN_TOPIC ? (level === "mixed" ? gen : 0) : 0;
  return bank + genMatch;
}

export type ExamResult = {
  score: number;
  total: number;
  percent: number;
  topics: Record<string, [number, number]>;
  unanswered: number;
};

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

/* ------------------------------ as a shared bank ------------------------------ */

export const titrationBank: CbtBank = {
  id: "titration",
  intro: "Randomised multiple-choice questions on titration, with fresh numbers in the calculation questions. You get a score and an explanation for every question at the end.",
  note: "Original Rhinox practice questions following the Nigerian secondary Chemistry topics. They are not taken from past papers.",
  topics: TOPICS,
  build: (settings) => buildExam({ ...settings, topic: settings.topic as Topic | "all" }),
  poolSize: (topic, level) => poolSize(topic as Topic | "all", level),
};
