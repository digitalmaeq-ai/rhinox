// The micro:bit's speaker. One note at a time, like the real board.
// Browsers only allow sound after the learner has pressed something, so the
// page calls prepareAudio() from the Run button.
let context: AudioContext | null = null;
let voice: { oscillator: OscillatorNode; gain: GainNode } | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
  } catch {
    context = null;
  }
  return context;
}

export function prepareAudio() {
  const ctx = audioContext();
  if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {});
}

export function stopTone() {
  if (stopTimer) clearTimeout(stopTimer);
  stopTimer = null;
  if (voice) {
    try {
      voice.gain.gain.value = 0;
      voice.oscillator.stop();
    } catch {
      /* already stopped */
    }
    voice = null;
  }
}

/** Plays one note. frequency 0 is silence. A note replaces the one before it. */
export function playTone(frequency: number, ms: number) {
  stopTone();
  if (frequency <= 0 || ms <= 0) return;
  const ctx = audioContext();
  if (!ctx || ctx.state !== "running") return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = Math.min(20000, Math.max(20, frequency));
  gain.gain.value = 0.06;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  voice = { oscillator, gain };
  stopTimer = setTimeout(stopTone, Math.min(ms, 60000));
}
