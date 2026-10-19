import type { Tile } from "@/lib/game-creator/types";

// Simple drawn pictures for each square. Walls and floor are plain colour
// (see the stylesheet); everything else is a small SVG so it stays sharp at any size.

export function TileArt({ tile, open = false }: { tile: Tile; open?: boolean }) {
  switch (tile) {
    case "key":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="13" cy="20" r="7" fill="none" stroke="#d58a0a" strokeWidth="4" />
          <path d="M20 20h15M30 20v6M35 20v5" stroke="#d58a0a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "door":
      return open ? (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <rect x="9" y="5" width="22" height="31" rx="3" fill="none" stroke="#9a6b3a" strokeWidth="2.5" strokeDasharray="4 3" />
          <path d="M9 36 20 31V9L9 5Z" fill="#b98550" opacity="0.55" />
        </svg>
      ) : (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <rect x="8" y="4" width="24" height="32" rx="3" fill="#a9733c" stroke="#6b4421" strokeWidth="2.5" />
          <rect x="12" y="8" width="16" height="10" rx="2" fill="#c08a52" />
          <circle cx="26" cy="26" r="2.6" fill="#f5c451" stroke="#6b4421" strokeWidth="1" />
        </svg>
      );
    case "enemy-h":
    case "enemy-v":
      return <EnemyArt axis={tile === "enemy-h" ? "h" : "v"} />;
    case "start":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="12" fill="none" stroke="#2f7de1" strokeWidth="3" strokeDasharray="5 4" />
          <path d="M20 12v16M13 21l7 7 7-7" fill="none" stroke="#2f7de1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "goal":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <ellipse cx="20" cy="33" rx="10" ry="3" fill="#bfe3cf" />
          <path d="M14 33V7" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d="M15 8h16l-5 6 5 6H15Z" fill="#1fa463" />
        </svg>
      );
    case "coin":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="11" fill="#f5b72b" stroke="#d58a0a" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="6" fill="none" stroke="#fbd877" strokeWidth="2" />
        </svg>
      );
    case "hazard":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M5 32l5-16 5 16Zm10 0l5-20 5 20Zm10 0l4-13 4 13Z" fill="#e5484d" stroke="#a82329" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function PlayerArt() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 5v5" stroke="#f08a24" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="5" r="2.5" fill="#f08a24" />
      <rect x="8" y="10" width="24" height="22" rx="7" fill="#1d6fe0" stroke="#0e3f8f" strokeWidth="2" />
      <circle cx="15" cy="20" r="3.2" fill="#fff" />
      <circle cx="25" cy="20" r="3.2" fill="#fff" />
      <circle cx="15.8" cy="20.4" r="1.5" fill="#0e2a52" />
      <circle cx="25.8" cy="20.4" r="1.5" fill="#0e2a52" />
      <path d="M15 27h10" stroke="#9ec5ff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EnemyArt({ axis }: { axis?: "h" | "v" }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 31c0-9 5-17 12-17s12 8 12 17Z" fill="#7a3fd1" stroke="#4a1f8a" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="15.5" cy="24" r="3" fill="#fff" />
      <circle cx="24.5" cy="24" r="3" fill="#fff" />
      <circle cx="16" cy="24.5" r="1.4" fill="#2a0e57" />
      <circle cx="25" cy="24.5" r="1.4" fill="#2a0e57" />
      <path d="M12 12l4 3M28 12l-4 3" stroke="#4a1f8a" strokeWidth="2" strokeLinecap="round" />
      {axis === "h" ? <path d="M3 36h34M6 33l-3 3 3 3M34 33l3 3-3 3" fill="none" stroke="#4a1f8a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {axis === "v" ? <path d="M36 4v32M33 7l3-3 3 3M33 33l3 3 3-3" fill="none" stroke="#4a1f8a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
}
