// FaceRep logo: the "barbell smile" (two eyes, and the smile is a barbell bending under its weight).
// One source for every brand file. Run from the repo root: `node brand/logo.mjs`
// Writes the SVG sources to brand/svg/ and the app PNGs to app/assets/brand/. See brand/README.md.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// sharp comes from store-screenshots (run `npm install` there once); no extra dependency for the app.
const sharp = createRequire(path.join(ROOT, 'store-screenshots/package.json'))('sharp');

const S = 1024;
const WHITE = '#FFFFFF';

const COLORS = {
  red: [['0', '#FF6A4D'], ['0.55', '#F0362F'], ['1', '#C81E22']],
  graphite: [['0', '#2A2E35'], ['1', '#0D0F12']],
  hot: [['0', '#FF8A3D'], ['0.55', '#FF4B45'], ['1', '#E5322D']],
};

const stops = (list) => list.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');

const svg = (body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">\n` +
  (defs ? `  <defs>${defs}</defs>\n` : '') + body + '\n</svg>\n';

/** The mark on a 1024 canvas, in one fill. */
function glyph(fill) {
  const plates = (flip) => `<g${flip ? ' transform="translate(1024 0) scale(-1 1)"' : ''}>
      <rect x="290" y="448" width="64" height="216" rx="24"/>
      <rect x="238" y="484" width="44" height="144" rx="18"/>
      <rect x="208" y="535" width="36" height="42" rx="10"/>
    </g>`;
  return `  <g fill="${fill}" transform="translate(512 504) scale(1.08) translate(-512 -512)">
    <circle cx="408" cy="368" r="60"/>
    <circle cx="616" cy="368" r="60"/>
    <path d="M 330 556 Q 512 748 694 556" fill="none" stroke="${fill}" stroke-width="52"/>
    ${plates(false)}
    ${plates(true)}
  </g>`;
}

const redBg = {
  defs: `<linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">${stops(COLORS.red)}</linearGradient>`,
  body: `  <rect width="${S}" height="${S}" fill="url(#bg)"/>`,
};
const graphiteBg = {
  defs: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">${stops(COLORS.graphite)}</linearGradient>`,
  body: `  <rect width="${S}" height="${S}" fill="url(#bg)"/>`,
};
const hotFill = `<linearGradient id="ink" gradientUnits="userSpaceOnUse" x1="220" y1="300" x2="804" y2="760">${stops(COLORS.hot)}</linearGradient>`;

export const SOURCES = {
  // App icon, light (default) appearance.
  'icon.svg': svg(`${redBg.body}\n${glyph(WHITE)}`, redBg.defs),
  // iOS dark appearance.
  'icon-dark.svg': svg(`${graphiteBg.body}\n${glyph('url(#ink)')}`, graphiteBg.defs + hotFill),
  // iOS tinted appearance: grayscale, the system adds the tint.
  'icon-tinted.svg': svg(`  <rect width="${S}" height="${S}" fill="#000000"/>\n${glyph(WHITE)}`),
  // Layers for Apple's Icon Composer (Liquid Glass): background and foreground.
  'layer-background.svg': svg(redBg.body, redBg.defs),
  'layer-glyph.svg': svg(glyph(WHITE)),
  // The mark alone in brand red, for light backgrounds (web pages, documents).
  'mark-red.svg': svg(glyph('#E5322D')),
};

/** iOS-like continuous-corner tile (superellipse), used for the splash and favicon. */
function squircle(size) {
  const r = size / 2, n = 5, pts = [];
  for (let i = 0; i < 360; i++) {
    const t = (i * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
    pts.push(`${(r + r * Math.sign(c) * Math.abs(c) ** (2 / n)).toFixed(2)},${(r + r * Math.sign(s) * Math.abs(s) ** (2 / n)).toFixed(2)}`);
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><polygon points="${pts.join(' ')}" fill="#fff"/></svg>`);
}

async function opaquePng(source, size, file) {
  await sharp(Buffer.from(source)).resize(size, size).flatten({ background: '#000000' }).removeAlpha()
    .png({ compressionLevel: 9 }).toFile(file);
}

async function tilePng(source, size, file) {
  const png = await sharp(Buffer.from(source)).resize(size, size).png().toBuffer();
  await sharp(png).composite([{ input: squircle(size), blend: 'dest-in' }]).png({ compressionLevel: 9 }).toFile(file);
}

const svgDir = path.join(ROOT, 'brand/svg');
const assets = path.join(ROOT, 'app/assets/brand');
fs.mkdirSync(svgDir, { recursive: true });
for (const [name, content] of Object.entries(SOURCES)) fs.writeFileSync(path.join(svgDir, name), content);

// App Store and home screen icons: 1024 × 1024, square, no transparency (iOS applies the mask).
await opaquePng(SOURCES['icon.svg'], S, path.join(assets, 'icon.png'));
await opaquePng(SOURCES['icon-dark.svg'], S, path.join(assets, 'icon-dark.png'));
await opaquePng(SOURCES['icon-tinted.svg'], S, path.join(assets, 'icon-tinted.png'));
// Splash (shown on light and dark backgrounds) and web favicon: the rounded tile.
await tilePng(SOURCES['icon.svg'], S, path.join(assets, 'splash-icon.png'));
await tilePng(SOURCES['icon.svg'], 48, path.join(assets, 'favicon.png'));

console.log('Wrote brand/svg/*.svg and app/assets/brand/{icon,icon-dark,icon-tinted,splash-icon,favicon}.png');
