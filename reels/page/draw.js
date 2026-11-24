// Drawing helpers for FaceRep reels, on a 1080 x 1920 canvas: the brand backgrounds, a phone around a Simulator
// screen, a detail of a screen lifted out (circle or card), big Anton words that slam in on a beat, small text, the
// app icon and the brand button. Times are in seconds. Nothing here is random, so every render is the same.

export const W = 1080, H = 1920;
export const RED = '#E5322D', ORANGE = '#FF6B2C', INK = '#0B0D10', WHITE = '#FFFFFF';
export const SCREEN = { w: 1320, h: 2868 }; // the Simulator screenshots (iPhone 17 Pro Max)
const BODY_FONT = 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const easeOut = (x) => 1 - (1 - x) ** 3;
export const easeBack = (x) => 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2;

// 1 on each beat, fading fast: for glows that thump with the music.
export const pulse = (s, beat) => Math.exp(-(((s % beat) + beat) % beat) / 0.09);
// The size of words that slam in at `at`: 0 before (not shown), then from 1.14 down to 1 in 0.12 s.
export const slam = (s, at) => (s < at ? 0 : 1 + 0.14 * (1 - easeOut(clamp((s - at) / 0.12))));
// A short shake after a slam, in pixels: from 12 down to 0 in 0.15 s.
export const shake = (s, at) => (s < at ? 0 : 12 * (1 - clamp((s - at) / 0.15)));

function rounded(c, x, y, w, h, r) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

