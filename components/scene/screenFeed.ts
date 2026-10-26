import * as THREE from "three";

/* ---------- tweakables ---------- */
const W = 1280;
const H = 800;
const FPS = 30; // redraw rate of the screen canvas
const GROUND = 700; // where the buddy's feet are
const WALK_SPEED = 190; // px per second
const BODY_SHADE = "#cfc6b4";
const INK = "#17161a";
const ACCENT = "#ff4d1f";

type ActionType = "walk" | "wave" | "jump" | "chai" | "sleep" | "dance" | "clap" | "look" | "peekSide" | "peekBottom";
type Action = { type: ActionType; dur: number; to?: number; side?: -1 | 1 };

/** what the next random thing should be (weights) */
const MENU: [ActionType, number][] = [
  ["wave", 3],
  ["jump", 3],
  ["chai", 2],
  ["sleep", 1.5],
  ["dance", 2],
  ["clap", 2],
  ["look", 2],
  ["peekSide", 2.5],
  ["peekBottom", 2],
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * The laptop's screen: a cute little editor (with headphones) who wanders
 * around, peeps from the edges and does random things. Painted to a 2D canvas.
 * Eyes follow the visitor's pointer.
 */
export class ScreenFeed {
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private wall: HTMLCanvasElement;
  private font: string;
  private last = -1;
  private blank = false;
  private prevT = 0;

  // buddy state
  private x = W * 0.5;
  private face: 1 | -1 = 1;
  private queue: Action[] = [];
  private act: Action = { type: "look", dur: 2 };
  private actT = 0;
  private walkPhase = 0;
  private blinkIn = 2;
  private blink = 0;
  private lastType: ActionType = "look";

  constructor() {
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
    this.draw(0, 0, 0, 0);
  }

  /**
   * @param t      seconds since start
   * @param ui     0..1 visibility of the buddy (fades out inside the Work section)
   * @param mx/my  pointer, -1..1, for the eyes
   */
  draw(t: number, ui: number, mx: number, my: number) {
    if (ui <= 0.01) {
      // hidden: paint the plain wallpaper once, then stop redrawing
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
    const dt = clamp(t - this.prevT, 0, 0.1);
    this.prevT = t;
    this.update(dt);

    const g = this.ctx;
    g.drawImage(this.wall, 0, 0);
    g.save();
    g.globalAlpha = ui;
    this.paintBuddy(g, t, mx, my);
    g.restore();
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }

  /* ================= behaviour ================= */

  private next() {
    if (this.queue.length) {
      this.act = this.queue.shift()!;
      this.actT = 0;
      return;
    }
    // weighted random pick, never the same thing twice in a row
    const menu = MENU.filter(([k]) => k !== this.lastType);
    let r = Math.random() * menu.reduce((s, [, w]) => s + w, 0);
    let type: ActionType = menu[0][0];
    for (const [k, w] of menu) {
      if ((r -= w) <= 0) {
        type = k;
        break;
      }
    }
    this.lastType = type;
    const walkTo = (to: number): Action => ({ type: "walk", dur: 99, to });
    const inside = () => rand(260, W - 260);

    switch (type) {
      case "peekSide": {
        const side: -1 | 1 = Math.random() < 0.5 ? -1 : 1;
        // leave the screen, peek back in from that edge, then walk back in
        this.queue.push(walkTo(side < 0 ? -220 : W + 220), { type: "peekSide", dur: 3.2, side }, walkTo(inside()));
        break;
      }
      case "peekBottom": {
        const side: -1 | 1 = this.x < W / 2 ? -1 : 1;
        this.queue.push(walkTo(side < 0 ? -220 : W + 220), { type: "peekBottom", dur: 3.6, to: inside() }, walkTo(inside()));
        break;
      }
      default: {
        // usually stroll somewhere first
        if (Math.random() < 0.7) this.queue.push(walkTo(inside()));
        const DUR: Partial<Record<ActionType, number>> = { wave: 2.4, jump: 1.1, chai: 4, sleep: 5, dance: 3.4, clap: 2.8, look: 2.6 };
        const dur = DUR[type] ?? 2.5;
        this.queue.push({ type, dur });
      }
    }
    this.next();
  }

  private update(dt: number) {
    this.actT += dt;
    // blinking
    this.blinkIn -= dt;
    if (this.blinkIn <= 0) {
      this.blink = 0.16;
      this.blinkIn = rand(2, 5);
    }
    this.blink = Math.max(0, this.blink - dt);

    const a = this.act;
    if (a.type === "walk" && a.to !== undefined) {
      const d = a.to - this.x;
      this.face = d >= 0 ? 1 : -1;
      const step = WALK_SPEED * dt;
      this.walkPhase += dt * 10;
      if (Math.abs(d) <= step) {
        this.x = a.to;
        this.next();
      } else this.x += Math.sign(d) * step;
      return;
    }
    if (a.type === "peekSide" && a.side) {
      this.x = a.side < 0 ? -20 : W + 20; // half of him peeks over the edge
      this.face = a.side < 0 ? 1 : -1;
    }
    if (a.type === "peekBottom" && a.to !== undefined) {
      this.x = a.to;
    }
    if (this.actT >= a.dur) {
      if (a.type === "peekBottom") this.x = Math.random() < 0.5 ? -220 : W + 220; // sink, then re-enter from a side
      this.next();
    }
  }

  /* ================= drawing ================= */

  private paintBuddy(g: CanvasRenderingContext2D, t: number, mx: number, my: number) {
    const a = this.act;
    const u = clamp(this.actT / a.dur, 0, 1);
    const walking = a.type === "walk";

    // pose defaults
    let sx = 1,
      sy = 1,
      lift = 0,
      sink = 0,
      tilt = 0,
      armBack = 0.25,
      armFront = -0.25,
      eyesOpen = 1,
      mouth: "smile" | "o" | "flat" = "smile",
      prop: "none" | "chai" | "clap" = "none",
      bubble = "";
    let lookX = clamp(mx, -1, 1) * 9;
    let lookY = clamp(my, -1, 1) * 6;

    if (walking) {
      lift = Math.abs(Math.sin(this.walkPhase)) * 10;
      tilt = Math.sin(this.walkPhase) * 0.05;
      armBack = Math.sin(this.walkPhase) * 0.6;
      armFront = -Math.sin(this.walkPhase) * 0.6;
      lookX = 8 * this.face;
    }
    switch (a.type) {
      case "wave":
        armFront = -2.5 + Math.sin(t * 14) * 0.45;
        bubble = "hi!";
        mouth = "o";
        break;
      case "jump": {
        if (u < 0.18) {
          const k = u / 0.18;
          sx = 1 + 0.18 * k;
          sy = 1 - 0.2 * k;
        } else if (u < 0.82) {
          const k = (u - 0.18) / 0.64;
          lift = Math.sin(Math.PI * k) * 150;
          sx = 0.9;
          sy = 1.12;
          armBack = armFront = -2.2;
          mouth = "o";
        } else {
          const k = (u - 0.82) / 0.18;
          sx = 1 + 0.16 * (1 - k);
          sy = 1 - 0.18 * (1 - k);
        }
        break;
      }
      case "chai": {
        prop = "chai";
        const sip = Math.sin(this.actT * 2.2) > 0.6;
        armFront = sip ? -1.6 : -0.9;
        eyesOpen = sip ? 0.15 : 1;
        mouth = sip ? "flat" : "smile";
        break;
      }
      case "sleep":
        sy = 0.92 + Math.sin(t * 2) * 0.02;
        eyesOpen = 0;
        mouth = "flat";
        tilt = -0.08;
        lookX = lookY = 0;
        break;
      case "dance":
        tilt = Math.sin(t * 9) * 0.18;
        lift = Math.abs(Math.sin(t * 9)) * 18;
        armBack = -1.8 + Math.sin(t * 9) * 0.6;
        armFront = -1.8 - Math.sin(t * 9) * 0.6;
        break;
      case "clap": {
        prop = "clap";
        armFront = -1.3;
        bubble = u < 0.55 ? "action!" : "cut!";
        mouth = "o";
        break;
      }
      case "look":
        lookX = Math.sin(this.actT * 2.4) * 10;
        tilt = Math.sin(this.actT * 2.4) * 0.07;
        break;
      case "peekSide": {
        // slide in a little, hold, slide back out
        const inOut = u < 0.2 ? ease(u / 0.2) : u > 0.82 ? 1 - ease((u - 0.82) / 0.18) : 1;
        tilt = -0.32 * this.face * inOut;
        lookX = 10 * this.face;
        bubble = u > 0.3 && u < 0.75 ? "psst" : "";
        sink = (1 - inOut) * 40;
        break;
      }
      case "peekBottom": {
        // rise from below the bottom edge so only the head shows, then sink again
        const inOut = u < 0.22 ? ease(u / 0.22) : u > 0.8 ? 1 - ease((u - 0.8) / 0.2) : 1;
        sink = 420 - inOut * 220;
        lookX = Math.sin(this.actT * 3) * 10;
        lookY = -4;
        break;
      }
    }
    if (this.blink > 0 && eyesOpen > 0.5) eyesOpen = 0.1;

    const baseY = GROUND - lift + sink;

    // soft floor shadow (stays on the ground while he hops)
    if (a.type !== "peekBottom") {
      const sw = 92 * (1 - Math.min(lift, 150) / 400);
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath();
      g.ellipse(this.x, GROUND + 6, sw, 14, 0, 0, Math.PI * 2);
      g.fill();
    }

    g.save();
    g.translate(this.x, baseY);
    g.rotate(tilt);
    g.scale(sx * this.face, sy);

    // legs
    const swing = walking ? Math.sin(this.walkPhase) * 0.55 : a.type === "dance" ? Math.sin(t * 9) * 0.3 : 0;
    leg(g, -28, swing);
    leg(g, 28, -swing);

    // back arm (behind the body)
    arm(g, -70, armBack);

    // body: a soft bean with a little shading
    const grad = g.createRadialGradient(-30, -210, 20, 0, -150, 150);
    grad.addColorStop(0, "#fbf7ef");
    grad.addColorStop(1, BODY_SHADE);
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(0, -150, 84, 110, 0, 0, Math.PI * 2);
    g.fill();

    // headphones
    g.strokeStyle = "#26262b";
    g.lineWidth = 16;
    g.lineCap = "round";
    g.beginPath();
    g.arc(0, -168, 94, Math.PI * 1.08, Math.PI * 1.92);
    g.stroke();
    g.fillStyle = ACCENT;
    roundRect(g, -100, -205, 30, 58, 12);
    g.fill();
    roundRect(g, 70, -205, 30, 58, 12);
    g.fill();

    // face (look direction is in world space, so un-flip x)
    const lx = lookX * this.face;
    const ly = lookY;
    g.fillStyle = "rgba(255,77,31,0.28)";
    circle(g, -52 + lx * 0.4, -138, 13);
    circle(g, 52 + lx * 0.4, -138, 13);
    eye(g, -30 + lx, -178 + ly, eyesOpen);
    eye(g, 30 + lx, -178 + ly, eyesOpen);
    g.strokeStyle = INK;
    g.fillStyle = INK;
    g.lineWidth = 5;
    if (mouth === "smile") {
      g.beginPath();
      g.arc(lx * 0.5, -150, 13, Math.PI * 0.15, Math.PI * 0.85);
      g.stroke();
    } else if (mouth === "o") {
      g.beginPath();
      g.ellipse(lx * 0.5, -140, 8, 10, 0, 0, Math.PI * 2);
      g.fill();
    } else {
      g.beginPath();
      g.moveTo(lx * 0.5 - 9, -142);
      g.lineTo(lx * 0.5 + 9, -142);
      g.stroke();
    }

    // front arm + prop
    arm(g, 70, armFront, (hx, hy) => {
      if (prop === "chai") chai(g, hx, hy, t);
      if (prop === "clap") clapper(g, hx, hy, u);
    });
    g.restore();

    /* world-space extras: speech bubble, zzz, notes */
    const headY = baseY - 300;
    if (bubble) speech(g, this.x + 60 * this.face, headY - 10, bubble, this.font);
    if (a.type === "sleep") {
      g.fillStyle = "rgba(236,230,218,0.85)";
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.6 + i / 3) % 1;
        g.font = `600 ${30 + i * 8}px ${this.font}`;
        g.fillText("z", this.x + 70 + k * 60 + i * 10, headY + 40 - k * 120);
      }
    }
    if (a.type === "dance") {
      g.fillStyle = ACCENT;
      g.font = `600 44px ${this.font}`;
      for (let i = 0; i < 2; i++) {
        const k = (t * 0.7 + i * 0.5) % 1;
        g.fillText("♪", this.x + (i ? -130 : 110) + Math.sin(k * 6) * 12, headY + 60 - k * 140);
      }
    }
  }
}

