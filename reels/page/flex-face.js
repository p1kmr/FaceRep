// Flex's head (reels/plan.md, "The characters"): a 19-year-old gym bro with a short fade, thick eyebrows and a
// sweatband. Drawn around (0, 0) in head units (about 250 tall, chin at +107); the caller translates and scales.
// FACES are the app's free exercises (constants/exercises.ts), so a reel can show their real exercise pages.

export const INK = '#0B0D10', RED = '#E5322D', WHITE = '#FFFFFF';
export const SKIN = '#C98B5E', HAIR = '#1E1A17', LIP = '#A4503B';
export const LW = 6; // the outline

export const FACES = {
  neutral: { eye: 'lid', mouth: 'smirk', tilt: 0.12 },
  chinLift: { up: 1, eye: 'up', mouth: 'lipOver', tilt: -0.05 },
  cheekLift: { eye: 'happy', mouth: 'smile', cheeks: 1 },
  fishFace: { pinch: 1, eye: 'open', mouth: 'fish', lift: 0.35 },
  pout: { eye: 'half', mouth: 'pout', tilt: 0.16 },
  browLift: { lift: 1, wrinkles: true, eye: 'open', mouth: 'flat' },
  wideEyes: { eye: 'wide', mouth: 'flat', sweat: true },
};

export function ink(c, width = LW) {
  c.strokeStyle = INK;
  c.lineWidth = width;
  c.lineJoin = 'round';
  c.lineCap = 'round';
}

function headPath(c, pinch = 0) {
  c.beginPath();
  c.moveTo(0, -118);
  c.bezierCurveTo(60, -118, 92, -85, 92, -20);
  c.bezierCurveTo(92 - 8 * pinch, 30, 88 - 12 * pinch, 62, 60, 92);
  c.bezierCurveTo(40, 112, -40, 112, -60, 92);
  c.bezierCurveTo(-88 + 12 * pinch, 62, -92 + 8 * pinch, 30, -92, -20);
  c.bezierCurveTo(-92, -85, -60, -118, 0, -118);
  c.closePath();
}

function ears(c) {
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(s * 92, 8, 14, 23, 0, 0, Math.PI * 2);
    c.fillStyle = SKIN;
    c.fill();
    ink(c);
    c.stroke();
    c.beginPath();
    c.arc(s * 94, 8, 9, s > 0 ? -1.2 : 1.9, s > 0 ? 1.2 : 4.3);
    ink(c, 4);
    c.stroke();
  }
}

function hair(c) {
  c.beginPath(); // a short top with a small quiff; the sides fade (drawn inside the head)
  c.moveTo(-92, -40);
  c.bezierCurveTo(-98, -100, -60, -130, -8, -131);
  c.bezierCurveTo(30, -134, 60, -144, 80, -124);
  c.bezierCurveTo(97, -104, 96, -70, 92, -40);
  c.lineTo(84, -80);
  c.lineTo(-84, -80);
  c.closePath();
  c.fillStyle = HAIR;
  c.fill();
  ink(c);
  c.stroke();
}

function band(c) {
  c.beginPath(); // the sweatband: white, a red stripe
  c.moveTo(-96, -97);
  c.quadraticCurveTo(0, -111, 96, -97);
  c.lineTo(94, -76);
  c.quadraticCurveTo(0, -90, -94, -76);
  c.closePath();
  c.fillStyle = WHITE;
  c.fill();
  ink(c);
  c.stroke();
  c.beginPath();
  c.moveTo(-93, -87);
  c.quadraticCurveTo(0, -100, 93, -87);
  c.strokeStyle = RED;
  c.lineWidth = 6;
  c.stroke();
}

function eye(c, x, f) {
  const y = 2;
  if (f.eye === 'happy') { // squeezed shut by the cheeks
    c.beginPath();
    c.moveTo(x - 17, y + 5);
    c.quadraticCurveTo(x, y - 13, x + 17, y + 5);
    ink(c, 7);
    return c.stroke();
  }
  const wide = f.eye === 'wide';
  const rx = wide ? 23 : 16, ry = wide ? 24 : 14, lid = { lid: 0.32, half: 0.5 }[f.eye] ?? 0;
  c.save();
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = WHITE;
  c.fill();
  c.clip();
  c.beginPath();
  c.arc(x + (x > 0 ? -1 : 1), y + (f.eye === 'up' ? -7 : 2), wide ? 6 : 8, 0, Math.PI * 2);
  c.fillStyle = INK;
  c.fill();
  if (lid) {
    c.fillStyle = SKIN; // a heavy lid: the confident look
    c.fillRect(x - rx - 2, y - ry - 2, 2 * rx + 4, 2 * ry * lid + 2);
    c.beginPath();
    c.moveTo(x - rx, y - ry + 2 * ry * lid);
    c.lineTo(x + rx, y - ry + 2 * ry * lid);
    ink(c, 5);
    c.stroke();
  }
  c.restore();
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ink(c, 5);
  c.stroke();
}

