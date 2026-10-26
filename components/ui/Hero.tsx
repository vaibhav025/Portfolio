"use client";

import { profile } from "@/lib/content";
import { IconArrowUpRight, IconPlay } from "./icons";

type Props = {
  opened: boolean;
  onPlay: () => void;
  /** no WebGL laptop: show the lightweight CSS one instead */
  cssLaptop: boolean;
};

/** First screen: name, role, and a Play button that opens the laptop (scrolling opens it too). */
export function Hero({ opened, onPlay, cssLaptop }: Props) {
  return (
    <section className="hero" data-pose="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="rec-dot" aria-hidden="true" /> Portfolio · {profile.location}, IN
        </p>
        <h1 id="hero-heading" className="hero-name">
          {profile.first.charAt(0) + profile.first.slice(1).toLowerCase()}
          <br />
          {profile.last.charAt(0) + profile.last.slice(1).toLowerCase()}
        </h1>
        <p className="hero-role">{profile.role}</p>
        <div className="hero-actions">
          {opened ? (
            <a className="btn btn-primary" href="#work">
              Watch my edits <IconArrowUpRight className="btn-ico" />
            </a>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onPlay}>
              <IconPlay className="btn-ico" /> Play
            </button>
          )}
          <a className="btn btn-ghost" href="#contact">
            Get in touch
          </a>
        </div>
      </div>

      {cssLaptop ? (
        <div className={`css-laptop ${opened ? "is-open" : ""}`} aria-hidden="true">
          <div className="css-lid">
            <div className="css-screen">
              <span className="css-screen-rec">
                <i /> REC
              </span>
            </div>
          </div>
          <div className="css-base" />
        </div>
      ) : null}

      <p className="hero-hint" aria-hidden="true" data-hidden={opened ? "" : undefined}>
        Press play or scroll
      </p>
    </section>
  );
}
