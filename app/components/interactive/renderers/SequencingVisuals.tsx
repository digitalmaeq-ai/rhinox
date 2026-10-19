import type { JSX } from "react";

// Visual library for SequencingRenderer — pure SVG, looked up by visual key
// (`properties.visual`, or derived from the label); unknown keys fall back
// to a neutral lettered tile. Same pattern as the Sorting and Matching
// libraries; key helpers live in shared/visualKeys.ts.

export function StepVisual({
  visualKey,
  label,
  size = 44,
  glyph,
}: {
  visualKey: string;
  label: string;
  size?: number;
  /** Optional emoji used when there is no hand-drawn art for the step. */
  glyph?: string;
}) {
  const Art = stepArt[visualKey] as (() => JSX.Element) | undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible" }}
    >
      {Art ? <Art /> : glyph ? <GlyphTile glyph={glyph} /> : <FallbackTile label={label} />}
    </svg>
  );
}

function GlyphTile({ glyph }: { glyph: string }) {
  return (
    <>
      <rect width={48} height={48} rx={10} fill="#eef5ff" />
      <text x={24} y={25} textAnchor="middle" dominantBaseline="central" fontSize={28}>
        {glyph}
      </text>
    </>
  );
}

function Ground() {
  return <path d="M2 36h44v8H2Z" fill="#a8794a" />;
}

const stepArt: Record<string, () => JSX.Element> = {
  // Planting maize.
  "clear-the-land": () => (
    <>
      <rect width={48} height={48} rx={10} fill="#e8f5e1" />
      <Ground />
      <g stroke="#3f8f3a" strokeWidth={2} strokeLinecap="round"><path d="M10 36l-2-12M14 36l1-14M34 36l2-10" /></g>
      <path d="M20 30 40 12c2 1 3 3 2 5L24 34Z" fill="#d9dee5" stroke="#6b7785" strokeWidth={1.2} />
    </>
  ),
  "dig-a-hole": () => (
    <>
      <rect width={48} height={48} rx={10} fill="#fdf1e0" />
      <Ground />
      <ellipse cx={24} cy={37} rx={9} ry={3.5} fill="#5c3a1a" />
      <path d="M30 32 40 10" stroke="#9a6431" strokeWidth={3} strokeLinecap="round" />
      <path d="M26 30l6 4 3-6-6-3Z" fill="#8a96a3" stroke="#56606b" strokeWidth={1} />
    </>
  ),
  "drop-in-the-seeds": () => (
    <>
      <rect width={48} height={48} rx={10} fill="#fff8e0" />
      <Ground />
      <ellipse cx={24} cy={37} rx={9} ry={3.5} fill="#5c3a1a" />
      <g fill="#f5c542" stroke="#b8961e" strokeWidth={0.8}>
        <ellipse cx={22} cy={22} rx={2.4} ry={3} />
        <ellipse cx={27} cy={27} rx={2.4} ry={3} />
        <ellipse cx={23} cy={32} rx={2.4} ry={3} />
      </g>
    </>
  ),
  "cover-with-soil": () => (
    <>
      <rect width={48} height={48} rx={10} fill="#fdf1e0" />
      <path d="M2 36c6-8 38-8 44 0v8H2Z" fill="#9c6b3c" />
      <path d="M14 30c4-6 16-6 20 0" fill="none" stroke="#7a522c" strokeWidth={1.4} />
      <g stroke="#56606b" strokeWidth={1.2} fill="#8a96a3"><path d="M30 18 38 10" /><path d="M26 22l6-2-2 6Z" /></g>
    </>
  ),
  "water-the-soil": () => (
    <>
      <rect width={48} height={48} rx={10} fill="#e8f4ff" />
      <path d="M2 36c6-8 38-8 44 0v8H2Z" fill="#9c6b3c" />
      <g fill="#6bbcf0"><circle cx={18} cy={20} r={1.8} /><circle cx={24} cy={25} r={1.8} /><circle cx={30} cy={19} r={1.8} /><circle cx={21} cy={29} r={1.8} /><circle cx={28} cy={30} r={1.8} /></g>
      <path d="M12 8h14v8H12Z" fill="#43b56a" stroke="#2f8f50" strokeWidth={1} />
      <path d="M26 12l8 4" stroke="#43b56a" strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
};

function FallbackTile({ label }: { label: string }) {
  return (
    <>
      <rect width={48} height={48} rx={10} fill="#dbeaff" stroke="#0f6fde" strokeWidth={1.2} />
      <text
        x={24}
        y={31}
        textAnchor="middle"
        fontSize={18}
        fontWeight={700}
        fill="#1e4f7a"
        fontFamily="var(--rx-font-display), sans-serif"
      >
        {label.trim().charAt(0).toUpperCase()}
      </text>
    </>
  );
}
