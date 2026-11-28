// Screen furniture for the night reels (011), on the 1080 x 1920 canvas: a glowing clock, the app's reminder as an
// iPhone notification (the app's own words and icon), a streak chip with a flame (the app's "<n> day streak") and
// a coloured vignette. Nothing here is random, so every render is the same.

import { ORANGE, RED, WHITE, easeBack } from '/page/draw.js';

const BODY_FONT = 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

// The time in big Anton letters with a neon glow. pop: the size from slam() (0: not shown yet); shake in pixels.
export function clock(c, label, { x = 540, y, size = 140, color = '#FF3B30', glow = 'rgba(255,59,48,0.85)', pop = 1, shake = 0 }) {
  if (pop <= 0) return;
  c.save();
  c.translate(x + shake * Math.sin(y + shake * 7.3), y + shake * Math.cos(x + shake * 5.1));
  c.scale(pop, pop);
  c.font = `${size}px Anton`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = color;
  c.shadowColor = glow;
  for (const blur of [size * 0.4, size * 0.12]) {
    c.shadowBlur = blur;
    c.fillText(label, 0, size * 0.04);
  }
  c.restore();
}

// The app's reminder as a notification banner dropping in from the top to y. drop: 0 to 1.
export function notice(c, iconImg, { y, drop, title, body, app = 'FaceRep', w = 960, h = 196 }) {
  if (drop <= 0) return;
  const cy = -h + (y + h) * easeBack(drop), x0 = 540 - w / 2, y0 = cy - h / 2, is = 104, ix = x0 + 30, tx = ix + is + 28;
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.35)';
  c.shadowBlur = 40;
  c.shadowOffsetY = 14;
  c.fillStyle = 'rgba(246, 246, 248, 0.95)';
  c.beginPath();
  c.roundRect(x0, y0, w, h, 46);
  c.fill();
  c.shadowColor = 'transparent';
  c.save();
  c.beginPath();
  c.roundRect(ix, cy - is / 2, is, is, is * 0.2237);
  c.clip();
  c.drawImage(iconImg, ix, cy - is / 2, is, is);
  c.restore();
  c.textBaseline = 'alphabetic';
  c.fillStyle = '#86868B';
  c.font = `600 30px ${BODY_FONT}`;
  c.textAlign = 'right';
  c.fillText('now', x0 + w - 34, y0 + 52);
  c.textAlign = 'left';
  c.fillText(app, tx, y0 + 52);
  c.fillStyle = '#111114';
  c.font = `700 40px ${BODY_FONT}`;
  c.fillText(title, tx, y0 + 108);
  c.fillStyle = '#2C2C2E';
  c.font = `400 38px ${BODY_FONT}`;
  c.fillText(body, tx, y0 + 158);
  c.restore();
}

// A flame h pixels tall, centred on x, y: yellow with a white heart.
function flame(c, x, y, h) {
  c.save();
  c.translate(x, y);
  c.scale(h / 100, h / 100);
  for (const [pts, fill] of [
    [[-30, 50, -40, 20, -26, -6], [-18, -20, -10, -30, -4, -50], [14, -36, 34, -16, 32, 12], [30, 38, 18, 50, 0, 50]],
    [[-14, 50, -20, 34, -12, 20], [-6, 10, -2, 4, 0, -8], [10, 4, 18, 18, 16, 32], [14, 44, 8, 50, 0, 50]],
  ].map((curves, i) => [curves, i ? WHITE : '#FFD23F'])) {
    c.beginPath();
    c.moveTo(0, 50);
    for (const k of pts) c.bezierCurveTo(...k);
    c.fillStyle = fill;
    c.fill();
  }
  c.restore();
}

// A streak chip: a flame and "<days> DAY STREAK" on the brand gradient. pop: 0 to 1.
export function streak(c, days, { x = 540, y, pop = 1 }) {
  if (pop <= 0) return;
  const label = `${days} DAY STREAK`, size = 54, h = 96, k = easeBack(pop);
  c.save();
  c.font = `${size}px Anton`;
  const w = c.measureText(label).width + 150;
  c.translate(x, y);
  c.scale(k, k);
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, ORANGE);
  g.addColorStop(1, RED);
  c.shadowColor = 'rgba(229, 50, 45, 0.6)';
  c.shadowBlur = 36;
  c.fillStyle = g;
  c.beginPath();
  c.roundRect(-w / 2, -h / 2, w, h, h / 2);
  c.fill();
  c.shadowColor = 'transparent';
  flame(c, -w / 2 + 62, 0, 62);
  c.fillStyle = WHITE;
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText(label, -w / 2 + 104, size * 0.04);
  c.restore();
}

// The frame's edges tinted with rgb ('229,50,45'), alpha at the corners, clear in the middle.
export function vignette(c, rgb, alpha) {
  const g = c.createRadialGradient(540, 960, 480, 540, 960, 1250);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(1, `rgba(${rgb},${alpha})`);
  c.fillStyle = g;
  c.fillRect(0, 0, 1080, 1920);
}
