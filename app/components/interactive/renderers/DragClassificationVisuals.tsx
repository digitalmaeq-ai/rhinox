import type { JSX } from "react";

import { useSvgId } from "@/app/components/interactive/shared/visualKeys";

// Visual library for DragClassificationRenderer — pure SVG, no images, no
// external assets. Kept in its own file so the renderer stays focused on
// interaction logic.
//
// Everything here is looked up by a *visual key*, never by experiment:
//   - an object asset uses `properties.visual` when the content provides
//     one, otherwise a key derived from its label ("Wooden block" ->
//     "wooden-block"); unknown keys fall back to a neutral token.
//   - a zone uses `properties.icon` the same way ("Hard" -> "hard").
// A future classification experiment gets bespoke art by adding entries
// here (or by naming an existing one via properties.visual) — the renderer
// itself never changes.
//
// The key helpers (toVisualKey, useSvgId) live in
// app/components/interactive/shared/visualKeys.ts, shared with Matching.

interface MaterialVisualProps {
  visualKey: string;
  label: string;
  size?: number;
}

export function MaterialVisual({ visualKey, label, size = 64 }: MaterialVisualProps) {
  const Art = materialArt[visualKey];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible" }}
    >
      {Art ? <Art /> : <FallbackArt label={label} />}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Material art (viewBox 0 0 80 80). Each shape carries its own silhouette,
// colour and a soft contact shadow so it reads as a physical object.
// ---------------------------------------------------------------------------

function ContactShadow({ cx = 40, cy = 70, rx = 24 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={4} fill="#0f2a44" opacity={0.12} />;
}

function StoneArt() {
  const grad = useSvgId("stone");
  return (
    <>
      <defs>
        <radialGradient id={grad} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#c9ced6" />
          <stop offset="60%" stopColor="#9aa2ad" />
          <stop offset="100%" stopColor="#6f7884" />
        </radialGradient>
      </defs>
      <ContactShadow rx={26} />
      <path
        d="M13 50C9 37 18 24 31 20c13-4 28-1 35 11 7 11 4 26-9 31-14 5-38 5-44-12Z"
        fill={`url(#${grad})`}
        stroke="#5d6672"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle cx={30} cy={44} r={2.2} fill="#5d6672" opacity={0.45} />
      <circle cx={48} cy={50} r={1.6} fill="#5d6672" opacity={0.45} />
      <circle cx={55} cy={37} r={2} fill="#5d6672" opacity={0.35} />
      <circle cx={38} cy={56} r={1.3} fill="#5d6672" opacity={0.4} />
      <path d="M24 32c5-5 13-7 20-6" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.45} fill="none" />
    </>
  );
}

function SpongeArt() {
  return (
    <>
      <ContactShadow rx={28} />
      <rect x={12} y={30} width={56} height={34} rx={7} fill="#ffd64d" stroke="#d9a514" strokeWidth={1.6} />
      <rect x={12} y={20} width={56} height={14} rx={6} fill="#43b56a" stroke="#2f8f50" strokeWidth={1.6} />
      <path d="M17 27h46" stroke="#7fd39b" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      {[
        [22, 42, 3],
        [34, 48, 2.4],
        [46, 41, 3.2],
        [58, 50, 2.6],
        [27, 56, 2.2],
        [41, 57, 2.8],
        [54, 58, 1.8],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#e3a91c" opacity={0.75} />
      ))}
    </>
  );
}

function WoodenBlockArt() {
  return (
    <>
      <ContactShadow rx={25} cy={71} />
      <g stroke="#7e5226" strokeWidth={1.4} strokeLinejoin="round">
        <polygon points="40,10 67,23 40,36 13,23" fill="#e8b97f" />
        <polygon points="13,23 40,36 40,68 13,55" fill="#cd914f" />
        <polygon points="40,36 67,23 67,55 40,68" fill="#b27a3e" />
      </g>
      <g fill="none" stroke="#8f5c2a" strokeWidth={1.1} strokeLinecap="round" opacity={0.55}>
        <path d="M18 34c6 3 10 3 17 8" />
        <path d="M17 44c7 3 10 5 18 8" />
        <path d="M46 43c5-3 9-4 16-8" />
        <path d="M45 54c6-3 10-5 17-9" />
        <path d="M28 20c5 2 10 3 16 2" />
      </g>
    </>
  );
}

