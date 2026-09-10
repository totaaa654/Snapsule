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
  'Daisy chain',
  'Star confetti',
  'Wavy ribbon',
  'Neon glow',
  'Scalloped candy',
  'Postage stamp',
  'Kitty corners',
  'Bunny love',
  'Analog deluxe',
  'Puppy days',
  'Red scrapbook',
  'Cherry picnic',
  'Teddy notes',
  'Disco stars',
  'Floral diary',
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
  'Golden hour': 'sepia(.22) saturate(1.3) brightness(1.07)',
  'Rose tint': 'sepia(.12) saturate(1.2) hue-rotate(325deg) brightness(1.04)',
  Dreamy: 'brightness(1.08) contrast(.9) saturate(.88)',
  Punchy: 'contrast(1.22) saturate(1.18)',
  Fade: 'brightness(1.08) contrast(.84) saturate(.72)',
  Sepia: 'sepia(.72) contrast(1.05)',
  'Night flash': 'brightness(1.08) contrast(1.2) saturate(.7)',
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
function frameCornerRadius(frame: number, width: number) {
  if (frame === 4) return Math.min(42, width * 0.075);
  if (frame === 6) return Math.min(58, width * 0.1);
  return 0;
}
function roundedBand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  inset: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.roundRect(
    x + inset,
    y + inset,
    w - inset * 2,
    h - inset * 2,
    Math.max(4, radius - inset * 0.45),
  );
  ctx.fill('evenodd');
}
function star(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
function heart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.75);
  ctx.bezierCurveTo(
    cx - size * 1.25,
    cy,
    cx - size * 0.75,
    cy - size,
    cx,
    cy - size * 0.35,
  );
  ctx.bezierCurveTo(
    cx + size * 0.75,
    cy - size,
    cx + size * 1.25,
    cy,
    cx,
    cy + size * 0.75,
  );
  ctx.closePath();
}
function paw(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.2, size * 0.58, size * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [dx, dy] of [
    [-0.58, -0.48],
    [-0.18, -0.72],
    [0.25, -0.7],
    [0.62, -0.38],
  ]) {
    ctx.beginPath();
    ctx.arc(cx + dx * size, cy + dy * size, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
}
function flower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  petals: string,
  center: string,
) {
  ctx.fillStyle = petals;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(angle) * size * 0.52,
      cy + Math.sin(angle) * size * 0.52,
      size * 0.42,
      size * 0.24,
      angle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = center;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
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
  // Keep each treatment inside the same bounds used by the live preview.
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
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
    const radius = frameCornerRadius(frame, w);
    const inset = frame === 4 ? t * 1.55 : t * 1.8;
    ctx.fillStyle = frame === 4 ? border : '#efb8dd';
    roundedBand(ctx, x, y, w, h, radius, inset);
    if (frame === 6) {
      ctx.strokeStyle = '#fff3ff';
      ctx.lineWidth = t * 0.22;
      rounded(
        ctx,
        x + inset,
        y + inset,
        w - inset * 2,
        h - inset * 2,
        Math.max(4, radius - inset * 0.45),
      );
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
    ctx.fillText('♥', x + t * 1.8, y + t * 2.8);
    ctx.fillText('♥', x + w - t * 1.8, y + h - t * 0.8);
  }
  if (frame === 11) {
    ctx.strokeStyle = '#161616';
    ctx.lineWidth = t * 0.6;
    ctx.strokeRect(x + t * 0.3, y + t * 0.3, w - t * 0.6, h - t * 0.6);
  }
  if (frame === 12) {
    ctx.strokeStyle = '#f7e7c2';
    ctx.lineWidth = t * 1.5;
    ctx.strokeRect(x + t * 0.75, y + t * 0.75, w - t * 1.5, h - t * 1.5);
    const flowers = Math.max(4, Math.floor(w / (t * 3.4)));
    for (let i = 0; i <= flowers; i++) {
      const px = x + t + ((w - t * 2) * i) / flowers;
      for (const py of [y + t * 0.8, y + h - t * 0.8]) {
        ctx.fillStyle = i % 2 ? '#fff6dc' : '#f2c8d8';
        for (let petal = 0; petal < 5; petal++) {
          const angle = (petal * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(
            px + Math.cos(angle) * t * 0.36,
            py + Math.sin(angle) * t * 0.36,
            t * 0.24,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.fillStyle = '#e4a83e';
        ctx.beginPath();
        ctx.arc(px, py, t * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  if (frame === 13) {
    ctx.strokeStyle = '#7454a8';
    ctx.lineWidth = t * 1.3;
    ctx.strokeRect(x + t * 0.65, y + t * 0.65, w - t * 1.3, h - t * 1.3);
    const points = [
      [x + t * 1.2, y + t * 1.2],
      [x + w - t * 1.2, y + t * 1.2],
      [x + t * 1.2, y + h - t * 1.2],
      [x + w - t * 1.2, y + h - t * 1.2],
    ];
    points.forEach(([px, py], i) => {
      ctx.fillStyle = i % 2 ? '#f6c54d' : '#f4a7d2';
      star(ctx, px, py, t * 0.9, t * 0.4);
      ctx.fill();
    });
  }
  if (frame === 14) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = t * 0.55;
    ctx.lineCap = 'round';
    const step = t * 1.3;
    for (const edgeY of [y + t * 0.45, y + h - t * 0.45]) {
      for (let offset = 0; offset < w; offset += step) {
        ctx.beginPath();
        ctx.moveTo(x + offset, edgeY);
        ctx.quadraticCurveTo(
          x + offset + step * 0.25,
          edgeY + t * 0.55,
          x + offset + step * 0.5,
          edgeY,
        );
        ctx.quadraticCurveTo(
          x + offset + step * 0.75,
          edgeY - t * 0.55,
          x + offset + step,
          edgeY,
        );
        ctx.stroke();
      }
    }
    ctx.strokeRect(x + t * 0.8, y + t * 0.8, w - t * 1.6, h - t * 1.6);
  }
  if (frame === 15) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = t * 0.5;
    ctx.shadowColor = accent;
    ctx.shadowBlur = t * 1.4;
    ctx.strokeRect(x + t, y + t, w - t * 2, h - t * 2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff4fa';
    ctx.lineWidth = t * 0.13;
    ctx.strokeRect(x + t, y + t, w - t * 2, h - t * 2);
  }
  if (frame === 16) {
    ctx.fillStyle = '#f3b9cf';
    const radius = t * 0.72;
    for (let px = x + radius; px < x + w; px += radius * 1.65) {
      ctx.beginPath();
      ctx.arc(px, y + radius * 0.35, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, y + h - radius * 0.35, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let py = y + radius; py < y + h; py += radius * 1.65) {
      ctx.beginPath();
      ctx.arc(x + radius * 0.35, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + w - radius * 0.35, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (frame === 17) {
    ctx.strokeStyle = '#f7e9ce';
    ctx.lineWidth = t * 1.6;
    ctx.setLineDash([t * 0.7, t * 0.48]);
    ctx.strokeRect(x + t * 0.8, y + t * 0.8, w - t * 1.6, h - t * 1.6);
    ctx.setLineDash([]);
    ctx.strokeStyle = '#9b3041';
    ctx.lineWidth = t * 0.18;
    ctx.strokeRect(x + t * 1.65, y + t * 1.65, w - t * 3.3, h - t * 3.3);
  }
  if (frame === 18) {
    ctx.strokeStyle = '#f8ead2';
    ctx.lineWidth = t * 1.65;
    ctx.strokeRect(x + t * 0.82, y + t * 0.82, w - t * 1.64, h - t * 1.64);
    const cx = x + t * 1.35;
    const cy = y + t * 1.2;
    ctx.fillStyle = '#b98568';
    ctx.beginPath();
    ctx.moveTo(cx - t, cy - t * 0.35);
    ctx.lineTo(cx - t * 0.7, cy - t * 1.25);
    ctx.lineTo(cx - t * 0.1, cy - t * 0.62);
    ctx.lineTo(cx + t * 0.65, cy - t * 1.25);
    ctx.lineTo(cx + t, cy - t * 0.25);
    ctx.arc(cx, cy, t, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#2d1b1a';
    ctx.beginPath();
    ctx.arc(cx - t * 0.35, cy, t * 0.1, 0, Math.PI * 2);
    ctx.arc(cx + t * 0.35, cy, t * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    paw(ctx, x + w - t * 1.4, y + h - t * 1.2, t * 0.62);
  }
  if (frame === 19) {
    ctx.strokeStyle = '#f2b8d0';
    ctx.lineWidth = t * 1.8;
    ctx.strokeRect(x + t * 0.9, y + t * 0.9, w - t * 1.8, h - t * 1.8);
    const bx = x + t * 1.45;
    const by = y + t * 1.2;
    ctx.fillStyle = '#fff1dc';
    ctx.beginPath();
    ctx.ellipse(
      bx - t * 0.32,
      by - t * 0.72,
      t * 0.3,
      t,
      -0.18,
      0,
      Math.PI * 2,
    );
    ctx.ellipse(bx + t * 0.32, by - t * 0.72, t * 0.3, t, 0.18, 0, Math.PI * 2);
    ctx.arc(bx, by, t * 0.82, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d985a8';
    ctx.beginPath();
    ctx.arc(bx, by + t * 0.18, t * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d84b72';
    heart(ctx, x + w - t * 1.35, y + h - t * 1.3, t * 0.8);
    ctx.fill();
  }
  if (frame === 20) {
    ctx.fillStyle = '#121214';
    ctx.fillRect(x, y, w, t * 1.8);
    ctx.fillRect(x, y + h - t * 1.8, w, t * 1.8);
    ctx.fillRect(x, y, t * 1.3, h);
    ctx.fillRect(x + w - t * 1.3, y, t * 1.3, h);
    ctx.fillStyle = '#d3aa6a';
    for (let px = x + t * 0.65; px < x + w; px += t * 1.75) {
      ctx.fillRect(px, y + t * 0.35, t * 0.75, t * 0.72);
      ctx.fillRect(px, y + h - t * 1.07, t * 0.75, t * 0.72);
    }
    ctx.strokeStyle = '#c18f4e';
    ctx.lineWidth = t * 0.16;
    ctx.strokeRect(x + t * 1.55, y + t * 2, w - t * 3.1, h - t * 4);
  }
  if (frame === 21) {
    ctx.strokeStyle = '#fff0d8';
    ctx.lineWidth = t * 1.8;
    ctx.strokeRect(x + t * 0.9, y + t * 0.9, w - t * 1.8, h - t * 1.8);
    ctx.fillStyle = '#a8313e';
    paw(ctx, x + t * 1.25, y + t * 1.2, t * 0.62);
    paw(ctx, x + w - t * 1.3, y + h - t * 1.15, t * 0.62);
    ctx.fillStyle = '#d9aa77';
    ctx.beginPath();
    ctx.arc(x + w - t * 2.2, y + t * 1.1, t * 0.38, 0, Math.PI * 2);
    ctx.arc(x + w - t * 0.95, y + t * 1.1, t * 0.38, 0, Math.PI * 2);
    ctx.fillRect(x + w - t * 2.2, y + t * 0.72, t * 1.25, t * 0.76);
    ctx.fill();
  }
  if (frame === 22) {
    const cell = t * 0.9;
    for (let i = 0; i < Math.ceil(w / cell); i++) {
      ctx.fillStyle = i % 2 ? '#f6e5c8' : '#b62b38';
      ctx.fillRect(x + i * cell, y, cell, t * 1.45);
      ctx.fillRect(x + i * cell, y + h - t * 1.45, cell, t * 1.45);
    }
    for (let i = 1; i < Math.ceil(h / cell) - 1; i++) {
      ctx.fillStyle = i % 2 ? '#b62b38' : '#f6e5c8';
      ctx.fillRect(x, y + i * cell, t * 1.45, cell);
      ctx.fillRect(x + w - t * 1.45, y + i * cell, t * 1.45, cell);
    }
    ctx.fillStyle = '#e3c398';
    ctx.save();
    ctx.translate(x + t * 1.15, y + t * 1.1);
    ctx.rotate(-0.28);
    ctx.fillRect(-t * 0.8, -t * 0.28, t * 1.6, t * 0.56);
    ctx.restore();
  }
  if (frame === 23) {
    ctx.strokeStyle = '#f7ead0';
    ctx.lineWidth = t * 1.45;
    ctx.strokeRect(x + t * 0.72, y + t * 0.72, w - t * 1.44, h - t * 1.44);
    for (const [cx, cy, flip] of [
      [x + t * 1.2, y + t * 1.35, 1],
      [x + w - t * 1.3, y + h - t * 1.35, -1],
    ]) {
      ctx.strokeStyle = '#426242';
      ctx.lineWidth = t * 0.13;
      ctx.beginPath();
      ctx.moveTo(cx, cy - t * 0.2);
      ctx.quadraticCurveTo(
        cx + flip * t * 0.35,
        cy - t,
        cx + flip * t * 0.75,
        cy - t * 1.15,
      );
      ctx.stroke();
      ctx.fillStyle = '#bb2638';
      ctx.beginPath();
      ctx.arc(cx - t * 0.28, cy + t * 0.22, t * 0.46, 0, Math.PI * 2);
      ctx.arc(cx + t * 0.42, cy + t * 0.25, t * 0.46, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (frame === 24) {
    ctx.strokeStyle = '#d4a779';
    ctx.lineWidth = t * 1.55;
    ctx.setLineDash([t * 0.28, t * 0.22]);
    ctx.strokeRect(x + t * 0.78, y + t * 0.78, w - t * 1.56, h - t * 1.56);
    ctx.setLineDash([]);
    const tx = x + w - t * 1.25;
    const ty = y + h - t * 1.25;
    ctx.fillStyle = '#9b653f';
    ctx.beginPath();
    ctx.arc(tx - t * 0.58, ty - t * 0.56, t * 0.42, 0, Math.PI * 2);
    ctx.arc(tx + t * 0.58, ty - t * 0.56, t * 0.42, 0, Math.PI * 2);
    ctx.arc(tx, ty, t * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0b98d';
    ctx.beginPath();
    ctx.ellipse(tx, ty + t * 0.22, t * 0.42, t * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (frame === 25) {
    const chrome = ctx.createLinearGradient(x, y, x + w, y + h);
    chrome.addColorStop(0, '#f7f5ed');
    chrome.addColorStop(0.35, '#8d94a1');
    chrome.addColorStop(0.7, '#f0c4dc');
    chrome.addColorStop(1, '#6d7480');
    ctx.strokeStyle = chrome;
    ctx.lineWidth = t * 1.5;
    ctx.strokeRect(x + t * 0.75, y + t * 0.75, w - t * 1.5, h - t * 1.5);
    for (const [sx, sy, size] of [
      [x + t, y + t, t * 0.9],
      [x + w - t, y + h - t, t * 1.05],
      [x + w - t * 1.1, y + t * 1.1, t * 0.55],
    ]) {
      ctx.fillStyle = '#fff6da';
      star(ctx, sx, sy, size, size * 0.28);
      ctx.fill();
    }
  }
  if (frame === 26) {
    ctx.strokeStyle = '#53704f';
    ctx.lineWidth = t * 1.25;
    ctx.strokeRect(x + t * 0.62, y + t * 0.62, w - t * 1.24, h - t * 1.24);
    flower(ctx, x + t * 1.1, y + t * 1.1, t * 0.8, '#f4c5d3', '#d79b35');
    flower(
      ctx,
      x + w - t * 1.1,
      y + h - t * 1.1,
      t * 0.8,
      '#fff0d2',
      '#c78f30',
    );
    ctx.fillStyle = '#6b8a61';
    ctx.beginPath();
    ctx.ellipse(
      x + t * 2.1,
      y + t * 0.75,
      t * 0.7,
      t * 0.28,
      -0.45,
      0,
      Math.PI * 2,
    );
    ctx.ellipse(
      x + w - t * 2.1,
      y + h - t * 0.75,
      t * 0.7,
      t * 0.28,
      -0.45,
      0,
      Math.PI * 2,
    );
    ctx.fill();
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
    rounded(ctx, r.x, r.y, r.w, r.h, frameCornerRadius(settings.frame, r.w));
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
