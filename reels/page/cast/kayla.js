// Option 2, Kayla, 21: the "that girl" morning-routine girl. Honey-blonde high ponytail with a pink scrunchie,
// face-framing strands, a matching lavender set, small gold hoops and a pink iced-coffee tumbler. Calm, organised,
// does her face routine every morning; the one who gets it right.

import { INK, WHITE, box, lerp, line, oval, shape, tone, tube } from './pen.js';
import { hand, torsoPath } from './body.js';

export const kayla = {
  name: 'Kayla',
  body: { headW: 228, headH: 256, jaw: 0, thigh: 126, shin: 118, ankle: 28, torso: 186, neck: 24, neckW: 44, sw: 82,
    hw: 74, hipJoint: 38, armIn: 14, upper: 100, fore: 92, armW: 36, legW: 46, hand: 26 },
  c: { skin: '#F7D3BE', skinShade: '#E7AF93', hair: '#DDA65F', brow: '#A8763D', top: '#C9B4EA', bottom: '#B29BDC',
    shoe: '#FFFFFF', shoeAccent: '#C9B4EA', scrunchie: '#F6A3BE', cup: '#F8B9CB' },
  face: { eyeX: 44, eyeY: 18, eyeRx: 24, eyeRy: 29, mouthY: 90, iris: '#4FAE7C', lashes: true, lip: '#E37C8E',
    brow: { t: 9, w: 48, y: -32 }, blush: 1.3 },
  pose: { arms: { L: [-152, 6], R: [16, -142] }, hands: { L: 'peace' }, tilt: 5 },
  mood: { eyes: 'wink', brows: 'up', mouth: 'grin' },

  hairBack({ c }) {
    shape('M 0 -128 C 70 -210, 190 -170, 160 -50 C 146 20, 184 110, 128 180 C 124 100, 96 10, 56 -96 Z', c.hair, { off: 14 });
    line('M 100 -150 C 150 -110, 140 -40, 148 30', 5, tone(c.hair, 0.75), 0.7);
  },
  top({ b, c, sY, hipY }) {
    shape(torsoPath(b, sY, hipY, 6), c.top, { off: 14 });
    line(`M 0 ${sY + 18} L 0 ${hipY}`, 5, tone(c.top, 0.7));
    box(-7, sY + 16, 14, 26, 4, '#EDE6F7', { ink: 4, off: 0 });
    line(`M -40 ${sY + 2} Q 0 ${sY + 34} 40 ${sY + 2}`, 7, INK);
    line(`M ${-b.hw - 12} ${hipY + 2} L ${b.hw + 12} ${hipY + 2}`, 5, tone(c.top, 0.75));
  },
  arm({ b, c }, a) {
    shape(tube([a.start, a.mid, lerp(a.mid, a.end, 0.86)], [b.armW * 0.56, b.armW * 0.5, b.armW * 0.48]), c.top, { off: 8 });
  },
  holds: {
    R(ctx, a, sg) { // the iced coffee: a tall pink tumbler with a straw, held in front of her
      const [x, y] = a.end;
      line(`M ${x + 6} ${y - 118} L ${x + 18} ${y - 168}`, 9, WHITE);
      line(`M ${x + 6} ${y - 118} L ${x + 18} ${y - 168}`, 3, INK, 0.5);
      shape(`M ${x - 34} ${y - 108} L ${x + 34} ${y - 108} L ${x + 26} ${y + 54} Q ${x} ${y + 62} ${x - 26} ${y + 54} Z`, ctx.c.cup, { off: 10, gloss: 0.25 });
      box(x - 38, y - 124, 76, 20, 8, '#FFFFFF', { off: 4, ink: 7 });
      hand(a.end, a.dir, ctx.c.skin, ctx.b.hand, sg);
      return true;
    },
  },
  hairFront({ c }) {
    shape('M -118 -6 C -130 -110, -60 -152, 0 -152 C 62 -152, 130 -110, 118 -6 C 112 -58, 84 -90, 42 -98 ' +
      'C 14 -102, -36 -100, -70 -88 C -100 -72, -114 -40, -118 -6 Z', c.hair, { off: 12, gloss: 0.2 });
    line('M -36 -100 C -10 -128, 30 -138, 70 -126', 5, tone(c.hair, 0.72), 0.7);
    for (const s of [-1, 1]) {
      shape(tube([[s * 98, -70], [s * 114, -14], [s * 104, 44], [s * 116, 90]], [8, 8, 7, 5]), c.hair, { off: 3, ink: 5 });
    }
    for (const [x, y] of [[30, -150], [44, -166], [62, -164], [74, -148], [60, -136], [42, -136]]) oval(x, y, 15, 13, c.scrunchie, { off: 4, ink: 6 });
    oval(52, -151, 16, 12, c.scrunchie, { off: 0, ink: 0 });
  },
  headExtra({ spec }) {
    for (const s of [-1, 1]) {
      const p = new Path2D();
      p.arc(s * 112, spec.face.eyeY + 52, 11, 0, Math.PI * 2);
      line(p, 5, '#E3B54A');
    }
  },
};
