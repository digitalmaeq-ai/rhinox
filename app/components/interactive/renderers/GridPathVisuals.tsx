import type { JSX } from "react";

// Visual library for GridPathRenderer — pure SVG, looked up by visual key
// (`properties.visual`, or derived from the label). Every sprite fills one
// grid cell (viewBox 48 × 48). Unknown keys fall back to a neutral tile.

export function GridSprite({ visualKey }: { visualKey: string }) {
  const Art = spriteArt[visualKey] as (() => JSX.Element) | undefined;

  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      {Art ? <Art /> : <rect x={8} y={8} width={32} height={32} rx={8} fill="#dbeaff" stroke="#0f6fde" strokeWidth={1.4} />}
    </svg>
  );
}

const ARROW_ROTATION = { up: 0, right: 90, down: 180, left: 270 } as const;

export function CommandArrow({
  direction,
  size = 22,
}: {
  direction: keyof typeof ARROW_ROTATION;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block", flex: "0 0 auto" }}>
      <g transform={`rotate(${ARROW_ROTATION[direction]} 12 12)`}>
        <path d="M12 3 20 12h-5v9H9v-9H4Z" fill="currentColor" />
      </g>
    </svg>
  );
}

const spriteArt: Record<string, () => JSX.Element> = {
  // A small friendly robot with a horn on its head.
  robot: () => (
    <>
      <ellipse cx={24} cy={43} rx={12} ry={2.6} fill="rgba(15, 42, 68, 0.18)" />
      <path d="M24 5.5 26.5 11h-5Z" fill="#f5b400" stroke="#b58300" strokeWidth={0.8} strokeLinejoin="round" />
      <rect x={11} y={10.5} width={26} height={17} rx={7} fill="#0f6fde" stroke="#0f5f9c" strokeWidth={1.2} />
      <rect x={15} y={14} width={18} height={10} rx={4.5} fill="#e8f5ff" />
      <circle cx={20} cy={19} r={2.2} fill="#0f2a44" />
      <circle cx={28} cy={19} r={2.2} fill="#0f2a44" />
      <circle cx={20.7} cy={18.3} r={0.7} fill="#ffffff" />
      <circle cx={28.7} cy={18.3} r={0.7} fill="#ffffff" />
      <rect x={14} y={28.5} width={20} height={11} rx={4} fill="#1b7ed0" stroke="#0f5f9c" strokeWidth={1.2} />
      <circle cx={24} cy={34} r={2.4} fill="#7ee0a1" />
      <rect x={9} y={30} width={4.5} height={7} rx={2.2} fill="#0f5f9c" />
      <rect x={34.5} y={30} width={4.5} height={7} rx={2.2} fill="#0f5f9c" />
      <circle cx={18} cy={41} r={2.6} fill="#334155" />
      <circle cx={30} cy={41} r={2.6} fill="#334155" />
    </>
  ),
  // The goal: a charging pad with a lightning bolt.
  charger: () => (
    <>
      <ellipse cx={24} cy={38} rx={16} ry={5} fill="#1f9d55" opacity={0.25} />
      <ellipse cx={24} cy={35} rx={15} ry={5.5} fill="#ffffff" stroke="#1f9d55" strokeWidth={1.6} />
      <path d="M26 8 15 26h8l-3 12 13-19h-8Z" fill="#f5c542" stroke="#b8961e" strokeWidth={1.2} strokeLinejoin="round" />
    </>
  ),
  // A wall: a pile of rocks.
  rock: () => (
    <>
      <ellipse cx={24} cy={41} rx={17} ry={3} fill="rgba(15, 42, 68, 0.16)" />
      <path d="M7 40c-1-7 3-13 9-14 3-6 11-8 16-3 6 0 10 6 9 12l-1 5Z" fill="#8a96a3" stroke="#56606b" strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M17 27c2 3 6 4 9 2M31 24c-1 4 1 8 5 9" fill="none" stroke="#6b7785" strokeWidth={1.1} strokeLinecap="round" />
      <path d="M12 33c3 1 5 0 6-2" fill="none" stroke="#a9b3bd" strokeWidth={1.1} strokeLinecap="round" />
    </>
  ),
};
