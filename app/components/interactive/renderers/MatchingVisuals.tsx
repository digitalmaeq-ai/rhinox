import type { JSX, ReactNode } from "react";

import { useSvgId } from "@/app/components/interactive/shared/visualKeys";

// Visual library for MatchingRenderer — pure SVG, no images, no external
// assets. Same pattern as DragClassificationVisuals.tsx: everything is
// looked up by a *visual key* (`properties.visual`, or derived from the
// asset label), never by experiment, and unknown keys fall back to a
// neutral lettered tile. Adding a new source or target is adding an entry
// here, not changing the renderer.
//
// The key helpers (toVisualKey, useSvgId) live in
// app/components/interactive/shared/visualKeys.ts, shared with Sorting.

// ---------------------------------------------------------------------------
// Sources (square art, viewBox 0 0 80 80)
// ---------------------------------------------------------------------------

export function SourceVisual({
  visualKey,
  label,
  size = 64,
}: {
  visualKey: string;
  label: string;
  size?: number;
}) {
  const Art = sourceArt[visualKey] as (() => JSX.Element) | undefined;
  const generated = Art ? null : generatedSource(visualKey);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible" }}
    >
      {Art ? <Art /> : generated ?? <FallbackTile label={label} />}
    </svg>
  );
}

function Shadow({ rx = 22, cy = 71 }: { rx?: number; cy?: number }) {
  return <ellipse cx={40} cy={cy} rx={rx} ry={4} fill="#0f2a44" opacity={0.12} />;
}

function FishArt() {
  const grad = useSvgId("fish");
  return (
    <>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb347" />
          <stop offset="100%" stopColor="#f07b1d" />
        </linearGradient>
      </defs>
      <Shadow rx={24} />
      <path d="M58 40 74 27v26Z" fill="#f07b1d" stroke="#b9560e" strokeWidth={1.5} strokeLinejoin="round" />
      <ellipse cx={37} cy={40} rx={25} ry={16} fill={`url(#${grad})`} stroke="#b9560e" strokeWidth={1.6} />
      <path d="M33 25c4 5 4 9 1 13" fill="#ffd08a" stroke="#b9560e" strokeWidth={1.2} />
      <path d="M26 33c3 4 3 10 0 14" fill="none" stroke="#b9560e" strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={19} cy={37} r={3.4} fill="#ffffff" />
      <circle cx={18.4} cy={37} r={1.8} fill="#1b2a38" />
      <circle cx={10} cy={22} r={2.4} fill="none" stroke="#7cc4f0" strokeWidth={1.4} />
      <circle cx={6} cy={14} r={1.6} fill="none" stroke="#7cc4f0" strokeWidth={1.2} />
    </>
  );
}