function CottonBallArt() {
  const grad = useSvgId("cotton");
  const puffs: [number, number, number][] = [
    [27, 46, 14],
    [42, 36, 16],
    [55, 47, 13],
    [40, 54, 14],
    [22, 55, 9],
    [58, 57, 8],
  ];
  return (
    <>
      <defs>
        <radialGradient id={grad} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dde5ef" />
        </radialGradient>
      </defs>
      <ContactShadow rx={24} />
      {/* Outline pass, then a fill pass on top so only the outer edge of
          the overlapping puffs is stroked — a single fluffy silhouette. */}
      {puffs.map(([cx, cy, r]) => (
        <circle key={`o-${cx}`} cx={cx} cy={cy} r={r} fill="none" stroke="#b8c4d3" strokeWidth={3} />
      ))}
      {puffs.map(([cx, cy, r]) => (
        <circle key={`f-${cx}`} cx={cx} cy={cy} r={r} fill={`url(#${grad})`} />
      ))}
      <path d="M33 31c4-3 9-3 13-1" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" fill="none" />
    </>
  );
}

function MetalSpoonArt() {
  const grad = useSvgId("spoon");
  return (
    <>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f7fa" />
          <stop offset="55%" stopColor="#b9c3cd" />
          <stop offset="100%" stopColor="#8795a3" />
        </linearGradient>
      </defs>
      <ContactShadow rx={22} />
      <g transform="rotate(-38 40 40)">
        <rect x={36.5} y={36} width={7} height={40} rx={3.5} fill={`url(#${grad})`} stroke="#6e7c8a" strokeWidth={1.4} />
        <ellipse cx={40} cy={22} rx={13} ry={17} fill={`url(#${grad})`} stroke="#6e7c8a" strokeWidth={1.6} />
        <ellipse cx={36} cy={17} rx={4.5} ry={8} fill="#ffffff" opacity={0.7} />
      </g>
    </>
  );
}

function RubberBallArt() {
  const grad = useSvgId("rubber");
  const clip = useSvgId("rubber-clip");
  return (
    <>
      <defs>
        <radialGradient id={grad} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ff8c7a" />
          <stop offset="70%" stopColor="#e84a3c" />
          <stop offset="100%" stopColor="#c43528" />
        </radialGradient>
        <clipPath id={clip}>
          <circle cx={40} cy={40} r={25} />
        </clipPath>
      </defs>
      <ContactShadow rx={22} cy={71} />
      <circle cx={40} cy={40} r={25} fill={`url(#${grad})`} />
      <path
        d="M10 44c14-9 45-12 60-4v10c-16-8-46-5-60 4Z"
        fill="#ffd23f"
        clipPath={`url(#${clip})`}
        opacity={0.95}
      />
      <circle cx={40} cy={40} r={25} fill="none" stroke="#b3342a" strokeWidth={1.6} />
      <ellipse cx={31} cy={28} rx={7} ry={4.5} fill="#ffffff" opacity={0.5} transform="rotate(-25 31 28)" />
    </>
  );
}

function IronNailArt() {
  const grad = useSvgId("nail");
  return (
    <>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e3e8ed" />
          <stop offset="50%" stopColor="#9aa6b2" />
          <stop offset="100%" stopColor="#6b7785" />
        </linearGradient>
      </defs>
      <ContactShadow rx={22} />
      <g transform="rotate(-35 40 40)">
        <ellipse cx={40} cy={13} rx={14} ry={4.5} fill={`url(#${grad})`} stroke="#566271" strokeWidth={1.5} />
        <path d="M37 14h6v44l-3 10-3-10Z" fill={`url(#${grad})`} stroke="#566271" strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M39 16v38" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
      </g>
    </>
  );
}

