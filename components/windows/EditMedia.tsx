"use client";

import { useEffect, useRef, useState } from "react";
import type { Edit } from "@/lib/content";
import { useMedia } from "@/lib/mediaContext";

/**
 * Media slot for one edit. Layers, bottom to top:
 *   1. animated "graded" placeholder (always rendered, so the slot is never empty)
 *   2. /public/posters/<slug>.(jpg|webp|png) if it exists
 *   3. /public/videos/<slug>.(mp4|webm) if it exists: muted, looping, loaded on first play
 * Which files exist is read from /public at build time (lib/media.ts).
 */
export function EditMedia({ edit, playing, large = false }: { edit: Edit; playing: boolean; large?: boolean }) {
  const { videos, posters } = useMedia();
  const videoSrc = videos[edit.slug];
  const posterSrc = posters[edit.slug];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [armed, setArmed] = useState(false);

  // only attach the video the first time it is asked to play (derived state, no effect)
  if (playing && !armed && videoSrc) setArmed(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing, armed]);

  return (
    <div
      className={`media ${large ? "is-large" : ""} ${playing ? "is-playing" : ""}`}
      style={{ ["--g1" as string]: edit.grade[0], ["--g2" as string]: edit.grade[1] }}
    >
      <div className="media-ph" aria-hidden="true">
        <span className="media-ph-sweep" />
        <span className="media-ph-num">{edit.num}</span>
        <span className="media-ph-title">{edit.title}</span>
        <span className="media-ph-safe" />
      </div>
      {posterSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-dropped file of unknown size; next/image needs dimensions
        <img className="media-poster" src={posterSrc} alt="" loading="lazy" decoding="async" data-on="" />
      ) : null}
      {armed && !failed ? (
        <video
          ref={videoRef}
          className="media-video"
          src={videoSrc}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="metadata"
          data-on={ready ? "" : undefined}
          onCanPlay={() => setReady(true)}
          onError={() => setFailed(true)}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
