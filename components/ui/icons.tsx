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
