"use client";

import { useEffect, useRef, useState } from "react";
import { edits, work } from "@/lib/content";
import { store, useStore } from "@/lib/store";
import { toTimecode } from "@/lib/timeline";
import { IconArrowUpRight, IconPause, IconPlay, IconStepBack, IconStepFwd } from "@/components/ui/icons";
import { EditMedia } from "./EditMedia";
import { WindowFrame } from "./WindowFrame";

/** number of items in the strip: every edit + the "View all" card */
export const WORK_ITEMS = edits.length + 1;

type Props = {
  className?: string;
  /** "suite": strip positions are driven by the scroll timeline. "linear": native swipe strip. */
  mode: "suite" | "linear";
  /** suite only: ask the timeline to move the playhead to another item */
  onSeek?: (index: number) => void;
};

export function WorkWindow({ className = "", mode, onSeek }: Props) {
  const index = useStore((s) => s.workIndex);
  const [hover, setHover] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const stripRef = useRef<HTMLOListElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const active = Math.min(index, edits.length - 1);
  const edit = edits[active];
  const onViewAll = index >= edits.length;

  const go = (i: number) => {
    const n = Math.max(0, Math.min(WORK_ITEMS - 1, i));
    if (mode === "suite" && onSeek) onSeek(n);
    else {
      store.set({ workIndex: n });
      stripRef.current?.children[n]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  // Program-monitor timecode runs while "playing"; written straight to the DOM.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (tcRef.current) tcRef.current.textContent = toTimecode((now - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, active]);

  // Linear mode: the card nearest the strip centre becomes active
  useEffect(() => {
    if (mode !== "linear" || !stripRef.current) return;
    const strip = stripRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) store.set({ workIndex: Number((e.target as HTMLElement).dataset.card) });
        }
      },
      { root: strip, threshold: 0.6 },
    );
    Array.from(strip.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [mode]);

  return (
    <WindowFrame
      id="work"
      title="Media Browser — Edits"
      meta={`${edits.length} clips`}
      className={`win-work is-${mode} ${className}`}
    >
      <div className="work-layout">
        <div className="work-head">
          <p className="work-k">Portfolio / Edits</p>
          <h2 id="work-heading" className="work-h">
            Some of my <em>edits</em>
          </h2>
          <p className="work-tag">{work.tagline}</p>
        </div>

        {/* ---------- Program monitor ---------- */}
        <div className="monitor" data-monitor>
          <div className="monitor-screen" data-cursor="play">
            {edits.map((e, i) => (
              <div key={e.slug} className="monitor-layer" data-on={i === active ? "" : undefined} aria-hidden={i !== active}>
                <EditMedia edit={e} playing={playing && i === active} large />
              </div>
            ))}
            <div className="monitor-hud" aria-hidden="true">
              <span className="monitor-rec">
                <i /> PGM
              </span>
              <span ref={tcRef} className="monitor-tc">
                00:00:00:00
              </span>
            </div>
            <div className="monitor-guides" aria-hidden="true" />
          </div>

          <div className="monitor-info">
            <div className="monitor-title-row">
              <p className="monitor-num">
                C{edit.num}
                {edit.featured ? <span className="monitor-badge">Featured edit</span> : null}
              </p>
              <h3 className="monitor-title" key={edit.slug}>
                {edit.title}
              </h3>
            </div>
            <p className="monitor-desc">{edit.description}</p>
            {edit.meta ? <p className="monitor-meta">{edit.meta}</p> : null}
            <ul className="monitor-tools" aria-label="Tools">
              {edit.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="transport">
              <button type="button" className="t-btn" onClick={() => go(index - 1)} aria-label="Previous edit" data-magnetic>
                <IconStepBack />
              </button>
              <button
                type="button"
                className="t-btn is-main"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause preview" : "Play preview"}
                data-magnetic
              >
                {playing ? <IconPause /> : <IconPlay />}
              </button>
              <button type="button" className="t-btn" onClick={() => go(index + 1)} aria-label="Next edit" data-magnetic>
                <IconStepFwd />
              </button>
              <a
                className="watch-btn"
                href={edit.link}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                data-cursor="play"
              >
                <IconPlay className="watch-ico" /> Watch Edit
                <span className="sr-only">: {edit.title} (opens Instagram)</span>
              </a>
            </div>
          </div>
        </div>

        {/* ---------- Filmstrip / cover-flow ---------- */}
        <div className="flow" data-flow>
          <ol className="flow-strip" ref={stripRef} aria-label="All edits">
            {edits.map((e, i) => (
              <li
                key={e.slug}
                className="flow-card"
                data-card={i}
                data-active={i === index ? "" : undefined}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <button type="button" className="flow-hit" onClick={() => go(i)} aria-label={`Preview ${e.title}`} data-cursor="play">
                  <EditMedia edit={e} playing={hover === i && i !== active} />
                </button>
                <div className="flow-meta">
                  <span className="flow-num">C{e.num}</span>
                  <h3 className="flow-title">{e.title}</h3>
                  <a className="flow-link" href={e.link} target="_blank" rel="noopener noreferrer">
                    Watch <IconArrowUpRight />
                    <span className="sr-only">{e.title} on Instagram</span>
                  </a>
                </div>
              </li>
            ))}
            <li className="flow-card is-all" data-card={edits.length} data-active={onViewAll ? "" : undefined}>
              <a className="flow-all" href={work.viewAll} target="_blank" rel="noopener noreferrer" data-magnetic>
                <span className="flow-all-plus" aria-hidden="true">
                  +
                </span>
                <span className="flow-all-h">View all</span>
                <span className="flow-all-p">The full collection of edits on Google Drive</span>
                <span className="flow-all-cta">
                  Open Drive <IconArrowUpRight />
                </span>
              </a>
            </li>
          </ol>
          <div className="flow-scrub" aria-hidden="true">
            {Array.from({ length: WORK_ITEMS }, (_, i) => (
              <i key={i} data-on={i === index ? "" : undefined} />
            ))}
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
