// 004-day-30's props (reels/004-day-30), drawn with the cast's pen (call use(c) first): the hand that swipes day 1
// away, the habit checklist, the couch Brody sinks into on day 12 (its back goes behind him, its seat and arms in
// front), a bag of chips for his hand (a spec's holds), Rep holding up a "5:00" sign, and the app's hold ring.

import { RED, WHITE, clamp, easeBack, pulse, words } from '../draw.js';
import { hand } from './body.js';
import { INK, box, ctx, group, line, oval, shape, tube } from './pen.js';
import { repStand } from './stage.js';
import { sticker } from './sticker.js';

const COUCH = '#3FA7A0', COUCH_LIGHT = '#5CC2BA', SEAM = '#2C7F79';
const BAG = 'M -62 -84 L -40 -92 L -20 -82 L 0 -94 L 22 -84 L 44 -94 L 62 -82 L 70 72 L 40 80 L 0 70 L -40 82 L -70 72 Z';

// A hand sweeping from right to left, x at the palm; the arm comes in from the bottom right.
export function swipeHand(x) {
  for (const [dy, len] of [[-120, 260], [0, 360], [120, 220]]) line(`M ${x + 260} ${1150 + dy} L ${x + 260 + len} ${1150 + dy}`, 10, WHITE, 0.6);
  shape(tube([[x + 600, 2200], [x + 380, 1700]], [150, 140]), '#2B2F3A');
  shape(tube([[x + 420, 1760], [x + 150, 1250]], [100, 88]), '#F2C4A0', { shade: '#DB9F7B' });
  hand([x + 150, 1250], 198, '#F2C4A0', 200, -1, 'spread');
}

// The habits so far: the first `done` items ticked, the newest one popping in at `at` seconds.
export function checklist(c, items, done, s, at) {
  const x = 610, y = 1070, w = 430;
  c.save();
  c.shadowColor = 'rgba(43,29,46,0.18)';
  c.shadowBlur = 40;
  c.shadowOffsetY = 14;
  c.beginPath();
  c.roundRect(x, y, w, 92 * items.length + 40, 40);
  c.fillStyle = 'rgba(255,255,255,0.95)';
  c.fill();
  c.restore();
  items.forEach((str, i) => {
    const cy = y + 66 + i * 92, on = i < done - 1 || (i === done - 1 && s >= at);
    const k = i === done - 1 ? easeBack(clamp((s - at) / 0.2)) : 1;
    c.save();
    c.translate(x + 58, cy);
    if (on) c.scale(k, k);
    c.beginPath();
    c.arc(0, 0, 28, 0, Math.PI * 2);
    c.fillStyle = on ? RED : 'rgba(43,29,46,0.12)';
    c.fill();
    if (on) line('M -13 1 L -3 11 L 14 -10', 8, WHITE);
    c.restore();
    c.save();
    c.font = '50px Anton';
    c.textBaseline = 'middle';
    c.globalAlpha = on ? 1 : 0.3;
    c.fillStyle = INK;
    c.fillText(str, x + 110, cy + 3);
    c.restore();
  });
}

// The couch, y at the seat's top: draw its back, then whoever sits in it, then its front.
export function couchBack(y) {
  box(90, y - 400, 900, 470, 80, COUCH, { off: 14, gloss: 0.15 });
  line(`M 540 ${y - 370} L 540 ${y + 40}`, 6, SEAM, 0.7);
}

export function couchFront(y) {
  box(40, y, 1000, 420, 50, COUCH_LIGHT, { off: 12 });
  line(`M 540 ${y + 14} L 540 ${y + 120} M 70 ${y + 130} L 1010 ${y + 130}`, 6, SEAM, 0.7);
  for (const x of [10, 900]) box(x, y - 180, 170, 600, 70, COUCH, { off: 12, gloss: 0.15 });
}

// A bag of chips in the right hand (a spec's holds, as brody-arc.js's phone).
export const chipsHold = {
  R(g, a, sg) {
    group(a.end[0] + 6, a.end[1] - 50, 14, 0.85, () => {
      shape(BAG, '#FF8A3D', { off: 10 });
      oval(0, -4, 38, 30, WHITE, { off: 0, ink: 5 });
      oval(0, -4, 20, 14, '#FFC93C', { off: 0, ink: 0 });
    });
    hand(a.end, a.dir, g.c.skin, g.b.hand, sg, 'fist');
    return true;
  },
};

// Rep with both arms up, holding a sign over his head (the tile's middle at x, y; size as rep()).
export function repSign(c, { x, y, size, label = '5:00' }) {
  if (size <= 0) return;
  repStand(c, { x, y, size, eyes: 'open', arms: 'up' });
  const k = size / 1024;
  sticker(c, () => {
    box(x - 850 * k, y - 1000 * k, 1700 * k, 560 * k, 120 * k, WHITE, { off: 8 });
    const g = ctx();
    g.save();
    g.font = `${380 * k}px Anton`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = RED;
    g.fillText(label, x, y - 706 * k);
    g.restore();
    for (const s of [-1, 1]) oval(x + s * 760 * k, y - 420 * k, 56 * k, 56 * k, INK, { off: 0, ink: 0 });
  }, { border: 10 });
}

// The app's hold: a ring that fills in `secs` (5 in the app; a reel may speed it up) while the number counts 5 to 1,
// then a tick. k: its size (0 hides it).
export function holdRing(c, x, y, s, k, secs = 5) {
  if (k <= 0) return;
  const p = clamp(s / secs, 0.001), left = Math.min(5, Math.max(1, 5 - Math.floor((5 * s) / secs)));
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  c.beginPath();
  c.arc(0, 0, 165, 0, Math.PI * 2);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fill();
  c.lineWidth = 26;
  c.strokeStyle = 'rgba(43,29,46,0.1)';
  c.beginPath();
  c.arc(0, 0, 140, 0, Math.PI * 2);
  c.stroke();
  const g = c.createLinearGradient(-140, -140, 140, 140);
  g.addColorStop(0, '#FF6B2C');
  g.addColorStop(1, RED);
  c.strokeStyle = g;
  c.lineCap = 'round';
  c.beginPath();
  c.arc(0, 0, 140, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
  c.stroke();
  if (p >= 1) line('M -52 6 L -12 46 L 58 -34', 24, RED);
  c.restore();
  words(c, 'HOLD', { x, y: y - 82, size: 40, color: INK, pop: k });
  if (p < 1) words(c, String(left), { x, y: y + 12, size: 130, color: INK, pop: k * (1 + 0.08 * pulse(s, secs / 5)) });
}
