"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { sceneState } from "@/components/scene/sceneState";
import { measureAnchors, poseAt } from "@/components/scene/path";
import { AboutWindow } from "@/components/windows/AboutWindow";
import { ContactWindow } from "@/components/windows/ContactWindow";
import { ExperienceWindow } from "@/components/windows/ExperienceWindow";
import { OriginWindow } from "@/components/windows/OriginWindow";
import { TerminalWindow } from "@/components/windows/TerminalWindow";
import { WorkWindow } from "@/components/windows/WorkWindow";
import { Hero } from "@/components/ui/Hero";
import { Hud } from "@/components/ui/Hud";
import { NowPlaying } from "@/components/ui/NowPlaying";
import { Outro } from "@/components/ui/Outro";
import { Overlays } from "@/components/ui/Overlays";
import { MediaProvider, type MediaManifest } from "@/lib/mediaContext";
import { store } from "@/lib/store";

/** three.js lives in its own chunk; phones and reduced-motion visitors never download it */
const LaptopScene = dynamic(() => import("@/components/scene/LaptopScene"), { ssr: false });

/* The floating 3D laptop needs room, a mouse, motion allowed and WebGL. */
const QUERY = "(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
/** opening the laptop by scrolling: how far (px) the first scroll must go */
const AUTO_OPEN_AT = 40;

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
const subscribe = (cb: () => void) => {
  const mq = matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getMode = () => (matchMedia(QUERY).matches && hasWebGL() ? "3d" : "lite");

export default function Site({ media }: { media: MediaManifest }) {
  const mode = useSyncExternalStore(subscribe, getMode, () => "pending" as const);
  const root = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const play = useCallback(() => {
    setOpened(true);
    sceneState.opened = 1;
  }, []);

  // the first real scroll opens the laptop too
  useEffect(() => {
    if (opened) return;
    const onScroll = () => {
      if (window.scrollY > AUTO_OPEN_AT) play();
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [opened, play]);

  // content fades in once and stays (never re-animates on the way back)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    el.querySelectorAll(".reveal").forEach((n) => io.observe(n));

    // nav highlight follows the section in the middle of the screen
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) store.set({ scene: (e.target as HTMLElement).dataset.scene ?? "intro" });
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    el.querySelectorAll("[data-scene]").forEach((n) => spy.observe(n));
    return () => {
      io.disconnect();
      spy.disconnect();
    };
  }, []);

  // 3D only: scroll position -> laptop pose, pointer -> parallax
  useEffect(() => {
    if (mode !== "3d" || !root.current) return;
    const el = root.current;
    let anchors = measureAnchors(el);
    let raf = 0;
    const update = () => {
      raf = 0;
      poseAt(anchors, window.scrollY, sceneState.target);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const remeasure = () => {
      anchors = measureAnchors(el);
      update();
    };
    const ro = new ResizeObserver(remeasure);
    ro.observe(el);
    const onMove = (e: PointerEvent) => {
      sceneState.mouseX = (e.clientX / innerWidth) * 2 - 1;
      sceneState.mouseY = (e.clientY / innerHeight) * 2 - 1;
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
    };
  }, [mode]);

  // experience rail fills as its section scrolls past (transform only, rAF-throttled)
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const exp = root.current?.querySelector<HTMLElement>("#experience");
    const rail = root.current?.querySelector<HTMLElement>("[data-vrail]");
    if (!exp || !rail) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = exp.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      rail.style.transform = `scaleY(${p.toFixed(3)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const onSceneReady = useCallback(() => setSceneReady(true), []);

  return (
    <MediaProvider value={media}>
      <div className={`site is-${mode}`} ref={root} id="top">
        {mode === "3d" ? (
          <div className={`scene ${sceneReady ? "is-ready" : ""}`}>
            <LaptopScene onReady={onSceneReady} />
          </div>
        ) : null}

        <Hud />
        <main>
          <div data-scene="intro">
            <Hero opened={opened} onPlay={play} cssLaptop={mode === "lite"} />
          </div>

          <div className="sec side-right reveal" data-pose="about" data-scene="about">
            <AboutWindow />
          </div>
          <div className="sec side-left reveal" data-pose="experience" data-scene="experience">
            <ExperienceWindow vertical />
          </div>
          <NowPlaying />
          <div className="sec side-right reveal" data-pose="origin" data-scene="about">
            <OriginWindow />
          </div>
          <div className="sec sec-work reveal" data-pose="work" data-scene="work">
            <WorkWindow />
          </div>
          <div className="sec side-left reveal" data-pose="terminal" data-scene="work">
            <TerminalWindow />
          </div>
          <div className="sec side-right reveal" data-pose="contact" data-scene="contact">
            <ContactWindow />
          </div>
          <div className="reveal" data-scene="contact">
            <Outro />
          </div>
        </main>
        <Overlays />
      </div>
    </MediaProvider>
  );
}
