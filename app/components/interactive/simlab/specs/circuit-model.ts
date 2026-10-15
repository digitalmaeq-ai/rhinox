// The model behind the electric circuit lab: cells with a small internal
// resistance, a rheostat, and filament bulbs whose resistance rises as they
// get hotter (so their V–I graph curves). Pure functions.

export type CircuitState = {
  closed: boolean;
  cells: number;
  bulbs: number;
  layout: string; // "series" | "parallel"
  rheo?: number; // rheostat in ohms
};

export const CELL_VOLTS = 1.5;
export const CELL_INTERNAL = 0.3;
export const BLOW_VOLTS = 4.2;
export const MAX_RHEO = 10;

/** Resistance of a filament bulb carrying voltage v: it rises as it heats up. */
export const bulbOhms = (v: number) => 2 + 0.35 * v;

export function solveCircuit(s: CircuitState) {
  const rheo = s.rheo ?? 0;
  const E = s.cells * CELL_VOLTS;
  const rInt = s.cells * CELL_INTERNAL;
  const series = s.layout === "series";
  const n = Math.max(1, s.bulbs);
  // Solve a·V + c·V/R(V) = E for the voltage V across each bulb.
  const a = series ? n : 1;
  const c = series ? rInt + rheo : (rInt + rheo) * n;
  let lo = 0;
  let hi = E / a;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const g = a * mid + (c * mid) / bulbOhms(mid) - E;
    if (g > 0) hi = mid;
    else lo = mid;
  }
  const bulbVolts = (lo + hi) / 2;
  const bulbOhm = bulbOhms(bulbVolts);
  const bulbAmps = bulbVolts / bulbOhm;
  const totalAmps = series ? bulbAmps : bulbAmps * n;
  const power = bulbVolts * bulbAmps;
  const blown = bulbVolts > BLOW_VOLTS;
  const brightness = !s.closed || blown ? 0 : Math.min(1, Math.sqrt(power / 5));
  const flowing = s.closed && !blown;
  const terminal = flowing ? E - totalAmps * rInt : E;
  return { volts: E, bulbVolts, bulbAmps, totalAmps, brightness, blown, series, flowing, terminal, rInt, bulbOhm, power, rheo };
}

/** What the meters read: nothing flows if the circuit is open or the bulb has blown. */
export function meters(s: CircuitState) {
  const r = solveCircuit(s);
  return r.flowing ? { amps: r.totalAmps, volts: r.bulbVolts } : { amps: 0, volts: 0 };
}

export function brightnessWord(b: number, blown: boolean, closed: boolean) {
  if (blown) return "Blown!";
  if (!closed) return "Off";
  if (b < 0.3) return "Very dim";
  if (b < 0.6) return "Dim";
  if (b < 0.9) return "Bright";
  return "Full brightness";
}

/** Same reading, same noise, every time: small measuring error of about ±1 %. */
export function noise(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  const f = x - Math.floor(x);
  return 1 + (f - 0.5) * 0.02;
}

export type CircuitRow = { id: number; cells: number; bulbs: number; layout: string; rheo: number; volts: number; amps: number };

/** Resistance for a row, V ÷ I. */
export const rowOhms = (r: CircuitRow) => (r.amps > 0 ? r.volts / r.amps : 0);

/** A bulb's resistance climbs with current: at least 5 single-bulb readings spanning a clear range. */
export function showsCurve(rows: CircuitRow[]) {
  const single = rows.filter((r) => r.bulbs === 1 && r.amps > 0);
  if (single.length < 5) return false;
  const sorted = [...single].sort((a, b) => a.amps - b.amps);
  const low = rowOhms(sorted[0]);
  const high = rowOhms(sorted[sorted.length - 1]);
  return sorted[sorted.length - 1].amps / sorted[0].amps >= 1.8 && high / low >= 1.12;
}
