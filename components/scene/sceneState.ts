/**
 * Mutable bridge between the GSAP scroll timeline (writer) and the R3F render
 * loop (reader). Plain object on purpose: zero React renders, zero allocations.
 */
export const sceneState = {
  /** 0 closed .. 1 fully open */
  lid: 0,
  /** screen backlight 0..1 */
  power: 0,
  /** camera dive into the screen 0..1 */
  dive: 0,
  /** normalised pointer, -1..1 */
  mouseX: 0,
  mouseY: 0,
};

/* Render-loop gate: the canvas stops rendering while the DOM desktop covers it. */
type Gate = (running: boolean) => void;
let gate: Gate | null = null;
let running = true;

export function bindGate(fn: Gate | null) {
  gate = fn;
  fn?.(running);
}

export function setSceneRunning(v: boolean) {
  if (v === running) return;
  running = v;
  gate?.(v);
}
