"use client";

import { useEffect, useRef } from "react";
import { nowRoles } from "@/lib/content";
import { toTimecode } from "@/lib/timeline";

/* ---------- tweakables ---------- */
const RADIUS = 520; // px, radius of the 3D card cylinder
const STEP = 360 / nowRoles.length; // degrees between cards

/**
 * "Now Playing": the current positions as cinematic 3D title cards on a
 * rotating cylinder. Pinned while you scroll; each role takes the front in turn.
 */
export function NowPlaying() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ring = el.querySelector<HTMLElement>("[data-ring]")!;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-role]"));
    const bar = el.querySelector<HTMLElement>("[data-bar]")!;
    const count = el.querySelector<HTMLElement>("[data-count]")!;
    const tc = el.querySelector<HTMLElement>("[data-tc]")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      // hold each card for a beat, then rotate to the next
      const n = nowRoles.length;
      const x = p * (n - 1);
      const i = Math.floor(x);
      const f = Math.min(1, Math.max(0, (x - i - 0.3) / 0.4));
      const v = i + f * f * (3 - 2 * f);
      const active = Math.round(v);
      ring.style.transform = `translateZ(${-RADIUS}px) rotateY(${(-v * STEP).toFixed(2)}deg)`;
      cards.forEach((c, k) => {
        const d = Math.abs(k - v);
        c.style.opacity = String(Math.max(0.12, 1 - d * 0.85));
        c.toggleAttribute("data-on", k === active);
      });
      bar.style.transform = `scaleX(${p.toFixed(3)})`;
      count.textContent = String(active + 1).padStart(2, "0");
      tc.textContent = toTimecode(p * 30);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    if (reduce) return;
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={root} id="now" className="now" data-pose="now" data-scene="experience" aria-labelledby="now-heading">
      <div className="now-stage">
        <div className="now-letterbox is-top" aria-hidden="true" />
        <div className="now-leak" aria-hidden="true" />
        <header className="now-head">
          <p className="eyebrow">
            <span className="rec-dot" aria-hidden="true" /> Now playing
          </p>
          <h2 id="now-heading" className="now-h">
            What I&apos;m doing <span>right now</span>
          </h2>
        </header>

        <div className="now-scene">
          <ol className="now-ring" data-ring>
            {nowRoles.map((r, k) => (
              <li
                key={r.org}
                className="now-card"
                data-role={k}
                style={{
                  transform: `rotateY(${k * STEP}deg) translateZ(${RADIUS}px)`,
                  ["--g1" as string]: r.grade[0],
                  ["--g2" as string]: r.grade[1],
                }}
              >
                <span className="now-card-k">
                  Role {String(k + 1).padStart(2, "0")} / {String(nowRoles.length).padStart(2, "0")}
                </span>
                <span className="now-card-role">{r.role}</span>
                <span className="now-card-org">{r.org}</span>
                <span className="now-card-safe" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>

        <footer className="now-foot" aria-hidden="true">
          <span className="now-count">
            <b data-count>01</b> / {String(nowRoles.length).padStart(2, "0")}
          </span>
          <span className="now-track">
            <i data-bar />
          </span>
          <span className="now-tc" data-tc>
            00:00:00:00
          </span>
        </footer>
        <div className="now-letterbox is-bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
