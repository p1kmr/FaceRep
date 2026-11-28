// The cast options for the owner to choose from: one lineup picture, then one card per option (the character as
// a sticker, a line in a bubble, three exercise faces, who it pulls in and a first episode). Stills only, as PNG:
//   node reels/render.mjs reels/cast-options --stills

import { bubble } from '/page/bubble.js';
import { drawHead, drawPerson } from '/page/cast/body.js';
import { CAST } from '/page/cast/cast.js';
import { FACES } from '/page/cast/face.js';
import { INK, WHITE, grain, oval, use } from '/page/cast/pen.js';
import { sticker } from '/page/cast/sticker.js';
import { rep } from '/page/rep.js';

const BODY = '"Helvetica Neue", Arial, sans-serif';
const EXERCISES = [['fishFace', 'FISH FACE'], ['browLift', 'BROW LIFT'], ['cheekLift', 'CHEEK LIFT']];

function write(c, str, x, y, { size, font = 'Anton', color = INK, align = 'left', alpha = 1, weight = '' }) {
  c.save();
  c.font = `${weight} ${size}px ${font}`;
  c.textAlign = align;
  c.textBaseline = 'middle';
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.fillText(str, x, y);
  c.restore();
}

function pill(c, str, x, y, { size = 30, fill = INK, color = WHITE } = {}) {
  c.font = `${size}px Anton`;
  const w = c.measureText(str).width + size * 1.2;
  c.beginPath();
  c.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8);
  c.fillStyle = fill;
  c.fill();
  write(c, str, x, y + 1, { size, color, align: 'center' });
}

function backdrop(c, [top, bottom]) {
  const g = c.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  c.fillStyle = g;
  c.fillRect(0, 0, 1080, 1920);
  for (const [x, y, r, a] of [[900, 360, 360, 0.5], [120, 1100, 420, 0.35], [960, 1380, 300, 0.3]]) {
    const glow = c.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, `rgba(255,255,255,${a})`);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, 1080, 1920);
  }
}

// A cast member standing as a sticker, feet at x, y.
function stand(c, spec, x, y, scale) {
  oval(x, y + 6 * scale, 150 * scale, 20 * scale, 'rgba(43,29,46,0.16)', { off: 0, ink: 0 });
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  sticker(c, () => drawPerson(spec, undefined, undefined, { shadow: false }), { border: 13 });
  c.restore();
}

function repSticker(c, x, y, size, opts = {}) {
  c.save();
  sticker(c, (g) => rep(g, { x, y, size, eyes: 'flat', ...opts }), { border: 10 });
  c.restore();
}

function faceCircle(c, spec, face, x, y, r, bg) {
  c.save();
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = bg;
  c.fill();
  c.clip();
  c.translate(x, y + r * 0.16);
  c.scale(r / 172, r / 172);
  const ctx = { spec, b: spec.body, c: spec.c, fc: FACES[face] };
  spec.hairBack?.(ctx);
  drawHead(spec, FACES[face], ctx);
  c.restore();
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.lineWidth = 7;
  c.strokeStyle = INK;
  c.stroke();
}

function card(c, i) {
  const o = CAST[i], s = o.spec;
  backdrop(c, o.bg);
  pill(c, `OPTION ${i + 1}`, 140, 74, { size: 32 });
  write(c, s.name.toUpperCase(), 56, 238, { size: 190 });
  write(c, o.who, 62, 352, { size: 40, font: BODY, weight: 600, alpha: 0.72 });
  stand(c, s, 410, 1330, 1.1);
  repSticker(c, 905, 1205, 170);
  c.font = '46px Anton';
  const size = Math.min(46, (46 * 560) / c.measureText(o.line).width);
  bubble(c, o.line, { x: 740, y: 440, size, tail: [600, 560] });
  c.save();
  c.shadowColor = 'rgba(43,29,46,0.18)';
  c.shadowBlur = 40;
  c.shadowOffsetY = 14;
  c.beginPath();
  c.roundRect(36, 1392, 1008, 492, 48);
  c.fillStyle = 'rgba(255,255,255,0.92)';
  c.fill();
  c.restore();
  write(c, `${o.his} FACES: 3 FREE EXERCISES IN THE APP`, 540, 1446, { size: 32, align: 'center', alpha: 0.85 });
  EXERCISES.forEach(([face, name], k) => {
    const x = 220 + k * 320;
    faceCircle(c, s, face, x, 1590, 108, o.bg[0]);
    pill(c, name, x, 1730, { size: 26 });
  });
  write(c, o.pulls, 540, 1792, { size: 30, font: BODY, weight: 700, align: 'center' });
  write(c, o.idea, 540, 1838, { size: 30, font: BODY, weight: 500, align: 'center', alpha: 0.75 });
}

function lineup(c) {
  backdrop(c, ['#FFF6EC', '#FFD6CC']);
  write(c, 'PICK THE CAST', 540, 140, { size: 150, align: 'center' });
  write(c, '5 options · US, 18–24 · Rep stays the app mascot', 540, 245, { size: 36, font: BODY, weight: 600, align: 'center', alpha: 0.7 });
  const spots = [[200, 900], [540, 900], [880, 900], [300, 1560], [780, 1560]];
  CAST.forEach((o, i) => {
    const [x, y] = spots[i];
    stand(c, o.spec, x, y, 0.66);
    pill(c, `${i + 1}  ${o.spec.name.toUpperCase()}`, x, y + 62, { size: 40 });
  });
  repSticker(c, 545, 1470, 120);
  bubble(c, 'PICK ONE. OR TWO.', { x: 545, y: 1330, size: 34, tail: [545, 1390] });
  write(c, 'All drawn in code. My pick: 1 + 2 (a guy and a girl).', 540, 1800, { size: 34, font: BODY, weight: 600, align: 'center', alpha: 0.75 });
}

export const REEL = {
  seconds: 6,
  bpm: 120,
  screens: [],
  stills: [0, 1, 2, 3, 4, 5],
  png: true,
  draw(c, t) {
    use(c);
    if (t < 1) lineup(c);
    else card(c, Math.round(t) - 1);
    grain(c, 0.06);
  },
};
