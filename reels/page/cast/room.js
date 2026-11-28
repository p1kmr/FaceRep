// The rooms and small things of Brody's arc (reels/004-day-30), drawn with the cast's pen (call use(c) first).
// night: his room at 2 am, dark, a moon in the window, a bedside clock, chip bags and a can on the floor. glow: a
// phone's light. morning: day 30, sun through the window, light beams, a plant. The props each arc day adds: a
// water bottle, the moon and 11 pm, a face wash, the barber's clippers, and the streak badge. Nothing is random.

import { INK, WHITE, box, ctx, flat, group, line, oval, shape } from './pen.js';
import { sticker } from './sticker.js';

// Anton words on the pen's canvas (inside a sticker too).
export const TEXT = (str, x, y, size, color) => {
  const c = ctx();
  c.save();
  c.font = `${size}px Anton`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = color;
  c.fillText(str, x, y);
  c.restore();
};

export function fill(c, [top, bottom]) {
  const g = c.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  c.fillStyle = g;
  c.fillRect(0, 0, 1080, 1920);
}

// A four-point twinkle star.
export function star(x, y, r, color = WHITE, alpha = 1) {
  if (r <= 0) return;
  flat(`M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`, color, alpha);
}

const crescent = (x, y, r) => `M ${x} ${y - r} A ${r} ${r} 0 1 0 ${x} ${y + r} A ${r * 0.78} ${r} 0 1 1 ${x} ${y - r} Z`;

export function chips(x, y, deg, color) {
  group(x, y, deg, 1, () => {
    shape('M -62 -84 L -40 -92 L -20 -82 L 0 -94 L 22 -84 L 44 -94 L 62 -82 L 70 72 L 40 80 L 0 70 L -40 82 L -70 72 Z', color, { off: 10 });
    oval(0, -4, 38, 30, WHITE, { off: 0, ink: 5 });
    oval(0, -4, 20, 14, '#FFC93C', { off: 0, ink: 0 });
  });
  for (const [dx, dy] of [[90, 60], [110, 74], [70, 80]]) oval(x + dx, y + dy, 8, 5, '#FFC93C', { off: 0, ink: 4 });
}

export function night(c, t) {
  fill(c, ['#191533', '#3A2C63']);
  box(730, 520, 280, 340, 18, '#4E4380', { off: 8 });
  box(750, 540, 240, 300, 10, '#1F2350', { off: 0, ink: 5 });
  shape(crescent(830, 615, 42), '#FFE9A8', { off: 0, ink: 5 });
  for (const [x, y, k] of [[930, 590, 0], [900, 700, 1.7], [790, 760, 3.1], [960, 780, 4.4]]) {
    star(x, y, 13, '#FFF6D0', 0.5 + 0.5 * Math.sin(t * 5 + k));
  }
  line('M 870 540 L 870 840 M 750 690 L 990 690', 10, '#4E4380');
  flat('M 0 1600 L 1080 1600 L 1080 1920 L 0 1920 Z', '#2A2050');
  box(60, 540, 300, 130, 24, '#15121F', { off: 0, ink: 6 });
  c.save();
  c.shadowColor = '#FF3B3B';
  c.shadowBlur = 24;
  TEXT('2:07 AM', 210, 608, 80, '#FF5050');
  c.restore();
  chips(150, 1700, -14, '#FF8A3D');
  chips(930, 1750, 16, '#E5322D');
  group(300, 1790, 70, 1, () => {
    box(-28, -84, 56, 110, 12, '#4CD38A', { off: 6 });
    box(-24, -92, 48, 14, 6, '#C9CED8', { off: 0, ink: 5 });
  });
}

// A phone's blue-white light on whatever is near x, y, flickering a little.
export function glow(c, x, y, t) {
  const k = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 5.3);
  c.save();
  c.globalCompositeOperation = 'screen';
  const g = c.createRadialGradient(x, y, 0, x, y, 520);
  g.addColorStop(0, `rgba(140, 210, 255, ${0.5 * k})`);
  g.addColorStop(1, 'rgba(140, 210, 255, 0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 1080, 1920);
  c.restore();
}

