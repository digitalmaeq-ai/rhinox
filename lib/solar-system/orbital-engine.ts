import { planets } from "./planet-data";
import type { CelestialBody, ScaleMode, SimClock } from "./solar-system-types";

// Deterministic, time-based orbital engine. Positions are a pure function of
// the simulation clock (in days), so speed never depends on frame rate.
// Orbits are simplified circles: a teaching approximation.

export const TAU = Math.PI * 2;

/** Longest frame step we accept, so a background tab cannot cause a jump. */
export const MAX_FRAME_SECONDS = 0.1;

export const SUN_RADIUS = 2.6;

export function advanceClock(clock: SimClock, frameSeconds: number, daysPerSecond: number): void {
  const dt = Math.min(Math.max(frameSeconds, 0), MAX_FRAME_SECONDS);
  clock.days += dt * daysPerSecond;
  clock.spin += dt;
}

/** Orbit radius in scene units for the chosen scale mode. */
export function orbitRadius(body: CelestialBody, mode: ScaleMode): number {
  const au = body.distanceAu ?? 0;
  if (au === 0) return 0;
  if (mode === "true") {
    // Proportional to real distance. The four inner orbits are nudged apart so
    // they stay outside the Sun and remain visible; that is the only departure.
    const rank = planets.findIndex((planet) => planet.id === body.id);
    const minimum = SUN_RADIUS + 1.2 + Math.max(rank, 0) * 0.85;
    return Math.max(1.55 * au, minimum);
  }
  // Teaching scale: square-root compression keeps every planet on screen.
  return 8.5 * Math.sqrt(au) + 1.4;
}

/** Position angle (radians) of a planet at the given simulated day. */
export function orbitAngle(body: CelestialBody, days: number): number {
  const period = body.orbitalDays ?? 0;
  return period === 0 ? 0 : body.phase + (TAU * days) / period;
}

export function orbitPosition(body: CelestialBody, days: number, mode: ScaleMode): { x: number; z: number; angle: number } {
  const radius = orbitRadius(body, mode);
  const angle = orbitAngle(body, days);
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, angle };
}

/**
 * Visual spin (radians) at a teaching rate. Real day lengths differ by a
 * factor of 250, so a true-rate spin would strobe at any usable speed. The
 * relative order and direction (retrograde for Venus and Uranus) are kept.
 */
export function spinAngle(body: CelestialBody, spinSeconds: number): number {
  const direction = body.rotationHours < 0 ? -1 : 1;
  const relative = 24 / Math.abs(body.rotationHours);
  return direction * spinSeconds * 0.55 * Math.pow(relative, 0.45) * (body.id === "sun" ? 0.3 : 1);
}

export function simulatedYears(days: number): number {
  return days / 365.25;
}

export function formatElapsed(days: number): string {
  const years = simulatedYears(days);
  if (years < 1) return `${Math.floor(days)} days`;
  return `${years.toFixed(years < 10 ? 1 : 0)} Earth years`;
}

export function formatPeriod(days: number): string {
  if (days < 365) return `${days.toLocaleString("en", { maximumFractionDigits: 1 })} Earth days`;
  return `${(days / 365.25).toLocaleString("en", { maximumFractionDigits: 1 })} Earth years`;
}

export function formatRotation(hours: number): string {
  const value = Math.abs(hours);
  const text = value >= 48 ? `${(value / 24).toLocaleString("en", { maximumFractionDigits: 1 })} Earth days` : `${value.toLocaleString("en", { maximumFractionDigits: 1 })} hours`;
  return hours < 0 ? `${text} (retrograde)` : text;
}

export function formatMass(kg: number): string {
  const exponent = Math.floor(Math.log10(kg));
  const mantissa = kg / Math.pow(10, exponent);
  return `${mantissa.toFixed(2)} × 10^${exponent} kg`;
}

export function formatDistance(km: number): string {
  return `${(km / 1e6).toLocaleString("en", { maximumFractionDigits: 1 })} million km`;
}

/** Arc of the orbit behind a planet, used for the trail (no history needed). */
export function trailPoints(body: CelestialBody, days: number, mode: ScaleMode, steps = 36, sweep = 1.6): { x: number; z: number }[] {
  const radius = orbitRadius(body, mode);
  const angle = orbitAngle(body, days);
  const out: { x: number; z: number }[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = angle - (sweep * (steps - i)) / steps;
    out.push({ x: Math.cos(a) * radius, z: Math.sin(a) * radius });
  }
  return out;
}

export const bodyCount = planets.length;
