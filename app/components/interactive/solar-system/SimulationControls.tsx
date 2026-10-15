"use client";

import { speedPresets } from "@/lib/solar-system/planet-data";
import type { SimSettings } from "@/lib/solar-system/solar-system-types";

import styles from "./solar-system.module.css";

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`${styles.chipButton} ${on ? styles.chipOn : ""}`} aria-pressed={on} onClick={onClick}>
      {label}
    </button>
  );
}

export default function SimulationControls({
  settings,
  elapsed,
  onChange,
  onReset,
  onZoom,
}: {
  settings: SimSettings;
  elapsed: string;
  onChange: (patch: Partial<SimSettings>) => void;
  onReset: () => void;
  onZoom: (factor: number) => void;
}) {
  return (
    <div className={styles.controls} role="toolbar" aria-label="Simulation controls">
      <div className={styles.controlGroup}>
        <button type="button" className={styles.playButton} onClick={() => onChange({ playing: !settings.playing })} aria-label={settings.playing ? "Pause simulation" : "Play simulation"}>
          {settings.playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.5" height="14" rx="1" /><rect x="13.5" y="5" width="4.5" height="14" rx="1" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5Z" /></svg>
          )}
          {settings.playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={styles.chipButton} onClick={onReset}>
          Reset
        </button>
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.speedLabel} htmlFor="ss-speed">
          Speed
        </label>
        <select
          id="ss-speed"
          className={styles.select}
          value={settings.daysPerSecond}
          onChange={(event) => onChange({ daysPerSecond: Number(event.target.value) })}
        >
          {speedPresets.map((preset) => (
            <option key={preset.id} value={preset.daysPerSecond}>
              {preset.label}
            </option>
          ))}
        </select>
        <span className={styles.elapsed} aria-live="off">
          {elapsed}
        </span>
      </div>

      <div className={styles.controlGroup}>
        <button type="button" className={styles.iconButton} onClick={() => onZoom(1 / 1.3)} aria-label="Zoom out">
          −
        </button>
        <button type="button" className={styles.iconButton} onClick={() => onZoom(1.3)} aria-label="Zoom in">
          +
        </button>
      </div>

      <div className={styles.controlGroup}>
        <Toggle label="Labels" on={settings.showLabels} onClick={() => onChange({ showLabels: !settings.showLabels })} />
        <Toggle label="Orbits" on={settings.showOrbits} onClick={() => onChange({ showOrbits: !settings.showOrbits })} />
        <Toggle label="Trails" on={settings.showTrails} onClick={() => onChange({ showTrails: !settings.showTrails })} />
      </div>
    </div>
  );
}
