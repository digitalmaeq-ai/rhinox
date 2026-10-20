"use client";

import { useRef } from "react";

import { BUTTON_PINS, BUZZER_PIN, LED_PINS, brightness, type PinState } from "@/lib/code-studio/arduino";

import shared from "./CodeStudio.module.css";
import styles from "./ArduinoStudio.module.css";

type Props = {
  pins: PinState;
  running: boolean;
  buzzing: boolean;
  muted: boolean;
  dials: [number, number];
  onButton: (pin: number, down: boolean) => void;
  onDial: (analog: 0 | 1, value: number) => void;
  onMute: (muted: boolean) => void;
};

const LED_COLOURS: Record<number, { name: string; colour: string }> = {
  13: { name: "built-in LED", colour: "#ffb020" },
  12: { name: "red LED", colour: "#ff4d4d" },
  11: { name: "yellow LED", colour: "#ffe14d" },
  10: { name: "green LED", colour: "#3ddc84" },
  9: { name: "blue LED", colour: "#4da3ff" },
};

// A button held for at least this long, so a quick tap is never missed by a program that is waiting in delay().
const MIN_PRESS_MS = 140;

function PushButton({ pin, onChange }: { pin: number; onChange: (down: boolean) => void }) {
  const downAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      onChange(false);
    }
    downAt.current = performance.now();
    onChange(true);
  };
  const end = () => {
    const wait = Math.max(0, MIN_PRESS_MS - (performance.now() - downAt.current));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      onChange(false);
    }, wait);
  };
  return (
    <button
      type="button"
      className={styles.push}
      aria-label={`Push button on pin ${pin}. Hold to press.`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        start();
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") end();
      }}
    >
      Pin {pin}
    </button>
  );
}

export default function ArduinoBoard({ pins, running, buzzing, muted, dials, onButton, onDial, onMute }: Props) {
  return (
    <section className={shared.board} aria-label="Arduino board">
      <h2 className={shared.boardTitle}>Arduino Uno kit {running ? "· running" : ""}</h2>
      <div className={styles.kit}>
        <div className={styles.group}>
          <h3>LEDs</h3>
          <div className={styles.leds}>
            {LED_PINS.map((pin) => {
              const b = brightness(pins, pin);
              const on = pins.mode[pin] === 1 && b > 0;
              const { colour, name } = LED_COLOURS[pin];
              return (
                <div key={pin} className={styles.led}>
                  <span
                    className={styles.bulb}
                    data-pin={pin}
                    data-lit={on ? "1" : "0"}
                    role="img"
                    aria-label={`${name} on pin ${pin}: ${on ? (b < 1 ? `${Math.round(b * 100)} percent bright` : "on") : "off"}`}
                    style={{
                      background: on ? colour : "#2a3a55",
                      opacity: on ? 0.35 + 0.65 * b : 1,
                      boxShadow: on ? `0 0 ${6 + 14 * b}px ${colour}` : "none",
                    }}
                  />
                  <span>Pin {pin}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.group}>
          <h3>Buttons</h3>
          <div className={styles.row}>
            {BUTTON_PINS.map((pin) => (
              <PushButton key={pin} pin={pin} onChange={(down) => onButton(pin, down)} />
            ))}
          </div>
        </div>
        <div className={styles.group}>
          <h3>Dials</h3>
          {([0, 1] as const).map((a) => (
            <label key={a} className={styles.dial}>
              <span>A{a}</span>
              <input
                type="range"
                min={0}
                max={1023}
                value={dials[a]}
                onChange={(e) => onDial(a, Number(e.target.value))}
                aria-label={`Dial on A${a}, from 0 to 1023`}
              />
              <output>{dials[a]}</output>
            </label>
          ))}
        </div>
        <div className={styles.group}>
          <h3>Buzzer</h3>
          <div className={styles.row}>
            <span className={styles.buzzer} data-on={buzzing && !muted ? "1" : "0"} role="img" aria-label={`Buzzer on pin ${BUZZER_PIN}: ${buzzing ? "sounding" : "quiet"}`}>
              {buzzing ? "♪" : "·"}
            </span>
            <label className={styles.mute}>
              <input type="checkbox" checked={muted} onChange={(e) => onMute(e.target.checked)} /> Mute
            </label>
          </div>
        </div>
      </div>
      <p className={shared.boardNote}>
        Buttons join their pin to ground when held (use INPUT_PULLUP, and a held button reads LOW). Dials are on A0 and A1. The buzzer is on pin 8.
      </p>
    </section>
  );
}
