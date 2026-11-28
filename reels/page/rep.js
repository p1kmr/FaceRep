// Rep, the FaceRep app icon come alive (reels/plan.md, "The characters"): the red tile, two dot eyes and the barbell
// smile, at the icon's own places (reels/assets/icon.png, 1024 px), with tiny arms and legs. Deadpan: his eyes
// go flat, never sad or angry. Drawn in icon units around the tile's middle; `size` is the tile's width in pixels.

import { INK, WHITE } from '/page/flex-face.js';

const OUT = 32; // the outline, in icon units
const EYES = [[-112, -164], [112, -164]];

// The arms and legs of each pose, in icon units (the tile is -512..512). An arm or leg is a list of points; a hand
// or shoe goes on its last point.
const ARMS = {
  down: [[[-500, 140], [-640, 300], [-650, 470]], [[500, 140], [640, 300], [650, 470]]],
  up: [[[-500, 40], [-700, -180], [-760, -420]], [[500, 40], [700, -180], [760, -420]]],
  point: [[[-500, 150], [-680, 300], [-560, 440]], [[500, 60], [720, -120], [700, -400]]],
  lift: [[[-500, -60], [-660, -480], [-120, -905]], [[500, -60], [660, -480], [120, -905]]],
  tuck: [[[-500, 120], [-600, 150]], [[500, 120], [600, 150]]],
};
const LEGS = {
  stand: [[[-220, 500], [-230, 760]], [[220, 500], [230, 760]]],
  jump: [[[-220, 500], [-360, 640], [-240, 740]], [[220, 500], [360, 640], [240, 740]]],
  squat: [[[-260, 500], [-480, 660], [-430, 820]], [[260, 500], [480, 660], [430, 820]]],
  tuck: [[[-200, 500], [-200, 590]], [[200, 500], [200, 590]]],
};

function line(c, pts, width, color) {
  c.beginPath();
  c.moveTo(...pts[0]);
  for (const p of pts.slice(1)) c.lineTo(...p);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.stroke();
}

function limbs(c, arms, legs) {
  for (const leg of LEGS[legs]) {
    line(c, leg, 60, INK);
    const [x, y] = leg.at(-1);
    c.beginPath(); // a white trainer
    c.ellipse(x + Math.sign(x) * 30, y + 30, 100, 52, 0, 0, Math.PI * 2);
    c.fillStyle = WHITE;
    c.fill();
    c.strokeStyle = INK;
    c.lineWidth = OUT;
    c.stroke();
  }
  for (const arm of ARMS[arms]) {
    line(c, arm, 60, INK);
    c.beginPath();
    c.arc(...arm.at(-1), 56, 0, Math.PI * 2);
    c.fillStyle = INK;
    c.fill();
  }
}

function tile(c) {
  const g = c.createLinearGradient(-512, -512, 512, 512); // the icon's red, lighter at the top left
  g.addColorStop(0, '#FF6B4F');
  g.addColorStop(0.5, '#EA332E');
  g.addColorStop(1, '#C51C1F');
  c.beginPath();
  c.roundRect(-512, -512, 1024, 1024, 229);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = INK;
  c.lineWidth = OUT;
  c.stroke();
}

function eyes(c, kind) {
  c.save();
  if (kind === 'flat') { // deadpan: the tops of the dots cut flat
    c.beginPath();
    c.rect(-512, -184, 1024, 600);
    c.clip();
  }
  c.fillStyle = WHITE;
  for (const [x, y] of EYES) {
    c.beginPath();
    if (kind === 'closed') {
      c.moveTo(x - 60, y);
      c.quadraticCurveTo(x, y + 40, x + 60, y);
      c.strokeStyle = WHITE;
      c.lineWidth = 34;
      c.lineCap = 'round';
      c.stroke();
    } else {
      c.arc(x, y, 65, 0, Math.PI * 2);
      c.fill();
    }
  }
  c.restore();
}

// The barbell smile (icon units). outline: an ink edge, for when it leaves the red tile.
function smileParts(c) {
  const parts = [];
  for (const s of [-1, 1]) {
    parts.push([s > 0 ? 170 : -240, -77, 70, 232, 30]); // inner plate
    parts.push([s > 0 ? 248 : -296, -39, 48, 156, 22]); // outer plate
    parts.push([s > 0 ? 296 : -328, 16, 32, 46, 8]); // the end of the bar
  }
  for (const [x, y, w, h, r] of parts) c.roundRect(x, y, w, h, r);
  c.moveTo(-171, 26); // the bar, bent into a smile
  c.quadraticCurveTo(0, 202, 171, 26);
  c.lineTo(171, 100);
  c.quadraticCurveTo(0, 240, -171, 100);
  c.closePath();
}

export function smile(c, { outline = false } = {}) {
  if (outline) {
    c.beginPath();
    smileParts(c);
    c.strokeStyle = INK;
    c.lineWidth = 2 * OUT;
    c.lineJoin = 'round';
    c.stroke();
  }
  c.beginPath();
  smileParts(c);
  c.fillStyle = WHITE;
  c.fill();
}

// Rep at x, y (the tile's middle). eyes: open | flat | closed. arms: down | up | point | lift | tuck.
// legs: stand | jump | squat | tuck. lifted: the smile is off his face, held over his head.
export function rep(c, { x, y, size, eyes: look = 'open', arms = 'down', legs = 'stand', lifted = false, sweat = false }) {
  c.save();
  c.translate(x, y);
  c.scale(size / 1024, size / 1024);
  limbs(c, arms, legs);
  tile(c);
  eyes(c, look);
  if (lifted) {
    c.save();
    c.translate(0, -1010);
    smile(c, { outline: true });
    c.restore();
    for (const arm of ARMS[arms]) { // the hands grip the bar, in front of it
      c.beginPath();
      c.arc(...arm.at(-1), 56, 0, Math.PI * 2);
      c.fillStyle = INK;
      c.fill();
    }
  } else {
    smile(c);
  }
  if (sweat) {
    c.beginPath();
    c.moveTo(560, -560);
    c.quadraticCurveTo(640, -440, 600, -400);
    c.arc(560, -420, 46, 0.4, Math.PI + 0.6);
    c.closePath();
    c.fillStyle = '#8FD3F5';
    c.fill();
    c.strokeStyle = INK;
    c.lineWidth = OUT * 0.8;
    c.stroke();
  }
  c.restore();
}
