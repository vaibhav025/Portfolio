import fs from "node:fs";
import path from "node:path";
import type { MediaManifest } from "./mediaContext";

const VIDEO_EXT = [".mp4", ".webm"];
const POSTER_EXT = [".jpg", ".jpeg", ".webp", ".png", ".avif"];

function scan(dir: string, exts: string[]) {
  const out: Record<string, string> = {};
  try {
    for (const f of fs.readdirSync(path.join(process.cwd(), "public", dir))) {
      const ext = path.extname(f).toLowerCase();
      if (exts.includes(ext)) out[path.basename(f, ext)] = `/${dir}/${f}`;
    }
  } catch {
    /* folder missing: no media yet */
  }
  return out;
}

/**
 * Server-only: which edit slugs have a real video / poster in /public.
 * Runs at build time, so dropping a file in and redeploying is all it takes.
 */
export function getMediaManifest(): MediaManifest {
  return { videos: scan("videos", VIDEO_EXT), posters: scan("posters", POSTER_EXT) };
}
