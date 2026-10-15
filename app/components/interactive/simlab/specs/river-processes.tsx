import { defineSim } from "../types";

type RiverState = { course: string; flow: number };

export const COURSES: Record<string, { name: string; process: string; shape: string; sediment: string; bank: number }> = {
  upper: { name: "Upper course", process: "Vertical erosion", shape: "Narrow V-shaped valley", sediment: "Large boulders and rocks", bank: 150 },
  middle: { name: "Middle course", process: "Sideways erosion and transport", shape: "Wider valley with meanders", sediment: "Pebbles and sand", bank: 120 },
  lower: { name: "Lower course", process: "Deposition", shape: "Wide, flat flood plain", sediment: "Fine silt and mud", bank: 60 },
};

export function water(s: RiverState) {
  const level = 20 + s.flow * 9;
  const flooding = level > COURSES[s.course].bank;
  return { level, flooding };
}

function Scene({ state }: { state: RiverState }) {
  const { level, flooding } = water(state);
  const base = 330;
  let valley = "";
  let channelTop = 0;
  if (state.course === "upper") {
    valley = `M0 60 L270 ${base} H390 L660 60 V380 H0 Z`;
    channelTop = base - level;
  } else if (state.course === "middle") {
    valley = `M0 130 Q120 140 190 ${base} H470 Q540 140 660 130 V380 H0 Z`;
    channelTop = base - level;
  } else {
    valley = `M0 260 H230 L260 ${base} H400 L430 260 H660 V380 H0 Z`;
    channelTop = base - level;
  }
  const waterTop = Math.max(channelTop, 40);
  const widthAt = state.course === "upper" ? 120 + (330 - waterTop) * 0.9 : state.course === "middle" ? 280 + (330 - waterTop) * 0.5 : 160 + (330 - waterTop) * 3;
  const left = 330 - Math.min(widthAt, 660) / 2;
  const sediment = state.course === "upper" ? 14 : state.course === "middle" ? 7 : 3;
  return (
    <svg viewBox="0 0 660 380" aria-hidden="true">
      <rect width="660" height="380" fill="#e0f2fe" />
      <path d={valley} fill="#a3794a" />
      <path d={valley} fill="none" stroke="#6b4423" strokeWidth="3" />
      <clipPath id="river-clip"><path d={valley} /></clipPath>
      <rect clipPath="url(#river-clip)" x={left} y={waterTop} width={Math.min(widthAt, 660)} height={380 - waterTop} fill={flooding ? "#7c8b6a" : "#38bdf8"} opacity="0.85" />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={290 + i * 10} cy={base - 4 - (i % 2) * 3} r={sediment - (i % 3)} fill="#78716c" />
      ))}
      <text x="20" y="32" fontSize="16" fontWeight="700" fill="#0b1f4a">{COURSES[state.course].name}: cross-section</text>
      {flooding && <text x="330" y="70" textAnchor="middle" fontSize="18" fontWeight="800" fill="#b91c1c">FLOOD! The river has burst its banks</text>}
    </svg>
  );
}

export const riverProcesses = defineSim<RiverState>({
  init: { course: "upper", flow: 1 },
  controls: [
    { type: "choice", key: "course", label: "Part of the river", options: Object.entries(COURSES).map(([value, v]) => ({ value, label: v.name })) },
    { type: "slider", key: "flow", label: "River flow (after rainfall)", min: 1, max: 10, step: 1 },
  ],
  Scene,
  sceneLabel: "A cross-section of a river valley with water that rises as the flow increases.",
  readings: (s) => {
    const c = COURSES[s.course];
    return [
      { label: "Main process", value: c.process },
      { label: "Valley shape", value: c.shape },
      { label: "Sediment", value: c.sediment },
      { label: "Flooding", value: water(s).flooding ? "Yes" : "No", tone: water(s).flooding ? "warn" : "good" },
    ];
  },
  hint: (s) => {
    if (water(s).flooding) return "The water level is above the banks. Flood plains flood because the channel is shallow and the valley is flat.";
    if (s.course === "upper") return "Steep slope, fast water: the river cuts downwards, making a V-shaped valley with large, angular rocks.";
    if (s.course === "middle") return "The river swings from side to side, eroding the outside of bends and building meanders.";
    return "The river is wide and slow. It cannot carry its load, so it deposits fine silt on the flood plain.";
  },
  checks: {
    "upper-course": (s) => s.course === "upper" && s.flow >= 3,
    "middle-course": (s) => s.course === "middle" && s.flow >= 3,
    "lower-course": (s) => s.course === "lower" && s.flow >= 3,
    "cause-flood": (s) => s.course === "lower" && water(s).flooding,
  },
});
