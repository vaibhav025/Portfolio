# Vaibhav Singla — Portfolio ("The Editing Suite")

A portfolio for a video editor. A 3D laptop floats behind a normal, short page. Press **Play** (or just scroll) and the lid opens. As you scroll, the laptop drifts left and right beside each section, grows, dives into its own screen for the Work section, comes back out, and closes at the end.

- **Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, React Three Fiber + drei. Native scrolling, native cursor.
- **Desktop:** the laptop is a fixed WebGL canvas behind the content. Each section has a pose (`components/scene/path.ts`); the laptop holds it while the section is on screen and glides to the next pose in between.
- **Phones, reduced motion, no WebGL:** a lightweight CSS laptop in the hero that opens on Play or scroll. three.js is never downloaded.

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
| Where the laptop sits per section (left/right, size, rotation, inside the screen) | `POSES` in `components/scene/path.ts` |
| How long it holds vs travels between sections | `HOLD_IN` / `HOLD_OUT` in `components/scene/path.ts` |
| Glide speed, lid speed, camera | constants at the top of `components/scene/Laptop.tsx` |
| Colours, fonts (Geist / Geist Mono) and easing tokens | `app/globals.css` (`@theme`), `app/layout.tsx` |

## Structure

```
app/                 layout (fonts, SEO, OG), page, global + component CSS, favicon
components/
  Site.tsx           the page: sections, Play/auto-open, scroll -> laptop pose, reveals
  scene/             R3F canvas, procedural laptop, per-section poses, state bridge
  windows/           window chrome + one component per section
  ui/                nav, hero, outro, overlays, icons
lib/                 content, store, media manifest, timecode helper
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

- Text animates in once and then stays; nothing re-animates when you scroll back.
- The 3D render loop pauses when the tab is hidden.
- Laptop model: built from primitives in `components/scene/Laptop.tsx`. No third-party model, so there are no licence or credit requirements.
