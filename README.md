# SNAPSULE

_little moments, kept forever._

A frontend-only, interactive red photobooth. Enter a procedural Three.js booth, capture webcam photos, customize a keepsake, add original stickers, and pull a high-resolution print from the machine.

## Run locally

Use Node.js 22.13+ (Node 24 recommended for the native TypeScript test runner).

```sh
npm install
npm run dev
```

Open the Local address printed by the server. Camera access works on localhost or HTTPS. Mobile devices accessing a computer over a plain HTTP LAN address need an HTTPS tunnel or the deployed HTTPS site.

```sh
npm run typecheck
npm test
npm run build
```

The production site is a static export in `dist/client`. Serve that directory with any static HTTPS host. `.openai/hosting.json` configures the private Sites deployment. No Worker or photo-processing server is needed. The small Windows build preloader allows native bundler handles to finish closing before the CLI exits; it does not suppress build errors.

## Experience

- Click the 3D booth, or focus the entrance label and press Enter.
- Choose 2, 3, 4, or 6 photos and one of 13 count-specific layouts.
- Select 12 paper themes and 12 live-preview frames. Customize paper, border, text, and accent colors, date, caption, and branding.
- Enable the camera. Use a 3-, 5-, or 10-second timer, mirror setting, camera selector, and optional filter.
- Pick from 10 screen-light colors, set intensity, and test the light. This illuminates the display; it does not change hardware brightness.
- Capture the session. Stop a countdown without losing completed shots, resume unfinished shots, or retake any individual photo.
- Add any of 16 original SVG stickers. Drag with mouse/touch; use sliders to resize or rotate; delete with the Remove button or keyboard. Arrow keys move the focused sticker.
- Print and pull/tap the finished strip. Save a PNG or JPG, take another session, or exit.

## Architecture

The Sites starter uses **Vinext**, a Vite runtime for the Next.js App Router API, with React 19, TypeScript, and Tailwind. It uses the existing Shadcn/Base UI primitives for tabs, radio groups, switches, selects, and sliders.

- `app/page.tsx`: entrance/exit orchestration and persistent brand header.
- `components/booth/LandingScene.tsx`: lazy-loaded React Three Fiber scene, procedural booth, chrome trim, curtains, warm bulbs, stool, GSAP camera transition, and WebGL fallback.
- `components/booth/BoothInterior.tsx`: in-memory session state, countdown, capture, retakes, decoration, print animation, optional synthesized audio, and downloads.
- `components/booth/useCamera.ts`: explicit camera permission, device enumeration, race-safe stream replacement, timeout/error handling, and cleanup.
- `components/booth/ControlPanel.tsx`: physical controls composed from accessible primitives.
- `components/booth/CameraPreview.tsx`: video, live frame overlay, timer, and permission state.
- `components/booth/StripPreview.tsx`: scaled canvas preview and keyboard/touch sticker editing.
- `lib/photobooth.ts`: layout geometry, original frame and sticker vectors, themes, and the shared Canvas renderer. Preview and export use the same geometry and drawing code.
- `public/assets/logo-mark.svg` and `public/assets/snapsule-logo.svg`: original capsule/photo mark and complete logo with tagline.
- `public/assets/stickers`: 16 reusable original SVG assets. Regenerate with `npm run assets:generate`.

Most strips export at 1200px wide; classic four-photo strips are 1200 × 3600, grids are 2400px wide, and postcards are 3000 × 2000. The selected layout determines the final height.

## Privacy

Photos exist only in React state, a bounded session image cache, and local canvases. No photo is sent through fetch, XMLHttpRequest, forms, analytics, or an upload API. No images are written to localStorage or IndexedDB. Streams stop on leaving/unmounting and stale permission requests are discarded. Refreshing removes the session; the user explicitly saves their final image through the browser download flow. The optional WebMCP tool changes caption/paper color only and cannot read or transmit photos.

## Validation and practical limits

`npm test` runs 16 renderer checks using a native Canvas adapter: every layout stays within its print bounds, frames/themes produce distinct output, all 16 stickers render in exports, and full-resolution PNG/JPG encoding works. TypeScript and the production export are checked separately. The native adapter decodes SVG data URLs to buffers because its image loader differs from a browser's.

Real webcam permission, real-device lighting, mobile Safari behavior, and visual browser interaction still require testing with actual hardware. The WebMCP integration is feature-detected; no supported WebMCP validation context was available during implementation, so its runtime contract has not been independently verified. Unsupported WebGL falls back to a keyboard-accessible entrance, and reduced-motion preferences shorten transitions. Audio is muted by default and uses no remote sound files.