function brows(c, f) {
  const y = -30 - 24 * (f.lift ?? 0), arch = 6 + 10 * (f.lift ?? 0), tilt = f.tilt ?? 0;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 18, y + 40 * tilt);
    c.quadraticCurveTo(s * 40, y - arch, s * 60, y + 2);
    c.strokeStyle = HAIR;
    c.lineWidth = 13;
    c.lineCap = 'round';
    c.stroke();
  }
  if (f.wrinkles) {
    for (const wy of [-61, -70]) {
      c.beginPath();
      c.moveTo(-26, wy + 3);
      c.quadraticCurveTo(0, wy - 4, 26, wy + 3);
      ink(c, 4);
      c.stroke();
    }
  }
}

function mouth(c, f) {
  c.beginPath();
  if (f.mouth === 'smirk') {
    c.moveTo(-26, 64);
    c.quadraticCurveTo(2, 74, 28, 56);
  } else if (f.mouth === 'smile') { // a wide smile, lips closed
    c.moveTo(-46, 54);
    c.quadraticCurveTo(0, 92, 46, 54);
  } else if (f.mouth === 'flat') {
    c.moveTo(-20, 66);
    c.lineTo(20, 66);
  } else {
    const lips = { // filled shapes: a fish pucker, a kiss, a lower lip pushed over the top one
      fish: () => c.ellipse(0, 64, 13, 18, 0, 0, Math.PI * 2),
      pout: () => c.ellipse(2, 64, 21, 14, 0, 0, Math.PI * 2),
      lipOver: () => {
        c.moveTo(-26, 64);
        c.quadraticCurveTo(0, 42, 26, 64);
        c.quadraticCurveTo(0, 78, -26, 64);
      },
    };
    lips[f.mouth]();
    c.fillStyle = LIP;
    c.fill();
    ink(c, 5);
    c.stroke();
    c.beginPath();
    if (f.mouth === 'fish') c.ellipse(0, 64, 4, 8, 0, 0, Math.PI * 2);
    else if (f.mouth === 'pout') c.moveTo(-8, 64), c.quadraticCurveTo(2, 60, 12, 64);
    else c.moveTo(-10, 86), c.quadraticCurveTo(0, 92, 10, 86); // the chin bunches up
  }
  ink(c, ['smirk', 'smile', 'flat'].includes(f.mouth) ? 6 : 4);
  c.stroke();
}

function cheeks(c, f) {
  for (const s of [-1, 1]) {
    if (f.cheeks || f.mouth === 'pout') {
      c.beginPath();
      c.ellipse(s * 52, 34, 17, 9, 0, 0, Math.PI * 2);
      c.fillStyle = 'rgba(229, 80, 60, 0.35)';
      c.fill();
    }
    c.beginPath();
    if (f.cheeks) c.arc(s * 40, 30, 20, Math.PI * 1.15, Math.PI * 1.85); // cheeks pushed up to the eyes
    else if (f.pinch) c.moveTo(s * 58, 30), c.quadraticCurveTo(s * 42, 50, s * 56, 74); // sucked in
    else continue;
    ink(c, 4);
    c.stroke();
  }
}

function sweat(c) {
  c.beginPath();
  c.moveTo(80, -60);
  c.quadraticCurveTo(96, -36, 88, -28);
  c.arc(80, -32, 9, 0.4, Math.PI + 0.6);
  c.closePath();
  c.fillStyle = '#8FD3F5';
  c.fill();
  ink(c, 4);
  c.stroke();
}

// One of FACES, or a face object of the same shape.
export function flexHead(c, face = 'neutral') {
  const f = typeof face === 'string' ? FACES[face] : face;
  const up = f.up ?? 0; // looking at the ceiling: the features move up and the underside of the jaw shows
  c.save();
  c.rotate(-0.1 * up);
  ears(c);
  headPath(c, f.pinch);
  c.fillStyle = SKIN;
  c.fill();
  ink(c);
  c.stroke();
  c.save();
  headPath(c, f.pinch);
  c.clip();
  for (const s of [-1, 1]) { // the fade: dark at the top of the sides, skin by the ears
    const g = c.createLinearGradient(0, -80, 0, -10);
    g.addColorStop(0, 'rgba(30, 26, 23, 0.75)');
    g.addColorStop(1, 'rgba(30, 26, 23, 0)');
    c.fillStyle = g;
    c.fillRect(s > 0 ? 66 : -100, -90, 34, 90);
  }
  c.restore();
  hair(c);
  band(c);
  if (up) {
    c.beginPath();
    c.moveTo(-58, 90);
    c.quadraticCurveTo(0, 70, 58, 90);
    ink(c, 4);
    c.stroke();
  }
  c.translate(0, -24 * up);
  c.scale(1, 1 - 0.12 * up);
  cheeks(c, f);
  eye(c, -38, f);
  eye(c, 38, f);
  brows(c, f);
  c.beginPath(); // the nose
  c.moveTo(-3, 10);
  c.quadraticCurveTo(-13, 33, -2, 38);
  c.lineTo(7, 37);
  ink(c, 5);
  c.stroke();
  mouth(c, f);
  c.restore();
  if (f.sweat) sweat(c);
}
