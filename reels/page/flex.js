// Flex's body: a big head on a small, gym-built body (red tank top, dark shorts, white trainers). flex() draws all of
// him, flexBust() only the head and shoulders, for the exercise faces. Both are centred on the head: x, y is the
// middle of his face, scale 1 makes the head about 250 px tall. The head and faces are in flex-face.js.

import { LW, RED, SKIN, WHITE, flexHead, ink } from '/page/flex-face.js';

const SHORTS = '#2B2F36';

// A thick limb along the points, outlined: the outline first, then the skin over it.
function limb(c, pts, width, color = SKIN) {
  const path = () => {
    c.beginPath();
    c.moveTo(...pts[0]);
    for (const p of pts.slice(1)) c.lineTo(...p);
  };
  path();
  ink(c, width + 2 * LW);
  c.stroke();
  path();
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
}

function blob(c, x, y, rx, ry, color = SKIN) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = color;
  c.fill();
  ink(c);
  c.stroke();
}

function tank(c, bottom) {
  c.beginPath();
  c.moveTo(-56, 130);
  c.lineTo(-33, 130);
  c.quadraticCurveTo(0, 176, 33, 130);
  c.lineTo(56, 130);
  c.quadraticCurveTo(64, 190, 84, 205);
  c.lineTo(68, bottom);
  c.lineTo(-68, bottom);
  c.lineTo(-84, 205);
  c.quadraticCurveTo(-64, 190, -56, 130);
  c.closePath();
  c.fillStyle = RED;
  c.fill();
  ink(c);
  c.stroke();
  c.beginPath(); // a hint of chest under the shirt
  c.moveTo(-40, 205);
  c.quadraticCurveTo(-20, 218, -2, 205);
  c.moveTo(2, 205);
  c.quadraticCurveTo(20, 218, 40, 205);
  c.strokeStyle = 'rgba(0, 0, 0, 0.28)';
  c.lineWidth = 4;
  c.stroke();
}

function torso(c, shoulder, waist, bottom) {
  c.beginPath(); // neck and shoulders in one shape, so no line crosses the neck
  c.moveTo(-32, 80);
  c.lineTo(-32, 122);
  c.quadraticCurveTo(-shoulder + 10, 126, -shoulder, 165 + (shoulder > 120 ? 50 : 0));
  c.lineTo(-waist, bottom);
  c.lineTo(waist, bottom);
  c.lineTo(shoulder, 165 + (shoulder > 120 ? 50 : 0));
  c.quadraticCurveTo(shoulder - 10, 126, 32, 122);
  c.lineTo(32, 80);
  c.closePath();
  c.fillStyle = SKIN;
  c.fill();
  ink(c);
  c.stroke();
}

function neckStretch(c) {
  c.beginPath(); // chin lift: the front of the neck stretches
  c.moveTo(-22, 92);
  c.lineTo(-10, 124);
  c.moveTo(22, 92);
  c.lineTo(10, 124);
  c.moveTo(-6, 108);
  c.quadraticCurveTo(0, 114, 6, 108);
  ink(c, 4);
  c.stroke();
}

function shoe(c, x) {
  c.beginPath();
  c.roundRect(x - 34, 438, 68, 30, 14);
  c.fillStyle = WHITE;
  c.fill();
  ink(c);
  c.stroke();
  c.beginPath();
  c.moveTo(x - 18, 452);
  c.lineTo(x + 16, 452);
  c.strokeStyle = RED;
  c.lineWidth = 6;
  c.stroke();
}

// All of Flex, flexing one arm, the other hand on his hip.
export function flex(c, { x, y, scale = 1, face = 'neutral' }) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  limb(c, [[-30, 370], [-36, 440]], 32); // legs
  limb(c, [[30, 370], [36, 440]], 32);
  shoe(c, -40);
  shoe(c, 40);
  c.beginPath(); // shorts, with a white side stripe
  c.moveTo(-70, 290);
  c.lineTo(70, 290);
  c.lineTo(78, 382);
  c.lineTo(6, 382);
  c.lineTo(0, 340);
  c.lineTo(-6, 382);
  c.lineTo(-78, 382);
  c.closePath();
  c.fillStyle = SHORTS;
  c.fill();
  ink(c);
  c.stroke();
  c.beginPath();
  c.moveTo(66, 296);
  c.lineTo(73, 378);
  c.moveTo(-66, 296);
  c.lineTo(-73, 378);
  c.strokeStyle = WHITE;
  c.lineWidth = 5;
  c.stroke();
  limb(c, [[92, 168], [168, 150], [162, 78]], 38); // the flexing arm
  blob(c, 128, 138, 32, 24); // its biceps
  limb(c, [[-92, 168], [-150, 226], [-84, 276]], 34); // the hand-on-hip arm
  torso(c, 100, 70, 300);
  tank(c, 305);
  blob(c, 162, 66, 23, 23); // fists
  blob(c, -80, 278, 20, 20);
  c.beginPath(); // the knuckles of the raised fist
  c.moveTo(150, 60);
  c.lineTo(174, 60);
  ink(c, 4);
  c.stroke();
  c.save();
  flexHead(c, face);
  c.restore();
  c.restore();
}

// Flex's head and shoulders, for a face; `bottom` cuts him off (head units).
export function flexBust(c, { x, y, scale = 1, face = 'neutral', bottom = 215 }) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  torso(c, 150, 170, bottom + 20);
  tank(c, bottom + 20);
  if (face === 'chinLift') neckStretch(c);
  flexHead(c, face);
  c.restore();
}
