export type Count = 2 | 3 | 4 | 6;
export type Sticker = {
  id: string;
  kind: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
};
export type Settings = {
  count: Count;
  layout: string;
  theme: number;
  frame: number;
  background: string;
  border: string;
  text: string;
  accent: string;
  caption: string;
  date: boolean;
  branding: boolean;
  filter: string;
};
export const themes = [
  ['Classic White', '#fffdf8', '#ffffff', '#262222', '#b71f31'],
  ['Cherry Red', '#af2334', '#f8e8d0', '#fff4dc', '#f0bd70'],
  ['Cream Retro', '#f4e5c6', '#fffaeb', '#6f342c', '#b42b3a'],
  ['Black Film', '#171719', '#29292b', '#f8e6c5', '#e5a954'],
  ['Chrome', '#bbc0c5', '#eff3f5', '#30363b', '#8a2b3d'],
  ['Soft Pink', '#f6d1d9', '#fff3ed', '#86374b', '#cc5878'],
  ['Pastel Blue', '#cbe0ed', '#f1faff', '#344e71', '#d44b66'],
  ['Y2K Silver', '#dce0ed', '#f5f5ff', '#634d8b', '#b950ad'],
  ['Scrapbook', '#d4be96', '#fbefd8', '#644b32', '#a03737'],
  ['Vintage Film', '#d4b37e', '#332c25', '#423225', '#ad4937'],
  ['Minimal Monochrome', '#ecebe8', '#161616', '#111111', '#595959'],
  ['Checkerboard', '#f7e9d0', '#fffbef', '#a12537', '#a12537'],
];
export const frames = [
  'Thin white',
  'Cherry retro',
  'Film negative',
  'Polaroid',
  'Rounded cream',
  'Brushed chrome',
  'Y2K bubble',
  'Checkerboard',
  'Torn paper',
  'Photo corners',
  'Sweethearts',
  'Minimal black',
];
export const lights = [
  ['White', '#ffffff'],
  ['Warm white', '#ffebcb'],
  ['Soft yellow', '#fff4a6'],
  ['Pink', '#ffb4d8'],
  ['Red', '#ff5264'],
  ['Blue', '#91b8ff'],
  ['Purple', '#d3a7ff'],
  ['Cyan', '#9bffff'],
  ['Peach', '#ffc9aa'],
  ['Soft green', '#c5ffce'],
];
export const filters: Record<string, string> = {
  Natural: 'none',
  'Black & white': 'grayscale(1)',
  Warm: 'sepia(.25) saturate(1.15)',
  Cool: 'saturate(.85) hue-rotate(12deg)',
  Film: 'sepia(.3) contrast(1.12) saturate(.8)',
};
export const layouts: Record<Count, { id: string; name: string }[]> = {
  2: [
    { id: 'classic', name: 'Double portrait' },
    { id: 'postcard', name: 'Postcard' },
    { id: 'editorial', name: 'Editorial' },
  ],
  3: [
    { id: 'classic', name: 'The original' },
    { id: 'hero', name: 'One + two' },
    { id: 'squares', name: 'Square stories' },
  ],
  4: [
    { id: 'classic', name: 'Classic strip' },
    { id: 'grid', name: 'Four square' },
    { id: 'editorial', name: 'Mix & match' },
    { id: 'polaroid', name: 'Polaroid stack' },
  ],
  6: [
    { id: 'grid', name: 'Contact sheet' },
    { id: 'classic', name: 'Six little moments' },
    { id: 'hero', name: 'The cover story' },
  ],
};
export const defaultSettings: Settings = {
  count: 4,
  layout: 'classic',
  theme: 2,
  frame: 0,
  background: themes[2][1],
  border: themes[2][2],
  text: themes[2][3],
  accent: themes[2][4],
  caption: 'little moments, kept forever.',
  date: true,
  branding: true,
  filter: 'Natural',
};
export type Rect = { x: number; y: number; w: number; h: number };
export function geometry(
  count: Count,
  layout: string,
): { w: number; h: number; rects: Rect[]; footer: number } {
  let w = 1200,
    h = count === 6 ? 4800 : count === 4 ? 3600 : count === 3 ? 2900 : 2400;
  const gap = 42,
    p = 72;
  let rects: Rect[] = [];
  if (layout === 'postcard') {
    w = 3000;
    h = 2000;
    rects = Array.from({ length: 2 }, (_, i) => ({
      x: p + i * (w / 2 - p / 2),
      y: p,
      w: w / 2 - p * 1.5,
      h: 1570,
    }));
  } else if (layout === 'grid') {
    w = 2400;
    h = count === 6 ? 3200 : 2400;
    const rh = (h - 330 - gap * (count / 2 - 1) - p) / (count / 2);
    rects = Array.from({ length: count }, (_, i) => ({
      x: p + (i % 2) * ((w - 2 * p - gap) / 2 + gap),
      y: p + Math.floor(i / 2) * (rh + gap),
      w: (w - 2 * p - gap) / 2,
      h: rh,
    }));
  } else if (layout === 'hero') {
    w = 2400;
    h = count === 3 ? 2700 : 3300;
    const firstH = count === 3 ? 1450 : 1450;
    rects = [{ x: p, y: p, w: w - 2 * p, h: firstH }];
    const cols = count === 3 ? 2 : 3,
      rh =
        (h - firstH - p - 330 - gap * (count === 3 ? 1 : 2)) /
        (count === 3 ? 1 : 2);
    for (let i = 1; i < count; i++)
      rects.push({
        x: p + ((i - 1) % cols) * ((w - 2 * p - gap * (cols - 1)) / cols + gap),
        y: p + firstH + gap + Math.floor((i - 1) / cols) * (rh + gap),
        w: (w - 2 * p - gap * (cols - 1)) / cols,
        h: rh,
      });
  } else {
    if (layout === 'squares') h = 3650;
    if (layout === 'polaroid') h = 4800;
    const rowGap = layout === 'polaroid' ? 120 : gap;
    const available = h - 340 - p - rowGap * (count - 1);
    for (let i = 0; i < count; i++) {
      const weight = layout === 'editorial' ? (i % 2 === 0 ? 1.3 : 0.7) : 1;
      const rh = (available / count) * weight;
      rects.push({
        x: p + (layout === 'editorial' && i % 2 ? 180 : 0),
        y: i ? rects[i - 1].y + rects[i - 1].h + rowGap : p,
        w: w - 2 * p - (layout === 'editorial' && i % 2 ? 180 : 0),
        h: rh,
      });
    }
  }
  return { w, h, rects, footer: h - 230 };
}
const shape = (d: string, fill = '#bc2339', extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="#fff5df" stroke-width="5" stroke-linejoin="round" ${extra}/>`;
export const stickerNames = [
  'Sweet heart',
  'Little sparkle',
  'Happy days',
  'Cherry on top',
  'Tied with a bow',
  'Lucky star',
  'Sealed with a kiss',
  'Electric',
  'Disco night',
  'Say cheese',
  'xoxo',
  'cute!',
  'Daisy days',
  'Lucky clover',
  'Love note',
  'On fire',
];
const designs = [
  shape('M50 85C-5 54 10 10 35 23Q45 27 50 39Q55 27 65 23C90 10 105 54 50 85Z'),
  shape('M50 4Q52 42 90 50Q52 55 50 96Q44 55 8 50Q44 42 50 4Z', '#edb34e'),
  '<circle cx="50" cy="50" r="39" fill="#efbe55" stroke="#fff5df" stroke-width="5"/><path d="M29 58Q50 83 71 58M35 34v10m30-10v10" stroke="#713b36" stroke-width="5" fill="none" stroke-linecap="round"/>',
  '<path d="M34 63Q43 18 68 15Q59 43 67 65M68 15Q88 7 91 29Q74 29 68 15" stroke="#49764e" stroke-width="6" fill="#49764e"/><circle cx="30" cy="69" r="21" fill="#be2336" stroke="#fff5df" stroke-width="4"/><circle cx="70" cy="71" r="21" fill="#a9182d" stroke="#fff5df" stroke-width="4"/><path d="M19 64l5-7m37 11l5-7" stroke="#fcb8a8" stroke-width="4" stroke-linecap="round"/>',
  shape(
    'M48 42C9-4-3 39 24 58L44 50L27 84L48 74L53 55L76 86L88 79L63 49C110 69 99 0 57 40Z',
    '#d74357',
  ),
  shape(
    'M50 5L63 34L96 38L72 60L78 94L50 77L21 94L28 60L4 38L37 34Z',
    '#e9b34d',
  ),
  shape('M7 50Q29 24 48 38Q64 18 94 50Q72 88 47 73Q27 79 7 50Z') +
    '<path d="M13 50Q50 65 86 50" stroke="#ffccd0" stroke-width="4" fill="none"/>',
  shape('M59 3L17 57H43L34 97L86 39H58L70 3Z', '#e9b34d'),
  '<path d="M50 0v15" stroke="#8b7770" stroke-width="4"/><circle cx="50" cy="55" r="37" fill="#bbc9d1" stroke="#fff5df" stroke-width="5"/><path d="M18 39h64M14 56h72M22 73h57M50 18v74M35 21Q24 55 36 88M64 21Q77 55 64 88" fill="none" stroke="#707f98" stroke-width="3"/><path d="M74 11v17m-8-8h17" stroke="#edb34e" stroke-width="4"/>',
  '<rect x="9" y="27" width="82" height="59" rx="12" fill="#b62538" stroke="#fff5df" stroke-width="5"/><path d="M28 26l7-13h30l8 13" fill="#b62538" stroke="#fff5df" stroke-width="5"/><circle cx="50" cy="57" r="21" fill="#f4ddbe"/><circle cx="50" cy="57" r="13" fill="#433c3f"/><circle cx="78" cy="41" r="4" fill="#efb95c"/>',
  '<rect x="2" y="22" width="96" height="55" rx="23" fill="#b62538" stroke="#fff5df" stroke-width="4"/><text x="50" y="62" text-anchor="middle" fill="#fff5df" font-family="Georgia" font-style="italic" font-weight="bold" font-size="34">xoxo</text>',
  '<path d="M9 20L88 15L94 77L5 84Z" fill="#ecc15b" stroke="#fff5df" stroke-width="5"/><text x="50" y="62" text-anchor="middle" fill="#a12536" font-family="Georgia" font-style="italic" font-weight="bold" font-size="34">cute!</text>',
  '<g fill="#fff4df" stroke="#d4a480" stroke-width="2"><ellipse cx="50" cy="28" rx="14" ry="23"/><ellipse cx="50" cy="72" rx="14" ry="23"/><ellipse cx="28" cy="50" rx="23" ry="14"/><ellipse cx="72" cy="50" rx="23" ry="14"/></g><circle cx="50" cy="50" r="17" fill="#eab64e"/>',
  shape(
    'M50 49C7 28 20-2 42 14L50 27L59 14C85-2 95 30 53 49C98 30 102 67 78 73L57 60L69 81C45 103 22 82 44 56C16 80-5 53 15 41L40 48Z',
    '#618359',
  ),
  '<rect x="8" y="22" width="84" height="60" rx="5" fill="#fff0d0" stroke="#b82b3d" stroke-width="4"/><path d="M9 25l41 34 41-34M9 81l30-29m52 29L61 52" fill="none" stroke="#b82b3d" stroke-width="3"/>' +
    shape('M50 70C24 57 37 38 50 50C63 38 76 57 50 70Z'),
  shape(
    'M48 3C80 29 51 31 75 51L84 32C115 91 38 112 19 78C-2 49 34 34 30 15L42 40Q58 32 48 3Z',
    '#ce4e32',
  ) + '<path d="M52 51Q77 84 52 89Q29 86 52 51" fill="#efbf52"/>',
];
export function stickerSVG(index: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${designs[index % designs.length]}</svg>`;
}
export function stickerURL(index: number) {
  return 'data:image/svg+xml;base64,' + btoa(stickerSVG(index));
}
const imageCache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(src: string) {
  if (!imageCache.has(src))
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => {
          imageCache.delete(src);
          reject(
            new Error('That photo could not be opened. Please retake it.'),
          );
        };
        im.src = src;
      }),
    );
  return imageCache.get(src)!;
}
export function clearPhotoCache() {
  for (const key of imageCache.keys())
    if (key.startsWith('data:image/jpeg')) imageCache.delete(key);
}
function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  r: Rect,
  frame: number,
  border: string,
  accent: string,
) {
  const { x, y, w, h } = r;
  const t = Math.max(10, w * 0.035);
  ctx.save();
  ctx.strokeStyle = border;
  ctx.fillStyle = border;
  ctx.lineWidth = t;
  if (frame === 0) {
    ctx.strokeRect(x + t / 2, y + t / 2, w - t, h - t);
  }
  if (frame === 1) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = t * 2;
    ctx.strokeRect(x + t, y + t, w - t * 2, h - t * 2);
    ctx.strokeStyle = '#f5debc';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + t * 2, y + t * 2, w - t * 4, h - t * 4);
  }
  if (frame === 2) {
    ctx.fillStyle = '#18181a';
    ctx.fillRect(x, y, t * 2, h);
    ctx.fillRect(x + w - t * 2, y, t * 2, h);
    ctx.fillStyle = '#f5e7cb';
    for (let i = 0; i < h / t / 2; i++) {
      ctx.fillRect(x + t * 0.5, y + i * t * 2 + t * 0.4, t, t);
      ctx.fillRect(x + w - t * 1.5, y + i * t * 2 + t * 0.4, t, t);
    }
  }
  if (frame === 3) {
    ctx.lineWidth = t * 1.5;
    ctx.strokeRect(x + t * 0.75, y + t * 0.75, w - t * 1.5, h - t * 1.5);
    ctx.fillRect(x, y + h - t * 3, w, t * 3);
  }
  if (frame === 4 || frame === 6) {
    ctx.strokeStyle = frame === 4 ? border : '#efb8dd';
    ctx.lineWidth = t * 1.8;
    rounded(ctx, x + t, y + t, w - t * 2, h - t * 2, t * 2);
    ctx.stroke();
    if (frame === 6) {
      ctx.strokeStyle = '#fff3ff';
      ctx.lineWidth = t * 0.25;
      ctx.stroke();
    }
  }
  if (frame === 5) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#faffff');
    g.addColorStop(0.25, '#969ca4');
    g.addColorStop(0.48, '#ffffff');
    g.addColorStop(0.7, '#777d88');
    g.addColorStop(1, '#d3dde0');
    ctx.strokeStyle = g;
    ctx.lineWidth = t * 2;
    ctx.strokeRect(x + t, y + t, w - t * 2, h - t * 2);
  }
  if (frame === 7) {
    for (let i = 0; i < w / t; i++) {
      ctx.fillStyle = i % 2 ? accent : border;
      ctx.fillRect(x + i * t, y, t, t);
      ctx.fillRect(x + i * t, y + h - t, t, t);
    }
    for (let i = 1; i < h / t - 1; i++) {
      ctx.fillStyle = i % 2 ? accent : border;
      ctx.fillRect(x, y + i * t, t, t);
      ctx.fillRect(x + w - t, y + i * t, t, t);
    }
  }
  if (frame === 8) {
    ctx.lineWidth = t;
    ctx.strokeRect(x + t / 2, y + t / 2, w - t, h - t);
    for (let i = 0; i < w / t; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * t, y);
      ctx.lineTo(x + i * t + t * 0.5, y + t * 1.4);
      ctx.lineTo(x + i * t + t, y);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + i * t, y + h);
      ctx.lineTo(x + i * t + t * 0.5, y + h - t * 1.4);
      ctx.lineTo(x + i * t + t, y + h);
      ctx.fill();
    }
  }
  if (frame === 9) {
    ctx.fillStyle = accent;
    [
      [x, y, 1, 1],
      [x + w, y, -1, 1],
      [x, y + h, 1, -1],
      [x + w, y + h, -1, -1],
    ].forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx * t * 3, cy);
      ctx.lineTo(cx, cy + dy * t * 3);
      ctx.fill();
    });
  }
  if (frame === 10) {
    ctx.strokeStyle = border;
    ctx.strokeRect(x + t / 2, y + t / 2, w - t, h - t);
    ctx.fillStyle = accent;
    ctx.font = `${t * 3}px Georgia`;
    ctx.textAlign = 'center';
    ctx.fillText('♥', x + t * 1.5, y + t * 2.7);
    ctx.fillText('♥', x + w - t * 1.5, y + h - t * 0.2);
  }
  if (frame === 11) {
    ctx.strokeStyle = '#161616';
    ctx.lineWidth = t * 0.6;
    ctx.strokeRect(x + t * 0.3, y + t * 0.3, w - t * 0.6, h - t * 0.6);
  }
  ctx.restore();
}
export async function renderStrip(
  canvas: HTMLCanvasElement,
  photos: string[],
  settings: Settings,
  stickers: Sticker[],
  scale = 1,
  sessionDate = new Date(),
) {
  const g = geometry(settings.count, settings.layout);
  canvas.width = Math.round(g.w * scale);
  canvas.height = Math.round(g.h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx)
    throw new Error(
      'Your browser could not prepare the print. Please try again.',
    );
  ctx.scale(scale, scale);
  ctx.fillStyle = settings.background;
  ctx.fillRect(0, 0, g.w, g.h);
  if (settings.theme === 4 || settings.theme === 7) {
    const grad = ctx.createLinearGradient(0, 0, g.w, g.h);
    grad.addColorStop(0, '#ffffff66');
    grad.addColorStop(0.35, '#ffffff00');
    grad.addColorStop(0.6, '#ffffff77');
    grad.addColorStop(1, '#ffffff00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, g.w, g.h);
  }
  if (settings.theme === 11) {
    const t = 48;
    ctx.fillStyle = settings.accent;
    for (let x = 0; x < g.w; x += t)
      for (let y = 0; y < g.h; y += t)
        if ((x / t + y / t) % 2 === 0) ctx.fillRect(x, y, t, t);
    ctx.fillStyle = settings.background;
    ctx.fillRect(34, 34, g.w - 68, g.h - 68);
  }
  if (settings.theme === 8 || settings.theme === 9) {
    ctx.fillStyle = '#60401b0a';
    for (let i = 0; i < 5500; i++) {
      const x = (i * 719) % g.w,
        y = (i * 317) % g.h;
      ctx.fillRect(x, y, 2 + (i % 3), 2);
    }
  }
  const images = await Promise.all(
    photos.map((p) => (p ? loadImage(p) : Promise.resolve(null))),
  );
  g.rects.forEach((r, i) => {
    ctx.save();
    rounded(
      ctx,
      r.x,
      r.y,
      r.w,
      r.h,
      settings.frame === 4 || settings.frame === 6 ? 40 : 0,
    );
    ctx.clip();
    ctx.fillStyle = '#d8cbb7';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    const img = images[i];
    if (img) {
      const ratio = Math.max(r.w / img.width, r.h / img.height);
      ctx.drawImage(
        img,
        r.x + (r.w - img.width * ratio) / 2,
        r.y + (r.h - img.height * ratio) / 2,
        img.width * ratio,
        img.height * ratio,
      );
    } else {
      ctx.fillStyle = '#b2a18b';
      ctx.textAlign = 'center';
      ctx.font = `${r.w * 0.13}px Georgia`;
      ctx.fillText(
        String(i + 1).padStart(2, '0'),
        r.x + r.w / 2,
        r.y + r.h / 2,
      );
      ctx.font = `${r.w * 0.035}px monospace`;
      ctx.fillText(
        'A MOMENT TO COME',
        r.x + r.w / 2,
        r.y + r.h / 2 + r.w * 0.07,
      );
    }
    ctx.restore();
    drawFrame(ctx, r, settings.frame, settings.border, settings.accent);
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = settings.text;
  let fy = g.footer;
  if (settings.branding) {
    ctx.font = `900 ${g.w * 0.049}px Arial`;
    ctx.fillText('SNAPSULE', g.w / 2, fy);
    fy += g.w * 0.042;
  }
  if (settings.caption) {
    ctx.font = `italic ${Math.min(42, g.w * 0.03)}px Georgia`;
    ctx.fillText(settings.caption, g.w / 2, fy, g.w - 100);
    fy += 56;
  }
  if (settings.date) {
    ctx.font = `${Math.min(27, g.w * 0.023)}px monospace`;
    ctx.fillText(
      sessionDate
        .toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
        .toUpperCase(),
      g.w / 2,
      fy,
    );
  }
  for (const s of stickers) {
    const img = await loadImage(stickerURL(s.kind));
    ctx.save();
    ctx.translate(s.x * g.w, s.y * g.h);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      (-s.size * g.w) / 2,
      (-s.size * g.w) / 2,
      s.size * g.w,
      s.size * g.w,
    );
    ctx.restore();
  }
  return canvas;
}
