import { renderLog } from "@/lib/content";
import { WindowFrame } from "./WindowFrame";

/** "Technologist" easter egg: the toolkit printed as a render log. Lines are typed by scroll. */
export function TerminalWindow({ className = "" }: { className?: string }) {
  return (
    <WindowFrame id="terminal" title="render — vaibhav@suite" meta="zsh" className={`win-term ${className}`}>
      <h2 id="terminal-heading" className="sr-only">
        Technologist: tools and techniques
      </h2>
      <div className="term">
        <p className="term-line is-cmd" data-line>
          <span className="term-prompt">~/suite</span> $ render --sequence portfolio --verbose
        </p>
        <p className="term-line is-dim" data-line>
          [init] loading toolkit…
        </p>
        <ul className="term-list">
          {renderLog.map((r, i) => (
            <li key={r.tag} className="term-line" data-line>
              <span className="term-idx">{String(i + 1).padStart(2, "0")}</span>
              <span className="term-tag">[{r.tag}]</span>
              <span className="term-text">{r.text}</span>
              <span className="term-ok">OK</span>
            </li>
          ))}
        </ul>
        <p className="term-line is-ok" data-line>
          ✓ Render complete. Every frame tells a story.
        </p>
        <p className="term-line is-cmd" data-line>
          <span className="term-prompt">~/suite</span> $ <span className="term-caret" aria-hidden="true" />
        </p>
      </div>
    </WindowFrame>
  );
}
