// A bust's neck, clothes and hands (reels/page/bust). The clothes cover the shoulders up to the sides of the neck
// and open in a collar between: a tee, a hoodie (its hood bunched behind the neck) or Kayla's zip top. The hands
// come up from the bottom of the picture: one holding a phone (its back to us), one holding a bag of chips.

import { L, ctx, clip, ell, fill, stroke } from './pen.js';

export const TEE = { base: '#26355A', shade: '#19233D', light: '#3A4C78' };
export const HOODIE = { base: '#8E919C', shade: '#6F727D', light: '#A9ACB6' };
export const LAVENDER = { base: '#C9B4EA', shade: '#AE96D6', light: '#DCCDF3' };

// The hood, behind the neck: draw before neck().
export function hood(nb, sh, pal = HOODIE) {
  const d = `M -230 ${sh + 10} C -246 ${nb - 70}, -120 ${nb - 96}, 0 ${nb - 96} C 120 ${nb - 96}, 246 ${nb - 70}, 230 ${sh + 10} Z`;
  fill(d, pal.shade);
  stroke(d, 3);
}

// The neck under the head H: the jaw's shadow (drop: how far below the jaw), the right side in shade, the neck's
// muscles (lines, 0-1) and, for Chin Lift, the strain of the front bands (strain, 0-1).
export function neck(H, skin, { nw, nb, drop = 20, lines = 0, strain = 0, rim = '#FFF1D8' }) {
  const d = `M ${-nw} 30 L ${-nw - 4} ${nb + 70} L ${nw + 4} ${nb + 70} L ${nw} 30 Z`;
  fill(d, skin.base);
  clip(d, () => {
    const g = ctx();
    g.save();
    g.translate(5, drop);
    fill(H.d, skin.deep, 0.85);
    g.restore();
    fill('M 34 0 L 200 0 L 200 400 L 44 400 Z', skin.shade, 0.5);
    stroke(`M -50 96 Q -36 ${nb} -10 ${nb + 50} M 50 96 Q 36 ${nb} 10 ${nb + 50}`, 2.6, skin.deep, 0.8 * lines);
    stroke(`M -7 ${nb - 4} Q 0 ${nb - 11} 7 ${nb - 4}`, 2.4, skin.deep, 0.8 * lines);
    stroke(`M -28 112 L -24 ${nb + 40} M 28 112 L 24 ${nb + 40}`, 2.6, skin.deep, strain);
    stroke(`M ${nw - 4} 40 L ${nw - 2} ${nb + 60}`, 5, rim, 0.6);
  });
  stroke(`M ${-nw} 30 L ${-nw - 3} ${nb + 40} M ${nw} 30 L ${nw + 3} ${nb + 40}`, 3);
}

// The clothes. kind: tee, hoodie or zip. sx: the shoulders' half width; shrug (0-1) lifts the shoulders.
export function torso(kind, pal, { nw, nb, sh, sx = 330, shrug = 0, chest = 0 }) {
  const y = sh - 34 * shrug, open = { tee: 50, hoodie: 100, zip: 26 }[kind], e = sx + 50;
  const top = `M ${-e} 480 L ${-e} ${y + 40} Q ${-e + 8} ${y} ${-sx} ${y - 6} C ${-sx * 0.7} ${y - 16}, ${-sx * 0.45} ${nb + 26}, ${-nw - 6} ${nb} ` +
    `Q ${-nw * 0.6} ${nb + open} 0 ${nb + open + 4} Q ${nw * 0.6} ${nb + open} ${nw + 6} ${nb} ` +
    `C ${sx * 0.45} ${nb + 26}, ${sx * 0.7} ${y - 16}, ${sx} ${y - 6} Q ${e - 8} ${y} ${e} ${y + 40} L ${e} 480 Z`;
  fill(top, pal.base);
  clip(top, () => {
    fill('M 120 150 L 420 150 L 420 500 L 70 500 Z', pal.shade, 0.7);
    fill(`M ${-sx} ${y - 12} C ${-sx * 0.8} ${y - 24}, ${-sx * 0.6} ${y - 10}, ${-sx * 0.45} ${nb + 40} C ${-sx * 0.66} ${y + 20}, ${-sx * 0.88} ${y + 30}, ${-sx - 20} ${y + 50} Z`, pal.light, 0.6);
    stroke(`M -200 ${y + 104} Q -100 ${y + 128} -14 ${y + 104} M 200 ${y + 104} Q 100 ${y + 128} 14 ${y + 104}`, 4, pal.shade, chest);
    if (kind === 'zip') stroke(`M 0 ${nb + open + 4} L 0 480`, 4, pal.shade);
  });
  stroke(top, 3);
  const collar = `M ${-nw - 6} ${nb} Q ${-nw * 0.6} ${nb + open} 0 ${nb + open + 4} Q ${nw * 0.6} ${nb + open} ${nw + 6} ${nb}`;
  const band = { tee: 11, hoodie: 24, zip: 16 }[kind];
  stroke(collar, band + 5);
  stroke(collar, band, pal.light);
  if (kind === 'hoodie') {
    for (const s of [-1, 1]) {
      const d = `M ${s * 30} ${nb + open - 6} C ${s * 36} ${nb + open + 40}, ${s * 28} ${nb + open + 80}, ${s * 34} ${nb + open + 120}`;
      stroke(d, 7);
      stroke(d, 4.5, '#F2F2F2');
    }
  }
  if (kind === 'zip') {
    fill(`M -5 ${nb + open + 8} L 5 ${nb + open + 8} L 6 ${nb + open + 34} L -6 ${nb + open + 34} Z`, '#E8E0F4');
    stroke(`M -5 ${nb + open + 8} L 5 ${nb + open + 8} L 6 ${nb + open + 34} L -6 ${nb + open + 34} Z`, 2);
  }
}

