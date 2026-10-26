/**
 * Mutable bridge between the page (writer) and the R3F render loop (reader).
 * Plain object on purpose: zero React renders, zero allocations per frame.
 * The page writes *targets*; Laptop.tsx eases its real pose toward them.
 */
export type Pose = {
  /** laptop position (world units) */
  x: number;
  y: number;
  /** uniform scale */
  s: number;
  /** rotation, radians */
  ry: number;
  rx: number;
  /** 0 outside .. 1 camera inside the screen */
  dive: number;
  /** lid multiplier for this part of the page (0 = closed) */
  lid: number;
};

export const sceneState = {
  target: { x: 2.1, y: -0.15, s: 1, ry: -0.55, rx: 0.12, dive: 0, lid: 1 } as Pose,
  /** set to 1 by the Play button or the first scroll; the lid then opens on its own */
  opened: 0,
  /** normalised pointer, -1..1 */
  mouseX: 0,
  mouseY: 0,
  /** written back by the render loop: how far the camera currently is inside the screen */
  diveNow: 0,
};
