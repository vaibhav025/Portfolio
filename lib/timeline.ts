/**
 * Master scroll timeline. Every scene's length is in "beats"; one beat is
 * SCROLL_PER_BEAT of viewport height. Tweak pacing here, nothing else needs to change.
 */

export const SCROLL_PER_BEAT = 100; // vh of scroll per beat
export const FPS = 25; // timecode frame rate
export const RUNTIME_SECONDS = 150; // what the full scroll reads as on the timecode

export const SCENES = [
  { id: "intro", label: "Intro", beats: 1 },
  { id: "lid", label: "Open", beats: 1.6 },
  { id: "dive", label: "Dive", beats: 1.4 },
  { id: "boot", label: "Boot", beats: 1.4 },
  { id: "about", label: "About", beats: 2.4 },
  { id: "experience", label: "Experience", beats: 3.6 },
  { id: "origin", label: "Origin", beats: 2.6 },
  { id: "work", label: "Work", beats: 7 },
  { id: "terminal", label: "Render", beats: 2 },
  { id: "contact", label: "Contact", beats: 2.2 },
  { id: "outro", label: "Outro", beats: 2.6 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const TOTAL_BEATS = SCENES.reduce((s, x) => s + x.beats, 0);

/** start beat of each scene */
export const SCENE_START: Record<SceneId, number> = SCENES.reduce(
  (acc, s, i) => {
    acc[s.id] = i === 0 ? 0 : acc[SCENES[i - 1].id] + SCENES[i - 1].beats;
    return acc;
  },
  {} as Record<SceneId, number>,
);

/** Motion-design easing. Never linear for anything that moves. */
export const EASE = {
  out: "expo.out",
  inOut: "expo.inOut",
  soft: "power3.inOut",
  snap: "power4.out",
  in: "power3.in",
};

export const COLORS = {
  void: "#0b0b0d",
  graphite: "#141417",
  bone: "#ece6da",
  accent: "#ff4d1f",
};

/** Frame number -> 00:00:12:08 */
export function toTimecode(seconds: number, fps = FPS) {
  const total = Math.max(0, Math.floor(seconds * fps));
  const f = total % fps;
  const s = Math.floor(total / fps);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}
