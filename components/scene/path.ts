import type { Pose } from "./sceneState";

/**
 * Where the floating laptop sits for each section (desktop only).
 * Sections opt in with data-pose="<key>". While a section fills the screen the
 * laptop holds that pose; between sections it glides to the next one.
 * x: negative = left side of the screen, positive = right.
 */
export const POSES: Record<string, Pose> = {
  hero: { x: 2.1, y: -0.15, s: 1, ry: -0.55, rx: 0.12, dive: 0, lid: 1 },
  about: { x: -2.35, y: -0.1, s: 0.82, ry: 0.62, rx: 0.08, dive: 0, lid: 1 },
  experience: { x: 2.4, y: 0, s: 0.78, ry: -0.7, rx: 0.1, dive: 0, lid: 1 },
  // stays out of the way while the role cards play
  now: { x: 3.6, y: -1.4, s: 0.55, ry: -0.9, rx: 0.2, dive: 0, lid: 1 },
  origin: { x: -2.4, y: 0.15, s: 0.74, ry: 0.75, rx: 0.12, dive: 0, lid: 1 },
  // the camera goes inside the screen: the Work section plays "on" the laptop
  work: { x: 0, y: 0, s: 1, ry: 0, rx: 0, dive: 1, lid: 1 },
  terminal: { x: 2.3, y: 0, s: 0.8, ry: -0.6, rx: 0.1, dive: 0, lid: 1 },
  contact: { x: -2.3, y: 0, s: 0.82, ry: 0.55, rx: 0.1, dive: 0, lid: 1 },
  outro: { x: 0, y: -0.35, s: 1.05, ry: 0, rx: 0.2, dive: 0, lid: 0 },
};

/** hold begins when a section's top reaches HOLD_IN of the viewport and ends when its bottom reaches HOLD_OUT */
const HOLD_IN = 0.25;
const HOLD_OUT = 0.75; // travel between two sections = (HOLD_OUT - HOLD_IN) viewports

type Anchor = { y: number; pose: Pose };

/** Measure sections once (and on resize): each yields a hold range [start, end] in scroll px. */
export function measureAnchors(root: ParentNode): Anchor[] {
  const vh = window.innerHeight;
  const out: Anchor[] = [];
  root.querySelectorAll<HTMLElement>("[data-pose]").forEach((el) => {
    const pose = POSES[el.dataset.pose ?? ""];
    if (!pose) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const start = Math.max(0, top - vh * HOLD_IN);
    const end = Math.max(start, top + el.offsetHeight - vh * HOLD_OUT);
    out.push({ y: start, pose }, { y: end, pose });
  });
  out.sort((a, b) => a.y - b.y);
  return out;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const KEYS = ["x", "y", "s", "ry", "rx", "dive", "lid"] as const;

/** Interpolate the pose for a scroll position into `out` (no allocation). */
export function poseAt(anchors: Anchor[], scrollY: number, out: Pose) {
  if (!anchors.length) return;
  let i = 0;
  while (i < anchors.length - 1 && anchors[i + 1].y <= scrollY) i++;
  const a = anchors[i];
  const b = anchors[Math.min(i + 1, anchors.length - 1)];
  const t = b.y > a.y ? smooth(Math.min(1, Math.max(0, (scrollY - a.y) / (b.y - a.y)))) : 0;
  for (const k of KEYS) out[k] = a.pose[k] + (b.pose[k] - a.pose[k]) * t;
}
