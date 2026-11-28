// A bust's eyes, brows, nose and mouth (reels/page/bust), in the bust's units (eye line y 0, eyes at x ±39).
// shape runs 0 (rounder, softer) to 1 (an almond eye, outer corner higher; thick straight brows). The app's
// exercises are mouths too: fish (Fish Face), big (Cheek Lift), pout (Chin Lift: the lower lip pushed up).

import { L, LINE, P, clip, ell, fill, stroke } from './pen.js';

// One eye. o: shape, iris, lid (0-0.6, how far the upper lid comes down), look [x, y], kind (open, wide, closed,
// happy), lashes, bags (0-1), skin (the lid's colour). s: -1 the left of the picture, 1 the right.
export function eye(s, o) {
  const k = o.shape ?? 1, kind = o.kind ?? 'open';
  if (kind === 'closed' || kind === 'happy') {
    const up = kind === 'happy' ? -1 : 1;
    stroke(`M ${s * 20} 2 Q ${s * 38} ${2 + up * 9} ${s * 57} ${kind === 'happy' ? 2 : -1}`, 3.8);
    if (o.lashes) stroke(`M ${s * 57} -1 l ${s * 7} -4`, 2.6);
    return;
  }
  const wide = kind === 'wide' ? 4 : 0;
  const io = [s * 20, 2], oo = [s * 58, L(0, -3, k)];
  const u1 = [s * 26, L(-13, -12, k) - wide], u2 = [s * 48, L(-14, -15, k) - wide];
  const l1 = [s * 30, L(11, 9, k) + wide / 2], l2 = [s * 48, L(10, 7, k) + wide / 2];
  const top = `M ${P(io)} C ${P(u1)} ${P(u2)} ${P(oo)}`, all = `${top} C ${P(l2)} ${P(l1)} ${P(io)} Z`;
  const lid = kind === 'wide' ? 0 : o.lid ?? 0, look = o.look ?? [0, 0];
  const yi = -10 + lid * 22, yo = L(-12, -15, k) + lid * 22;
  fill(all, '#FBF7F2');
  clip(all, () => {
    const r = kind === 'wide' ? 8 : 9.5, ix = s * 39 + look[0] * 5, iy = look[1] * 3;
    fill(ell(ix, iy, r, r), o.iris);
    fill(ell(ix, iy - 3, r, r * 0.68), '#000000', 0.18);
    fill(ell(ix, iy, r * 0.44, r * 0.46), '#151018');
    fill(ell(ix - 3, iy - 3.5, 2.3, 2.3), '#FFFFFF');
    stroke(top, 7, 'rgba(70,40,30,0.25)');
    if (lid) fill(`M ${s * 14} -30 L ${s * 64} -30 L ${s * 64} ${yo} L ${s * 14} ${yi} Z`, o.skin);
  });
  if (lid > 0.2) stroke(`M ${s * 20} ${yi + 1} Q ${s * 38} ${(yi + yo) / 2 - 3} ${s * 57} ${yo + 1}`, 3.8);
  else stroke(top, 3.8);
  stroke(`M ${P(oo)} l ${s * 6} -3`, 2.6);
  if (o.lashes) stroke(`M ${P(oo)} l ${s * 9} -7 M ${s * 50} ${L(-14, -15, k) - wide} l ${s * 5} -7`, 2.4);
  stroke(`M ${P(io)} C ${P(l1)} ${P(l2)} ${P(oo)}`, 1.6, LINE, 0.5);
  stroke(`M ${s * 22} ${-17 - wide} Q ${s * 40} ${-23 - wide} ${s * 57} ${-14 - wide}`, 1.6, LINE, 0.5);
  if (o.bags) stroke(`M ${s * 24} 14 Q ${s * 38} 22 ${s * 54} 12`, 2.4, '#8E6A9E', 0.8 * o.bags);
}

// [inner, peak] lift of each brow by mood; cocky raises the right brow only.
const MOODS = { flat: [0, 0], worried: [-9, -3], angry: [7, 2], up: [-7, -6] };

