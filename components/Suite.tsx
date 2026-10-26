"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { sceneState, setSceneRunning } from "@/components/scene/sceneState";
import { Desktop } from "@/components/windows/Desktop";
import { CLIP_SPANS } from "@/components/windows/ExperienceWindow";
import { WORK_ITEMS } from "@/components/windows/WorkWindow";
import { Cursor } from "@/components/ui/Cursor";
import { HeroFront, HeroName } from "@/components/ui/HeroTitle";
import { Hud, type HudHandle } from "@/components/ui/Hud";
import { Outro } from "@/components/ui/Outro";
import { Overlays } from "@/components/ui/Overlays";
import { playCut } from "@/lib/sfx";
import { store } from "@/lib/store";
import {
  EASE,
  RUNTIME_SECONDS,
  SCENES,
  SCENE_START as S,
  SCROLL_PER_BEAT,
  TOTAL_BEATS,
  toTimecode,
  type SceneId,
} from "@/lib/timeline";

const LaptopScene = dynamic(() => import("@/components/scene/LaptopScene"), { ssr: false });

/* ---------- tweakables ---------- */
const STAGE_W = 1280; // design size of the desktop stage (windows + dock)
const STAGE_H = 800;
const SCRUB = 0.7; // seconds the timeline trails the scroll position (smoothing)
const WIN_OPEN = 0.55; // beats
const WIN_CLOSE = 0.4;
/** where in a scene a nav jump lands (beats after the scene start), so the window is already open */
const LAND: Partial<Record<SceneId, number>> = { about: 1.2, experience: 0.7, origin: 1.3, work: 0.9, terminal: 1.6, contact: 1.4 };
const WINDOW_SCENES: SceneId[] = ["about", "experience", "origin", "work", "terminal", "contact"];
/** in the Work scene the strip moves between these beats */
const WORK_FROM = 0.8;
const WORK_TO = 6.6;

const expoInOut = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
/** dwell: each card holds still for the middle half of its slot, then glides to the next */
const dwell = (x: number) => {
  const n = Math.floor(x);
  const f = Math.min(1, Math.max(0, (x - n - 0.25) / 0.5));
  return n + f * f * (3 - 2 * f);
};

type Props = { onMounted: () => void; onSceneReady: () => void; started: boolean };

