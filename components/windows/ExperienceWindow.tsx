import { experience } from "@/lib/content";
import { WindowFrame } from "./WindowFrame";

/**
 * Timeline editor. In the suite the playhead is scrubbed by scroll (Suite.tsx);
 * clips occupy fixed spans of the sequence defined by CLIP_SPANS (0..1).
 */
export const CLIP_SPANS: [number, number][] = [
  [0.0, 0.02],
  [0.02, 0.36],
  [0.34, 0.68],
  [0.66, 0.98],
];

const TRACK_ROWS = ["V2", "V1", "A1"] as const;
const COLORS = ["#ff4d1f", "#3fb6c9", "#7a6cff", "#4dffb0"];

export function ExperienceWindow({ className = "", vertical = false }: { className?: string; vertical?: boolean }) {
  return (
    <WindowFrame
      id="experience"
      title="Sequence 01 — Experience"
      meta="25 fps"
      className={`win-exp ${vertical ? "is-vertical" : ""} ${className}`}
    >
      <h2 id="experience-heading" className="sr-only">
        Experience
      </h2>
      <div className="exp-layout">
        {/* Inspector / preview: shows the clip under the playhead */}
        <div className="exp-inspector" aria-live="polite">
          {experience.map((c, i) => (
            <article
              key={c.id}
              className="exp-card"
              data-inspector={i}
              data-active={i === 0 || vertical ? "" : undefined}
              style={{ ["--clip" as string]: COLORS[i] }}
            >
              {/* preview monitor for the clip under the playhead (suite only) */}
              <div className="exp-preview" aria-hidden="true">
                <span className="exp-preview-tc">
                  {c.track} · C{String(i + 1).padStart(2, "0")}
                </span>
                <span className="exp-preview-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="exp-preview-t">{c.title}</span>
              </div>
              <p className="exp-card-k">
                <span style={{ background: COLORS[i] }} aria-hidden="true" />
                Clip {String(i + 1).padStart(2, "0")} · {c.track}
              </p>
              <h3 className="exp-card-h">{c.title}</h3>
              <p className="exp-card-p">{c.body}</p>
              {c.tags ? (
                <ul className="exp-tags">
                  {c.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        {/* Timeline: tracks + clips + playhead (desktop only) */}
        {!vertical ? (
          <div className="exp-timeline" aria-hidden="true">
            <div className="exp-ruler">
              {Array.from({ length: 13 }, (_, i) => (
                <span key={i}>{`00:00:${String(i * 5).padStart(2, "0")}:00`}</span>
              ))}
            </div>
            <div className="exp-tracks">
              {TRACK_ROWS.map((row) => (
                <div key={row} className="exp-track">
                  <span className="exp-track-k">{row}</span>
                  <div className="exp-lane">
                    {experience.map((c, i) =>
                      c.track === row ? (
                        <div
                          key={c.id}
                          className="exp-clip"
                          data-clip={i}
                          style={{
                            left: `${CLIP_SPANS[i][0] * 100}%`,
                            width: `${(CLIP_SPANS[i][1] - CLIP_SPANS[i][0]) * 100}%`,
                            ["--clip" as string]: COLORS[i],
                          }}
                        >
                          <b>{c.title}</b>
                          <i className="exp-wave" />
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
              ))}
              <div className="exp-playhead" data-playhead>
                <span className="exp-playhead-tc" data-playhead-tc>
                  00:00:00:00
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="exp-vrail" aria-hidden="true">
            <div className="exp-vrail-fill" data-vrail />
          </div>
        )}
      </div>
    </WindowFrame>
  );
}
