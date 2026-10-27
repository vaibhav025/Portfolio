"use client";

import { useEffect, useRef } from "react";
import { Buddy } from "@/components/scene/buddy";

/** The screen buddy on a plain <canvas>, for the phone / no-WebGL laptop. Runs only while visible. */
export function BuddyScreen({ on }: { on: boolean }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const buddy = new Buddy();
    buddy.canvas.className = "css-screen-canvas";
    el.appendChild(buddy.canvas);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let mx = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      buddy.draw((now - t0) / 1000, 1, mx, 0);
      raf = visible && !reduce ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    // phones: let the eyes follow a finger
    const onTouch = (e: TouchEvent) => {
      mx = (e.touches[0].clientX / innerWidth) * 2 - 1;
    };
    addEventListener("touchmove", onTouch, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("touchmove", onTouch);
      buddy.canvas.remove();
    };
  }, []);

  return <div ref={host} className="css-screen-buddy" data-on={on ? "" : undefined} aria-hidden="true" />;
}
