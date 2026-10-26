import * as THREE from "three";
import { edits } from "@/lib/content";
import { toTimecode } from "@/lib/timeline";

/* ---------- tweakables ---------- */
const W = 1280;
const H = 800;
const FPS = 30; // redraw rate of the screen canvas
const LOOP = 14; // seconds for the playhead to cross the whole sequence
const MONITOR = { x: 250, y: 56, w: 780, h: 439 }; // program monitor rect (16:9)
const TL_Y = 556; // timeline top

/**
 * The laptop's screen: a little editing UI painted to a 2D canvas.
 * A playhead sweeps a three-track timeline; the clip under it plays on the
 * program monitor (a graded placeholder, or a real <video> when provided).
 */
export class ScreenFeed {
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private wall: HTMLCanvasElement;
  private font: string;
  private last = -1;
  private video: HTMLVideoElement | null = null;
  private blank = false;

  constructor(videoSrc?: string) {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    this.ctx = c.getContext("2d")!;
    this.wall = paintWallpaper();
    // use the page's own font (next/font gives it a hashed family name)
    this.font = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    this.texture = new THREE.CanvasTexture(c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    if (videoSrc) {
      const v = document.createElement("video");
      v.src = videoSrc;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "auto";
      v.crossOrigin = "anonymous";
      this.video = v;
    }
    this.draw(0, 0);
  }

  play(on: boolean) {
    if (!this.video) return;
    if (on && this.video.paused) this.video.play().catch(() => {});
    else if (!on && !this.video.paused) this.video.pause();
  }

  /**
   * @param t    seconds since start
   * @param ui   0..1 how visible the editing UI is (fades out inside the Work section)
   */
  draw(t: number, ui: number) {
    if (ui <= 0.01) {
      // UI fully hidden: paint the plain wallpaper once, then stop redrawing
      if (this.blank) return;
      this.blank = true;
      this.ctx.drawImage(this.wall, 0, 0);
      this.texture.needsUpdate = true;
      return;
    }
    this.blank = false;
    const frame = Math.floor(t * FPS);
    if (frame === this.last) return;
    this.last = frame;
    const g = this.ctx;
    g.drawImage(this.wall, 0, 0);
    g.save();
    g.globalAlpha = ui;

    const p = (t % LOOP) / LOOP; // playhead 0..1
    const n = edits.length;
    const active = Math.min(n - 1, Math.floor(p * n));
    const local = p * n - active; // 0..1 inside the active clip
    const e = edits[active];

    /* ---- program monitor ---- */
    const M = MONITOR;
    g.save();
    roundRect(g, M.x, M.y, M.w, M.h, 10);
    g.clip();
    const v = this.video;
    if (v && v.readyState >= 2) {
      // cover-fit the video into the monitor
      const s = Math.max(M.w / v.videoWidth, M.h / v.videoHeight);
      const vw = v.videoWidth * s;
      const vh = v.videoHeight * s;
      g.drawImage(v, M.x + (M.w - vw) / 2, M.y + (M.h - vh) / 2, vw, vh);
    } else {
      // graded placeholder: the edit's two-tone grade drifting, a light sweep, the title
      const [c1, c2] = e.grade;
      g.fillStyle = c2;
      g.fillRect(M.x, M.y, M.w, M.h);
      const drift = Math.sin(t * 0.7) * 0.5 + 0.5;
      radial(g, M.x + M.w * (0.2 + drift * 0.2), M.y + M.h * 1.05, M.w * 0.75, c1, 0.75);
      radial(g, M.x + M.w * (0.95 - drift * 0.15), M.y, M.w * 0.55, c1, 0.4);
      const sx = M.x - M.w * 0.4 + ((t * 0.45) % 1) * M.w * 1.8;
      const sweep = g.createLinearGradient(sx - 120, 0, sx + 120, 0);
      sweep.addColorStop(0, "rgba(255,255,255,0)");
      sweep.addColorStop(0.5, "rgba(255,255,255,0.10)");
      sweep.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sweep;
      g.fillRect(M.x, M.y, M.w, M.h);
      // big clip number + title, with a small "cut-in" push on each new clip
      const push = Math.min(1, local * 6);
      g.fillStyle = "rgba(255,255,255,0.07)";
      g.font = `600 220px ${this.font}`;
      g.textAlign = "right";
      g.fillText(e.num, M.x + M.w - 30, M.y + M.h - 26);
      g.textAlign = "left";
      g.fillStyle = `rgba(255,255,255,${0.95 * push})`;
      g.font = `600 64px ${this.font}`;
      g.fillText(e.title, M.x + 44, M.y + M.h - 56 + (1 - push) * 18);
    }
    g.restore();
    // monitor chrome: safe-area guide, REC badge, timecode
    g.strokeStyle = "rgba(236,230,218,0.16)";
    g.setLineDash([6, 6]);
    g.strokeRect(M.x + M.w * 0.05, M.y + M.h * 0.05, M.w * 0.9, M.h * 0.9);
    g.setLineDash([]);
    pill(g, M.x + 16, M.y + 16, 96, 34);
    g.fillStyle = "#ff4d1f";
    g.globalAlpha = ui * (0.55 + 0.45 * Math.round((Math.sin(t * 4) + 1) / 2));
    g.beginPath();
    g.arc(M.x + 36, M.y + 33, 7, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = ui;
    g.fillStyle = "#ece6da";
    g.font = `600 20px ui-monospace, monospace`;
    g.fillText("PGM", M.x + 52, M.y + 40);
    pill(g, M.x + M.w - 196, M.y + 16, 180, 34);
    g.fillStyle = "#ece6da";
    g.fillText(toTimecode(t), M.x + M.w - 182, M.y + 40);

    /* ---- timeline ---- */
    const L = 120; // lane start (track labels on the left)
    const R = W - 60;
    g.fillStyle = "rgba(8,8,10,0.72)";
    g.fillRect(40, TL_Y - 34, W - 80, H - TL_Y + 4);
    // ruler
    g.fillStyle = "rgba(236,230,218,0.35)";
    for (let x = L; x <= R; x += 22) g.fillRect(x, TL_Y - 10, 1, (x - L) % 110 === 0 ? 10 : 5);
    const tracks = ["V2", "V1", "A1"];
    tracks.forEach((label, row) => {
      const y = TL_Y + 12 + row * 64;
      g.fillStyle = "rgba(236,230,218,0.45)";
      g.font = `600 18px ui-monospace, monospace`;
      g.fillText(label, 64, y + 32);
      g.fillStyle = "rgba(236,230,218,0.04)";
      g.fillRect(L, y, R - L, 48);
    });
    // clips: one per edit, staggered across the tracks
    const span = (R - L) / n;
    edits.forEach((ed, i) => {
      const row = i % 2 === 0 ? 1 : 0;
      const x = L + i * span + 2;
      const y = TL_Y + 12 + row * 64;
      const on = i === active;
      g.fillStyle = hexA(ed.grade[0], on ? 0.62 : 0.3);
      roundRect(g, x, y, span - 4, 48, 6);
      g.fill();
      if (on) {
        g.strokeStyle = ed.grade[0];
        g.lineWidth = 2;
        g.stroke();
        g.lineWidth = 1;
      }
      g.fillStyle = "rgba(255,255,255,0.92)";
      g.font = `600 17px ${this.font}`;
      g.fillText(ed.title, x + 12, y + 30, span - 24);
      // audio waveform under every clip
      g.fillStyle = hexA(ed.grade[0], 0.5);
      for (let k = 0; k < span - 10; k += 5) {
        const amp = 6 + Math.abs(Math.sin(k * 0.21 + i * 1.7)) * 16;
        g.fillRect(x + 4 + k, TL_Y + 12 + 2 * 64 + 24 - amp / 2, 2, amp);
      }
    });
    // playhead
    const px = L + p * (R - L);
    g.fillStyle = "#ff4d1f";
    g.fillRect(px - 1.5, TL_Y - 24, 3, H - TL_Y + 2);
    g.beginPath();
    g.moveTo(px - 10, TL_Y - 30);
    g.lineTo(px + 10, TL_Y - 30);
    g.lineTo(px, TL_Y - 16);
    g.fill();

    g.restore();
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute("src");
      this.video.load();
    }
  }
}

/* ---------- helpers ---------- */
function paintWallpaper() {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const lin = g.createLinearGradient(0, 0, W * 0.55, H);
  lin.addColorStop(0, "#17161a");
  lin.addColorStop(0.55, "#0c0c0f");
  lin.addColorStop(1, "#09090b");
  g.fillStyle = lin;
  g.fillRect(0, 0, W, H);
  radial(g, W * 0.78, H * 0.08, W * 0.62, "#ff4d1f", 0.3);
  radial(g, W * 0.08, H, W * 0.55, "#285a6e", 0.34);
  return c;
}

function radial(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number) {
  const rg = g.createRadialGradient(x, y, 0, x, y, r);
  rg.addColorStop(0, hexA(color, a));
  rg.addColorStop(1, hexA(color, 0));
  g.fillStyle = rg;
  g.fillRect(0, 0, W, H);
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

function pill(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.fillStyle = "rgba(0,0,0,0.5)";
  roundRect(g, x, y, w, h, 6);
  g.fill();
}
