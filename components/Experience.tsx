"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { MediaProvider, type MediaManifest } from "@/lib/mediaContext";
import Linear from "./Linear";
import { Loader } from "./ui/Loader";

/** The 3D suite (three.js, GSAP, Lenis) is a separate chunk that mobile never downloads. */
const Suite = dynamic(() => import("./Suite"), { ssr: false });

/* The suite needs room, a precise pointer, motion allowed and WebGL. */
const SUITE_QUERY = "(min-width: 900px) and (min-height: 560px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

let webgl: boolean | null = null;
function hasWebGL() {
  if (webgl === null) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

function subscribe(cb: () => void) {
  const mq = matchMedia(SUITE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getMode = () => (matchMedia(SUITE_QUERY).matches && hasWebGL() ? "suite" : "linear");

export default function Experience({ media }: { media: MediaManifest }) {
  // server + first client render: "pending" (loader shown on desktop via CSS, linear content underneath)
  const mode = useSyncExternalStore(subscribe, getMode, () => "pending" as const);
  const [progress, setProgress] = useState(0.06);
  const [ready, setReady] = useState(false);

  const bump = useCallback((to: number) => setProgress((p) => Math.max(p, to)), []);

  // real progress: fonts (0.35) -> suite chunk mounted (0.7) -> first 3D frame (1)
  useEffect(() => {
    if (mode !== "suite") return;
    let alive = true;
    document.fonts?.ready.then(() => alive && bump(0.35));
    return () => {
      alive = false;
    };
  }, [mode, bump]);

  const onSuiteMounted = useCallback(() => bump(0.7), [bump]);

  const onSceneReady = useCallback(() => {
    bump(1);
    // let the bar visibly reach 100% before the dialog closes
    setTimeout(() => setReady(true), 450);
  }, [bump]);

  return (
    <MediaProvider value={media}>
      {mode === "suite" ? (
        <Suite onMounted={onSuiteMounted} onSceneReady={onSceneReady} started={ready} />
      ) : (
        <Linear />
      )}
      {mode !== "linear" ? <Loader progress={progress} done={ready} pending={mode === "pending"} /> : null}
      <noscript>
        <style>{`.loader{display:none!important}`}</style>
      </noscript>
    </MediaProvider>
  );
}
