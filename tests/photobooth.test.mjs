import assert from 'node:assert/strict';
import test from 'node:test';
import { createCanvas, Image } from '@napi-rs/canvas';
import {
  geometry,
  layouts,
  defaultSettings,
  renderStrip,
  frames,
  themes,
  stickerNames,
  stickerURL,
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
test('all 12 frames and 12 paper styles render distinct output', async () => {
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
  assert.equal(hashes.size, 12);
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