export function morning(c, t) {
  fill(c, ['#FFF6E0', '#FFCB98']);
  c.save();
  c.globalAlpha = 0.28 + 0.04 * Math.sin(t * 2);
  c.fillStyle = WHITE;
  for (const [a, b] of [[80, 200], [250, 330]]) {
    c.beginPath();
    c.moveTo(a, 520);
    c.lineTo(b, 520);
    c.lineTo(b + 620, 1920);
    c.lineTo(a + 380, 1920);
    c.fill();
  }
  c.restore();
  box(60, 500, 300, 340, 18, WHITE, { off: 8 });
  box(80, 520, 260, 300, 10, '#BFE6FF', { off: 0, ink: 5 });
  oval(150, 600, 46, 46, '#FFD23C', { off: 0, ink: 5 });
  line('M 210 520 L 210 820 M 80 670 L 340 670', 10, WHITE);
  flat('M 0 1600 L 1080 1600 L 1080 1920 L 0 1920 Z', '#F4BE88');
  group(960, 1640, 0, 1, () => {
    for (const [dx, h, deg] of [[-30, 170, -24], [0, 210, 0], [30, 160, 26]]) {
      group(dx, -60, deg, 1, () => shape(`M 0 0 C -36 ${-h * 0.4}, -20 ${-h * 0.9}, 0 ${-h} C 20 ${-h * 0.9}, 36 ${-h * 0.4}, 0 0 Z`, '#57B86A', { off: 8 }));
    }
    shape('M -58 -70 L 58 -70 L 44 40 L -44 40 Z', '#E07A4F', { off: 8 });
  });
}

// Twinkles around a point, popping in turn.
export function sparkles(c, x, y, t, r = 330) {
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + 0.3, k = Math.max(0, Math.sin(t * 4 + i * 1.3));
    star(x + Math.cos(a) * r * (0.8 + (i % 3) * 0.15), y + Math.sin(a) * r * 1.3, 30 * k, i % 2 ? WHITE : '#FFE07A');
  }
}

// The arc's props, each a sticker at x, y, k: their size (0 hides them).
const prop = (c, x, y, k, draw) => k > 0 && sticker(c, () => group(x, y, 0, k, draw), { border: 10 });

export const bottle = (c, x, y, k) => prop(c, x, y, k, () => {
  box(-44, -120, 88, 230, 30, '#7FD3FF', { off: 10, gloss: 0.3 });
  box(-30, -156, 60, 44, 12, '#2F6FE0', { off: 4 });
  box(-44, -30, 88, 70, 0, WHITE, { off: 0, ink: 0 });
  line('M -30 6 Q -15 -10 0 6 Q 15 22 30 6', 6, '#2F6FE0');
});

export const moonClock = (c, x, y, k) => prop(c, x, y, k, () => {
  shape(crescent(-40, -40, 90), '#FFE07A', { off: 10 });
  box(-10, 40, 170, 90, 22, '#15121F', { off: 0, ink: 6 });
  TEXT('11 PM', 75, 88, 56, '#FF5050');
  TEXT('Z', 70, -90, 60, '#7183C9');
  TEXT('z', 110, -140, 44, '#7183C9');
});

export const faceWash = (c, x, y, k) => prop(c, x, y, k, () => {
  box(-50, -90, 100, 200, 26, WHITE, { off: 8 });
  box(-50, -30, 100, 80, 0, '#9BE7C4', { off: 0, ink: 0 });
  box(-14, -132, 28, 46, 6, '#5ABF95', { off: 4 });
  line('M 0 -128 L 44 -128', 14, '#5ABF95');
  for (const [dx, dy, r] of [[70, -150, 18], [96, -110, 12], [60, -100, 9]]) oval(dx, dy, r, r, '#D8F4FF', { off: 0, ink: 4 });
});

export const clippers = (c, x, y, k) => prop(c, x, y, k, () => {
  box(-44, -110, 88, 230, 34, '#2C2F3A', { off: 10, gloss: 0.25 });
  box(-52, -150, 104, 46, 8, '#C9CED8', { off: 4 });
  for (let i = -40; i <= 40; i += 16) line(`M ${i} -150 L ${i} -168`, 6, INK);
  box(-12, -40, 24, 50, 10, '#E5322D', { off: 0, ink: 5 });
});

// The app's "30 day streak", as a badge with a flame. k: its size (0 hides it).
export function badge(c, x, y, k, label = '30 DAY STREAK') {
  if (k <= 0) return;
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  c.font = '64px Anton';
  const w = c.measureText(label).width + 170;
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, '#FF8A2C');
  g.addColorStop(1, '#E5322D');
  c.shadowColor = 'rgba(229, 50, 45, 0.5)';
  c.shadowBlur = 40;
  c.beginPath();
  c.roundRect(-w / 2, -56, w, 112, 56);
  c.fillStyle = g;
  c.fill();
  c.restore();
  group(x - w * k * 0.5 + 70 * k, y, 0, k, () => shape('M 0 -44 C 30 -10, 34 14, 22 32 C 10 46, -10 46, -22 32 C -34 14, -22 -6, -8 -14 C -6 -2, 2 2, 6 -6 C 10 -18, 4 -30, 0 -44 Z', '#FFE07A', { off: 6, ink: 5 }));
  c.save();
  c.translate(x + 40 * k, y);
  c.scale(k, k);
  TEXT(label, 0, 4, 64, WHITE);
  c.restore();
}
