import Image from "next/image";
import { origin, profile } from "@/lib/content";
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
            <div className="origin-photo">
              <Image src={profile.portrait} alt="Vaibhav Singla" width={480} height={480} sizes="(min-width: 900px) 220px, 45vw" />
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
