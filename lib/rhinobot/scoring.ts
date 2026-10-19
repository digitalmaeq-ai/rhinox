// Transparent scoring for RhinoBot missions. Every point comes from something
// the learner did that can be observed; nothing guesses at what they were thinking.
//
//   Problem-solving accuracy   30  share of mission objectives met (best run)
//   Algorithm efficiency       25  how few blocks the successful programme used
//   Debugging ability          20  10 for recovering from a failed run,
//                                  10 for fixing the debugging challenge
//   Critical thinking          15  the prediction question (15 / 10 / 5 points)
//   Successful completion      10  the mission was completed

export interface MissionRecord {
  accuracy: number;
  efficiency: number;
  debugging: number;
  thinking: number;
  completion: number;
  completed: boolean;
  bestBlocks: number | null;
  attempts: number;
  failedRuns: number;
  recovered: boolean;
  debugSolved: boolean;
  predictionTries: number;
  hintsUsed: number;
  advancedDone: boolean;
}

export const EMPTY_RECORD: MissionRecord = {
  accuracy: 0,
  efficiency: 0,
  debugging: 0,
  thinking: 0,
  completion: 0,
  completed: false,
  bestBlocks: null,
  attempts: 0,
  failedRuns: 0,
  recovered: false,
  debugSolved: false,
  predictionTries: 0,
  hintsUsed: 0,
  advancedDone: false,
};

export const SCORE_AREAS = [
  { key: "accuracy", label: "Problem-solving accuracy", max: 30, how: "Objectives met in your best run" },
  { key: "efficiency", label: "Algorithm efficiency", max: 25, how: "Fewer blocks scores higher" },
  { key: "debugging", label: "Debugging ability", max: 20, how: "Recover from a failed run, and fix the debugging challenge" },
  { key: "thinking", label: "Critical thinking", max: 15, how: "Predict what a programme does before you run it" },
  { key: "completion", label: "Successful completion", max: 10, how: "Complete the mission" },
] as const;

export function accuracyPoints(done: number, total: number) {
  return total === 0 ? 0 : Math.round((30 * done) / total);
}

export function efficiencyPoints(blocks: number, par: number) {
  if (blocks <= par) return 25;
  if (blocks <= par + 2) return 18;
  if (blocks <= par + 5) return 12;
  return 6;
}

export function predictionPoints(tries: number) {
  if (tries <= 1) return 15;
  if (tries === 2) return 10;
  return 5;
}

export function totalPoints(record: MissionRecord) {
  return record.accuracy + record.efficiency + record.debugging + record.thinking + record.completion;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: "first-programme", title: "First Programme", description: "Complete Mission 1." },
  { id: "loop-master", title: "Loop Master", description: "Complete Mission 2 using a repeat block." },
  { id: "decision-maker", title: "Decision Maker", description: "Complete Mission 3." },
  { id: "sensor-specialist", title: "Sensor Specialist", description: "Complete Mission 4." },
  { id: "master-programmer", title: "Master Programmer", description: "Complete Mission 5." },
  { id: "bug-hunter", title: "Bug Hunter", description: "Fix a debugging challenge." },
  { id: "efficiency-expert", title: "Efficiency Expert", description: "Match the best solution length on any mission." },
  { id: "fortune-teller", title: "Fortune Teller", description: "Predict correctly on the first try." },
  { id: "explorer", title: "Explorer", description: "Save a programme from the playground." },
  { id: "perfect-score", title: "Perfect Score", description: "Score 100 on a mission." },
  { id: "pathfinder", title: "Pathfinder", description: "Finish a random challenge with a route at least 90% as short as the best." },
  { id: "challenger", title: "Challenger", description: "Complete three random challenges." },
];

export function feedbackFor(record: MissionRecord): string[] {
  const tips: string[] = [];
  if (!record.completed) return tips;
  if (record.efficiency < 25) tips.push("Efficiency: look for repeated blocks you could replace with a loop, or a shorter route.");
  if (record.debugging < 20) tips.push("Debugging: try the debugging challenge for extra points, and learn to spot the faulty block.");
  if (record.thinking < 15) tips.push("Prediction: before running a programme, trace it with your finger to check where RhinoBot will end up.");
  if (tips.length === 0) tips.push("Brilliant work: efficient, well-tested and carefully predicted.");
  return tips;
}
