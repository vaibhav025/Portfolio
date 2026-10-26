"use client";

import { useEffect, useRef } from "react";
import { AboutWindow } from "@/components/windows/AboutWindow";
import { ContactWindow } from "@/components/windows/ContactWindow";
import { ExperienceWindow } from "@/components/windows/ExperienceWindow";
import { OriginWindow } from "@/components/windows/OriginWindow";
import { TerminalWindow } from "@/components/windows/TerminalWindow";
import { WorkWindow } from "@/components/windows/WorkWindow";
import { HeroFront, HeroName } from "@/components/ui/HeroTitle";
import { Hud } from "@/components/ui/Hud";
import { Outro } from "@/components/ui/Outro";
import { Overlays } from "@/components/ui/Overlays";
import { store } from "@/lib/store";

/**
 * Lighter path for touch devices, small screens and prefers-reduced-motion:
 * a 2.5D CSS laptop, vertical sections and native scrolling. The same window
 * components as the desktop suite, stacked as touch-friendly cards.
 */
export default function Linear() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.dataset.motion = reduce ? "reduce" : "full";

    // reveal-on-enter (CSS does the motion: fade only when reduced)
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    el.querySelectorAll(".lin-reveal").forEach((n) => io.observe(n));

    // keep the nav highlight in sync with the section on screen
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) store.set({ scene: (e.target as HTMLElement).dataset.scene ?? "intro" });
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    el.querySelectorAll("[data-scene]").forEach((n) => spy.observe(n));

    // scroll-linked bits: CSS laptop lid + experience rail. rAF-throttled, transform only.
    const lid = el.querySelector<HTMLElement>("[data-css-lid]");
    const hero = el.querySelector<HTMLElement>(".lin-hero");
    const exp = el.querySelector<HTMLElement>("#experience");
    const rail = el.querySelector<HTMLElement>("[data-vrail]");
    let raf = 0;
    const update = () => {
      raf = 0;
      if (reduce) return;
      const vh = innerHeight;
      if (lid && hero) {
        const p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / (vh * 0.6)));
        lid.style.transform = `rotateX(${(-64 + p * 58).toFixed(2)}deg)`;
      }
      if (exp && rail) {
        const r = exp.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
        rail.style.transform = `scaleY(${p.toFixed(3)})`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      spy.disconnect();
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="linear" ref={root} id="top">
      <Hud />
      <main>
        <section className="lin-hero" data-scene="intro" aria-label="Intro">
          <HeroName className="is-linear" />
          <div className="css-laptop" aria-hidden="true">
            <div className="css-lid" data-css-lid>
              <div className="css-screen">
                <span className="css-screen-rec">
                  <i /> REC
                </span>
                <span className="css-screen-tc">00:00:00:00</span>
              </div>
            </div>
            <div className="css-base" />
          </div>
          <HeroFront cue="Scroll" />
        </section>

        <div className="lin-stack">
          <div className="lin-reveal" data-scene="about">
            <AboutWindow />
          </div>
          <div className="lin-reveal" data-scene="experience">
            <ExperienceWindow vertical />
          </div>
          <div className="lin-reveal" data-scene="about">
            <OriginWindow />
          </div>
          <div className="lin-reveal" data-scene="work">
            <WorkWindow mode="linear" />
          </div>
          <div className="lin-reveal" data-scene="work">
            <TerminalWindow />
          </div>
          <div className="lin-reveal" data-scene="contact">
            <ContactWindow />
          </div>
        </div>
        <div className="lin-reveal" data-scene="contact">
          <Outro className="lin-outro" />
        </div>
      </main>
      <Overlays guides={false} />
    </div>
  );
}
