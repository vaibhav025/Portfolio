"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { nav } from "@/lib/content";
import { SCENES, SCENE_START, TOTAL_BEATS, type SceneId } from "@/lib/timeline";
import { useStore } from "@/lib/store";
import { toggleSound } from "@/lib/sfx";
import { IconSound } from "./icons";

export type HudHandle = {
  /** 0..1 scroll progress; written every scroll frame, straight to the DOM */
  setProgress: (p: number, timecode: string) => void;
};

type Props = {
  /** suite: jump the scroll timeline. Omitted in linear mode: plain anchor links. */
  onJump?: (scene: SceneId) => void;
  /** show the bottom master-timeline scrubber (suite only) */
  scrubber?: boolean;
};

/** Persistent chrome: brand, nav, timecode, sound toggle, master timeline. */
export const Hud = forwardRef<HudHandle, Props>(function Hud({ onJump, scrubber = false }, ref) {
  const scene = useStore((s) => s.scene);
  const sound = useStore((s) => s.sound);
  const tc = useRef<HTMLSpanElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    setProgress(p, timecode) {
      if (tc.current) tc.current.textContent = timecode;
      if (head.current) head.current.style.transform = `translateX(${(p * 100).toFixed(3)}cqw)`;
      if (fill.current) fill.current.style.transform = `scaleX(${p.toFixed(4)})`;
    },
  }));

  const navScene = (id: string) => {
    // map inner scenes to the nav item they belong to
    if (id === "lid" || id === "dive" || id === "boot" || id === "intro") return "intro";
    if (id === "origin") return "about";
    if (id === "terminal") return "work";
    if (id === "outro") return "contact";
    return id;
  };
  const current = navScene(scene);

  return (
    <>
      <header className="hud">
        <span className="hud-bg" data-hud-bg aria-hidden="true" />
        <a
          className="hud-brand"
          href="#top"
          onClick={(e) => {
            if (!onJump) return;
            e.preventDefault();
            onJump("intro");
          }}
        >
          <span className="hud-rec" aria-hidden="true" />
          <span>Vaibhav Singla</span>
        </a>
        <nav aria-label="Main" className="hud-nav">
          <ul>
            {nav.map((n) => (
              <li key={n.scene}>
                <a
                  href={n.scene === "intro" ? "#top" : `#${n.scene}`}
                  aria-current={current === n.scene ? "true" : undefined}
                  onClick={(e) => {
                    if (!onJump) return;
                    e.preventDefault();
                    onJump(n.scene);
                  }}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hud-right">
          <span ref={tc} className="hud-tc" aria-hidden="true">
            00:00:00:00
          </span>
          <button
            type="button"
            className="hud-sound"
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? "Turn interface sound off" : "Turn interface sound on"}
          >
            <IconSound on={sound} />
          </button>
        </div>
      </header>

      {scrubber ? (
        <div className="scrub" aria-hidden="true">
          <div className="scrub-track">
            <span ref={fill} className="scrub-fill" />
            {SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                tabIndex={-1}
                className="scrub-mark"
                data-on={s.id === scene ? "" : undefined}
                style={{ left: `${(SCENE_START[s.id] / TOTAL_BEATS) * 100}%` }}
                onClick={() => onJump?.(s.id)}
              >
                <span>{s.label}</span>
              </button>
            ))}
            <span ref={head} className="scrub-head" />
          </div>
        </div>
      ) : null}
    </>
  );
});
