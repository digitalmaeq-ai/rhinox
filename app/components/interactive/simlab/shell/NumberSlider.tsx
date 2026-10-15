"use client";

import { useState } from "react";

import styles from "./NumberSlider.module.css";

const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;

/**
 * A slider with a box beside it, so a value can be dragged or simply typed.
 * Typing is free-form; the value is applied as soon as it is a valid number
 * in range, and snapped to the step and clamped when the box is left or
 * Enter is pressed. Arrow keys in the box step the value too.
 */
export default function NumberSlider({
  id,
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const places = Math.max(decimals(step), decimals(min));
  const snap = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    const stepped = Math.round((clamped - min) / step) * step + min;
    return Number(Math.min(max, stepped).toFixed(places));
  };

  const commit = () => {
    if (draft !== null) {
      const parsed = Number(draft);
      if (draft.trim() !== "" && Number.isFinite(parsed)) onChange(snap(parsed));
    }
    setDraft(null);
  };

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.field}>
      <label htmlFor={`${id}-num`} className={styles.label}>
        {label}
      </label>
      <div className={styles.row}>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            setDraft(null);
            onChange(Number(e.target.value));
          }}
          className={styles.range}
          style={{ ["--fill" as string]: `${pct}%` }}
          aria-label={`${label} slider`}
          aria-valuetext={`${value}${unit ? ` ${unit}` : ""}`}
        />
        <span className={styles.box}>
          <input
            id={`${id}-num`}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            value={draft ?? String(value)}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              setDraft(e.target.value);
              const parsed = Number(e.target.value);
              if (e.target.value.trim() !== "" && Number.isFinite(parsed) && parsed >= min && parsed <= max) {
                onChange(snap(parsed));
              }
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
                e.currentTarget.blur();
              }
              if (e.key === "Escape") setDraft(null);
            }}
            className={styles.number}
          />
          {unit && <span className={styles.unit}>{unit}</span>}
        </span>
      </div>
    </div>
  );
}
