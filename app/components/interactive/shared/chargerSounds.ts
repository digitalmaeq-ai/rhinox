// Tiny Web Audio synth for "Reach the Charger". No audio files: every sound is a
// few oscillator notes. The AudioContext is created only after a click or tap
// (browsers block sound before that) and every call is wrapped, so audio can
// never break the game.

export type ChargerSound = "add" | "remove" | "run" | "move" | "bolt" | "bump" | "flat" | "charge" | "level" | "win" | "hint" | "pick";

const STORE_KEY = "rhinox-charger-sound";

let ctx: AudioContext | null = null;
let muted = false;

export function readChargerMuted(): boolean {
  try {
    return window.localStorage.getItem(STORE_KEY) === "off";
  } catch {
    return false;
  }
}

export function setChargerMuted(value: boolean) {
  muted = value;
  try {
    window.localStorage.setItem(STORE_KEY, value ? "off" : "on");
  } catch {
    /* storage unavailable: the choice lasts for this visit only */
  }
}

function context(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(audio: AudioContext, freq: number, start: number, length: number, type: OscillatorType, volume: number, slideTo?: number) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const t0 = audio.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + length);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + length + 0.03);
}

export function playChargerSound(name: ChargerSound) {
  if (muted) return;
  const audio = context();
  if (!audio) return;
  try {
    switch (name) {
      case "pick":
        tone(audio, 600, 0, 0.06, "triangle", 0.1);
        break;
      case "add":
        tone(audio, 660, 0, 0.07, "triangle", 0.12);
        break;
      case "remove":
        tone(audio, 330, 0, 0.08, "triangle", 0.1, 220);
        break;
      case "run":
        tone(audio, 392, 0, 0.09, "square", 0.06);
        tone(audio, 587, 0.09, 0.12, "square", 0.06);
        break;
      case "move":
        tone(audio, 220, 0, 0.09, "sine", 0.14, 300);
        break;
      case "bolt":
        tone(audio, 880, 0, 0.08, "triangle", 0.14);
        tone(audio, 1320, 0.07, 0.14, "triangle", 0.14);
        break;
      case "bump":
        tone(audio, 160, 0, 0.18, "sawtooth", 0.12, 70);
        break;
      case "flat":
        tone(audio, 440, 0, 0.16, "triangle", 0.12, 150);
        tone(audio, 300, 0.16, 0.22, "triangle", 0.1, 90);
        break;
      case "charge":
        [523, 659, 784, 1047].forEach((f, i) => tone(audio, f, i * 0.09, 0.16, "triangle", 0.14));
        break;
      case "level":
        [523, 659, 784, 1047, 1319].forEach((f, i) => tone(audio, f, i * 0.1, 0.2, "triangle", 0.15));
        break;
      case "win":
        [523, 659, 784, 1047].forEach((f, i) => tone(audio, f, i * 0.12, 0.22, "triangle", 0.15));
        [784, 988, 1175, 1568].forEach((f, i) => tone(audio, f, 0.5 + i * 0.12, 0.3, "triangle", 0.15));
        break;
      case "hint":
        tone(audio, 740, 0, 0.1, "sine", 0.1);
        tone(audio, 988, 0.1, 0.14, "sine", 0.1);
        break;
    }
  } catch {
    /* never let a sound problem interrupt the game */
  }
}