function GlassMarbleArt() {
  const grad = useSvgId("marble");
  return (
    <>
      <defs>
        <radialGradient id={grad} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#e6f6ff" />
          <stop offset="55%" stopColor="#5db4ee" />
          <stop offset="100%" stopColor="#1f6fb5" />
        </radialGradient>
      </defs>
      <ContactShadow rx={20} cy={71} />
      <circle cx={40} cy={40} r={25} fill={`url(#${grad})`} stroke="#1a5e99" strokeWidth={1.6} />
      <path d="M24 44c4 10 18 15 30 7" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.55} />
      <path d="M26 36c2-8 9-13 17-12" stroke="#ffd23f" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
      <ellipse cx={31} cy={28} rx={6.5} ry={4} fill="#ffffff" opacity={0.7} transform="rotate(-25 31 28)" />
    </>
  );
}

function PillowArt() {
  const grad = useSvgId("pillow");
  return (
    <>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#d9e8fb" />
          <stop offset="100%" stopColor="#a9c6ea" />
        </linearGradient>
      </defs>
      <ContactShadow rx={26} />
      <path
        d="M10 22c10-6 50-6 60 0 4 12 4 24 0 36-10 6-50 6-60 0-4-12-4-24 0-36Z"
        fill={`url(#${grad})`}
        stroke="#7fa3d1"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M12 24l7 6M68 24l-7 6M12 56l7-6M68 56l-7-6" stroke="#7fa3d1" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
      <path d="M24 34c8-4 24-4 32 0" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
    </>
  );
}

function PlayDoughArt() {
  const grad = useSvgId("dough");
  return (
    <>
      <defs>
        <radialGradient id={grad} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffb3d1" />
          <stop offset="65%" stopColor="#ef6fa6" />
          <stop offset="100%" stopColor="#cc4b86" />
        </radialGradient>
      </defs>
      <ContactShadow rx={26} />
      <path
        d="M12 52c-5-14 2-27 16-30 8-9 24-8 30 2 11 2 16 14 11 26-4 9-14 11-26 11-14 1-26-1-31-9Z"
        fill={`url(#${grad})`}
        stroke="#b13c75"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M26 33c4-4 10-5 15-4" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.5} />
      <circle cx={52} cy={48} r={2} fill="#b13c75" opacity={0.3} />
      <circle cx={34} cy={52} r={1.6} fill="#b13c75" opacity={0.3} />
    </>
  );
}