export default function Suite({ onMounted, onSceneReady, started }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const hud = useRef<HudHandle>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  /* ---------- scrolling to a beat (nav, dock, transport, rewind) ---------- */
  const scrollToBeat = useCallback((beat: number, focus?: HTMLElement | null) => {
    const st = stRef.current;
    const lenis = lenisRef.current;
    if (!st || !lenis) return;
    const y = st.start + (beat / TOTAL_BEATS) * (st.end - st.start);
    const dist = Math.abs(y - window.scrollY) / window.innerHeight;
    lenis.scrollTo(y, {
      duration: Math.min(2.8, Math.max(0.9, dist * 0.09)),
      easing: expoInOut,
      onComplete: () => focus?.focus({ preventScroll: true }),
    });
  }, []);

  const jump = useCallback(
    (id: SceneId) => {
      const win = root.current?.querySelector<HTMLElement>(`[data-window="${id}"]`);
      scrollToBeat(id === "intro" ? 0 : S[id] + (LAND[id] ?? 0.5), win);
    },
    [scrollToBeat],
  );

  const seekWork = useCallback(
    (i: number) => scrollToBeat(S.work + WORK_FROM + (i / (WORK_ITEMS - 1)) * (WORK_TO - WORK_FROM)),
    [scrollToBeat],
  );

  // the chunk has arrived and mounted: report it to the loader
  useEffect(() => onMounted(), [onMounted]);

  /* ---------- Lenis smooth scroll, driven by the GSAP ticker ---------- */
  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* ---------- pointer parallax for the laptop ---------- */
  useEffect(() => {
    const move = (e: PointerEvent) => {
      sceneState.mouseX = (e.clientX / innerWidth) * 2 - 1;
      sceneState.mouseY = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  /* ---------- hero kinetic type, once the loader has gone ---------- */
  useEffect(() => {
    if (!started || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".kin-ch",
        // y: 0 clears the px value GSAP parses from the CSS start transform
        { yPercent: 115, y: 0, rotate: 6 },
        { yPercent: 0, y: 0, rotate: 0, duration: 1.3, ease: "expo.out", stagger: 0.045, delay: 0.1 },
      );
      gsap.fromTo(".hero-slate > *", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.6 });
      gsap.fromTo(".hero-cue", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, delay: 1.2 });
    }, root);
    return () => ctx.revert();
  }, [started]);

  /* ---------- the master timeline ---------- */
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !track.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const desk = el.querySelector<HTMLElement>("[data-desk]")!;
    const dock = el.querySelector<HTMLElement>("[data-dock]")!;
    const canvasWrap = el.querySelector<HTMLElement>("[data-canvas]")!;
    const win = (id: string) => el.querySelector<HTMLElement>(`[data-window="${id}"]`)!;
    const dockApp = (id: string) => el.querySelector<HTMLElement>(`[data-dock-app="${id}"]`)!;

    // uniform "fit" scale for the design-size stage
    const fit = () => {
      // leave room for the HUD (top) and the master scrubber (bottom)
      const s = Math.min((innerWidth - 32) / STAGE_W, (innerHeight - 96) / STAGE_H, 1.3);
      desk.style.setProperty("--fit", String(s));
    };
    fit();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.out } });
      tl.to({}, { duration: TOTAL_BEATS }, 0); // reserve the full length

      /* --- window helpers: open from its dock icon, close by receding --- */
      const open = (id: SceneId, at: number) => {
        const w = win(id);
        const d = dockApp(id);
        // vector from the window centre to its dock icon, in stage (unscaled) pixels
        const dx = () => dock.offsetLeft + d.offsetLeft + d.offsetWidth / 2 - (w.offsetLeft + w.offsetWidth / 2);
        const dy = () => dock.offsetTop + d.offsetTop + d.offsetHeight / 2 - (w.offsetTop + w.offsetHeight / 2);
        tl.fromTo(
          w,
          { x: dx, y: dy, scale: 0.06, autoAlpha: 0, filter: "blur(8px)" },
          { x: 0, y: 0, scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: WIN_OPEN, ease: "expo.out", immediateRender: false },
          at,
        );
      };
      const close = (id: SceneId, at: number) => {
        tl.to(win(id), { y: -28, scale: 0.94, autoAlpha: 0, filter: "blur(6px)", duration: WIN_CLOSE, ease: "power3.inOut" }, at);
      };
      const reveal = (id: SceneId, sel: string, at: number, stagger = 0.08) => {
        tl.fromTo(
          win(id).querySelectorAll(sel),
          { yPercent: 30, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger, ease: "expo.out", immediateRender: false },
          at,
        );
      };

      /* ===== Scene 1 · intro: hold, the cue fades ===== */
      tl.to("[data-hero-cue]", { autoAlpha: 0, y: 12, duration: 0.4, ease: "power2.in" }, S.intro + 0.45);

      /* ===== Scene 2 · lid opens (easing lives in Laptop.tsx, so proxies run linear) ===== */
      tl.fromTo(sceneState, { lid: 0 }, { lid: 1, duration: 1.6, ease: "none", immediateRender: false }, S.lid);
      tl.fromTo(sceneState, { power: 0 }, { power: 1, duration: 0.7, ease: "power2.out", immediateRender: false }, S.lid + 0.75);
      tl.to('[data-hero-row="0"]', { xPercent: -18, autoAlpha: 0, duration: 1.2, ease: "power3.in" }, S.lid + 0.2);
      tl.to('[data-hero-row="1"]', { xPercent: 18, autoAlpha: 0, duration: 1.2, ease: "power3.in" }, S.lid + 0.2);
      tl.to("[data-hero-front] .hero-slate", { autoAlpha: 0, y: 24, duration: 0.6, ease: "power2.in" }, S.lid);

      /* ===== Scene 3 · dive into the screen, hand off to the DOM desktop ===== */
      tl.fromTo(sceneState, { dive: 0 }, { dive: 1, duration: 1.4, ease: "none", immediateRender: false }, S.dive);
      tl.fromTo(desk, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: "power1.out", immediateRender: false }, S.dive + 1.18);

      /* ===== Scene 4 · boot: lock screen -> unlock -> menubar + dock ===== */
      const lock = desk.querySelector("[data-lock]");
      const menubar = el.querySelector("[data-hud-bg]");
      tl.fromTo(lock, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.4, immediateRender: false }, S.boot);
      tl.to(lock, { yPercent: -100, duration: 0.55, ease: "expo.inOut" }, S.boot + 0.75);
      tl.fromTo(menubar, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, immediateRender: false }, S.boot + 1.0);
      tl.fromTo(dock, { y: 140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, immediateRender: false }, S.boot + 1.05);
      tl.fromTo(
        dock.querySelectorAll(".dock-app"),
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.035, ease: "back.out(1.6)", immediateRender: false },
        S.boot + 1.1,
      );

      /* ===== About ===== */
      open("about", S.about);
      reveal("about", "[data-reveal]", S.about + 0.35, 0.12);
      close("about", S.experience);

      /* ===== Experience: playhead scrubs across the clips ===== */
      open("experience", S.experience + 0.05);
      const expWin = win("experience");
      const playhead = expWin.querySelector<HTMLElement>("[data-playhead]")!;
      const phTc = expWin.querySelector<HTMLElement>("[data-playhead-tc]")!;
      const lane = expWin.querySelector<HTMLElement>(".exp-lane")!;
      const clips = Array.from(expWin.querySelectorAll<HTMLElement>("[data-clip]"));
      const cards = Array.from(expWin.querySelectorAll<HTMLElement>("[data-inspector]"));
      let activeClip = -1;
      const ph = { p: 0 };
      tl.fromTo(
        ph,
        { p: 0 },
        {
          p: 1,
          duration: 2.9,
          ease: "power1.inOut",
          immediateRender: false,
          onUpdate: () => {
            playhead.style.transform = `translateX(${(lane.offsetLeft + ph.p * lane.offsetWidth).toFixed(1)}px)`;
            phTc.textContent = toTimecode(ph.p * 60);
            playhead.toggleAttribute("data-end", ph.p > 0.82); // keep the label inside the window
            let idx = 0;
            CLIP_SPANS.forEach(([a], i) => {
              if (ph.p >= a + 0.02) idx = i;
            });
            if (idx !== activeClip) {
              activeClip = idx;
              clips.forEach((c) => c.toggleAttribute("data-active", Number(c.dataset.clip) === idx));
              cards.forEach((c) => c.toggleAttribute("data-active", Number(c.dataset.inspector) === idx));
              playCut(0.8 + idx * 0.15);
            }
          },
        },
        S.experience + 0.5,
      );
      close("experience", S.origin);

      /* ===== Origin: contact sheet frames drop in ===== */
      open("origin", S.origin + 0.05);
      reveal("origin", ".origin-lead [data-reveal]", S.origin + 0.35);
      tl.fromTo(
        win("origin").querySelectorAll("[data-frame]"),
        { y: 70, rotate: (i: number) => (i % 2 ? 5 : -4), autoAlpha: 0, scale: 0.9 },
        { y: 0, rotate: (i: number) => (i % 2 ? 1.2 : -1), autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.16, ease: "expo.out", immediateRender: false },
        S.origin + 0.55,
      );
      reveal("origin", ".origin-foot [data-reveal]", S.origin + 1.4, 0.18);
      close("origin", S.work);

      /* ===== Work: the hero section. Cover-flow strip scrubbed by scroll ===== */
      open("work", S.work + 0.05);
      const workWin = win("work");
      tl.fromTo(
        workWin.querySelectorAll(".work-head > *, .monitor"),
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07, ease: "expo.out", immediateRender: false },
        S.work + 0.3,
      );
      const flowCards = Array.from(workWin.querySelectorAll<HTMLElement>("[data-card]"));
      const flow = { i: 0 };
      const placeCards = () => {
        const v = dwell(flow.i);
        flowCards.forEach((c, k) => {
          const o = k - v;
          const a = Math.abs(o);
          const rot = Math.max(-55, Math.min(55, -o * 40));
          c.style.transform = `translate3d(${(o * 230).toFixed(1)}px,0,${(-a * 190).toFixed(1)}px) rotateY(${rot.toFixed(2)}deg) scale(${(1 - Math.min(a, 3) * 0.05).toFixed(3)})`;
          c.style.opacity = String(Math.max(0, 1 - Math.max(0, a - 2) * 0.6));
          c.style.zIndex = String(100 - Math.round(a * 10));
        });
        store.set({ workIndex: Math.round(v) });
      };
      placeCards();
      tl.fromTo(
        flow,
        { i: 0 },
        { i: WORK_ITEMS - 1, duration: WORK_TO - WORK_FROM, ease: "none", immediateRender: false, onUpdate: placeCards },
        S.work + WORK_FROM,
      );
      close("work", S.terminal);

      /* ===== Terminal: the render log types itself ===== */
      open("terminal", S.terminal + 0.05);
      tl.fromTo(
        win("terminal").querySelectorAll("[data-line]"),
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.28, stagger: 0.12, ease: "steps(24)", immediateRender: false },
        S.terminal + 0.4,
      );
      close("terminal", S.contact);

      /* ===== Contact ===== */
      open("contact", S.contact + 0.05);
      reveal("contact", "[data-field]", S.contact + 0.35, 0.1);

      /* ===== Outro: shutdown in reverse ===== */
      close("contact", S.outro);
      tl.to(dock.querySelectorAll(".dock-app"), { y: 30, autoAlpha: 0, duration: 0.3, stagger: -0.03, ease: "power2.in" }, S.outro + 0.25);
      tl.to(menubar, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, S.outro + 0.35);
      tl.to(desk, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, S.outro + 0.6);
      tl.fromTo(sceneState, { dive: 1 }, { dive: 0, duration: 1.1, ease: "none", immediateRender: false }, S.outro + 0.6);
      tl.fromTo(sceneState, { power: 1 }, { power: 0, duration: 0.5, ease: "power2.in", immediateRender: false }, S.outro + 1.45);
      tl.fromTo(sceneState, { lid: 1 }, { lid: 0.0, duration: 0.85, ease: "none", immediateRender: false }, S.outro + 1.55);
      tl.fromTo(
        el.querySelectorAll("[data-outro-item]"),
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: "expo.out", immediateRender: false },
        S.outro + 1.75,
      );

      /* --- per-frame bookkeeping (follows the smoothed timeline, not raw scroll) --- */
      let lastScene = "";
      const windows = WINDOW_SCENES.map((id) => win(id));
      tl.eventCallback("onUpdate", () => {
        const t = tl.time();
        const p = t / TOTAL_BEATS;
        hud.current?.setProgress(p, toTimecode(p * RUNTIME_SECONDS));
        // the canvas is fully covered by the desktop between these beats
        const covered = t > S.dive + 1.42 && t < S.outro + 0.58;
        setSceneRunning(!covered);
        canvasWrap.style.visibility = covered ? "hidden" : "visible";

        let scene: string = SCENES[0].id;
        for (const s of SCENES) if (t >= S[s.id] - 0.001) scene = s.id;
        if (scene !== lastScene) {
          lastScene = scene;
          store.set({ scene });
          // only the visible window is reachable by keyboard / screen readers
          windows.forEach((w) => w.toggleAttribute("inert", w.dataset.window !== scene));
          if (WINDOW_SCENES.includes(scene as SceneId)) playCut();
        }
      });

      stRef.current = ScrollTrigger.create({
        trigger: track.current,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB,
        animation: tl,
        invalidateOnRefresh: true,
      });
      tl.progress(0.0001).progress(0); // prime start values + run onUpdate once
    }, el);

    const onResize = () => {
      fit();
      ScrollTrigger.refresh();
    };
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("resize", onResize);
      ctx.revert();
      stRef.current = null;
      setSceneRunning(true);
    };
  }, []);

  return (
    <div className="suite" ref={root} id="top">
      <a className="skip-link" href="#about" onClick={(e) => (e.preventDefault(), jump("about"))}>
        Skip the intro
      </a>
      <Hud ref={hud} onJump={jump} scrubber />

      <div className="stage">
        <div className="stage-back">
          <HeroName />
        </div>
        <div className="stage-canvas" data-canvas>
          <LaptopScene onReady={onSceneReady} />
        </div>
        <div className="stage-front">
          <HeroFront />
        </div>
        <Desktop onJump={jump} onSeekWork={seekWork} />
        <Outro className="suite-outro" onRewind={() => scrollToBeat(0, root.current?.querySelector("a"))} />
      </div>

      <div ref={track} className="track" style={{ height: `${TOTAL_BEATS * SCROLL_PER_BEAT}vh` }} aria-hidden="true" />
      <Overlays />
      <Cursor />
    </div>
  );
}
