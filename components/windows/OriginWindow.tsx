import { origin } from "@/lib/content";
import { WindowFrame } from "./WindowFrame";

/** Memories: a contact sheet. One real photo, the rest are typographic frames. */
export function OriginWindow({ className = "" }: { className?: string }) {
  return (
    <WindowFrame id="origin" title="Memories — The Origin" meta={origin.years} className={`win-origin ${className}`}>
      <div className="origin-grid">
        <div className="origin-lead">
          <p className="origin-k" data-reveal>
            Roll 01 · {origin.school}
          </p>
          <h2 id="origin-heading" className="origin-h" data-reveal>
            {origin.title}
          </h2>
          <p className="origin-sub" data-reveal>
            {origin.school} <span>({origin.years})</span>
          </p>
          <p className="origin-p" data-reveal>
            {origin.intro}
          </p>
        </div>

        <ol className="origin-sheet">
          <li className="origin-frame is-photo" data-frame>
            {/* spinning film reel stands in until real photos are added */}
            <div className="origin-reel" aria-hidden="true">
              <svg viewBox="0 0 100 100" className="reel-spin">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" />
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <circle key={a} cx={50 + 26 * Math.cos((a * Math.PI) / 180)} cy={50 + 26 * Math.sin((a * Math.PI) / 180)} r="9" fill="currentColor" />
                ))}
                <circle cx="50" cy="50" r="6" fill="currentColor" />
              </svg>
              <span className="origin-reel-k">Roll 01</span>
              <span className="origin-reel-y">{origin.years}</span>
            </div>
            <span className="origin-fnum">01A</span>
          </li>
          {origin.frames.map((f, i) => (
            <li key={f.label} className="origin-frame" data-frame>
              <div className="origin-card">
                <span className="origin-card-k">{f.label}</span>
                <p>{f.text}</p>
              </div>
              <span className="origin-fnum">{String(i + 2).padStart(2, "0")}A</span>
            </li>
          ))}
        </ol>

        <div className="origin-foot">
          <p className="origin-p" data-reveal>
            {origin.mentor}
          </p>
          <p className="origin-closing" data-reveal>
            {origin.closing}
          </p>
        </div>
      </div>
    </WindowFrame>
  );
}
