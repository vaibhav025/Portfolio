import { profile } from "@/lib/content";

/** Split a word into masked letters for kinetic reveals. */
function Letters({ word }: { word: string }) {
  return (
    <span className="kin-word" aria-hidden="true">
      {word.split("").map((ch, i) => (
        <span key={i} className="kin-mask">
          <span className="kin-ch" style={{ ["--i" as string]: i }}>
            {ch}
          </span>
        </span>
      ))}
    </span>
  );
}

/** The giant name. Sits *behind* the 3D canvas in the suite, so the laptop floats in front of it. */
export function HeroName({ className = "" }: { className?: string }) {
  return (
    <h1 className={`hero-name ${className}`} data-hero-name>
      <span className="sr-only">
        {profile.name}, {profile.role}
      </span>
      <span className="hero-row" data-hero-row="0">
        <Letters word={profile.first} />
      </span>
      <span className="hero-row is-right" data-hero-row="1">
        <Letters word={profile.last} />
      </span>
    </h1>
  );
}

/** Foreground hero info: role, location slate, scroll cue. */
export function HeroFront({ cue = "Scroll to open" }: { cue?: string }) {
  return (
    <div className="hero-front" data-hero-front>
      <div className="hero-slate">
        <span className="hero-slate-k">Scene 01 · Take 01</span>
        <p className="hero-role">{profile.role}</p>
        <span className="hero-slate-k">{profile.location}, IN</span>
      </div>
      <div className="hero-cue" data-hero-cue aria-hidden="true">
        <span className="hero-cue-line" />
        <span>{cue}</span>
      </div>
    </div>
  );
}
