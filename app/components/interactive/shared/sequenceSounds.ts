// Tiny Web Audio synth for the sequencing game. No audio files: every sound is a
// few oscillator notes. The AudioContext is only created after a tap or click
// (browsers block sound before that) and every call is wrapped so audio can
// never break the game.

export type SequenceSound = "pick" | "good" | "bad" | "swap" | "hint" | "round" | "win";

const STORE_KEY = "rhinox-sequence-sound";

let ctx: AudioContext | null = null;
let muted = false;

export function readSequenceMuted(): boolean {
  try {
    return window.localStorage.getItem(STORE_KEY) === "off";
  } catch {
    return false;
  }
}

export function setSequenceMuted(value: boolean) {
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

export function playSequenceSound(name: SequenceSound) {
  if (muted) return;
  const audio = context();
  if (!audio) return;
  try {
    switch (name) {
      case "pick":
        tone(audio, 520, 0, 0.06, "triangle", 0.09);
        break;
      case "swap":
        tone(audio, 440, 0, 0.06, "triangle", 0.1, 600);
        break;
      case "good":
        tone(audio, 660, 0, 0.09, "triangle", 0.13);
        tone(audio, 880, 0.08, 0.14, "triangle", 0.13);
        break;
      case "bad":
        tone(audio, 220, 0, 0.16, "sawtooth", 0.08, 140);
        break;
      case "hint":
        tone(audio, 784, 0, 0.1, "sine", 0.1);
        tone(audio, 988, 0.1, 0.12, "sine", 0.1);
        break;
      case "round":
        [523, 659, 784].forEach((f, i) => tone(audio, f, i * 0.1, 0.18, "triangle", 0.14));
        break;
      case "win":
        [523, 659, 784, 1047, 1319].forEach((f, i) => tone(audio, f, i * 0.12, 0.24, "triangle", 0.14));
        break;
    }
  } catch {
    /* ignore audio errors */
  }
}
