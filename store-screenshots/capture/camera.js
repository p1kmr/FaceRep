// Stand-in camera pictures for the iOS Simulator, which has no camera, cut from the app's own welcome picture
// (app/assets/brand/welcome.webp: the app's AI-generated man and woman, both looking at the camera). The Simulator
// capture copies them into the app's Documents/SimulatorCamera/ (docs/screenshots.md §4), where only a Simulator build
// looks for them (services/faceTracking.ts simulatorCamera):
//   scan.jpg          the face scan's full screen (1320 × 2868), his face filling the oval as on an iPhone;
//   mirror-woman.jpg  the workout mirror's front camera (3:4), her face;
//   mirror-man.jpg    the same, his face.
// Usage: node camera.js → raw/camera/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(HERE, '../../app/assets/brand/welcome.webp');
const OUT = path.join(HERE, 'raw/camera');
/** The picture's dark studio background, for the space added above his head. */
const DARK = { r: 9, g: 9, b: 9 };

// His face in the source (762 × 1355): hairline y 165, chin y 460, centre x 552. The scan's oval (FaceGuide.tsx) is
// 72% of the screen's width, 1.32 times as tall, centred 40% down: 950 × 1254 px around (660, 1147) on a 1320 × 2868
// screen. At 2.9× his face is 667 px wide and 855 px tall, its centre a little below the oval's.
const SCAN = { scale: 2.9, faceX: 552, faceY: 312, toX: 660, toY: 1177, width: 1320, height: 2868 };
// Hers stops at x 335 and his starts at x 390: each mirror crop shows one face, 3:4, eyes about 40% down.
const MIRRORS = {
  'mirror-woman': { left: 30, top: 158 },
  'mirror-man': { left: 372, top: 88 },
};
const MIRROR = { width: 360, height: 480, outWidth: 720, outHeight: 960 };

async function scan() {
  const { scale, faceX, faceY, toX, toY, width, height } = SCAN;
  const left = Math.round(faceX - toX / scale);
  const top = Math.round(faceY - toY / scale);
  const w = Math.round(width / scale);
  const h = Math.round(height / scale);
  const pad = { top: Math.max(0, -top), right: Math.max(0, left + w - 762) };
  const fill = `rgb(${DARK.r},${DARK.g},${DARK.b})`;
  // Her hair and shoulder reach x 335 and his hair starts at x 395: a dark band with a soft edge hides her.
  const band = Buffer.from(
    `<svg width="${762 + pad.right}" height="${1355 + pad.top}"><defs><linearGradient id="g" x1="0" x2="1">` +
      `<stop offset="0" stop-color="${fill}" stop-opacity="1"/><stop offset="1" stop-color="${fill}" stop-opacity="0"/>` +
      `</linearGradient></defs><rect x="0" y="0" width="365" height="${1355 + pad.top}" fill="${fill}"/>` +
      `<rect x="365" y="0" width="27" height="${1355 + pad.top}" fill="url(#g)"/></svg>`,
  );
  const extended = await sharp(SOURCE)
    .extend({ top: pad.top, right: pad.right, background: DARK })
    .composite([{ input: band, top: 0, left: 0 }])
    .toBuffer();
  await sharp(extended)
    .extract({ left, top: top + pad.top, width: w, height: h })
    .resize(width, height, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8 })
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT, 'scan.jpg'));
}

async function mirror(name, { left, top }) {
  await sharp(SOURCE)
    .extract({ left, top, width: MIRROR.width, height: MIRROR.height })
    .resize(MIRROR.outWidth, MIRROR.outHeight, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 90 })
    .toFile(path.join(OUT, `${name}.jpg`));
}

fs.mkdirSync(OUT, { recursive: true });
await scan();
for (const [name, crop] of Object.entries(MIRRORS)) await mirror(name, crop);
console.log(`raw/camera: scan.jpg, ${Object.keys(MIRRORS).map((n) => `${n}.jpg`).join(', ')}`);
