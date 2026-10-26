"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { profile } from "@/lib/content";
import { useStore } from "@/lib/store";
import type { SceneId } from "@/lib/timeline";
import { AppMail, AppMedia, AppMemories, AppNotes, AppTerminal, AppTimeline } from "@/components/ui/icons";
import { AboutWindow } from "./AboutWindow";
import { ContactWindow } from "./ContactWindow";
import { ExperienceWindow } from "./ExperienceWindow";
import { OriginWindow } from "./OriginWindow";
import { TerminalWindow } from "./TerminalWindow";
import { WorkWindow } from "./WorkWindow";

export const DOCK: { scene: SceneId; label: string; Icon: () => React.ReactElement }[] = [
  { scene: "about", label: "Notes: About", Icon: AppNotes },
  { scene: "experience", label: "Timeline: Experience", Icon: AppTimeline },
  { scene: "origin", label: "Memories: The Origin", Icon: AppMemories },
  { scene: "work", label: "Media Browser: Edits", Icon: AppMedia },
  { scene: "terminal", label: "Terminal: Render log", Icon: AppTerminal },
  { scene: "contact", label: "Mail: Contact", Icon: AppMail },
];

/* Live clock for the menubar / lock screen, re-rendered once a minute */
function subscribeClock(cb: () => void) {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
}
const clockSnapshot = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}|${d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`;
};
function useClock() {
  const v = useSyncExternalStore(subscribeClock, clockSnapshot, () => "00:00|");
  const [time, date] = v.split("|");
  return { time, date };
}

export function Desktop({ onJump, onSeekWork }: { onJump: (s: SceneId) => void; onSeekWork: (i: number) => void }) {
  const { time, date } = useClock();
  const scene = useStore((s) => s.scene);

  return (
    <div className="desk" data-desk>
      <div className="desk-wall" aria-hidden="true" />


      {/* lock screen */}
      <div className="lock" data-lock aria-hidden="true">
        <p className="lock-date">{date}</p>
        <p className="lock-time">{time}</p>
        <div className="lock-user">
          <span className="lock-avatar">
            <Image src={profile.portrait} alt="" width={160} height={160} sizes="88px" />
          </span>
          <span className="lock-name">{profile.name}</span>
          <span className="lock-hint">Scroll to unlock</span>
        </div>
      </div>

      {/* design-size stage, uniformly scaled to fit the viewport (see Suite: --fit) */}
      <div className="desk-stage" data-stage>
        <AboutWindow className="suite-win" />
        <ExperienceWindow className="suite-win" />
        <OriginWindow className="suite-win" />
        <WorkWindow className="suite-win" mode="suite" onSeek={onSeekWork} />
        <TerminalWindow className="suite-win" />
        <ContactWindow className="suite-win" />

        <nav className="dock" data-dock aria-label="Apps">
          {DOCK.map(({ scene: id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className="dock-app"
              data-dock-app={id}
              data-open={scene === id ? "" : undefined}
              onClick={() => onJump(id)}
              aria-label={label}
            >
              <span className="dock-icon">
                <Icon />
              </span>
              <span className="dock-tip" aria-hidden="true">
                {label.split(":")[0]}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