/* ---------- drawing helpers ---------- */
function leg(g: CanvasRenderingContext2D, x: number, angle: number) {
  g.save();
  g.translate(x, -56);
  g.rotate(angle);
  g.strokeStyle = BODY_SHADE;
  g.lineWidth = 24;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(0, 46);
  g.stroke();
  g.fillStyle = "#2a2a30";
  g.beginPath();
  g.ellipse(6, 54, 20, 11, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** angle 0 = hanging down; negative swings forward/up */
function arm(g: CanvasRenderingContext2D, x: number, angle: number, hand?: (hx: number, hy: number) => void) {
  g.save();
  g.translate(x, -128);
  g.rotate(angle * Math.sign(x || 1)); // mirrored for the back arm
  g.strokeStyle = BODY_SHADE;
  g.lineWidth = 20;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(0, 50);
  g.stroke();
  if (hand) {
    g.translate(0, 56);
    g.rotate(-angle * Math.sign(x || 1)); // keep props upright
    hand(0, 0);
  }
  g.restore();
}

function eye(g: CanvasRenderingContext2D, x: number, y: number, open: number) {
  g.fillStyle = INK;
  if (open < 0.2) {
    g.strokeStyle = INK;
    g.lineWidth = 5;
    g.beginPath();
    g.arc(x, y - 2, 10, Math.PI * 0.15, Math.PI * 0.85);
    g.stroke();
    return;
  }
  g.beginPath();
  g.ellipse(x, y, 11, 16 * open, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  circle(g, x + 4, y - 6, 4);
}

function chai(g: CanvasRenderingContext2D, x: number, y: number, t: number) {
  g.fillStyle = "#fbf7ef";
  roundRect(g, x - 18, y - 30, 36, 40, 6);
  g.fill();
  g.fillStyle = ACCENT;
  g.fillRect(x - 18, y - 18, 36, 8);
  g.strokeStyle = "#fbf7ef";
  g.lineWidth = 5;
  g.beginPath();
  g.arc(x + 20, y - 10, 9, -Math.PI / 2, Math.PI / 2);
  g.stroke();
  // steam
  g.strokeStyle = "rgba(236,230,218,0.6)";
  g.lineWidth = 3;
  for (let i = -1; i <= 1; i += 2) {
    g.beginPath();
    for (let k = 0; k < 6; k++) {
      const yy = y - 38 - k * 9;
      const xx = x + i * 7 + Math.sin(t * 4 + k + i) * 4;
      if (k === 0) g.moveTo(xx, yy);
      else g.lineTo(xx, yy);
    }
    g.stroke();
  }
}

function clapper(g: CanvasRenderingContext2D, x: number, y: number, u: number) {
  // board
  g.fillStyle = "#26262b";
  roundRect(g, x - 40, y - 34, 80, 54, 5);
  g.fill();
  g.fillStyle = "rgba(236,230,218,0.8)";
  g.fillRect(x - 32, y - 20, 50, 4);
  g.fillRect(x - 32, y - 8, 36, 4);
  // hinged top bar: open, then snaps shut halfway through
  const open = u < 0.5 ? 0.5 : u < 0.56 ? 0.5 * (1 - (u - 0.5) / 0.06) : 0;
  g.save();
  g.translate(x - 40, y - 36);
  g.rotate(-open);
  g.fillStyle = "#ece6da";
  g.fillRect(0, -14, 80, 14);
  g.fillStyle = "#26262b";
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(8 + i * 20, -14);
    g.lineTo(18 + i * 20, -14);
    g.lineTo(12 + i * 20, 0);
    g.lineTo(2 + i * 20, 0);
    g.fill();
  }
  g.restore();
}

function speech(g: CanvasRenderingContext2D, x: number, y: number, text: string, font: string) {
  g.font = `600 40px ${font}`;
  const w = g.measureText(text).width + 44;
  const h = 64;
  const bx = clamp(x - w / 2, 20, W - w - 20);
  g.fillStyle = "#fbf7ef";
  roundRect(g, bx, y - h, w, h, 22);
  g.fill();
  g.beginPath();
  g.moveTo(clamp(x, bx + 24, bx + w - 24) - 12, y - 2);
  g.lineTo(clamp(x, bx + 24, bx + w - 24) + 4, y + 18);
  g.lineTo(clamp(x, bx + 24, bx + w - 24) + 12, y - 2);
  g.fill();
  g.fillStyle = INK;
  g.fillText(text, bx + 22, y - 19);
}

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
  // a faint floor for him to walk on
  const floor = g.createLinearGradient(0, GROUND - 40, 0, H);
  floor.addColorStop(0, "rgba(236,230,218,0)");
  floor.addColorStop(1, "rgba(236,230,218,0.05)");
  g.fillStyle = floor;
  g.fillRect(0, GROUND - 40, W, H - GROUND + 40);
  g.fillStyle = "rgba(236,230,218,0.08)";
  g.fillRect(0, GROUND + 18, W, 2);
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

function circle(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}
