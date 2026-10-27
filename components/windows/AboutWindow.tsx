import { about } from "@/lib/content";
import { WindowFrame } from "./WindowFrame";

export function AboutWindow({ className = "" }: { className?: string }) {
  return (
    <WindowFrame id="about" title="Notes — about.txt" meta="REV 02" className={`win-about ${className}`}>
      <div className="about-grid">
        <aside className="about-side" aria-hidden="true">
          <p className="about-side-h">Notes</p>
          <ul>
            <li className="is-active">
              <b>{about.greeting}</b>
              <span>{about.role}</span>
            </li>
            <li>
              <b>The Origin</b>
              <span>BBPS, Pitampura</span>
            </li>
            <li>
              <b>Edits</b>
              <span>Every frame tells a story.</span>
            </li>
          </ul>
        </aside>
        <article className="about-main">
          <div className="about-head">
            <div className="about-avatar">
              <span className="about-mono" aria-hidden="true">VS</span>
              <span className="about-avatar-rec" aria-hidden="true">
                REC
              </span>
            </div>
            <div>
              <h2 id="about-heading" className="about-h" data-reveal>
                {about.greeting}
              </h2>
              <p className="about-role" data-reveal>
                {about.role}
              </p>
            </div>
          </div>
          {about.paragraphs.map((p) => (
            <p key={p.slice(0, 16)} className="about-p" data-reveal>
              {p}
            </p>
          ))}
          <p className="about-callout" data-reveal>
            {about.callout}
          </p>
        </article>
      </div>
    </WindowFrame>
  );
}
