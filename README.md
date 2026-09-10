# SNAPSULE

_little moments, kept forever._

SNAPSULE is a browser-based photobooth for turning a quick camera session into a finished photo strip. Choose a layout, set the look, take your photos, make a few edits, and save the result to your device.

## How it works

1. **Choose a strip** — Pick 2, 3, 4, or 6 photos, then choose a layout made for that photo count.
2. **Set the style** — Select a paper theme, adjust the colors, write a short caption, and decide whether to include the date and SNAPSULE mark.
3. **Choose a frame** — Browse 27 frame designs across the Essentials, Playful, and Storybook collections.
4. **Get camera-ready** — Preview a filter, choose a countdown, turn mirroring on or off, and set the optional screen light.
5. **Take the photos** — The booth runs the countdown and captures the full sequence. The camera switches off as soon as the last photo is taken.
6. **Review the session** — Keep the set or retake one photo. Retakes reopen the camera only for the replacement shot and switch it off again afterward.
7. **Add the finishing touches** — Place stickers on the strip, then resize, rotate, move, or remove them.
8. **Save the strip** — Finish the print animation and download the result as a high-resolution PNG or JPG.

The same layout and frame renderer is used for the on-screen preview and the downloaded file, so the final strip matches what was shown during editing.

## Run locally

SNAPSULE requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Open the local address shown in the terminal. Camera access works on `localhost` or over HTTPS. A plain HTTP address on another device will usually be blocked by the browser.

To check a production build:

```sh
npm run typecheck
npm test
npm run build
```

After building, `npm run start` runs the generated production server locally.

## Session controls

- **Photo count:** 2, 3, 4, or 6
- **Layouts:** 13 options matched to the selected photo count
- **Paper themes:** 12
- **Frames:** 27
- **Filters:** 12 with a live camera preview
- **Countdown:** 3, 5, or 10 seconds
- **Screen light:** 10 colors with adjustable intensity
- **Stickers:** 16 original designs with drag, resize, rotate, and keyboard movement
- **Downloads:** PNG or JPG

A capture can be stopped without deleting photos that were already taken. Starting again continues from the first empty slot.

## Privacy

Photos stay in memory inside the browser while the session is open. They are not uploaded, stored in local storage, or sent to an image-processing service. Leaving the booth, starting a new session, or refreshing the page clears the current session. The camera stream also stops after a completed capture, after a retake, and when leaving the booth.

## Project structure

- `app/page.tsx` handles the landing page and booth entry.
- `components/booth/BoothInterior.tsx` manages the setup, capture, review, decoration, and download flow.
- `components/booth/ControlPanel.tsx` contains the strip, style, frame, and camera controls.
- `components/booth/CameraPreview.tsx` shows the live camera, selected filter, frame overlay, and countdown.
- `components/booth/StripPreview.tsx` renders the editable strip preview.
- `components/booth/useCamera.ts` manages permission, device selection, stream cleanup, and camera errors.
- `lib/photobooth.ts` contains the layouts, themes, frames, stickers, and shared canvas renderer.
- `tests/photobooth.test.mjs` checks layout bounds, frame alignment, renderer output, stickers, and export sizes.

## Available commands

```sh
npm run dev       # start the local development server
npm run typecheck # check TypeScript
npm run lint      # run the linter
npm test          # run the canvas renderer tests
npm run build     # create the production build
```
