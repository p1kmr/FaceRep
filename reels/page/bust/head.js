// A bust's head (reels/page/bust): the face outline from a table of points (Brody's blends with k: 0 a round,
// chubby face, 1 an angled jaw, clean-shaven), the skin's light and shade, a warm rim light on the right, the ears.

import { LP, M, P, clip, ell, fill, stroke } from './pen.js';

const KEYS = ['t', 'c1', 'c2', 'j1', 'q', 'j2', 'c3', 'c4', 'ch', 'c5', 'c6', 'b'];

// The right side of the face, temple to chin, [round, angled] per point. shade: the inner edge of the right shadow.
export const BRODY_HEAD = {
  t: [[92, -60], [88, -60]], c1: [[106, -20], [101, -8]], c2: [[114, 40], [84, 40]], j1: [[108, 78], [83, 66]],
  q: [[104, 110], [87, 82]], j2: [[84, 122], [78, 90]], c3: [[70, 134], [60, 105]], c4: [[56, 142], [42, 120]],
  ch: [[40, 142], [24, 134]], c5: [[26, 146], [16, 140]], c6: [[12, 146], [8, 141]], b: [[0, 146], [0, 141]],
  shade: [[[72, -80], [88, -40], [96, -6], [96, 18], [96, 40], [94, 56], [90, 72], [84, 100], [64, 126], [30, 150]],
    [[60, -80], [72, -40], [80, -6], [74, 18], [64, 38], [56, 52], [64, 68], [72, 82], [58, 102], [24, 136]]],
};

const one = (t) => Object.fromEntries(Object.entries(t).map(([key, v]) => [key, [v, v]]));
export const KAYLA_HEAD = one({
  t: [84, -62], c1: [92, -16], c2: [88, 36], j1: [80, 70], q: [76, 86], j2: [64, 100], c3: [50, 114], c4: [32, 127],
  ch: [20, 132], c5: [12, 135], c6: [5, 136], b: [0, 136],
  shade: [[64, -80], [76, -40], [82, -6], [78, 18], [72, 38], [66, 52], [68, 68], [66, 84], [54, 104], [24, 132]],
});

// The outline for this k; pinch draws the cheeks in (Fish Face). Returns the path, the jaw alone, its corners and
// the right shadow.
export function head(T, k = 0, pinch = 0) {
  const p = {};
  for (const key of KEYS) p[key] = LP(T[key][0], T[key][1], k);
  for (const key of ['c2', 'j1', 'q']) p[key] = [p[key][0] - 10 * pinch, p[key][1]];
  const lower = `Q ${P(p.q)} ${P(p.j2)} C ${P(p.c3)} ${P(p.c4)} ${P(p.ch)} C ${P(p.c5)} ${P(p.c6)} ${P(p.b)} ` +
    `C ${P(M(p.c6))} ${P(M(p.c5))} ${P(M(p.ch))} C ${P(M(p.c4))} ${P(M(p.c3))} ${P(M(p.j2))} Q ${P(M(p.q))} ${P(M(p.j1))}`;
  const w = p.t[0];
  const d = `M ${P(p.t)} C ${P(p.c1)} ${P(p.c2)} ${P(p.j1)} ${lower} C ${P(M(p.c2))} ${P(M(p.c1))} ${P(M(p.t))} ` +
    `C ${-w - 2} -112, -58 -152, 0 -152 C 58 -152, ${w + 2} -112, ${P(p.t)} Z`;
  const s = T.shade[0].map((a, i) => LP(a, T.shade[1][i], k));
  const shade = `M ${P(s[0])} C ${P(s[1])} ${P(s[2])} ${P(s[3])} C ${P(s[4])} ${P(s[5])} ${P(s[6])} ` +
    `C ${P(s[7])} ${P(s[8])} ${P(s[9])} L 160 170 L 160 -90 Z`;
  return { d, jaw: `M ${P(p.j1)} ${lower}`, j1: p.j1, j2: p.j2, chin: p.b, w, shade };
}

// The skin of the head. o: dc (a double chin, 0-1), chad (cheekbones and a lit jaw edge, 0-1), round (puffy cheek
// folds, 0-1), blush, pinch (Fish Face hollows), cheeks (cheeks lifted in a big smile), rim (the rim light colour).
export function skin(H, pal, { dc = 0, chad = 0, round = 0, blush = 0.2, pinch = 0, cheeks = 0, rim = '#FFF1D8' } = {}) {
  if (dc > 0) {
    const d = `M -84 110 C -78 160, -40 ${150 + 26 * dc}, 0 ${152 + 26 * dc} C 40 ${150 + 26 * dc}, 78 160, 84 110 Z`;
    fill(d, pal.base);
    fill(d, pal.shade, 0.5);
    stroke(d, 3, undefined, dc);
  }
  fill(H.d, pal.base);
  clip(H.d, () => {
    fill(H.shade, pal.shade);
    for (const s of [-1, 1]) {
      fill(`M ${s * 98} 10 C ${s * 86} 20, ${s * 74} 34, ${s * 64} 56 C ${s * 80} 44, ${s * 90} 34, ${s * 100} 30 Z`,
        s < 0 ? pal.shade : pal.deep, Math.min(1, 0.8 * chad + pinch));
      fill(ell(s * 39, -14, 27, 10), pal.shade, 0.55);
      fill(ell(s * 64, 44 - 8 * cheeks, 26, 14), '#F49A8E', blush + 0.25 * cheeks);
      fill(ell(s * 60, 30 - 6 * cheeks, 16, 9), pal.light, 0.6 * cheeks);
    }
    fill(ell(-24, -74, 30, 10), pal.light, 0.35);
    fill(ell(-60, 14, 17, 7), pal.light, 0.75 * chad);
    fill(ell(-70, 44, 22, 13), pal.light, 0.5 * round);
    fill(ell(-8, H.chin[1] - 12, 16, 7), pal.light, 0.6 * chad);
    stroke('M -56 62 Q -50 80 -38 90 M 56 62 Q 50 80 38 90', 2.5, pal.deep, 0.45 * round);
    stroke('M -66 30 Q -58 52 -52 70 M 66 30 Q 58 52 52 70', 2.5, pal.deep, 0.7 * pinch);
    g2(() => stroke(H.jaw, 10, pal.light, 0.55 * chad), -200, 0);
    g2(() => stroke(H.d, 7, rim, 0.55), 40, 200);
  });
  stroke(H.d, 3.2);
}

// Draw only between x0 and x1 (a lit edge on one side).
function g2(draw, x0, x1) {
  clip(`M ${x0} -300 L ${x1} -300 L ${x1} 300 L ${x0} 300 Z`, draw);
}

export function ears(x, pal, hoop = null) {
  for (const s of [-1, 1]) {
    const e = s * x;
    const d = `M ${e} -14 C ${e + s * 15} -26, ${e + s * 28} -8, ${e + s * 24} 16 C ${e + s * 21} 34, ${e + s * 15} 48, ${e} 56 Z`;
    fill(d, pal.base);
    fill(`M ${e + s * 4} -4 C ${e + s * 16} -10, ${e + s * 20} 10, ${e + s * 16} 24 C ${e + s * 12} 34, ${e + s * 8} 40, ${e + s * 2} 44 Z`, pal.shade);
    stroke(d, 3);
    stroke(`M ${e + s * 8} -6 C ${e + s * 18} -4, ${e + s * 18} 18, ${e + s * 10} 32`, 2, undefined, 0.7);
    if (hoop) stroke(ell(e + s * 8, 64, 9, 11), 3.5, hoop);
  }
}
