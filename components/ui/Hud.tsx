"use client";

import { nav } from "@/lib/content";
import { useStore } from "@/lib/store";

/** Persistent top bar: brand + section nav (plain anchor links, native cursor). */
export function Hud() {
  const scene = useStore((s) => s.scene);
  return (
    <header className="hud">
      <a className="hud-brand" href="#top">
        <span className="rec-dot" aria-hidden="true" />
        Vaibhav Singla
      </a>
      <nav aria-label="Main" className="hud-nav">
        <ul>
          {nav.map((n) => (
            <li key={n.scene}>
              <a href={n.scene === "intro" ? "#top" : `#${n.scene}`} aria-current={scene === n.scene ? "true" : undefined}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
