import assert from 'node:assert/strict';
import test from 'node:test';
import { createCanvas, Image } from '@napi-rs/canvas';
import {
  geometry,
  layouts,
  defaultSettings,
  renderStrip,
  drawFrame,
  frames,
  themes,
  stickerNames,
} from '../lib/photobooth.ts';
class BrowserImage extends Image {
  set src(value) {
    super.src = value.startsWith('data:image/svg+xml;base64,')
      ? Buffer.from(value.split(',')[1], 'base64')
      : value;
  }
  get src() {
    return super.src;
  }
}
globalThis.Image = BrowserImage;
const photo = createCanvas(640, 480);
const px = photo.getContext('2d');
px.fillStyle = '#15b3ae';
px.fillRect(0, 0, 640, 480);
px.fillStyle = '#f7944b';
px.fillRect(320, 0, 320, 480);
const photos = Array(6).fill(photo.toDataURL('image/jpeg'));
const date = new Date('2026-09-09T12:00:00Z');
for (const [count, options] of Object.entries(layouts))
  for (const { id } of options) {
    test(`${count} photos / ${id}: layout stays within print and renders`, async () => {
      const g = geometry(Number(count), id);
      assert.equal(g.rects.length, Number(count));
      const photoBottom = Math.max(...g.rects.map((r) => r.y + r.h));
      const brandingTop = g.footer - g.w * 0.049;
      assert.ok(
        brandingTop - photoBottom >= 45,
        'branding is too close to the photo frame',
      );
      for (const r of g.rects) {
        assert.ok(r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0);
        assert.ok(r.x + r.w <= g.w);
        assert.ok(r.y + r.h < g.footer - 15, 'photo overlaps footer');
      }
      for (let i = 0; i < g.rects.length; i++)
        for (let j = i + 1; j < g.rects.length; j++) {
          const a = g.rects[i],
            b = g.rects[j];
          assert.ok(
            a.x + a.w <= b.x ||
              b.x + b.w <= a.x ||
              a.y + a.h <= b.y ||
              b.y + b.h <= a.y,
            'photos overlap',
          );
        }
      const cv = await renderStrip(
        createCanvas(1, 1),
        photos.slice(0, Number(count)),
        { ...defaultSettings, count: Number(count), layout: id },
        [],
        0.15,
        date,
      );
      assert.equal(cv.width, Math.round(g.w * 0.15));
      assert.equal(cv.height, Math.round(g.h * 0.15));
      assert.ok(cv.toBuffer('image/png').length > 2000);
    });
  }
test('all frames and paper styles render distinct output', async () => {
  const hashes = new Set();
  for (let i = 0; i < frames.length; i++) {
    const cv = await renderStrip(
      createCanvas(1, 1),
      photos.slice(0, 4),
      { ...defaultSettings, frame: i },
      [],
      0.12,
      date,
    );
    hashes.add(cv.toDataURL());
  }
  assert.equal(hashes.size, frames.length);
  const papers = new Set();
  for (let i = 0; i < themes.length; i++) {
    const t = themes[i];
    const cv = await renderStrip(
      createCanvas(1, 1),
      photos.slice(0, 4),
      {
        ...defaultSettings,
        theme: i,
        background: t[1],
        border: t[2],
        text: t[3],
        accent: t[4],
      },
      [],
      0.12,
      date,
    );
    papers.add(cv.toDataURL());
  }
  assert.equal(papers.size, 12);
});
test('each original sticker appears at its exported position', async () => {
  const settings = {
    ...defaultSettings,
    count: 2,
    layout: 'postcard',
    date: false,
    branding: false,
    caption: '',
  };
  const baseline = await renderStrip(
    createCanvas(1, 1),
    photos.slice(0, 2),
    settings,
    [],
    0.12,
    date,
  );
  for (let i = 0; i < stickerNames.length; i++) {
    const cv = await renderStrip(
      createCanvas(1, 1),
      photos.slice(0, 2),
      settings,
      [{ id: 'test', kind: i, x: 0.5, y: 0.5, size: 0.3, rotation: 25 }],
      0.12,
      date,
    );
    assert.notEqual(cv.toDataURL(), baseline.toDataURL(), stickerNames[i]);
  }
});
test('high resolution PNG and JPG output preserves requested dimensions', async () => {
  const cv = await renderStrip(
    createCanvas(1, 1),
    photos.slice(0, 4),
    defaultSettings,
    [],
    1,
    date,
  );
  assert.equal(cv.width, 1200);
  assert.equal(cv.height, 3600);
  assert.ok(cv.toBuffer('image/png').length > 10000);
  assert.ok(cv.toBuffer('image/jpeg').length > 10000);
});

test('every frame stays aligned inside its photo window', () => {
  const rect = { x: 30, y: 25, w: 140, h: 100 };
  for (let frame = 0; frame < frames.length; frame++) {
    const cv = createCanvas(200, 150);
    const ctx = cv.getContext('2d');
    drawFrame(ctx, rect, frame, '#ffffff', '#ff0000');
    const pixels = ctx.getImageData(0, 0, 200, 150).data;
    for (let y = 0; y < 150; y++) {
      for (let x = 0; x < 200; x++) {
        if (
          x >= rect.x &&
          x < rect.x + rect.w &&
          y >= rect.y &&
          y < rect.y + rect.h
        )
          continue;
        assert.equal(
          pixels[(y * 200 + x) * 4 + 3],
          0,
          `${frames[frame]} escaped its photo window at ${x},${y}`,
        );
      }
    }
  }
});
