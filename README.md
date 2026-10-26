# Vaibhav Singla — Portfolio ("The Editing Suite")

A scroll-driven portfolio for a video editor. You scroll and a closed laptop opens, the camera dives into the screen, and the page turns into an editing-suite desktop. Each section opens as an app window from the dock.

- **Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis, React Three Fiber + drei.
- **Desktop path ("suite"):** one pinned stage. A master GSAP timeline is scrubbed by scroll and drives the 3D laptop, the 3D-to-DOM handoff, the windows and their contents.
- **Light path ("linear"):** used for touch devices, small screens, `prefers-reduced-motion` and browsers without WebGL. It has a 2.5D CSS laptop, stacked window cards and native scrolling. It never downloads three.js.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Checks:

```bash
npm run typecheck
npm run lint
npm run build && npm start
```

## Add your own videos and posters

The Work section has one media slot per edit. Name each file after the edit's `slug`:

| Edit | slug |
| --- | --- |
| Fest Team Reveal (featured) | `fest-team-reveal` |
| DSA Bootcamp | `dsa-bootcamp` |
| Galactica Teaser | `galactica-teaser` |
| Agaaz 5.0 | `agaaz-5` |
| Tech Week Teaser | `tech-week-teaser` |

```
public/videos/fest-team-reveal.mp4     # or .webm
public/posters/fest-team-reveal.jpg    # or .webp / .png / .avif
```

- **Videos:** a short, muted, looping preview works best. Aim for 6–12 seconds, 1280×720 or smaller, H.264 MP4, and keep each file under about 4 MB. They load only on hover, or when the clip is on the program monitor.
- **Posters:** a 1600×900 still. It shows until the video is ready.
- **How it's detected:** the site reads `/public/videos` and `/public/posters` at build time. Restart `npm run dev`, or redeploy, after adding files. If an edit has no file, it shows its animated colour-graded placeholder.
- **"Watch Edit":** always opens the original Instagram reel. Reels aren't embedded, because Instagram doesn't allow reliable embedding.

## Edit content and tune motion

| What | Where |
| --- | --- |
| All text, links, edits and contact details | `lib/content.ts` |
| Scene order and length (beats; 1 beat = 100vh of scroll) | `lib/timeline.ts` |
| Colours, fonts and easing tokens | `app/globals.css` (`@theme`) |
| Window positions, landing points for nav jumps, scrub smoothing | constants at the top of `components/Suite.tsx` |
| Laptop size, materials and camera keyframes | constants at the top of `components/scene/Laptop.tsx` |
| Cursor follow and magnetic strength | constants at the top of `components/ui/Cursor.tsx` |

## Structure

```
app/                 layout (fonts, SEO, OG), page, global + component CSS, favicon
components/
  Experience.tsx     picks suite vs linear, shows the export-dialog loader
  Suite.tsx          Lenis + master ScrollTrigger timeline (desktop)
  Linear.tsx         lighter mobile / reduced-motion layout
  scene/             R3F canvas, procedural laptop, scroll-to-3D state bridge
  windows/           window chrome, desktop + dock, one component per app
  ui/                HUD/nav, cursor, loader, overlays, hero, outro, icons
lib/                 content, timeline constants, store, media manifest, sfx
public/
  images/            portrait (WebP) + og.jpg
  videos/ posters/   your media slots (see above)
  models/            empty: the laptop is procedural, so no GLB is needed
_old/                previous static site, kept for reference only (not built)
```

## Deploy (Vercel)

1. Push the `redesign` branch: `git push -u origin redesign`.
2. Vercel builds a **preview deployment** for the branch automatically. `vercel.json` pins the framework to Next.js, so the old static-site settings don't apply.
   - If the preview 404s, open **Project Settings → Build & Development**. Set **Framework Preset** to *Next.js*, clear any custom Output Directory, and redeploy.
3. Check the preview on desktop and on a phone.
4. Merge `redesign` into `main`. The production site updates on its next deploy.

## Notes

- Sound is off by default. The speaker button in the top bar turns on soft synthesised cut sounds; there are no audio files.
- The 3D render loop pauses while the desktop covers the canvas, and when the tab is hidden.
- Laptop model: built from primitives in `components/scene/Laptop.tsx`. No third-party model, so there are no licence or credit requirements.
