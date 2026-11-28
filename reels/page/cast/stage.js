// The stage for the cast's episodes (reels/NNN-name): a soft two-colour backdrop, a cast member or Rep standing as a
// die-cut sticker (bouncing, squashing, shaking), sweat drops, light rays and confetti. Call use(c) once per frame
// first: the pen draws on that canvas.

import { rep } from '../rep.js';
import { drawPerson } from './body.js';
import { oval, shape } from './pen.js';
import { sticker } from './sticker.js';

export function backdrop(c, [top, bottom], t = 0) {
  const g = c.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  c.fillStyle = g;
  c.fillRect(0, 0, 1080, 1920);
  for (const [x, y, r, a, k] of [[900, 360, 380, 0.5, 1], [140, 1100, 440, 0.35, -0.7], [960, 1400, 320, 0.3, 0.5]]) {
    const gx = x + 40 * Math.sin(t * 0.6 * k), gy = y + 30 * Math.cos(t * 0.5 * k);
    const glow = c.createRadialGradient(gx, gy, 0, gx, gy, r);
    glow.addColorStop(0, `rgba(255,255,255,${a})`);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, 1080, 1920);
  }
}

// A cast member standing as a sticker, feet at x, y. pose and face as drawPerson's (the spec's own when left out);
// sx, sy squash round the feet; tilt in degrees; shake: a jitter in pixels at time t.
export function stand(c, spec, { x, y, scale = 1, pose, face, sx = 1, sy = 1, tilt = 0, shake = 0, t = 0 }) {
  if (scale <= 0) return;
  oval(x, y + 6 * scale, 150 * scale * sx, 20 * scale, 'rgba(43,29,46,0.16)', { off: 0, ink: 0 });
  c.save();
  c.translate(x + shake * Math.sin(t * 97.3), y + shake * 0.6 * Math.cos(t * 83.1));
  c.rotate((tilt * Math.PI) / 180);
  c.scale(scale * sx, scale * sy);
  sticker(c, () => drawPerson(spec, pose, face, { shadow: false }), { border: 13 });
  c.restore();
}

// Rep as a sticker: the options of rep() (x, y is the tile's middle).
export function repStand(c, opts) {
  if (opts.size <= 0) return;
  sticker(c, (g) => rep(g, opts), { border: 10 });
}

// Sweat drops flying off a head at x, y (r: the head's half width), on a loop.
export function sweat(c, x, y, t, r = 150, n = 6) {
  for (let i = 0; i < n; i++) {
    const k = (t * 1.7 + i / n) % 1, side = i % 2 ? 1 : -1;
    const px = x + side * (r * 0.8 + k * 130), py = y - 70 + ((i * 37) % 90) - 60 * k + 240 * k * k;
    const d = `M ${px} ${py - 22} C ${px + 13} ${py - 3}, ${px + 13} ${py + 13}, ${px} ${py + 13} ` +
      `C ${px - 13} ${py + 13}, ${px - 13} ${py - 3}, ${px} ${py - 22} Z`;
    shape(d, '#8FD3FF', { off: 4, ink: 5, alpha: 1 - k * k });
  }
}

// Light rays turning slowly behind a character.
export function rays(c, x, y, t, color, n = 16) {
  c.save();
  c.translate(x, y);
  c.rotate(t * 0.35);
  c.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = a + (Math.PI / n) * 0.6;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(a) * 2200, Math.sin(a) * 2200);
    c.lineTo(Math.cos(b) * 2200, Math.sin(b) * 2200);
    c.fill();
  }
  c.restore();
}

// Confetti bursting up from x, y, s seconds after it started, then falling and fading.
export function confetti(c, x, y, s, n = 40) {
  if (s < 0 || s > 2.4) return;
  const COLORS = ['#E5322D', '#FFC93C', '#7183C9', '#B9EC3C', '#F6A3BE', '#FFFFFF'];
  c.save();
  c.globalAlpha = Math.min(1, (2.4 - s) / 0.6);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + i * 0.37, v = 260 + ((i * 97) % 380);
    const px = x + Math.cos(a) * v * s, py = y - (1100 + ((i * 53) % 700)) * s + 1500 * s * s;
    c.save();
    c.translate(px, py);
    c.rotate(s * (6 + (i % 5)) + i);
    c.fillStyle = COLORS[i % COLORS.length];
    c.fillRect(-11, -6, 22, 12);
    c.restore();
  }
  c.restore();
}