// Brows, thick at the inner end, a low peak two thirds out. o: shape, mood, color, thin (a narrower, arched brow).
export function brows(o) {
  for (const s of [-1, 1]) {
    let [di, dp] = MOODS[o.mood] ?? MOODS.flat;
    if (o.mood === 'cocky') [di, dp] = s < 0 ? [3, 2] : [-6, -8];
    const t = o.thin ? 0.55 : L(0.75, 1, o.shape ?? 1), arch = o.thin ? -5 : 0;
    const d = `M ${s * 14} ${-29 + di} C ${s * 26} ${-35 + di}, ${s * 40} ${-40 + dp + arch}, ${s * 50} ${-38 + dp + arch} ` +
      `C ${s * 58} ${-36 + dp}, ${s * 64} -32, ${s * 69} -27 C ${s * 60} -28, ${s * 50} ${-40 + dp + arch + 10 * t}, ` +
      `${s * 40} ${-40 + dp + arch + 11 * t} C ${s * 28} ${-37 + di + 12 * t}, ${s * 20} ${-31 + di + 12 * t}, ${s * 14} ${-29 + di + 11 * t} Z`;
    fill(d, o.color);
    stroke(d, 1.4, LINE, 0.5);
  }
}

// The nose: the shade down its right side, the tip's light and the base. w: half the width of the nostrils.
export function nose(pal, w = 15) {
  fill(`M 3 -18 C 9 4, 14 24, ${w + 3} 42 C ${w} 47, 10 49, 6 48 C 6 28, 4 6, 0 -16 Z`, pal.shade, 0.95);
  fill(ell(1, 63, 20, 5), pal.shade, 0.7);
  stroke('M -2 -6 L -4 34', 4, pal.light, 0.75);
  fill(ell(-3, 45, 6, 4), pal.light, 0.8);
  stroke(`M ${-w} 44 C ${-w - 4} 50, ${-w - 2} 55, ${-w + 5} 57 M ${w} 44 C ${w + 4} 50, ${w + 2} 55, ${w - 5} 57`, 2.4);
  stroke(`M ${-w + 6} 55 C -6 60, 6 60, ${w - 6} 55`, 2.6);
  for (const s of [-1, 1]) fill(ell(s * 7, 55, 3.4, 1.7), LINE, 0.65);
}

// The mouth. kind: flat, smile, smirk, grin, big (Cheek Lift), o, fish (Fish Face), pout (Chin Lift).
// lip and upper: the lips' colours; full: fuller lips (Kayla).
export function mouth(kind, { lip = '#D68B7D', upper = '#B8706A', full = false } = {}) {
  const f = full ? 3 : 0;
  if (kind === 'grin' || kind === 'big') {
    const w = kind === 'big' ? 36 : 30, d = kind === 'big' ? 104 : 100;
    const open = `M ${-w} 78 Q 0 74 ${w} 78 Q ${w - 8} ${d} 0 ${d + 2} Q ${-w + 8} ${d} ${-w} 78 Z`;
    fill(open, '#5A2028');
    clip(open, () => {
      fill(`M ${-w} 70 L ${w} 70 L ${w} 86 Q 0 90 ${-w} 86 Z`, '#FFFFFF');
      fill(ell(0, d - 2, w * 0.45, 6), '#E07A7A');
    });
    stroke(open, 2.8);
    return;
  }
  if (kind === 'o') {
    fill(ell(0, 88, 9, 11), '#5A2028');
    stroke(ell(0, 88, 9, 11), 2.6);
    return;
  }
  if (kind === 'fish') {
    fill(ell(0, 86, 13, 15), lip);
    fill(ell(0, 86, 4, 8), '#5A2028');
    stroke(ell(0, 86, 13, 15), 2.4);
    fill(ell(-4, 79, 4, 2.4), '#FFFFFF', 0.5);
    return;
  }
  if (kind === 'pout') {
    const d = 'M -22 84 C -12 70, 12 70, 22 84 C 12 91, -12 91, -22 84 Z';
    fill(d, lip);
    stroke(d, 2.4);
    stroke('M -10 104 Q 0 100 10 104', 2, LINE, 0.4);
    return;
  }
  const LINES = { flat: 'M -16 84 Q 0 86 16 84', smile: 'M -30 79 Q 0 92 30 79', smirk: 'M -26 81 C -12 83, 10 83, 28 77 Q 31 75 33 72' };
  if (kind !== 'flat') fill(`M -25 ${80 - f} C -16 ${75 - f}, -6 ${76 - f}, 0 ${78 - f} C 6 ${76 - f}, 16 ${75 - f}, 27 ${78 - f} C 14 82, -12 83, -25 81 Z`, upper);
  stroke(LINES[kind] ?? LINES.flat, 2.8);
  const lw = kind === 'flat' ? 12 : 18;
  fill(`M ${-lw} 86 C -8 ${94 + f}, 8 ${94 + f}, ${lw} 86 C 8 ${89 + f / 2}, -8 ${89 + f / 2}, ${-lw} 86 Z`, lip);
  fill(ell(-4, 89, 6, 1.8), '#FFFFFF', 0.35);
}