function CamelArt() {
  return (
    <>
      <Shadow rx={26} />
      <g stroke="#94632d" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
        <path d="M22 60V47M30 60V48M50 60V48M58 60V47" stroke="#94632d" strokeWidth={4} fill="none" />
        <path
          d="M14 42c0-9 7-13 13-11 3-8 9-12 14-4 5-8 12-5 14 3 4 1 6 5 6 10v5H14Z"
          fill="#d9a05b"
        />
        <path d="M60 40c2-7 3-15 7-19" fill="none" stroke="#d9a05b" strokeWidth={7} />
        <ellipse cx={69} cy={20} rx={7} ry={4.5} fill="#d9a05b" />
      </g>
      <circle cx={70} cy={18.5} r={1.2} fill="#3b2410" />
      <path d="M38 27c2-2 4-2 6 0" stroke="#f2c893" strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

function PolarBearArt() {
  return (
    <>
      <Shadow rx={26} />
      <g stroke="#9fb3c8" strokeWidth={1.6} strokeLinejoin="round">
        <rect x={16} y={36} width={46} height={24} rx={12} fill="#f7fbff" />
        <rect x={20} y={52} width={8} height={12} rx={4} fill="#f7fbff" />
        <rect x={48} y={52} width={8} height={12} rx={4} fill="#f7fbff" />
        <circle cx={60} cy={34} r={12} fill="#f7fbff" />
        <circle cx={53} cy={24} r={4} fill="#f7fbff" />
        <circle cx={66} cy={23} r={4} fill="#f7fbff" />
      </g>
      <ellipse cx={67} cy={37} rx={5} ry={4} fill="#e6eef6" />
      <circle cx={70} cy={36} r={2} fill="#1b2a38" />
      <circle cx={61} cy={31} r={1.6} fill="#1b2a38" />
      <path d="M22 42c6-3 14-3 20 0" stroke="#dfe8f2" strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  );
}

function MonkeyArt() {
  return (
    <>
      <Shadow rx={22} />
      <path d="M52 58c14-2 18-14 10-20" fill="none" stroke="#8a5a2b" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={40} cy={54} rx={14} ry={12} fill="#a86b35" stroke="#6e4520" strokeWidth={1.5} />
      <ellipse cx={40} cy={56} rx={8} ry={7} fill="#e8c29a" />
      <circle cx={22} cy={30} r={7} fill="#a86b35" stroke="#6e4520" strokeWidth={1.5} />
      <circle cx={58} cy={30} r={7} fill="#a86b35" stroke="#6e4520" strokeWidth={1.5} />
      <circle cx={22} cy={30} r={3.5} fill="#e8c29a" />
      <circle cx={58} cy={30} r={3.5} fill="#e8c29a" />
      <circle cx={40} cy={30} r={17} fill="#a86b35" stroke="#6e4520" strokeWidth={1.6} />
      <path d="M28 33c0-7 5-10 12-10s12 3 12 10-5 11-12 11-12-4-12-11Z" fill="#e8c29a" />
      <circle cx={35} cy={30} r={2} fill="#1b2a38" />
      <circle cx={45} cy={30} r={2} fill="#1b2a38" />
      <path d="M35 38c3 2 7 2 10 0" stroke="#6e4520" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </>
  );
}

function OwlArt() {
  return (
    <>
      <Shadow rx={20} />
      <path d="M22 18l6 8M58 18l-6 8" stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={40} cy={42} rx={20} ry={25} fill="#8b6340" stroke="#5a3d22" strokeWidth={1.6} />
      <ellipse cx={40} cy={50} rx={12} ry={14} fill="#d8b98f" />
      <path d="M33 47c2 2 4 2 6 0M41 47c2 2 4 2 6 0M36 54c2 2 4 2 6 0" stroke="#a88660" strokeWidth={1.3} fill="none" />
      <circle cx={32} cy={33} r={8} fill="#ffffff" stroke="#5a3d22" strokeWidth={1.3} />
      <circle cx={48} cy={33} r={8} fill="#ffffff" stroke="#5a3d22" strokeWidth={1.3} />
      <circle cx={32} cy={33} r={4.2} fill="#f5b700" />
      <circle cx={48} cy={33} r={4.2} fill="#f5b700" />
      <circle cx={32} cy={33} r={2} fill="#1b2a38" />
      <circle cx={48} cy={33} r={2} fill="#1b2a38" />
      <path d="M37 39l3 5 3-5Z" fill="#f08a24" />
      <path d="M34 67h4M42 67h4" stroke="#f08a24" strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

// ----- Mixtures (Separating Mixtures) -----

// A glass beaker whose contents are clipped to its inside.
function Beaker({ children }: { children?: ReactNode }) {
  const clip = useSvgId("beaker-clip");
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path d="M21 16h38v46a6 6 0 0 1-6 6H27a6 6 0 0 1-6-6Z" />
        </clipPath>
      </defs>
      <path d="M21 16h38v46a6 6 0 0 1-6 6H27a6 6 0 0 1-6-6Z" fill="#f2f9ff" />
      <g clipPath={`url(#${clip})`}>{children}</g>
      <path
        d="M17 14h44M21 14v48a6 6 0 0 0 6 6h26a6 6 0 0 0 6-6V14"
        fill="none"
        stroke="#7fa9c9"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M26 24v34" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      <path d="M49 30h8M49 40h8M49 50h8" stroke="#7fa9c9" strokeWidth={1.2} opacity={0.7} />
    </>
  );
}

// A shallow dish holding a dry mixture.
function Dish({ children }: { children?: ReactNode }) {
  return (
    <>
      <path d="M8 44h64c-2 14-14 22-32 22S10 58 8 44Z" fill="#dfe8f1" stroke="#8aa3b8" strokeWidth={1.6} />
      <ellipse cx={40} cy={44} rx={32} ry={7} fill="#eef3f8" stroke="#8aa3b8" strokeWidth={1.6} />
      {children}
    </>
  );
}

function SandAndWaterArt() {
  return (
    <>
      <Shadow rx={22} />
      <Beaker>
        <rect x={20} y={30} width={40} height={40} fill="#9fd4f5" opacity={0.85} />
        <path d="M20 54c6-3 12-3 20 0s14 3 20 0v16H20Z" fill="#e3bd76" />
        {[[26, 60], [32, 64], [38, 58], [44, 63], [50, 59], [30, 57], [47, 66]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.2} fill="#b98b3e" />
        ))}
      </Beaker>
    </>
  );
}

function SaltWaterArt() {
  return (
    <>
      <Shadow rx={22} />
      <Beaker>
        <rect x={20} y={30} width={40} height={40} fill="#b7e2fb" opacity={0.9} />
        {[[27, 40], [36, 50], [45, 38], [31, 60], [48, 56], [40, 44]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1} fill="#ffffff" opacity={0.9} />
        ))}
      </Beaker>
      <g stroke="#9aa9b8" strokeWidth={0.8}>
        <rect x={57} y={8} width={6} height={6} rx={1} fill="#ffffff" transform="rotate(15 60 11)" />
        <rect x={64} y={14} width={5} height={5} rx={1} fill="#ffffff" transform="rotate(-10 66 16)" />
        <rect x={59} y={18} width={4} height={4} rx={1} fill="#ffffff" />
      </g>
    </>
  );
}

