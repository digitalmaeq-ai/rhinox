"use client";

import { useRef } from "react";

import { glow } from "@/lib/code-studio/microbit";
import type { GestureName } from "@/lib/code-studio/microbit";
import type { SensorValues } from "@/lib/code-studio/runner";

import styles from "./CodeStudio.module.css";

type Props = {
  /** The name above the board, for example "micro:bit" or "micro:bit 2". */
  title?: string;
  /** False on the second board: the speaker is on the first. */
  showMute?: boolean;
  leds: number[];
  running: boolean;
  sensors: SensorValues;
  muted: boolean;
  onButton: (button: "a" | "b" | "logo", down: boolean) => void;
  onPin: (pin: 0 | 1 | 2, touched: boolean) => void;
  onGesture: (name: GestureName) => void;
  onSensors: (next: SensorValues) => void;
  onMute: (muted: boolean) => void;
};

const POSES: { label: string; x: number; y: number; z: number }[] = [
  { label: "Face up", x: 0, y: 0, z: -1024 },
  { label: "Face down", x: 0, y: 0, z: 1024 },
  { label: "Tilt left", x: -1024, y: 0, z: 0 },
  { label: "Tilt right", x: 1024, y: 0, z: 0 },
  { label: "Logo up", x: 0, y: -1024, z: 0 },
  { label: "Logo down", x: 0, y: 1024, z: 0 },
];

// A press that holds the button down for at least this long, so a quick tap is never missed.
const MIN_PRESS_MS = 140;

