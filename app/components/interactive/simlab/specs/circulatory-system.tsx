import { defineSim } from "../types";
import scenes from "./SimScenes.module.css";

type CircState = { activity: string; focus: string };

const ACTIVITY: Record<string, { name: string; bpm: number; stroke: number; breaths: number }> = {
  rest: { name: "Resting", bpm: 70, stroke: 70, breaths: 14 },
  walk: { name: "Walking", bpm: 95, stroke: 80, breaths: 20 },
  jog: { name: "Jogging", bpm: 135, stroke: 95, breaths: 30 },
  sprint: { name: "Sprinting", bpm: 180, stroke: 105, breaths: 45 },
};

export function cardiac(s: CircState) {
  const a = ACTIVITY[s.activity];
  return { ...a, output: (a.bpm * a.stroke) / 1000 };
}

function Path({ d, colour, on, beat }: { d: string; colour: string; on: boolean; beat: { animationDuration: string } }) {
  return (
    <g opacity={on ? 1 : 0.2}>
      <path d={d} fill="none" stroke={colour} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
      <path d={d} fill="none" stroke={colour} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={scenes.flow} style={beat} />
    </g>
  );
}

function Scene({ state }: { state: CircState }) {
  const a = cardiac(state);
  const dur = `${120 / a.bpm}s`;
  const lungs = state.focus === "all" || state.focus === "lungs";
  const body = state.focus === "all" || state.focus === "body";
  const beat = { animationDuration: dur };
  const blue = "#2563eb";
  const red = "#dc2626";

  return (
    <svg viewBox="0 0 660 360" aria-hidden="true">
      <Path beat={beat} d="M110 150 V60 H260" colour={blue} on={lungs} />
      <Path beat={beat} d="M400 60 H550 V150" colour={red} on={lungs} />
      <Path beat={beat} d="M550 210 V300 H400" colour={red} on={body} />
      <Path beat={beat} d="M260 300 H110 V210" colour={blue} on={body} />

      <rect x="40" y="150" width="140" height="60" rx="14" fill="#dbeafe" stroke={blue} strokeWidth="3" />
      <text x="110" y="177" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e3a8a">Right side</text>
      <text x="110" y="196" textAnchor="middle" fontSize="12" fill="#1e3a8a">of the heart</text>
      <rect x="480" y="150" width="140" height="60" rx="14" fill="#fee2e2" stroke={red} strokeWidth="3" />
      <text x="550" y="177" textAnchor="middle" fontSize="14" fontWeight="700" fill="#7f1d1d">Left side</text>
      <text x="550" y="196" textAnchor="middle" fontSize="12" fill="#7f1d1d">of the heart</text>
      <rect x="260" y="30" width="140" height="60" rx="14" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
      <text x="330" y="66" textAnchor="middle" fontSize="15" fontWeight="700" fill="#78350f">Lungs</text>
      <rect x="260" y="270" width="140" height="60" rx="14" fill="#ede9fe" stroke="#7c3aed" strokeWidth="3" />
      <text x="330" y="306" textAnchor="middle" fontSize="15" fontWeight="700" fill="#4c1d95">Body</text>

      <circle cx="330" cy="180" r="34" fill="#dc2626" className={scenes.pulse} style={beat} />
      <text x="330" y="186" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">{a.bpm}</text>
      <text x="330" y="232" textAnchor="middle" fontSize="12" fill="#475569">beats per minute</text>
      <text x="260" y="108" fontSize="12" fill="#1d4ed8">low oxygen</text>
      <text x="410" y="108" fontSize="12" fill="#b91c1c">high oxygen</text>
    </svg>
  );
}

export const circulatorySystem = defineSim<CircState>({
  init: { activity: "rest", focus: "all" },
  controls: [
    { type: "choice", key: "activity", label: "Activity", options: Object.entries(ACTIVITY).map(([value, v]) => ({ value, label: v.name })) },
    {
      type: "choice",
      key: "focus",
      label: "Follow the blood",
      options: [
        { value: "all", label: "Whole system" },
        { value: "lungs", label: "Heart → lungs → heart" },
        { value: "body", label: "Heart → body → heart" },
      ],
    },
  ],
  Scene,
  sceneLabel: "A loop showing blood going from the right side of the heart to the lungs, back to the left side, round the body and back again.",
  readings: (s) => {
    const a = cardiac(s);
    return [
      { label: "Heart rate", value: `${a.bpm} beats/min` },
      { label: "Blood pumped per beat", value: `${a.stroke} mL` },
      { label: "Blood pumped per minute", value: `${a.output.toFixed(1)} L`, tone: a.output > 12 ? "good" : "info" },
      { label: "Breathing rate", value: `${a.breaths} breaths/min` },
    ];
  },
  hint: (s) => {
    if (s.focus === "lungs") return "The right side pumps blood with little oxygen to the lungs. It picks up oxygen and returns to the left side of the heart.";
    if (s.focus === "body") return "The left side pumps oxygen-rich blood round the whole body. It gives up oxygen and returns to the right side.";
    if (s.activity === "rest") return "Blue blood has little oxygen; red blood is rich in oxygen. Try exercise to see how the heart responds.";
    return "Working muscles need more oxygen, so the heart beats faster and harder and you breathe more quickly.";
  },
  checks: {
    "lung-circuit": (s) => s.focus === "lungs",
    "body-circuit": (s) => s.focus === "body",
    "exercise": (s) => s.activity === "jog" || s.activity === "sprint",
    "max-output": (s) => cardiac(s).output >= 15,
  },
});