export function background(c, kind, glow = 1) {
  if (kind === 'red') {
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, ORANGE);
    g.addColorStop(0.5, RED);
    g.addColorStop(1, '#A81B17');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    return;
  }
  c.fillStyle = INK;
  c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(540, 1250, 0, 540, 1250, 1000);
  g.addColorStop(0, `rgba(229, 50, 45, ${Math.min(0.85, 0.5 * glow)})`);
  g.addColorStop(1, 'rgba(229, 50, 45, 0)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

// A phone showing the screen `img`, centred on x, y; w is the screen's width in pixels.
export function phone(c, img, { x, y, w, rot = 0, scale = 1 }) {
  const h = (w * SCREEN.h) / SCREEN.w, b = w * 0.035, r = w * 0.14;
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(scale, scale);
  c.shadowColor = 'rgba(0, 0, 0, 0.5)';
  c.shadowBlur = 70;
  c.shadowOffsetY = 30;
  c.fillStyle = '#16181c';
  rounded(c, -w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b, r + b);
  c.fill();
  c.shadowColor = 'transparent';
  c.strokeStyle = '#4a4e57';
  c.lineWidth = 3;
  c.stroke();
  c.save();
  rounded(c, -w / 2, -h / 2, w, h, r);
  c.clip();
  c.drawImage(img, -w / 2, -h / 2, w, h);
  c.restore();
  c.fillStyle = '#000'; // the Dynamic Island (the Simulator's screenshots leave its place empty)
  rounded(c, -w * 0.143, -h / 2 + w * 0.026, w * 0.286, w * 0.084, w * 0.042);
  c.fill();
  c.restore();
}

// A circle of the screen `img` around (sx, sy), radius sr in screen pixels, lifted out at x, y with radius r.
// pop: 0 to 1, how far it has popped in.
export function liftCircle(c, img, { sx, sy, sr, x, y, r, pop = 1 }) {
  if (pop <= 0) return;
  const k = easeBack(pop);
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  c.shadowColor = 'rgba(0, 0, 0, 0.45)';
  c.shadowBlur = 50;
  c.shadowOffsetY = 24;
  c.fillStyle = WHITE;
  c.beginPath();
  c.arc(0, 0, r + 12, 0, Math.PI * 2);
  c.fill();
  c.shadowColor = 'transparent';
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.clip();
  c.drawImage(img, sx - sr, sy - sr, sr * 2, sr * 2, -r, -r, r * 2, r * 2);
  c.restore();
}

// A card of the screen (sx, sy, sw, sh in screen pixels, its corner sRadius) lifted out, centred on x, y, w wide.
export function liftCard(c, img, { sx, sy, sw, sh, sRadius = 80, x, y, w, rot = 0, pop = 1 }) {
  if (pop <= 0) return;
  const k = easeBack(pop), h = (w * sh) / sw, r = (sRadius * w) / sw;
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(k, k);
  c.shadowColor = 'rgba(0, 0, 0, 0.45)';
  c.shadowBlur = 60;
  c.shadowOffsetY = 28;
  c.fillStyle = WHITE;
  rounded(c, -w / 2, -h / 2, w, h, r);
  c.fill();
  c.shadowColor = 'transparent';
  c.clip();
  c.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
  c.restore();
}

// Big words in Anton, centred on x, y and shrunk to fit maxW. pop: the size from slam() (0: not shown yet);
// box: a colour behind them.
export function words(c, str, { x = W / 2, y, size, color = WHITE, box = null, pop = 1, shake: jolt = 0, alpha = 1, maxW = 920 }) {
  if (pop <= 0) return;
  c.save();
  c.font = `${size}px Anton`;
  const tw = c.measureText(str).width;
  const fit = Math.min(1, maxW / (tw + (box ? size * 0.44 : 0)));
  c.translate(x + jolt * Math.sin(y + jolt * 7.3), y + jolt * Math.cos(x + jolt * 5.1));
  c.scale(fit * pop, fit * pop);
  c.globalAlpha = alpha;
  if (box) {
    c.fillStyle = box;
    rounded(c, -tw / 2 - size * 0.22, -size * 0.6, tw + size * 0.44, size * 1.2, size * 0.14);
    c.fill();
  } else {
    c.shadowColor = 'rgba(0, 0, 0, 0.3)';
    c.shadowBlur = 24;
    c.shadowOffsetY = 6;
  }
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = color;
  c.fillText(str, 0, size * 0.04);
  c.restore();
}

// Small text in the system font.
export function text(c, str, { x = W / 2, y, size, color = WHITE, alpha = 1, weight = 600 }) {
  c.save();
  c.font = `${weight} ${size}px ${BODY_FONT}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.fillText(str, x, y);
  c.restore();
}

// The app icon, `size` pixels square, with the iOS corner and a soft red glow.
export function icon(c, img, { x, y, size }) {
  if (size <= 0) return;
  c.save();
  c.shadowColor = 'rgba(229, 50, 45, 0.6)';
  c.shadowBlur = size * 0.35;
  rounded(c, x - size / 2, y - size / 2, size, size, size * 0.2237);
  c.fillStyle = INK;
  c.fill();
  c.shadowColor = 'transparent';
  c.clip();
  c.drawImage(img, x - size / 2, y - size / 2, size, size);
  c.restore();
}

// The brand button: a red-to-orange pill with Anton words. pop: 0 to 1.
export function button(c, label, { x = W / 2, y, w, h, pop = 1 }) {
  if (pop <= 0) return;
  const k = easeBack(pop);
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, ORANGE);
  g.addColorStop(1, RED);
  c.shadowColor = 'rgba(229, 50, 45, 0.55)';
  c.shadowBlur = 40;
  c.shadowOffsetY = 12;
  c.fillStyle = g;
  rounded(c, -w / 2, -h / 2, w, h, h / 2);
  c.fill();
  c.shadowColor = 'transparent';
  c.font = `${h * 0.5}px Anton`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = WHITE;
  c.fillText(label, 0, h * 0.03);
  c.restore();
}

// A white flash for the first 0.08 s after a cut.
export function flash(c, s) {
  if (s >= 0.08) return;
  c.save();
  c.globalAlpha = 0.6 * (1 - s / 0.08);
  c.fillStyle = WHITE;
  c.fillRect(0, 0, W, H);
  c.restore();
}
