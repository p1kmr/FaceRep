// Brody's one hairstyle on every day (reels/page/bust), the anime look the owner picked: messy blond spikes on top,
// pointed bangs that stop just above the brows (one strand between them), side locks over the front of the ears,
// a jagged shine band, and the bangs' shadow on the forehead. pal: { base, shade, light, line }. headD: the head's
// outline (head.js), so the shadow stays on the skin; skinShade: the skin's shade colour.

import { clip, ctx, ell, fill, stroke } from './pen.js';

// [x, y, bend]: round the hair, tips and valleys taking turns; bend curves the edge to the next point.
// Outside, from the left side lock's tip over the top to the right one's; the side locks point down and out.
const OUTER = [[-98, 36, -0.12], [-114, -2, 0.1], [-140, 12, -0.12], [-126, -50, 0.1], [-154, -36, -0.12],
  [-138, -108, 0.1], [-156, -92, -0.12], [-120, -150, 0.1], [-132, -184, -0.12], [-90, -186, 0.1],
  [-82, -220, -0.12], [-46, -206, 0.1], [-20, -234, -0.12], [8, -214, 0.1], [42, -232, -0.12], [66, -206, 0.1],
  [102, -214, -0.12], [108, -180, 0.1], [140, -170, -0.12], [120, -150, 0.1], [156, -92, -0.12], [138, -108, 0.1],
  [154, -36, -0.12], [126, -50, 0.1], [140, 12, -0.12], [114, -2, 0.1], [100, 36, 0.06]];
// The inside, right to left: the right lock's inner edge, the bangs (tips above the brows, which top out at y -48;
// the long one hangs between them), the left lock's inner edge.
const FRINGE = [[88, -30, -0.06], [80, -96, 0.12], [74, -52, -0.1], [60, -94, 0.1], [44, -60, -0.1], [30, -98, 0.12],
  [2, -36, -0.08], [-8, -96, 0.12], [-26, -60, -0.1], [-42, -98, 0.12], [-62, -50, -0.1], [-76, -92, 0.12],
  [-88, -30, -0.06]];
const TIPS = FRINGE.filter((p, i) => i % 2 === 0 && i > 0 && i < FRINGE.length - 1);

const f1 = (n) => n.toFixed(1);
function edge(pts, close) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  const n = close ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const [x0, y0, b] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    d += ` Q ${f1((x0 + x1) / 2 - (y1 - y0) * b)} ${f1((y0 + y1) / 2 + (x1 - x0) * b)} ${x1} ${y1}`;
  }
  return close ? `${d} Z` : d;
}
const HAIR = edge([...OUTER, ...FRINGE], true);
const BANGS = edge(FRINGE, false);

// The shine: a band of light with a zigzag edge, curved round the top of the head.
function shine() {
  const top = [], low = [];
  for (let x = -130, i = 0; x <= 130; x += 16, i++) {
    const y = -178 + (x * x) / 420;
    top.push(`${x} ${f1(y + (i % 2 ? -5 : 5))}`);
    low.unshift(`${x} ${f1(y + (i % 2 ? 10 : 18))}`);
  }
  return `M ${top.join(' L ')} L ${low.join(' L ')} Z`;
}
const SHINE = shine();

export function spikyHair(pal, headD, skinShade) {
  clip(headD, () => {
    const g = ctx();
    g.save();
    g.translate(5, 10);
    fill(HAIR, skinShade, 0.85);
    g.restore();
  });
  fill(HAIR, pal.base);
  clip(HAIR, () => {
    fill('M 44 -260 L 200 -260 L 200 60 L 76 60 L 90 -40 L 64 -130 Z', pal.shade, 0.55);
    stroke(BANGS, 20, pal.shade, 0.5);
    for (const [x, y] of TIPS) stroke(`M ${f1(x * 0.45)} -176 Q ${f1(x * 0.85)} -124 ${x} ${y - 12}`, 2.4, pal.shade, 0.85);
    for (const [x, y] of OUTER.filter((p, i) => i % 2 === 0 && p[1] < -60)) {
      stroke(`M ${f1(x * 0.35)} -150 Q ${f1(x * 0.7)} ${f1((y - 150) / 2)} ${f1(x * 0.92)} ${f1(y * 0.92)}`, 2.2, pal.shade, 0.7);
    }
    fill(ell(-56, -186, 52, 20), pal.light, 0.4);
    fill(SHINE, pal.light, 0.85);
  });
  stroke(HAIR, 3.2, pal.line);
}
