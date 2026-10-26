"use client";

import { store } from "./store";

/** Synthesised UI sounds (no audio files). Silent unless the user turns sound on. */
let ctx: AudioContext | null = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

/** short tape "tick" for cuts / window opens */
export function playCut(pitch = 1) {
  if (!store.get().sound) return;
  try {
    const c = ac();
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(880 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(220 * pitch, t + 0.06);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.1);
  } catch {
    /* audio is optional */
  }
}

export function toggleSound() {
  const next = !store.get().sound;
  store.set({ sound: next });
  if (next) {
    ac().resume();
    playCut(1.2);
  }
}
