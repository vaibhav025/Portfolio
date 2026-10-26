/** Original app + UI glyphs. Stroke icons inherit currentColor. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconPlay = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
  </svg>
);
export const IconPause = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" />
  </svg>
);
export const IconStepBack = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M18 5v14L8 12z" fill="currentColor" />
    <rect x="5" y="5" width="2.4" height="14" rx="1" fill="currentColor" />
  </svg>
);
export const IconStepFwd = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M6 5v14l10-7z" fill="currentColor" />
    <rect x="16.6" y="5" width="2.4" height="14" rx="1" fill="currentColor" />
  </svg>
);
export const IconArrowUpRight = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const IconRewind = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M11.5 6v12L3 12zM21 6v12l-8.5-6z" fill="currentColor" />
  </svg>
);
export const IconSound = ({ on, ...p }: P & { on?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
    <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
    {on ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
  </svg>
);

/* ---------- dock apps (filled tiles, original designs) ---------- */
function Tile({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-full w-full">
      <defs>
        <linearGradient id={`g-${bg.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".16" />
          <stop offset="1" stopColor="#000000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={bg} />
      <rect width="48" height="48" rx="11" fill={`url(#g-${bg.replace(/[^a-z0-9]/gi, "")})`} />
      <rect x=".5" y=".5" width="47" height="47" rx="10.5" fill="none" stroke="#fff" strokeOpacity=".14" />
      {children}
    </svg>
  );
}

export const AppNotes = () => (
  <Tile bg="#e9e2d2">
    <rect x="11" y="10" width="26" height="28" rx="3" fill="#fbf7ee" stroke="#c9bfa8" />
    <rect x="11" y="10" width="26" height="6" rx="3" fill="#ff4d1f" />
    <path d="M15 22h18M15 27h18M15 32h11" stroke="#8a8170" strokeWidth="1.6" strokeLinecap="round" />
  </Tile>
);
export const AppTimeline = () => (
  <Tile bg="#1d1d22">
    <rect x="8" y="14" width="18" height="6" rx="1.5" fill="#3fb6c9" />
    <rect x="22" y="22" width="18" height="6" rx="1.5" fill="#7a6cff" />
    <rect x="10" y="30" width="24" height="6" rx="1.5" fill="#4dffb0" fillOpacity=".7" />
    <rect x="28.5" y="9" width="2" height="31" rx="1" fill="#ff4d1f" />
    <path d="M26.5 8h6l-3 3.5z" fill="#ff4d1f" />
  </Tile>
);
export const AppMemories = () => (
  <Tile bg="#26211c">
    <rect x="9" y="12" width="20" height="16" rx="2" fill="#ffb020" transform="rotate(-8 19 20)" />
    <rect x="19" y="18" width="20" height="16" rx="2" fill="#ece6da" transform="rotate(6 29 26)" />
    <circle cx="25" cy="24" r="2.4" fill="#ff4d1f" transform="rotate(6 29 26)" />
    <path d="m21 32 5-5 4 3 3-2 5 4" stroke="#26211c" strokeWidth="1.5" fill="none" transform="rotate(6 29 26)" />
  </Tile>
);
export const AppMedia = () => (
  <Tile bg="#ff4d1f">
    <rect x="9" y="13" width="30" height="22" rx="3" fill="#160a06" />
    <path d="M9 17h30M9 31h30" stroke="#ff4d1f" strokeWidth="1" strokeDasharray="2 2" />
    <path d="M21 19.5v9l7.5-4.5z" fill="#ece6da" />
  </Tile>
);
export const AppTerminal = () => (
  <Tile bg="#101012">
    <path d="m13 18 6 5-6 5" stroke="#4dffb0" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 30h12" stroke="#ece6da" strokeWidth="2.2" strokeLinecap="round" />
  </Tile>
);
export const AppMail = () => (
  <Tile bg="#2b5c66">
    <rect x="9" y="14" width="30" height="21" rx="3" fill="#ece6da" />
    <path d="m10 16 14 10 14-10" stroke="#2b5c66" strokeWidth="1.8" fill="none" />
    <circle cx="36" cy="14" r="4" fill="#ff4d1f" />
  </Tile>
);
