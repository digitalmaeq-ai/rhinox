import type { JSX } from "react";

// Visual library for LabellingRenderer — pure SVG, looked up by visual key
// (`properties.visual`, or derived from the label). Unknown keys fall back
// to a plain board (diagram) or a lettered tile (label), so new content
// works before any art is drawn. Key helpers live in shared/visualKeys.ts.
//
// Diagrams are drawn on a 160 × 100 canvas that fills the whole diagram
// box (16:10). Spot positions in content are percentages of that box, so
// x% maps to x * 1.6 and y% to y on this canvas.

export function DiagramVisual({ visualKey, label }: { visualKey: string; label: string }) {
  const Art = diagramArt[visualKey] as (() => JSX.Element) | undefined;

  return (
    <svg
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
      focusable="false"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    >
      {Art ? <Art /> : <rect width={160} height={100} rx={4} fill="#eef6fd" />}
    </svg>
  );
}

export function LabelIcon({ visualKey, size = 26 }: { visualKey: string; size?: number }) {
  const Art = labelArt[visualKey] as (() => JSX.Element) | undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flex: "0 0 auto", overflow: "visible" }}
    >
      {Art ? <Art /> : <rect width={48} height={48} rx={12} fill="#dbeaff" stroke="#0f6fde" strokeWidth={1.4} />}
    </svg>
  );
}

// ---------- Diagrams ----------

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-0.8} y={1} width={1.6} height={3.5} fill="#8a5a2b" />
      <circle cx={0} cy={0} r={3.6} fill="#3f9a4a" />
      <circle cx={-1.2} cy={-1} r={1.6} fill="#57b35f" />
    </g>
  );
}

function Hut({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-3.5} y={-1} width={7} height={5} fill="#e9c48f" stroke="#a9794a" strokeWidth={0.4} />
      <path d="M-5 -0.6 0 -5 5 -0.6Z" fill="#b5652e" />
      <rect x={-0.9} y={1.2} width={1.8} height={2.8} fill="#7a4a22" />
    </g>
  );
}

function CompassRose({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={12.5} fill="#ffffff" stroke="#1e4f7a" strokeWidth={0.6} opacity={0.95} />
      <path d="M0 -6.5 1.6 -1.6 0 0 -1.6 -1.6Z" fill="#e0483e" />
      <path d="M0 6.5 1.6 1.6 0 0 -1.6 1.6Z" fill="#1e4f7a" />
      <path d="M6.5 0 1.6 1.6 0 0 1.6 -1.6Z" fill="#1e4f7a" />
      <path d="M-6.5 0 -1.6 1.6 0 0 -1.6 -1.6Z" fill="#1e4f7a" />
      <g
        fontSize={3.4}
        fontWeight={800}
        textAnchor="middle"
        fontFamily="var(--rx-font-display), sans-serif"
        fill="#0f2a44"
      >
        <text x={0} y={-7.6}>N</text>
        <text x={0} y={10.2}>S</text>
        <text x={9.3} y={1.2}>E</text>
        <text x={-9.3} y={1.2}>W</text>
      </g>
    </g>
  );
}

