/**
 * Liquid Navbar — "Waterline" (vanilla JS port)
 * Ported from Nimbus UI's React component by guglielmogiannattasio.it.
 * A pill of water: the active drop stretches toward the picked item, splits into
 * droplets on long jumps and merges back with a ripple. WebGL shader inside the pill,
 * CSS drop fallback without WebGL. No dependencies.
 *
 * Usage: <nav class="nimbus-nav" data-liquid-nav data-tone="dark"> with
 * <a class="nimbus-item" href="#x" data-fx="glow"><span class="nv-ico">svg</span><span class="nimbus-label">X</span></a>
 */
(function () {
  "use strict";

  var PAD = 14; // canvas bleed around the pill, for shadows and ripples

  /* ---------- styles ---------- */
  var NIMBUS_CSS = `
.nimbus-nav{--n-tint:rgba(255,255,255,.14);--n-fg:#0B132B;--n-fg-soft:rgba(11,19,43,.6);--n-rim:rgba(255,255,255,.7);
  position:relative;display:inline-flex;align-items:center;gap:2px;padding:6px;border-radius:999px;isolation:isolate;
  font-family:ui-sans-serif,-apple-system,"SF Pro Text","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;user-select:none;-webkit-tap-highlight-color:transparent}
.nimbus-nav[data-tone="dark"]{--n-tint:rgba(10,18,40,.26);--n-fg:#F1F7FF;--n-fg-soft:rgba(241,247,255,.66);--n-rim:rgba(255,255,255,.34)}
.nimbus-glass{position:absolute;inset:0;border-radius:inherit;z-index:-2;overflow:hidden;background:var(--n-tint);
  -webkit-backdrop-filter:blur(10px) saturate(1.2) brightness(1.08);backdrop-filter:blur(10px) saturate(1.2) brightness(1.08);
  box-shadow:inset 0 1px 1px var(--n-rim),inset 0 0 0 1px rgba(255,255,255,.2),0 12px 32px -14px rgba(0,40,90,.5),0 2px 6px rgba(0,40,90,.1)}
.nimbus-nav[data-refract="on"] .nimbus-glass{-webkit-backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.2) brightness(1.08);backdrop-filter:url(#nimbus-refract) blur(2px) saturate(1.2) brightness(1.08)}
.nimbus-water{position:absolute;left:${-PAD}px;top:${-PAD}px;z-index:-1;pointer-events:none}
.nimbus-nav[data-gl="off"] .nimbus-water{display:none}
.nimbus-drop{display:none;position:absolute;top:6px;bottom:6px;left:0;border-radius:999px;z-index:-1;pointer-events:none;will-change:transform,width;
  background:radial-gradient(120% 140% at 30% 0%,rgba(255,255,255,.75),rgba(255,255,255,0) 55%),rgba(255,255,255,.38);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.95),inset 0 -2px 6px rgba(0,162,255,.22),inset 0 0 0 1px rgba(255,255,255,.55),0 6px 16px -6px rgba(0,70,140,.45)}
.nimbus-nav[data-gl="off"] .nimbus-drop{display:block}
.nimbus-item{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:0;border-radius:999px;background:none;color:var(--n-fg-soft);
  font-family:inherit;font-weight:500;font-size:14px;line-height:1;letter-spacing:-.01em;text-decoration:none;cursor:pointer;transition:color .25s}
.nimbus-item:hover,.nimbus-item[aria-current="page"]{color:var(--n-fg)}
.nimbus-item:focus-visible{outline:2px solid #00A2FF;outline-offset:2px}
.nv-ico{position:relative;display:inline-flex;flex:none}
.nv-ico svg{transition:transform .45s cubic-bezier(.3,1.6,.5,1)}
.nimbus-item[aria-current="page"] .nv-ico svg{transform:translateY(-1px) scale(1.08)}
.nv-door{fill:transparent}
.nv-ico[data-fx="pop"] svg{animation:nvPop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes nvPop{0%{transform:scale(.72)}60%{transform:scale(1.2)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"] svg{animation:nvPlane 1.15s cubic-bezier(.55,0,.3,1) both}
@keyframes nvPlane{0%{transform:none}12%{transform:translate(-3px,2px) rotate(7deg)}42%{transform:translate(64px,-26px) rotate(-24deg) scale(.9);opacity:0}43%{transform:translate(-60px,16px) rotate(-12deg) scale(.9);opacity:0}58%{opacity:1}80%{transform:translate(3px,-1px) rotate(2deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"]::after{content:"";position:absolute;left:55%;top:48%;height:2px;width:46px;border-radius:2px;transform-origin:0 50%;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.95));animation:nvTrail 1.15s ease-out both;pointer-events:none}
@keyframes nvTrail{0%,8%{opacity:0;transform:rotate(-22deg) scaleX(0)}30%{opacity:.9;transform:rotate(-22deg) scaleX(1)}55%,100%{opacity:0;transform:rotate(-22deg) translateX(30px) scaleX(.2)}}
.nv-ico[data-fx="drop"] svg{animation:nvDrop .95s cubic-bezier(.4,0,.3,1) both;transform-origin:50% 100%}
@keyframes nvDrop{0%{transform:translateY(-1px)}26%{transform:translateY(-13px) scale(.88,1.12)}46%{transform:translateY(3px) scale(1.3,.68)}62%{transform:translateY(-3px) scale(.92,1.08)}80%{transform:translateY(0) scale(1.04,.97)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="drop"]::before,.nv-ico[data-fx="drop"]::after{content:"";position:absolute;bottom:0;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:currentColor;opacity:0;pointer-events:none}
.nv-ico[data-fx="drop"]::before{animation:nvSplashL .95s ease-out both}
.nv-ico[data-fx="drop"]::after{animation:nvSplashR .95s ease-out both}
@keyframes nvSplashL{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(-5px,-6px)}75%,100%{opacity:0;transform:translate(-11px,1px) scale(.4)}}
@keyframes nvSplashR{0%,44%{opacity:0;transform:none}50%{opacity:.9;transform:translate(5px,-7px)}75%,100%{opacity:0;transform:translate(12px,1px) scale(.4)}}
.nv-ico[data-fx="spin"] svg{animation:nvSpin 1s cubic-bezier(.2,.75,.25,1) both}
@keyframes nvSpin{0%{transform:perspective(80px) rotateY(0)}100%{transform:perspective(80px) rotateY(360deg) translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] svg{animation:nvHop .8s cubic-bezier(.3,1.4,.5,1) both;transform-origin:50% 100%}
@keyframes nvHop{0%{transform:none}30%{transform:translateY(-5px) scale(1.04,.96)}55%{transform:translateY(0) scale(1.12,.88)}75%{transform:translateY(-2px) scale(.98,1.04)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] .nv-door{animation:nvDoor 1.3s ease both}
@keyframes nvDoor{0%{fill:transparent}30%{fill:#FFF3A8}100%{fill:rgba(126,232,255,.6)}}
.nv-ico[data-fx="wave"] svg{animation:nvWave .9s ease-in-out both;transform-origin:50% 92%}
@keyframes nvWave{0%{transform:none}20%{transform:rotate(-15deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nimbus-nav[data-compact="true"] .nimbus-item{padding:0 13px}
.nimbus-nav[data-compact="true"] .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:520px){.nimbus-nav:not([data-compact="false"]) .nimbus-item{padding:0 13px}.nimbus-nav:not([data-compact="false"]) .nimbus-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}
@media (prefers-reduced-motion:reduce){.nv-ico svg,.nv-ico::before,.nv-ico::after,.nv-door{animation:none!important;transition:none}}
`;

  /* ---------- the water shader ---------- */
  var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`;

  function makeState() {
    return {
      a: { x: 0, v: 0 },
      b: { x: 0, v: 0 },
      sy: { s: 1, v: 0 },
      lead: 0,
      lagFrom: 0,
      sats: [],
      rips: [],
      t: { x: 0, cy: 0, q: 0, r: 21 },
      q: 0,
      mouse: { x: 0, y: 0, s: 0, on: false },
      moving: false,
      split: false,
      ready: false,
      w: 0,
      h: 0,
      visible: true,
      reduce: false,
      raf: 0,
      last: 0,
      time: 0,
      glc: null,
    };
  }

  function initGL(canvas) {
    var gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    var sh = function (type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    var vs = sh(gl.VERTEX_SHADER, VERT);
    var fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    gl.useProgram(p);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(p, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var u = {};
    ["uRes", "uDpr", "uTime", "uPill", "uBlob", "uSy", "uRip", "uMouse", "uDark", "uAmb"].forEach(function (n) {
      u[n] = gl.getUniformLocation(p, n);
    });
    return { gl: gl, u: u };
  }

  function supportsRefraction() {
    if (typeof CSS === "undefined") return false;
    var ua = navigator.userAgent;
    return /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\//.test(ua) && !!(CSS.supports && CSS.supports("backdrop-filter", "url(#a)"));
  }

  function injectStyles() {
    if (document.getElementById("nimbus-css")) return;
    var tag = document.createElement("style");
    tag.id = "nimbus-css";
    tag.textContent = NIMBUS_CSS;
    document.head.appendChild(tag);
  }

  function LiquidNavbar(nav, opts) {
    opts = opts || {};
    injectStyles();
    var items = Array.prototype.slice.call(nav.querySelectorAll(".nimbus-item"));
    var icons = items.map(function (el) { return el.querySelector(".nv-ico"); });
    var s = makeState();
    var current = Math.max(0, items.findIndex(function (el) { return el.getAttribute("aria-current") === "page"; }));
    var sound = !!opts.sound;
    var audio = null;
    var dark = function () { return nav.getAttribute("data-tone") === "dark" ? 1 : 0; };

    /* ---- chrome: refraction filter, glass, water canvas, CSS drop fallback ---- */
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML =
      '<filter id="nimbus-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="2" seed="7" result="noise"/>' +
      '<feGaussianBlur in="noise" stdDeviation="2" result="soft"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="soft" scale="60" xChannelSelector="R" yChannelSelector="G"/></filter>';
    var glass = document.createElement("span");
    glass.className = "nimbus-glass";
    glass.setAttribute("aria-hidden", "true");
    var canvas = document.createElement("canvas");
    canvas.className = "nimbus-water";
    canvas.setAttribute("aria-hidden", "true");
    var drop = document.createElement("span");
    drop.className = "nimbus-drop";
    drop.setAttribute("aria-hidden", "true");
    nav.prepend(svg, glass, canvas, drop);

    nav.setAttribute("data-refract", supportsRefraction() ? "on" : "off");
    s.reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    s.glc = initGL(canvas);
    nav.setAttribute("data-gl", s.glc ? "on" : "off");
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      s.glc = null;
      nav.setAttribute("data-gl", "off");
    });

    /* ---- drawing ---- */
    function draw() {
      var T = s.t;
      var sep = Math.abs(s.a.x - s.b.x);
      var thin = Math.min(sep / (2 * (s.q + T.r) || 1), 1);
      var r = T.r * (1 - 0.3 * thin);
      if (s.glc) {
        var g = s.glc.gl, u = s.glc.u;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
        g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2);
        g.uniform1f(u.uDpr, dpr);
        g.uniform1f(u.uTime, s.time);
        g.uniform4f(u.uPill, PAD, PAD, s.w, s.h);
        var blobs = new Float32Array(24);
        var sy = new Float32Array(6).fill(1);
        var head = s.lead === 0 ? s.a : s.b, tail = s.lead === 0 ? s.b : s.a;
        blobs.set([head.x, T.cy, s.q * (1 - 0.25 * thin), T.r * (1 - 0.12 * thin), tail.x, T.cy, s.q * (1 - 0.8 * thin), T.r * (1 - 0.5 * thin)], 0);
        sy[0] = sy[1] = s.sy.s;
        s.sats.slice(0, 4).forEach(function (d, i) { blobs.set([d.x, d.y, 0, d.r], 8 + i * 4); });
        g.uniform4fv(u.uBlob, blobs);
        g.uniform1fv(u.uSy, sy);
        var rips = new Float32Array(24);
        s.rips.slice(-6).forEach(function (p, i) { rips.set([p.x, p.y, p.age, p.amp], i * 4); });
        g.uniform4fv(u.uRip, rips);
        g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s);
        g.uniform1f(u.uDark, dark());
        g.uniform1f(u.uAmb, s.reduce ? 0 : 1);
        g.clearColor(0, 0, 0, 0);
        g.clear(g.COLOR_BUFFER_BIT);
        g.drawArrays(g.TRIANGLES, 0, 3);
      } else {
        var left = Math.min(s.a.x, s.b.x) - s.q - r - PAD;
        var width = sep + 2 * (s.q + r);
        drop.style.width = width + "px";
        drop.style.transform = "translateX(" + left + "px) scaleY(" + s.sy.s + ")";
      }
    }

    /* ---- physics ---- */
    function step(dt, now) {
      var T = s.t;
      s.time += dt;
      s.q += (T.q - s.q) * Math.min(1, dt * 12);
      var bodies = [s.a, s.b];
      var still = true;
      if (s.reduce) {
        s.a.x = s.b.x = T.x; s.a.v = s.b.v = 0; s.sy.s = 1; s.sats = [];
      } else {
        bodies.forEach(function (B, i) {
          var lead = i === s.lead;
          var k = lead ? 210 : 72;
          var c = lead ? 25 : 13;
          var f = !lead && now < s.lagFrom ? 0.08 : 1;
          B.v += (k * (T.x - B.x) - c * B.v) * dt * f;
          B.x += B.v * dt;
          var lo = PAD + 6 + s.q + T.r - 3, hi = PAD + s.w - 6 - s.q - T.r + 3;
          if (B.x < lo || B.x > hi) {
            s.sy.v -= Math.min(Math.abs(B.v), 900) * 0.0016;
            B.x = Math.max(lo, Math.min(hi, B.x));
            B.v *= -0.25;
          }
          if (Math.abs(T.x - B.x) > 0.3 || Math.abs(B.v) > 3) still = false;
        });
        var L = bodies[s.lead];
        var syT = 1 - 0.2 * Math.min(Math.abs(L.v) / 1500, 1);
        s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt;
        s.sy.s += s.sy.v * dt;
        if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false;
        // break the neck: spawn droplets between head and tail
        var sep = Math.abs(s.a.x - s.b.x);
        var r = T.r * (1 - 0.3 * Math.min(sep / (2 * (T.q + T.r) || 1), 1));
        if (!s.split && s.moving && sep - 2 * T.q - 2 * r > -6) {
          s.split = true;
          var lo = bodies[1 - s.lead], hi = bodies[s.lead];
          [0.3, 0.5, 0.72].forEach(function (t, j) {
            s.sats.push({
              x: lo.x + (hi.x - lo.x) * t + (Math.random() - 0.5) * 6,
              y: T.cy + (Math.random() - 0.5) * 10,
              vx: (lo.v + hi.v) * 0.45,
              vy: (Math.random() - 0.5) * 60,
              r: 5 + Math.random() * 3 - j * 0.5,
              k: 70 + Math.random() * 90,
            });
          });
        }
        s.sats = s.sats.filter(function (d) {
          d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt;
          d.vy += (90 * (T.cy - d.y) - 7 * d.vy) * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x));
          d.y = Math.max(T.cy - T.r + d.r, Math.min(T.cy + T.r - d.r, d.y));
          if (Math.abs(T.x - d.x) < T.q + T.r * 0.5) d.r -= dt * 26;
          return d.r > 0.6;
        });
        if (s.sats.length) still = false;
      }
      if (s.moving && still) {
        s.moving = false;
        if (s.split || !s.reduce) s.rips.push({ x: T.x, y: T.cy, age: 0, amp: s.split ? 1.2 : 0.7 });
      }
      s.rips.forEach(function (p) { p.age += dt; });
      s.rips = s.rips.filter(function (p) { return p.age < 2.4; });
      var target = s.mouse.on ? 1 : 0;
      s.mouse.s += (target - s.mouse.s) * Math.min(1, dt * 7);
    }

    function loop() {
      if (s.raf) return;
      s.last = performance.now();
      var tick = function (now) {
        var dt = Math.min((now - s.last) / 1000, 1 / 30);
        s.last = now;
        step(dt, now);
        draw();
        var busy = s.moving || s.rips.length || s.sats.length || s.mouse.s > 0.01;
        // ambient water keeps moving while visible; reduced-motion only animates on change
        if (s.visible && (!s.reduce || busy)) s.raf = requestAnimationFrame(tick);
        else s.raf = 0;
      };
      s.raf = requestAnimationFrame(tick);
    }

    /* ---- layout ---- */
    function measure() {
      var el = items[current];
      if (!el) return;
      s.w = nav.offsetWidth;
      s.h = nav.offsetHeight;
      var T = s.t;
      T.r = el.offsetHeight / 2;
      T.q = Math.max(0, el.offsetWidth / 2 - T.r);
      T.cy = PAD + el.offsetTop + el.offsetHeight / 2;
      var nx = PAD + el.offsetLeft + el.offsetWidth / 2;
      if (!s.ready) {
        s.a.x = s.b.x = nx;
        s.q = T.q;
        s.ready = true;
      } else if (Math.abs(nx - T.x) > 0.5) {
        s.lead = Math.abs(nx - s.a.x) <= Math.abs(nx - s.b.x) ? 0 : 1;
        s.lagFrom = performance.now() + 70;
        s.moving = true;
        s.split = false;
      }
      T.x = nx;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = s.w + PAD * 2, Hh = s.h + PAD * 2;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(Hh * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(Hh * dpr);
        canvas.style.width = W + "px";
        canvas.style.height = Hh + "px";
      }
      loop();
    }

    new IntersectionObserver(function (entries) {
      s.visible = entries[0].isIntersecting;
      if (s.visible) loop();
    }).observe(nav);
    document.addEventListener("visibilitychange", function () {
      s.visible = document.visibilityState === "visible";
      if (s.visible) loop();
    });
    var lastW = -1;
    new ResizeObserver(function () {
      var w = nav.offsetWidth;
      if (w !== lastW) { lastW = w; s.ready = false; measure(); }
    }).observe(nav);
    // labels change width once the web font lands
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { s.ready = false; measure(); });

    /* ---- interaction ---- */
    function local(clientX, clientY) {
      var r = nav.getBoundingClientRect();
      return { x: clientX - r.left + PAD, y: clientY - r.top + PAD };
    }
    function ripple(x, y, amp) {
      if (s.reduce) return;
      s.rips.push({ x: x, y: y, age: 0, amp: amp });
      loop();
    }
    function iconCenter(i) {
      var el = icons[i];
      if (!el) return null;
      var b = el.getBoundingClientRect();
      return local(b.left + b.width / 2, b.top + b.height / 2);
    }
    function plip() {
      if (!sound) return;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        var ctx = (audio = audio || new AC());
        var t = ctx.currentTime;
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(420 + Math.random() * 80, t);
        o.frequency.exponentialRampToValueAtTime(1500, t + 0.07);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.18);
      } catch (e) {}
    }
    function playFx(i, kind) {
      var ico = icons[i];
      if (!ico || kind === "none") return;
      icons.forEach(function (el) { if (el) el.removeAttribute("data-fx"); });
      void ico.offsetWidth; // restart the animation
      ico.setAttribute("data-fx", kind);
    }

    function setActive(i) {
      if (i === current || !items[i]) return;
      if (items[current]) items[current].removeAttribute("aria-current");
      current = i;
      items[i].setAttribute("aria-current", "page");
      measure();
      if (opts.onChange) opts.onChange(i, items[i]);
    }

    function select(i) {
      var kind = items[i].getAttribute("data-fx") || (icons[i] ? "pop" : "none");
      playFx(i, kind);
      plip();
      var c = iconCenter(i);
      if (c && kind === "drop") setTimeout(function () { ripple(c.x, s.t.cy, 1.4); }, 430);
      if (c && kind === "plane") ripple(c.x, c.y, 0.6);
      setActive(i);
    }

    items.forEach(function (el, i) {
      el.addEventListener("click", function () { select(i); });
    });
    nav.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var n = (current + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
      select(n);
      items[n].focus();
    });
    nav.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var p = local(e.clientX, e.clientY);
      s.mouse.x = p.x;
      s.mouse.y = p.y;
      s.mouse.on = true;
      loop();
    });
    nav.addEventListener("pointerleave", function () { s.mouse.on = false; loop(); });
    nav.addEventListener("pointerdown", function (e) {
      var p = local(e.clientX, e.clientY);
      ripple(p.x, p.y, 0.8);
    });

    if (items[current]) items[current].setAttribute("aria-current", "page");
    measure();

    return { setActive: setActive, select: select, items: items, get active() { return current; } };
  }

  window.LiquidNavbar = LiquidNavbar;
})();