function usePress(onChange: (down: boolean) => void) {
  const downAt = useRef(0);
  const release = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => {
    if (release.current) {
      // The last press is still being held for its minimum time: let go now, so this press counts as a new one.
      clearTimeout(release.current);
      release.current = null;
      onChange(false);
    }
    downAt.current = performance.now();
    onChange(true);
  };
  const end = () => {
    if (downAt.current === 0) return;
    const wait = Math.max(0, MIN_PRESS_MS - (performance.now() - downAt.current));
    downAt.current = 0;
    release.current = setTimeout(() => onChange(false), wait);
  };
  return {
    onPointerDown: (event: React.PointerEvent) => {
      (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
      start();
    },
    onPointerUp: end,
    onPointerCancel: end,
    onKeyDown: (event: React.KeyboardEvent) => {
      if ((event.key === " " || event.key === "Enter") && !event.repeat) {
        event.preventDefault();
        start();
      }
    },
    onKeyUp: (event: React.KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") end();
    },
    onBlur: end,
  };
}

export default function MicrobitPanel({ title = "micro:bit", showMute = true, leds, running, sensors, muted, onButton, onPin, onGesture, onSensors, onMute }: Props) {
  const a = usePress((down) => onButton("a", down));
  const b = usePress((down) => onButton("b", down));
  const logo = usePress((down) => onButton("logo", down));
  const p0 = usePress((down) => onPin(0, down));
  const p1 = usePress((down) => onPin(1, down));
  const p2 = usePress((down) => onPin(2, down));

  return (
    <section className={styles.board} aria-label={`${title} simulator`}>
      <h2 className={styles.boardTitle}>{title}</h2>
      <div className={styles.boardBody}>
        <div className={styles.boardArt}>
          <svg viewBox="0 0 320 250" role="img" aria-label={`A ${title} with a 5 by 5 grid of lights, buttons A and B, and a touch logo`} className={styles.boardSvg}>
            <rect x="4" y="4" width="312" height="242" rx="22" fill="#15305c" stroke="#0b1d3a" strokeWidth="4" />
            <rect x="10" y="10" width="300" height="230" rx="18" fill="none" stroke="#2c5aa0" strokeWidth="1.5" />
            {/* the lights */}
            {leds.map((level, index) => {
              const cx = 100 + (index % 5) * 30;
              const cy = 72 + Math.floor(index / 5) * 30;
              return (
                <g key={index}>
                  <rect x={cx - 11} y={cy - 11} width="22" height="22" rx="5" fill="#0b1d3a" />
                  <rect x={cx - 9} y={cy - 9} width="18" height="18" rx="4" fill="#ff3d3d" opacity={0.08 + glow(level) * 0.92} />
                  {level > 0 && <circle cx={cx} cy={cy} r={15} fill="#ff3d3d" opacity={glow(level) * 0.22} />}
                </g>
              );
            })}
            {/* the logo that can be touched */}
            <g role="button" tabIndex={0} aria-label="Touch logo" className={styles.boardPart} {...logo}>
              <ellipse cx="160" cy="30" rx="26" ry="11" fill="#e9c46a" stroke="#b8902f" strokeWidth="2" />
              <text x="160" y="34" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5b4310">TOUCH</text>
            </g>
            {/* the buttons */}
            <g role="button" tabIndex={0} aria-label="Button A" className={styles.boardPart} {...a}>
              <circle cx="46" cy="122" r="26" fill="#d4dcea" stroke="#7d8da8" strokeWidth="3" />
              <circle cx="46" cy="122" r="17" fill="#f5f8fd" />
              <text x="46" y="128" textAnchor="middle" fontSize="17" fontWeight="800" fill="#15305c">A</text>
            </g>
            <g role="button" tabIndex={0} aria-label="Button B" className={styles.boardPart} {...b}>
              <circle cx="274" cy="122" r="26" fill="#d4dcea" stroke="#7d8da8" strokeWidth="3" />
              <circle cx="274" cy="122" r="17" fill="#f5f8fd" />
              <text x="274" y="128" textAnchor="middle" fontSize="17" fontWeight="800" fill="#15305c">B</text>
            </g>
            {/* the pins along the bottom edge */}
            {[
              { n: 0, x: 76, h: p0 },
              { n: 1, x: 116, h: p1 },
              { n: 2, x: 156, h: p2 },
            ].map(({ n, x, h }) => (
              <g key={n} role="button" tabIndex={0} aria-label={`Pin ${n}: hold to touch`} className={styles.boardPart} {...h}>
                <rect x={x - 14} y="212" width="28" height="28" rx="14" fill="#e9c46a" stroke="#b8902f" strokeWidth="2" />
                <text x={x} y="231" textAnchor="middle" fontSize="11" fontWeight="800" fill="#5b4310">{n}</text>
              </g>
            ))}
            <text x="230" y="231" fontSize="11" fontWeight="700" fill="#8fb2e6">3V</text>
            <text x="262" y="231" fontSize="11" fontWeight="700" fill="#8fb2e6">GND</text>
          </svg>
          <p className={styles.boardNote}>{running ? "Running. Press the buttons, tilt or shake it." : "Press Run to start your program on the board."}</p>
        </div>

        <div className={styles.boardControls}>
          <fieldset className={styles.boardGroup}>
            <legend>Move it</legend>
            <div className={styles.boardRow}>
              <button type="button" onClick={() => onGesture("shake")} disabled={!running}>Shake</button>
              <button type="button" onClick={() => onGesture("freefall")} disabled={!running}>Drop</button>
            </div>
            <div className={styles.boardRow}>
              {POSES.map((pose) => (
                <button key={pose.label} type="button" onClick={() => onSensors({ ...sensors, x: pose.x, y: pose.y, z: pose.z })}>
                  {pose.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.boardGroup}>
            <legend>Sensors</legend>
            <label className={styles.boardSlider}>
              <span>Temperature <b>{sensors.temperature} °C</b></span>
              <input type="range" min={-5} max={50} value={sensors.temperature} onChange={(e) => onSensors({ ...sensors, temperature: Number(e.target.value) })} />
            </label>
            <label className={styles.boardSlider}>
              <span>Light level <b>{sensors.light}</b></span>
              <input type="range" min={0} max={255} value={sensors.light} onChange={(e) => onSensors({ ...sensors, light: Number(e.target.value) })} />
            </label>
            <label className={styles.boardSlider}>
              <span>Tilt left / right <b>{sensors.x}</b></span>
              <input type="range" min={-1024} max={1024} step={32} value={sensors.x} onChange={(e) => onSensors({ ...sensors, x: Number(e.target.value) })} />
            </label>
            <label className={styles.boardSlider}>
              <span>Tilt up / down <b>{sensors.y}</b></span>
              <input type="range" min={-1024} max={1024} step={32} value={sensors.y} onChange={(e) => onSensors({ ...sensors, y: Number(e.target.value) })} />
            </label>
          </fieldset>

          {showMute ? (
            <label className={styles.boardMute}>
              <input type="checkbox" checked={muted} onChange={(e) => onMute(e.target.checked)} /> Mute the speaker
            </label>
          ) : (
            <p className={styles.boardMute}>The speaker is on the first micro:bit.</p>
          )}
        </div>
      </div>
    </section>
  );
}
