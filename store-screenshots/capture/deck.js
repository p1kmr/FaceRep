// Writes ../app-store-screenshots.json: FaceRep's App Store deck (9 iPhone slides, six languages) for the editor.
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

// The phone frame's screen hole (mockup.js): 918 px wide at (52, 46) in the 1022 px frame, for a 440 pt wide screen.
const HOLE = { x: 52, y: 46, perPoint: 918 / 440 };
/**
 * A card cut from a phone's screen (art.js), laid back over the place it came from, `pop` times bigger, so it looks
 * lifted out of the screen. `region` is its box on the screen in points (sim/en/regions.json): use it only for cards
 * that sit in the same place in every language.
 */
function lifted(id, file, device, region, { pop = 1.12, tilt = 0, zIndex = 7 } = {}) {
  const k = device.width / 1022;
  const [rx, ry, rw, rh] = region;
  // The card's centre on the canvas, turned with the phone about the phone's centre.
  const px = device.x + (HOLE.x + (rx + rw / 2) * HOLE.perPoint) * k;
  const py = device.y + (HOLE.y + (ry + rh / 2) * HOLE.perPoint) * k;
  const ox = device.x + device.width / 2;
  const oy = device.y + device.height / 2;
  const a = (device.rotation * Math.PI) / 180;
  const cx = ox + (px - ox) * Math.cos(a) - (py - oy) * Math.sin(a);
  const cy = oy + (px - ox) * Math.sin(a) + (py - oy) * Math.cos(a);
  // art.js draws a card 2.3 px per point with 40 px of room for its shadow on each side.
  const size = ART[file.replace('{locale}', 'en')];
  const scale = (rw * HOLE.perPoint * k * pop) / (rw * 2.3);
  const w = Math.round(size.w * scale);
  const h = Math.round(size.h * scale);
  const card = { w: (size.w - 80) * scale, h: (size.h - 80) * scale };
  return {
    id, src: `/art/${file}`, fit: 'contain',
    transform: { x: Math.round(cx - card.w / 2 - 40 * scale), y: Math.round(cy - card.h / 2 - 40 * scale), width: w, height: h, rotation: device.rotation + tilt, zIndex },
  };
}

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

const PROGRESS = phone(150, 900, 1000, -3);
const COACH = phone(250, 900, 1000, 3);

const slides = [
  // 1 Hero: the workout player mid-squeeze (Cheek Lift, a free exercise), the timer ring lifted out.
  slide(0, {
    shot: 'workout', device: phone(260, 900, 1000, 3),
    callout: { focusX: 0.523, focusY: 0.872, zoom: 2.2, shape: 'circle' },
    calloutRect: { x: 20, y: 1960, width: 580, height: 580, rotation: 0, zIndex: 7 },
  }),
  // 2 The man's Chin Lift page (free), the working muscle magnified.
  slide(1, {
    inverted: true, shot: 'exercise-man', device: phone(70, 900, 1000, -3),
    callout: { focusX: 0.5, focusY: 0.4, zoom: 2.3, shape: 'circle' },
    calloutRect: { x: 760, y: 1240, width: 540, height: 540, rotation: 0, zIndex: 7 },
  }),
  // 3 The face scan, then what it gives (Scan. Measure. Compare.): his face in the oval while it's measured, and the
  // results' two rings with the change since the last scan rising under his chin like the results sheet, off the
  // bottom of the slide (art.js makes it long enough); the scan's privacy line as a chip over the screen's top buttons.
  slide(2, {
    shot: 'scan', device: phone(150, 930, 1040, 3),
    images: [
      art('rings', '{locale}/pop-rings.png', 49, 2122, { scale: 1.2, rotation: -3, zIndex: 7 }),
      art('private', '{locale}/scan-private.png', 100, 1057, { scale: 0.8, rotation: -1, zIndex: 8 }),
    ],
  }),
  // 4 Progress: the streak and the face scan chart, the chart lifted out of the screen.
  slide(3, {
    inverted: true, shot: 'progress', device: PROGRESS,
    images: [lifted('chart', '{locale}/pop-chart.png', PROGRESS, [17, 418, 406, 278], { pop: 1.14, tilt: 2 })],
  }),
  // 5 Today: today's workout on a free day, and the face scan card under it.
  slide(4, {
    shot: 'today', device: phone(250, 900, 1000, 3),
  }),
  // 6 Voice cues, as speech bubbles next to the player (the man's Brow Lift).
  slide(5, {
    inverted: true, shot: 'workout-man', device: phone(370, 1080, 930, 0),
    images: [
      art('voice-start', '{locale}/voice-start.png', 30, 850, { scale: 0.85 }),
      art('voice-hold', '{locale}/voice-hold.png', 10, 1600, { scale: 1.1, rotation: -4 }),
      art('voice-relax', '{locale}/voice-relax.png', 50, 2040, { scale: 1.1, rotation: 3 }),
    ],
  }),
  // 7 The camera mirror: the workout player with the front camera on (MIRROR=woman|man|both picks who).
  MIRROR === 'both'
    ? slide(6, {
      layout: 'two-devices', shot: 'workout-mirror', shot2: 'workout-mirror-man',
      // Her phone in front on the left, his behind on the right: both camera tiles (bottom right of each figure) show.
      device: phone(-40, 1060, 860, -5), device2: { ...phone(470, 940, 840, 6), zIndex: 2 },
    })
    : slide(6, {
      shot: MIRROR === 'man' ? 'workout-mirror-man' : 'workout-mirror', device: phone(370, 900, 940, 3),
      images: [art('mirror', `{locale}/pop-mirror${MIRROR === 'man' ? '-man' : ''}.png`, -20, 1640, { scale: 0.95, rotation: -5, zIndex: 7 })],
    }),
  // 8 Men and women: "Who should the exercises show?" between the two portraits.
  slide(7, {
    inverted: true, shot: 'guide', device: phone(185, 1060, 950, 0),
    images: [
      art('man', 'portrait-man.png', 20, 820, { scale: 0.56, rotation: -6, zIndex: 6 }),
      art('woman', 'portrait-woman.png', 896, 820, { scale: 0.56, rotation: 6, zIndex: 6 }),
    ],
  }),
  // 9 The Coach: a routine and a reminder it prepared (the real Coach, sim-capture.js); the reminder card lifted out of
  // the screen. Its place differs by up to 16 pt between languages (597–613): the 16% bigger card covers it in each.
  slide(8, {
    shot: 'coach', device: COACH,
    images: [lifted('card', '{locale}/pop-card.png', COACH, [17, 605, 406, 155], { pop: 1.16, tilt: -4 })],
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
    // glow: light behind each phone in the slide's highlight colour (red on black slides, a dark halo on red ones).
    backdrop: 'gradient', span: false, decoration: 'none', shadow: 70, glow: 40, tilt: 0,
    headlineWeight: 400, headlineScale: 1.7, headlineCase: 'upper', captionAlign: 'left',
    // SCENE='{"backdrop":"spotlight","glow":30}' node deck.js tries other looks (editor: Scene).
    ...(process.env.SCENE ? JSON.parse(process.env.SCENE) : {}),
  },
  slidesByDevice: { iphone: slides },
};

fs.writeFileSync(path.join(HERE, '../app-store-screenshots.json'), JSON.stringify(project, null, 2) + '\n');
console.log(`app-store-screenshots.json: ${slides.length} slides ×`, LANGS.join(', '));