function forearm(sleeve, side) {
  const arm = `M ${side * 10} 40 C ${side * 20} 120, ${side * 40} 200, ${side * 60} 300 L ${side * 160} 300 C ${side * 130} 200, ${side * 96} 120, ${side * 74} 40 Z`;
  fill(arm, sleeve.base);
  clip(arm, () => fill(`M ${side * 64} 0 L ${side * 220} 0 L ${side * 220} 320 L ${side * 90} 320 Z`, sleeve.shade, 0.6));
  stroke(arm, 3);
}

function fingers(skin, xs, y, rx, ry) {
  for (const [x, dy] of xs) {
    fill(ell(x, y + dy, rx, ry), skin.base);
    stroke(ell(x, y + dy, rx, ry), 2.4);
  }
}

// A hand holding a phone, its back to us, at x, y (the phone's middle), turned deg degrees.
export function phoneHand(x, y, skin, sleeve, deg = -12) {
  const g = ctx();
  g.save();
  g.translate(x, y);
  g.rotate((deg * Math.PI) / 180);
  forearm(sleeve, 1);
  fill(ell(34, 40, 42, 34), skin.base);
  stroke(ell(34, 40, 42, 34), 3);
  const phone = new Path2D();
  phone.roundRect(-38, -72, 76, 136, 14);
  fill(phone, '#1F2333');
  fill('M -30 -64 L 10 -64 L -30 40 Z', '#FFFFFF', 0.06);
  stroke(phone, 3);
  const cam = new Path2D();
  cam.roundRect(-28, -62, 28, 30, 7);
  fill(cam, '#2E3448');
  for (const [cx, cy] of [[-20, -54], [-20, -40], [-8, -47]]) fill(ell(cx, cy, 4.4, 4.4), '#0E1018');
  fingers(skin, [[-40, -26], [-41, -6], [-40, 14], [-37, 32]], 0, 13, 9);
  fingers(skin, [[40, 0]], 0, 10, 17);
  g.restore();
}

// A hand holding a bag of chips at x, y (the bag's middle), turned deg degrees.
export function chipsHand(x, y, skin, sleeve, deg = 8) {
  const g = ctx();
  g.save();
  g.translate(x, y);
  g.rotate((deg * Math.PI) / 180);
  forearm(sleeve, -1);
  const bag = 'M -62 -84 L -40 -92 L -20 -82 L 0 -94 L 22 -84 L 44 -94 L 62 -82 L 70 72 L 40 80 L 0 70 L -40 82 L -70 72 Z';
  fill(bag, '#FF8A3D');
  clip(bag, () => fill('M 20 -100 L 90 -100 L 90 90 L 30 90 Z', '#E0661E', 0.7));
  stroke(bag, 3);
  fill(ell(0, -6, 38, 30), '#FFFFFF');
  stroke(ell(0, -6, 38, 30), 2.4);
  fill(ell(0, -6, 20, 14), '#FFC93C');
  fingers(skin, [[-36, 0], [-12, 4], [12, 4], [34, 0]], 58, 13, 16);
  g.restore();
}

export const shoulders = (k) => ({ nw: L(96, 64, k), nb: L(170, 160, k), sh: L(286, 248, k) });