function FallbackArt({ label }: { label: string }) {
  return (
    <>
      <ContactShadow rx={22} />
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

// ----- Foods (Classes of Food) -----

const foodArt: Record<string, () => JSX.Element> = {
  yam: () => (
    <>
      <ContactShadow rx={28} />
      <path d="M12 46c2-12 16-18 30-18s26 6 26 16-12 20-28 20S10 58 12 46Z" fill="#8a5a32" stroke="#5c3a1a" strokeWidth={1.6} />
      <ellipse cx={62} cy={42} rx={6} ry={9} fill="#f3e3c3" stroke="#5c3a1a" strokeWidth={1.4} />
      <g stroke="#5c3a1a" strokeWidth={1} opacity={0.6}><path d="M24 40l2 3M36 36l2 3M30 52l2 3M46 50l2 3" /></g>
    </>
  ),
  garri: () => (
    <>
      <ContactShadow rx={28} />
      <path d="M14 42h52c-2 14-12 22-26 22S16 56 14 42Z" fill="#e2e8ef" stroke="#8aa3b8" strokeWidth={1.6} />
      <path d="M18 42c4-12 40-12 44 0Z" fill="#f6eed8" stroke="#d6c7a0" strokeWidth={1} />
      <g fill="#d6c7a0"><circle cx={30} cy={38} r={1} /><circle cx={40} cy={35} r={1} /><circle cx={50} cy={38} r={1} /><circle cx={36} cy={40} r={1} /><circle cx={45} cy={40} r={1} /></g>
    </>
  ),
  beans: () => (
    <>
      <ContactShadow rx={26} />
      {[[26, 44], [36, 38], [46, 46], [56, 38], [32, 54], [50, 56], [42, 30]].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`rotate(${(x * 7) % 60 - 30} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx={7} ry={4.5} fill="#f1e6d0" stroke="#8a7350" strokeWidth={1.2} />
          <ellipse cx={x} cy={y} rx={2} ry={1.4} fill="#2b2b2b" />
        </g>
      ))}
    </>
  ),
  fish: () => (
    <>
      <ContactShadow rx={26} />
      <path d="M58 40 74 28v24Z" fill="#7d8fa3" stroke="#4f5f71" strokeWidth={1.5} strokeLinejoin="round" />
      <ellipse cx={36} cy={40} rx={25} ry={14} fill="#9fb0c2" stroke="#4f5f71" strokeWidth={1.6} />
      <path d="M26 33c3 4 3 10 0 14" fill="none" stroke="#4f5f71" strokeWidth={1.4} />
      <circle cx={18} cy={37} r={2.6} fill="#172b3d" />
    </>
  ),
  orange: () => (
    <>
      <ContactShadow rx={22} />
      <circle cx={40} cy={42} r={22} fill="#f7931e" stroke="#c46a08" strokeWidth={1.6} />
      <path d="M40 20c2-6 8-8 12-6-2 6-8 8-12 6Z" fill="#43b56a" />
      <g fill="#c46a08" opacity={0.35}><circle cx={32} cy={38} r={1} /><circle cx={46} cy={48} r={1} /><circle cx={38} cy={54} r={1} /></g>
      <ellipse cx={32} cy={32} rx={5} ry={3} fill="#ffffff" opacity={0.35} />
    </>
  ),
  carrot: () => (
    <>
      <ContactShadow rx={20} />
      <path d="M30 22c8-4 18 0 18 8L36 68c-2 2-4 2-4 0Z" fill="#f28a2e" stroke="#c4621a" strokeWidth={1.6} strokeLinejoin="round" />
      <g stroke="#c4621a" strokeWidth={1}><path d="M34 34l6 1M35 44l5 1M36 54l3 1" /></g>
      <g stroke="#3f9a4f" strokeWidth={3} strokeLinecap="round"><path d="M40 22l-4-12M42 22l4-11M38 23l-9-7" /></g>
    </>
  ),
  "palm-oil": () => (
    <>
      <ContactShadow rx={18} />
      <path d="M32 14h16v8l6 8v32a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4V30l6-8Z" fill="#d9480f" stroke="#8f2f08" strokeWidth={1.6} strokeLinejoin="round" />
      <rect x={34} y={8} width={12} height={7} rx={1.5} fill="#f5c542" stroke="#8f2f08" strokeWidth={1.2} />
      <rect x={29} y={38} width={22} height={14} rx={2} fill="#fff4df" />
      <path d="M36 45h8" stroke="#8f2f08" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  "groundnut-oil": () => (
    <>
      <ContactShadow rx={18} />
      <path d="M32 14h16v8l6 8v32a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4V30l6-8Z" fill="#f5d76e" stroke="#b8961e" strokeWidth={1.6} strokeLinejoin="round" opacity={0.95} />
      <rect x={34} y={8} width={12} height={7} rx={1.5} fill="#2f6fde" stroke="#1d4fa6" strokeWidth={1.2} />
      <rect x={29} y={38} width={22} height={14} rx={2} fill="#ffffff" />
      <ellipse cx={40} cy={45} rx={5} ry={3.5} fill="#c99a5b" stroke="#8a6440" strokeWidth={0.8} />
    </>
  ),
};

// ----- 2D shapes -----

const shapeArt: Record<string, () => JSX.Element> = {
  triangle: () => (<><ContactShadow rx={24} /><path d="M40 14 66 62H14Z" fill="#df4f93" stroke="#a2306a" strokeWidth={2} strokeLinejoin="round" /></>),
  "tall-triangle": () => (<><ContactShadow rx={18} /><path d="M40 8 56 64H24Z" fill="#9b59d0" stroke="#6b3a99" strokeWidth={2} strokeLinejoin="round" /></>),
  square: () => (<><ContactShadow rx={24} /><rect x={18} y={18} width={44} height={44} rx={2} fill="#2f6fde" stroke="#1d4fa6" strokeWidth={2} /></>),
  rectangle: () => (<><ContactShadow rx={30} /><rect x={8} y={26} width={64} height={34} rx={2} fill="#12a383" stroke="#0b6f59" strokeWidth={2} /></>),
  circle: () => (<><ContactShadow rx={22} /><circle cx={40} cy={40} r={24} fill="#f5a623" stroke="#b86f0e" strokeWidth={2} /></>),
  oval: () => (<><ContactShadow rx={30} /><ellipse cx={40} cy={42} rx={30} ry={18} fill="#e84a3c" stroke="#b3342a" strokeWidth={2} /></>),
};

// ----- Simple machines -----

const machineArt: Record<string, () => JSX.Element> = {
  "see-saw": () => (
    <>
      <ContactShadow rx={30} />
      <path d="M34 64 40 48 46 64Z" fill="#8a96a3" stroke="#56606b" strokeWidth={1.4} />
      <path d="M8 58 72 38" stroke="#e8900c" strokeWidth={5} strokeLinecap="round" />
      <circle cx={12} cy={50} r={4} fill="#2f6fde" /><circle cx={68} cy={30} r={4} fill="#df4f93" />
    </>
  ),
  "bottle-opener": () => (
    <>
      <ContactShadow rx={26} />
      <path d="M14 46 58 30" stroke="#8a96a3" strokeWidth={9} strokeLinecap="round" />
      <circle cx={60} cy={30} r={9} fill="#c9d2dc" stroke="#56606b" strokeWidth={1.6} />
      <circle cx={60} cy={30} r={4} fill="#f4f7fa" stroke="#56606b" strokeWidth={1.2} />
    </>
  ),
  flagpole: () => (
    <>
      <ContactShadow rx={16} />
      <path d="M30 70V10" stroke="#6b7785" strokeWidth={3} strokeLinecap="round" />
      <circle cx={30} cy={10} r={3} fill="#e8900c" />
      <path d="M31 14h26v8H31Z" fill="#12a383" />
      <path d="M31 22h26v8H31Z" fill="#ffffff" stroke="#d6e4f5" strokeWidth={0.6} />
      <path d="M31 30h26v8H31Z" fill="#12a383" />
      <path d="M34 10v56" stroke="#b8c4d3" strokeWidth={1} />
    </>
  ),
  "well-bucket": () => (
    <>
      <ContactShadow rx={26} />
      <path d="M16 16h48" stroke="#8a5a2b" strokeWidth={4} strokeLinecap="round" />
      <path d="M20 16v46M60 16v46" stroke="#8a5a2b" strokeWidth={3} />
      <circle cx={40} cy={20} r={5} fill="#c9d2dc" stroke="#56606b" strokeWidth={1.4} />
      <path d="M40 25v17" stroke="#b8a37a" strokeWidth={1.6} />
      <path d="M32 42h16l-2 12H34Z" fill="#6b7785" stroke="#3f4855" strokeWidth={1.4} />
      <path d="M12 62h56v8H12Z" fill="#a8b3bf" stroke="#6b7785" strokeWidth={1.2} />
    </>
  ),
  ramp: () => (
    <>
      <ContactShadow rx={30} />
      <path d="M8 64H72V30Z" fill="#c9a36b" stroke="#8a6440" strokeWidth={1.6} strokeLinejoin="round" />
      <rect x={40} y={36} width={12} height={10} rx={1.5} fill="#2f6fde" transform="rotate(-28 46 41)" />
    </>
  ),
  slide: () => (
    <>
      <ContactShadow rx={30} />
      <path d="M58 20v44M66 20v44M58 30h8M58 42h8M58 54h8" stroke="#6b7785" strokeWidth={2} />
      <path d="M58 22 12 62h8L58 30Z" fill="#df4f93" stroke="#a2306a" strokeWidth={1.4} strokeLinejoin="round" />
    </>
  ),
  "door-knob": () => (
    <>
      <ContactShadow rx={20} />
      <rect x={18} y={10} width={44} height={60} rx={2} fill="#c7a17a" stroke="#8a6440" strokeWidth={1.4} />
      <circle cx={50} cy={42} r={7} fill="#f5c542" stroke="#b8961e" strokeWidth={1.6} />
      <rect x={46} y={40} width={8} height={4} fill="#b8961e" opacity={0.5} />
    </>
  ),
  "steering-wheel": () => (
    <>
      <ContactShadow rx={24} />
      <circle cx={40} cy={40} r={24} fill="none" stroke="#3f4855" strokeWidth={6} />
      <circle cx={40} cy={40} r={6} fill="#56606b" />
      <path d="M40 46v17M34 38 17 34M46 38l17-4" stroke="#3f4855" strokeWidth={5} strokeLinecap="round" />
    </>
  ),
};

const materialArt: Record<string, () => JSX.Element> = {
  stone: StoneArt,
  sponge: SpongeArt,
  "wooden-block": WoodenBlockArt,
  "cotton-ball": CottonBallArt,
  "metal-spoon": MetalSpoonArt,
  "rubber-ball": RubberBallArt,
  "iron-nail": IronNailArt,
  "glass-marble": GlassMarbleArt,
  pillow: PillowArt,
  "play-dough": PlayDoughArt,
  ...foodArt,
  ...shapeArt,
  ...machineArt,
};

// ---------------------------------------------------------------------------
// Zone icons (viewBox 0 0 24 24, stroked in the zone's own colour).
// ---------------------------------------------------------------------------

export function hasZoneIcon(iconKey: string) {
  return iconKey in zoneIcons;
}

export function ZoneIcon({ iconKey }: { iconKey: string }) {
  const Icon = zoneIcons[iconKey];

  if (!Icon) {
    return null;
  }

  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Icon />
    </svg>
  );
}

const zoneIcons: Record<string, () => JSX.Element> = {
  // A solid block — keeps its shape.
  hard: () => (
    <>
      <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z" />
      <path d="M4 7.5 12 12l8-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  // A soft cushion — squashes when pressed.
  soft: () => (
    <path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 .5 9Z" />
  ),
  // Food classes.
  energy: () => <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />,
  growth: () => (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-7 8-7 0 5-3 7-8 7Z" />
      <path d="M12 15c0-3-2-5-6-5 0 4 2 5 6 5Z" />
    </>
  ),
  protection: () => <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z" />,
  "oil-drop": () => <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11Z" />,
  // Shapes.
  triangle: () => <path d="M12 4 21 20H3Z" />,
  square: () => <rect x={4} y={4} width={16} height={16} rx={1} />,
  circle: () => <circle cx={12} cy={12} r={8.5} />,
  // Simple machines.
  lever: () => (
    <>
      <path d="M3 16 21 9" />
      <path d="M10 20l2-6 2 6Z" />
    </>
  ),
  pulley: () => (
    <>
      <path d="M4 3h16" />
      <circle cx={12} cy={8} r={3.5} />
      <path d="M8.5 8v11M15.5 8v6" />
      <rect x={13.5} y={14} width={4} height={4} />
    </>
  ),
  ramp: () => <path d="M3 20h18V8Z" />,
  wheel: () => (
    <>
      <circle cx={12} cy={12} r={8.5} />
      <circle cx={12} cy={12} r={2} />
      <path d="M12 3.5v6.5M12 14v6.5M3.5 12h6.5M14 12h6.5" />
    </>
  ),
};
