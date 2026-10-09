// Writes ../app-store-screenshots.json: FaceRep's App Store deck (8 iPhone slides, six languages) for the editor.
// Run it once to (re)build the deck from copy.js; after that, fine-tune in the editor (npm run dev), which saves
// to the same file. Running this again replaces those edits.
// Coordinates are canvas pixels of one slide (1320 × 2868); x below 0 or above 1320 crosses into the next slide.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COPY, LANGS } from './copy.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ART = JSON.parse(fs.readFileSync(path.join(HERE, 'art-manifest.json'), 'utf8'));
const PHONE = 1022 / 2082; // mockup.png aspect
const MIRROR = process.env.MIRROR || 'both'; // who is in the camera mirror slide: woman, man or both (the owner picked both)

const text = (i, part) => Object.fromEntries(LANGS.map((l) => [l, COPY[l].slides[i][part]]));
const phone = (x, y, width, rotation = 0) => ({ x, y, width, height: Math.round(width / PHONE), rotation, zIndex: 3 });
const screen = (name) => `/screenshots/apple/iphone/{locale}/${name}.png`;
/** A picture from public/art at its drawn size × scale (per-language files use `{locale}`). */
function art(id, file, x, y, { scale = 1, rotation = 0, zIndex = 6 } = {}) {
  const size = ART[file.replace('{locale}', 'en')];
  return { id, src: `/art/${file}`, fit: 'contain', transform: { x, y, width: Math.round(size.w * scale), height: Math.round(size.h * scale), rotation, zIndex } };
}
const caption = { x: 96, y: 150, width: 1128, height: 760, rotation: 0, zIndex: 4 };

function slide(i, { layout = 'device-bottom', inverted = false, shot, shot2, device, device2, callout, calloutRect, images = [] }) {
  return {
    id: `facerep-${i + 1}`,
    layout,
    label: text(i, 0),
    headline: text(i, 1),
    screenshot: screen(shot),
    ...(shot2 ? { screenshotSecondary: screen(shot2) } : {}),
    ...(inverted ? { inverted: true } : {}),
    typography: { labelScale: 1.35, headlineScale: 1 },
    transforms: {
      caption,
      device,
      ...(device2 ? { deviceSecondary: device2 } : {}),
      ...(calloutRect ? { callout: calloutRect } : {}),
    },
    ...(callout ? { callout } : {}),
    ...(images.length ? { imageElements: images } : {}),
  };
}

const slides = [
  // 1 Hero: the workout player mid-squeeze, the timer ring lifted out.
  slide(0, {
    shot: 'workout', device: phone(260, 900, 1000, 3),
    callout: { focusX: 0.525, focusY: 0.9, zoom: 2.2, shape: 'circle' },
    calloutRect: { x: 20, y: 1960, width: 580, height: 580, rotation: 0, zIndex: 7 },
  }),
  // 2 The man's Jaw Clench page, the working muscle magnified.
  slide(1, {
    inverted: true, shot: 'exercise-man', device: phone(70, 900, 1000, -3),
    callout: { focusX: 0.645, focusY: 0.375, zoom: 2.3, shape: 'circle' },
    calloutRect: { x: 760, y: 1240, width: 540, height: 540, rotation: 0, zIndex: 7 },
  }),
  // 3 Today: the 28-day plan, Day 12 of 28; weeks 1–2 of the grid lifted out (cut per language by art.js).
  slide(2, {
    shot: 'today', device: phone(250, 900, 1000, 3),
    images: [art('grid', '{locale}/pop-grid.png', -10, 2400, { scale: 1, rotation: -3, zIndex: 7 })],
  }),
  // 4 Voice cues, as speech bubbles next to the player.
  slide(3, {
    inverted: true, shot: 'workout-man', device: phone(370, 1080, 930, 0),
    images: [
      art('voice-start', '{locale}/voice-start.png', 30, 850, { scale: 0.85 }),
      art('voice-hold', '{locale}/voice-hold.png', 10, 1600, { scale: 1.1, rotation: -4 }),
      art('voice-relax', '{locale}/voice-relax.png', 50, 2040, { scale: 1.1, rotation: 3 }),
    ],
  }),
  // 5 The camera mirror: the workout player with the front camera on (MIRROR=woman|man|both picks who).
  MIRROR === 'both'
    ? slide(4, {
      layout: 'two-devices', shot: 'workout-mirror', shot2: 'workout-mirror-man',
      // Her phone in front on the left, his behind on the right: both camera boxes (bottom right of each drawing) show.
      device: phone(-40, 1060, 860, -5), device2: { ...phone(470, 940, 840, 6), zIndex: 2 },
    })
    : slide(4, {
      shot: MIRROR === 'man' ? 'workout-mirror-man' : 'workout-mirror', device: phone(370, 900, 940, 3),
      images: [art('mirror', `{locale}/pop-mirror${MIRROR === 'man' ? '-man' : ''}.png`, -20, 1640, { scale: 0.95, rotation: -5, zIndex: 7 })],
    }),
  // 6 Men and women: "Who should the exercises show?" between the two portraits.
  slide(5, {
    inverted: true, shot: 'guide', device: phone(185, 1060, 950, 0),
    images: [
      art('man', 'portrait-man.png', 20, 820, { scale: 0.56, rotation: -6, zIndex: 6 }),
      art('woman', 'portrait-woman.png', 896, 820, { scale: 0.56, rotation: 6, zIndex: 6 }),
    ],
  }),
  // 7 Progress: the streak (lifted out of its card) and the month calendar.
  slide(6, {
    shot: 'progress', device: phone(70, 900, 1000, -3),
    images: [art('streak', '{locale}/streak.png', 540, 1160, { scale: 0.95, rotation: 5 })],
  }),
  // 8 The Coach: a technique answer and the reminder card it prepared, lifted out (cut per language by art.js).
  slide(7, {
    inverted: true, shot: 'coach', device: phone(250, 900, 1000, 3),
    images: [art('card', '{locale}/pop-card.png', -10, 1960, { scale: 1, rotation: -3, zIndex: 7 })],
  }),
];

const project = {
  schemaVersion: 2,
  appName: 'FaceRep',
  themeId: 'facerep',
  fontId: 'self-hosted',
  importedFont: { src: '/fonts/imported/anton.ttf', format: 'truetype', name: 'Anton' },
  connectedCanvas: true,
  locales: LANGS,
  locale: 'en',
  device: 'iphone',
  orientation: 'portrait',
  appIcon: '',
  scene: {
    backdrop: 'gradient', span: false, decoration: 'none', shadow: 70, glow: 0, tilt: 0,
    headlineWeight: 400, headlineScale: 1.7, headlineCase: 'upper', captionAlign: 'left',
  },
  slidesByDevice: { iphone: slides },
};

fs.writeFileSync(path.join(HERE, '../app-store-screenshots.json'), JSON.stringify(project, null, 2) + '\n');
console.log(`app-store-screenshots.json: ${slides.length} slides ×`, LANGS.join(', '));
