// Option 3, Zach, 19: the gamer. Fluffy dark-brown hair with a fringe, a periwinkle hoodie with the hood down, a
// headset round his neck, one hand in the hoodie pocket and a lime energy drink in the other. Streams, speaks to
// "chat", does his face reps between games.

import { INK, WHITE, box, flat, lerp, line, oval, shape, tone, tube } from './pen.js';
import { hand, torsoPath } from './body.js';

export const zach = {
  name: 'Zach',
  body: { headW: 232, headH: 256, jaw: 0.25, thigh: 120, shin: 112, ankle: 32, torso: 192, neck: 16, neckW: 50, sw: 104,
    hw: 90, hipJoint: 40, armIn: 14, upper: 104, fore: 94, armW: 54, legW: 62, hand: 28 },
  c: { skin: '#F8DCCB', skinShade: '#E6B8A0', hair: '#5B3A27', brow: '#46291A', top: '#7183C9', bottom: '#2B2D3A',
    shoe: '#F4F1EA', shoeAccent: '#7183C9', can: '#B9EC3C', set: '#22232B' },
  face: { eyeX: 46, eyeY: 20, eyeRx: 24, eyeRy: 28, mouthY: 90, iris: '#8B6B3D', fringe: true, brow: { y: -38, t: 12 } },
  pose: { arms: { L: [-14, 72], R: [26, -132] }, tilt: -3 },
  mood: { eyes: 'open', brows: 'up', mouth: 'grin', look: [-0.2, 0] },

  top({ b, c, sY, hipY }) {
    shape(torsoPath(b, sY, hipY, 46, 10), c.top, { off: 16 });
    shape(`M -76 ${sY + 6} C -80 ${sY - 34}, 80 ${sY - 34}, 76 ${sY + 6} C 50 ${sY + 40}, -50 ${sY + 40}, -76 ${sY + 6} Z`, tone(c.top, 0.82), { off: 0, ink: 7 });
    box(-b.hw - 22, hipY + 22, 2 * b.hw + 44, 26, 10, tone(c.top, 0.88), { off: 0, ink: 7 });
    for (const s of [-1, 1]) line(`M ${s * 20} ${sY + 30} C ${s * 22} ${sY + 70}, ${s * 18} ${sY + 90}, ${s * 22} ${sY + 112}`, 6, WHITE);
  },
  front({ sY, c }) { // the headset, round his neck
    line(`M -88 ${sY - 8} C -70 ${sY + 46}, 70 ${sY + 46}, 88 ${sY - 8}`, 24, INK);
    line(`M -88 ${sY - 8} C -70 ${sY + 46}, 70 ${sY + 46}, 88 ${sY - 8}`, 12, c.set);
    for (const s of [-1, 1]) {
      oval(s * 86, sY - 2, 30, 36, c.set, { off: 6 });
      oval(s * 86, sY - 2, 16, 20, '#FF5A6E', { off: 0, ink: 0, alpha: 0.9 });
    }
  },
  arm({ b, c }, a) {
    shape(tube([a.start, a.mid, lerp(a.mid, a.end, 0.84)], [b.armW * 0.56, b.armW * 0.52, b.armW * 0.52]), c.top, { off: 10 });
    const cuff = lerp(a.mid, a.end, 0.84);
    oval(cuff[0], cuff[1], b.armW * 0.5, b.armW * 0.5, tone(c.top, 0.88), { off: 0, ink: 6 });
  },
  holds: {
    L: () => true, // in the hoodie pocket (drawn after, over it)
    R(ctx, a, sg) { // a lime energy drink with a bolt
      const [x, y] = a.end;
      box(x - 26, y - 92, 52, 116, 12, ctx.c.can, { off: 9, gloss: 0.3 });
      flat(`M ${x + 4} ${y - 70} L ${x - 10} ${y - 34} L ${x + 2} ${y - 34} L ${x - 6} ${y - 2} L ${x + 12} ${y - 44} L ${x} ${y - 44} Z`, WHITE);
      box(x - 22, y - 100, 44, 12, 5, '#D7DCE0', { off: 0, ink: 6 });
      hand(a.end, a.dir, ctx.c.skin, ctx.b.hand, sg);
      return true;
    },
  },
  after({ b, c, hipY }) { // the hoodie pocket, over the hidden hand
    shape(`M -66 ${hipY + 20} L -52 ${hipY - 54} L 52 ${hipY - 54} L 66 ${hipY + 20} Z`, tone(c.top, 0.9), { off: 0, ink: 7 });
  },
  hairFront({ c }) {
    shape('M -126 4 C -150 -40, -152 -100, -122 -130 Q -126 -172, -80 -174 Q -62 -204, -16 -188 Q 22 -210, 58 -184 ' +
      'Q 104 -188, 114 -146 Q 152 -118, 136 -60 C 142 -30, 134 -10, 126 4 ' +
      'C 122 -28, 112 -40, 100 -48 Q 94 -30 84 -26 Q 80 -46 66 -56 Q 56 -30 42 -24 Q 38 -48 24 -54 Q 12 -30 -2 -22 ' +
      'Q -8 -46 -22 -54 Q -32 -30 -46 -26 Q -50 -48 -64 -56 Q -74 -32 -86 -28 Q -92 -44 -102 -48 C -112 -40, -124 -28, -126 4 Z',
    c.hair, { off: 14, gloss: 0.16 });
    line('M -70 -150 C -40 -166, 10 -170, 50 -156 M -96 -110 C -70 -130, -40 -132, -16 -124', 5, tone(c.hair, 1.35), 0.55);
  },
};
