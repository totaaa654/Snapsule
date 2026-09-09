import { mkdirSync, writeFileSync } from 'node:fs';
import { stickerSVG, stickerNames } from '../lib/photobooth.ts';
mkdirSync('public/assets/stickers', { recursive: true });
stickerNames.forEach((name, i) =>
  writeFileSync(
    `public/assets/stickers/${String(i + 1).padStart(2, '0')}-${name.toLowerCase().replaceAll(' ', '-').replaceAll('!', '')}.svg`,
    stickerSVG(i),
  ),
);
