import type { JSX } from "react";

import { RHINOBOT_IMAGE } from "@/lib/rhinobot/config";

// Original artwork for RhinoBot: Robot Programming Lab. Pure SVG, each sprite
// fills one grid cell (viewBox 48 x 48).

export function RhinoBotArt({ size = "100%" }: { size?: number | string }) {
  if (RHINOBOT_IMAGE) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={RHINOBOT_IMAGE} alt="" width={size} height={size} style={{ display: "block", objectFit: "contain", width: size, height: size }} />;
  }
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <ellipse cx={24} cy={44} rx={13} ry={2.6} fill="rgba(15, 42, 68, 0.2)" />
      {/* ears */}
      <path d="M11.5 12.5 8 6.8c-.5-1 .6-1.9 1.5-1.3l6.3 4.2Z" fill="#7aa7e8" stroke="#1b4a8f" strokeWidth={1.1} strokeLinejoin="round" />
      <path d="M36.5 12.5 40 6.8c.5-1-.6-1.9-1.5-1.3l-6.3 4.2Z" fill="#7aa7e8" stroke="#1b4a8f" strokeWidth={1.1} strokeLinejoin="round" />
      {/* horn */}
      <path d="M24 2.6 27.6 11h-7.2Z" fill="#f5a623" stroke="#b36b00" strokeWidth={1.1} strokeLinejoin="round" />
      <path d="M24 5.2 25.4 8.6h-2.8Z" fill="#ffd27a" />
      {/* head */}
      <rect x={9.5} y={9.5} width={29} height={19.5} rx={8.5} fill="#e9f2ff" stroke="#1b4a8f" strokeWidth={1.4} />
      <rect x={13} y={13.5} width={22} height={11.5} rx={5.5} fill="#0f2a44" />
      <circle cx={19.2} cy={19.2} r={2.5} fill="#5fe0ff" />
      <circle cx={28.8} cy={19.2} r={2.5} fill="#5fe0ff" />
      <circle cx={19.9} cy={18.5} r={0.8} fill="#ffffff" />
      <circle cx={29.5} cy={18.5} r={0.8} fill="#ffffff" />
      <path d="M21 23.2c1.8 1 4.2 1 6 0" fill="none" stroke="#5fe0ff" strokeWidth={1.1} strokeLinecap="round" />
      {/* body */}
      <rect x={14} y={29.5} width={20} height={9} rx={4} fill="#2f6fde" stroke="#1b4a8f" strokeWidth={1.3} />
      <circle cx={24} cy={34} r={2.2} fill="#7ee0a1" stroke="#1f9d55" strokeWidth={0.8} />
      {/* arms and tracks */}
      <rect x={8.8} y={30.5} width={4.4} height={7} rx={2.2} fill="#1b4a8f" />
      <rect x={34.8} y={30.5} width={4.4} height={7} rx={2.2} fill="#1b4a8f" />
      <rect x={13} y={38.4} width={8} height={4.4} rx={2.2} fill="#334155" />
      <rect x={27} y={38.4} width={8} height={4.4} rx={2.2} fill="#334155" />
    </svg>
  );
}

const cellArt: Record<string, () => JSX.Element> = {
  goal: () => (
    <>
      <ellipse cx={24} cy={39} rx={14} ry={4.4} fill="rgba(31, 157, 85, 0.25)" />
      <rect x={14.5} y={7} width={2.8} height={32} rx={1.4} fill="#475569" />
      <path d="M17.3 8.5h18l-5 7 5 7h-18Z" fill="#1f9d55" stroke="#14733d" strokeWidth={1.2} strokeLinejoin="round" />
    </>
  ),
  base: () => (
    <>
      <rect x={6} y={7} width={36} height={34} rx={7} fill="none" stroke="#0f6fde" strokeWidth={2} strokeDasharray="4 3.2" opacity={0.7} />
      <text x={24} y={44.5} textAnchor="middle" fontSize={7.4} fontWeight={800} fill="#1b4a8f" opacity={0.85}>BASE</text>
    </>
  ),
  item: () => (
    <>
      <ellipse cx={24} cy={40} rx={11} ry={3} fill="rgba(15, 42, 68, 0.18)" />
      <rect x={13} y={13} width={22} height={25} rx={4.5} fill="#ffd45a" stroke="#b58300" strokeWidth={1.3} />
      <rect x={19.5} y={9} width={9} height={5} rx={1.6} fill="#b58300" />
      <path d="M25.5 17.5 19.5 27h4.2l-1.4 7.5 7.2-10h-4.4Z" fill="#ffffff" stroke="#b58300" strokeWidth={0.8} strokeLinejoin="round" />
    </>
  ),
  charger: () => (
    <>
      <ellipse cx={24} cy={39} rx={15} ry={4.8} fill="rgba(15, 111, 222, 0.22)" />
      <rect x={11.5} y={12} width={25} height={26} rx={6} fill="#e9f2ff" stroke="#1b4a8f" strokeWidth={1.5} />
      <rect x={16} y={16.5} width={16} height={9} rx={2.5} fill="#0f2a44" />
      <path d="M25.2 17.6 20.6 24h3.6l-1 4.6 5-6.2h-3.5Z" fill="#ffd45a" />
      <circle cx={24} cy={32.2} r={2.2} fill="#7ee0a1" stroke="#1f9d55" strokeWidth={0.8} />
    </>
  ),
  rock: () => (
    <>
      <ellipse cx={24} cy={41} rx={17} ry={3} fill="rgba(15, 42, 68, 0.16)" />
      <path d="M7 40c-1-7 3-13 9-14 3-6 11-8 16-3 6 0 10 6 9 12l-1 5Z" fill="#8a96a3" stroke="#56606b" strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M17 27c2 3 6 4 9 2M31 24c-1 4 1 8 5 9" fill="none" stroke="#6b7785" strokeWidth={1.1} strokeLinecap="round" />
      <path d="M12 33c3 1 5 0 6-2" fill="none" stroke="#a9b3bd" strokeWidth={1.1} strokeLinecap="round" />
    </>
  ),
};

export function CellArt({ kind }: { kind: "goal" | "base" | "item" | "charger" | "rock" }) {
  const Art = cellArt[kind];
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{ display: "block", width: "100%", height: "100%" }}>
      <Art />
    </svg>
  );
}
