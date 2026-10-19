// Tiny Web Audio synth for Robot Maze Coder. No audio files: every sound is a few
// oscillator notes. The AudioContext is only created after a click/tap (browsers block
// sound before that), and every call is wrapped so audio can never break the game.

export type SoundName = "add" | "remove" | "run" | "move" | "turn" | "chip" | "bump" | "win" | "fail";

const STORE_KEY = "rhinox-maze-sound";

let ctx: AudioContext | null = null;
let muted = false;

export function readMuted(): boolean {
  try {
    return window.localStorage.getItem(STORE_KEY) === "off";
  } catch {
    return false;
  }
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    window.localStorage.setItem(STORE_KEY, value ? "off" : "on");
  } catch {
    /* storage unavailable: the choice just lasts for this visit */
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

export function playSound(name: SoundName) {
  if (muted) return;
  const audio = context();
  if (!audio) return;
  try {
    switch (name) {
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
      case "turn":
        tone(audio, 520, 0, 0.07, "triangle", 0.09, 700);
        break;
      case "chip":
        tone(audio, 988, 0, 0.08, "sine", 0.13);
        tone(audio, 1319, 0.07, 0.14, "sine", 0.13);
        break;
      case "bump":
        tone(audio, 150, 0, 0.18, "sawtooth", 0.1, 70);
        break;
      case "win":
        [523, 659, 784, 1047].forEach((f, i) => tone(audio, f, i * 0.11, 0.2, "triangle", 0.14));
        break;
      case "fail":
        tone(audio, 330, 0, 0.16, "triangle", 0.11, 262);
        tone(audio, 262, 0.16, 0.24, "triangle", 0.11, 196);
        break;
    }
  } catch {
    /* ignore audio errors */
  }
}
