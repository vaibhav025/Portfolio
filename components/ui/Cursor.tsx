"use client";

import { useEffect, useRef } from "react";

/* ---------- tweakables ---------- */
const FOLLOW = 0.22; // cursor lerp per frame
const MAGNET_PULL = 0.32; // how far magnetic elements lean toward the pointer
const MAGNET_EASE = 0.16;

/**
 * Playhead cursor: a thin accent line with a crosshair ring. Grows over links,
 * becomes a "PLAY" pill over [data-cursor="play"]. Also drives [data-magnetic]
 * elements via the independent CSS `translate` property, so it never fights a
 * transform set by GSAP or a CSS :active scale.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");

    let x = innerWidth / 2,
      y = innerHeight / 2,
      cx = x,
      cy = y,
      raf = 0,
      shown = false;
    type Mag = { el: HTMLElement; tx: number; ty: number; x: number; y: number };
    const mags = new Map<HTMLElement, Mag>();
    let hot: HTMLElement | null = null;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        cx = x;
        cy = y;
        el.dataset.on = "";
      }
      const t = e.target as Element | null;
      const play = t?.closest?.('[data-cursor="play"]');
      const link = t?.closest?.("a, button, [role='button'], [data-magnetic]");
      el.dataset.mode = play ? "play" : link ? "link" : "";

      const m = t?.closest?.("[data-magnetic]") as HTMLElement | null;
      if (m !== hot) {
        if (hot) {
          const prev = mags.get(hot);
          if (prev) prev.tx = prev.ty = 0;
        }
        hot = m;
      }
      if (m) {
        const r = m.getBoundingClientRect();
        const entry = mags.get(m) ?? { el: m, tx: 0, ty: 0, x: 0, y: 0 };
        // measure from the untranslated centre
        entry.tx = (x - (r.left - entry.x + r.width / 2)) * MAGNET_PULL;
        entry.ty = (y - (r.top - entry.y + r.height / 2)) * MAGNET_PULL;
        mags.set(m, entry);
      }
    };
    const leave = () => {
      shown = false;
      delete el.dataset.on;
    };

    const tick = () => {
      cx += (x - cx) * FOLLOW;
      cy += (y - cy) * FOLLOW;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      mags.forEach((m, key) => {
        m.x += (m.tx - m.x) * MAGNET_EASE;
        m.y += (m.ty - m.y) * MAGNET_EASE;
        if (Math.abs(m.x) < 0.05 && Math.abs(m.y) < 0.05 && m.tx === 0 && m.ty === 0) {
          key.style.translate = "";
          mags.delete(key);
        } else key.style.translate = `${m.x.toFixed(2)}px ${m.y.toFixed(2)}px`;
      });
      raf = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
      mags.forEach((_, key) => (key.style.translate = ""));
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <span className="cursor-line" />
      <span className="cursor-ring" />
      <span className="cursor-play">Play</span>
    </div>
  );
}