function IronFilingsAndSandArt() {
  return (
    <>
      <Shadow rx={30} cy={70} />
      <Dish>
        <path d="M14 44c8-8 44-8 52 0-8 5-44 5-52 0Z" fill="#e3bd76" />
        <g stroke="#4a5360" strokeWidth={1.6} strokeLinecap="round">
          <path d="M24 42l3-2M33 39l3 1M42 41l2-3M50 40l3 2M29 45l3-1M46 44l2 2M38 44l3-1M55 43l2-2" />
        </g>
      </Dish>
    </>
  );
}

function PebblesAndSandArt() {
  return (
    <>
      <Shadow rx={30} cy={70} />
      <Dish>
        <path d="M14 44c8-8 44-8 52 0-8 5-44 5-52 0Z" fill="#e3bd76" />
        <ellipse cx={28} cy={40} rx={6} ry={4.5} fill="#8f969f" stroke="#666e78" strokeWidth={1} />
        <ellipse cx={43} cy={37} rx={7} ry={5} fill="#a58c72" stroke="#7a6550" strokeWidth={1} />
        <ellipse cx={55} cy={42} rx={5} ry={4} fill="#9aa1aa" stroke="#666e78" strokeWidth={1} />
        <ellipse cx={37} cy={45} rx={4.5} ry={3.2} fill="#b3a08a" stroke="#7a6550" strokeWidth={1} />
      </Dish>
    </>
  );
}

// ----- Generated from the key itself (maths) -----
// "fraction-circle-1-4" / "fraction-bar-3-4": a shape split into equal parts
// with the first N shaded. "clock-7-30": an analogue clock at that time.
// Drawing from the key means the picture can never disagree with the
// answer, and any new fraction or time needs no new artwork.

function generatedSource(key: string): JSX.Element | null {
  const fraction = /^fraction-(circle|bar)-(\d+)-(\d+)$/.exec(key);
  if (fraction) {
    return <FractionShape shape={fraction[1] as "circle" | "bar"} shaded={Number(fraction[2])} parts={Number(fraction[3])} />;
  }
  const clock = /^clock-(\d{1,2})-(\d{2})$/.exec(key);
  if (clock) {
    return <ClockFace hour={Number(clock[1])} minute={Number(clock[2])} />;
  }
  return null;
}

