import type { ReactNode } from "react";

type Props = {
  /** scene id, also used as DOM anchor and timeline hook (data-window) */
  id: string;
  title: string;
  /** small monospace label on the right side of the title bar */
  meta?: string;
  toolbar?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

/** Window chrome shared by the desktop suite and the linear (mobile) layout. */
export function WindowFrame({ id, title, meta, toolbar, className = "", bodyClassName = "", children }: Props) {
  return (
    <section id={id} data-window={id} aria-labelledby={`${id}-heading`} tabIndex={-1} className={`win ${className}`}>
      <header className="win-bar">
        <span className="win-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="win-title">{title}</span>
        <span className="win-meta">{meta}</span>
      </header>
      {toolbar ? <div className="win-toolbar">{toolbar}</div> : null}
      <div className={`win-body ${bodyClassName}`}>{children}</div>
    </section>
  );
}
