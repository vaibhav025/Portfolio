export const FPS = 25; // timecode frame rate

/** seconds -> 00:00:12:08 */
export function toTimecode(seconds: number, fps = FPS) {
  const total = Math.max(0, Math.floor(seconds * fps));
  const f = total % fps;
  const s = Math.floor(total / fps);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}
