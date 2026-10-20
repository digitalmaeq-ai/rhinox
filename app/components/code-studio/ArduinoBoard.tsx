"use client";

import { useRef } from "react";

import { NETWORKS, WL, brightness, kitOf, type BoardId, type PinState } from "@/lib/code-studio/arduino";

import shared from "./CodeStudio.module.css";
import styles from "./ArduinoStudio.module.css";

type Props = {
  board: BoardId;
  pins: PinState;
  wifi: { status: number; ssid: string };
  router: boolean;
  onRouter: (up: boolean) => void;
  running: boolean;
  buzzing: boolean;
  muted: boolean;
  dials: [number, number];
  onButton: (pin: number, down: boolean) => void;
  onDial: (analog: 0 | 1, value: number) => void;
  onMute: (muted: boolean) => void;
};

// The kit's LEDs in order: built-in (amber), red, yellow, green, blue.
const LED_LOOKS = [
  { name: "built-in LED", colour: "#ffb020" },
  { name: "red LED", colour: "#ff4d4d" },
  { name: "yellow LED", colour: "#ffe14d" },
  { name: "green LED", colour: "#3ddc84" },
  { name: "blue LED", colour: "#4da3ff" },
];

function wifiText(status: number, ssid: string): string {
  if (status === WL.CONNECTED) return `Connected to ${ssid}`;
  if (status === WL.NO_SSID_AVAIL) return "Network not found";
  if (status === WL.CONNECT_FAILED) return "Wrong password";
  if (status === WL.NO_SHIELD) return "Wi-Fi not started";
  return "Not connected";
}

// A button held for at least this long, so a quick tap is never missed by a program that is waiting in delay().
const MIN_PRESS_MS = 140;

function PushButton({ pin, label, onChange }: { pin: number; label: string; onChange: (down: boolean) => void }) {
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
      aria-label={`${label} on pin ${pin}. Hold to press.`}
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

export default function ArduinoBoard({ board, pins, wifi, router, onRouter, running, buzzing, muted, dials, onButton, onDial, onMute }: Props) {
  const kit = kitOf(board);
  return (
    <section className={shared.board} aria-label="Arduino board">
      <h2 className={shared.boardTitle}>{kit.name} kit {running ? "· running" : ""}</h2>
      <div className={styles.kit}>
        <div className={styles.group}>
          <h3>LEDs</h3>
          <div className={styles.leds}>
            {kit.ledPins.map((pin: number, index: number) => {
              const b = brightness(pins, pin);
              const on = pins.mode[pin] === 1 && b > 0;
              const { colour, name } = LED_LOOKS[index % LED_LOOKS.length];
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
            {kit.buttonPins.map((pin: number) => (
              <PushButton key={pin} pin={pin} label="Push button" onChange={(down) => onButton(pin, down)} />
            ))}
          </div>
        </div>
        <div className={styles.group}>
          <h3>Dials</h3>
          {([0, 1] as const).map((a) => (
            <label key={a} className={styles.dial}>
              <span>{kit.dialNames[a]}</span>
              <input
                type="range"
                min={0}
                max={kit.adcMax}
                value={dials[a]}
                onChange={(e) => onDial(a, Number(e.target.value))}
                aria-label={`Dial on ${kit.dialNames[a]}, from 0 to ${kit.adcMax}`}
              />
              <output>{dials[a]}</output>
            </label>
          ))}
        </div>
        {kit.touchPins.length > 0 && (
          <div className={styles.group}>
            <h3>Touch pads</h3>
            <div className={styles.row}>
              {kit.touchPins.map((pin: number) => (
                <PushButton key={pin} pin={pin} label="Touch pad" onChange={(down) => onButton(pin, down)} />
              ))}
            </div>
          </div>
        )}
        <div className={styles.group}>
          <h3>Buzzer</h3>
          <div className={styles.row}>
            <span className={styles.buzzer} data-on={buzzing && !muted ? "1" : "0"} role="img" aria-label={`Buzzer on pin ${kit.buzzerPin}: ${buzzing ? "sounding" : "quiet"}`}>
              {buzzing ? "♪" : "·"}
            </span>
            <label className={styles.mute}>
              <input type="checkbox" checked={muted} onChange={(e) => onMute(e.target.checked)} /> Mute
            </label>
          </div>
        </div>
        {kit.wifi && (
          <div className={styles.group}>
            <h3>Wi-Fi</h3>
            <p className={styles.wifi} role="status" data-wifi={wifi.status}>
              {wifiText(wifi.status, wifi.ssid)}
            </p>
            <label className={styles.mute}>
              <input type="checkbox" checked={router} onChange={(e) => onRouter(e.target.checked)} /> Router on
            </label>
            <ul className={styles.nets}>
              {NETWORKS.map((n: { ssid: string; password: string }) => (
                <li key={n.ssid}>
                  {n.ssid} · {n.password ? `password ${n.password}` : "open (no password)"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className={shared.boardNote}>
        {board === "uno"
          ? "Buttons join their pin to ground when held (use INPUT_PULLUP, and a held button reads LOW). Dials are on A0 and A1. The buzzer is on pin 8."
          : "Buttons join their pin to ground when held (use INPUT_PULLUP, and a held button reads LOW). Dials read 0 to 4095. Touch pads read about 70, and about 8 when touched. The buzzer is on GPIO 27."}
      </p>
    </section>
  );
}