const diagramArt: Record<string, () => JSX.Element> = {
  // A village with the market in the centre and a road out in each
  // direction. The four empty plots at the road ends are where the spots
  // sit (content: N 50/18, E 82/50, S 50/82, W 18/50).
  "village-map": () => (
    <>
      <rect width={160} height={100} fill="#dff0c9" />
      <g fill="#cfe6b3">
        <ellipse cx={24} cy={16} rx={20} ry={10} />
        <ellipse cx={136} cy={86} rx={22} ry={11} />
        <ellipse cx={22} cy={88} rx={16} ry={8} />
      </g>

      {/* Roads */}
      <g stroke="#e8cf9c" strokeWidth={7} strokeLinecap="round">
        <path d="M80 50V10" />
        <path d="M80 50V90" />
        <path d="M80 50H14" />
        <path d="M80 50H146" />
      </g>
      <g stroke="#d9b877" strokeWidth={0.5} strokeDasharray="2 2">
        <path d="M80 44V12M80 56V88M74 50H16M86 50H144" />
      </g>

      {/* Market in the centre */}
      <circle cx={80} cy={50} r={11} fill="#f4e2b8" stroke="#c9a15a" strokeWidth={0.6} />
      <g>
        <rect x={72.5} y={45} width={6.5} height={4.5} fill="#ffffff" stroke="#b58a3e" strokeWidth={0.3} />
        <path d="M71.8 45h8l-0.6-2.4h-6.8Z" fill="#e0483e" />
        <rect x={81} y={45} width={6.5} height={4.5} fill="#ffffff" stroke="#b58a3e" strokeWidth={0.3} />
        <path d="M80.3 45h8l-0.6-2.4h-6.8Z" fill="#f5b400" />
        <rect x={76.7} y={52.5} width={6.5} height={4.5} fill="#ffffff" stroke="#b58a3e" strokeWidth={0.3} />
        <path d="M76 52.5h8l-0.6-2.4h-6.8Z" fill="#0f6fde" />
      </g>
      <rect x={70} y={60.5} width={20} height={5.2} rx={2.6} fill="#ffffff" stroke="#c9a15a" strokeWidth={0.4} />
      <text
        x={80}
        y={64.3}
        textAnchor="middle"
        fontSize={3.6}
        fontWeight={800}
        fill="#6b4a12"
        fontFamily="var(--rx-font-display), sans-serif"
      >
        MARKET
      </text>

      {/* Houses and trees in the corners, away from the four plots */}
      <Hut x={52} y={30} />
      <Hut x={108} y={70} />
      <Hut x={106} y={30} />
      <Hut x={54} y={72} />
      <Tree x={40} y={24} />
      <Tree x={62} y={20} s={0.9} />
      <Tree x={120} y={24} />
      <Tree x={36} y={76} s={0.9} />
      <Tree x={122} y={78} />
      <Tree x={98} y={82} s={0.8} />
      <Tree x={10} y={10} s={0.8} />
      <Tree x={150} y={94} s={0.8} />

      <CompassRose x={144} y={16} />
    </>
  ),
};

// ---------- Label icons ----------

const labelArt: Record<string, () => JSX.Element> = {
  school: () => (
    <>
      <rect width={48} height={48} rx={12} fill="#eaf4ff" />
      <path d="M8 22 24 12l16 10Z" fill="#c0392b" />
      <rect x={10} y={22} width={28} height={16} fill="#f6d78b" stroke="#b58a3e" strokeWidth={1} />
      <rect x={21} y={28} width={6} height={10} fill="#7a4a22" />
      <rect x={13} y={26} width={5} height={5} fill="#9fd3fb" />
      <rect x={30} y={26} width={5} height={5} fill="#9fd3fb" />
      <path d="M24 12V4" stroke="#56606b" strokeWidth={1.2} />
      <path d="M24 4h7v4h-7Z" fill="#1f9d55" />
    </>
  ),
  hospital: () => (
    <>
      <rect width={48} height={48} rx={12} fill="#fff0f0" />
      <rect x={9} y={14} width={30} height={24} fill="#ffffff" stroke="#9aa6b2" strokeWidth={1.2} />
      <rect x={21} y={17} width={6} height={14} fill="#e0483e" />
      <rect x={17} y={21} width={14} height={6} fill="#e0483e" />
      <rect x={20} y={32} width={8} height={6} fill="#9fd3fb" stroke="#9aa6b2" strokeWidth={0.6} />
    </>
  ),
  river: () => (
    <>
      <rect width={48} height={48} rx={12} fill="#e8f7ff" />
      <path d="M4 14c7-4 13 4 20 0s13 4 20 0v20c-7 4-13-4-20 0S11 30 4 34Z" fill="#4aa8e8" />
      <g fill="none" stroke="#bfe6ff" strokeWidth={1.6} strokeLinecap="round">
        <path d="M9 22c4-2 7 2 11 0" />
        <path d="M26 27c4-2 7 2 11 0" />
      </g>
    </>
  ),
  farm: () => (
    <>
      <rect width={48} height={48} rx={12} fill="#f1f8e6" />
      <path d="M4 34h40v8H4Z" fill="#9c6b3c" />
      <g stroke="#3f8f3a" strokeWidth={2} strokeLinecap="round">
        <path d="M12 34V20M24 34V16M36 34V20" />
      </g>
      <g fill="#57b35f">
        <path d="M12 24c-4-1-6-4-6-6 3 0 5 2 6 6ZM12 26c4-1 6-4 6-6-3 0-5 2-6 6Z" />
        <path d="M24 20c-4-1-6-4-6-6 3 0 5 2 6 6ZM24 22c4-1 6-4 6-6-3 0-5 2-6 6Z" />
        <path d="M36 24c-4-1-6-4-6-6 3 0 5 2 6 6ZM36 26c4-1 6-4 6-6-3 0-5 2-6 6Z" />
      </g>
      <circle cx={38} cy={9} r={4} fill="#f5c542" />
    </>
  ),
};
