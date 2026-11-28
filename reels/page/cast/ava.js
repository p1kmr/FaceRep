// Option 5, Ava, 19: the theater kid. Ginger hair in two space buns with a blunt fringe, freckles, a sunny yellow
// sweatshirt with a white star, lilac flared pants, jazz hands. Treats every face exercise like an audition.

import { WHITE, box, flat, lerp, line, oval, shape, tone, tube } from './pen.js';
import { torsoPath } from './body.js';

export const ava = {
  name: 'Ava',
  body: { headW: 228, headH: 254, jaw: 0, thigh: 124, shin: 116, ankle: 28, torso: 186, neck: 22, neckW: 44, sw: 86,
    hw: 76, hipJoint: 38, armIn: 14, upper: 98, fore: 90, armW: 42, legW: 48, hand: 27 },
  c: { skin: '#FBE0D0', skinShade: '#ECBDA4', hair: '#E5793B', brow: '#B85A2A', top: '#FFD257', bottom: '#B9A3E8',
    shoe: '#FFFFFF', shoeAccent: '#FFD257' },
  face: { eyeX: 44, eyeY: 18, eyeRx: 24, eyeRy: 29, mouthY: 90, iris: '#4C9BD8', lashes: true, lip: '#E86F84',
    fringe: true, brow: { t: 9, w: 46, y: -44 }, blush: 1.2,
    freckles: [[-62, 52], [-50, 60], [-70, 62], [-56, 70], [62, 52], [50, 60], [70, 62], [56, 70], [-8, 50], [8, 50]] },
  pose: { arms: { L: [-122, -34], R: [122, 34] }, legs: { L: [-8, 4], R: [10, -6] }, hands: { L: 'spread', R: 'spread' }, tilt: -6 },
  mood: { eyes: 'sparkle', brows: 'up', mouth: 'bigSmile' },

  hairBack({ c }) {
    for (const s of [-1, 1]) {
      oval(s * 78, -150, 52, 48, c.hair, { off: 12, gloss: 0.18 });
      line(`M ${s * 52} -150 C ${s * 60} -178, ${s * 100} -176, ${s * 104} -146`, 5, tone(c.hair, 0.7));
    }
    shape('M -118 20 C -138 -120, 138 -120, 118 20 L 112 70 L -112 70 Z', c.hair, { off: 10 });
  },
  leg({ b, c }, g) { // flared pants
    shape(tube([g.start, g.mid, g.end], [b.legW * 0.56, b.legW * 0.5, b.legW * 0.86]), c.bottom, { off: 9 });
  },
  top({ b, c, sY, hipY }) {
    shape(torsoPath(b, sY, hipY, 34, 6), c.top, { off: 14 });
    box(-b.hw - 18, hipY + 14, 2 * b.hw + 36, 22, 9, tone(c.top, 0.9), { off: 0, ink: 7 });
    line(`M -40 ${sY + 2} Q 0 ${sY + 36} 40 ${sY + 2}`, 10, tone(c.top, 0.85));
    const x = 0, y = sY + 112, R = 38, r = 16; // a white star
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, k = i % 2 ? r : R;
      d += `${i ? 'L' : 'M'} ${x + Math.cos(a) * k} ${y + Math.sin(a) * k} `;
    }
    shape(d + 'Z', WHITE, { off: 0, ink: 5 });
  },
  arm({ b, c }, a) {
    const cuff = lerp(a.mid, a.end, 0.82);
    shape(tube([a.start, a.mid, cuff], [b.armW * 0.58, b.armW * 0.54, b.armW * 0.56]), c.top, { off: 8 });
    oval(cuff[0], cuff[1], b.armW * 0.5, b.armW * 0.5, tone(c.top, 0.9), { off: 0, ink: 6 });
  },
  hairFront({ c }) {
    shape('M -118 0 C -132 -110, -60 -150, 0 -150 C 60 -150, 132 -110, 118 0 C 112 -30, 104 -40, 98 -44 ' +
      'L 70 -40 L 50 -48 L 24 -42 L 0 -48 L -24 -42 L -50 -48 L -70 -40 L -98 -44 C -104 -40, -112 -30, -118 0 Z', c.hair, { off: 12, gloss: 0.18 });
    for (const s of [-1, 1]) shape(tube([[s * 106, -40], [s * 116, 20], [s * 110, 70]], [9, 8, 6]), c.hair, { off: 3, ink: 5 });
    line('M -60 -120 C -30 -138, 20 -140, 60 -124', 5, tone(c.hair, 1.35), 0.55);
  },
  after({ arms }) { // sparkles round the jazz hands
    for (const a of [arms.L, arms.R]) {
      for (const [dx, dy, s] of [[-40, -46, 14], [34, -56, 10], [0, -78, 8]]) {
        const x = a.end[0] + dx * Math.sign(a.end[0]), y = a.end[1] + dy;
        flat(`M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`, '#FFC93C');
      }
    }
  },
};
