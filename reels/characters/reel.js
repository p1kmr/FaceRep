// The character sheet for the owner's OK (reels/plan.md, "The characters"): Flex in full and with six exercise faces,
// Rep standing and in four poses. One still, saved as a PNG: node reels/render.mjs reels/characters --stills

import { bubble } from '/page/bubble.js';
import { INK, RED, WHITE, icon, phone, text, words } from '/page/draw.js';
import { flex, flexBust } from '/page/flex.js';
import { rep } from '/page/rep.js';

const PAPER = '#F3EEE8';
const FACES = [
  ['chinLift', 'CHIN LIFT'], ['cheekLift', 'CHEEK LIFT'], ['fishFace', 'FISH FACE'],
  ['pout', 'POUT'], ['browLift', 'BROW LIFT'], ['wideEyes', 'WIDE EYES'],
];

function panel(c, x, y, w, h) {
  c.beginPath();
  c.roundRect(x, y, w, h, 28);
  c.fillStyle = PAPER;
  c.fill();
}

function tag(c, str, x, y, { size = 64, color = RED } = {}) {
  c.font = `${size}px Anton`;
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillStyle = color;
  c.fillText(str, x, y);
}

function note(c, str, x, y) {
  c.font = '600 26px system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillStyle = 'rgba(11, 13, 16, 0.7)';
  c.fillText(str, x, y);
}

function pill(c, str, x, y) {
  c.font = '26px Anton';
  const w = c.measureText(str).width + 32;
  c.beginPath();
  c.roundRect(x - w / 2, y - 22, w, 44, 22);
  c.fillStyle = INK;
  c.fill();
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = WHITE;
  c.fillText(str, x, y + 1);
}

let glow; // the phone's screen in the sheet: only a glow (in a reel it is a real screenshot, never redrawn)
function screen() {
  if (glow) return glow;
  glow = Object.assign(document.createElement('canvas'), { width: 132, height: 287 });
  const g = glow.getContext('2d'), r = g.createRadialGradient(66, 70, 0, 66, 70, 200);
  r.addColorStop(0, '#FF8A5C');
  r.addColorStop(0.35, RED);
  r.addColorStop(1, '#2A0A09');
  g.fillStyle = r;
  g.fillRect(0, 0, 132, 287);
  return glow;
}

function lines(c, segments, width = 5) {
  c.beginPath();
  for (const [x1, y1, x2, y2] of segments) c.moveTo(x1, y1), c.lineTo(x2, y2);
  c.strokeStyle = INK;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.stroke();
}

function heroes(c) {
  panel(c, 30, 165, 505, 640);
  flex(c, { x: 310, y: 345, scale: 0.92 });
  tag(c, 'FLEX', 55, 700);
  note(c, '19, gym bro.', 57, 750);
  note(c, 'maxxes it all.', 57, 784);
  panel(c, 545, 165, 505, 640);
  rep(c, { x: 797, y: 400, size: 290 });
  tag(c, 'REP', 572, 700);
  note(c, 'the app, alive.', 574, 750);
  note(c, 'deadpan. counts reps.', 574, 784);
}

function faces(c) {
  tag(c, 'FLEX · EXERCISE FACES', 36, 842, { size: 40, color: WHITE });
  for (const [i, [face, name]] of FACES.entries()) {
    const x = 30 + (i % 3) * 345, y = 868 + Math.floor(i / 3) * 270;
    c.save();
    panel(c, x, y, 330, 260);
    c.clip();
    flexBust(c, { x: x + 165, y: y + 112, scale: 0.6, face });
    c.restore();
    pill(c, name, x + 165, y + 228);
  }
}

const POSES = [
  ['POPS OUT', (c, x, y) => {
    phone(c, screen(), { x: x + 124, y: y + 292, w: 84, rot: -0.12 });
    lines(c, [[x + 88, y + 190, x + 80, y + 160], [x + 160, y + 188, x + 170, y + 158], [x + 124, y + 182, x + 124, y + 150]]);
    lines(c, [[x + 40, y + 60, x + 22, y + 48], [x + 208, y + 60, x + 226, y + 48], [x + 30, y + 120, x + 12, y + 122]], 4);
    rep(c, { x: x + 124, y: y + 112, size: 118, arms: 'up', legs: 'jump' });
  }],
  ['COUNTS', (c, x, y) => {
    rep(c, { x: x + 118, y: y + 238, size: 130, eyes: 'flat', arms: 'point' });
    bubble(c, 'HOLD.', { x: x + 104, y: y + 72, size: 46, tail: [x + 112, y + 158] });
  }],
  ['LIFTS HIS SMILE', (c, x, y) => {
    rep(c, { x: x + 124, y: y + 246, size: 120, eyes: 'flat', arms: 'lift', legs: 'squat', lifted: true, sweat: true });
  }],
  ['BECOMES THE ICON', (c, x, y) => {
    rep(c, { x: x + 124, y: y + 104, size: 100, eyes: 'closed', arms: 'tuck', legs: 'tuck' });
    lines(c, [[x + 52, y + 62, x + 40, y + 90], [x + 196, y + 62, x + 208, y + 90], [x + 50, y + 150, x + 40, y + 124]], 4);
    lines(c, [[x + 124, y + 190, x + 124, y + 232], [x + 108, y + 218, x + 124, y + 234], [x + 140, y + 218, x + 124, y + 234]], 6);
  }],
];

function poses(c, img) {
  tag(c, 'REP · POSES', 36, 1432, { size: 40, color: WHITE });
  for (const [i, [name, draw]] of POSES.entries()) {
    const x = 30 + i * 258, y = 1458;
    c.save();
    panel(c, x, y, 248, 432);
    c.clip();
    draw(c, x, y);
    if (i === 3) icon(c, img.icon, { x: x + 124, y: y + 308, size: 118 });
    c.restore();
    pill(c, name, x + 124, y + 400);
  }
}

export const REEL = {
  seconds: 1,
  bpm: 120,
  screens: [],
  stills: [0],
  png: true,
  draw(c, t, img) {
    c.fillStyle = INK;
    c.fillRect(0, 0, 1080, 1920);
    words(c, 'FLEX & REP', { y: 74, size: 92 });
    text(c, 'FaceRep characters · sheet 1, draft', { y: 134, size: 28, alpha: 0.7 });
    heroes(c);
    faces(c);
    poses(c, img);
  },
};
