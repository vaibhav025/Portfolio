"use client";

import { toTimecode } from "@/lib/timeline";

const TOTAL_FRAMES = 3750; // what the export dialog pretends to render

/** Loader styled as an NLE "Export" dialog. `progress` is real (fonts, 3D chunk, first frame). */
export function Loader({ progress, done, pending = false }: { progress: number; done: boolean; pending?: boolean }) {
  const p = Math.max(0, Math.min(1, progress));
  const frame = Math.round(p * TOTAL_FRAMES);
  return (
    <div
      className="loader"
      data-done={done ? "" : undefined}
      data-pending={pending ? "" : undefined} role="status" aria-live="polite" aria-label="Loading">
      <div className="loader-box">
        <div className="loader-bar">
          <span className="loader-lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Export</span>
        </div>
        <div className="loader-body">
          <p className="loader-k">Rendering sequence</p>
          <p className="loader-file">Vaibhav_Singla_Suite_v2.mov</p>
          <div className="loader-track" aria-hidden="true">
            <span style={{ transform: `scaleX(${p})` }} />
          </div>
          <dl className="loader-stats">
            <div>
              <dt>Frame</dt>
              <dd>
                {String(frame).padStart(4, "0")} / {TOTAL_FRAMES}
              </dd>
            </div>
            <div>
              <dt>Timecode</dt>
              <dd>{toTimecode((frame / TOTAL_FRAMES) * 150)}</dd>
            </div>
            <div>
              <dt>Progress</dt>
              <dd>{Math.round(p * 100)}%</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