function FractionShape({ shape, shaded, parts }: { shape: "circle" | "bar"; shaded: number; parts: number }) {
  const fill = shape === "circle" ? "#f5a623" : "#8b5a2b";
  const empty = shape === "circle" ? "#fff4df" : "#f3e6d8";
  const stroke = shape === "circle" ? "#b86f0e" : "#5c3a1a";

  if (shape === "bar") {
    const w = 56 / parts;
    return (
      <>
        <Shadow rx={30} cy={62} />
        {Array.from({ length: parts }, (_, i) => (
          <rect key={i} x={12 + i * w} y={26} width={w} height={30} fill={i < shaded ? fill : empty} stroke={stroke} strokeWidth={1.6} />
        ))}
      </>
    );
  }

  const cx = 40, cy = 40, r = 26;
  const point = (i: number) => {
    const angle = -Math.PI / 2 + (i / parts) * Math.PI * 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  return (
    <>
      <Shadow rx={24} cy={71} />
      {Array.from({ length: parts }, (_, i) => {
        const [x1, y1] = point(i);
        const [x2, y2] = point(i + 1);
        const large = 1 / parts > 0.5 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M${cx} ${cy}L${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z`}
            fill={i < shaded ? fill : empty}
            stroke={stroke}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        );
      })}
    </>
  );
}

function ClockFace({ hour, minute }: { hour: number; minute: number }) {
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;
  return (
    <>
      <Shadow rx={22} cy={72} />
      <circle cx={40} cy={40} r={28} fill="#ffffff" stroke="#2f6fde" strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1={40}
          y1={15}
          x2={40}
          y2={i % 3 === 0 ? 20 : 18}
          stroke="#334155"
          strokeWidth={i % 3 === 0 ? 2.4 : 1.4}
          transform={`rotate(${i * 30} 40 40)`}
        />
      ))}
      <line x1={40} y1={40} x2={40} y2={26} stroke="#172b3d" strokeWidth={3.6} strokeLinecap="round" transform={`rotate(${hourAngle} 40 40)`} />
      <line x1={40} y1={40} x2={40} y2={18} stroke="#df4f93" strokeWidth={2.4} strokeLinecap="round" transform={`rotate(${minuteAngle} 40 40)`} />
      <circle cx={40} cy={40} r={2.6} fill="#172b3d" />
    </>
  );
}

// ----- Robot sensors -----

function Board({ children }: { children?: ReactNode }) {
  return (
    <>
      <Shadow rx={24} />
      <rect x={14} y={22} width={52} height={36} rx={5} fill="#1f8f5f" stroke="#136b45" strokeWidth={1.6} />
      <circle cx={19} cy={27} r={1.8} fill="#e9f5ee" />
      <circle cx={61} cy={27} r={1.8} fill="#e9f5ee" />
      <g stroke="#f5c542" strokeWidth={2} strokeLinecap="round">
        <path d="M28 58v6M36 58v6M44 58v6M52 58v6" />
      </g>
      {children}
    </>
  );
}

const sensorArt: Record<string, () => JSX.Element> = {
  "sensor-light": () => (
    <Board>
      <circle cx={40} cy={40} r={9} fill="#f7e27a" stroke="#b89a1c" strokeWidth={1.4} />
      <path d="M34 40c2-3 4 3 6 0s4 3 6 0" stroke="#b5462f" strokeWidth={1.4} fill="none" />
      <g stroke="#f5b700" strokeWidth={1.6} strokeLinecap="round">
        <path d="M40 16v-5M52 19l3-4M28 19l-3-4" />
      </g>
    </Board>
  ),
  "sensor-touch": () => (
    <Board>
      <rect x={30} y={30} width={20} height={20} rx={3} fill="#e8edf2" stroke="#6b7785" strokeWidth={1.4} />
      <circle cx={40} cy={40} r={6} fill="#e2463b" stroke="#a52a22" strokeWidth={1.2} />
    </Board>
  ),
  "sensor-sound": () => (
    <Board>
      <circle cx={40} cy={40} r={9} fill="#2b3440" stroke="#111820" strokeWidth={1.4} />
      <circle cx={40} cy={40} r={4.5} fill="#8a96a3" />
      <g stroke="#2f6fde" strokeWidth={1.6} fill="none" strokeLinecap="round">
        <path d="M56 14c3 3 3 8 0 11M61 11c5 5 5 12 0 17" />
      </g>
    </Board>
  ),
  "sensor-distance": () => (
    <Board>
      <circle cx={30} cy={40} r={8} fill="#c9d2dc" stroke="#6b7785" strokeWidth={1.4} />
      <circle cx={50} cy={40} r={8} fill="#c9d2dc" stroke="#6b7785" strokeWidth={1.4} />
      <circle cx={30} cy={40} r={4} fill="#3f4855" />
      <circle cx={50} cy={40} r={4} fill="#3f4855" />
    </Board>
  ),
};

// ----- Farm tools -----

const toolArt: Record<string, () => JSX.Element> = {
  "tool-cutlass": () => (
    <>
      <Shadow rx={26} />
      <path d="M22 58 62 18c4 2 6 6 4 10L30 62Z" fill="#d9dee5" stroke="#6b7785" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M58 22l6 6" stroke="#ffffff" strokeWidth={1.4} opacity={0.8} />
      <rect x={10} y={56} width={18} height={8} rx={3} fill="#7a4a24" transform="rotate(-45 19 60)" />
    </>
  ),
  "tool-hoe": () => (
    <>
      <Shadow rx={24} />
      <path d="M20 64 54 22" stroke="#9a6431" strokeWidth={5} strokeLinecap="round" />
      <path d="M48 22c6-6 18-6 22 2l-16 8Z" fill="#8a96a3" stroke="#56606b" strokeWidth={1.6} strokeLinejoin="round" />
    </>
  ),
  "tool-rake": () => (
    <>
      <Shadow rx={24} />
      <path d="M40 68V26" stroke="#9a6431" strokeWidth={4} strokeLinecap="round" />
      <path d="M20 24h40" stroke="#6b7785" strokeWidth={4} strokeLinecap="round" />
      <g stroke="#6b7785" strokeWidth={2.4} strokeLinecap="round">
        <path d="M22 24v-10M29 24v-10M36 24v-10M44 24v-10M51 24v-10M58 24v-10" />
      </g>
    </>
  ),
  "tool-watering-can": () => (
    <>
      <Shadow rx={26} />
      <path d="M18 34h34v24a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4Z" fill="#43b56a" stroke="#2f8f50" strokeWidth={1.6} />
      <path d="M52 44 68 28" stroke="#43b56a" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={69} cy={27} rx={4} ry={5} fill="#2f8f50" transform="rotate(45 69 27)" />
      <path d="M22 34c0-12 26-12 26 0" fill="none" stroke="#2f8f50" strokeWidth={3} />
      <g fill="#7cc4f0"><circle cx={72} cy={36} r={1.4} /><circle cx={75} cy={33} r={1.4} /><circle cx={74} cy={40} r={1.4} /></g>
    </>
  ),
  "tool-wheelbarrow": () => (
    <>
      <Shadow rx={30} />
      <path d="M14 30h40l-6 20H22Z" fill="#2f6fde" stroke="#1d4fa6" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M52 38l18-8" stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
      <path d="M26 50l-4 12M44 50l2 6" stroke="#56606b" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={22} cy={62} r={7} fill="#3f4855" stroke="#1b2a38" strokeWidth={1.4} />
      <circle cx={22} cy={62} r={2} fill="#c9d2dc" />
    </>
  ),
};

function FallbackTile({ label }: { label: string }) {
  return (
    <>
      <Shadow rx={22} />
      <rect x={16} y={16} width={48} height={48} rx={16} fill="#dbeaff" stroke="#0f6fde" strokeWidth={1.6} />
      <text
        x={40}
        y={48}
        textAnchor="middle"
        fontSize={24}
        fontWeight={700}
        fill="#1e4f7a"
        fontFamily="var(--rx-font-display), sans-serif"
      >
        {label.trim().charAt(0).toUpperCase()}
      </text>
    </>
  );
}

const sourceArt: Record<string, () => JSX.Element> = {
  fish: FishArt,
  camel: CamelArt,
  "polar-bear": PolarBearArt,
  monkey: MonkeyArt,
  owl: OwlArt,
  "sand-and-water": SandAndWaterArt,
  "salt-water": SaltWaterArt,
  "iron-filings-and-sand": IronFilingsAndSandArt,
  "pebbles-and-sand": PebblesAndSandArt,
  ...sensorArt,
  ...toolArt,
};

// ---------------------------------------------------------------------------
// Targets (wide scene banners, viewBox 0 0 160 80)
// ---------------------------------------------------------------------------

export function TargetScene({
  visualKey,
  label,
}: {
  visualKey: string;
  label: string;
}) {
  const Scene = targetScenes[visualKey] as (() => JSX.Element) | undefined;
  const generated = Scene ? null : generatedScene(visualKey);

  return (
    <svg
      viewBox="0 0 160 80"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      {Scene ? <Scene /> : generated ?? <FallbackScene label={label} />}
    </svg>
  );
}

function PondScene() {
  return (
    <>
      <rect width={160} height={80} fill="#dff1ff" />
      <rect y={34} width={160} height={46} fill="#8fd18a" />
      <ellipse cx={80} cy={58} rx={62} ry={17} fill="#4aa8e8" stroke="#2f86c4" strokeWidth={1.5} />
      <path d="M40 56c10-3 20-3 30 0M88 62c10-3 20-3 30 0" stroke="#bfe4fb" strokeWidth={2} strokeLinecap="round" fill="none" />
      <ellipse cx={104} cy={52} rx={8} ry={3.5} fill="#52b35a" />
      <g stroke="#3f8f3a" strokeWidth={2} strokeLinecap="round">
        <path d="M18 60V34M24 60V38M30 60V32M136 60V36M142 60V30" />
      </g>
      <g fill="#8a5a2b">
        <ellipse cx={30} cy={31} rx={2} ry={5} />
        <ellipse cx={142} cy={29} rx={2} ry={5} />
      </g>
    </>
  );
}

function DesertScene() {
  return (
    <>
      <rect width={160} height={80} fill="#ffeccc" />
      <circle cx={128} cy={20} r={11} fill="#ffc53d" />
      <path d="M0 52c30-14 60-14 90 0s50 10 70 2v26H0Z" fill="#f2c27a" />
      <path d="M0 64c40-10 80-8 120 2 16 4 28 2 40-2v16H0Z" fill="#e3a653" />
      <g fill="#4f9d58" stroke="#3a7a43" strokeWidth={1}>
        <rect x={34} y={36} width={7} height={26} rx={3.5} />
        <path d="M34 48h-6v-8a3 3 0 0 1 6 0Z" />
        <path d="M41 44h6v-8a3 3 0 0 0-6 0Z" />
      </g>
    </>
  );
}

function ArcticScene() {
  return (
    <>
      <rect width={160} height={80} fill="#d9efff" />
      <rect y={50} width={160} height={30} fill="#7fc3ee" />
      <path d="M0 50h60l8 8H0Z" fill="#ffffff" stroke="#b9d6ea" strokeWidth={1} />
      <path d="M90 56l10-8h60v12H96Z" fill="#ffffff" stroke="#b9d6ea" strokeWidth={1} />
      <path d="M112 48l10-22 12 22Z" fill="#f4faff" stroke="#b9d6ea" strokeWidth={1} />
      <g stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round">
        <path d="M24 16v10M19 21h10M20.5 17.5l7 7M27.5 17.5l-7 7" />
        <path d="M70 10v8M66 14h8" />
        <path d="M92 24v8M88 28h8" />
      </g>
    </>
  );
}

function RainforestScene() {
  return (
    <>
      <rect width={160} height={80} fill="#cfeedd" />
      <g fill="#6b4a2b">
        <rect x={26} y={20} width={7} height={60} />
        <rect x={82} y={14} width={8} height={66} />
        <rect x={130} y={24} width={7} height={56} />
      </g>
      <g fill="#2e9b56" stroke="#1f7a40" strokeWidth={1}>
        <ellipse cx={30} cy={18} rx={26} ry={14} />
        <ellipse cx={86} cy={12} rx={30} ry={14} />
        <ellipse cx={134} cy={20} rx={26} ry={14} />
      </g>
      <g fill="#46b86b">
        <ellipse cx={60} cy={30} rx={18} ry={9} />
        <ellipse cx={110} cy={32} rx={16} ry={8} />
      </g>
      <rect y={66} width={160} height={14} fill="#3f9a4f" />
      <path d="M50 40c6 8 4 16-2 22M112 42c-6 8-4 16 2 22" stroke="#2b7a3a" strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  );
}

function WoodlandScene() {
  return (
    <>
      <rect width={160} height={80} fill="#e5f0e0" />
      <path d="M134 10a9 9 0 1 0 8 13 7 7 0 1 1-8-13Z" fill="#f4d35e" />
      <rect y={60} width={160} height={20} fill="#8cbf6b" />
      <g fill="#7a5230">
        <rect x={24} y={36} width={6} height={28} />
        <rect x={68} y={30} width={7} height={34} />
        <rect x={112} y={38} width={6} height={26} />
      </g>
      <g fill="#4f8f45" stroke="#3a6f33" strokeWidth={1}>
        <circle cx={27} cy={30} r={15} />
        <circle cx={71} cy={24} r={18} />
        <circle cx={115} cy={32} r={14} />
      </g>
    </>
  );
}

// ----- Separation methods (Separating Mixtures) -----

function FilteringScene() {
  return (
    <>
      <rect width={160} height={80} fill="#eef7fd" />
      <path d="M56 20h48l-18 18h-12Z" fill="#ffffff" stroke="#7fa9c9" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M62 22h36l-14 14h-8Z" fill="#fbf6ea" stroke="#d9c9a4" strokeWidth={1} />
      <path d="M66 24c6-2 22-2 28 0-5 4-23 4-28 0Z" fill="#e3bd76" />
      <rect x={76} y={38} width={8} height={7} fill="#ffffff" stroke="#7fa9c9" strokeWidth={1.4} />
      <circle cx={80} cy={48} r={1.6} fill="#6bbcf0" />
      <path d="M60 51h40v10a3 3 0 0 1-3 3H63a3 3 0 0 1-3-3Z" fill="#f2f9ff" stroke="#7fa9c9" strokeWidth={1.6} />
      <rect x={61} y={56} width={38} height={7} fill="#9fd4f5" opacity={0.85} />
    </>
  );
}

function EvaporatingScene() {
  return (
    <>
      <rect width={160} height={80} fill="#fff4e8" />
      <g stroke="#c9b8a4" strokeWidth={1.8} strokeLinecap="round" fill="none">
        <path d="M70 18c-3 3 3 5 0 9M80 16c-3 3 3 5 0 9M90 18c-3 3 3 5 0 9" />
      </g>
      <path d="M60 30h40c-2 7-9 10-20 10s-18-3-20-10Z" fill="#f4f7fa" stroke="#8aa3b8" strokeWidth={1.6} />
      <g fill="#ffffff" stroke="#9aa9b8" strokeWidth={0.8}>
        <rect x={71} y={31} width={4} height={4} rx={0.8} />
        <rect x={78} y={32} width={4} height={4} rx={0.8} />
        <rect x={85} y={31} width={4} height={4} rx={0.8} />
      </g>
      <g stroke="#6b7785" strokeWidth={2.2} strokeLinecap="round">
        <path d="M58 42h44M63 42l-3 20M97 42l3 20" />
      </g>
      <path d="M80 61c-5-3-4-9 0-13 4 4 5 10 0 13Z" fill="#ff9a3c" />
      <path d="M80 61c-2.5-2-2.5-5 0-7.5 2.5 2.5 2.5 5.5 0 7.5Z" fill="#ffd23f" />
    </>
  );
}

function MagnetScene() {
  return (
    <>
      <rect width={160} height={80} fill="#eef2ff" />
      {/* Horseshoe magnet, poles pointing down at the mixture. */}
      <path d="M66 44V32a14 14 0 0 1 28 0v12" fill="none" stroke="#e2463b" strokeWidth={8} />
      <rect x={62} y={43} width={8} height={6} fill="#c9d2dc" stroke="#8a97a6" strokeWidth={1} />
      <rect x={90} y={43} width={8} height={6} fill="#c9d2dc" stroke="#8a97a6" strokeWidth={1} />
      <g stroke="#3f4855" strokeWidth={1.3} strokeLinecap="round">
        <path d="M63 50l-1 4M66 50l0 5M69 50l1 4M91 50l-1 4M94 50l0 5M97 50l1 4" />
      </g>
      <path d="M44 64c10-9 62-9 72 0Z" fill="#e3bd76" />
    </>
  );
}

function SievingScene() {
  return (
    <>
      <rect width={160} height={80} fill="#f2f8ec" />
      <path d="M52 20h56c-2 11-12 16-28 16S54 31 52 20Z" fill="#dfe6ec" stroke="#7d8a97" strokeWidth={1.6} />
      <g stroke="#9aa6b2" strokeWidth={0.8} opacity={0.9}>
        <path d="M60 21l3 10M68 21l2 13M76 21l1 14M84 21l-1 14M92 21l-2 13M100 21l-3 10" />
        <path d="M55 25h50M58 30h44" />
      </g>
      <path d="M108 20h18" stroke="#7d8a97" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={70} cy={21} rx={5.5} ry={3} fill="#8f969f" />
      <ellipse cx={82} cy={19.5} rx={5.5} ry={3} fill="#a58c72" />
      <ellipse cx={93} cy={21} rx={4.5} ry={2.6} fill="#9aa1aa" />
      {[[74, 40], [82, 43], [88, 39], [78, 46], [85, 48]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.3} fill="#c9a15c" />
      ))}
      <path d="M60 52h40c-2 7-9 10-20 10s-18-3-20-10Z" fill="#dfe8f1" stroke="#8aa3b8" strokeWidth={1.4} />
      <path d="M65 54c8-3 22-3 30 0-8 2-22 2-30 0Z" fill="#e3bd76" />
    </>
  );
}

// ----- Generated scenes (maths): "fraction-3-4" -> ¾ written large;
// "clock-7-30" -> a digital display reading 7:30.

function generatedScene(key: string): JSX.Element | null {
  const fraction = /^fraction-(\d+)-(\d+)$/.exec(key);
  if (fraction) {
    return (
      <>
        <rect width={160} height={80} fill="#fff4df" />
        <g fontFamily="var(--rx-font-display), sans-serif" fontWeight={800} fill="#b86f0e" textAnchor="middle">
          <text x={80} y={36} fontSize={18}>{fraction[1]}</text>
          <text x={80} y={58} fontSize={18}>{fraction[2]}</text>
        </g>
        <path d="M71 41h18" stroke="#b86f0e" strokeWidth={3} strokeLinecap="round" />
      </>
    );
  }
  const clock = /^clock-(\d{1,2})-(\d{2})$/.exec(key);
  if (clock) {
    return (
      <>
        <rect width={160} height={80} fill="#eef4ff" />
        <rect x={50} y={24} width={60} height={32} rx={6} fill="#172b3d" />
        <text
          x={80}
          y={47}
          textAnchor="middle"
          fontSize={18}
          fontWeight={700}
          fill="#6fb4ff"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {`${clock[1]}:${clock[2]}`}
        </text>
      </>
    );
  }
  return null;
}

// ----- Robot jobs -----

function RobotSprite({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={4} width={22} height={14} rx={4} fill="#2f6fde" stroke="#1d4fa6" strokeWidth={1.2} />
      <rect x={5} y={-4} width={12} height={9} rx={3} fill="#6fb4ff" stroke="#1d4fa6" strokeWidth={1.2} />
      <circle cx={9} cy={0.5} r={1.4} fill="#172b3d" />
      <circle cx={13} cy={0.5} r={1.4} fill="#172b3d" />
      <circle cx={5} cy={19} r={3.2} fill="#3f4855" />
      <circle cx={17} cy={19} r={3.2} fill="#3f4855" />
    </g>
  );
}

const jobScenes: Record<string, () => JSX.Element> = {
  "job-headlights": () => (
    <>
      <rect width={160} height={80} fill="#1f2d4a" />
      <circle cx={128} cy={24} r={7} fill="#f4d35e" />
      <circle cx={131} cy={22} r={6} fill="#1f2d4a" />
      <rect y={58} width={160} height={22} fill="#2c3b5a" />
      <path d="M86 44l40-10v26Z" fill="#fff3a6" opacity={0.55} />
      <RobotSprite x={62} y={36} />
      <circle cx={84} cy={44} r={2} fill="#fff3a6" />
    </>
  ),
  "job-bump": () => (
    <>
      <rect width={160} height={80} fill="#eef4ff" />
      <rect x={100} y={18} width={14} height={46} fill="#c7a17a" stroke="#8a6440" strokeWidth={1.2} />
      <rect y={60} width={160} height={20} fill="#dde6ef" />
      <RobotSprite x={76} y={38} />
      <path d="M98 34l-4-5M98 44l-6 0M98 54l-4 5" stroke="#e2463b" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  "job-clap": () => (
    <>
      <rect width={160} height={80} fill="#fff6e8" />
      <rect y={60} width={160} height={20} fill="#f1e2c8" />
      <RobotSprite x={100} y={38} />
      <g fill="#e8b98f" stroke="#a8764a" strokeWidth={1.2}>
        <ellipse cx={48} cy={38} rx={7} ry={11} transform="rotate(-20 48 38)" />
        <ellipse cx={58} cy={38} rx={7} ry={11} transform="rotate(20 58 38)" />
      </g>
      <g stroke="#e8900c" strokeWidth={1.8} strokeLinecap="round" fill="none">
        <path d="M53 22v-6M44 24l-4-4M62 24l4-4M70 34c4 2 6 6 6 10" />
      </g>
    </>
  ),
  "job-slow-down": () => (
    <>
      <rect width={160} height={80} fill="#eef8f2" />
      <rect x={122} y={18} width={14} height={46} fill="#c7a17a" stroke="#8a6440" strokeWidth={1.2} />
      <rect y={60} width={160} height={20} fill="#d7ece0" />
      <RobotSprite x={50} y={38} />
      <path d="M76 44h38" stroke="#12a383" strokeWidth={2} strokeDasharray="4 3" />
      <path d="M110 40l6 4-6 4" fill="none" stroke="#12a383" strokeWidth={2} strokeLinecap="round" />
      <path d="M78 36c3 3 3 13 0 16M84 33c5 5 5 17 0 22" stroke="#7fd3ae" strokeWidth={1.6} fill="none" />
    </>
  ),
  // ----- Farm jobs -----
  "job-clearing": () => (
    <>
      <rect width={160} height={80} fill="#e8f5e1" />
      <rect y={58} width={160} height={22} fill="#a8794a" />
      <g stroke="#3f8f3a" strokeWidth={2.2} strokeLinecap="round">
        <path d="M30 60l-6-24M36 60l0-28M42 60l6-22M96 60l-6-20M102 60l0-26M108 60l6-20M120 60l4-16" />
      </g>
      <path d="M62 58l12-2" stroke="#6b8f3a" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  "job-ridges": () => (
    <>
      <rect width={160} height={80} fill="#fdf1e0" />
      <path d="M0 62c10-16 26-16 36 0s26-16 36 0 26-16 36 0 26-16 36 0 26-16 36 0v18H0Z" fill="#9c6b3c" />
      <path d="M0 62c10-16 26-16 36 0s26-16 36 0 26-16 36 0 26-16 36 0 26-16 36 0" fill="none" stroke="#7a522c" strokeWidth={1.4} />
      <g stroke="#3f8f3a" strokeWidth={2} strokeLinecap="round"><path d="M18 50v-8M54 50v-8M90 50v-8M126 50v-8" /></g>
    </>
  ),
  "job-gathering": () => (
    <>
      <rect width={160} height={80} fill="#fbf3e4" />
      <rect y={60} width={160} height={20} fill="#c9a36b" />
      <path d="M58 60c4-14 40-14 44 0Z" fill="#d98b2b" />
      <g fill="#e8a33d" stroke="#b4731c" strokeWidth={0.8}>
        <ellipse cx={34} cy={56} rx={5} ry={2.5} transform="rotate(-20 34 56)" />
        <ellipse cx={120} cy={54} rx={5} ry={2.5} transform="rotate(25 120 54)" />
        <ellipse cx={132} cy={58} rx={5} ry={2.5} />
      </g>
    </>
  ),
  "job-watering": () => (
    <>
      <rect width={160} height={80} fill="#e8f4ff" />
      <rect y={58} width={160} height={22} fill="#9c6b3c" />
      <g stroke="#3f8f3a" strokeWidth={2} strokeLinecap="round" fill="#52b35a">
        <path d="M50 58v-12" /><ellipse cx={46} cy={45} rx={4} ry={2} /><ellipse cx={54} cy={45} rx={4} ry={2} />
        <path d="M80 58v-14" /><ellipse cx={76} cy={43} rx={4} ry={2} /><ellipse cx={84} cy={43} rx={4} ry={2} />
        <path d="M110 58v-12" /><ellipse cx={106} cy={45} rx={4} ry={2} /><ellipse cx={114} cy={45} rx={4} ry={2} />
      </g>
      <g fill="#6bbcf0"><circle cx={70} cy={24} r={1.8} /><circle cx={80} cy={30} r={1.8} /><circle cx={90} cy={22} r={1.8} /><circle cx={100} cy={28} r={1.8} /></g>
    </>
  ),
  "job-carrying": () => (
    <>
      <rect width={160} height={80} fill="#fff6e8" />
      <rect y={60} width={160} height={20} fill="#d8b98a" />
      <g fill="#8b5a2b" stroke="#5c3a1a" strokeWidth={1}>
        <ellipse cx={66} cy={50} rx={10} ry={6} transform="rotate(-15 66 50)" />
        <ellipse cx={86} cy={48} rx={11} ry={6} transform="rotate(10 86 48)" />
        <ellipse cx={76} cy={40} rx={10} ry={5.5} />
      </g>
      <path d="M50 58h60" stroke="#9c6b3c" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
};

function FallbackScene({ label }: { label: string }) {
  return (
    <>
      <rect width={160} height={80} fill="#eaf3ff" />
      <text
        x={80}
        y={50}
        textAnchor="middle"
        fontSize={30}
        fontWeight={800}
        fill="#8fb8d8"
        fontFamily="var(--rx-font-display), sans-serif"
      >
        {label.trim().charAt(0).toUpperCase()}
      </text>
    </>
  );
}

const targetScenes: Record<string, () => JSX.Element> = {
  pond: PondScene,
  desert: DesertScene,
  arctic: ArcticScene,
  rainforest: RainforestScene,
  woodland: WoodlandScene,
  filtering: FilteringScene,
  evaporating: EvaporatingScene,
  "using-a-magnet": MagnetScene,
  sieving: SievingScene,
  ...jobScenes,
};
