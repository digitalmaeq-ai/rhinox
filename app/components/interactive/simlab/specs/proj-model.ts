// The model behind the projectile lab: a ball launched from a platform with
// no air resistance. The sideways speed stays constant while gravity changes
// the upward speed. Pure functions.

export type ProjState = { angle: number; speed: number; gravity: string; height?: number };

export const GRAVITY: Record<string, { g: number; name: string }> = {
  earth: { g: 9.8, name: "Earth" },
  mars: { g: 3.7, name: "Mars" },
  moon: { g: 1.6, name: "Moon" },
};
export const TARGET = 60;
export const TOLERANCE = 3;
export const HEIGHTS = [0, 5, 10, 15, 20];

export function flight(s: ProjState) {
  const g = (GRAVITY[s.gravity] ?? GRAVITY.earth).g;
  const h0 = s.height ?? 0;
  const a = (s.angle * Math.PI) / 180;
  const vx = s.speed * Math.cos(a);
  const vy = s.speed * Math.sin(a);
  const time = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
  const rise = vy > 0 ? (vy * vy) / (2 * g) : 0;
  return {
    g,
    h0,
    vx,
    vy,
    time,
    range: vx * time,
    /** Greatest height above the ground. */
    height: h0 + rise,
    /** Time to reach the top of the path. */
    apexTime: vy > 0 ? vy / g : 0,
  };
}

/** Position of the ball t seconds after launch. */
export function position(s: ProjState, t: number) {
  const f = flight(s);
  return { x: f.vx * t, y: Math.max(0, f.h0 + f.vy * t - 0.5 * f.g * t * t) };
}

export function pathPoints(s: ProjState, n = 40) {
  const f = flight(s);
  return Array.from({ length: n + 1 }, (_, i) => position(s, (f.time * i) / n));
}

/** Same reading, same noise, every time: a small measuring error. */
export function noise(index: number, salt: number, spread: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  const f = x - Math.floor(x);
  return 1 + (f - 0.5) * spread;
}

export type ProjRow = {
  id: number;
  angle: number;
  speed: number;
  gravity: string;
  height: number;
  /** Measured with a tape (about ±1 %), a stopwatch (about ±3 %) and a height scale (about ±2 %). */
  range: number;
  time: number;
  top: number;
};

export function measure(id: number, s: Required<ProjState>): ProjRow {
  const f = flight(s);
  return {
    id,
    angle: s.angle,
    speed: s.speed,
    gravity: s.gravity,
    height: s.height,
    range: f.range * noise(id, 1, 0.02),
    time: f.time * noise(id, 2, 0.06),
    top: f.height * noise(id, 3, 0.04),
  };
}

const key = (r: ProjRow) => `${r.speed}|${r.gravity}|${r.height}`;

/** Rows from the setup most readings share, for the range against angle graph. */
export function sameSetup(rows: ProjRow[]) {
  if (rows.length === 0) return [];
  const counts = new Map<string, number>();
  rows.forEach((r) => counts.set(key(r), (counts.get(key(r)) ?? 0) + 1));
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return rows.filter((r) => key(r) === best);
}

/** At least five different angles from level ground, with the longest range near 45°. */
export function findsPeak(rows: ProjRow[]) {
  const group = sameSetup(rows).filter((r) => r.height === 0);
  const angles = new Set(group.map((r) => r.angle));
  if (angles.size < 5) return false;
  const top = [...group].sort((a, b) => b.range - a.range)[0];
  return top.angle >= 38 && top.angle <= 52 && Math.min(...angles) <= 35 && Math.max(...angles) >= 55;
}

/** Two launches whose angles add up to 90° and travel about the same distance. */
export function hasComplementPair(rows: ProjRow[]) {
  const level = rows.filter((r) => r.height === 0);
  for (let i = 0; i < level.length; i++) {
    for (let j = i + 1; j < level.length; j++) {
      const a = level[i];
      const b = level[j];
      if (key(a) !== key(b) || a.angle === b.angle) continue;
      if (Math.abs(a.angle + b.angle - 90) > 0.5) continue;
      if (Math.abs(a.range - b.range) / Math.max(a.range, b.range) <= 0.05) return true;
    }
  }
  return false;
}
